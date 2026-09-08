import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wind,
  Radio,
  WifiOff,
  MapPin,
  Bell,
  Database,
  Activity,
  RefreshCw,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  XCircle,
  ChevronDown,
  Navigation
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import PuneMap from "../components/PuneMap";

/* =========================================================
   24-HOUR AIR QUALITY DATA BY AREA
========================================================= */

const AREA_HOURLY_TRENDS = {
  all: [
    { time: "06:00", aqi: 48, pm25: 22, pm10: 50, areaName: "Shivajinagar Central", ward: "Citywide Baseline", status: "Good" },
    { time: "08:00", aqi: 62, pm25: 34, pm10: 68, areaName: "Shivajinagar Central", ward: "Citywide Average", status: "Satisfactory" },
    { time: "10:00", aqi: 75, pm25: 42, pm10: 85, areaName: "Hadapsar Industrial", ward: "Citywide Average", status: "Satisfactory" },
    { time: "12:00", aqi: 70, pm25: 39, pm10: 80, areaName: "Hinjewadi Tech Corridor", ward: "Citywide Average", status: "Satisfactory" },
    { time: "14:00", aqi: 84, pm25: 49, pm10: 95, areaName: "Hadapsar Industrial", ward: "Citywide Average", status: "Satisfactory" },
    { time: "16:00", aqi: 78, pm25: 44, pm10: 88, areaName: "Hadapsar Industrial", ward: "Citywide Average", status: "Satisfactory" },
    { time: "18:00", aqi: 68, pm25: 38, pm10: 78, areaName: "Shivajinagar Central", ward: "Citywide Average", status: "Satisfactory" },
    { time: "20:00", aqi: 58, pm25: 30, pm10: 64, areaName: "Kothrud Depot Basin", ward: "Citywide Baseline", status: "Satisfactory" },
  ],
  "PMC-001": [
    { time: "06:00", aqi: 42, pm25: 19, pm10: 44, areaName: "Shivajinagar Central", ward: "Ward 7 • Central Zone", status: "Good" },
    { time: "08:00", aqi: 64, pm25: 35, pm10: 70, areaName: "Shivajinagar Central", ward: "Ward 7 • Central Zone", status: "Satisfactory" },
    { time: "10:00", aqi: 72, pm25: 40, pm10: 82, areaName: "Shivajinagar Central", ward: "Ward 7 • Central Zone", status: "Satisfactory" },
    { time: "12:00", aqi: 68, pm25: 38, pm10: 78, areaName: "Shivajinagar Central", ward: "Ward 7 • Central Zone", status: "Satisfactory" },
    { time: "14:00", aqi: 76, pm25: 44, pm10: 86, areaName: "Shivajinagar Central", ward: "Ward 7 • Central Zone", status: "Satisfactory" },
    { time: "16:00", aqi: 70, pm25: 39, pm10: 80, areaName: "Shivajinagar Central", ward: "Ward 7 • Central Zone", status: "Satisfactory" },
    { time: "18:00", aqi: 62, pm25: 34, pm10: 68, areaName: "Shivajinagar Central", ward: "Ward 7 • Central Zone", status: "Satisfactory" },
    { time: "20:00", aqi: 50, pm25: 25, pm10: 55, areaName: "Shivajinagar Central", ward: "Ward 7 • Central Zone", status: "Good" },
  ],
  "PMC-002": [
    { time: "06:00", aqi: 35, pm25: 16, pm10: 38, areaName: "Kothrud Depot Basin", ward: "Ward 10 • West Zone", status: "Good" },
    { time: "08:00", aqi: 52, pm25: 27, pm10: 58, areaName: "Kothrud Depot Basin", ward: "Ward 10 • West Zone", status: "Satisfactory" },
    { time: "10:00", aqi: 58, pm25: 30, pm10: 66, areaName: "Kothrud Depot Basin", ward: "Ward 10 • West Zone", status: "Satisfactory" },
    { time: "12:00", aqi: 54, pm25: 28, pm10: 62, areaName: "Kothrud Depot Basin", ward: "Ward 10 • West Zone", status: "Satisfactory" },
    { time: "14:00", aqi: 60, pm25: 32, pm10: 70, areaName: "Kothrud Depot Basin", ward: "Ward 10 • West Zone", status: "Satisfactory" },
    { time: "16:00", aqi: 56, pm25: 29, pm10: 64, areaName: "Kothrud Depot Basin", ward: "Ward 10 • West Zone", status: "Satisfactory" },
    { time: "18:00", aqi: 48, pm25: 23, pm10: 54, areaName: "Kothrud Depot Basin", ward: "Ward 10 • West Zone", status: "Good" },
    { time: "20:00", aqi: 42, pm25: 20, pm10: 46, areaName: "Kothrud Depot Basin", ward: "Ward 10 • West Zone", status: "Good" },
  ],
  "PMC-003": [
    { time: "06:00", aqi: 92, pm25: 58, pm10: 110, areaName: "Hadapsar Industrial", ward: "Ward 15 • East Zone", status: "Satisfactory" },
    { time: "08:00", aqi: 118, pm25: 72, pm10: 135, areaName: "Hadapsar Industrial", ward: "Ward 15 • East Zone", status: "Moderate" },
    { time: "10:00", aqi: 128, pm25: 80, pm10: 148, areaName: "Hadapsar Industrial", ward: "Ward 15 • East Zone", status: "Moderate" },
    { time: "12:00", aqi: 134, pm25: 85, pm10: 152, areaName: "Hadapsar Industrial", ward: "Ward 15 • East Zone", status: "Moderate" },
    { time: "14:00", aqi: 140, pm25: 90, pm10: 160, areaName: "Hadapsar Industrial", ward: "Ward 15 • East Zone", status: "Moderate" },
    { time: "16:00", aqi: 130, pm25: 82, pm10: 145, areaName: "Hadapsar Industrial", ward: "Ward 15 • East Zone", status: "Moderate" },
    { time: "18:00", aqi: 115, pm25: 70, pm10: 130, areaName: "Hadapsar Industrial", ward: "Ward 15 • East Zone", status: "Moderate" },
    { time: "20:00", aqi: 98, pm25: 60, pm10: 118, areaName: "Hadapsar Industrial", ward: "Ward 15 • East Zone", status: "Satisfactory" },
  ],
  "PMC-004": [
    { time: "06:00", aqi: 28, pm25: 12, pm10: 30, areaName: "Katraj Lake Reserve", ward: "Ward 21 • South Zone", status: "Good" },
    { time: "08:00", aqi: 34, pm25: 15, pm10: 38, areaName: "Katraj Lake Reserve", ward: "Ward 21 • South Zone", status: "Good" },
    { time: "10:00", aqi: 39, pm25: 18, pm10: 45, areaName: "Katraj Lake Reserve", ward: "Ward 21 • South Zone", status: "Good" },
    { time: "12:00", aqi: 38, pm25: 17, pm10: 42, areaName: "Katraj Lake Reserve", ward: "Ward 21 • South Zone", status: "Good" },
    { time: "14:00", aqi: 44, pm25: 20, pm10: 50, areaName: "Katraj Lake Reserve", ward: "Ward 21 • South Zone", status: "Good" },
    { time: "16:00", aqi: 40, pm25: 19, pm10: 46, areaName: "Katraj Lake Reserve", ward: "Ward 21 • South Zone", status: "Good" },
    { time: "18:00", aqi: 36, pm25: 16, pm10: 40, areaName: "Katraj Lake Reserve", ward: "Ward 21 • South Zone", status: "Good" },
    { time: "20:00", aqi: 30, pm25: 13, pm10: 32, areaName: "Katraj Lake Reserve", ward: "Ward 21 • South Zone", status: "Good" },
  ],
  "PMC-005": [
    { time: "06:00", aqi: 55, pm25: 28, pm10: 60, areaName: "Hinjewadi Tech Corridor", ward: "Ward 25 • North-West Zone", status: "Satisfactory" },
    { time: "08:00", aqi: 76, pm25: 41, pm10: 82, areaName: "Hinjewadi Tech Corridor", ward: "Ward 25 • North-West Zone", status: "Satisfactory" },
    { time: "10:00", aqi: 85, pm25: 46, pm10: 92, areaName: "Hinjewadi Tech Corridor", ward: "Ward 25 • North-West Zone", status: "Satisfactory" },
    { time: "12:00", aqi: 82, pm25: 44, pm10: 90, areaName: "Hinjewadi Tech Corridor", ward: "Ward 25 • North-West Zone", status: "Satisfactory" },
    { time: "14:00", aqi: 88, pm25: 48, pm10: 96, areaName: "Hinjewadi Tech Corridor", ward: "Ward 25 • North-West Zone", status: "Satisfactory" },
    { time: "16:00", aqi: 80, pm25: 43, pm10: 88, areaName: "Hinjewadi Tech Corridor", ward: "Ward 25 • North-West Zone", status: "Satisfactory" },
    { time: "18:00", aqi: 74, pm25: 39, pm10: 80, areaName: "Hinjewadi Tech Corridor", ward: "Ward 25 • North-West Zone", status: "Satisfactory" },
    { time: "20:00", aqi: 62, pm25: 32, pm10: 68, areaName: "Hinjewadi Tech Corridor", ward: "Ward 25 • North-West Zone", status: "Satisfactory" },
  ]
};

