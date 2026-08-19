import { useState } from "react";
import {
  AlertTriangle,
  MapPin,
  Clock,
  X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

function Alerts() {
  const [filter, setFilter] = useState("All");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const alerts = [
    {
      id: 1,
      title: "Heavy Rainfall Expected",
      areas: "Kothrud · Baner · Aundh",
      time: "10 minutes ago",
      severity: "High",
      description:
        "Heavy rainfall is expected in these areas. Residents and municipal teams are advised to remain alert.",
    },
    {
      id: 2,
      title: "Strong Winds",
      areas: "Hinjewadi · Wakad",
      time: "35 minutes ago",
      severity: "Moderate",
      description:
        "Strong winds are being observed in the area. Avoid unnecessary travel and monitor weather conditions.",
    },
    {
      id: 3,
      title: "Waterlogging Advisory",
      areas: "Hadapsar · Kharadi",
      time: "1 hour ago",
      severity: "Moderate",
      description:
        "Waterlogging has been reported in some locations. Municipal response teams should monitor affected roads.",
    },
    {
      id: 4,
      title: "Thunderstorm Advisory",
      areas: "Viman Nagar · Yerwada",
      time: "2 hours ago",
      severity: "Low",
      description:
        "A thunderstorm is possible in these areas. Continue monitoring local weather conditions.",
    },
  ];

  const filteredAlerts =
    filter === "All"
      ? alerts
      : alerts.filter((alert) => alert.severity === filter);

  const getSeverityStyle = (severity) => {
    if (severity === "High") {
      return "bg-red-100 text-red-600";
    }

    if (severity === "Moderate") {
      return "bg-orange-100 text-orange-600";
    }

    return "bg-green-100 text-green-600";
  };

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
              Weather Alerts
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor active weather warnings and advisories across Pune.
            </p>

          </div>


          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <p className="text-sm text-gray-500">
                Active Alerts
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {alerts.length}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Across Pune
              </p>

            </div>


            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <p className="text-sm text-gray-500">
                High Severity
              </p>

              <p className="text-3xl font-bold text-red-500 mt-2">
                {alerts.filter((alert) => alert.severity === "High").length}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Requires immediate attention
              </p>

            </div>


            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <p className="text-sm text-gray-500">
                Moderate Alerts
              </p>

              <p className="text-3xl font-bold text-orange-500 mt-2">
                {
                  alerts.filter(
                    (alert) => alert.severity === "Moderate"
                  ).length
                }
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Requires monitoring
              </p>

            </div>

          </div>


          {/* Alerts Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Active Weather Alerts
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Current warnings issued across monitored areas.
                </p>

              </div>


              {/* Filter */}
              <div className="flex gap-2">

                {["All", "High", "Moderate", "Low"].map((option) => (

                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      filter === option
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {option}
                  </button>

                ))}

              </div>

            </div>


            {/* Alert List */}
            <div className="space-y-4">

              {filteredAlerts.map((alert) => (

                <div
                  key={alert.id}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-5"
                >

                  <div className="flex items-start gap-4">

                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        alert.severity === "High"
                          ? "bg-red-100 text-red-500"
                          : alert.severity === "Moderate"
                          ? "bg-orange-100 text-orange-500"
                          : "bg-green-100 text-green-500"
                      }`}
                    >
                      <AlertTriangle size={20} />
                    </div>


                    {/* Content */}
                    <div className="flex-1 min-w-0">

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

                        <h3 className="font-semibold text-gray-900">
                          {alert.title}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${getSeverityStyle(
                            alert.severity
                          )}`}
                        >
                          {alert.severity}
                        </span>

                      </div>


                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">

                        <span className="flex items-center gap-1">
                          <MapPin size={15} />
                          {alert.areas}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock size={15} />
                          {alert.time}
                        </span>

                      </div>


                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="text-sm text-blue-600 font-medium mt-4 hover:text-blue-700"
                      >
                        View details →
                      </button>

                    </div>

                  </div>

                </div>

              ))}


              {filteredAlerts.length === 0 && (

                <div className="text-center py-10 text-gray-500">
                  No alerts found.
                </div>

              )}

            </div>

          </div>

        </main>

      </div>


      {/* Details Modal */}
      {selectedAlert && (

        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-blue-600 font-medium">
                  Weather Alert
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {selectedAlert.title}
                </h2>

              </div>


              <button
                onClick={() => setSelectedAlert(null)}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={18} />
              </button>

            </div>


            <div className="mt-6 space-y-4">

              <div>
                <p className="text-sm text-gray-500">
                  Severity
                </p>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getSeverityStyle(
                    selectedAlert.severity
                  )}`}
                >
                  {selectedAlert.severity}
                </span>
              </div>


              <div>

                <p className="text-sm text-gray-500">
                  Affected Areas
                </p>

                <p className="text-gray-900 mt-1">
                  {selectedAlert.areas}
                </p>

              </div>


              <div>

                <p className="text-sm text-gray-500">
                  Issued
                </p>

                <p className="text-gray-900 mt-1">
                  {selectedAlert.time}
                </p>

              </div>


              <div>

                <p className="text-sm text-gray-500">
                  Description
                </p>

                <p className="text-gray-600 mt-1 leading-6">
                  {selectedAlert.description}
                </p>

              </div>

            </div>


            <button
              onClick={() => setSelectedAlert(null)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium mt-7 hover:bg-blue-700 transition"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Alerts;