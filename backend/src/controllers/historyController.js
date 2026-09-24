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
// GET AQI TREND
//
// GET /api/history/trend?range=7d
// GET /api/history/trend?range=30d
// GET /api/history/trend?from=2026-09-01&to=2026-09-23
// GET /api/history/trend?range=7d&stationId=1
// =====================================================

const getAqiTrend = async (req, res) => {
    try {
        const { range, from, to, stationId } = req.query;

        // -------------------------------------------------
        // DETERMINE DATE RANGE
        // -------------------------------------------------

        let startDate;
        let endDate;

        const now = new Date();

        if (range === "7d") {
            // Last 7 calendar days including today
            endDate = now;

            startDate = new Date(
                now.getTime() - 6 * 24 * 60 * 60 * 1000
            );
        } else if (range === "30d") {
            // Last 30 calendar days including today
            endDate = now;

            startDate = new Date(
                now.getTime() - 29 * 24 * 60 * 60 * 1000
            );
        } else if (from && to) {
            // -------------------------------------------------
            // CUSTOM RANGE
            // -------------------------------------------------

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

            if (!dateRegex.test(from) || !dateRegex.test(to)) {
                return res.status(400).json({
                    status: "error",
                    message: "Dates must be in YYYY-MM-DD format."
                });
            }

            startDate = new Date(
                `${from}T00:00:00+05:30`
            );

            // End date is exclusive, so add one day
            const requestedEndDate = new Date(
                `${to}T00:00:00+05:30`
            );

            if (requestedEndDate < startDate) {
                return res.status(400).json({
                    status: "error",
                    message: "The 'to' date must be after the 'from' date."
                });
            }

            endDate = new Date(
                requestedEndDate.getTime() +
                24 * 60 * 60 * 1000
            );
        } else {
            return res.status(400).json({
                status: "error",
                message:
                    "Provide range=7d, range=30d, or both from and to dates."
            });
        }

        // -------------------------------------------------
        // LIMIT CUSTOM RANGE
        // -------------------------------------------------

        const differenceInDays =
            Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                (24 * 60 * 60 * 1000)
            );

        if (differenceInDays > 366) {
            return res.status(400).json({
                status: "error",
                message: "Maximum trend range is 366 days."
            });
        }

        // -------------------------------------------------
        // FETCH AQI READINGS FROM SUPABASE
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
                endDate.toISOString()
            )
            .order("timestamp", {
                ascending: true
            });

        // Optional station filter
        if (stationId) {
            const numericStationId = Number(stationId);

            if (!Number.isInteger(numericStationId)) {
                return res.status(400).json({
                    status: "error",
                    message: "stationId must be a valid number."
                });
            }

            query = query.eq(
                "station_id",
                numericStationId
            );
        }

        const {
            data: rows,
            error
        } = await query;

        if (error) {
            throw error;
        }

        // -------------------------------------------------
        // GROUP READINGS BY IST DATE
        // -------------------------------------------------

        const dailyMap = {};

        for (const row of rows || []) {
            if (!row.timestamp) continue;

            const aqi = Number(row.aqi);

            if (
                !Number.isFinite(aqi) ||
                aqi <= 0
            ) {
                continue;
            }

            const date = new Date(row.timestamp);

            const dateKey = new Intl.DateTimeFormat(
                "en-CA",
                {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                }
            ).format(date);

            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = {
                    date: dateKey,
                    values: [],
                    stations: new Set()
                };
            }

            dailyMap[dateKey].values.push(aqi);

            if (
                row.station_id !== null &&
                row.station_id !== undefined
            ) {
                dailyMap[dateKey].stations.add(
                    row.station_id
                );
            }
        }

        // -------------------------------------------------
        // CREATE DAILY TREND
        // -------------------------------------------------

        const data = Object.values(dailyMap)
            .map((day) => {
                const values = day.values;

                if (!values.length) {
                    return {
                        date: day.date,
                        aqi: null,
                        category: "No Data",
                        stationCount: 0,
                        observationCount: 0
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
                    stationCount:
                        day.stations.size,
                    observationCount:
                        values.length
                };
            })
            .sort((a, b) =>
                a.date.localeCompare(b.date)
            );

        // -------------------------------------------------
        // SUMMARY
        // -------------------------------------------------

        const validDays = data.filter(
            (day) =>
                day.aqi !== null &&
                Number.isFinite(day.aqi)
        );

        const aqiValues = validDays.map(
            (day) => day.aqi
        );

        const average =
            aqiValues.length
                ? Math.round(
                    aqiValues.reduce(
                        (sum, value) =>
                            sum + value,
                        0
                    ) / aqiValues.length
                )
                : null;

        const highest =
            validDays.length
                ? validDays.reduce(
                    (max, day) =>
                        day.aqi > max.aqi
                            ? day
                            : max
                )
                : null;

        const lowest =
            validDays.length
                ? validDays.reduce(
                    (min, day) =>
                        day.aqi < min.aqi
                            ? day
                            : min
                )
                : null;

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({
            status: "success",

            data: {
                range:
                    range ||
                    "custom",

                from:
                    data.length
                        ? data[0].date
                        : from || null,

                to:
                    data.length
                        ? data[data.length - 1].date
                        : to || null,

                trend: data,

                summary: {
                    average,
                    highest,
                    lowest,
                    daysWithData:
                        validDays.length
                }
            }
        });

    } catch (error) {
        console.error(
            "AQI trend error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                error.message ||
                "Failed to load AQI trend."
        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getAqiTrend
};