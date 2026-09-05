const supabase = require("../config/supabase");

// ============================================================
// GET ALL DEVICES
// GET /api/devices
// ============================================================

const getDevices = async (req, res) => {
  try {
    const {
      data: devices,
      error,
    } = await supabase
      .from("device")
      .select("*")
      .order("device_id", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: "success",
      count: devices?.length || 0,
      devices: devices || [],
    });
  } catch (error) {
    console.error(
      "GET /api/devices error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        error?.message ||
        "Failed to fetch devices.",
    });
  }
};


// ============================================================
// GET DEVICE BY ID
// GET /api/devices/:id
// ============================================================

const getDeviceById = async (req, res) => {
  try {
    const deviceId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(deviceId) ||
      deviceId <= 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid device ID.",
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
      .eq("device_id", deviceId)
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
    // GET STATION
    // ----------------------------------------------------------

    const {
      data: station,
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

    // ----------------------------------------------------------
    // GET SENSORS CONNECTED TO DEVICE
    // ----------------------------------------------------------

    const {
      data: sensors,
      error: sensorError,
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

    if (sensorError) {
      throw sensorError;
    }

    return res.status(200).json({
      status: "success",

      device: {
        ...device,

        station: station || null,

        sensors: sensors || [],

        sensorCount:
          sensors?.length || 0,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/devices/:id error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        error?.message ||
        "Failed to fetch device.",
    });
  }
};


// ============================================================
// GET DEVICES BY STATION
// GET /api/devices/station/:stationId
// ============================================================

const getDevicesByStation = async (
  req,
  res
) => {
  try {
    const stationId = Number(
      req.params.stationId
    );

    if (
      !Number.isInteger(stationId) ||
      stationId <= 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid station ID.",
      });
    }

    // ----------------------------------------------------------
    // CHECK STATION EXISTS
    // ----------------------------------------------------------

    const {
      data: station,
      error: stationError,
    } = await supabase
      .from("station")
      .select(
        "station_id, name, ward, zone, status"
      )
      .eq(
        "station_id",
        stationId
      )
      .maybeSingle();

    if (stationError) {
      throw stationError;
    }

    if (!station) {
      return res.status(404).json({
        status: "error",
        message:
          `Station ${stationId} not found.`,
      });
    }

    // ----------------------------------------------------------
    // GET DEVICES
    // ----------------------------------------------------------

    const {
      data: devices,
      error,
    } = await supabase
      .from("device")
      .select("*")
      .eq(
        "station_id",
        stationId
      )
      .order("device_id", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: "success",

      station,

      count:
        devices?.length || 0,

      devices:
        devices || [],
    });
  } catch (error) {
    console.error(
      "GET devices by station error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        error?.message ||
        "Failed to fetch station devices.",
    });
  }
};


// ============================================================
// CREATE DEVICE / GATEWAY
// POST /api/devices
// ============================================================

