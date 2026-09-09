import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

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
  ResponsiveContainer,
  Cell,
} from "recharts";

import PuneMap from "../components/PuneMap";

const API_URL =
  "http://localhost:5000/api/dashboard";

// =====================================================
// HELPERS
// =====================================================

const numberValue = (
  value,
  fallback = 0
) => {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
};

const getAqiCategory = (
  value
) => {
  const aqi =
    numberValue(value);

  if (aqi <= 50)
    return "Good";

  if (aqi <= 100)
    return "Satisfactory";

  if (aqi <= 200)
    return "Moderate";

  if (aqi <= 300)
    return "Poor";

  if (aqi <= 400)
    return "Very Poor";

  return "Severe";
};

const getAqiClass = (
  value
) => {
  const aqi =
    numberValue(value);

  if (aqi <= 50) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (aqi <= 100) {
    return "bg-lime-50 text-lime-700 border-lime-200";
  }

  if (aqi <= 200) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (aqi <= 300) {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  return "bg-rose-50 text-rose-700 border-rose-200";
};

const getChartColor = (
  value
) => {
  const aqi =
    numberValue(value);

  if (aqi <= 50)
    return "#4ade80";

  if (aqi <= 100)
    return "#84cc16";

  if (aqi <= 200)
    return "#facc15";

  if (aqi <= 300)
    return "#f97316";

  if (aqi <= 400)
    return "#f43f5e";

  return "#991b1b";
};

const getPollutantStatus = (
  pollutant
) => {
  if (
    pollutant?.value === null ||
    pollutant?.value === undefined
  ) {
    return {
      label: "No Data",
      className:
        "bg-slate-100 text-slate-500",
    };
  }

  if (
    numberValue(
      pollutant.value
    ) >
    numberValue(
      pollutant.standard
    )
  ) {
    return {
      label: "High",
      className:
        "bg-red-100 text-red-700",
    };
  }

  return {
    label: "Good",
    className:
      "bg-emerald-100 text-emerald-700",
  };
};

const getAlertClass = (
  severity
) => {
  const value =
    String(
      severity || ""
    ).toLowerCase();

  if (
    value === "critical"
  ) {
    return {
      row:
        "bg-red-50 border-red-100",
      badge:
        "bg-red-500 text-white",
    };
  }

  if (
    value === "warning"
  ) {
    return {
      row:
        "bg-amber-50 border-amber-100",
      badge:
        "bg-amber-400 text-white",
    };
  }

  return {
    row:
      "bg-blue-50 border-blue-100",
    badge:
      "bg-blue-500 text-white",
  };
};

const formatTime = (
  timestamp
) => {
  if (!timestamp)
    return "—";

  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
};

// =====================================================
// X AXIS WRAPPED LABEL
// =====================================================

const wrapText = (
  text,
  maxCharacters = 12
) => {
  if (!text) return [];

  const words =
    String(text).split(" ");

  const lines = [];
  let current = "";

  words.forEach(
    (word) => {
      if (
        !current
      ) {
        current =
          word;
      } else if (
        `${current} ${word}`.length <=
        maxCharacters
      ) {
        current = `${current} ${word}`;
      } else {
        lines.push(
          current
        );
        current =
          word;
      }
    }
  );

  if (current) {
    lines.push(
      current
    );
  }

  return lines;
};

// =====================================================
// CUSTOM X AXIS TICK
// =====================================================

function WrappedXAxisTick({
  x,
  y,
  payload,
  maxCharacters = 12,
}) {
  const lines =
    wrapText(
      payload?.value,
      maxCharacters
    );

  return (
    <g
      transform={`translate(${x},${y})`}
    >
      {lines.map(
        (
          line,
          index
        ) => (
          <text
            key={
              index
            }
            x={0}
            y={
              index * 13
            }
            dy={12}
            textAnchor="middle"
            fill="#64748b"
            fontSize={9}
            fontWeight={500}
          >
            {line}
          </text>
        )
      )}
    </g>
  );
}

// =====================================================
// TREND TOOLTIP
// =====================================================

const TrendTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2.5">

      <div className="text-[11px] font-bold text-slate-500 mb-2">
        {label}
      </div>

      {payload.map(
        (item) => (
          <div
            key={
              item.dataKey
            }
            className="flex items-center justify-between gap-5 text-[10px] mb-1 last:mb-0"
          >
            <span className="text-slate-500">
              {item.dataKey ===
              "aqi"
                ? "AQI"
                : item.dataKey ===
                  "pm25"
                ? "PM2.5"
                : "PM10"}
            </span>

            <strong className="text-slate-800">
              {item.value ??
                "—"}
            </strong>
          </div>
        )
      )}

    </div>
  );
};

