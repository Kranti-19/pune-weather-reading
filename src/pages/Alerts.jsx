import React, { useState, useMemo } from "react";
import {
  Bell,
  AlertTriangle,
  WifiOff,
  Activity,
  BatteryWarning,
  Wrench,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  Search,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const INITIAL_ALERTS = [
  {
    id: "ALT-001",
    title: "High AQI Exceeded (Severe Threshold)",
    description: "Station AQI sub-index has crossed Poor/Severe emergency trigger limit.",
    stationId: "PMC-005",
    station: "Baner Monitoring Station",
    parameter: "AQI",
    actualValue: "214",
    threshold: "200 AQI",
    severity: "Critical",
    time: "10 mins ago",
    type: "air",
    status: "Active",
    acknowledgedBy: null,
  },
  {
    id: "ALT-002",
    title: "Station Telemetry Timeout (Offline)",
    description: "No heartbeat packet received from IoT gateway exceeding 15 min limit.",
    stationId: "PMC-005",
    station: "Baner Monitoring Station",
    parameter: "Connectivity",
    actualValue: "18 mins silent",
    threshold: "> 15 mins",
    severity: "Critical",
    type: "offline",
    time: "18 mins ago",
    status: "Active",
    acknowledgedBy: null,
  },
  {
    id: "ALT-003",
    title: "PM2.5 24h Threshold Exceeded",
    description: "PM2.5 concentration sustained higher than CPCB permissible standard limit.",
    stationId: "PMC-003",
    station: "Hadapsar Monitoring Station",
    parameter: "PM2.5",
    actualValue: "72 µg/m³",
    threshold: "60 µg/m³",
    severity: "Warning",
    type: "pollution",
    time: "25 mins ago",
    status: "Active",
    acknowledgedBy: null,
  },
  {
    id: "ALT-004",
    title: "Low Battery Telemetry Alert",
    description: "Internal backup battery voltage dropped below operational threshold.",
    stationId: "PMC-004",
    station: "Kharadi Monitoring Station",
    parameter: "Battery Voltage",
    actualValue: "18%",
    threshold: "< 20%",
    severity: "Warning",
    type: "battery",
    time: "42 mins ago",
    status: "Active",
    acknowledgedBy: null,
  },
  {
    id: "ALT-005",
    title: "Sensor Calibration Due",
    description: "Scheduled 90-day zero/span calibration required for particulate analyzer.",
    stationId: "PMC-001",
    station: "Kothrud Monitoring Station",
    parameter: "PM10 Sensor",
    actualValue: "Due (92 days)",
    threshold: "Every 90 days",
    severity: "Info",
    type: "maintenance",
    time: "2 hours ago",
    status: "Acknowledged",
    acknowledgedBy: "Officer Patil",
  },
];

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAcknowledge = (id) => {
    setAlerts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Active" ? "Acknowledged" : "Active",
              acknowledgedBy: item.status === "Active" ? "PMC Duty Officer" : null,
            }
          : item
      )
    );
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "air" && (alert.type === "air" || alert.type === "pollution")) ||
        (activeTab === "hardware" && (alert.type === "offline" || alert.type === "battery")) ||
        (activeTab === "maintenance" && alert.type === "maintenance");

      const matchesSeverity = severityFilter === "all" || alert.severity.toLowerCase() === severityFilter.toLowerCase();

      const matchesSearch =
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSeverity && matchesSearch;
    });
  }, [alerts, activeTab, severityFilter, searchTerm]);

  const activeCount = alerts.filter((a) => a.status === "Active").length;
  const criticalCount = alerts.filter((a) => a.severity === "Critical" && a.status === "Active").length;
  const warningCount = alerts.filter((a) => a.severity === "Warning" && a.status === "Active").length;

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "Warning":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Info":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "air":
        return <Activity size={18} className="text-rose-600" />;
      case "offline":
        return <WifiOff size={18} className="text-rose-600" />;
      case "pollution":
        return <AlertTriangle size={18} className="text-amber-600" />;
      case "battery":
        return <BatteryWarning size={18} className="text-amber-600" />;
      case "maintenance":
        return <Wrench size={18} className="text-blue-600" />;
      default:
        return <Bell size={18} className="text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Alerts & Incident Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Real-time threshold breaches, device faults, and calibration schedules.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600">
            <Clock size={14} className="text-slate-400" />
            Auto-refresh active (30s poll)
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unresolved Alerts</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{activeCount}</p>
                <p className="text-xs text-slate-500 mt-1">Pending officer acknowledgement</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Breaches</p>
                <p className="text-3xl font-black text-rose-600 mt-2">{criticalCount}</p>
                <p className="text-xs text-rose-600/80 font-medium mt-1">Severe AQI or station dropouts</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Warning & Maintenance</p>
                <p className="text-3xl font-black text-amber-600 mt-2">{warningCount}</p>
                <p className="text-xs text-amber-700/80 font-medium mt-1">Threshold warnings & battery low</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {[
              { id: "all", label: "All Events" },
              { id: "air", label: "Air Quality / AQI" },
              { id: "hardware", label: "Device & Battery" },
              { id: "maintenance", label: "Maintenance" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search station, parameter, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warning Only</option>
              <option value="info">Info Only</option>
            </select>
          </div>
        </div>

        {/* Alert Feed Table / Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Showing {filteredAlerts.length} incidents</span>
            <span>Audit Trail Enabled</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredAlerts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No alerts matching the selected filter criteria.
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    alert.status === "Acknowledged" ? "bg-slate-50/40 opacity-75" : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-slate-100 rounded-xl shrink-0 mt-0.5">
                      {getIcon(alert.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-400">{alert.id}</span>
                        <h3 className="font-bold text-slate-900 text-sm">{alert.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityStyle(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        {alert.status === "Active" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check size={11} /> Acknowledged ({alert.acknowledgedBy})
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1">{alert.description}</p>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs text-slate-500">
                        <span>Station: <strong className="text-slate-700">{alert.station}</strong></span>
                        <span>Parameter: <strong className="text-slate-700">{alert.parameter}</strong></span>
                        <span>Measured: <strong className="text-rose-600 font-mono">{alert.actualValue}</strong></span>
                        <span>Threshold: <span className="text-slate-400 font-mono">{alert.threshold}</span></span>
                        <span className="text-slate-400">⏱ {alert.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 ${
                        alert.status === "Active"
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {alert.status === "Active" ? "Acknowledge" : "Reopen Alert"}
                    </button>

                    <button
                      onClick={() => navigate(`/station/${alert.stationId.replace("PMC-", "")}`)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Inspect Station Diagnostics"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Regulatory Guideline Note */}
<div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
  <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
  <div className="text-xs text-blue-900 leading-relaxed">
    <strong>CPCB Protocol Alert Escalation:</strong> Automated notifications are dispatched to ward field officers when PM2.5 exceeds 120 µg/m³ (24h standard) or CAAQM station connectivity fails for more than 3 consecutive transmission intervals.
  </div>
</div>

      </main>
    </div>
  );
}