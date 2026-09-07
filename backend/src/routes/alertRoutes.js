const express = require("express");

const {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  evaluateAlertRules,
  getAlertConfigurations,
  updateAlertConfiguration,
} = require("../controllers/alertController");

const router = express.Router();

router.get("/", getAlerts);

router.get(
  "/configurations",
  getAlertConfigurations
);

router.patch(
  "/configurations/:id",
  updateAlertConfiguration
);

router.post(
  "/evaluate",
  evaluateAlertRules
);

router.patch(
  "/:id/acknowledge",
  acknowledgeAlert
);

router.patch(
  "/:id/resolve",
  resolveAlert
);

module.exports = router;