const supabase = require("../config/supabase");

// =====================================================
// CONFIGURATION
// =====================================================

const PAGE_SIZE = 1000;


// =====================================================
// HELPERS
// =====================================================

const normalizeParameter = (parameter) => {
    if (!parameter) {
        return "";
    }

    return String(parameter)
        .toLowerCase()
        .trim()
        .replace("₂", "2")
        .replace("₅", "5");
};


const toNumber = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
};


// =====================================================
// FETCH ALL ROWS
// Supabase normally limits large responses.
// This fetches data page-by-page.
// =====================================================

const fetchAllRows = async (queryBuilder) => {

    let allRows = [];
    let from = 0;

    while (true) {

        const to =
            from + PAGE_SIZE - 1;

        const {
            data,
            error,
        } = await queryBuilder.range(
            from,
            to
        );

        if (error) {
            throw error;
        }

        const rows = data || [];

        allRows = [
            ...allRows,
            ...rows,
        ];

        if (
            rows.length < PAGE_SIZE
        ) {
            break;
        }

        from += PAGE_SIZE;
    }

    return allRows;
};


// =====================================================
// AVERAGE PARAMETER
// =====================================================

const calculateAverage = (
    readings,
    parameters
) => {

    const normalizedParameters =
        parameters.map(
            normalizeParameter
        );


    const values = readings
        .filter((row) =>
            normalizedParameters.includes(
                normalizeParameter(
                    row.parameter
                )
            )
        )
        .map((row) =>
            toNumber(row.value)
        )
        .filter(
            (value) =>
                value !== null
        );


    if (
        values.length === 0
    ) {
        return null;
    }


    const total =
        values.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    return total / values.length;
};


// =====================================================
// CPCB AQI BREAKPOINTS
//
// PM2.5 and PM10 are 24-hour averages.
// NO2 is also evaluated using its applicable
// 24-hour concentration for this report.
// =====================================================

