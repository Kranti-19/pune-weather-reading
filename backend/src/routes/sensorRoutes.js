const express = require("express");

const router = express.Router();

const {
  getSensors,
  getSensorById,
  getSensorsByDevice,
  createSensor,
  updateSensor,
  deleteSensor,
} = require("../controllers/sensorController");


// GET all sensors
router.get("/", getSensors);

// CREATE sensor
router.post("/", createSensor);

// GET sensors for a device
router.get(
  "/device/:deviceId",
  getSensorsByDevice
);

// GET one sensor
router.get("/:id", getSensorById);

// UPDATE sensor
router.patch("/:id", updateSensor);

// DELETE sensor
router.delete("/:id", deleteSensor);


module.exports = router;