import React, { useEffect, useMemo, useState } from "react";

import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Building2,
  RefreshCw,
  Search,
  XCircle,
  Activity,
  ShieldAlert,
  Wrench,
  BarChart3,
  Database,
  Clock3,
  Filter,
} from "lucide-react";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import API from "../api/apiClient";

// ============================================================
// DATE HELPERS
// ============================================================

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

// ============================================================
// REPORT TEMPLATES
// ============================================================

const REPORT_TEMPLATES = [
  {
    id: "CPCB_DAILY",
    title: "Daily CAAQM Station Audit",
    code: "FORM-IV / CPCB",
    desc: "24-hour pollutant averages with AQI classification and station data-quality status.",
    frequency: "Daily Automatic",
    status: "Ready",
    icon: FileText,
  },
  {
    id: "WARD_AQI",
    title: "Ward-wise AQI Report",
    code: "PMC-ENV-WARD",
    desc: "Daily or monthly AQI summary grouped according to municipal ward.",
    frequency: "Daily / Monthly",
    status: "Ready",
    icon: Building2,
  },
  {
    id: "POLLUTANT_TREND",
    title: "Pollutant Trend Report",
    code: "PMC-ENV-TREND",
    desc: "Daily PM2.5, PM10 and NO2 concentration trends.",
    frequency: "Custom Range",
    status: "Ready",
    icon: BarChart3,
  },
  {
    id: "UPTIME_QAQC",
    title: "Station Uptime & Data Completeness",
    code: "QAQC-TEL-99",
    desc: "Station reading count, data availability, current status and completeness.",
    frequency: "Weekly Audit",
    status: "Certified",
    icon: Activity,
  },
  {
    id: "ALERT_SUMMARY",
    title: "Alert Summary Report",
    code: "PMC-ALERT",
    desc: "Environmental alerts grouped by severity, parameter and station.",
    frequency: "Event Driven",
    status: "Ready",
    icon: ShieldAlert,
  },
  {
    id: "MAINTENANCE",
    title: "Maintenance & Calibration",
    code: "PMC-MAINT",
    desc: "Maintenance records, calibration records and overdue activities.",
    frequency: "Scheduled",
    status: "Ready",
    icon: Wrench,
  },
];

