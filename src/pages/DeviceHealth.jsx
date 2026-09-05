// <<<<<<< Updated upstream
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
  CheckCircle2,
  Sliders,
  ArrowUpRight,
  Radio,
  Zap,
  ChevronRight,
  Send
} from "lucide-react";

export default function DeviceHealth() {
  const [activeTab, setActiveTab] = useState("gateways");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isPinging, setIsPinging] = useState(false);
  const [maintenanceModal, setMaintenanceModal] = useState(null);

  const gateways = [
    {
      device: "GW-KTH-001",
      station: "Kothrud Monitoring Station (PMC-001)",
      connectivity: "Online",
      protocol: "4G-LTE",
      signal: "-68 dBm",
      powerType: "Mains",
      batteryLevel: 98,
      firmware: "v2.4.1",
      sensorHealth: "Healthy (8/8)",
      lastCommunication: "Just now",
      latency: "42 ms",
      status: "Healthy",
    },
    {
      device: "GW-HNJ-002",
      station: "Hinjewadi Monitoring Station (PMC-002)",
      connectivity: "Online",
      protocol: "Ethernet / Fiber",
      signal: "-52 dBm",
      powerType: "Solar + Battery",
      batteryLevel: 100,
      firmware: "v2.4.0",
      sensorHealth: "Healthy (8/8)",
      lastCommunication: "2 min ago",
      latency: "18 ms",
      status: "Healthy",
    },
    {
      device: "GW-HDP-003",
      station: "Hadapsar Monitoring Station (PMC-003)",
      connectivity: "Online",
      protocol: "4G-LTE",
      signal: "-82 dBm",
      powerType: "Mains",
      batteryLevel: 92,
      firmware: "v2.4.1",
      sensorHealth: "Warning (PM2.5 Drift)",
      lastCommunication: "1 min ago",
      latency: "86 ms",
      status: "Warning",
    },
    {
      device: "GW-KHR-004",
      station: "Kharadi Monitoring Station (PMC-004)",
      connectivity: "Online",
      protocol: "LoRaWAN",
      signal: "-95 dBm",
      powerType: "Battery Only",
      batteryLevel: 18,
      firmware: "v2.3.9",
      sensorHealth: "Healthy (8/8)",
      lastCommunication: "3 min ago",
      latency: "310 ms",
      status: "Warning",
    },
    {
      device: "GW-BNR-005",
      station: "Baner Monitoring Station (PMC-005)",
      connectivity: "Offline",
      protocol: "4G-LTE",
      signal: "No Signal",
      powerType: "Battery Only",
      batteryLevel: 14,
      firmware: "v2.4.1",
      sensorHealth: "Fault (Particulate Line)",
      lastCommunication: "18 min ago",
      latency: "Timeout",
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
      zeroNoise: "0.02 µg",
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
      zeroNoise: "0.04 µg",
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
      zeroNoise: "0.14 ppb",
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
      zeroNoise: "ERR",
    },
  ];

  const handleForcePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
    }, 1000);
  };

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

  const filteredGateways = gateways.filter((gw) => {
    const matchesSearch =
      gw.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gw.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gw.protocol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || gw.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredSensors = sensorCalibrationLogs.filter((s) => {
    return (
      s.sensorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parameter.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const healthyCount = gateways.filter((g) => g.status === "Healthy").length;
  const warningCount = gateways.filter((g) => g.status === "Warning").length;
  const criticalCount = gateways.filter((g) => g.status === "Critical").length;

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header with Live Gateway Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Hardware & Device Management</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">CPCB Section 3 & 12 Telemetry QA/QC</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sensor & Hardware Telemetry Health
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              4/5 Transmitting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Field IoT gateway heartbeats, uninterruptible battery telemetry, and automated analyzer calibration logs.
          </p>
        </div>

        <button
          onClick={handleForcePing}
          disabled={isPinging}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition disabled:opacity-50"
        >
          <RefreshCw size={13} className={isPinging ? "animate-spin" : ""} />
          <span>{isPinging ? "Pinging Grid..." : "Force Gateway Poll"}</span>
        </button>
      </div>

      {/* 2. Four Telemetry KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        
        {/* Operational Gateways */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Operational Nodes</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{healthyCount}</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
              Optimal
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Gateways sending 60s packets</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
            <span>Passes TLS Auth</span>
            <span className="text-slate-400 font-normal">Port 5000 Active</span>
          </div>
        </div>

        {/* Network Connectivity */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Network Link Online</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
              <Wifi size={18} />
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-blue-600">4 / 5</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
              80% Network
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">4G LTE, Fiber & LoRaWAN</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Mean Latency: 48 ms</span>
            <span className="text-slate-400 font-normal">1 Offline (Baner)</span>
          </div>
        </div>

        {/* Attention Required */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attention Required</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-inner">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-amber-600">{warningCount}</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
              Service Warning
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Hadapsar drift & Kharadi low battery</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-amber-600">
            <span>Battery &lt; 20%</span>
            <span className="text-slate-400 font-normal">Mains Check Needed</span>
          </div>
        </div>

        {/* Offline / Critical Fault */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Offline / Fault Nodes</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-inner">
              <XCircle size={18} />
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-rose-600">{criticalCount}</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
              Field Action
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Baner Monitoring Station offline</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-rose-600">
            <span>18 min timeout breach</span>
            <span className="text-slate-400 font-normal">Technician Alerted</span>
          </div>
        </div>

      </div>

      {/* 3. Tab Switching & Search Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Active Tab Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("gateways")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "gateways"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            IoT Gateways & Power Matrix ({gateways.length})
          </button>
          <button
            onClick={() => setActiveTab("calibration")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "calibration"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            Sensor Calibration & QA/QC ({sensorCalibrationLogs.length})
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, model, station..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 w-52 sm:w-64 transition"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          {activeTab === "gateways" && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          )}
        </div>

      </div>

      {/* 4. Tab 1: IoT Gateways & Power Matrix */}
      {activeTab === "gateways" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Municipal Station Gateway Network
                </h2>
                <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">
                  Firmware: v2.4.x Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time telemetry packet throughput, link signal strength, and uninterruptible power levels.
              </p>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Standard: <strong className="text-slate-800">CPCB 3-Interval Timeout Standard</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="pb-3 pl-2">Gateway / Controller</th>
                  <th className="pb-3">Station Node Location</th>
                  <th className="pb-3">Protocol & Latency</th>
                  <th className="pb-3">Power & Battery Health</th>
                  <th className="pb-3">Analyzer Bus (8/8)</th>
                  <th className="pb-3">Last Heartbeat</th>
                  <th className="pb-3 text-right pr-2">Actions / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGateways.map((gw) => (
                  <tr key={gw.device} className="hover:bg-slate-50/80 transition duration-150">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0 border border-blue-100">
                          <Server size={16} />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 font-mono text-xs">{gw.device}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{gw.firmware}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="font-bold text-slate-800">{gw.station.split("(")[0]}</div>
                      <div className="text-[10px] text-slate-400 font-mono">({gw.station.split("(")[1]}</div>
                    </td>

                    <td className="py-4">
                      <div className="font-semibold text-slate-800">{gw.protocol}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                        <span>{gw.signal}</span>
                        <span>•</span>
                        <span className="text-blue-600 font-bold">{gw.latency}</span>
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Battery
                          size={15}
                          className={
                            gw.batteryLevel < 20
                              ? "text-rose-600"
                              : gw.batteryLevel < 50
                              ? "text-amber-500"
                              : "text-emerald-600"
                          }
                        />
                        <span className="font-bold text-slate-800">{gw.powerType} ({gw.batteryLevel}%)</span>
                      </div>
                      <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            gw.batteryLevel < 20
                              ? "bg-rose-500"
                              : gw.batteryLevel < 50
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${gw.batteryLevel}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-4 font-medium text-slate-700">
                      <span className="flex items-center gap-1">
                        <Cpu size={13} className="text-slate-400" />
                        {gw.sensorHealth}
                      </span>
                    </td>

                    <td className="py-4 font-mono text-slate-500 text-[11px]">{gw.lastCommunication}</td>

                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(gw.status)}`}>
                          {gw.status}
                        </span>
                        {gw.status !== "Healthy" && (
                          <button
                            onClick={() => setMaintenanceModal(gw.station)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition"
                            title="Dispatch Technician"
                          >
                            <Wrench size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Sensor Calibration & QA/QC Matrix */}
      {activeTab === "calibration" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Analyzer Dynamic Calibration & Quality Assurance Records
                </h2>
                <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  NAAQS Audited
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero gas baseline checks, multipoint span drift tolerances, and calibration due schedules.
              </p>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Acceptable Span Drift: <strong className="text-slate-800">± 5.0% CPCB Threshold</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="pb-3 pl-2">Analyzer Sensor ID</th>
                  <th className="pb-3">Station Node</th>
                  <th className="pb-3">Monitored Parameter & Tech</th>
                  <th className="pb-3">Last Calibration</th>
                  <th className="pb-3">Next Due Date</th>
                  <th className="pb-3">Span Drift %</th>
                  <th className="pb-3 text-right pr-2">CPCB QA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSensors.map((sensor) => (
                  <tr key={sensor.sensorId} className="hover:bg-slate-50/80 transition duration-150">
                    <td className="py-4 pl-2">
                      <div className="font-mono font-black text-slate-900 text-xs">{sensor.sensorId}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{sensor.model}</div>
                    </td>

                    <td className="py-4 font-bold text-slate-800">{sensor.station}</td>

                    <td className="py-4">
                      <span className="font-semibold text-slate-900">{sensor.parameter}</span>
                      <span className="text-[10px] text-slate-400 block">Zero Noise: {sensor.zeroNoise}</span>
                    </td>

                    <td className="py-4 font-mono text-slate-500 text-[11px]">{sensor.lastCal}</td>
                    <td className="py-4 font-mono font-semibold text-slate-700 text-[11px]">{sensor.nextCal}</td>

                    <td className="py-4">
                      <span className={`font-mono font-bold text-xs ${
                        sensor.drift.includes("+6") || sensor.drift === "No Signal"
                          ? "text-rose-600"
                          : "text-slate-700"
                      }`}>
                        {sensor.drift}
                      </span>
                    </td>

                    <td className="py-4 text-right pr-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(sensor.calStatus)}`}>
                        {sensor.calStatus === "Valid" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                        <span>{sensor.calStatus}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Regulatory Protocol Footer */}
      <div className="mt-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-start gap-3">
        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900">CPCB Hardware Quality Assurance Standard:</strong> Routine zero and span checks are performed automatically on continuous analyzers every 24 hours. Multipoint dynamic calibrations are performed quarterly. Observations from any sensor experiencing drift beyond ±5% are marked with a <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">[Suspect-QA]</code> flag and excluded from official municipal AQI calculations.
        </div>
      </div>

      {/* 7. Technician Dispatch Modal */}
      {maintenanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Wrench size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Dispatch Field Maintenance</h3>
                <p className="text-xs text-slate-400">Escalate hardware ticket to municipal field unit</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Dispatching priority maintenance team to <strong className="text-slate-900">{maintenanceModal}</strong> for gateway battery replacement or optical zero-drift recalibration.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Assigned Field Engineer
                </label>
                <select className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none">
                  <option>PMC CAAQM Quick Response Unit 1 (Central)</option>
                  <option>Maharashtra Instrumentation Services Ltd.</option>
                  <option>Depot Resident Electrical Contractor</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setMaintenanceModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Work ticket dispatched for ${maintenanceModal}`);
                  setMaintenanceModal(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition active:scale-95"
              >
                <Send size={13} />
                <span>Issue Work Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
// =======
// >>>>>>> Stashed changes
