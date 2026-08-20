function PuneAreaMonitoring() {
  const constructionSites = [
  {
    name: "PMC Main Building Construction",
    ward: "Ward 10",
    zone: "West",
    aqi: 118,
    category: "Moderate",
    stationStatus: "Online",
  },
  {
    name: "Hinjewadi IT Park Construction",
    ward: "Ward 25",
    zone: "West",
    aqi: 92,
    category: "Satisfactory",
    stationStatus: "Online",
  },
  {
    name: "Hadapsar Commercial Complex",
    ward: "Ward 15",
    zone: "East",
    aqi: 156,
    category: "Moderate",
    stationStatus: "Online",
  },
  {
    name: "Kharadi Metro Construction Site",
    ward: "Ward 17",
    zone: "East",
    aqi: 134,
    category: "Moderate",
    stationStatus: "Online",
  },
  {
    name: "Baner Road Flyover Construction",
    ward: "Ward 8",
    zone: "West",
    aqi: 214,
    category: "Poor",
    stationStatus: "Offline",
  },
];

  const getAQIStyle = (category) => {
    switch (category) {
      case "Good":
        return "bg-green-100 text-green-600";

      case "Satisfactory":
        return "bg-lime-100 text-lime-600";

      case "Moderate":
        return "bg-orange-100 text-orange-600";

      case "Poor":
        return "bg-red-100 text-red-600";

      case "Very Poor":
        return "bg-purple-100 text-purple-600";

      case "Severe":
        return "bg-red-200 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

      {/* Header */}

      <div className="flex items-center justify-between">
  <div>
    <h3 className="text-lg font-semibold text-gray-900">
      Construction Site Monitoring
    </h3>

    <p className="text-sm text-gray-500 mt-1">
      Current air-quality status across monitored construction sites
    </p>
  </div>

  <button className="text-sm font-medium text-blue-600">
    View all
  </button>
</div>


      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b border-gray-100">

              <th className="text-left pb-3 text-sm font-medium text-gray-500">
                Construction / Building
              </th>

              <th className="text-left pb-3 text-sm font-medium text-gray-500">
                Ward
              </th>

              <th className="text-left pb-3 text-sm font-medium text-gray-500">
                Zone
              </th>

              <th className="text-left pb-3 text-sm font-medium text-gray-500">
                AQI
              </th>

              <th className="text-left pb-3 text-sm font-medium text-gray-500">
                Category
              </th>

              <th className="text-left pb-3 text-sm font-medium text-gray-500">
                Station
              </th>

            </tr>

          </thead>


          <tbody>

            {constructionSites.map((site) => (

              <tr
                key={site.name}
                className="border-b border-gray-50 last:border-0"
              >

                {/* Area */}

                <td className="py-4 font-semibold text-gray-900">
                  {site.name}
                </td>


                {/* Ward */}

                <td className="py-4 text-sm text-gray-600">
                  {site.ward}
                </td>


                {/* Zone */}

                <td className="py-4 text-sm text-gray-600">
                  {site.zone}
                </td>


                {/* AQI */}

                <td className="py-4">

                  <span className="text-sm font-bold text-gray-900">
                    {site.aqi}
                  </span>

                </td>


                {/* AQI Category */}

                <td className="py-4">

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getAQIStyle(
                      site.category
                    )}`}
                  >
                    {site.category}
                  </span>

                </td>


                {/* Station Status */}

                <td className="py-4">

                  <span
                    className={`inline-flex items-center gap-2 text-xs font-medium ${
                      site.stationStatus === "Online"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >

                    <span
                      className={`w-2 h-2 rounded-full ${
                        site.stationStatus === "Online"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />

                    {site.stationStatus}

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