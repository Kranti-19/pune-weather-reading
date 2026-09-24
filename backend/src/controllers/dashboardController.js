// controllers/dashboardController.js

const supabase = require("../config/supabase");

// =====================================================
// CONFIGURATION
// =====================================================

// AQI <= 60 minutes old = Current
const LIVE_AQI_MAX_AGE_MINUTES = 60;

// AQI <= 24 hours old can still be displayed
// as delayed / last available data.
const DISPLAY_AQI_MAX_AGE_MINUTES = 24 * 60;

// Pollutant data <= 24 hours old can be displayed.
const DISPLAY_READING_MAX_AGE_MINUTES = 24 * 60;


// =====================================================
// HELPER FUNCTIONS
// =====================================================

const num = (value, fallback = null) => {
    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : fallback;
};

const lower = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase();
};


// =====================================================
// TIMESTAMP / AGE HELPERS
// =====================================================

const getAgeMinutes = (timestamp) => {
    if (!timestamp) {
        return Infinity;
    }

    const time = new Date(timestamp).getTime();

    if (!Number.isFinite(time)) {
        return Infinity;
    }

    return (Date.now() - time) / (1000 * 60);
};


const isRecentEnoughForDashboard = (timestamp) => {
    const age = getAgeMinutes(timestamp);

    return (
        age >= 0 &&
        age <= DISPLAY_AQI_MAX_AGE_MINUTES
    );
};


const isLiveAqi = (timestamp) => {
    const age = getAgeMinutes(timestamp);

    return (
        age >= 0 &&
        age <= LIVE_AQI_MAX_AGE_MINUTES
    );
};


const getAqiDisplayStatus = (timestamp) => {
    if (!timestamp) {
        return "No Data";
    }

    const age = getAgeMinutes(timestamp);

    if (!Number.isFinite(age) || age < 0) {
        return "No Data";
    }

    if (age <= LIVE_AQI_MAX_AGE_MINUTES) {
        return "Current";
    }

    if (age <= DISPLAY_AQI_MAX_AGE_MINUTES) {
        return "Delayed";
    }

    return "No Data";
};


const getReadingDisplayStatus = (timestamp) => {
    if (!timestamp) {
        return "No Data";
    }

    const age = getAgeMinutes(timestamp);

    if (!Number.isFinite(age) || age < 0) {
        return "No Data";
    }

    if (age <= LIVE_AQI_MAX_AGE_MINUTES) {
        return "Current";
    }

    if (age <= DISPLAY_READING_MAX_AGE_MINUTES) {
        return "Delayed";
    }

    return "No Data";
};


// =====================================================
// AQI CATEGORY
// =====================================================

const getAqiCategory = (aqi) => {
    const value = Number(aqi);

    if (!Number.isFinite(value)) {
        return "N/A";
    }

    if (value <= 50) {
        return "Good";
    }

    if (value <= 100) {
        return "Satisfactory";
    }

    if (value <= 200) {
        return "Moderate";
    }

    if (value <= 300) {
        return "Poor";
    }

    if (value <= 400) {
        return "Very Poor";
    }

    return "Severe";
};


// =====================================================
// AQI LEVEL
// =====================================================

const getAqiLevel = (aqi) => {
    const value = Number(aqi);

    if (!Number.isFinite(value)) {
        return "N/A";
    }

    if (value <= 50) {
        return "Good";
    }

    if (value <= 100) {
        return "Satisfactory";
    }

    if (value <= 200) {
        return "Moderate";
    }

    if (value <= 300) {
        return "Poor";
    }

    if (value <= 400) {
        return "Very Poor";
    }

    return "Severe";
};

// =====================================================
// CPCB-STYLE AQI CALCULATION FROM CURRENT POLLUTANTS
// =====================================================

// Breakpoints used for dashboard AQI calculation.
// Note: true CPCB AQI uses prescribed averaging periods.
// These current readings are therefore treated as a
// dashboard-calculated AQI, not a regulatory 24-hour AQI.

const AQI_BREAKPOINTS = {
    pm25: [
        [0, 30, 0, 50],
        [31, 60, 51, 100],
        [61, 90, 101, 200],
        [91, 120, 201, 300],
        [121, 250, 301, 400],
        [251, 500, 401, 500],
    ],

    pm10: [
        [0, 50, 0, 50],
        [51, 100, 51, 100],
        [101, 250, 101, 200],
        [251, 350, 201, 300],
        [351, 430, 301, 400],
        [431, 600, 401, 500],
    ],

    no2: [
        [0, 40, 0, 50],
        [41, 80, 51, 100],
        [81, 180, 101, 200],
        [181, 280, 201, 300],
        [281, 400, 301, 400],
        [401, 800, 401, 500],
    ],

    so2: [
        [0, 40, 0, 50],
        [41, 80, 51, 100],
        [81, 380, 101, 200],
        [381, 800, 201, 300],
        [801, 1600, 301, 400],
        [1601, 2620, 401, 500],
    ],

    o3: [
        [0, 50, 0, 50],
        [51, 100, 51, 100],
        [101, 168, 101, 200],
        [169, 208, 201, 300],
        [209, 748, 301, 400],
        [749, 1000, 401, 500],
    ],

    co: [
        [0, 1, 0, 50],
        [1.1, 2, 51, 100],
        [2.1, 10, 101, 200],
        [10.1, 17, 201, 300],
        [17.1, 34, 301, 400],
        [34.1, 50, 401, 500],
    ],
};


