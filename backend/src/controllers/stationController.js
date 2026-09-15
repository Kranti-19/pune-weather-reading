const supabase = require("../config/supabase");

// ============================================================
// OPENAQ CONFIGURATION
// ============================================================

const OPENAQ_BASE_URL = "https://api.openaq.org/v3";
const OPENAQ_MAX_RADIUS_METERS = 25000;

// ============================================================
// CALCULATE DISTANCE BETWEEN TWO COORDINATES
// Haversine formula
// ============================================================

const calculateDistanceKm = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const earthRadiusKm = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
};

// ============================================================
// CHECK WHETHER OPENAQ LOCATION HAS PM2.5 / PM10
// ============================================================

const getOpenAQLocationSensors = async (
  locationId,
  apiKey
) => {
  try {
    const response = await fetch(
      `${OPENAQ_BASE_URL}/locations/${locationId}/sensors`,
      {
        method: "GET",
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(
        `OpenAQ sensor request failed for location ${locationId}: ${response.status}`
      );

      return [];
    }

    const data = await response.json();

    return data.results || [];
  } catch (error) {
    console.warn(
      `Could not fetch OpenAQ sensors for ${locationId}:`,
      error.message
    );

    return [];
  }
};

// ============================================================
// CHECK SUITABILITY OF OPENAQ LOCATION
// ============================================================

const isSuitableOpenAQLocation = (
  location,
  sensors
) => {
  // Prefer monitor/reference-grade stations
  const isMonitor =
    location.is_monitor === true ||
    location.isMonitor === true;

  // Get sensor parameters
  const parameters = sensors.map((sensor) =>
    String(
      sensor.parameter?.name ||
        sensor.parameter ||
        ""
    ).toLowerCase()
  );

  const hasPM25 = parameters.some(
    (parameter) =>
      parameter === "pm25" ||
      parameter === "pm2.5" ||
      parameter === "pm2_5"
  );

  const hasPM10 = parameters.some(
    (parameter) =>
      parameter === "pm10"
  );

  /*
   * A suitable monitoring station should preferably:
   * - be a monitor
   * - have PM2.5
   * - have PM10
   *
   * We accept monitor stations even if one pollutant
   * is temporarily unavailable.
   */

  return {
    isMonitor,
    hasPM25,
    hasPM10,
    suitable:
      isMonitor &&
      (hasPM25 || hasPM10),
  };
};

// ============================================================
// FIND BEST OPENAQ LOCATION FOR PMC STATION
// ============================================================

const findBestOpenAQLocation = async (
  latitude,
  longitude
) => {
  const apiKey =
    process.env.OPENAQ_API_KEY;

  if (!apiKey) {
    console.warn(
      "OPENAQ_API_KEY is not configured."
    );

    return null;
  }

  try {
    const url =
      `${OPENAQ_BASE_URL}/locations` +
      `?coordinates=${latitude},${longitude}` +
      `&radius=${OPENAQ_MAX_RADIUS_METERS}` +
      `&limit=100`;

    console.log(
      `Searching OpenAQ near ${latitude}, ${longitude}...`
    );

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OpenAQ returned HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    const locations =
      data.results || [];

    if (locations.length === 0) {
      console.log(
        "No OpenAQ locations found."
      );

      return null;
    }

    const candidates = [];

    // ----------------------------------------------------------
    // Check every OpenAQ location
    // ----------------------------------------------------------

    for (const location of locations) {
      const locationLat = Number(
        location.coordinates?.latitude
      );

      const locationLng = Number(
        location.coordinates?.longitude
      );

      if (
        Number.isNaN(locationLat) ||
        Number.isNaN(locationLng)
      ) {
        continue;
      }

      const distanceKm =
        calculateDistanceKm(
          latitude,
          longitude,
          locationLat,
          locationLng
        );

      // Maximum radius = 25 km
      if (distanceKm > 25) {
        continue;
      }

      // Get sensors for this location
      const sensors =
        await getOpenAQLocationSensors(
          location.id,
          apiKey
        );

      const suitability =
        isSuitableOpenAQLocation(
          location,
          sensors
        );

      candidates.push({
        location,
        sensors,
        distanceKm,
        suitability,
      });
    }

    if (candidates.length === 0) {
      console.log(
        "No suitable OpenAQ monitoring station found."
      );

      return null;
    }

    // ----------------------------------------------------------
    // Sort candidates
    //
    // Priority:
    // 1. Monitor
    // 2. PM2.5 + PM10
    // 3. Nearest distance
    // ----------------------------------------------------------

    candidates.sort((a, b) => {
      const aMonitor =
        a.suitability.isMonitor
          ? 1
          : 0;

      const bMonitor =
        b.suitability.isMonitor
          ? 1
          : 0;

      if (bMonitor !== aMonitor) {
        return bMonitor - aMonitor;
      }

      const aBoth =
        a.suitability.hasPM25 &&
        a.suitability.hasPM10
          ? 1
          : 0;

      const bBoth =
        b.suitability.hasPM25 &&
        b.suitability.hasPM10
          ? 1
          : 0;

      if (bBoth !== aBoth) {
        return bBoth - aBoth;
      }

      return (
        a.distanceKm -
        b.distanceKm
      );
    });

    const best = candidates[0];

    console.log(
      "Best OpenAQ match:",
      {
        id: best.location.id,
        name: best.location.name,
        distanceKm:
          Number(
            best.distanceKm.toFixed(3)
          ),
        isMonitor:
          best.suitability.isMonitor,
        hasPM25:
          best.suitability.hasPM25,
        hasPM10:
          best.suitability.hasPM10,
      }
    );

    return {
      id: best.location.id,
      name: best.location.name,
      latitude:
        Number(
          best.location.coordinates
            ?.latitude
        ),
      longitude:
        Number(
          best.location.coordinates
            ?.longitude
        ),
      distanceKm:
        Number(
          best.distanceKm.toFixed(3)
        ),
      isMonitor:
        best.suitability.isMonitor,
      hasPM25:
        best.suitability.hasPM25,
      hasPM10:
        best.suitability.hasPM10,
    };
  } catch (error) {
    console.error(
      "OpenAQ location search failed:",
      error.message
    );

    return null;
  }
};

// ============================================================
// GET ALL MONITORING STATIONS
// GET /api/stations
// ============================================================

const getStations = async (req, res) => {
  try {
    // ----------------------------------------------------------
    // 1. GET STATIONS
    // ----------------------------------------------------------

    const {
      data: stations,
      error: stationError,
    } = await supabase
      .from("station")
      .select("*")
      .order("station_id", {
        ascending: true,
      });

    if (stationError) {
      throw stationError;
    }

    // ----------------------------------------------------------
    // 2. GET LATEST AQI
    // ----------------------------------------------------------

    const {
      data: aqiRows,
      error: aqiError,
    } = await supabase
      .from("aqi_reading")
      .select("*")
      .order("timestamp", {
        ascending: false,
      });

    if (aqiError) {
      throw aqiError;
    }

    // ----------------------------------------------------------
    // 3. GET RAW READINGS
    // ----------------------------------------------------------

    const {
      data: readings,
      error: readingError,
    } = await supabase
      .from("reading")
      .select("*")
      .order("timestamp", {
        ascending: false,
      })
      .limit(5000);

    if (readingError) {
      throw readingError;
    }

    // ----------------------------------------------------------
    // 4. GET DEVICES
    // ----------------------------------------------------------

    const {
      data: devices,
      error: deviceError,
    } = await supabase
      .from("device")
      .select("*");

    if (deviceError) {
      throw deviceError;
    }

    // ----------------------------------------------------------
    // 5. LATEST AQI PER STATION
    // ----------------------------------------------------------

    const latestAqiByStation = {};

    for (const row of aqiRows || []) {
      const stationId =
        String(row.station_id);

      if (
        !latestAqiByStation[stationId]
      ) {
        latestAqiByStation[
          stationId
        ] = row;
      }
    }

    // ----------------------------------------------------------
    // 6. LATEST READING PER STATION + PARAMETER
    // ----------------------------------------------------------

    const latestReadingByStation = {};

    for (const row of readings || []) {
      const stationId =
        String(row.station_id);

      const parameter = String(
        row.parameter || ""
      )
        .trim()
        .toUpperCase();

      const key =
        `${stationId}_${parameter}`;

      if (
        !latestReadingByStation[key]
      ) {
        latestReadingByStation[key] =
          row;
      }
    }

    // ----------------------------------------------------------
    // 7. DEVICES PER STATION
    // ----------------------------------------------------------

    const devicesByStation = {};

    for (const device of devices || []) {
      const stationId =
        String(device.station_id);

      if (
        !devicesByStation[stationId]
      ) {
        devicesByStation[stationId] =
          [];
      }

      devicesByStation[stationId].push(
        device
      );
    }

    // ----------------------------------------------------------
    // 8. BUILD RESPONSE
    // ----------------------------------------------------------

    const result = (
      stations || []
    ).map((station) => {
      const stationId =
        String(station.station_id);

      const aqiRow =
        latestAqiByStation[
          stationId
        ];

      const pm25Row =
        latestReadingByStation[
          `${stationId}_PM2.5`
        ] ||
        latestReadingByStation[
          `${stationId}_PM25`
        ] ||
        latestReadingByStation[
          `${stationId}_PM2_5`
        ];

      const pm10Row =
        latestReadingByStation[
          `${stationId}_PM10`
        ];

      const dominant =
        aqiRow?.dominant_pollutant ||
        "N/A";

      const timestamps = [];

      if (aqiRow?.timestamp) {
        timestamps.push(
          new Date(aqiRow.timestamp)
        );
      }

      if (pm25Row?.timestamp) {
        timestamps.push(
          new Date(pm25Row.timestamp)
        );
      }

      if (pm10Row?.timestamp) {
        timestamps.push(
          new Date(pm10Row.timestamp)
        );
      }

      const latestTimestamp =
        timestamps.length > 0
          ? new Date(
              Math.max(
                ...timestamps.map(
                  (date) =>
                    date.getTime()
                )
              )
            )
          : null;

      // --------------------------------------------------------
      // DEVICE STATUS
      // --------------------------------------------------------

      const stationDevices =
        devicesByStation[
          stationId
        ] || [];

      let deviceOnline = false;

      if (
        stationDevices.length > 0
      ) {
        deviceOnline =
          stationDevices.some(
            (device) => {
              const status =
                String(
                  device.status || ""
                )
                  .trim()
                  .toLowerCase();

              return (
                status === "online" ||
                status === "active" ||
                status === "connected"
              );
            }
          );
      }

      // --------------------------------------------------------
      // STATION STATUS
      // --------------------------------------------------------

      const databaseStatus =
        String(
          station.status || ""
        )
          .trim()
          .toLowerCase();

      let stationStatus =
        "Offline";

      if (
        databaseStatus === "online" ||
        databaseStatus === "active" ||
        databaseStatus === "connected"
      ) {
        stationStatus = "Online";
      }

      if (deviceOnline) {
        stationStatus = "Online";
      }

      // --------------------------------------------------------
      // AQI
      // --------------------------------------------------------

      const aqi =
        aqiRow?.aqi !== null &&
        aqiRow?.aqi !== undefined
          ? Number(aqiRow.aqi)
          : null;

      // --------------------------------------------------------
      // CATEGORY
      // --------------------------------------------------------

      const category =
        aqiRow?.category ||
        "N/A";

      // --------------------------------------------------------
      // PM2.5
      // --------------------------------------------------------

      const pm25 =
        pm25Row?.value !== null &&
        pm25Row?.value !== undefined
          ? Number(pm25Row.value)
          : null;

      // --------------------------------------------------------
      // PM10
      // --------------------------------------------------------

      const pm10 =
        pm10Row?.value !== null &&
        pm10Row?.value !== undefined
          ? Number(pm10Row.value)
          : null;

      // --------------------------------------------------------
      // UPDATED TEXT
      // --------------------------------------------------------

      let updated = "No data";

      if (latestTimestamp) {
        updated =
          latestTimestamp.toLocaleString(
            "en-IN",
            {
              dateStyle: "short",
              timeStyle: "short",
            }
          );
      }

      // --------------------------------------------------------
      // RETURN FRONTEND OBJECT
      // --------------------------------------------------------

      return {
        id: `PMC-${String(
          station.station_id
        ).padStart(3, "0")}`,

        numericId: String(
          station.station_id
        ),

        station_id:
          station.station_id,

        name:
          station.name,

        ward:
          station.ward ||
          "Unknown Ward",

        zone:
          station.zone ||
          "Unknown Zone",

        latitude:
          Number(station.latitude),

        longitude:
          Number(station.longitude),

        station_type:
          station.station_type,

        installation_date:
          station.installation_date,

        database_status:
          station.status,

        external_source:
          station.external_source ||
          null,

        external_station_id:
          station.external_station_id ||
          null,

        status:
          stationStatus,

        aqi,

        category,

        dominant,

        pm25,

        pm10,

        updated,

        lastReadingAt:
          latestTimestamp
            ? latestTimestamp.toISOString()
            : null,

        deviceCount:
          stationDevices.length,
      };
    });

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(200).json({
      status: "success",

      count: result.length,

      stations: result,
    });
  } catch (error) {
    console.error(
      "GET /api/stations error:",
      error
    );

    return res.status(500).json({
      status: "error",

      message:
        "Failed to fetch monitoring stations.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

// ============================================================
// GET ONE STATION
// GET /api/stations/:id
// ============================================================

const getStationById = async (
  req,
  res
) => {
  try {
    const stationId = Number(
      req.params.id
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

    // =========================================================
    // 1. GET STATION
    // =========================================================

    const {
      data: station,
      error: stationError,
    } = await supabase
      .from("station")
      .select("*")
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

    // =========================================================
    // 2. GET DEVICES
    // =========================================================

    const {
      data: devices,
      error: deviceError,
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

    if (deviceError) {
      throw deviceError;
    }

    const deviceList =
      devices || [];

    const deviceIds =
      deviceList.map(
        (device) =>
          device.device_id
      );

    // =========================================================
    // 3. GET SENSORS
    // =========================================================

    let sensors = [];

    if (deviceIds.length > 0) {
      const {
        data: sensorData,
        error: sensorError,
      } = await supabase
        .from("sensor")
        .select("*")
        .in(
          "device_id",
          deviceIds
        )
        .order("sensor_id", {
          ascending: true,
        });

      if (sensorError) {
        throw sensorError;
      }

      sensors =
        sensorData || [];
    }

    // =========================================================
    // 4. GET POLLUTANT READINGS
    // =========================================================

    const {
      data: readings,
      error: readingError,
    } = await supabase
      .from("reading")
      .select("*")
      .eq(
        "station_id",
        stationId
      )
      .order("timestamp", {
        ascending: false,
      })
      .limit(3000);

    if (readingError) {
      throw readingError;
    }

    const readingList =
      readings || [];

    // =========================================================
    // 5. GET AQI READINGS
    // =========================================================

    const {
      data: aqiRows,
      error: aqiError,
    } = await supabase
      .from("aqi_reading")
      .select("*")
      .eq(
        "station_id",
        stationId
      )
      .order("timestamp", {
        ascending: false,
      })
      .limit(1000);

    if (aqiError) {
      throw aqiError;
    }

    const aqiList =
      aqiRows || [];

    // =========================================================
    // 6. GET ALERTS
    // =========================================================

    const {
      data: alerts,
      error: alertError,
    } = await supabase
      .from("alert")
      .select("*")
      .eq(
        "station_id",
        stationId
      )
      .order("started_time", {
        ascending: false,
      })
      .limit(100);

    if (alertError) {
      throw alertError;
    }

    // =========================================================
    // 7. GET MAINTENANCE
    // =========================================================

    const {
      data: maintenance,
      error: maintenanceError,
    } = await supabase
      .from("maintenance")
      .select("*")
      .eq(
        "station_id",
        stationId
      )
      .order("service_date", {
        ascending: false,
      })
      .limit(100);

    if (maintenanceError) {
      throw maintenanceError;
    }

    // =========================================================
    // 8. GET CALIBRATION
    // =========================================================

    let calibration = [];

    const sensorIds =
      sensors.map(
        (sensor) =>
          sensor.sensor_id
      );

    if (
      sensorIds.length > 0
    ) {
      const {
        data: calibrationData,
        error: calibrationError,
      } = await supabase
        .from("calibration")
        .select("*")
        .in(
          "sensor_id",
          sensorIds
        )
        .order(
          "calibration_date",
          {
            ascending: false,
          }
        );

      if (calibrationError) {
        throw calibrationError;
      }

      calibration =
        calibrationData || [];
    }

    // =========================================================
    // 9. LATEST AQI
    // =========================================================

    const latestAqi =
      aqiList.length
        ? aqiList[0]
        : null;

    const aqi =
      latestAqi?.aqi !== null &&
      latestAqi?.aqi !== undefined
        ? Number(
            latestAqi.aqi
          )
        : null;

    const category =
      latestAqi?.category ||
      "Unknown";

    const dominant =
      latestAqi?.dominant_pollutant ||
      "N/A";

    // =========================================================
    // 10. LATEST READING FOR EACH PARAMETER
    // =========================================================

    const latestReadings = {};

    readingList.forEach(
      (reading) => {
        const parameter =
          String(
            reading.parameter ||
              ""
          )
            .trim()
            .toUpperCase();

        if (
          !latestReadings[
            parameter
          ]
        ) {
          latestReadings[
            parameter
          ] = reading;
        }
      }
    );

    // =========================================================
    // 11. POLLUTANT MAP
    // =========================================================

    const pollutantMap = {
      PM25: "PM2.5",
      "PM2.5": "PM2.5",
      PM2_5: "PM2.5",

      PM10: "PM10",

      NO2: "NO₂",
      "NO₂": "NO₂",

      SO2: "SO₂",
      "SO₂": "SO₂",

      CO: "CO",

      O3: "O₃",
      "O₃": "O₃",

      NH3: "NH₃",
      "NH₃": "NH₃",

      PB: "Pb",
      Pb: "Pb",
    };

    // =========================================================
    // 12. POLLUTANT STANDARDS
    // =========================================================

    const pollutantStandards = {
      "PM2.5": {
        unit: "µg/m³",
        standard: 60,
      },

      PM10: {
        unit: "µg/m³",
        standard: 100,
      },

      "NO₂": {
        unit: "µg/m³",
        standard: 80,
      },

      "SO₂": {
        unit: "µg/m³",
        standard: 80,
      },

      CO: {
        unit: "mg/m³",
        standard: 2,
      },

      "O₃": {
        unit: "µg/m³",
        standard: 100,
      },

      "NH₃": {
        unit: "µg/m³",
        standard: 400,
      },

      Pb: {
        unit: "µg/m³",
        standard: 1,
      },
    };

    // =========================================================
    // 13. BUILD POLLUTANTS
    // =========================================================

    const pollutants = [];

    Object.values(
      latestReadings
    ).forEach(
      (reading) => {
        const originalParameter =
          String(
            reading.parameter ||
              ""
          ).trim();

        const name =
          pollutantMap[
            originalParameter
          ] ||
          pollutantMap[
            originalParameter.toUpperCase()
          ];

        if (!name) {
          return;
        }

        const standardInfo =
          pollutantStandards[
            name
          ] || {};

        let subIndex = null;

        if (
          latestAqi?.pollutant_subindices
        ) {
          subIndex =
            latestAqi
              .pollutant_subindices[
              originalParameter
            ] ??
            latestAqi
              .pollutant_subindices[
                name
              ];
        }

        pollutants.push({
          name,

          value: Number(
            reading.value
          ),

          unit:
            reading.unit ||
            standardInfo.unit ||
            "N/A",

          standard:
            Number(
              standardInfo.standard ||
                0
            ),

          subIndex:
            subIndex !== null
              ? Number(subIndex)
              : 0,

          flag:
            reading.quality_flag ||
            "Valid",

          timestamp:
            reading.timestamp,
        });
      }
    );

    // =========================================================
    // 14. AQI HISTORY
    // =========================================================

    const aqiHistory =
      [...aqiList]
        .reverse()
        .map((row) => ({
          timestamp:
            row.timestamp,

          aqi:
            Number(row.aqi),

          category:
            row.category ||
            "Unknown",

          dominant_pollutant:
            row.dominant_pollutant ||
            "N/A",
        }));

    // =========================================================
    // 15. LAST READING TIME
    // =========================================================

    const lastReadingAt =
      latestAqi?.timestamp ||
      readingList[0]
        ?.timestamp ||
      null;

    // =========================================================
    // 16. GATEWAY
    // =========================================================

    const gatewayId =
      deviceList[0]
        ?.gateway_id ||
      null;

    // =========================================================
    // 17. WEATHER
    // =========================================================

    let site = null;
    let weather = null;

    const {
      data: siteRows,
      error: siteError,
    } = await supabase
      .from("sites")
      .select("*")
      .eq(
        "site_name",
        station.name
      )
      .limit(1);

    if (siteError) {
      throw siteError;
    }

    site =
      siteRows?.[0] ||
      null;

    if (site) {
      const {
        data: weatherRows,
        error: weatherError,
      } = await supabase
        .from("weather_readings")
        .select("*")
        .eq(
          "site_id",
          site.id
        )
        .order("recorded_at", {
          ascending: false,
        })
        .limit(1);

      if (weatherError) {
        throw weatherError;
      }

      weather =
        weatherRows?.[0] ||
        null;
    }

    // =========================================================
    // 18. STATION STATUS
    // =========================================================

    const stationStatus =
      String(
        station.status || ""
      ).toLowerCase();

    const onlineDevice =
      deviceList.some(
        (device) => {
          const deviceStatus =
            String(
              device.status || ""
            ).toLowerCase();

          return [
            "online",
            "active",
            "connected",
          ].includes(
            deviceStatus
          );
        }
      );

    const finalStatus =
      stationStatus ===
        "online" ||
      stationStatus ===
        "active" ||
      stationStatus ===
        "connected" ||
      onlineDevice
        ? "Online"
        : "Offline";

    // =========================================================
    // 19. FINAL RESPONSE
    // =========================================================

    return res.status(200).json({
      status: "success",

      station: {
        ...station,

        id: `PMC-${String(
          station.station_id
        ).padStart(3, "0")}`,

        numericId:
          String(
            station.station_id
          ),

        latitude:
          Number(
            station.latitude
          ),

        longitude:
          Number(
            station.longitude
          ),

        status:
          finalStatus,

        aqi,

        category,

        dominant,

        lastReadingAt,

        gatewayId,

        deviceCount:
          deviceList.length,

        sensorCount:
          sensors.length,

        pollutants,

        readings:
          readingList,

        aqiHistory,

        devices:
          deviceList,

        sensors,

        alerts:
          alerts || [],

        maintenance:
          maintenance || [],

        calibration,

        site,

        weather,
      },
    });
  } catch (error) {
    console.error(
      "getStationById error:",
      error
    );

    return res.status(500).json({
      status: "error",

      message:
        error?.message ||
        "Failed to load station details.",
    });
  }
};

// ============================================================
// CREATE MONITORING STATION
// POST /api/stations
//
// IMPORTANT:
// external_source and external_station_id are NOT entered
// by the admin. They are automatically determined from
// OpenAQ using the station coordinates.
// ============================================================

const createStation = async (
  req,
  res
) => {
  try {
    const {
      name,
      ward,
      zone,
      latitude,
      longitude,
      station_type,
      installation_date,
      status,
    } = req.body;

    // ----------------------------------------------------------
    // 1. REQUIRED FIELD VALIDATION
    // ----------------------------------------------------------

    if (
      !name ||
      latitude === undefined ||
      longitude === undefined ||
      !station_type ||
      !installation_date ||
      !status
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "name, latitude, longitude, station_type, installation_date and status are required",
      });
    }

    // ----------------------------------------------------------
    // 2. CLEAN STRING VALUES
    // ----------------------------------------------------------

    const cleanName =
      String(name).trim();

    const cleanWard =
      ward !== undefined &&
      ward !== null &&
      String(ward).trim() !== ""
        ? String(ward).trim()
        : null;

    const cleanZone =
      zone !== undefined &&
      zone !== null &&
      String(zone).trim() !== ""
        ? String(zone).trim()
        : null;

    const cleanStationType =
      String(
        station_type
      ).trim();

    const cleanStatus =
      String(status).trim();

    // ----------------------------------------------------------
    // 3. NAME VALIDATION
    // ----------------------------------------------------------

    if (!cleanName) {
      return res.status(400).json({
        status: "error",
        message:
          "Station name cannot be empty.",
      });
    }

    // ----------------------------------------------------------
    // 4. COORDINATE VALIDATION
    // ----------------------------------------------------------

    const lat =
      Number(latitude);

    const lng =
      Number(longitude);

    if (
      Number.isNaN(lat) ||
      lat < -90 ||
      lat > 90
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid latitude. Latitude must be between -90 and 90.",
      });
    }

    if (
      Number.isNaN(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid longitude. Longitude must be between -180 and 180.",
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
    // 6. CHECK DUPLICATE STATION NAME
    // ----------------------------------------------------------

    const {
      data: existingStations,
      error: duplicateError,
    } = await supabase
      .from("station")
      .select(
        "station_id, name"
      )
      .ilike(
        "name",
        cleanName
      )
      .limit(1);

    if (duplicateError) {
      console.error(
        "Duplicate station check error:",
        duplicateError
      );

      throw duplicateError;
    }

    if (
      existingStations &&
      existingStations.length > 0
    ) {
      return res.status(409).json({
        status: "error",

        message:
          "A monitoring station with this name already exists.",

        station:
          existingStations[0],
      });
    }

    // ----------------------------------------------------------
    // 7. FIND OPENAQ STATION FIRST
    //
    // We do this BEFORE inserting so the station can be
    // created with external_source and external_station_id.
    // ----------------------------------------------------------

    const openAQMapping =
      await findBestOpenAQLocation(
        lat,
        lng
      );

    // ----------------------------------------------------------
    // 8. INSERT STATION
    // ----------------------------------------------------------

    const {
      data: station,
      error: stationError,
    } = await supabase
      .from("station")
      .insert([
        {
          name:
            cleanName,

          ward:
            cleanWard,

          zone:
            cleanZone,

          latitude:
            lat,

          longitude:
            lng,

          station_type:
            cleanStationType,

          installation_date,

          status:
            cleanStatus,

          // -----------------------------------------------
          // AUTOMATIC OPENAQ MAPPING
          // -----------------------------------------------

          external_source:
            openAQMapping
              ? "OPENAQ"
              : null,

          external_station_id:
            openAQMapping
              ? String(
                  openAQMapping.id
                )
              : null,
        },
      ])
      .select()
      .single();

    // ----------------------------------------------------------
    // 9. DATABASE ERROR
    // ----------------------------------------------------------

    if (stationError) {
      console.error(
        "Create station error:",
        stationError
      );

      return res.status(500).json({
        status: "error",

        message:
          stationError.message ||
          "Failed to create monitoring station.",
      });
    }

    // ----------------------------------------------------------
    // 10. SUCCESS
    // ----------------------------------------------------------

    return res.status(201).json({
      status: "success",

      message:
        "Monitoring station added successfully.",

      station,

      openaq_mapping:
        openAQMapping
          ? {
              source: "OPENAQ",

              station_id:
                openAQMapping.id,

              station_name:
                openAQMapping.name,

              distance_km:
                openAQMapping.distanceKm,

              is_monitor:
                openAQMapping.isMonitor,

              has_pm25:
                openAQMapping.hasPM25,

              has_pm10:
                openAQMapping.hasPM10,
            }
          : null,
    });
  } catch (error) {
    console.error(
      "Create station exception:",
      error
    );

    return res.status(500).json({
      status: "error",

      message:
        error?.message ||
        "Failed to create monitoring station.",
    });
  }
};

// ============================================================
// CREATE MONITORING SITE SETUP
// ============================================================

const createMonitoringSiteSetup =
  async (req, res) => {
    try {
      const {
        station,
        device,
        sensors,
      } = req.body;

      if (
        !station ||
        !device ||
        !Array.isArray(
          sensors
        ) ||
        sensors.length === 0
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Station, device and at least one sensor are required.",
        });
      }

      const {
        data,
        error,
      } = await supabase.rpc(
        "create_monitoring_site_setup",
        {
          p_station:
            station,

          p_device:
            device,

          p_sensors:
            sensors,
        }
      );

      if (error) {
        console.error(
          "Monitoring site setup error:",
          error
        );

        return res.status(400).json({
          status: "error",

          message:
            error.message ||
            "Monitoring site setup failed. No data was stored.",
        });
      }

      return res.status(201).json({
        status: "success",

        message:
          "Monitoring site, device and sensors created successfully.",

        setup: data,
      });
    } catch (error) {
      console.error(
        "Monitoring site setup exception:",
        error
      );

      return res.status(500).json({
        status: "error",

        message:
          error.message ||
          "Setup failed. No data was stored.",
      });
    }
  };

// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
  getStations,
  getStationById,
  createStation,
  createMonitoringSiteSetup,
};