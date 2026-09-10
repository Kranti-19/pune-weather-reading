const getWaqiStation = async (req, res) => {
  try {
    const { stationId } = req.params;

    console.log("Station ID received:", stationId);
    console.log("WAQI token exists:", !!process.env.WAQI_TOKEN);

    if (!process.env.WAQI_TOKEN) {
      return res.status(500).json({
        status: "error",
        message: "WAQI_TOKEN is missing in .env"
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
        details: result.data
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

        // WAQI AQI
        aqi: data.aqi !== "-" ? Number(data.aqi) : null,

        dominantPollutant: data.dominentpol || null,

        pollutants: {
          pm25: iaqi.pm25?.v ?? null,
          pm10: iaqi.pm10?.v ?? null,
          no2: iaqi.no2?.v ?? null,
          so2: iaqi.so2?.v ?? null,
          co: iaqi.co?.v ?? null,
          o3: iaqi.o3?.v ?? null
        },

        location: {
          latitude: data.city?.geo?.[0] ?? null,
          longitude: data.city?.geo?.[1] ?? null
        },

        time: data.time?.s || null
      }
    });

  } catch (error) {
    console.error("WAQI error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

module.exports = {
  getWaqiStation
};