import { Cloud, CloudRain } from "lucide-react"
import { weeklyWeather } from "../data/weatherData"

function WeeklyForecast() {
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            7-Day Forecast
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Pune weather outlook
          </p>
        </div>

        <span className="text-sm text-gray-500">
          °C
        </span>

      </div>


      {/* Forecast list */}

      <div className="mt-5">

        {weeklyWeather.map((weather, index) => (

          <div
            key={weather.day}
            className={`grid grid-cols-4 md:grid-cols-5 items-center py-4 ${
              index !== weeklyWeather.length - 1
                ? "border-b border-gray-100"
                : ""
            }`}
          >

            {/* Day */}

            <div>

              <p className="font-medium text-gray-900">
                {weather.day}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {weather.date}
              </p>

            </div>


            {/* Weather */}

            <div className="flex items-center gap-2">

              {weather.condition === "Rain" ? (
                <CloudRain
                  size={26}
                  className="text-blue-500"
                />
              ) : (
                <Cloud
                  size={26}
                  className="text-gray-500"
                />
              )}

              <span className="hidden md:block text-sm text-gray-600">
                {weather.condition}
              </span>

            </div>


            {/* Temperature */}

            <div className="text-sm">

              <span className="font-semibold text-gray-900">
                {weather.high}°
              </span>

              <span className="text-gray-400 ml-2">
                {weather.low}°
              </span>

            </div>


            {/* Rain */}

            <div className="text-sm text-blue-500">
              💧 {weather.rain}%
            </div>


            {/* Desktop status */}

            <div className="hidden md:block text-right text-sm text-gray-400">
              {weather.rain >= 70
                ? "High chance"
                : weather.rain >= 50
                ? "Possible"
                : "Low chance"}
            </div>

          </div>

        ))}

      </div>

    </section>
  )
}

export default WeeklyForecast