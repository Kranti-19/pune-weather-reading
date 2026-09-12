// controllers/openaqController.js

const supabase = require("../config/supabase");

const OPENAQ_BASE_URL = "https://api.openaq.org/v3";

// ======================================================
// Configuration
// ======================================================

// Maximum age of an OpenAQ measurement that we consider
// current/live for the dashboard.
const MAX_DATA_AGE_MINUTES = 60;

// ======================================================
// OpenAQ API Request
// ======================================================

async function openaqRequest(endpoint) {
  const apiKey = process.env.OPENAQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAQ_API_KEY is missing in .env"
    );
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
    const errorText =
      await response.text();

    throw new Error(
      `OpenAQ API ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

// ======================================================
// Get OpenAQ Location Sensors
// ======================================================
//
// We do NOT use hardcoded sensor IDs.
//
// Every OpenAQ location can have different sensors.
// Therefore we fetch the sensors dynamically.
//
// ======================================================

async function getOpenAQSensors(locationId) {
  const data =
    await openaqRequest(
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
//
// Example:
//
// {
//   pm25: [12236463],
//   pm10: [12236462],
//   no2: [12236460],
//   o3: [12236461],
//   so2: [12236465],
//   co: [12236458]
// }
//
// Different OpenAQ locations automatically get
// different sensor IDs.
//
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
      normalizeParameterName(
        parameterName
      );

    if (!parameter) {
      continue;
    }

    sensorMap[parameter].push(
      Number(sensorId)
    );
  }

  return sensorMap;
}

// ======================================================
// Get Latest Measurements
// ======================================================

async function getOpenAQLatest(locationId) {
  const data =
    await openaqRequest(
      `/locations/${locationId}/latest?limit=100`
    );

  return data.results || [];
}

// ======================================================
// Find Latest Result For Sensor IDs
// ======================================================
//
// Some locations can have more than one sensor for the
// same pollutant.
//
// Example Hadapsar:
//
// PM2.5:
//   389762
//   12236449
//
// We select the newest available result.
//
// ======================================================

function findLatestResultForSensors(
  results,
  sensorIds
) {
  if (
    !sensorIds ||
    sensorIds.length === 0
  ) {
    return null;
  }

  const matchingResults =
    results.filter((item) => {
      const itemSensorId =
        item.sensorsId ??
        item.sensorId ??
        item.sensor_id;

      return sensorIds.some(
        (id) =>
          Number(id) ===
          Number(itemSensorId)
      );
    });

  if (
    matchingResults.length === 0
  ) {
    return null;
  }

  matchingResults.sort(
    (a, b) => {
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
    }
  );

  return matchingResults[0];
}

// ======================================================
// Extract Pollutants Dynamically
// ======================================================

function extractPollutants(
  results,
  sensorMap
) {
  const pollutants = {};

  for (
    const parameter of Object.keys(
      sensorMap
    )
  ) {
    const result =
      findLatestResultForSensors(
        results,
        sensorMap[parameter]
      );

    if (!result) {
      pollutants[parameter] =
        null;

      continue;
    }

    const sensorId =
      result.sensorsId ??
      result.sensorId ??
      result.sensor_id ??
      null;

    pollutants[parameter] = {
      sensorId: sensorId,

      value:
        result.value !== null &&
        result.value !== undefined
          ? Number(result.value)
          : null,

      unit:
        result.unit ||
        result.parameter?.units ||
        null,

      datetime:
        result.datetime?.utc ||
        result.datetime?.local ||
        null,
    };
  }

  return pollutants;
}

// ======================================================
// PPB → µg/m³ Conversion
// ======================================================

function ppbToUgM3(
  parameter,
  value
) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(
      Number(value)
    )
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

function normalizePollutants(
  raw
) {
  const normalized = {};

  for (
    const [
      parameter,
      data,
    ] of Object.entries(raw)
  ) {
    if (!data) {
      normalized[parameter] =
        null;

      continue;
    }

    let value =
      Number(data.value);

    if (
      Number.isNaN(value)
    ) {
      normalized[parameter] =
        null;

      continue;
    }

    const unit =
      String(
        data.unit || ""
      )
        .toLowerCase()
        .trim();

    /*
     * Convert gas measurements
     * reported by OpenAQ in ppb.
     */

    if (unit === "ppb") {
      value =
        ppbToUgM3(
          parameter,
          value
        );
    }

    normalized[parameter] =
      Number(
        value.toFixed(3)
      );
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
    Number.isNaN(
      Number(concentration)
    )
  ) {
    return null;
  }

  const value =
    Number(concentration);

  for (
    const [
      cLow,
      cHigh,
      iLow,
      iHigh,
    ] of breakpoints
  ) {
    if (
      value >= cLow &&
      value <= cHigh
    ) {
      /*
       * AQI formula:
       *
       * I =
       * [(IHigh - ILow) /
       * (CHigh - CLow)]
       * × (C - CLow)
       * + ILow
       */

      const index =
        ((iHigh - iLow) /
          (cHigh - cLow)) *
          (value - cLow) +
        iLow;

      return Math.round(
        index
      );
    }
  }

  /*
   * Concentration above highest
   * breakpoint.
   */

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

function calculateAQI(
  pollutants
) {
  const subIndexes = {};

  for (
    const parameter of Object.keys(
      BREAKPOINTS
    )
  ) {
    subIndexes[parameter] =
      calculateSubIndex(
        pollutants[parameter],
        BREAKPOINTS[parameter]
      );
  }

  const validIndexes =
    Object.entries(
      subIndexes
    ).filter(
      ([, value]) =>
        value !== null
    );

  if (
    validIndexes.length === 0
  ) {
    return {
      aqi: null,

      dominantPollutant:
        null,

      subIndexes,
    };
  }

  /*
   * Highest pollutant sub-index
   * becomes overall AQI.
   */

  validIndexes.sort(
    (a, b) =>
      b[1] - a[1]
  );

  return {
    aqi:
      validIndexes[0][1],

    dominantPollutant:
      validIndexes[0][0],

    subIndexes,
  };
}

// ======================================================
// AQI Category
// ======================================================

function getAQICategory(
  aqi
) {
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

function getLatestTimestamp(
  raw
) {
  const dates =
    Object.values(raw)
      .filter(
        (item) =>
          item &&
          item.datetime
      )
      .map(
        (item) =>
          new Date(
            item.datetime
          )
      )
      .filter(
        (date) =>
          !Number.isNaN(
            date.getTime()
          )
      );

  if (
    dates.length === 0
  ) {
    return new Date();
  }

  return new Date(
    Math.max(
      ...dates.map(
        (date) =>
          date.getTime()
      )
    )
  );
}

// ======================================================
// Check Data Freshness
// ======================================================

function checkDataFreshness(
  timestamp
) {
  if (!timestamp) {
    return {
      fresh: false,

      ageMinutes: null,

      message:
        "Measurement timestamp is missing",
    };
  }

  const timestampMs =
    new Date(
      timestamp
    ).getTime();

  if (
    Number.isNaN(
      timestampMs
    )
  ) {
    return {
      fresh: false,

      ageMinutes: null,

      message:
        "Invalid measurement timestamp",
    };
  }

  const now =
    Date.now();

  const ageMinutes =
    (now - timestampMs) /
    (1000 * 60);

  /*
   * Future timestamp should not
   * be treated as current.
   */

  if (ageMinutes < 0) {
    return {
      fresh: false,

      ageMinutes:
        Number(
          ageMinutes.toFixed(
            2
          )
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
          ageMinutes.toFixed(
            2
          )
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
        ageMinutes.toFixed(
          2
        )
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
  timestamp
) {
  const rows = [];

  for (
    const [
      parameter,
      value,
    ] of Object.entries(
      pollutants
    )
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      continue;
    }

    rows.push({
      station_id:
        stationId,

      /*
       * OpenAQ is an external source.
       * Therefore sensor_id is NULL.
       */

      sensor_id:
        null,

      timestamp:
        timestamp.toISOString(),

      parameter:
        parameter,

      value:
        value,

      unit:
        "µg/m³",

      quality_flag:
        "OpenAQ",
    });
  }

  if (
    rows.length === 0
  ) {
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

async function syncOpenAQ(
  req,
  res
) {
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
      Number(
        req.params.stationId
      );

    if (!stationId) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid station ID",
      });
    }

    // --------------------------------------------------
    // Get station
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
    // Verify OpenAQ mapping
    // --------------------------------------------------

    if (
      String(
        station.external_source ||
          ""
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
    // Get sensors dynamically
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
    // Build dynamic sensor map
    // --------------------------------------------------

    const sensorMap =
      buildSensorMap(
        sensors
      );

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
    // Fetch OpenAQ latest data
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
    // Extract pollutants
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
    // Normalize values
    // --------------------------------------------------

    const pollutants =
      normalizePollutants(
        raw
      );

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
      getLatestTimestamp(
        raw
      );

    console.log(
      "OpenAQ timestamp:",
      timestamp.toISOString()
    );

    // --------------------------------------------------
    // Check data freshness
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
     * Do not save stale measurements as
     * current/live data.
     *
     * Historical data already in the
     * database is not deleted.
     */

    if (!freshness.fresh) {
      console.log(
        `OpenAQ data is stale for station ${stationId}`
      );

      return res.status(200).json({
        success: false,

        stale: true,

        stationId,

        stationName:
          station.name,

        openaqLocationId:
          locationId,

        aqi: null,

        category:
          "Unavailable",

        dominantPollutant:
          null,

        pollutants,

        subIndexes:
          aqiResult.subIndexes,

        timestamp,

        ageMinutes:
          freshness.ageMinutes,

        sensorMap,

        freshness,

        message:
          `OpenAQ data is stale or unavailable. ${freshness.message}.`,
      });
    }

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
        timestamp.toISOString()
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

      // ----------------------------------------------
      // Check existing pollutant readings
      // ----------------------------------------------

      const {
        data: existingReadings,
        error:
          readingCheckError,
      } = await supabase
        .from("reading")
        .select(
          "reading_id, parameter"
        )
        .eq(
          "station_id",
          stationId
        )
        .eq(
          "timestamp",
          timestamp.toISOString()
        )
        .eq(
          "quality_flag",
          "OpenAQ"
        );

      if (
        readingCheckError
      ) {
        throw readingCheckError;
      }

      const existingParameters =
        new Set(
          (
            existingReadings ||
            []
          ).map(
            (row) =>
              String(
                row.parameter
              ).toLowerCase()
          )
        );

      // ----------------------------------------------
      // Find missing pollutant readings
      // ----------------------------------------------

      const missingReadings =
        [];

      for (
        const [
          parameter,
          value,
        ] of Object.entries(
          pollutants
        )
      ) {
        if (
          value === null ||
          value === undefined
        ) {
          continue;
        }

        if (
          existingParameters.has(
            parameter.toLowerCase()
          )
        ) {
          continue;
        }

        missingReadings.push({
          station_id:
            stationId,

          sensor_id:
            null,

          timestamp:
            timestamp.toISOString(),

          parameter:
            parameter,

          value:
            value,

          unit:
            "µg/m³",

          quality_flag:
            "OpenAQ",
        });
      }

      // ----------------------------------------------
      // Insert missing readings
      // ----------------------------------------------

      let insertedReadings =
        [];

      if (
        missingReadings.length >
        0
      ) {
        console.log(
          `Adding ${missingReadings.length} missing OpenAQ readings...`
        );

        const {
          data,
          error,
        } = await supabase
          .from("reading")
          .insert(
            missingReadings
          )
          .select();

        if (error) {
          throw error;
        }

        insertedReadings =
          data || [];
      }

      console.log(
        `Added ${insertedReadings.length} readings`
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

        insertedReadings,

        message:
          insertedReadings.length >
          0
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
        timestamp:
          timestamp.toISOString(),

        station_id:
          stationId,

        aqi:
          aqiResult.aqi,

        category:
          category,

        dominant_pollutant:
          aqiResult.dominantPollutant,

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
        timestamp
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
// Export
// ======================================================

module.exports = {
  syncOpenAQ,
};