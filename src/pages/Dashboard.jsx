// <<<<<<< HEAD
// =======
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AirQualityCalendar from "../components/AirQualityCalendar";
import MajorPollutantGrid from "../components/MajorPollutantGrid";
import WardPollutionLeaderboard from "../components/WardPollutionLeaderboard";

import {
  Wind,
  Radio,
  WifiOff,
  Bell,
  Database,
  CloudSun,
  Droplets,
  Gauge,
  Navigation,
  RefreshCw,
  CheckCircle2,
  Maximize2,
  Activity,
  BarChart3,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

import PuneMap from "../components/PuneMap";

const API_URL = "http://localhost:5000/api/dashboard";

// =====================================================
// HELPERS
// =====================================================

const numberValue = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const getAqiCategory = (value) => {
  const aqi = numberValue(value);
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
};

const getAqiClass = (value) => {
  const aqi = numberValue(value);
  if (aqi <= 50) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (aqi <= 100) return "bg-lime-50 text-lime-700 border-lime-200";
  if (aqi <= 200) return "bg-amber-50 text-amber-700 border-amber-200";
  if (aqi <= 300) return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
};

const AQI_SCALE = [
  { max: 50, label: "Good", color: "#4ade80" },
  { max: 100, label: "Satisfactory", color: "#a3e635" },
  { max: 200, label: "Moderate", color: "#facc15" },
  { max: 300, label: "Poor", color: "#fb923c" },
  { max: 400, label: "Very Poor", color: "#f43f5e" },
  { max: Infinity, label: "Severe", color: "#9f1239" },
];

const getChartColor = (value) => {
  const aqi = numberValue(value);
  return (AQI_SCALE.find((band) => aqi <= band.max) || AQI_SCALE[AQI_SCALE.length - 1]).color;
};

const getAlertClass = (severity) => {
  const value = String(severity || "").toLowerCase();

  if (value === "critical") {
    return {
      row: "bg-red-50/60 hover:bg-red-50 border-red-100",
      badge: "bg-red-500 text-white",
    };
  }

  if (value === "warning") {
    return {
      row: "bg-amber-50/60 hover:bg-amber-50 border-amber-100",
      badge: "bg-amber-400 text-white",
    };
  }

  return {
    row: "bg-blue-50/60 hover:bg-blue-50 border-blue-100",
    badge: "bg-blue-500 text-white",
  };
};

const formatTime = (timestamp) => {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const wrapText = (text, maxCharacters = 12) => {
  if (!text) return [];
  const words = String(text).split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= maxCharacters) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  return lines;
};

function WrappedXAxisTick({ x, y, payload, maxCharacters = 12 }) {
  const lines = wrapText(payload?.value, maxCharacters);

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text
          key={index}
          x={0}
          y={index * 13}
          dy={12}
          textAnchor="middle"
          fill="#475569"
          fontSize={10}
          fontWeight={600}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function TooltipShell({ label, children }) {
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm text-white border border-slate-800 rounded-xl shadow-xl px-3.5 py-2.5 min-w-[140px]">
      {label != null && (
        <div className="text-[11px] font-bold text-slate-300 pb-1.5 mb-1.5 border-b border-slate-700/80">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <TooltipShell label={label}>
      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="flex items-center justify-between gap-4 text-[11px] mb-1 last:mb-0"
        >
          <span className="text-slate-400 font-medium">
            {item.dataKey === "aqi"
              ? "AQI"
              : item.dataKey === "pm25"
              ? "PM2.5"
              : "PM10"}
          </span>
          <strong className="text-white font-mono font-black">
            {item.value ?? "—"}
          </strong>
        </div>
      ))}
    </TooltipShell>
  );
};

const AqiBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const value = numberValue(payload[0].value);
  const color = getChartColor(value);

  return (
    <TooltipShell label={label}>
      <div className="flex items-center justify-between gap-4 text-[11px]">
        <span className="text-slate-400 font-medium">AQI</span>
        <strong className="text-white font-mono font-black">{value}</strong>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[10.5px] font-bold" style={{ color }}>
          {getAqiCategory(value)}
        </span>
      </div>
    </TooltipShell>
  );
};

const PollutantBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload || {};
  const value = numberValue(point.value);
  const standard = numberValue(point.standard);
  const exceeds = standard > 0 && value > standard;

  return (
    <TooltipShell label={label}>
      <div className="flex items-center justify-between gap-4 text-[11px]">
        <span className="text-slate-400 font-medium">Reading</span>
        <strong className="text-white font-mono font-black">
          {value.toFixed(1)} µg/m³
        </strong>
      </div>
      {standard > 0 && (
        <div className="flex items-center justify-between gap-4 text-[11px] mt-1">
          <span className="text-slate-400 font-medium">Standard</span>
          <span className="text-slate-300 font-mono font-semibold">
            {standard.toFixed(1)} µg/m³
          </span>
        </div>
      )}
      <div className="flex items-center gap-1.5 mt-1.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: exceeds ? "#f43f5e" : "#4ade80" }}
        />
        <span
          className="text-[10.5px] font-bold"
          style={{ color: exceeds ? "#f43f5e" : "#22c55e" }}
        >
          {exceeds ? "Above standard" : "Within standard"}
        </span>
      </div>
    </TooltipShell>
  );
};

const chartCursor = { fill: "#2563eb", fillOpacity: 0.05, radius: 6 };

function AqiScaleLegend({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3.5 gap-y-1.5 ${className}`}>
      {AQI_SCALE.map((band) => (
        <span key={band.label} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: band.color }}
          />
          <span className="text-[9.5px] font-bold text-slate-500">{band.label}</span>
        </span>
      ))}
    </div>
  );
}

// =====================================================
// MAIN DASHBOARD COMPONENT
// =====================================================

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState("24h");

  const fetchPuneWeather = async () => {
    try {
      setWeatherLoading(true);
      setWeatherError("");

      const response = await fetch("http://localhost:5000/api/weather/pune");
      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Unable to load current Pune weather.");
      }

      setLiveWeather(result.weather || null);
    } catch (err) {
      console.error("Pune weather error:", err);
      setWeatherError(err.message || "Unable to load current Pune weather.");
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);

      const response = await fetch(`${API_URL}?range=${range}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Dashboard request failed.");
      }

      if (result.status !== "success") {
        throw new Error(result.message || "Unable to load dashboard.");
      }

      setDashboard(result.data || {});
      setError("");
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);
    const interval = setInterval(() => fetchDashboard(false), 10000);
    return () => clearInterval(interval);
  }, [range]);

  useEffect(() => {
    fetchPuneWeather();
    const weatherInterval = setInterval(() => fetchPuneWeather(), 10 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);

  const data = dashboard || {};
  const stations = Array.isArray(data.stations) ? data.stations : [];
  const pollutants = Array.isArray(data.pollutants) ? data.pollutants : [];
  const wards = Array.isArray(data.wards) ? data.wards : [];
  const trends = Array.isArray(data.trends) ? data.trends : [];
  const alerts = Array.isArray(data.alerts) ? data.alerts : [];

  const aqi = numberValue(data.aqi);
  const category = data.category || getAqiCategory(aqi);
  const dominant = data.dominant || "N/A";
  const totalStations = numberValue(data.totalStations, stations.length);
  const onlineStations = numberValue(
    data.onlineStations,
    stations.filter((station) => station.online).length
  );
  const offlineStations = numberValue(
    data.offlineStations,
    Math.max(totalStations - onlineStations, 0)
  );

  const activeAlerts = alerts.filter((alert) => {
    const status = String(alert.acknowledgement || "").toLowerCase();
    return status === "" || status === "acknowledged";
  });

  const weather = liveWeather || data.weather || {};
  const sensorHealth = data.sensorHealth || {};

  const pollutantChartData = pollutants.map((pollutant) => ({
    name: pollutant.name,
    value: pollutant.value === null ? 0 : numberValue(pollutant.value),
    standard: numberValue(pollutant.standard),
  }));

  const wardChartData = wards.map((ward) => ({
    name: ward.ward,
    aqi: numberValue(ward.aqi),
  }));

  const stationChartData = stations.map((station) => ({
    name: station.name,
    aqi: numberValue(station.aqi),
    ward: station.ward,
  }));

  const trendData = useMemo(
    () =>
      trends.map((item) => ({
        ...item,
        aqi: item.aqi === null ? null : numberValue(item.aqi),
        pm25: item.pm25 === null ? null : numberValue(item.pm25),
        pm10: item.pm10 === null ? null : numberValue(item.pm10),
      })),
    [trends]
  );

  const trendAccent = getChartColor(aqi);

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-[#eef3f7] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-6 text-center">
          <RefreshCw size={28} className="mx-auto text-blue-600 animate-spin" />
          <p className="text-base font-bold text-slate-700 mt-3">
            Loading dashboard...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Fetching live monitoring telemetry
          </p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-[#eef3f7] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm px-8 py-6 text-center max-w-md">
          <WifiOff size={32} className="mx-auto text-red-500" />
          <h2 className="text-base font-black text-slate-800 mt-3">
            Dashboard unavailable
          </h2>
          <p className="text-xs text-slate-500 mt-2">{error}</p>
          <button
            onClick={() => fetchDashboard(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef3f7] text-slate-800 p-3.5 sm:p-6 font-sans">
      
      {/* =================================================
          HEADER
      ================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <span>Executive Command</span>
            <span>/</span>
            <span className="text-blue-600">Pune Municipal Corporation</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <ShieldCheck size={20} className="text-white" />
            </div>

            <div>
              <h1
                style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}
                className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-none"
              >
                Air Quality Command Portal
              </h1>
              
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {data.telemetryStatus || "Live Geofence"}
          </span>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm"
            title="Refresh Stations"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin text-blue-600" : ""}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
          Latest telemetry refresh timed out. Retaining synchronized database metrics.
        </div>
      )}

      {/* =================================================
          ROW 1 - KPI CARDS
      ================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <button
          type="button"
          onClick={() => navigate("/analytics")}
          className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5"
        >
          <div className="flex items-center gap-1.5">
            <Wind size={15} className="text-blue-600" />
            <span className="text-[11.5px] font-extrabold text-slate-500 uppercase tracking-tight">
              Overall AQI
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-[34px] leading-none font-black font-mono text-slate-900">
              {Math.round(aqi)}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getAqiClass(aqi)}`}>
              {category}
            </span>
          </div>

          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            Dominant: <strong className="text-slate-700 font-bold">{dominant}</strong>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/pune-areas")}
          className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5"
        >
          <div className="flex items-center gap-1.5">
            <Radio size={15} className="text-blue-500" />
            <span className="text-[11.5px] font-extrabold text-slate-500 uppercase tracking-tight">
              Total Stations
            </span>
          </div>

          <div className="text-3xl sm:text-[34px] leading-none font-black font-mono text-slate-900 mt-2">
            {totalStations}
          </div>

          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            5 registered stations
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/device-health")}
          className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11.5px] font-extrabold text-slate-500 uppercase tracking-tight">
              Online Stations
            </span>
          </div>

          <div className="text-3xl sm:text-[34px] leading-none font-black font-mono text-emerald-600 mt-2">
            {onlineStations}
          </div>

          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            Reporting normally
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/device-health")}
          className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200 bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[11.5px] font-extrabold text-slate-500 uppercase tracking-tight">
              Offline Stations
            </span>
          </div>

          <div className={`text-3xl sm:text-[34px] leading-none font-black font-mono mt-2 ${
            offlineStations > 0 ? "text-red-500" : "text-slate-900"
          }`}>
            {offlineStations}
          </div>

          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            Communication status
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/alerts")}
          className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200 bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5"
        >
          <div className="flex items-center gap-1.5">
            <Bell size={15} className="text-rose-500" />
            <span className="text-[11.5px] font-extrabold text-slate-500 uppercase tracking-tight">
              Active Alerts
            </span>
          </div>

          <div className={`text-3xl sm:text-[34px] leading-none font-black font-mono mt-2 ${
            activeAlerts.length > 0 ? "text-rose-600" : "text-slate-900"
          }`}>
            {activeAlerts.length}
          </div>

          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            Attention required
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/analytics")}
          className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5"
        >
          <div className="flex items-center gap-1.5">
            <Database size={15} className="text-indigo-500" />
            <span className="text-[11.5px] font-extrabold text-slate-500 uppercase tracking-tight">
              Availability
            </span>
          </div>

          <div className="text-3xl sm:text-[34px] leading-none font-black font-mono text-slate-900 mt-2">
            {numberValue(data.dataAvailability, 98.6).toFixed(1)}%
          </div>

          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            Expected data received
          </div>
        </button>
      </div>

      {/* =================================================
          ROW 2 - MAJOR POLLUTANTS + WEATHER CAPSULE
      ================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_0.8fr] gap-3 mb-4">
        {/* Left: Refined Major Pollutant Ribbon Cards */}
        <MajorPollutantGrid pollutants={pollutants} />

        {/* Right: Ambient Weather Module */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between mb-4 lg:mb-0">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <CloudSun size={18} className="text-blue-500" />
                <h2 className="text-sm font-black text-slate-800">
                  Weather (Pune)
                </h2>
              </div>
              {liveWeather?.updatedAt && (
                <span className="text-[9px] font-semibold text-slate-400">
                  Updated {liveWeather.updatedAt}
                </span>
              )}
            </div>

            {weatherLoading ? (
              <div className="h-[160px] flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <RefreshCw size={15} className="animate-spin text-blue-500" />
                  Loading meteorological data...
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3.5 mb-3">
                  {weather.icon ? (
                    <img
                      src={weather.icon.startsWith("//") ? `https:${weather.icon}` : weather.icon}
                      alt={weather.condition || "Weather"}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <CloudSun size={38} className="text-amber-400" />
                  )}

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Ambient Temp
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900">
                      {weather.temperature != null ? `${weather.temperature} °C` : "28.5 °C"}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {weather.condition || "Current conditions"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <WeatherRow
                    icon={<Droplets size={15} />}
                    label="Relative Humidity"
                    value={weather.humidity != null ? `${weather.humidity}%` : "68%"}
                  />
                  <WeatherRow
                    icon={<Wind size={15} />}
                    label="Wind Velocity"
                    value={weather.windSpeed != null ? `${weather.windSpeed} km/h` : "3.8 km/h"}
                  />
                  <WeatherRow
                    icon={<Navigation size={15} />}
                    label="Wind Heading"
                    value={weather.windDirectionText || (weather.windDirection ? `${weather.windDirection}°` : "185° S")}
                  />
                  <WeatherRow
                    icon={<Gauge size={15} />}
                    label="Barometric Press."
                    value={weather.pressure != null ? `${weather.pressure} hPa` : "1008.4 hPa"}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          ROW 3 - MONITORING STATION MAP
      ================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <MapPin size={15} className="text-blue-600" />
            </div>
            <h2 className="text-sm font-black text-slate-800">
              Pune Municipal GIS Spatial Monitoring
            </h2>
          </div>
          <Maximize2 size={15} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
        </div>

        <div className="w-full h-[360px] sm:h-[400px] rounded-xl overflow-hidden border border-slate-200/80 shadow-inner">
          <PuneMap stations={stations} />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-2.5 border-t border-slate-100 text-[10px] font-bold text-slate-600">
          <MapLegend color="bg-emerald-500" label="Good (0–50)" />
          <MapLegend color="bg-lime-500" label="Satisfactory (51–100)" />
          <MapLegend color="bg-amber-400" label="Moderate (101–200)" />
          <MapLegend color="bg-orange-500" label="Poor (201–300)" />
          <MapLegend color="bg-rose-500" label="Very Poor (301–400)" />
          <MapLegend color="bg-red-800" label="Severe (401+)" />
        </div>
      </div>

      {/* HISTORICAL AIR QUALITY CALENDAR */}
      <AirQualityCalendar />

      {/* RANKED WARD POLLUTION LEADERBOARD */}
      <WardPollutionLeaderboard stations={stations} />

      {/* AQI TREND & POLLUTANT LEVELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {/* ... */}
      </div>

      {/* =================================================
          ROW 5 - AQI TREND + POLLUTANT LEVELS
      ================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {/* AQI TREND */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity size={15} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-black text-slate-800">
                AQI Observation Trend
              </h2>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                ["24h", "24 Hours"],
                ["7d", "7 Days"],
                ["30d", "30 Days"],
              ].map((item) => (
                <button
                  key={item[0]}
                  onClick={() => setRange(item[0])}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
                    range === item[0]
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[240px]">
            {trendData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={trendAccent} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={trendAccent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" fontSize={10} stroke="#94a3b8" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis fontSize={10} stroke="#94a3b8" tickLine={false} axisLine={false} width={32} />
                  <ReferenceLine
                    y={100}
                    stroke="#cbd5e1"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                    label={{
                      value: "Moderate ≥100",
                      position: "insideTopRight",
                      fill: "#94a3b8",
                      fontSize: 9,
                      fontWeight: 700,
                    }}
                  />
                  <Tooltip content={<TrendTooltip />} cursor={{ stroke: trendAccent, strokeWidth: 1, strokeDasharray: "3 3" }} />
                  <Area
                    type="monotone"
                    dataKey="aqi"
                    stroke={trendAccent}
                    strokeWidth={2.5}
                    fill="url(#aqiFill)"
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* POLLUTANT LEVELS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <BarChart3 size={15} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-black text-slate-800">
                Pollutant Levels
                <span className="text-xs font-semibold text-slate-400 ml-1.5">(Current, µg/m³)</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[9.5px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Within standard
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Above standard
              </span>
            </div>
          </div>

          <div className="h-[240px]">
            {pollutantChartData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pollutantChartData} margin={{ top: 20, right: 8, left: -15, bottom: 10 }}>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" tickLine={false} axisLine={false} tickMargin={6} />
                  <YAxis fontSize={10} stroke="#94a3b8" tickLine={false} axisLine={false} width={32} />
                  <Tooltip content={<PollutantBarTooltip />} cursor={chartCursor} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={38}>
                    {pollutantChartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.value > entry.standard ? "#f43f5e" : "#4ade80"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          ROW 6 - WARD + STATION AQI
      ================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {/* WARD-WISE AQI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <BarChart3 size={15} className="text-blue-600" />
            </div>
            <h2 className="text-sm font-black text-slate-800">
              Ward-wise AQI
            </h2>
          </div>

          <div className="h-[240px]">
            {wardChartData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardChartData} margin={{ top: 20, right: 10, left: -10, bottom: 55 }}>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={<WrappedXAxisTick maxCharacters={12} />}
                    height={55}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis fontSize={10} stroke="#94a3b8" tickLine={false} axisLine={false} width={28} />
                  <Tooltip content={<AqiBarTooltip />} cursor={chartCursor} />
                  <Bar dataKey="aqi" radius={[5, 5, 0, 0]} maxBarSize={48}>
                    {wardChartData.map((entry, index) => (
                      <Cell key={index} fill={getChartColor(entry.aqi)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <AqiScaleLegend className="mt-2 pt-2.5 border-t border-slate-100" />
        </div>

        {/* STATION-WISE AQI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <BarChart3 size={15} className="text-blue-600" />
            </div>
            <h2 className="text-sm font-black text-slate-800">
              Station-wise AQI
            </h2>
          </div>

          <div className="h-[240px]">
            {stationChartData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stationChartData} margin={{ top: 20, right: 10, left: -10, bottom: 65 }}>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={<WrappedXAxisTick maxCharacters={13} />}
                    height={65}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis fontSize={10} stroke="#94a3b8" tickLine={false} axisLine={false} width={28} />
                  <Tooltip content={<AqiBarTooltip />} cursor={chartCursor} />
                  <Bar dataKey="aqi" radius={[5, 5, 0, 0]} maxBarSize={48}>
                    {stationChartData.map((entry, index) => (
                      <Cell key={index} fill={getChartColor(entry.aqi)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <AqiScaleLegend className="mt-2 pt-2.5 border-t border-slate-100" />
        </div>
      </div>

      {/* =================================================
          FOOTER STATUS
      ================================================= */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-[10px] font-semibold text-slate-400">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong className="text-slate-600">{onlineStations}</strong> Online
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <strong className="text-slate-600">{offlineStations}</strong> Offline
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <strong className="text-slate-600">{numberValue(sensorHealth.total, 5)}</strong> Sensors
          </span>
        </div>

        <span>Live auto refresh: 10s</span>
      </div>

    </div>
  );
}

function WeatherRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <div className="flex items-center gap-2 text-blue-600">
        {icon}
        <span className="text-xs font-semibold text-slate-500">{label}</span>
      </div>
      <span className="text-xs font-black font-mono text-slate-800">{value}</span>
    </div>
  );
}

function MapLegend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Database size={24} className="mx-auto text-slate-300" />
        <p className="text-xs font-semibold text-slate-400 mt-2">
          No telemetry records available
        </p>
      </div>
    </div>
  );
}
// >>>>>>> e2293ead0dfad6c46c7287defa42c377c06c8376
