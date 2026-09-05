const supabase = require("../config/supabase");

// ============================================================
// GET ALL SENSORS
// GET /api/sensors
// ============================================================

const getSensors = async (req, res) => {
  try {
    const {
      data: sensors,
      error,
    } = await supabase
      .from("sensor")
      .select("*")
      .order("sensor_id", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: "success",
      count: sensors?.length || 0,
      sensors: sensors || [],
    });
  } catch (error) {
    console.error(
      "GET /api/sensors error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        error?.message ||
        "Failed to fetch sensors.",
    });
  }
};


// ============================================================
// GET SENSOR BY ID
// GET /api/sensors/:id
// ============================================================

const getSensorById = async (req, res) => {
  try {
    const sensorId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(sensorId) ||
      sensorId <= 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid sensor ID.",
      });
    }

    // ----------------------------------------------------------
    // GET SENSOR
    // ----------------------------------------------------------

    const {
      data: sensor,
      error: sensorError,
    } = await supabase
      .from("sensor")
      .select("*")
      .eq("sensor_id", sensorId)
      .maybeSingle();

    if (sensorError) {
      throw sensorError;
    }

    if (!sensor) {
      return res.status(404).json({
        status: "error",
        message:
          `Sensor ${sensorId} not found.`,
      });
    }

    // ----------------------------------------------------------
    // GET DEVICE
    // ----------------------------------------------------------

    const {
      data: device,
      error: deviceError,
    } = await supabase
      .from("device")
      .select("*")
      .eq(
        "device_id",
        sensor.device_id
      )
      .maybeSingle();

    if (deviceError) {
      throw deviceError;
    }

    // ----------------------------------------------------------
    // GET STATION
    // ----------------------------------------------------------

    let station = null;

    if (device?.station_id) {
      const {
        data: stationData,
        error: stationError,
      } = await supabase
        .from("station")
        .select("*")
        .eq(
          "station_id",
          device.station_id
        )
        .maybeSingle();

      if (stationError) {
        throw stationError;
      }

      station = stationData;
    }

    // ----------------------------------------------------------
    // GET CALIBRATION RECORDS
    // ----------------------------------------------------------

    const {
      data: calibration,
      error: calibrationError,
    } = await supabase
      .from("calibration")
      .select("*")
      .eq(
        "sensor_id",
        sensorId
      )
      .order("calibration_date", {
        ascending: false,
      });

    if (calibrationError) {
      throw calibrationError;
    }

    // ----------------------------------------------------------
    // GET READINGS FROM THIS SENSOR
    // ----------------------------------------------------------

    const {
      data: readings,
      error: readingError,
    } = await supabase
      .from("reading")
      .select("*")
      .eq(
        "sensor_id",
        sensorId
      )
      .order("timestamp", {
        ascending: false,
      })
      .limit(500);

    if (readingError) {
      throw readingError;
    }

    return res.status(200).json({
      status: "success",

      sensor: {
        ...sensor,

        device:
          device || null,

        station,

        calibration:
          calibration || [],

        readings:
          readings || [],

        calibrationCount:
          calibration?.length || 0,

        readingCount:
          readings?.length || 0,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/sensors/:id error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        error?.message ||
        "Failed to fetch sensor.",
    });
  }
};


// ============================================================
// GET SENSORS BY DEVICE
// GET /api/sensors/device/:deviceId
// ============================================================

const getSensorsByDevice = async (
  req,
  res
) => {
  try {
    const deviceId = Number(
      req.params.deviceId
    );

    if (
      !Number.isInteger(deviceId) ||
      deviceId <= 0
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid device ID.",
      });
    }

    // ----------------------------------------------------------
    // CHECK DEVICE EXISTS
    // ----------------------------------------------------------

    const {
      data: device,
      error: deviceError,
    } = await supabase
      .from("device")
      .select("*")
      .eq(
        "device_id",
        deviceId
      )
      .maybeSingle();

    if (deviceError) {
      throw deviceError;
    }

    if (!device) {
      return res.status(404).json({
        status: "error",
        message:
          `Device ${deviceId} not found.`,
      });
    }

    // ----------------------------------------------------------
    // GET SENSORS
    // ----------------------------------------------------------

    const {
      data: sensors,
      error,
    } = await supabase
      .from("sensor")
      .select("*")
      .eq(
        "device_id",
        deviceId
      )
      .order("sensor_id", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: "success",

      device,

      count:
        sensors?.length || 0,

      sensors:
        sensors || [],
    });
  } catch (error) {
    console.error(
      "GET sensors by device error:",
      error
    );

    return res.status(500).json({
      status: "error",

      message:
        error?.message ||
        "Failed to fetch device sensors.",
    });
  }
};


// ============================================================
// CREATE SENSOR
// POST /api/sensors
// ============================================================

