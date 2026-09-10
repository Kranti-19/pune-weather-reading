import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import {
  MapPin,
  Wifi,
  Activity,
  ChevronRight,
  WifiOff,
  Search,
  Download,
  Filter,
  Flame,
  RefreshCw,
  Navigation,
  Plus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import PuneMap from "../components/PuneMap";
import API from "../api/apiClient";

/* =========================================================
   CATEGORY STYLE
========================================================= */

const getCategoryStyle = (category) => {
  switch (String(category || "").trim()) {
    case "Good":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";

    case "Satisfactory":
      return "bg-green-50 text-green-700 border border-green-200";

    case "Moderate":
      return "bg-amber-50 text-amber-700 border border-amber-200";

    case "Poor":
      return "bg-orange-50 text-orange-700 border border-orange-200";

    case "Very Poor":
      return "bg-rose-50 text-rose-700 border border-rose-200";

    case "Severe":
      return "bg-red-100 text-red-900 border border-red-300";

    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
};

/* =========================================================
   FORMAT LAST UPDATED TIME
========================================================= */

const formatLastUpdated = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "1 day ago";
  }

  return `${diffDays} days ago`;
};

/* =========================================================
   NORMALIZE BACKEND DATA

   Backend can return:
   - id
   - station_id
   - stationId
   - numericId
   etc.

   This keeps the frontend stable.
========================================================= */

const normalizeStation = (station, index) => {
  if (!station || typeof station !== "object") {
    return {
      id: `PMC-${String(index + 1).padStart(3, "0")}`,
      numericId: String(index + 1),
      station_id: index + 1,
      name: "Unknown Station",
      ward: "Unknown Ward",
      zone: "Unknown Zone",
      latitude: null,
      longitude: null,
      station_type: "CAAQM",
      aqi: 0,
      category: "Unknown",
      dominant: "N/A",
      pm25: 0,
      pm10: 0,
      status: "Offline",
      updated: "N/A",
      lastReadingAt: null,
      deviceCount: 0,
    };
  }

  /* -------------------------------------------------------
     DATABASE ID
  ------------------------------------------------------- */

  const rawDatabaseId =
    station.station_id ??
    station.stationId ??
    station.numericId ??
    station.numeric_id ??
    station.id ??
    null;

  const numericId =
    rawDatabaseId !== null &&
    rawDatabaseId !== undefined &&
    String(rawDatabaseId).trim() !== ""
      ? String(rawDatabaseId)
      : String(index + 1);

  /* -------------------------------------------------------
     DISPLAY STATION ID
  ------------------------------------------------------- */

  const displayId =
    station.id ??
    station.code ??
    `PMC-${String(numericId).padStart(3, "0")}`;

  /* -------------------------------------------------------
     NAME
  ------------------------------------------------------- */

  const name =
    station.name ??
    station.stationName ??
    station.station_name ??
    station.locationName ??
    station.location_name ??
    "Unknown Station";

  /* -------------------------------------------------------
     WARD
  ------------------------------------------------------- */

  const ward =
    station.ward ??
    station.wardName ??
    station.ward_name ??
    "Unknown Ward";

  /* -------------------------------------------------------
     ZONE
  ------------------------------------------------------- */

  const zone =
    station.zone ??
    station.zoneName ??
    station.zone_name ??
    "Unknown Zone";

  /* -------------------------------------------------------
     AQI
  ------------------------------------------------------- */

  const aqiValue =
    station.aqi ??
    station.AQI ??
    station.aqiValue ??
    station.aqi_value ??
    0;

  /* -------------------------------------------------------
     PM2.5
  ------------------------------------------------------- */

  const pm25Value =
    station.pm25 ??
    station.pm2_5 ??
    station["PM2.5"] ??
    station.PM25 ??
    station.pm2_5_value ??
    0;

  /* -------------------------------------------------------
     PM10
  ------------------------------------------------------- */

  const pm10Value =
    station.pm10 ??
    station.PM10 ??
    station.pm10Value ??
    station.pm10_value ??
    0;

  /* -------------------------------------------------------
     DOMINANT POLLUTANT
  ------------------------------------------------------- */

  const dominant =
    station.dominant ??
    station.dominantPollutant ??
    station.dominant_pollutant ??
    station.primaryPollutant ??
    station.primary_pollutant ??
    "N/A";

  /* -------------------------------------------------------
     AQI CATEGORY
  ------------------------------------------------------- */

  const category =
    station.category ??
    station.aqiCategory ??
    station.aqi_category ??
    "Unknown";

  /* -------------------------------------------------------
     STATUS
  ------------------------------------------------------- */

  let status =
    station.status ??
    station.Status ??
    station.stationStatus ??
    station.station_status ??
    "Offline";

  if (typeof status === "string") {
    const normalizedStatus = status.toLowerCase().trim();

    if (
      normalizedStatus === "online" ||
      normalizedStatus === "active" ||
      normalizedStatus === "connected"
    ) {
      status = "Online";
    } else {
      status = "Offline";
    }
  } else {
    status = "Offline";
  }

  /* -------------------------------------------------------
     UPDATED TIME
  ------------------------------------------------------- */

  const rawUpdated =
    station.updated ??
    station.lastUpdated ??
    station.last_updated ??
    station.updatedAt ??
    station.updated_at ??
    station.lastReadingAt ??
    station.last_reading_at ??
    null;

  const updated = formatLastUpdated(rawUpdated);

  /* -------------------------------------------------------
     LATITUDE / LONGITUDE
  ------------------------------------------------------- */

  const latitude =
    station.latitude !== undefined &&
    station.latitude !== null
      ? Number(station.latitude)
      : null;

  const longitude =
    station.longitude !== undefined &&
    station.longitude !== null
      ? Number(station.longitude)
      : null;

  /* -------------------------------------------------------
     DEVICE COUNT
  ------------------------------------------------------- */

  const deviceCount =
    station.deviceCount ??
    station.device_count ??
    0;

  return {
    ...station,

    id: String(displayId),
    numericId: String(numericId),
    station_id: rawDatabaseId,

    name: String(name),
    ward: String(ward),
    zone: String(zone),

    latitude:
      Number.isFinite(latitude)
        ? latitude
        : null,

    longitude:
      Number.isFinite(longitude)
        ? longitude
        : null,

    station_type:
      station.station_type ??
      station.stationType ??
      "CAAQM",

    aqi: Number(aqiValue) || 0,

    category: String(category),
    dominant: String(dominant),

    pm25: Number(pm25Value) || 0,
    pm10: Number(pm10Value) || 0,

    status,

    updated,

    lastReadingAt:
      station.lastReadingAt ??
      station.last_reading_at ??
      rawUpdated,

    deviceCount:
      Number(deviceCount) || 0,
  };
};

