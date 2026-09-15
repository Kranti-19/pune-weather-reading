const express = require("express");

const router = express.Router();

const {
  syncOpenAQ,
  matchStations,
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

module.exports = router;