// ============================================================
// HELPERS
// ============================================================

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const formatNumber = (value, decimals = 1) => {
  const number = toNumber(value);

  if (number === null) {
    return "N/A";
  }

  return number.toFixed(decimals);
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getAqiCategory = (value) => {
  const aqi = toNumber(value);

  if (aqi === null) return "N/A";

  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";

  return "Severe";
};

const getAqiClass = (value) => {
  const aqi = toNumber(value);

  if (aqi === null) {
    return "bg-slate-100 text-slate-600";
  }

  if (aqi <= 50) {
    return "bg-green-100 text-green-700";
  }

  if (aqi <= 100) {
    return "bg-lime-100 text-lime-700";
  }

  if (aqi <= 200) {
    return "bg-yellow-100 text-yellow-700";
  }

  if (aqi <= 300) {
    return "bg-orange-100 text-orange-700";
  }

  if (aqi <= 400) {
    return "bg-red-100 text-red-700";
  }

  return "bg-purple-100 text-purple-700";
};

const getDataStatusClass = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "current":
      return "bg-green-50 text-green-700 border-green-200";

    case "historical":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";

    case "mixed":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "no data":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const escapeCSV = (value) => {
  const text =
    value === null || value === undefined
      ? ""
      : String(value);

  return `"${text.replace(/"/g, '""')}"`;
};

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
  icon: Icon,
  title,
  value,
  valueClass = "text-slate-800",
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p
            className={`mt-1 text-2xl font-bold ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPLIANCE BADGE
// ============================================================

const ComplianceBadge = ({ value }) => {
  const text = String(value || "N/A");

  let className =
    "bg-slate-100 text-slate-600";

  if (text.toLowerCase() === "compliant") {
    className =
      "bg-green-100 text-green-700";
  }

  if (text.toLowerCase().includes("action")) {
    className =
      "bg-orange-100 text-orange-700";
  }

  if (text.toLowerCase().includes("no data")) {
    className =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}
    >
      {text}
    </span>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Reports() {
  // ==========================================================
  // FILTERS
  // ==========================================================

  const [selectedStation, setSelectedStation] =
    useState("ALL");

  const [reportType, setReportType] =
    useState("CPCB_DAILY");

  const [fromDate, setFromDate] =
    useState(getToday());

  const [toDate, setToDate] =
    useState(getToday());

  const [wardGroupBy, setWardGroupBy] =
    useState("day");

  const [pollutantParameter, setPollutantParameter] =
    useState("ALL");

  // ==========================================================
  // DATA
  // ==========================================================

  const [stations, setStations] = useState([]);

  const [complianceRecords, setComplianceRecords] =
    useState([]);

  const [wardRecords, setWardRecords] =
    useState([]);

  const [pollutantRecords, setPollutantRecords] =
    useState([]);

  const [uptimeRecords, setUptimeRecords] =
    useState([]);

  const [alertRecords, setAlertRecords] =
    useState([]);

  const [alertSummary, setAlertSummary] =
    useState(null);

  const [maintenanceRecords, setMaintenanceRecords] =
    useState([]);

  const [calibrationRecords, setCalibrationRecords] =
    useState([]);

  const [maintenanceSummary, setMaintenanceSummary] =
    useState(null);

  const [reportSummary, setReportSummary] =
    useState(null);

  const [reportPeriod, setReportPeriod] =
    useState(null);

  // ==========================================================
  // UI
  // ==========================================================

  const [isLoading, setIsLoading] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  // ==========================================================
  // LOAD STATIONS ONLY
  // ==========================================================

  const fetchStations = async () => {
    try {
      const response = await API.get("/stations");

      const result = response.data;

      const stationList =
        Array.isArray(result?.stations)
          ? result.stations
          : Array.isArray(result?.data)
            ? result.data
            : [];

      setStations(stationList);
    } catch (err) {
      console.error(
        "Station loading error:",
        err
      );
    }
  };

  // ==========================================================
  // STATION MAP
  // ==========================================================

  const stationMap = useMemo(() => {
    const map = {};

    stations.forEach((station) => {
      const id =
        station.station_id ??
        station.stationId ??
        station.id;

      if (id !== undefined && id !== null) {
        map[String(id)] =
          station.name ??
          station.station_name ??
          station.stationName ??
          `Station ${id}`;
      }
    });

    return map;
  }, [stations]);

  // ==========================================================
  // MAIN REPORT
  // ==========================================================

  const fetchMainReport = async () => {
    const params = {
      from: fromDate,
      to: toDate,
    };

    if (selectedStation !== "ALL") {
      params.stationId = selectedStation;
    }

    const response = await API.get(
      "/reports",
      { params }
    );

    const result = response.data;

    if (result?.status !== "success") {
      throw new Error(
        result?.message ||
          "Unable to load station report."
      );
    }

    setStations(
      Array.isArray(result.stations)
        ? result.stations
        : stations
    );

    setComplianceRecords(
      Array.isArray(result.data)
        ? result.data
        : []
    );

    setReportSummary(
      result.summary || null
    );

    setReportPeriod(
      result.reportPeriod || null
    );
  };

  // ==========================================================
  // WARD REPORT
  // ==========================================================

  const fetchWardReport = async () => {
    const params = {
      from: fromDate,
      to: toDate,
      groupBy: wardGroupBy,
    };

    if (selectedStation !== "ALL") {
      params.stationId = selectedStation;
    }

    const response = await API.get(
      "/reports/ward",
      { params }
    );

    const result = response.data;

    if (result?.status !== "success") {
      throw new Error(
        result?.message ||
          "Unable to load ward report."
      );
    }

    setWardRecords(
      Array.isArray(result.data)
        ? result.data
        : []
    );
  };

  // ==========================================================
  // POLLUTANT TREND
  // ==========================================================

  const fetchPollutantTrend = async () => {
    const params = {
      from: fromDate,
      to: toDate,
    };

    if (pollutantParameter !== "ALL") {
      params.parameter =
        pollutantParameter;
    }

    if (selectedStation !== "ALL") {
      params.stationId = selectedStation;
    }

    const response = await API.get(
      "/reports/pollutant-trend",
      { params }
    );

    const result = response.data;

    if (result?.status !== "success") {
      throw new Error(
        result?.message ||
          "Unable to load pollutant trend."
      );
    }

    setPollutantRecords(
      Array.isArray(result.data)
        ? result.data
        : []
    );
  };

  // ==========================================================
  // UPTIME REPORT
  // ==========================================================

  const fetchUptimeReport = async () => {
    const params = {
      from: fromDate,
      to: toDate,
    };

    if (selectedStation !== "ALL") {
      params.stationId = selectedStation;
    }

    const response = await API.get(
      "/reports/uptime",
      { params }
    );

    const result = response.data;

    if (result?.status !== "success") {
      throw new Error(
        result?.message ||
          "Unable to load uptime report."
      );
    }

    setUptimeRecords(
      Array.isArray(result.data)
        ? result.data.map((row) => ({
            ...row,

            battery:
              row.batteryLevel ??
              row.battery ??
              row.battery_level ??
              null,
          }))
        : []
    );
  };

  // ==========================================================
  // ALERT REPORT
  // ==========================================================

  const fetchAlertReport = async () => {
    const params = {
      from: fromDate,
      to: toDate,
    };

    if (selectedStation !== "ALL") {
      params.stationId = selectedStation;
    }

    const response = await API.get(
      "/reports/alerts",
      { params }
    );

    const result = response.data;

    console.log(
      "Alert response:",
      result
    );

    if (result?.status !== "success") {
      throw new Error(
        result?.message ||
          "Unable to load alert report."
      );
    }

    // --------------------------------------------------------
    // IMPORTANT:
    // Convert station_id into station name
    // --------------------------------------------------------

    const records =
      Array.isArray(result.data)
        ? result.data.map((row) => ({
            ...row,

            station:
              row.station ??
              row.stationName ??
              row.station_name ??
              stationMap[
                String(
                  row.station_id ??
                    row.stationId ??
                    ""
                )
              ] ??
              `Station ${
                row.station_id ??
                row.stationId ??
                "N/A"
              }`,

            severity:
              row.severity ??
              "N/A",

            parameter:
              row.parameter ??
              "N/A",

            message:
              row.message ??
              row.description ??
              row.alert_message ??
              "N/A",

            started_time:
              row.started_time ??
              row.startedTime ??
              row.start_time ??
              null,

            ended_time:
              row.ended_time ??
              row.endedTime ??
              row.end_time ??
              null,

            status:
              row.status ??
              (
                row.acknowledged_at ||
                String(
                  row.acknowledgement ??
                    ""
                ).toLowerCase() ===
                  "acknowledged"
                  ? "Acknowledged"
                  : "Active"
              ),
          }))
        : [];

    setAlertRecords(records);

    setAlertSummary(
      result.summary || {
        totalAlerts: records.length,
        activeAlerts: records.filter(
          (row) =>
            String(
              row.status
            ).toLowerCase() !==
            "acknowledged"
        ).length,
        acknowledgedAlerts: records.filter(
          (row) =>
            String(
              row.status
            ).toLowerCase() ===
            "acknowledged"
        ).length,
        bySeverity: {},
        byParameter: {},
        byStation: {},
      }
    );
  };

  // ==========================================================
  // MAINTENANCE + CALIBRATION
  // ==========================================================

  const fetchMaintenanceReport = async () => {
    const params = {
      from: fromDate,
      to: toDate,
    };

    if (selectedStation !== "ALL") {
      params.stationId = selectedStation;
    }

    const response = await API.get(
      "/reports/maintenance-calibration",
      { params }
    );

    const result = response.data;

    if (result?.status !== "success") {
      throw new Error(
        result?.message ||
          "Unable to load maintenance report."
      );
    }

    setMaintenanceRecords(
      Array.isArray(result.maintenance)
        ? result.maintenance
        : []
    );

    setCalibrationRecords(
      Array.isArray(result.calibration)
        ? result.calibration
        : []
    );

    setMaintenanceSummary(
      result.summary || null
    );
  };

  // ==========================================================
  // LOAD SELECTED REPORT ONLY
  // ==========================================================

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Clear only the selected report
      // before loading new data.

      if (reportType === "CPCB_DAILY") {
        setComplianceRecords([]);
        await fetchMainReport();
      }

      if (reportType === "WARD_AQI") {
        setWardRecords([]);
        await fetchWardReport();
      }

      if (
        reportType ===
        "POLLUTANT_TREND"
      ) {
        setPollutantRecords([]);
        await fetchPollutantTrend();
      }

      if (
        reportType ===
        "UPTIME_QAQC"
      ) {
        setUptimeRecords([]);
        await fetchUptimeReport();
      }

      if (
        reportType ===
        "ALERT_SUMMARY"
      ) {
        setAlertRecords([]);
        setAlertSummary(null);
        await fetchAlertReport();
      }

      if (
        reportType ===
        "MAINTENANCE"
      ) {
        setMaintenanceRecords([]);
        setCalibrationRecords([]);
        await fetchMaintenanceReport();
      }

      setLastUpdated(
        new Date()
      );
    } catch (err) {
      console.error(
        "Reports loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load report."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchStations();

    // Load only the default report.
    fetchReports();
  }, []);

  // ==========================================================
  // NORMALIZE MAIN REPORT
  // ==========================================================

  const normalizedRecords = useMemo(() => {
    return complianceRecords.map(
      (row, index) => {
        const station =
          row.station ??
          row.stationName ??
          row.station_name ??
          "Unknown Station";

        const stationId =
          row.stationId ??
          row.station_id ??
          row.id ??
          `ROW-${index + 1}`;

        const pm25 =
          row.pm25 ??
          row.PM25 ??
          row.pm2_5 ??
          row.pm2_5_avg ??
          null;

        const pm10 =
          row.pm10 ??
          row.PM10 ??
          row.pm10_avg ??
          null;

        const no2 =
          row.no2 ??
          row.NO2 ??
          row.no2_avg ??
          null;

        const aqi =
          row.aqi ??
          row.AQI ??
          row.latestAqi ??
          row.latest_aqi ??
          null;

        const category =
          row.category ??
          row.aqiCategory ??
          row.aqi_category ??
          getAqiCategory(aqi);

        const dominant =
          row.dominant ??
          row.dominantPollutant ??
          row.dominant_pollutant ??
          "N/A";

        const availability =
          row.availability ??
          row.dataAvailability ??
          row.data_availability ??
          row.dataRate ??
          null;

        const compliance =
          row.compliance ??
          (
            row.isCompliant === true
              ? "Compliant"
              : row.isCompliant === false
                ? "Action Triggered"
                : "N/A"
          );

        const dataStatus =
          row.dataStatus ??
          row.data_status ??
          "Unknown";

        return {
          ...row,

          station,
          stationId,
          ward:
            row.ward ??
            row.stationWard ??
            "",
          zone:
            row.zone ??
            "",
          pm25,
          pm10,
          no2,
          aqi,
          category,
          dominant,
          availability,
          compliance,
          dataStatus,

          totalReadings:
            row.totalReadings ??
            0,
        };
      }
    );
  }, [complianceRecords]);

  // ==========================================================
  // SUMMARY VALUES
  // ==========================================================

  const totalStations =
    normalizedRecords.length;

  const compliantStations =
    normalizedRecords.filter(
      (row) =>
        String(
          row.compliance
        ).toLowerCase() ===
        "compliant"
    ).length;

  const actionRequired =
    normalizedRecords.filter(
      (row) =>
        String(
          row.compliance
        ).toLowerCase()
          .includes("action")
    ).length;

  const noDataStations =
    normalizedRecords.filter(
      (row) =>
        String(
          row.compliance
        ).toLowerCase()
          .includes("no data")
    ).length;

  const currentStations =
    normalizedRecords.filter(
      (row) =>
        String(
          row.dataStatus
        ).toLowerCase() ===
        "current"
    ).length;

  const averageAQI = useMemo(() => {
    const values =
      normalizedRecords
        .map((row) =>
          toNumber(row.aqi)
        )
        .filter(
          (value) =>
            value !== null
        );

    if (!values.length) {
      return null;
    }

    return (
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / values.length
    );
  }, [normalizedRecords]);

  const maxWardAQI = useMemo(() => {
    const values =
      wardRecords
        .map((row) =>
          toNumber(
            row.averageAQI ??
              row.averageAqi ??
              row.maximumAQI ??
              row.maxAQI
          )
        )
        .filter(
          (value) =>
            value !== null
        );

    return values.length
      ? Math.max(...values)
      : null;
  }, [wardRecords]);

  const pollutantMax = useMemo(() => {
    const values =
      pollutantRecords
        .map((row) =>
          toNumber(
            row.maximum ??
              row.average
          )
        )
        .filter(
          (value) =>
            value !== null
        );

    return values.length
      ? Math.max(...values)
      : 0;
  }, [pollutantRecords]);

  // ==========================================================
  // RESET
  // ==========================================================

  const resetFilters = () => {
    setSelectedStation("ALL");
    setReportType("CPCB_DAILY");
    setFromDate(getToday());
    setToDate(getToday());
    setWardGroupBy("day");
    setPollutantParameter("ALL");

    setTimeout(() => {
      fetchStations();
    }, 0);
  };

  // ==========================================================
  // CSV EXPORT
  // ==========================================================

  const exportCSV = () => {
    let headers = [];
    let rows = [];

    if (reportType === "CPCB_DAILY") {
      headers = [
        "Station",
        "Station ID",
        "Ward",
        "Zone",
        "PM2.5",
        "PM10",
        "NO2",
        "AQI",
        "Category",
        "Dominant",
        "Availability",
        "Data Status",
        "Compliance",
      ];

      rows = normalizedRecords.map(
        (row) => [
          row.station,
          row.stationId,
          row.ward,
          row.zone,
          row.pm25 ?? "",
          row.pm10 ?? "",
          row.no2 ?? "",
          row.aqi ?? "",
          row.category,
          row.dominant,
          row.availability ?? "",
          row.dataStatus,
          row.compliance,
        ]
      );
    }

    if (reportType === "WARD_AQI") {
      headers = [
        "Ward",
        "Period",
        "Average AQI",
        "Maximum AQI",
        "Minimum AQI",
        "Category",
      ];

      rows = wardRecords.map(
        (row) => [
          row.ward ??
            row.wardName ??
            "",
          row.period ??
            row.date ??
            row.month ??
            "",
          row.averageAQI ??
            row.averageAqi ??
            "",
          row.maximumAQI ??
            row.maximumAqi ??
            "",
          row.minimumAQI ??
            row.minimumAqi ??
            "",
          row.category ??
            getAqiCategory(
              row.averageAQI ??
                row.averageAqi
            ),
        ]
      );
    }

    if (
      reportType ===
      "POLLUTANT_TREND"
    ) {
      headers = [
        "Date",
        "Parameter",
        "Average",
        "Minimum",
        "Maximum",
        "Samples",
      ];

      rows =
        pollutantRecords.map(
          (row) => [
            row.date ?? "",
            row.parameter ?? "",
            row.average ?? "",
            row.minimum ?? "",
            row.maximum ?? "",
            row.samples ?? 0,
          ]
        );
    }

    if (
      reportType ===
      "UPTIME_QAQC"
    ) {
      headers = [
        "Station",
        "Station ID",
        "Devices",
        "Online",
        "Offline",
        "Battery",
        "Network",
        "Last Heartbeat",
        "Availability",
        "Readings",
      ];

      rows =
        uptimeRecords.map(
          (row) => [
            row.station ??
              row.stationName ??
              "",
            row.stationId ??
              row.station_id ??
              "",
            row.deviceCount ??
              row.device_count ??
              0,
            row.onlineDevices ??
              row.online_devices ??
              0,
            row.offlineDevices ??
              row.offline_devices ??
              0,
            row.batteryLevel ??
              row.battery ??
              row.battery_level ??
              "",
            row.networkStatus ??
              row.network_status ??
              "",
            row.latestHeartbeat ??
              row.latest_heartbeat ??
              "",
            row.dataAvailability ??
              row.data_availability ??
              "",
            row.totalReadings ??
              row.total_readings ??
              0,
          ]
        );
    }

    if (
      reportType ===
      "ALERT_SUMMARY"
    ) {
      headers = [
        "Alert ID",
        "Station",
        "Station ID",
        "Severity",
        "Parameter",
        "Message",
        "Started",
        "Ended",
        "Status",
      ];

      rows =
        alertRecords.map(
          (row) => [
            row.alert_id ??
              row.alertId ??
              row.id ??
              "",
            row.station ?? "",
            row.station_id ??
              row.stationId ??
              "",
            row.severity ?? "",
            row.parameter ?? "",
            row.message ?? "",
            row.started_time ?? "",
            row.ended_time ?? "",
            row.status ?? "",
          ]
        );
    }

    if (
      reportType ===
      "MAINTENANCE"
    ) {
      headers = [
        "Maintenance ID",
        "Station",
        "Device",
        "Service Date",
        "Next Service Date",
        "Type",
        "Status",
        "Remarks",
      ];

      rows =
        maintenanceRecords.map(
          (row) => [
            row.maintenance_id ??
              row.maintenanceId ??
              row.id ??
              "",
            row.station ??
              row.stationName ??
              "",
            row.device ??
              row.deviceName ??
              row.device_id ??
              "",
            row.service_date ??
              row.serviceDate ??
              "",
            row.next_service_date ??
              row.nextServiceDate ??
              "",
            row.maintenance_type ??
              row.type ??
              "",
            row.status ?? "",
            row.remarks ??
              row.notes ??
              "",
          ]
        );
    }

    if (!rows.length) {
      alert(
        "No data available for CSV export."
      );
      return;
    }

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(escapeCSV)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `PMC_Report_${reportType}_${fromDate}_to_${toDate}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  };

  // ==========================================================
  // EXCEL EXPORT
  // ==========================================================
const exportExcel = async () => {
  try {
    setIsGenerating(true);

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "PMC CAAQM System";
    workbook.lastModifiedBy = "PMC CAAQM System";
    workbook.created = new Date();
    workbook.modified = new Date();

    // =========================================================
    // COLORS
    // =========================================================

    const COLORS = {
      navy: "1F4E78",
      header: "D9E2F3",
      border: "B7C9D6",
      white: "FFFFFF",
      black: "000000",
      gray: "F7F9FB",
      darkGray: "595959",

      green: "E2F0D9",
      greenText: "548235",

      yellow: "FFF2CC",
      yellowText: "BF9000",

      orange: "FCE4D6",
      orangeText: "C65911",

      red: "F4CCCC",
      redText: "C00000",
    };

    const border = {
      top: {
        style: "thin",
        color: { argb: COLORS.border },
      },
      bottom: {
        style: "thin",
        color: { argb: COLORS.border },
      },
      left: {
        style: "thin",
        color: { argb: COLORS.border },
      },
      right: {
        style: "thin",
        color: { argb: COLORS.border },
      },
    };

    // =========================================================
    // HELPERS
    // =========================================================

    const safeNumber = (value) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return null;
      }

      const number = Number(value);

      return Number.isFinite(number)
        ? number
        : null;
    };

    const safeDate = (value) => {
      if (!value) {
        return null;
      }

      const date = new Date(value);

      return Number.isNaN(date.getTime())
        ? null
        : date;
    };

    const getStationName = (row) => {
      const stationId =
        row?.station_id ??
        row?.stationId ??
        row?.stationID;

      return (
        row?.station ??
        row?.stationName ??
        row?.station_name ??
        stationMap?.[String(stationId)] ??
        (stationId
          ? `Station ${stationId}`
          : "N/A")
      );
    };

    // =========================================================
    // REPORT HEADER
    // =========================================================

    const addReportHeader = (
      sheet,
      reportTitle,
      description,
      totalColumns
    ) => {
      // -------------------------------------------------------
      // ROW 1 - MAIN TITLE
      // -------------------------------------------------------

      const lastColumn =
        String.fromCharCode(
          64 + totalColumns
        );

      sheet.mergeCells(
        `A1:${lastColumn}1`
      );

      const titleCell =
        sheet.getCell("A1");

      titleCell.value =
        "PMC AIR QUALITY MONITORING SYSTEM";

      titleCell.font = {
        name: "Arial",
        size: 18,
        bold: true,
        color: COLORS.white,
      };

      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: COLORS.navy,
        },
      };

      titleCell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      titleCell.border = border;

      sheet.getRow(1).height = 34;

      // -------------------------------------------------------
      // ROW 2 - REPORT TITLE
      // -------------------------------------------------------

      sheet.mergeCells(
        `A2:${lastColumn}2`
      );

      const reportTitleCell =
        sheet.getCell("A2");

      reportTitleCell.value =
        reportTitle;

      reportTitleCell.font = {
        name: "Arial",
        size: 14,
        bold: true,
        color: COLORS.navy,
      };

      reportTitleCell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      sheet.getRow(2).height = 25;

      // -------------------------------------------------------
      // ROW 3 - DESCRIPTION
      // -------------------------------------------------------

      sheet.mergeCells(
        `A3:${lastColumn}3`
      );

      const descriptionCell =
        sheet.getCell("A3");

      descriptionCell.value =
        description;

      descriptionCell.font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: COLORS.darkGray,
      };

      descriptionCell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      sheet.getRow(3).height = 22;

      // -------------------------------------------------------
      // ROW 4 - DATE INFORMATION
      // -------------------------------------------------------

      const middleColumn =
        Math.floor(
          totalColumns / 2
        );

      const middleLetter =
        String.fromCharCode(
          64 + middleColumn
        );

      const nextLetter =
        String.fromCharCode(
          65 + middleColumn
        );

      sheet.mergeCells(
        `A4:${middleLetter}4`
      );

      sheet.mergeCells(
        `${nextLetter}4:${lastColumn}4`
      );

      const periodCell =
        sheet.getCell("A4");

      periodCell.value =
        `Report Period: ${fromDate} to ${toDate}`;

      periodCell.font = {
        name: "Arial",
        size: 10,
        bold: true,
        color: COLORS.darkGray,
      };

      periodCell.alignment = {
        horizontal: "left",
        vertical: "middle",
      };

      const generatedCell =
        sheet.getCell(
          4,
          middleColumn + 1
        );

      generatedCell.value =
        `Generated: ${new Date().toLocaleString(
          "en-IN"
        )}`;

      generatedCell.font = {
        name: "Arial",
        size: 10,
        color: COLORS.darkGray,
      };

      generatedCell.alignment = {
        horizontal: "right",
        vertical: "middle",
      };

      sheet.getRow(4).height = 22;
    };

    // =========================================================
    // SUMMARY BOXES
    // =========================================================

    const addSummaryBoxes = (
      sheet,
      items,
      totalColumns
    ) => {
      const boxCount = items.length;

      const baseWidth = Math.floor(
        totalColumns / boxCount
      );

      let startColumn = 1;

      items.forEach(
        (item, index) => {
          let endColumn =
            startColumn +
            baseWidth -
            1;

          if (
            index ===
            boxCount - 1
          ) {
            endColumn =
              totalColumns;
          }

          const startLetter =
            String.fromCharCode(
              64 + startColumn
            );

          const endLetter =
            String.fromCharCode(
              64 + endColumn
            );

          // Label
          sheet.mergeCells(
            `${startLetter}5:${endLetter}5`
          );

          // Value
          sheet.mergeCells(
            `${startLetter}6:${endLetter}6`
          );

          const labelCell =
            sheet.getCell(
              5,
              startColumn
            );

          const valueCell =
            sheet.getCell(
              6,
              startColumn
            );

          labelCell.value =
            item.label;

          labelCell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color:
              item.color ||
              COLORS.navy,
          };

          labelCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb:
                item.background ||
                COLORS.header,
            },
          };

          labelCell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          labelCell.border = border;

          valueCell.value =
            item.value;

          valueCell.font = {
            name: "Arial",
            size: 16,
            bold: true,
            color:
              item.color ||
              COLORS.navy,
          };

          valueCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb:
                item.background ||
                COLORS.header,
            },
          };

          valueCell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          valueCell.border = border;

          startColumn =
            endColumn + 1;
        }
      );

      sheet.getRow(5).height = 22;
      sheet.getRow(6).height = 30;
      sheet.getRow(7).height = 8;
    };

    // =========================================================
    // TABLE HEADER
    // =========================================================

    const styleTableHeader = (
      sheet,
      rowNumber
    ) => {
      const row =
        sheet.getRow(rowNumber);

      row.height = 30;

      row.eachCell(
        (cell) => {
          cell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: COLORS.navy,
          };

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: COLORS.header,
            },
          };

          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };

          cell.border = border;
        }
      );
    };

    // =========================================================
    // TABLE BODY
    // =========================================================

    const styleTableBody = (
      sheet,
      startRow
    ) => {
      for (
        let rowNumber = startRow;
        rowNumber <=
        sheet.rowCount;
        rowNumber++
      ) {
        const row =
          sheet.getRow(rowNumber);

        row.height = 22;

        row.eachCell(
          (cell) => {
            cell.font = {
              name: "Arial",
              size: 10,
              color: COLORS.black,
            };

            cell.alignment = {
              vertical: "middle",
              wrapText: true,
            };

            cell.border = border;

            if (
              rowNumber % 2 ===
              0
            ) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb: COLORS.gray,
                },
              };
            }
          }
        );
      }
    };

    // =========================================================
    // AQI COLOR
    // =========================================================

    const applyAQIColor = (
      cell,
      value
    ) => {
      const aqi =
        safeNumber(value);

      if (aqi === null) {
        return;
      }

      if (aqi <= 50) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: COLORS.green,
          },
        };

        cell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: COLORS.greenText,
        };
      } else if (
        aqi <= 100
      ) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: COLORS.yellow,
          },
        };

        cell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color:
            COLORS.yellowText,
        };
      } else if (
        aqi <= 200
      ) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: COLORS.orange,
          },
        };

        cell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color:
            COLORS.orangeText,
        };
      } else {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: COLORS.red,
          },
        };

        cell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: COLORS.redText,
        };
      }

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    };

    // =========================================================
    // FINAL SHEET SETTINGS
    // =========================================================

    const finalizeSheet = (
      sheet,
      headerRow,
      totalColumns
    ) => {
      sheet.views = [
        {
          state: "frozen",
          ySplit: headerRow,
        },
      ];

      if (sheet.rowCount >= headerRow) {
        sheet.autoFilter = {
          from: {
            row: headerRow,
            column: 1,
          },
          to: {
            row: sheet.rowCount,
            column: totalColumns,
          },
        };
      }

      sheet.pageSetup = {
        orientation: "landscape",
        paperSize: 9,
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      };

      sheet.pageMargins = {
        left: 0.25,
        right: 0.25,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      };

      sheet.headerFooter.oddFooter =
        "PMC CAAQM System | Page &P of &N";
    };

    // =========================================================
    // 1. CPCB DAILY REPORT
    // =========================================================

    if (
      reportType ===
      "CPCB_DAILY"
    ) {
      const sheet =
        workbook.addWorksheet(
          "Daily Station Report"
        );

      const TOTAL_COLUMNS = 13;

      addReportHeader(
        sheet,
        "Daily CAAQM Station Audit",
        "Station-wise pollutant, AQI and data-quality report",
        TOTAL_COLUMNS
      );

      addSummaryBoxes(
        sheet,
        [
          {
            label: "STATIONS",
            value:
              totalStations,
            background:
              COLORS.header,
            color:
              COLORS.navy,
          },
          {
            label: "COMPLIANT",
            value:
              compliantStations,
            background:
              COLORS.green,
            color:
              COLORS.greenText,
          },
          {
            label:
              "ACTION REQUIRED",
            value:
              actionRequired,
            background:
              COLORS.orange,
            color:
              COLORS.orangeText,
          },
          {
            label:
              "AVERAGE AQI",
            value:
              averageAQI !==
                null &&
              averageAQI !==
                undefined
                ? Math.round(
                    averageAQI
                  )
                : "N/A",
            background:
              COLORS.header,
            color:
              COLORS.navy,
          },
        ],
        TOTAL_COLUMNS
      );

      // -------------------------------------------------------
      // TABLE HEADER - ONLY ONCE
      // -------------------------------------------------------

      sheet.getRow(8).values = [
        "Station",
        "Station ID",
        "Ward",
        "Zone",
        "PM2.5",
        "PM10",
        "NO2",
        "AQI",
        "Category",
        "Dominant Pollutant",
        "Availability",
        "Data Status",
        "Compliance",
      ];

      styleTableHeader(
        sheet,
        8
      );

      // -------------------------------------------------------
      // TABLE DATA - ONLY ONCE
      // -------------------------------------------------------

      normalizedRecords.forEach(
        (row) => {
          sheet.addRow([
            row.station ||
              "N/A",

            row.stationId ??
              "N/A",

            row.ward ||
              "N/A",

            row.zone ||
              "N/A",

            safeNumber(
              row.pm25
            ),

            safeNumber(
              row.pm10
            ),

            safeNumber(
              row.no2
            ),

            safeNumber(
              row.aqi
            ),

            row.category ||
              "N/A",

            row.dominant ||
              "N/A",

            row.availability ??
              "N/A",

            row.dataStatus ||
              "N/A",

            row.compliance ||
              "N/A",
          ]);
        }
      );

      styleTableBody(
        sheet,
        9
      );

      // -------------------------------------------------------
      // FORMATTING
      // -------------------------------------------------------

      for (
        let row = 9;
        row <= sheet.rowCount;
        row++
      ) {
        sheet.getCell(
          row,
          5
        ).numFmt = "0.00";

        sheet.getCell(
          row,
          6
        ).numFmt = "0.00";

        sheet.getCell(
          row,
          7
        ).numFmt = "0.00";

        sheet.getCell(
          row,
          8
        ).numFmt = "0";

        // Station ID
        sheet.getCell(
          row,
          2
        ).alignment = {
          horizontal:
            "center",
          vertical:
            "middle",
        };

        // AQI
        applyAQIColor(
          sheet.getCell(
            row,
            8
          ),
          sheet.getCell(
            row,
            8
          ).value
        );
      }

      // -------------------------------------------------------
      // COLUMN WIDTHS
      // -------------------------------------------------------

      sheet.columns = [
        {
          width: 30,
        },
        {
          width: 12,
        },
        {
          width: 22,
        },
        {
          width: 16,
        },
        {
          width: 12,
        },
        {
          width: 12,
        },
        {
          width: 12,
        },
        {
          width: 10,
        },
        {
          width: 17,
        },
        {
          width: 22,
        },
        {
          width: 16,
        },
        {
          width: 16,
        },
        {
          width: 18,
        },
      ];

      finalizeSheet(
        sheet,
        8,
        TOTAL_COLUMNS
      );
    }

    // =========================================================
    // 2. WARD AQI REPORT
    // =========================================================

    if (
      reportType ===
      "WARD_AQI"
    ) {
      const sheet =
        workbook.addWorksheet(
          "Ward AQI Report"
        );

      const TOTAL_COLUMNS = 6;

      addReportHeader(
        sheet,
        "Ward-wise AQI Report",
        "Daily / monthly AQI aggregation by municipal ward",
        TOTAL_COLUMNS
      );

      addSummaryBoxes(
        sheet,
        [
          {
            label:
              "TOTAL RECORDS",
            value:
              wardRecords?.length ??
              0,
          },
          {
            label:
              "HIGHEST AQI",
            value:
              maxWardAQI !==
                null &&
              maxWardAQI !==
                undefined
                ? Math.round(
                    maxWardAQI
                  )
                : "N/A",
            background:
              COLORS.red,
            color:
              COLORS.redText,
          },
        ],
        TOTAL_COLUMNS
      );

      sheet.getRow(8).values = [
        "Ward",
        "Period",
        "Average AQI",
        "Maximum AQI",
        "Minimum AQI",
        "Category",
      ];

      styleTableHeader(
        sheet,
        8
      );

      (
        wardRecords || []
      ).forEach((row) => {
        sheet.addRow([
          row.ward ??
            row.wardName ??
            "N/A",

          row.period ??
            row.date ??
            row.month ??
            "N/A",

          safeNumber(
            row.averageAQI ??
              row.averageAqi
          ),

          safeNumber(
            row.maximumAQI ??
              row.maximumAqi ??
              row.maxAQI
          ),

          safeNumber(
            row.minimumAQI ??
              row.minimumAqi ??
              row.minAQI
          ),

          row.category ??
            "N/A",
        ]);
      });

      styleTableBody(
        sheet,
        9
      );

      for (
        let row = 9;
        row <= sheet.rowCount;
        row++
      ) {
        sheet.getCell(
          row,
          3
        ).numFmt = "0";

        sheet.getCell(
          row,
          4
        ).numFmt = "0";

        sheet.getCell(
          row,
          5
        ).numFmt = "0";

        applyAQIColor(
          sheet.getCell(
            row,
            3
          ),
          sheet.getCell(
            row,
            3
          ).value
        );
      }

      sheet.columns = [
        { width: 30 },
        { width: 20 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 20 },
      ];

      finalizeSheet(
        sheet,
        8,
        TOTAL_COLUMNS
      );
    }

    // =========================================================
    // 3. POLLUTANT TREND
    // =========================================================

    if (
      reportType ===
      "POLLUTANT_TREND"
    ) {
      const sheet =
        workbook.addWorksheet(
          "Pollutant Trend"
        );

      const TOTAL_COLUMNS = 6;

      addReportHeader(
        sheet,
        "Pollutant Trend Report",
        "Daily pollutant concentration trend",
        TOTAL_COLUMNS
      );

      addSummaryBoxes(
        sheet,
        [
          {
            label:
              "TOTAL RECORDS",
            value:
              pollutantRecords?.length ??
              0,
          },
          {
            label:
              "MAXIMUM VALUE",
            value:
              pollutantMax !==
                null &&
              pollutantMax !==
                undefined
                ? formatNumber(
                    pollutantMax
                  )
                : "N/A",
          },
        ],
        TOTAL_COLUMNS
      );

      sheet.getRow(8).values = [
        "Date",
        "Parameter",
        "Average",
        "Minimum",
        "Maximum",
        "Samples",
      ];

      styleTableHeader(
        sheet,
        8
      );

      (
        pollutantRecords || []
      ).forEach((row) => {
        sheet.addRow([
          safeDate(
            row.date
          ),

          row.parameter ??
            "N/A",

          safeNumber(
            row.average
          ),

          safeNumber(
            row.minimum
          ),

          safeNumber(
            row.maximum
          ),

          row.samples ?? 0,
        ]);
      });

      styleTableBody(
        sheet,
        9
      );

      for (
        let row = 9;
        row <= sheet.rowCount;
        row++
      ) {
        sheet.getCell(
          row,
          1
        ).numFmt =
          "dd-mmm-yyyy";

        sheet.getCell(
          row,
          3
        ).numFmt = "0.00";

        sheet.getCell(
          row,
          4
        ).numFmt = "0.00";

        sheet.getCell(
          row,
          5
        ).numFmt = "0.00";
      }

      sheet.columns = [
        { width: 18 },
        { width: 20 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 14 },
      ];

      finalizeSheet(
        sheet,
        8,
        TOTAL_COLUMNS
      );
    }

    // =========================================================
    // 4. STATION UPTIME
    // =========================================================

    if (
      reportType ===
      "UPTIME_QAQC"
    ) {
      const sheet =
        workbook.addWorksheet(
          "Station Uptime"
        );

      const TOTAL_COLUMNS = 10;

      addReportHeader(
        sheet,
        "Station Uptime & Data Completeness",
        "Device health, heartbeat and reading availability",
        TOTAL_COLUMNS
      );

      addSummaryBoxes(
        sheet,
        [
          {
            label:
              "TOTAL STATIONS",
            value:
              uptimeRecords?.length ??
              0,
          },
        ],
        TOTAL_COLUMNS
      );

      sheet.getRow(8).values = [
        "Station",
        "Station ID",
        "Devices",
        "Online",
        "Offline",
        "Battery (%)",
        "Network",
        "Last Heartbeat",
        "Availability",
        "Readings",
      ];

      styleTableHeader(
        sheet,
        8
      );

      (
        uptimeRecords || []
      ).forEach((row) => {
        sheet.addRow([
          getStationName(
            row
          ),

          row.stationId ??
            row.station_id ??
            "N/A",

          row.deviceCount ??
            row.device_count ??
            0,

          row.onlineDevices ??
            row.online_devices ??
            0,

          row.offlineDevices ??
            row.offline_devices ??
            0,

          safeNumber(
            row.batteryLevel ??
              row.battery ??
              row.battery_level
          ),

          row.networkStatus ??
            row.network_status ??
            "N/A",

          safeDate(
            row.latestHeartbeat ??
              row.latest_heartbeat
          ),

          row.dataAvailability ??
            row.data_availability ??
            "N/A",

          row.totalReadings ??
            row.total_readings ??
            0,
        ]);
      });

      styleTableBody(
        sheet,
        9
      );

      for (
        let row = 9;
        row <= sheet.rowCount;
        row++
      ) {
        sheet.getCell(
          row,
          6
        ).numFmt = "0.00";

        sheet.getCell(
          row,
          8
        ).numFmt =
          "dd-mmm-yyyy hh:mm AM/PM";
      }

      sheet.columns = [
        { width: 30 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
        { width: 16 },
        { width: 25 },
        { width: 18 },
        { width: 15 },
      ];

      finalizeSheet(
        sheet,
        8,
        TOTAL_COLUMNS
      );
    }

    // =========================================================
    // 5. ALERT SUMMARY
    // =========================================================

    if (
      reportType ===
      "ALERT_SUMMARY"
    ) {
      const sheet =
        workbook.addWorksheet(
          "Alert Summary"
        );

      const TOTAL_COLUMNS = 9;

      addReportHeader(
        sheet,
        "Environmental Alert Summary",
        "Environmental alerts during the selected period",
        TOTAL_COLUMNS
      );

      addSummaryBoxes(
        sheet,
        [
          {
            label:
              "TOTAL ALERTS",
            value:
              alertSummary?.totalAlerts ??
              alertRecords?.length ??
              0,
          },
          {
            label: "ACTIVE",
            value:
              alertSummary?.activeAlerts ??
              0,
            background:
              COLORS.red,
            color:
              COLORS.redText,
          },
          {
            label:
              "ACKNOWLEDGED",
            value:
              alertSummary?.acknowledgedAlerts ??
              0,
            background:
              COLORS.green,
            color:
              COLORS.greenText,
          },
        ],
        TOTAL_COLUMNS
      );

      sheet.getRow(8).values = [
        "Alert ID",
        "Station",
        "Station ID",
        "Severity",
        "Parameter",
        "Message",
        "Started",
        "Ended",
        "Status",
      ];

      styleTableHeader(
        sheet,
        8
      );

      (
        alertRecords || []
      ).forEach((row) => {
        const started =
          row.started_time ??
          row.startedTime ??
          row.start_time;

        const ended =
          row.ended_time ??
          row.endedTime ??
          row.end_time;

        sheet.addRow([
          row.alert_id ??
            row.alertId ??
            row.id ??
            "N/A",

          getStationName(
            row
          ),

          row.station_id ??
            row.stationId ??
            "N/A",

          row.severity ??
            "N/A",

          row.parameter ??
            "N/A",

          row.message ??
            row.description ??
            row.alert_message ??
            "N/A",

          safeDate(
            started
          ),

          safeDate(
            ended
          ),

          row.status ??
            "Active",
        ]);
      });

      styleTableBody(
        sheet,
        9
      );

      for (
        let row = 9;
        row <= sheet.rowCount;
        row++
      ) {
        sheet.getCell(
          row,
          7
        ).numFmt =
          "dd-mmm-yyyy hh:mm AM/PM";

        sheet.getCell(
          row,
          8
        ).numFmt =
          "dd-mmm-yyyy hh:mm AM/PM";

        const severity =
          String(
            sheet.getCell(
              row,
              4
            ).value || ""
          ).toLowerCase();

        if (
          severity ===
          "critical"
        ) {
          sheet.getCell(
            row,
            4
          ).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: COLORS.red,
            },
          };

          sheet.getCell(
            row,
            4
          ).font = {
            name: "Arial",
            size: 10,
            bold: true,
            color:
              COLORS.redText,
          };
        } else if (
          severity ===
          "warning"
        ) {
          sheet.getCell(
            row,
            4
          ).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: COLORS.yellow,
            },
          };

          sheet.getCell(
            row,
            4
          ).font = {
            name: "Arial",
            size: 10,
            bold: true,
            color:
              COLORS.yellowText,
          };
        }
      }

      sheet.columns = [
        { width: 14 },
        { width: 30 },
        { width: 14 },
        { width: 14 },
        { width: 16 },
        { width: 45 },
        { width: 24 },
        { width: 24 },
        { width: 18 },
      ];

      finalizeSheet(
        sheet,
        8,
        TOTAL_COLUMNS
      );
    }

    // =========================================================
    // 6. MAINTENANCE + CALIBRATION
    // =========================================================

    if (
      reportType ===
      "MAINTENANCE"
    ) {
      // -------------------------------------------------------
      // MAINTENANCE
      // -------------------------------------------------------

      const maintenanceSheet =
        workbook.addWorksheet(
          "Maintenance"
        );

      const MAINT_COLUMNS = 8;

      addReportHeader(
        maintenanceSheet,
        "Maintenance Report",
        "Station maintenance and service records",
        MAINT_COLUMNS
      );

      addSummaryBoxes(
        maintenanceSheet,
        [
          {
            label:
              "MAINTENANCE RECORDS",
            value:
              maintenanceRecords?.length ??
              0,
          },
          {
            label: "OVERDUE",
            value:
              maintenanceSummary?.overdueMaintenance ??
              0,
            background:
              COLORS.red,
            color:
              COLORS.redText,
          },
        ],
        MAINT_COLUMNS
      );

      maintenanceSheet.getRow(
        8
      ).values = [
        "Maintenance ID",
        "Station",
        "Device",
        "Service Date",
        "Next Service Date",
        "Type",
        "Status",
        "Remarks",
      ];

      styleTableHeader(
        maintenanceSheet,
        8
      );

      (
        maintenanceRecords || []
      ).forEach((row) => {
        maintenanceSheet.addRow([
          row.maintenance_id ??
            row.maintenanceId ??
            row.id ??
            "N/A",

          getStationName(
            row
          ),

          row.device ??
            row.deviceName ??
            row.device_id ??
            "N/A",

          safeDate(
            row.service_date ??
              row.serviceDate
          ),

          safeDate(
            row.next_service_date ??
              row.nextServiceDate
          ),

          row.maintenance_type ??
            row.type ??
            "N/A",

          row.status ??
            "N/A",

          row.remarks ??
            row.notes ??
            "N/A",
        ]);
      });

      styleTableBody(
        maintenanceSheet,
        9
      );

      for (
        let row = 9;
        row <=
        maintenanceSheet.rowCount;
        row++
      ) {
        maintenanceSheet.getCell(
          row,
          4
        ).numFmt =
          "dd-mmm-yyyy";

        maintenanceSheet.getCell(
          row,
          5
        ).numFmt =
          "dd-mmm-yyyy";
      }

      maintenanceSheet.columns = [
        { width: 18 },
        { width: 30 },
        { width: 24 },
        { width: 18 },
        { width: 22 },
        { width: 20 },
        { width: 18 },
        { width: 40 },
      ];

      finalizeSheet(
        maintenanceSheet,
        8,
        MAINT_COLUMNS
      );

      // -------------------------------------------------------
      // CALIBRATION
      // -------------------------------------------------------

      const calibrationSheet =
        workbook.addWorksheet(
          "Calibration"
        );

      const CAL_COLUMNS = 7;

      addReportHeader(
        calibrationSheet,
        "Calibration Report",
        "Sensor calibration records and schedule",
        CAL_COLUMNS
      );

      addSummaryBoxes(
        calibrationSheet,
        [
          {
            label:
              "CALIBRATION RECORDS",
            value:
              calibrationRecords?.length ??
              0,
          },
          {
            label: "OVERDUE",
            value:
              maintenanceSummary?.overdueCalibration ??
              0,
            background:
              COLORS.red,
            color:
              COLORS.redText,
          },
        ],
        CAL_COLUMNS
      );

      calibrationSheet.getRow(
        8
      ).values = [
        "Calibration ID",
        "Sensor",
        "Sensor ID",
        "Calibration Date",
        "Next Calibration Date",
        "Status",
        "Remarks",
      ];

      styleTableHeader(
        calibrationSheet,
        8
      );

      (
        calibrationRecords || []
      ).forEach((row) => {
        calibrationSheet.addRow([
          row.calibration_id ??
            row.calibrationId ??
            row.id ??
            "N/A",

          row.sensor ??
            row.sensorName ??
            "N/A",

          row.sensor_id ??
            row.sensorId ??
            "N/A",

          safeDate(
            row.calibration_date ??
              row.calibrationDate
          ),

          safeDate(
            row.next_calibration_date ??
              row.nextCalibrationDate
          ),

          row.status ??
            "N/A",

          row.remarks ??
            row.notes ??
            "N/A",
        ]);
      });

      styleTableBody(
        calibrationSheet,
        9
      );

      for (
        let row = 9;
        row <=
        calibrationSheet.rowCount;
        row++
      ) {
        calibrationSheet.getCell(
          row,
          4
        ).numFmt =
          "dd-mmm-yyyy";

        calibrationSheet.getCell(
          row,
          5
        ).numFmt =
          "dd-mmm-yyyy";
      }

      calibrationSheet.columns = [
        { width: 18 },
        { width: 30 },
        { width: 15 },
        { width: 22 },
        { width: 25 },
        { width: 18 },
        { width: 40 },
      ];

      finalizeSheet(
        calibrationSheet,
        8,
        CAL_COLUMNS
      );
    }

    // =========================================================
    // CHECK THAT A SHEET WAS CREATED
    // =========================================================

    if (
      workbook.worksheets.length ===
      0
    ) {
      throw new Error(
        `No Excel report was created for report type: ${reportType}`
      );
    }

    // =========================================================
    // GENERATE XLSX
    // =========================================================

    const buffer =
      await workbook.xlsx.writeBuffer();

    const blob = new Blob(
      [buffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `PMC_Air_Quality_${reportType}_${fromDate}_to_${toDate}.xlsx`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    window.URL.revokeObjectURL(
      url
    );

  } catch (error) {
    console.error(
      "Excel export error:",
      error
    );

    alert(
      `Unable to generate Excel report: ${
        error?.message ||
        "Unknown error"
      }`
    );
  } finally {
    setIsGenerating(false);
  }
};
  // ==========================================================
  // PDF EXPORT
  // ==========================================================

  const exportPDF = () => {
    try {
      setIsGenerating(true);

      const doc = new jsPDF(
        "landscape",
        "mm",
        "a4"
      );

      const template =
        REPORT_TEMPLATES.find(
          (item) =>
            item.id === reportType
        );

      doc.setFontSize(18);

      doc.text(
        "PMC AIR QUALITY MONITORING REPORT",
        148,
        15,
        {
          align: "center",
        }
      );

      doc.setFontSize(10);

      doc.text(
        `Period: ${fromDate} to ${toDate}`,
        148,
        22,
        {
          align: "center",
        }
      );

      doc.text(
        `Report: ${template?.title ?? reportType}`,
        148,
        28,
        {
          align: "center",
        }
      );

      let headers = [];
      let rows = [];

      if (
        reportType ===
        "CPCB_DAILY"
      ) {
        headers = [
          "Station",
          "Ward",
          "PM2.5",
          "PM10",
          "NO2",
          "AQI",
          "Category",
          "Dominant",
          "Availability",
          "Status",
          "Compliance",
        ];

        rows =
          normalizedRecords.map(
            (row) => [
              row.station,
              row.ward,
              formatNumber(
                row.pm25
              ),
              formatNumber(
                row.pm10
              ),
              formatNumber(
                row.no2
              ),
              formatNumber(
                row.aqi,
                0
              ),
              row.category,
              row.dominant,
              row.availability ??
                "N/A",
              row.dataStatus,
              row.compliance,
            ]
          );
      }

      if (
        reportType ===
        "WARD_AQI"
      ) {
        headers = [
          "Ward",
          "Period",
          "Average AQI",
          "Maximum AQI",
          "Minimum AQI",
          "Category",
        ];

        rows =
          wardRecords.map(
            (row) => [
              row.ward ??
                row.wardName ??
                "N/A",
              row.period ??
                row.date ??
                row.month ??
                "N/A",
              formatNumber(
                row.averageAQI ??
                  row.averageAqi,
                0
              ),
              formatNumber(
                row.maximumAQI ??
                  row.maximumAqi,
                0
              ),
              formatNumber(
                row.minimumAQI ??
                  row.minimumAqi,
                0
              ),
              row.category ??
                getAqiCategory(
                  row.averageAQI ??
                    row.averageAqi
                ),
            ]
          );
      }

      if (
        reportType ===
        "POLLUTANT_TREND"
      ) {
        headers = [
          "Date",
          "Parameter",
          "Average",
          "Minimum",
          "Maximum",
          "Samples",
        ];

        rows =
          pollutantRecords.map(
            (row) => [
              row.date,
              row.parameter,
              formatNumber(
                row.average
              ),
              formatNumber(
                row.minimum
              ),
              formatNumber(
                row.maximum
              ),
              row.samples ?? 0,
            ]
          );
      }

      if (
        reportType ===
        "UPTIME_QAQC"
      ) {
        headers = [
          "Station",
          "Devices",
          "Online",
          "Offline",
          "Battery",
          "Network",
          "Heartbeat",
          "Availability",
          "Readings",
        ];

        rows =
          uptimeRecords.map(
            (row) => [
              row.station ??
                row.stationName ??
                "N/A",
              row.deviceCount ??
                row.device_count ??
                0,
              row.onlineDevices ??
                row.online_devices ??
                0,
              row.offlineDevices ??
                row.offline_devices ??
                0,
              row.batteryLevel ??
                row.battery ??
                row.battery_level ??
                "N/A",
              row.networkStatus ??
                row.network_status ??
                "N/A",
              formatDateTime(
                row.latestHeartbeat ??
                  row.latest_heartbeat
              ),
              row.dataAvailability ??
                row.data_availability ??
                "N/A",
              row.totalReadings ??
                row.total_readings ??
                0,
            ]
          );
      }

      if (
        reportType ===
        "ALERT_SUMMARY"
      ) {
        headers = [
          "Station",
          "Severity",
          "Parameter",
          "Message",
          "Started",
          "Ended",
          "Status",
        ];

        rows =
          alertRecords.map(
            (row) => [
              row.station ?? "N/A",
              row.severity ?? "N/A",
              row.parameter ?? "N/A",
              row.message ?? "N/A",
              formatDateTime(
                row.started_time
              ),
              formatDateTime(
                row.ended_time
              ),
              row.status ?? "N/A",
            ]
          );
      }

      if (
        reportType ===
        "MAINTENANCE"
      ) {
        headers = [
          "Station",
          "Device",
          "Service Date",
          "Next Service",
          "Type",
          "Status",
          "Remarks",
        ];

        rows =
          maintenanceRecords.map(
            (row) => [
              row.station ??
                row.stationName ??
                "N/A",
              row.device ??
                row.deviceName ??
                row.device_id ??
                "N/A",
              row.service_date ??
                row.serviceDate ??
                "N/A",
              row.next_service_date ??
                row.nextServiceDate ??
                "N/A",
              row.maintenance_type ??
                row.type ??
                "N/A",
              row.status ?? "N/A",
              row.remarks ??
                row.notes ??
                "N/A",
            ]
          );
      }

      if (!rows.length) {
        alert(
          "No data available for PDF export."
        );

        return;
      }

      autoTable(doc, {
        startY: 35,
        head: [headers],
        body: rows,
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: {
          fontSize: 7,
        },
        margin: {
          left: 8,
          right: 8,
        },
      });

      const pageCount =
        doc.internal.getNumberOfPages();

      for (
        let page = 1;
        page <= pageCount;
        page++
      ) {
        doc.setPage(page);

        doc.setFontSize(8);

        doc.text(
          `PMC CAAQM System | Page ${page} of ${pageCount}`,
          148,
          202,
          {
            align: "center",
          }
        );
      }

      doc.save(
        `PMC_Report_${reportType}_${fromDate}_to_${toDate}.pdf`
      );
    } catch (err) {
      console.error(
        "PDF export error:",
        err
      );

      alert(
        "Unable to generate PDF report."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ==========================================================
  // PRINT
  // ==========================================================

  const printReport = () => {
    window.print();
  };

  // ==========================================================
  // SELECTED TEMPLATE
  // ==========================================================

  const selectedTemplate =
    REPORT_TEMPLATES.find(
      (item) =>
        item.id === reportType
    ) ||
    REPORT_TEMPLATES[0];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-600 p-3 text-white">
              <FileText size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Air Quality Reports
              </h1>

              <p className="text-sm text-slate-500">
                PMC CAAQM monitoring and environmental reporting
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={fetchReports}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  isLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              onClick={printReport}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Printer size={16} />

              Print
            </button>

          </div>

        </div>
      </div>

      {/* ====================================================
          REPORT TEMPLATES
      ==================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

        {REPORT_TEMPLATES.map(
          (template) => {
            const Icon =
              template.icon;

            const active =
              reportType ===
              template.id;

            return (
              <button
                key={template.id}
                onClick={() => {
                  setReportType(
                    template.id
                  );

                  // Load only this report.
                  setTimeout(
                    () => {
                      fetchReports();
                    },
                    0
                  );
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3">

                    <div
                      className={`rounded-lg p-2 ${
                        active
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {template.title}
                      </h3>

                      <p className="text-xs text-slate-500">
                        {template.code}
                      </p>
                    </div>

                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      template.status ===
                      "Certified"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {template.status}
                  </span>

                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {template.desc}
                </p>

                <div className="mt-3 text-xs text-slate-500">
                  Frequency:{" "}
                  <span className="font-medium">
                    {template.frequency}
                  </span>
                </div>

              </button>
            );
          }
        )}

      </div>

      {/* ====================================================
          FILTERS
      ==================================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center gap-2">
          <Filter
            size={18}
            className="text-blue-600"
          />

          <h2 className="font-semibold text-slate-800">
            Report Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

          {/* FROM */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              From Date
            </label>

            <div className="relative">

              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              />

            </div>
          </div>

          {/* TO */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              To Date
            </label>

            <div className="relative">

              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              />

            </div>
          </div>

          {/* STATION */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Station
            </label>

            <select
              value={selectedStation}
              onChange={(e) =>
                setSelectedStation(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >

              <option value="ALL">
                All Stations
              </option>

              {stations.map(
                (station) => {
                  const id =
                    station.station_id ??
                    station.stationId ??
                    station.id;

                  const name =
                    station.name ??
                    station.station_name ??
                    station.stationName ??
                    `Station ${id}`;

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {name}
                    </option>
                  );
                }
              )}

            </select>
          </div>

          {/* WARD */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Ward Grouping
            </label>

            <select
              value={wardGroupBy}
              onChange={(e) =>
                setWardGroupBy(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="day">
                Daily
              </option>

              <option value="month">
                Monthly
              </option>
            </select>
          </div>

          {/* POLLUTANT */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Pollutant
            </label>

            <select
              value={
                pollutantParameter
              }
              onChange={(e) =>
                setPollutantParameter(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All Pollutants
              </option>

              <option value="pm25">
                PM2.5
              </option>

              <option value="pm10">
                PM10
              </option>

              <option value="no2">
                NO2
              </option>
            </select>
          </div>

        </div>

        <div className="mt-4 flex flex-wrap gap-2">

          <button
            onClick={fetchReports}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Search size={16} />

            Generate Report
          </button>

          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <XCircle size={16} />

            Reset
          </button>

        </div>

      </div>

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

          <div className="flex items-start gap-3">

            <AlertTriangle
              size={20}
            />

            <div>
              <p className="font-semibold">
                Unable to load report
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ====================================================
          LOADING
      ==================================================== */}

      {isLoading && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">

          <div className="flex items-center gap-3">

            <RefreshCw
              size={18}
              className="animate-spin"
            />

            <span className="text-sm font-medium">
              Loading{" "}
              {selectedTemplate.title}
              ...
            </span>

          </div>

        </div>
      )}

      {/* ====================================================
          SUMMARY CARDS
      ==================================================== */}

      {reportType ===
        "CPCB_DAILY" && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">

          <SummaryCard
            icon={Building2}
            title="Stations"
            value={totalStations}
          />

          <SummaryCard
            icon={CheckCircle2}
            title="Compliant"
            value={
              compliantStations
            }
            valueClass="text-green-600"
          />

          <SummaryCard
            icon={AlertTriangle}
            title="Action Required"
            value={actionRequired}
            valueClass="text-orange-600"
          />

          <SummaryCard
            icon={XCircle}
            title="No Data"
            value={noDataStations}
            valueClass="text-red-600"
          />

          <SummaryCard
            icon={Activity}
            title="Current"
            value={currentStations}
            valueClass="text-blue-600"
          />

          <SummaryCard
            icon={BarChart3}
            title="Avg AQI"
            value={
              averageAQI !== null
                ? Math.round(
                    averageAQI
                  )
                : "N/A"
            }
          />

        </div>
      )}

      {/* ====================================================
          REPORT PERIOD
      ==================================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">

            <Clock3
              size={18}
              className="text-slate-500"
            />

            <div>

              <p className="text-xs text-slate-500">
                Selected Report
              </p>

              <p className="font-medium text-slate-800">
                {selectedTemplate.title}
              </p>

            </div>

          </div>

          <div className="text-sm text-slate-500">

            Last updated:{" "}

            {lastUpdated
              ? lastUpdated.toLocaleTimeString(
                  "en-IN"
                )
              : "N/A"}

          </div>

        </div>

      </div>

      {/* ====================================================
          EXPORT
      ==================================================== */}

      <div className="mb-6 flex flex-wrap gap-3">

        <button
          onClick={exportPDF}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          <Download size={17} />

          Export PDF
        </button>

        <button
          onClick={exportExcel}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <FileSpreadsheet size={17} />

          Export Excel
        </button>

        <button
          onClick={exportCSV}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Database size={17} />

          Export CSV
        </button>

      </div>

      {/* ====================================================
          DAILY REPORT
      ==================================================== */}

      {reportType ===
        "CPCB_DAILY" && (
        <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">

            <h2 className="text-lg font-semibold text-slate-800">
              Daily CAAQM Station Audit
            </h2>

            <p className="text-sm text-slate-500">
              Station-wise pollutant, AQI and data-quality report
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-sm">

              <thead className="bg-slate-50">

                <tr>
                  <th className="px-4 py-3 text-left">
                    Station
                  </th>

                  <th className="px-4 py-3 text-left">
                    Ward
                  </th>

                  <th className="px-4 py-3 text-right">
                    PM2.5
                  </th>

                  <th className="px-4 py-3 text-right">
                    PM10
                  </th>

                  <th className="px-4 py-3 text-right">
                    NO2
                  </th>

                  <th className="px-4 py-3 text-center">
                    AQI
                  </th>

                  <th className="px-4 py-3 text-left">
                    Category
                  </th>

                  <th className="px-4 py-3 text-left">
                    Dominant
                  </th>

                  <th className="px-4 py-3 text-center">
                    Availability
                  </th>

                  <th className="px-4 py-3 text-left">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left">
                    Compliance
                  </th>
                </tr>

              </thead>

              <tbody>

                {normalizedRecords.map(
                  (row) => (
                    <tr
                      key={
                        row.stationId
                      }
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >

                      <td className="px-4 py-3 font-medium">
                        {row.station}
                      </td>

                      <td className="px-4 py-3">
                        {row.ward || "N/A"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatNumber(
                          row.pm25
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatNumber(
                          row.pm10
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatNumber(
                          row.no2
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${getAqiClass(
                            row.aqi
                          )}`}
                        >
                          {row.aqi !==
                          null
                            ? Math.round(
                                Number(
                                  row.aqi
                                )
                              )
                            : "N/A"}
                        </span>

                      </td>

                      <td className="px-4 py-3">
                        {row.category}
                      </td>

                      <td className="px-4 py-3">
                        {row.dominant}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {row.availability ??
                          "N/A"}
                      </td>

                      <td className="px-4 py-3">

                        <span
                          className={`rounded-full border px-2 py-1 text-xs ${getDataStatusClass(
                            row.dataStatus
                          )}`}
                        >
                          {row.dataStatus}
                        </span>

                      </td>

                      <td className="px-4 py-3">
                        <ComplianceBadge
                          value={
                            row.compliance
                          }
                        />
                      </td>

                    </tr>
                  )
                )}

                {!normalizedRecords.length && (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No station report data available.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>
      )}

      {/* ====================================================
          WARD REPORT
      ==================================================== */}

      {reportType ===
        "WARD_AQI" && (
        <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 p-5">

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Ward-wise AQI Report
              </h2>

              <p className="text-sm text-slate-500">
                {wardGroupBy ===
                "day"
                  ? "Daily"
                  : "Monthly"}{" "}
                AQI aggregation by ward
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm">
              Highest AQI:{" "}
              <strong>
                {maxWardAQI !==
                null
                  ? Math.round(
                      maxWardAQI
                    )
                  : "N/A"}
              </strong>
            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px] text-sm">

              <thead className="bg-slate-50">

                <tr>
                  <th className="px-4 py-3 text-left">
                    Ward
                  </th>

                  <th className="px-4 py-3 text-left">
                    Period
                  </th>

                  <th className="px-4 py-3 text-right">
                    Average AQI
                  </th>

                  <th className="px-4 py-3 text-right">
                    Maximum AQI
                  </th>

                  <th className="px-4 py-3 text-right">
                    Minimum AQI
                  </th>

                  <th className="px-4 py-3 text-left">
                    Category
                  </th>
                </tr>

              </thead>

              <tbody>

                {wardRecords.map(
                  (row, index) => {

                    const average =
                      row.averageAQI ??
                      row.averageAqi;

                    const maximum =
                      row.maximumAQI ??
                      row.maximumAqi ??
                      row.maxAQI;

                    const minimum =
                      row.minimumAQI ??
                      row.minimumAqi ??
                      row.minAQI;

                    return (
                      <tr
                        key={`${row.ward}-${row.period}-${index}`}
                        className="border-t border-slate-100"
                      >

                        <td className="px-4 py-3 font-medium">
                          {row.ward ??
                            row.wardName ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {row.period ??
                            row.date ??
                            row.month ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${getAqiClass(
                              average
                            )}`}
                          >
                            {average !==
                            null
                              ? Math.round(
                                  Number(
                                    average
                                  )
                                )
                              : "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          {maximum !=
                          null
                            ? Math.round(
                                Number(
                                  maximum
                                )
                              )
                            : "N/A"}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {minimum !=
                          null
                            ? Math.round(
                                Number(
                                  minimum
                                )
                              )
                            : "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {row.category ??
                            getAqiCategory(
                              average
                            )}
                        </td>

                      </tr>
                    );
                  }
                )}

                {!wardRecords.length && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No ward AQI data available.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>
      )}

      {/* ====================================================
          POLLUTANT TREND
      ==================================================== */}

      {reportType ===
        "POLLUTANT_TREND" && (
        <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">

            <h2 className="text-lg font-semibold text-slate-800">
              Pollutant Trend Report
            </h2>

            <p className="text-sm text-slate-500">
              Daily pollutant averages, minimums and maximums
            </p>

          </div>

          <div className="p-5">

            {pollutantRecords.length >
              0 && (
              <div className="mb-6">

                <div className="mb-2 flex justify-between text-sm">

                  <span className="text-slate-600">
                    Maximum observed value
                  </span>

                  <strong>
                    {formatNumber(
                      pollutantMax
                    )}
                  </strong>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${Math.min(
                        100,
                        pollutantMax
                          ? Math.min(
                              100,
                              pollutantMax
                            )
                          : 0
                      )}%`,
                    }}
                  />

                </div>

              </div>
            )}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[750px] text-sm">

                <thead className="bg-slate-50">

                  <tr>
                    <th className="px-4 py-3 text-left">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left">
                      Parameter
                    </th>

                    <th className="px-4 py-3 text-right">
                      Average
                    </th>

                    <th className="px-4 py-3 text-right">
                      Minimum
                    </th>

                    <th className="px-4 py-3 text-right">
                      Maximum
                    </th>

                    <th className="px-4 py-3 text-right">
                      Samples
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {pollutantRecords.map(
                    (row, index) => (
                      <tr
                        key={`${row.date}-${row.parameter}-${index}`}
                        className="border-t border-slate-100"
                      >

                        <td className="px-4 py-3">
                          {formatDate(
                            row.date
                          )}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {row.parameter}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            row.average
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            row.minimum
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            row.maximum
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {row.samples ??
                            0}
                        </td>

                      </tr>
                    )
                  )}

                  {!pollutantRecords.length && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No pollutant trend data available.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </section>
      )}

      {/* ====================================================
          UPTIME
      ==================================================== */}

      {reportType ===
        "UPTIME_QAQC" && (
        <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">

            <h2 className="text-lg font-semibold text-slate-800">
              Station Uptime & Data Completeness
            </h2>

            <p className="text-sm text-slate-500">
              Device health, heartbeat and reading availability
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-sm">

              <thead className="bg-slate-50">

                <tr>
                  <th className="px-4 py-3 text-left">
                    Station
                  </th>

                  <th className="px-4 py-3 text-center">
                    Devices
                  </th>

                  <th className="px-4 py-3 text-center">
                    Online
                  </th>

                  <th className="px-4 py-3 text-center">
                    Offline
                  </th>

                  <th className="px-4 py-3 text-center">
                    Battery
                  </th>

                  <th className="px-4 py-3 text-left">
                    Network
                  </th>

                  <th className="px-4 py-3 text-left">
                    Last Heartbeat
                  </th>

                  <th className="px-4 py-3 text-center">
                    Availability
                  </th>

                  <th className="px-4 py-3 text-center">
                    Readings
                  </th>
                </tr>

              </thead>

              <tbody>

                {uptimeRecords.map(
                  (row, index) => (
                    <tr
                      key={`${row.stationId}-${index}`}
                      className="border-t border-slate-100"
                    >

                      <td className="px-4 py-3 font-medium">
                        {row.station ??
                          row.stationName ??
                          "N/A"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {row.deviceCount ??
                          row.device_count ??
                          0}
                      </td>

                      <td className="px-4 py-3 text-center text-green-600">
                        {row.onlineDevices ??
                          row.online_devices ??
                          0}
                      </td>

                      <td className="px-4 py-3 text-center text-red-600">
                        {row.offlineDevices ??
                          row.offline_devices ??
                          0}
                      </td>

                      <td className="px-4 py-3 text-center font-medium">
                        {row.battery !==
                          null &&
                        row.battery !==
                          undefined
                          ? `${row.battery}%`
                          : "N/A"}
                      </td>

                      <td className="px-4 py-3">
                        {row.networkStatus ??
                          row.network_status ??
                          "N/A"}
                      </td>

                      <td className="px-4 py-3">
                        {formatDateTime(
                          row.latestHeartbeat ??
                            row.latest_heartbeat
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {row.dataAvailability ??
                          row.data_availability ??
                          "N/A"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {row.totalReadings ??
                          row.total_readings ??
                          0}
                      </td>

                    </tr>
                  )
                )}

                {!uptimeRecords.length && (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No uptime data available.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          <div className="border-t border-slate-200 bg-yellow-50 p-4 text-sm text-yellow-800">

            <strong>Note:</strong>{" "}
            Historical uptime requires heartbeat history.
            The backend currently uses device status,
            network status, last heartbeat and reading
            availability for the available period.

          </div>

        </section>
      )}

      {/* ====================================================
          ALERT SUMMARY
      ==================================================== */}

      {reportType ===
        "ALERT_SUMMARY" && (
        <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">

            <h2 className="text-lg font-semibold text-slate-800">
              Alert Summary Report
            </h2>

            <p className="text-sm text-slate-500">
              Environmental alerts during the selected period
            </p>

          </div>

          {/* ALERT SUMMARY CARDS */}

          <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-4">

            <SummaryCard
              icon={ShieldAlert}
              title="Total Alerts"
              value={
                alertSummary?.totalAlerts ??
                alertRecords.length
              }
            />

            <SummaryCard
              icon={AlertTriangle}
              title="Active"
              value={
                alertSummary?.activeAlerts ??
                0
              }
              valueClass="text-red-600"
            />

            <SummaryCard
              icon={CheckCircle2}
              title="Acknowledged"
              value={
                alertSummary?.acknowledgedAlerts ??
                0
              }
              valueClass="text-green-600"
            />

            <SummaryCard
              icon={Activity}
              title="Parameters"
              value={
                alertSummary?.byParameter
                  ? Object.keys(
                      alertSummary.byParameter
                    ).length
                  : new Set(
                      alertRecords.map(
                        (row) =>
                          row.parameter
                      )
                    ).size
              }
            />

          </div>

          {/* ALERT TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-sm">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-4 py-3 text-left">
                    Station
                  </th>

                  <th className="px-4 py-3 text-left">
                    Severity
                  </th>

                  <th className="px-4 py-3 text-left">
                    Parameter
                  </th>

                  <th className="px-4 py-3 text-left">
                    Message
                  </th>

                  <th className="px-4 py-3 text-left">
                    Started
                  </th>

                  <th className="px-4 py-3 text-left">
                    Ended
                  </th>

                  <th className="px-4 py-3 text-left">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {alertRecords.map(
                  (row, index) => (
                    <tr
                      key={
                        row.alert_id ??
                        row.alertId ??
                        row.id ??
                        index
                      }
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >

                      <td className="px-4 py-3 font-medium">

                        {row.station ??
                          stationMap[
                            String(
                              row.station_id ??
                                row.stationId ??
                                ""
                            )
                          ] ??
                          `Station ${
                            row.station_id ??
                            row.stationId ??
                            "N/A"
                          }`}

                      </td>

                      <td className="px-4 py-3">

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            String(
                              row.severity
                            ).toLowerCase() ===
                            "critical"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {row.severity ??
                            "N/A"}
                        </span>

                      </td>

                      <td className="px-4 py-3 font-medium">

                        {row.parameter ??
                          "N/A"}

                      </td>

                      <td className="max-w-[350px] px-4 py-3">

                        {row.message ??
                          row.description ??
                          row.alert_message ??
                          "N/A"}

                      </td>

                      <td className="px-4 py-3">

                        {formatDateTime(
                          row.started_time ??
                            row.startedTime ??
                            row.start_time
                        )}

                      </td>

                      <td className="px-4 py-3">

                        {formatDateTime(
                          row.ended_time ??
                            row.endedTime ??
                            row.end_time
                        )}

                      </td>

                      <td className="px-4 py-3">

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            String(
                              row.status ??
                                ""
                            ).toLowerCase() ===
                            "acknowledged"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {row.status ??
                            "Active"}
                        </span>

                      </td>

                    </tr>
                  )
                )}

                {!alertRecords.length && (
                  <tr>

                    <td
                      colSpan="7"
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No alerts found for the selected period.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>
      )}

      {/* ====================================================
          MAINTENANCE + CALIBRATION
      ==================================================== */}

      {reportType ===
        "MAINTENANCE" && (
        <div className="space-y-6">

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-5">

              <h2 className="text-lg font-semibold text-slate-800">
                Maintenance Report
              </h2>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] text-sm">

                <thead className="bg-slate-50">

                  <tr>
                    <th className="px-4 py-3 text-left">
                      ID
                    </th>

                    <th className="px-4 py-3 text-left">
                      Station
                    </th>

                    <th className="px-4 py-3 text-left">
                      Device
                    </th>

                    <th className="px-4 py-3 text-left">
                      Service Date
                    </th>

                    <th className="px-4 py-3 text-left">
                      Next Service
                    </th>

                    <th className="px-4 py-3 text-left">
                      Type
                    </th>

                    <th className="px-4 py-3 text-left">
                      Status
                    </th>

                    <th className="px-4 py-3 text-left">
                      Remarks
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {maintenanceRecords.map(
                    (row, index) => (
                      <tr
                        key={
                          row.maintenance_id ??
                          row.id ??
                          index
                        }
                        className="border-t border-slate-100"
                      >

                        <td className="px-4 py-3">
                          {row.maintenance_id ??
                            row.maintenanceId ??
                            row.id ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {row.station ??
                            row.stationName ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {row.device ??
                            row.deviceName ??
                            row.device_id ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {formatDate(
                            row.service_date ??
                              row.serviceDate
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {formatDate(
                            row.next_service_date ??
                              row.nextServiceDate
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {row.maintenance_type ??
                            row.type ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {row.status ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {row.remarks ??
                            row.notes ??
                            "N/A"}
                        </td>

                      </tr>
                    )
                  )}

                  {!maintenanceRecords.length && (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No maintenance records found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-5">

              <h2 className="text-lg font-semibold text-slate-800">
                Calibration Report
              </h2>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-sm">

                <thead className="bg-slate-50">

                  <tr>
                    <th className="px-4 py-3 text-left">
                      ID
                    </th>

                    <th className="px-4 py-3 text-left">
                      Sensor
                    </th>

                    <th className="px-4 py-3 text-left">
                      Sensor ID
                    </th>

                    <th className="px-4 py-3 text-left">
                      Calibration Date
                    </th>

                    <th className="px-4 py-3 text-left">
                      Next Calibration
                    </th>

                    <th className="px-4 py-3 text-left">
                      Status
                    </th>

                    <th className="px-4 py-3 text-left">
                      Remarks
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {calibrationRecords.map(
                    (row, index) => (
                      <tr
                        key={
                          row.calibration_id ??
                          row.id ??
                          index
                        }
                        className="border-t border-slate-100"
                      >

                        <td className="px-4 py-3">
                          {row.calibration_id ??
                            row.calibrationId ??
                            row.id ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {row.sensor ??
                            row.sensorName ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {row.sensor_id ??
                            row.sensorId ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {formatDate(
                            row.calibration_date ??
                              row.calibrationDate
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {formatDate(
                            row.next_calibration_date ??
                              row.nextCalibrationDate
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {row.status ??
                            "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          {row.remarks ??
                            row.notes ??
                            "N/A"}
                        </td>

                      </tr>
                    )
                  )}

                  {!calibrationRecords.length && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No calibration records found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>
      )}

    </div>
  );
}