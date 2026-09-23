const supabase = require("../config/supabase");

// =====================================================
// CONFIGURATION
// =====================================================

const PAGE_SIZE = 1000;
const TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30";

// =====================================================
// BASIC HELPERS
// =====================================================

const normalizeParameter = (parameter) => {
    if (!parameter) {
        return "";
    }

    return String(parameter)
        .toLowerCase()
        .trim()
        .replace(/₂/g, "2")
        .replace(/₅/g, "5")
        .replace(/\s+/g, "");
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
// DATE HELPERS
// =====================================================

const parseDate = (dateString) => {
    if (
        !dateString ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
        return null;
    }

    const date = new Date(
        `${dateString}T00:00:00${IST_OFFSET}`
    );

    return Number.isNaN(date.getTime())
        ? null
        : date;
};

const getDateRange = (from, to) => {
    const fromDate = parseDate(from);
    const toDate = parseDate(to || from);

    if (!fromDate || !toDate) {
        return null;
    }

    if (fromDate > toDate) {
        return null;
    }

    const endExclusive = new Date(
        `${to || from}T00:00:00${IST_OFFSET}`
    );

    endExclusive.setDate(
        endExclusive.getDate() + 1
    );

    return {
        from: fromDate.toISOString(),
        toExclusive: endExclusive.toISOString(),
        fromDate: from,
        toDate: to || from,
    };
};

const getTodayInPune = () => {
    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: TIME_ZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }
    ).format(new Date());
};

const getRequestDateRange = (req) => {
    const today = getTodayInPune();

    const from =
        req.query.from ||
        req.query.date ||
        today;

    const to =
        req.query.to ||
        req.query.date ||
        from;

    return getDateRange(from, to);
};

// =====================================================
// LOCAL DATE / TIME
// =====================================================

const getLocalDate = (timestamp) => {
    if (!timestamp) {
        return null;
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: TIME_ZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }
    ).format(date);
};

const getLocalMonth = (timestamp) => {
    const date = getLocalDate(timestamp);

    if (!date) {
        return null;
    }

    return date.substring(0, 7);
};

const getLocalHour = (timestamp) => {
    if (!timestamp) {
        return null;
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: TIME_ZONE,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                hourCycle: "h23",
            }
        ).formatToParts(date);

    const result = {};

    parts.forEach((part) => {
        result[part.type] = part.value;
    });

    return `${result.year}-${result.month}-${result.day}T${result.hour}`;
};

// =====================================================
// FETCH ALL SUPABASE ROWS
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
            rows.length <
            PAGE_SIZE
        ) {
            break;
        }

        from += PAGE_SIZE;
    }

    return allRows;
};

// =====================================================
// AVERAGE
// =====================================================

const calculateAverage = (
    values
) => {
    const validValues = values
        .map(toNumber)
        .filter(
            (value) =>
                value !== null
        );

    if (!validValues.length) {
        return null;
    }

    const total =
        validValues.reduce(
            (sum, value) =>
                sum + value,
            0
        );

    return (
        total /
        validValues.length
    );
};

// =====================================================
// CPCB AQI BREAKPOINTS
// =====================================================

const AQI_BREAKPOINTS = {

    pm25: [
        {
            cLow: 0,
            cHigh: 30,
            iLow: 0,
            iHigh: 50,
        },
        {
            cLow: 31,
            cHigh: 60,
            iLow: 51,
            iHigh: 100,
        },
        {
            cLow: 61,
            cHigh: 90,
            iLow: 101,
            iHigh: 200,
        },
        {
            cLow: 91,
            cHigh: 120,
            iLow: 201,
            iHigh: 300,
        },
        {
            cLow: 121,
            cHigh: 250,
            iLow: 301,
            iHigh: 400,
        },
        {
            cLow: 251,
            cHigh: 500,
            iLow: 401,
            iHigh: 500,
        },
    ],

    pm10: [
        {
            cLow: 0,
            cHigh: 50,
            iLow: 0,
            iHigh: 50,
        },
        {
            cLow: 51,
            cHigh: 100,
            iLow: 51,
            iHigh: 100,
        },
        {
            cLow: 101,
            cHigh: 250,
            iLow: 101,
            iHigh: 200,
        },
        {
            cLow: 251,
            cHigh: 350,
            iLow: 201,
            iHigh: 300,
        },
        {
            cLow: 351,
            cHigh: 430,
            iLow: 301,
            iHigh: 400,
        },
        {
            cLow: 431,
            cHigh: 500,
            iLow: 401,
            iHigh: 500,
        },
    ],

    no2: [
        {
            cLow: 0,
            cHigh: 40,
            iLow: 0,
            iHigh: 50,
        },
        {
            cLow: 41,
            cHigh: 80,
            iLow: 51,
            iHigh: 100,
        },
        {
            cLow: 81,
            cHigh: 180,
            iLow: 101,
            iHigh: 200,
        },
        {
            cLow: 181,
            cHigh: 280,
            iLow: 201,
            iHigh: 300,
        },
        {
            cLow: 281,
            cHigh: 400,
            iLow: 301,
            iHigh: 400,
        },
        {
            cLow: 401,
            cHigh: 800,
            iLow: 401,
            iHigh: 500,
        },
    ],
};

// =====================================================
// AQI SUB-INDEX
// =====================================================

