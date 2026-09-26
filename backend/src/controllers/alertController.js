// backend/src/controllers/alertController.js

const supabase = require("../config/supabase");


// =========================================================
// HELPERS
// =========================================================

const normalizeParameter = (value) => {
    if (!value) return "";

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[.\s_-]/g, "");
};


// =========================================================
// GET SEVERITY
// Normal threshold:
// Higher value = worse
// =========================================================

const getSeverity = (
    actualValue,
    warning,
    critical
) => {
    const actual = Number(actualValue);
    const warningValue = Number(warning);
    const criticalValue = Number(critical);

    if (!Number.isFinite(actual)) {
        return null;
    }

    if (
        Number.isFinite(criticalValue) &&
        actual >= criticalValue
    ) {
        return "Critical";
    }

    if (
        Number.isFinite(warningValue) &&
        actual >= warningValue
    ) {
        return "Warning";
    }

    return null;
};


// =========================================================
// CREATE THRESHOLD RULE
// =========================================================

const createThresholdRule = (
    warning,
    critical
) => {
    if (
        critical !== null &&
        critical !== undefined &&
        Number.isFinite(Number(critical))
    ) {
        return `Warning >= ${warning}, Critical >= ${critical}`;
    }

    if (
        warning !== null &&
        warning !== undefined &&
        Number.isFinite(Number(warning))
    ) {
        return `>= ${warning}`;
    }

    return "Threshold exceeded";
};


// =========================================================
// GET ALL ALERTS
// GET /api/alerts
// =========================================================

const getAlerts = async (req, res) => {
    try {
        const {
            data,
            error,
        } = await supabase
            .from("alert")
            .select(`
                *,
                station:station_id (
                    station_id,
                    name,
                    ward,
                    zone
                )
            `)
            .order("started_time", {
                ascending: false,
            })
            .limit(500);

        if (error) {
            console.error(
                "Supabase get alerts error:",
                error
            );

            throw error;
        }

        return res.status(200).json({
            status: "success",
            alerts: data || [],
        });

    } catch (error) {
        console.error(
            "getAlerts error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                error.message ||
                "Failed to load alerts.",
        });
    }
};


// =========================================================
// ACKNOWLEDGE ALERT
// PATCH /api/alerts/:id/acknowledge
// =========================================================

const acknowledgeAlert = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Alert ID is required.",
            });
        }

        const {
            data,
            error,
        } = await supabase
            .from("alert")
            .update({
                acknowledgement: "Acknowledged",
                acknowledged_at:
                    new Date().toISOString(),
            })
            .eq("alert_id", id)
            .select("*")
            .single();

        if (error) {
            console.error(
                "Supabase acknowledge alert error:",
                error
            );

            throw error;
        }

        if (!data) {
            return res.status(404).json({
                status: "error",
                message: "Alert not found.",
            });
        }

        return res.status(200).json({
            status: "success",
            message:
                "Alert acknowledged successfully.",
            alert: data,
        });

    } catch (error) {
        console.error(
            "acknowledgeAlert error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                error.message ||
                "Failed to acknowledge alert.",
        });
    }
};


// =========================================================
// RESOLVE ALERT
// PATCH /api/alerts/:id/resolve
// =========================================================

const resolveAlert = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Alert ID is required.",
            });
        }

        const {
            data,
            error,
        } = await supabase
            .from("alert")
            .update({
                acknowledgement: "Resolved",
                acknowledged_at:
                    new Date().toISOString(),
            })
            .eq("alert_id", id)
            .select("*")
            .single();

        if (error) {
            console.error(
                "Supabase resolve alert error:",
                error
            );

            throw error;
        }

        if (!data) {
            return res.status(404).json({
                status: "error",
                message: "Alert not found.",
            });
        }

        return res.status(200).json({
            status: "success",
            message:
                "Alert resolved successfully.",
            alert: data,
        });

    } catch (error) {
        console.error(
            "resolveAlert error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                error.message ||
                "Failed to resolve alert.",
        });
    }
};


// =========================================================
// GET ALERT CONFIGURATIONS
// GET /api/alerts/configurations
// =========================================================

const getAlertConfigurations = async (
    req,
    res
) => {
    try {
        const {
            data,
            error,
        } = await supabase
            .from("alert_configuration")
            .select("*")
            .order("config_id", {
                ascending: true,
            });

        if (error) {
            console.error(
                "Supabase get configurations error:",
                error
            );

            throw error;
        }

        return res.status(200).json({
            status: "success",
            configurations:
                data || [],
        });

    } catch (error) {
        console.error(
            "getAlertConfigurations error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                error.message ||
                "Failed to load alert configurations.",
        });
    }
};


