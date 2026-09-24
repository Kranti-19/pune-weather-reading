import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CalendarDays,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import API from "../api/apiClient";


// =====================================================
// AQI CATEGORY
// =====================================================

const getAqiCategory = (aqi) => {
  const value = Number(aqi) || 0;

  if (value <= 50) return "Good";
  if (value <= 100) return "Satisfactory";
  if (value <= 200) return "Moderate";
  if (value <= 300) return "Poor";
  if (value <= 400) return "Very Poor";

  return "Severe";
};


// =====================================================
// CATEGORY COLOR
// =====================================================

const getCategoryColor = (aqi) => {
  const value = Number(aqi) || 0;

  if (value <= 50) return "#10b981";
  if (value <= 100) return "#f59e0b";
  if (value <= 200) return "#f97316";
  if (value <= 300) return "#ef4444";
  if (value <= 400) return "#a855f7";

  return "#7f1d1d";
};


// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};


// =====================================================
// CUSTOM TOOLTIP
// =====================================================

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const aqi = payload[0]?.value;
  const category = getAqiCategory(aqi);

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="mb-1 text-xs font-semibold text-slate-500">
        {label}
      </p>

      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: getCategoryColor(aqi),
          }}
        />

        <span className="text-xl font-bold text-slate-800">
          {aqi}
        </span>

        <span className="text-xs font-semibold text-slate-500">
          AQI
        </span>
      </div>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        {category}
      </p>
    </div>
  );
};


// =====================================================
// STAT CARD
// =====================================================