// =====================================================
// DASHBOARD
// =====================================================

export default function Dashboard() {
  const navigate = useNavigate();

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  // Current Pune weather from the backend WeatherAPI integration
  const [
    liveWeather,
    setLiveWeather,
  ] = useState(null);

  const [
    weatherLoading,
    setWeatherLoading,
  ] = useState(true);

  const [
    weatherError,
    setWeatherError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    range,
    setRange,
  ] = useState("24h");

  // ===================================================
  // FETCH CURRENT PUNE WEATHER
  // ===================================================

  const fetchPuneWeather = async () => {
    try {
      setWeatherLoading(true);
      setWeatherError("");

      const response = await fetch(
        "http://localhost:5000/api/weather/pune"
      );

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(
          result.message || "Unable to load current Pune weather."
        );
      }

      setLiveWeather(result.weather || null);
    } catch (err) {
      console.error("Pune weather error:", err);
      setWeatherError(
        err.message || "Unable to load current Pune weather."
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  // ===================================================
  // FETCH DASHBOARD
  // ===================================================

  const fetchDashboard =
    async (
      showRefresh = false
    ) => {
      try {
        if (showRefresh) {
          setRefreshing(
            true
          );
        }

        const response =
          await fetch(
            `${API_URL}?range=${range}`
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Dashboard request failed."
          );
        }

        if (
          result.status !==
          "success"
        ) {
          throw new Error(
            result.message ||
              "Unable to load dashboard."
          );
        }

        setDashboard(
          result.data || {}
        );

        setError("");
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        setError(
          err.message ||
            "Unable to connect to backend."
        );
      } finally {
        setLoading(false);
        setRefreshing(
          false
        );
      }
    };

  // ===================================================
  // AUTO REFRESH
  // ===================================================

  useEffect(() => {
    fetchDashboard(true);

    const interval =
      setInterval(
        () => {
          fetchDashboard(
            false
          );
        },
        10000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [range]);

  // Current Pune weather is refreshed independently every 10 minutes.
  useEffect(() => {
    fetchPuneWeather();

    const weatherInterval = setInterval(
      () => {
        fetchPuneWeather();
      },
      10 * 60 * 1000
    );

    return () =>
      clearInterval(weatherInterval);
  }, []);

  // ===================================================
  // DATA
  // ===================================================

  const data =
    dashboard || {};

  const stations =
    Array.isArray(
      data.stations
    )
      ? data.stations
      : [];

  const pollutants =
    Array.isArray(
      data.pollutants
    )
      ? data.pollutants
      : [];

  const wards =
    Array.isArray(
      data.wards
    )
      ? data.wards
      : [];

  const trends =
    Array.isArray(
      data.trends
    )
      ? data.trends
      : [];

  const alerts =
    Array.isArray(
      data.alerts
    )
      ? data.alerts
      : [];

  // ===================================================
  // KPI DATA
  // ===================================================

  const aqi =
    numberValue(
      data.aqi
    );

  const category =
    data.category ||
    getAqiCategory(
      aqi
    );

  const dominant =
    data.dominant ||
    "N/A";

  const totalStations =
    numberValue(
      data.totalStations,
      stations.length
    );

  const onlineStations =
    numberValue(
      data.onlineStations,
      stations.filter(
        (station) =>
          station.online
      ).length
    );

  const offlineStations =
    numberValue(
      data.offlineStations,
      Math.max(
        totalStations -
          onlineStations,
        0
      )
    );

  const activeAlerts =
    alerts.filter(
      (alert) => {
        const status =
          String(
            alert.acknowledgement ||
              ""
          ).toLowerCase();

        return (
          status === "" ||
          status ===
            "acknowledged"
        );
      }
    );

  // Prefer live weather from /api/weather/pune.
  // Fall back to dashboard weather if the weather API is temporarily unavailable.
  const weather =
    liveWeather ||
    data.weather ||
    {};

  const sensorHealth =
    data.sensorHealth || {};

  // ===================================================
  // POLLUTANTS
  // ===================================================

  const pollutantChartData =
    pollutants.map(
      (pollutant) => ({
        name:
          pollutant.name,

        value:
          pollutant.value ===
          null
            ? 0
            : numberValue(
                pollutant.value
              ),

        standard:
          numberValue(
            pollutant.standard
          ),
      })
    );

  // ===================================================
  // WARDS
  // ===================================================

  const wardChartData =
    wards.map(
      (ward) => ({
        name:
          ward.ward,

        aqi:
          numberValue(
            ward.aqi
          ),
      })
    );

  // ===================================================
  // STATIONS
  // ===================================================

  const stationChartData =
    stations.map(
      (station) => ({
        name:
          station.name,

        aqi:
          numberValue(
            station.aqi
          ),

        ward:
          station.ward,
      })
    );

  // ===================================================
  // TREND
  // ===================================================

  const trendData =
    useMemo(
      () =>
        trends.map(
          (item) => ({
            ...item,

            aqi:
              item.aqi ===
              null
                ? null
                : numberValue(
                    item.aqi
                  ),

            pm25:
              item.pm25 ===
              null
                ? null
                : numberValue(
                    item.pm25
                  ),

            pm10:
              item.pm10 ===
              null
                ? null
                : numberValue(
                    item.pm10
                  ),
          })
        ),
      [trends]
    );

  // ===================================================
  // LOADING
  // ===================================================

  if (
    loading &&
    !dashboard
  ) {
    return (
      <div className="min-h-screen bg-[#eef3f7] flex items-center justify-center">

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-6 text-center">

          <RefreshCw
            size={28}
            className="mx-auto text-blue-600 animate-spin"
          />

          <p className="text-base font-bold text-slate-700 mt-3">
            Loading dashboard...
          </p>

          <p className="text-[11px] text-slate-400 mt-1">
            Fetching live monitoring data
          </p>

        </div>

      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (
    error &&
    !dashboard
  ) {
    return (
      <div className="min-h-screen bg-[#eef3f7] flex items-center justify-center">

        <div className="bg-white rounded-xl border border-red-100 shadow-sm px-8 py-6 text-center max-w-md">

          <WifiOff
            size={30}
            className="mx-auto text-red-500"
          />

          <h2 className="text-base font-black text-slate-800 mt-3">
            Dashboard unavailable
          </h2>

          <p className="text-[12px] text-slate-500 mt-2">
            {error}
          </p>

          <button
            onClick={() =>
              fetchDashboard(
                true
              )
            }
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-5 py-2.5 rounded-lg"
          >
            Retry
          </button>

        </div>

      </div>
    );
  }

  // ===================================================
  // MAIN DASHBOARD
  // ===================================================

  return (
    <div className="min-h-screen bg-[#eef3f7] text-slate-800 p-3 sm:p-5 font-sans">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between mb-3 px-1">

        <div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400">

            <span>
              Executive Command
            </span>

            <span>/</span>

            <span className="text-blue-600 font-bold">
              Pune Municipal Corporation
            </span>

          </div>

          <div className="flex items-center gap-2.5 mt-1.5">

            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">

              <Wind
                size={18}
                className="text-white"
              />

            </div>

            <div>

              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                Air Quality Command Dashboard
              </h1>

              <p className="text-[10px] text-slate-400 mt-1">
                Real-time air quality and environmental monitoring
              </p>

            </div>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold">

            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

            {data.telemetryStatus ||
              "Live"}

          </span>

          <button
            onClick={() =>
              fetchDashboard(
                true
              )
            }
            disabled={
              refreshing
            }
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
          >

            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

          </button>

        </div>

      </div>

      {/* =================================================
          ERROR NOTICE
      ================================================= */}

      {error && (
        <div className="mb-3 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700">
          Latest refresh failed. Showing previous database data.
        </div>
      )}

      {/* =================================================
          ROW 1 - KPI CARDS
      ================================================= */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3">

        {/* AQI */}

        <button
            type="button"
            onClick={() => navigate("/analytics")}
            aria-label="Open Overall AQI analytics" className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center gap-1.5">

            <Wind
              size={15}
              className="text-emerald-500"
            />

            <span className="text-[11px] font-bold text-slate-600">
              Overall AQI
            </span>

          </div>

          <div className="flex items-end gap-2 mt-1.5">

            <span className="text-[29px] leading-none font-black text-slate-900">
              {Math.round(aqi)}
            </span>

            <span
              className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${getAqiClass(
                aqi
              )}`}
            >
              {category}
            </span>

          </div>

          <div className="text-[9px] text-slate-400 mt-1.5">

            Dominant:{" "}

            <span className="font-bold text-slate-600">
              {dominant}
            </span>

          </div>

        </button>

        {/* TOTAL */}

        <button
            type="button"
            onClick={() => navigate("/pune-areas")}
            aria-label="Open monitoring stations" className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center gap-1.5">

            <Radio
              size={15}
              className="text-blue-500"
            />

            <span className="text-[11px] font-bold text-slate-600">
              Total Stations
            </span>

          </div>

          <div className="text-[29px] leading-none font-black text-slate-900 mt-1.5">
            {totalStations}
          </div>

          <div className="text-[9px] text-slate-400 mt-1.5">
            Registered monitoring stations
          </div>

        </button>

        {/* ONLINE */}

        <button
            type="button"
            onClick={() => navigate("/device-health")}
            aria-label="Open online station device health" className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center gap-1.5">

            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />

            <span className="text-[11px] font-bold text-slate-600">
              Online Stations
            </span>

          </div>

          <div className="text-[29px] leading-none font-black text-emerald-600 mt-1.5">
            {onlineStations}
          </div>

          <div className="text-[9px] text-slate-400 mt-1.5">
            Reporting normally
          </div>

        </button>

        {/* OFFLINE */}

        <button
            type="button"
            onClick={() => navigate("/device-health")}
            aria-label="Open offline station device health" className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200 bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center gap-1.5">

            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />

            <span className="text-[11px] font-bold text-slate-600">
              Offline Stations
            </span>

          </div>

          <div
            className={`text-[29px] leading-none font-black mt-1.5 ${
              offlineStations >
              0
                ? "text-red-500"
                : "text-slate-900"
            }`}
          >
            {offlineStations}
          </div>

          <div className="text-[9px] text-slate-400 mt-1.5">
            Communication status
          </div>

        </button>

        {/* ALERTS */}

        <button
            type="button"
            onClick={() => navigate("/alerts")}
            aria-label="Open active alerts" className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200 bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center gap-1.5">

            <Bell
              size={15}
              className="text-red-500"
            />

            <span className="text-[11px] font-bold text-slate-600">
              Active Alerts
            </span>

          </div>

          <div
            className={`text-[29px] leading-none font-black mt-1.5 ${
              activeAlerts.length >
              0
                ? "text-red-500"
                : "text-slate-900"
            }`}
          >
            {
              activeAlerts.length
            }
          </div>

          <div className="text-[9px] text-slate-400 mt-1.5">
            Unresolved alerts
          </div>

        </button>

        {/* AVAILABILITY */}

        <button
            type="button"
            onClick={() => navigate("/analytics")}
            aria-label="Open data availability analytics" className="group cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center gap-1.5">

            <Database
              size={15}
              className="text-blue-500"
            />

            <span className="text-[11px] font-bold text-slate-600">
              Data Availability
            </span>

          </div>

          <div className="text-[29px] leading-none font-black text-slate-900 mt-1.5">

            {numberValue(
              data.dataAvailability
            ).toFixed(1)}
            %

          </div>

          <div className="text-[9px] text-slate-400 mt-1.5">
            Expected data received
          </div>

        </button>

      </div>

      {/* =================================================
          ROW 2 - POLLUTANTS + WEATHER
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_0.8fr] gap-2.5 mb-3">

        {/* POLLUTANTS */}

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center gap-2 mb-2.5">

            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center">

              <Activity
                size={13}
                className="text-blue-600"
              />

            </div>

            <h2 className="text-[13px] font-black text-slate-800">

              Current Pollutant Levels

              <span className="text-[10px] font-medium text-slate-400 ml-1">
                (µg/m³)
              </span>

            </h2>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

            {pollutants.map(
              (
                pollutant
              ) => {

                const status =
                  getPollutantStatus(
                    pollutant
                  );

                return (
                  <button
                    type="button"
                    onClick={() => navigate("/analytics")}
                    aria-label={`View ${pollutant.name} analytics`}
                    key={
                      pollutant.key
                    }
                    className={`group cursor-pointer text-left w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-md border p-2.5 ${
                      status.label ===
                      "High"
                        ? "bg-red-50 border-red-100"
                        : "bg-emerald-50 border-emerald-100"
                    }`}
                  >

                    <div className="text-[10px] font-black text-slate-700">
                      {
                        pollutant.name
                      }
                    </div>

                    <div className="text-[18px] font-black text-slate-900 leading-tight mt-0.5">

                      {pollutant.value ===
                      null
                        ? "—"
                        : numberValue(
                            pollutant.value
                          ).toFixed(
                            1
                          )}

                    </div>

                    <span
                      className={`inline-block px-2 py-1 rounded text-[8px] font-bold mt-1.5 ${status.className}`}
                    >
                      {
                        status.label
                      }
                    </span>

                  </button>
                );
              }
            )}

          </div>

        </div>

        {/* WEATHER */}

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center justify-between gap-2 mb-2.5">

            <div className="flex items-center gap-2">

              <CloudSun
                size={16}
                className="text-blue-500"
              />

              <h2 className="text-[13px] font-black text-slate-800">
                Weather (Pune)
              </h2>

            </div>

            {liveWeather?.updatedAt && (
              <span className="text-[8px] text-slate-400">
                Updated {liveWeather.updatedAt}
              </span>
            )}

          </div>

          {weatherLoading ? (

            <div className="h-[150px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <RefreshCw
                  size={14}
                  className="animate-spin text-blue-500"
                />
                Loading current weather...
              </div>
            </div>

          ) : weatherError && !liveWeather && !data.weather ? (

            <div className="h-[150px] flex items-center justify-center text-center">
              <div>
                <WifiOff
                  size={22}
                  className="mx-auto text-slate-300"
                />
                <p className="text-[10px] font-bold text-slate-500 mt-2">
                  Weather unavailable
                </p>
                <p className="text-[9px] text-slate-400 mt-1">
                  {weatherError}
                </p>
              </div>
            </div>

          ) : (

            <>
              <div className="flex items-center gap-3 mb-3">

                {weather.icon ? (
                  <img
                    src={
                      weather.icon.startsWith("//")
                        ? `https:${weather.icon}`
                        : weather.icon
                    }
                    alt={weather.condition || "Current weather"}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <CloudSun
                    size={34}
                    className="text-amber-400"
                  />
                )}

                <div>

                  <div className="text-[9px] text-slate-400">
                    Current Temperature
                  </div>

                  <div className="text-[17px] font-black text-slate-800">
                    {weather.temperature !== null &&
                    weather.temperature !== undefined
                      ? `${weather.temperature} °C`
                      : "No data"}
                  </div>

                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {weather.condition || "Current conditions"}
                  </div>

                </div>

              </div>

              <div className="space-y-2">

                <WeatherRow
                  icon={
                    <Droplets
                      size={14}
                    />
                  }
                  label="Humidity"
                  value={
                    weather.humidity !== null &&
                    weather.humidity !== undefined
                      ? `${weather.humidity}%`
                      : "—"
                  }
                />

                <WeatherRow
                  icon={
                    <Wind
                      size={14}
                    />
                  }
                  label="Wind Speed"
                  value={
                    weather.windSpeed !== null &&
                    weather.windSpeed !== undefined
                      ? `${weather.windSpeed} km/h`
                      : "—"
                  }
                />

                <WeatherRow
                  icon={
                    <Navigation
                      size={14}
                    />
                  }
                  label="Wind Direction"
                  value={
                    weather.windDirectionText ||
                    (
                      weather.windDirection !== null &&
                      weather.windDirection !== undefined
                        ? `${weather.windDirection}°`
                        : "—"
                    )
                  }
                />

                <WeatherRow
                  icon={
                    <Gauge
                      size={14}
                    />
                  }
                  label="Pressure"
                  value={
                    weather.pressure !== null &&
                    weather.pressure !== undefined
                      ? `${weather.pressure} hPa`
                      : "—"
                  }
                />

              </div>

            </>

          )}

        </div>

      </div>

      {/* =================================================
          ROW 3 - MONITORING STATION MAP
      ================================================= */}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 mb-3">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2">

            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center">

              <MapPin
                size={13}
                className="text-blue-600"
              />

            </div>

            <h2 className="text-[13px] font-black text-slate-800">
              Monitoring Station Map
            </h2>

          </div>

          <Maximize2
            size={14}
            className="text-slate-400"
          />

        </div>

        <div className="w-full h-[330px] sm:h-[380px] rounded-md overflow-hidden border border-slate-100">

          <PuneMap
            stations={
              stations
            }
          />

        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2.5 text-[9px] font-bold text-slate-500">

          <MapLegend
            color="bg-emerald-500"
            label="Good (0-50)"
          />

          <MapLegend
            color="bg-lime-500"
            label="Satisfactory (51-100)"
          />

          <MapLegend
            color="bg-amber-400"
            label="Moderate (101-200)"
          />

          <MapLegend
            color="bg-orange-500"
            label="Poor (201-300)"
          />

          <MapLegend
            color="bg-rose-500"
            label="Very Poor (301-400)"
          />

          <MapLegend
            color="bg-red-800"
            label="Severe (401+)"
          />

        </div>

      </div>

      {/* =================================================
          ROW 4 - AQI TREND + POLLUTANT LEVELS
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 mb-3">

        {/* AQI TREND */}

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center justify-between mb-2.5">

            <div className="flex items-center gap-2">

              <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center">

                <Activity
                  size={13}
                  className="text-blue-600"
                />

              </div>

              <h2 className="text-[13px] font-black text-slate-800">
                AQI Trend
              </h2>

            </div>

            <div className="flex items-center gap-1.5">

              {[
                [
                  "24h",
                  "24 Hours",
                ],
                [
                  "7d",
                  "7 Days",
                ],
                [
                  "30d",
                  "30 Days",
                ],
              ].map(
                (item) => (
                  <button
                    key={
                      item[0]
                    }
                    onClick={() =>
                      setRange(
                        item[0]
                      )
                    }
                    className={`px-2.5 py-1.5 rounded text-[9px] font-bold transition ${
                      range ===
                      item[0]
                        ? "bg-blue-600 text-white"
                        : "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {
                      item[1]
                    }
                  </button>
                )
              )}

            </div>

          </div>

          <div className="h-[230px]">

            {trendData.length ===
            0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={
                    trendData
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="aqiFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#2563eb"
                        stopOpacity={
                          0.18
                        }
                      />

                      <stop
                        offset="95%"
                        stopColor="#2563eb"
                        stopOpacity={
                          0
                        }
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    stroke="#edf2f7"
                    strokeDasharray="3 3"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="time"
                    fontSize={9}
                    stroke="#64748b"
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                    }
                  />

                  <YAxis
                    fontSize={9}
                    stroke="#64748b"
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                    }
                  />

                  <Tooltip
                    content={
                      <TrendTooltip />
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="aqi"
                    stroke="#2563eb"
                    strokeWidth={
                      2.5
                    }
                    fill="url(#aqiFill)"
                    connectNulls
                  />

                </AreaChart>

              </ResponsiveContainer>
            )}

          </div>

        </div>

        {/* CURRENT POLLUTANTS CHART */}

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center gap-2 mb-2.5">

            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center">

              <BarChart3
                size={13}
                className="text-blue-600"
              />

            </div>

            <h2 className="text-[13px] font-black text-slate-800">

              Pollutant Levels

              <span className="text-[10px] text-slate-400 ml-1">
                (Current)
              </span>

            </h2>

          </div>

          <div className="h-[230px]">

            {pollutantChartData.length ===
            0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    pollutantChartData
                  }
                  margin={{
                    top: 20,
                    right: 8,
                    left: -15,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    stroke="#edf2f7"
                    strokeDasharray="3 3"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="name"
                    fontSize={9}
                    stroke="#64748b"
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                    }
                  />

                  <YAxis
                    fontSize={9}
                    stroke="#64748b"
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                    }
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                  >

                    {pollutantChartData.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={
                            index
                          }
                          fill={
                            entry.value >
                            entry.standard
                              ? "#ef4444"
                              : "#4ade80"
                          }
                        />
                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>
            )}

          </div>

        </div>

      </div>

      {/* =================================================
          ROW 5 - WARD + STATION AQI
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 mb-3">

        {/* WARD-WISE AQI */}

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center gap-2 mb-2.5">

            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center">

              <BarChart3
                size={13}
                className="text-blue-600"
              />

            </div>

            <h2 className="text-[13px] font-black text-slate-800">
              Ward-wise AQI
            </h2>

          </div>

          <div className="h-[270px]">

            {wardChartData.length ===
            0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    wardChartData
                  }
                  margin={{
                    top: 20,
                    right: 10,
                    left: -10,
                    bottom: 55,
                  }}
                >

                  <CartesianGrid
                    stroke="#edf2f7"
                    strokeDasharray="3 3"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="name"
                    tick={
                      <WrappedXAxisTick
                        maxCharacters={
                          12
                        }
                      />
                    }
                    height={55}
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                    }
                    interval={0}
                  />

                  <YAxis
                    fontSize={10}
                    stroke="#64748b"
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                  }
                  />

                  <Tooltip />

                  <Bar
                    dataKey="aqi"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  >

                    {wardChartData.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={
                            index
                          }
                          fill={getChartColor(
                            entry.aqi
                          )}
                        />
                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>
            )}

          </div>

        </div>

        {/* STATION-WISE AQI */}

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">

          <div className="flex items-center gap-2 mb-2.5">

            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center">

              <BarChart3
                size={13}
                className="text-blue-600"
              />

            </div>

            <h2 className="text-[13px] font-black text-slate-800">
              Station-wise AQI
            </h2>

          </div>

          <div className="h-[270px]">

            {stationChartData.length ===
            0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    stationChartData
                  }
                  margin={{
                    top: 20,
                    right: 10,
                    left: -10,
                    bottom: 65,
                  }}
                >

                  <CartesianGrid
                    stroke="#edf2f7"
                    strokeDasharray="3 3"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="name"
                    tick={
                      <WrappedXAxisTick
                        maxCharacters={
                          13
                        }
                      />
                    }
                    height={65}
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                    }
                    interval={0}
                  />

                  <YAxis
                    fontSize={10}
                    stroke="#64748b"
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                    }
                  />

                  <Tooltip />

                  <Bar
                    dataKey="aqi"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  >

                    {stationChartData.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={
                            index
                          }
                          fill={getChartColor(
                            entry.aqi
                          )}
                        />
                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>
            )}

          </div>

        </div>

      </div>

      {/* =================================================
          ROW 6 - ACTIVE ALERTS
      ================================================= */}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">

        <div className="flex items-center justify-between mb-2.5">

          <div className="flex items-center gap-2">

            <div className="w-6 h-6 rounded bg-red-50 flex items-center justify-center">

              <Bell
                size={13}
                className="text-red-500"
              />

            </div>

            <h2 className="text-[13px] font-black text-slate-800">
              Active Alerts
            </h2>

          </div>

          <div className="flex items-center gap-3">

            <span className="text-[10px] text-slate-400">
              {
                activeAlerts.length
              }{" "}
              active
            </span>

            <span className="text-[9px] font-bold text-blue-600">
              View All →
            </span>

          </div>

        </div>

        {activeAlerts.length ===
        0 ? (
          <div className="py-10 flex items-center justify-center">

            <div className="text-center">

              <CheckCircle2
                size={30}
                className="mx-auto text-emerald-500"
              />

              <p className="text-[12px] font-bold text-slate-600 mt-2">
                No active alerts
              </p>

              <p className="text-[10px] text-slate-400 mt-1">
                All monitoring conditions are normal
              </p>

            </div>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-slate-200">

                  <th className="text-left px-3 pb-2.5 text-[9px] uppercase text-slate-400 font-bold">
                    Time
                  </th>

                  <th className="text-left px-3 pb-2.5 text-[9px] uppercase text-slate-400 font-bold">
                    Station
                  </th>

                  <th className="text-left px-3 pb-2.5 text-[9px] uppercase text-slate-400 font-bold">
                    Ward
                  </th>

                  <th className="text-left px-3 pb-2.5 text-[9px] uppercase text-slate-400 font-bold">
                    Parameter
                  </th>

                  <th className="text-left px-3 pb-2.5 text-[9px] uppercase text-slate-400 font-bold">
                    Value
                  </th>

                  <th className="text-left px-3 pb-2.5 text-[9px] uppercase text-slate-400 font-bold">
                    Rule
                  </th>

                  <th className="text-left px-3 pb-2.5 text-[9px] uppercase text-slate-400 font-bold">
                    Severity
                  </th>

                </tr>

              </thead>

              <tbody>

                {activeAlerts
                  .slice(
                    0,
                    10
                  )
                  .map(
                    (
                      alert,
                      index
                    ) => {

                      const station =
                        stations.find(
                          (
                            item
                          ) =>
                            String(
                              item.stationId ??
                                item.station_id
                            ) ===
                            String(
                              alert.station_id
                            )
                        );

                      const alertStyle =
                        getAlertClass(
                          alert.severity
                        );

                      return (
                        <tr
                          key={
                            alert.alert_id ||
                            index
                          }
                          className={`border-b border-slate-100 last:border-0 ${alertStyle.row}`}
                        >

                          <td className="px-3 py-3 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                            {formatTime(
                              alert.started_time
                            )}
                          </td>

                          <td className="px-3 py-3 text-[10px] font-bold text-slate-700">
                            {station?.name ||
                              `Station ${alert.station_id}`}
                          </td>

                          <td className="px-3 py-3 text-[10px] text-slate-600">
                            {station?.ward ||
                              "—"}
                          </td>

                          <td className="px-3 py-3 text-[10px] font-bold text-slate-700">
                            {alert.parameter ||
                              "—"}
                          </td>

                          <td className="px-3 py-3 text-[10px] font-black text-slate-800">
                            {alert.actual_value !==
                              null &&
                            alert.actual_value !==
                              undefined
                              ? numberValue(
                                  alert.actual_value
                                )
                              : "—"}
                          </td>

                          <td className="px-3 py-3 text-[10px] text-slate-500">
                            {alert.threshold_rule ||
                              "—"}
                          </td>

                          <td className="px-3 py-3">

                            <span
                              className={`inline-block px-2.5 py-1 rounded text-[8px] font-bold ${alertStyle.badge}`}
                            >
                              {alert.severity ||
                                "Info"}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] text-slate-400">

        <div className="flex items-center gap-4">

          <span className="flex items-center gap-1.5">

            <span className="w-2 h-2 rounded-full bg-emerald-500" />

            {onlineStations}{" "}
            Online

          </span>

          <span className="flex items-center gap-1.5">

            <span className="w-2 h-2 rounded-full bg-red-500" />

            {offlineStations}{" "}
            Offline

          </span>

          <span className="flex items-center gap-1.5">

            <span className="w-2 h-2 rounded-full bg-blue-500" />

            {numberValue(
              sensorHealth.total
            )}{" "}
            Sensors

          </span>

        </div>

        <span>
          Auto refresh: 10 seconds
        </span>

      </div>

    </div>
  );
}

// =====================================================
// WEATHER ROW
// =====================================================

function WeatherRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2 text-blue-500">

        {icon}

        <span className="text-[10px] text-slate-500">
          {label}
        </span>

      </div>

      <span className="text-[10px] font-black text-slate-700">
        {value}
      </span>

    </div>
  );
}

// =====================================================
// MAP LEGEND
// =====================================================

function MapLegend({
  color,
  label,
}) {
  return (
    <span className="flex items-center gap-1.5">

      <span
        className={`w-2 h-2 rounded-full ${color}`}
      />

      {label}

    </span>
  );
}

// =====================================================
// EMPTY CHART
// =====================================================

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center">

      <div className="text-center">

        <Database
          size={24}
          className="mx-auto text-slate-300"
        />

        <p className="text-[10px] text-slate-400 mt-1.5">
          No data available
        </p>

      </div>

    </div>
  );
}