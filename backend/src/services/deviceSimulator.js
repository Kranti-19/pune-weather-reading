const supabase = require("../config/supabase");

// =========================================================
// DEVICE SIMULATOR CONFIGURATION
// =========================================================

const HEARTBEAT_INTERVAL = 30 * 1000;

// Generate new pollutant readings every 60 seconds
const READING_INTERVAL = 60 * 1000;

// Battery configuration
const DEFAULT_BATTERY = 75;
const LOW_BATTERY_LIMIT = 30;
const BATTERY_CONSUMPTION = 0.01;
const BATTERY_CHARGE = 0.20;
const MAX_BATTERY = 100;


// =========================================================
// POLLUTANT CONFIGURATION
// =========================================================

const POLLUTANTS = [
    {
        parameter: "PM2.5",
        unit: "µg/m³",
        min: 8,
        max: 95,
        decimals: 2,
    },

    {
        parameter: "PM10",
        unit: "µg/m³",
        min: 20,
        max: 120,
        decimals: 2,
    },

    {
        parameter: "NO2",
        unit: "µg/m³",
        min: 8,
        max: 70,
        decimals: 2,
    },

    {
        parameter: "SO2",
        unit: "µg/m³",
        min: 2,
        max: 40,
        decimals: 2,
    },

    {
        parameter: "CO",
        unit: "mg/m³",
        min: 0.3,
        max: 1.9,
        decimals: 2,
    },

    {
        parameter: "O3",
        unit: "µg/m³",
        min: 10,
        max: 90,
        decimals: 2,
    },

    {
        parameter: "NH3",
        unit: "µg/m³",
        min: 5,
        max: 80,
        decimals: 2,
    },

    {
        parameter: "Pb",
        unit: "µg/m³",
        min: 0.05,
        max: 0.85,
        decimals: 3,
    },
];


// =========================================================
// RANDOM VALUE GENERATOR
// =========================================================

const randomValue = (min, max, decimals = 2) => {

    const value =
        Math.random() * (max - min) + min;

    return Number(
        value.toFixed(decimals)
    );
};

// =========================================================
// AQI CALCULATION
// Same CPCB-style breakpoint logic used by dashboard
// =========================================================

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


// ---------------------------------------------------------
// AQI CATEGORY
// ---------------------------------------------------------

const getAqiCategory = (aqi) => {

    if (!Number.isFinite(Number(aqi))) {
        return "Unavailable";
    }

    const value = Number(aqi);

    if (value <= 50) return "Good";
    if (value <= 100) return "Satisfactory";
    if (value <= 200) return "Moderate";
    if (value <= 300) return "Poor";
    if (value <= 400) return "Very Poor";

    return "Severe";
};


// ---------------------------------------------------------
// CALCULATE SUB-INDEX
// ---------------------------------------------------------

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


// ---------------------------------------------------------
// CALCULATE STATION AQI
// ---------------------------------------------------------

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

    const hasParticulate =
        Number.isFinite(subindices.pm25) ||
        Number.isFinite(subindices.pm10);

    // Same rule as dashboard
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

        category:
            getAqiCategory(maxSubIndex),

        dominant_pollutant:
            dominantPollutant,

        pollutant_subindices:
            subindices,
    };
};


// =========================================================
// GET SIMULATED DEVICES
// =========================================================

const getSimulatedDevices = async () => {

    const {
        data: devices,
        error,
    } = await supabase
        .from("device")
        .select(`
            device_id,
            gateway_id,
            station_id,
            battery_level,
            network_status,
            status,
            is_simulated
        `)
        .eq("is_simulated", true);

    if (error) {
        throw error;
    }

    return devices || [];
};


// =========================================================
// GET SENSORS
// =========================================================

const getSensors = async () => {

    const {
        data: sensors,
        error,
    } = await supabase
        .from("sensor")
        .select(`
            sensor_id,
            sensor_type,
            model,
            serial_number,
            device_id,
            status
        `)
        .order("sensor_id", {
            ascending: true,
        });

    if (error) {
        throw error;
    }

    return sensors || [];
};


// =========================================================
// CALCULATE BATTERY
// =========================================================

const calculateBattery = (currentBattery) => {

    let battery = Number(currentBattery);

    // New device
    if (!Number.isFinite(battery)) {
        battery = DEFAULT_BATTERY;
    }

    // Safety
    if (battery < 0) {
        battery = DEFAULT_BATTERY;
    }

    // Charging
    if (battery <= LOW_BATTERY_LIMIT) {

        battery += BATTERY_CHARGE;

    } else {

        // Consumption
        battery -= BATTERY_CONSUMPTION;
    }

    // Keep between 30 and 100
    battery = Math.min(
        MAX_BATTERY,
        Math.max(
            LOW_BATTERY_LIMIT,
            battery
        )
    );

    return Number(
        battery.toFixed(2)
    );
};


