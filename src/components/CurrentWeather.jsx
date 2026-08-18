import { CloudRain, Droplets, Wind } from "lucide-react"
import { currentWeather } from "../data/weatherData"

function CurrentWeather() {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-8">

      <div className="flex justify-between items-start">

        <div>
          <p className="text-blue-100">
            Current Weather
          </p>

          <h2 className="text-6xl font-bold mt-3">
            {currentWeather.temperature}°
          </h2>

          <p className="text-xl mt-2">
            {currentWeather.condition}
          </p>

          <p className="text-blue-100 mt-2">
            Feels like {currentWeather.feelsLike}°
          </p>
        </div>


        <CloudRain size={80} strokeWidth={1.5} />
      </div>


      <div className="grid grid-cols-3 gap-4 mt-8">

        <div className="bg-white/10 rounded-xl p-4">
          <Droplets size={20} />

          <p className="text-sm text-blue-100 mt-2">
            Humidity
          </p>

          <p className="font-semibold">
            {currentWeather.humidity}%
          </p>
        </div>


        <div className="bg-white/10 rounded-xl p-4">
          <Wind size={20} />

          <p className="text-sm text-blue-100 mt-2">
            Wind
          </p>

          <p className="font-semibold">
            {currentWeather.wind} km/h
          </p>
        </div>


        <div className="bg-white/10 rounded-xl p-4">
          <CloudRain size={20} />

          <p className="text-sm text-blue-100 mt-2">
            Rain
          </p>

          <p className="font-semibold">
            {currentWeather.rainChance}%
          </p>
        </div>

      </div>

    </div>
  )
}

export default CurrentWeather