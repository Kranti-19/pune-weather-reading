// <<<<<<< Updated upstream
import React, { useState } from "react";
import {
  Wind,
  Droplets,
  Thermometer,
  CloudRain,
  Smile,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  MapPin,
  Activity,
  Calendar,
  Filter,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("24 Hours");
  const [chartMetric, setChartMetric] = useState("AQI");

  // Top 4 High-Tech KPI Cards with Sparklines & Visual Badges
  const topMetrics = [
    {
      title: "Current Air Status",
      value: "68",
      unit: "AQI",
      badge: "Satisfactory",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      simpleMeaning: "Safe for outdoor walks & activities",
      trend: "-6.2%",
      isPositive: true,
      sparkColor: "#2563eb",
      points: "0,16 15,13 30,15 45,8 60,10 75,4 90,7 105,2",
      icon: Wind,
      iconBg: "bg-blue-50 text-blue-600"
    },
    {
      title: "Main Smoke / Dust",
      value: "38.2",
      unit: "µg/m³",
      badge: "PM2.5 Sourced",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      simpleMeaning: "Traffic soot & construction dust",
      trend: "+4.1%",
      isPositive: false,
      sparkColor: "#f43f5e",
      points: "0,14 15,15 30,9 45,11 60,6 75,8 90,3 105,1",
      icon: Activity,
      iconBg: "bg-rose-50 text-rose-600"
    },
    {
      title: "Active Stations",
      value: "5 / 5",
      unit: "Live",
      badge: "100% Online",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      simpleMeaning: "All city sensors transmitting valid data",
      trend: "Optimal",
      isPositive: true,
      sparkColor: "#0284c7",
      points: "0,5 15,7 30,5 45,9 60,8 75,11 90,10 105,13",
      icon: ShieldCheck,
      iconBg: "bg-sky-50 text-sky-600"
    },
    {
      title: "Outdoor Weather",
      value: "27.6°C",
      unit: "74% RH",
      badge: "Pleasant",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      simpleMeaning: "Comfortable temperature across Pune",
      trend: "Warm",
      isPositive: true,
      sparkColor: "#f59e0b",
      points: "0,11 15,9 30,10 45,6 60,7 75,5 90,4 105,3",
      icon: Thermometer,
      iconBg: "bg-amber-50 text-amber-600"
    }
  ];

  // Ward ranking with active construction projects & infrastructure sites
  const wardRankings = [
    { 
      rank: 1, 
      projectName: "Amanora Gateway Towers (Phase 3)", 
      siteType: "High-Rise Construction", 
      location: "Hadapsar • Ward 15", 
      aqi: 134, 
      status: "Dust Mitigation Due", 
      meaning: "Active concrete batching & excavation; water sprinklers required", 
      pct: 72, 
      color: "from-amber-500 to-orange-500", 
      tag: "bg-amber-50 text-amber-800 border-amber-200" 
    },
    { 
      rank: 2, 
      projectName: "EON Free Zone Cluster C", 
      siteType: "IT Park Expansion", 
      location: "Kharadi • Ward 17", 
      aqi: 82, 
      status: "Covering Verified", 
      meaning: "Dry debris covered with green mesh; anti-smog guns operational", 
      pct: 50, 
      color: "from-blue-600 to-sky-400", 
      tag: "bg-blue-50 text-blue-700 border-blue-200" 
    },
    { 
      rank: 3, 
      projectName: "Pune Metro Line 3 Elevated Pier", 
      siteType: "Infrastructure Transit", 
      location: "Shivajinagar • Ward 7", 
      aqi: 68, 
      status: "Compliant", 
      meaning: "Barricaded drilling zone; road sweeping vehicle active", 
      pct: 42, 
      color: "from-blue-600 to-sky-400", 
      tag: "bg-blue-50 text-blue-700 border-blue-200" 
    },
    { 
      rank: 4, 
      projectName: "Godrej Hillside Township", 
      siteType: "Residential Complex", 
      location: "Mahalunge-Hinjewadi", 
      aqi: 54, 
      status: "Compliant", 
      meaning: "Standard foundation work; boundary dust sensors normal", 
      pct: 34, 
      color: "from-blue-600 to-sky-400", 
      tag: "bg-blue-50 text-blue-700 border-blue-200" 
    },
    { 
      rank: 5, 
      projectName: "Rohan Ekam Waterfront", 
      siteType: "Commercial Tower", 
      location: "Balewadi • Ward 9", 
      aqi: 39, 
      status: "Low Emission", 
      meaning: "Internal finishing phase; zero exterior particulate drift", 
      pct: 24, 
      color: "from-emerald-500 to-teal-400", 
      tag: "bg-emerald-50 text-emerald-800 border-emerald-200" 
    }
  ];

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* 1. Header with Breadcrumb, Live Indicator & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Pune Municipal Corporation</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">CAAQM Air Quality Network</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pune Environmental Command Portal
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live 5 Stations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Real-time air health observations, pollutant breakdown, and ward rankings.</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            <span>Last 24 Hours</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition"
          >
            <RefreshCw size={13} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 High-Tech KPI Cards with Inline Splines & Uniform Baselines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {topMetrics.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{kpi.title}</span>
                  <div className={`w-8 h-8 rounded-2xl ${kpi.iconBg} flex items-center justify-center font-bold shadow-inner`}>
                    <Icon size={16} />
                  </div>
                </div>

                <div className="my-3 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</span>
                    <span className="text-xs font-semibold text-slate-400">{kpi.unit}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${kpi.badgeColor}`}>
                    {kpi.badge}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-medium line-clamp-1">{kpi.simpleMeaning}</div>
              </div>

              {/* Sparkline & Trend Row with Parallel Baseline Alignment */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-end justify-between">
                <span className={`text-xs font-bold ${kpi.isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                  {kpi.trend}
                </span>
                <div className="w-20 h-6">
                  <svg viewBox="0 0 105 20" className="w-full h-full overflow-visible">
                    <polyline
                      fill="none"
                      stroke={kpi.sparkColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={kpi.points}
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Centerpiece: Glowing Diurnal Spline Wave Chart + Radial Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left 8 Cols: Smooth Wave Spline Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">How Air Quality Changed Throughout The Day</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Past 24 Hours
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Air is cleanest early morning; slight dust rise during afternoon traffic peak.</p>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              {["AQI", "Smoke (PM2.5)", "Dust (PM10)"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChartMetric(tab)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    chartMetric === tab 
                      ? "bg-white text-blue-600 shadow-sm font-black" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Wave Canvas */}
          <div className="relative h-64 w-full flex flex-col justify-end">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-dashed border-slate-200 w-full" />
              <div className="border-b border-dashed border-slate-200 w-full" />
              <div className="border-b border-dashed border-slate-200 w-full" />
              <div className="border-b border-dashed border-slate-200 w-full" />
            </div>

            <div className="relative h-full w-full">
              <svg viewBox="0 0 700 200" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                <defs>
                  <linearGradient id="waveBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="waveSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Secondary Cyan Dispersion Wave */}
                <path
                  d="M0,140 C90,165 180,105 270,130 C370,160 460,80 550,110 C620,130 700,95 700,95 L700,200 L0,200 Z"
                  fill="url(#waveSky)"
                />
                <path
                  d="M0,140 C90,165 180,105 270,130 C370,160 460,80 550,110 C620,130 700,95 700,95"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                />

                {/* Primary Royal Blue AQI Wave */}
                <path
                  d="M0,115 C85,80 170,140 260,90 C350,40 430,120 520,60 C590,30 650,85 700,50 L700,200 L0,200 Z"
                  fill="url(#waveBlue)"
                />
                <path
                  d="M0,115 C85,80 170,140 260,90 C350,40 430,120 520,60 C590,30 650,85 700,50"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                />

                {/* Active Highlight Pin on 14:00 */}
                <circle cx="520" cy="60" r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
              </svg>

              {/* Tooltip Card */}
              <div className="absolute top-2 left-[74%] -translate-x-1/2 bg-slate-900 text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs font-mono pointer-events-none">
                <div className="text-sky-400 font-black">02:00 PM • 84 AQI</div>
                <div className="text-[10px] text-slate-300">Afternoon Traffic Peak</div>
              </div>
            </div>

            {/* Time X-Axis */}
            <div className="flex justify-between text-[11px] font-bold text-slate-400 pt-3 border-t border-slate-100">
              <span>12 AM</span>
              <span>04 AM</span>
              <span>08 AM</span>
              <span>12 PM</span>
              <span>04 PM</span>
              <span>08 PM</span>
              <span>11 PM</span>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 font-semibold border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Overall City AQI</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>Breeze & Wind Dispersion</span>
              </span>
            </div>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
              ✓ Both parameters within safe CPCB limits
            </span>
          </div>
        </div>

        {/* Right 4 Cols: Radial Donut Pollutant Distribution */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">What's in the Air?</h2>
              <p className="text-xs text-slate-400">Main sources of pollution today</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Live Breakdown</span>
          </div>

          {/* Radial Donut */}
          <div className="relative my-6 flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="3.6" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="#2563eb" strokeDasharray="42, 100" strokeWidth="3.6" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="#38bdf8" strokeDasharray="26, 100" strokeDashoffset="-42" strokeWidth="3.6" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="#6366f1" strokeDasharray="18, 100" strokeDashoffset="-68" strokeWidth="3.6" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="#cbd5e1" strokeDasharray="14, 100" strokeDashoffset="-86" strokeWidth="3.6" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 tracking-tight">42%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 mt-0.5">
                Vehicle Smoke (PM2.5)
              </span>
            </div>
          </div>

          {/* Clean Plain Legend */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-800">Vehicle Soot & Exhaust (PM2.5)</span>
              </div>
              <span className="font-black text-slate-900">42%</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-slate-800">Road Dust & Sand (PM10)</span>
              </div>
              <span className="font-black text-slate-900">26%</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-800">Traffic Fuel Gases (NO2)</span>
              </div>
              <span className="font-black text-slate-900">18%</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-slate-800">Factory & Natural Gases</span>
              </div>
              <span className="font-black text-slate-900">14%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Bottom Section: Construction Sites Progress Bars & Simple CPCB Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Construction Sites Air Quality Leaderboard */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Active Construction Sites & Building Projects</h2>
              <p className="text-xs text-slate-400">CPCB particulate and dust emission audit for ongoing developments</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              5 Sites Monitored
            </span>
          </div>

          <div className="space-y-4 my-auto">
            {wardRankings.map((site) => (
              <div key={site.rank} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-xs font-mono font-black text-slate-400">#{site.rank}</span>
                    <span className="text-slate-900 font-extrabold text-sm">{site.projectName}</span>
                    <span className="text-slate-400 text-xs font-normal">({site.location})</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{site.aqi} AQI</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${site.tag}`}>
                      {site.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-2">
                  <span>{site.meaning}</span>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">{site.siteType}</span>
                </div>

                {/* Gradient Progress Track */}
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${site.color} transition-all duration-700`}
                    style={{ width: `${site.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Violations reported automatically to: <strong>PMC Building Permission & Encroachment Dept</strong></span>
          </div>
        </div>

        {/* Right 5 Cols: Universal Traffic Light Guide */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">Official Color Meaning Guide</h2>
              <span className="text-xs font-bold text-slate-400 font-mono">(CPCB NAAQS)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Quick color guide to understand what each air number means</p>
          </div>

          <div className="space-y-2.5 my-4">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="font-black text-emerald-900">0 – 50 • Clean / Good</div>
                  <div className="text-[11px] text-emerald-700">Mountain-fresh clean air. Perfect for everyone.</div>
                </div>
              </div>
              <span className="font-bold text-emerald-800 text-[11px]">Katraj</span>
            </div>

            <div className="p-3 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-green-600 shrink-0" />
                <div>
                  <div className="font-black text-green-900">51 – 100 • Satisfactory (Today's Level)</div>
                  <div className="text-[11px] text-green-700">Healthy normal air. Safe for sports and morning walks.</div>
                </div>
              </div>
              <span className="font-bold text-green-800 text-[11px]">Shivajinagar</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="font-black text-amber-900">101 – 200 • Moderate</div>
                  <div className="text-[11px] text-amber-700">Noticeable dust. People with asthma should take care.</div>
                </div>
              </div>
              <span className="font-bold text-amber-800 text-[11px]">Hadapsar</span>
            </div>

            <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shrink-0" />
                <div>
                  <div className="font-black text-orange-900">201 – 300 • Poor / Unhealthy</div>
                  <div className="text-[11px] text-orange-700">Wear dust masks. Avoid heavy outdoor exercise.</div>
                </div>
              </div>
              <span className="text-[11px] text-orange-600 font-bold">0 Wards</span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 shrink-0" />
                <div>
                  <div className="font-black text-rose-900">301+ • Very Poor / Emergency</div>
                  <div className="text-[11px] text-rose-700">Stay indoors with windows closed. Hazard level.</div>
                </div>
              </div>
              <span className="text-[11px] text-rose-600 font-bold">0 Wards</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200/60 text-blue-900 text-xs flex items-center gap-2">
            <Info size={15} className="text-blue-600 shrink-0" />
            <span>All values comply with India CPCB National Ambient Air Quality Standards.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
// =======
// >>>>>>> Stashed changes
