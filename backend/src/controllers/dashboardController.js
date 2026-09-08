// backend/src/controllers/dashboardController.js

const supabase = require("../config/supabase");

// =====================================================
// HELPERS
// =====================================================

const num = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const lower = (value) =>
    String(value || "")
        .trim()
        .toLowerCase();

const getAqiCategory = (aqi) => {
    const value = num(aqi);

    if (value <= 50) return "Good";
    if (value <= 100) return "Satisfactory";
    if (value <= 200) return "Moderate";
    if (value <= 300) return "Poor";
    if (value <= 400) return "Very Poor";

    return "Severe";
};

const isActiveAlert = (alert) => {
    const status = lower(
        alert?.acknowledgement
    );

    return (
        status === "" ||
        status === "acknowledged"
    );
};

const isValidQuality = (flag) => {
    const value = lower(flag);

    return [
        "valid",
        "available",
        "good",
        "ok",
    ].includes(value);
};

const isOnlineStatus = (status) => {
    const value = lower(status);

    return [
        "online",
        "active",
        "connected",
        "healthy",
    ].includes(value);
};

const getSensorHealth = (status) => {
    const value = lower(status);

    if (
        [
            "failed",
            "fail",
            "fault",
            "error",
            "offline",
        ].includes(value)
    ) {
        return "Failed";
    }

    if (
        [
            "warning",
            "warn",
            "suspect",
        ].includes(value)
    ) {
        return "Warning";
    }

    if (
        [
            "maintenance",
            "maintain",
        ].includes(value)
    ) {
        return "Maintenance";
    }

    return "Healthy";
};

// =====================================================
// POLLUTANT CONFIGURATION
// =====================================================

const POLLUTANTS = [
    {
        key: "pm25",
        names: ["pm2.5", "pm25", "pm2_5"],
        name: "PM2.5",
        unit: "µg/m³",
        standard: 60,
    },
    {
        key: "pm10",
        names: ["pm10"],
        name: "PM10",
        unit: "µg/m³",
        standard: 100,
    },
    {
        key: "no2",
        names: ["no2", "no₂"],
        name: "NO₂",
        unit: "µg/m³",
        standard: 80,
    },
    {
        key: "so2",
        names: ["so2", "so₂"],
        name: "SO₂",
        unit: "µg/m³",
        standard: 80,
    },
    {
        key: "co",
        names: ["co"],
        name: "CO",
        unit: "mg/m³",
        standard: 2,
    },
    {
        key: "o3",
        names: ["o3", "o₃"],
        name: "O₃",
        unit: "µg/m³",
        standard: 100,
    },
    {
        key: "nh3",
        names: ["nh3", "nh₃"],
        name: "NH₃",
        unit: "µg/m³",
        standard: 400,
    },
    {
        key: "pb",
        names: ["pb"],
        name: "Pb",
        unit: "µg/m³",
        standard: 1,
    },
];

// =====================================================
// GET DASHBOARD
//
// GET /api/dashboard
// GET /api/dashboard?range=24h
// GET /api/dashboard?range=7d
// GET /api/dashboard?range=30d
// GET /api/dashboard?area=Hadapsar
// =====================================================