const createSensor = async (
  req,
  res
) => {
  try {
    const {
      sensor_type,
      model,
      serial_number,
      installation_date,
      calibration_date,
      device_id,
      status,
    } = req.body;

    // ----------------------------------------------------------
    // 1. REQUIRED FIELD VALIDATION
    // ----------------------------------------------------------

    if (
      !sensor_type ||
      !installation_date ||
      device_id === undefined ||
      !status
    ) {
      return res.status(400).json({
        status: "error",

        message:
          "sensor_type, installation_date, device_id and status are required.",
      });
    }

    // ----------------------------------------------------------
    // 2. CLEAN VALUES
    // ----------------------------------------------------------

    const cleanSensorType =
      String(
        sensor_type
      ).trim();

    const cleanModel =
      model !== undefined &&
      model !== null &&
      String(model).trim() !== ""
        ? String(model).trim()
        : null;

    const cleanSerialNumber =
      serial_number !== undefined &&
      serial_number !== null &&
      String(serial_number).trim() !== ""
        ? String(serial_number).trim()
        : null;

    const cleanStatus =
      String(status).trim();

    const deviceId =
      Number(device_id);

    // ----------------------------------------------------------
    // 3. VALIDATE DEVICE ID
    // ----------------------------------------------------------

    if (
      !Number.isInteger(deviceId) ||
      deviceId <= 0
    ) {
      return res.status(400).json({
        status: "error",

        message:
          "Invalid device_id.",
      });
    }

    // ----------------------------------------------------------
    // 4. CHECK DEVICE EXISTS
    // ----------------------------------------------------------

    const {
      data: device,
      error: deviceError,
    } = await supabase
      .from("device")
      .select("*")
      .eq(
        "device_id",
        deviceId
      )
      .maybeSingle();

    if (deviceError) {
      throw deviceError;
    }

    if (!device) {
      return res.status(404).json({
        status: "error",

        message:
          `Device ${deviceId} does not exist.`,
      });
    }

    // ----------------------------------------------------------
    // 5. STATUS VALIDATION
    // ----------------------------------------------------------

    const allowedStatuses = [
      "active",
      "online",
      "offline",
      "inactive",
      "maintenance",
      "connected",
    ];

    if (
      !allowedStatuses.includes(
        cleanStatus.toLowerCase()
      )
    ) {
      return res.status(400).json({
        status: "error",

        message:
          `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    // ----------------------------------------------------------
    // 6. CHECK DUPLICATE SERIAL NUMBER
    // ----------------------------------------------------------

    if (cleanSerialNumber) {
      const {
        data: existingSensor,
        error: duplicateError,
      } = await supabase
        .from("sensor")
        .select(
          "sensor_id, serial_number, device_id"
        )
        .eq(
          "serial_number",
          cleanSerialNumber
        )
        .limit(1);

      if (duplicateError) {
        throw duplicateError;
      }

      if (
        existingSensor &&
        existingSensor.length > 0
      ) {
        return res.status(409).json({
          status: "error",

          message:
            "A sensor with this serial number already exists.",

          sensor:
            existingSensor[0],
        });
      }
    }

    // ----------------------------------------------------------
    // 7. INSERT SENSOR
    // ----------------------------------------------------------

    const {
      data: sensor,
      error,
    } = await supabase
      .from("sensor")
      .insert([
        {
          sensor_type:
            cleanSensorType,

          model:
            cleanModel,

          serial_number:
            cleanSerialNumber,

          installation_date,

          calibration_date:
            calibration_date || null,

          device_id:
            deviceId,

          status:
            cleanStatus,
        },
      ])
      .select()
      .single();

    // ----------------------------------------------------------
    // 8. DATABASE ERROR
    // ----------------------------------------------------------

    if (error) {
      console.error(
        "Create sensor error:",
        error
      );

      return res.status(500).json({
        status: "error",

        message:
          error.message ||
          "Failed to create sensor.",
      });
    }

    // ----------------------------------------------------------
    // 9. SUCCESS
    // ----------------------------------------------------------

    return res.status(201).json({
      status: "success",

      message:
        "Sensor added successfully.",

      sensor,

      device,
    });
  } catch (error) {
    console.error(
      "Create sensor exception:",
      error
    );

    return res.status(500).json({
      status: "error",

      message:
        error?.message ||
        "Failed to create sensor.",
    });
  }
};


// ============================================================
// UPDATE SENSOR
// PATCH /api/sensors/:id
// ============================================================

const updateSensor = async (
  req,
  res
) => {
  try {
    const sensorId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(sensorId) ||
      sensorId <= 0
    ) {
      return res.status(400).json({
        status: "error",

        message:
          "Invalid sensor ID.",
      });
    }

    const {
      sensor_type,
      model,
      serial_number,
      installation_date,
      calibration_date,
      device_id,
      status,
    } = req.body;

    const updateData = {};

    // ----------------------------------------------------------
    // UPDATE SENSOR TYPE
    // ----------------------------------------------------------

    if (
      sensor_type !== undefined
    ) {
      updateData.sensor_type =
        String(
          sensor_type
        ).trim();
    }

    // ----------------------------------------------------------
    // UPDATE MODEL
    // ----------------------------------------------------------

    if (
      model !== undefined
    ) {
      updateData.model =
        model === null ||
        String(model).trim() === ""
          ? null
          : String(model).trim();
    }

    // ----------------------------------------------------------
    // UPDATE SERIAL NUMBER
    // ----------------------------------------------------------

    if (
      serial_number !== undefined
    ) {
      updateData.serial_number =
        serial_number === null ||
        String(serial_number).trim() === ""
          ? null
          : String(
              serial_number
            ).trim();
    }

    // ----------------------------------------------------------
    // UPDATE INSTALLATION DATE
    // ----------------------------------------------------------

    if (
      installation_date !==
      undefined
    ) {
      updateData.installation_date =
        installation_date;
    }

    // ----------------------------------------------------------
    // UPDATE CALIBRATION DATE
    // ----------------------------------------------------------

    if (
      calibration_date !==
      undefined
    ) {
      updateData.calibration_date =
        calibration_date ===
          null ||
        calibration_date === ""
          ? null
          : calibration_date;
    }

    // ----------------------------------------------------------
    // UPDATE DEVICE
    // ----------------------------------------------------------

    if (
      device_id !== undefined
    ) {
      const newDeviceId =
        Number(device_id);

      if (
        !Number.isInteger(
          newDeviceId
        ) ||
        newDeviceId <= 0
      ) {
        return res.status(400).json({
          status: "error",

          message:
            "Invalid device_id.",
        });
      }

      const {
        data: device,
        error: deviceError,
      } = await supabase
        .from("device")
        .select(
          "device_id"
        )
        .eq(
          "device_id",
          newDeviceId
        )
        .maybeSingle();

      if (deviceError) {
        throw deviceError;
      }

      if (!device) {
        return res.status(404).json({
          status: "error",

          message:
            `Device ${newDeviceId} not found.`,
        });
      }

      updateData.device_id =
        newDeviceId;
    }

    // ----------------------------------------------------------
    // UPDATE STATUS
    // ----------------------------------------------------------

    if (
      status !== undefined
    ) {
      const cleanStatus =
        String(status).trim();

      const allowedStatuses = [
        "active",
        "online",
        "offline",
        "inactive",
        "maintenance",
        "connected",
      ];

      if (
        !allowedStatuses.includes(
          cleanStatus.toLowerCase()
        )
      ) {
        return res.status(400).json({
          status: "error",

          message:
            `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
        });
      }

      updateData.status =
        cleanStatus;
    }

    // ----------------------------------------------------------
    // CHECK EMPTY UPDATE
    // ----------------------------------------------------------

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      return res.status(400).json({
        status: "error",

        message:
          "No fields provided for update.",
      });
    }

    // ----------------------------------------------------------
    // CHECK SENSOR EXISTS
    // ----------------------------------------------------------

    const {
      data: existingSensor,
      error: existingError,
    } = await supabase
      .from("sensor")
      .select("*")
      .eq(
        "sensor_id",
        sensorId
      )
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingSensor) {
      return res.status(404).json({
        status: "error",

        message:
          `Sensor ${sensorId} not found.`,
      });
    }

    // ----------------------------------------------------------
    // UPDATE SENSOR
    // ----------------------------------------------------------

    const {
      data: updatedSensor,
      error,
    } = await supabase
      .from("sensor")
      .update(updateData)
      .eq(
        "sensor_id",
        sensorId
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: "success",

      message:
        "Sensor updated successfully.",

      sensor:
        updatedSensor,
    });
  } catch (error) {
    console.error(
      "Update sensor error:",
      error
    );

    return res.status(500).json({
      status: "error",

      message:
        error?.message ||
        "Failed to update sensor.",
    });
  }
};


