const express = require("express");

const {
    getReport
} = require("../controllers/reportController");

const router = express.Router();


// GET /api/reports/:stationId?date=2026-08-20

router.get(
    "/:stationId",
    getReport
);


module.exports = router;