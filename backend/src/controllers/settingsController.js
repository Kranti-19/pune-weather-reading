const supabase = require("../config/supabase");

// ============================================================
// DEFAULT SYSTEM SETTINGS
// ============================================================

const DEFAULT_SYSTEM_SETTINGS = {
    system_name: "PMC Air Quality Monitoring System",
    organization: "Pune Municipal Corporation",
    aqi_standard: "CPCB National AQI",
    timezone: "Asia/Kolkata",

    dashboard_refresh_seconds: 10,

    openaq_sync_interval_minutes: 10,
    data_freshness_minutes: 60,

    live_monitoring: true,
    data_validation: true,
    device_health_monitoring: true,

    notify_high_aqi: true,
    notify_pollutant_threshold: true,
    notify_station_offline: true,
    notify_sensor_fault: true,
    notify_low_battery: true,
    notify_network_failure: true,
    notify_calibration_due: true,
    notify_maintenance_due: true,
};

// ============================================================
// DEFAULT ALERT CONFIGURATIONS
// ============================================================

const DEFAULT_ALERT_CONFIGURATIONS = {
    AQI: {
        alert_type: "AQI",
        parameter: "AQI",
        warning_threshold: 201,
        critical_threshold: 301,
        no_data_minutes: null,
        due_days: null,
        enabled: true,
    },

    PM2_5: {
        alert_type: "POLLUTANT",
        parameter: "PM2.5",
        warning_threshold: 60,
        critical_threshold: 90,
        no_data_minutes: null,
        due_days: null,
        enabled: true,
    },

    PM10: {
        alert_type: "POLLUTANT",
        parameter: "PM10",
        warning_threshold: 100,
        critical_threshold: 150,
        no_data_minutes: null,
        due_days: null,
        enabled: true,
    },

    NO2: {
        alert_type: "POLLUTANT",
        parameter: "NO2",
        warning_threshold: 80,
        critical_threshold: 120,
        no_data_minutes: null,
        due_days: null,
        enabled: true,
    },

    SO2: {
        alert_type: "POLLUTANT",
        parameter: "SO2",
        warning_threshold: 80,
        critical_threshold: 120,
        no_data_minutes: null,
        due_days: null,
        enabled: true,
    },

    CO: {
        alert_type: "POLLUTANT",
        parameter: "CO",
        warning_threshold: 2,
        critical_threshold: 4,
        no_data_minutes: null,
        due_days: null,
        enabled: true,
    },

    O3: {
        alert_type: "POLLUTANT",
        parameter: "O3",
        warning_threshold: 100,
        critical_threshold: 180,
        no_data_minutes: null,
        due_days: null,
        enabled: true,
    },

    STATION_OFFLINE: {
        alert_type: "STATION_OFFLINE",
        parameter: "Station",
        warning_threshold: null,
        critical_threshold: null,
        no_data_minutes: 15,
        due_days: null,
        enabled: true,
    },

    SENSOR_FAULT: {
        alert_type: "SENSOR_FAULT",
        parameter: "Sensor",
        warning_threshold: null,
        critical_threshold: null,
        no_data_minutes: null,
        due_days: null,
        enabled: true,
    },

    BATTERY: {
        alert_type: "BATTERY",
        parameter: "Battery",
        warning_threshold: 30,
        critical_threshold: 15,
        no_data_minutes: null,
        due_days: null,
        enabled: true,
    },

    NETWORK: {
        alert_type: "NETWORK",
        parameter: "Network",
        warning_threshold: null,
        critical_threshold: null,
        no_data_minutes: null,
        due_days: null,
        enabled: true,
    },

    CALIBRATION: {
        alert_type: "CALIBRATION",
        parameter: "Calibration",
        warning_threshold: null,
        critical_threshold: null,
        no_data_minutes: null,
        due_days: 7,
        enabled: true,
    },

    MAINTENANCE: {
        alert_type: "MAINTENANCE",
        parameter: "Maintenance",
        warning_threshold: null,
        critical_threshold: null,
        no_data_minutes: null,
        due_days: 7,
        enabled: true,
    },
};

// ============================================================
// HELPER - GET SYSTEM SETTINGS ROW
// ============================================================

