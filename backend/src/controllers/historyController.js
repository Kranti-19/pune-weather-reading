const supabase = require("../config/supabase");

// =====================================================
// AQI CATEGORY
// =====================================================

const getAqiCategory = (aqi) => {
    const value = Number(aqi) || 0;

    if (value <= 50) return "Good";
    if (value <= 100) return "Satisfactory";
    if (value <= 200) return "Moderate";
    if (value <= 300) return "Poor";
    if (value <= 400) return "Very Poor";

    return "Severe";
};

// =====================================================
// GET HISTORICAL AQI CALENDAR
//
// GET /api/history/calendar?year=2026&month=9
// GET /api/history/calendar?year=2026&month=9&stationId=1
// =====================================================

const getHistoricalCalendar = async (req, res) => {
    try {
        const year = Number(req.query.year);
        const month = Number(req.query.month);
        const stationId = req.query.stationId;

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (
            !Number.isInteger(year) ||
            year < 2000 ||
            year > 2100
        ) {
            return res.status(400).json({
                status: "error",
                message: "Valid year is required.",
            });
        }

        if (
            !Number.isInteger(month) ||
            month < 1 ||
            month > 12
        ) {
            return res.status(400).json({
                status: "error",
                message: "Month must be between 1 and 12.",
            });
        }

        // -------------------------------------------------
        // DATE RANGE
        // Pune timezone = IST (+05:30)
        // -------------------------------------------------

        const startDate = new Date(
            `${year}-${String(month).padStart(2, "0")}-01T00:00:00+05:30`
        );

        const endDate =
            month === 12
                ? new Date(
                      `${year + 1}-01-01T00:00:00+05:30`
                  )
                : new Date(
                      `${year}-${String(month + 1).padStart(
                          2,
                          "0"
                      )}-01T00:00:00+05:30`
                  );

        // -------------------------------------------------
        // FETCH AQI HISTORY
        // -------------------------------------------------

        let query = supabase
            .from("aqi_reading")
            .select(`
                aqi_id,
                station_id,
                timestamp,
                aqi,
                category,
                dominant_pollutant
            `)
            .gte("timestamp", startDate.toISOString())
            .lt("timestamp", endDate.toISOString())
            .order("timestamp", {
                ascending: true,
            });

        // Optional station filter
        if (stationId) {
            query = query.eq(
                "station_id",
                Number(stationId)
            );
        }

        const {
            data: rows,
            error,
        } = await query;

        if (error) {
            throw error;
        }

        // -------------------------------------------------
        // GROUP AQI BY LOCAL DATE
        // -------------------------------------------------

        const dailyMap = {};

        for (const row of rows || []) {
            if (!row.timestamp) continue;

            const date = new Date(row.timestamp);

            // Convert timestamp to Pune/IST date
            const dateKey = new Intl.DateTimeFormat(
                "en-CA",
                {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                }
            ).format(date);

            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = {
                    date: dateKey,
                    values: [],
                    stations: new Set(),
                    dominantPollutants: [],
                };
            }

            const aqi = Number(row.aqi);

            if (Number.isFinite(aqi)) {
                dailyMap[dateKey].values.push(aqi);
            }

            if (row.station_id !== null) {
                dailyMap[dateKey].stations.add(
                    row.station_id
                );
            }

            if (row.dominant_pollutant) {
                dailyMap[
                    dateKey
                ].dominantPollutants.push(
                    row.dominant_pollutant
                );
            }
        }

        // -------------------------------------------------
        // CREATE DAILY RESULTS
        // -------------------------------------------------

        const days = Object.values(dailyMap)
            .map((day) => {
                const values = day.values;

                if (!values.length) {
                    return {
                        date: day.date,
                        aqi: null,
                        category: "No Data",
                        observationCount: 0,
                        stationCount: day.stations.size,
                    };
                }

                const averageAqi =
                    values.reduce(
                        (sum, value) =>
                            sum + value,
                        0
                    ) / values.length;

                const roundedAqi =
                    Math.round(averageAqi);

                return {
                    date: day.date,
                    aqi: roundedAqi,
                    category:
                        getAqiCategory(
                            roundedAqi
                        ),
                    observationCount:
                        values.length,
                    stationCount:
                        day.stations.size,
                };
            })
            .sort((a, b) =>
                a.date.localeCompare(b.date)
            );

        // -------------------------------------------------
        // CALENDAR SUMMARY
        // -------------------------------------------------

        const aqiValues = days
            .map((day) => day.aqi)
            .filter(
                (value) =>
                    value !== null &&
                    Number.isFinite(value)
            );

        const monthlyAverage =
            aqiValues.length
                ? Math.round(
                      aqiValues.reduce(
                          (sum, value) =>
                              sum + value,
                          0
                      ) / aqiValues.length
                  )
                : null;

        const highestDay =
            days
                .filter(
                    (day) =>
                        day.aqi !== null
                )
                .sort(
                    (a, b) =>
                        b.aqi - a.aqi
                )[0] || null;

        const lowestDay =
            days
                .filter(
                    (day) =>
                        day.aqi !== null
                )
                .sort(
                    (a, b) =>
                        a.aqi - b.aqi
                )[0] || null;

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({
            status: "success",

            data: {
                year,
                month,

                monthlyAverage,

                highestDay,

                lowestDay,

                totalDaysWithData:
                    days.length,

                days,
            },
        });
    } catch (error) {
        console.error(
            "Historical calendar error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                error.message ||
                "Failed to load historical AQI data.",
        });
    }
};