const calculateSubIndex = (value, breakpoints) => {
    const concentration = Number(value);

    if (!Number.isFinite(concentration)) {
        return null;
    }

    for (const [
        concentrationLow,
        concentrationHigh,
        indexLow,
        indexHigh,
    ] of breakpoints) {

        if (
            concentration >= concentrationLow &&
            concentration <= concentrationHigh
        ) {
            const index =
                (
                    (indexHigh - indexLow) /
                    (concentrationHigh - concentrationLow)
                ) *
                    (concentration - concentrationLow) +
                indexLow;

            return Math.round(index);
        }
    }

    return null;
};


const calculateStationAqi = (pollutants) => {

    const subindices = {};

    for (const parameter of Object.keys(AQI_BREAKPOINTS)) {

        const value = pollutants[parameter];

        const subIndex = calculateSubIndex(
            value,
            AQI_BREAKPOINTS[parameter]
        );

        if (subIndex !== null) {
            subindices[parameter] = subIndex;
        }
    }

    const availableParameters =
        Object.keys(subindices);

    // Need at least 3 pollutants and at least
    // one particulate pollutant for a useful AQI.
    const hasParticulate =
        Number.isFinite(subindices.pm25) ||
        Number.isFinite(subindices.pm10);

    if (
        availableParameters.length < 3 ||
        !hasParticulate
    ) {
        return null;
    }

    let dominantPollutant = null;
    let maxSubIndex = -Infinity;

    for (const [
        parameter,
        subIndex,
    ] of Object.entries(subindices)) {

        if (subIndex > maxSubIndex) {
            maxSubIndex = subIndex;
            dominantPollutant = parameter;
        }
    }

    return {
        aqi: maxSubIndex,
        category: getAqiCategory(maxSubIndex),
        dominant_pollutant: dominantPollutant,
        pollutant_subindices: subindices,
    };
};


// =====================================================
// DATE FORMAT
// =====================================================

