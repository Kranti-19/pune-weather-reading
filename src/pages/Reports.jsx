import React, { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Search,
  Building2,
  ArrowDownToLine,
  ChevronDown,
  Layers,
  Sparkles
} from "lucide-react";

export default function Reports() {
  const [selectedStation, setSelectedStation] = useState("ALL");
  const [reportType, setReportType] = useState("CPCB_DAILY");
  const [observationDate, setObservationDate] = useState("2026-09-03");
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-configured official regulatory reports (Section 11)
  const reportTemplates = [
    {
      id: "CPCB_DAILY",
      title: "Daily CAAQM Station Audit",
      code: "FORM-IV / CPCB",
      desc: "24-hour weighted mean for 8 NAAQS parameters with sub-index classification.",
      frequency: "Daily Automount",
      status: "Ready"
    },
    {
      id: "WARD_EXCEED",
      title: "Ward Exceedance & Breach Log",
      code: "PMC-ENV-2026",
      desc: "Audit of particulate (PM2.5/PM10) threshold spikes linked to construction sites.",
      frequency: "Event Driven",
      status: "Ready"
    },
    {
      id: "UPTIME_QAQC",
      title: "Station Uptime & Data Completeness",
      code: "QAQC-TEL-99",
      desc: "Sensor drift, packet loss rate, and battery telemetry health report.",
      frequency: "Weekly Audit",
      status: "Certified"
    }
  ];

  // Generated tabular compliance records
  const complianceRecords = [
    {
      station: "Hadapsar Industrial (Ward 15)",
      pm25: "84.6 µg/m³",
      pm10: "142.0 µg/m³",
      no2: "58.2 µg/m³",
      aqi: 134,
      category: "Moderate",
      dominant: "PM2.5",
      availability: "99.1%",
      compliance: "Action Triggered"
    },
    {
      station: "Shivajinagar Central (Ward 7)",
      pm25: "38.2 µg/m³",
      pm10: "78.4 µg/m³",
      no2: "44.0 µg/m³",
      aqi: 68,
      category: "Satisfactory",
      dominant: "PM2.5",
      availability: "99.8%",
      compliance: "Compliant"
    },
    {
      station: "Hinjewadi Tech Hub (Ward 25)",
      pm25: "44.0 µg/m³",
      pm10: "88.5 µg/m³",
      no2: "62.0 µg/m³",
      aqi: 82,
      category: "Satisfactory",
      dominant: "NO2",
      availability: "97.4%",
      compliance: "Compliant"
    },
    {
      station: "Kothrud Depot (Ward 10)",
      pm25: "28.1 µg/m³",
      pm10: "64.2 µg/m³",
      no2: "32.5 µg/m³",
      aqi: 54,
      category: "Satisfactory",
      dominant: "PM10",
      availability: "98.9%",
      compliance: "Compliant"
    },
    {
      station: "Katraj Lake Basin (Ward 21)",
      pm25: "18.4 µg/m³",
      pm10: "42.0 µg/m³",
      no2: "18.0 µg/m³",
      aqi: 39,
      category: "Good",
      dominant: "O3",
      availability: "100%",
      compliance: "Compliant"
    }
  ];

  const handleExport = (format) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Exporting ${reportType} report for ${observationDate} as .${format.toLowerCase()}`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header with Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Regulatory Compliance & Audits</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">CPCB Section 11 Documentation</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Regulatory Air Quality Reports
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
              <CheckCircle2 size={12} />
              NAAQS Certified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate CPCB format compliance reports, daily ward audits, and continuous observation exports.
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("PDF")}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Download size={14} className="text-rose-500" />
            <span>Export Official PDF</span>
          </button>

          <button
            onClick={() => handleExport("XLSX")}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition"
          >
            <FileSpreadsheet size={14} />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. Top Section: 3 Ready-to-Print CPCB Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
        {reportTemplates.map((item) => {
          const isSelected = reportType === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setReportType(item.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-blue-500 shadow-[0_10px_30px_rgba(37,99,235,0.12)] ring-2 ring-blue-500/20"
                  : "bg-white/80 hover:bg-white border-slate-200 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {item.code}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-2">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Cycle: {item.frequency}</span>
                <span className="text-blue-600 font-bold">Select Template →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Parameter Customization Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] mb-7">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Report Generation Parameters</h2>
            <p className="text-xs text-slate-400">Filter parameters before compiling the official regulatory log</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Station Selection */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
              Monitoring Station / Node
            </label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 cursor-pointer transition shadow-inner"
            >
              <option value="ALL">All 5 Municipal Wards (Consolidated)</option>
              <option value="PMC-001">Shivajinagar Central (Ward 7)</option>
              <option value="PMC-002">Kothrud Depot (Ward 10)</option>
              <option value="PMC-003">Hadapsar Industrial (Ward 15)</option>
              <option value="PMC-004">Katraj Lake Basin (Ward 21)</option>
              <option value="PMC-005">Hinjewadi Tech Hub (Ward 25)</option>
            </select>
          </div>

          {/* Observation Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
              Observation Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={observationDate}
                onChange={(e) => setObservationDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition shadow-inner"
              />
            </div>
          </div>

          {/* Compile Button */}
          <div className="flex items-end">
            <button
              onClick={() => handleExport("PDF")}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-2"
            >
              <Printer size={15} />
              <span>Compile & Preview Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Official CPCB Regulatory Compliance Sheet (Data Table) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">
                Official Municipal Environmental Audit Table
              </h2>
              <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">
                Ref: {observationDate}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              CPCB Schedule VII Ambient Air Quality Monitoring Compliance Matrix
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Standard: <strong className="text-slate-800">24h Weighted CPCB Breakpoints</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="pb-3 pl-2">Station / Ward Node</th>
                <th className="pb-3">PM2.5 (24h)</th>
                <th className="pb-3">PM10 (24h)</th>
                <th className="pb-3">NO2 (24h)</th>
                <th className="pb-3">Calculated AQI</th>
                <th className="pb-3">Dominant</th>
                <th className="pb-3">Data Rate</th>
                <th className="pb-3 text-right pr-2">Regulatory Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complianceRecords
                .filter(
                  (r) =>
                    selectedStation === "ALL" ||
                    r.station.includes(
                      selectedStation === "PMC-001"
                        ? "Shivajinagar"
                        : selectedStation === "PMC-002"
                        ? "Kothrud"
                        : selectedStation === "PMC-003"
                        ? "Hadapsar"
                        : selectedStation === "PMC-004"
                        ? "Katraj"
                        : "Hinjewadi"
                    )
                )
                .map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition duration-150">
                    <td className="py-4 pl-2">
                      <div className="font-black text-slate-900">{row.station}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: PMC-STN-0{idx + 1}</div>
                    </td>
                    <td className="py-4 font-bold text-slate-700">{row.pm25}</td>
                    <td className="py-4 font-bold text-slate-700">{row.pm10}</td>
                    <td className="py-4 font-bold text-slate-700">{row.no2}</td>
                    <td className="py-4">
                      <span className="text-sm font-black text-slate-900">{row.aqi}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({row.category})</span>
                    </td>
                    <td className="py-4 font-semibold text-blue-600">{row.dominant}</td>
                    <td className="py-4 font-mono font-bold text-emerald-600">{row.availability}</td>
                    <td className="py-4 text-right pr-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                          row.compliance === "Compliant"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {row.compliance === "Compliant" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                        <span>{row.compliance}</span>
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Audit Sign-Off Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>Digital Signature: <strong>PMC CAAQM System Gateway Engine (SHA-256 Verified)</strong></span>
          <span>Prepared for: Maharashtra Pollution Control Board (MPCB)</span>
        </div>
      </div>

    </div>
  );
}