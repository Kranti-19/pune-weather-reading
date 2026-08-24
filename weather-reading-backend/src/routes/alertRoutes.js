const express = require("express");

const {
    getAlerts,
    getAlertById,
    acknowledgeAlert
} = require("../controllers/alertController");

const router = express.Router();

router.get("/", getAlerts);

router.patch(
    "/:id/acknowledge",
    acknowledgeAlert
);


router.get("/:id", getAlertById);

module.exports = router;