// =========================================================
// SIMULATE DEVICE HEARTBEAT
// =========================================================

const simulateDeviceHeartbeat = async () => {

    try {

        const devices =
            await getSimulatedDevices();

        if (!devices.length) {

            console.log(
                "Device simulator: no simulated devices found."
            );

            return;
        }

        console.log(
            `Device simulator: processing ${devices.length} simulated device(s).`
        );


        // -----------------------------------------------------
        // PROCESS EACH DEVICE
        // -----------------------------------------------------

        for (const device of devices) {

            try {

                const oldBattery =
                    Number(device.battery_level);

                const battery =
                    calculateBattery(
                        device.battery_level
                    );


                const heartbeatData = {

                    last_seen_at:
                        new Date().toISOString(),

                    status:
                        "Online",

                    network_status:
                        "Connected",

                    battery_level:
                        battery,
                };


                const {
                    error: updateError,
                } = await supabase
                    .from("device")
                    .update(heartbeatData)
                    .eq(
                        "device_id",
                        device.device_id
                    );


                if (updateError) {

                    console.error(
                        `Device ${device.device_id} heartbeat failed:`,
                        updateError
                    );

                    continue;
                }


                // -------------------------------------------------
                // LOG
                // -------------------------------------------------

                if (!Number.isFinite(oldBattery)) {

                    console.log(
                        `New Device → ${device.gateway_id} | ` +
                        `Battery initialized: ${battery}%`
                    );

                } else if (
                    battery > oldBattery
                ) {

                    console.log(
                        `Charging → ${device.gateway_id} | ` +
                        `${oldBattery.toFixed(2)}% → ${battery}%`
                    );

                } else {

                    console.log(
                        `Heartbeat → ${device.gateway_id} | ` +
                        `Battery: ${battery}%`
                    );
                }

            } catch (deviceError) {

                console.error(
                    `Device simulator error for ${device.gateway_id}:`,
                    deviceError
                );
            }
        }

    } catch (error) {

        console.error(
            "Device simulator heartbeat error:",
            error
        );
    }
};


// =========================================================
// GENERATE POLLUTANT READINGS
// =========================================================

// =========================================================
// GENERATE POLLUTANT + AQI READINGS
// =========================================================

