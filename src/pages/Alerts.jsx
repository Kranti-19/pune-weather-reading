import React, { useState } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Radio,
  BatteryCharging,
  Cpu,
  ShieldAlert,
  ArrowUpRight,
  Check,
  Building2,
  ExternalLink
} from "lucide-react";

export default function Alerts() {
  const [filterType, setFilterType] = useState("All Events");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Seeded with active CPCB and hardware incidents matching sidebar count
  const [alerts, setAlerts] = useState([
    {
      id: "ALT-2026-081",
      station: "Hadapsar Industrial (Ward 15)",
      project: "Amanora Gateway Towers Site",
      category: "Air Quality / AQI",
      parameter: "PM2.5 Severe Boundary Breach",
      actualValue: "138 µg/m³",
      threshold: "60 µg/m³ (NAAQS 24h limit)",
      severity: "Critical",
      timestamp: "12m ago",
      status: "Unresolved",
      source: "Laser Dust Sensor (SDS-011)",
      suggestedAction: "Enforce dust screen netting & anti-smog gun deployment"
    },
    {
      id: "ALT-2026-082",
      station: "Shivajinagar Central (Ward 7)",
      project: "Pune Metro Line 3 Pier Works",
      category: "Air Quality / AQI",
      parameter: "NO2 Traffic Combustion Spike",
      actualValue: "88 µg/m³",
      threshold: "80 µg/m³ (CPCB limit)",
      severity: "Warning",
      timestamp: "34m ago",
      status: "Unresolved",
      source: "Chemiluminescence NOX Analyzer",
      suggestedAction: "Notify traffic police ward for signal bottleneck release"
    },
    {
      id: "ALT-2026-079",
      station: "Kothrud Depot (Ward 10)",
      project: "Municipal Bus Depot Node",
      category: "Device & Battery",
      parameter: "Gateway Mains Power Loss",
      actualValue: "Operating on Backup Battery (78%)",
      threshold: "Mains 230V AC Disconnected",
      severity: "Warning",
      timestamp: "1h 15m ago",
      status: "Investigating",
      source: "MSEDCL Feeder Grid / IoT UPS",
      suggestedAction: "Dispatch depot electrical technician to verify breaker switch"
    },
    {
      id: "ALT-2026-075",
      station: "Katraj Lake Basin (Ward 21)",
      project: "Environmental Reserve CAAQM",
      category: "Maintenance",
      parameter: "Zero/Span Calibration Drift Warning",
      actualValue: "Span Error +4.2%",
      threshold: "± 2.0% CPCB Tolerance",
      severity: "Info",
      timestamp: "3h ago",
      status: "Acknowledged",
      source: "Optical Bench Module",
      suggestedAction: "Routine zero-air cycle scheduled for midnight tonight"
    }
  ]);

  const handleAcknowledge = (id) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === "Acknowledged" ? "Resolved" : "Acknowledged"
            }
          : a
      )
    );
  };

  const filteredAlerts = alerts.filter((item) => {
    const matchesCategory =
      filterType === "All Events" || item.category === filterType;
    const matchesSeverity =
      severityFilter === "All" || item.severity === severityFilter;
    const matchesSearch =
      item.station.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.parameter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.project.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  const unresolvedCount = alerts.filter((a) => a.status === "Unresolved").length;
  const criticalCount = alerts.filter(
    (a) => a.severity === "Critical" && a.status !== "Resolved"
  ).length;
  const warningCount = alerts.filter(
    (a) =>
      (a.severity === "Warning" || a.category === "Device & Battery") &&
      a.status !== "Resolved"
  ).length;

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Operational Surveillance</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">CPCB Section 10 Protocol</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Alerts & Incident Management
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              {unresolvedCount} Actions Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time CPCB threshold breaches, device telemetry timeouts, and ward field escalations.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition"
        >
          <RefreshCw size={13} />
          <span>Refresh Incident Stream</span>
        </button>
      </div>

      {/* 2. Three Metric KPI Cards (Accurately reflecting live numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
        
        {/* Unresolved Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pending Officer Actions
            </span>
            <div className="text-4xl font-black text-slate-900 mt-1">
              {unresolvedCount}
            </div>
            <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
              Requires supervisor sign-off
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-inner">
            <ShieldAlert size={24} />
          </div>
        </div>

        {/* Critical Breaches */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Critical NAAQS Breaches
            </span>
            <div className="text-4xl font-black text-rose-600 mt-1">
              {criticalCount}
            </div>
            <span className="text-[11px] text-rose-600 font-semibold mt-1 inline-block">
              Threshold &gt; 120 µg/m³ active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black shadow-inner">
            <AlertOctagon size={24} />
          </div>
        </div>

        {/* Warning & Hardware */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Warning & Hardware Health
            </span>
            <div className="text-4xl font-black text-amber-600 mt-1">
              {warningCount}
            </div>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
              Power grid & zero calibration
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shadow-inner">
            <AlertTriangle size={24} />
          </div>
        </div>

      </div>

      {/* 3. Control Filters and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["All Events", "Air Quality / AQI", "Device & Battery", "Maintenance"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Severity Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station, project, ID..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 w-52 sm:w-64 transition"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="Warning">Warning Only</option>
            <option value="Info">Info Only</option>
          </select>
        </div>

      </div>

      {/* 4. Interactive Incident Card Stack */}
      <div className="space-y-4 mb-7">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
          <span>SHOWING {filteredAlerts.length} ESCALATIONS</span>
          <span className="text-emerald-700">CPCB Automated Surveillance Engine Active</span>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <CheckCircle2 size={42} className="mx-auto text-emerald-500 mb-2" />
            <h3 className="text-base font-black text-slate-900">All Nodes Operating Under Thresholds</h3>
            <p className="text-xs text-slate-400 mt-1">No active escalations matching current criteria.</p>
          </div>
        ) : (
          filteredAlerts.map((incident) => {
            const isCritical = incident.severity === "Critical";
            const isWarning = incident.severity === "Warning";
            return (
              <div
                key={incident.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${
                  isCritical
                    ? "border-rose-300 ring-1 ring-rose-500/20"
                    : isWarning
                    ? "border-amber-300"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Column: Severity & Incident Context */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                        isCritical
                          ? "bg-rose-100 text-rose-700"
                          : isWarning
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {isCritical ? (
                        <AlertOctagon size={22} />
                      ) : isWarning ? (
                        <AlertTriangle size={22} />
                      ) : (
                        <Cpu size={22} />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isCritical
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isWarning
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {incident.severity}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          {incident.id}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <Building2 size={13} className="text-slate-400" />
                          {incident.project}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900">
                        {incident.parameter}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {incident.station} • Sensor: <span className="font-mono">{incident.source}</span>
                      </p>

                      {/* Plain-Language Field Directive */}
                      <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                        <strong className="text-slate-900 font-bold">Standard Action: </strong>
                        {incident.suggestedAction}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Values & Action Button */}
                  <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <div className="text-xl font-black text-slate-900">
                        {incident.actualValue}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Threshold: {incident.threshold}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mt-1 lg:justify-end">
                        <Clock size={12} />
                        <span>{incident.timestamp}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcknowledge(incident.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm ${
                        incident.status === "Acknowledged"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : incident.status === "Resolved"
                          ? "bg-slate-100 text-slate-400"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                      }`}
                    >
                      <Check size={14} />
                      <span>
                        {incident.status === "Acknowledged"
                          ? "Acknowledged (Mark Resolved)"
                          : incident.status === "Resolved"
                          ? "Resolved"
                          : "Acknowledge Incident"}
                      </span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. CPCB Protocol Note Footer */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-start gap-3">
        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900">CPCB Protocol Alert Escalation:</strong> Automated notifications are dispatched to municipal ward field officers when $PM_{2.5}$ exceeds 120 µg/m³ (24h standard) or CAAQM station connectivity fails for more than 3 consecutive transmission intervals.
        </p>
      </div>

    </div>
  );
}