const express = require("express");

const router =
    express.Router();

const {
    getReportData
} = require(
    "../controllers/reportController"
);


// GET /api/reports
router.get(
    "/",
    getReportData
);


module.exports = router;