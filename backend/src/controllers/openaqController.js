// controllers/openaqController.js

const supabase = require("../config/supabase");

const OPENAQ_BASE_URL = "https://api.openaq.org/v3";

// ======================================================
// Configuration
// ======================================================

// Data newer than this is considered Current.
// Older data is still stored as Historical.
const MAX_DATA_AGE_MINUTES = 60;

// ======================================================
// OpenAQ API Request
// ======================================================

async function openaqRequest(endpoint) {
  const apiKey = process.env.OPENAQ_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAQ_API_KEY is missing in .env");
  }

  const response = await fetch(
    `${OPENAQ_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenAQ API ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

// ======================================================
// Get OpenAQ Location Sensors
// ======================================================

async function getOpenAQSensors(locationId) {
  const data = await openaqRequest(
    `/locations/${locationId}/sensors`
  );

  return data.results || [];
}

// ======================================================
// Normalize OpenAQ Parameter Name
// ======================================================

function normalizeParameterName(name) {
  if (!name) {
    return null;
  }

  const value = String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  const mapping = {
    pm25: "pm25",
    "pm2.5": "pm25",
    pm2_5: "pm25",

    pm10: "pm10",

    no2: "no2",
    nitrogen_dioxide: "no2",
    nitrogendioxide: "no2",

    so2: "so2",
    sulfur_dioxide: "so2",
    sulphur_dioxide: "so2",
    sulfurdioxide: "so2",
    sulphurdioxide: "so2",

    o3: "o3",
    ozone: "o3",

    co: "co",
    carbon_monoxide: "co",
    carbonmonoxide: "co",
  };

  return mapping[value] || null;
}

// ======================================================
// Build Dynamic Sensor Map
// ======================================================

function buildSensorMap(sensors) {
  const sensorMap = {
    pm25: [],
    pm10: [],
    no2: [],
    o3: [],
    so2: [],
    co: [],
  };

  for (const sensor of sensors) {
    const sensorId =
      sensor.id ??
      sensor.sensorId ??
      sensor.sensorsId;

    if (!sensorId) {
      continue;
    }

    const parameterName =
      sensor.parameter?.name ??
      sensor.parameter?.displayName ??
      sensor.name ??
      null;

    const parameter =
      normalizeParameterName(parameterName);

    if (!parameter) {
      continue;
    }

    sensorMap[parameter].push(Number(sensorId));
  }

  return sensorMap;
}

// ======================================================
// Get Latest Measurements
// ======================================================

async function getOpenAQLatest(locationId) {
  const data = await openaqRequest(
    `/locations/${locationId}/latest?limit=100`
  );

  return data.results || [];
}

// ======================================================
// Find Latest Result For Sensor IDs
// ======================================================

function findLatestResultForSensors(
  results,
  sensorIds
) {
  if (!sensorIds || sensorIds.length === 0) {
    return null;
  }

  const matchingResults = results.filter((item) => {
    const itemSensorId =
      item.sensorsId ??
      item.sensorId ??
      item.sensor_id;

    return sensorIds.some(
      (id) =>
        Number(id) === Number(itemSensorId)
    );
  });

  if (matchingResults.length === 0) {
    return null;
  }

  matchingResults.sort((a, b) => {
    const dateA = new Date(
      a.datetime?.utc ||
        a.datetime?.local ||
        0
    ).getTime();

    const dateB = new Date(
      b.datetime?.utc ||
        b.datetime?.local ||
        0
    ).getTime();

    return dateB - dateA;
  });

  return matchingResults[0];
}

// ======================================================
// Extract Pollutants Dynamically
// ======================================================

function extractPollutants(results, sensorMap) {
  const pollutants = {};

  for (const parameter of Object.keys(sensorMap)) {
    const result =
      findLatestResultForSensors(
        results,
        sensorMap[parameter]
      );

    if (!result) {
      pollutants[parameter] = null;
      continue;
    }

    const sensorId =
      result.sensorsId ??
      result.sensorId ??
      result.sensor_id ??
      null;

    pollutants[parameter] = {
      sensorId,

      value:
        result.value !== null &&
        result.value !== undefined
          ? Number(result.value)
          : null,

      unit:
        result.unit ||
        result.parameter?.units ||
        null,

      // IMPORTANT:
      // Preserve the actual OpenAQ timestamp
      datetime:
        result.datetime?.utc ||
        result.datetime?.local ||
        null,
    };
  }

  return pollutants;
}

// ======================================================
// PPB -> micrograms/m3 Conversion
// ======================================================

function ppbToUgM3(parameter, value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return null;
  }

  /*
   * Approximate conversion at standard
   * temperature and pressure.
   *
   * NO2 : 1 ppb ≈ 1.8819 µg/m³
   * SO2 : 1 ppb ≈ 2.6197 µg/m³
   * O3  : 1 ppb ≈ 1.9628 µg/m³
   * CO  : 1 ppb ≈ 1.1450 µg/m³
   */

  const factors = {
    no2: 1.8819,
    so2: 2.6197,
    o3: 1.9628,
    co: 1.1450,
  };

  if (!factors[parameter]) {
    return Number(value);
  }

  return (
    Number(value) *
    factors[parameter]
  );
}

// ======================================================
// Normalize Pollutant Values
// ======================================================

function normalizePollutants(raw) {
  const normalized = {};

  for (const [parameter, data] of Object.entries(raw)) {
    if (!data) {
      normalized[parameter] = null;
      continue;
    }

    let value = Number(data.value);

    if (Number.isNaN(value)) {
      normalized[parameter] = null;
      continue;
    }

    const unit = String(
      data.unit || ""
    )
      .toLowerCase()
      .trim();

    // Convert gases reported in ppb.
    if (unit === "ppb") {
      value = ppbToUgM3(
        parameter,
        value
      );
    }

    normalized[parameter] =
      Number(value.toFixed(3));
  }

  return normalized;
}

// ======================================================
// CPCB AQI Breakpoints
// ======================================================

const BREAKPOINTS = {
  pm25: [
    [0, 30, 0, 50],
    [31, 60, 51, 100],
    [61, 90, 101, 200],
    [91, 120, 201, 300],
    [121, 250, 301, 400],
    [251, 500, 401, 500],
  ],

  pm10: [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 250, 101, 200],
    [251, 350, 201, 300],
    [351, 430, 301, 400],
    [431, 500, 401, 500],
  ],

  no2: [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 180, 101, 200],
    [181, 280, 201, 300],
    [281, 400, 301, 400],
    [401, 1000, 401, 500],
  ],

  so2: [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 380, 101, 200],
    [381, 800, 201, 300],
    [801, 1600, 301, 400],
    [1601, 2000, 401, 500],
  ],

  o3: [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 168, 101, 200],
    [169, 208, 201, 300],
    [209, 748, 301, 400],
    [749, 1000, 401, 500],
  ],
};

// ======================================================
// Calculate Individual AQI Sub-index
// ======================================================

function calculateSubIndex(
  concentration,
  breakpoints
) {
  if (
    concentration === null ||
    concentration === undefined ||
    Number.isNaN(Number(concentration))
  ) {
    return null;
  }

  const value = Number(concentration);

  for (const [
    cLow,
    cHigh,
    iLow,
    iHigh,
  ] of breakpoints) {
    if (
      value >= cLow &&
      value <= cHigh
    ) {
      const index =
        ((iHigh - iLow) /
          (cHigh - cLow)) *
          (value - cLow) +
        iLow;

      return Math.round(index);
    }
  }

  // Above highest breakpoint.
  if (
    value >
    breakpoints[
      breakpoints.length - 1
    ][1]
  ) {
    return 500;
  }

  return null;
}

// ======================================================
// Calculate Overall AQI
// ======================================================

function calculateAQI(pollutants) {
  const subIndexes = {};

  for (const parameter of Object.keys(
    BREAKPOINTS
  )) {
    subIndexes[parameter] =
      calculateSubIndex(
        pollutants[parameter],
        BREAKPOINTS[parameter]
      );
  }

  const validIndexes = Object.entries(
    subIndexes
  ).filter(
    ([, value]) => value !== null
  );

  if (validIndexes.length === 0) {
    return {
      aqi: null,
      dominantPollutant: null,
      subIndexes,
    };
  }

  validIndexes.sort(
    (a, b) => b[1] - a[1]
  );

  return {
    aqi: validIndexes[0][1],

    dominantPollutant:
      validIndexes[0][0],

    subIndexes,
  };
}

// ======================================================
// AQI Category
// ======================================================

function getAQICategory(aqi) {
  if (
    aqi === null ||
    aqi === undefined
  ) {
    return "Unavailable";
  }

  if (aqi <= 50) {
    return "Good";
  }

  if (aqi <= 100) {
    return "Satisfactory";
  }

  if (aqi <= 200) {
    return "Moderate";
  }

  if (aqi <= 300) {
    return "Poor";
  }

  if (aqi <= 400) {
    return "Very Poor";
  }

  return "Severe";
}

// ======================================================
// Find Latest Timestamp
// ======================================================

function getLatestTimestamp(raw) {
  const dates = Object.values(raw)
    .filter(
      (item) =>
        item &&
        item.datetime
    )
    .map(
      (item) =>
        new Date(item.datetime)
    )
    .filter(
      (date) =>
        !Number.isNaN(
          date.getTime()
        )
    );

  // IMPORTANT:
  // Never use NOW() as a fallback.
  if (dates.length === 0) {
    return null;
  }

  return new Date(
    Math.max(
      ...dates.map((date) =>
        date.getTime()
      )
    )
  );
}

// ======================================================
// Check Data Freshness
// ======================================================

function checkDataFreshness(timestamp) {
  if (!timestamp) {
    return {
      fresh: false,
      ageMinutes: null,
      message:
        "Measurement timestamp is missing",
    };
  }

  const timestampMs =
    new Date(timestamp).getTime();

  if (Number.isNaN(timestampMs)) {
    return {
      fresh: false,
      ageMinutes: null,
      message:
        "Invalid measurement timestamp",
    };
  }

  const now = Date.now();

  const ageMinutes =
    (now - timestampMs) /
    (1000 * 60);

  if (ageMinutes < 0) {
    return {
      fresh: false,

      ageMinutes:
        Number(
          ageMinutes.toFixed(2)
        ),

      message:
        "Measurement timestamp is in the future",
    };
  }

  if (
    ageMinutes >
    MAX_DATA_AGE_MINUTES
  ) {
    return {
      fresh: false,

      ageMinutes:
        Number(
          ageMinutes.toFixed(2)
        ),

      message:
        `Measurement is ${ageMinutes.toFixed(
          1
        )} minutes old`,
    };
  }

  return {
    fresh: true,

    ageMinutes:
      Number(
        ageMinutes.toFixed(2)
      ),

    message:
      "Measurement is current",
  };
}

// ======================================================
// Save Pollutant Readings
// ======================================================

async function saveReadings(
  stationId,
  pollutants,
  rawPollutants,
  dataStatus = "Current"
) {
  const rows = [];

  for (const [
    parameter,
    value,
  ] of Object.entries(pollutants)) {

    if (
      value === null ||
      value === undefined
    ) {
      continue;
    }

    // --------------------------------------------------
    // Get the ACTUAL timestamp for this pollutant
    // --------------------------------------------------

    const rawData =
      rawPollutants[parameter];

    if (
      !rawData ||
      !rawData.datetime
    ) {
      console.log(
        `Skipping ${parameter}: OpenAQ timestamp missing`
      );

      continue;
    }

    const measurementTimestamp =
      new Date(
        rawData.datetime
      );

    if (
      Number.isNaN(
        measurementTimestamp.getTime()
      )
    ) {
      console.log(
        `Skipping ${parameter}: invalid OpenAQ timestamp`
      );

      continue;
    }

    const timestampISO =
      measurementTimestamp.toISOString();

    // --------------------------------------------------
    // Check duplicate reading
    // --------------------------------------------------

    const {
      data: existingReading,
      error: existingError,
    } = await supabase
      .from("reading")
      .select("reading_id")
      .eq(
        "station_id",
        stationId
      )
      .eq(
        "parameter",
        parameter
      )
      .eq(
        "timestamp",
        timestampISO
      )
      .eq(
        "quality_flag",
        "OpenAQ"
      )
      .limit(1);

    if (existingError) {
      throw existingError;
    }

    if (
      existingReading &&
      existingReading.length > 0
    ) {
      console.log(
        `Duplicate skipped → Station ${stationId} | ${parameter} | ${timestampISO}`
      );

      continue;
    }

    // --------------------------------------------------
    // Prepare new reading
    // --------------------------------------------------

    rows.push({
      station_id: stationId,

      // OpenAQ sensor IDs are external.
      sensor_id: null,

      // IMPORTANT:
      // Actual OpenAQ observation timestamp.
      timestamp: timestampISO,

      parameter,

      value,

      unit: "µg/m³",

      quality_flag: "OpenAQ",

      data_status: dataStatus,
    });
  }

  if (rows.length === 0) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("reading")
    .insert(rows)
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}

// ======================================================
// MAIN OpenAQ SYNC
// ======================================================

async function syncOpenAQ(req, res) {
  try {
    console.log(
      "======================================"
    );

    console.log(
      "Starting OpenAQ synchronization..."
    );

    // --------------------------------------------------
    // Station ID
    // --------------------------------------------------

    const stationId =
      Number(req.params.stationId);

    if (!stationId) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid station ID",
      });
    }

    // --------------------------------------------------
    // Get Station
    // --------------------------------------------------

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
      .single();

    if (
      stationError ||
      !station
    ) {
      return res.status(404).json({
        success: false,

        message:
          "Station not found",
      });
    }

    console.log(
      "PMC Station:",
      station.name
    );

    console.log(
      "Coordinates:",
      station.latitude,
      station.longitude
    );

    // --------------------------------------------------
    // Verify OpenAQ Mapping
    // --------------------------------------------------

    if (
      String(
        station.external_source || ""
      ).toUpperCase() !==
        "OPENAQ" ||
      !station.external_station_id
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Station is not mapped to OpenAQ",
      });
    }

    const locationId =
      station.external_station_id;

    console.log(
      "OpenAQ Location:",
      locationId
    );

    // --------------------------------------------------
    // Get Sensors Dynamically
    // --------------------------------------------------

    console.log(
      "Fetching OpenAQ sensors..."
    );

    const sensors =
      await getOpenAQSensors(
        locationId
      );

    if (
      !sensors ||
      sensors.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "No OpenAQ sensors found for this location",
      });
    }

    console.log(
      `OpenAQ returned ${sensors.length} sensors`
    );

    // --------------------------------------------------
    // Build Sensor Map
    // --------------------------------------------------

    const sensorMap =
      buildSensorMap(sensors);

    console.log(
      "Dynamic OpenAQ sensor map:"
    );

    console.log(
      JSON.stringify(
        sensorMap,
        null,
        2
      )
    );

    // --------------------------------------------------
    // Fetch Latest Data
    // --------------------------------------------------

    const results =
      await getOpenAQLatest(
        locationId
      );

    if (
      !results ||
      results.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "No OpenAQ measurements found",
      });
    }

    console.log(
      `OpenAQ returned ${results.length} latest measurements`
    );

    // --------------------------------------------------
    // Extract Pollutants
    // --------------------------------------------------

    const raw =
      extractPollutants(
        results,
        sensorMap
      );

    console.log(
      "Raw OpenAQ pollutants:",
      raw
    );

    // --------------------------------------------------
    // Normalize Values
    // --------------------------------------------------

    const pollutants =
      normalizePollutants(raw);

    console.log(
      "Normalized pollutants:",
      pollutants
    );

    // --------------------------------------------------
    // Calculate AQI
    // --------------------------------------------------

    const aqiResult =
      calculateAQI(
        pollutants
      );

    const category =
      getAQICategory(
        aqiResult.aqi
      );

    console.log(
      "AQI:",
      aqiResult.aqi
    );

    console.log(
      "Category:",
      category
    );

    console.log(
      "Dominant pollutant:",
      aqiResult.dominantPollutant
    );

    // --------------------------------------------------
    // Timestamp
    // --------------------------------------------------

    const timestamp =
      getLatestTimestamp(raw);

    // IMPORTANT:
    // Never create a fake timestamp.
    if (!timestamp) {
      return res.status(502).json({
        success: false,

        message:
          "OpenAQ measurements were returned, but no valid measurement timestamp was found",
      });
    }

    console.log(
      "OpenAQ timestamp:",
      timestamp.toISOString()
    );

    // --------------------------------------------------
    // Freshness
    // --------------------------------------------------

    const freshness =
      checkDataFreshness(
        timestamp
      );

    console.log(
      "Data freshness:",
      freshness
    );

    /*
     * IMPORTANT:
     *
     * Fresh data:
     *     data_status = Current
     *
     * Stale data:
     *     data_status = Historical
     *
     * We do not modify the actual measurement timestamp.
     */

    const dataStatus =
      freshness.fresh
        ? "Current"
        : "Historical";

    if (!freshness.fresh) {
      console.log(
        `OpenAQ data is stale for station ${stationId}`
      );

      console.log(
        `Saving as Historical data. Age: ${freshness.ageMinutes} minutes`
      );
    }

    const timestampISO =
      timestamp.toISOString();

    // ==================================================
    // CHECK EXISTING AQI
    // ==================================================

    const {
      data: existingAQI,
      error: duplicateError,
    } = await supabase
      .from("aqi_reading")
      .select("aqi_id")
      .eq(
        "station_id",
        stationId
      )
      .eq(
        "timestamp",
        timestampISO
      )
      .limit(1);

    if (duplicateError) {
      throw duplicateError;
    }

    // ==================================================
    // AQI ALREADY EXISTS
    // ==================================================

    if (
      existingAQI &&
      existingAQI.length > 0
    ) {
      console.log(
        "AQI record already exists."
      );

      // ------------------------------------------------
      // Save any missing pollutant readings.
      //
      // IMPORTANT:
      // Each pollutant uses its OWN OpenAQ timestamp.
      // ------------------------------------------------

      const insertedReadings =
        await saveReadings(
          stationId,
          pollutants,
          raw,
          dataStatus
        );

      console.log(
        `Added ${insertedReadings.length} new readings`
      );

      console.log(
        "OpenAQ synchronization completed."
      );

      console.log(
        "======================================"
      );

      return res.json({
        success: true,

        duplicate: true,

        readingsAdded:
          insertedReadings.length,

        stationId,

        stationName:
          station.name,

        openaqLocationId:
          locationId,

        aqi:
          aqiResult.aqi,

        category,

        dominantPollutant:
          aqiResult.dominantPollutant,

        pollutants,

        subIndexes:
          aqiResult.subIndexes,

        timestamp,

        sensorMap,

        freshness,

        dataStatus,

        insertedReadings,

        message:
          insertedReadings.length > 0
            ? "AQI already existed; missing OpenAQ pollutant readings were added"
            : "OpenAQ observation already exists",
      });
    }

    // ==================================================
    // INSERT NEW AQI RECORD
    // ==================================================

    console.log(
      "Creating new AQI record..."
    );

    const {
      data: aqiReading,
      error: aqiError,
    } = await supabase
      .from("aqi_reading")
      .insert({
        // IMPORTANT:
        // AQI uses the latest actual
        // OpenAQ observation timestamp.
        timestamp: timestampISO,

        station_id:
          stationId,

        aqi:
          aqiResult.aqi,

        category,

        dominant_pollutant:
          aqiResult.dominantPollutant,

        data_status:
          dataStatus,

        pollutant_subindices:
          aqiResult.subIndexes,
      })
      .select()
      .single();

    if (aqiError) {
      throw aqiError;
    }

    console.log(
      "AQI record created:",
      aqiReading.aqi_id
    );

    // ==================================================
    // INSERT POLLUTANT READINGS
    // ==================================================

    const readings =
      await saveReadings(
        stationId,
        pollutants,
        raw,
        dataStatus
      );

    console.log(
      `Inserted ${readings.length} pollutant readings`
    );

    console.log(
      "OpenAQ synchronization completed."
    );

    console.log(
      "======================================"
    );

    // ==================================================
    // FINAL RESPONSE
    // ==================================================

    return res.json({
      success: true,

      duplicate: false,

      stationId,

      stationName:
        station.name,

      openaqLocationId:
        locationId,

      aqi:
        aqiResult.aqi,

      category,

      dominantPollutant:
        aqiResult.dominantPollutant,

      pollutants,

      subIndexes:
        aqiResult.subIndexes,

      timestamp,

      sensorMap,

      freshness,

      dataStatus,

      aqiReading,

      readings,
    });

  } catch (error) {
    console.error(
      "======================================"
    );

    console.error(
      "OpenAQ synchronization error:"
    );

    console.error(error);

    console.error(
      "======================================"
    );

    return res.status(500).json({
      success: false,

      message:
        error.message,
    });
  }
}

// ======================================================
// Match Existing PMC Stations -> OpenAQ Locations
// ======================================================

async function matchStations(req, res) {
  try {
    console.log(
      "======================================"
    );

    console.log(
      "Starting OpenAQ station matching..."
    );

    const {
      data: stations,
      error: stationError,
    } = await supabase
      .from("station")
      .select(`
        station_id,
        name,
        latitude,
        longitude,
        status,
        external_source,
        external_station_id
      `)
      .order(
        "station_id",
        {
          ascending: true,
        }
      );

    if (stationError) {
      throw stationError;
    }

    if (
      !stations ||
      stations.length === 0
    ) {
      return res.json({
        success: true,

        message:
          "No stations found",

        matched: 0,

        results: [],
      });
    }

    const results = [];

    for (const station of stations) {
      try {
        console.log(
          `Matching station ${station.station_id}: ${station.name}`
        );

        const latitude =
          Number(
            station.latitude
          );

        const longitude =
          Number(
            station.longitude
          );

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          results.push({
            station_id:
              station.station_id,

            station_name:
              station.name,

            matched: false,

            message:
              "Invalid station coordinates",
          });

          continue;
        }

        const endpoint =
          `/locations?coordinates=${latitude},${longitude}` +
          `&radius=25000&limit=100`;

        const data =
          await openaqRequest(
            endpoint
          );

        const locations =
          data.results || [];

        if (
          locations.length === 0
        ) {
          results.push({
            station_id:
              station.station_id,

            station_name:
              station.name,

            matched: false,

            message:
              "No OpenAQ locations found",
          });

          continue;
        }

        // ------------------------------------------------
        // Prefer monitoring stations
        // ------------------------------------------------

        const monitoringStations =
          locations.filter(
            (location) =>
              location.isMonitor ===
                true ||
              location.is_monitor ===
                true
          );

        const candidates =
          monitoringStations.length >
          0
            ? monitoringStations
            : locations;

        // ------------------------------------------------
        // Find nearest location
        // ------------------------------------------------

        let nearest =
          candidates[0];

        for (const location of candidates) {
          if (
            location.distance !==
              undefined &&
            nearest.distance !==
              undefined &&
            Number(
              location.distance
            ) <
              Number(
                nearest.distance
              )
          ) {
            nearest = location;
          }
        }

        const externalStationId =
          nearest.id;

        if (!externalStationId) {
          results.push({
            station_id:
              station.station_id,

            station_name:
              station.name,

            matched: false,

            message:
              "OpenAQ location ID not found",
          });

          continue;
        }

        // ------------------------------------------------
        // Update PMC station
        // ------------------------------------------------

        const {
          data: updatedStation,
          error: updateError,
        } = await supabase
          .from("station")
          .update({
            external_source:
              "OPENAQ",

            external_station_id:
              String(
                externalStationId
              ),
          })
          .eq(
            "station_id",
            station.station_id
          )
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        results.push({
          station_id:
            station.station_id,

          station_name:
            station.name,

          matched: true,

          external_source:
            "OPENAQ",

          external_station_id:
            String(
              externalStationId
            ),

          openaq_name:
            nearest.name,

          openaq_location_id:
            nearest.id,

          /*
           * OpenAQ returns distance in meters.
           * Convert to kilometers.
           */
          distance_km:
            nearest.distance !==
            undefined
              ? Number(
                  (
                    Number(
                      nearest.distance
                    ) / 1000
                  ).toFixed(2)
                )
              : null,
        });

        console.log(
          `Matched ${station.name} → ${nearest.name} (${nearest.id})`
        );

      } catch (error) {
        console.error(
          `Failed to match station ${station.station_id}:`,
          error.message
        );

        results.push({
          station_id:
            station.station_id,

          station_name:
            station.name,

          matched: false,

          error:
            error.message,
        });
      }
    }

    const matchedCount =
      results.filter(
        (item) => item.matched
      ).length;

    console.log(
      `OpenAQ matching completed: ${matchedCount}/${stations.length}`
    );

    console.log(
      "======================================"
    );

    return res.json({
      success: true,

      message:
        "OpenAQ station matching completed",

      totalStations:
        stations.length,

      matched:
        matchedCount,

      results,
    });

  } catch (error) {
    console.error(
      "OpenAQ station matching error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message,
    });
  }
}

// ======================================================
// Export
// ======================================================

module.exports = {
  syncOpenAQ,
  matchStations,
};