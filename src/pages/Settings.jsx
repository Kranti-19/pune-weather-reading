import React, { useState, useEffect } from "react";
import {
  Activity,
  Bell,
  Database,
  Save,
  CheckCircle2,
  Sliders,
  RotateCcw
} from "lucide-react";

export default function Settings() {
  // AQI Baseline Settings
  const [aqiStandard, setAqiStandard] = useState("CPCB National AQI");
  const [monitoringArea, setMonitoringArea] = useState("Pune Municipal Corporation");
  const [warningAQI, setWarningAQI] = useState(101);
  const [criticalAQI, setCriticalAQI] = useState(201);
  const [offlineTimeout, setOfflineTimeout] = useState(15);

  // Monitoring Pipeline Settings
  const [liveMonitoring, setLiveMonitoring] = useState(true);
  const [dataValidation, setDataValidation] = useState(true);
  const [deviceHealth, setDeviceHealth] = useState(true);

  // Notification Event Triggers
  const [notifications, setNotifications] = useState({
    "High AQI alerts": true,
    "Pollutant threshold alerts": true,
    "Station offline alerts": true,
    "Sensor fault alerts": true,
    "Calibration due alerts": true,
    "Maintenance due alerts": true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("pmcWeatherSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.aqiStandard) setAqiStandard(settings.aqiStandard);
        if (settings.monitoringArea) setMonitoringArea(settings.monitoringArea);
        if (settings.warningAQI !== undefined) setWarningAQI(settings.warningAQI);
        if (settings.criticalAQI !== undefined) setCriticalAQI(settings.criticalAQI);
        if (settings.offlineTimeout !== undefined) setOfflineTimeout(settings.offlineTimeout);
        if (settings.liveMonitoring !== undefined) setLiveMonitoring(settings.liveMonitoring);
        if (settings.dataValidation !== undefined) setDataValidation(settings.dataValidation);
        if (settings.deviceHealth !== undefined) setDeviceHealth(settings.deviceHealth);
        if (settings.notifications) setNotifications(settings.notifications);
      } catch (e) {
        console.error("Failed to parse saved settings:", e);
      }
    }
  }, []);

  const handleNotificationChange = (item) => {
    setNotifications((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

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

    localStorage.setItem("pmcWeatherSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetDefaults = () => {
    setAqiStandard("CPCB National AQI");
    setMonitoringArea("Pune Municipal Corporation");
    setWarningAQI(101);
    setCriticalAQI(201);
    setOfflineTimeout(15);
    setLiveMonitoring(true);
    setDataValidation(true);
    setDeviceHealth(true);
    setNotifications({
      "High AQI alerts": true,
      "Pollutant threshold alerts": true,
      "Station offline alerts": true,
      "Sensor fault alerts": true,
      "Calibration due alerts": true,
      "Maintenance due alerts": true,
    });
  };

  return (
    <div className="min-h-screen bg-[#edf3f8] text-slate-800 p-6 sm:p-8 lg:p-10 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header Section matching PuneAreas and Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <span>System Administration</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">Preferences & Protocol Config</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
              System Settings
            </h1>
            
          </div>
         
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition"
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saved && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs font-bold shadow-sm">
          <CheckCircle2 className="text-emerald-600" size={16} />
          <span>Settings saved and synchronized with local cache successfully.</span>
        </div>
      )}

      {/* 2. Settings Sections */}
      <div className="space-y-6">

        {/* Section 1: AQI Standard Configuration */}
        <div className="bg-white rounded-[26px] p-7 shadow-sm border border-slate-100/80">
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">AQI Standard & Regional Siting</h2>
              
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                AQI Computational Framework
              </label>
              <select
                value={aqiStandard}
                onChange={(e) => setAqiStandard(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
              >
                <option>CPCB National AQI (India - 24h Weighted)</option>
                <option>US EPA AQI (NowCast Algorithm)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                Default Municipal Jurisdiction
              </label>
              <select
                value={monitoringArea}
                onChange={(e) => setMonitoringArea(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
              >
                <option>Pune Municipal Corporation (PMC)</option>
                <option>Pimpri-Chinchwad Municipal Corporation (PCMC)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Alert Thresholds */}
        <div className="bg-white rounded-[26px] p-7 shadow-sm border border-slate-100/80">
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Incident & Alert Thresholds</h2>
              
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                Warning Threshold (AQI)
              </label>
              <input
                type="number"
                value={warningAQI}
                onChange={(e) => setWarningAQI(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
              />
              <span className="text-[11px] text-slate-400 block mt-1.5 pl-1">Default: 101 (Moderate)</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                Critical Threshold (AQI)
              </label>
              <input
                type="number"
                value={criticalAQI}
                onChange={(e) => setCriticalAQI(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
              />
              <span className="text-[11px] text-slate-400 block mt-1.5 pl-1">Default: 201 (Poor / Severe)</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                Offline Timeout (Minutes)
              </label>
              <input
                type="number"
                value={offlineTimeout}
                onChange={(e) => setOfflineTimeout(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
              />
              <span className="text-[11px] text-slate-400 block mt-1.5 pl-1">Flag station inactive if silent</span>
            </div>
          </div>
        </div>

        {/* Section 3: Telemetry & Quality Assurance Rules */}
        <div className="bg-white rounded-[26px] p-7 shadow-sm border border-slate-100/80">
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Telemetry Ingestion & Quality Control</h2>
              
            </div>
          </div>

          <div className="space-y-4 mt-6">
            
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Real-Time Ingestion Pipeline</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Continuously receive 60-second telemetry packets from field gateways.</p>
              </div>
              <button
                type="button"
                onClick={() => setLiveMonitoring(!liveMonitoring)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  liveMonitoring ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow-sm"></span>
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Data Quality & Anomaly Validation</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Automatically mark suspect, zero-drift, or out-of-range sensor readings.</p>
              </div>
              <button
                type="button"
                onClick={() => setDataValidation(!dataValidation)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  dataValidation ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow-sm"></span>
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Hardware & Gateway Health Telemetry</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Monitor power status, mains failover battery levels, and link signals.</p>
              </div>
              <button
                type="button"
                onClick={() => setDeviceHealth(!deviceHealth)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  deviceHealth ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow-sm"></span>
              </button>
            </div>

          </div>
        </div>

        {/* Section 4: Notification Event Triggers */}
        <div className="bg-white rounded-[26px] p-7 shadow-sm border border-slate-100/80">
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Active Alert Routing</h2>
              
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {Object.keys(notifications).map((key) => (
              <label
                key={key}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() => handleNotificationChange(key)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">{key}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 mt-8 pb-4">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
        >
          Cancel Changes
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition"
        >
          <Save size={14} />
          <span>Save Preferences</span>
        </button>
      </div>

    </div>
  );
}