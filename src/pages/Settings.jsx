import React, { useState, useEffect } from "react";
import {
  Bell,
  Activity,
  Database,
  Save,
  Sliders,
  ShieldCheck,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Lock,
  Layers
} from "lucide-react";

export default function Settings() {
  // =========================
  // AQI & REGULATORY SETTINGS
  // =========================
  const [aqiStandard, setAqiStandard] = useState("CPCB National AQI (NAAQS)");
  const [averagingPeriod, setAveragingPeriod] = useState("24-Hour Weighted Mean");
  const [monitoringArea, setMonitoringArea] = useState("Pune Municipal Corporation (PMC)");
  const [warningAQI, setWarningAQI] = useState(101);
  const [criticalAQI, setCriticalAQI] = useState(201);
  const [offlineTimeout, setOfflineTimeout] = useState(15);

  // =========================
  // QA/QC & TELEMETRY SETTINGS
  // =========================
  const [liveMonitoring, setLiveMonitoring] = useState(true);
  const [dataValidation, setDataValidation] = useState(true);
  const [deviceHealth, setDeviceHealth] = useState(true);
  const [zeroSpanAudit, setZeroSpanAudit] = useState(true);

  // =========================
  // NOTIFICATION SUITE
  // =========================
  const [notifications, setNotifications] = useState({
    "High AQI / NAAQS Exceedance": true,
    "Pollutant 24h Threshold Breach (PM2.5 / PM10)": true,
    "Station Telemetry Offline (>15 min)": true,
    "Sensor Fault / Optical Drift Flag": true,
    "Daily Zero/Span Calibration Due": true,
    "Hardware Mains Power Loss / Battery <20%": true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("pmcWeatherSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.aqiStandard) setAqiStandard(parsed.aqiStandard);
        if (parsed.averagingPeriod) setAveragingPeriod(parsed.averagingPeriod);
        if (parsed.monitoringArea) setMonitoringArea(parsed.monitoringArea);
        if (parsed.warningAQI) setWarningAQI(parsed.warningAQI);
        if (parsed.criticalAQI) setCriticalAQI(parsed.criticalAQI);
        if (parsed.offlineTimeout) setOfflineTimeout(parsed.offlineTimeout);
        if (parsed.liveMonitoring !== undefined) setLiveMonitoring(parsed.liveMonitoring);
        if (parsed.dataValidation !== undefined) setDataValidation(parsed.dataValidation);
        if (parsed.deviceHealth !== undefined) setDeviceHealth(parsed.deviceHealth);
        if (parsed.zeroSpanAudit !== undefined) setZeroSpanAudit(parsed.zeroSpanAudit);
        if (parsed.notifications) setNotifications(parsed.notifications);
      } catch (e) {
        console.error("Failed to parse settings cache", e);
      }
    }
  }, []);

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    const payload = {
      aqiStandard,
      averagingPeriod,
      monitoringArea,
      warningAQI,
      criticalAQI,
      offlineTimeout,
      liveMonitoring,
      dataValidation,
      deviceHealth,
      zeroSpanAudit,
      notifications,
    };

    localStorage.setItem("pmcWeatherSettings", JSON.stringify(payload));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header with Breadcrumb & Save Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>System Administration</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">Configuration Parameters</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Portal & Sensor Settings
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-0.5 rounded-full">
              <Lock size={12} />
              Admin Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage CPCB computation parameters, QA/QC quality flags, alert thresholds, and automated notification rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-xs animate-in fade-in duration-200">
              <CheckCircle2 size={14} />
              <span>Settings Synchronized</span>
            </span>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition"
          >
            <Save size={14} />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* 2. Main Grid Settings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): Calculation & QA/QC Parameters */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card A: AQI Processing Engine (Section 6) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black border border-blue-100">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  AQI Calculation Engine & Methodology
                </h2>
                <p className="text-xs text-slate-400">
                  Select national regulatory framework and mathematical aggregation window
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
                  Regulatory Standard
                </label>
                <select
                  value={aqiStandard}
                  onChange={(e) => setAqiStandard(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 cursor-pointer transition shadow-inner"
                >
                  <option>CPCB National AQI (NAAQS)</option>
                  <option>US EPA AQI Protocol</option>
                  <option>WHO Global Air Guidelines (2021)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
                  Averaging Window
                </label>
                <select
                  value={averagingPeriod}
                  onChange={(e) => setAveragingPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 cursor-pointer transition shadow-inner"
                >
                  <option>24-Hour Weighted Mean</option>
                  <option>1-Hour Instantaneous Peak</option>
                  <option>8-Hour Rolling Average (CO/O3)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
                  Primary Municipal Grid Boundary
                </label>
                <select
                  value={monitoringArea}
                  onChange={(e) => setMonitoringArea(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 cursor-pointer transition shadow-inner"
                >
                  <option>Pune Municipal Corporation (PMC)</option>
                  <option>Pimpri-Chinchwad Municipal Corporation (PCMC)</option>
                  <option>Pune Metropolitan Region Development Authority (PMRDA)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card B: Data Collection & QA/QC Quality Flags (Section 12) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Data Quality & Telemetry Validation
                </h2>
                <p className="text-xs text-slate-400">
                  Preserve raw observations and assign automated verification flags
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div>
                  <p className="text-xs font-bold text-slate-900">Continuous Ingestion (Live Stream)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Receive and parse 60-second telemetry packets from field gateways.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLiveMonitoring(!liveMonitoring)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    liveMonitoring ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      liveMonitoring ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div>
                  <p className="text-xs font-bold text-slate-900">Automated QA/QC Validation Flags</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tag suspect, out-of-range, and zero-drift packets without overwriting raw records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDataValidation(!dataValidation)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    dataValidation ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      dataValidation ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div>
                  <p className="text-xs font-bold text-slate-900">Zero & Span Drift Audit Protocol</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Automatically flag sensor readings as [Suspect-QA] when drift exceeds ±5%.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setZeroSpanAudit(!zeroSpanAudit)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    zeroSpanAudit ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      zeroSpanAudit ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (5 Cols): Alert Thresholds & Notification Rules */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card C: Alert Thresholds (Section 10) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black border border-amber-100">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Threshold & Timeout Triggers
                </h2>
                <p className="text-xs text-slate-400">
                  Trigger automatic warnings and officer escalations
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Warning AQI Threshold
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    {warningAQI} AQI
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={warningAQI}
                  onChange={(e) => setWarningAQI(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Triggers Moderate / Yellow Advisory</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Critical Emergency Threshold
                  </label>
                  <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    {criticalAQI} AQI
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="350"
                  value={criticalAQI}
                  onChange={(e) => setCriticalAQI(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Triggers Poor / Red Emergency Dispatch</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Station Offline Communication Timeout
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={offlineTimeout}
                    onChange={(e) => setOfflineTimeout(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-medium">Minutes</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">CPCB rule: &gt; 3 missed intervals triggers alert</p>
              </div>
            </div>
          </div>

          {/* Card D: Notification Dispatch Matrix */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black border border-indigo-100">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Notification Dispatch Matrix
                </h2>
                <p className="text-xs text-slate-400">
                  Active alerts sent to municipal response teams
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {Object.keys(notifications).map((item) => {
                const isEnabled = notifications[item];
                return (
                  <div
                    key={item}
                    onClick={() => handleNotificationChange(item)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-slate-800 pr-2">
                      {item}
                    </span>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer pointer-events-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Footer Regulatory Note */}
      <div className="mt-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-start gap-3">
        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900">Audit Trail Preservation:</strong> Configuration updates (averaging periods, threshold changes, and offline timeouts) are timestamped and signed with your authenticated PMC officer identity in accordance with CPCB ambient monitoring guidelines.
        </div>
      </div>

    </div>
  );
}