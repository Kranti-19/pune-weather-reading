const express = require("express");

const router = express.Router();

const {
  getStations,
  getStationById,
  createStation,
  createMonitoringSiteSetup,
  
} = require("../controllers/stationController");

// GET /api/stations
router.get("/", getStations);

router.post(
  "/setup",
  createMonitoringSiteSetup
);

// Create new monitoring station
router.post("/", createStation);

// GET /api/stations/:id
router.get("/:id", getStationById);

module.exports = router;