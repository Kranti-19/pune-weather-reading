const supabase = require("../config/supabase");

// ============================================================
// NAAQS CONFIGURATION
// ============================================================

const NAAQS = {
  "PM2.5": {
    name: "Fine Particulate",
    unit: "µg/m³",
    limit: 60,
  },

  PM25: {
    name: "Fine Particulate",
    unit: "µg/m³",
    limit: 60,
  },

  PM2_5: {
    name: "Fine Particulate",
    unit: "µg/m³",
    limit: 60,
  },

  PM10: {
    name: "Coarse Dust",
    unit: "µg/m³",
    limit: 100,
  },

  NO2: {
    name: "Nitrogen Dioxide",
    unit: "µg/m³",
    limit: 80,
  },

  "NO₂": {
    name: "Nitrogen Dioxide",
    unit: "µg/m³",
    limit: 80,
  },

  SO2: {
    name: "Sulfur Dioxide",
    unit: "µg/m³",
    limit: 80,
  },

  "SO₂": {
    name: "Sulfur Dioxide",
    unit: "µg/m³",
    limit: 80,
  },

  CO: {
    name: "Carbon Monoxide",
    unit: "mg/m³",
    limit: 2,
  },

  O3: {
    name: "Ground Ozone",
    unit: "µg/m³",
    limit: 100,
  },

  "O₃": {
    name: "Ground Ozone",
    unit: "µg/m³",
    limit: 100,
  },

  NH3: {
    name: "Ammonia",
    unit: "µg/m³",
    limit: 400,
  },

  "NH₃": {
    name: "Ammonia",
    unit: "µg/m³",
    limit: 400,
  },

  PB: {
    name: "Lead Trace",
    unit: "µg/m³",
    limit: 1,
  },

  Pb: {
    name: "Lead Trace",
    unit: "µg/m³",
    limit: 1,
  },
};

// ============================================================
// DISPLAY NAME
// ============================================================

const DISPLAY_NAME = {
  "PM2.5": "PM2.5",
  PM25: "PM2.5",
  PM2_5: "PM2.5",

  PM10: "PM10",

  NO2: "NO2",
  "NO₂": "NO2",

  SO2: "SO2",
  "SO₂": "SO2",

  CO: "CO",

  O3: "O3",
  "O₃": "O3",

  NH3: "NH3",
  "NH₃": "NH3",

  PB: "Pb",
  Pb: "Pb",
};

// ============================================================
// AQI CATEGORY
// ============================================================

const getAqiCategory = (aqi) => {
  const value = Number(aqi) || 0;

  if (value <= 50) {
    return "Good";
  }

  if (value <= 100) {
    return "Satisfactory";
  }

  if (value <= 200) {
    return "Moderate";
  }

  if (value <= 300) {
    return "Poor";
  }

  return "Severe";
};

// ============================================================
// AVERAGE
// ============================================================

const average = (values) => {
  const validValues = values
    .map(Number)
    .filter(Number.isFinite);

  if (!validValues.length) {
    return null;
  }

  const total = validValues.reduce(
    (sum, value) => sum + value,
    0
  );

  return total / validValues.length;
};

// ============================================================
// ROUND
// ============================================================

const round = (value, digits = 1) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return null;
  }

  const multiplier = 10 ** digits;

  return (
    Math.round(Number(value) * multiplier) /
    multiplier
  );
};

// ============================================================
// CPCB-STYLE AQI CALCULATION FROM POLLUTANT READINGS
// ============================================================

const AQI_BREAKPOINTS = {
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
    [431, 600, 401, 500],
  ],

  no2: [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 180, 101, 200],
    [181, 280, 201, 300],
    [281, 400, 301, 400],
    [401, 800, 401, 500],
  ],

  so2: [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 380, 101, 200],
    [381, 800, 201, 300],
    [801, 1600, 301, 400],
    [1601, 2620, 401, 500],
  ],

  o3: [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 168, 101, 200],
    [169, 208, 201, 300],
    [209, 748, 301, 400],
    [749, 1000, 401, 500],
  ],

  co: [
    [0, 1, 0, 50],
    [1.1, 2, 51, 100],
    [2.1, 10, 101, 200],
    [10.1, 17, 201, 300],
    [17.1, 34, 301, 400],
    [34.1, 50, 401, 500],
  ],
};