const calculateSubIndex = (
    pollutant,
    concentration
) => {

    const value =
        toNumber(concentration);

    if (value === null) {
        return null;
    }

    const breakpoints =
        AQI_BREAKPOINTS[
            pollutant
        ];

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
// CALCULATE AQI
// =====================================================

const calculateAQI = ({
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

    if (!entries.length) {

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

    return {

        aqi:
            entries[0][1],

        category:
            getAQICategory(
                entries[0][1]
            ),

        dominant:
            entries[0][0],

        subIndexes,
    };
};

// =====================================================
// POLLUTANT NORMALIZATION
// =====================================================

const getPollutantKey = (
    parameter
) => {

    const value =
        normalizeParameter(
            parameter
        );

    if (
        value === "pm25" ||
        value === "pm2.5" ||
        value === "pm2_5"
    ) {
        return "pm25";
    }

    if (
        value === "pm10"
    ) {
        return "pm10";
    }

    if (
        value === "no2"
    ) {
        return "no2";
    }

    return null;
};

// =====================================================
// PARAMETER AVERAGE
// =====================================================

const calculateParameterAverage = (
    readings,
    parameter
) => {

    const values =
        readings
            .filter(
                (row) =>
                    getPollutantKey(
                        row.parameter
                    ) ===
                    parameter
            )
            .map(
                (row) =>
                    toNumber(
                        row.value
                    )
            )
            .filter(
                (value) =>
                    value !== null
            );

    return calculateAverage(
        values
    );
};

// =====================================================
// DATA AVAILABILITY
// =====================================================

const calculateAvailability = (
    readings,
    fromDate,
    toDate
) => {

    const from =
        parseDate(fromDate);

    const to =
        parseDate(toDate);

    if (!from || !to) {
        return 0;
    }

    const dayCount =
        Math.floor(
            (
                to.getTime() -
                from.getTime()
            ) /
            86400000
        ) + 1;

    const expectedHours =
        Math.max(
            dayCount * 24,
            1
        );

    const validHours =
        new Set();

    readings.forEach(
        (row) => {

            const flag =
                String(
                    row.quality_flag ||
                    ""
                )
                    .toLowerCase()
                    .trim();

            const valid =
                flag === "" ||
                flag === "valid" ||
                flag === "openaq" ||
                flag === "good" ||
                flag === "ok";

            if (
                valid &&
                row.timestamp
            ) {

                const hour =
                    getLocalHour(
                        row.timestamp
                    );

                if (hour) {
                    validHours.add(
                        hour
                    );
                }
            }
        }
    );

    return Number(
        Math.min(
            (
                validHours.size /
                expectedHours
            ) *
                100,
            100
        ).toFixed(1)
    );
};

// =====================================================
// DATA STATUS
// =====================================================

const calculateDataStatus = (
    readings
) => {

    if (!readings.length) {
        return "No Data";
    }

    const current =
        readings.filter(
            (row) =>
                String(
                    row.data_status ||
                    ""
                )
                    .toLowerCase() ===
                "current"
        ).length;

    const historical =
        readings.filter(
            (row) =>
                String(
                    row.data_status ||
                    ""
                )
                    .toLowerCase() ===
                "historical"
        ).length;

    if (
        current > 0 &&
        historical > 0
    ) {
        return "Mixed";
    }

    if (current > 0) {
        return "Current";
    }

    if (historical > 0) {
        return "Historical";
    }

    return "Unknown";
};
// =====================================================
// BUILD STATION REPORT
// =====================================================

const buildStationReport = (
    station,
    readings,
    fromDate,
    toDate
) => {

    const pm25 =
        calculateParameterAverage(
            readings,
            "pm25"
        );

    const pm10 =
        calculateParameterAverage(
            readings,
            "pm10"
        );

    const no2 =
        calculateParameterAverage(
            readings,
            "no2"
        );

    const aqi =
        calculateAQI({
            pm25,
            pm10,
            no2,
        });

    const availability =
        calculateAvailability(
            readings,
            fromDate,
            toDate
        );

    const compliance =
        readings.length === 0
            ? "No Data"
            : (
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
                  )
              )
            ? "Action Triggered"
            : "Compliant";

    const currentReadings =
        readings.filter(
            (row) =>
                String(
                    row.data_status ||
                    ""
                )
                    .toLowerCase() ===
                "current"
        ).length;

    const historicalReadings =
        readings.filter(
            (row) =>
                String(
                    row.data_status ||
                    ""
                )
                    .toLowerCase() ===
                "historical"
        ).length;

    const timestamps =
        readings
            .map(
                (row) =>
                    new Date(
                        row.timestamp
                    )
            )
            .filter(
                (date) =>
                    !Number.isNaN(
                        date.getTime()
                    )
            )
            .sort(
                (a, b) =>
                    a - b
            );

    const pm25Readings =
        readings.filter(
            (row) =>
                getPollutantKey(
                    row.parameter
                ) === "pm25"
        ).length;

    const pm10Readings =
        readings.filter(
            (row) =>
                getPollutantKey(
                    row.parameter
                ) === "pm10"
        ).length;

    const no2Readings =
        readings.filter(
            (row) =>
                getPollutantKey(
                    row.parameter
                ) === "no2"
        ).length;

    const dayCount =
        Math.floor(
            (
                parseDate(toDate).getTime() -
                parseDate(fromDate).getTime()
            ) /
                86400000
        ) + 1;

    const expectedSamples =
        Math.max(
            dayCount * 24 * 3,
            1
        );

    const observedSamples =
        pm25Readings +
        pm10Readings +
        no2Readings;

    const completeness =
        Number(
            Math.min(
                (
                    observedSamples /
                    expectedSamples
                ) *
                    100,
                100
            ).toFixed(1)
        );

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

        latitude:
            station.latitude,

        longitude:
            station.longitude,

        stationType:
            station.station_type,

        status:
            station.status,

        externalSource:
            station.external_source ||
            null,

        externalStationId:
            station.external_station_id ||
            null,

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

        aqi:
            aqi.aqi,

        category:
            aqi.category,

        dominant:
            aqi.dominant,

        subIndexes:
            aqi.subIndexes,

        dataStatus:
            calculateDataStatus(
                readings
            ),

        currentReadings,

        historicalReadings,

        totalReadings:
            readings.length,

        pm25Readings,

        pm10Readings,

        no2Readings,

        availability:
            `${availability}%`,

        reportCompleteness:
            `${completeness}%`,

        firstReading:
            timestamps.length
                ? timestamps[
                      0
                  ].toISOString()
                : null,

        lastReading:
            timestamps.length
                ? timestamps[
                      timestamps.length - 1
                  ].toISOString()
                : null,

        compliance,

        source:
            station.external_source ===
            "OPENAQ"
                ? "OpenAQ"
                : "PMC",
    };
};

// =====================================================
// COMMON REPORT DATA LOADER
// =====================================================

const loadReportData = async (
    req
) => {

    const range =
        getRequestDateRange(
            req
        );

    if (!range) {

        const error =
            new Error(
                "Invalid date range. Use YYYY-MM-DD and ensure from <= to."
            );

        error.statusCode =
            400;

        throw error;
    }

    const stationId =
        req.query.stationId ||
        "ALL";

    // -------------------------------------------------
    // STATIONS
    // -------------------------------------------------

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

    if (stationError) {
        throw stationError;
    }

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

    let readings = [];

    let aqiRows = [];

    // -------------------------------------------------
    // READING DATA
    // -------------------------------------------------

    if (stationIds.length) {

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
                        range.from
                    )
                    .lt(
                        "timestamp",
                        range.toExclusive
                    )
                    .order(
                        "timestamp",
                        {
                            ascending: true,
                        }
                    )
            );

        // -------------------------------------------------
        // AQI DATA
        // -------------------------------------------------

        aqiRows =
            await fetchAllRows(
                supabase
                    .from(
                        "aqi_reading"
                    )
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
                        range.from
                    )
                    .lt(
                        "timestamp",
                        range.toExclusive
                    )
                    .order(
                        "timestamp",
                        {
                            ascending: false,
                        }
                    )
            );
    }

    return {

        range,

        stationId,

        stations:
            selectedStations,

        readings,

        aqiRows,
    };
};

