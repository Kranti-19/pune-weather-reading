const supabase = require("../config/supabase");

/**
 * Fetch WAQI data for one station
 *
 * GET /api/air-quality/waqi/:stationId
 */
const getWaqiStation = async (req, res) => {
  try {
    const { stationId } = req.params;

    console.log("Station ID received:", stationId);
    console.log("WAQI token exists:", !!process.env.WAQI_TOKEN);

    if (!process.env.WAQI_TOKEN) {
      return res.status(500).json({
        status: "error",
        message: "WAQI_TOKEN is missing in .env",
      });
    }

    const url =
      `https://api.waqi.info/feed/${encodeURIComponent(stationId)}/` +
      `?token=${encodeURIComponent(process.env.WAQI_TOKEN)}`;

    console.log("Requesting WAQI station:", stationId);

    const response = await fetch(url);
    const result = await response.json();

    console.log("WAQI response:", result.status, result.data);

    if (!response.ok || result.status !== "ok") {
      return res.status(502).json({
        status: "error",
        message: "Unable to fetch WAQI data",
        details: result.data,
      });
    }

    const data = result.data;
    const iaqi = data.iaqi || {};

    return res.json({
      status: "success",
      source: "WAQI",

      data: {
        stationId: data.idx,
        stationName: data.city?.name || null,

        // If WAQI returns "-", AQI becomes null
        aqi:
          data.aqi !== "-" &&
          data.aqi !== undefined &&
          data.aqi !== null
            ? Number(data.aqi)
            : null,

        dominantPollutant: data.dominentpol || null,

        pollutants: {
          pm25: iaqi.pm25?.v ?? null,
          pm10: iaqi.pm10?.v ?? null,
          no2: iaqi.no2?.v ?? null,
          so2: iaqi.so2?.v ?? null,
          co: iaqi.co?.v ?? null,
          o3: iaqi.o3?.v ?? null,
        },

        location: {
          latitude: data.city?.geo?.[0] ?? null,
          longitude: data.city?.geo?.[1] ?? null,
        },

        time: data.time?.s || null,
      },
    });
  } catch (error) {
    console.error("WAQI error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};


/**
 * Fetch WAQI data internally
 */
const fetchWaqiData = async (waqiStationId) => {
  if (!process.env.WAQI_TOKEN) {
    throw new Error("WAQI_TOKEN is missing in .env");
  }

  const url =
    `https://api.waqi.info/feed/${encodeURIComponent(
      waqiStationId
    )}/` +
    `?token=${encodeURIComponent(process.env.WAQI_TOKEN)}`;

  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok || result.status !== "ok") {
    throw new Error(
      `WAQI request failed: ${result.data || "Unknown error"}`
    );
  }

  return result.data;
};


/**
 * Synchronize one local station with WAQI
 */
/**
 * Synchronize one local station with WAQI
 *
 * Saves the WAQI observation even when overall AQI is unavailable.
 * In that case, aqi is stored as NULL.
 */
const syncWaqiStation = async (localStationId) => {
  try {
    // --------------------------------------------------
    // 1. Find local station and WAQI mapping
    // --------------------------------------------------
    const { data: station, error: stationError } = await supabase
      .from("station")
      .select(
        "station_id, name, external_source, external_station_id"
      )
      .eq("station_id", localStationId)
      .maybeSingle();

    if (stationError) {
      throw stationError;
    }

    if (!station) {
      throw new Error(
        `Local station ${localStationId} was not found`
      );
    }

    // --------------------------------------------------
    // 2. Check WAQI mapping
    // --------------------------------------------------
    if (
      String(station.external_source).toUpperCase() !== "WAQI" ||
      !station.external_station_id
    ) {
      return {
        success: false,
        skipped: true,
        stationId: localStationId,
        message: "Station is not mapped to WAQI",
      };
    }

    const waqiStationId = station.external_station_id;

    console.log(
      `Syncing local station ${localStationId} with WAQI ${waqiStationId}`
    );

    // --------------------------------------------------
    // 3. Fetch WAQI data
    // --------------------------------------------------
    const data = await fetchWaqiData(waqiStationId);

    // --------------------------------------------------
    // 4. Convert AQI safely
    //
    // WAQI may return "-" for overall AQI.
    // In that case we store NULL.
    // We DO NOT use PM2.5 IAQI as overall AQI.
    // --------------------------------------------------
    let aqi = null;

    if (
      data.aqi !== "-" &&
      data.aqi !== undefined &&
      data.aqi !== null &&
      data.aqi !== ""
    ) {
      const numericAqi = Number(data.aqi);

      if (!Number.isFinite(numericAqi)) {
        throw new Error(
          `Invalid AQI received from WAQI: ${data.aqi}`
        );
      }

      aqi = Math.round(numericAqi);
    }

    // --------------------------------------------------
    // 5. WAQI category
    //
    // Only calculate category when overall AQI exists.
    // --------------------------------------------------
    const category =
      aqi !== null
        ? getAqiCategory(aqi)
        : "Unavailable";

    // --------------------------------------------------
    // 6. Source timestamp
    // --------------------------------------------------
    const sourceTimestamp = data.time?.iso
      ? new Date(data.time.iso).toISOString()
      : null;

    if (!sourceTimestamp) {
      console.warn(
        `WAQI did not provide a timestamp for station ${waqiStationId}`
      );
    }

    // --------------------------------------------------
    // 7. Pollutant subindices
    // --------------------------------------------------
    const pollutantSubindices = data.iaqi || {};

    // --------------------------------------------------
    // 8. Prevent duplicate source observations
    // --------------------------------------------------
    let existingQuery = supabase
      .from("aqi_reading")
      .select("aqi_id")
      .eq("station_id", localStationId);

    if (sourceTimestamp) {
      existingQuery = existingQuery.eq(
        "timestamp",
        sourceTimestamp
      );
    }

    const {
      data: existingReading,
      error: existingError,
    } = await existingQuery.maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingReading) {
      console.log(
        `WAQI observation already exists for station ${localStationId}`
      );

      return {
        success: true,
        duplicate: true,
        stationId: localStationId,
        waqiStationId,
        aqi,
        category,
        timestamp: sourceTimestamp,
        message: "WAQI observation already exists",
      };
    }

    // --------------------------------------------------
    // 9. Insert into aqi_reading
    // --------------------------------------------------
    const { data: insertedReading, error: insertError } =
      await supabase
        .from("aqi_reading")
        .insert([
          {
            station_id: localStationId,

            // NULL when WAQI gives "-"
            aqi: aqi,

            category: category,

            dominant_pollutant:
              data.dominentpol || null,

            timestamp:
              sourceTimestamp || new Date().toISOString(),

            pollutant_subindices:
              pollutantSubindices,
          },
        ])
        .select()
        .single();

    if (insertError) {
      throw insertError;
    }

    console.log(
      "======================================"
    );

    console.log("WAQI observation inserted successfully");

    console.log(
      `Local Station : ${localStationId}`
    );

    console.log(
      `WAQI Station  : ${waqiStationId}`
    );

    console.log(
      `AQI           : ${
        aqi !== null ? aqi : "Unavailable"
      }`
    );

    console.log(
      `Dominant      : ${
        data.dominentpol || "N/A"
      }`
    );

    console.log(
      `Source Time   : ${
        sourceTimestamp || "N/A"
      }`
    );

    console.log(
      "======================================"
    );

    // --------------------------------------------------
    // 10. Return result
    // --------------------------------------------------
    return {
      success: true,
      duplicate: false,

      stationId: localStationId,

      waqiStationId,

      stationName:
        data.city?.name || station.name,

      aqi,

      category,

      dominantPollutant:
        data.dominentpol || null,

      pollutants: {
        pm25: data.iaqi?.pm25?.v ?? null,
        pm10: data.iaqi?.pm10?.v ?? null,
        no2: data.iaqi?.no2?.v ?? null,
        so2: data.iaqi?.so2?.v ?? null,
        co: data.iaqi?.co?.v ?? null,
        o3: data.iaqi?.o3?.v ?? null,
      },

      timestamp: sourceTimestamp,

      reading: insertedReading,
    };

  } catch (error) {
    console.error(
      `WAQI synchronization failed for station ${localStationId}:`,
      error.message
    );

    return {
      success: false,
      stationId: localStationId,
      error: error.message,
    };
  }
};
/**
 * Synchronize ALL local stations mapped to WAQI
 */
const syncAllWaqiStations = async () => {
  try {
    console.log("======================================");
    console.log("Starting WAQI synchronization...");
    console.log("Time:", new Date().toISOString());

    const { data: stations, error } = await supabase
      .from("station")
      .select(
        "station_id, name, external_source, external_station_id"
      )
      .eq("external_source", "WAQI")
      .not("external_station_id", "is", null);

    if (error) {
      throw error;
    }

    if (!stations || stations.length === 0) {
      console.log("No WAQI mapped stations found.");
      console.log("======================================");
      return [];
    }

    console.log(
      `Found ${stations.length} WAQI mapped station(s)`
    );

    const results = [];

    /*
     * Process stations one by one.
     * This avoids sending many WAQI requests simultaneously.
     */
    for (const station of stations) {
      const result = await syncWaqiStation(
        station.station_id
      );

      results.push(result);
    }

    const successful = results.filter(
      (result) => result.success && !result.duplicate
    ).length;

    const duplicates = results.filter(
      (result) => result.duplicate
    ).length;

    const skipped = results.filter(
      (result) => result.skipped
    ).length;

    const failed = results.filter(
      (result) => !result.success && !result.skipped
    ).length;

    console.log("WAQI synchronization completed.");
    console.log(`Successful: ${successful}`);
    console.log(`Already existed: ${duplicates}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Failed: ${failed}`);
    console.log("======================================");

    return results;
  } catch (error) {
    console.error(
      "WAQI synchronization error:",
      error.message
    );

    return [];
  }
};


/**
 * Application AQI category
 */
const getAqiCategory = (aqi) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";

  return "Severe";
};


module.exports = {
  getWaqiStation,
  syncWaqiStation,
  syncAllWaqiStations,
};