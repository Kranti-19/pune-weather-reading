import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

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
// BACKEND API
// =====================================================

const HISTORY_API_URL =
  "http://localhost:5000/api/history/calendar";

// =====================================================
// AQI CATEGORY SYSTEM
// =====================================================

const getAqiMeta = (aqi) => {
  if (
    aqi === null ||
    aqi === undefined ||
    !Number.isFinite(Number(aqi))
  ) {
    return {
      label: "No data",
      color: "#cbd5e1",
      soft: "#f8fafc",
      border: "#e2e8f0",
      text: "#94a3b8",
    };
  }

  const value = Number(aqi);

  if (value <= 50) {
    return {
      label: "Good",
      color: "#22c55e",
      soft: "#f0fdf4",
      border: "#bbf7d0",
      text: "#166534",
    };
  }

  if (value <= 100) {
    return {
      label: "Satisfactory",
      color: "#84cc16",
      soft: "#f7fee7",
      border: "#d9f99d",
      text: "#3f6212",
    };
  }

  if (value <= 200) {
    return {
      label: "Moderate",
      color: "#f59e0b",
      soft: "#fffbeb",
      border: "#fde68a",
      text: "#92400e",
    };
  }

  if (value <= 300) {
    return {
      label: "Poor",
      color: "#f97316",
      soft: "#fff7ed",
      border: "#fed7aa",
      text: "#9a3412",
    };
  }

  if (value <= 400) {
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

// =====================================================
// HEATMAP STYLE
// =====================================================

const getHeatmapStyle = (aqi) => {
  if (
    aqi === null ||
    aqi === undefined ||
    !Number.isFinite(Number(aqi))
  ) {
    return {
      background: "#f8fafc",
      border: "#f1f5f9",
      accent: "#cbd5e1",
      text: "#cbd5e1",
    };
  }

  const value = Number(aqi);

  // ===================================================
  // GOOD
  // ===================================================

  if (value <= 50) {
    const intensity = Math.max(
      0.12,
      value / 50
    );

    return {
      background: `rgba(34, 197, 94, ${
        0.08 + intensity * 0.16
      })`,
      border:
        "rgba(34, 197, 94, 0.25)",
      accent: "#22c55e",
      text: "#166534",
    };
  }

  // ===================================================
  // SATISFACTORY
  // ===================================================

  if (value <= 100) {
    const intensity =
      (value - 50) / 50;

    return {
      background: `rgba(132, 204, 22, ${
        0.10 + intensity * 0.20
      })`,
      border: `rgba(132, 204, 22, ${
        0.25 + intensity * 0.20
      })`,
      accent: "#65a30d",
      text: "#3f6212",
    };
  }

  // ===================================================
  // MODERATE
  // ===================================================

  if (value <= 200) {
    return {
      background: "#fffbeb",
      border: "#fde68a",
      accent: "#f59e0b",
      text: "#92400e",
    };
  }

  // ===================================================
  // POOR
  // ===================================================

  if (value <= 300) {
    return {
      background: "#fff7ed",
      border: "#fed7aa",
      accent: "#f97316",
      text: "#9a3412",
    };
  }

  // ===================================================
  // VERY POOR
  // ===================================================

  if (value <= 400) {
    return {
      background: "#fff1f2",
      border: "#fecdd3",
      accent: "#f43f5e",
      text: "#9f1239",
    };
  }

  // ===================================================
  // SEVERE
  // ===================================================

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
  // ===================================================
  // STATE
  // ===================================================

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [historicalData, setHistoricalData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // CURRENT MONTH / YEAR
  // ===================================================

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  const monthName =
    currentDate.toLocaleString(
      "en-US",
      {
        month: "long",
      }
    );

  // Backend expects month from 1 to 12.
  const apiMonth =
    month + 1;

  // =====================================================
  // FETCH HISTORICAL AQI FROM BACKEND
  // =====================================================

  useEffect(() => {
    let ignore = false;

    const fetchHistoricalData =
      async () => {
        try {
          setLoading(true);
          setError("");
          setSelectedDay(null);

          const url =
            `${HISTORY_API_URL}` +
            `?year=${year}` +
            `&month=${apiMonth}`;

          console.log(
            "================================="
          );

          console.log(
            "FETCHING HISTORICAL AQI"
          );

          console.log(
            "Year:",
            year
          );

          console.log(
            "Month:",
            apiMonth
          );

          console.log(
            "URL:",
            url
          );

          console.log(
            "================================="
          );

          const response =
            await fetch(
              url,
              {
                method: "GET",
                cache: "no-store",
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          let result = null;

          try {
            result =
              await response.json();
          } catch (jsonError) {
            throw new Error(
              "Backend did not return valid JSON."
            );
          }

          console.log(
            "Historical AQI API response:",
            result
          );

          // ---------------------------------------------
          // SERVER ERROR
          // ---------------------------------------------

          if (!response.ok) {
            throw new Error(
              result?.message ||
                `Historical API failed with status ${response.status}.`
            );
          }

          // ---------------------------------------------
          // API STATUS
          // ---------------------------------------------

          if (
            result?.status !==
            "success"
          ) {
            throw new Error(
              result?.message ||
                "Unable to load historical AQI data."
            );
          }

          // ---------------------------------------------
          // GET DAYS
          // ---------------------------------------------

          const days =
            Array.isArray(
              result?.data?.days
            )
              ? result.data.days
              : [];

          console.log(
            "Historical days:",
            days
          );

          // ---------------------------------------------
          // UPDATE STATE
          // ---------------------------------------------

          if (!ignore) {
            setHistoricalData(
              days
            );
          }
        } catch (err) {
          console.error(
            "Historical AQI error:",
            err
          );

          if (!ignore) {
            setHistoricalData([]);

            setError(
              err?.message ||
                "Unable to connect to historical AQI backend."
            );
          }
        } finally {
          if (!ignore) {
            setLoading(false);
          }
        }
      };

    fetchHistoricalData();

    // Prevent an old request from
    // overwriting newer month data.
    return () => {
      ignore = true;
    };
  }, [year, apiMonth]);

  // =====================================================
  // PREPARE CALENDAR DATA
  // =====================================================

  const {
    calendarCells,
    monthStats,
    bestDay,
    worstDay,
  } = useMemo(() => {
    // -----------------------------------------------
    // FIRST DAY OF MONTH
    // -----------------------------------------------

    const firstDayIndex =
      new Date(
        year,
        month,
        1
      ).getDay();

    // -----------------------------------------------
    // TOTAL DAYS IN MONTH
    // -----------------------------------------------

    const totalDaysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    // -----------------------------------------------
    // CONVERT API ARRAY TO DATE MAP
    // -----------------------------------------------

    const dataByDate = {};

    historicalData.forEach(
      (entry) => {
        if (!entry?.date) {
          return;
        }

        /*
         * Backend returns:
         *
         * 2026-09-01
         *
         * We split the string instead of using
         * new Date(entry.date) so timezone conversion
         * cannot move the record to the previous day.
         */

        const parts =
          String(entry.date).split(
            "-"
          );

        if (
          parts.length !== 3
        ) {
          return;
        }

        const entryYear =
          Number(parts[0]);

        const entryMonth =
          Number(parts[1]);

        const entryDay =
          Number(parts[2]);

        // Only accept records for
        // currently displayed month.
        if (
          entryYear !== year ||
          entryMonth !== apiMonth ||
          !Number.isInteger(
            entryDay
          )
        ) {
          return;
        }

        // ---------------------------------------------
        // NORMALIZE AQI
        // ---------------------------------------------

        const numericAqi =
          entry.aqi === null ||
          entry.aqi === undefined ||
          entry.aqi === ""
            ? null
            : Number(entry.aqi);

        dataByDate[entryDay] =
          {
            ...entry,

            aqi:
              Number.isFinite(
                numericAqi
              )
                ? numericAqi
                : null,

            dominant:
              entry.dominant ||
              entry.dominant_pollutant ||
              "—",
          };
      }
    );

    // -----------------------------------------------
    // CALENDAR CELLS
    // -----------------------------------------------

    const cells = [];

    let sum = 0;

    let count = 0;

    let minEntry = null;

    let maxEntry = null;

    // -----------------------------------------------
    // TODAY
    // -----------------------------------------------

    const now =
      new Date();

    const todayKey =
      `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      )}-${String(
        now.getDate()
      ).padStart(
        2,
        "0"
      )}`;

    // -----------------------------------------------
    // EMPTY CELLS BEFORE MONTH START
    // -----------------------------------------------

    for (
      let i = 0;
      i < firstDayIndex;
      i++
    ) {
      cells.push({
        empty: true,
        id: `empty-${i}`,
      });
    }

    // -----------------------------------------------
    // DAYS
    // -----------------------------------------------

    for (
      let day = 1;
      day <= totalDaysInMonth;
      day++
    ) {
      const entry =
        dataByDate[day];

      // ---------------------------------------------
      // STATISTICS
      // ---------------------------------------------

      if (
        entry &&
        entry.aqi !== null &&
        Number.isFinite(
          Number(entry.aqi)
        )
      ) {
        sum += Number(
          entry.aqi
        );

        count++;

        // Best AQI
        if (
          !minEntry ||
          entry.aqi <
            minEntry.aqi
        ) {
          minEntry = {
            day,
            ...entry,
          };
        }

        // Highest AQI
        if (
          !maxEntry ||
          entry.aqi >
            maxEntry.aqi
        ) {
          maxEntry = {
            day,
            ...entry,
          };
        }
      }

      // ---------------------------------------------
      // DATE KEY
      // ---------------------------------------------

      const dateKey =
        `${year}-${String(
          apiMonth
        ).padStart(
          2,
          "0"
        )}-${String(
          day
        ).padStart(
          2,
          "0"
        )}`;

      // ---------------------------------------------
      // CALENDAR CELL
      // ---------------------------------------------

      cells.push({
        empty: false,

        day,

        aqi:
          entry?.aqi ??
          null,

        dominant:
          entry?.dominant ??
          "—",

        category:
          entry?.category ||
          (
            entry?.aqi !==
              null &&
            entry?.aqi !==
              undefined
          )
            ? getAqiMeta(
                entry.aqi
              ).label
            : "No Data",

        observationCount:
          Number(
            entry?.observationCount ??
              0
          ),

        stationCount:
          Number(
            entry?.stationCount ??
              0
          ),

        isToday:
          dateKey ===
          todayKey,
      });
    }

    // -----------------------------------------------
    // RETURN
    // -----------------------------------------------

    return {
      calendarCells:
        cells,

      monthStats: {
        average:
          count > 0
            ? Math.round(
                sum / count
              )
            : "—",

        monitoredDays:
          count,
      },

      bestDay:
        minEntry,

      worstDay:
        maxEntry,
    };
  }, [
    year,
    month,
    apiMonth,
    historicalData,
  ]);

  // =====================================================
  // MONTH NAVIGATION
  // =====================================================

  const handlePrevMonth =
    () => {
      setSelectedDay(null);

      setCurrentDate(
        new Date(
          year,
          month - 1,
          1
        )
      );
    };

  const handleNextMonth =
    () => {
      setSelectedDay(null);

      setCurrentDate(
        new Date(
          year,
          month + 1,
          1
        )
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

                <CalendarDays
                  size={20}
                />

              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-lg font-black tracking-tight text-slate-900">
                    Air Quality History
                  </h2>

                  <span
                    className={`rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wide ${
                      loading
                        ? "bg-blue-50 text-blue-600"
                        : error
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {loading
                      ? "Loading"
                      : error
                        ? "Backend Error"
                        : "Live Data"}
                  </span>

                </div>

                <p className="mt-1 text-[9px] font-semibold text-slate-400">
                  Historical AQI from municipal monitoring data
                </p>

              </div>

            </div>

          </div>

          {/* Navigation */}

          <div className="flex items-center gap-3">

            <button
              onClick={
                handlePrevMonth
              }
              disabled={loading}
              aria-label="Previous month"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft
                size={18}
              />
            </button>

            <div className="min-w-[150px] text-center">

              <p className="text-sm font-black text-slate-800">
                {monthName}{" "}
                {year}
              </p>

              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Monthly Overview
              </p>

            </div>

            <button
              onClick={
                handleNextMonth
              }
              disabled={loading}
              aria-label="Next month"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight
                size={18}
              />
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
          icon={
            <Activity
              size={17}
            />
          }
          label="Monthly Average"
          value={
            monthStats.average
          }
          sublabel="AQI"
          accent="#2563eb"
        />

        {/* Best */}

        <StatCard
          icon={
            <TrendingUp
              size={17}
            />
          }
          label="Best Air Quality"
          value={
            bestDay?.aqi ??
            "—"
          }
          sublabel={
            bestDay
              ? `${bestDay.day} ${monthName}`
              : "No records"
          }
          accent="#22c55e"
        />

        {/* Worst */}

        <StatCard
          icon={
            <Wind
              size={17}
            />
          }
          label="Highest AQI"
          value={
            worstDay?.aqi ??
            "—"
          }
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
          ].map(
            (day) => (
              <div
                key={day}
                className="text-center text-[9px] font-black uppercase tracking-[0.14em] text-slate-400"
              >
                {day}
              </div>
            )
          )}

        </div>

        {/* Calendar heatmap */}

        {error && (
          <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-3 flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[10px] font-semibold text-blue-600">
            Loading historical AQI data from backend...
          </div>
        )}

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">

          {calendarCells.map(
            (cell) => {

              // -----------------------------------------
              // EMPTY CELL
              // -----------------------------------------

              if (
                cell.empty
              ) {
                return (
                  <div
                    key={
                      cell.id
                    }
                    className="h-[64px] sm:h-[72px]"
                  />
                );
              }

              // -----------------------------------------
              // DATA
              // -----------------------------------------

              const hasData =
                cell.aqi !==
                  null &&
                cell.aqi !==
                  undefined &&
                Number.isFinite(
                  Number(cell.aqi)
                );

              const meta =
                getAqiMeta(
                  cell.aqi
                );

              const heatmap =
                getHeatmapStyle(
                  cell.aqi
                );

              const isSelected =
                selectedDay?.day ===
                cell.day;

              // -----------------------------------------
              // CELL
              // -----------------------------------------

              return (
                <button
                  key={
                    cell.day
                  }
                  disabled={
                    !hasData
                  }
                  onClick={() => {
                    if (
                      hasData
                    ) {
                      setSelectedDay(
                        cell
                      );
                    }
                  }}
                  aria-label={
                    hasData
                      ? `${cell.day} ${monthName} ${year}, AQI ${cell.aqi}, ${cell.category}`
                      : `${cell.day} ${monthName} ${year}, no AQI data`
                  }
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
                    background:
                      heatmap.background,

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
                        color:
                          hasData
                            ? heatmap.text
                            : "#cbd5e1",
                      }}
                    >
                      {
                        cell.day
                      }
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
                          color:
                            heatmap.text,
                        }}
                      >
                        {
                          cell.aqi
                        }
                      </span>

                      <span
                        className="mt-1 text-[7px] font-bold uppercase tracking-[0.12em]"
                        style={{
                          color:
                            heatmap.accent,
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
                        background:
                          heatmap.accent,
                      }}
                    />
                  )}

                </button>
              );
            }
          )}

        </div>

        {/* ================================================= */}
        {/* SELECTED DAY DETAILS */}
        {/* ================================================= */}

        {selectedDay && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Selected Date
                </p>

                <p className="mt-1 text-sm font-black text-slate-900">
                  {
                    selectedDay.day
                  }{" "}
                  {monthName}{" "}
                  {year}
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-4">

                <InfoItem
                  label="AQI"
                  value={
                    selectedDay.aqi ??
                    "—"
                  }
                  color={
                    getAqiMeta(
                      selectedDay.aqi
                    ).text
                  }
                />

                <InfoItem
                  label="Category"
                  value={
                    selectedDay.category ||
                    getAqiMeta(
                      selectedDay.aqi
                    ).label
                  }
                  color={
                    getAqiMeta(
                      selectedDay.aqi
                    ).text
                  }
                />

                <InfoItem
                  label="Stations"
                  value={
                    selectedDay.stationCount ??
                    0
                  }
                  color="#2563eb"
                />

                <InfoItem
                  label="Observations"
                  value={
                    selectedDay.observationCount ??
                    0
                  }
                  color="#7c3aed"
                />

              </div>

            </div>

          </div>
        )}

      </div>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

        {/* Legend */}

        <div className="flex flex-wrap gap-x-4 gap-y-2">

          <Legend
            color="#22c55e"
            label="Good"
          />

          <Legend
            color="#84cc16"
            label="Satisfactory"
          />

          <Legend
            color="#f59e0b"
            label="Moderate"
          />

          <Legend
            color="#f97316"
            label="Poor"
          />

          <Legend
            color="#f43f5e"
            label="Very Poor"
          />

          <Legend
            color="#991b1b"
            label="Severe"
          />

        </div>

        {/* Records */}

        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">

          <MapPin
            size={13}
          />

          <span>
            {
              monthStats.monitoredDays
            }{" "}
            monitored days
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
          backgroundColor:
            `${accent}15`,
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
        style={{
          color,
        }}
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
          backgroundColor:
            color,
        }}
      />

      <span className="text-[9px] font-semibold text-slate-500">
        {label}
      </span>

    </div>
  );
}