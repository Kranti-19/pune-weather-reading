const express = require("express");

const {
    getHistoricalCalendar,
} = require("../controllers/historyController");

const router = express.Router();

// Historical AQI calendar
router.get(
    "/calendar",
    getHistoricalCalendar
);

module.exports = router;