// ============================================================
// DELETE SENSOR
// DELETE /api/sensors/:id
// ============================================================

const deleteSensor = async (
  req,
  res
) => {
  try {
    const sensorId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(sensorId) ||
      sensorId <= 0
    ) {
      return res.status(400).json({
        status: "error",

        message:
          "Invalid sensor ID.",
      });
    }

    // ----------------------------------------------------------
    // CHECK SENSOR EXISTS
    // ----------------------------------------------------------

    const {
      data: existingSensor,
      error: existingError,
    } = await supabase
      .from("sensor")
      .select("*")
      .eq(
        "sensor_id",
        sensorId
      )
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingSensor) {
      return res.status(404).json({
        status: "error",

        message:
          `Sensor ${sensorId} not found.`,
      });
    }

    // ----------------------------------------------------------
    // DELETE SENSOR
    // ----------------------------------------------------------

    const {
      error,
    } = await supabase
      .from("sensor")
      .delete()
      .eq(
        "sensor_id",
        sensorId
      );

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: "success",

      message:
        "Sensor deleted successfully.",

      sensorId,
    });
  } catch (error) {
    console.error(
      "Delete sensor error:",
      error
    );

    return res.status(500).json({
      status: "error",

      message:
        error?.message ||
        "Failed to delete sensor.",
    });
  }
};


// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
  getSensors,
  getSensorById,
  getSensorsByDevice,
  createSensor,
  updateSensor,
  deleteSensor,
};