// =========================================================
// UPDATE ALERT CONFIGURATION
// PATCH /api/alerts/configurations/:id
// =========================================================

const updateAlertConfiguration = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const {
            warning_threshold,
            critical_threshold,
            no_data_minutes,
            due_days,
            enabled,
        } = req.body;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message:
                    "Configuration ID is required.",
            });
        }

        const numericOrNull = (value) => {
            if (
                value === "" ||
                value === null ||
                value === undefined
            ) {
                return null;
            }

            const number = Number(value);

            if (!Number.isFinite(number)) {
                return null;
            }

            return number;
        };

        const warningValue =
            numericOrNull(
                warning_threshold
            );

        const criticalValue =
            numericOrNull(
                critical_threshold
            );

        const noDataValue =
            numericOrNull(
                no_data_minutes
            );

        const dueDaysValue =
            numericOrNull(
                due_days
            );

        if (
            warningValue !== null &&
            criticalValue !== null &&
            warningValue >= criticalValue
        ) {
            return res.status(400).json({
                status: "error",
                message:
                    "Warning threshold must be lower than critical threshold.",
            });
        }

        let enabledValue = true;

        if (typeof enabled === "boolean") {
            enabledValue = enabled;

        } else if (
            enabled === "true" ||
            enabled === 1 ||
            enabled === "1"
        ) {
            enabledValue = true;

        } else if (
            enabled === "false" ||
            enabled === 0 ||
            enabled === "0"
        ) {
            enabledValue = false;
        }

        const updateData = {
            warning_threshold:
                warningValue,

            critical_threshold:
                criticalValue,

            no_data_minutes:
                noDataValue,

            due_days:
                dueDaysValue,

            enabled:
                enabledValue,

            updated_at:
                new Date().toISOString(),
        };

        const {
            data,
            error,
        } = await supabase
            .from("alert_configuration")
            .update(updateData)
            .eq("config_id", id)
            .select("*")
            .single();

        if (error) {
            console.error(
                "Supabase update configuration error:",
                error
            );

            throw error;
        }

        if (!data) {
            return res.status(404).json({
                status: "error",
                message:
                    "Alert configuration not found.",
            });
        }

        return res.status(200).json({
            status: "success",
            message:
                "Alert configuration updated successfully.",
            configuration: data,
        });

    } catch (error) {
        console.error(
            "updateAlertConfiguration error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                error.message ||
                "Failed to update alert configuration.",
        });
    }
};


// =========================================================
// CREATE ALERT
//
// ACTUAL alert TABLE:
//
// alert_id
// station_id
// parameter
// threshold_rule
// actual_value
// severity
// started_time
// acknowledgement
// acknowledged_at
// =========================================================

const createAlert = async ({
    stationId,
    alertType,
    parameter,
    actualValue,
    thresholdValue,
    severity,
    rule,
}) => {
    try {
        if (!stationId) {
            console.error(
                "createAlert: stationId is required."
            );

            return {
                created: false,
                reason:
                    "Missing station ID",
            };
        }

        const normalizedParameter =
            normalizeParameter(
                parameter
            );

        const normalizedSeverity =
            severity || "Warning";


        // =================================================
        // CHECK EXISTING ACTIVE ALERT
        // =================================================

        const {
            data: existingAlerts,
            error: existingError,
        } = await supabase
            .from("alert")
            .select(`
                alert_id,
                acknowledgement,
                severity,
                parameter
            `)
            .eq(
                "station_id",
                stationId
            )
            .eq(
                "parameter",
                normalizedParameter
            )
            .in("severity", [
                "Warning",
                "Critical",
            ]);

        if (existingError) {
            console.error(
                "Error checking existing alerts:",
                existingError
            );

            return {
                created: false,
                reason:
                    "Database error",
                error:
                    existingError,
            };
        }


        // =================================================
        // PREVENT DUPLICATE ACTIVE ALERT
        // =================================================

        if (
            existingAlerts &&
            existingAlerts.length > 0
        ) {
            const activeAlert =
                existingAlerts.find(
                    (alert) => {
                        const acknowledgement =
                            String(
                                alert.acknowledgement ||
                                ""
                            ).toLowerCase();

                        const alertSeverity =
                            String(
                                alert.severity ||
                                ""
                            ).toLowerCase();

                        const currentSeverity =
                            String(
                                normalizedSeverity ||
                                ""
                            ).toLowerCase();

                        return (
                            acknowledgement !==
                                "resolved" &&
                            alertSeverity ===
                                currentSeverity
                        );
                    }
                );

            if (activeAlert) {
                console.log(
                    `Active ${normalizedSeverity} alert already exists for station ${stationId}, parameter ${normalizedParameter}.`
                );

                return {
                    created: false,
                    reason:
                        "Already active",
                    alert:
                        activeAlert,
                };
            }
        }


        // =================================================
        // THRESHOLD RULE
        // =================================================

        let thresholdRule =
            rule ||
            "Threshold exceeded";

        if (
            !rule &&
            thresholdValue !== null &&
            thresholdValue !== undefined
        ) {
            thresholdRule =
                `Threshold: ${thresholdValue}`;
        }


        // =================================================
        // INSERT ALERT
        // =================================================

        const alertData = {
            station_id:
                stationId,

            parameter:
                normalizedParameter,

            threshold_rule:
                thresholdRule,

            actual_value:
                actualValue !== undefined &&
                actualValue !== null
                    ? Number(actualValue)
                    : null,

            severity:
                normalizedSeverity,

            started_time:
                new Date().toISOString(),

            acknowledgement:
                "Pending",

            acknowledged_at:
                null,
        };

        const {
            data,
            error,
        } = await supabase
            .from("alert")
            .insert([
                alertData,
            ])
            .select("*")
            .single();

        if (error) {
            console.error(
                "Supabase create alert error:",
                error
            );

            return {
                created: false,
                reason:
                    "Database error",
                error,
            };
        }

        console.log(
            `Alert created successfully: ${
                alertType || "ALERT"
            } / ${
                normalizedParameter
            } / ${
                normalizedSeverity
            }`
        );

        console.log(
            "Created alert:",
            data
        );

        return {
            created: true,
            alert: data,
        };

    } catch (error) {
        console.error(
            "createAlert error:",
            error
        );

        return {
            created: false,
            reason:
                "Exception",
            error,
        };
    }
};


