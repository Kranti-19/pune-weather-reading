const express = require("express");
const router = express.Router();

const {
  getWaqiStation,
  syncWaqiStation,
} = require("../controllers/airQualityController");

// Fetch WAQI data only
// GET /api/air-quality/waqi/:stationId
router.get("/waqi/:stationId", getWaqiStation);

// Sync WAQI data into Supabase
// POST /api/air-quality/waqi/sync/:stationId
router.post("/waqi/sync/:stationId", async (req, res) => {
  try {
    const localStationId = Number(req.params.stationId);

    if (!Number.isInteger(localStationId) || localStationId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid local station ID",
      });
    }

    const result = await syncWaqiStation(localStationId);

    if (!result.success) {
      return res.status(400).json({
        status: "error",
        ...result,
      });
    }

    return res.json({
      status: "success",
      ...result,
    });
  } catch (error) {
    console.error("WAQI sync route error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;