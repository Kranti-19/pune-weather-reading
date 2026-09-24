const express = require("express");

const router = express.Router();

const {
  getAqiTrend
} = require("../controllers/historyController");

// AQI Trend
router.get("/trend", getAqiTrend);

module.exports = router;