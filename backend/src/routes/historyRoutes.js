const express = require("express");
const router = express.Router();

const {
  getHistoricalCalendar,
  getHistoricalDay,
} = require("../controllers/historyController");

router.get("/calendar", getHistoricalCalendar);
router.get("/day", getHistoricalDay);

module.exports = router;