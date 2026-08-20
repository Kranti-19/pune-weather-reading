import {
  MapPin,
  Wifi,
  Activity,
  ChevronRight,
  WifiOff,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import PuneMap from "../components/PuneMap";

function PuneAreas() {

  const navigate = useNavigate();

  const stations = [
    {
      id: "PMC-001",
      name: "Kothrud Monitoring Station",
      ward: "Kothrud",
      zone: "West Zone",
      aqi: 118,
      category: "Moderate",
      pm25: 58,
      pm10: 96,
      status: "Online",
      updated: "Just now",
    },
    {
      id: "PMC-002",
      name: "Hinjewadi Monitoring Station",
      ward: "Hinjewadi",
      zone: "North-West Zone",
      aqi: 92,
      category: "Satisfactory",
      pm25: 42,
      pm10: 78,
      status: "Online",
      updated: "2 min ago",
    },
    {
      id: "PMC-003",
      name: "Hadapsar Monitoring Station",
      ward: "Hadapsar",
      zone: "East Zone",
      aqi: 156,
      category: "Moderate",
      pm25: 72,
      pm10: 118,
      status: "Online",
      updated: "1 min ago",
    },
    {
      id: "PMC-004",
      name: "Kharadi Monitoring Station",
      ward: "Kharadi",
      zone: "East Zone",
      aqi: 134,
      category: "Moderate",
      pm25: 64,
      pm10: 105,
      status: "Online",
      updated: "3 min ago",
    },
    {
      id: "PMC-005",
      name: "Baner Monitoring Station",
      ward: "Baner",
      zone: "West Zone",
      aqi: 214,
      category: "Poor",
      pm25: 91,
      pm10: 142,
      status: "Offline",
      updated: "18 min ago",
    },
  ];

  const onlineStations = stations.filter(
    (station) => station.status === "Online"
  ).length;

  const attentionRequired = stations.filter(
    (station) => station.status === "Offline" || station.aqi > 200
  ).length;

  const getCategoryStyle = (category) => {
    switch (category) {
      case "Satisfactory":
        return "bg-yellow-100 text-yellow-700";

      case "Moderate":
        return "bg-orange-100 text-orange-600";

      case "Poor":
        return "bg-red-100 text-red-600";

      case "Very Poor":
        return "bg-purple-100 text-purple-600";

      case "Severe":
        return "bg-gray-200 text-gray-800";

      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Content */}
      <main className="p-8">

        {/* Page Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-gray-900">
            Pune Areas
          </h1>

          <p className="text-gray-500 mt-2">
            Monitor air quality stations across Pune.
          </p>
        </div>


        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          {/* Total Stations */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Stations
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {stations.length}
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  Monitoring Pune areas
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin size={22} />
              </div>

            </div>

          </div>


          {/* Online Stations */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Online Stations
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {onlineStations}
                </p>

                <p className="text-sm text-green-600 mt-2">
                  Currently transmitting data
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Wifi size={22} />
              </div>

            </div>

          </div>


          {/* Attention Required */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Attention Required
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {attentionRequired}
                </p>

                <p className="text-sm text-red-500 mt-2">
                  Offline or high AQI stations
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <Activity size={22} />
              </div>

            </div>

          </div>

        </div>


        {/* Monitoring Stations */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Table Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Monitoring Stations
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current air quality status by station.
              </p>
            </div>

            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View map
            </button>


          </div>


          {/* Table */}
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-100 text-left">

                  <th className="px-6 py-5 text-sm font-medium text-gray-500">
                    Station
                  </th>

                  <th className="px-6 py-5 text-sm font-medium text-gray-500">
                    Ward
                  </th>

                  <th className="px-6 py-5 text-sm font-medium text-gray-500">
                    Zone
                  </th>

                  <th className="px-6 py-5 text-sm font-medium text-gray-500">
                    AQI
                  </th>

                  <th className="px-6 py-5 text-sm font-medium text-gray-500">
                    PM2.5
                  </th>

                  <th className="px-6 py-5 text-sm font-medium text-gray-500">
                    PM10
                  </th>

                  <th className="px-6 py-5 text-sm font-medium text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-5 text-sm font-medium text-gray-500">
                    Last Updated
                  </th>

                  <th></th>

                </tr>
              </thead>


              <tbody>

                {stations.map((station) => (

                  <tr
                    key={station.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition"
                  >

                    {/* Station */}
                    <td className="px-6 py-6">

                      <div>
                        <p className="font-semibold text-gray-900 max-w-[150px]">
                          {station.name}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {station.id}
                        </p>
                      </div>

                    </td>


                    {/* Ward */}
                    <td className="px-6 py-6 text-sm text-gray-600">
                      {station.ward}
                    </td>


                    {/* Zone */}
                    <td className="px-6 py-6 text-sm text-gray-600">
                      {station.zone}
                    </td>


                    {/* AQI */}
                    <td className="px-6 py-6">

                      <div className="flex items-center gap-2">

                        <span className="font-semibold text-gray-900">
                          {station.aqi}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryStyle(
                            station.category
                          )}`}
                        >
                          {station.category}
                        </span>

                      </div>

                    </td>


                    {/* PM2.5 */}
                    <td className="px-6 py-6">

                      <p className="text-sm text-gray-700">
                        {station.pm25}
                      </p>

                      <p className="text-xs text-gray-400">
                        µg/m³
                      </p>

                    </td>


                    {/* PM10 */}
                    <td className="px-6 py-6">

                      <p className="text-sm text-gray-700">
                        {station.pm10}
                      </p>

                      <p className="text-xs text-gray-400">
                        µg/m³
                      </p>

                    </td>


                    {/* Status */}
                    <td className="px-6 py-6">

                      {station.status === "Online" ? (

                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Online
                        </div>

                      ) : (

                        <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                          <WifiOff size={16} />
                          Offline
                        </div>

                      )}

                    </td>


                    {/* Updated */}
                    <td className="px-6 py-6 text-sm text-gray-500">
                      {station.updated}
                    </td>


                    {/* Arrow */}
                    <td className="px-6 py-6">

                      <button
                        onClick={() => navigate(`/station/${station.id.replace("PMC-", "")}`)}
                        className="text-gray-400 hover:text-blue-600 transition"
                        title="View station details"
                      >
                        <ChevronRight size={20} />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* GIS Map */}

            <div className="mt-6">
              <PuneMap />
            </div>

      </main>

    </div>
  );
}

export default PuneAreas;