async function getSystemSettingsRow() {
    const {
        data,
        error,
    } = await supabase
        .from("system_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data || null;
}

// ============================================================
// HELPER - GET ALERT CONFIGURATIONS
// ============================================================

async function getAlertConfigurations() {
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
        throw error;
    }

    return data || [];
}

// ============================================================
// HELPER - FIND ALERT CONFIGURATION
// ============================================================

function findAlertConfiguration(
    configurations,
    alertType,
    parameter
) {
    return configurations.find(
        (config) =>
            config.alert_type === alertType &&
            config.parameter === parameter
    );
}

// ============================================================
// HELPER - UPDATE ALERT CONFIGURATION
// ============================================================

async function updateAlertConfiguration(
    alertType,
    parameter,
    values
) {
    const updateData = {
        ...values,
        updated_at: new Date().toISOString(),
    };

    const {
        data,
        error,
    } = await supabase
        .from("alert_configuration")
        .update(updateData)
        .eq("alert_type", alertType)
        .eq("parameter", parameter)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

// ============================================================
// GET SETTINGS
// ============================================================

async function getSettings(req, res) {
    try {
        // ------------------------------------------------------
        // Get system settings
        // ------------------------------------------------------

        const systemSettings =
            await getSystemSettingsRow();

        // ------------------------------------------------------
        // Get alert configurations
        // ------------------------------------------------------

        const alertConfigurations =
            await getAlertConfigurations();

        // ------------------------------------------------------
        // Start with default system settings
        // ------------------------------------------------------

        const settings = {
            ...DEFAULT_SYSTEM_SETTINGS,
        };

        // ------------------------------------------------------
        // Merge saved system settings
        // ------------------------------------------------------

        if (systemSettings) {
            Object.keys(
                DEFAULT_SYSTEM_SETTINGS
            ).forEach((key) => {
                if (
                    systemSettings[key] !==
                        undefined &&
                    systemSettings[key] !== null
                ) {
                    settings[key] =
                        systemSettings[key];
                }
            });
        }

        // ======================================================
        // AQI
        // ======================================================

        const aqiConfig =
            findAlertConfiguration(
                alertConfigurations,
                "AQI",
                "AQI"
            );

        if (aqiConfig) {
            settings.aqi_warning_threshold =
                aqiConfig.warning_threshold;

            settings.aqi_critical_threshold =
                aqiConfig.critical_threshold;

            settings.notify_high_aqi =
                aqiConfig.enabled;
        } else {
            settings.aqi_warning_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.AQI
                    .warning_threshold;

            settings.aqi_critical_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.AQI
                    .critical_threshold;
        }

        // ======================================================
        // POLLUTANTS
        // ======================================================

        // IMPORTANT:
        // Correct variable name is pollutantConfigs
        // NOT pollutConfigs

        const pollutantConfigs =
            alertConfigurations.filter(
                (config) =>
                    config.alert_type ===
                    "POLLUTANT"
            );

        // ------------------------------------------------------
        // PM2.5
        // ------------------------------------------------------

        const pm25Config =
            pollutantConfigs.find(
                (config) =>
                    config.parameter ===
                    "PM2.5"
            );

        if (pm25Config) {
            settings.pm25_warning_threshold =
                pm25Config.warning_threshold;

            settings.pm25_critical_threshold =
                pm25Config.critical_threshold;
        } else {
            settings.pm25_warning_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.PM2_5
                    .warning_threshold;

            settings.pm25_critical_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.PM2_5
                    .critical_threshold;
        }

        // ------------------------------------------------------
        // PM10
        // ------------------------------------------------------

        const pm10Config =
            pollutantConfigs.find(
                (config) =>
                    config.parameter ===
                    "PM10"
            );

        if (pm10Config) {
            settings.pm10_warning_threshold =
                pm10Config.warning_threshold;

            settings.pm10_critical_threshold =
                pm10Config.critical_threshold;
        } else {
            settings.pm10_warning_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.PM10
                    .warning_threshold;

            settings.pm10_critical_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.PM10
                    .critical_threshold;
        }

        // ------------------------------------------------------
        // NO2
        // ------------------------------------------------------

        const no2Config =
            pollutantConfigs.find(
                (config) =>
                    config.parameter ===
                    "NO2"
            );

        if (no2Config) {
            settings.no2_warning_threshold =
                no2Config.warning_threshold;

            settings.no2_critical_threshold =
                no2Config.critical_threshold;
        } else {
            settings.no2_warning_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.NO2
                    .warning_threshold;

            settings.no2_critical_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.NO2
                    .critical_threshold;
        }

        // ------------------------------------------------------
        // SO2
        // ------------------------------------------------------

        const so2Config =
            pollutantConfigs.find(
                (config) =>
                    config.parameter ===
                    "SO2"
            );

        if (so2Config) {
            settings.so2_warning_threshold =
                so2Config.warning_threshold;

            settings.so2_critical_threshold =
                so2Config.critical_threshold;
        } else {
            settings.so2_warning_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.SO2
                    .warning_threshold;

            settings.so2_critical_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.SO2
                    .critical_threshold;
        }

        // ------------------------------------------------------
        // CO
        // ------------------------------------------------------

        const coConfig =
            pollutantConfigs.find(
                (config) =>
                    config.parameter ===
                    "CO"
            );

        if (coConfig) {
            settings.co_warning_threshold =
                coConfig.warning_threshold;

            settings.co_critical_threshold =
                coConfig.critical_threshold;
        } else {
            settings.co_warning_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.CO
                    .warning_threshold;

            settings.co_critical_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.CO
                    .critical_threshold;
        }

        // ------------------------------------------------------
        // O3
        // ------------------------------------------------------

        const o3Config =
            pollutantConfigs.find(
                (config) =>
                    config.parameter ===
                    "O3"
            );

        if (o3Config) {
            settings.o3_warning_threshold =
                o3Config.warning_threshold;

            settings.o3_critical_threshold =
                o3Config.critical_threshold;
        } else {
            settings.o3_warning_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.O3
                    .warning_threshold;

            settings.o3_critical_threshold =
                DEFAULT_ALERT_CONFIGURATIONS.O3
                    .critical_threshold;
        }

        // ------------------------------------------------------
        // Pollutant notification
        // ------------------------------------------------------

        if (
            pollutantConfigs.length > 0
        ) {
            settings.notify_pollutant_threshold =
                pollutantConfigs.every(
                    (config) =>
                        config.enabled === true
                );
        }

        // ======================================================
        // STATION OFFLINE
        // ======================================================

        const stationOfflineConfig =
            findAlertConfiguration(
                alertConfigurations,
                "STATION_OFFLINE",
                "Station"
            );

        if (stationOfflineConfig) {
            settings.device_offline_timeout_minutes =
                stationOfflineConfig.no_data_minutes;

            settings.notify_station_offline =
                stationOfflineConfig.enabled;
        } else {
            settings.device_offline_timeout_minutes =
                DEFAULT_ALERT_CONFIGURATIONS
                    .STATION_OFFLINE
                    .no_data_minutes;
        }

        // ======================================================
        // SENSOR FAULT
        // ======================================================

        const sensorFaultConfig =
            findAlertConfiguration(
                alertConfigurations,
                "SENSOR_FAULT",
                "Sensor"
            );

        if (sensorFaultConfig) {
            settings.notify_sensor_fault =
                sensorFaultConfig.enabled;
        }

        // ======================================================
        // BATTERY
        // ======================================================

        const batteryConfig =
            findAlertConfiguration(
                alertConfigurations,
                "BATTERY",
                "Battery"
            );

        if (batteryConfig) {
            settings.battery_warning_threshold =
                batteryConfig.warning_threshold;

            settings.battery_critical_threshold =
                batteryConfig.critical_threshold;

            settings.notify_low_battery =
                batteryConfig.enabled;
        } else {
            settings.battery_warning_threshold =
                DEFAULT_ALERT_CONFIGURATIONS
                    .BATTERY
                    .warning_threshold;

            settings.battery_critical_threshold =
                DEFAULT_ALERT_CONFIGURATIONS
                    .BATTERY
                    .critical_threshold;
        }

        // ======================================================
        // NETWORK
        // ======================================================

        const networkConfig =
            findAlertConfiguration(
                alertConfigurations,
                "NETWORK",
                "Network"
            );

        if (networkConfig) {
            settings.notify_network_failure =
                networkConfig.enabled;
        }

        // ======================================================
        // CALIBRATION
        // ======================================================

        const calibrationConfig =
            findAlertConfiguration(
                alertConfigurations,
                "CALIBRATION",
                "Calibration"
            );

        if (calibrationConfig) {
            settings.calibration_due_days =
                calibrationConfig.due_days;

            settings.notify_calibration_due =
                calibrationConfig.enabled;
        } else {
            settings.calibration_due_days =
                DEFAULT_ALERT_CONFIGURATIONS
                    .CALIBRATION
                    .due_days;
        }

        // ======================================================
        // MAINTENANCE
        // ======================================================

        const maintenanceConfig =
            findAlertConfiguration(
                alertConfigurations,
                "MAINTENANCE",
                "Maintenance"
            );

        if (maintenanceConfig) {
            settings.maintenance_due_days =
                maintenanceConfig.due_days;

            settings.notify_maintenance_due =
                maintenanceConfig.enabled;
        } else {
            settings.maintenance_due_days =
                DEFAULT_ALERT_CONFIGURATIONS
                    .MAINTENANCE
                    .due_days;
        }

        // ======================================================
        // RESPONSE
        // ======================================================

        return res.status(200).json({
            success: true,
            settings,
            alertConfigurations,
        });

    } catch (error) {
        console.error(
            "Get settings error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get settings",
        });
    }
}

