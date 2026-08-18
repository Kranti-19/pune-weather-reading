import { CloudRain, Cloud } from "lucide-react"
import { hourlyWeather } from "../data/weatherData"

function HourlyForecast() {
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Hourly Forecast
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Weather conditions for the next few hours
          </p>
        </div>

        <span className="text-sm text-blue-600 font-medium">
          Today
        </span>

      </div>


      {/* Hourly cards */}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">

        {hourlyWeather.map((weather) => (

          <div
            key={weather.time}
            className="rounded-2xl bg-gray-50 p-4 text-center hover:bg-blue-50 transition"
          >

            {/* Time */}

            <p className="text-sm font-medium text-gray-600">
              {weather.time}
            </p>


            {/* Icon */}

            <div className="flex justify-center my-4">

              {weather.condition === "Rain" ? (
                <CloudRain
                  size={30}
                  className="text-blue-500"
                />
              ) : (
                <Cloud
                  size={30}
                  className="text-gray-500"
                />
              )}

            </div>


            {/* Temperature */}

            <p className="text-xl font-bold text-gray-900">
              {weather.temperature}°
            </p>


            {/* Rain probability */}

            <p className="text-xs text-blue-500 mt-2">
              💧 {weather.rain}%
            </p>

          </div>

        ))}

      </div>

    </section>
  )
}

export default HourlyForecast