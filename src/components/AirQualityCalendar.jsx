import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Activity,
  Wind,
  TrendingUp,
  MapPin,
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

  // GOOD
  if (aqi <= 50) {
    const intensity = Math.max(0.12, aqi / 50);

    return {
      background: `rgba(34, 197, 94, ${0.08 + intensity * 0.16})`,
      border: "rgba(34, 197, 94, 0.25)",
      accent: "#22c55e",
      text: "#166534",
    };
  }

  // SATISFACTORY
  if (aqi <= 100) {
    const intensity = (aqi - 50) / 50;

    return {
      background: `rgba(132, 204, 22, ${0.10 + intensity * 0.20})`,
      border: `rgba(132, 204, 22, ${0.25 + intensity * 0.20})`,
      accent: "#65a30d",
      text: "#3f6212",
    };
  }

  // MODERATE
  if (aqi <= 200) {
    return {
      background: "#fffbeb",
      border: "#fde68a",
      accent: "#f59e0b",
      text: "#92400e",
    };
  }

  // POOR
  if (aqi <= 300) {
    return {
      background: "#fff7ed",
      border: "#fed7aa",
      accent: "#f97316",
      text: "#9a3412",
    };
  }

  // VERY POOR
  if (aqi <= 400) {
    return {
      background: "#fff1f2",
      border: "#fecdd3",
      accent: "#f43f5e",
      text: "#9f1239",
    };
  }

  // SEVERE
  return {
    background: "#fef2f2",
    border: "#fecaca",
    accent: "#991b1b",
    text: "#7f1d1d",
  };
};

// =====================================================
// SAMPLE DATA
// =====================================================

const HISTORICAL_DATA_PUNE = {
  "2026-8": {
    1: { aqi: 62, dominant: "PM2.5" },
    2: { aqi: 58, dominant: "PM10" },
    3: { aqi: 54, dominant: "PM10" },
    4: { aqi: 66, dominant: "PM2.5" },
    5: { aqi: 60, dominant: "PM2.5" },
    6: { aqi: 64, dominant: "NO₂" },
    7: { aqi: 61, dominant: "PM2.5" },
    8: { aqi: 59, dominant: "PM10" },
    9: { aqi: 57, dominant: "PM10" },
    10: { aqi: 65, dominant: "PM2.5" },
    11: { aqi: 61, dominant: "PM2.5" },
    12: { aqi: 56, dominant: "PM10" },
    13: { aqi: 56, dominant: "PM10" },
    14: { aqi: 56, dominant: "PM2.5" },
    15: { aqi: 58, dominant: "PM2.5" },
    16: { aqi: 54, dominant: "PM10" },
    17: { aqi: 58, dominant: "PM10" },
    18: { aqi: 66, dominant: "PM2.5" },
    19: { aqi: 64, dominant: "PM2.5" },
    20: { aqi: 62, dominant: "NO₂" },
    21: { aqi: 60, dominant: "PM2.5" },
    22: { aqi: 60, dominant: "PM10" },
    23: { aqi: 65, dominant: "PM2.5" },
    24: { aqi: 71, dominant: "PM2.5" },
    25: { aqi: 71, dominant: "PM2.5" },
    26: { aqi: 61, dominant: "PM10" },
    27: { aqi: 57, dominant: "PM10" },
    28: { aqi: 59, dominant: "PM2.5" },
    29: { aqi: 55, dominant: "PM2.5" },
    30: { aqi: 57, dominant: "PM10" },
    31: { aqi: 52, dominant: "PM2.5" },
  },

  "2026-9": {
    1: { aqi: 53, dominant: "PM2.5" },
    2: { aqi: 54, dominant: "PM10" },
    3: { aqi: 57, dominant: "PM10" },
    4: { aqi: 65, dominant: "PM2.5" },
    5: { aqi: 65, dominant: "PM2.5" },
    6: { aqi: 63, dominant: "PM10" },
    7: { aqi: 67, dominant: "PM2.5" },
    8: { aqi: 68, dominant: "NO₂" },
    9: { aqi: 73, dominant: "PM2.5" },
    10: { aqi: 70, dominant: "PM2.5" },
    11: { aqi: 66, dominant: "PM10" },
    12: {
      aqi: 68,
      dominant: "PM2.5",
      isToday: true,
    },
  },
};