// ============================================================
// VALIDATE NUMBER
// ============================================================

function isValidNumber(value) {
    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isFinite(Number(value))
    );
}

// ============================================================
// VALIDATE THRESHOLD PAIR
// ============================================================

function validateThresholdPair(
    warning,
    critical,
    name
) {
    if (
        !isValidNumber(warning) ||
        !isValidNumber(critical)
    ) {
        return `${name} thresholds must be valid numbers.`;
    }

    if (
        Number(warning) >=
        Number(critical)
    ) {
        return `${name} warning threshold must be lower than critical threshold.`;
    }

    return null;
}

// ============================================================
// UPDATE SETTINGS
// ============================================================

async function updateSettings(req, res) {
    try {
        const incoming = req.body || {};

        // ======================================================
        // VALIDATE AQI
        // ======================================================

        let validationError =
            validateThresholdPair(
                incoming.aqi_warning_threshold,
                incoming.aqi_critical_threshold,
                "AQI"
            );

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        // ======================================================
        // VALIDATE PM2.5
        // ======================================================

        validationError =
            validateThresholdPair(
                incoming.pm25_warning_threshold,
                incoming.pm25_critical_threshold,
                "PM2.5"
            );

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        // ======================================================
        // VALIDATE PM10
        // ======================================================

        validationError =
            validateThresholdPair(
                incoming.pm10_warning_threshold,
                incoming.pm10_critical_threshold,
                "PM10"
            );

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        // ======================================================
        // VALIDATE NO2
        // ======================================================

        validationError =
            validateThresholdPair(
                incoming.no2_warning_threshold,
                incoming.no2_critical_threshold,
                "NO2"
            );

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        // ======================================================
        // VALIDATE SO2
        // ======================================================

        validationError =
            validateThresholdPair(
                incoming.so2_warning_threshold,
                incoming.so2_critical_threshold,
                "SO2"
            );

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        // ======================================================
        // VALIDATE CO
        // ======================================================

        validationError =
            validateThresholdPair(
                incoming.co_warning_threshold,
                incoming.co_critical_threshold,
                "CO"
            );

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        // ======================================================
        // VALIDATE O3
        // ======================================================

        validationError =
            validateThresholdPair(
                incoming.o3_warning_threshold,
                incoming.o3_critical_threshold,
                "O3"
            );

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        // ======================================================
        // VALIDATE BATTERY
        // ======================================================

        if (
            isValidNumber(
                incoming.battery_warning_threshold
            ) &&
            isValidNumber(
                incoming.battery_critical_threshold
            )
        ) {
            if (
                Number(
                    incoming.battery_critical_threshold
                ) >=
                Number(
                    incoming.battery_warning_threshold
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Battery critical threshold must be lower than warning threshold.",
                });
            }
        }

        // ======================================================
        // GENERAL VALIDATIONS
        // ======================================================

        if (
            isValidNumber(
                incoming.dashboard_refresh_seconds
            ) &&
            Number(
                incoming.dashboard_refresh_seconds
            ) < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Dashboard refresh must be at least 1 second.",
            });
        }

        if (
            isValidNumber(
                incoming.openaq_sync_interval_minutes
            ) &&
            Number(
                incoming.openaq_sync_interval_minutes
            ) < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "OpenAQ sync interval must be at least 1 minute.",
            });
        }

        if (
            isValidNumber(
                incoming.data_freshness_minutes
            ) &&
            Number(
                incoming.data_freshness_minutes
            ) < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Data freshness must be at least 1 minute.",
            });
        }

        if (
            isValidNumber(
                incoming.device_offline_timeout_minutes
            ) &&
            Number(
                incoming.device_offline_timeout_minutes
            ) < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Device offline timeout must be at least 1 minute.",
            });
        }

        // ======================================================
        // GET EXISTING SYSTEM SETTINGS
        // ======================================================

        const existingSystemSettings =
            await getSystemSettingsRow();

        // ======================================================
        // SYSTEM SETTINGS
        // ======================================================

        const systemFields = [
            "system_name",
            "organization",
            "aqi_standard",
            "timezone",
            "dashboard_refresh_seconds",
            "openaq_sync_interval_minutes",
            "data_freshness_minutes",
            "live_monitoring",
            "data_validation",
            "device_health_monitoring",
        ];

        const systemUpdate = {};

        systemFields.forEach(
            (field) => {
                if (
                    incoming[field] !==
                    undefined
                ) {
                    systemUpdate[field] =
                        incoming[field];
                }
            }
        );

        systemUpdate.updated_at =
            new Date().toISOString();

        // ======================================================
        // UPDATE EXISTING SYSTEM SETTINGS
        // ======================================================

        if (existingSystemSettings) {
            const {
                error,
            } = await supabase
                .from("system_settings")
                .update(systemUpdate)
                .eq(
                    "id",
                    existingSystemSettings.id
                );

            if (error) {
                throw error;
            }
        }

        // ======================================================
        // CREATE SYSTEM SETTINGS IF NOT EXISTS
        // ======================================================

        else {
            const {
                error,
            } = await supabase
                .from("system_settings")
                .insert({
                    ...DEFAULT_SYSTEM_SETTINGS,
                    ...systemUpdate,
                    updated_at:
                        new Date().toISOString(),
                });

            if (error) {
                throw error;
            }
        }

        // ======================================================
        // AQI CONFIGURATION
        // ======================================================

        await updateAlertConfiguration(
            "AQI",
            "AQI",
            {
                warning_threshold:
                    incoming.aqi_warning_threshold,

                critical_threshold:
                    incoming.aqi_critical_threshold,

                enabled:
                    incoming.notify_high_aqi ??
                    true,
            }
        );

        // ======================================================
        // POLLUTANT CONFIGURATION
        // ======================================================

        const pollutantEnabled =
            incoming.notify_pollutant_threshold ??
            true;

        // ------------------------------------------------------
        // PM2.5
        // ------------------------------------------------------

        await updateAlertConfiguration(
            "POLLUTANT",
            "PM2.5",
            {
                warning_threshold:
                    incoming.pm25_warning_threshold,

                critical_threshold:
                    incoming.pm25_critical_threshold,

                enabled: pollutantEnabled,
            }
        );

        // ------------------------------------------------------
        // PM10
        // ------------------------------------------------------

        await updateAlertConfiguration(
            "POLLUTANT",
            "PM10",
            {
                warning_threshold:
                    incoming.pm10_warning_threshold,

                critical_threshold:
                    incoming.pm10_critical_threshold,

                enabled: pollutantEnabled,
            }
        );

        // ------------------------------------------------------
        // NO2
        // ------------------------------------------------------

        await updateAlertConfiguration(
            "POLLUTANT",
            "NO2",
            {
                warning_threshold:
                    incoming.no2_warning_threshold,

                critical_threshold:
                    incoming.no2_critical_threshold,

                enabled: pollutantEnabled,
            }
        );

        // ------------------------------------------------------
        // SO2
        // ------------------------------------------------------

        await updateAlertConfiguration(
            "POLLUTANT",
            "SO2",
            {
                warning_threshold:
                    incoming.so2_warning_threshold,

                critical_threshold:
                    incoming.so2_critical_threshold,

                enabled: pollutantEnabled,
            }
        );

        // ------------------------------------------------------
        // CO
        // ------------------------------------------------------

        await updateAlertConfiguration(
            "POLLUTANT",
            "CO",
            {
                warning_threshold:
                    incoming.co_warning_threshold,

                critical_threshold:
                    incoming.co_critical_threshold,

                enabled: pollutantEnabled,
            }
        );

        // ------------------------------------------------------
        // O3
        // ------------------------------------------------------

        await updateAlertConfiguration(
            "POLLUTANT",
            "O3",
            {
                warning_threshold:
                    incoming.o3_warning_threshold,

                critical_threshold:
                    incoming.o3_critical_threshold,

                enabled: pollutantEnabled,
            }
        );

        // ======================================================
        // STATION OFFLINE
        // ======================================================

        await updateAlertConfiguration(
            "STATION_OFFLINE",
            "Station",
            {
                no_data_minutes:
                    incoming.device_offline_timeout_minutes,

                enabled:
                    incoming.notify_station_offline ??
                    true,
            }
        );

        // ======================================================
        // SENSOR FAULT
        // ======================================================

        await updateAlertConfiguration(
            "SENSOR_FAULT",
            "Sensor",
            {
                enabled:
                    incoming.notify_sensor_fault ??
                    true,
            }
        );

        // ======================================================
        // BATTERY
        // ======================================================

        const batteryUpdate = {
            enabled:
                incoming.notify_low_battery ??
                true,
        };

        if (
            incoming.battery_warning_threshold !==
            undefined
        ) {
            batteryUpdate.warning_threshold =
                incoming.battery_warning_threshold;
        }

        if (
            incoming.battery_critical_threshold !==
            undefined
        ) {
            batteryUpdate.critical_threshold =
                incoming.battery_critical_threshold;
        }

        await updateAlertConfiguration(
            "BATTERY",
            "Battery",
            batteryUpdate
        );

        // ======================================================
        // NETWORK
        // ======================================================

        await updateAlertConfiguration(
            "NETWORK",
            "Network",
            {
                enabled:
                    incoming.notify_network_failure ??
                    true,
            }
        );

        // ======================================================
        // CALIBRATION
        // ======================================================

        const calibrationUpdate = {
            enabled:
                incoming.notify_calibration_due ??
                true,
        };

        if (
            incoming.calibration_due_days !==
            undefined
        ) {
            calibrationUpdate.due_days =
                incoming.calibration_due_days;
        }

        await updateAlertConfiguration(
            "CALIBRATION",
            "Calibration",
            calibrationUpdate
        );

        // ======================================================
        // MAINTENANCE
        // ======================================================

        const maintenanceUpdate = {
            enabled:
                incoming.notify_maintenance_due ??
                true,
        };

        if (
            incoming.maintenance_due_days !==
            undefined
        ) {
            maintenanceUpdate.due_days =
                incoming.maintenance_due_days;
        }

        await updateAlertConfiguration(
            "MAINTENANCE",
            "Maintenance",
            maintenanceUpdate
        );

        // ======================================================
        // GET FINAL DATA
        // ======================================================

        const finalSystemSettings =
            await getSystemSettingsRow();

        const finalAlertConfigurations =
            await getAlertConfigurations();

        const finalSettings = {
            ...DEFAULT_SYSTEM_SETTINGS,
            ...(finalSystemSettings || {}),
            ...buildAlertSettings(
                finalAlertConfigurations
            ),
        };

        // ======================================================
        // RESPONSE
        // ======================================================

        return res.status(200).json({
            success: true,
            message:
                "Settings updated successfully",

            settings: finalSettings,

            alertConfigurations:
                finalAlertConfigurations,
        });

    } catch (error) {
        console.error(
            "Update settings error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update settings",
        });
    }
}

