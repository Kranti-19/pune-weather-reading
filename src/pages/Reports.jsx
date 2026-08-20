import {
  FileText,
  Calendar,
  MapPin,
  Activity,
  Database,
  Download,
} from "lucide-react";

function Reports() {
  const stationData = {
    station: "Kothrud Monitoring Station",
    stationId: "PMC-001",
    ward: "Kothrud",
    zone: "West Zone",
    date: "20 August 2026",

    aqi: 118,
    category: "Moderate",
    dominantPollutant: "PM2.5",

    pollutants: [
      {
        name: "PM2.5",
        value: "58",
        unit: "µg/m³",
      },
      {
        name: "PM10",
        value: "96",
        unit: "µg/m³",
      },
      {
        name: "NO₂",
        value: "42",
        unit: "µg/m³",
      },
      {
        name: "SO₂",
        value: "18",
        unit: "µg/m³",
      },
      {
        name: "CO",
        value: "1.2",
        unit: "mg/m³",
      },
      {
        name: "O₃",
        value: "54",
        unit: "µg/m³",
      },
      {
        name: "NH₃",
        value: "21",
        unit: "µg/m³",
      },
      {
        name: "Pb",
        value: "0.4",
        unit: "µg/m³",
      },
    ],

    dataAvailability: "98.6%",
    stationStatus: "Online",
  };

  return (
  <main className="p-8">

          {/* Page Header */}
          <div className="mb-7">

            <h1 className="text-3xl font-bold text-gray-900">
              Reports
            </h1>

            <p className="text-gray-500 mt-2">
              Generate air-quality monitoring reports for Pune.
            </p>

          </div>


          {/* Report Configuration */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText size={22} />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Daily Station Report
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Generate a daily air-quality report for a monitoring station.
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Station */}
              <div>

                <label className="text-sm font-medium text-gray-700">
                  Monitoring Station
                </label>

                <div className="relative mt-2">

                  <MapPin
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <select
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    defaultValue="Kothrud Monitoring Station"
                  >
                    <option>Kothrud Monitoring Station</option>
                    <option>Hinjewadi Monitoring Station</option>
                    <option>Hadapsar Monitoring Station</option>
                    <option>Kharadi Monitoring Station</option>
                    <option>Baner Monitoring Station</option>
                  </select>

                </div>

              </div>


              {/* Date */}
              <div>

                <label className="text-sm font-medium text-gray-700">
                  Report Date
                </label>

                <div className="relative mt-2">

                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="date"
                    defaultValue="2026-08-20"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Generate */}
              <div className="flex items-end">

                <button
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                >
                  <FileText size={18} />
                  Generate Report
                </button>

              </div>

            </div>

          </div>


          {/* Daily Station Report */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Report Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Daily Station Report
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-1">
                  {stationData.station}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {stationData.stationId} · {stationData.ward} ·{" "}
                  {stationData.zone}
                </p>

              </div>


              <div className="text-right">

                <p className="text-sm text-gray-500">
                  Report Date
                </p>

                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {stationData.date}
                </p>

              </div>

            </div>


            {/* AQI Summary */}
            <div className="p-6 border-b border-gray-100">

              <h3 className="text-lg font-semibold text-gray-900">
                AQI Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">

                {/* AQI */}
                <div className="p-5 rounded-2xl bg-orange-50">

                  <div className="flex items-center gap-2 text-orange-600">
                    <Activity size={18} />
                    <span className="text-sm font-medium">
                      AQI
                    </span>
                  </div>

                  <p className="text-3xl font-bold text-gray-900 mt-3">
                    {stationData.aqi}
                  </p>

                  <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
                    {stationData.category}
                  </span>

                </div>


                {/* Dominant Pollutant */}
                <div className="p-5 rounded-2xl bg-gray-50">

                  <p className="text-sm text-gray-500">
                    Dominant Pollutant
                  </p>

                  <p className="text-2xl font-bold text-gray-900 mt-3">
                    {stationData.dominantPollutant}
                  </p>

                </div>


                {/* Data Availability */}
                <div className="p-5 rounded-2xl bg-green-50">

                  <div className="flex items-center gap-2 text-green-600">
                    <Database size={18} />
                    <span className="text-sm font-medium">
                      Data Availability
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-gray-900 mt-3">
                    {stationData.dataAvailability}
                  </p>

                </div>


                {/* Station Status */}
                <div className="p-5 rounded-2xl bg-blue-50">

                  <p className="text-sm text-gray-500">
                    Station Status
                  </p>

                  <div className="flex items-center gap-2 mt-3">

                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>

                    <p className="text-xl font-bold text-gray-900">
                      {stationData.stationStatus}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* Pollutant Measurements */}
            <div className="p-6">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    Daily Pollutant Measurements
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Recorded pollutant observations for the selected station.
                  </p>

                </div>

              </div>


              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-gray-100">

                      <th className="text-left pb-3 text-sm font-medium text-gray-500">
                        Parameter
                      </th>

                      <th className="text-left pb-3 text-sm font-medium text-gray-500">
                        Value
                      </th>

                      <th className="text-left pb-3 text-sm font-medium text-gray-500">
                        Unit
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {stationData.pollutants.map((pollutant) => (

                      <tr
                        key={pollutant.name}
                        className="border-b border-gray-50 last:border-0"
                      >

                        <td className="py-4 font-medium text-gray-900">
                          {pollutant.name}
                        </td>

                        <td className="py-4 text-gray-900 font-semibold">
                          {pollutant.value}
                        </td>

                        <td className="py-4 text-sm text-gray-500">
                          {pollutant.unit}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>


            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">

              <p className="text-xs text-gray-500">
                Daily station report · Pune Municipal Corporation
              </p>

              <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                <Download size={17} />
                Export Report
              </button>

            </div>

          </div>

        </main>
  );
}

export default Reports;