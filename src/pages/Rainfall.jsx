import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

function Rainfall() {
  const rainfallData = [
    {
      area: "Kothrud",
      rainfall: "18 mm",
      intensity: "Light",
      duration: "45 min",
      status: "Normal",
    },
    {
      area: "Hinjewadi",
      rainfall: "12 mm",
      intensity: "Light",
      duration: "30 min",
      status: "Normal",
    },
    {
      area: "Hadapsar",
      rainfall: "21 mm",
      intensity: "Moderate",
      duration: "55 min",
      status: "Watch",
    },
    {
      area: "Kharadi",
      rainfall: "15 mm",
      intensity: "Moderate",
      duration: "40 min",
      status: "Watch",
    },
    {
      area: "Baner",
      rainfall: "26 mm",
      intensity: "Heavy",
      duration: "1 hr",
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
              Rainfall Monitoring
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor rainfall levels across Pune.
            </p>
          </div>


          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Rainfall Today
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                92 mm
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Across monitored areas
              </p>
            </div>


            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">
                Highest Rainfall
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                26 mm
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Baner
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
                Requires attention
              </p>
            </div>

          </div>


          {/* Rainfall Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Rainfall Across Pune
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Current rainfall measurements by area.
                </p>
              </div>

              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                View all
              </button>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-gray-100 text-left">

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Area
                    </th>

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Rainfall
                    </th>

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Intensity
                    </th>

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Duration
                    </th>

                    <th className="py-4 text-sm font-medium text-gray-500">
                      Status
                    </th>

                  </tr>
                </thead>


                <tbody>

                  {rainfallData.map((item) => (

                    <tr
                      key={item.area}
                      className="border-b border-gray-100 last:border-0"
                    >

                      <td className="py-5 font-semibold text-gray-900">
                        {item.area}
                      </td>

                      <td className="py-5 text-gray-600">
                        {item.rainfall}
                      </td>

                      <td className="py-5 text-gray-600">
                        {item.intensity}
                      </td>

                      <td className="py-5 text-gray-600">
                        {item.duration}
                      </td>

                      <td className="py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === "Normal"
                              ? "bg-green-100 text-green-600"
                              : item.status === "Watch"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-red-100 text-red-500"
                          }`}
                        >
                          {item.status}
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

export default Rainfall;