const express = require("express");

const router = express.Router();

const {
   syncOpenAQ,
  matchStations,
  getHistoricalOpenAQCalendar,
  getHistoricalOpenAQDay,
} = require("../controllers/openaqController");

// Sync OpenAQ → Supabase
router.post(
  "/sync/:stationId",
  syncOpenAQ
);

router.get(
  "/match-stations",
  matchStations
);

// ======================================================
// HISTORICAL OPENAQ - READ ONLY
// ======================================================

// Calendar
// Example:
// /history/calendar?year=2026&month=9

router.get(
  "/history/calendar",
  getHistoricalOpenAQCalendar
);


// Selected day
// Example:
// /history/day?date=2026-09-15

router.get(
  "/history/day",
  getHistoricalOpenAQDay
);



module.exports = router;