// =====================================================
// 1. DAILY STATION REPORT
//
// GET /api/reports?date=2026-09-21
// GET /api/reports?date=2026-09-21&stationId=1
// =====================================================

const getReportData = async (
    req,
    res
) => {

    try {

        const loaded =
            await loadReportData(
                req
            );

        const reports =
            loaded.stations.map(
                (station) => {

                    const stationReadings =
                        loaded.readings.filter(
                            (row) =>
                                Number(
                                    row.station_id
                                ) ===
                                Number(
                                    station.station_id
                                )
                        );

                    return buildStationReport(
                        station,
                        stationReadings,
                        loaded.range.fromDate,
                        loaded.range.toDate
                    );
                }
            );

        const summary = {

            totalStations:
                reports.length,

            stationsWithData:
                reports.filter(
                    (row) =>
                        row.totalReadings >
                        0
                ).length,

            currentStations:
                reports.filter(
                    (row) =>
                        row.dataStatus ===
                        "Current"
                ).length,

            historicalStations:
                reports.filter(
                    (row) =>
                        row.dataStatus ===
                        "Historical"
                ).length,

            mixedStations:
                reports.filter(
                    (row) =>
                        row.dataStatus ===
                        "Mixed"
                ).length,

            compliantStations:
                reports.filter(
                    (row) =>
                        row.compliance ===
                        "Compliant"
                ).length,

            actionRequired:
                reports.filter(
                    (row) =>
                        row.compliance ===
                        "Action Triggered"
                ).length,

            noDataStations:
                reports.filter(
                    (row) =>
                        row.compliance ===
                        "No Data"
                ).length,
        };

        return res.status(200).json({

            status:
                "success",

            observationDate:
                loaded.range.fromDate,

            reportPeriod: {

                start:
                    loaded.range.from,

                end:
                    loaded.range.toExclusive,

                duration:
                    loaded.range.fromDate ===
                    loaded.range.toDate
                        ? "24 hours"
                        : "Custom range",
            },

            source: {

                system:
                    "PMC CAAQM",

                externalSource:
                    "OpenAQ",
            },

            summary,

            count:
                reports.length,

            stations:
                loaded.stations,

            data:
                reports,
        });

    } catch (error) {

        console.error(
            "Report API error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({

            status:
                "error",

            message:
                error.message ||
                "Failed to generate report.",
        });
    }
};

// =====================================================
// 2. WARD-WISE AQI REPORT
//
// DAILY:
//
// /api/reports/ward
// ?from=2026-09-01
// &to=2026-09-21
// &groupBy=day
//
// MONTHLY:
//
// &groupBy=month
// =====================================================

const getWardAQIReport = async (
    req,
    res
) => {

    try {

        const loaded =
            await loadReportData(
                req
            );

        const groupBy =
            String(
                req.query.groupBy ||
                "day"
            ).toLowerCase() ===
            "month"
                ? "month"
                : "day";

        const stationMap =
            new Map();

        loaded.stations.forEach(
            (station) => {

                stationMap.set(
                    Number(
                        station.station_id
                    ),
                    station
                );
            }
        );

        const groups = {};

        loaded.readings.forEach(
            (reading) => {

                const station =
                    stationMap.get(
                        Number(
                            reading.station_id
                        )
                    );

                if (!station) {
                    return;
                }

                const period =
                    groupBy ===
                    "month"
                        ? getLocalMonth(
                              reading.timestamp
                          )
                        : getLocalDate(
                              reading.timestamp
                          );

                if (!period) {
                    return;
                }

                const ward =
                    station.ward ||
                    "Unknown";

                const key =
                    `${ward}__${period}`;

                if (!groups[key]) {

                    groups[key] = {

                        ward,

                        zone:
                            station.zone ||
                            "N/A",

                        period,

                        stations: {},
                    };
                }

                if (
                    !groups[key]
                        .stations[
                        station.station_id
                    ]
                ) {

                    groups[key]
                        .stations[
                        station.station_id
                    ] = [];
                }

                groups[key]
                    .stations[
                    station.station_id
                ].push(
                    reading
                );
            }
        );

        const data =
            Object.values(
                groups
            )
                .map(
                    (group) => {

                        const stationAQIs =
                            Object.values(
                                group.stations
                            )
                                .map(
                                    (
                                        stationReadings
                                    ) => {

                                        const pm25 =
                                            calculateParameterAverage(
                                                stationReadings,
                                                "pm25"
                                            );

                                        const pm10 =
                                            calculateParameterAverage(
                                                stationReadings,
                                                "pm10"
                                            );

                                        const no2 =
                                            calculateParameterAverage(
                                                stationReadings,
                                                "no2"
                                            );

                                        return calculateAQI(
                                            {
                                                pm25,
                                                pm10,
                                                no2,
                                            }
                                        ).aqi;
                                    }
                                )
                                .filter(
                                    (value) =>
                                        value !==
                                        null
                                );

                        const avg =
                            calculateAverage(
                                stationAQIs
                            );

                        return {

                            ward:
                                group.ward,

                            zone:
                                group.zone,

                            period:
                                group.period,

                            stationCount:
                                Object.keys(
                                    group.stations
                                ).length,

                            averageAQI:
                                avg !== null
                                    ? Number(
                                          avg.toFixed(
                                              2
                                          )
                                      )
                                    : null,

                            maximumAQI:
                                stationAQIs.length
                                    ? Math.max(
                                          ...stationAQIs
                                      )
                                    : null,

                            minimumAQI:
                                stationAQIs.length
                                    ? Math.min(
                                          ...stationAQIs
                                      )
                                    : null,

                            category:
                                avg !== null
                                    ? getAQICategory(
                                          Math.round(
                                              avg
                                          )
                                      )
                                    : "N/A",
                        };
                    }
                )
                .sort(
                    (a, b) =>
                        String(
                            a.period
                        ).localeCompare(
                            String(
                                b.period
                            )
                        ) ||
                        String(
                            a.ward
                        ).localeCompare(
                            String(
                                b.ward
                            )
                        )
                );

        return res.json({

            status:
                "success",

            groupBy,

            from:
                loaded.range.fromDate,

            to:
                loaded.range.toDate,

            data,
        });

    } catch (error) {

        console.error(
            "Ward AQI report error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({

            status:
                "error",

            message:
                error.message ||
                "Failed to generate ward AQI report.",
        });
    }
};


