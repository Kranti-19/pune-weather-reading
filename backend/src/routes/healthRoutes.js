const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Backend is healthy"
    });
});

module.exports = router;