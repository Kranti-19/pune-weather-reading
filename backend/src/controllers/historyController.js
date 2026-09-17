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

module.exports = {
    getHistoricalCalendar,
};