// =====================================================
// 3. POLLUTANT TREND REPORT
//
// GET /api/reports/pollutant-trend
//
// ?from=2026-09-01
// &to=2026-09-21
//
// Optional:
// &stationId=1
// &parameter=PM2.5
// =====================================================

const getPollutantTrendReport = async (
    req,
    res
) => {

    try {

        const loaded =
            await loadReportData(
                req
            );

        const requestedParameter =
            normalizeParameter(
                req.query.parameter ||
                "ALL"
            );

        let parameters = [
            "pm25",
            "pm10",
            "no2",
        ];

        if (
            requestedParameter !==
            "all"
        ) {

            const selected =
                getPollutantKey(
                    requestedParameter
                );

            parameters =
                selected
                    ? [selected]
                    : [];
        }

        const stationMap =
            new Map();

        loaded.stations.forEach(
            (station) => {

                stationMap.set(
                    Number(
                        station.station_id
                    ),
                    station
                );
            }
        );

        const grouped = {};

        loaded.readings.forEach(
            (reading) => {

                const station =
                    stationMap.get(
                        Number(
                            reading.station_id
                        )
                    );

                if (!station) {
                    return;
                }

                const parameter =
                    getPollutantKey(
                        reading.parameter
                    );

                if (
                    !parameter ||
                    !parameters.includes(
                        parameter
                    )
                ) {
                    return;
                }

                const date =
                    getLocalDate(
                        reading.timestamp
                    );

                if (!date) {
                    return;
                }

                const key =
                    `${date}__${parameter}`;

                if (!grouped[key]) {

                    grouped[key] = {

                        date,

                        parameter,

                        values: [],
                    };
                }

                const value =
                    toNumber(
                        reading.value
                    );

                if (
                    value !== null
                ) {

                    grouped[key]
                        .values
                        .push(
                            value
                        );
                }
            }
        );

        const data =
            Object.values(
                grouped
            )
                .map(
                    (row) => {

                        const avg =
                            calculateAverage(
                                row.values
                            );

                        return {

                            date:
                                row.date,

                            parameter:
                                row.parameter,

                            average:
                                avg !== null
                                    ? Number(
                                          avg.toFixed(
                                              2
                                          )
                                      )
                                    : null,

                            minimum:
                                row.values.length
                                    ? Number(
                                          Math.min(
                                              ...row.values
                                          ).toFixed(
                                              2
                                          )
                                      )
                                    : null,

                            maximum:
                                row.values.length
                                    ? Number(
                                          Math.max(
                                              ...row.values
                                          ).toFixed(
                                              2
                                          )
                                      )
                                    : null,

                            samples:
                                row.values.length,
                        };
                    }
                )
                .sort(
                    (a, b) =>
                        a.date.localeCompare(
                            b.date
                        ) ||
                        a.parameter.localeCompare(
                            b.parameter
                        )
                );

        return res.json({

            status:
                "success",

            from:
                loaded.range.fromDate,

            to:
                loaded.range.toDate,

            parameters,

            data,
        });

    } catch (error) {

        console.error(
            "Pollutant trend error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({

            status:
                "error",

            message:
                error.message ||
                "Failed to generate pollutant trend report.",
        });
    }
};

// =====================================================
// 4. STATION UPTIME + DATA AVAILABILITY
//
// GET /api/reports/uptime
//
// ?from=2026-09-01
// &to=2026-09-21
// =====================================================

