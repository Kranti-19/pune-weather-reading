import React, { useState } from "react";
import {
  Wind,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Clock,
  ChevronRight,
  Droplets,
  Thermometer,
  Radio,
  FileSpreadsheet,
  Layers,
  MapPin
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// 24-Hour Observation Series
const HOURLY_TRENDS = [
  { time: "06:00", aqi: 48, pm25: 22, pm10: 50 },
  { time: "08:00", aqi: 62, pm25: 34, pm10: 68 },
  { time: "10:00", aqi: 75, pm25: 42, pm10: 85 },
  { time: "12:00", aqi: 70, pm25: 39, pm10: 80 },
  { time: "14:00", aqi: 84, pm25: 49, pm10: 95 },
  { time: "16:00", aqi: 78, pm25: 44, pm10: 88 },
  { time: "18:00", aqi: 68, pm25: 38, pm10: 78 },
  { time: "20:00", aqi: 58, pm25: 30, pm10: 64 },
];

const WARD_HIGHLIGHTS = [
  { code: "PMC-001", name: "Shivajinagar Central", ward: "Ward 7", zone: "Central Zone", aqi: 68, status: "Satisfactory", dominant: "PM2.5", pm25: 38.2, trend: "-4%" },
  { code: "PMC-002", name: "Kothrud Depot Basin", ward: "Ward 10", zone: "West Zone", aqi: 54, status: "Satisfactory", dominant: "PM10", pm25: 28.1, trend: "-6%" },
  { code: "PMC-003", name: "Hadapsar Industrial", ward: "Ward 15", zone: "East Zone", aqi: 134, status: "Moderate", dominant: "PM2.5", pm25: 84.6, trend: "+8%" },
  { code: "PMC-004", name: "Katraj Lake Reserve", ward: "Ward 21", zone: "South Zone", aqi: 39, status: "Good", dominant: "O3", pm25: 18.4, trend: "-11%" },
  { code: "PMC-005", name: "Hinjewadi Tech Corridor", ward: "Ward 25", zone: "North-West Zone", aqi: 82, status: "Satisfactory", dominant: "NO2", pm25: 44.0, trend: "+2%" },
];

export default function Dashboard() {
  const [activePollutant, setActivePollutant] = useState("aqi");

  const getStatusBadge = (status) => {
    switch (status) {
      case "Good":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200/80";
      case "Satisfactory":
        return "bg-green-50 text-green-700 border border-green-200/80";
      case "Moderate":
        return "bg-amber-50 text-amber-700 border border-amber-200/80";
      case "Poor":
        return "bg-orange-50 text-orange-700 border border-orange-200/80";
      default:
        return "bg-rose-50 text-rose-700 border border-rose-200/80";
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3f8] text-slate-800 p-6 sm:p-8 lg:p-10 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header Section matching PuneAreas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <span>Executive Command</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">Pune Municipal Corporation (PMC)</span>
          </div>
          <div className="flex items-center gap-3">
  <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
    Air Quality Command Portal
  </h1>
</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <RefreshCw size={13} />
            <span>Refresh Stations</span>
          </button>
          <button
            onClick={() => window.print()}
            
            
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition"
          >
            <FileSpreadsheet size={14} />
            <span>Export Roster (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Matched Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        
        {/* Card 1: Citywide AQI */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-slate-100/80 flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              City Ambient AQI
            </span>
            <div className="text-3xl font-black text-slate-900">68</div>
            <span className="text-xs font-semibold text-emerald-600 mt-1 block">
              Satisfactory Status
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wind size={22} />
          </div>
        </div>

        {/* Card 2: Active Nodes */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-slate-100/80 flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Telemetry Active
            </span>
            <div className="text-3xl font-black text-emerald-600">5 / 5</div>
            <span className="text-xs font-medium text-slate-400 mt-1 block">
              100% stations transmitting
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Radio size={22} />
          </div>
        </div>

        {/* Card 3: Dominant Particulate */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-slate-100/80 flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              PM2.5 Primary Driver
            </span>
            <div className="text-3xl font-black text-slate-900">
              38.2 <span className="text-xs font-bold text-slate-400">µg/m³</span>
            </div>
            <span className="text-xs font-medium text-slate-400 mt-1 block">
              CPCB Standard: 60 µg/m³
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Activity size={22} />
          </div>
        </div>

        {/* Card 4: Microclimate */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-slate-100/80 flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Local Meteorology
            </span>
            <div className="text-3xl font-black text-slate-900">
              27.6<span className="text-sm font-semibold text-slate-400">°C</span>
            </div>
            <span className="text-xs font-medium text-slate-400 mt-1 block">
              74% RH • 11 km/h WNW
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Thermometer size={22} />
          </div>
        </div>

      </div>

      {/* 3. 24-Hour Trend Visualizer */}
      <div className="bg-white rounded-[26px] p-7 shadow-sm border border-slate-100/80 mb-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              HISTORICAL TELEMETRY
            </span>
            <h2 className="text-base font-black text-slate-900 mt-1">24-Hour Air Quality Progression</h2>
            <p className="text-xs text-slate-400">Hourly moving average curve calculated across the Pune sensor grid.</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActivePollutant("aqi")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                activePollutant === "aqi"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Overall AQI
            </button>
            <button
              onClick={() => setActivePollutant("pm25")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                activePollutant === "pm25"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              PM2.5 (Fine)
            </button>
            <button
              onClick={() => setActivePollutant("pm10")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                activePollutant === "pm10"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              PM10 (Coarse)
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="puneAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "14px",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                }}
              />
              <Area
                type="monotone"
                dataKey={activePollutant}
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#puneAreaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Styled Table Matching Registry Section in PuneAreas */}
      <div className="bg-white rounded-[26px] p-7 shadow-sm border border-slate-100/80">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">
                Registered CAAQM Station Registry
              </h2>
              
            </div>
          </div>
          
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3.5 pl-2">Station Details</th>
                <th className="pb-3.5">Ward & Zone</th>
                <th className="pb-3.5">CPCB AQI</th>
                <th className="pb-3.5">Dominant</th>
                <th className="pb-3.5">PM2.5 Level</th>
                <th className="pb-3.5">Status</th>
                <th className="pb-3.5 pr-2 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {WARD_HIGHLIGHTS.map((stn) => (
                <tr key={stn.code} className="hover:bg-slate-50/70 transition">
                  
                  {/* Station Name & Code */}
                  <td className="py-4 pl-2">
                    <span className="font-bold text-slate-900 block">{stn.name}</span>
                    <span className="font-mono text-[11px] text-blue-600 font-semibold">{stn.code}</span>
                  </td>

                  {/* Ward / Zone */}
                  <td className="py-4 text-slate-600 font-medium">
                    {stn.ward}
                    <span className="block text-[11px] text-slate-400">{stn.zone}</span>
                  </td>

                  {/* AQI Score */}
                  <td className="py-4 font-mono text-base font-black text-slate-900">
                    {stn.aqi}
                  </td>

                  {/* Dominant Pollutant */}
                  <td className="py-4 font-semibold text-slate-700">
                    {stn.dominant}
                  </td>

                  {/* PM2.5 Level */}
                  <td className="py-4 font-mono font-semibold text-slate-800">
                    {stn.pm25} <span className="text-slate-400 text-[10px]">µg/m³</span>
                  </td>

                  {/* Category Badge */}
                  <td className="py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${getStatusBadge(stn.status)}`}>
                      {stn.status}
                    </span>
                  </td>

                  {/* 24h Trend */}
                  <td className="py-4 pr-2 text-right font-mono font-bold text-slate-600">
                    {stn.trend}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}