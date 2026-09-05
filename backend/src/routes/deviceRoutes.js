const express = require("express");

const router = express.Router();

const {
  getDevices,
  getDeviceById,
  getDevicesByStation,
  createDevice,
  updateDevice,
  deleteDevice,
} = require("../controllers/deviceController");


// GET all devices
router.get("/", getDevices);

// CREATE device
router.post("/", createDevice);

// GET devices belonging to a station
router.get(
  "/station/:stationId",
  getDevicesByStation
);

// GET one device
router.get("/:id", getDeviceById);

// UPDATE device
router.patch("/:id", updateDevice);

// DELETE device
router.delete("/:id", deleteDevice);


module.exports = router;