const getUptimeReport = async (
    req,
    res
) => {

    try {

        const loaded =
            await loadReportData(
                req
            );

        const stationIds =
            loaded.stations.map(
                (station) =>
                    station.station_id
            );

        let devices = [];

        if (
            stationIds.length
        ) {

            const {
                data,
                error,
            } = await supabase
                .from("device")
                .select(`
                    device_id,
                    gateway_id,
                    manufacturer,
                    model,
                    firmware,
                    station_id,
                    status,
                    battery_level,
                    network_status,
                    last_seen_at,
                    is_simulated
                `)
                .in(
                    "station_id",
                    stationIds
                );

            if (error) {
                throw error;
            }

            devices =
                data || [];
        }

        const data =
            loaded.stations.map(
                (station) => {

                    const stationReadings =
                        loaded.readings.filter(
                            (row) =>
                                Number(
                                    row.station_id
                                ) ===
                                Number(
                                    station.station_id
                                )
                        );

                    const stationDevices =
                        devices.filter(
                            (device) =>
                                Number(
                                    device.station_id
                                ) ===
                                Number(
                                    station.station_id
                                )
                        );

                    const onlineDevices =
                        stationDevices.filter(
                            (device) => {

                                const network =
                                    String(
                                        device.network_status ||
                                        ""
                                    ).toLowerCase();

                                const status =
                                    String(
                                        device.status ||
                                        ""
                                    ).toLowerCase();

                                return (
                                    network ===
                                        "connected" ||
                                    network ===
                                        "online" ||
                                    status ===
                                        "online" ||
                                    status ===
                                        "active"
                                );
                            }
                        ).length;

                    const batteryValues =
                        stationDevices
                            .map(
                                (device) =>
                                    toNumber(
                                        device.battery_level
                                    )
                            )
                            .filter(
                                (value) =>
                                    value !==
                                    null
                            );

                    const battery =
                        calculateAverage(
                            batteryValues
                        );

                    const lastSeen =
                        stationDevices
                            .map(
                                (device) =>
                                    device.last_seen_at
                            )
                            .filter(Boolean)
                            .sort()
                            .reverse()[0] ||
                        null;

                    return {

                        stationId:
                            station.station_id,

                        station:
                            station.name,

                        ward:
                            station.ward ||
                            "N/A",

                        deviceCount:
                            stationDevices.length,

                        onlineDevices,

                        offlineDevices:
                            Math.max(
                                stationDevices.length -
                                    onlineDevices,
                                0
                            ),

                        batteryLevel:
                            battery !== null
                                ? Number(
                                      battery.toFixed(
                                          1
                                      )
                                  )
                                : null,

                        networkStatus:
                            onlineDevices > 0
                                ? "Connected"
                                : stationDevices.length
                                ? "Disconnected"
                                : "No Device",

                        latestHeartbeat:
                            lastSeen,

                        dataAvailability:
                            `${calculateAvailability(
                                stationReadings,
                                loaded.range.fromDate,
                                loaded.range.toDate
                            )}%`,

                        totalReadings:
                            stationReadings.length,
                    };
                }
            );

        return res.json({

            status:
                "success",

            from:
                loaded.range.fromDate,

            to:
                loaded.range.toDate,

            note:
                "Historical device uptime requires heartbeat history. Current device health is calculated from device status, network_status and last_seen_at.",

            data,
        });

    } catch (error) {

        console.error(
            "Uptime report error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({

            status:
                "error",

            message:
                error.message ||
                "Failed to generate uptime report.",
        });
    }
};

// =====================================================
// 5. ALERT SUMMARY REPORT
//
// GET /api/reports/alerts
//
// ?from=2026-09-01
// &to=2026-09-21
// =====================================================

const getAlertReport = async (
    req,
    res
) => {

    try {

        const loaded =
            await loadReportData(
                req
            );

        const stationIds =
            loaded.stations.map(
                (station) =>
                    station.station_id
            );

        let alerts = [];

        if (
            stationIds.length
        ) {

            alerts =
                await fetchAllRows(
                    supabase
                        .from("alert")
                        .select("*")
                        .in(
                            "station_id",
                            stationIds
                        )
                        .gte(
                            "started_time",
                            loaded.range.from
                        )
                        .lt(
                            "started_time",
                            loaded.range.toExclusive
                        )
                        .order(
                            "started_time",
                            {
                                ascending:
                                    false,
                            }
                        )
                );
        }

        const stationMap =
            new Map();

        loaded.stations.forEach(
            (station) => {

                stationMap.set(
                    Number(
                        station.station_id
                    ),
                    station
                );
            }
        );

        const bySeverity = {};
        const byParameter = {};
        const byStation = {};

        alerts.forEach(
            (alert) => {

                const severity =
                    alert.severity ||
                    "Unknown";

                const parameter =
                    alert.parameter ||
                    "Unknown";

                const station =
                    stationMap.get(
                        Number(
                            alert.station_id
                        )
                    );

                const stationName =
                    station?.name ||
                    `Station ${alert.station_id}`;

                bySeverity[
                    severity
                ] =
                    (
                        bySeverity[
                            severity
                        ] || 0
                    ) + 1;

                byParameter[
                    parameter
                ] =
                    (
                        byParameter[
                            parameter
                        ] || 0
                    ) + 1;

                byStation[
                    stationName
                ] =
                    (
                        byStation[
                            stationName
                        ] || 0
                    ) + 1;
            }
        );

        const activeAlerts =
            alerts.filter(
                (alert) =>
                    !alert.acknowledged_at &&
                    String(
                        alert.acknowledgement ||
                        ""
                    ).toLowerCase() !==
                    "acknowledged"
            ).length;

        return res.json({

            status:
                "success",

            from:
                loaded.range.fromDate,

            to:
                loaded.range.toDate,

            summary: {

                totalAlerts:
                    alerts.length,

                activeAlerts,

                acknowledgedAlerts:
                    alerts.length -
                    activeAlerts,

                bySeverity,

                byParameter,

                byStation,
            },

            data:
                alerts,
        });

    } catch (error) {

        console.error(
            "Alert report error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({

            status:
                "error",

            message:
                error.message ||
                "Failed to generate alert report.",
        });
    }
};

// =====================================================
// 6. MAINTENANCE + CALIBRATION REPORT
//
// GET /api/reports/maintenance-calibration
//
// ?from=2026-09-01
// &to=2026-09-21
// =====================================================

