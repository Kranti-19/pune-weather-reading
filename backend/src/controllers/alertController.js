const supabase = require("../config/supabase");

// =====================================================
// GET ALL ALERTS
// GET /api/alerts
// =====================================================

const getAlerts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("alert")
            .select(`
                alert_id,
                station_id,
                parameter,
                threshold_rule,
                actual_value,
                severity,
                started_time,
                acknowledgement,
                acknowledged_at,
                station (
                    station_id,
                    name,
                    ward,
                    zone
                )
            `)
            .order("started_time", {
                ascending: false
            });

        if (error) {
            console.error("Get alerts error:", error);

            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }

        const alerts = (data || []).map((alert) => {

            let status = "Unresolved";

            if (alert.acknowledgement) {

                if (
                    alert.acknowledgement
                        .toLowerCase()
                        .includes("resolved")
                ) {
                    status = "Resolved";
                } else {
                    status = "Acknowledged";
                }
            }

            // Calculate readable time
            const startedTime =
                new Date(alert.started_time);

            const diff =
                Date.now() -
                startedTime.getTime();

            const minutes =
                Math.floor(
                    diff / (1000 * 60)
                );

            let timestamp;

            if (minutes < 1) {
                timestamp = "Just now";
            } else if (minutes < 60) {
                timestamp = `${minutes}m ago`;
            } else {

                const hours =
                    Math.floor(
                        minutes / 60
                    );

                if (hours < 24) {
                    timestamp =
                        `${hours}h ${minutes % 60}m ago`;
                } else {

                    const days =
                        Math.floor(
                            hours / 24
                        );

                    timestamp =
                        `${days}d ago`;
                }
            }

            // Determine category
            let category =
                "Air Quality / AQI";

            const parameter =
                alert.parameter
                    ?.toLowerCase() || "";

            if (
                parameter.includes("battery") ||
                parameter.includes("gateway") ||
                parameter.includes("power") ||
                parameter.includes("device")
            ) {
                category =
                    "Device & Battery";
            }

            if (
                parameter.includes("calibration") ||
                parameter.includes("maintenance")
            ) {
                category =
                    "Maintenance";
            }

            return {
                id:
                    `ALT-${String(
                        alert.alert_id
                    ).padStart(3, "0")}`,

                alertId:
                    alert.alert_id,

                station:
                    alert.station?.name ||
                    `Station ${alert.station_id}`,

                ward:
                    alert.station?.ward ||
                    "N/A",

                zone:
                    alert.station?.zone ||
                    "N/A",

                project:
                    "Pune PMC Monitoring Network",

                category,

                parameter:
                    alert.parameter,

                actualValue:
                    alert.actual_value !== null
                        ? String(
                              alert.actual_value
                          )
                        : "--",

                threshold:
                    alert.threshold_rule ||
                    "--",

                severity:
                    alert.severity ||
                    "Info",

                timestamp,

                startedTime:
                    alert.started_time,

                status,

                source:
                    "Environmental Monitoring Sensor",

                suggestedAction:
                    getSuggestedAction(
                        alert.severity,
                        alert.parameter
                    ),

                acknowledgement:
                    alert.acknowledgement,

                acknowledgedAt:
                    alert.acknowledged_at
            };
        });

        return res.status(200).json({
            status: "success",
            count: alerts.length,
            data: alerts
        });

    } catch (error) {

        console.error(
            "Get alerts server error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                "Failed to fetch alerts."
        });
    }
};


// =====================================================
// ACKNOWLEDGE ALERT
// PATCH /api/alerts/:id/acknowledge
// =====================================================

