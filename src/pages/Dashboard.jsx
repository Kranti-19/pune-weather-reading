import React, { useState } from "react";
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

/* =========================================================
   24-HOUR AIR QUALITY DATA
========================================================= */

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

/* =========================================================
   STATION DATA
========================================================= */

const STATIONS = [
  {
    code: "PMC-001",
    name: "Shivajinagar Central",
    ward: "Ward 7",
    zone: "Central Zone",
    aqi: 68,
    dominant: "PM2.5",
    pm25: 38.2,
    status: "Satisfactory",
    health: "Healthy",
    trend: "-4%",
  },
  {
    code: "PMC-002",
    name: "Kothrud Depot Basin",
    ward: "Ward 10",
    zone: "West Zone",
    aqi: 54,
    dominant: "PM10",
    pm25: 28.1,
    status: "Satisfactory",
    health: "Healthy",
    trend: "-6%",
  },
  {
    code: "PMC-003",
    name: "Hadapsar Industrial",
    ward: "Ward 15",
    zone: "East Zone",
    aqi: 134,
    dominant: "PM2.5",
    pm25: 84.6,
    status: "Moderate",
    health: "Warning",
    trend: "+8%",
  },
  {
    code: "PMC-004",
    name: "Katraj Lake Reserve",
    ward: "Ward 21",
    zone: "South Zone",
    aqi: 39,
    dominant: "O3",
    pm25: 18.4,
    status: "Good",
    health: "Healthy",
    trend: "-11%",
  },
  {
    code: "PMC-005",
    name: "Hinjewadi Tech Corridor",
    ward: "Ward 25",
    zone: "North-West Zone",
    aqi: 82,
    dominant: "NO2",
    pm25: 44.0,
    status: "Satisfactory",
    health: "Maintenance",
    trend: "+2%",
  },
];

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const [activePollutant, setActivePollutant] = useState("aqi");

  /* =======================================================
     REQUIRED 7 KPIs
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
            <span className="text-blue-600 font-bold">
              Pune Municipal Corporation
            </span>
          </div>

          <div className="flex items-center gap-2.5">

            <ShieldCheck
              size={23}
              className="text-blue-600"
            />

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Air Quality Command Portal
            </h1>

          </div>

          <p className="text-[11px] text-slate-400 mt-1.5">
            Air quality monitoring and station health overview
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
          7 REQUIRED KPI CARDS
          DESKTOP = ONE ROW
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">

        {KPI_DATA.map((kpi) => {

          const Icon = kpi.icon;

          return (
            <div
              key={kpi.title}
              className="bg-white rounded-[16px] px-3 py-3 shadow-sm border border-slate-100 flex items-center justify-between gap-2 min-w-0 hover:shadow-md transition"
            >

              <div className="min-w-0 flex-1">

                {/* KPI Title */}

                <span className="text-[8.5px] font-bold uppercase tracking-tight text-slate-400 block mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  {kpi.title}
                </span>

                {/* KPI Value */}

                <div
                  className={`text-xl font-black leading-none ${kpi.valueColor}`}
                >
                  {kpi.value}
                </div>

                {/* Description */}

                <span className="text-[8.5px] font-medium text-slate-400 mt-1.5 block leading-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {kpi.description}
                </span>

                {/* Status */}

                <span className="text-[8.5px] font-bold text-slate-500 mt-0.5 block whitespace-nowrap overflow-hidden text-ellipsis">
                  {kpi.status}
                </span>

              </div>

              {/* Icon */}

              <div
                className={`w-8 h-8 flex-shrink-0 rounded-lg ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center`}
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

          {/* Healthy */}

          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">

            <div className="flex items-center gap-1.5 text-emerald-700">

              <CheckCircle2 size={15} />

              <span className="text-[10px] font-bold">
                Healthy
              </span>

            </div>

            <div className="text-xl font-black text-emerald-700 mt-1.5">
              3
            </div>

          </div>

          {/* Warning */}

          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">

            <div className="flex items-center gap-1.5 text-amber-700">

              <AlertTriangle size={15} />

              <span className="text-[10px] font-bold">
                Warning
              </span>

            </div>

            <div className="text-xl font-black text-amber-700 mt-1.5">
              1
            </div>

          </div>

          {/* Maintenance */}

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">

            <div className="flex items-center gap-1.5 text-blue-700">

              <Wrench size={15} />

              <span className="text-[10px] font-bold">
                Maintenance
              </span>

            </div>

            <div className="text-xl font-black text-blue-700 mt-1.5">
              1
            </div>

          </div>

          {/* Failed */}

          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3">

            <div className="flex items-center gap-1.5 text-rose-700">

              <XCircle size={15} />

              <span className="text-[10px] font-bold">
                Failed
              </span>

            </div>

            <div className="text-xl font-black text-rose-700 mt-1.5">
              0
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          24 HOUR TREND
      ===================================================== */}

      <div className="bg-white rounded-[22px] p-5 sm:p-6 shadow-sm border border-slate-100 mb-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

          <div>

            <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
              HISTORICAL TELEMETRY
            </span>

            <h2 className="text-sm font-black text-slate-900 mt-2">
              24-Hour Air Quality Trend
            </h2>

            <p className="text-[10px] text-slate-400 mt-1">
              Hourly observations across the monitoring network.
            </p>

          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">

            <button
              onClick={() => setActivePollutant("aqi")}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${
                activePollutant === "aqi"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Overall AQI
            </button>

            <button
              onClick={() => setActivePollutant("pm25")}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${
                activePollutant === "pm25"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              PM2.5
            </button>

            <button
              onClick={() => setActivePollutant("pm10")}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${
                activePollutant === "pm10"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              PM10
            </button>

          </div>

        </div>

        <div className="h-56 w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart
              data={HOURLY_TRENDS}
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
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "10px",
                  border: "none",
                  color: "#fff",
                  fontSize: "11px",
                }}
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

            <span className="text-[10px] font-bold">
              2 Active
            </span>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* AQI Alert */}

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

          {/* Maintenance Alert */}

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

      <div className="bg-white rounded-[22px] p-5 sm:p-6 shadow-sm border border-slate-100">

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

                <th className="pb-3 pl-2">
                  Station
                </th>

                <th className="pb-3">
                  Ward & Zone
                </th>

                <th className="pb-3">
                  AQI
                </th>

                <th className="pb-3">
                  Dominant
                </th>

                <th className="pb-3">
                  PM2.5
                </th>

                <th className="pb-3">
                  AQI Status
                </th>

                <th className="pb-3">
                  Sensor Health
                </th>

                <th className="pb-3 pr-2 text-right">
                  Trend
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100 text-[11px]">

              {STATIONS.map((station) => (

                <tr
                  key={station.code}
                  className="hover:bg-slate-50/70 transition"
                >

                  {/* Station */}

                  <td className="py-3.5 pl-2">

                    <span className="font-bold text-slate-900 block">
                      {station.name}
                    </span>

                    <span className="font-mono text-[9px] text-blue-600 font-semibold">
                      {station.code}
                    </span>

                  </td>

                  {/* Ward */}

                  <td className="py-3.5 text-slate-600 font-medium">

                    {station.ward}

                    <span className="block text-[9px] text-slate-400">
                      {station.zone}
                    </span>

                  </td>

                  {/* AQI */}

                  <td className="py-3.5 font-mono text-sm font-black text-slate-900">
                    {station.aqi}
                  </td>

                  {/* Dominant */}

                  <td className="py-3.5 font-semibold text-slate-700">
                    {station.dominant}
                  </td>

                  {/* PM2.5 */}

                  <td className="py-3.5 font-mono font-semibold text-slate-800">

                    {station.pm25}

                    <span className="text-slate-400 text-[8px] ml-1">
                      µg/m³
                    </span>

                  </td>

                  {/* AQI Status */}

                  <td className="py-3.5">

                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold ${getStatusBadge(
                        station.status
                      )}`}
                    >
                      {station.status}
                    </span>

                  </td>

                  {/* Sensor Health */}

                  <td className="py-3.5">
                    {getHealthBadge(station.health)}
                  </td>

                  {/* Trend */}

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

        <span>
          Air Quality Monitoring System • PMC
        </span>

        <span>
          Monitoring 5 registered stations
        </span>

      </div>

    </div>
  );
}