const getPuneWeather = async (req, res) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        status: "error",
        message: "WEATHER_API_KEY is not configured in .env",
      });
    }

    const url = new URL(
      "https://api.weatherapi.com/v1/current.json"
    );

    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", "Pune, Maharashtra, India");
    url.searchParams.set("aqi", "no");

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return res.status(response.status).json({
        status: "error",
        message:
          errorData?.error?.message ||
          "Unable to fetch Pune weather",
      });
    }

    const data = await response.json();

    const current = data.current;
    const location = data.location;

    return res.json({
      status: "success",

      weather: {
        city: location.name,
        region: location.region,
        country: location.country,

        latitude: location.lat,
        longitude: location.lon,

        temperature: current.temp_c,
        feelsLike: current.feelslike_c,

        condition: current.condition?.text || "—",
        icon: current.condition?.icon || null,

        humidity: current.humidity,

        windSpeed: current.wind_kph,
        windDirection: current.wind_degree,
        windDirectionText: current.wind_dir,

        pressure: current.pressure_mb,

        rainfall: current.precip_mm,

        visibility: current.vis_km,

        cloud: current.cloud,

        uv: current.uv,

        updatedAt: current.last_updated,
      },
    });
  } catch (error) {
    console.error("Pune weather error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch current Pune weather",
    });
  }
};

module.exports = {
  getPuneWeather,
};