const supabase = require("../config/supabase");

// Default settings object
const DEFAULT_SETTINGS = {
    system_name: "PMC Air Quality Monitoring System",
    organization: "Pune Municipal Corporation",
    aqi_standard: "CPCB National AQI",
    timezone: "Asia/Kolkata",
    dashboard_refresh_seconds: 10,
    aqi_warning_threshold: 101,
    aqi_critical_threshold: 201,
    pm25_warning_threshold: 60,
    pm25_critical_threshold: 90,
    pm10_warning_threshold: 100,
    pm10_critical_threshold: 250,
    no2_warning_threshold: 80,
    no2_critical_threshold: 180,
    so2_warning_threshold: 80,
    so2_critical_threshold: 380,
    o3_warning_threshold: 100,
    o3_critical_threshold: 168,
    device_offline_timeout_minutes: 15,
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

// Get Settings
async function getSettings(req, res) {
    try {
        // You can fetch from a 'settings' table if you created one, 
        // or return the defaults/stored configuration successfully.
        return res.status(200).json({
            success: true,
            settings: DEFAULT_SETTINGS,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// Update Settings
async function updateSettings(req, res) {
    try {
        const newSettings = req.body;

        // Perform any necessary validation or database save logic here

        return res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            settings: newSettings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// Reset Settings
async function resetSettings(req, res) {
    try {
        return res.status(200).json({
            success: true,
            message: "Settings reset to defaults",
            settings: DEFAULT_SETTINGS,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = {
    getSettings,
    updateSettings,
    resetSettings,
};