// =====================================================
// COMPONENT
// =====================================================

export default function AirQualityCalendar() {
  const [currentDate, setCurrentDate] = useState(
    new Date(2026, 8, 12)
  );

  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const monthKey = `${year}-${month + 1}`;

  // =====================================================
  // CALENDAR DATA
  // =====================================================

  const {
    calendarCells,
    monthStats,
    bestDay,
    worstDay,
  } = useMemo(() => {
    const firstDayIndex = new Date(
      year,
      month,
      1
    ).getDay();

    const totalDaysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const monthDataset =
      HISTORICAL_DATA_PUNE[monthKey] || {};

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
      const entry = monthDataset[day];

      if (entry) {
        sum += entry.aqi;
        count++;

        if (!minEntry || entry.aqi < minEntry.aqi) {
          minEntry = {
            day,
            ...entry,
          };
        }

        if (!maxEntry || entry.aqi > maxEntry.aqi) {
          maxEntry = {
            day,
            ...entry,
          };
        }
      }

      cells.push({
        empty: false,
        day,
        aqi: entry?.aqi ?? null,
        dominant: entry?.dominant ?? "—",
        isToday: Boolean(entry?.isToday),
      });
    }

    return {
      calendarCells: cells,

      monthStats: {
        average:
          count > 0
            ? Math.round(sum / count)
            : "—",

        monitoredDays: count,
      },

      bestDay: minEntry,

      worstDay: maxEntry,
    };
  }, [year, month, monthKey]);

  // =====================================================
  // SELECT DEFAULT DAY
  // =====================================================

  const activeDay =
    selectedDay ||
    calendarCells.find((day) => day.isToday) ||
    calendarCells.find((day) => day.aqi !== null);

  const activeMeta = activeDay
    ? getAqiMeta(activeDay.aqi)
    : getAqiMeta(null);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handlePrevMonth = () => {
    setSelectedDay(null);

    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setSelectedDay(null);

    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mb-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 px-5 py-5 sm:px-6">

        {/* Decorative circle */}

        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          {/* Title */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f5f97] text-white shadow-lg shadow-blue-200">

                <CalendarDays size={20} />

              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-lg font-black tracking-tight text-slate-900">

                    Air Quality History

                  </h2>

                  

                </div>

                

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

      {/* ================================================= */}
      {/* STATISTICS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-3 sm:px-6">

        {/* Average */}

        <StatCard
          icon={<Activity size={17} />}
          label="Monthly Average"
          value={monthStats.average}
          sublabel="AQI"
          accent="#2563eb"
        />

        {/* Best */}

        <StatCard
          icon={<TrendingUp size={17} />}
          label="Best Air Quality"
          value={bestDay?.aqi ?? "—"}
          sublabel={
            bestDay
              ? `${bestDay.day} ${monthName}`
              : "No records"
          }
          accent="#22c55e"
        />

        {/* Worst */}

        <StatCard
          icon={<Wind size={17} />}
          label="Highest AQI"
          value={worstDay?.aqi ?? "—"}
          sublabel={
            worstDay
              ? `${worstDay.day} ${monthName}`
              : "No records"
          }
          accent="#f59e0b"
        />

      </div>

      {/* ================================================= */}
      {/* CALENDAR */}
      {/* ================================================= */}

      <div className="px-4 py-4 sm:px-6 sm:py-5">

        {/* Week days */}

        <div className="mb-3 grid grid-cols-7">

          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (

            <div
              key={day}
              className="text-center text-[9px] font-black uppercase tracking-[0.14em] text-slate-400"
            >

              {day}

            </div>

          ))}

        </div>

        {/* Calendar heatmap */}

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">

  {calendarCells.map((cell) => {

    if (cell.empty) {
      return (
        <div
          key={cell.id}
          className="h-[64px] sm:h-[72px]"
        />
      );
    }

    const hasData = cell.aqi !== null;

    const meta = getAqiMeta(cell.aqi);
    const heatmap = getHeatmapStyle(cell.aqi);

    const isSelected =
      selectedDay?.day === cell.day;

    return (

      <button
        key={cell.day}
        disabled={!hasData}
        onClick={() => {
          if (hasData) {
            setSelectedDay(cell);
          }
        }}
        className={`
          relative h-[64px] sm:h-[72px]
          overflow-hidden rounded-xl
          text-left transition-all duration-200

          ${
            hasData
              ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
              : "cursor-default"
          }

          ${
            isSelected
              ? "ring-2 ring-blue-500 ring-offset-2"
              : ""
          }
        `}
        style={{
          background: heatmap.background,

          border: `1px solid ${
            hasData
              ? heatmap.border
              : "#f1f5f9"
          }`,
        }}
      >

        {/* Date */}

        <div className="absolute left-2.5 top-2">

          <span
            className="text-[10px] font-bold"
            style={{
              color: hasData
                ? heatmap.text
                : "#cbd5e1",
            }}
          >
            {cell.day}
          </span>

        </div>

        {/* TODAY */}

        {cell.isToday && (

          <span className="absolute right-2 top-2 rounded-md bg-blue-600 px-1.5 py-[2px] text-[7px] font-black uppercase tracking-wide text-white">

            Today

          </span>

        )}

        {/* AQI */}

        {hasData ? (

          <div className="flex h-full flex-col items-center justify-center pt-1">

            <span
              className="font-mono text-[22px] font-black leading-none sm:text-[25px]"
              style={{
                color: heatmap.text,
              }}
            >
              {cell.aqi}
            </span>

            <span
              className="mt-1 text-[7px] font-bold uppercase tracking-[0.12em]"
              style={{
                color: heatmap.accent,
              }}
            >
              AQI
            </span>

          </div>

        ) : (

          <div className="flex h-full items-center justify-center">

            <span className="text-[10px] text-slate-200">

              —

            </span>

          </div>

        )}

        {/* Bottom intensity line */}

        {hasData && (

          <div
            className="absolute bottom-0 left-0 h-[3px] w-full"
            style={{
              background: heatmap.accent,
            }}
          />

        )}

      </button>

    );

  })}

