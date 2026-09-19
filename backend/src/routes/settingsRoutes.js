const express = require("express");
const router = express.Router();
const {
    getSettings,
    updateSettings,
    resetSettings,
} = require("../controllers/settingsController");

router.get("/", getSettings);         // Maps to GET /api/settings
router.put("/", updateSettings);       // Maps to PUT /api/settings
router.post("/reset", resetSettings);  // Maps to POST /api/settings/reset

module.exports = router;