const formatDate = (timestamp) => {
    if (!timestamp) {
        return null;
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
};


// =====================================================
// MAIN DASHBOARD CONTROLLER
// =====================================================

const getDashboard = async (req, res) => {
    try {

        const {
            range = "24h",
            area = "",
        } = req.query;


        console.log(
            "======================================"
        );

        console.log(
            "Dashboard request"
        );

        console.log(
            "Range:",
            range
        );

        console.log(
            "Area:",
            area || "All"
        );


        // =================================================
        // 1. GET STATIONS
        // =================================================

        const {
            data: stations,
            error: stationError,
        } = await supabase
            .from("station")
            .select("*")
            .order(
                "station_id",
                {
                    ascending: true,
                }
            );


        if (stationError) {
            throw stationError;
        }


        const stationRows =
            stations || [];


        console.log(
            "Stations:",
            stationRows.length
        );


        // =================================================
        // 2. GET AQI DATA
        // =================================================

        const {
            data: aqiRows,
            error: aqiError,
        } = await supabase
            .from("aqi_reading")
            .select(`
                aqi_id,
                station_id,
                aqi,
                category,
                dominant_pollutant,
                timestamp,
                data_status,
                pollutant_subindices
            `)
            .order(
                "timestamp",
                {
                    ascending: false,
                }
            )
            .limit(1000);


        if (aqiError) {
            throw aqiError;
        }


        const allAqiRows =
            aqiRows || [];


        console.log(
            "AQI rows:",
            allAqiRows.length
        );


        // Debug AQI rows
        console.log(
            "AQI DATA FROM SUPABASE:"
        );

        console.log(
            allAqiRows.slice(0, 20).map(
                (row) => ({
                    station_id:
                        row.station_id,
                    aqi:
                        row.aqi,
                    category:
                        row.category,
                    dominant:
                        row.dominant_pollutant,
                    timestamp:
                        row.timestamp,
                    data_status:
                        row.data_status,
                })
            )
        );


        // =================================================
        // 3. GET SENSOR DATA
        // =================================================

        const {
            data: sensorRows,
            error: sensorError,
        } = await supabase
            .from("sensor")
            .select(`
                sensor_id,
                sensor_type,
                model,
                serial_number,
                installation_date,
                calibration_date,
                device_id,
                status
            `);


        if (sensorError) {
            throw sensorError;
        }


        const sensors =
            sensorRows || [];


        // =================================================
        // 4. GET DEVICE DATA
        // =================================================

        const {
            data: deviceRows,
            error: deviceError,
        } = await supabase
            .from("device")
            .select(`
                device_id,
                gateway_id,
                manufacturer,
                model,
                firmware,
                ip_network,
                station_id,
                status,
                battery_level,
                network_status,
                last_seen_at,
                is_simulated,
                created_at
            `);


        if (deviceError) {
            throw deviceError;
        }


        const devices =
            deviceRows || [];


        // =================================================
        // 5. LATEST USABLE AQI PER STATION
        // =================================================

        const latestAqiByStation = {};


        for (
            const row of allAqiRows
        ) {

            if (!row.timestamp) {
                continue;
            }


            const age =
                getAgeMinutes(
                    row.timestamp
                );


            console.log(
                "AQI ROW CHECK:",
                {
                    station_id:
                        row.station_id,
                    aqi:
                        row.aqi,
                    timestamp:
                        row.timestamp,
                    ageMinutes:
                        age,
                    usable:
                        isRecentEnoughForDashboard(
                            row.timestamp
                        ),
                }
            );


            // Do not use extremely old records
            // for the live dashboard.
            if (
                !isRecentEnoughForDashboard(
                    row.timestamp
                )
            ) {
                continue;
            }


            const stationId =
                Number(row.station_id);


            if (
                !Number.isFinite(
                    stationId
                )
            ) {
                continue;
            }


            const existing =
                latestAqiByStation[
                    stationId
                ];


            if (!existing) {

                latestAqiByStation[
                    stationId
                ] = row;

                continue;
            }


            if (
                new Date(
                    row.timestamp
                ).getTime() >
                new Date(
                    existing.timestamp
                ).getTime()
            ) {

                latestAqiByStation[
                    stationId
                ] = row;
            }
        }


        console.log(
            "LATEST AQI BY STATION:"
        );

        console.log(
            latestAqiByStation
        );


        // =================================================
        // 6. LATEST AQI ROW
        // =================================================

        const latestAqiRows =
            Object.values(
                latestAqiByStation
            );


        const currentAqiRow =
            latestAqiRows.reduce(
                (
                    latest,
                    row
                ) => {

                    if (!latest) {
                        return row;
                    }


                    return (
                        new Date(
                            row.timestamp
                        ).getTime() >
                        new Date(
                            latest.timestamp
                        ).getTime()
                    )
                        ? row
                        : latest;
                },
                null
            );


        // =================================================
        // 7. OVERALL AQI
        // =================================================

        let overallAqi = null;


        const validAqiRows =
            latestAqiRows.filter(
                (row) =>
                    Number.isFinite(
                        Number(row.aqi)
                    )
            );


        if (
            validAqiRows.length > 0
        ) {

            overallAqi =
                Math.round(
                    validAqiRows.reduce(
                        (
                            total,
                            row
                        ) =>
                            total +
                            Number(
                                row.aqi
                            ),
                        0
                    ) /
                    validAqiRows.length
                );
        }


        console.log(
            "VALID AQI ROWS:",
            validAqiRows.map(
                (row) => ({
                    station_id:
                        row.station_id,
                    aqi:
                        row.aqi,
                    timestamp:
                        row.timestamp,
                })
            )
        );


        console.log(
            "OVERALL AQI:",
            overallAqi
        );


        // =================================================
        // 8. AREA SPECIFIC AQI
        // =================================================

        let currentAqi = null;

        let selectedAqiRow =
            currentAqiRow;


        if (area) {

            const selectedStation =
                stationRows.find(
                    (station) => {

                        const stationName =
                            String(
                                station.name ||
                                ""
                            ).toLowerCase();

                        const searchArea =
                            String(
                                area
                            ).toLowerCase();

                        return (
                            stationName ===
                                searchArea ||
                            String(
                                station.station_id
                            ) ===
                                String(
                                    area
                                )
                        );
                    }
                );


            if (
                selectedStation
            ) {

                selectedAqiRow =
                    latestAqiByStation[
                        Number(
                            selectedStation.station_id
                        )
                    ] || null;
            }


            currentAqi =
                selectedAqiRow &&
                Number.isFinite(
                    Number(
                        selectedAqiRow.aqi
                    )
                )
                    ? Number(
                          selectedAqiRow.aqi
                      )
                    : null;

        } else {

            currentAqi =
                overallAqi;
        }


        // =================================================
        // 9. AQI STATUS
        // =================================================

        let aqiDataStatus =
            getAqiDisplayStatus(
                selectedAqiRow?.timestamp
            );


        let aqiAgeMinutes =
            selectedAqiRow?.timestamp
                ? Number(
                      getAgeMinutes(
                          selectedAqiRow.timestamp
                      ).toFixed(1)
                  )
                : null;


        let category =
            selectedAqiRow?.category ||
            (
                currentAqi !== null
                    ? getAqiCategory(
                          currentAqi
                      )
                    : "N/A"
            );


        let dominant =
            selectedAqiRow?.dominant_pollutant ||
            "N/A";


        // =================================================
        // 10. GET POLLUTANT READINGS
        // =================================================

        const {
            data: readingRows,
            error: readingError,
        } = await supabase
            .from("reading")
            .select(`
                reading_id,
                station_id,
                sensor_id,
                timestamp,
                parameter,
                value,
                unit,
                quality_flag,
                data_status
            `)
            .order(
                "timestamp",
                {
                    ascending: false,
                }
            )
            .limit(5000);


        if (readingError) {
            throw readingError;
        }


        const allReadingRows =
            readingRows || [];


        console.log(
            "Reading rows:",
            allReadingRows.length
        );


        // =================================================
        // 11. LATEST READING PER STATION + PARAMETER
        // =================================================

        const latestReadingMap = {};


        for (
            const row of allReadingRows
        ) {

            if (!row.timestamp) {
                continue;
            }


            if (
                !isRecentEnoughForDashboard(
                    row.timestamp
                )
            ) {
                continue;
            }


            const parameter =
                lower(
                    row.parameter
                );


            const key =
                `${row.station_id}_${parameter}`;


            if (
                !latestReadingMap[key]
            ) {

                latestReadingMap[key] =
                    row;

                continue;
            }


            const existing =
                latestReadingMap[key];


            if (
                new Date(
                    row.timestamp
                ).getTime() >
                new Date(
                    existing.timestamp
                ).getTime()
            ) {

                latestReadingMap[key] =
                    row;
            }
        }


        const latestReadingRows =
            Object.values(
                latestReadingMap
            );

            // =================================================
// CALCULATE AQI FROM LATEST POLLUTANT READINGS
// =================================================

const calculatedAqiByStation = {};

for (const station of stationRows) {

    const stationId =
        Number(station.station_id);

    const stationReadings =
        latestReadingRows.filter(
            (row) =>
                Number(row.station_id) ===
                stationId
        );

    const pollutants = {};
    let latestPollutantTimestamp = null;

    for (const row of stationReadings) {

        const parameter = lower(
            row.parameter
        );

        let key = parameter;

        if (
            [
                "pm2.5",
                "pm25",
                "pm2_5",
            ].includes(parameter)
        ) {
            key = "pm25";
        }

        if (parameter === "pm10") {
            key = "pm10";
        }

        if (
            parameter === "no2" ||
            parameter === "no₂"
        ) {
            key = "no2";
        }

        if (
            parameter === "so2" ||
            parameter === "so₂"
        ) {
            key = "so2";
        }

        if (
            parameter === "o3" ||
            parameter === "o₃"
        ) {
            key = "o3";
        }

        if (parameter === "co") {
            key = "co";
        }

        const value = Number(row.value);

        if (
            !Object.prototype.hasOwnProperty.call(
                AQI_BREAKPOINTS,
                key
            )
        ) {
            continue;
        }

        if (!Number.isFinite(value)) {
            continue;
        }

        pollutants[key] = value;

        if (
            row.timestamp &&
            (
                !latestPollutantTimestamp ||
                new Date(row.timestamp).getTime() >
                    new Date(
                        latestPollutantTimestamp
                    ).getTime()
            )
        ) {
            latestPollutantTimestamp =
                row.timestamp;
        }
    }

    const calculated =
        calculateStationAqi(
            pollutants
        );

    if (calculated) {

        calculatedAqiByStation[
            stationId
        ] = {
            ...calculated,

            station_id:
                stationId,

            timestamp:
                latestPollutantTimestamp,

            data_status:
                "Calculated",
        };
    }
}


        // =================================================
        // 12. POLLUTANT SUMMARY
        // =================================================

        const pollutantTotals = {
            pm25: 0,
            pm10: 0,
            no2: 0,
            so2: 0,
            o3: 0,
            co: 0,
            nh3: 0, // Added NH3
            pb: 0,  // Added Pb
        };

        const pollutantCounts = {
            pm25: 0,
            pm10: 0,
            no2: 0,
            so2: 0,
            o3: 0,
            co: 0,
            nh3: 0, // Added NH3
            pb: 0,  // Added Pb
        };


        for (
            const row of latestReadingRows
        ) {

            const parameter =
                lower(
                    row.parameter
                );


            let key =
                parameter;


            if (
                [
                    "pm2.5",
                    "pm25",
                    "pm2_5",
                ].includes(parameter)
            ) {
                key = "pm25";
            }


            if (
                parameter === "pm10"
            ) {
                key = "pm10";
            }


            if (
                parameter === "no2" ||
                parameter === "no₂"
            ) {
                key = "no2";
            }


            if (
                parameter === "so2" ||
                parameter === "so₂"
            ) {
                key = "so2";
            }


            if (
                parameter === "o3" ||
                parameter === "o₃"
            ) {
                key = "o3";
            }


            if (
                parameter === "co"
            ) {
                key = "co";
            }
            if (parameter === "nh3" || parameter === "nh₃") {
                key = "nh3";
            }

            if (parameter === "pb" || parameter === "lead") {
                key = "pb";
            }


            if (
                !Object.prototype.hasOwnProperty.call(
                    pollutantTotals,
                    key
                )
            ) {
                continue;
            }


            const value =
                Number(
                    row.value
                );


            if (
                !Number.isFinite(
                    value
                )
            ) {
                continue;
            }


            pollutantTotals[key] +=
                value;


            pollutantCounts[key] +=
                1;
        }


        const pollutants =
            Object.keys(
                pollutantTotals
            ).map(
                (parameter) => {

                    const count =
                        pollutantCounts[
                            parameter
                        ];


                    const average =
                        count > 0
                            ? pollutantTotals[
                                  parameter
                              ] /
                              count
                            : null;


                    return {
                        parameter,

                        value:
                            average !== null
                                ? Number(
                                      average.toFixed(
                                          2
                                      )
                                  )
                                : null,

                        unit:
                            parameter ===
                            "co"
                                ? "mg/m³"
                                : "µg/m³",

                        count,

                        status:
                            count > 0
                                ? "Available"
                                : "No Data",
                    };
                }
            );


        // =================================================
        // 13. BUILD STATION DATA
        // =================================================

        const stationData =
            stationRows.map(
                (station) => {

                    const stationId =
                        Number(
                            station.station_id
                        );


                    const storedAqiRow =
                        latestAqiByStation[
                            stationId
                        ] || null;

                    const calculatedAqiRow =
                        calculatedAqiByStation[
                            stationId
                        ] || null;

                    // Prefer stored AQI when available.
                    // Otherwise use calculated AQI from
                    // the latest pollutant readings.
                    const aqiRow =
                        storedAqiRow ||
                        calculatedAqiRow ||
                        null;


                    const aqi =
                        aqiRow &&
                        Number.isFinite(
                            Number(
                                aqiRow.aqi
                            )
                        )
                            ? Number(
                                  aqiRow.aqi
                              )
                            : null;


                    const aqiStatus =
                        aqiRow?.data_status === "Calculated"
                            ? "Calculated"
                            : getAqiDisplayStatus(
                                aqiRow?.timestamp
                            );


                    // -------------------------------------
                    // Station readings
                    // -------------------------------------

                    const stationReadings =
                        latestReadingRows.filter(
                            (row) =>
                                Number(
                                    row.station_id
                                ) ===
                                stationId
                        );


                    const getParameterValue =
                        (parameter) => {

                            const found =
                                stationReadings.find(
                                    (row) => {

                                        const rowParameter =
                                            lower(
                                                row.parameter
                                            );

                                        return (
                                            rowParameter ===
                                            parameter
                                        );
                                    }
                                );


                            return (
                                found &&
                                Number.isFinite(
                                    Number(
                                        found.value
                                    )
                                )
                            )
                                ? Number(
                                      found.value
                                  )
                                : null;
                        };


                    const pm25 =
                        getParameterValue(
                            "pm25"
                        ) ??
                        getParameterValue(
                            "pm2.5"
                        ) ??
                        getParameterValue(
                            "pm2_5"
                        );


                    const pm10 =
                        getParameterValue(
                            "pm10"
                        );


                    const no2 =
                        getParameterValue(
                            "no2"
                        ) ??
                        getParameterValue(
                            "no₂"
                        );


                    const so2 =
                        getParameterValue(
                            "so2"
                        ) ??
                        getParameterValue(
                            "so₂"
                        );


                    const o3 =
                        getParameterValue(
                            "o3"
                        ) ??
                        getParameterValue(
                            "o₃"
                        );


                    const co =
                        getParameterValue(
                            "co"
                        );


                    const nh3 =
                        getParameterValue(
                            "nh3"
                        ) ??
                        getParameterValue(
                            "nh₃"
                        );


                    const pb =
                        getParameterValue(
                            "pb"
                        ) ??
                        getParameterValue(
                            "lead"
                        );


                    // -------------------------------------
                    // Station devices
                    // -------------------------------------

                    const stationDevices =
                        devices.filter(
                            (device) =>
                                Number(
                                    device.station_id
                                ) ===
                                stationId
                        );


                    // -------------------------------------
                    // Station sensors
                    // -------------------------------------

                    const stationDeviceIds =
                        stationDevices.map(
                            (device) =>
                                Number(
                                    device.device_id
                                )
                        );


                    const stationSensors =
                        sensors.filter(
                            (sensor) =>
                                stationDeviceIds.includes(
                                    Number(
                                        sensor.device_id
                                    )
                                )
                        );


                    // -------------------------------------
                    // Battery
                    // -------------------------------------

                    const batteryValues =
                        stationDevices
                            .map(
                                (device) =>
                                    Number(
                                        device.battery_level
                                    )
                            )
                            .filter(
                                (value) =>
                                    Number.isFinite(
                                        value
                                    )
                            );


                    const averageBattery =
                        batteryValues.length > 0
                            ? Number(
                                  (
                                      batteryValues.reduce(
                                          (
                                              total,
                                              value
                                          ) =>
                                              total +
                                              value,
                                          0
                                      ) /
                                      batteryValues.length
                                  ).toFixed(1)
                              )
                            : null;


                    // -------------------------------------
                    // Online devices
                    // -------------------------------------

                    const onlineDevices =
                        stationDevices.filter(
                            (device) =>
                                lower(
                                    device.status
                                ) ===
                                "online"
                        ).length;


                    const stationStatus =
                        stationDevices.length === 0
                            ? "No Device"
                            : onlineDevices ===
                              stationDevices.length
                            ? "Online"
                            : onlineDevices > 0
                            ? "Partial"
                            : "Offline";


                    // -------------------------------------
                    // Last ping
                    // -------------------------------------

                    const lastPing =
                        stationDevices
                            .map(
                                (device) =>
                                    device.last_seen_at
                            )
                            .filter(
                                Boolean
                            )
                            .sort(
                                (a, b) =>
                                    new Date(
                                        b
                                    ).getTime() -
                                    new Date(
                                        a
                                    ).getTime()
                            )[0] ||
                        null;


                    return {

                        station_id:
                            stationId,

                        stationId,

                        code:
                            `PMC-${String(
                                stationId
                            ).padStart(
                                3,
                                "0"
                            )}`,

                        name:
                            station.name,

                        station_name:
                            station.name,

                        ward:
                            station.ward ||
                            "N/A",

                        zone:
                            station.zone ||
                            "N/A",

                        latitude:
                            num(
                                station.latitude
                            ),

                        longitude:
                            num(
                                station.longitude
                            ),

                        station_type:
                            station.station_type ||
                            "CAAQM",

                        installation_date:
                            station.installation_date ||
                            null,

                        status:
                            station.status ||
                            stationStatus,


                        // ---------------------------------
                        // AQI
                        // ---------------------------------

                        aqi,

                        category:
                            aqi !== null
                                ? getAqiCategory(
                                      aqi
                                  )
                                : "N/A",

                        aqiCategory:
                            aqi !== null
                                ? getAqiCategory(
                                      aqi
                                  )
                                : "N/A",

                        dominant_pollutant:
                            aqiRow?.dominant_pollutant ||
                            "N/A",

                        aqiStatus,

                        aqiDataStatus:
                            aqiStatus,

                        aqiAgeMinutes:
                            aqiRow?.timestamp
                                ? Number(
                                      getAgeMinutes(
                                          aqiRow.timestamp
                                      ).toFixed(
                                          1
                                      )
                                  )
                                : null,

                        aqiTimestamp:
                            aqiRow?.timestamp ||
                            null,


                        // ---------------------------------
                        // Pollutants
                        // ---------------------------------

                        pm25,

                        pm10,

                        no2,

                        so2,

                        o3,

                        co,

                        nh3,

                        pb,

                        pollutants: {
                            pm25,
                            pm10,
                            no2,
                            so2,
                            o3,
                            co,
                            nh3,
                            pb,
                        },


                        // ---------------------------------
                        // Devices / Sensors
                        // ---------------------------------

                        deviceCount:
                            stationDevices.length,

                        sensorCount:
                            stationSensors.length,

                        onlineDevices,

                        averageBattery,

                        networkStatus:
                            stationDevices.length > 0
                                ? stationDevices.every(
                                      (device) =>
                                          lower(
                                              device.network_status
                                          ) ===
                                          "connected"
                                  )
                                    ? "Connected"
                                    : "Disconnected"
                                : "No Device",

                        lastPing,

                        devices:
                            stationDevices,

                        sensors:
                            stationSensors,
                    };
                }
            );

            // =================================================
// RECALCULATE OVERALL AQI USING FINAL STATION DATA
// =================================================

const finalAqiStations =
    stationData.filter(
        (station) =>
            Number.isFinite(
                Number(station.aqi)
            )
    );

if (finalAqiStations.length > 0) {

    overallAqi =
        Math.round(
            finalAqiStations.reduce(
                (total, station) =>
                    total +
                    Number(station.aqi),
                0
            ) /
            finalAqiStations.length
        );
} else {

    overallAqi = null;
}


// =================================================
// FINAL DASHBOARD AQI STATE
// =================================================

if (area) {

    const selectedStation =
        stationData.find(
            (station) =>
                String(station.station_id) ===
                    String(area) ||
                lower(station.name) ===
                    lower(area)
        );

    if (selectedStation) {

        currentAqi =
            Number.isFinite(
                Number(selectedStation.aqi)
            )
                ? Number(
                      selectedStation.aqi
                  )
                : null;

        selectedAqiRow =
            latestAqiByStation[
                Number(
                    selectedStation.station_id
                )
            ] ||
            calculatedAqiByStation[
                Number(
                    selectedStation.station_id
                )
            ] ||
            null;
    }

} else {

    currentAqi =
        overallAqi;

    // Pick the newest available AQI source
    // for dashboard metadata.
    const finalAqiRows =
        stationData
            .filter(
                (station) =>
                    Number.isFinite(
                        Number(station.aqi)
                    )
            )
            .sort(
                (a, b) => {

                    const aTime =
                        a.aqiTimestamp
                            ? new Date(
                                  a.aqiTimestamp
                              ).getTime()
                            : 0;

                    const bTime =
                        b.aqiTimestamp
                            ? new Date(
                                  b.aqiTimestamp
                              ).getTime()
                            : 0;

                    return bTime - aTime;
                }
            );

    const latestStation =
        finalAqiRows[0];

    if (latestStation) {

        selectedAqiRow =
            latestAqiByStation[
                Number(
                    latestStation.station_id
                )
            ] ||
            calculatedAqiByStation[
                Number(
                    latestStation.station_id
                )
            ] ||
            null;
    }
}


// Recalculate final status
if (
    selectedAqiRow?.data_status ===
    "Calculated"
) {

    aqiDataStatus = "Calculated";

} else {

    aqiDataStatus =
        getAqiDisplayStatus(
            selectedAqiRow?.timestamp
        );
}


aqiAgeMinutes =
    selectedAqiRow?.timestamp
        ? Number(
              getAgeMinutes(
                  selectedAqiRow.timestamp
              ).toFixed(1)
          )
        : null;


category =
    selectedAqiRow?.category ||
    (
        currentAqi !== null
            ? getAqiCategory(
                  currentAqi
              )
            : "N/A"
    );


dominant =
    selectedAqiRow?.dominant_pollutant ||
    "N/A";

        // =================================================
        // 14. WARD DATA
        // =================================================

        const wardMap = {};


        for (
            const station of stationData
        ) {

            const ward =
                station.ward ||
                "Unknown";


            if (!wardMap[ward]) {

                wardMap[ward] = {

                    ward,

                    stations: 0,

                    values: [],

                    pm25: [],

                    pm10: [],
                };
            }


            wardMap[
                ward
            ].stations += 1;


            if (
                station.aqi !== null &&
                Number.isFinite(
                    Number(
                        station.aqi
                    )
                )
            ) {

                wardMap[
                    ward
                ].values.push(
                    Number(
                        station.aqi
                    )
                );
            }


            if (
                station.pm25 !== null &&
                Number.isFinite(
                    Number(
                        station.pm25
                    )
                )
            ) {

                wardMap[
                    ward
                ].pm25.push(
                    Number(
                        station.pm25
                    )
                );
            }


            if (
                station.pm10 !== null &&
                Number.isFinite(
                    Number(
                        station.pm10
                    )
                )
            ) {

                wardMap[
                    ward
                ].pm10.push(
                    Number(
                        station.pm10
                    )
                );
            }
        }


        const wards =
            Object.values(
                wardMap
            ).map(
                (wardData) => {

                    const aqiValues =
                        wardData.values;

                    const pm25Values =
                        wardData.pm25;

                    const pm10Values =
                        wardData.pm10;


                    const wardAqi =
                        aqiValues.length > 0
                            ? Math.round(
                                  aqiValues.reduce(
                                      (
                                          total,
                                          value
                                      ) =>
                                          total +
                                          value,
                                      0
                                  ) /
                                  aqiValues.length
                              )
                            : null;


                    const avgPm25 =
                        pm25Values.length > 0
                            ? Number(
                                  (
                                      pm25Values.reduce(
                                          (
                                              total,
                                              value
                                          ) =>
                                              total +
                                              value,
                                          0
                                      ) /
                                      pm25Values.length
                                  ).toFixed(2)
                              )
                            : null;


                    const avgPm10 =
                        pm10Values.length > 0
                            ? Number(
                                  (
                                      pm10Values.reduce(
                                          (
                                              total,
                                              value
                                          ) =>
                                              total +
                                              value,
                                          0
                                      ) /
                                      pm10Values.length
                                  ).toFixed(2)
                              )
                            : null;


                    return {

                        ward:
                            wardData.ward,

                        name:
                            wardData.ward,

                        stations:
                            wardData.stations,

                        aqi:
                            wardAqi,

                        category:
                            wardAqi !== null
                                ? getAqiCategory(
                                      wardAqi
                                  )
                                : "N/A",

                        pm25:
                            avgPm25,

                        pm10:
                            avgPm10,
                    };
                }
            );


        // =================================================
        // 15. STATION COUNT
        // =================================================

        const totalStations =
            stationRows.length;


        const activeStations =
            stationRows.filter(
                (station) => {

                    const status =
                        lower(
                            station.status
                        );

                    return (
                        status === "active" ||
                        status === "online"
                    );
                }
            ).length;


        // =================================================
        // 16. DEVICE SUMMARY
        // =================================================

        const totalDevices =
            devices.length;


        const onlineDeviceCount =
            devices.filter(
                (device) =>
                    lower(
                        device.status
                    ) === "online"
            ).length;


        const offlineDeviceCount =
            devices.filter(
                (device) =>
                    lower(
                        device.status
                    ) === "offline"
            ).length;


        const totalSensors =
            sensors.length;


        // =================================================
        // 17. WEATHER
        // =================================================

        let weather = {

            temperature:
                null,

            humidity:
                null,

            windSpeed:
                null,

            windDirection:
                null,

            pressure:
                null,

            rainfall:
                null,

            condition:
                "N/A",

            timestamp:
                null,
        };


        try {

            const {
    data: alertRows,
    error: alertError,
} = await supabase
    .from("alert")
    .select("*")
    .order(
        "started_time",
        {
            ascending: false,
        }
    )
    .limit(20);


            if (
                !weatherError &&
                weatherRows &&
                weatherRows.length > 0
            ) {

                const latestWeather =
                    weatherRows[0];


                weather = {

                    temperature:
                        num(
                            latestWeather.temperature
                        ),

                    humidity:
                        num(
                            latestWeather.humidity
                        ),

                    windSpeed:
                        num(
                            latestWeather.wind_speed
                        ),

                    windDirection:
                        num(
                            latestWeather.wind_direction
                        ),

                    pressure:
                        num(
                            latestWeather.pressure
                        ),

                    rainfall:
                        num(
                            latestWeather.rainfall
                        ),

                    condition:
                        latestWeather.condition ||
                        "N/A",

                    timestamp:
                        latestWeather.timestamp ||
                        null,
                };
            }

        } catch (
            weatherReadError
        ) {

            console.log(
                "Weather table read failed:",
                weatherReadError.message
            );
        }


        // =================================================
        // 18. TRENDS
        // =================================================

        const trends = [];


        const trendSource =
            allAqiRows
                .filter(
                    (row) =>
                        row.timestamp &&
                        Number.isFinite(
                            Number(
                                row.aqi
                            )
                        )
                )
                .slice(
                    0,
                    100
                );


        const trendMap = {};


        for (
            const row of trendSource
        ) {

            const date =
                new Date(
                    row.timestamp
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                continue;
            }


            const key =
                date
                    .toISOString()
                    .slice(
                        0,
                        13
                    );


            if (!trendMap[key]) {

                trendMap[key] = {

                    timestamp:
                        row.timestamp,

                    values:
                        [],
                };
            }


            trendMap[
                key
            ].values.push(
                Number(
                    row.aqi
                )
            );
        }


        for (
            const [
                key,
                value,
            ] of Object.entries(
                trendMap
            )
        ) {

            const values =
                value.values;


            if (
                values.length === 0
            ) {
                continue;
            }


            const average =
                values.reduce(
                    (
                        total,
                        current
                    ) =>
                        total +
                        current,
                    0
                ) /
                values.length;


            trends.push({

                timestamp:
                    value.timestamp,

                time:
                    key,

                aqi:
                    Math.round(
                        average
                    ),
            });
        }


        trends.sort(
            (a, b) =>
                new Date(
                    a.timestamp
                ).getTime() -
                new Date(
                    b.timestamp
                ).getTime()
        );


        // =================================================
        // 19. ALERTS
        // =================================================

        let alerts = [];


        try {

            const {
                data: alertRows,
                error: alertError,
            } = await supabase
                .from("alert")
                .select("*")
                .order(
                    "started_time",
                    {
                        ascending: false,
                    }
                )
                .limit(20);


            if (
                !alertError
            ) {

                alerts =
                    alertRows ||
                    [];

                console.log("========== DASHBOARD ALERTS ==========");

console.table(
    alerts.map((alert) => ({
        alert_id: alert.alert_id,
        station_id: alert.station_id,
        parameter: alert.parameter,
        actual_value: alert.actual_value,
        threshold: alert.threshold,
        severity: alert.severity,
        acknowledgement: alert.acknowledgement,
        started_time: alert.started_time,
        created_at: alert.created_at,
    }))
);

console.log("======================================");    
            }

        } catch (
            alertReadError
        ) {

            console.log(
                "Alert table read failed:",
                alertReadError.message
            );
        }


        // =================================================
        // 20. RESPONSE
        // =================================================

        const response = {

            success: true,

            range,

            area:
                area ||
                null,


            // ---------------------------------------------
            // AQI
            // ---------------------------------------------

            aqi:
                currentAqi,

            overallAqi,

            category,

            dominant,

            dominantPollutant:
                dominant,

            aqiDataStatus,

            aqiStatus:
                aqiDataStatus,

            aqiAgeMinutes,

            aqiTimestamp:
                selectedAqiRow?.timestamp ||
                null,

            aqiLastUpdated:
                selectedAqiRow?.timestamp ||
                null,


            // ---------------------------------------------
            // Stations
            // ---------------------------------------------

            totalStations,

            activeStations,

            stations:
                stationData,


            // ---------------------------------------------
            // Pollutants
            // ---------------------------------------------

            pollutants,


            // ---------------------------------------------
            // Wards
            // ---------------------------------------------

            wards,


            // ---------------------------------------------
            // Devices
            // ---------------------------------------------

            totalDevices,

            onlineDevices:
                onlineDeviceCount,

            offlineDevices:
                offlineDeviceCount,

            totalSensors,


            // ---------------------------------------------
            // Weather
            // ---------------------------------------------

            weather,


            // ---------------------------------------------
            // Trends
            // ---------------------------------------------

            trends,


            // ---------------------------------------------
            // Alerts
            // ---------------------------------------------

            alerts,


            // ---------------------------------------------
            // Metadata
            // ---------------------------------------------

            lastUpdated:
                new Date().toISOString(),
        };


        // =================================================
        // FINAL DEBUG LOGS
        // =================================================

        console.log(
            "======================================"
        );

        console.log(
            "Dashboard AQI:",
            response.aqi
        );

        console.log(
            "Dashboard overall AQI:",
            response.overallAqi
        );

        console.log(
            "Dashboard AQI status:",
            response.aqiDataStatus
        );

        console.log(
            "Dashboard stations:",
            response.totalStations
        );

        console.log(
            "Dashboard station AQIs:",
            response.stations.map(
                (station) => ({
                    id:
                        station.station_id,
                    name:
                        station.name,
                    aqi:
                        station.aqi,
                    timestamp:
                        station.aqiTimestamp,
                    status:
                        station.aqiStatus,
                })
            )
        );

        console.log(
            "======================================"
        );


        // =================================================
        // IMPORTANT:
        // FRONTEND EXPECTS:
        //
        // {
        //   status: "success",
        //   data: {
        //      aqi: ...,
        //      stations: [...],
        //      pollutants: [...],
        //      wards: [...]
        //   }
        // }
        //
        // Therefore DO NOT return:
        // return res.json(response);
        //
        // Instead wrap the response inside `data`.
        // =================================================

        return res.status(200).json({

            status:
                "success",

            data:
                response,
        });


    } catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "Dashboard controller error:"
        );

        console.error(
            error
        );

        console.error(
            "======================================"
        );


        return res.status(500).json({

            status:
                "error",

            message:
                error.message ||
                "Failed to load dashboard data",
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getDashboard,
};