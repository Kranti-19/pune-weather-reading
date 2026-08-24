import React, { useState } from "react";
import {
  FileText,
  Calendar,
  MapPin,
  Activity,
  Database,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  Filter
} from "lucide-react";
import { getCPCBStatus } from "../utils/aqiUtils";

export default function Reports() {
  const [reportType, setReportType] = useState("daily");
  const [selectedStation, setSelectedStation] = useState("Kothrud Monitoring Station");
  const [selectedDate, setSelectedDate] = useState("2026-08-20");

  const stationData = {
    station: "Kothrud Monitoring Station",
    stationId: "PMC-001",
    ward: "Kothrud (Ward 10)",
    zone: "West Zone",
    date: selectedDate,
    aqi: 118,
    category: "Moderate",
    dominantPollutant: "PM2.5",
    dataAvailability: "98.6%",
    stationStatus: "Online",
    pollutants: [
      { name: "PM2.5", value: "58", unit: "µg/m³", standard: "60", subIndex: 118, flag: "Valid" },
      { name: "PM10", value: "96", unit: "µg/m³", standard: "100", subIndex: 96, flag: "Valid" },
      { name: "NO₂", value: "42", unit: "µg/m³", standard: "80", subIndex: 53, flag: "Valid" },
      { name: "SO₂", value: "18", unit: "µg/m³", standard: "80", subIndex: 23, flag: "Valid" },
      { name: "CO", value: "1.2", unit: "mg/m³", standard: "2.0", subIndex: 60, flag: "Valid" },
      { name: "O₃", value: "54", unit: "µg/m³", standard: "100", subIndex: 54, flag: "Valid" },
      { name: "NH₃", value: "21", unit: "µg/m³", standard: "400", subIndex: 15, flag: "Valid" },
      { name: "Pb", value: "0.4", unit: "µg/m³", standard: "1.0", subIndex: 40, flag: "Valid" },
    ],
  };

  const aqiTheme = getCPCBStatus(stationData.aqi);

  const handleExportCSV = () => {
    const headers = "Parameter,Concentration,Unit,CPCB Standard 24h,Sub-Index,Data Flag\n";
    const rows = stationData.pollutants
      .map((p) => `"${p.name}",${p.value},"${p.unit}","${p.standard}",${p.subIndex},"${p.flag}"`)
      .join("\n");
    const summary = `\nStation,"${stationData.station} (${stationData.stationId})"\nWard,"${stationData.ward}"\nReport Date,"${stationData.date}"\nOverall AQI,${stationData.aqi}\nCategory,"${stationData.category}"\nDominant Pollutant,"${stationData.dominantPollutant}"\nData Availability,"${stationData.dataAvailability}"\n\n`;

    const blob = new Blob([summary + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CPCB_Report_${stationData.stationId}_${stationData.date}.csv`);
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="p-6 md:p-8 space-y-6 max-w-[1500px] mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Regulatory Air Quality Reports
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              CPCB format compliance reports, station data availability audits, and ward summaries.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs transition"
            >
              <Printer size={15} />
              Print / Save PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-sm text-xs transition"
            >
              <FileSpreadsheet size={15} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Report Configuration Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Report Generator Parameters</h2>
              <p className="text-xs text-slate-400">Select reporting scope, monitored station, and observation window</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Report Type */}
            <div>
              <label className="text-xs font-semibold text-slate-600">Report Scope</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="daily">Daily Station Summary (CPCB Format)</option>
                <option value="monthly">Ward-Wise Monthly AQI Aggregation</option>
                <option value="uptime">Station Uptime & Data QA/QC Audit</option>
                <option value="alerts">Incident & Threshold Violation Report</option>
              </select>
            </div>

            {/* Station Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-600">Monitoring Station</label>
              <div className="relative mt-1.5">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Kothrud Monitoring Station (PMC-001)</option>
                  <option>Hinjewadi Monitoring Station (PMC-002)</option>
                  <option>Hadapsar Monitoring Station (PMC-003)</option>
                  <option>Kharadi Monitoring Station (PMC-004)</option>
                  <option>Baner Monitoring Station (PMC-005)</option>
                </select>
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-xs font-semibold text-slate-600">Observation Date</label>
              <div className="relative mt-1.5">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Generated Report View Container (Printable) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          
          {/* Official Document Banner */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Official Municipal Report
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">{stationData.station}</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Station ID: {stationData.stationId} • {stationData.ward} • {stationData.zone}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-slate-400 font-medium">Reporting Window</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{stationData.date} (24-Hour Average)</p>
            </div>
          </div>

          {/* AQI & Executive Summary Strip */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Ambient Air Quality Index Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Calculated AQI</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${aqiTheme.badge}`}>
                    {stationData.category}
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">{stationData.aqi}</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-xs text-slate-500 font-medium">Dominant Pollutant</span>
                <div className="text-2xl font-bold text-slate-900 mt-2">{stationData.dominantPollutant}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Highest sub-index driver</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-xs text-slate-500 font-medium">Data Completeness</span>
                <div className="text-2xl font-bold text-emerald-600 mt-2">{stationData.dataAvailability}</div>
                <p className="text-[11px] text-emerald-700/80 font-medium mt-0.5">Meets CPCB &gt;85% criteria</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-xs text-slate-500 font-medium">Station Operational State</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xl font-bold text-slate-900">{stationData.stationStatus}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Mains Powered + LTE Gateway</p>
              </div>
            </div>
          </div>

          {/* 8-Pollutant Observation Table */}
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Recorded Pollutant Observations & Sub-Indices
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="px-4 py-3">Pollutant Parameter</th>
                    <th className="px-4 py-3">Measured Concentration</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">CPCB 24h Standard Limit</th>
                    <th className="px-4 py-3">Calculated Sub-Index</th>
                    <th className="px-4 py-3">QA/QC Quality Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stationData.pollutants.map((pol) => {
                    const isExceeded = Number(pol.value) > Number(pol.standard);
                    const polTheme = getCPCBStatus(pol.subIndex);
                    return (
                      <tr key={pol.name} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-900">{pol.name}</td>
                        <td className="px-4 py-3.5 font-bold font-mono text-slate-900">{pol.value}</td>
                        <td className="px-4 py-3.5 text-slate-500 font-mono">{pol.unit}</td>
                        <td className="px-4 py-3.5 text-slate-500 font-mono">{pol.standard} {pol.unit}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded font-bold ${polTheme.badge}`}>
                            {pol.subIndex}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle size={12} /> {pol.flag}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Footer Note */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400">
            <span>Generated according to CPCB CAAQM National Ambient Air Quality Index Guidelines.</span>
            <span>Pune Municipal Corporation • Environment Department</span>
          </div>

        </div>

      </main>
    </div>
  );
}