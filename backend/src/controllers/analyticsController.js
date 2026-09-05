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

const getTelemetry = (
  aqiRows,
  readingRows
) => {
  const buildPeriod = (
    period,
    hours
  ) => {
    const start =
      getPeriodStart(hours);

    const aqi = aqiRows.filter(
      (row) =>
        row.timestamp &&
        new Date(row.timestamp) >=
          start
    );

    const readings =
      readingRows.filter(
        (row) =>
          row.timestamp &&
          new Date(row.timestamp) >=
            start
      );

    const buckets = {};

    const ensureBucket = (
      key,
      timestamp
    ) => {
      if (!buckets[key]) {
        buckets[key] = {
          key,
          timestamp,
          aqi: [],
          pm25: [],
          pm10: [],
        };
      }

      return buckets[key];
    };

    // -----------------------------
    // AQI
    // -----------------------------

    aqi.forEach((row) => {
      const key =
        getBucketKey(
          row.timestamp,
          period
        );

      const bucket =
        ensureBucket(
          key,
          row.timestamp
        );

      const value =
        Number(row.aqi);

      if (Number.isFinite(value)) {
        bucket.aqi.push(value);
      }
    });

    // -----------------------------
    // PM2.5 / PM10
    // -----------------------------

    readings.forEach((row) => {
      const original =
        String(
          row.parameter || ""
        ).trim();

      const display =
        DISPLAY_NAME[original] ||
        DISPLAY_NAME[
          original.toUpperCase()
        ];

      if (
        display !== "PM2.5" &&
        display !== "PM10"
      ) {
        return;
      }

      const key =
        getBucketKey(
          row.timestamp,
          period
        );

      const bucket =
        ensureBucket(
          key,
          row.timestamp
        );

      const value =
        Number(row.value);

      if (!Number.isFinite(value)) {
        return;
      }

      if (display === "PM2.5") {
        bucket.pm25.push(value);
      }

      if (display === "PM10") {
        bucket.pm10.push(value);
      }
    });

    return Object.values(buckets)
      .sort(
        (a, b) =>
          new Date(a.timestamp) -
          new Date(b.timestamp)
      )
      .map((bucket) => ({
        time: bucket.key,

        aqi: round(
          average(bucket.aqi),
          1
        ),

        pm25: round(
          average(bucket.pm25),
          1
        ),

        pm10: round(
          average(bucket.pm10),
          1
        ),
      }))
      .filter(
        (row) =>
          row.aqi !== null ||
          row.pm25 !== null ||
          row.pm10 !== null
      );
  };

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

    const last24 =
      getPeriodStart(24);

    const last24Aqi =
      aqiList
        .filter(
          (row) =>
            row.timestamp &&
            new Date(
              row.timestamp
            ) >= last24
        )
        .map(
          (row) =>
            Number(row.aqi)
        )
        .filter(
          Number.isFinite
        );

    const mean24hAqi =
      average(last24Aqi);

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
            flag === "pass"
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