const getMaintenanceCalibrationReport =
    async (
        req,
        res
    ) => {

        try {

            const loaded =
                await loadReportData(
                    req
                );

            const stationIds =
                loaded.stations.map(
                    (station) =>
                        station.station_id
                );

            let maintenance = [];
            let devices = [];
            let sensors = [];
            let calibration = [];

            // -------------------------------------------------
            // MAINTENANCE
            // -------------------------------------------------

            if (
                stationIds.length
            ) {

                maintenance =
                    await fetchAllRows(
                        supabase
                            .from(
                                "maintenance"
                            )
                            .select("*")
                            .in(
                                "station_id",
                                stationIds
                            )
                            .gte(
                                "service_date",
                                loaded.range.fromDate
                            )
                            .lte(
                                "service_date",
                                loaded.range.toDate
                            )
                            .order(
                                "service_date",
                                {
                                    ascending:
                                        false,
                                }
                            )
                    );

                // -------------------------------------------------
                // DEVICES
                // -------------------------------------------------

                const {
                    data:
                        deviceData,
                    error:
                        deviceError,
                } = await supabase
                    .from("device")
                    .select(`
                        device_id,
                        station_id,
                        gateway_id,
                        manufacturer,
                        model,
                        status
                    `)
                    .in(
                        "station_id",
                        stationIds
                    );

                if (deviceError) {
                    throw deviceError;
                }

                devices =
                    deviceData || [];

                // -------------------------------------------------
                // SENSORS
                // -------------------------------------------------

                const deviceIds =
                    devices.map(
                        (device) =>
                            device.device_id
                    );

                if (
                    deviceIds.length
                ) {

                    const {
                        data:
                            sensorData,
                        error:
                            sensorError,
                    } =
                        await supabase
                            .from(
                                "sensor"
                            )
                            .select("*")
                            .in(
                                "device_id",
                                deviceIds
                            );

                    if (sensorError) {
                        throw sensorError;
                    }

                    sensors =
                        sensorData || [];
                }

                // -------------------------------------------------
                // CALIBRATION
                // -------------------------------------------------

                const sensorIds =
                    sensors.map(
                        (sensor) =>
                            sensor.sensor_id
                    );

                if (
                    sensorIds.length
                ) {

                    calibration =
                        await fetchAllRows(
                            supabase
                                .from(
                                    "calibration"
                                )
                                .select("*")
                                .in(
                                    "sensor_id",
                                    sensorIds
                                )
                                .order(
                                    "calibration_date",
                                    {
                                        ascending:
                                            false,
                                    }
                                )
                        );
                }
            }

            // -------------------------------------------------
            // MAPS
            // -------------------------------------------------

            const stationMap =
                new Map();

            loaded.stations.forEach(
                (station) => {

                    stationMap.set(
                        Number(
                            station.station_id
                        ),
                        station
                    );
                }
            );

            const deviceMap =
                new Map();

            devices.forEach(
                (device) => {

                    deviceMap.set(
                        Number(
                            device.device_id
                        ),
                        device
                    );
                }
            );

            const sensorMap =
                new Map();

            sensors.forEach(
                (sensor) => {

                    sensorMap.set(
                        Number(
                            sensor.sensor_id
                        ),
                        sensor
                    );
                }
            );

            // -------------------------------------------------
            // MAINTENANCE DATA
            // -------------------------------------------------

            const maintenanceData =
                maintenance.map(
                    (row) => {

                        const station =
                            stationMap.get(
                                Number(
                                    row.station_id
                                )
                            );

                        const device =
                            row.device_id
                                ? deviceMap.get(
                                      Number(
                                          row.device_id
                                      )
                                  )
                                : null;

                        return {

                            ...row,

                            station_name:
                                station?.name ||
                                "N/A",

                            ward:
                                station?.ward ||
                                "N/A",

                            device_name:
                                device?.model ||
                                null,
                        };
                    }
                );

            // -------------------------------------------------
            // CALIBRATION DATA
            // -------------------------------------------------

            const calibrationData =
                calibration.map(
                    (row) => {

                        const sensor =
                            sensorMap.get(
                                Number(
                                    row.sensor_id
                                )
                            );

                        const device =
                            sensor
                                ? deviceMap.get(
                                      Number(
                                          sensor.device_id
                                      )
                                  )
                                : null;

                        const station =
                            device
                                ? stationMap.get(
                                      Number(
                                          device.station_id
                                      )
                                  )
                                : null;

                        let status =
                            "No Next Date";

                        if (
                            row.next_calibration_date
                        ) {

                            const nextDate =
                                new Date(
                                    `${row.next_calibration_date}T00:00:00${IST_OFFSET}`
                                );

                            status =
                                nextDate <
                                new Date()
                                    ? "Overdue"
                                    : "Valid";
                        }

                        return {

                            ...row,

                            sensor_type:
                                sensor?.sensor_type ||
                                null,

                            sensor_model:
                                sensor?.model ||
                                null,

                            station_id:
                                device?.station_id ||
                                null,

                            station_name:
                                station?.name ||
                                "N/A",

                            ward:
                                station?.ward ||
                                "N/A",

                            calibrationStatus:
                                status,
                        };
                    }
                );

            // -------------------------------------------------
            // SUMMARY
            // -------------------------------------------------

            const overdueMaintenance =
                maintenanceData.filter(
                    (row) =>
                        row.next_service_date &&
                        new Date(
                            `${row.next_service_date}T00:00:00${IST_OFFSET}`
                        ) <
                            new Date()
                ).length;

            const overdueCalibration =
                calibrationData.filter(
                    (row) =>
                        row.calibrationStatus ===
                        "Overdue"
                ).length;

            return res.json({

                status:
                    "success",

                from:
                    loaded.range.fromDate,

                to:
                    loaded.range.toDate,

                summary: {

                    maintenanceCount:
                        maintenanceData.length,

                    calibrationCount:
                        calibrationData.length,

                    overdueMaintenance,

                    overdueCalibration,
                },

                maintenance:
                    maintenanceData,

                calibration:
                    calibrationData,
            });

        } catch (error) {

            console.error(
                "Maintenance/calibration report error:",
                error
            );

            return res.status(
                error.statusCode || 500
            ).json({

                status:
                    "error",

                message:
                    error.message ||
                    "Failed to generate maintenance/calibration report.",
            });
        }
    };

// =====================================================
// 7. COMPLETE CUSTOM REPORT
//
// GET /api/reports/custom
//
// ?from=2026-09-01
// &to=2026-09-21
// =====================================================

