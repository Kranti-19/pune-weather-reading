import {
  Bell,
  AlertTriangle,
  WifiOff,
  Activity,
  BatteryWarning,
  Wrench,
  CheckCircle,
  Clock,
} from "lucide-react";

function Alerts() {
  const alerts = [
    {
      id: "ALT-001",
      title: "High AQI Detected",
      description: "Air quality has reached the Poor category.",
      station: "Baner Monitoring Station",
      parameter: "AQI",
      value: "214",
      severity: "Critical",
      time: "10 minutes ago",
      type: "air",
      status: "Active",
    },
    {
      id: "ALT-002",
      title: "Station Offline",
      description: "No data has been received from the monitoring station.",
      station: "Baner Monitoring Station",
      parameter: "Connectivity",
      value: "18 min",
      severity: "Warning",
      time: "18 minutes ago",
      type: "offline",
      status: "Active",
    },
    {
      id: "ALT-003",
      title: "PM2.5 Above Threshold",
      description: "PM2.5 concentration has exceeded the configured limit.",
      station: "Hadapsar Monitoring Station",
      parameter: "PM2.5",
      value: "72 µg/m³",
      severity: "Warning",
      time: "25 minutes ago",
      type: "pollution",
      status: "Active",
    },
    {
      id: "ALT-004",
      title: "Low Battery Warning",
      description: "Station battery level is below the configured threshold.",
      station: "Kharadi Monitoring Station",
      parameter: "Battery",
      value: "18%",
      severity: "Warning",
      time: "42 minutes ago",
      type: "battery",
      status: "Active",
    },
    {
      id: "ALT-005",
      title: "Sensor Calibration Due",
      description: "Scheduled calibration is due for the PM10 sensor.",
      station: "Kothrud Monitoring Station",
      parameter: "PM10 Sensor",
      value: "Due",
      severity: "Info",
      time: "2 hours ago",
      type: "maintenance",
      status: "Active",
    },
  ];

  const activeAlerts = alerts.filter(
    (alert) => alert.status === "Active"
  ).length;

  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === "Critical"
  ).length;

  const warningAlerts = alerts.filter(
    (alert) => alert.severity === "Warning"
  ).length;

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-600";

      case "Warning":
        return "bg-orange-100 text-orange-600";

      case "Info":
        return "bg-blue-100 text-blue-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "air":
        return <Activity size={20} />;

      case "offline":
        return <WifiOff size={20} />;

      case "pollution":
        return <AlertTriangle size={20} />;

      case "battery":
        return <BatteryWarning size={20} />;

      case "maintenance":
        return <Wrench size={20} />;

      default:
        return <Bell size={20} />;
    }
  };

  const getIconStyle = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-50 text-red-500";

      case "Warning":
        return "bg-orange-50 text-orange-500";

      case "Info":
        return "bg-blue-50 text-blue-500";

      default:
        return "bg-gray-50 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="p-8">

        {/* Page Header */}
        <div className="mb-7">

          <h1 className="text-3xl font-bold text-gray-900">
            Alerts
          </h1>

          <p className="text-gray-500 mt-2">
            Monitor and manage air-quality and station alerts across Pune.
          </p>

        </div>


        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          {/* Active Alerts */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Active Alerts
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {activeAlerts}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Require attention
                </p>

              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell size={22} />
              </div>

            </div>

          </div>


          {/* Critical */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Critical Alerts
                </p>

                <p className="text-3xl font-bold text-red-500 mt-3">
                  {criticalAlerts}
                </p>

                <p className="text-sm text-red-500 mt-2">
                  Immediate attention required
                </p>

              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>

            </div>

          </div>


          {/* Warning */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Warning Alerts
                </p>

                <p className="text-3xl font-bold text-orange-500 mt-3">
                  {warningAlerts}
                </p>

                <p className="text-sm text-orange-500 mt-2">
                  Monitoring required
                </p>

              </div>

              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Clock size={22} />
              </div>

            </div>

          </div>

        </div>


        {/* Alerts List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="p-6 border-b border-gray-100">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Active Alerts
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Current air-quality and monitoring system warnings.
                </p>

              </div>

              <span className="text-sm text-gray-500">
                {activeAlerts} alerts
              </span>

            </div>

          </div>


          {/* Alert Items */}
          <div>

            {alerts.map((alert) => (

              <div
                key={alert.id}
                className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition"
              >

                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getIconStyle(
                      alert.severity
                    )}`}
                  >
                    {getIcon(alert.type)}
                  </div>


                  {/* Main Content */}
                  <div className="flex-1 min-w-0">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                      <div>

                        <div className="flex items-center gap-3">

                          <h3 className="font-semibold text-gray-900">
                            {alert.title}
                          </h3>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityStyle(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>

                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                          {alert.description}
                        </p>

                      </div>


                      {/* Status */}
                      <span className="flex items-center gap-2 text-sm text-red-500 font-medium">

                        <span className="w-2 h-2 rounded-full bg-red-500"></span>

                        {alert.status}

                      </span>

                    </div>


                    {/* Details */}
                    <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm">

                      <div>
                        <span className="text-gray-400">
                          Station:
                        </span>{" "}
                        <span className="text-gray-700 font-medium">
                          {alert.station}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400">
                          Parameter:
                        </span>{" "}
                        <span className="text-gray-700 font-medium">
                          {alert.parameter}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400">
                          Value:
                        </span>{" "}
                        <span className="text-gray-700 font-medium">
                          {alert.value}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400">
                          {alert.time}
                        </span>
                      </div>

                    </div>


                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-5">

                      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                        Acknowledge
                      </button>

                      <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                        View Details
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* Alert Information */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">

          <div className="flex items-start gap-3">

            <CheckCircle
              size={20}
              className="text-blue-600 mt-0.5 shrink-0"
            />

            <div>

              <h3 className="font-semibold text-blue-900">
                Alert Monitoring
              </h3>

              <p className="text-sm text-blue-700 mt-1">
                Alerts are generated when air-quality thresholds,
                station connectivity, sensor health, battery,
                calibration or maintenance conditions require attention.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Alerts;