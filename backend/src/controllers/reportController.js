const supabase = require("../config/supabase");

// =====================================================
// GET REPORT DATA
// GET /api/reports
// GET /api/reports?stationId=1&date=2026-09-03
// =====================================================

const getReportData = async (req, res) => {
    try {
        const {
            stationId = "ALL",
            date
        } = req.query;

        const observationDate =
            date ||
            new Date()
                .toISOString()
                .split("T")[0];

        // =================================================
        // 1. GET STATIONS
        // =================================================

        const {
            data: stations,
            error: stationError
        } = await supabase
            .from("station")
            .select("*")
            .order("station_id", {
                ascending: true
            });

        if (stationError) {
            throw stationError;
        }

        let selectedStations =
            stations || [];

        if (stationId !== "ALL") {
            selectedStations =
                selectedStations.filter(
                    (station) =>
                        String(
                            station.station_id
                        ) ===
                        String(stationId)
                );
        }

        const stationIds =
            selectedStations.map(
                (station) =>
                    station.station_id
            );

        // =================================================
        // 2. GET READINGS FOR SELECTED DATE
        // =================================================

        const startDate =
            `${observationDate}T00:00:00`;

        const endDate =
            `${observationDate}T23:59:59`;

        const {
            data: readings,
            error: readingError
        } = await supabase
            .from("reading")
            .select("*")
            .in(
                "station_id",
                stationIds.length
                    ? stationIds
                    : [-1]
            )
            .gte(
                "timestamp",
                startDate
            )
            .lte(
                "timestamp",
                endDate
            )
            .order("timestamp", {
                ascending: false
            });

        if (readingError) {
            throw readingError;
        }

        // =================================================
        // 3. GET AQI
        // =================================================

        const {
            data: aqiRows,
            error: aqiError
        } = await supabase
            .from("aqi_reading")
            .select("*")
            .in(
                "station_id",
                stationIds.length
                    ? stationIds
                    : [-1]
            )
            .gte(
                "timestamp",
                startDate
            )
            .lte(
                "timestamp",
                endDate
            )
            .order("timestamp", {
                ascending: false
            });

        if (aqiError) {
            throw aqiError;
        }

        // =================================================
        // 4. CREATE REPORT FOR EACH STATION
        // =================================================

        const reports =
            selectedStations.map(
                (station) => {

                    const stationReadings =
                        (readings || []).filter(
                            (row) =>
                                row.station_id ===
                                station.station_id
                        );

                    const stationAqi =
                        (aqiRows || []).filter(
                            (row) =>
                                row.station_id ===
                                station.station_id
                        );

                    // -----------------------------
                    // Average pollutant
                    // -----------------------------

                    const averageParameter =
                        (parameters) => {

                            const values =
                                stationReadings
                                    .filter(
                                        (row) =>
                                            parameters.includes(
                                                row.parameter
                                                    ?.toLowerCase()
                                                    .trim()
                                            )
                                    )
                                    .map(
                                        (row) =>
                                            Number(
                                                row.value
                                            )
                                    )
                                    .filter(
                                        (value) =>
                                            !Number.isNaN(
                                                value
                                            )
                                    );

                            if (
                                values.length ===
                                0
                            ) {
                                return null;
                            }

                            return (
                                values.reduce(
                                    (
                                        sum,
                                        value
                                    ) =>
                                        sum +
                                        value,
                                    0
                                ) /
                                values.length
                            );
                        };

                    const pm25 =
                        averageParameter([
                            "pm2.5",
                            "pm25"
                        ]);

                    const pm10 =
                        averageParameter([
                            "pm10"
                        ]);

                    const no2 =
                        averageParameter([
                            "no2",
                            "no₂"
                        ]);

                    // -----------------------------
                    // Latest AQI
                    // -----------------------------

                    const latestAqi =
                        stationAqi.length > 0
                            ? stationAqi[0]
                            : null;

                    // -----------------------------
                    // Data availability
                    // -----------------------------

                    const validReadings =
                        stationReadings.filter(
                            (row) =>
                                row.quality_flag
                                    ?.toLowerCase() ===
                                "valid"
                        ).length;

                    const totalReadings =
                        stationReadings.length;

                    const availability =
                        totalReadings > 0
                            ? (
                                  (validReadings /
                                      totalReadings) *
                                  100
                              ).toFixed(1)
                            : "0.0";

                    // -----------------------------
                    // Compliance
                    // -----------------------------

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

                        pm25:
                            pm25 !== null
                                ? Number(
                                      pm25.toFixed(
                                          2
                                      )
                                  )
                                : null,

                        pm10:
                            pm10 !== null
                                ? Number(
                                      pm10.toFixed(
                                          2
                                      )
                                  )
                                : null,

                        no2:
                            no2 !== null
                                ? Number(
                                      no2.toFixed(
                                          2
                                      )
                                  )
                                : null,

                        aqi:
                            latestAqi
                                ? Number(
                                      latestAqi.aqi
                                  )
                                : null,

                        category:
                            latestAqi
                                ?.category ||
                            "N/A",

                        dominant:
                            latestAqi
                                ?.dominant_pollutant ||
                            "N/A",

                        availability:
                            `${availability}%`,

                        compliance:
                            exceeded
                                ? "Action Triggered"
                                : "Compliant"
                    };
                }
            );

        // =================================================
        // 5. RETURN
        // =================================================

        return res.status(200).json({

            status: "success",

            observationDate,

            count:
                reports.length,

            data:
                reports
        });

    } catch (error) {

        console.error(
            "Report API error:",
            error
        );

        return res.status(500).json({

            status: "error",

            message:
                error.message ||
                "Failed to generate report."
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getReportData
};