// ============================================================
// BUILD ALERT SETTINGS FOR FRONTEND
// ============================================================

function buildAlertSettings(
    configurations
) {
    const settings = {};

    // ==========================================================
    // AQI
    // ==========================================================

    const aqi =
        findAlertConfiguration(
            configurations,
            "AQI",
            "AQI"
        );

    if (aqi) {
        settings.aqi_warning_threshold =
            aqi.warning_threshold;

        settings.aqi_critical_threshold =
            aqi.critical_threshold;

        settings.notify_high_aqi =
            aqi.enabled;
    }

    // ==========================================================
    // POLLUTANTS
    // ==========================================================

    const pm25 =
        findAlertConfiguration(
            configurations,
            "POLLUTANT",
            "PM2.5"
        );

    if (pm25) {
        settings.pm25_warning_threshold =
            pm25.warning_threshold;

        settings.pm25_critical_threshold =
            pm25.critical_threshold;
    }

    const pm10 =
        findAlertConfiguration(
            configurations,
            "POLLUTANT",
            "PM10"
        );

    if (pm10) {
        settings.pm10_warning_threshold =
            pm10.warning_threshold;

        settings.pm10_critical_threshold =
            pm10.critical_threshold;
    }

    const no2 =
        findAlertConfiguration(
            configurations,
            "POLLUTANT",
            "NO2"
        );

    if (no2) {
        settings.no2_warning_threshold =
            no2.warning_threshold;

        settings.no2_critical_threshold =
            no2.critical_threshold;
    }

    const so2 =
        findAlertConfiguration(
            configurations,
            "POLLUTANT",
            "SO2"
        );

    if (so2) {
        settings.so2_warning_threshold =
            so2.warning_threshold;

        settings.so2_critical_threshold =
            so2.critical_threshold;
    }

    const co =
        findAlertConfiguration(
            configurations,
            "POLLUTANT",
            "CO"
        );

    if (co) {
        settings.co_warning_threshold =
            co.warning_threshold;

        settings.co_critical_threshold =
            co.critical_threshold;
    }

    const o3 =
        findAlertConfiguration(
            configurations,
            "POLLUTANT",
            "O3"
        );

    if (o3) {
        settings.o3_warning_threshold =
            o3.warning_threshold;

        settings.o3_critical_threshold =
            o3.critical_threshold;
    }

    // ==========================================================
    // POLLUTANT NOTIFICATION
    // ==========================================================

    const pollutantConfigurations =
        configurations.filter(
            (config) =>
                config.alert_type ===
                "POLLUTANT"
        );

    if (
        pollutantConfigurations.length > 0
    ) {
        settings.notify_pollutant_threshold =
            pollutantConfigurations.every(
                (config) =>
                    config.enabled === true
            );
    }

    // ==========================================================
    // STATION OFFLINE
    // ==========================================================

    const stationOffline =
        findAlertConfiguration(
            configurations,
            "STATION_OFFLINE",
            "Station"
        );

    if (stationOffline) {
        settings.device_offline_timeout_minutes =
            stationOffline.no_data_minutes;

        settings.notify_station_offline =
            stationOffline.enabled;
    }

    // ==========================================================
    // SENSOR FAULT
    // ==========================================================

    const sensorFault =
        findAlertConfiguration(
            configurations,
            "SENSOR_FAULT",
            "Sensor"
        );

    if (sensorFault) {
        settings.notify_sensor_fault =
            sensorFault.enabled;
    }

    // ==========================================================
    // BATTERY
    // ==========================================================

    const battery =
        findAlertConfiguration(
            configurations,
            "BATTERY",
            "Battery"
        );

    if (battery) {
        settings.battery_warning_threshold =
            battery.warning_threshold;

        settings.battery_critical_threshold =
            battery.critical_threshold;

        settings.notify_low_battery =
            battery.enabled;
    }

    // ==========================================================
    // NETWORK
    // ==========================================================

    const network =
        findAlertConfiguration(
            configurations,
            "NETWORK",
            "Network"
        );

    if (network) {
        settings.notify_network_failure =
            network.enabled;
    }

    // ==========================================================
    // CALIBRATION
    // ==========================================================

    const calibration =
        findAlertConfiguration(
            configurations,
            "CALIBRATION",
            "Calibration"
        );

    if (calibration) {
        settings.calibration_due_days =
            calibration.due_days;

        settings.notify_calibration_due =
            calibration.enabled;
    }

    // ==========================================================
    // MAINTENANCE
    // ==========================================================

    const maintenance =
        findAlertConfiguration(
            configurations,
            "MAINTENANCE",
            "Maintenance"
        );

    if (maintenance) {
        settings.maintenance_due_days =
            maintenance.due_days;

        settings.notify_maintenance_due =
            maintenance.enabled;
    }

    return settings;
}

