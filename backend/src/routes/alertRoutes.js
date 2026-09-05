const express = require("express");

const router =
    express.Router();

const {
    getAlerts,
    getAlertById,
    acknowledgeAlert,
    resolveAlert
} = require("../controllers/alertController");


// Get all alerts
router.get(
    "/",
    getAlerts
);


// Get one alert
router.get(
    "/:id",
    getAlertById
);


// Acknowledge
router.patch(
    "/:id/acknowledge",
    acknowledgeAlert
);


// Resolve
router.patch(
    "/:id/resolve",
    resolveAlert
);


module.exports = router;