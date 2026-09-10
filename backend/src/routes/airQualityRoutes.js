const express = require("express");
const router = express.Router();

const {
  getWaqiStation
} = require("../controllers/airQualityController");

router.get("/waqi/:stationId", getWaqiStation);

module.exports = router;