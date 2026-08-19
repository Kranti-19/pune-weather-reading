function PuneAreaMonitoring() {
  const areas = [
    {
      area: "Kothrud",
      temperature: "23°C",
      condition: "Light Rain",
      rainfall: "18 mm",
      status: "Normal",
    },
    {
      area: "Hinjewadi",
      temperature: "24°C",
      condition: "Cloudy",
      rainfall: "12 mm",
      status: "Normal",
    },
    {
      area: "Hadapsar",
      temperature: "25°C",
      condition: "Light Rain",
      rainfall: "21 mm",
      status: "Watch",
    },
    {
      area: "Kharadi",
      temperature: "25°C",
      condition: "Cloudy",
      rainfall: "15 mm",
      status: "Watch",
    },
    {
      area: "Baner",
      temperature: "23°C",
      condition: "Rain",
      rainfall: "26 mm",
      status: "Alert",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Pune Area Monitoring
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Current conditions across monitored Pune areas
          </p>
        </div>

        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View all
        </button>

      </div>


      {/* Table */}
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
                Rainfall
              </th>

              <th className="text-left pb-3 text-sm font-medium text-gray-500">
                Status
              </th>

            </tr>
          </thead>


          <tbody>

            {areas.map((area) => (

              <tr
                key={area.area}
                className="border-b border-gray-50 last:border-0"
              >

                {/* Area */}
                <td className="py-4 font-semibold text-gray-900">
                  {area.area}
                </td>


                {/* Temperature */}
                <td className="py-4 text-sm text-gray-600">
                  {area.temperature}
                </td>


                {/* Condition */}
                <td className="py-4 text-sm text-gray-600">
                  {area.condition}
                </td>


                {/* Rainfall */}
                <td className="py-4 text-sm text-gray-600">
                  {area.rainfall}
                </td>


                {/* Status */}
                <td className="py-4">

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      area.status === "Normal"
                        ? "bg-green-100 text-green-600"
                        : area.status === "Watch"
                        ? "bg-orange-100 text-orange-500"
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
  );
}

export default PuneAreaMonitoring;