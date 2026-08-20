import { useState, useEffect } from "react";

import {
  Bell,
  Activity,
  Database,
  Save,
} from "lucide-react";

function Settings() {
  // =========================
  // AQI SETTINGS
  // =========================

  const [aqiStandard, setAqiStandard] = useState("CPCB National AQI");

  const [monitoringArea, setMonitoringArea] = useState(
    "Pune Municipal Corporation"
  );

  const [warningAQI, setWarningAQI] = useState(101);

  const [criticalAQI, setCriticalAQI] = useState(201);

  const [offlineTimeout, setOfflineTimeout] = useState(15);


  // =========================
  // MONITORING SETTINGS
  // =========================

  const [liveMonitoring, setLiveMonitoring] = useState(true);

  const [dataValidation, setDataValidation] = useState(true);

  const [deviceHealth, setDeviceHealth] = useState(true);


  // =========================
  // NOTIFICATION SETTINGS
  // =========================

  const [notifications, setNotifications] = useState({
    "High AQI alerts": true,
    "Pollutant threshold alerts": true,
    "Station offline alerts": true,
    "Sensor fault alerts": true,
    "Calibration due alerts": true,
    "Maintenance due alerts": true,
  });


  // =========================
  // SAVE MESSAGE
  // =========================

  const [saved, setSaved] = useState(false);


  // =========================
  // HANDLE NOTIFICATION
  // =========================

  useEffect(() => {
  const savedSettings = localStorage.getItem("pmcWeatherSettings");

  if (savedSettings) {
    const settings = JSON.parse(savedSettings);

    setAqiStandard(settings.aqiStandard);
    setMonitoringArea(settings.monitoringArea);

    setWarningAQI(settings.warningAQI);
    setCriticalAQI(settings.criticalAQI);
    setOfflineTimeout(settings.offlineTimeout);

    setLiveMonitoring(settings.liveMonitoring);
    setDataValidation(settings.dataValidation);
    setDeviceHealth(settings.deviceHealth);

    setNotifications(settings.notifications);
  }
}, []);

  const handleNotificationChange = (item) => {
    setNotifications((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };


  // =========================
  // SAVE SETTINGS
  // =========================

  const handleSave = () => {

    const settings = {
      aqiStandard,
      monitoringArea,
      warningAQI,
      criticalAQI,
      offlineTimeout,

      liveMonitoring,
      dataValidation,
      deviceHealth,

      notifications,
    };

    localStorage.setItem(
      "pmcWeatherSettings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };


  return (
    <div>

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="mb-7">

        <h1 className="text-3xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="text-gray-500 mt-2">
          Configure air-quality monitoring and system preferences.
        </p>

      </div>


      {/* =========================
          AQI CONFIGURATION
      ========================= */}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity size={22} />
          </div>

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              AQI Configuration
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Configure air quality index settings.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* AQI Standard */}

          <div>

            <label className="text-sm font-medium text-gray-700">
              AQI Standard
            </label>

            <select
              value={aqiStandard}
              onChange={(e) => setAqiStandard(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >

              <option>CPCB National AQI</option>

              <option>US EPA AQI</option>

            </select>

          </div>


          {/* Monitoring Area */}

          <div>

            <label className="text-sm font-medium text-gray-700">
              Default Monitoring Area
            </label>

            <select
              value={monitoringArea}
              onChange={(e) => setMonitoringArea(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >

              <option>Pune Municipal Corporation</option>

              <option>Pimpri-Chinchwad Municipal Corporation</option>

            </select>

          </div>

        </div>

      </div>


      {/* =========================
          ALERT THRESHOLDS
      ========================= */}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <Bell size={22} />
          </div>

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Alert Thresholds
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Configure air-quality alert levels.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Warning AQI */}

          <div>

            <label className="text-sm font-medium text-gray-700">
              Warning AQI
            </label>

            <input
              type="number"
              value={warningAQI}
              onChange={(e) => setWarningAQI(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* Critical AQI */}

          <div>

            <label className="text-sm font-medium text-gray-700">
              Critical AQI
            </label>

            <input
              type="number"
              value={criticalAQI}
              onChange={(e) => setCriticalAQI(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* Offline Timeout */}

          <div>

            <label className="text-sm font-medium text-gray-700">
              Station Offline Timeout
            </label>

            <input
              type="number"
              value={offlineTimeout}
              onChange={(e) => setOfflineTimeout(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            <p className="text-xs text-gray-400 mt-2">
              Minutes without communication
            </p>

          </div>

        </div>

      </div>


      {/* =========================
          MONITORING SETTINGS
      ========================= */}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Database size={22} />
          </div>

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Monitoring Settings
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Configure sensor data collection.
            </p>

          </div>

        </div>


        <div className="space-y-5">

          {/* Live Monitoring */}

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-900">
                Live Data Monitoring
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Receive and display the latest sensor readings.
              </p>

            </div>

            <input
              type="checkbox"
              checked={liveMonitoring}
              onChange={(e) => setLiveMonitoring(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />

          </div>


          {/* Data Validation */}

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-900">
                Data Quality Validation
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Flag missing, invalid or suspect sensor readings.
              </p>

            </div>

            <input
              type="checkbox"
              checked={dataValidation}
              onChange={(e) => setDataValidation(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />

          </div>


          {/* Device Health */}

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-900">
                Device Health Monitoring
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Monitor connectivity and sensor health.
              </p>

            </div>

            <input
              type="checkbox"
              checked={deviceHealth}
              onChange={(e) => setDeviceHealth(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />

          </div>

        </div>

      </div>


      {/* =========================
          NOTIFICATION SETTINGS
      ========================= */}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <Bell size={22} />
          </div>

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Notification Settings
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Choose which system events require notifications.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {Object.keys(notifications).map((item) => (

            <label
              key={item}
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 cursor-pointer"
            >

              <input
                type="checkbox"
                checked={notifications[item]}
                onChange={() => handleNotificationChange(item)}
                className="w-5 h-5 accent-blue-600"
              />

              <span className="text-sm text-gray-700">
                {item}
              </span>

            </label>

          ))}

        </div>

      </div>


      {/* =========================
          SAVE BUTTON
      ========================= */}

      <div className="flex items-center justify-end gap-4 pb-6">

        {saved && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Settings saved successfully
          </span>
        )}

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

    </div>
  );
}

export default Settings;