/* =========================================================
   STATION DATA WITH LAT/LNG COORDINATES FOR MAP
========================================================= */

const STATIONS = [
  {
    id: 1,
    code: "PMC-001",
    name: "Shivajinagar Central",
    ward: "Ward 7",
    zone: "Central Zone",
    latitude: 18.5314,
    longitude: 73.8446,
    aqi: 68,
    dominant: "PM2.5",
    pm25: 38.2,
    status: "Satisfactory",
    health: "Healthy",
    trend: "-4%"
  },
  {
    id: 2,
    code: "PMC-002",
    name: "Kothrud Depot Basin",
    ward: "Ward 10",
    zone: "West Zone",
    latitude: 18.5074,
    longitude: 73.8077,
    aqi: 54,
    dominant: "PM10",
    pm25: 28.1,
    status: "Satisfactory",
    health: "Healthy",
    trend: "-6%"
  },
  {
    id: 3,
    code: "PMC-003",
    name: "Hadapsar Industrial",
    ward: "Ward 15",
    zone: "East Zone",
    latitude: 18.5089,
    longitude: 73.9260,
    aqi: 134,
    dominant: "PM2.5",
    pm25: 84.6,
    status: "Moderate",
    health: "Warning",
    trend: "+8%"
  },
  {
    id: 4,
    code: "PMC-004",
    name: "Katraj Lake Reserve",
    ward: "Ward 21",
    zone: "South Zone",
    latitude: 18.4575,
    longitude: 73.8677,
    aqi: 39,
    dominant: "O3",
    pm25: 18.4,
    status: "Good",
    health: "Healthy",
    trend: "-11%"
  },
  {
    id: 5,
    code: "PMC-005",
    name: "Hinjewadi Tech Corridor",
    ward: "Ward 25",
    zone: "North-West Zone",
    latitude: 18.5913,
    longitude: 73.7389,
    aqi: 82,
    dominant: "NO2",
    pm25: 44.0,
    status: "Satisfactory",
    health: "Maintenance",
    trend: "+2%"
  },
];