const generatePollutantReadings = async () => {

    try {

        const devices =
            await getSimulatedDevices();

        if (!devices.length) {

            console.log(
                "Reading simulator: no simulated devices found."
            );

            return;
        }


        const sensors =
            await getSensors();


        // -----------------------------------------------------
        // CREATE DEVICE LOOKUP
        // -----------------------------------------------------

        const deviceMap = new Map();

        for (const device of devices) {

            deviceMap.set(
                Number(device.device_id),
                device
            );
        }


        // -----------------------------------------------------
        // FIND ONE SENSOR PER STATION
        // -----------------------------------------------------

        const stationSensorMap = new Map();

        for (const sensor of sensors) {

            const device =
                deviceMap.get(
                    Number(sensor.device_id)
                );

            if (!device) {
                continue;
            }


            const stationId =
                Number(device.station_id);

            if (!stationId) {
                continue;
            }


            // First sensor wins
            if (
                !stationSensorMap.has(
                    stationId
                )
            ) {

                stationSensorMap.set(
                    stationId,
                    {
                        sensor,
                        device,
                    }
                );
            }
        }


        if (!stationSensorMap.size) {

            console.log(
                "Reading simulator: no sensors found for simulated stations."
            );

            return;
        }


        // -----------------------------------------------------
        // TIMESTAMP
        // -----------------------------------------------------

        const timestamp =
            new Date().toISOString();


        const readings = [];


        // Keep pollutants grouped by station
        // so we can calculate AQI after generation.
        const stationPollutants = {};


        // -----------------------------------------------------
        // GENERATE READINGS
        // -----------------------------------------------------

        for (const [
            stationId,
            stationInfo
        ] of stationSensorMap) {

            const sensor =
                stationInfo.sensor;


            stationPollutants[stationId] = {};


            // ---------------------------------------------
            // Generate all pollutants
            // ---------------------------------------------

            for (const pollutant of POLLUTANTS) {

                const value =
                    randomValue(
                        pollutant.min,
                        pollutant.max,
                        pollutant.decimals
                    );


                // Save for AQI calculation
                const parameter =
                    pollutant.parameter
                        .toLowerCase()
                        .trim();


                if (
                    parameter === "pm2.5" ||
                    parameter === "pm25"
                ) {

                    stationPollutants[stationId].pm25 =
                        value;

                } else if (
                    parameter === "pm10"
                ) {

                    stationPollutants[stationId].pm10 =
                        value;

                } else if (
                    parameter === "no2"
                ) {

                    stationPollutants[stationId].no2 =
                        value;

                } else if (
                    parameter === "so2"
                ) {

                    stationPollutants[stationId].so2 =
                        value;

                } else if (
                    parameter === "o3"
                ) {

                    stationPollutants[stationId].o3 =
                        value;

                } else if (
                    parameter === "co"
                ) {

                    stationPollutants[stationId].co =
                        value;
                }


                // -----------------------------------------
                // READING TABLE RECORD
                // -----------------------------------------

                readings.push({

                    station_id:
                        stationId,

                    sensor_id:
                        sensor.sensor_id,

                    timestamp,

                    parameter:
                        pollutant.parameter,

                    value,

                    unit:
                        pollutant.unit,

                    quality_flag:
                        "Simulated",

                    data_status:
                        "Current",
                });
            }
        }


        // -----------------------------------------------------
        // INSERT INTO READING TABLE
        // -----------------------------------------------------

        if (!readings.length) {

            console.log(
                "Reading simulator: no readings generated."
            );

            return;
        }


        const {
            data: insertedReadings,
            error: readingError,
        } = await supabase
            .from("reading")
            .insert(readings)
            .select();


        if (readingError) {

            console.error(
                "Reading simulator insert error:",
                readingError
            );

            return;
        }


        console.log(
            `Reading simulator: inserted ${
                insertedReadings?.length ||
                readings.length
            } pollutant readings.`
        );


        // =====================================================
        // CREATE AQI RECORDS
        // =====================================================

        const aqiReadings = [];


        for (const [
            stationId,
            pollutants
        ] of Object.entries(
            stationPollutants
        )) {

            const calculated =
                calculateStationAqi(
                    pollutants
                );


            if (!calculated) {

                console.log(
                    `AQI calculation skipped for station ${stationId}`
                );

                continue;
            }


            aqiReadings.push({

                timestamp,

                station_id:
                    Number(stationId),

                aqi:
                    calculated.aqi,

                category:
                    calculated.category,

                dominant_pollutant:
                    calculated.dominant_pollutant,

                data_status:
                    "Current",

                pollutant_subindices:
                    calculated.pollutant_subindices,
            });


            console.log(
                `Simulated AQI → Station ${stationId}: ` +
                `${calculated.aqi} ` +
                `(${calculated.category}) ` +
                `| Dominant: ${calculated.dominant_pollutant}`
            );
        }


        // -----------------------------------------------------
        // INSERT AQI RECORDS
        // -----------------------------------------------------

        if (aqiReadings.length > 0) {

            const {
                data: insertedAqi,
                error: aqiError,
            } = await supabase
                .from("aqi_reading")
                .insert(aqiReadings)
                .select();


            if (aqiError) {

                console.error(
                    "AQI simulator insert error:",
                    aqiError
                );

            } else {

                console.log(
                    `AQI simulator: inserted ${
                        insertedAqi?.length ||
                        aqiReadings.length
                    } AQI records.`
                );
            }

        } else {

            console.log(
                "AQI simulator: no valid AQI records generated."
            );
        }


        // -----------------------------------------------------
        // SUMMARY
        // -----------------------------------------------------

        console.log(
            `Stations updated: ${
                stationSensorMap.size
            }`
        );

        console.log(
            `Pollutants per station: ${
                POLLUTANTS.length
            }`
        );

        console.log(
            `Timestamp: ${timestamp}`
        );


    } catch (error) {

        console.error(
            "Reading simulator error:",
            error
        );
    }
};


// =========================================================
// START DEVICE SIMULATOR
// =========================================================

const startDeviceSimulator = () => {

    console.log(
        "======================================"
    );

    console.log(
        "DEVICE + SENSOR SIMULATOR STARTED"
    );

    console.log(
        `Heartbeat: every ${HEARTBEAT_INTERVAL / 1000} seconds`
    );

    console.log(
        `Readings: every ${READING_INTERVAL / 1000} seconds`
    );

    console.log(
        `Default battery: ${DEFAULT_BATTERY}%`
    );

    console.log(
        `Low battery threshold: ${LOW_BATTERY_LIMIT}%`
    );

    console.log(
        `Pollutants generated: ${POLLUTANTS.length}`
    );

    console.log(
        "======================================"
    );


    // -----------------------------------------------------
    // FIRST HEARTBEAT
    // -----------------------------------------------------

    simulateDeviceHeartbeat();


    // -----------------------------------------------------
    // FIRST SENSOR READING
    // -----------------------------------------------------

    generatePollutantReadings();


    // -----------------------------------------------------
    // DEVICE HEARTBEAT
    // -----------------------------------------------------

    setInterval(
        simulateDeviceHeartbeat,
        HEARTBEAT_INTERVAL
    );


    // -----------------------------------------------------
    // SENSOR READINGS
    // -----------------------------------------------------

    setInterval(
        generatePollutantReadings,
        READING_INTERVAL
    );
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    startDeviceSimulator,

    simulateDeviceHeartbeat,

    generatePollutantReadings,

};