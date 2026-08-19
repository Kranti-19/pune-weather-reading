import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

function Weather() {
  const areas = [
    {
      area: "Kothrud",
      temperature: "23°C",
      condition: "Light Rain",
      feelsLike: "25°C",
      humidity: "80%",
      wind: "12 km/h",
    },
    {
      area: "Hinjewadi",
      temperature: "24°C",
      condition: "Cloudy",
      feelsLike: "25°C",
      humidity: "76%",
      wind: "14 km/h",
    },
    {
      area: "Hadapsar",
      temperature: "25°C",
      condition: "Light Rain",
      feelsLike: "27°C",
      humidity: "82%",
      wind: "15 km/h",
    },
    {
      area: "Kharadi",
      temperature: "25°C",
      condition: "Cloudy",
      feelsLike: "26°C",
      humidity: "78%",
      wind: "13 km/h",
    },
    {
      area: "Baner",
      temperature: "23°C",
      condition: "Rain",
      feelsLike: "24°C",
      humidity: "85%",
      wind: "16 km/h",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <DashboardHeader />

        <main className="p-8">

          {/* Page Header */}
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-gray-900">
              Weather Monitoring
            </h1>

            <p className="text-gray-500 mt-2">
              Current weather conditions across Pune.
            </p>
          </div>


          {/* Pune Current Weather */}
          <div className="bg-blue-600 rounded-3xl p-7 text-white shadow-sm mb-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-blue-100 text-sm">
                  Pune
                </p>

                <p className="text-5xl font-bold mt-3">
                  24°
                </p>

                <p className="text-xl mt-2">
                  Light Rain
                </p>

                <p className="text-blue-100 mt-2">
                  Feels like 26°C
                </p>
              </div>

              <div className="text-6xl">
                🌧️
              </div>

            </div>


            {/* Weather Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">

              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-blue-100 text-sm">
                  Humidity
                </p>

                <p className="text-xl font-semibold mt-1">
                  82%
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-blue-100 text-sm">
                  Wind Speed
                </p>

                <p className="text-xl font-semibold mt-1">
                  14 km/h
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-blue-100 text-sm">
                  Pressure
                </p>

                <p className="text-xl font-semibold mt-1">
                  1008 hPa
                </p>
              </div>

            </div>

          </div>


          {/* Area Weather */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Weather Across Pune
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current conditions in monitored areas.
              </p>
            </div>


            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-gray-100">

                    <th className="text-left pb-3 text-sm font-medium text-gray-500">
                      Area
                    </th>

                    <th className="text-left pb-3 text-sm font-medium text-gray-500">
                      Temperature
                    </th>

                    <th className="text-left pb-3 text-sm font-medium text-gray-500">
                      Condition
                    </th>

                    <th className="text-left pb-3 text-sm font-medium text-gray-500">
                      Feels Like
                    </th>

                    <th className="text-left pb-3 text-sm font-medium text-gray-500">
                      Humidity
                    </th>

                    <th className="text-left pb-3 text-sm font-medium text-gray-500">
                      Wind
                    </th>

                  </tr>
                </thead>


                <tbody>

                  {areas.map((area) => (

                    <tr
                      key={area.area}
                      className="border-b border-gray-50 last:border-0"
                    >

                      <td className="py-4 font-semibold text-gray-900">
                        {area.area}
                      </td>

                      <td className="py-4 text-sm text-gray-600">
                        {area.temperature}
                      </td>

                      <td className="py-4 text-sm text-gray-600">
                        {area.condition}
                      </td>

                      <td className="py-4 text-sm text-gray-600">
                        {area.feelsLike}
                      </td>

                      <td className="py-4 text-sm text-gray-600">
                        {area.humidity}
                      </td>

                      <td className="py-4 text-sm text-gray-600">
                        {area.wind}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Weather;