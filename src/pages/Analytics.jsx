<<<<<<< Updated upstream
import React, { useState } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Database,
  BarChart3,
  Calendar,
  Filter,
  RefreshCw,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  ChevronDown
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const analyticsTelemetry = {
  "24 Hours": [
    { time: "00:00", aqi: 62, pm25: 34, pm10: 72, no2: 38 },
    { time: "03:00", aqi: 54, pm25: 28, pm10: 64, no2: 29 },
    { time: "06:00", aqi: 71, pm25: 41, pm10: 82, no2: 44 },
    { time: "09:00", aqi: 92, pm25: 56, pm10: 108, no2: 62 },
    { time: "12:00", aqi: 88, pm25: 51, pm10: 98, no2: 54 },
    { time: "15:00", aqi: 79, pm25: 45, pm10: 89, no2: 48 },
    { time: "18:00", aqi: 114, pm25: 72, pm10: 132, no2: 74 },
    { time: "21:00", aqi: 96, pm25: 58, pm10: 112, no2: 59 },
    { time: "23:59", aqi: 68, pm25: 38, pm10: 78, no2: 42 },
  ],
  "7 Days": [
    { time: "Mon", aqi: 64, pm25: 36, pm10: 75, no2: 40 },
    { time: "Tue", aqi: 72, pm25: 42, pm10: 84, no2: 46 },
    { time: "Wed", aqi: 68, pm25: 38, pm10: 78, no2: 43 },
    { time: "Thu", aqi: 85, pm25: 52, pm10: 99, no2: 56 },
    { time: "Fri", aqi: 94, pm25: 58, pm10: 112, no2: 64 },
    { time: "Sat", aqi: 78, pm25: 46, pm10: 91, no2: 49 },
    { time: "Sun", aqi: 59, pm25: 31, pm10: 68, no2: 36 },
  ],
  "30 Days": [
    { time: "Week 1", aqi: 61, pm25: 33, pm10: 70, no2: 38 },
    { time: "Week 2", aqi: 69, pm25: 39, pm10: 81, no2: 44 },
    { time: "Week 3", aqi: 82, pm25: 50, pm10: 96, no2: 54 },
    { time: "Week 4", aqi: 74, pm25: 43, pm10: 86, no2: 47 },
  ],
};

const criteriaParameters = [
  { code: "PM2.5", name: "Fine Particulate", val: 38.2, unit: "µg/m³", limit: 60, sub: 72, status: "Satisfactory", color: "from-blue-600 to-indigo-600" },
  { code: "PM10", name: "Coarse Dust", val: 84.5, unit: "µg/m³", limit: 100, sub: 68, status: "Satisfactory", color: "from-sky-500 to-blue-600" },
  { code: "NO2", name: "Nitrogen Dioxide", val: 42.1, unit: "µg/m³", limit: 80, sub: 45, status: "Good", color: "from-indigo-500 to-purple-600" },
  { code: "SO2", name: "Sulfur Dioxide", val: 14.6, unit: "µg/m³", limit: 80, sub: 18, status: "Good", color: "from-teal-500 to-emerald-600" },
  { code: "CO", name: "Carbon Monoxide", val: 1.1, unit: "mg/m³", limit: 2.0, sub: 55, status: "Satisfactory", color: "from-amber-500 to-orange-600" },
  { code: "O3", name: "Ground Ozone", val: 32.4, unit: "µg/m³", limit: 100, sub: 32, status: "Good", color: "from-cyan-500 to-blue-500" },
  { code: "NH3", name: "Ammonia", val: 24.0, unit: "µg/m³", limit: 400, sub: 12, status: "Good", color: "from-emerald-500 to-teal-600" },
  { code: "Pb", name: "Lead Trace", val: 0.12, unit: "µg/m³", limit: 1.0, sub: 8, status: "Good", color: "from-slate-500 to-slate-700" }
];