// =========================================================
// RESOLVE CLEARED ALERT
// =========================================================

const resolveClearedAlert = async ({
    stationId,
    parameter,
}) => {
    try {
        const normalizedParameter =
            normalizeParameter(
                parameter
            );

        const {
            data: activeAlerts,
            error,
        } = await supabase
            .from("alert")
            .select("*")
            .eq(
                "station_id",
                stationId
            )
            .eq(
                "parameter",
                normalizedParameter
            )
            .neq(
                "acknowledgement",
                "Resolved"
            );

        if (error) {
            console.error(
                "resolveClearedAlert lookup error:",
                error
            );

            return {
                resolved: false,
                error,
            };
        }

        if (
            !activeAlerts ||
            activeAlerts.length === 0
        ) {
            return {
                resolved: false,
                reason:
                    "No active alert",
            };
        }

        const alertIds =
            activeAlerts.map(
                (alert) =>
                    alert.alert_id
            );

        const {
            data: resolvedAlerts,
            error: updateError,
        } = await supabase
            .from("alert")
            .update({
                acknowledgement:
                    "Resolved",

                acknowledged_at:
                    new Date().toISOString(),
            })
            .in(
                "alert_id",
                alertIds
            )
            .select("*");

        if (updateError) {
            console.error(
                "resolveClearedAlert update error:",
                updateError
            );

            return {
                resolved: false,
                error:
                    updateError,
            };
        }

        console.log(
            `Resolved ${
                resolvedAlerts?.length || 0
            } cleared alert(s) for station ${stationId}, parameter ${normalizedParameter}.`
        );

        return {
            resolved:
                (resolvedAlerts?.length || 0) >
                0,

            alerts:
                resolvedAlerts || [],
        };

    } catch (error) {
        console.error(
            "resolveClearedAlert error:",
            error
        );

        return {
            resolved: false,
            error,
        };
    }
};


// =========================================================
// LOAD LATEST AQI
// =========================================================

const getLatestAQIForStations =
    async (stationIds) => {
        try {
            if (
                !stationIds ||
                stationIds.length === 0
            ) {
                return {};
            }

            const {
                data,
                error,
            } = await supabase
                .from("aqi_reading")
                .select(`
                    aqi_reading_id,
                    station_id,
                    aqi,
                    category,
                    measured_at
                `)
                .in(
                    "station_id",
                    stationIds
                )
                .order("measured_at", {
                    ascending: false,
                });

            if (error) {
                console.error(
                    "getLatestAQIForStations error:",
                    error
                );

                return {};
            }

            const latestByStation = {};

            for (const reading of data || []) {
                if (
                    !latestByStation[
                        reading.station_id
                    ]
                ) {
                    latestByStation[
                        reading.station_id
                    ] = reading;
                }
            }

            return latestByStation;

        } catch (error) {
            console.error(
                "getLatestAQIForStations exception:",
                error
            );

            return {};
        }
    };