const acknowledgeAlert = async (req, res) => {
    try {

        const { id } =
            req.params;

        const acknowledgement =
            req.body?.acknowledgement ||
            "Acknowledged";

        const alertId =
            Number(id);

        if (
            Number.isNaN(alertId)
        ) {
            return res.status(400).json({
                status: "error",
                message:
                    "Invalid alert ID."
            });
        }

        const { data, error } =
            await supabase
                .from("alert")
                .update({
                    acknowledgement:
                        acknowledgement,

                    acknowledged_at:
                        new Date().toISOString()
                })
                .eq(
                    "alert_id",
                    alertId
                )
                .select()
                .single();

        if (error) {

            console.error(
                "Acknowledge alert error:",
                error
            );

            return res.status(500).json({
                status: "error",
                message:
                    error.message
            });
        }

        return res.status(200).json({
            status: "success",
            message:
                "Alert acknowledged successfully.",
            data
        });

    } catch (error) {

        console.error(
            "Acknowledge server error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                "Failed to acknowledge alert."
        });
    }
};


// =====================================================
// RESOLVE ALERT
// PATCH /api/alerts/:id/resolve
// =====================================================

const resolveAlert = async (req, res) => {
    try {

        const { id } =
            req.params;

        const alertId =
            Number(id);

        if (
            Number.isNaN(alertId)
        ) {
            return res.status(400).json({
                status: "error",
                message:
                    "Invalid alert ID."
            });
        }

        const { data, error } =
            await supabase
                .from("alert")
                .update({
                    acknowledgement:
                        "Resolved",

                    acknowledged_at:
                        new Date().toISOString()
                })
                .eq(
                    "alert_id",
                    alertId
                )
                .select()
                .single();

        if (error) {

            console.error(
                "Resolve alert error:",
                error
            );

            return res.status(500).json({
                status: "error",
                message:
                    error.message
            });
        }

        return res.status(200).json({
            status: "success",
            message:
                "Alert resolved successfully.",
            data
        });

    } catch (error) {

        console.error(
            "Resolve server error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                "Failed to resolve alert."
        });
    }
};


// =====================================================
// GET SINGLE ALERT
// GET /api/alerts/:id
// =====================================================

const getAlertById = async (req, res) => {
    try {

        const alertId =
            Number(req.params.id);

        if (
            Number.isNaN(alertId)
        ) {
            return res.status(400).json({
                status: "error",
                message:
                    "Invalid alert ID."
            });
        }

        const { data, error } =
            await supabase
                .from("alert")
                .select(`
                    alert_id,
                    station_id,
                    parameter,
                    threshold_rule,
                    actual_value,
                    severity,
                    started_time,
                    acknowledgement,
                    acknowledged_at,
                    station (
                        station_id,
                        name,
                        ward,
                        zone,
                        latitude,
                        longitude,
                        station_type,
                        status
                    )
                `)
                .eq(
                    "alert_id",
                    alertId
                )
                .single();

        if (error) {

            return res.status(404).json({
                status: "error",
                message:
                    "Alert not found."
            });
        }

        return res.status(200).json({
            status: "success",
            data
        });

    } catch (error) {

        console.error(
            "Get alert server error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message:
                "Failed to fetch alert."
        });
    }
};


// =====================================================
// SUGGESTED ACTION
// =====================================================

function getSuggestedAction(
    severity,
    parameter
) {

    const text =
        parameter
            ?.toLowerCase() || "";

    if (
        text.includes("pm2.5")
    ) {
        return "Inspect the monitoring area and initiate appropriate pollution-control measures.";
    }

    if (
        text.includes("pm10")
    ) {
        return "Check dust-generating activities and initiate dust-control measures.";
    }

    if (
        text.includes("no2")
    ) {
        return "Check traffic and combustion sources in the affected monitoring area.";
    }

    if (
        text.includes("battery") ||
        text.includes("power")
    ) {
        return "Dispatch a technician to inspect the device power supply.";
    }

    if (
        text.includes("calibration")
    ) {
        return "Schedule sensor calibration and verify the sensor against the reference standard.";
    }

    if (
        severity === "Critical"
    ) {
        return "Immediate field inspection and corrective action are required.";
    }

    if (
        severity === "Warning"
    ) {
        return "Inspect the affected monitoring node and take corrective action if required.";
    }

    return "Review the alert and perform the required monitoring action.";
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getAlerts,
    getAlertById,
    acknowledgeAlert,
    resolveAlert
};