const AQI_BREAKPOINTS = {

    pm25: [
        { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
        { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
        { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
        { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
        { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
        { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
    ],

    pm10: [
        { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
        { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
        { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
        { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
        { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
        { cLow: 431, cHigh: 500, iLow: 401, iHigh: 500 },
    ],

    no2: [
        { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
        { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
        { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
        { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
        { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
        { cLow: 401, cHigh: 800, iLow: 401, iHigh: 500 },
    ],
};


// =====================================================
// CALCULATE SUB-INDEX
// =====================================================

const calculateSubIndex = (
    pollutant,
    concentration
) => {

    const value =
        toNumber(concentration);

    if (
        value === null
    ) {
        return null;
    }


    const breakpoints =
        AQI_BREAKPOINTS[pollutant];

    if (!breakpoints) {
        return null;
    }


    const breakpoint =
        breakpoints.find(
            (item) =>
                value >= item.cLow &&
                value <= item.cHigh
        );


    if (!breakpoint) {

        // Above the highest breakpoint.
        if (
            value >
            breakpoints[
                breakpoints.length - 1
            ].cHigh
        ) {
            return 500;
        }

        return null;
    }


    const index =
        (
            (
                breakpoint.iHigh -
                breakpoint.iLow
            ) /
            (
                breakpoint.cHigh -
                breakpoint.cLow
            )
        ) *
        (
            value -
            breakpoint.cLow
        ) +
        breakpoint.iLow;


    return Math.round(index);
};


// =====================================================
// AQI CATEGORY
// =====================================================

const getAQICategory = (
    aqi
) => {

    if (
        aqi === null ||
        aqi === undefined
    ) {
        return "N/A";
    }


    if (aqi <= 50) {
        return "Good";
    }

    if (aqi <= 100) {
        return "Satisfactory";
    }

    if (aqi <= 200) {
        return "Moderate";
    }

    if (aqi <= 300) {
        return "Poor";
    }

    if (aqi <= 400) {
        return "Very Poor";
    }

    return "Severe";
};


// =====================================================
// CALCULATE AQI FROM 24-HOUR VALUES
// =====================================================

const calculateReportAQI = ({
    pm25,
    pm10,
    no2,
}) => {

    const subIndexes = {};

    const pm25Index =
        calculateSubIndex(
            "pm25",
            pm25
        );

    const pm10Index =
        calculateSubIndex(
            "pm10",
            pm10
        );

    const no2Index =
        calculateSubIndex(
            "no2",
            no2
        );


    if (
        pm25Index !== null
    ) {
        subIndexes.pm25 =
            pm25Index;
    }


    if (
        pm10Index !== null
    ) {
        subIndexes.pm10 =
            pm10Index;
    }


    if (
        no2Index !== null
    ) {
        subIndexes.no2 =
            no2Index;
    }


    const entries =
        Object.entries(
            subIndexes
        );


    if (
        entries.length === 0
    ) {

        return {

            aqi: null,

            category: "N/A",

            dominant: "N/A",

            subIndexes: {},

        };
    }


    entries.sort(
        (a, b) =>
            b[1] - a[1]
    );


    const dominant =
        entries[0][0];


    const aqi =
        entries[0][1];


    return {

        aqi,

        category:
            getAQICategory(aqi),

        dominant,

        subIndexes,

    };
};


// =====================================================
// DATA STATUS
// =====================================================

const calculateDataStatus = (
    readings
) => {

    if (
        readings.length === 0
    ) {
        return "No Data";
    }


    const currentCount =
        readings.filter(
            (row) =>
                String(
                    row.data_status || ""
                )
                    .toLowerCase() ===
                "current"
        ).length;


    const historicalCount =
        readings.filter(
            (row) =>
                String(
                    row.data_status || ""
                )
                    .toLowerCase() ===
                "historical"
        ).length;


    if (
        currentCount > 0 &&
        historicalCount > 0
    ) {
        return "Mixed";
    }


    if (
        currentCount > 0
    ) {
        return "Current";
    }


    if (
        historicalCount > 0
    ) {
        return "Historical";
    }


    // Older records that were inserted before
    // data_status was added.
    return "Unknown";
};


// =====================================================
// DATA AVAILABILITY
// =====================================================

const calculateAvailability = (
    readings
) => {

    if (
        readings.length === 0
    ) {
        return 0;
    }


    // OpenAQ readings use quality_flag = "OpenAQ".
    // Older locally validated readings may use "valid".
    const validReadings =
        readings.filter(
            (row) => {

                const flag =
                    String(
                        row.quality_flag || ""
                    )
                        .toLowerCase()
                        .trim();


                return (
                    flag === "valid" ||
                    flag === "openaq" ||
                    flag === "good" ||
                    flag === "ok"
                );
            }
        ).length;


    return Number(
        (
            (
                validReadings /
                readings.length
            ) *
            100
        ).toFixed(1)
    );
};


// =====================================================
// GET REPORT DATA
//
// GET /api/reports
//
// Examples:
//
// /api/reports?date=2026-09-03
//
// /api/reports?date=2026-09-03&stationId=2
//
// =====================================================

const getReportData = async (
    req,
    res
) => {

    try {

        const {
            stationId = "ALL",
            date,
        } = req.query;


        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        const observationDate =
            date ||
            new Date()
                .toISOString()
                .split("T")[0];


        // Basic date validation
        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                observationDate
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid date. Use YYYY-MM-DD.",

            });
        }


        // -------------------------------------------------
        // DATE RANGE
        //
        // Use UTC boundaries because timestamp is
        // stored as TIMESTAMPTZ.
        // -------------------------------------------------

        const startDate =
            `${observationDate}T00:00:00.000Z`;

        const endDate =
            `${observationDate}T23:59:59.999Z`;


        // =================================================
        // 1. GET PMC STATIONS
        // =================================================

        const {
            data: stations,
            error: stationError,
        } = await supabase

            .from("station")

            .select(`
                station_id,
                name,
                ward,
                zone,
                latitude,
                longitude,
                station_type,
                installation_date,
                status,
                external_source,
                external_station_id
            `)

            .order(
                "station_id",
                {
                    ascending: true,
                }
            );


        if (
            stationError
        ) {
            throw stationError;
        }


        // -------------------------------------------------
        // Selected stations
        // -------------------------------------------------

        let selectedStations =
            stations || [];


        if (
            stationId !== "ALL"
        ) {

            selectedStations =
                selectedStations.filter(
                    (station) =>
                        String(
                            station.station_id
                        ) ===
                        String(
                            stationId
                        )
                );
        }


        const stationIds =
            selectedStations.map(
                (station) =>
                    station.station_id
            );


        // =================================================
        // 2. GET ALL READINGS FOR THE DATE
        // =================================================

        let readings = [];


        if (
            stationIds.length > 0
        ) {

            readings =
                await fetchAllRows(

                    supabase

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

                        .in(
                            "station_id",
                            stationIds
                        )

                        .gte(
                            "timestamp",
                            startDate
                        )

                        .lte(
                            "timestamp",
                            endDate
                        )

                        .order(
                            "timestamp",
                            {
                                ascending: true,
                            }
                        )
                );
        }


        // =================================================
        // 3. GET AQI RECORDS
        //
        // We keep these for reference/status, but the
        // report AQI itself is calculated from the
        // 24-hour pollutant averages above.
        // =================================================

        let aqiRows = [];


        if (
            stationIds.length > 0
        ) {

            aqiRows =
                await fetchAllRows(

                    supabase

                        .from("aqi_reading")

                        .select(`
                            aqi_id,
                            station_id,
                            timestamp,
                            aqi,
                            category,
                            dominant_pollutant,
                            pollutant_subindices,
                            data_status
                        `)

                        .in(
                            "station_id",
                            stationIds
                        )

                        .gte(
                            "timestamp",
                            startDate
                        )

                        .lte(
                            "timestamp",
                            endDate
                        )

                        .order(
                            "timestamp",
                            {
                                ascending: false,
                            }
                        )
                );
        }


        // =================================================
        // 4. CREATE REPORT FOR EACH PMC STATION
        // =================================================

        const reports =
            selectedStations.map(
                (station) => {

                    // -------------------------------------
                    // Station readings
                    // -------------------------------------

                    const stationReadings =
                        readings.filter(
                            (row) =>
                                Number(
                                    row.station_id
                                ) ===
                                Number(
                                    station.station_id
                                )
                        );


                    // -------------------------------------
                    // Station AQI records
                    // -------------------------------------

                    const stationAqi =
                        aqiRows.filter(
                            (row) =>
                                Number(
                                    row.station_id
                                ) ===
                                Number(
                                    station.station_id
                                )
                        );


                    // -------------------------------------
                    // 24-HOUR AVERAGES
                    // -------------------------------------

                    const pm25 =
                        calculateAverage(
                            stationReadings,
                            [
                                "pm2.5",
                                "pm25",
                            ]
                        );


                    const pm10 =
                        calculateAverage(
                            stationReadings,
                            [
                                "pm10",
                            ]
                        );


                    const no2 =
                        calculateAverage(
                            stationReadings,
                            [
                                "no2",
                                "no2",
                            ]
                        );


                    // -------------------------------------
                    // REPORT AQI
                    // -------------------------------------

                    const reportAQI =
                        calculateReportAQI({

                            pm25,

                            pm10,

                            no2,

                        });


                    // -------------------------------------
                    // DATA STATUS
                    // -------------------------------------

                    const dataStatus =
                        calculateDataStatus(
                            stationReadings
                        );


                    // -------------------------------------
                    // READING COUNTS
                    // -------------------------------------

                    const totalReadings =
                        stationReadings.length;


                    const parameterCounts = {

                        pm25:
                            stationReadings.filter(
                                (row) =>
                                    [
                                        "pm2.5",
                                        "pm25",
                                    ].includes(
                                        normalizeParameter(
                                            row.parameter
                                        )
                                    )
                            ).length,

                        pm10:
                            stationReadings.filter(
                                (row) =>
                                    normalizeParameter(
                                        row.parameter
                                    ) ===
                                    "pm10"
                            ).length,

                        no2:
                            stationReadings.filter(
                                (row) =>
                                    [
                                        "no2",
                                    ].includes(
                                        normalizeParameter(
                                            row.parameter
                                        )
                                    )
                            ).length,

                    };


                    // -------------------------------------
                    // AVAILABILITY
                    // -------------------------------------

                    const availability =
                        calculateAvailability(
                            stationReadings
                        );


                    // -------------------------------------
                    // DATE COVERAGE
                    // -------------------------------------

                    const timestamps =
                        stationReadings

                            .map(
                                (row) =>
                                    row.timestamp
                            )

                            .filter(Boolean)

                            .map(
                                (timestamp) =>
                                    new Date(
                                        timestamp
                                    )
                            )

                            .filter(
                                (date) =>
                                    !Number.isNaN(
                                        date.getTime()
                                    )
                            );


                    let firstReading = null;
                    let lastReading = null;


                    if (
                        timestamps.length > 0
                    ) {

                        timestamps.sort(
                            (a, b) =>
                                a - b
                        );


                        firstReading =
                            timestamps[0]
                                .toISOString();


                        lastReading =
                            timestamps[
                                timestamps.length - 1
                            ].toISOString();
                    }


                    // -------------------------------------
                    // EXPECTED SAMPLE ESTIMATE
                    //
                    // This assumes approximately one
                    // observation per hour. It is used only
                    // as a simple report completeness
                    // indicator, not as an official CPCB
                    // completeness calculation.
                    // -------------------------------------

                    const expectedHourlySamples =
                        24;


                    const observedParameterSamples =
                        parameterCounts.pm25 +
                        parameterCounts.pm10 +
                        parameterCounts.no2;


                    const reportCompleteness =
                        expectedHourlySamples > 0
                            ? Number(
                                Math.min(
                                    (
                                        observedParameterSamples /
                                        (
                                            expectedHourlySamples *
                                            3
                                        )
                                    ) *
                                    100,
                                    100
                                ).toFixed(1)
                            )
                            : 0;


                    // -------------------------------------
                    // COMPLIANCE
                    //
                    // Based on report-period averages.
                    // -------------------------------------

                    const exceeded =
                        (
                            pm25 !== null &&
                            pm25 > 60
                        ) ||
                        (
                            pm10 !== null &&
                            pm10 > 100
                        ) ||
                        (
                            no2 !== null &&
                            no2 > 80
                        );


                    // -------------------------------------
                    // AQI RECORD STATUS
                    // -------------------------------------

                    const latestAqi =
                        stationAqi.length > 0
                            ? stationAqi[0]
                            : null;


                    // -------------------------------------
                    // RETURN STATION REPORT
                    // -------------------------------------

                    return {

                        stationId:
                            station.station_id,

                        station:
                            station.name,

                        ward:
                            station.ward ||
                            "N/A",

                        zone:
                            station.zone ||
                            "N/A",

                        externalSource:
                            station.external_source ||
                            null,

                        externalStationId:
                            station.external_station_id ||
                            null,


                        // ---------------------------------
                        // 24-HOUR VALUES
                        // ---------------------------------

                        pm25:
                            pm25 !== null
                                ? Number(
                                    pm25.toFixed(2)
                                )
                                : null,

                        pm10:
                            pm10 !== null
                                ? Number(
                                    pm10.toFixed(2)
                                )
                                : null,

                        no2:
                            no2 !== null
                                ? Number(
                                    no2.toFixed(2)
                                )
                                : null,


                        // ---------------------------------
                        // AQI
                        // ---------------------------------

                        aqi:
                            reportAQI.aqi,

                        category:
                            reportAQI.category,

                        dominant:
                            reportAQI.dominant,

                        subIndexes:
                            reportAQI.subIndexes,


                        // ---------------------------------
                        // DATA STATUS
                        // ---------------------------------

                        dataStatus,

                        currentReadings:
                            stationReadings.filter(
                                (row) =>
                                    String(
                                        row.data_status ||
                                        ""
                                    )
                                        .toLowerCase() ===
                                    "current"
                            ).length,

                        historicalReadings:
                            stationReadings.filter(
                                (row) =>
                                    String(
                                        row.data_status ||
                                        ""
                                    )
                                        .toLowerCase() ===
                                    "historical"
                            ).length,


                        // ---------------------------------
                        // DATA COUNTS
                        // ---------------------------------

                        totalReadings,

                        pm25Readings:
                            parameterCounts.pm25,

                        pm10Readings:
                            parameterCounts.pm10,

                        no2Readings:
                            parameterCounts.no2,


                        // ---------------------------------
                        // AVAILABILITY
                        // ---------------------------------

                        availability:
                            `${availability}%`,

                        reportCompleteness:
                            `${reportCompleteness}%`,

                        firstReading,

                        lastReading,


                        // ---------------------------------
                        // COMPLIANCE
                        // ---------------------------------

                        compliance:
                            stationReadings.length === 0
                                ? "No Data"
                                : exceeded
                                    ? "Action Triggered"
                                    : "Compliant",


                        // ---------------------------------
                        // SOURCE
                        // ---------------------------------

                        source:
                            station.external_source ===
                            "OPENAQ"
                                ? "OpenAQ"
                                : "PMC",


                        // ---------------------------------
                        // AQI SOURCE INFORMATION
                        // ---------------------------------

                        storedAqiRecords:
                            stationAqi.length,

                        latestStoredAqi:
                            latestAqi
                                ? toNumber(
                                    latestAqi.aqi
                                )
                                : null,

                    };
                }
            );


        // =================================================
        // 5. REPORT SUMMARY
        // =================================================

        const totalStations =
            reports.length;


        const stationsWithData =
            reports.filter(
                (row) =>
                    row.totalReadings > 0
            ).length;


        const currentStations =
            reports.filter(
                (row) =>
                    row.dataStatus ===
                    "Current"
            ).length;


        const historicalStations =
            reports.filter(
                (row) =>
                    row.dataStatus ===
                    "Historical"
            ).length;


        const mixedStations =
            reports.filter(
                (row) =>
                    row.dataStatus ===
                    "Mixed"
            ).length;


        const compliantStations =
            reports.filter(
                (row) =>
                    row.compliance ===
                    "Compliant"
            ).length;


        const actionRequired =
            reports.filter(
                (row) =>
                    row.compliance ===
                    "Action Triggered"
            ).length;


        // =================================================
        // 6. RESPONSE
        // =================================================

        return res.status(200).json({

            status: "success",

            observationDate,

            reportPeriod: {

                start:
                    startDate,

                end:
                    endDate,

                duration:
                    "24 hours",

            },


            source: {

                system:
                    "PMC CAAQM",

                externalSource:
                    "OpenAQ",

            },


            summary: {

                totalStations,

                stationsWithData,

                currentStations,

                historicalStations,

                mixedStations,

                compliantStations,

                actionRequired,

            },


            count:
                reports.length,


            stations:
                selectedStations,


            data:
                reports,

        });


    } catch (error) {

        console.error(
            "Report API error:"
        );

        console.error(error);


        return res.status(500).json({

            status: "error",

            message:
                error.message ||
                "Failed to generate report.",

        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getReportData,

};