const StatCard = ({
  icon,
  label,
  value,
  subtitle,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-800">
            {value ?? "—"}
          </p>

          {subtitle && (
            <p className="mt-1 text-[10px] font-medium text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          {icon}
        </div>
      </div>
    </div>
  );
};


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AQITrend() {
  const [selectedRange, setSelectedRange] = useState("7d");

  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [appliedCustomRange, setAppliedCustomRange] =
    useState(null);

  const [trendData, setTrendData] = useState([]);
  const [summary, setSummary] = useState({
    average: null,
    highest: null,
    lowest: null,
    daysWithData: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH TREND
  // =====================================================

  const fetchTrend = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (
        selectedRange === "custom" &&
        appliedCustomRange
      ) {
        response = await API.get(
          "/history/trend",
          {
            params: {
              from: appliedCustomRange.from,
              to: appliedCustomRange.to,
            },
          }
        );
      } else {
        response = await API.get(
          "/history/trend",
          {
            params: {
              range: selectedRange,
            },
          }
        );
      }

      const result = response.data;

      if (
        result.status !== "success"
      ) {
        throw new Error(
          result.message ||
            "Unable to load AQI trend."
        );
      }

      const trend =
        result.data?.trend || [];

      setTrendData(trend);

      setSummary({
        average:
          result.data?.summary?.average ??
          null,

        highest:
          result.data?.summary?.highest ??
          null,

        lowest:
          result.data?.summary?.lowest ??
          null,

        daysWithData:
          result.data?.summary?.daysWithData ??
          0,
      });
    } catch (err) {
      console.error(
        "AQI trend error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to load AQI trend."
      );
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // FETCH WHEN RANGE CHANGES
  // =====================================================

  useEffect(() => {
    if (
      selectedRange !== "custom" ||
      appliedCustomRange
    ) {
      fetchTrend();
    }
  }, [
    selectedRange,
    appliedCustomRange,
  ]);


  // =====================================================
  // APPLY CUSTOM RANGE
  // =====================================================

  const handleApplyCustomRange = () => {
    if (!customFrom || !customTo) {
      setError(
        "Please select both start and end dates."
      );

      return;
    }

    if (customFrom > customTo) {
      setError(
        "Start date must be before end date."
      );

      return;
    }

    setError("");

    setAppliedCustomRange({
      from: customFrom,
      to: customTo,
    });
  };


  // =====================================================
  // CHART DATA
  // =====================================================

  const chartData = useMemo(() => {
    return trendData
      .filter(
        (item) =>
          item.aqi !== null &&
          Number.isFinite(
            Number(item.aqi)
          )
      )
      .map((item) => ({
        date: formatDate(item.date),
        fullDate: item.date,
        aqi: Number(item.aqi),
      }));
  }, [trendData]);

  const yAxisDomain = useMemo(() => {
  if (!chartData.length) {
    return [0, 100];
  }

  const values = chartData.map(
    (item) => Number(item.aqi)
  );

  const min = Math.min(...values);
  const max = Math.max(...values);

  // Keep some breathing room around the data
  const lower = Math.max(
    0,
    Math.floor((min - 10) / 10) * 10
  );

  const upper = Math.min(
    500,
    Math.ceil((max + 10) / 10) * 10
  );

  return [lower, upper];
}, [chartData]);


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <TrendingUp size={18} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Air Quality Trend
              </h2>

              <p className="text-xs text-slate-400">
                Track Pune's AQI changes over time
              </p>
            </div>

          </div>
        </div>


        {/* ================================================= */}
        {/* RANGE BUTTONS */}
        {/* ================================================= */}

        <div className="flex flex-wrap items-center gap-2">

          {[
            {
              id: "7d",
              label: "7 Days",
            },
            {
              id: "30d",
              label: "30 Days",
            },
            {
              id: "custom",
              label: "Custom Range",
            },
          ].map((range) => (

            <button
              key={range.id}
              type="button"
              onClick={() => {
                setSelectedRange(
                  range.id
                );

                if (
                  range.id !== "custom"
                ) {
                  setAppliedCustomRange(
                    null
                  );
                }
              }}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                selectedRange === range.id
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {range.label}
            </button>

          ))}

        </div>

      </div>


      {/* ================================================= */}
      {/* CUSTOM DATE RANGE */}
      {/* ================================================= */}

      {selectedRange === "custom" && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end">

          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              From
            </label>

            <div className="relative">

              <CalendarDays
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={customFrom}
                onChange={(e) =>
                  setCustomFrom(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />

            </div>
          </div>


          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              To
            </label>

            <div className="relative">

              <CalendarDays
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={customTo}
                onChange={(e) =>
                  setCustomTo(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />

            </div>
          </div>


          <button
            type="button"
            onClick={
              handleApplyCustomRange
            }
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700"
          >
            Apply
          </button>

        </div>
      )}


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}


      {/* ================================================= */}
      {/* CHART */}
      {/* ================================================= */}

      <div className="mt-6">

        {loading ? (

          <div className="flex h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <RefreshCw
                size={16}
                className="animate-spin"
              />
              Loading AQI trend...
            </div>
          </div>

        ) : chartData.length === 0 ? (

          <div className="flex h-[300px] flex-col items-center justify-center text-center">

            <BarChart3
              size={34}
              className="text-slate-300"
            />

            <p className="mt-3 text-sm font-bold text-slate-500">
              No AQI data available
            </p>

            <p className="mt-1 text-xs text-slate-400">
              There are no stored readings for this period.
            </p>

          </div>

        ) : (

          <div className="h-[300px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 10,
                    fill: "#94a3b8",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
  domain={yAxisDomain}
  tick={{
    fontSize: 10,
    fill: "#94a3b8",
  }}
  axisLine={false}
  tickLine={false}
  width={40}
/>

                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />

                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#ffffff",
                    stroke:
                      "#0f766e",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                  connectNulls={false}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* SUMMARY CARDS */}
      {/* ================================================= */}

      {!loading &&
        chartData.length > 0 && (

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

            <StatCard
              icon={
                <TrendingUp
                  size={17}
                />
              }
              label="Average AQI"
              value={
                summary.average
              }
              subtitle="Selected period"
            />

            <StatCard
              icon={
                <ArrowUp
                  size={17}
                />
              }
              label="Highest AQI"
              value={
                summary.highest
                  ?.aqi
              }
              subtitle={
                summary.highest
                  ?.date
                  ? formatDate(
                      summary.highest
                        .date
                    )
                  : "No data"
              }
            />

            <StatCard
              icon={
                <ArrowDown
                  size={17}
                />
              }
              label="Lowest AQI"
              value={
                summary.lowest
                  ?.aqi
              }
              subtitle={
                summary.lowest
                  ?.date
                  ? formatDate(
                      summary.lowest
                        .date
                    )
                  : "No data"
              }
            />

            <StatCard
              icon={
                <BarChart3
                  size={17}
                />
              }
              label="Days With Data"
              value={
                summary.daysWithData
              }
              subtitle="Available readings"
            />

          </div>

        )}

    </section>
  );
}