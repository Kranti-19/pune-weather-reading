const express = require("express");

const router = express.Router();

const {
  getReportData,
  getWardAQIReport,
  getPollutantTrendReport,
  getUptimeReport,
  getAlertReport,
  getMaintenanceCalibrationReport,
  getCustomReport,
} = require("../controllers/reportController");


router.get(
  "/",
  getReportData
);

router.get(
  "/ward",
  getWardAQIReport
);

router.get(
  "/pollutant-trend",
  getPollutantTrendReport
);

router.get(
  "/uptime",
  getUptimeReport
);

router.get(
  "/alerts",
  getAlertReport
);

router.get(
  "/maintenance-calibration",
  getMaintenanceCalibrationReport
);

router.get(
  "/custom",
  getCustomReport
);


module.exports = router;