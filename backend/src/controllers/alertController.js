// backend/src/controllers/alertController.js

const supabase = require("../config/supabase");
const { evaluateAlerts } = require("../services/alertEngine");


// =========================================================
// GET ALL ALERTS
// GET /api/alerts
// =========================================================

const getAlerts = async (req, res) => {
  try {
    const { data, error } = await supabase
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
      console.error("Supabase get alerts error:", error);
      throw error;
    }

    return res.status(200).json({
      status: "success",
      alerts: data || [],
    });

  } catch (error) {
    console.error("getAlerts error:", error);

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

const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Alert ID is required.",
      });
    }

    const { data, error } = await supabase
      .from("alert")
      .update({
        acknowledgement: "Acknowledged",
        acknowledged_at: new Date().toISOString(),
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
      message: "Alert acknowledged successfully.",
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

const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Alert ID is required.",
      });
    }

    const { data, error } = await supabase
      .from("alert")
      .update({
        acknowledgement: "Resolved",
        acknowledged_at: new Date().toISOString(),
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
      message: "Alert resolved successfully.",
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
// EVALUATE ALERT RULES
// POST /api/alerts/evaluate
//
// Checks:
// - AQI
// - Pollutants
// - Station offline
// - Sensor fault
// - Battery
// - Network
// - Calibration
// - Maintenance
// =========================================================

const evaluateAlertRules = async (req, res) => {
  try {
    const result = await evaluateAlerts();

    return res.status(200).json({
      status: "success",
      message:
        "Alert rules evaluated successfully.",
      result,
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
// GET ALERT CONFIGURATIONS
// GET /api/alerts/configurations
// =========================================================

const getAlertConfigurations = async (req, res) => {
  try {
    const { data, error } = await supabase
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
      configurations: data || [],
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

const updateAlertConfiguration = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      warning_threshold,
      critical_threshold,
      no_data_minutes,
      due_days,
      enabled,
    } = req.body;


    // -------------------------------------------------------
    // CHECK CONFIGURATION ID
    // -------------------------------------------------------

    if (!id) {
      return res.status(400).json({
        status: "error",
        message:
          "Configuration ID is required.",
      });
    }


    // -------------------------------------------------------
    // HELPER
    // Convert empty values to NULL
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // CONVERT VALUES
    // -------------------------------------------------------

    const warningValue =
      numericOrNull(warning_threshold);

    const criticalValue =
      numericOrNull(critical_threshold);

    const noDataValue =
      numericOrNull(no_data_minutes);

    const dueDaysValue =
      numericOrNull(due_days);


    // -------------------------------------------------------
    // VALIDATE WARNING THRESHOLD
    // -------------------------------------------------------

    if (
      warning_threshold !== "" &&
      warning_threshold !== null &&
      warning_threshold !== undefined &&
      !Number.isFinite(
        Number(warning_threshold)
      )
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Warning threshold must be a valid number.",
      });
    }


    // -------------------------------------------------------
    // VALIDATE CRITICAL THRESHOLD
    // -------------------------------------------------------

    if (
      critical_threshold !== "" &&
      critical_threshold !== null &&
      critical_threshold !== undefined &&
      !Number.isFinite(
        Number(critical_threshold)
      )
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Critical threshold must be a valid number.",
      });
    }


    // -------------------------------------------------------
    // VALIDATE NO-DATA TIMEOUT
    // -------------------------------------------------------

    if (
      noDataValue !== null &&
      (
        !Number.isFinite(noDataValue) ||
        noDataValue <= 0
      )
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "No-data timeout must be greater than 0 minutes.",
      });
    }


    // -------------------------------------------------------
    // VALIDATE DUE DAYS
    // -------------------------------------------------------

    if (
      dueDaysValue !== null &&
      (
        !Number.isFinite(dueDaysValue) ||
        dueDaysValue < 0
      )
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Due days must be 0 or greater.",
      });
    }


    // -------------------------------------------------------
    // WARNING < CRITICAL
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // CONVERT ENABLED VALUE
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // UPDATE DATA
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // UPDATE DATABASE
    // -------------------------------------------------------

    const {
      data,
      error,
    } = await supabase
      .from("alert_configuration")
      .update(updateData)
      .eq("config_id", id)
      .select("*")
      .single();


    // -------------------------------------------------------
    // DATABASE ERROR
    // -------------------------------------------------------

    if (error) {
      console.error(
        "Supabase update configuration error:",
        error
      );

      throw error;
    }


    // -------------------------------------------------------
    // CONFIGURATION NOT FOUND
    // -------------------------------------------------------

    if (!data) {
      return res.status(404).json({
        status: "error",
        message:
          "Alert configuration not found.",
      });
    }


    // -------------------------------------------------------
    // SUCCESS
    // -------------------------------------------------------

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
// EXPORTS
// =========================================================

module.exports = {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  evaluateAlertRules,
  getAlertConfigurations,
  updateAlertConfiguration,
};