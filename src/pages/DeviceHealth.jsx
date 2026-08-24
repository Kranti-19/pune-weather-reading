import React, { useState } from "react";
import {
  Activity,
  Wifi,
  Battery,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  Cpu,
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2
} from "lucide-react";

export default function DeviceHealth() {
  const [activeTab, setActiveTab] = useState("gateways");
  const [searchTerm, setSearchTerm] = useState("");

  const gateways = [
    {
      device: "GW-KTH-001",
      station: "Kothrud Monitoring Station (PMC-001)",
      connectivity: "Online",
      protocol: "4G-LTE",
      signal: "-68 dBm",
      power: "Mains (Battery 98%)",
      firmware: "v2.4.1",
      sensorHealth: "Healthy (8/8)",
      lastCommunication: "Just now",
      status: "Healthy",
    },
    {
      device: "GW-HNJ-002",
      station: "Hinjewadi Monitoring Station (PMC-002)",
      connectivity: "Online",
      protocol: "Ethernet / Fiber",
      signal: "-52 dBm",
      power: "Solar + Battery (100%)",
      firmware: "v2.4.0",
      sensorHealth: "Healthy (8/8)",
      lastCommunication: "2 min ago",
      status: "Healthy",
    },
    {
      device: "GW-HDP-003",
      station: "Hadapsar Monitoring Station (PMC-003)",
      connectivity: "Online",
      protocol: "4G-LTE",
      signal: "-82 dBm",
      power: "Mains (Battery 92%)",
      firmware: "v2.4.1",
      sensorHealth: "Warning (PM2.5 Drift)",
      lastCommunication: "1 min ago",
      status: "Warning",
    },
    {
      device: "GW-KHR-004",
      station: "Kharadi Monitoring Station (PMC-004)",
      connectivity: "Online",
      protocol: "LoRaWAN",
      signal: "-95 dBm",
      power: "Low Battery (18%)",
      firmware: "v2.3.9",
      sensorHealth: "Healthy (8/8)",
      lastCommunication: "3 min ago",
      status: "Warning",
    },
    {
      device: "GW-BNR-005",
      station: "Baner Monitoring Station (PMC-005)",
      connectivity: "Offline",
      protocol: "4G-LTE",
      signal: "No Signal",
      power: "Battery (Critical 14%)",
      firmware: "v2.4.1",
      sensorHealth: "Fault (Particulate Line)",
      lastCommunication: "18 min ago",
      status: "Critical",
    },
  ];

  const sensorCalibrationLogs = [
    {
      sensorId: "SNS-PM25-101",
      station: "Kothrud (PMC-001)",
      parameter: "PM2.5 Optical Analyzer",
      model: "Laser Scattering v3",
      lastCal: "12 Jan 2026",
      nextCal: "12 Apr 2026",
      drift: "+1.2%",
      calStatus: "Valid",
    },
    {
      sensorId: "SNS-PM10-102",
      station: "Kothrud (PMC-001)",
      parameter: "PM10 Beta-Attenuation",
      model: "BAM-1020 Compatible",
      lastCal: "12 Jan 2026",
      nextCal: "12 Apr 2026",
      drift: "-0.8%",
      calStatus: "Valid",
    },
    {
      sensorId: "SNS-NO2-201",
      station: "Hadapsar (PMC-003)",
      parameter: "NO₂ Chemiluminescence",
      model: "Gas-Chemi-44",
      lastCal: "18 Nov 2025",
      nextCal: "18 Feb 2026",
      drift: "+6.4%",
      calStatus: "Calibration Due",
    },
    {
      sensorId: "SNS-SO2-305",
      station: "Baner (PMC-005)",
      parameter: "SO₂ UV Fluorescence",
      model: "UV-Spec-12",
      lastCal: "10 Nov 2025",
      nextCal: "10 Feb 2026",
      drift: "No Signal",
      calStatus: "Sensor Fault",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Healthy":
      case "Valid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Warning":
      case "Calibration Due":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-rose-50 text-rose-700 border border-rose-200";
    }
  };

  const healthyCount = gateways.filter((g) => g.status === "Healthy").length;
  const warningCount = gateways.filter((g) => g.status === "Warning").length;
  const criticalCount = gateways.filter((g) => g.status === "Critical").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Sensor & Hardware Telemetry Health
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Field IoT gateway connectivity, battery backup monitoring, and sensor calibration QA/QC.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs transition">
              <RefreshCw size={14} className="text-slate-500" />
              Force Gateway Ping
            </button>
          </div>
        </div>

        {/* Telemetry KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operational Nodes</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{healthyCount}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Gateways in optimal status</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Network Online</p>
                <p className="text-3xl font-extrabold text-blue-600 mt-2">4/5</p>
                <p className="text-xs text-slate-500 mt-1">4G / LoRaWAN Heartbeats</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wifi size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attention Required</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-2">{warningCount}</p>
                <p className="text-xs text-amber-700/80 font-medium mt-1">Low battery or sensor drift</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Offline / Fault</p>
                <p className="text-3xl font-extrabold text-rose-600 mt-2">{criticalCount}</p>
                <p className="text-xs text-rose-600/80 font-medium mt-1">Field dispatch required</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("gateways")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "gateways"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            IoT Gateways & Power Status
          </button>
          <button
            onClick={() => setActiveTab("calibration")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "calibration"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Sensor Calibration & QA/QC
          </button>
        </div>

        {/* Tab 1: IoT Gateways */}
        {activeTab === "gateways" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Station Gateway Telemetry</h2>
                <p className="text-xs text-slate-400 mt-0.5">Continuous packet transmission state and communication interfaces</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Gateway Node</th>
                    <th className="px-6 py-4">Station Location</th>
                    <th className="px-6 py-4">Protocol & Signal</th>
                    <th className="px-6 py-4">Power Source</th>
                    <th className="px-6 py-4">Analyzers Health</th>
                    <th className="px-6 py-4">Last Ping</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gateways.map((gw) => (
                    <tr key={gw.device} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            <Server size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 font-mono">{gw.device}</p>
                            <p className="text-[10px] text-slate-400">{gw.firmware}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">{gw.station}</td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{gw.protocol}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">{gw.signal}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Battery size={14} className={gw.power.includes("Low") || gw.power.includes("Critical") ? "text-rose-500" : "text-emerald-500"} />
                          {gw.power}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-700">{gw.sensorHealth}</td>

                      <td className="px-6 py-4 font-mono text-slate-500">{gw.lastCommunication}</td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${getStatusBadge(gw.status)}`}>
                          {gw.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Sensor Calibration Matrix */}
        {activeTab === "calibration" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Gas & Particulate Analyzer Calibration Logs</h2>
                <p className="text-xs text-slate-400 mt-0.5">Scheduled zero/span drift calibration audits for CPCB QA/QC compliance</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Sensor ID & Model</th>
                    <th className="px-6 py-4">Station</th>
                    <th className="px-6 py-4">Monitored Parameter</th>
                    <th className="px-6 py-4">Last Calibration</th>
                    <th className="px-6 py-4">Next Due Date</th>
                    <th className="px-6 py-4">Zero/Span Drift</th>
                    <th className="px-6 py-4">QA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sensorCalibrationLogs.map((log) => (
                    <tr key={log.sensorId} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 font-mono">{log.sensorId}</p>
                        <p className="text-[10px] text-slate-400">{log.model}</p>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">{log.station}</td>

                      <td className="px-6 py-4 font-semibold text-slate-800">{log.parameter}</td>

                      <td className="px-6 py-4 text-slate-600 font-mono">{log.lastCal}</td>

                      <td className="px-6 py-4 text-slate-600 font-mono">{log.nextCal}</td>

                      <td className="px-6 py-4 font-mono font-bold text-slate-700">{log.drift}</td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${getStatusBadge(log.calStatus)}`}>
                          {log.calStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Regulatory Guidance Strip */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-slate-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong>CPCB CAAQM Maintenance Standard:</strong> Routine zero and span checks are performed every 24 hours automatically. Multipoint dynamic calibration audits are performed at least quarterly. Data from sensors flagged with drift exceeding ±5% is automatically assigned a <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">[Suspect]</code> quality flag in downstream sub-index engines.
          </div>
        </div>

      </main>
    </div>
  );
}