const getCustomReport = async (
    req,
    res
) => {

    try {

        const loaded =
            await loadReportData(
                req
            );

        // -------------------------------------------------
        // DAILY STATION REPORT
        // -------------------------------------------------

        const dailyStationReport =
            loaded.stations.map(
                (station) => {

                    const stationReadings =
                        loaded.readings.filter(
                            (row) =>
                                Number(
                                    row.station_id
                                ) ===
                                Number(
                                    station.station_id
                                )
                        );

                    return buildStationReport(
                        station,
                        stationReadings,
                        loaded.range.fromDate,
                        loaded.range.toDate
                    );
                }
            );

        // -------------------------------------------------
        // WARD DATA
        // -------------------------------------------------

        const wardDaily =
            buildWardData(
                loaded,
                "day"
            );

        const wardMonthly =
            buildWardData(
                loaded,
                "month"
            );

        // -------------------------------------------------
        // POLLUTANT TREND
        // -------------------------------------------------

        const pollutantTrend =
            buildPollutantTrend(
                loaded
            );

        // -------------------------------------------------
        // ALERTS
        // -------------------------------------------------

        const stationIds =
            loaded.stations.map(
                (station) =>
                    station.station_id
            );

        let alerts = [];

        if (
            stationIds.length
        ) {

            alerts =
                await fetchAllRows(
                    supabase
                        .from("alert")
                        .select("*")
                        .in(
                            "station_id",
                            stationIds
                        )
                        .gte(
                            "started_time",
                            loaded.range.from
                        )
                        .lt(
                            "started_time",
                            loaded.range.toExclusive
                        )
                        .order(
                            "started_time",
                            {
                                ascending:
                                    false,
                            }
                        )
                );
        }

        const alertSummary = {

            totalAlerts:
                alerts.length,

            activeAlerts:
                alerts.filter(
                    (alert) =>
                        !alert.acknowledged_at &&
                        String(
                            alert.acknowledgement ||
                            ""
                        ).toLowerCase() !==
                        "acknowledged"
                ).length,

            acknowledgedAlerts:
                alerts.filter(
                    (alert) =>
                        alert.acknowledged_at ||
                        String(
                            alert.acknowledgement ||
                            ""
                        ).toLowerCase() ===
                        "acknowledged"
                ).length,

            bySeverity: {},
        };

        alerts.forEach(
            (alert) => {

                const severity =
                    alert.severity ||
                    "Unknown";

                alertSummary.bySeverity[
                    severity
                ] =
                    (
                        alertSummary.bySeverity[
                            severity
                        ] || 0
                    ) + 1;
            }
        );

        // -------------------------------------------------
        // DEVICES
        // -------------------------------------------------

        let devices = [];

        if (
            stationIds.length
        ) {

            const {
                data,
                error,
            } = await supabase
                .from("device")
                .select(`
                    device_id,
                    gateway_id,
                    manufacturer,
                    model,
                    firmware,
                    station_id,
                    status,
                    battery_level,
                    network_status,
                    last_seen_at,
                    is_simulated
                `)
                .in(
                    "station_id",
                    stationIds
                );

            if (error) {
                throw error;
            }

            devices =
                data || [];
        }

        // -------------------------------------------------
        // UPTIME
        // -------------------------------------------------

        const uptime =
            loaded.stations.map(
                (station) => {

                    const stationReadings =
                        loaded.readings.filter(
                            (row) =>
                                Number(
                                    row.station_id
                                ) ===
                                Number(
                                    station.station_id
                                )
                        );

                    const stationDevices =
                        devices.filter(
                            (device) =>
                                Number(
                                    device.station_id
                                ) ===
                                Number(
                                    station.station_id
                                )
                        );

                    const onlineDevices =
                        stationDevices.filter(
                            (device) => {

                                const network =
                                    String(
                                        device.network_status ||
                                        ""
                                    ).toLowerCase();

                                const status =
                                    String(
                                        device.status ||
                                        ""
                                    ).toLowerCase();

                                return (
                                    network ===
                                        "connected" ||
                                    network ===
                                        "online" ||
                                    status ===
                                        "online" ||
                                    status ===
                                        "active"
                                );
                            }
                        ).length;

                    return {

                        stationId:
                            station.station_id,

                        station:
                            station.name,

                        ward:
                            station.ward ||
                            "N/A",

                        deviceCount:
                            stationDevices.length,

                        onlineDevices,

                        offlineDevices:
                            Math.max(
                                stationDevices.length -
                                    onlineDevices,
                                0
                            ),

                        dataAvailability:
                            `${calculateAvailability(
                                stationReadings,
                                loaded.range.fromDate,
                                loaded.range.toDate
                            )}%`,

                        latestHeartbeat:
                            stationDevices
                                .map(
                                    (
                                        device
                                    ) =>
                                        device.last_seen_at
                                )
                                .filter(Boolean)
                                .sort()
                                .reverse()[0] ||
                            null,
                    };
                }
            );

        // -------------------------------------------------
        // MAINTENANCE
        // -------------------------------------------------

        let maintenance = [];

        if (
            stationIds.length
        ) {

            maintenance =
                await fetchAllRows(
                    supabase
                        .from(
                            "maintenance"
                        )
                        .select("*")
                        .in(
                            "station_id",
                            stationIds
                        )
                        .gte(
                            "service_date",
                            loaded.range.fromDate
                        )
                        .lte(
                            "service_date",
                            loaded.range.toDate
                        )
                        .order(
                            "service_date",
                            {
                                ascending:
                                    false,
                            }
                        )
                );
        }

        // -------------------------------------------------
        // SUMMARY
        // -------------------------------------------------

        const aqiValues =
            dailyStationReport
                .map(
                    (row) =>
                        row.aqi
                )
                .filter(
                    (value) =>
                        value !== null
                );

        const averageAQI =
            calculateAverage(
                aqiValues
            );

        return res.json({

            status:
                "success",

            reportPeriod: {

                from:
                    loaded.range.fromDate,

                to:
                    loaded.range.toDate,
            },

            dailyStationReport,

            wardDaily,

            wardMonthly,

            pollutantTrend,

            uptime,

            alertSummary,

            maintenance,

            alerts,

            summary: {

                totalStations:
                    dailyStationReport.length,

                stationsWithData:
                    dailyStationReport.filter(
                        (row) =>
                            row.totalReadings >
                            0
                    ).length,

                averageAQI:
                    averageAQI !== null
                        ? Number(
                              averageAQI.toFixed(
                                  2
                              )
                          )
                        : null,

                totalAlerts:
                    alerts.length,

                totalMaintenance:
                    maintenance.length,
            },
        });

    } catch (error) {

        console.error(
            "Custom report error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({

            status:
                "error",

            message:
                error.message ||
                "Failed to generate custom report.",
        });
    }
};

