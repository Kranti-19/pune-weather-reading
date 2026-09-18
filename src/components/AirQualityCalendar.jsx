import React, { useMemo, useState, useEffect } from "react";
import API from "../api/apiClient";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Activity,
  Wind,
  TrendingUp,
  MapPin,
  Loader2,
} from "lucide-react";

// =====================================================
// AQI CATEGORY SYSTEM
// =====================================================

const getAqiMeta = (aqi) => {
  if (aqi === null || aqi === undefined) {
    return {
      label: "No data",
      color: "#cbd5e1",
      soft: "#f8fafc",
      border: "#e2e8f0",
      text: "#94a3b8",
    };
  }

  if (aqi <= 50) {
    return {
      label: "Good",
      color: "#22c55e",
      soft: "#f0fdf4",
      border: "#bbf7d0",
      text: "#166534",
    };
  }

  if (aqi <= 100) {
    return {
      label: "Satisfactory",
      color: "#84cc16",
      soft: "#f7fee7",
      border: "#d9f99d",
      text: "#3f6212",
    };
  }

  if (aqi <= 200) {
    return {
      label: "Moderate",
      color: "#f59e0b",
      soft: "#fffbeb",
      border: "#fde68a",
      text: "#92400e",
    };
  }

  if (aqi <= 300) {
    return {
      label: "Poor",
      color: "#f97316",
      soft: "#fff7ed",
      border: "#fed7aa",
      text: "#9a3412",
    };
  }

  if (aqi <= 400) {
    return {
      label: "Very Poor",
      color: "#f43f5e",
      soft: "#fff1f2",
      border: "#fecdd3",
      text: "#9f1239",
    };
  }

  return {
    label: "Severe",
    color: "#991b1b",
    soft: "#fef2f2",
    border: "#fecaca",
    text: "#7f1d1d",
  };
};

const getHeatmapStyle = (aqi) => {
  if (aqi === null || aqi === undefined) {
    return {
      background: "#f8fafc",
      border: "#f1f5f9",
      accent: "#cbd5e1",
      text: "#cbd5e1",
    };
  }

  if (aqi <= 50) {
    const intensity = Math.max(0.12, aqi / 50);
    return {
      background: `rgba(34, 197, 94, ${0.08 + intensity * 0.16})`,
      border: "rgba(34, 197, 94, 0.25)",
      accent: "#22c55e",
      text: "#166534",
    };
  }

  if (aqi <= 100) {
    const intensity = (aqi - 50) / 50;
    return {
      background: `rgba(132, 204, 22, ${0.10 + intensity * 0.20})`,
      border: `rgba(132, 204, 22, ${0.25 + intensity * 0.20})`,
      accent: "#65a30d",
      text: "#3f6212",
    };
  }

  if (aqi <= 200) {
    return {
      background: "#fffbeb",
      border: "#fde68a",
      accent: "#f59e0b",
      text: "#92400e",
    };
  }

  if (aqi <= 300) {
    return {
      background: "#fff7ed",
      border: "#fed7aa",
      accent: "#f97316",
      text: "#9a3412",
    };
  }

  if (aqi <= 400) {
    return {
      background: "#fff1f2",
      border: "#fecdd3",
      accent: "#f43f5e",
      text: "#9f1239",
    };
  }

  return {
    background: "#fef2f2",
    border: "#fecaca",
    accent: "#991b1b",
    text: "#7f1d1d",
  };
};

// =====================================================
// COMPONENT
// =====================================================