/* =========================================================
   CUSTOM TOOLTIP WITH AREA INFO
========================================================= */

const CustomAreaTooltip = ({ active, payload, label, activeMetric }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    const unit = activeMetric === "aqi" ? "AQI" : "µg/m³";

    const getStatusStyle = (status) => {
      switch (status) {
        case "Good":
          return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
        case "Satisfactory":
          return "bg-green-500/15 text-green-400 border-green-500/30";
        default:
          return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      }
    };

    return (
      <div className="bg-slate-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-xl border border-slate-800 text-[11px] min-w-[200px]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-mono text-slate-400 font-semibold">{label} Hrs</span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusStyle(data.status)}`}>
            {data.status}
          </span>
        </div>

        <div className="mt-2.5">
          <div className="flex items-center gap-1.5 text-slate-200 font-bold">
            <MapPin size={11} className="text-blue-400 flex-shrink-0" />
            <span className="truncate">{data.areaName}</span>
          </div>
          <span className="text-[10px] text-slate-400 pl-4 block mt-0.5">{data.ward}</span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
          <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">
            {activeMetric.toUpperCase()} Level
          </span>
          <span className="text-sm font-black font-mono text-white">
            {value} <span className="text-[10px] font-medium text-slate-400">{unit}</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

/* =========================================================
   DASHBOARD COMPONENT
========================================================= */

export default function Dashboard() {
  const navigate = useNavigate();
  const [activePollutant, setActivePollutant] = useState("aqi");
  const [selectedArea, setSelectedArea] = useState("all");

  const currentHourlyData = AREA_HOURLY_TRENDS[selectedArea] || AREA_HOURLY_TRENDS.all;

  /* =======================================================
     REQUIRED 7 KPIs (WITH NAVIGATION PATHS)
  ======================================================= */

  const KPI_DATA = [
    {
      title: "Overall AQI",
      value: "68",
      description: "Current AQI",
      status: "Satisfactory",
      icon: Wind,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      valueColor: "text-slate-900",
      path: "/pune-areas",
    },
    {
      title: "Active Stations",
      value: "5",
      description: "Valid data",
      status: "5 of 5 active",
      icon: Radio,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-600",
      path: "/pune-areas",
    },
    {
      title: "Offline Stations",
      value: "0",
      description: "Communication timeout",
      status: "All online",
      icon: WifiOff,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-500",
      valueColor: "text-slate-900",
      path: "/device-health",
    },
    {
      title: "High AQI Areas",
      value: "1",
      description: "Highest AQI area",
      status: "Hadapsar",
      icon: MapPin,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      valueColor: "text-amber-600",
      path: "/station/PMC-003",
    },
    {
      title: "Active Alerts",
      value: "2",
      description: "Unresolved alerts",
      status: "Attention required",
      icon: Bell,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      valueColor: "text-rose-600",
      path: "/alerts",
    },
    {
      title: "Data Availability",
      value: "98.6%",
      description: "Expected data received",
      status: "Good coverage",
      icon: Database,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      valueColor: "text-indigo-600",
      path: "/reports",
    },
    {
      title: "Sensor Health",
      value: "3/1/1",
      description: "H / W / M",
      status: "5 monitored",
      icon: Activity,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      valueColor: "text-slate-900",
      path: "/device-health",
    },
  ];

  /* =======================================================
     AQI STATUS BADGE
  ======================================================= */

  const getStatusBadge = (status) => {
    switch (status) {
      case "Good":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      case "Satisfactory":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Moderate":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Poor":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      default:
        return "bg-rose-50 text-rose-700 border border-rose-200";
    }
  };

  /* =======================================================
     SENSOR HEALTH BADGE
  ======================================================= */

  const getHealthBadge = (health) => {
    switch (health) {
      case "Healthy":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={10} />
            Healthy
          </span>
        );
      case "Warning":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle size={10} />
            Warning
          </span>
        );
      case "Maintenance":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Wrench size={10} />
            Maintenance
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={10} />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3f8] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1">
            <span>Executive Command</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">Pune Municipal Corporation</span>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck size={23} className="text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Air Quality Command Portal
            </h1>
          </div>

          <p className="text-[11px] text-slate-400 mt-1.5">
            Real-time sensory telemetry and municipal air health observations across Pune.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <RefreshCw size={13} />
            <span>Refresh Stations</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3.5 py-2 rounded-lg shadow-md shadow-blue-600/20 transition"
          >
            <FileSpreadsheet size={13} />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          7 REQUIRED KPI CARDS (CLICKABLE)
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <div
              key={kpi.title}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (kpi.path) navigate(kpi.path);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && kpi.path) navigate(kpi.path);
              }}
              className="bg-white rounded-[16px] px-3 py-3 shadow-sm border border-slate-100 flex items-center justify-between gap-2 min-w-0 cursor-pointer hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 select-none group"
            >
              <div className="min-w-0 flex-1 text-left">
                <span className="text-[8.5px] font-bold uppercase tracking-tight text-slate-400 block mb-1 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-blue-600 transition-colors">
                  {kpi.title}
                </span>

                <div className={`text-xl font-black leading-none ${kpi.valueColor}`}>
                  {kpi.value}
                </div>

                <span className="text-[8.5px] font-medium text-slate-400 mt-1.5 block leading-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {kpi.description}
                </span>

                <span className="text-[8.5px] font-bold text-slate-500 mt-0.5 block whitespace-nowrap overflow-hidden text-ellipsis">
                  {kpi.status}
                </span>
              </div>

              <div
                className={`w-8 h-8 flex-shrink-0 rounded-lg ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}
              >
                <Icon size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          SENSOR HEALTH SUMMARY
      ===================================================== */}

      <div className="bg-white rounded-[22px] p-5 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              SENSOR STATUS
            </span>
            <h2 className="text-sm font-black text-slate-900 mt-1">
              Sensor Health Overview
            </h2>
          </div>

          <span className="text-[10px] font-semibold text-slate-400">
            5 sensors monitored
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 size={15} />
              <span className="text-[10px] font-bold">Healthy</span>
            </div>
            <div className="text-xl font-black text-emerald-700 mt-1.5">3</div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
            <div className="flex items-center gap-1.5 text-amber-700">
              <AlertTriangle size={15} />
              <span className="text-[10px] font-bold">Warning</span>
            </div>
            <div className="text-xl font-black text-amber-700 mt-1.5">1</div>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
            <div className="flex items-center gap-1.5 text-blue-700">
              <Wrench size={15} />
              <span className="text-[10px] font-bold">Maintenance</span>
            </div>
            <div className="text-xl font-black text-blue-700 mt-1.5">1</div>
          </div>

          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3">
            <div className="flex items-center gap-1.5 text-rose-700">
              <XCircle size={15} />
              <span className="text-[10px] font-bold">Failed</span>
            </div>
            <div className="text-xl font-black text-rose-700 mt-1.5">0</div>
          </div>
        </div>
      </div>

      {/* =====================================================
          24 HOUR TREND WITH AREA CONTEXT & SELECTOR
      ===================================================== */}

      <div className="bg-white rounded-[22px] p-5 sm:p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                HISTORICAL TELEMETRY
              </span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                <MapPin size={10} className="text-blue-500" />
                {selectedArea === "all" ? "Citywide Observation" : STATIONS.find(s => s.code === selectedArea)?.name}
              </span>
            </div>

            <h2 className="text-sm font-black text-slate-900 mt-2">
              24-Hour Air Quality Trend
            </h2>

            <p className="text-[10px] text-slate-400 mt-1">
              Hourly sensor telemetry breakdown with reporting ward context.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold pl-3 pr-7 py-1.5 rounded-lg outline-none cursor-pointer transition"
              >
                <option value="all">All Stations (Average)</option>
                {STATIONS.map((station) => (
                  <option key={station.code} value={station.code}>
                    {station.name} ({station.ward})
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActivePollutant("aqi")}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${
                  activePollutant === "aqi"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Overall AQI
              </button>

              <button
                onClick={() => setActivePollutant("pm25")}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${
                  activePollutant === "pm25"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                PM2.5
              </button>

              <button
                onClick={() => setActivePollutant("pm10")}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${
                  activePollutant === "pm10"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                PM10
              </button>
            </div>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={currentHourlyData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="airQualityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#2563eb"
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="95%"
                    stopColor="#2563eb"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#edf2f7"
              />

              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                domain={[0, "dataMax + 15"]}
              />

              <Tooltip
                content={<CustomAreaTooltip activeMetric={activePollutant} />}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
              />

              <Area
                type="monotone"
                dataKey={activePollutant}
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#airQualityGradient)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =====================================================
          MUNICIPAL GIS STATION COVERAGE MAP
      ===================================================== */}

      <div className="bg-white rounded-[22px] p-5 sm:p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900">
                Municipal GIS Station Coverage
              </h2>
              <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">
                Live Geofence
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Geospatial placement and real-time CPCB air quality heat map across Pune wards
            </p>
          </div>

          <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-1">
            <Navigation size={12} />
            5 database stations mapped
          </span>
        </div>

        <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-200/80 shadow-inner">
          <PuneMap stations={STATIONS} />
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-4 pt-3 border-t border-slate-100 text-[9.5px] font-bold text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Good (0–50)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]"></span>
            Satisfactory (51–100)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            Moderate (101–200)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            Poor (201–300)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Very Poor (301–400)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-800"></span>
            Severe (401–500)
          </span>
        </div>
      </div>

      {/* =====================================================
          ACTIVE ALERTS
      ===================================================== */}

      <div className="bg-white rounded-[22px] p-5 sm:p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500">
              ATTENTION REQUIRED
            </span>
            <h2 className="text-sm font-black text-slate-900 mt-1">
              Active Alerts
            </h2>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
            <Bell size={11} />
            <span className="text-[10px] font-bold">2 Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-slate-900">
                High AQI detected
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                Hadapsar Industrial — AQI 134
              </p>
              <span className="text-[9px] font-bold text-amber-600 mt-1.5 block">
                Air Quality Alert
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Wrench size={16} />
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-slate-900">
                Sensor maintenance required
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                Hinjewadi Tech Corridor
              </p>
              <span className="text-[9px] font-bold text-blue-600 mt-1.5 block">
                Device Alert
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          STATION REGISTRY
      ===================================================== */}

      <div className="bg-white rounded-[22px] p-5 sm:p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              MONITORING NETWORK
            </span>
            <h2 className="text-sm font-black text-slate-900 mt-1">
              Registered CAAQM Station Registry
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Current station-level AQI and sensor health status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold">
              5 Active
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-[9px] font-bold">
              0 Offline
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Station</th>
                <th className="pb-3">Ward & Zone</th>
                <th className="pb-3">AQI</th>
                <th className="pb-3">Dominant</th>
                <th className="pb-3">PM2.5</th>
                <th className="pb-3">AQI Status</th>
                <th className="pb-3">Sensor Health</th>
                <th className="pb-3 pr-2 text-right">Trend</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-[11px]">
              {STATIONS.map((station) => (
                <tr
                  key={station.code}
                  className="hover:bg-slate-50/70 transition"
                >
                  <td className="py-3.5 pl-2">
                    <span className="font-bold text-slate-900 block">
                      {station.name}
                    </span>
                    <span className="font-mono text-[9px] text-blue-600 font-semibold">
                      {station.code}
                    </span>
                  </td>

                  <td className="py-3.5 text-slate-600 font-medium">
                    {station.ward}
                    <span className="block text-[9px] text-slate-400">
                      {station.zone}
                    </span>
                  </td>

                  <td className="py-3.5 font-mono text-sm font-black text-slate-900">
                    {station.aqi}
                  </td>

                  <td className="py-3.5 font-semibold text-slate-700">
                    {station.dominant}
                  </td>

                  <td className="py-3.5 font-mono font-semibold text-slate-800">
                    {station.pm25}
                    <span className="text-slate-400 text-[8px] ml-1">µg/m³</span>
                  </td>

                  <td className="py-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold ${getStatusBadge(
                        station.status
                      )}`}
                    >
                      {station.status}
                    </span>
                  </td>

                  <td className="py-3.5">
                    {getHealthBadge(station.health)}
                  </td>

                  <td className="py-3.5 pr-2 text-right font-mono font-bold text-slate-600">
                    {station.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 text-[9px] text-slate-400">
        <span>Air Quality Monitoring System • PMC</span>
        <span>Monitoring 5 registered stations</span>
      </div>

    </div>
  );
}