// =====================================================
// GET AQI FOR SPECIFIC DATE - STATION WISE
//
// GET /api/history/day?date=2026-09-15
// GET /api/history/day?date=2026-09-15&stationId=1
// =====================================================

const getHistoricalDay = async (req, res) => {
    try {
        const { date, stationId } = req.query;

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!date) {
            return res.status(400).json({
                status: "error",
                message: "Date is required.",
            });
        }

        // Validate YYYY-MM-DD
        const dateRegex =
            /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(date)) {
            return res.status(400).json({
                status: "error",
                message:
                    "Date must be in YYYY-MM-DD format.",
            });
        }

        // -------------------------------------------------
        // DATE RANGE
        // Pune timezone = Asia/Kolkata
        // -------------------------------------------------

        const startDate = new Date(
            `${date}T00:00:00+05:30`
        );

        const nextDay = new Date(
            startDate.getTime() +
                24 * 60 * 60 * 1000
        );

        // -------------------------------------------------
        // FETCH AQI DATA
        // -------------------------------------------------

        let query = supabase
            .from("aqi_reading")
            .select(`
                aqi_id,
                station_id,
                timestamp,
                aqi,
                category,
                dominant_pollutant
            `)
            .gte(
                "timestamp",
                startDate.toISOString()
            )
            .lt(
                "timestamp",
                nextDay.toISOString()
            )
            .order("station_id", {
                ascending: true,
            })
            .order("timestamp", {
                ascending: true,
            });

        // Optional station filter
        if (stationId) {
            const numericStationId =
                Number(stationId);

            if (
                !Number.isInteger(
                    numericStationId
                )
            ) {
                return res.status(400).json({
                    status: "error",
                    message:
                        "stationId must be a valid number.",
                });
            }

            query = query.eq(
                "station_id",
                numericStationId
            );
        }

        const {
            data: rows,
            error,
        } = await query;

        if (error) {
            throw error;
        }

        // -------------------------------------------------
        // FETCH STATION DETAILS
        // -------------------------------------------------

        const stationIds = [
            ...new Set(
                (rows || [])
                    .map(
                        (row) =>
                            row.station_id
                    )
                    .filter(
                        (id) =>
                            id !== null &&
                            id !== undefined
                    )
            ),
        ];

        let stationMap = {};

        if (stationIds.length > 0) {
            const {
                data: stationRows,
                error: stationError,
            } = await supabase
                .from("station")
                .select(`
                    station_id,
                    name,
                    ward,
                    zone,
                    status
                `)
                .in(
                    "station_id",
                    stationIds
                );

            if (stationError) {
                throw stationError;
            }

            for (
                const station
                of stationRows || []
            ) {
                stationMap[
                    String(
                        station.station_id
                    )
                ] = station;
            }
        }

        // -------------------------------------------------
        // GROUP BY STATION
        // -------------------------------------------------

        const stationMapData = {};

        for (
            const row
            of rows || []
        ) {

            if (
                row.station_id === null ||
                row.station_id === undefined
            ) {
                continue;
            }

            const key =
                String(
                    row.station_id
                );

            if (
                !stationMapData[key]
            ) {
                stationMapData[key] = {
                    stationId:
                        row.station_id,

                    values: [],

                    dominantPollutants: [],

                    latestTimestamp:
                        null,
                };
            }

            const aqi =
                Number(row.aqi);

            if (
                Number.isFinite(aqi)
            ) {
                stationMapData[
                    key
                ].values.push(aqi);
            }

            if (
                row.dominant_pollutant
            ) {
                stationMapData[
                    key
                ].dominantPollutants.push(
                    row.dominant_pollutant
                );
            }

            if (
                row.timestamp
            ) {
                const currentTimestamp =
                    new Date(
                        row.timestamp
                    );

                const previousTimestamp =
                    stationMapData[key]
                        .latestTimestamp
                        ? new Date(
                              stationMapData[
                                  key
                              ]
                                  .latestTimestamp
                          )
                        : null;

                if (
                    !previousTimestamp ||
                    currentTimestamp >
                        previousTimestamp
                ) {
                    stationMapData[
                        key
                    ].latestTimestamp =
                        row.timestamp;
                }
            }
        }

        // -------------------------------------------------
        // FIND MOST COMMON DOMINANT POLLUTANT
        // -------------------------------------------------

        const getDominantPollutant =
            (pollutants) => {

                if (
                    !pollutants ||
                    !pollutants.length
                ) {
                    return null;
                }

                const counts = {};

                pollutants.forEach(
                    (pollutant) => {
                        const key =
                            String(
                                pollutant
                            );

                        counts[key] =
                            (counts[key] ||
                                0) + 1;
                    }
                );

                return Object.entries(
                    counts
                ).sort(
                    (a, b) =>
                        b[1] - a[1]
                )[0][0];
            };

        // -------------------------------------------------
        // CREATE STATION-WISE RESULT
        // -------------------------------------------------

        const stations =
            Object.values(
                stationMapData
            )
                .map(
                    (stationData) => {

                        const values =
                            stationData.values;

                        const station =
                            stationMap[
                                String(
                                    stationData.stationId
                                )
                            ] || {};

                        if (
                            !values.length
                        ) {
                            return {
                                stationId:
                                    stationData.stationId,

                                station:
                                    station.name ||
                                    "Unknown Station",

                                ward:
                                    station.ward ||
                                    null,

                                zone:
                                    station.zone ||
                                    null,

                                status:
                                    station.status ||
                                    null,

                                aqi: null,

                                category:
                                    "No Data",

                                dominant:
                                    getDominantPollutant(
                                        stationData
                                            .dominantPollutants
                                    ),

                                observationCount:
                                    0,

                                latestTimestamp:
                                    stationData
                                        .latestTimestamp,
                            };
                        }

                        const averageAqi =
                            values.reduce(
                                (
                                    sum,
                                    value
                                ) =>
                                    sum +
                                    value,
                                0
                            ) /
                            values.length;

                        const roundedAqi =
                            Math.round(
                                averageAqi
                            );

                        return {
                            stationId:
                                stationData.stationId,

                            station:
                                station.name ||
                                "Unknown Station",

                            ward:
                                station.ward ||
                                null,

                            zone:
                                station.zone ||
                                null,

                            status:
                                station.status ||
                                null,

                            aqi:
                                roundedAqi,

                            category:
                                getAqiCategory(
                                    roundedAqi
                                ),

                            dominant:
                                getDominantPollutant(
                                    stationData
                                        .dominantPollutants
                                ),

                            observationCount:
                                values.length,

                            latestTimestamp:
                                stationData
                                    .latestTimestamp,
                        };
                    }
                )
                .sort(
                    (a, b) => {

                        if (
                            a.aqi === null
                        ) {
                            return 1;
                        }

                        if (
                            b.aqi === null
                        ) {
                            return -1;
                        }

                        return (
                            b.aqi -
                            a.aqi
                        );
                    }
                );

        // -------------------------------------------------
        // DAILY OVERALL AQI
        // -------------------------------------------------

        const allValues =
            stations
                .map(
                    (station) =>
                        station.aqi
                )
                .filter(
                    (value) =>
                        value !== null &&
                        Number.isFinite(
                            value
                        )
                );

        const overallAqi =
            allValues.length
                ? Math.round(
                      allValues.reduce(
                          (
                              sum,
                              value
                          ) =>
                              sum +
                              value,
                          0
                      ) /
                          allValues.length
                  )
                : null;

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({
            status: "success",

            data: {
                date,

                overallAqi,

                overallCategory:
                    overallAqi !== null
                        ? getAqiCategory(
                              overallAqi
                          )
                        : "No Data",

                totalStations:
                    stations.length,

                stations,
            },
        });

    } catch (error) {

        console.error(
            "Historical day AQI error:",
            error
        );

        return res.status(500).json({
            status: "error",

            message:
                error.message ||
                "Failed to load station-wise AQI.",
        });
    }
};

module.exports = {
    getHistoricalCalendar,
    getHistoricalDay
};