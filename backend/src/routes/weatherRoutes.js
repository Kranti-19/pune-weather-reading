const express = require("express");

const router = express.Router();

const {
  getPuneWeather,
} = require("../controllers/weatherController");

router.get("/pune", getPuneWeather);

module.exports = router;