const createDevice = async (
  req,
  res
) => {
  try {
    const {
      gateway_id,
      manufacturer,
      model,
      firmware,
      ip_network,
      station_id,
      status,
    } = req.body;

    // ----------------------------------------------------------
    // 1. REQUIRED FIELD VALIDATION
    // ----------------------------------------------------------

    if (
      !gateway_id ||
      !manufacturer ||
      !model ||
      station_id === undefined ||
      !status
    ) {
      return res.status(400).json({
        status: "error",

        message:
          "gateway_id, manufacturer, model, station_id and status are required.",
      });
    }

    // ----------------------------------------------------------
    // 2. CLEAN VALUES
    // ----------------------------------------------------------

    const cleanGatewayId =
      String(gateway_id).trim();

    const cleanManufacturer =
      String(manufacturer).trim();

    const cleanModel =
      String(model).trim();

    const cleanFirmware =
      firmware !== undefined &&
      firmware !== null &&
      String(firmware).trim() !== ""
        ? String(firmware).trim()
        : null;

    const cleanIpNetwork =
      ip_network !== undefined &&
      ip_network !== null &&
      String(ip_network).trim() !== ""
        ? String(ip_network).trim()
        : null;

    const cleanStatus =
      String(status).trim();

    const stationId =
      Number(station_id);

    // ----------------------------------------------------------
    // 3. VALIDATE STATION ID
    // ----------------------------------------------------------

    if (
      !Number.isInteger(stationId) ||
      stationId <= 0
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid station_id.",
      });
    }

    // ----------------------------------------------------------
    // 4. CHECK STATION EXISTS
    // ----------------------------------------------------------

    const {
      data: station,
      error: stationError,
    } = await supabase
      .from("station")
      .select(
        "station_id, name, ward, zone, status"
      )
      .eq(
        "station_id",
        stationId
      )
      .maybeSingle();

    if (stationError) {
      throw stationError;
    }

    if (!station) {
      return res.status(404).json({
        status: "error",

        message:
          `Station ${stationId} does not exist.`,
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
    // 6. CHECK DUPLICATE GATEWAY ID
    // ----------------------------------------------------------

    const {
      data: existingDevice,
      error: duplicateError,
    } = await supabase
      .from("device")
      .select(
        "device_id, gateway_id, station_id"
      )
      .eq(
        "gateway_id",
        cleanGatewayId
      )
      .limit(1);

    if (duplicateError) {
      throw duplicateError;
    }

    if (
      existingDevice &&
      existingDevice.length > 0
    ) {
      return res.status(409).json({
        status: "error",

        message:
          "A device with this Gateway ID already exists.",

        device:
          existingDevice[0],
      });
    }

    // ----------------------------------------------------------
    // 7. INSERT DEVICE
    // ----------------------------------------------------------

    const {
      data: device,
      error,
    } = await supabase
      .from("device")
      .insert([
        {
          gateway_id:
            cleanGatewayId,

          manufacturer:
            cleanManufacturer,

          model:
            cleanModel,

          firmware:
            cleanFirmware,

          ip_network:
            cleanIpNetwork,

          station_id:
            stationId,

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
        "Create device error:",
        error
      );

      return res.status(500).json({
        status: "error",

        message:
          error.message ||
          "Failed to create device.",
      });
    }

    // ----------------------------------------------------------
    // 9. SUCCESS
    // ----------------------------------------------------------

    return res.status(201).json({
      status: "success",

      message:
        "Device/Gateway added successfully.",

      device,

      station,
    });
  } catch (error) {
    console.error(
      "Create device exception:",
      error
    );

    return res.status(500).json({
      status: "error",

      message:
        error?.message ||
        "Failed to create device.",
    });
  }
};


// ============================================================
// UPDATE DEVICE
// PATCH /api/devices/:id
// ============================================================

const updateDevice = async (
  req,
  res
) => {
  try {
    const deviceId = Number(
      req.params.id
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

    const {
      gateway_id,
      manufacturer,
      model,
      firmware,
      ip_network,
      station_id,
      status,
    } = req.body;

    const updateData = {};

    // ----------------------------------------------------------
    // UPDATE OPTIONAL FIELDS
    // ----------------------------------------------------------

    if (
      gateway_id !== undefined
    ) {
      updateData.gateway_id =
        String(
          gateway_id
        ).trim();
    }

    if (
      manufacturer !== undefined
    ) {
      updateData.manufacturer =
        String(
          manufacturer
        ).trim();
    }

    if (
      model !== undefined
    ) {
      updateData.model =
        String(
          model
        ).trim();
    }

    if (
      firmware !== undefined
    ) {
      updateData.firmware =
        firmware === null ||
        String(
          firmware
        ).trim() === ""
          ? null
          : String(
              firmware
            ).trim();
    }

    if (
      ip_network !== undefined
    ) {
      updateData.ip_network =
        ip_network === null ||
        String(
          ip_network
        ).trim() === ""
          ? null
          : String(
              ip_network
            ).trim();
    }

    if (
      station_id !== undefined
    ) {
      const stationId =
        Number(station_id);

      if (
        !Number.isInteger(
          stationId
        ) ||
        stationId <= 0
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid station_id.",
        });
      }

      const {
        data: station,
        error: stationError,
      } = await supabase
        .from("station")
        .select("station_id")
        .eq(
          "station_id",
          stationId
        )
        .maybeSingle();

      if (stationError) {
        throw stationError;
      }

      if (!station) {
        return res.status(404).json({
          status: "error",
          message:
            `Station ${stationId} not found.`,
        });
      }

      updateData.station_id =
        stationId;
    }

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
    // CHECK DEVICE EXISTS
    // ----------------------------------------------------------

    const {
      data: existingDevice,
      error: existingError,
    } = await supabase
      .from("device")
      .select("*")
      .eq(
        "device_id",
        deviceId
      )
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingDevice) {
      return res.status(404).json({
        status: "error",
        message:
          `Device ${deviceId} not found.`,
      });
    }

    // ----------------------------------------------------------
    // UPDATE DEVICE
    // ----------------------------------------------------------

    const {
      data: updatedDevice,
      error,
    } = await supabase
      .from("device")
      .update(updateData)
      .eq(
        "device_id",
        deviceId
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: "success",

      message:
        "Device updated successfully.",

      device:
        updatedDevice,
    });
  } catch (error) {
    console.error(
      "Update device error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        error?.message ||
        "Failed to update device.",
    });
  }
};


// ============================================================
// DELETE DEVICE
// DELETE /api/devices/:id
//
// Because sensor.device_id has ON DELETE CASCADE,
// deleting a device will also delete its sensors.
// ============================================================

const deleteDevice = async (
  req,
  res
) => {
  try {
    const deviceId = Number(
      req.params.id
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
      data: existingDevice,
      error: existingError,
    } = await supabase
      .from("device")
      .select("*")
      .eq(
        "device_id",
        deviceId
      )
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingDevice) {
      return res.status(404).json({
        status: "error",
        message:
          `Device ${deviceId} not found.`,
      });
    }

    // ----------------------------------------------------------
    // DELETE DEVICE
    // ----------------------------------------------------------

    const {
      error,
    } = await supabase
      .from("device")
      .delete()
      .eq(
        "device_id",
        deviceId
      );

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: "success",

      message:
        "Device deleted successfully.",

      deviceId,
    });
  } catch (error) {
    console.error(
      "Delete device error:",
      error
    );

    return res.status(500).json({
      status: "error",

      message:
        error?.message ||
        "Failed to delete device.",
    });
  }
};


// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
  getDevices,
  getDeviceById,
  getDevicesByStation,
  createDevice,
  updateDevice,
  deleteDevice,
};