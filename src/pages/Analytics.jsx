import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Database,
  BarChart3,
  Calendar,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import API from "../api/apiClient";

const PERIODS = ["24 Hours", "7 Days", "30 Days"];

const getAqiCategory = (value) => {
  const val = Number(value) || 0;

  if (val <= 50)
    return {
      label: "Good",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };

  if (val <= 100)
    return {
      label: "Satisfactory",
      badge: "bg-green-50 text-green-700 border-green-200",
    };

  if (val <= 200)
    return {
      label: "Moderate",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
    };

  if (val <= 300)
    return {
      label: "Poor",
      badge: "bg-orange-50 text-orange-700 border-orange-200",
    };

  return {
    label: "Severe",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  };
};

const formatNumber = (value, digits = 1) => {
  if (value === null || value === undefined || value === "") return "N/A";

  const number = Number(value);

  if (!Number.isFinite(number)) return "N/A";

  return number.toFixed(digits);
};

const getPeriodRows = (data, period) => {
  if (!data) return [];

  if (period === "24 Hours") return data["24 Hours"] || [];
  if (period === "7 Days") return data["7 Days"] || [];
  return data["30 Days"] || [];
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-mono">
      <p className="text-slate-400 font-bold mb-1.5">
        {label} Observation
      </p>

      {payload.map((item, index) => (
        <p
          key={index}
          className="font-semibold flex justify-between gap-4"
        >
          <span>{String(item.name).toUpperCase()}:</span>
          <span className="text-white">
            {item.value}{" "}
            {item.name === "aqi" ? "AQI" : "µg/m³"}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("24 Hours");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setRefreshing(true);
      setError("");

      const response = await API.get("/analytics");

      const payload = response?.data;

      setAnalytics(
        payload?.analytics ||
          payload?.data ||
          payload ||
          null
      );
    } catch (err) {
      console.error("Analytics API error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load analytics from the backend."
      );

      setAnalytics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const chartData = useMemo(
    () => getPeriodRows(analytics?.telemetry, selectedPeriod),
    [analytics, selectedPeriod]
  );

  const kpi = analytics?.kpis || {};

  const criteriaParameters =
    analytics?.criteriaParameters || [];

  const wardLeaderboard =
    analytics?.wardLeaderboard || [];

  const stationCount = Number(
    kpi.totalStations || 0
  );

  const onlineStations = Number(
    kpi.onlineStations || 0
  );

  const onlinePercentage =
    stationCount > 0
      ? ((onlineStations / stationCount) * 100).toFixed(0)
      : "0";

  const meanAqi = Number(kpi.mean24hAqi || 0);

  const meanAqiCategory = getAqiCategory(meanAqi);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#edf2f7] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw
            size={24}
            className="animate-spin text-blue-600"
          />
          <span className="font-semibold">
            Loading air quality analytics...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Environmental Telemetry</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">
              CPCB Historical Trend Diagnostics
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
              Air Quality Analytics
            </h1>

            
          </div>

          
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            <span>Timezone: IST (UTC+5:30)</span>
          </div>

          <button
            onClick={loadAnalytics}
            disabled={refreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition"
          >
            <RefreshCw
              size={13}
              className={refreshing ? "animate-spin" : ""}
            />
            <span>
              {refreshing ? "Refreshing..." : "Refresh Analytics"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-sm">
          <strong>Backend error:</strong> {error}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

        {/* MEAN AQI */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mean 24h AQI
            </span>

            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">
              {formatNumber(kpi.mean24hAqi, 1)}
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meanAqiCategory.badge}`}
            >
              {kpi.mean24hAqi != null
                ? meanAqiCategory.label
                : "N/A"}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Average AQI from actual database observations
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
            {kpi.aqiChangePercent !== null &&
            kpi.aqiChangePercent !== undefined ? (
              <span
                className={`flex items-center gap-1 ${
                  Number(kpi.aqiChangePercent) <= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {Number(kpi.aqiChangePercent) <= 0 ? (
                  <TrendingDown size={14} />
                ) : (
                  <TrendingUp size={14} />
                )}
                {Number(kpi.aqiChangePercent) > 0 ? "+" : ""}
                {formatNumber(kpi.aqiChangePercent, 1)}%
                vs. previous period
              </span>
            ) : (
              <span className="text-slate-400">
                Comparison unavailable
              </span>
            )}

            <span className="text-slate-400 font-normal">
              24h Weighted
            </span>
          </div>
        </div>

        {/* HOTSPOT */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Highest Hotspot AQI
            </span>

            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-amber-600">
              {formatNumber(kpi.highestHotspot?.aqi, 0)}
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
              {kpi.highestHotspot?.category || "N/A"}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            {kpi.highestHotspot?.name || "No station data"}
            {kpi.highestHotspot?.ward
              ? ` (${kpi.highestHotspot.ward})`
              : ""}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-rose-600">
            <span className="flex items-center gap-1">
              <AlertTriangle size={13} />
              Dominant:{" "}
              {kpi.highestHotspot?.dominant || "N/A"}
            </span>

            <span className="text-slate-400 font-normal">
              Latest reading
            </span>
          </div>
        </div>

        {/* AVAILABILITY */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Data Availability Rate
            </span>

            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Database size={18} />
            </div>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">
              {formatNumber(kpi.dataAvailability, 1)}%
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-sky-50 text-sky-700 border-sky-200">
              Database
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Calculated from available station reading records
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} />
              {kpi.validReadings ?? 0} Valid Records
            </span>

            <span className="text-slate-400 font-normal">
              {kpi.totalReadings ?? 0} Total
            </span>
          </div>
        </div>

        {/* STATIONS */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monitoring Station Grid
            </span>

            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">
              {onlineStations} / {stationCount}
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
              {onlinePercentage}% Online
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Actual station status from database
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>
              {kpi.calibratedStations ?? 0} Calibrated Stations
            </span>

            <span className="text-emerald-600 font-bold">
              {kpi.offlineStations ?? 0} Offline
            </span>
          </div>
        </div>
      </div>

      {/* HISTORICAL CHART */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] mb-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Historical Atmospheric Observation Curves
              </h2>
            </div>

            
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            {PERIODS.map((period) => (
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

        <div className="h-80 w-full mt-4">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{
                  top: 15,
                  right: 25,
                  left: -10,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient
                    id="chartAqiFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563eb"
                      stopOpacity={0.25}
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
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="time"
                  tick={{
                    fontSize: 11,
                    fill: "#94a3b8",
                    fontWeight: 600,
                  }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />

                <YAxis
                  domain={[0, "auto"]}
                  tick={{
                    fontSize: 11,
                    fill: "#94a3b8",
                    fontWeight: 600,
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="aqi"
                  name="aqi"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#chartAqiFill)"
                  dot={{
                    r: 4,
                    fill: "#2563eb",
                    strokeWidth: 2,
                    stroke: "#ffffff",
                  }}
                  activeDot={{
                    r: 7,
                    stroke: "#2563eb",
                    strokeWidth: 2,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="pm25"
                  name="pm2.5"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#f43f5e" }}
                />

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
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              No historical observations available in the database
              for this period.
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-slate-800">
                Overall Air Quality Index (AQI)
              </span>
            </span>

            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500" />
              <span className="text-slate-800">
                Fine Smoke (PM2.5)
              </span>
            </span>

            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-500" />
              <span className="text-slate-800">
                Coarse Dust (PM10)
              </span>
            </span>
          </div>

          
        </div>
      </div>

      {/* NAAQS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] mb-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">
              National Ambient Air Quality Standards (NAAQS) Summary
            </h2>

            
          </div>

          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {criteriaParameters.length} Parameters Active
          </span>
        </div>

        {criteriaParameters.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {criteriaParameters.map((item) => {
              const value = Number(item.val);
              const limit = Number(item.limit);

              const width =
                Number.isFinite(value) &&
                Number.isFinite(limit) &&
                limit > 0
                  ? Math.min((value / limit) * 100, 100)
                  : 0;

              return (
                <div
                  key={item.code}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 font-black">
                      {item.code}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      Sub:{" "}
                      {item.sub === null ||
                      item.sub === undefined
                        ? "N/A"
                        : item.sub}
                    </span>
                  </div>

                  <div className="text-lg font-black mt-1 text-slate-900">
                    {item.val === null ||
                    item.val === undefined
                      ? "N/A"
                      : formatNumber(item.val, 2)}

                    <span className="text-[10px] font-normal text-slate-400 block">
                      {item.unit || "N/A"}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${
                        item.status === "Good"
                          ? "bg-emerald-500"
                          : item.status === "Moderate"
                          ? "bg-amber-500"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400">
                    Limit: {item.limit ?? "N/A"}{" "}
                    {item.unit || ""}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-slate-400">
            No pollutant observations are available.
          </div>
        )}
      </div>

      {/* STATION RANKING */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Station Air Quality Ranking & Severity
            </h2>

            
          </div>

          <span className="text-xs font-bold text-slate-500">
            {wardLeaderboard.length} Stations
          </span>
        </div>

        {wardLeaderboard.length ? (
          <div className="space-y-4 my-auto">
            {wardLeaderboard.map((station, index) => {
              const category = getAqiCategory(station.aqi);

              const pct = Math.min(
                (Number(station.aqi || 0) / 300) * 100,
                100
              );

              return (
                <div
                  key={
                    station.station_id ||
                    station.id ||
                    index
                  }
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition"
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-xs font-mono font-black text-slate-400">
                        #{index + 1}
                      </span>

                      <span className="text-slate-900 font-extrabold text-sm">
                        {station.name}
                      </span>

                      {station.ward && (
                        <span className="text-slate-400 text-xs font-normal">
                          ({station.ward})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">
                        {formatNumber(station.aqi, 0)} AQI
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${category.badge}`}
                      >
                        {station.category ||
                          category.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-2">
                    <span>
                      Dominant Parameter:{" "}
                      <strong className="text-slate-700">
                        {station.dominant || "N/A"}
                      </strong>
                    </span>

                    <span className="text-slate-400">
                      Latest database observation
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        Number(station.aqi) > 200
                          ? "bg-rose-500"
                          : Number(station.aqi) > 100
                          ? "bg-amber-500"
                          : "bg-blue-600"
                      } transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-slate-400">
            No station AQI data is available.
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
          
        </div>
      </div>
    </div>
  );
}