const calculateSubIndex = (value, breakpoints) => {
  const concentration = Number(value);

  if (!Number.isFinite(concentration)) {
    return null;
  }

  for (const [
    concentrationLow,
    concentrationHigh,
    indexLow,
    indexHigh,
  ] of breakpoints) {
    if (
      concentration >= concentrationLow &&
      concentration <= concentrationHigh
    ) {
      const index =
        ((indexHigh - indexLow) /
          (concentrationHigh - concentrationLow)) *
          (concentration - concentrationLow) +
        indexLow;

      return Math.round(index);
    }
  }

  return null;
};

const calculateStationAqi = (pollutants) => {
  const subindices = {};

  for (const parameter of Object.keys(AQI_BREAKPOINTS)) {
    const subIndex = calculateSubIndex(
      pollutants[parameter],
      AQI_BREAKPOINTS[parameter]
    );

    if (subIndex !== null) {
      subindices[parameter] = subIndex;
    }
  }

  const availableParameters =
    Object.keys(subindices);

  const hasParticulate =
    Number.isFinite(subindices.pm25) ||
    Number.isFinite(subindices.pm10);

  if (
    availableParameters.length < 3 ||
    !hasParticulate
  ) {
    return null;
  }

  let dominantPollutant = null;
  let maxSubIndex = -Infinity;

  for (const [
    parameter,
    subIndex,
  ] of Object.entries(subindices)) {
    if (subIndex > maxSubIndex) {
      maxSubIndex = subIndex;
      dominantPollutant = parameter;
    }
  }

  return {
    aqi: maxSubIndex,
    category: getAqiCategory(maxSubIndex),
    dominantPollutant,
    subindices,
  };
};

// ============================================================
// PERIOD START
// ============================================================

const getPeriodStart = (hours) => {
  return new Date(
    Date.now() -
      hours * 60 * 60 * 1000
  );
};

// ============================================================
// CHART BUCKET
// ============================================================

const getBucketKey = (date, period) => {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "Unknown";
  }

  if (period === "24 Hours") {
    const hour = d.getHours();

    const bucketHour =
      Math.floor(hour / 3) * 3;

    return `${String(
      bucketHour
    ).padStart(2, "0")}:00`;
  }

  if (period === "7 Days") {
    return d.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
      }
    );
  }

  return d.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
};

// ============================================================
// TELEMETRY
// ============================================================