// =====================================================
// INTERNAL: WARD REPORT BUILDER
// =====================================================

const buildWardData = (
    loaded,
    groupBy
) => {

    const stationMap =
        new Map();

    loaded.stations.forEach(
        (station) => {

            stationMap.set(
                Number(
                    station.station_id
                ),
                station
            );
        }
    );

    const groups = {};

    loaded.readings.forEach(
        (reading) => {

            const station =
                stationMap.get(
                    Number(
                        reading.station_id
                    )
                );

            if (!station) {
                return;
            }

            const period =
                groupBy ===
                "month"
                    ? getLocalMonth(
                          reading.timestamp
                      )
                    : getLocalDate(
                          reading.timestamp
                      );

            if (!period) {
                return;
            }

            const ward =
                station.ward ||
                "Unknown";

            const key =
                `${ward}__${period}`;

            if (!groups[key]) {

                groups[key] = {

                    ward,

                    zone:
                        station.zone ||
                        "N/A",

                    period,

                    stations: {},
                };
            }

            if (
                !groups[key]
                    .stations[
                    station.station_id
                ]
            ) {

                groups[key]
                    .stations[
                    station.station_id
                ] = [];
            }

            groups[key]
                .stations[
                station.station_id
            ].push(
                reading
            );
        }
    );

    return Object.values(
        groups
    )
        .map(
            (group) => {

                const stationAQIs =
                    Object.values(
                        group.stations
                    )
                        .map(
                            (
                                readings
                            ) => {

                                const pm25 =
                                    calculateParameterAverage(
                                        readings,
                                        "pm25"
                                    );

                                const pm10 =
                                    calculateParameterAverage(
                                        readings,
                                        "pm10"
                                    );

                                const no2 =
                                    calculateParameterAverage(
                                        readings,
                                        "no2"
                                    );

                                return calculateAQI(
                                    {
                                        pm25,
                                        pm10,
                                        no2,
                                    }
                                ).aqi;
                            }
                        )
                        .filter(
                            (value) =>
                                value !==
                                null
                        );

                const averageAQI =
                    calculateAverage(
                        stationAQIs
                    );

                return {

                    ward:
                        group.ward,

                    zone:
                        group.zone,

                    period:
                        group.period,

                    stationCount:
                        Object.keys(
                            group.stations
                        ).length,

                    averageAQI:
                        averageAQI !== null
                            ? Number(
                                  averageAQI.toFixed(
                                      2
                                  )
                              )
                            : null,

                    maximumAQI:
                        stationAQIs.length
                            ? Math.max(
                                  ...stationAQIs
                              )
                            : null,

                    minimumAQI:
                        stationAQIs.length
                            ? Math.min(
                                  ...stationAQIs
                              )
                            : null,

                    category:
                        averageAQI !== null
                            ? getAQICategory(
                                  Math.round(
                                      averageAQI
                                  )
                              )
                            : "N/A",
                };
            }
        )
        .sort(
            (a, b) =>
                String(
                    a.period
                ).localeCompare(
                    String(
                        b.period
                    )
                ) ||
                String(
                    a.ward
                ).localeCompare(
                    String(
                        b.ward
                    )
                )
        );
};

// =====================================================
// INTERNAL: POLLUTANT TREND BUILDER
// =====================================================

const buildPollutantTrend = (
    loaded
) => {

    const grouped = {};

    loaded.readings.forEach(
        (reading) => {

            const parameter =
                getPollutantKey(
                    reading.parameter
                );

            const date =
                getLocalDate(
                    reading.timestamp
                );

            if (
                !parameter ||
                !date
            ) {
                return;
            }

            const key =
                `${date}__${parameter}`;

            if (!grouped[key]) {

                grouped[key] = {

                    date,

                    parameter,

                    values: [],
                };
            }

            const value =
                toNumber(
                    reading.value
                );

            if (
                value !== null
            ) {

                grouped[key]
                    .values
                    .push(
                        value
                    );
            }
        }
    );

    return Object.values(
        grouped
    )
        .map(
            (row) => {

                const average =
                    calculateAverage(
                        row.values
                    );

                return {

                    date:
                        row.date,

                    parameter:
                        row.parameter,

                    average:
                        average !== null
                            ? Number(
                                  average.toFixed(
                                      2
                                  )
                              )
                            : null,

                    minimum:
                        row.values.length
                            ? Number(
                                  Math.min(
                                      ...row.values
                                  ).toFixed(
                                      2
                                  )
                              )
                            : null,

                    maximum:
                        row.values.length
                            ? Number(
                                  Math.max(
                                      ...row.values
                                  ).toFixed(
                                      2
                                  )
                              )
                            : null,

                    samples:
                        row.values.length,
                };
            }
        )
        .sort(
            (a, b) =>
                a.date.localeCompare(
                    b.date
                ) ||
                a.parameter.localeCompare(
                    b.parameter
                )
        );
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {

    // Daily station report
    getReportData,

    // Ward daily/monthly
    getWardAQIReport,

    // Pollutant trend
    getPollutantTrendReport,

    // Uptime and availability
    getUptimeReport,

    // Alerts
    getAlertReport,

    // Maintenance + calibration
    getMaintenanceCalibrationReport,

    // Complete custom report
    getCustomReport,
};