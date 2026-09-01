const supabase = require("../config/supabase");

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

            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }

        return res.status(200).json({
            status: "success",
            count: data.length,
            alerts: data
        });

    } catch (error) {

        console.error("Alerts server error:", error);

        return res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
};


//Acknowlege 

const getAlertById = async (req, res) => {
    try {

        const { id } = req.params;

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
                    name,
                    ward,
                    zone,
                    latitude,
                    longitude,
                    station_type,
                    status
                )
            `)
            .eq("alert_id", id)
            .single();

        if (error) {
            return res.status(404).json({
                status: "error",
                message: "Alert not found"
            });
        }

        return res.status(200).json({
            status: "success",
            alert: data
        });

    } catch (error) {

        console.error("Get alert details error:", error);

        return res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
};



const acknowledgeAlert = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Alert ID is required"
            });
        }

        const { data, error } = await supabase
            .from("alert")
            .update({
                acknowledgement: "Acknowledged",
                acknowledged_at: new Date().toISOString()
            })
            .eq("alert_id", id)
            .select()
            .single();

        if (error) {
            console.error("Acknowledge alert error:", error);

            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Alert acknowledged successfully",
            alert: data
        });

    } catch (error) {

        console.error("Acknowledge server error:", error);

        return res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
};



module.exports = {
    getAlerts,
    getAlertById,
    acknowledgeAlert
};