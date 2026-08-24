import React, { useState, useMemo } from "react";
import {
  Wrench,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Plus,
  Search,
  Download,
  Filter,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export default function Maintenance() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [maintenanceRecords, setMaintenanceRecords] = useState([
    {
      id: "MNT-2026-001",
      station: "Kothrud Monitoring Station (PMC-001)",
      device: "GW-001",
      issue: "Routine PM inlet cleaning",
      action: "Heated inlet inspection & sample tube purge",
      technician: "Field Team 01 (P. Shinde)",
      date: "18 Aug 2026",
      nextService: "18 Sep 2026",
      status: "Completed",
    },
    {
      id: "MNT-2026-002",
      station: "Hinjewadi Monitoring Station (PMC-002)",
      device: "GW-002",
      issue: "Quarterly Gateway inspection",
      action: "Firmware OTA update to v2.4.0 & backup battery test",
      technician: "Field Team 02 (A. Kulkarni)",
      date: "15 Aug 2026",
      nextService: "15 Sep 2026",
      status: "Completed",
    },
    {
      id: "MNT-2026-003",
      station: "Hadapsar Monitoring Station (PMC-003)",
      device: "GW-003",
      issue: "4G Telemetry packet drop",
      action: "Replace SIM & external omni antenna orientation",
      technician: "Field Team 01 (P. Shinde)",
      date: "12 Aug 2026",
      nextService: "12 Sep 2026",
      status: "Pending",
    },
    {
      id: "MNT-2026-004",
      station: "Kharadi Monitoring Station (PMC-004)",
      device: "GW-004",
      issue: "Low solar power delivery",
      action: "Solar panel cleaning & MPPT charge controller check",
      technician: "Field Team 03 (R. More)",
      date: "10 Aug 2026",
      nextService: "10 Sep 2026",
      status: "Due",
    },
    {
      id: "MNT-2026-005",
      station: "Baner Monitoring Station (PMC-005)",
      device: "GW-005",
      issue: "PM optical sensor drift",
      action: "Optical chamber calibration and zero-gas verification",
      technician: "Field Team 02 (A. Kulkarni)",
      date: "08 Aug 2026",
      nextService: "08 Sep 2026",
      status: "Due",
    },
  ]);

  const [calibrationRecords, setCalibrationRecords] = useState([
    {
      id: "CAL-2026-101",
      sensor: "SEN-PM25-001",
      station: "Kothrud (PMC-001)",
      parameter: "PM2.5",
      calibrationDate: "18 Aug 2026",
      method: "Reference BAM Comparison",
      result: "Passed (+1.1% drift)",
      nextCalibration: "18 Nov 2026",
      status: "Valid",
    },
    {
      id: "CAL-2026-102",
      sensor: "SEN-PM10-002",
      station: "Hinjewadi (PMC-002)",
      parameter: "PM10",
      calibrationDate: "15 Aug 2026",
      method: "Beta Attenuation Foil Check",
      result: "Passed (-0.7% drift)",
      nextCalibration: "15 Nov 2026",
      status: "Valid",
    },
    {
      id: "CAL-2026-103",
      sensor: "SEN-NO2-003",
      station: "Hadapsar (PMC-003)",
      parameter: "NO₂",
      calibrationDate: "10 May 2026",
      method: "CPCB Certified Span Gas (NO in N2)",
      result: "Calibration Expired",
      nextCalibration: "10 Aug 2026",
      status: "Due",
    },
    {
      id: "CAL-2026-104",
      sensor: "SEN-SO2-004",
      station: "Kharadi (PMC-004)",
      parameter: "SO₂",
      calibrationDate: "05 Aug 2026",
      method: "UV Fluorescence Zero/Span Check",
      result: "Warning (+5.8% drift)",
      nextCalibration: "05 Nov 2026",
      status: "Warning",
    },
  ]);

  const toggleTaskStatus = (id) => {
    setMaintenanceRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "Completed" ? "Due" : "Completed" }
          : r
      )
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
      case "Valid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Pending":
      case "Warning":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-rose-50 text-rose-700 border border-rose-200";
    }
  };

  const completedCount = maintenanceRecords.filter((r) => r.status === "Completed").length;
  const maintenanceDueCount = maintenanceRecords.filter((r) => r.status === "Due" || r.status === "Pending").length;
  const validCalCount = calibrationRecords.filter((r) => r.status === "Valid").length;
  const dueCalCount = calibrationRecords.filter((r) => r.status === "Due" || r.status === "Warning").length;

  const handleExportCSV = () => {
    const headers = "Type,ID,Station,Target,Description,Technician_Method,Date,NextDate,Status\n";
    const mRows = maintenanceRecords.map(
      (m) => `"Maintenance","${m.id}","${m.station}","${m.device}","${m.issue}","${m.technician}","${m.date}","${m.nextService}","${m.status}"`
    );
    const cRows = calibrationRecords.map(
      (c) => `"Calibration","${c.id}","${c.station}","${c.sensor}","${c.parameter}","${c.method}","${c.calibrationDate}","${c.nextCalibration}","${c.status}"`
    );

    const blob = new Blob([headers + mRows.join("\n") + "\n" + cRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PMC_Maintenance_Calibration_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Maintenance & Calibration Operations
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Field technician work-orders, scheduled preventive maintenance, and CPCB zero/span sensor calibration logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs transition"
            >
              <Download size={15} />
              Export Audit Log
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Work-Orders</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{completedCount}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Inspections logged</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Maintenance Due</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-2">{maintenanceDueCount}</p>
                <p className="text-xs text-amber-700/80 font-medium mt-1">Field visits pending</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wrench size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valid Calibrations</p>
                <p className="text-3xl font-extrabold text-blue-600 mt-2">{validCalCount}</p>
                <p className="text-xs text-blue-700/80 font-medium mt-1">Within ±5% drift limit</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Calibration Due</p>
                <p className="text-3xl font-extrabold text-rose-600 mt-2">{dueCalCount}</p>
                <p className="text-xs text-rose-700/80 font-medium mt-1">Span check required</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "maintenance" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Station Maintenance Tasks
            </button>
            <button
              onClick={() => setActiveTab("calibration")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "calibration" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sensor Calibration Logs
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search station, tech, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Section 1: Maintenance Records */}
        {(activeTab === "all" || activeTab === "maintenance") && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Station Hardware Maintenance Work-Orders</h2>
                <p className="text-xs text-slate-400 mt-0.5">Field maintenance history and preventive service schedule</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Ticket ID</th>
                    <th className="px-6 py-4">Station Location</th>
                    <th className="px-6 py-4">Reported Issue</th>
                    <th className="px-6 py-4">Action Taken</th>
                    <th className="px-6 py-4">Assigned Field Team</th>
                    <th className="px-6 py-4">Service Window</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{record.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{record.station}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{record.issue}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs">{record.action}</td>
                      <td className="px-6 py-4 text-slate-700 flex items-center gap-1.5 mt-2">
                        <UserCheck size={14} className="text-slate-400" />
                        {record.technician}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        <div>{record.date}</div>
                        <div className="text-[10px] text-slate-400">Next: {record.nextService}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleTaskStatus(record.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {record.status === "Completed" ? "Mark Due" : "Mark Done"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 2: Sensor Calibration Records */}
        {(activeTab === "all" || activeTab === "calibration") && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Gas & Particulate Analyzer Calibration Audits</h2>
                <p className="text-xs text-slate-400 mt-0.5">Multipoint dynamic calibration & zero/span verification logs</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Sensor Node</th>
                    <th className="px-6 py-4">Station</th>
                    <th className="px-6 py-4">Parameter</th>
                    <th className="px-6 py-4">Method / Reference Standard</th>
                    <th className="px-6 py-4">Audit Result / Drift</th>
                    <th className="px-6 py-4">Schedule Dates</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {calibrationRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{record.sensor}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{record.station}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{record.parameter}</td>
                      <td className="px-6 py-4 text-slate-600">{record.method}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">{record.result}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        <div>{record.calibrationDate}</div>
                        <div className="text-[10px] text-slate-400">Next: {record.nextCalibration}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}