// controllers/openaqController.js

const supabase = require("../config/supabase");
const { evaluateAlerts } = require("./alertController");

const OPENAQ_BASE_URL = "https://api.openaq.org/v3";

// ======================================================
// Configuration
// ======================================================

// Data newer than this is considered Current.
// Older data is still stored as Historical.
const MAX_DATA_AGE_MINUTES = 60;

// ======================================================
// In-Memory Calendar Cache
// ======================================================

const CALENDAR_CACHE_TTL_PAST_MS =
  24 * 60 * 60 * 1000;

const CALENDAR_CACHE_TTL_CURRENT_MS =
  10 * 60 * 1000;

const calendarCache = {};

const DAY_CACHE_TTL_MS =
  24 * 60 * 60 * 1000;

const historicalDayCache = {};

function getCachedHistoricalDay(date) {
  const entry =
    historicalDayCache[date];

  if (!entry) {
    return null;
  }

  if (
    Date.now() >
    entry.expiresAt
  ) {
    delete historicalDayCache[date];
    return null;
  }

  return entry.data;
}

function setCachedHistoricalDay(
  date,
  data
) {
  historicalDayCache[date] = {
    data,
    expiresAt:
      Date.now() +
      DAY_CACHE_TTL_MS,
  };
}

function isCurrentMonth(year, month) {
  const now = new Date();

  return (
    year === now.getFullYear() &&
    month === now.getMonth() + 1
  );
}

function getCachedCalendar(
  year,
  month
) {
  const key =
    `${year}-${month}`;

  const entry =
    calendarCache[key];

  if (!entry) {
    return null;
  }

  if (
    Date.now() >
    entry.expiresAt
  ) {
    delete calendarCache[key];
    return null;
  }

  return entry.data;
}

function setCachedCalendar(
  year,
  month,
  data
) {
  const key =
    `${year}-${month}`;

  const ttl =
    isCurrentMonth(year, month)
      ? CALENDAR_CACHE_TTL_CURRENT_MS
      : CALENDAR_CACHE_TTL_PAST_MS;

  calendarCache[key] = {
    data,
    expiresAt:
      Date.now() + ttl,
  };
}

// ======================================================
// OpenAQ API Request
// ======================================================

const OPENAQ_MIN_REQUEST_INTERVAL_MS =
  1200;

let lastOpenAQRequestTime = 0;

let openAQRateLimitedUntil = 0;

async function waitForOpenAQSlot() {
  const now = Date.now();

  if (
    openAQRateLimitedUntil >
    now
  ) {
    const waitMs =
      openAQRateLimitedUntil -
      now;

    console.warn(
      `OpenAQ rate limit active. Waiting ${Math.ceil(
        waitMs / 1000
      )} seconds...`
    );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          waitMs
        )
    );
  }

  const currentTime =
    Date.now();

  const elapsed =
    currentTime -
    lastOpenAQRequestTime;

  if (
    elapsed <
    OPENAQ_MIN_REQUEST_INTERVAL_MS
  ) {
    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          OPENAQ_MIN_REQUEST_INTERVAL_MS -
            elapsed
        )
    );
  }

  lastOpenAQRequestTime =
    Date.now();
}

async function openaqRequest(
  endpoint
) {
  const apiKey =
    process.env.OPENAQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAQ_API_KEY is missing in .env"
    );
  }

  await waitForOpenAQSlot();

  const response =
    await fetch(
      `${OPENAQ_BASE_URL}${endpoint}`,
      {
        method: "GET",

        headers: {
          "X-API-Key":
            apiKey,

          Accept:
            "application/json",
        },
      }
    );

  // ====================================================
  // Handle rate limiting
  // ====================================================

  if (
    response.status === 429
  ) {
    const resetHeader =
      response.headers.get(
        "x-ratelimit-reset"
      );

    const retryAfterHeader =
      response.headers.get(
        "retry-after"
      );

    let waitSeconds =
      Number(
        retryAfterHeader
      );

    if (
      !Number.isFinite(
        waitSeconds
      ) ||
      waitSeconds <= 0
    ) {
      waitSeconds =
        Number(
          resetHeader
        );
    }

    if (
      !Number.isFinite(
        waitSeconds
      ) ||
      waitSeconds <= 0
    ) {
      waitSeconds = 60;
    }

    openAQRateLimitedUntil =
      Date.now() +
      waitSeconds * 1000;

    const errorText =
      await response.text();

    throw new Error(
      `OpenAQ API 429: ${errorText}. ` +
      `Rate limit reset in approximately ${waitSeconds} seconds.`
    );
  }

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

