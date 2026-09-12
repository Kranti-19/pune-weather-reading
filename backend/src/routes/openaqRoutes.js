const express = require("express");

const router = express.Router();

const {
  syncOpenAQ,
} = require("../controllers/openaqController");


// Sync OpenAQ → Supabase
router.post(
  "/sync/:stationId",
  syncOpenAQ
);


module.exports = router;