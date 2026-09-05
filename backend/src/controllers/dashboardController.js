// backend/src/controllers/dashboardController.js

const supabase = require("../config/supabase");

// =====================================================
// GET DASHBOARD
// GET /api/dashboard
// GET /api/dashboard?area=Baner&range=24h
// =====================================================

const getDashboard = async (req, res) => {
    try {
        const { area, range = "24h" } = req.query;

        // =================================================
        // 1. GET STATIONS
        // =================================================

        const { data: allStations, error: stationError } =
            await supabase
                .from("station")
                .select("*")
                .order("station_id", { ascending: true });

        if (stationError) {
            throw stationError;
        }

        let stations = allStations || [];

        // Area filtering
        if (area) {
            const search = area.trim().toLowerCase();

            stations = stations.filter((station) => {
                const name =
                    station.name?.toLowerCase() || "";

                const ward =
                    station.ward?.toLowerCase() || "";

                const zone =
                    station.zone?.toLowerCase() || "";

                return (
                    name.includes(search) ||
                    ward.includes(search) ||
                    zone.includes(search)
                );
            });
        }

        const stationIds = stations.map(
            (station) => station.station_id
        );

        // =================================================
        // 2. GET AQI READINGS
        // =================================================

        const { data: aqiRows, error: aqiError } =
            await supabase
                .from("aqi_reading")
                .select("*")
                .order("timestamp", {
                    ascending: false
                })
                .limit(5000);

        if (aqiError) {
            throw aqiError;
        }

        // Latest AQI per station
        const latestAqiByStation = {};

        for (const row of aqiRows || []) {
            if (!latestAqiByStation[row.station_id]) {
                latestAqiByStation[row.station_id] = row;
            }
        }

        // =================================================
        // 3. GET SENSOR DATA
        // =================================================

        const { data: sensors, error: sensorError } =
            await supabase
                .from("sensor")
                .select("*");

        if (sensorError) {
            throw sensorError;
        }

        // =================================================
        // 4. GET ALERTS
        // =================================================

        const { data: alerts, error: alertError } =
            await supabase
                .from("alert")
                .select("*")
                .order("started_time", {
                    ascending: false
                });

        if (alertError) {
            throw alertError;
        }

        const selectedAlerts = (alerts || []).filter(
            (alert) =>
                stationIds.includes(alert.station_id)
        );

        const activeAlerts = selectedAlerts.filter(
            (alert) =>
                !alert.acknowledgement
        );

        // =================================================
        // 5. GET POLLUTANT READINGS
        // =================================================

        const { data: readings, error: readingError } =
            await supabase
                .from("reading")
                .select("*")
                .order("timestamp", {
                    ascending: false
                })
                .limit(10000);

        if (readingError) {
            throw readingError;
        }

        const selectedReadings = (readings || []).filter(
            (row) =>
                stationIds.includes(row.station_id)
        );

        // =================================================
        // 6. GET WEATHER READINGS
        // =================================================

        const { data: weatherRows, error: weatherError } =
            await supabase
                .from("weather_readings")
                .select(`
                    id,
                    site_id,
                    temperature,
                    humidity,
                    wind_speed,
                    wind_direction,
                    rainfall,
                    pressure,
                    recorded_at,
                    sites (
                        id,
                        site_name,
                        location,
                        latitude,
                        longitude,
                        site_type,
                        status
                    )
                `)
                .order("recorded_at", {
                    ascending: false
                })
                .limit(5000);

        if (weatherError) {
            throw weatherError;
        }

        // =================================================
        // 7. LATEST WEATHER PER SITE
        // =================================================

        const latestWeatherBySite = {};

        for (const row of weatherRows || []) {
            if (!latestWeatherBySite[row.site_id]) {
                latestWeatherBySite[row.site_id] = row;
            }
        }

        let latestWeather =
            Object.values(latestWeatherBySite);

        // Match weather sites with selected station/area
        if (area) {
            const search = area.trim().toLowerCase();

            latestWeather = latestWeather.filter(
                (row) => {
                    const siteName =
                        row.sites?.site_name
                            ?.toLowerCase() || "";

                    const location =
                        row.sites?.location
                            ?.toLowerCase() || "";

                    return (
                        siteName.includes(search) ||
                        location.includes(search)
                    );
                }
            );

            // Fallback: match selected station names
            if (latestWeather.length === 0) {
                const stationNames = stations.map(
                    (station) =>
                        station.name?.toLowerCase() || ""
                );

                latestWeather =
                    Object.values(
                        latestWeatherBySite
                    ).filter((row) => {
                        const siteName =
                            row.sites?.site_name
                                ?.toLowerCase() || "";

                        return stationNames.some(
                            (stationName) =>
                                siteName.includes(
                                    stationName
                                ) ||
                                stationName.includes(
                                    siteName
                                )
                        );
                    });
            }
        }

        // =================================================
        // 8. WEATHER AVERAGES
        // =================================================

        const weather = {
            temp: null,
            humidity: null,
            wind: null,
            pressure: null,
            windDirection: null,
            rainfall: null
        };

        if (latestWeather.length > 0) {

            const average = (values) => {
                const validValues = values
                    .map(Number)
                    .filter(
                        (value) =>
                            !Number.isNaN(value)
                    );

                if (validValues.length === 0) {
                    return null;
                }

                return (
                    validValues.reduce(
                        (sum, value) =>
                            sum + value,
                        0
                    ) / validValues.length
                );
            };

            const temperature = average(
                latestWeather.map(
                    (row) => row.temperature
                )
            );

            const humidity = average(
                latestWeather.map(
                    (row) => row.humidity
                )
            );

            const windSpeed = average(
                latestWeather.map(
                    (row) => row.wind_speed
                )
            );

            const pressure = average(
                latestWeather.map(
                    (row) => row.pressure
                )
            );

            const windDirection = average(
                latestWeather.map(
                    (row) => row.wind_direction
                )
            );

            const rainfall = average(
                latestWeather.map(
                    (row) => row.rainfall
                )
            );

            if (temperature !== null) {
                weather.temp =
                    `${temperature.toFixed(1)} °C`;
            }

            if (humidity !== null) {
                weather.humidity =
                    `${humidity.toFixed(0)} %`;
            }

            if (windSpeed !== null) {
                weather.wind =
                    `${windSpeed.toFixed(1)} m/s`;
            }

            if (pressure !== null) {
                weather.pressure =
                    `${pressure.toFixed(1)} hPa`;
            }

            if (windDirection !== null) {
                weather.windDirection =
                    `${windDirection.toFixed(0)}°`;
            }

            if (rainfall !== null) {
                weather.rainfall =
                    `${rainfall.toFixed(1)} mm`;
            }
        }

        // =================================================
        // 9. CITY / AREA AQI
        // =================================================

        const selectedAqiRows = Object.values(
            latestAqiByStation
        ).filter((row) =>
            stationIds.includes(row.station_id)
        );

        let cityAqi = 0;

        if (selectedAqiRows.length > 0) {
            const total = selectedAqiRows.reduce(
                (sum, row) =>
                    sum + Number(row.aqi || 0),
                0
            );

            cityAqi = Math.round(
                total / selectedAqiRows.length
            );
        }

        const currentAqiRow =
            selectedAqiRows.length > 0
                ? selectedAqiRows.reduce(
                      (latest, row) => {
                          if (!latest) return row;

                          return new Date(
                              row.timestamp
                          ) >
                              new Date(
                                  latest.timestamp
                              )
                              ? row
                              : latest;
                      },
                      null
                  )
                : null;

        const currentAqi = area
            ? Number(currentAqiRow?.aqi || 0)
            : cityAqi;

        // =================================================
        // 10. DOMINANT POLLUTANT
        // =================================================

        let dominant =
            currentAqiRow?.dominant_pollutant ||
            "N/A";

        // =================================================
        // 11. ACTIVE STATIONS
        // =================================================

        const totalStations =
            stations.length;

        const onlineStations =
            stations.filter((station) => {
                const status =
                    station.status
                        ?.toLowerCase();

                return (
                    status === "online" ||
                    status === "active"
                );
            }).length;

        const offlineStations =
            totalStations -
            onlineStations;

        const dataAvailability =
            totalStations > 0
                ? (
                      (onlineStations /
                          totalStations) *
                      100
                  ).toFixed(1)
                : "0.0";

        // =================================================
        // 12. CRITICAL WARDS
        // =================================================

        const criticalWards =
            selectedAqiRows.filter(
                (row) =>
                    Number(row.aqi) > 200
            ).length;

        // =================================================
        // 13. SENSOR HEALTH
        // =================================================

        const selectedStationSensors =
            (sensors || []).filter((sensor) => {

                const matchingDevice =
                    true;

                return matchingDevice;
            });

        const healthySensors =
            selectedStationSensors.filter(
                (sensor) => {
                    const status =
                        sensor.status
                            ?.toLowerCase();

                    return (
                        status === "healthy" ||
                        status === "online" ||
                        status === "active"
                    );
                }
            ).length;

        const warningSensors =
            selectedStationSensors.filter(
                (sensor) => {
                    const status =
                        sensor.status
                            ?.toLowerCase();

                    return (
                        status === "warning" ||
                        status === "warn"
                    );
                }
            ).length;

        const failedSensors =
            selectedStationSensors.filter(
                (sensor) => {
                    const status =
                        sensor.status
                            ?.toLowerCase();

                    return (
                        status === "failed" ||
                        status === "fail" ||
                        status === "offline"
                    );
                }
            ).length;

        // =================================================
        // 14. DATA QUALITY
        // =================================================

        const qualityRows =
            selectedReadings.filter(
                (row) =>
                    row.quality_flag
            );

        const totalQualityRows =
            qualityRows.length;

        const qualityCount = (value) =>
            qualityRows.filter(
                (row) =>
                    row.quality_flag
                        ?.toLowerCase() ===
                    value
            ).length;

        const availableCount =
            qualityCount("valid") ||
            qualityCount("available");

        const suspectCount =
            qualityCount("suspect");

        const missingCount =
            qualityCount("missing");

        const invalidCount =
            qualityCount("invalid");

        const percentage = (count) => {
            if (totalQualityRows === 0) {
                return "--";
            }

            return `${(
                (count / totalQualityRows) *
                100
            ).toFixed(1)}%`;
        };

        const dataQuality = {
            available:
                totalQualityRows > 0
                    ? percentage(availableCount)
                    : `${dataAvailability}%`,

            suspect:
                percentage(suspectCount),

            missing:
                percentage(missingCount),

            invalid:
                percentage(invalidCount)
        };

        // =================================================
        // 15. POLLUTANTS
        // =================================================

        const pollutantDefinitions = [
            {
                key: "pm25",
                names: ["pm2.5", "pm25"],
                name: "PM2.5",
                standard: 60,
                unit: "µg/m³"
            },
            {
                key: "pm10",
                names: ["pm10"],
                name: "PM10",
                standard: 100,
                unit: "µg/m³"
            },
            {
                key: "no2",
                names: ["no2", "no₂"],
                name: "NO₂",
                standard: 80,
                unit: "µg/m³"
            },
            {
                key: "so2",
                names: ["so2", "so₂"],
                name: "SO₂",
                standard: 80,
                unit: "µg/m³"
            },
            {
                key: "co",
                names: ["co"],
                name: "CO",
                standard: 2,
                unit: "mg/m³"
            },
            {
                key: "o3",
                names: ["o3", "o₃"],
                name: "O₃",
                standard: 100,
                unit: "µg/m³"
            },
            {
                key: "nh3",
                names: ["nh3", "nh₃"],
                name: "NH₃",
                standard: 400,
                unit: "µg/m³"
            },
            {
                key: "pb",
                names: ["pb"],
                name: "Pb",
                standard: 1,
                unit: "µg/m³"
            }
        ];

        const latestReadingMap = {};

        for (const row of selectedReadings) {
            const parameter =
                row.parameter
                    ?.toLowerCase()
                    .trim();

            const key =
                `${row.station_id}_${parameter}`;

            if (!latestReadingMap[key]) {
                latestReadingMap[key] = row;
            }
        }

        const pollutants =
            pollutantDefinitions.map(
                (pollutant) => {

                    const matchingRows =
                        Object.values(
                            latestReadingMap
                        ).filter((row) => {

                            const parameter =
                                row.parameter
                                    ?.toLowerCase()
                                    .trim();

                            return pollutant.names.includes(
                                parameter
                            );
                        });

                    matchingRows.sort(
                        (a, b) =>
                            new Date(
                                b.timestamp
                            ) -
                            new Date(
                                a.timestamp
                            )
                    );

                    const row =
                        matchingRows[0];

                    return {
                        key:
                            pollutant.key,

                        name:
                            pollutant.name,

                        value:
                            row
                                ? Number(
                                      row.value
                                  )
                                : null,

                        unit:
                            row?.unit ||
                            pollutant.unit,

                        standard:
                            pollutant.standard,

                        qualityFlag:
                            row?.quality_flag ||
                            "Valid"
                    };
                }
            );

        // =================================================
        // 16. WARD / STATION RANKING
        // =================================================

        const wards = stations
            .map((station) => {

                const aqi =
                    latestAqiByStation[
                        station.station_id
                    ];

                return {
                    id:
                        `ST-${station.station_id}`,

                    name:
                        station.name,

                    ward:
                        station.ward ||
                        "N/A",

                    zone:
                        station.zone ||
                        "N/A",

                    aqi:
                        aqi
                            ? Number(
                                  aqi.aqi
                              )
                            : 0
                };
            })
            .filter(
                (item) =>
                    item.aqi > 0
            )
            .sort(
                (a, b) =>
                    b.aqi - a.aqi
            );

        // =================================================
        // 17. AQI TREND
        // =================================================

        let hoursBack = 24;

        if (range === "7d") {
            hoursBack = 24 * 7;
        }

        if (range === "30d") {
            hoursBack = 24 * 30;
        }

        const trendStart =
            Date.now() -
            hoursBack *
                60 *
                60 *
                1000;

        const trendRows =
            (aqiRows || []).filter(
                (row) => {

                    if (
                        !stationIds.includes(
                            row.station_id
                        )
                    ) {
                        return false;
                    }

                    return (
                        new Date(
                            row.timestamp
                        ).getTime() >=
                        trendStart
                    );
                }
            );

        const trendMap = {};

        for (const row of trendRows) {

            const date =
                new Date(row.timestamp);

            let key;

            if (range === "24h") {
                key =
                    `${date.getHours()
                        .toString()
                        .padStart(2, "0")}:00`;
            } else if (range === "7d") {

                key =
                    `${date.getMonth() + 1}/${
                        date.getDate()
                    } ${
                        date.getHours()
                            .toString()
                            .padStart(2, "0")
                    }:00`;

            } else {

                key =
                    `${date.getMonth() + 1}/${
                        date.getDate()
                    }`;
            }

            if (!trendMap[key]) {
                trendMap[key] = {
                    time: key,
                    values: [],
                    val: 0
                };
            }

            trendMap[key].values.push(
                Number(row.aqi || 0)
            );
        }

        const trends =
            Object.values(
                trendMap
            )
                .map((item) => {

                    const total =
                        item.values.reduce(
                            (sum, value) =>
                                sum + value,
                            0
                        );

                    return {
                        time:
                            item.time,

                        val:
                            Math.round(
                                total /
                                    item.values
                                        .length
                            )
                    };
                })
                .sort((a, b) =>
                    a.time.localeCompare(
                        b.time
                    )
                );

        // =================================================
        // 18. TELEMETRY
        // =================================================

        const latestAqiTime =
            currentAqiRow?.timestamp
                ? new Date(
                      currentAqiRow.timestamp
                  ).getTime()
                : 0;

        const latestWeatherTime =
            latestWeather.length > 0
                ? Math.max(
                      ...latestWeather.map(
                          (row) =>
                              new Date(
                                  row.recorded_at
                              ).getTime()
                      )
                  )
                : 0;

        const latestDataTime =
            Math.max(
                latestAqiTime,
                latestWeatherTime
            );

        const telemetryStatus =
            latestDataTime &&
            Date.now() -
                latestDataTime <
                30 * 60 * 1000
                ? "Live"
                : "Delayed";

        // =================================================
        // 19. FINAL RESPONSE
        // =================================================

        res.status(200).json({
            status: "success",

            data: {
                name:
                    area
                        ? (
                              stations[0]
                                  ?.name ||
                              area
                          )
                        : "Pune PMC Air Quality Command Center",

                wardInfo:
                    area
                        ? `Ward ${
                              stations[0]
                                  ?.ward ||
                              "N/A"
                          } • ${
                              stations[0]
                                  ?.zone ||
                              "N/A"
                          }`
                        : "CPCB Guideline Framework Monitoring • Central Ward Network",

                aqi:
                    currentAqi,

                category:
                    currentAqiRow
                        ?.category ||
                    "N/A",

                dominant,

                activeStations:
                    `${onlineStations}/${totalStations}`,

                activeText:
                    `${onlineStations} Online • ${offlineStations} Offline`,

                criticalWards:
                    criticalWards,

                activeAlerts:
                    activeAlerts.length,

                dataAvailability:
                    `${dataAvailability}%`,

                sensorHealth:
                    healthySensors,

                sensorBreakdown:
                    `${healthySensors} Healthy • ${warningSensors} Warn • ${failedSensors} Fail`,

                dataQuality,

                telemetryStatus,

                pollutants,

                weather,

                trends,

                wards,

                stations,

                alerts:
                    activeAlerts
            }
        });

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({
            status: "error",
            message:
                error.message ||
                "Failed to load dashboard data."
        });
    }
};

module.exports = {
    getDashboard
};