/* =========================================================
   COMPONENT
========================================================= */

export default function PuneAreas() {
  const navigate = useNavigate();

  /* =======================================================
     STATE

     IMPORTANT:
     No hardcoded station data here.
     Data starts empty and comes from database.
  ======================================================= */

  const [stations, setStations] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [zoneFilter, setZoneFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");

  /* =======================================================
     LOAD STATIONS FROM DATABASE
  ======================================================= */

  const loadStationsFromAPI = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      /*
       * This calls:
       *
       * GET http://localhost:5000/api/stations
       *
       * through your API client.
       */

      const response = await API.get("/stations");

      const responseData = response?.data;

      let list = [];

      /* ---------------------------------------------------
         SUPPORT DIFFERENT RESPONSE STRUCTURES
      --------------------------------------------------- */

      if (Array.isArray(responseData)) {
        list = responseData;
      } else if (Array.isArray(responseData?.stations)) {
        list = responseData.stations;
      } else if (Array.isArray(responseData?.data)) {
        list = responseData.data;
      } else if (Array.isArray(responseData?.results)) {
        list = responseData.results;
      }

      /* ---------------------------------------------------
         DATABASE RETURNED STATIONS
      --------------------------------------------------- */

      if (list.length > 0) {
        const normalizedStations = list.map(
          (station, index) =>
            normalizeStation(station, index)
        );

        setStations(normalizedStations);
      } else {
        /*
         * Do NOT use hardcoded fallback data.
         * If database is empty, show empty state.
         */

        setStations([]);

        setError(
          "No monitoring stations were found in the database."
        );
      }
    } catch (err) {
      console.error(
        "Error loading stations from backend:",
        err
      );

      setStations([]);

      setError(
        err?.response?.data?.message ||
          "Unable to connect to the station backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     LOAD DATA WHEN PAGE OPENS
  ======================================================= */

  useEffect(() => {
    loadStationsFromAPI();
  }, [loadStationsFromAPI]);

  /* =======================================================
     FILTER STATIONS
  ======================================================= */

  const filteredStations = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return stations.filter((station) => {
      const stationName = String(
        station?.name ?? ""
      ).toLowerCase();

      const ward = String(
        station?.ward ?? ""
      ).toLowerCase();

      const id = String(
        station?.id ?? ""
      ).toLowerCase();

      const zone = String(
        station?.zone ?? ""
      ).toLowerCase();

      const matchesSearch =
        stationName.includes(search) ||
        ward.includes(search) ||
        id.includes(search) ||
        zone.includes(search);

      const matchesZone =
        zoneFilter === "All" ||
        String(station?.zone ?? "")
          .toLowerCase()
          .includes(zoneFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        station?.status === statusFilter;

      return (
        matchesSearch &&
        matchesZone &&
        matchesStatus
      );
    });
  }, [
    stations,
    searchTerm,
    zoneFilter,
    statusFilter,
  ]);

  /* =======================================================
     SUMMARY COUNTS
  ======================================================= */

  const onlineStations = stations.filter(
    (station) =>
      station?.status === "Online"
  ).length;

  const offlineStations = stations.filter(
    (station) =>
      station?.status === "Offline"
  ).length;

  const attentionRequired = stations.filter(
    (station) => {
      const aqi =
        Number(station?.aqi) || 0;

      return (
        station?.status === "Offline" ||
        aqi > 200
      );
    }
  ).length;

  /* =======================================================
     EXPORT CSV
  ======================================================= */

  const handleExportCSV = () => {
    if (filteredStations.length === 0) {
      alert(
        "There are no station records to export."
      );
      return;
    }

    const headers = [
      "Station ID",
      "Name",
      "Ward",
      "Zone",
      "AQI",
      "Category",
      "Dominant Pollutant",
      "PM2.5",
      "PM10",
      "Status",
      "Last Updated",
    ];

    const rows = filteredStations.map(
      (station) => {
        return [
          station?.id ?? "",
          station?.name ?? "",
          station?.ward ?? "",
          station?.zone ?? "",
          station?.aqi ?? "",
          station?.category ?? "",
          station?.dominant ?? "",
          station?.pm25 ?? "",
          station?.pm10 ?? "",
          station?.status ?? "",
          station?.updated ?? "",
        ]
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",");
      }
    );

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download = `PMC_Air_Quality_Stations_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  };

  /* =======================================================
     NAVIGATE TO STATION
  ======================================================= */

  const handleStationNavigation = (
    station
  ) => {
    const safeId =
      station?.numericId ||
      station?.station_id ||
      (station?.id
        ? String(
            station.id
          ).replace(/\D/g, "")
        : "");

    if (!safeId) {
      console.error(
        "Station ID missing:",
        station
      );

      return;
    }

    navigate(
      `/station/${safeId}`
    );
  };

  /* =======================================================
     ADD MONITORING SITE
  ======================================================= */

  const handleAddMonitoringSite = () => {
    navigate("/admin/add-monitoring-site");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">

        <div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">

            <span>
              Geospatial Surveillance
            </span>

            <span>/</span>

            <span className="text-blue-600 font-bold">
              Pune Municipal Corporation (PMC)
            </span>

          </div>

          <div className="flex items-center gap-3 flex-wrap">

            <h1
                style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}
                className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-none"
              >
              Pune Ward Monitoring Stations
            </h1>

            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-0.5 rounded-full">

              

            </span>

          </div>

          

        </div>

        {/* =================================================
            HEADER BUTTONS
        ================================================= */}

        <div className="flex items-center gap-2.5 flex-wrap">

          {/* ADD MONITORING SITE */}

          <button
            type="button"
            onClick={handleAddMonitoringSite}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition"
          >
            <Plus size={14} />

            <span>
              Add Monitoring Site
            </span>
          </button>

          {/* REFRESH */}

          <button
            onClick={loadStationsFromAPI}
            disabled={loading}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs transition active:scale-95 disabled:opacity-50"
          >

            <RefreshCw
              size={13}
              className={
                loading
                  ? "animate-spin text-blue-600"
                  : "text-slate-400"
              }
            />

            <span>
              {loading
                ? "Loading..."
                : "Refresh Stations"}
            </span>

          </button>

          

        </div>

      </div>

      {/* ===================================================
          ERROR MESSAGE
      =================================================== */}

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-sm font-semibold">

          <div className="flex items-center justify-between gap-3">

            <div>
              {error}
            </div>

            <button
              onClick={loadStationsFromAPI}
              className="px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100"
            >
              Retry
            </button>

          </div>

        </div>
      )}

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">

        {/* TOTAL */}

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Monitored Nodes
            </p>

            <p className="text-3xl font-black text-slate-900 mt-1">
              {stations.length}
            </p>

            <p className="text-xs text-slate-500 font-medium mt-1">
              Database registered stations
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner border border-blue-100">
            <MapPin size={22} />
          </div>

        </div>

        {/* ONLINE */}

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Telemetry Active
            </p>

            <p className="text-3xl font-black text-emerald-600 mt-1">
              {onlineStations}
            </p>

            <p className="text-xs text-emerald-600 font-medium mt-1">
              Currently online
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner border border-emerald-100">
            <Wifi size={22} />
          </div>

        </div>

        {/* ATTENTION */}

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Attention Required
            </p>

            <p className="text-3xl font-black text-rose-600 mt-1">
              {attentionRequired}
            </p>

            <p className="text-xs text-rose-600 font-medium mt-1">
              AQI &gt; 200 or offline
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-inner border border-rose-100">
            <Activity size={22} />
          </div>

        </div>

      </div>

      {/* ===================================================
          SEARCH + FILTERS
      =================================================== */}

      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-7 flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* SEARCH */}

        <div className="relative w-full md:w-80">

          <Search
            className="absolute left-3.5 top-2.5 text-slate-400"
            size={16}
          />

          <input
            type="text"
            placeholder="Search station, ward, ID..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition shadow-inner"
          />

        </div>

        {/* FILTERS */}

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">

            <Filter size={13} />

            <span>
              Filters:
            </span>

          </div>

          {/* ZONE */}

          <select
            value={zoneFilter}
            onChange={(e) =>
              setZoneFilter(e.target.value)
            }
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >

            <option value="All">
              All Municipal Zones
            </option>

            <option value="West">
              West Zone
            </option>

            <option value="East">
              East Zone
            </option>

            <option value="North-West">
              North-West Zone
            </option>

            <option value="Central">
              Central Zone
            </option>

            <option value="South">
              South Zone
            </option>

          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >

            <option value="All">
              All Statuses
            </option>

            <option value="Online">
              Online Only
            </option>

            <option value="Offline">
              Offline Only
            </option>

          </select>

        </div>

      </div>

      {/* ===================================================
          STATION TABLE
      =================================================== */}

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] mb-7">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

          <div>

            <div className="flex items-center gap-2">

              <h2 className="text-base font-black text-slate-900">
                Registered CAAQM Station Registry
              </h2>

              <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                DATABASE
              </span>

            </div>

          </div>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="py-16 flex flex-col items-center justify-center text-slate-400">

            <RefreshCw
              size={28}
              className="animate-spin text-blue-600 mb-3"
            />

            <p className="text-sm font-semibold">
              Loading stations from database...
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs">

              <thead>

                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">

                  <th className="pb-3 pl-2">
                    Station Details
                  </th>

                  <th className="pb-3">
                    Ward & Zone
                  </th>

                  <th className="pb-3">
                    CPCB AQI
                  </th>

                  <th className="pb-3">
                    Dominant
                  </th>

                  <th className="pb-3">
                    PM2.5 / PM10
                  </th>

                  <th className="pb-3">
                    Status
                  </th>

                  <th className="pb-3">
                    Last Ping
                  </th>

                  <th className="pb-3 text-right pr-2">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {/* NO DATA */}

                {filteredStations.length === 0 ? (

                  <tr>

                    <td
                      colSpan="8"
                      className="py-14 text-center text-slate-400"
                    >

                      <div className="flex flex-col items-center gap-2">

                        <MapPin size={28} />

                        <span className="font-semibold">
                          {stations.length === 0
                            ? "No monitoring stations found in database"
                            : "No monitoring stations match your filters"}
                        </span>

                        {stations.length === 0 && (

                          <button
                            onClick={
                              loadStationsFromAPI
                            }
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                          >
                            Retry
                          </button>

                        )}

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredStations.map(
                    (station, index) => {

                      const targetId =
                        station?.numericId ||
                        station?.station_id ||
                        (station?.id
                          ? String(
                              station.id
                            ).replace(
                              /\D/g,
                              ""
                            )
                          : "") ||
                        String(
                          index + 1
                        );

                      const stationId =
                        station?.id ||
                        `PMC-${String(
                          index + 1
                        ).padStart(
                          3,
                          "0"
                        )}`;

                      return (

                        <tr
                          key={`${stationId}-${station?.station_id ?? index}`}
                          className="hover:bg-slate-50/80 transition duration-150 cursor-pointer"
                          onClick={() =>
                            handleStationNavigation(
                              station
                            )
                          }
                        >

                          {/* STATION */}

                          <td className="py-4 pl-2">

                            <div className="font-black text-slate-900 text-sm">
                              {station?.name ||
                                "Unknown Station"}
                            </div>

                            <div className="text-[10px] font-mono text-slate-400">
                              {stationId}
                            </div>

                          </td>

                          {/* WARD + ZONE */}

                          <td className="py-4">

                            <div className="font-bold text-slate-800">
                              {station?.ward ||
                                "Unknown Ward"}
                            </div>

                            <div className="text-[10px] text-slate-400 font-medium">
                              {station?.zone ||
                                "Unknown Zone"}
                            </div>

                          </td>

                          {/* AQI */}

                          <td className="py-4">

                            <div className="flex items-center gap-2">

                              <span className="font-black font-mono text-slate-900 text-base">
                                {station?.aqi ??
                                  0}
                              </span>

                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getCategoryStyle(
                                  station?.category
                                )}`}
                              >
                                {station?.category ||
                                  "Unknown"}
                              </span>

                            </div>

                          </td>

                          {/* DOMINANT */}

                          <td className="py-4">

                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl border border-slate-200/60">

                              <Flame
                                size={12}
                                className="text-amber-500"
                              />

                              <span>
                                {station?.dominant ||
                                  "N/A"}
                              </span>

                            </span>

                          </td>

                          {/* PM */}

                          <td className="py-4">

                            <div className="text-xs font-bold text-slate-800">

                              PM2.5:{" "}

                              <span className="text-blue-600">
                                {station?.pm25 ??
                                  0}
                              </span>{" "}

                              µg/m³

                            </div>

                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">

                              PM10:{" "}

                              {station?.pm10 ??
                                0}{" "}

                              µg/m³

                            </div>

                          </td>

                          {/* STATUS */}

                          <td className="py-4">

                            {station?.status ===
                            "Online" ? (

                              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">

                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                                <span>
                                  Online
                                </span>

                              </div>

                            ) : (

                              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600">

                                <WifiOff
                                  size={13}
                                />

                                <span>
                                  Offline
                                </span>

                              </div>

                            )}

                          </td>

                          {/* LAST PING */}

                          <td className="py-4 text-xs text-slate-400 font-mono font-medium">
                            {station?.updated ||
                              "N/A"}
                          </td>

                          {/* ACTION */}

                          <td className="py-4 text-right pr-2">

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                handleStationNavigation(
                                  station
                                );
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              aria-label={`View ${
                                station?.name ||
                                "station"
                              }`}
                            >

                              <ChevronRight
                                size={16}
                              />

                            </button>

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">

        <div className="flex items-center justify-between mb-4">

          <div>

            <div className="flex items-center gap-2">

              <h3 className="font-black text-slate-900 text-base">
                Municipal GIS Station Coverage
              </h3>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Live Geofence
              </span>

            </div>

          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">

            <Navigation
              size={13}
              className="text-blue-600"
            />

            <span>
              {stations.length > 0
                ? `${stations.length} database station${
                    stations.length === 1
                      ? ""
                      : "s"
                  } mapped`
                : "No database stations mapped"}
            </span>

          </div>

        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">

          <PuneMap stations={stations} />

        </div>

      </div>

    </div>
  );
}