const getTelemetry = (aqiRows, readingRows) => {
  // ============================================================
  // HISTORICAL TELEMETRY
  // Builds chart data from the actual `reading` table.
  //
  // 24 Hours -> 3-hour buckets
  // 7 Days    -> 1 point per day
  // 30 Days   -> 1 point per day
  // ============================================================

  const now = new Date();

  // ------------------------------------------------------------
  // CPCB-style AQI breakpoints used for chart estimation
  // ------------------------------------------------------------

  const AQI_BREAKPOINTS = {
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
      [431, 600, 401, 500],
    ],
  };

  const calculateSubIndex = (value, breakpoints) => {
    const concentration = Number(value);

    if (!Number.isFinite(concentration)) {
      return null;
    }

    for (const [
      concentrationLow,
      concentrationHigh,
      indexLow,
      indexHigh,
    ] of breakpoints) {
      if (
        concentration >= concentrationLow &&
        concentration <= concentrationHigh
      ) {
        return Math.round(
          ((indexHigh - indexLow) /
            (concentrationHigh - concentrationLow)) *
            (concentration - concentrationLow) +
            indexLow
        );
      }
    }

    return null;
  };

  const calculateChartAqi = (pm25, pm10) => {
    const pm25Index = calculateSubIndex(
      pm25,
      AQI_BREAKPOINTS.pm25
    );

    const pm10Index = calculateSubIndex(
      pm10,
      AQI_BREAKPOINTS.pm10
    );

    const indexes = [
      pm25Index,
      pm10Index,
    ].filter(Number.isFinite);

    if (!indexes.length) {
      return null;
    }

    return Math.max(...indexes);
  };

  // ------------------------------------------------------------
  // Normalize parameter names
  // ------------------------------------------------------------

  const normalizeParameter = (parameter) => {
    const value = String(parameter || "")
      .trim()
      .toLowerCase();

    if (
      value === "pm25" ||
      value === "pm2.5" ||
      value === "pm2_5" ||
      value === "pm₂.₅"
    ) {
      return "pm25";
    }

    if (
      value === "pm10" ||
      value === "pm₁₀"
    ) {
      return "pm10";
    }

    return null;
  };

  // ------------------------------------------------------------
  // Average helper
  // ------------------------------------------------------------

  const average = (values) => {
    const valid = values
      .map(Number)
      .filter(Number.isFinite);

    if (!valid.length) {
      return null;
    }

    return (
      valid.reduce(
        (sum, value) => sum + value,
        0
      ) / valid.length
    );
  };

  // ------------------------------------------------------------
  // Get bucket key
  // ------------------------------------------------------------

  const getBucket = (timestamp, period) => {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    if (period === "24 Hours") {
      // 3-hour buckets
      const bucketHour =
        Math.floor(date.getHours() / 3) * 3;

      const bucket = new Date(date);

      bucket.setHours(
        bucketHour,
        0,
        0,
        0
      );

      return bucket;
    }

    // 7 Days and 30 Days:
    // one bucket per calendar day
    const bucket = new Date(date);

    bucket.setHours(
      0,
      0,
      0,
      0
    );

    return bucket;
  };

  // ------------------------------------------------------------
  // Build one period
  // ------------------------------------------------------------

  const buildPeriod = (
    period,
    hours
  ) => {
    const start = new Date(
      now.getTime() -
        hours * 60 * 60 * 1000
    );

    const buckets = {};

    // ==========================================================
    // 1. POLLUTANT READINGS
    // ==========================================================

    readingRows.forEach((row) => {
      if (!row.timestamp) {
        return;
      }

      const timestamp =
        new Date(row.timestamp);

      if (
        Number.isNaN(
          timestamp.getTime()
        )
      ) {
        return;
      }

      if (timestamp < start) {
        return;
      }

      const parameter =
        normalizeParameter(
          row.parameter
        );

      if (!parameter) {
        return;
      }

      const value =
        Number(row.value);

      if (!Number.isFinite(value)) {
        return;
      }

      const bucketDate =
        getBucket(
          timestamp,
          period
        );

      if (!bucketDate) {
        return;
      }

      const key =
        bucketDate.toISOString();

      if (!buckets[key]) {
        buckets[key] = {
          timestamp:
            bucketDate,
          pm25: [],
          pm10: [],
          aqi: [],
        };
      }

      if (parameter === "pm25") {
        buckets[key].pm25.push(value);
      }

      if (parameter === "pm10") {
        buckets[key].pm10.push(value);
      }
    });

    // ==========================================================
    // 2. EXISTING AQI READINGS
    //
    // Use stored AQI when it exists, but do NOT depend on it.
    // ==========================================================

    aqiRows.forEach((row) => {
      if (!row.timestamp) {
        return;
      }

      const timestamp =
        new Date(row.timestamp);

      if (
        Number.isNaN(
          timestamp.getTime()
        )
      ) {
        return;
      }

      if (timestamp < start) {
        return;
      }

      const value =
        Number(row.aqi);

      if (!Number.isFinite(value)) {
        return;
      }

      const bucketDate =
        getBucket(
          timestamp,
          period
        );

      if (!bucketDate) {
        return;
      }

      const key =
        bucketDate.toISOString();

      if (!buckets[key]) {
        buckets[key] = {
          timestamp:
            bucketDate,
          pm25: [],
          pm10: [],
          aqi: [],
        };
      }

      buckets[key].aqi.push(value);
    });

    // ==========================================================
    // 3. CONVERT BUCKETS INTO CHART DATA
    // ==========================================================

    return Object.values(buckets)
      .sort(
        (a, b) =>
          a.timestamp.getTime() -
          b.timestamp.getTime()
      )
      .map((bucket) => {
        const pm25 =
          average(bucket.pm25);

        const pm10 =
          average(bucket.pm10);

        // Prefer actual stored AQI.
        let aqi =
          average(bucket.aqi);

        // If no stored AQI exists,
        // calculate it from PM2.5 / PM10.
        if (
          aqi === null
        ) {
          aqi =
            calculateChartAqi(
              pm25,
              pm10
            );
        }

        return {
          time:
            bucket.timestamp.toISOString(),

          aqi:
            aqi === null
              ? null
              : Number(
                  aqi.toFixed(1)
                ),

          pm25:
            pm25 === null
              ? null
              : Number(
                  pm25.toFixed(1)
                ),

          pm10:
            pm10 === null
              ? null
              : Number(
                  pm10.toFixed(1)
                ),
        };
      })
      .filter(
        (row) =>
          row.aqi !== null ||
          row.pm25 !== null ||
          row.pm10 !== null
      );
  };

  // ============================================================
  // RETURN ALL PERIODS
  // ============================================================

  return {
    "24 Hours":
      buildPeriod(
        "24 Hours",
        24
      ),

    "7 Days":
      buildPeriod(
        "7 Days",
        24 * 7
      ),

    "30 Days":
      buildPeriod(
        "30 Days",
        24 * 30
      ),
  };
};

