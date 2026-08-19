import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

function PuneAreas() {
  const areas = [
    {
      name: "Kothrud",
      temperature: "23°C",
      condition: "Light Rain",
      rainfall: "18 mm",
      humidity: "80%",
      wind: "12 km/h",
      status: "Normal",
    },
    {
      name: "Hinjewadi",
      temperature: "24°C",
      condition: "Cloudy",
      rainfall: "12 mm",
      humidity: "76%",
      wind: "14 km/h",
      status: "Normal",
    },
    {
      name: "Hadapsar",
      temperature: "25°C",
      condition: "Light Rain",
      rainfall: "21 mm",
      humidity: "82%",
      wind: "15 km/h",
      status: "Watch",
    },
    {
      name: "Kharadi",
      temperature: "25°C",
      condition: "Cloudy",
      rainfall: "15 mm",
      humidity: "78%",
      wind: "13 km/h",
      status: "Watch",
    },
    {
      name: "Baner",
      temperature: "23°C",
      condition: "Rain",
      rainfall: "26 mm",
      humidity: "85%",
      wind: "16 km/h",
      status: "Alert",
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
              Pune Areas
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor weather conditions across different areas of Pune.
            </p>

          </div>


          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <p className="text-sm text-gray-500">
                Monitored Areas
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                5
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Areas currently monitored
              </p>

            </div>


            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <p className="text-sm text-gray-500">
                Areas on Watch
              </p>

              <p className="text-3xl font-bold text-orange-500 mt-2">
                2
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Require monitoring
              </p>

            </div>


            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <p className="text-sm text-gray-500">
                Areas on Alert
              </p>

              <p className="text-3xl font-bold text-red-500 mt-2">
                1
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Requires immediate attention
              </p>

            </div>

          </div>


          {/* Areas Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

            <div className="mb-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Weather Across Pune
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current weather conditions in monitored areas.
              </p>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-gray-100 text-left">

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Area
                    </th>

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Temperature
                    </th>

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Condition
                    </th>

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Rainfall
                    </th>

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Humidity
                    </th>

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Wind
                    </th>

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {areas.map((area) => (

                    <tr
                      key={area.name}
                      className="border-b border-gray-100 last:border-0"
                    >

                      <td className="py-5 font-semibold text-gray-900">
                        {area.name}
                      </td>

                      <td className="py-5 text-gray-600">
                        {area.temperature}
                      </td>

                      <td className="py-5 text-gray-600">
                        {area.condition}
                      </td>

                      <td className="py-5 text-gray-600">
                        {area.rainfall}
                      </td>

                      <td className="py-5 text-gray-600">
                        {area.humidity}
                      </td>

                      <td className="py-5 text-gray-600">
                        {area.wind}
                      </td>

                      <td className="py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            area.status === "Normal"
                              ? "bg-green-100 text-green-600"
                              : area.status === "Watch"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-red-100 text-red-500"
                          }`}
                        >
                          {area.status}
                        </span>

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

export default PuneAreas;