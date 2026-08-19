function WeatherAlerts() {
  const alerts = [
    {
      title: "Heavy Rainfall Expected",
      areas: "Kothrud · Baner · Aundh",
      time: "10 minutes ago",
      priority: "High",
    },
    {
      title: "Strong Winds",
      areas: "Hinjewadi · Wakad",
      time: "35 minutes ago",
      priority: "Moderate",
    },
    {
      title: "Waterlogging Advisory",
      areas: "Hadapsar · Kharadi",
      time: "1 hour ago",
      priority: "Moderate",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Weather Alerts
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Active weather warnings across Pune
          </p>
        </div>

        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View all
        </button>

      </div>


      {/* Alerts */}
      <div className="space-y-3">

        {alerts.map((alert) => (
          <div
            key={alert.title}
            className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between"
          >

            <div className="flex items-start gap-3">

              {/* Alert Icon */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  alert.priority === "High"
                    ? "bg-red-100"
                    : "bg-orange-100"
                }`}
              >
                <span
                  className={
                    alert.priority === "High"
                      ? "text-red-500"
                      : "text-orange-500"
                  }
                >
                  ⚠
                </span>
              </div>


              {/* Alert Information */}
              <div>

                <h4 className="font-semibold text-gray-900">
                  {alert.title}
                </h4>

                <p className="text-sm text-gray-500 mt-1">
                  {alert.areas}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {alert.time}
                </p>

              </div>

            </div>


            {/* Priority */}
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                alert.priority === "High"
                  ? "bg-red-100 text-red-500"
                  : "bg-orange-100 text-orange-500"
              }`}
            >
              {alert.priority}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}

export default WeatherAlerts;