async function getOpenAQSensors(
  locationId
) {
  const data =
    await openaqRequest(
      `/locations/${locationId}/sensors`
    );

  return data.results || [];
}

// ======================================================
// Normalize OpenAQ Parameter Name
// ======================================================

function normalizeParameterName(
  name
) {
  if (!name) {
    return null;
  }

  const value =
    String(name)
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

  return (
    mapping[value] ||
    null
  );
}

// ======================================================
// Build Dynamic Sensor Map
// ======================================================

function buildSensorMap(
  sensors
) {
  const sensorMap = {
    pm25: [],
    pm10: [],
    no2: [],
    o3: [],
    so2: [],
    co: [],
  };

  for (
    const sensor of sensors
  ) {
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

    sensorMap[
      parameter
    ].push(
      Number(sensorId)
    );
  }

  return sensorMap;
}

// ======================================================
// Get Latest Measurements
// ======================================================

async function getOpenAQLatest(
  locationId
) {
  const data =
    await openaqRequest(
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
  if (
    !sensorIds ||
    sensorIds.length === 0
  ) {
    return null;
  }

  const matchingResults =
    results.filter(
      (item) => {
        const itemSensorId =
          item.sensorsId ??
          item.sensorId ??
          item.sensor_id;

        return sensorIds.some(
          (id) =>
            Number(id) ===
            Number(itemSensorId)
        );
      }
    );

  if (
    matchingResults.length === 0
  ) {
    return null;
  }

  matchingResults.sort(
    (a, b) => {
      const dateA =
        new Date(
          a.datetime?.utc ||
          a.datetime?.local ||
          0
        ).getTime();

      const dateB =
        new Date(
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
        sensorMap[
          parameter
        ]
      );

    if (!result) {
      pollutants[
        parameter
      ] = null;

      continue;
    }

    const sensorId =
      result.sensorsId ??
      result.sensorId ??
      result.sensor_id ??
      null;

    pollutants[
      parameter
    ] = {
      sensorId,

      value:
        result.value !== null &&
        result.value !== undefined
          ? Number(
              result.value
            )
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
// PPB -> micrograms/m3 Conversion
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

  const factors = {
    no2: 1.8819,
    so2: 2.6197,
    o3: 1.9628,
    co: 1.1450,
  };

  if (
    !factors[parameter]
  ) {
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
      normalized[
        parameter
      ] = null;

      continue;
    }

    let value =
      Number(data.value);

    if (
      Number.isNaN(value)
    ) {
      normalized[
        parameter
      ] = null;

      continue;
    }

    const unit =
      String(
        data.unit || ""
      )
        .toLowerCase()
        .trim();

    if (
      unit === "ppb"
    ) {
      value =
        ppbToUgM3(
          parameter,
          value
        );
    }

    normalized[
      parameter
    ] = Number(
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
    subIndexes[
      parameter
    ] =
      calculateSubIndex(
        pollutants[
          parameter
        ],
        BREAKPOINTS[
          parameter
        ]
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
    validIndexes.length ===
    0
  ) {
    return {
      aqi: null,
      dominantPollutant:
        null,
      subIndexes,
    };
  }

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
    return null;
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

  if (
    ageMinutes < 0
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
  rawPollutants,
  dataStatus = "Current"
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

    const rawData =
      rawPollutants[
        parameter
      ];

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
      data:
        existingReading,
      error:
        existingError,
    } = await supabase
      .from("reading")
      .select(
        "reading_id"
      )
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
      existingReading.length >
        0
    ) {
      console.log(
        `Duplicate skipped → Station ${stationId} | ${parameter} | ${timestampISO}`
      );

      continue;
    }

    rows.push({
      station_id:
        stationId,

      sensor_id:
        null,

      timestamp:
        timestampISO,

      parameter,

      value,

      unit:
        "µg/m³",

      quality_flag:
        "OpenAQ",

      data_status:
        dataStatus,
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
      return res
        .status(400)
        .json({
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
      error:
        stationError,
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
      return res
        .status(404)
        .json({
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
        station.external_source ||
          ""
      ).toUpperCase() !==
        "OPENAQ" ||
      !station.external_station_id
    ) {
      return res
        .status(400)
        .json({
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
      return res
        .status(404)
        .json({
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
      return res
        .status(404)
        .json({
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

    if (!timestamp) {
      return res
        .status(502)
        .json({
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

    const dataStatus =
      freshness.fresh
        ? "Current"
        : "Historical";

    if (
      !freshness.fresh
    ) {
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
      error:
        duplicateError,
    } = await supabase
      .from("aqi_reading")
      .select(
        "aqi_id"
      )
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

      // ==================================================
      // AUTOMATIC ALERT EVALUATION
      // ==================================================

      let alertEvaluation =
        null;

      if (
        insertedReadings &&
        insertedReadings.length >
          0
      ) {
        try {
          console.log(
            "New pollutant readings detected. Starting automatic alert evaluation..."
          );

          alertEvaluation =
            await evaluateAlerts();

          console.log(
            "Automatic alert evaluation completed:",
            alertEvaluation
          );
        } catch (
          alertError
        ) {
          console.error(
            "Automatic alert evaluation failed:",
            alertError
          );
        }
      } else {
        console.log(
          "No new pollutant readings. Alert evaluation skipped."
        );
      }

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

        alertEvaluation,

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
      data:
        aqiReading,
      error:
        aqiError,
    } = await supabase
      .from("aqi_reading")
      .insert({
        timestamp:
          timestampISO,

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

    // ==================================================
    // AUTOMATIC ALERT EVALUATION
    // ==================================================

    let alertEvaluation =
      null;

    if (
      readings &&
      readings.length > 0
    ) {
      try {
        console.log(
          "New pollutant readings detected. Starting automatic alert evaluation..."
        );

        alertEvaluation =
          await evaluateAlerts();

        console.log(
          "Automatic alert evaluation completed:",
          alertEvaluation
        );
      } catch (
        alertError
      ) {
        // Alert failure should NOT make
        // OpenAQ synchronization fail.
        console.error(
          "Automatic alert evaluation failed:",
          alertError
        );
      }
    } else {
      console.log(
        "No new pollutant readings. Alert evaluation skipped."
      );
    }

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

      alertEvaluation,
    });

  } catch (error) {
    console.error(
      "======================================"
    );

    console.error(
      "OpenAQ synchronization error:"
    );

    console.error(
      error
    );

    console.error(
      "======================================"
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message,
      });
  }
}

// ======================================================
// Match Existing PMC Stations -> OpenAQ Locations
// ======================================================

async function matchStations(
  req,
  res
) {
  try {
    console.log(
      "======================================"
    );

    console.log(
      "Starting OpenAQ station matching..."
    );

    const {
      data: stations,
      error:
        stationError,
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

    for (
      const station of stations
    ) {
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
          !Number.isFinite(
            latitude
          ) ||
          !Number.isFinite(
            longitude
          )
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

        let nearest =
          candidates[0];

        for (
          const location of candidates
        ) {
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
            nearest =
              location;
          }
        }

        const externalStationId =
          nearest.id;

        if (
          !externalStationId
        ) {
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

        const {
          data:
            updatedStation,
          error:
            updateError,
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

      } catch (
        error
      ) {
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
        (item) =>
          item.matched
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

  } catch (
    error
  ) {
    console.error(
      "OpenAQ station matching error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message,
      });
  }
}

// ======================================================
// HISTORICAL OPENAQ DAILY DATA
// ======================================================

async function getOpenAQDailySensorData(
  sensorId,
  from,
  to
) {
  const endpoint =
    `/sensors/${sensorId}/days` +
    `?datetime_from=${encodeURIComponent(from)}` +
    `&datetime_to=${encodeURIComponent(to)}` +
    `&limit=1000`;

  const data =
    await openaqRequest(
      endpoint
    );

  return data.results || [];
}

function extractDailyValue(
  item
) {
  if (!item) {
    return null;
  }

  const value =
    item.value ??
    item.avg ??
    item.summary?.avg ??
    null;

  if (
    value === null ||
    value === undefined ||
    Number.isNaN(
      Number(value)
    )
  ) {
    return null;
  }

  return Number(value);
}

function getOpenAQDailyDate(
  item
) {
  const localDateTime =
    item.period?.datetimeFrom?.local ||
    item.datetimeFrom?.local ||
    item.datetime?.local ||
    null;

  if (!localDateTime) {
    return null;
  }

  return String(
    localDateTime
  ).slice(0, 10);
}

function normalizeHistoricalValue(
  parameter,
  value,
  unit
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

  let normalized =
    Number(value);

  const normalizedUnit =
    String(unit || "")
      .toLowerCase()
      .trim();

  if (
    normalizedUnit ===
    "ppb"
  ) {
    normalized =
      ppbToUgM3(
        parameter,
        normalized
      );
  }

  return Number(
    normalized.toFixed(3)
  );
}

async function insertHistoricalReading(
  stationId,
  date,
  parameter,
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const timestamp =
    new Date(
      `${date}T23:59:59.000Z`
    ).toISOString();

  const {
    data: existing,
    error:
      existingError,
  } =
    await supabase
      .from("reading")
      .select(
        "reading_id"
      )
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
        timestamp
      )
      .eq(
        "quality_flag",
        "OpenAQ-Historical"
      )
      .limit(1);

  if (existingError) {
    throw existingError;
  }

  if (
    existing &&
    existing.length > 0
  ) {
    return null;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("reading")
      .insert({
        station_id:
          stationId,

        sensor_id:
          null,

        timestamp,

        parameter,

        value,

        unit:
          "µg/m³",

        quality_flag:
          "OpenAQ-Historical",

        data_status:
          "Historical",
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}

async function insertHistoricalAQI(
  stationId,
  date,
  aqiResult
) {
  const timestamp =
    new Date(
      `${date}T23:59:59.000Z`
    ).toISOString();

  const {
    data: existing,
    error:
      existingError,
  } =
    await supabase
      .from("aqi_reading")
      .select(
        "aqi_id"
      )
      .eq(
        "station_id",
        stationId
      )
      .eq(
        "timestamp",
        timestamp
      )
      .limit(1);

  if (existingError) {
    throw existingError;
  }

  if (
    existing &&
    existing.length > 0
  ) {
    return {
      duplicate: true,
      data:
        existing[0],
    };
  }

  const category =
    getAQICategory(
      aqiResult.aqi
    );

  const {
    data,
    error,
  } =
    await supabase
      .from("aqi_reading")
      .insert({
        timestamp,

        station_id:
          stationId,

        aqi:
          aqiResult.aqi,

        category,

        dominant_pollutant:
          aqiResult.dominantPollutant,

        data_status:
          "Historical",

        pollutant_subindices:
          aqiResult.subIndexes,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return {
    duplicate: false,
    data,
  };
}

// ======================================================
// HISTORICAL OPENAQ AQI - READ ONLY
// ======================================================

async function getHistoricalSensorDays(
  sensorId,
  from,
  to
) {
  const endpoint =
    `/sensors/${sensorId}/days` +
    `?datetime_from=${encodeURIComponent(from)}` +
    `&datetime_to=${encodeURIComponent(to)}` +
    `&limit=1000`;

  const data =
    await openaqRequest(
      endpoint
    );

  return data.results || [];
}

function getHistoricalDailyValue(
  item
) {
  if (!item) {
    return null;
  }

  const value =
    item.value ??
    item.avg ??
    item.summary?.avg ??
    null;

  if (
    value === null ||
    value === undefined ||
    Number.isNaN(
      Number(value)
    )
  ) {
    return null;
  }

  return Number(value);
}

function getHistoricalDate(
  item
) {
  const localDate =
    item?.period?.datetimeFrom?.local ||
    item?.datetimeFrom?.local ||
    item?.datetime?.local ||
    null;

  if (!localDate) {
    return null;
  }

  return String(
    localDate
  ).substring(0, 10);
}

function normalizeHistoricalPollutant(
  parameter,
  value,
  unit
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

  let normalized =
    Number(value);

  const normalizedUnit =
    String(unit || "")
      .trim()
      .toLowerCase();

  if (
    normalizedUnit ===
    "ppb"
  ) {
    normalized =
      ppbToUgM3(
        parameter,
        normalized
      );
  }

  if (
    normalizedUnit ===
    "ppm"
  ) {
    normalized =
      ppbToUgM3(
        parameter,
        normalized * 1000
      );
  }

  if (
    !Number.isFinite(
      Number(normalized)
    )
  ) {
    return null;
  }

  return Number(
    Number(normalized).toFixed(3)
  );
}

async function getHistoricalStationSensors(
  locationId
) {
  const sensors =
    await getOpenAQSensors(
      locationId
    );

  return sensors || [];
}

async function collectHistoricalStationData(
  station,
  from,
  to
) {
  const locationId =
    station.external_station_id;

  if (!locationId) {
    return {
      station,
      days: {},
      datesFound: 0,
      error:
        "OpenAQ location ID is missing",
    };
  }

  const sensors =
    await getHistoricalStationSensors(
      locationId
    );

  const sensorsByParameter = {
    pm25: [],
    pm10: [],
    no2: [],
    so2: [],
    o3: [],
    co: [],
  };

  for (
    const sensor of sensors
  ) {
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

    if (
      !sensorsByParameter[
        parameter
      ]
    ) {
      continue;
    }

    sensorsByParameter[
      parameter
    ].push({
      sensorId:
        Number(sensorId),

      unit:
        sensor.parameter?.units ||
        sensor.units ||
        "µg/m³",
    });
  }

  const openAQFrom =
    `${from}T00:00:00+05:30`;

  const openAQTo =
    `${to}T23:59:59+05:30`;

  const days = {};

  const parameters =
    Object.keys(
      sensorsByParameter
    ).filter(
      (parameter) =>
        sensorsByParameter[
          parameter
        ].length > 0
    );

  await Promise.all(
    parameters.map(
      async (
        parameter
      ) => {
        const parameterSensors =
          sensorsByParameter[
            parameter
          ];

        const sensorResultsList =
          await Promise.all(
            parameterSensors.map(
              async (
                sensorInfo
              ) => {
                try {
                  const results =
                    await getHistoricalSensorDays(
                      sensorInfo.sensorId,
                      openAQFrom,
                      openAQTo
                    );

                  return {
                    sensorInfo,
                    results,
                  };
                } catch (
                  sensorError
                ) {
                  console.error(
                    `Historical OpenAQ sensor ${sensorInfo.sensorId} failed:`,
                    sensorError.message
                  );

                  return {
                    sensorInfo,
                    results: [],
                  };
                }
              }
            )
          );

        const dailyValues =
          {};

        for (
          const {
            sensorInfo,
            results,
          } of sensorResultsList
        ) {
          for (
            const item of results
          ) {
            const date =
              getHistoricalDate(
                item
              );

            const rawValue =
              getHistoricalDailyValue(
                item
              );

            if (
              !date ||
              rawValue === null
            ) {
              continue;
            }

            const value =
              normalizeHistoricalPollutant(
                parameter,
                rawValue,
                item.parameter?.units ||
                  sensorInfo.unit
              );

            if (
              value === null
            ) {
              continue;
            }

            if (
              !dailyValues[
                date
              ]
            ) {
              dailyValues[
                date
              ] = [];
            }

            dailyValues[
              date
            ].push(value);
          }
        }

        for (
          const date of Object.keys(
            dailyValues
          )
        ) {
          const values =
            dailyValues[
              date
            ];

          if (
            !values ||
            values.length === 0
          ) {
            continue;
          }

          const average =
            values.reduce(
              (
                sum,
                value
              ) =>
                sum +
                Number(
                  value
                ),
              0
            ) /
            values.length;

          if (!days[date]) {
            days[date] = {};
          }

          days[date][
            parameter
          ] =
            Number(
              average.toFixed(
                3
              )
            );
        }
      }
    )
  );

  for (
    const date of Object.keys(
      days
    )
  ) {
    if (
      date < from ||
      date > to
    ) {
      delete days[
        date
      ];
    }
  }

  return {
    station,
    days,
    datesFound:
      Object.keys(
        days
      ).length,
  };
}

async function getHistoricalOpenAQCalendar(
  req,
  res
) {
  try {
    const year =
      Number(
        req.query.year
      );

    const month =
      Number(
        req.query.month
      );

    if (
      !Number.isInteger(
        year
      ) ||
      !Number.isInteger(
        month
      ) ||
      month < 1 ||
      month > 12
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "year and month are required",
        });
    }

    const firstDay =
      `${year}-${String(
        month
      ).padStart(
        2,
        "0"
      )}-01`;

    const lastDayNumber =
      new Date(
        year,
        month,
        0
      ).getDate();

    const lastDay =
      `${year}-${String(
        month
      ).padStart(
        2,
        "0"
      )}-${String(
        lastDayNumber
      ).padStart(
        2,
        "0"
      )}`;

    const noCache =
      req.query.nocache ===
      "1";

    const cached =
      noCache
        ? null
        : getCachedCalendar(
            year,
            month
          );

    if (cached) {
      console.log(
        `Calendar cache HIT for ${year}-${month}`
      );

      return res.json(
        cached
      );
    }

    console.log(
      `Calendar: building from local aqi_reading for ${year}-${month}`
    );

    const nowUtcMs =
      Date.now();

    const nowIstMs =
      nowUtcMs +
      5.5 *
        60 *
        60 *
        1000;

    const todayIst =
      new Date(
        nowIstMs
      )
        .toISOString()
        .slice(
          0,
          10
        );

    const monthStartUTC =
      `${firstDay}T00:00:00Z`;

    const {
      data:
        localRows,
      error:
        localError,
    } = await supabase
      .from(
        "aqi_reading"
      )
      .select(
        "station_id, aqi, dominant_pollutant, timestamp, category"
      )
      .not(
        "aqi",
        "is",
        null
      )
      .gte(
        "timestamp",
        monthStartUTC
      )
      .order(
        "timestamp",
        {
          ascending:
            false,
        }
      )
      .limit(10000);

    const localByDate =
      {};

    if (
      !localError &&
      localRows &&
      localRows.length > 0
    ) {
      for (
        const row of localRows
      ) {
        if (
          !row.timestamp ||
          row.aqi == null
        ) {
          continue;
        }

        const utcMs =
          new Date(
            row.timestamp
          ).getTime();

        if (
          isNaN(utcMs)
        ) {
          continue;
        }

        const istMs =
          utcMs +
          5.5 *
            60 *
            60 *
            1000;

        const istDate =
          new Date(
            istMs
          )
            .toISOString()
            .slice(
              0,
              10
            );

        if (
          istDate <
            firstDay ||
          istDate >
            lastDay
        ) {
          continue;
        }

        if (
          !localByDate[
            istDate
          ]
        ) {
          localByDate[
            istDate
          ] = [];
        }

        const aqiNum =
          Number(
            row.aqi
          );

        if (
          Number.isFinite(
            aqiNum
          ) &&
          aqiNum > 0
        ) {
          localByDate[
            istDate
          ].push({
            aqi:
              aqiNum,

            dominant:
              row.dominant_pollutant ||
              null,

            category:
              row.category ||
              null,
          });
        }
      }
    }

    if (
      !localByDate[
        todayIst
      ]
    ) {
      const {
        data:
          latestRows,
      } = await supabase
        .from(
          "aqi_reading"
        )
        .select(
          "station_id, aqi, dominant_pollutant, timestamp, category"
        )
        .not(
          "aqi",
          "is",
          null
        )
        .order(
          "timestamp",
          {
            ascending:
              false,
          }
        )
        .limit(200);

      if (latestRows) {
        for (
          const row of latestRows
        ) {
          if (
            !row.timestamp ||
            row.aqi == null
          ) {
            continue;
          }

          const utcMs =
            new Date(
              row.timestamp
            ).getTime();

          if (
            isNaN(utcMs)
          ) {
            continue;
          }

          const istMs =
            utcMs +
            5.5 *
              60 *
              60 *
              1000;

          const istDate =
            new Date(
              istMs
            )
              .toISOString()
              .slice(
                0,
                10
              );

          if (
            istDate !==
            todayIst
          ) {
            continue;
          }

          if (
            !localByDate[
              istDate
            ]
          ) {
            localByDate[
              istDate
            ] = [];
          }

          const aqiNum =
            Number(
              row.aqi
            );

          if (
            Number.isFinite(
              aqiNum
            ) &&
            aqiNum > 0
          ) {
            localByDate[
              istDate
            ].push({
              aqi:
                aqiNum,

              dominant:
                row.dominant_pollutant ||
                null,

              category:
                row.category ||
                null,
            });
          }
        }
      }
    }

    const localDates =
      new Set(
        Object.keys(
          localByDate
        )
      );

    let days =
      Object.entries(
        localByDate
      )
        .map(
          ([
            date,
            entries,
          ]) => {
            if (
              !entries.length
            ) {
              return null;
            }

            const avgAqi =
              Math.round(
                entries.reduce(
                  (
                    s,
                    e
                  ) =>
                    s +
                    e.aqi,
                  0
                ) /
                  entries.length
              );

            if (
              avgAqi <= 0
            ) {
              return null;
            }

            return {
              date,

              aqi:
                avgAqi,

              category:
                entries[0]
                  .category ||
                getAQICategory(
                  avgAqi
                ),

              dominant:
                entries.find(
                  (e) =>
                    e.dominant
                )?.dominant ||
                null,

              stationCount:
                0,

              source:
                "local",

              isInProgress:
                date ===
                todayIst,
            };
          }
        )
        .filter(
          Boolean
        );

    console.log(
      `Local data: ${days.length} date(s) found for ${year}-${month}`
    );

    const missingDates =
      new Set();

    for (
      let d = 1;
      d <= lastDayNumber;
      d++
    ) {
      const dateStr =
        `${year}-${String(
          month
        ).padStart(
          2,
          "0"
        )}-${String(
          d
        ).padStart(
          2,
          "0"
        )}`;

      if (
        dateStr <=
          todayIst &&
        !localDates.has(
          dateStr
        )
      ) {
        missingDates.add(
          dateStr
        );
      }
    }

    if (
      missingDates.size >
      0
    ) {
      console.log(
        `OpenAQ gap-fill: ${missingDates.size} date(s) missing from local data, trying OpenAQ...`
      );

      try {
        const {
          data:
            stations,
          error:
            stationError,
        } = await supabase
          .from(
            "station"
          )
          .select(
            "station_id, name, ward, zone, status, external_source, external_station_id"
          )
          .eq(
            "external_source",
            "OPENAQ"
          )
          .not(
            "external_station_id",
            "is",
            null
          )
          .order(
            "station_id",
            {
              ascending:
                true,
            }
          );

        if (
          !stationError &&
          stations &&
          stations.length >
            0
        ) {
          const stationFetchPromise =
            Promise.all(
              stations.map(
                async (
                  station
                ) => {
                  try {
                    return await collectHistoricalStationData(
                      station,
                      firstDay,
                      lastDay
                    );
                  } catch (
                    err
                  ) {
                    console.error(
                      `OpenAQ gap-fill failed for ${station.name}:`,
                      err.message
                    );

                    return {
                      station,
                      days: {},
                      datesFound:
                        0,
                    };
                  }
                }
              )
            );

          const timeoutPromise =
            new Promise(
              (
                resolve
              ) => {
                setTimeout(
                  () => {
                    console.warn(
                      "OpenAQ gap-fill timed out (30s)"
                    );

                    resolve(
                      []
                    );
                  },
                  30000
                );
              }
            );

          const stationResults =
            await Promise.race(
              [
                stationFetchPromise,
                timeoutPromise,
              ]
            );

          const dateMap =
            {};

          for (
            const stationResult of stationResults
          ) {
            if (
              !stationResult?.days
            ) {
              continue;
            }

            for (
              const [
                date,
                pollutants,
              ] of Object.entries(
                stationResult.days
              )
            ) {
              if (
                !missingDates.has(
                  date
                )
              ) {
                continue;
              }

              if (
                !dateMap[
                  date
                ]
              ) {
                dateMap[
                  date
                ] = [];
              }

              const aqiResult =
                calculateAQI(
                  pollutants
                );

              if (
                aqiResult.aqi ==
                null
              ) {
                continue;
              }

              dateMap[
                date
              ].push({
                aqi:
                  Number(
                    aqiResult.aqi
                  ),

                category:
                  getAQICategory(
                    aqiResult.aqi
                  ),

                dominant:
                  aqiResult.dominantPollutant,
              });
            }
          }

          const openaqCount =
            Object.keys(
              dateMap
            ).length;

          for (
            const [
              date,
              entries,
            ] of Object.entries(
              dateMap
            )
          ) {
            if (
              !entries.length
            ) {
              continue;
            }

            const avgAqi =
              Math.round(
                entries.reduce(
                  (
                    s,
                    e
                  ) =>
                    s +
                    e.aqi,
                  0
                ) /
                  entries.length
              );

            if (
              avgAqi <= 0
            ) {
              continue;
            }

            days.push({
              date,

              aqi:
                avgAqi,

              category:
                entries[0]
                  .category ||
                getAQICategory(
                  avgAqi
                ),

              dominant:
                entries.find(
                  (e) =>
                    e.dominant
                )?.dominant ||
                null,

              stationCount:
                stations.length,

              source:
                "openaq",
            });
          }

          console.log(
            `OpenAQ gap-fill: added ${openaqCount} date(s)`
          );
        }
      } catch (
        openaqError
      ) {
        console.warn(
          "OpenAQ gap-fill error:",
          openaqError.message
        );
      }
    }

    days.sort(
      (
        a,
        b
      ) =>
        a.date <
        b.date
          ? -1
          : a.date >
            b.date
          ? 1
          : 0
    );

    const responseBody = {
      success:
        true,

      year,

      month,

      days,

      stationCount:
        days.length >
        0
          ? 1
          : 0,

      source:
        "local+openaq",

      databaseWrite:
        false,
    };

    setCachedCalendar(
      year,
      month,
      responseBody
    );

    return res.json(
      responseBody
    );

  } catch (
    error
  ) {
    console.error(
      "Historical OpenAQ calendar error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message ||
          "Unable to load historical OpenAQ calendar data",
      });
  }
}

async function getHistoricalOpenAQDay(
  req,
  res
) {
  try {
    const date =
      String(
        req.query.date ||
          ""
      ).trim();

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        date
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "date must use YYYY-MM-DD format",
        });
    }

    // --------------------------------------------------
    // Historical day cache
    // --------------------------------------------------

    const cachedDay =
      getCachedHistoricalDay(
        date
      );

    if (cachedDay) {
      console.log(
        `Historical day cache HIT: ${date}`
      );

      return res.json(
        cachedDay
      );
    }

    console.log(
      `Historical day cache MISS: ${date}`
    );

    // ----------------------------------------------
    // Get stations
    // ----------------------------------------------

    const {
      data: stations,
      error:
        stationError,
    } =
      await supabase
        .from(
          "station"
        )
        .select(`
          station_id,
          name,
          ward,
          zone,
          status,
          external_source,
          external_station_id
        `)
        .eq(
          "external_source",
          "OPENAQ"
        )
        .not(
          "external_station_id",
          "is",
          null
        )
        .order(
          "station_id",
          {
            ascending:
              true,
          }
        );

    if (stationError) {
      throw stationError;
    }

    if (
      !stations ||
      stations.length ===
        0
    ) {
      const responseBody = {
        success:
          true,

        date,

        overallAqi:
          null,

        overallCategory:
          "Unavailable",

        dominant:
          null,

        totalStations:
          0,

        stations: [],

        source:
          "OpenAQ",

        databaseWrite:
          false,
      };

      setCachedHistoricalDay(
        date,
        responseBody
      );

      return res.json(
        responseBody
      );
    }

    // ----------------------------------------------
    // Get only one day
    // ----------------------------------------------

    const results = [];

    for (
      const station of stations
    ) {
      try {
        const stationResult =
          await collectHistoricalStationData(
            station,
            date,
            date
          );

        const pollutants =
          stationResult.days[
            date
          ];

        if (!pollutants) {
          results.push({
            stationId:
              station.station_id,

            station:
              station.name,

            ward:
              station.ward,

            zone:
              station.zone,

            status:
              station.status,

            aqi:
              null,

            category:
              "No Data",

            dominant:
              null,

            pollutants: {},

            dataAvailable:
              false,
          });

          continue;
        }

        const aqiResult =
          calculateAQI(
            pollutants
          );

        const hasAQI =
          aqiResult.aqi !==
            null &&
          aqiResult.aqi !==
            undefined;

        results.push({
          stationId:
            station.station_id,

          station:
            station.name,

          ward:
            station.ward,

          zone:
            station.zone,

          status:
            station.status,

          aqi:
            hasAQI
              ? Number(
                  aqiResult.aqi
                )
              : null,

          category:
            hasAQI
              ? getAQICategory(
                  aqiResult.aqi
                )
              : "No Data",

          dominant:
            aqiResult.dominantPollutant ||
            null,

          pollutants,

          dataAvailable:
            hasAQI,
        });

      } catch (
        stationError
      ) {
        console.error(
          `Historical day failed for ${station.name}:`,
          stationError.message
        );

        results.push({
          stationId:
            station.station_id,

          station:
            station.name,

          ward:
            station.ward,

          zone:
            station.zone,

          status:
            station.status,

          aqi:
            null,

          category:
            "Error",

          dominant:
            null,

          pollutants: {},

          dataAvailable:
            false,

          error:
            stationError.message,
        });
      }
    }

    // ----------------------------------------------
    // Overall AQI
    // ----------------------------------------------

    const validStations =
      results.filter(
        (row) =>
          row.aqi !== null &&
          Number.isFinite(
            Number(
              row.aqi
            )
          )
      );

    let overallAqi =
      null;

    if (
      validStations.length >
      0
    ) {
      overallAqi =
        Math.round(
          validStations.reduce(
            (
              sum,
              row
            ) =>
              sum +
              Number(
                row.aqi
              ),
            0
          ) /
            validStations.length
        );
    }

    // ----------------------------------------------
    // Overall dominant pollutant
    // ----------------------------------------------

    const pollutantScores =
      {};

    for (
      const row of validStations
    ) {
      const dominant =
        row.dominant;

      if (!dominant) {
        continue;
      }

      pollutantScores[
        dominant
      ] =
        (
          pollutantScores[
            dominant
          ] || 0
        ) + 1;
    }

    const overallDominant =
      Object.entries(
        pollutantScores
      ).sort(
        (
          a,
          b
        ) =>
          b[1] -
          a[1]
      )[0]?.[0] ||
      null;

    // ----------------------------------------------
    // Return
    // ----------------------------------------------

    const responseBody = {
      success:
        true,

      date,

      overallAqi,

      overallCategory:
        overallAqi !== null
          ? getAQICategory(
              overallAqi
            )
          : "Unavailable",

      dominant:
        overallDominant,

      totalStations:
        stations.length,

      stations:
        results,

      source:
        "OpenAQ",

      databaseWrite:
        false,
    };

    setCachedHistoricalDay(
      date,
      responseBody
    );

    return res.json(
      responseBody
    );

  } catch (
    error
  ) {
    console.error(
      "Historical OpenAQ day error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message ||
          "Unable to load historical OpenAQ day data",
      });
  }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  syncOpenAQ,

  matchStations,

  getHistoricalOpenAQCalendar,

  getHistoricalOpenAQDay,
};