const getDashboard = async (req, res) => {
    try {
        const {
            area,
            range = "24h",
        } = req.query;

        // =================================================
        // 1. STATIONS
        // =================================================

        const {
            data: allStations,
            error: stationError,
        } = await supabase
            .from("station")
            .select("*")
            .order("station_id", {
                ascending: true,
            });

        if (stationError) {
            throw stationError;
        }

        let stations = allStations || [];

        // Optional area filter
        if (area) {
            const search = lower(area);

            stations = stations.filter(
                (station) => {
                    const name =
                        lower(station.name);

                    const ward =
                        lower(station.ward);

                    const zone =
                        lower(station.zone);

                    return (
                        name.includes(search) ||
                        ward.includes(search) ||
                        zone.includes(search)
                    );
                }
            );
        }

        const stationIds =
            stations.map(
                (station) =>
                    station.station_id
            );

        // =================================================
        // 2. DEVICES
        // =================================================

        const {
            data: allDevices,
            error: deviceError,
        } = await supabase
            .from("device")
            .select("*");

        if (deviceError) {
            throw deviceError;
        }

        const devices =
            (allDevices || []).filter(
                (device) =>
                    stationIds.includes(
                        device.station_id
                    )
            );

        const deviceIds =
            devices.map(
                (device) =>
                    device.device_id
            );

        // =================================================
        // 3. SENSORS
        // =================================================

        const {
            data: allSensors,
            error: sensorError,
        } = await supabase
            .from("sensor")
            .select("*");

        if (sensorError) {
            throw sensorError;
        }

        const sensors =
            (allSensors || []).filter(
                (sensor) =>
                    deviceIds.includes(
                        sensor.device_id
                    )
            );

        // =================================================
        // 4. AQI READINGS
        // =================================================

        let aqiRows = [];

        if (stationIds.length > 0) {
            const {
                data,
                error,
            } = await supabase
                .from("aqi_reading")
                .select("*")
                .in(
                    "station_id",
                    stationIds
                )
                .order("timestamp", {
                    ascending: false,
                })
                .limit(20000);

            if (error) {
                throw error;
            }

            aqiRows = data || [];
        }

        // =================================================
        // 5. LATEST AQI PER STATION
        // =================================================

        const latestAqiByStation = {};

        for (const row of aqiRows) {
            if (
                !latestAqiByStation[
                    row.station_id
                ]
            ) {
                latestAqiByStation[
                    row.station_id
                ] = row;
            }
        }

        // =================================================
        // 6. POLLUTANT READINGS
        // =================================================

        let readingRows = [];

        if (stationIds.length > 0) {
            const {
                data,
                error,
            } = await supabase
                .from("reading")
                .select("*")
                .in(
                    "station_id",
                    stationIds
                )
                .order("timestamp", {
                    ascending: false,
                })
                .limit(30000);

            if (error) {
                throw error;
            }

            readingRows = data || [];
        }

        // =================================================
        // 7. LATEST POLLUTANT READING
        // PER STATION + PARAMETER
        // =================================================

        const latestReadingMap = {};

        for (const row of readingRows) {
            const parameter =
                lower(row.parameter);

            const key =
                `${row.station_id}_${parameter}`;

            if (!latestReadingMap[key]) {
                latestReadingMap[key] = row;
            }
        }

        // =================================================
        // 8. ALERTS
        // =================================================

        let alertRows = [];

        if (stationIds.length > 0) {
            const {
                data,
                error,
            } = await supabase
                .from("alert")
                .select("*")
                .in(
                    "station_id",
                    stationIds
                )
                .order("started_time", {
                    ascending: false,
                })
                .limit(500);

            if (error) {
                throw error;
            }

            alertRows = data || [];
        }

        const activeAlerts =
            alertRows.filter(
                isActiveAlert
            );

        // =================================================
        // 9. WEATHER
        // =================================================

        const {
            data: weatherRows,
            error: weatherError,
        } = await supabase
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
                ascending: false,
            })
            .limit(10000);

        if (weatherError) {
            throw weatherError;
        }

        // =================================================
        // 10. LATEST WEATHER PER SITE
        // =================================================

        const latestWeatherMap = {};

        for (
            const row of weatherRows || []
        ) {
            if (
                !latestWeatherMap[
                    row.site_id
                ]
            ) {
                latestWeatherMap[
                    row.site_id
                ] = row;
            }
        }

        let latestWeather =
            Object.values(
                latestWeatherMap
            );

        // Match weather with selected area/stations
        if (area) {
            const search =
                lower(area);

            const matchingStationNames =
                stations.map(
                    (station) =>
                        lower(
                            station.name
                        )
                );

            latestWeather =
                latestWeather.filter(
                    (row) => {
                        const siteName =
                            lower(
                                row.sites
                                    ?.site_name
                            );

                        const location =
                            lower(
                                row.sites
                                    ?.location
                            );

                        return (
                            siteName.includes(
                                search
                            ) ||
                            location.includes(
                                search
                            ) ||
                            matchingStationNames.some(
                                (
                                    stationName
                                ) =>
                                    siteName.includes(
                                        stationName
                                    ) ||
                                    stationName.includes(
                                        siteName
                                    )
                            )
                        );
                    }
                );
        }

        // =================================================
        // 11. WEATHER SUMMARY
        // =================================================

        const average = (
            values
        ) => {
            const valid =
                values
                    .map(Number)
                    .filter(
                        (value) =>
                            Number.isFinite(
                                value
                            )
                    );

            if (!valid.length) {
                return null;
            }

            return (
                valid.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) / valid.length
            );
        };

        const weather = {
            temperature: null,
            humidity: null,
            windSpeed: null,
            windDirection: null,
            pressure: null,
            rainfall: null,
        };

        if (
            latestWeather.length
        ) {
            const temperature =
                average(
                    latestWeather.map(
                        (row) =>
                            row.temperature
                    )
                );

            const humidity =
                average(
                    latestWeather.map(
                        (row) =>
                            row.humidity
                    )
                );

            const windSpeed =
                average(
                    latestWeather.map(
                        (row) =>
                            row.wind_speed
                    )
                );

            const windDirection =
                average(
                    latestWeather.map(
                        (row) =>
                            row.wind_direction
                    )
                );

            const pressure =
                average(
                    latestWeather.map(
                        (row) =>
                            row.pressure
                    )
                );

            const rainfall =
                average(
                    latestWeather.map(
                        (row) =>
                            row.rainfall
                    )
                );

            weather.temperature =
                temperature !== null
                    ? Number(
                          temperature.toFixed(
                              1
                          )
                      )
                    : null;

            weather.humidity =
                humidity !== null
                    ? Number(
                          humidity.toFixed(
                              0
                          )
                      )
                    : null;

            weather.windSpeed =
                windSpeed !== null
                    ? Number(
                          windSpeed.toFixed(
                              1
                          )
                      )
                    : null;

            weather.windDirection =
                windDirection !== null
                    ? Number(
                          windDirection.toFixed(
                              0
                          )
                      )
                    : null;

            weather.pressure =
                pressure !== null
                    ? Number(
                          pressure.toFixed(
                              1
                          )
                      )
                    : null;

            weather.rainfall =
                rainfall !== null
                    ? Number(
                          rainfall.toFixed(
                              1
                          )
                      )
                    : null;
        }

        // =================================================
        // 12. CURRENT AQI
        // =================================================

        const latestAqiRows =
            Object.values(
                latestAqiByStation
            );

        let overallAqi = 0;

        if (
            latestAqiRows.length
        ) {
            overallAqi =
                Math.round(
                    latestAqiRows.reduce(
                        (
                            total,
                            row
                        ) =>
                            total +
                            num(
                                row.aqi
                            ),
                        0
                    ) /
                        latestAqiRows.length
                );
        }

        const currentAqiRow =
            latestAqiRows.reduce(
                (
                    latest,
                    row
                ) => {
                    if (!latest) {
                        return row;
                    }

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
            );

        const currentAqi = area
            ? num(
                  currentAqiRow?.aqi
              )
            : overallAqi;

        const category =
            currentAqiRow?.category ||
            getAqiCategory(
                currentAqi
            );

        const dominant =
            currentAqiRow
                ?.dominant_pollutant ||
            "N/A";

        // =================================================
        // 13. STATION ONLINE/OFFLINE
        // =================================================

        const now = Date.now();

        const stationOnlineMap = {};

        for (
            const station of stations
        ) {
            const stationDevices =
                devices.filter(
                    (device) =>
                        device.station_id ===
                        station.station_id
                );

            let online = false;

            if (
                stationDevices.length
            ) {
                online =
                    stationDevices.some(
                        (device) => {
                            const network =
                                lower(
                                    device.network_status
                                );

                            const status =
                                lower(
                                    device.status
                                );

                            const lastSeen =
                                device.last_seen_at
                                    ? new Date(
                                          device.last_seen_at
                                      ).getTime()
                                    : 0;

                            const recentlySeen =
                                lastSeen > 0 &&
                                now -
                                    lastSeen <=
                                    30 *
                                        60 *
                                        1000;

                            return (
                                network ===
                                    "connected" ||
                                network ===
                                    "online" ||
                                status ===
                                    "online" ||
                                status ===
                                    "active" ||
                                recentlySeen
                            );
                        }
                    );
            } else {
                online =
                    isOnlineStatus(
                        station.status
                    );
            }

            stationOnlineMap[
                station.station_id
            ] = online;
        }

        const totalStations =
            stations.length;

        const onlineStations =
            stations.filter(
                (station) =>
                    stationOnlineMap[
                        station.station_id
                    ]
            ).length;

        const offlineStations =
            totalStations -
            onlineStations;

        // =================================================
        // 14. DATA AVAILABILITY
        // =================================================

        let hoursBack = 24;

        if (range === "7d") {
            hoursBack =
                24 * 7;
        }

        if (range === "30d") {
            hoursBack =
                24 * 30;
        }

        const rangeStart =
            Date.now() -
            hoursBack *
                60 *
                60 *
                1000;

        const availabilityRows =
            aqiRows.filter(
                (row) =>
                    new Date(
                        row.timestamp
                    ).getTime() >=
                    rangeStart
            );

        const receivedSlots =
            new Set();

        availabilityRows.forEach(
            (row) => {
                const date =
                    new Date(
                        row.timestamp
                    );

                const hourKey =
                    `${row.station_id}_${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}`;

                receivedSlots.add(
                    hourKey
                );
            }
        );

        const expectedSlots =
            totalStations *
            hoursBack;

        const dataAvailability =
            expectedSlots > 0
                ? Math.min(
                      100,
                      (
                          receivedSlots.size /
                              expectedSlots
                      ) *
                          100
                  )
                : 0;

        // =================================================
        // 15. SENSOR HEALTH
        // =================================================

        const healthySensors =
            sensors.filter(
                (sensor) =>
                    getSensorHealth(
                        sensor.status
                    ) ===
                    "Healthy"
            ).length;

        const warningSensors =
            sensors.filter(
                (sensor) =>
                    getSensorHealth(
                        sensor.status
                    ) ===
                    "Warning"
            ).length;

        const maintenanceSensors =
            sensors.filter(
                (sensor) =>
                    getSensorHealth(
                        sensor.status
                    ) ===
                    "Maintenance"
            ).length;

        const failedSensors =
            sensors.filter(
                (sensor) =>
                    getSensorHealth(
                        sensor.status
                    ) ===
                    "Failed"
            ).length;

        // =================================================
        // 16. CURRENT POLLUTANTS
        // =================================================

        const pollutants =
            POLLUTANTS.map(
                (pollutant) => {
                    const rows =
                        Object.values(
                            latestReadingMap
                        ).filter(
                            (row) =>
                                pollutant.names.includes(
                                    lower(
                                        row.parameter
                                    )
                                )
                        );

                    rows.sort(
                        (a, b) =>
                            new Date(
                                b.timestamp
                            ) -
                            new Date(
                                a.timestamp
                            )
                    );

                    const row =
                        rows[0];

                    const value =
                        row
                            ? num(
                                  row.value
                              )
                            : null;

                    return {
                        key:
                            pollutant.key,

                        name:
                            pollutant.name,

                        value,

                        unit:
                            row?.unit ||
                            pollutant.unit,

                        standard:
                            pollutant.standard,

                        qualityFlag:
                            row?.quality_flag ||
                            "N/A",

                        timestamp:
                            row?.timestamp ||
                            null,

                        status:
                            value === null
                                ? "No Data"
                                : value >
                                  pollutant.standard
                                ? "Above Standard"
                                : "Good",
                    };
                }
            );

        // =================================================
        // 17. STATION DATA
        // =================================================

        const stationData =
            stations.map(
                (station) => {
                    const stationId =
                        station.station_id;

                    const aqiRow =
                        latestAqiByStation[
                            stationId
                        ];

                    const stationReadings =
                        readingRows.filter(
                            (row) =>
                                row.station_id ===
                                stationId
                        );

                    const findLatest =
                        (
                            names
                        ) => {
                            const matching =
                                stationReadings
                                    .filter(
                                        (
                                            row
                                        ) =>
                                            names.includes(
                                                lower(
                                                    row.parameter
                                                )
                                            )
                                    )
                                    .sort(
                                        (
                                            a,
                                            b
                                        ) =>
                                            new Date(
                                                b.timestamp
                                            ) -
                                            new Date(
                                                a.timestamp
                                            )
                                    );

                            return matching[0];
                        };

                    const pm25 =
                        findLatest([
                            "pm2.5",
                            "pm25",
                            "pm2_5",
                        ]);

                    const pm10 =
                        findLatest([
                            "pm10",
                        ]);

                    const stationSensors =
                        sensors.filter(
                            (sensor) => {
                                const device =
                                    devices.find(
                                        (
                                            item
                                        ) =>
                                            item.device_id ===
                                            sensor.device_id
                                    );

                                return (
                                    device?.station_id ===
                                    stationId
                                );
                            }
                        );

                    let health =
                        "Healthy";

                    const healthValues =
                        stationSensors.map(
                            (
                                sensor
                            ) =>
                                getSensorHealth(
                                    sensor.status
                                )
                        );

                    if (
                        healthValues.includes(
                            "Failed"
                        )
                    ) {
                        health =
                            "Failed";
                    } else if (
                        healthValues.includes(
                            "Warning"
                        )
                    ) {
                        health =
                            "Warning";
                    } else if (
                        healthValues.includes(
                            "Maintenance"
                        )
                    ) {
                        health =
                            "Maintenance";
                    }

                    const aqi =
                        num(
                            aqiRow?.aqi
                        );

                    return {
                        stationId:
                            stationId,

                        station_id:
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

                        stationType:
                            station.station_type ||
                            "CAAQM",

                        status:
                            getAqiCategory(
                                aqi
                            ),

                        aqi,

                        dominant:
                            aqiRow
                                ?.dominant_pollutant ||
                            "N/A",

                        pm25:
                            pm25
                                ? num(
                                      pm25.value
                                  )
                                : null,

                        pm10:
                            pm10
                                ? num(
                                      pm10.value
                                  )
                                : null,

                        health,

                        online:
                            Boolean(
                                stationOnlineMap[
                                    stationId
                                ]
                            ),

                        timestamp:
                            aqiRow?.timestamp ||
                            null,
                    };
                }
            );

        // =================================================
        // 18. WARD-WISE AQI
        // =================================================

        const wardMap = {};

        stationData.forEach(
            (station) => {
                const ward =
                    station.ward ||
                    "Unknown";

                if (!wardMap[ward]) {
                    wardMap[ward] = {
                        ward,
                        values: [],
                        stationCount: 0,
                    };
                }

                if (
                    station.aqi >
                    0
                ) {
                    wardMap[
                        ward
                    ].values.push(
                        station.aqi
                    );
                }

                wardMap[
                    ward
                ].stationCount++;
            }
        );

        const wards =
            Object.values(
                wardMap
            )
                .map(
                    (ward) => ({
                        ward:
                            ward.ward,

                        aqi:
                            ward.values.length
                                ? Math.round(
                                      ward.values.reduce(
                                          (
                                              sum,
                                              value
                                          ) =>
                                              sum +
                                              value,
                                          0
                                      ) /
                                          ward
                                              .values
                                              .length
                                  )
                                : 0,

                        stationCount:
                            ward.stationCount,
                    })
                )
                .filter(
                    (ward) =>
                        ward.aqi > 0
                )
                .sort(
                    (a, b) =>
                        b.aqi - a.aqi
                );

        // =================================================
        // 19. TREND
        // =================================================

        const trendMap = {};

        // AQI trend
        aqiRows
            .filter(
                (row) =>
                    new Date(
                        row.timestamp
                    ).getTime() >=
                    rangeStart
            )
            .forEach(
                (row) => {
                    const date =
                        new Date(
                            row.timestamp
                        );

                    let bucket;

                    if (
                        range ===
                        "24h"
                    ) {
                        bucket =
                            new Date(
                                date
                            );

                        bucket.setMinutes(
                            0,
                            0,
                            0
                        );
                    } else if (
                        range ===
                        "7d"
                    ) {
                        bucket =
                            new Date(
                                date
                            );

                        bucket.setMinutes(
                            0,
                            0,
                            0
                        );
                    } else {
                        bucket =
                            new Date(
                                date
                            );

                        bucket.setHours(
                            0,
                            0,
                            0,
                            0
                        );
                    }

                    const key =
                        bucket.toISOString();

                    if (
                        !trendMap[key]
                    ) {
                        trendMap[key] = {
                            date:
                                bucket,

                            aqi: [],

                            pm25: [],

                            pm10: [],
                        };
                    }

                    trendMap[
                        key
                    ].aqi.push(
                        num(row.aqi)
                    );
                }
            );

        // Pollutant trend
        readingRows
            .filter(
                (row) =>
                    new Date(
                        row.timestamp
                    ).getTime() >=
                    rangeStart
            )
            .forEach(
                (row) => {
                    const date =
                        new Date(
                            row.timestamp
                        );

                    let bucket;

                    if (
                        range ===
                        "30d"
                    ) {
                        bucket =
                            new Date(
                                date
                            );

                        bucket.setHours(
                            0,
                            0,
                            0,
                            0
                        );
                    } else {
                        bucket =
                            new Date(
                                date
                            );

                        bucket.setMinutes(
                            0,
                            0,
                            0
                        );
                    }

                    const key =
                        bucket.toISOString();

                    if (
                        !trendMap[key]
                    ) {
                        trendMap[key] = {
                            date:
                                bucket,

                            aqi: [],

                            pm25: [],

                            pm10: [],
                        };
                    }

                    const parameter =
                        lower(
                            row.parameter
                        );

                    if (
                        [
                            "pm2.5",
                            "pm25",
                            "pm2_5",
                        ].includes(
                            parameter
                        )
                    ) {
                        trendMap[
                            key
                        ].pm25.push(
                            num(
                                row.value
                            )
                        );
                    }

                    if (
                        parameter ===
                        "pm10"
                    ) {
                        trendMap[
                            key
                        ].pm10.push(
                            num(
                                row.value
                            )
                        );
                    }
                }
            );

        const avg = (
            values
        ) => {
            if (
                !values.length
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

        const formatTrendTime =
            (date) => {
                if (
                    range ===
                    "30d"
                ) {
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                }

                return `${String(
                    date.getHours()
                ).padStart(
                    2,
                    "0"
                )}:00`;
            };

        const trends =
            Object.values(
                trendMap
            )
                .sort(
                    (a, b) =>
                        a.date -
                        b.date
                )
                .map(
                    (item) => ({
                        time:
                            formatTrendTime(
                                item.date
                            ),

                        aqi:
                            item.aqi.length
                                ? Math.round(
                                      avg(
                                          item.aqi
                                      )
                                  )
                                : null,

                        pm25:
                            item.pm25.length
                                ? Number(
                                      avg(
                                          item.pm25
                                      ).toFixed(
                                          1
                                      )
                                  )
                                : null,

                        pm10:
                            item.pm10.length
                                ? Number(
                                      avg(
                                          item.pm10
                                      ).toFixed(
                                          1
                                      )
                                  )
                                : null,

                        timestamp:
                            item.date.toISOString(),
                    })
                );

        // =================================================
        // 20. TELEMETRY
        // =================================================

        const latestAqiTime =
            currentAqiRow?.timestamp
                ? new Date(
                      currentAqiRow.timestamp
                  ).getTime()
                : 0;

        const latestReadingTime =
            readingRows.length
                ? Math.max(
                      ...readingRows.map(
                          (row) =>
                              new Date(
                                  row.timestamp
                              ).getTime()
                      )
                  )
                : 0;

        const latestWeatherTime =
            latestWeather.length
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
                latestReadingTime,
                latestWeatherTime
            );

        const telemetryStatus =
            latestDataTime > 0 &&
            Date.now() -
                latestDataTime <
                30 *
                    60 *
                    1000
                ? "Live"
                : "Delayed";

        // =================================================
        // 21. DATA QUALITY
        // =================================================

        const qualityRows =
            readingRows.filter(
                (row) =>
                    row.quality_flag
            );

        const validQuality =
            qualityRows.filter(
                (row) =>
                    isValidQuality(
                        row.quality_flag
                    )
            ).length;

        const suspectQuality =
            qualityRows.filter(
                (row) =>
                    lower(
                        row.quality_flag
                    ) ===
                    "suspect"
            ).length;

        const invalidQuality =
            qualityRows.filter(
                (row) =>
                    [
                        "invalid",
                        "failed",
                        "fault",
                        "error",
                        "out_of_range",
                    ].includes(
                        lower(
                            row.quality_flag
                        )
                    )
            ).length;

        const dataQuality = {
            available:
                qualityRows.length
                    ? `${(
                          (validQuality /
                              qualityRows.length) *
                          100
                      ).toFixed(1)}%`
                    : "0%",

            suspect:
                qualityRows.length
                    ? `${(
                          (suspectQuality /
                              qualityRows.length) *
                          100
                      ).toFixed(1)}%`
                    : "0%",

            invalid:
                qualityRows.length
                    ? `${(
                          (invalidQuality /
                              qualityRows.length) *
                          100
                      ).toFixed(1)}%`
                    : "0%",
        };

        // =================================================
        // 22. CRITICAL / HIGH AQI WARDS
        // =================================================

        const highAqiAreas =
            stationData.filter(
                (station) =>
                    station.aqi >
                    100
            ).length;

        // =================================================
        // 23. FINAL RESPONSE
        // =================================================

        return res.status(200).json({
            status: "success",

            data: {
                title:
                    "Pune Municipal Corporation",

                name:
                    area ||
                    "Pune",

                wardInfo:
                    area ||
                    "Citywide Monitoring Network",

                aqi:
                    currentAqi,

                category:
                    category,

                dominant:
                    dominant,

                totalStations,

                onlineStations,

                offlineStations,

                activeStations:
                    `${onlineStations}/${totalStations}`,

                activeText:
                    `${onlineStations} Online • ${offlineStations} Offline`,

                criticalWards:
                    highAqiAreas,

                activeAlerts:
                    activeAlerts.length,

                dataAvailability:
                    Number(
                        dataAvailability.toFixed(
                            1
                        )
                    ),

                telemetryStatus,

                sensorHealth: {
                    healthy:
                        healthySensors,

                    warning:
                        warningSensors,

                    maintenance:
                        maintenanceSensors,

                    failed:
                        failedSensors,

                    total:
                        sensors.length,
                },

                dataQuality,

                pollutants,

                weather,

                trends,

                wards,

                stations:
                    stationData,

                alerts:
                    activeAlerts,
            },
        });
    } catch (error) {
        console.error(
            "Dashboard error:",
            error
        );

        return res.status(500).json({
            status: "error",

            message:
                error.message ||
                "Failed to load dashboard data.",
        });
    }
};

module.exports = {
    getDashboard,
};