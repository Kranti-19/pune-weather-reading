const express = require("express");

const router = express.Router();

const {
    matchAllStations
} = require("../services/openaqLocationMatcher");

router.post("/match-stations", async (req, res) => {
    try {
        const results = await matchAllStations();

        res.json({
            success: true,
            results
        });
    } catch (error) {
        console.error("OpenAQ station matching error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;