// =========================================================
// LOAD LATEST POLLUTANT READINGS
// =========================================================

const getLatestPollutantReadings =
    async (stationIds) => {
        try {
            if (
                !stationIds ||
                stationIds.length === 0
            ) {
                return {};
            }

            const {
                data,
                error,
            } = await supabase
                .from("reading")
                .select(`
                    reading_id,
                    station_id,
                    parameter,
                    value,
                    unit,
                    timestamp,
                    quality_flag
                `)
                .in(
                    "station_id",
                    stationIds
                )
                .order("timestamp", {
                    ascending: false,
                });

            if (error) {
                console.error(
                    "getLatestPollutantReadings error:",
                    error
                );

                return {};
            }

            const latest = {};

            for (const reading of data || []) {

                const stationId =
                    reading.station_id;

                const parameter =
                    normalizeParameter(
                        reading.parameter
                    );

                if (
                    !stationId ||
                    !parameter
                ) {
                    continue;
                }

                if (
                    !latest[
                        stationId
                    ]
                ) {
                    latest[
                        stationId
                    ] = {};
                }

                // Because the query is ordered
                // newest first, the first reading
                // for each parameter is the latest.

                if (
                    !latest[
                        stationId
                    ][parameter]
                ) {
                    latest[
                        stationId
                    ][parameter] =
                        reading;
                }
            }

            return latest;

        } catch (error) {
            console.error(
                "getLatestPollutantReadings exception:",
                error
            );

            return {};
        }
    };


// =========================================================
// LOAD STATIONS
//
// Actual station schema:
//
// station_id
// name
// ward
// zone
// latitude
// longitude
// station_type
// installation_date
// status
// external_source
// external_station_id
// =========================================================