const wardLeaderboard = [
  { rank: 1, name: "Hadapsar Industrial", ward: "Ward 15", aqi: 134, dominant: "PM2.5", status: "Moderate", pct: 72, color: "bg-amber-500" },
  { rank: 2, name: "Hinjewadi Tech Hub", ward: "Ward 25", aqi: 82, dominant: "NO2", status: "Satisfactory", pct: 50, color: "bg-blue-600" },
  { rank: 3, name: "Shivajinagar Central", ward: "Ward 7", aqi: 68, dominant: "PM2.5", status: "Satisfactory", pct: 42, color: "bg-blue-600" },
  { rank: 4, name: "Kothrud Depot", ward: "Ward 10", aqi: 54, dominant: "PM10", status: "Satisfactory", pct: 34, color: "bg-blue-600" },
  { rank: 5, name: "Katraj Lake Basin", ward: "Ward 21", aqi: 39, dominant: "O3", status: "Good", pct: 24, color: "bg-emerald-500" }
];

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("24 Hours");
  const [activeParameter, setActiveParameter] = useState("aqi");

  const getAqiCategory = (val) => {
    if (val <= 50) return { label: "Good", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (val <= 100) return { label: "Satisfactory", badge: "bg-green-50 text-green-700 border-green-200" };
    if (val <= 200) return { label: "Moderate", badge: "bg-amber-50 text-amber-700 border-amber-200" };
    if (val <= 300) return { label: "Poor", badge: "bg-orange-50 text-orange-700 border-orange-200" };
    return { label: "Severe", badge: "bg-rose-50 text-rose-700 border-rose-200" };
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-mono">
          <p className="text-slate-400 font-bold mb-1.5">{label} Observation</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color }} className="font-semibold flex justify-between gap-3">
              <span>{item.name.toUpperCase()}:</span>
              <span className="text-white">{item.value} {item.name === "aqi" ? "AQI" : "µg/m³"}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header with Audit Subtitles & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Environmental Telemetry</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">CPCB Historical Trend Diagnostics</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Air Quality Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              5 Municipal Stations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Diurnal multi-pollutant curves, dispersion compliance, and ward historical trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            <span>Timezone: IST (UTC+5:30)</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition"
          >
            <RefreshCw size={13} />
            <span>Re-compute Models</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 High-End KPI Metrics with Floating Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        
        {/* Average AQI */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mean 24h AQI</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
              <Activity size={18} />
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">68.4</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
              Satisfactory
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Safe ambient breathing range</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
            <span className="flex items-center gap-1">
              <TrendingDown size={14} />
              -6.2% vs. yesterday
            </span>
            <span className="text-slate-400 font-normal">24h Weighted</span>
          </div>
        </div>

        {/* Highest Hotspot */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Highest Hotspot AQI</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-inner">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-amber-600">134</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
              Moderate Dust
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Hadapsar Industrial (Ward 15)</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-rose-600">
            <span className="flex items-center gap-1">
              <AlertTriangle size={13} />
              PM2.5 Peak: 84.6 µg
            </span>
            <span className="text-slate-400 font-normal">Active work site</span>
          </div>
        </div>

        {/* Data Availability */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Data Availability Rate</span>
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shadow-inner">
              <Database size={18} />
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">99.4%</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-sky-50 text-sky-700 border-sky-200">
              Verified QA/QC
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Passes CPCB &gt; 95% validity rule</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} />
              0 Discarded Packets
            </span>
            <span className="text-slate-400 font-normal">Continuous Link</span>
          </div>
        </div>

        {/* Monitored Stations */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monitoring Station Grid</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
              <BarChart3 size={18} />
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">5 / 5</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
              100% Online
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">All Pune municipal nodes active</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>5 Calibrated Stations</span>
            <span className="text-emerald-600 font-bold">0 Timeout</span>
          </div>
        </div>

      </div>

      {/* 3. Centerpiece: Recharts Trend Curve with Multi-Parameter Selection */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] mb-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Historical Atmospheric Observation Curves
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                CPCB Standard
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative analysis across diurnal intervals: Overall AQI vs. PM2.5 & PM10 concentrations.
            </p>
          </div>

          {/* Time Filter Pill Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              {["24 Hours", "7 Days", "30 Days"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    selectedPeriod === period
                      ? "bg-white text-blue-600 shadow-sm font-black"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Recharts Canvas */}
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={analyticsTelemetry[selectedPeriod]}
              margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="chartAqiFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />

              <YAxis
                domain={[0, 160]}
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* AQI Gradient Area */}
              <Area
                type="monotone"
                dataKey="aqi"
                name="aqi"
                stroke="#2563eb"
                strokeWidth={3}
                fill="url(#chartAqiFill)"
                dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 7, stroke: "#2563eb", strokeWidth: 2 }}
              />

              {/* PM2.5 Line */}
              <Line
                type="monotone"
                dataKey="pm25"
                name="pm2.5"
                stroke="#f43f5e"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#f43f5e" }}
              />

              {/* PM10 Line */}
              <Line
                type="monotone"
                dataKey="pm10"
                name="pm10"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Legend Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-slate-800">Overall Air Quality Index (AQI)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500" />
              <span className="text-slate-800">Fine Smoke (PM2.5)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-500" />
              <span className="text-slate-800">Coarse Dust (PM10)</span>
            </span>
          </div>

          <span className="text-slate-400 font-normal">
            CPCB NAAQS Satisfactory Threshold: ≤ 100 AQI
          </span>
        </div>
      </div>

      {/* 4. Section: 8 NAAQS Criteria Pollutants Strip */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] mb-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">National Ambient Air Quality Standards (NAAQS) Summary</h2>
            <p className="text-xs text-slate-400">Current 24h parameter observations vs. official CPCB limits</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            8 Parameters Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {criteriaParameters.map((item) => (
            <div
              key={item.code}
              className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900 font-black">{item.code}</span>
                <span className="text-[10px] font-mono text-slate-400">Sub: {item.sub}</span>
              </div>
              <div className="text-lg font-black mt-1 text-slate-900">
                {item.val}
                <span className="text-[10px] font-normal text-slate-400 block">{item.unit}</span>
              </div>
              
              {/* Proportional Progress Track */}
              <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                  style={{ width: `${Math.min((item.val / item.limit) * 100, 100)}%` }}
                />
              </div>

              <div className="mt-2 text-[10px] text-slate-400">
                Limit: {item.limit} {item.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Section: Ward-wise Comparison Stack */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Ward Air Quality Ranking & Severity</h2>
            <p className="text-xs text-slate-400">Continuous telemetry ordered by pollution severity across Pune municipal zones</p>
          </div>
          <span className="text-xs font-bold text-slate-500">5 Monitored Stations</span>
        </div>

        <div className="space-y-4 my-auto">
          {wardLeaderboard.map((ward) => {
            const cat = getAqiCategory(ward.aqi);
            return (
              <div 
                key={ward.rank} 
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-xs font-mono font-black text-slate-400">#{ward.rank}</span>
                    <span className="text-slate-900 font-extrabold text-sm">{ward.name}</span>
                    <span className="text-slate-400 text-xs font-normal">({ward.ward})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{ward.aqi} AQI</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cat.badge}`}>
                      {cat.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-2">
                  <span>Dominant Parameter: <strong className="text-slate-700">{ward.dominant}</strong> (Sub-index driver)</span>
                  <span className="text-slate-400">Threshold: &lt; 100 Normal</span>
                </div>

                {/* Progress Track */}
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${ward.color} transition-all duration-700`}
                    style={{ width: `${ward.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span>Continuous Ambient Air Quality Monitoring (CAAQM) Network</span>
          <span>Calibrated via CPCB Approved Sensor Nodes</span>
        </div>
      </div>

    </div>
  );
}
=======
>>>>>>> Stashed changes
