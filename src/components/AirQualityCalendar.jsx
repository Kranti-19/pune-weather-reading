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
  X,
  Loader2,
  Search,
  ChevronDown,
} from "lucide-react";

import API from "../api/apiClient";

// =====================================================
// AQI CATEGORY
// =====================================================

const getAqiCategory = (aqi) => {
  const value = Number(aqi);

  if (!Number.isFinite(value)) {
    return "No Data";
  }

  if (value <= 50) return "Good";
  if (value <= 100) return "Satisfactory";
  if (value <= 200) return "Moderate";
  if (value <= 300) return "Poor";
  if (value <= 400) return "Very Poor";

  return "Severe";
};

// =====================================================
// AQI STYLE
// =====================================================

const getHeatmapStyle = (aqi) => {
  if (
    aqi === null ||
    aqi === undefined ||
    !Number.isFinite(Number(aqi))
  ) {
    return {
      background: "#f8fafc",
      border: "#e2e8f0",
      accent: "#94a3b8",
      text: "#64748b",
    };
  }

  const value = Number(aqi);

  // GOOD
  if (value <= 50) {
    const intensity = Math.max(
      0.12,
      value / 50
    );

    return {
      background: `rgba(34, 197, 94, ${
        0.08 + intensity * 0.16
      })`,
      border: "rgba(34, 197, 94, 0.30)",
      accent: "#22c55e",
      text: "#166534",
    };
  }

  // SATISFACTORY
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

  // MODERATE
  if (value <= 200) {
    return {
      background: "#fffbeb",
      border: "#fde68a",
      accent: "#f59e0b",
      text: "#92400e",
    };
  }

  // POOR
  if (value <= 300) {
    return {
      background: "#fff7ed",
      border: "#fed7aa",
      accent: "#f97316",
      text: "#9a3412",
    };
  }

  // VERY POOR
  if (value <= 400) {
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
// COMPONENT
// =====================================================

export default function AirQualityCalendar() {
  // ===================================================
  // MONTH STATE
  // ===================================================

  const [currentDate, setCurrentDate] =
    useState(new Date());

  // ===================================================
  // CALENDAR DATA
  // ===================================================

  const [calendarData, setCalendarData] =
    useState([]);

  const [calendarSummary, setCalendarSummary] =
    useState({
      monthlyAverage: null,
      highestDay: null,
      lowestDay: null,
      totalDaysWithData: 0,
    });

  const [loadingCalendar, setLoadingCalendar] =
    useState(false);

  const [calendarError, setCalendarError] =
    useState("");

  // ===================================================
  // SELECTED DAY
  // ===================================================

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [selectedDayData, setSelectedDayData] =
    useState(null);

  const [loadingDay, setLoadingDay] =
    useState(false);

  const [dayError, setDayError] =
    useState("");

  // ===================================================
  // TABLE SEARCH
  // ===================================================

  const [stationSearch, setStationSearch] =
    useState("");

  // ===================================================
  // TABLE PAGINATION
  // ===================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const [rowsPerPage, setRowsPerPage] =
    useState(25);

  // ===================================================
  // CURRENT MONTH
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

  // ===================================================
  // FETCH MONTHLY CALENDAR DATA
  // ===================================================

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoadingCalendar(true);
        setCalendarError("");

        const response = await API.get(
          "/history/calendar",
          {
            params: {
              year,
              month: month + 1,
            },
          }
        );

        const result =
          response.data;

        console.log(
          "Historical calendar API:",
          result
        );

        if (
          result?.status !==
          "success"
        ) {
          throw new Error(
            result?.message ||
              "Unable to load historical AQI."
          );
        }

        const data =
          result?.data || {};

        setCalendarData(
          Array.isArray(data.days)
            ? data.days
            : []
        );

        setCalendarSummary({
          monthlyAverage:
            data.monthlyAverage ??
            null,

          highestDay:
            data.highestDay ??
            null,

          lowestDay:
            data.lowestDay ??
            null,

          totalDaysWithData:
            data.totalDaysWithData ??
            0,
        });
      } catch (error) {
        console.error(
          "Historical calendar error:",
          error
        );

        setCalendarData([]);

        setCalendarSummary({
          monthlyAverage: null,
          highestDay: null,
          lowestDay: null,
          totalDaysWithData: 0,
        });

        setCalendarError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to load historical AQI."
        );
      } finally {
        setLoadingCalendar(false);
      }
    };

    fetchCalendarData();
  }, [year, month]);

  // ===================================================
  // BUILD CALENDAR
  // ===================================================

  const {
    calendarCells,
    monthStats,
    bestDay,
    worstDay,
  } = useMemo(() => {
    const todayDate =
      new Date();

    const firstDayIndex =
      new Date(
        year,
        month,
        1
      ).getDay();

    const totalDaysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    // -------------------------------------------------
    // CREATE DAY LOOKUP
    // -------------------------------------------------

    const monthDataset = {};

    (calendarData || []).forEach(
      (item) => {
        if (!item?.date) {
          return;
        }

        /*
         * Backend date format:
         * YYYY-MM-DD
         *
         * Do not use new Date(item.date)
         * here because timezone conversion
         * can change the day.
         */

        const parts =
          String(item.date).split("-");

        if (
          parts.length !== 3
        ) {
          return;
        }

        const itemYear =
          Number(parts[0]);

        const itemMonth =
          Number(parts[1]);

        const itemDay =
          Number(parts[2]);

        if (
          itemYear !== year ||
          itemMonth !==
            month + 1
        ) {
          return;
        }

        const rawAqi =
          item.aqi;

        const aqi =
          rawAqi !== null &&
          rawAqi !== undefined &&
          rawAqi !== ""
            ? Number(rawAqi)
            : null;

        monthDataset[
          itemDay
        ] = {
          date: item.date,

          aqi:
            Number.isFinite(aqi)
              ? Math.round(aqi)
              : null,

          category:
            item.category ||
            getAqiCategory(aqi),

          dominant:
            item.dominant ||
            item.dominant_pollutant ||
            "—",

          observationCount:
            Number(
              item.observationCount
            ) || 0,

          stationCount:
            Number(
              item.stationCount
            ) || 0,
        };
      }
    );

    // -------------------------------------------------
    // CREATE CELLS
    // -------------------------------------------------

    const cells = [];

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

    for (
      let day = 1;
      day <= totalDaysInMonth;
      day++
    ) {
      const entry =
        monthDataset[day] ||
        null;

      const isToday =
        day ===
          todayDate.getDate() &&
        month ===
          todayDate.getMonth() &&
        year ===
          todayDate.getFullYear();

      cells.push({
        empty: false,

        day,

        aqi:
          entry?.aqi ??
          null,

        category:
          entry?.category ||
          "No Data",

        dominant:
          entry?.dominant ||
          "—",

        observationCount:
          entry?.observationCount ||
          0,

        stationCount:
          entry?.stationCount ||
          0,

        date:
          entry?.date ||
          `${year}-${String(
            month + 1
          ).padStart(
            2,
            "0"
          )}-${String(day).padStart(
            2,
            "0"
          )}`,

        isToday,
      });
    }

    // -------------------------------------------------
    // CALCULATED STATISTICS
    // -------------------------------------------------

    const validDays =
      Object.values(
        monthDataset
      ).filter(
        (item) =>
          item.aqi !== null &&
          Number.isFinite(
            item.aqi
          )
      );

    const calculatedAverage =
      validDays.length
        ? Math.round(
            validDays.reduce(
              (
                sum,
                item
              ) =>
                sum +
                Number(
                  item.aqi
                ),
              0
            ) /
              validDays.length
          )
        : null;

    const calculatedBest =
      validDays.length
        ? validDays.reduce(
            (
              best,
              item
            ) =>
              !best ||
              item.aqi <
                best.aqi
                ? item
                : best,
            null
          )
        : null;

    const calculatedWorst =
      validDays.length
        ? validDays.reduce(
            (
              worst,
              item
            ) =>
              !worst ||
              item.aqi >
                worst.aqi
                ? item
                : worst,
            null
          )
        : null;

    return {
      calendarCells:
        cells,

      monthStats: {
        average:
          calendarSummary
            .monthlyAverage ??
          calculatedAverage ??
          "—",

        monitoredDays:
          calendarSummary
            .totalDaysWithData ||
          validDays.length ||
          0,
      },

      bestDay:
        calendarSummary
          .lowestDay ||
        calculatedBest,

      worstDay:
        calendarSummary
          .highestDay ||
        calculatedWorst,
    };
  }, [
    year,
    month,
    calendarData,
    calendarSummary,
  ]);

  // ===================================================
  // PREVIOUS MONTH
  // ===================================================

  const handlePrevMonth =
    () => {
      setSelectedDay(null);
      setSelectedDayData(null);
      setDayError("");

      setCurrentDate(
        new Date(
          year,
          month - 1,
          1
        )
      );
    };

  // ===================================================
  // NEXT MONTH
  // ===================================================

  const handleNextMonth =
    () => {
      setSelectedDay(null);
      setSelectedDayData(null);
      setDayError("");

      setCurrentDate(
        new Date(
          year,
          month + 1,
          1
        )
      );
    };

  // ===================================================
  // CLICK DATE
  // ===================================================

  const handleDateClick =
    async (cell) => {
      if (
        !cell ||
        cell.empty
      ) {
        return;
      }

      const selectedDate =
        cell.date ||
        `${year}-${String(
          month + 1
        ).padStart(
          2,
          "0"
        )}-${String(
          cell.day
        ).padStart(
          2,
          "0"
        )}`;

      console.log(
        "Selected date:",
        selectedDate
      );

      setSelectedDay(
        cell
      );

      setSelectedDayData(
        null
      );

      setDayError("");

      setStationSearch("");

      setCurrentPage(1);

      setLoadingDay(true);

      try {
        const response =
          await API.get(
            "/history/day",
            {
              params: {
                date:
                  selectedDate,
              },
            }
          );

        const result =
          response.data;

        console.log(
          "Selected date AQI:",
          result
        );

        if (
          result?.status !==
          "success"
        ) {
          throw new Error(
            result?.message ||
              "Unable to load AQI for selected date."
          );
        }

        setSelectedDayData(
          result?.data ||
            null
        );
      } catch (error) {
        console.error(
          "Selected day AQI error:",
          error
        );

        setSelectedDayData(
          null
        );

        setDayError(
          error?.response
            ?.data?.message ||
            error?.message ||
            "Unable to load station-wise AQI."
        );
      } finally {
        setLoadingDay(
          false
        );
      }
    };

  // ===================================================
  // CLOSE DETAILS
  // ===================================================

  const closeDetails =
    () => {
      setSelectedDay(null);
      setSelectedDayData(null);
      setDayError("");
      setStationSearch("");
      setCurrentPage(1);
    };

  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate =
    (dateValue) => {
      if (!dateValue) {
        return "—";
      }

      const parts =
        String(
          dateValue
        ).split("-");

      if (
        parts.length !== 3
      ) {
        return String(
          dateValue
        );
      }

      const date =
        new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    };

  // ===================================================
  // STATION DATA
  // ===================================================

  const stationRows =
    selectedDayData?.stations ||
    [];

  // ===================================================
  // SEARCH STATIONS
  // ===================================================

  const filteredStations =
    useMemo(() => {
      const search =
        stationSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return stationRows;
      }

      return stationRows.filter(
        (station) =>
          String(
            station.station ||
              ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            station.ward ||
              ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            station.zone ||
              ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            station.category ||
              ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            station.dominant ||
              ""
          )
            .toLowerCase()
            .includes(search)
      );
    }, [
      stationRows,
      stationSearch,
    ]);

  // ===================================================
  // PAGINATION
  // ===================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredStations.length /
          rowsPerPage
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (safeCurrentPage - 1) *
    rowsPerPage;

  const endIndex =
    startIndex +
    rowsPerPage;

  const paginatedStations =
    filteredStations.slice(
      startIndex,
      endIndex
    );

  // ===================================================
  // RESET PAGE WHEN SEARCH/PAGE SIZE CHANGES
  // ===================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    stationSearch,
    rowsPerPage,
  ]);

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="mb-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">

      {/* =================================================
          HEADER
      ================================================== */}

      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 px-5 py-5 sm:px-6">

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f5f97] text-white shadow-lg shadow-blue-200">

                <CalendarDays
                  size={20}
                />

              </div>

              <div>

                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Air Quality History
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Click any date to view station-wise AQI
                </p>

              </div>

            </div>
          </div>

          {/* MONTH NAVIGATION */}

          <div className="flex items-center gap-3">

            <button
              onClick={
                handlePrevMonth
              }
              disabled={
                loadingCalendar
              }
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
              disabled={
                loadingCalendar
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight
                size={18}
              />
            </button>

          </div>

        </div>
      </div>

      {/* =================================================
          STATISTICS
      ================================================== */}

      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-3 sm:px-6">

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
            bestDay?.date
              ? formatDate(
                  bestDay.date
                )
              : "No records"
          }
          accent="#22c55e"
        />

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
            worstDay?.date
              ? formatDate(
                  worstDay.date
                )
              : "No records"
          }
          accent="#f59e0b"
        />

      </div>

      {/* =================================================
          CALENDAR
      ================================================== */}

      <div className="px-4 py-4 sm:px-6 sm:py-5">

        {/* LOADING */}

        {loadingCalendar && (
          <div className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 py-3 text-xs font-medium text-blue-700">

            <Loader2
              size={16}
              className="animate-spin"
            />

            Loading historical AQI...

          </div>
        )}

        {/* ERROR */}

        {!loadingCalendar &&
          calendarError && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {calendarError}
            </div>
          )}

        {/* WEEK DAYS */}

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

        {/* CALENDAR */}

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">

          {calendarCells.map(
            (cell) => {

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

              const hasData =
                cell.aqi !==
                  null &&
                cell.aqi !==
                  undefined &&
                Number.isFinite(
                  Number(
                    cell.aqi
                  )
                );

              const heatmap =
                getHeatmapStyle(
                  cell.aqi
                );

              const isSelected =
                selectedDay?.day ===
                cell.day;

              return (
                <button
                  key={
                    cell.day
                  }
                  disabled={
                    loadingDay ||
                    loadingCalendar
                  }
                  onClick={() =>
                    handleDateClick(
                      cell
                    )
                  }
                  className={`
                    relative h-[64px] overflow-hidden rounded-xl text-left transition-all duration-200 sm:h-[72px]
                    ${
                      hasData
                        ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
                        : "cursor-pointer hover:bg-slate-50"
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

                    border:
                      `1px solid ${
                        hasData
                          ? heatmap.border
                          : "#f1f5f9"
                      }`,
                  }}
                >

                  {/* DAY */}

                  <div className="absolute left-2.5 top-2">

                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color:
                          hasData
                            ? heatmap.text
                            : "#64748b",
                      }}
                    >
                      {cell.day}
                    </span>

                  </div>

                  {/* TODAY */}

                  {cell.isToday && (
                    <span className="absolute right-2 top-2 rounded-md bg-blue-600 px-1.5 py-[2px] text-[7px] font-black uppercase tracking-wide text-white shadow-sm">
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
                        {cell.aqi}
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
                    <div className="flex h-full flex-col items-center justify-center">

                      <span className="text-[10px] text-slate-300">
                        No Data
                      </span>

                    </div>
                  )}

                  {/* BOTTOM BAR */}

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
      </div>

      {/* =================================================
          STATION-WISE TABLE
      ================================================== */}

      {selectedDay && (
        <div className="border-t border-slate-200 bg-slate-50/80 p-4 sm:p-6">

          {/* TABLE HEADER */}

          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <MapPin
                  size={18}
                  className="text-blue-600"
                />

                <h3 className="text-lg font-black text-slate-900">
                  Station-wise AQI
                </h3>

              </div>

              <p className="mt-1 text-sm text-slate-500">

                {formatDate(
                  selectedDay.date
                )}

              </p>

            </div>

            <button
              onClick={
                closeDetails
              }
              className="flex h-9 w-9 items-center justify-center self-end rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 lg:self-auto"
            >
              <X
                size={17}
              />
            </button>

          </div>

          {/* LOADING */}

          {loadingDay && (
            <div className="flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 py-10">

              <div className="flex items-center gap-3 text-sm font-medium text-blue-700">

                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Loading station-wise AQI...

              </div>

            </div>
          )}

          {/* ERROR */}

          {!loadingDay &&
            dayError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {dayError}
              </div>
            )}

          {/* DATA */}

          {!loadingDay &&
            !dayError &&
            selectedDayData && (
              <>

                {/* SUMMARY CARDS */}

                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <StatCard
                    icon={
                      <Activity
                        size={17}
                      />
                    }
                    label="Overall AQI"
                    value={
                      selectedDayData.overallAqi ??
                      "—"
                    }
                    sublabel={
                      selectedDayData.overallCategory ??
                      "No Data"
                    }
                    accent="#2563eb"
                  />

                  <StatCard
                    icon={
                      <MapPin
                        size={17}
                      />
                    }
                    label="Stations"
                    value={
                      selectedDayData.totalStations ??
                      0
                    }
                    sublabel="Stations"
                    accent="#22c55e"
                  />

                </div>

                {/* =================================================
                    SEARCH + ROW SIZE
                ================================================== */}

                <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">

                  {/* SEARCH */}

                  <div className="relative w-full md:max-w-sm">

                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={
                        stationSearch
                      }
                      onChange={(e) =>
                        setStationSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search station, ward, zone..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* ROW SIZE */}

                  <div className="flex items-center gap-2">

                    <span className="text-xs font-medium text-slate-500">
                      Rows:
                    </span>

                    <div className="relative">

                      <select
                        value={
                          rowsPerPage
                        }
                        onChange={(e) =>
                          setRowsPerPage(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      >

                        <option value={25}>
                          25
                        </option>

                        <option value={50}>
                          50
                        </option>

                        <option value={100}>
                          100
                        </option>

                      </select>

                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                    </div>

                  </div>

                </div>

                {/* =================================================
                    RESULT COUNT
                    Total observations REMOVED
                ================================================== */}

                <div className="mb-3">

                  <p className="text-xs font-medium text-slate-500">

                    Showing{" "}

                    <span className="font-bold text-slate-700">
                      {filteredStations.length ===
                      0
                        ? 0
                        : startIndex +
                          1}
                    </span>

                    {" "}to{" "}

                    <span className="font-bold text-slate-700">
                      {Math.min(
                        endIndex,
                        filteredStations.length
                      )}
                    </span>

                    {" "}of{" "}

                    <span className="font-bold text-slate-700">
                      {
                        filteredStations.length
                      }
                    </span>

                    {" "}stations

                  </p>

                </div>

                {/* =================================================
                    TABLE
                ================================================== */}

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="overflow-x-auto">

                    <table className="min-w-[1100px] w-full border-collapse">

                      <thead>

                        <tr className="border-b border-slate-200 bg-slate-50">

                          <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                            #
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Station
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Ward
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Zone
                          </th>

                          <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                            AQI
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Category
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Dominant
                          </th>

                          <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Observations
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Latest Reading
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {paginatedStations.map(
                          (
                            station,
                            index
                          ) => {

                            const aqi =
                              station.aqi;

                            const style =
                              getHeatmapStyle(
                                aqi
                              );

                            const rowNumber =
                              startIndex +
                              index +
                              1;

                            return (
                              <tr
                                key={
                                  station.stationId
                                }
                                className="border-b border-slate-100 transition hover:bg-blue-50/40"
                              >

                                {/* NUMBER */}

                                <td className="px-4 py-3 text-xs font-semibold text-slate-400">
                                  {rowNumber}
                                </td>

                                {/* STATION */}

                                <td className="px-4 py-3">

                                  <div className="font-bold text-slate-800">
                                    {station.station ||
                                      "Unknown Station"}
                                  </div>

                                </td>

                                {/* WARD */}

                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {station.ward ||
                                    "—"}
                                </td>

                                {/* ZONE */}

                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {station.zone ||
                                    "—"}
                                </td>

                                {/* AQI */}

                                <td className="px-4 py-3 text-center">

                                  <span
                                    className="inline-flex min-w-[52px] items-center justify-center rounded-lg px-2.5 py-1.5 font-mono text-sm font-black"
                                    style={{
                                      background:
                                        style.background,

                                      color:
                                        style.text,

                                      border:
                                        `1px solid ${style.border}`,
                                    }}
                                  >
                                    {aqi ??
                                      "—"}
                                  </span>

                                </td>

                                {/* CATEGORY */}

                                <td className="px-4 py-3">

                                  <span
                                    className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold"
                                    style={{
                                      background:
                                        style.background,

                                      color:
                                        style.text,
                                    }}
                                  >
                                    {station.category ||
                                      getAqiCategory(
                                        aqi
                                      )}
                                  </span>

                                </td>

                                {/* DOMINANT */}

                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                  {station.dominant ||
                                    "—"}
                                </td>

                                {/* OBSERVATIONS */}

                                <td className="px-4 py-3 text-center">

                                  <span className="inline-flex min-w-[45px] items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                                    {station.observationCount ??
                                      0}
                                  </span>

                                </td>

                                {/* LATEST READING */}

                                <td className="px-4 py-3">

                                  {station.latestTimestamp ? (
                                    <div>

                                      <p className="text-xs font-semibold text-slate-700">

                                        {new Date(
                                          station.latestTimestamp
                                        ).toLocaleDateString(
                                          "en-IN",
                                          {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          }
                                        )}

                                      </p>

                                      <p className="mt-0.5 text-[11px] text-slate-400">

                                        {new Date(
                                          station.latestTimestamp
                                        ).toLocaleTimeString(
                                          "en-IN",
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )}

                                      </p>

                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      —
                                    </span>
                                  )}

                                </td>

                              </tr>
                            );
                          }
                        )}

                        {/* NO RESULTS */}

                        {!paginatedStations.length && (
                          <tr>

                            <td
                              colSpan={9}
                              className="px-4 py-12 text-center"
                            >

                              <div className="flex flex-col items-center justify-center">

                                <MapPin
                                  size={28}
                                  className="mb-2 text-slate-300"
                                />

                                <p className="text-sm font-semibold text-slate-500">
                                  No station records found
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Try changing your search.
                                </p>

                              </div>

                            </td>

                          </tr>
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

                {/* =================================================
                    PAGINATION
                ================================================== */}

                {filteredStations.length >
                  rowsPerPage && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-slate-500">

                      Page{" "}

                      <span className="font-bold text-slate-700">
                        {safeCurrentPage}
                      </span>

                      {" "}of{" "}

                      <span className="font-bold text-slate-700">
                        {totalPages}
                      </span>

                    </p>

                    <div className="flex items-center gap-2">

                      <button
                        disabled={
                          safeCurrentPage <=
                          1
                        }
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              Math.max(
                                1,
                                page - 1
                              )
                          )
                        }
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >

                        <ChevronLeft
                          size={14}
                        />

                        Previous

                      </button>

                      {/* PAGE NUMBERS */}

                      {Array.from(
                        {
                          length:
                            Math.min(
                              totalPages,
                              5
                            ),
                        },
                        (_, index) => {

                          let pageNumber;

                          if (
                            totalPages <=
                            5
                          ) {
                            pageNumber =
                              index +
                              1;
                          } else if (
                            safeCurrentPage <=
                            3
                          ) {
                            pageNumber =
                              index +
                              1;
                          } else if (
                            safeCurrentPage >=
                            totalPages -
                              2
                          ) {
                            pageNumber =
                              totalPages -
                              4 +
                              index;
                          } else {
                            pageNumber =
                              safeCurrentPage -
                              2 +
                              index;
                          }

                          return (
                            <button
                              key={
                                pageNumber
                              }
                              onClick={() =>
                                setCurrentPage(
                                  pageNumber
                                )
                              }
                              className={`
                                h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition
                                ${
                                  safeCurrentPage ===
                                  pageNumber
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                                }
                              `}
                            >
                              {
                                pageNumber
                              }
                            </button>
                          );
                        }
                      )}

                      <button
                        disabled={
                          safeCurrentPage >=
                          totalPages
                        }
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              Math.min(
                                totalPages,
                                page + 1
                              )
                          )
                        }
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >

                        Next

                        <ChevronRight
                          size={14}
                        />

                      </button>

                    </div>

                  </div>
                )}

              </>
            )}

        </div>
      )}

      {/* =================================================
          FOOTER
      ================================================== */}

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

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

        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">

          <MapPin
            size={13}
          />

          <span>
            {monthStats.monitoredDays}{" "}
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
          color:
            accent,
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