import { useEffect, useState } from "react";
import axios from "axios";

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

  // =========================
  // STATE
  // =========================

  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedAlert, setSelectedAlert] = useState(null);

  const [acknowledgingId, setAcknowledgingId] = useState(null);


  // =========================
  // FETCH ALERTS
  // =========================

  useEffect(() => {

    const fetchAlerts = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:5000/api/alerts"
        );

        console.log(
          "Alerts API response:",
          response.data
        );

        setAlerts(
          response.data.alerts || []
        );

      } catch (error) {

        console.error(
          "Failed to fetch alerts:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Failed to load alerts."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchAlerts();

  }, []);


  // =========================
  // ACKNOWLEDGE ALERT
  // =========================

  const handleAcknowledge = async (alertId) => {

    try {

      setAcknowledgingId(alertId);

      const response = await axios.patch(
        `http://localhost:5000/api/alerts/${alertId}/acknowledge`
      );

      console.log(
        "Acknowledge response:",
        response.data
      );


      // Update alert in UI
      setAlerts((previousAlerts) =>
        previousAlerts.map((alert) =>
          alert.alert_id === alertId
            ? {
                ...alert,
                acknowledgement: "Acknowledged",
                acknowledged_at:
                  new Date().toISOString(),
              }
            : alert
        )
      );


      // If details modal is open for same alert,
      // update it also
      if (
        selectedAlert &&
        selectedAlert.alert_id === alertId
      ) {

        setSelectedAlert((previousAlert) => ({
          ...previousAlert,
          acknowledgement: "Acknowledged",
          acknowledged_at:
            new Date().toISOString(),
        }));

      }

    } catch (error) {

      console.error(
        "Acknowledge error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to acknowledge alert."
      );

    } finally {

      setAcknowledgingId(null);

    }

  };


  // =========================
  // VIEW DETAILS
  // =========================

  const handleViewDetails = async (alertId) => {

    try {

      const response = await axios.get(
        `http://localhost:5000/api/alerts/${alertId}`
      );

      console.log(
        "Alert details:",
        response.data
      );

      setSelectedAlert(
        response.data.alert
      );

    } catch (error) {

      console.error(
        "View details error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load alert details."
      );

    }

  };


  // =========================
  // COUNTS
  // =========================

  const activeAlerts = alerts.filter(
    (alert) => !alert.acknowledgement
  ).length;


  const criticalAlerts = alerts.filter(
    (alert) =>
      !alert.acknowledgement &&
      alert.severity?.toLowerCase() === "critical"
  ).length;


  const warningAlerts = alerts.filter(
    (alert) =>
      !alert.acknowledgement &&
      alert.severity?.toLowerCase() === "warning"
  ).length;


  // =========================
  // SEVERITY STYLE
  // =========================

  const getSeverityStyle = (severity) => {

    switch (severity?.toLowerCase()) {

      case "critical":
        return "bg-red-100 text-red-600";

      case "warning":
        return "bg-orange-100 text-orange-600";

      case "info":
        return "bg-blue-100 text-blue-600";

      default:
        return "bg-gray-100 text-gray-600";

    }

  };


  // =========================
  // ICON
  // =========================

  const getIcon = (parameter) => {

    switch (parameter?.toLowerCase()) {

      case "aqi":
        return <Activity size={20} />;

      case "pm2.5":
        return <AlertTriangle size={20} />;

      case "pm10":
        return <AlertTriangle size={20} />;

      case "connectivity":
        return <WifiOff size={20} />;

      case "battery":
        return <BatteryWarning size={20} />;

      case "pm10 sensor":
        return <Wrench size={20} />;

      default:
        return <Bell size={20} />;

    }

  };


  // =========================
  // ICON STYLE
  // =========================

  const getIconStyle = (severity) => {

    switch (severity?.toLowerCase()) {

      case "critical":
        return "bg-red-50 text-red-500";

      case "warning":
        return "bg-orange-50 text-orange-500";

      case "info":
        return "bg-blue-50 text-blue-500";

      default:
        return "bg-gray-50 text-gray-500";

    }

  };


  // =========================
  // ALERT TITLE
  // =========================

  const getAlertTitle = (alert) => {

    if (alert.parameter === "AQI") {
      return "High AQI Detected";
    }

    if (alert.parameter === "PM2.5") {
      return "PM2.5 Above Threshold";
    }

    if (alert.parameter === "PM10") {
      return "PM10 Above Threshold";
    }

    if (alert.parameter === "Connectivity") {
      return "Station Offline";
    }

    if (alert.parameter === "Battery") {
      return "Low Battery Warning";
    }

    if (alert.parameter === "PM10 Sensor") {
      return "Sensor Calibration Due";
    }

    return `${alert.parameter} Alert`;

  };


  // =========================
  // ALERT DESCRIPTION
  // =========================

  const getAlertDescription = (alert) => {

    if (alert.parameter === "AQI") {
      return "Air quality has reached the Poor category.";
    }

    if (alert.parameter === "PM2.5") {
      return "PM2.5 concentration has exceeded the configured limit.";
    }

    if (alert.parameter === "PM10") {
      return "PM10 concentration has exceeded the configured limit.";
    }

    if (alert.parameter === "Connectivity") {
      return "No data has been received from the monitoring station.";
    }

    if (alert.parameter === "Battery") {
      return "Station battery level is below the configured threshold.";
    }

    if (alert.parameter === "PM10 Sensor") {
      return "Scheduled calibration is due for the PM10 sensor.";
    }

    return (
      alert.threshold_rule ||
      "Alert requires attention."
    );

  };


  // =========================
  // TIME FORMAT
  // =========================

  const getTimeAgo = (date) => {

    if (!date) {
      return "";
    }

    const alertTime = new Date(date);

    const now = new Date();

    const difference = Math.floor(
      (now - alertTime) / 1000
    );


    if (difference < 60) {
      return "Just now";
    }


    const minutes = Math.floor(
      difference / 60
    );


    if (minutes < 60) {

      return `${minutes} minute${
        minutes !== 1 ? "s" : ""
      } ago`;

    }


    const hours = Math.floor(
      minutes / 60
    );


    if (hours < 24) {

      return `${hours} hour${
        hours !== 1 ? "s" : ""
      } ago`;

    }


    const days = Math.floor(
      hours / 24
    );

    return `${days} day${
      days !== 1 ? "s" : ""
    } ago`;

  };


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div className="min-h-screen bg-gray-50">

        <main className="p-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Alerts
          </h1>

          <p className="text-gray-500 mt-2">
            Loading alerts...
          </p>

        </main>

      </div>

    );

  }


  // =========================
  // MAIN UI
  // =========================

  return (

    <div className="min-h-screen bg-gray-50">

      <main className="p-8">


        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="mb-7">

          <h1 className="text-3xl font-bold text-gray-900">
            Alerts
          </h1>

          <p className="text-gray-500 mt-2">
            Monitor and manage air-quality and station alerts across Pune.
          </p>

        </div>


        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 flex items-center justify-between">

            <span>
              {error}
            </span>

            <button
              onClick={() => setError("")}
              className="text-red-500 font-bold"
            >
              ×
            </button>

          </div>

        )}


        {/* =========================
            SUMMARY CARDS
        ========================= */}

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


          {/* Critical Alerts */}

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


          {/* Warning Alerts */}

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


        {/* =========================
            ALERT LIST
        ========================= */}

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

            {alerts.length === 0 ? (

              <div className="p-10 text-center">

                <CheckCircle
                  size={40}
                  className="mx-auto text-green-500"
                />

                <p className="text-gray-600 mt-3">
                  No alerts available.
                </p>

              </div>

            ) : (

              alerts.map((alert) => (

                <div
                  key={alert.alert_id}
                  className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition"
                >

                  <div className="flex items-start gap-4">


                    {/* Alert Icon */}

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getIconStyle(
                        alert.severity
                      )}`}
                    >

                      {getIcon(
                        alert.parameter
                      )}

                    </div>


                    {/* Alert Content */}

                    <div className="flex-1 min-w-0">


                      {/* Title + Status */}

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                        <div>

                          <div className="flex items-center gap-3 flex-wrap">

                            <h3 className="font-semibold text-gray-900">
                              {getAlertTitle(alert)}
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
                            {getAlertDescription(alert)}
                          </p>

                        </div>


                        {/* Status */}

                        <span
                          className={`flex items-center gap-2 text-sm font-medium ${
                            alert.acknowledgement
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >

                          <span
                            className={`w-2 h-2 rounded-full ${
                              alert.acknowledgement
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></span>

                          {alert.acknowledgement
                            ? "Acknowledged"
                            : "Active"}

                        </span>

                      </div>


                      {/* Details */}

                      <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm">


                        {/* Station */}

                        <div>

                          <span className="text-gray-400">
                            Station:
                          </span>{" "}

                          <span className="text-gray-700 font-medium">

                            {alert.station?.name ||
                              "Unknown Station"}

                          </span>

                        </div>


                        {/* Parameter */}

                        <div>

                          <span className="text-gray-400">
                            Parameter:
                          </span>{" "}

                          <span className="text-gray-700 font-medium">
                            {alert.parameter}
                          </span>

                        </div>


                        {/* Value */}

                        <div>

                          <span className="text-gray-400">
                            Value:
                          </span>{" "}

                          <span className="text-gray-700 font-medium">
                            {alert.actual_value}
                          </span>

                        </div>


                        {/* Time */}

                        <div>

                          <span className="text-gray-400">
                            {getTimeAgo(
                              alert.started_time
                            )}
                          </span>

                        </div>

                      </div>


                      {/* =========================
                          ACTION BUTTONS
                      ========================= */}

                      <div className="flex items-center gap-3 mt-5">


                        {/* Acknowledge */}

                        <button
                          onClick={() =>
                            handleAcknowledge(
                              alert.alert_id
                            )
                          }
                          disabled={
                            !!alert.acknowledgement ||
                            acknowledgingId ===
                              alert.alert_id
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            alert.acknowledgement
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >

                          {acknowledgingId ===
                          alert.alert_id
                            ? "Acknowledging..."
                            : alert.acknowledgement
                            ? "Acknowledged ✓"
                            : "Acknowledge"}

                        </button>


                        {/* View Details */}

                        <button
                          onClick={() =>
                            handleViewDetails(
                              alert.alert_id
                            )
                          }
                          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                        >

                          View Details

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>


        {/* =========================
            INFORMATION
        ========================= */}

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


      {/* =====================================================
          VIEW DETAILS MODAL
      ===================================================== */}

      {selectedAlert && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() =>
            setSelectedAlert(null)
          }
        >

          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* Modal Header */}

            <div className="p-6 border-b border-gray-100 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Alert Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Complete information about this alert
                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedAlert(null)
                }
                className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500 text-2xl flex items-center justify-center"
              >
                ×
              </button>

            </div>


            {/* Modal Content */}

            <div className="p-6 space-y-5">


              {/* Alert Title */}

              <div>

                <p className="text-sm text-gray-400">
                  Alert
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-1">
                  {getAlertTitle(
                    selectedAlert
                  )}
                </h3>

              </div>


              {/* Severity + Status */}

              <div className="flex gap-3 flex-wrap">

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityStyle(
                    selectedAlert.severity
                  )}`}
                >
                  {selectedAlert.severity}
                </span>


                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedAlert.acknowledgement
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >

                  {selectedAlert.acknowledgement
                    ? "Acknowledged"
                    : "Active"}

                </span>

              </div>


              {/* Details Grid */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                {/* Alert ID */}

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-xs text-gray-400">
                    Alert ID
                  </p>

                  <p className="font-medium text-gray-900 mt-1">
                    {selectedAlert.alert_id}
                  </p>

                </div>


                {/* Station */}

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-xs text-gray-400">
                    Station
                  </p>

                  <p className="font-medium text-gray-900 mt-1">
                    {selectedAlert.station?.name ||
                      "Unknown Station"}
                  </p>

                </div>


                {/* Parameter */}

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-xs text-gray-400">
                    Parameter
                  </p>

                  <p className="font-medium text-gray-900 mt-1">
                    {selectedAlert.parameter}
                  </p>

                </div>


                {/* Actual Value */}

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-xs text-gray-400">
                    Actual Value
                  </p>

                  <p className="font-medium text-gray-900 mt-1">
                    {selectedAlert.actual_value}
                  </p>

                </div>


                {/* Threshold */}

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-xs text-gray-400">
                    Threshold Rule
                  </p>

                  <p className="font-medium text-gray-900 mt-1">
                    {selectedAlert.threshold_rule ||
                      "-"}
                  </p>

                </div>


                {/* Started Time */}

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-xs text-gray-400">
                    Started Time
                  </p>

                  <p className="font-medium text-gray-900 mt-1">
                    {selectedAlert.started_time
                      ? new Date(
                          selectedAlert.started_time
                        ).toLocaleString()
                      : "-"}
                  </p>

                </div>


                {/* Acknowledgement */}

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-xs text-gray-400">
                    Acknowledgement
                  </p>

                  <p className="font-medium text-gray-900 mt-1">
                    {selectedAlert.acknowledgement ||
                      "Not acknowledged"}
                  </p>

                </div>


                {/* Acknowledged At */}

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-xs text-gray-400">
                    Acknowledged At
                  </p>

                  <p className="font-medium text-gray-900 mt-1">

                    {selectedAlert.acknowledged_at
                      ? new Date(
                          selectedAlert.acknowledged_at
                        ).toLocaleString()
                      : "-"}

                  </p>

                </div>

              </div>


              {/* Station Information */}

              {selectedAlert.station && (

                <div className="border-t border-gray-100 pt-5">

                  <h3 className="font-semibold text-gray-900 mb-3">
                    Station Information
                  </h3>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">


                    <div>

                      <span className="text-gray-400">
                        Ward:
                      </span>{" "}

                      <span className="text-gray-700">
                        {selectedAlert.station.ward ||
                          "-"}
                      </span>

                    </div>


                    <div>

                      <span className="text-gray-400">
                        Zone:
                      </span>{" "}

                      <span className="text-gray-700">
                        {selectedAlert.station.zone ||
                          "-"}
                      </span>

                    </div>


                    <div>

                      <span className="text-gray-400">
                        Latitude:
                      </span>{" "}

                      <span className="text-gray-700">
                        {selectedAlert.station.latitude ||
                          "-"}
                      </span>

                    </div>


                    <div>

                      <span className="text-gray-400">
                        Longitude:
                      </span>{" "}

                      <span className="text-gray-700">
                        {selectedAlert.station.longitude ||
                          "-"}
                      </span>

                    </div>


                    <div>

                      <span className="text-gray-400">
                        Station Type:
                      </span>{" "}

                      <span className="text-gray-700">
                        {selectedAlert.station.station_type ||
                          "-"}
                      </span>

                    </div>


                    <div>

                      <span className="text-gray-400">
                        Station Status:
                      </span>{" "}

                      <span className="text-gray-700">
                        {selectedAlert.station.status ||
                          "-"}
                      </span>

                    </div>

                  </div>

                </div>

              )}

            </div>


            {/* Modal Footer */}

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">


              {/* Acknowledge inside modal */}

              {!selectedAlert.acknowledgement && (

                <button
                  onClick={() =>
                    handleAcknowledge(
                      selectedAlert.alert_id
                    )
                  }
                  disabled={
                    acknowledgingId ===
                    selectedAlert.alert_id
                  }
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300"
                >

                  {acknowledgingId ===
                  selectedAlert.alert_id
                    ? "Acknowledging..."
                    : "Acknowledge"}

                </button>

              )}


              <button
                onClick={() =>
                  setSelectedAlert(null)
                }
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default Alerts;