export default function AirQualityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const todayDate = new Date();

  // Fetch monthly AQI logs dynamically from the backend API
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/history/monthly?year=${year}&month=${month + 1}`);
        if (response.data?.status === "success") {
          setMonthlyData(response.data.data || {});
        }
      } catch (err) {
        console.error("Failed to load monthly calendar history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [year, month]);

  // =====================================================
  // CALENDAR DATA
  // =====================================================

  const {
    calendarCells,
    monthStats,
    bestDay,
    worstDay,
  } = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    let sum = 0;
    let count = 0;
    let minEntry = null;
    let maxEntry = null;

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({
        empty: true,
        id: `empty-${i}`,
      });
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const entry = monthlyData[day];

      const isToday =
        day === todayDate.getDate() &&
        month === todayDate.getMonth() &&
        year === todayDate.getFullYear();

      if (entry && Number.isFinite(Number(entry.aqi))) {
        const aqiValue = Number(entry.aqi);
        sum += aqiValue;
        count++;

        if (!minEntry || aqiValue < minEntry.aqi) {
          minEntry = { day, aqi: aqiValue, dominant: entry.dominant || "PM2.5" };
        }

        if (!maxEntry || aqiValue > maxEntry.aqi) {
          maxEntry = { day, aqi: aqiValue, dominant: entry.dominant || "PM2.5" };
        }
      }

      cells.push({
        empty: false,
        day,
        aqi: entry?.aqi !== undefined && entry?.aqi !== null ? Number(entry.aqi) : null,
        dominant: entry?.dominant ?? "—",
        isToday,
      });
    }

    return {
      calendarCells: cells,
      monthStats: {
        average: count > 0 ? Math.round(sum / count) : "—",
        monitoredDays: count,
      },
      bestDay: minEntry,
      worstDay: maxEntry,
    };
  }, [year, month, monthlyData, todayDate]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handlePrevMonth = () => {
    setSelectedDay(null);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mb-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      
      {/* HEADER */}
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 px-5 py-5 sm:px-6">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f5f97] text-white shadow-lg shadow-blue-200">
                <CalendarDays size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Air Quality History
                </h2>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 hover:shadow"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="min-w-[150px] text-center">
              <p className="text-sm font-black text-slate-800">
                {monthName} {year}
              </p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Monthly Overview
              </p>
            </div>
            <button
              onClick={handleNextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 hover:shadow"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-3 sm:px-6">
        <StatCard
          icon={<Activity size={17} />}
          label="Monthly Average"
          value={monthStats.average}
          sublabel="AQI"
          accent="#2563eb"
        />
        <StatCard
          icon={<TrendingUp size={17} />}
          label="Best Air Quality"
          value={bestDay?.aqi ?? "—"}
          sublabel={bestDay ? `${bestDay.day} ${monthName}` : "No records"}
          accent="#22c55e"
        />
        <StatCard
          icon={<Wind size={17} />}
          label="Highest AQI"
          value={worstDay?.aqi ?? "—"}
          sublabel={worstDay ? `${worstDay.day} ${monthName}` : "No records"}
          accent="#f59e0b"
        />
      </div>

      {/* CALENDAR */}
      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

        <div className="mb-3 grid grid-cols-7">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-[9px] font-black uppercase tracking-[0.14em] text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarCells.map((cell) => {
            if (cell.empty) {
              return <div key={cell.id} className="h-[64px] sm:h-[72px]" />;
            }

            const hasData = cell.aqi !== null;
            const heatmap = getHeatmapStyle(cell.aqi);
            const isSelected = selectedDay?.day === cell.day;

            return (
              <button
                key={cell.day}
                disabled={!hasData}
                onClick={() => {
                  if (hasData) setSelectedDay(cell);
                }}
                className={`
                  relative h-[64px] sm:h-[72px] overflow-hidden rounded-xl text-left transition-all duration-200
                  ${hasData ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : "cursor-default"}
                  ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                `}
                style={{
                  background: heatmap.background,
                  border: `1px solid ${hasData ? heatmap.border : "#f1f5f9"}`,
                }}
              >
                <div className="absolute left-2.5 top-2">
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: hasData ? heatmap.text : "#cbd5e1" }}
                  >
                    {cell.day}
                  </span>
                </div>

                {cell.isToday && (
                  <span className="absolute right-2 top-2 rounded-md bg-blue-600 px-1.5 py-[2px] text-[7px] font-black uppercase tracking-wide text-white shadow-sm">
                    Today
                  </span>
                )}

                {hasData ? (
                  <div className="flex h-full flex-col items-center justify-center pt-1">
                    <span
                      className="font-mono text-[22px] font-black leading-none sm:text-[25px]"
                      style={{ color: heatmap.text }}
                    >
                      {cell.aqi}
                    </span>
                    <span
                      className="mt-1 text-[7px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: heatmap.accent }}
                    >
                      AQI
                    </span>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-[10px] text-slate-200">—</span>
                  </div>
                )}

                {hasData && (
                  <div
                    className="absolute bottom-0 left-0 h-[3px] w-full"
                    style={{ background: heatmap.accent }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Legend color="#22c55e" label="Good" />
          <Legend color="#84cc16" label="Satisfactory" />
          <Legend color="#f59e0b" label="Moderate" />
          <Legend color="#f97316" label="Poor" />
          <Legend color="#f43f5e" label="Very Poor" />
          <Legend color="#991b1b" label="Severe" />
        </div>

        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
          <MapPin size={13} />
          <span>{monthStats.monitoredDays} monitored days</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="font-mono text-xl font-black text-slate-900">
            {value}
          </span>
          <span className="text-[9px] font-semibold text-slate-400">
            {sublabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[9px] font-semibold text-slate-500">{label}</span>
    </div>
  );
}