// ============================================================
// RESET SETTINGS
// ============================================================

async function resetSettings(req, res) {
    try {
        // ======================================================
        // RESET SYSTEM SETTINGS
        // ======================================================

        const existingSystemSettings =
            await getSystemSettingsRow();

        if (existingSystemSettings) {
            const {
                error,
            } = await supabase
                .from("system_settings")
                .update({
                    ...DEFAULT_SYSTEM_SETTINGS,

                    updated_at:
                        new Date().toISOString(),
                })
                .eq(
                    "id",
                    existingSystemSettings.id
                );

            if (error) {
                throw error;
            }
        } else {
            const {
                error,
            } = await supabase
                .from("system_settings")
                .insert({
                    ...DEFAULT_SYSTEM_SETTINGS,

                    updated_at:
                        new Date().toISOString(),
                });

            if (error) {
                throw error;
            }
        }

        // ======================================================
        // GET CURRENT ALERT CONFIGURATIONS
        // ======================================================

        const configurations =
            await getAlertConfigurations();

        // ======================================================
        // RESET EVERY DEFAULT CONFIGURATION
        // ======================================================

        for (
            const key of Object.keys(
                DEFAULT_ALERT_CONFIGURATIONS
            )
        ) {
            const defaultConfig =
                DEFAULT_ALERT_CONFIGURATIONS[
                    key
                ];

            const existingConfig =
                findAlertConfiguration(
                    configurations,
                    defaultConfig.alert_type,
                    defaultConfig.parameter
                );

            // --------------------------------------------------
            // Existing configuration
            // --------------------------------------------------

            if (existingConfig) {
                const {
                    error,
                } = await supabase
                    .from(
                        "alert_configuration"
                    )
                    .update({
                        warning_threshold:
                            defaultConfig.warning_threshold,

                        critical_threshold:
                            defaultConfig.critical_threshold,

                        no_data_minutes:
                            defaultConfig.no_data_minutes,

                        due_days:
                            defaultConfig.due_days,

                        enabled:
                            defaultConfig.enabled,

                        updated_at:
                            new Date().toISOString(),
                    })
                    .eq(
                        "config_id",
                        existingConfig.config_id
                    );

                if (error) {
                    throw error;
                }
            }

            // --------------------------------------------------
            // Missing configuration
            // --------------------------------------------------

            else {
                const {
                    error,
                } = await supabase
                    .from(
                        "alert_configuration"
                    )
                    .insert({
                        ...defaultConfig,

                        updated_at:
                            new Date().toISOString(),
                    });

                if (error) {
                    throw error;
                }
            }
        }

        // ======================================================
        // GET FINAL DATA
        // ======================================================

        const finalSystemSettings =
            await getSystemSettingsRow();

        const finalAlertConfigurations =
            await getAlertConfigurations();

        const finalSettings = {
            ...DEFAULT_SYSTEM_SETTINGS,
            ...(finalSystemSettings || {}),
            ...buildAlertSettings(
                finalAlertConfigurations
            ),
        };

        // ======================================================
        // RESPONSE
        // ======================================================

        return res.status(200).json({
            success: true,

            message:
                "Settings reset to defaults",

            settings: finalSettings,

            alertConfigurations:
                finalAlertConfigurations,
        });

    } catch (error) {
        console.error(
            "Reset settings error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to reset settings",
        });
    }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    getSettings,
    updateSettings,
    resetSettings,
};