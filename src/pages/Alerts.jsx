import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
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
  ShieldAlert,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Alerts() {
  const navigate = useNavigate();

  // State
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [acknowledgingId, setAcknowledgingId] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:5000/api/alerts");
      setAlerts(response.data.alerts || response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError(err.response?.data?.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Acknowledge Alert Handler
  const handleAcknowledge = async (alertId) => {
    try {
      setAcknowledgingId(alertId);
      await axios.patch(`http://localhost:5000/api/alerts/${alertId}/acknowledge`);

      // Update local state immediately
      setAlerts((prev) =>
        prev.map((alert) =>
          (alert.alert_id === alertId || alert.id === alertId)
            ? { ...alert, acknowledgement: "Acknowledged", status: "Acknowledged", acknowledged_at: new Date().toISOString() }
            : alert
        )
      );

      if (selectedAlert && (selectedAlert.alert_id === alertId || selectedAlert.id === alertId)) {
        setSelectedAlert((prev) => ({
          ...prev,
          acknowledgement: "Acknowledged",
          status: "Acknowledged",
          acknowledged_at: new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Acknowledge error:", err);
      setError(err.response?.data?.message || "Failed to acknowledge alert.");
    } finally {
      setAcknowledgingId(null);
    }
  };

  // Helper mappings
  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "info":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getIcon = (parameter) => {
    switch (parameter?.toLowerCase()) {
      case "aqi":
        return <Activity size={18} className="text-rose-600" />;
      case "connectivity":
        return <WifiOff size={18} className="text-rose-600" />;
      case "pm2.5":
      case "pm10":
        return <AlertTriangle size={18} className="text-amber-600" />;
      case "battery":
        return <BatteryWarning size={18} className="text-amber-600" />;
      case "pm10 sensor":
      case "maintenance":
        return <Wrench size={18} className="text-blue-600" />;
      default:
        return <Bell size={18} className="text-slate-600" />;
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return "";
    const alertTime = new Date(date);
    const difference = Math.floor((new Date() - alertTime) / 1000);
    if (difference < 60) return "Just now";
    const minutes = Math.floor(difference / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Filtered List
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const p = alert.parameter?.toLowerCase() || "";
      const isAir = p === "aqi" || p.includes("pm");
      const isHardware = p === "connectivity" || p === "battery";
      const isMaintenance = p.includes("sensor") || p.includes("calib");

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "air" && isAir) ||
        (activeTab === "hardware" && isHardware) ||
        (activeTab === "maintenance" && isMaintenance);

      const matchesSeverity =
        severityFilter === "all" || alert.severity?.toLowerCase() === severityFilter.toLowerCase();

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        alert.parameter?.toLowerCase().includes(searchLower) ||
        alert.station?.name?.toLowerCase().includes(searchLower) ||
        (alert.alert_id || alert.id || "").toLowerCase().includes(searchLower);

      return matchesTab && matchesSeverity && matchesSearch;
    });
  }, [alerts, activeTab, severityFilter, searchTerm]);

  // Counts
  const activeCount = alerts.filter((a) => !a.acknowledgement && a.status !== "Acknowledged").length;
  const criticalCount = alerts.filter((a) => !a.acknowledgement && a.severity?.toLowerCase() === "critical").length;
  const warningCount = alerts.filter((a) => !a.acknowledgement && a.severity?.toLowerCase() === "warning").length;

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
              Real-time threshold breaches, device telemetry timeouts, and sensor calibration alerts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAlerts}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : "text-slate-500"} />
              Refresh Feed
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-3 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold text-rose-800">×</button>
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unresolved Alerts</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{activeCount}</p>
                <p className="text-xs text-slate-500 mt-1">Pending officer action</p>
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
                <p className="text-xs text-rose-600/80 font-medium mt-1">Severe AQI or station timeout</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Warning & Hardware</p>
                <p className="text-3xl font-black text-amber-600 mt-2">{warningCount}</p>
                <p className="text-xs text-amber-700/80 font-medium mt-1">Low battery or sensor drift</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
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

        {/* Alert Feed Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Showing {filteredAlerts.length} registered events</span>
            <span>Live Audit Trail</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={18} />
              Loading real-time alerts from backend...
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAlerts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No active alerts matching the selected filter criteria.
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const alertId = alert.alert_id || alert.id;
                  const isAcknowledged = alert.acknowledgement === "Acknowledged" || alert.status === "Acknowledged";
                  return (
                    <div
                      key={alertId}
                      className={`p-5 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isAcknowledged ? "bg-slate-50/40 opacity-75" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 bg-slate-100 rounded-xl shrink-0 mt-0.5">
                          {getIcon(alert.parameter)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-400">{alertId}</span>
                            <h3 className="font-bold text-slate-900 text-sm">{alert.parameter} Alert</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityStyle(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            {!isAcknowledged ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Check size={11} /> Acknowledged
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-1">{alert.threshold_rule || "Threshold limit exceeded."}</p>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs text-slate-500">
                            <span>Station: <strong className="text-slate-700">{alert.station?.name || alert.station || "PMC Node"}</strong></span>
                            <span>Measured: <strong className="text-rose-600 font-mono">{alert.actual_value}</strong></span>
                            <span>Rule: <span className="text-slate-400 font-mono">{alert.threshold_rule || "-"}</span></span>
                            <span className="text-slate-400">⏱ {getTimeAgo(alert.started_time || alert.time)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => handleAcknowledge(alertId)}
                          disabled={isAcknowledged || acknowledgingId === alertId}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition ${
                            isAcknowledged
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
                              : "bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm"
                          }`}
                        >
                          {acknowledgingId === alertId ? "Saving..." : isAcknowledged ? "Acknowledged ✓" : "Acknowledge"}
                        </button>

                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Regulatory Guideline Note */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <strong>CPCB Protocol Alert Escalation:</strong> Automated notifications are dispatched to ward field officers when PM2.5 exceeds 120 µg/m³ (24h standard) or CAAQM station connectivity fails for more than 3 consecutive transmission intervals.
          </div>
        </div>

      </main>

      {/* Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelectedAlert(null)}>
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Alert Diagnostics: {selectedAlert.alert_id || selectedAlert.id}</h3>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400">Station</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedAlert.station?.name || selectedAlert.station}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400">Parameter</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedAlert.parameter}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400">Actual Value</span>
                <p className="font-bold text-rose-600 mt-0.5">{selectedAlert.actual_value}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400">Rule Threshold</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedAlert.threshold_rule || "-"}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedAlert(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}