</div>

      </div>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

        {/* Legend */}

        <div className="flex flex-wrap gap-x-4 gap-y-2">

          <Legend color="#22c55e" label="Good" />
          <Legend color="#84cc16" label="Satisfactory" />
          <Legend color="#f59e0b" label="Moderate" />
          <Legend color="#f97316" label="Poor" />
          <Legend color="#f43f5e" label="Very Poor" />
          <Legend color="#991b1b" label="Severe" />

        </div>

        {/* Records */}

        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">

          <MapPin size={13} />

          <span>

            {monthStats.monitoredDays} monitored days

          </span>

        </div>

      </div>

    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  label,
  value,
  sublabel,
  accent,
}) {
  return (

    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">

      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `${accent}15`,
          color: accent,
        }}
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

// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({
  label,
  value,
  color,
}) {
  return (

    <div className="text-right">

      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">

        {label}

      </p>

      <p
        className="mt-1 text-sm font-black"
        style={{ color }}
      >

        {value}

      </p>

    </div>

  );
}

// =====================================================
// LEGEND
// =====================================================

function Legend({
  color,
  label,
}) {
  return (

    <div className="flex items-center gap-1.5">

      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />

      <span className="text-[9px] font-semibold text-slate-500">

        {label}

      </span>

    </div>

  );
}