const getStationsForAlertEngine =
    async () => {

        const {
            data,
            error,
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
            `);

        if (error) {
            console.error(
                "getStationsForAlertEngine error:",
                error
            );

            throw error;
        }

        return data || [];
    };


// =========================================================
// LOAD DEVICES
//
// Actual device schema:
//
// device_id
// gateway_id
// manufacturer
// model
// firmware
// ip_network
// station_id
// status
// created_at
// battery_level
// network_status
// last_seen_at
// is_simulated
// =========================================================

const getDevicesForAlertEngine =
    async (stationIds) => {

        if (
            !stationIds ||
            stationIds.length === 0
        ) {
            return [];
        }

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
                ip_network,
                station_id,
                status,
                created_at,
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
            console.error(
                "getDevicesForAlertEngine error:",
                error
            );

            throw error;
        }

        return data || [];
    };


// =========================================================
// LOAD SENSORS
//
// IMPORTANT:
//
// Actual sensor table DOES NOT contain:
//
// parameter
// last_reading_at
// last_value
// station_id
//
// It contains:
//
// sensor_id
// sensor_type
// model
// serial_number
// installation_date
// calibration_date
// device_id
// status
//
// Relationship:
//
// station
//   ↓
// device.station_id
//   ↓
// sensor.device_id
// =========================================================

const getSensorsForAlertEngine =
    async (stationIds) => {

        if (
            !stationIds ||
            stationIds.length === 0
        ) {
            return [];
        }


        // =================================================
        // STEP 1: GET DEVICES
        // =================================================

        const {
            data: devices,
            error: deviceError,
        } = await supabase
            .from("device")
            .select(`
                device_id,
                station_id
            `)
            .in(
                "station_id",
                stationIds
            );

        if (deviceError) {
            console.error(
                "Sensor device lookup error:",
                deviceError
            );

            throw deviceError;
        }

        if (
            !devices ||
            devices.length === 0
        ) {
            return [];
        }


        // =================================================
        // STEP 2: CREATE DEVICE → STATION MAP
        // =================================================

        const deviceStationMap = {};

        for (const device of devices) {

            deviceStationMap[
                device.device_id
            ] =
                device.station_id;
        }


        // =================================================
        // STEP 3: GET SENSORS
        // =================================================

        const deviceIds =
            devices.map(
                (device) =>
                    device.device_id
            );

        const {
            data: sensors,
            error: sensorError,
        } = await supabase
            .from("sensor")
            .select(`
                sensor_id,
                sensor_type,
                model,
                serial_number,
                installation_date,
                calibration_date,
                device_id,
                status
            `)
            .in(
                "device_id",
                deviceIds
            );

        if (sensorError) {
            console.error(
                "getSensorsForAlertEngine sensor error:",
                sensorError
            );

            throw sensorError;
        }


        // =================================================
        // STEP 4: ADD station_id INTERNALLY
        // =================================================

        return (sensors || []).map(
            (sensor) => ({
                ...sensor,

                station_id:
                    deviceStationMap[
                        sensor.device_id
                    ],
            })
        );
    };


// =========================================================
// FIND CONFIGURATION
//
// IMPORTANT:
// Exact alert_type + parameter is checked FIRST.
//
// This prevents:
//
// POLLUTANT + PM10
//
// from accidentally using:
//
// POLLUTANT + PM2.5
// =========================================================

const findConfiguration = (
    enabledConfigurations,
    configurationMap,
    alertType,
    parameter
) => {

    const normalizedParameter =
        normalizeParameter(
            parameter
        );

    const normalizedType =
        String(
            alertType || ""
        )
            .trim()
            .toUpperCase();


    // =================================================
    // 1. EXACT TYPE + PARAMETER
    // =================================================

    const exactKey =
        `${normalizedType}:${normalizedParameter}`;

    if (
        configurationMap[
            exactKey
        ]
    ) {
        return configurationMap[
            exactKey
        ];
    }


    // =================================================
    // 2. EXACT PARAMETER
    // =================================================

    if (
        configurationMap[
            normalizedParameter
        ]
    ) {
        return configurationMap[
            normalizedParameter
        ];
    }


    // =================================================
    // 3. ALERT TYPE FALLBACK
    // =================================================

    const typeMatch =
        enabledConfigurations.find(
            (configuration) => {

                const configType =
                    String(
                        configuration.alert_type ||
                        ""
                    )
                        .trim()
                        .toUpperCase();

                return (
                    configType ===
                    normalizedType
                );
            }
        );

    if (typeMatch) {
        return typeMatch;
    }


    // =================================================
    // 4. PARAMETER FALLBACK
    // =================================================

    return enabledConfigurations.find(
        (configuration) => {

            const configParameter =
                normalizeParameter(
                    configuration.parameter ||
                    ""
                );

            return (
                configParameter ===
                normalizedParameter
            );
        }
    );
};


// =========================================================
// EVALUATE ALERTS
//
// MAIN ALERT ENGINE
// =========================================================

const evaluateAlerts = async () => {

    try {

        console.log(
            "=============================================="
        );

        console.log(
            "STARTING ALERT EVALUATION"
        );

        console.log(
            "=============================================="
        );


        // =================================================
        // 1. LOAD ENABLED CONFIGURATIONS
        // =================================================

        const {
            data: configurations,
            error: configurationError,
        } = await supabase
            .from(
                "alert_configuration"
            )
            .select("*")
            .eq(
                "enabled",
                true
            );

        if (configurationError) {
            throw configurationError;
        }

        const enabledConfigurations =
            configurations || [];

        console.log(
            `Enabled alert configurations: ${enabledConfigurations.length}`
        );


        // =================================================
        // 2. LOAD STATIONS
        // =================================================

        const stations =
            await getStationsForAlertEngine();

        console.log(
            `Stations found: ${stations.length}`
        );

        if (
            stations.length === 0
        ) {

            return {
                evaluated: true,

                stationsChecked:
                    0,

                configurationsChecked:
                    enabledConfigurations.length,

                alertsCreated:
                    0,

                breakdown: {
                    aqi: 0,
                    pollutant: 0,
                    battery: 0,
                    stationOffline: 0,
                    network: 0,
                    sensorFault: 0,
                },
            };
        }


        // =================================================
        // 3. STATION IDS
        // =================================================

        const stationIds =
            stations.map(
                (station) =>
                    station.station_id
            );


        // =================================================
        // 4. LOAD ALL DATA
        // =================================================

        const [
            latestAQI,
            latestPollutants,
            devices,
            sensors,
        ] = await Promise.all([

            getLatestAQIForStations(
                stationIds
            ),

            getLatestPollutantReadings(
                stationIds
            ),

            getDevicesForAlertEngine(
                stationIds
            ),

            getSensorsForAlertEngine(
                stationIds
            ),
        ]);


        console.log(
            `Devices found: ${devices.length}`
        );

        console.log(
            `Sensors found: ${sensors.length}`
        );


        // =================================================
        // 5. DEVICE LOOKUP BY STATION
        // =================================================

        const devicesByStation = {};

        for (
            const device of
            devices
        ) {

            if (
                !devicesByStation[
                    device.station_id
                ]
            ) {
                devicesByStation[
                    device.station_id
                ] = [];
            }

            devicesByStation[
                device.station_id
            ].push(device);
        }


        // =================================================
        // 6. SENSOR LOOKUP BY STATION
        // =================================================

        const sensorsByStation = {};

        for (
            const sensor of
            sensors
        ) {

            if (
                !sensor.station_id
            ) {
                continue;
            }

            if (
                !sensorsByStation[
                    sensor.station_id
                ]
            ) {
                sensorsByStation[
                    sensor.station_id
                ] = [];
            }

            sensorsByStation[
                sensor.station_id
            ].push(sensor);
        }


        // =================================================
        // 7. COUNTERS
        // =================================================

        let alertsCreated = 0;

        const breakdown = {
            aqi: 0,
            pollutant: 0,
            battery: 0,
            stationOffline: 0,
            network: 0,
            sensorFault: 0,
        };


        // =================================================
        // 8. CONFIGURATION MAP
        // =================================================

        const configurationMap = {};

        for (
            const configuration of
            enabledConfigurations
        ) {

            const parameter =
                normalizeParameter(
                    configuration.parameter ||
                    ""
                );

            const alertType =
                String(
                    configuration.alert_type ||
                    ""
                )
                    .trim()
                    .toUpperCase();


            // Exact combination
            const key =
                `${alertType}:${parameter}`;

            configurationMap[
                key
            ] =
                configuration;


            // Parameter fallback
            if (
                parameter &&
                !configurationMap[
                    parameter
                ]
            ) {
                configurationMap[
                    parameter
                ] =
                    configuration;
            }
        }


        // =================================================
        // 9. PROCESS EACH STATION
        // =================================================

        for (
            const station of
            stations
        ) {

            const stationId =
                station.station_id;

            const stationName =
                station.name ||
                `Station ${stationId}`;

            console.log(
                `Checking station: ${stationName} (${stationId})`
            );


            // =================================================
            // A. AQI ALERT
            // =================================================

            const aqiReading =
                latestAQI[
                    stationId
                ];

            const aqiConfiguration =
                findConfiguration(
                    enabledConfigurations,
                    configurationMap,
                    "AQI",
                    "AQI"
                );

            if (
                aqiReading &&
                aqiConfiguration
            ) {

                const actualAQI =
                    Number(
                        aqiReading.aqi
                    );

                const severity =
                    getSeverity(
                        actualAQI,

                        aqiConfiguration.warning_threshold,

                        aqiConfiguration.critical_threshold
                    );


                if (severity) {

                    const threshold =
                        severity ===
                        "Critical"
                            ? aqiConfiguration.critical_threshold
                            : aqiConfiguration.warning_threshold;

                    const rule =
                        createThresholdRule(
                            aqiConfiguration.warning_threshold,

                            aqiConfiguration.critical_threshold
                        );

                    const result =
                        await createAlert({
                            stationId,

                            alertType:
                                "AQI",

                            parameter:
                                "AQI",

                            actualValue:
                                actualAQI,

                            thresholdValue:
                                threshold,

                            severity,

                            rule,
                        });


                    if (
                        result.created
                    ) {

                        alertsCreated++;

                        breakdown.aqi++;
                    }

                } else {

                    await resolveClearedAlert({
                        stationId,

                        parameter:
                            "AQI",
                    });
                }
            }


            // =================================================
            // B. POLLUTANT ALERTS
            // =================================================

            const stationPollutants =
                latestPollutants[
                    stationId
                ] || {};


            for (
                const parameter of
                Object.keys(
                    stationPollutants
                )
            ) {

                const reading =
                    stationPollutants[
                        parameter
                    ];

                if (!reading) {
                    continue;
                }


                // Example normalized values:
                //
                // PM2.5 → pm25
                // PM10  → pm10
                // NO2   → no2
                // SO2   → so2
                // CO    → co
                // O3    → o3

                const configuration =
                    findConfiguration(
                        enabledConfigurations,
                        configurationMap,
                        "POLLUTANT",
                        parameter
                    );


                if (
                    !configuration
                ) {
                    console.log(
                        `No pollutant configuration found for ${parameter}`
                    );

                    continue;
                }


                const actualValue =
                    Number(
                        reading.value
                    );


                if (
                    !Number.isFinite(
                        actualValue
                    )
                ) {
                    continue;
                }


                const severity =
                    getSeverity(
                        actualValue,

                        configuration.warning_threshold,

                        configuration.critical_threshold
                    );


                if (severity) {

                    const threshold =
                        severity ===
                        "Critical"
                            ? configuration.critical_threshold
                            : configuration.warning_threshold;


                    const displayParameter =
                        String(
                            reading.parameter ||
                            parameter
                        ).toUpperCase();


                    const unit =
                        reading.unit ||
                        "";


                    const rule =
                        createThresholdRule(
                            configuration.warning_threshold,

                            configuration.critical_threshold
                        );


                    const result =
                        await createAlert({
                            stationId,

                            alertType:
                                "POLLUTANT",

                            parameter:
                                parameter,

                            actualValue,

                            thresholdValue:
                                threshold,

                            severity,

                            rule,
                        });


                    if (
                        result.created
                    ) {

                        alertsCreated++;

                        breakdown.pollutant++;

                        console.log(
                            `Pollutant alert created: ${stationName} / ${displayParameter} / ${actualValue} ${unit}`
                        );
                    }

                } else {

                    await resolveClearedAlert({
                        stationId,

                        parameter,
                    });
                }
            }


            // =================================================
            // C. DEVICE ALERTS
            // =================================================

            const stationDevices =
                devicesByStation[
                    stationId
                ] || [];


            for (
                const device of
                stationDevices
            ) {


                // =================================================
                // C1. BATTERY ALERT
                // =================================================

                const battery =
                    Number(
                        device.battery_level
                    );


                const batteryConfiguration =
                    findConfiguration(
                        enabledConfigurations,
                        configurationMap,
                        "BATTERY",
                        "Battery"
                    );


                if (
                    Number.isFinite(
                        battery
                    ) &&
                    batteryConfiguration
                ) {

                    const criticalBattery =
                        Number(
                            batteryConfiguration.critical_threshold
                        );

                    const warningBattery =
                        Number(
                            batteryConfiguration.warning_threshold
                        );


                    let batterySeverity =
                        null;


                    // Lower battery = worse

                    if (
                        Number.isFinite(
                            criticalBattery
                        ) &&
                        battery <=
                            criticalBattery
                    ) {

                        batterySeverity =
                            "Critical";

                    } else if (
                        Number.isFinite(
                            warningBattery
                        ) &&
                        battery <=
                            warningBattery
                    ) {

                        batterySeverity =
                            "Warning";
                    }


                    if (
                        batterySeverity
                    ) {

                        const threshold =
                            batterySeverity ===
                            "Critical"
                                ? criticalBattery
                                : warningBattery;


                        const result =
                            await createAlert({
                                stationId,

                                alertType:
                                    "BATTERY",

                                parameter:
                                    "Battery",

                                actualValue:
                                    battery,

                                thresholdValue:
                                    threshold,

                                severity:
                                    batterySeverity,

                                rule:
                                    `Warning <= ${warningBattery}%, Critical <= ${criticalBattery}%`,
                            });


                        if (
                            result.created
                        ) {

                            alertsCreated++;

                            breakdown.battery++;
                        }

                    } else {

                        await resolveClearedAlert({
                            stationId,

                            parameter:
                                "Battery",
                        });
                    }
                }


                // =================================================
                // C2. NETWORK ALERT
                // =================================================

                const networkStatus =
                    String(
                        device.network_status ||
                        device.status ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                const networkConfiguration =
                    findConfiguration(
                        enabledConfigurations,
                        configurationMap,
                        "NETWORK",
                        "Network"
                    );


                const networkIsOffline =
                    [
                        "offline",
                        "disconnected",
                        "down",
                        "failed",
                        "inactive",
                    ].includes(
                        networkStatus
                    );


                if (
                    networkIsOffline &&
                    networkConfiguration
                ) {

                    const result =
                        await createAlert({
                            stationId,

                            alertType:
                                "NETWORK",

                            parameter:
                                "Network",

                            actualValue:
                                null,

                            thresholdValue:
                                null,

                            severity:
                                "Critical",

                            rule:
                                "Network disconnected",
                        });


                    if (
                        result.created
                    ) {

                        alertsCreated++;

                        breakdown.network++;
                    }

                } else if (
                    !networkIsOffline
                ) {

                    await resolveClearedAlert({
                        stationId,

                        parameter:
                            "Network",
                    });
                }
            }


            // =================================================
            // D. STATION OFFLINE ALERT
            // =================================================

            const stationConfiguration =
                findConfiguration(
                    enabledConfigurations,
                    configurationMap,
                    "STATION_OFFLINE",
                    "Station"
                );


            const stationDevicesForOffline =
                devicesByStation[
                    stationId
                ] || [];


            let stationIsOffline =
                false;


            // -------------------------------------------------
            // CHECK station.status
            // -------------------------------------------------

            const stationStatus =
                String(
                    station.status ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (
                [
                    "offline",
                    "inactive",
                    "down",
                ].includes(
                    stationStatus
                )
            ) {

                stationIsOffline =
                    true;
            }


            // -------------------------------------------------
            // CHECK ALL DEVICES
            // -------------------------------------------------

            if (
                stationDevicesForOffline.length >
                    0 &&
                stationDevicesForOffline.every(
                    (device) => {

                        const status =
                            String(
                                device.network_status ||
                                device.status ||
                                ""
                            )
                                .trim()
                                .toLowerCase();


                        return [
                            "offline",
                            "disconnected",
                            "down",
                            "inactive",
                        ].includes(
                            status
                        );
                    }
                )
            ) {

                stationIsOffline =
                    true;
            }


            if (
                stationIsOffline &&
                stationConfiguration
            ) {

                const result =
                    await createAlert({
                        stationId,

                        alertType:
                            "STATION_OFFLINE",

                        parameter:
                            "Station",

                        actualValue:
                            null,

                        thresholdValue:
                            null,

                        severity:
                            "Critical",

                        rule:
                            "Station offline",
                    });


                if (
                    result.created
                ) {

                    alertsCreated++;

                    breakdown.stationOffline++;
                }

            } else if (
                !stationIsOffline
            ) {

                await resolveClearedAlert({
                    stationId,

                    parameter:
                        "Station",
                });
            }


            // =================================================
            // E. SENSOR FAULT ALERT
            //
            // Sensor table only has:
            //
            // sensor_id
            // sensor_type
            // model
            // serial_number
            // installation_date
            // calibration_date
            // device_id
            // status
            //
            // Therefore we use sensor.status.
            // =================================================

            const stationSensors =
                sensorsByStation[
                    stationId
                ] || [];


            const sensorConfiguration =
                findConfiguration(
                    enabledConfigurations,
                    configurationMap,
                    "SENSOR_FAULT",
                    "Sensor"
                );


            for (
                const sensor of
                stationSensors
            ) {

                if (
                    !sensorConfiguration
                ) {
                    continue;
                }


                const sensorStatus =
                    String(
                        sensor.status ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                const sensorFault =
                    [
                        "fault",
                        "failed",
                        "error",
                        "offline",
                        "inactive",
                    ].includes(
                        sensorStatus
                    );


                if (
                    sensorFault
                ) {

                    const sensorType =
                        sensor.sensor_type ||
                        "Sensor";


                    const rule =
                        `Sensor fault: ${sensorType}, Status: ${sensor.status}`;


                    const result =
                        await createAlert({
                            stationId,

                            alertType:
                                "SENSOR_FAULT",

                            parameter:
                                "Sensor",

                            actualValue:
                                null,

                            thresholdValue:
                                null,

                            severity:
                                "Critical",

                            rule,
                        });


                    if (
                        result.created
                    ) {

                        alertsCreated++;

                        breakdown.sensorFault++;

                        console.log(
                            `Sensor fault alert created for ${sensor.sensor_id}`
                        );
                    }

                } else {

                    await resolveClearedAlert({
                        stationId,

                        parameter:
                            "Sensor",
                    });
                }
            }
        }


        // =================================================
        // FINAL RESULT
        // =================================================

        console.log(
            "=============================================="
        );

        console.log(
            `ALERT EVALUATION COMPLETED - ${alertsCreated} new alert(s)`
        );

        console.log(
            "Alert breakdown:",
            breakdown
        );

        console.log(
            "=============================================="
        );


        return {
            evaluated: true,

            stationsChecked:
                stations.length,

            configurationsChecked:
                enabledConfigurations.length,

            alertsCreated,

            breakdown,
        };

    } catch (error) {

        console.error(
            "evaluateAlerts error:",
            error
        );

        throw error;
    }
};


// =========================================================
// MANUAL ALERT RULE EVALUATION
// POST /api/alerts/evaluate
// =========================================================

const evaluateAlertRules = async (
    req,
    res
) => {
    try {

        console.log(
            "=============================================="
        );

        console.log(
            "STARTING ALERT RULE EVALUATION"
        );

        console.log(
            "=============================================="
        );


        const result =
            await evaluateAlerts();


        return res.status(200).json({
            status: "success",

            message:
                "Alert rules evaluated successfully.",

            result: {
                evaluated:
                    result.evaluated,

                configurationsEvaluated:
                    result.configurationsChecked,

                stationsEvaluated:
                    result.stationsChecked,

                generated:
                    result.alertsCreated,

                resolved: 0,

                alerts: [],

                resolvedAlerts: [],

                breakdown:
                    result.breakdown,
            },
        });

    } catch (error) {

        console.error(
            "evaluateAlertRules error:",
            error
        );

        return res.status(500).json({
            status: "error",

            message:
                error.message ||
                "Alert evaluation failed.",
        });
    }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    getAlerts,
    acknowledgeAlert,
    resolveAlert,
    evaluateAlertRules,
    evaluateAlerts,
    getAlertConfigurations,
    updateAlertConfiguration,
};