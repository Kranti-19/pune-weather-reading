const express = require("express");

const router = express.Router();

const {
    getDevices,
    getDeviceStatus,
    deviceHeartbeat,
    getDeviceById,
    getDevicesByStation,
    createDevice,
    updateDevice,
    deleteDevice,
} = require("../controllers/deviceController");


// ============================================================
// GET ALL DEVICES
// GET /api/devices
// ============================================================

router.get(
    "/",
    getDevices
);


// ============================================================
// GET REAL-TIME DEVICE STATUS
// GET /api/devices/status
//
// Returns:
// - Online devices
// - Offline devices
// - Last seen
// - Battery
// - Network status
// ============================================================

router.get(
    "/status",
    getDeviceStatus
);


// ============================================================
// CREATE DEVICE
// POST /api/devices
// ============================================================

router.post(
    "/",
    createDevice
);


// ============================================================
// GET DEVICES BELONGING TO A STATION
// GET /api/devices/station/:stationId
// ============================================================

router.get(
    "/station/:stationId",
    getDevicesByStation
);


// ============================================================
// DEVICE HEARTBEAT
// POST /api/devices/:id/heartbeat
//
// For now:
// Device Simulator → this endpoint
//
// Later:
// Real ESP32/Gateway → this endpoint
// ============================================================

router.post(
    "/:id/heartbeat",
    deviceHeartbeat
);


// ============================================================
// GET ONE DEVICE
// GET /api/devices/:id
// ============================================================

router.get(
    "/:id",
    getDeviceById
);


// ============================================================
// UPDATE DEVICE
// PATCH /api/devices/:id
// ============================================================

router.patch(
    "/:id",
    updateDevice
);


// ============================================================
// DELETE DEVICE
// DELETE /api/devices/:id
// ============================================================

router.delete(
    "/:id",
    deleteDevice
);


module.exports = router;