// ============================================================
// GET ANALYTICS
// ============================================================

const getAnalytics = async (
  req,
  res
) => {
  try {
    // ========================================================
    // 1. GET STATIONS
    // ========================================================

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

    const stationList =
      stations || [];

    // ========================================================
    // 2. GET AQI READINGS
    // ========================================================

    const {
      data: aqiRows,
      error: aqiError,
    } = await supabase
      .from("aqi_reading")
      .select("*")
      .order("timestamp", {
        ascending: false,
      })
      .limit(10000);

    if (aqiError) {
      throw aqiError;
    }

    const aqiList =
      aqiRows || [];

    // ========================================================
    // 3. GET SENSOR READINGS
    // ========================================================

    const {
      data: readingRows,
      error: readingError,
    } = await supabase
      .from("reading")
      .select("*")
      .order("timestamp", {
        ascending: false,
      })
      .limit(20000);

    if (readingError) {
      throw readingError;
    }

    const readingList =
      readingRows || [];

    // ========================================================
    // 4. GET DEVICES
    // ========================================================

    const {
      data: devices,
      error: deviceError,
    } = await supabase
      .from("device")
      .select("*");

    if (deviceError) {
      throw deviceError;
    }

    const deviceList =
      devices || [];

    // ========================================================
    // 5. GET SENSORS
    // ========================================================

    const {
      data: sensors,
      error: sensorError,
    } = await supabase
      .from("sensor")
      .select("*");

    if (sensorError) {
      throw sensorError;
    }

    const sensorList =
      sensors || [];

    // ========================================================
    // 6. LATEST AQI PER STATION
    // ========================================================

    const latestAqiByStation =
      {};

    for (const row of aqiList) {
      const stationId =
        String(row.station_id);

      if (
        !latestAqiByStation[
          stationId
        ]
      ) {
        latestAqiByStation[
          stationId
        ] = row;
      }
    }

    // ========================================================
    // 7. DEVICES BY STATION
    // ========================================================

    const devicesByStation =
      {};

    for (const device of deviceList) {
      const stationId =
        String(
          device.station_id
        );

      if (
        !devicesByStation[
          stationId
        ]
      ) {
        devicesByStation[
          stationId
        ] = [];
      }

      devicesByStation[
        stationId
      ].push(device);
    }

    // ========================================================
    // 8. BUILD STATION DATA
    // ========================================================

    const stationRows =
      stationList.map(
        (station) => {
          const stationId =
            String(
              station.station_id
            );

          const aqiRow =
            latestAqiByStation[
              stationId
            ];

          const stationDevices =
            devicesByStation[
              stationId
            ] || [];

          const dbStatus =
            String(
              station.status || ""
            ).toLowerCase();

          const hasOnlineDevice =
            stationDevices.some(
              (device) => {
                const status =
                  String(
                    device.status ||
                      ""
                  ).toLowerCase();

                return [
                  "online",
                  "active",
                  "connected",
                ].includes(
                  status
                );
              }
            );

          const online =
            [
              "online",
              "active",
              "connected",
            ].includes(
              dbStatus
            ) ||
            hasOnlineDevice;

          const aqi =
            aqiRow?.aqi !==
              null &&
            aqiRow?.aqi !==
              undefined
              ? Number(
                  aqiRow.aqi
                )
              : null;

          return {
            station_id:
              station.station_id,

            name:
              station.name,

            ward:
              station.ward,

            zone:
              station.zone,

            status:
              online
                ? "Online"
                : "Offline",

            aqi,

            category:
              aqiRow?.category ||
              (aqi !== null
                ? getAqiCategory(
                    aqi
                  )
                : "N/A"),

            dominant:
              aqiRow?.dominant_pollutant ||
              "N/A",
          };
        }
      );

    // ========================================================
    // 9. LAST 24 HOURS AQI
    // ========================================================

    // ========================================================
// 9. MEAN CURRENT AQI
// ========================================================

// First try recent stored AQI records.
const last24 =
  getPeriodStart(24);

const recentStoredAqi =
  aqiList
    .filter((row) => {
      if (!row.timestamp) {
        return false;
      }

      return (
        new Date(row.timestamp) >= last24 &&
        Number.isFinite(Number(row.aqi))
      );
    })
    .map((row) => Number(row.aqi));

// If recent AQI records exist, use them.
let mean24hAqi =
  average(recentStoredAqi);

// Otherwise calculate AQI from
// the latest pollutant readings.
if (mean24hAqi === null) {
  const latestReadingMap = {};

  for (const row of readingList) {
    if (!row.timestamp) {
      continue;
    }

    const stationId =
      String(row.station_id);

    const parameter =
      String(row.parameter || "")
        .trim()
        .toLowerCase();

    let key = parameter;

    if (
      [
        "pm2.5",
        "pm25",
        "pm2_5",
      ].includes(parameter)
    ) {
      key = "pm25";
    }

    if (parameter === "pm10") {
      key = "pm10";
    }

    if (
      parameter === "no2" ||
      parameter === "no₂"
    ) {
      key = "no2";
    }

    if (
      parameter === "so2" ||
      parameter === "so₂"
    ) {
      key = "so2";
    }

    if (
      parameter === "o3" ||
      parameter === "o₃"
    ) {
      key = "o3";
    }

    if (parameter === "co") {
      key = "co";
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        AQI_BREAKPOINTS,
        key
      )
    ) {
      continue;
    }

    const value =
      Number(row.value);

    if (!Number.isFinite(value)) {
      continue;
    }

    const mapKey =
      `${stationId}_${key}`;

    if (
      !latestReadingMap[mapKey] ||
      new Date(row.timestamp).getTime() >
        new Date(
          latestReadingMap[mapKey].timestamp
        ).getTime()
    ) {
      latestReadingMap[mapKey] = {
        ...row,
        aqiParameter: key,
      };
    }
  }

  const latestReadings =
    Object.values(latestReadingMap);

  const calculatedStationAqis = {};

  for (const row of latestReadings) {
    const stationId =
      String(row.station_id);

    if (
      !calculatedStationAqis[stationId]
    ) {
      calculatedStationAqis[stationId] = {};
    }

    calculatedStationAqis[
      stationId
    ][row.aqiParameter] =
      Number(row.value);
  }

  const calculatedAqiValues = [];

  for (const pollutants of Object.values(
    calculatedStationAqis
  )) {
    const calculated =
      calculateStationAqi(
        pollutants
      );

    if (
      calculated &&
      Number.isFinite(
        calculated.aqi
      )
    ) {
      calculatedAqiValues.push(
        calculated.aqi
      );
    }
  }

  mean24hAqi =
    average(
      calculatedAqiValues
    );
}

    // ========================================================
    // 10. PREVIOUS 24 HOURS
    // ========================================================

    const previousStart =
      getPeriodStart(48);

    const previousAqi =
      aqiList
        .filter((row) => {
          if (!row.timestamp) {
            return false;
          }

          const date =
            new Date(
              row.timestamp
            );

          return (
            date >=
              previousStart &&
            date < last24
          );
        })
        .map(
          (row) =>
            Number(row.aqi)
        )
        .filter(
          Number.isFinite
        );

    const previousMeanAqi =
      average(previousAqi);

    const aqiChangePercent =
      previousMeanAqi &&
      mean24hAqi !== null
        ? ((mean24hAqi -
            previousMeanAqi) /
            previousMeanAqi) *
          100
        : null;

    // ========================================================
    // 11. HIGHEST HOTSPOT
    // ========================================================

    const hotspotCandidates =
      stationRows
        .filter(
          (station) =>
            station.aqi !==
              null &&
            Number.isFinite(
              Number(
                station.aqi
              )
            )
        )
        .sort(
          (a, b) =>
            Number(b.aqi) -
            Number(a.aqi)
        );

    const highestHotspot =
      hotspotCandidates[0] ||
      null;

    // ========================================================
    // 12. DATA AVAILABILITY
    // ========================================================

    const totalReadings =
      readingList.length;

    const validReadings =
      readingList.filter(
        (row) => {
          const flag =
            String(
              row.quality_flag ||
                ""
            )
              .trim()
              .toLowerCase();

          return (
  flag === "" ||
  flag === "valid" ||
  flag === "good" ||
  flag === "verified" ||
  flag === "pass" ||
  flag === "openaq" ||
  flag === "simulated"
);
        }
      ).length;

    const dataAvailability =
      totalReadings > 0
        ? (validReadings /
            totalReadings) *
          100
        : 0;

    // ========================================================
    // 13. LATEST READING FOR EACH POLLUTANT
    // ========================================================

    const latestParameterRows =
      {};

    for (const row of readingList) {
      const original =
        String(
          row.parameter || ""
        ).trim();

      const display =
        DISPLAY_NAME[
          original
        ] ||
        DISPLAY_NAME[
          original.toUpperCase()
        ];

      if (!display) {
        continue;
      }

      if (
        !latestParameterRows[
          display
        ]
      ) {
        latestParameterRows[
          display
        ] = row;
      }
    }

    // ========================================================
    // 14. LATEST AQI
    // ========================================================

    const latestAqi =
      aqiList.length
        ? aqiList[0]
        : null;

    // ========================================================
    // 15. POLLUTANT SUMMARY
    // ========================================================

    const pollutantOrder = [
      "PM2.5",
      "PM10",
      "NO2",
      "SO2",
      "CO",
      "O3",
      "NH3",
      "Pb",
    ];

    const criteriaParameters =
      pollutantOrder.map(
        (code) => {
          const row =
            latestParameterRows[
              code
            ];

          const standard =
            NAAQS[code] || {};

          if (!row) {
            return {
              code,

              name:
                standard.name ||
                code,

              val: null,

              unit:
                standard.unit ||
                "N/A",

              limit:
                standard.limit ||
                null,

              sub: null,

              status: "N/A",
            };
          }

          const value =
            Number(
              row.value
            );

          const subIndex =
            latestAqi
              ?.pollutant_subindices
              ?.[
                row.parameter
              ] ??
            latestAqi
              ?.pollutant_subindices
              ?.[
                code
              ] ??
            null;

          return {
            code,

            name:
              standard.name ||
              code,

            val:
              Number.isFinite(
                value
              )
                ? value
                : null,

            unit:
              row.unit ||
              standard.unit ||
              "N/A",

            limit:
              standard.limit ||
              null,

            sub:
              subIndex !==
                null
                ? Number(
                    subIndex
                  )
                : null,

            status:
              standard.limit &&
              value >
                standard.limit
                ? "Moderate"
                : "Good",
          };
        }
      );

    // ========================================================
    // 16. CALIBRATED STATIONS
    // ========================================================

    const calibratedStations =
      new Set();

    sensorList.forEach(
      (sensor) => {
        if (
          !sensor.calibration_date
        ) {
          return;
        }

        const device =
          deviceList.find(
            (item) =>
              item.device_id ===
              sensor.device_id
          );

        if (
          device?.station_id
        ) {
          calibratedStations.add(
            String(
              device.station_id
            )
          );
        }
      }
    );

    // ========================================================
    // 17. TELEMETRY
    // ========================================================

    const telemetry =
      getTelemetry(
        aqiList,
        readingList
      );

    // ========================================================
    // 18. STATION RANKING
    // ========================================================

    const wardLeaderboard =
      stationRows
        .filter(
          (station) =>
            station.aqi !== null
        )
        .sort(
          (a, b) =>
            Number(b.aqi) -
            Number(a.aqi)
        );

    // ========================================================
    // 19. FINAL RESPONSE
    // ========================================================

    return res.status(200).json({
      status: "success",

      analytics: {
        kpis: {
          mean24hAqi:
            mean24hAqi === null
              ? null
              : round(
                  mean24hAqi,
                  1
                ),

          aqiChangePercent:
            aqiChangePercent ===
            null
              ? null
              : round(
                  aqiChangePercent,
                  1
                ),

          highestHotspot,

          dataAvailability:
            round(
              dataAvailability,
              1
            ),

          totalReadings,

          validReadings,

          totalStations:
            stationList.length,

          onlineStations:
            stationRows.filter(
              (station) =>
                station.status ===
                "Online"
            ).length,

          offlineStations:
            stationRows.filter(
              (station) =>
                station.status !==
                "Online"
            ).length,

          calibratedStations:
            calibratedStations.size,
        },

        telemetry,

        criteriaParameters,

        wardLeaderboard,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/analytics error:",
      error
    );

    return res.status(500).json({
      status: "error",

      message:
        error?.message ||
        "Failed to calculate analytics.",
    });
  }
};

module.exports = {
  getAnalytics,
};