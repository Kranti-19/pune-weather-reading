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

        let startDate;
        let endDate;

        // Current time
        const now = new Date();

        // -------------------------------------------------
        // DETERMINE DATE RANGE
        // -------------------------------------------------

        if (range === "7d") {
            // Include today + previous 6 calendar days
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            startDate.setDate(startDate.getDate() - 6);

            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);

        } else if (range === "30d") {
            // Include today + previous 29 calendar days
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            startDate.setDate(startDate.getDate() - 29);

            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);

        } else if (from && to) {

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

            if (!dateRegex.test(from) || !dateRegex.test(to)) {
                return res.status(400).json({
                    status: "error",
                    message: "Dates must be in YYYY-MM-DD format."
                });
            }

            // Treat custom dates as IST calendar dates
            startDate = new Date(`${from}T00:00:00+05:30`);

            endDate = new Date(`${to}T23:59:59.999+05:30`);

            if (endDate < startDate) {
                return res.status(400).json({
                    status: "error",
                    message: "The 'to' date must be after the 'from' date."
                });
            }

        } else {
            return res.status(400).json({
                status: "error",
                message:
                    "Provide range=7d, range=30d, or both from and to dates."
            });
        }

        // -------------------------------------------------
        // DEBUG DATE RANGE
        // -------------------------------------------------

        console.log("========================================");
        console.log("AQI TREND REQUEST");
        console.log("range:", range);
        console.log("from:", from);
        console.log("to:", to);
        console.log("startDate:", startDate.toISOString());
        console.log("endDate:", endDate.toISOString());
        console.log("stationId:", stationId);
        console.log("========================================");

 // -------------------------------------------------
// FETCH AQI READINGS FROM SUPABASE
// -------------------------------------------------

const PAGE_SIZE = 1000;

let rows = [];

for (let fromIndex = 0; ; fromIndex += PAGE_SIZE) {

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
        .lte(
            "timestamp",
            endDate.toISOString()
        )
        .order("timestamp", {
            ascending: true
        })
        .order("aqi_id", {
            ascending: true
        })
        .range(
            fromIndex,
            fromIndex + PAGE_SIZE - 1
        );

    // Optional station filter
    if (stationId) {

        const numericStationId =
            Number(stationId);

        if (!Number.isInteger(numericStationId)) {
            return res.status(400).json({
                status: "error",
                message:
                    "stationId must be a valid number."
            });
        }

        query = query.eq(
            "station_id",
            numericStationId
        );
    }

    const {
        data: batchRows,
        error
    } = await query;

    if (error) {
        throw error;
    }

    const currentRows =
        batchRows || [];

    rows.push(
        ...currentRows
    );

    console.log(
        `AQI TREND PAGE ${
            fromIndex / PAGE_SIZE + 1
        }: ${currentRows.length} rows`
    );

    // Last page
    if (
        currentRows.length <
        PAGE_SIZE
    ) {
        break;
    }
}

console.log(
    "========================================"
);

console.log(
    "TOTAL AQI TREND ROWS:",
    rows.length
);

if (rows.length > 0) {

    console.log(
        "FIRST AQI ROW:",
        rows[0]
    );

    console.log(
        "LAST AQI ROW:",
        rows[rows.length - 1]
    );
}

console.log(
    "========================================"
);

        // -------------------------------------------------
        // GROUP BY IST DATE
        // -------------------------------------------------

        const dailyMap = {};

        for (const row of rows || []) {

            if (!row.timestamp) {
                continue;
            }

            const aqi = Number(row.aqi);

            if (!Number.isFinite(aqi) || aqi <= 0) {
                continue;
            }

            const dateKey = new Intl.DateTimeFormat(
                "en-CA",
                {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                }
            ).format(new Date(row.timestamp));

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
                    Number(row.station_id)
                );
            }
        }

        // -------------------------------------------------
        // CREATE DAILY TREND
        // -------------------------------------------------

        const data = Object.values(dailyMap)
            .map((day) => {

                const averageAqi =
                    day.values.reduce(
                        (sum, value) => sum + value,
                        0
                    ) / day.values.length;

                const roundedAqi =
                    Math.round(averageAqi);

                return {
                    date: day.date,
                    aqi: roundedAqi,
                    category: getAqiCategory(roundedAqi),
                    stationCount: day.stations.size,
                    observationCount: day.values.length
                };
            })
            .sort((a, b) =>
                a.date.localeCompare(b.date)
            );

        // -------------------------------------------------
        // SUMMARY
        // -------------------------------------------------

        const aqiValues =
            data.map(day => day.aqi);

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
            data.length
                ? data.reduce(
                    (max, day) =>
                        day.aqi > max.aqi
                            ? day
                            : max
                )
                : null;

        const lowest =
            data.length
                ? data.reduce(
                    (min, day) =>
                        day.aqi < min.aqi
                            ? day
                            : min
                )
                : null;

        return res.status(200).json({
            status: "success",

            data: {
                range: range || "custom",

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
                    daysWithData: data.length
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