const supabase = require("../config/supabase");


// ============================================================
// ONLINE / OFFLINE CONFIGURATION
// ============================================================

// Device is considered OFFLINE if no heartbeat is received
// within this many minutes.

const OFFLINE_TIMEOUT_MINUTES = 15;


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
      .select(`
        *,
        station:station_id (
          station_id,
          name,
          ward,
          zone,
          latitude,
          longitude,
          station_type,
          status
        )
      `)
      .order("device_id", {
        ascending: true,
      });


    if (error) {
      throw error;
    }


    return res.status(200).json({

      status: "success",

      count:
        devices?.length || 0,

      devices:
        devices || [],
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
// GET DEVICE STATUS
// GET /api/devices/status
//
// Determines ONLINE / OFFLINE using last_seen_at.
//
// ONLINE:
// last_seen_at is within 15 minutes
//
// OFFLINE:
// last_seen_at is older than 15 minutes
// OR network_status is not Connected
// ============================================================

const getDeviceStatus = async (req, res) => {

  try {

    const {
      data: devices,
      error,
    } = await supabase
      .from("device")
      .select(`
        device_id,
        gateway_id,
        manufacturer,
        model,
        firmware,
        ip_network,
        station_id,
        status,
        battery_level,
        network_status,
        last_seen_at,
        is_simulated,

        station:station_id (
          station_id,
          name,
          ward,
          zone,
          latitude,
          longitude,
          station_type,
          status
        )
      `)
      .order("device_id", {
        ascending: true,
      });


    if (error) {
      throw error;
    }


    const now =
      Date.now();


    const offlineLimit =
      OFFLINE_TIMEOUT_MINUTES *
      60 *
      1000;


    const processedDevices =
      (devices || []).map(
        (device) => {

          let isOnline = false;


          // ------------------------------------------------
          // CHECK LAST HEARTBEAT
          // ------------------------------------------------

          if (
            device.last_seen_at
          ) {

            const lastSeen =
              new Date(
                device.last_seen_at
              ).getTime();


            if (
              Number.isFinite(
                lastSeen
              )
            ) {

              const elapsed =
                now - lastSeen;


              isOnline =
                elapsed <=
                offlineLimit;
            }
          }


          // ------------------------------------------------
          // NETWORK STATUS
          // ------------------------------------------------

          const networkStatus =
            String(
              device.network_status ||
              ""
            ).trim().toLowerCase();


          if (
            networkStatus &&
            networkStatus !==
              "connected"
          ) {

            isOnline = false;
          }


          // ------------------------------------------------
          // CALCULATED STATUS
          // ------------------------------------------------

          const calculatedStatus =
            isOnline
              ? "Online"
              : "Offline";


          // ------------------------------------------------
          // TIME SINCE LAST SEEN
          // ------------------------------------------------

          let secondsSinceLastSeen =
            null;


          if (
            device.last_seen_at
          ) {

            const lastSeen =
              new Date(
                device.last_seen_at
              ).getTime();


            if (
              Number.isFinite(
                lastSeen
              )
            ) {

              secondsSinceLastSeen =
                Math.max(
                  0,
                  Math.floor(
                    (
                      now -
                      lastSeen
                    ) / 1000
                  )
                );
            }
          }


          return {

            ...device,

            // Calculated real-time status
            calculated_status:
              calculatedStatus,

            // Boolean useful for React
            is_online:
              isOnline,

            // How long since heartbeat
            seconds_since_last_seen:
              secondsSinceLastSeen,

            // Configuration sent to frontend
            offline_timeout_minutes:
              OFFLINE_TIMEOUT_MINUTES,
          };
        }
      );


    // ======================================================
    // SUMMARY
    // ======================================================

    const total =
      processedDevices.length;


    const online =
      processedDevices.filter(
        (device) =>
          device.is_online === true
      ).length;


    const offline =
      processedDevices.filter(
        (device) =>
          device.is_online === false
      ).length;


    return res.status(200).json({

      status: "success",

      devices:
        processedDevices,

      summary: {

        total,

        online,

        offline,
      },

      offline_timeout_minutes:
        OFFLINE_TIMEOUT_MINUTES,
    });


  } catch (error) {

    console.error(
      "GET /api/devices/status error:",
      error
    );


    return res.status(500).json({

      status: "error",

      message:
        error?.message ||
        "Failed to fetch device status.",
    });
  }
};


// ============================================================
// DEVICE HEARTBEAT
// POST /api/devices/:id/heartbeat
//
// This endpoint will eventually be called by the real
// device/gateway.
//
// For now your simulator can call it.
// ============================================================

const deviceHeartbeat = async (req, res) => {

  try {

    const deviceId =
      Number(
        req.params.id
      );


    // --------------------------------------------------------
    // VALIDATE DEVICE ID
    // --------------------------------------------------------

    if (
      !Number.isInteger(
        deviceId
      ) ||
      deviceId <= 0
    ) {

      return res.status(400).json({

        status: "error",

        message:
          "Invalid device ID.",
      });
    }


    // --------------------------------------------------------
    // READ OPTIONAL VALUES
    // --------------------------------------------------------

    const {
      battery_level,
      network_status,
    } = req.body || {};


    // --------------------------------------------------------
    // CHECK BATTERY
    // --------------------------------------------------------

    let batteryValue =
      undefined;


    if (
      battery_level !==
        undefined &&
      battery_level !==
        null &&
      battery_level !== ""
    ) {

      batteryValue =
        Number(
          battery_level
        );


      if (
        !Number.isFinite(
          batteryValue
        ) ||
        batteryValue < 0 ||
        batteryValue > 100
      ) {

        return res.status(400).json({

          status: "error",

          message:
            "Battery level must be between 0 and 100.",
        });
      }
    }


    // --------------------------------------------------------
    // NETWORK STATUS
    // --------------------------------------------------------

    let networkValue =
      "Connected";


    if (
      network_status !==
        undefined &&
      network_status !==
        null &&
      String(
        network_status
      ).trim() !== ""
    ) {

      networkValue =
        String(
          network_status
        ).trim();
    }


    // --------------------------------------------------------
    // UPDATE DATA
    // --------------------------------------------------------

    const updateData = {

      // THIS IS THE IMPORTANT FIELD
      last_seen_at:
        new Date().toISOString(),

      // Device sending heartbeat is online
      status:
        "Online",

      network_status:
        networkValue,
    };


    if (
      batteryValue !==
      undefined
    ) {

      updateData.battery_level =
        batteryValue;
    }


    // --------------------------------------------------------
    // UPDATE DEVICE
    // --------------------------------------------------------

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
      .select(`
        *,
        station:station_id (
          station_id,
          name,
          ward,
          zone
        )
      `)
      .single();


    if (error) {
      throw error;
    }


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.status(200).json({

      status: "success",

      message:
        "Device heartbeat received successfully.",

      device:
        updatedDevice,
    });


  } catch (error) {

    console.error(
      "POST /api/devices/:id/heartbeat error:",
      error
    );


    return res.status(500).json({

      status: "error",

      message:
        error?.message ||
        "Failed to process device heartbeat.",
    });
  }
};


// ============================================================
// GET DEVICE BY ID
// GET /api/devices/:id
// ============================================================

const getDeviceById = async (req, res) => {

  try {

    const deviceId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        deviceId
      ) ||
      deviceId <= 0
    ) {

      return res.status(400).json({

        status: "error",

        message:
          "Invalid device ID.",
      });
    }


    // --------------------------------------------------------
    // GET DEVICE
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // GET STATION
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // GET SENSORS CONNECTED TO DEVICE
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // CALCULATE CURRENT ONLINE STATUS
    // --------------------------------------------------------

    let isOnline = false;


    if (
      device.last_seen_at
    ) {

      const lastSeen =
        new Date(
          device.last_seen_at
        ).getTime();


      const elapsed =
        Date.now() -
        lastSeen;


      isOnline =
        elapsed <=
        OFFLINE_TIMEOUT_MINUTES *
          60 *
          1000;
    }


    if (
      String(
        device.network_status ||
        ""
      ).toLowerCase() !==
      "connected"
    ) {

      isOnline = false;
    }


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({

      status: "success",

      device: {

        ...device,

        calculated_status:
          isOnline
            ? "Online"
            : "Offline",

        is_online:
          isOnline,

        station:
          station || null,

        sensors:
          sensors || [],

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

    const stationId =
      Number(
        req.params.stationId
      );


    if (
      !Number.isInteger(
        stationId
      ) ||
      stationId <= 0
    ) {

      return res.status(400).json({

        status: "error",

        message:
          "Invalid station ID.",
      });
    }


    // --------------------------------------------------------
    // CHECK STATION EXISTS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // GET DEVICES
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // CALCULATE STATUS
    // --------------------------------------------------------

    const now =
      Date.now();


    const offlineLimit =
      OFFLINE_TIMEOUT_MINUTES *
      60 *
      1000;


    const processedDevices =
      (devices || []).map(
        (device) => {

          let isOnline = false;


          if (
            device.last_seen_at
          ) {

            const lastSeen =
              new Date(
                device.last_seen_at
              ).getTime();


            if (
              Number.isFinite(
                lastSeen
              )
            ) {

              isOnline =
                now - lastSeen <=
                offlineLimit;
            }
          }


          if (
            String(
              device.network_status ||
              ""
            ).toLowerCase() !==
            "connected"
          ) {

            isOnline = false;
          }


          return {

            ...device,

            calculated_status:
              isOnline
                ? "Online"
                : "Offline",

            is_online:
              isOnline,
          };
        }
      );


    return res.status(200).json({

      status: "success",

      station,

      count:
        processedDevices.length,

      devices:
        processedDevices,
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
      battery_level,
      network_status,
      is_simulated,
    } = req.body;


    // --------------------------------------------------------
    // REQUIRED FIELD VALIDATION
    // --------------------------------------------------------

    if (
      !gateway_id ||
      !manufacturer ||
      !model ||
      station_id ===
        undefined ||
      !status
    ) {

      return res.status(400).json({

        status: "error",

        message:
          "gateway_id, manufacturer, model, station_id and status are required.",
      });
    }


    // --------------------------------------------------------
    // CLEAN VALUES
    // --------------------------------------------------------

    const cleanGatewayId =
      String(
        gateway_id
      ).trim();


    const cleanManufacturer =
      String(
        manufacturer
      ).trim();


    const cleanModel =
      String(
        model
      ).trim();


    const cleanFirmware =
      firmware !==
          undefined &&
      firmware !==
          null &&
      String(
        firmware
      ).trim() !== ""
        ? String(
            firmware
          ).trim()
        : null;


    const cleanIpNetwork =
      ip_network !==
          undefined &&
      ip_network !==
          null &&
      String(
        ip_network
      ).trim() !== ""
        ? String(
            ip_network
          ).trim()
        : null;


    const cleanStatus =
      String(
        status
      ).trim();


    const stationId =
      Number(
        station_id
      );


    // --------------------------------------------------------
    // VALIDATE STATION ID
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // CHECK STATION EXISTS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // STATUS VALIDATION
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // BATTERY VALIDATION
    // --------------------------------------------------------

    let batteryValue =
      null;


    if (
      battery_level !==
        undefined &&
      battery_level !==
        null &&
      battery_level !== ""
    ) {

      batteryValue =
        Number(
          battery_level
        );


      if (
        !Number.isFinite(
          batteryValue
        ) ||
        batteryValue < 0 ||
        batteryValue > 100
      ) {

        return res.status(400).json({

          status: "error",

          message:
            "battery_level must be between 0 and 100.",
        });
      }
    }


    // --------------------------------------------------------
    // NETWORK STATUS
    // --------------------------------------------------------

    const cleanNetworkStatus =
      network_status !==
          undefined &&
      network_status !==
          null &&
      String(
        network_status
      ).trim() !== ""
        ? String(
            network_status
          ).trim()
        : "Connected";


    // --------------------------------------------------------
    // SIMULATED DEVICE
    // --------------------------------------------------------

    const simulated =
      typeof is_simulated ===
      "boolean"
        ? is_simulated
        : true;


    // --------------------------------------------------------
    // CHECK DUPLICATE GATEWAY ID
    // --------------------------------------------------------

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
      existingDevice.length >
        0
    ) {

      return res.status(409).json({

        status: "error",

        message:
          "A device with this Gateway ID already exists.",

        device:
          existingDevice[0],
      });
    }


    // --------------------------------------------------------
    // INSERT DEVICE
    // --------------------------------------------------------

    const insertData = {

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

      battery_level:
        batteryValue,

      network_status:
        cleanNetworkStatus,

      is_simulated:
        simulated,

      // If initially online, give it a heartbeat
      last_seen_at:
        cleanStatus.toLowerCase() ===
        "online"
          ? new Date().toISOString()
          : null,
    };


    const {
      data: device,
      error,
    } = await supabase
      .from("device")
      .insert([
        insertData,
      ])
      .select()
      .single();


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


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

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

    const deviceId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        deviceId
      ) ||
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
      battery_level,
      network_status,
      is_simulated,
    } = req.body;


    const updateData = {};


    // --------------------------------------------------------
    // BASIC FIELDS
    // --------------------------------------------------------

    if (
      gateway_id !==
      undefined
    ) {

      updateData.gateway_id =
        String(
          gateway_id
        ).trim();
    }


    if (
      manufacturer !==
      undefined
    ) {

      updateData.manufacturer =
        String(
          manufacturer
        ).trim();
    }


    if (
      model !==
      undefined
    ) {

      updateData.model =
        String(
          model
        ).trim();
    }


    if (
      firmware !==
      undefined
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
      ip_network !==
      undefined
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


    // --------------------------------------------------------
    // STATION
    // --------------------------------------------------------

    if (
      station_id !==
      undefined
    ) {

      const stationId =
        Number(
          station_id
        );


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
        .select(
          "station_id"
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


      updateData.station_id =
        stationId;
    }


    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    if (
      status !==
      undefined
    ) {

      const cleanStatus =
        String(
          status
        ).trim();


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


    // --------------------------------------------------------
    // BATTERY
    // --------------------------------------------------------

    if (
      battery_level !==
      undefined
    ) {

      const battery =
        Number(
          battery_level
        );


      if (
        !Number.isFinite(
          battery
        ) ||
        battery < 0 ||
        battery > 100
      ) {

        return res.status(400).json({

          status: "error",

          message:
            "Battery level must be between 0 and 100.",
        });
      }


      updateData.battery_level =
        battery;
    }


    // --------------------------------------------------------
    // NETWORK
    // --------------------------------------------------------

    if (
      network_status !==
      undefined
    ) {

      updateData.network_status =
        network_status ===
          null ||
        String(
          network_status
        ).trim() === ""
          ? "Connected"
          : String(
              network_status
            ).trim();
    }


    // --------------------------------------------------------
    // SIMULATOR
    // --------------------------------------------------------

    if (
      is_simulated !==
      undefined
    ) {

      updateData.is_simulated =
        Boolean(
          is_simulated
        );
    }


    // --------------------------------------------------------
    // CHECK EMPTY UPDATE
    // --------------------------------------------------------

    if (
      Object.keys(
        updateData
      ).length === 0
    ) {

      return res.status(400).json({

        status: "error",

        message:
          "No fields provided for update.",
      });
    }


    // --------------------------------------------------------
    // CHECK DEVICE EXISTS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // UPDATE DEVICE
    // --------------------------------------------------------

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

    const deviceId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        deviceId
      ) ||
      deviceId <= 0
    ) {

      return res.status(400).json({

        status: "error",

        message:
          "Invalid device ID.",
      });
    }


    // --------------------------------------------------------
    // CHECK DEVICE EXISTS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // DELETE DEVICE
    // --------------------------------------------------------

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

  getDeviceStatus,

  deviceHeartbeat,

  getDeviceById,

  getDevicesByStation,

  createDevice,

  updateDevice,

  deleteDevice,
};