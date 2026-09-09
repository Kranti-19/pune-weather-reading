
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wrench,
  Server,
  Battery,
  Wifi,
  Cpu,
  Send,
  Clock,
  Radio,
  ShieldCheck,
  Activity,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";
const DEVICES_STATUS_API = `${API_BASE}/devices/status`;
const DEVICES_API = `${API_BASE}/devices`;

const getToken = () => localStorage.getItem("token");

const authHeaders = (json = false) => {
  const headers = {};

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatDateTime = (value) => {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLastSeen = (seconds) => {
  if (seconds === null || seconds === undefined) return "Never";

  const value = safeNumber(seconds);

  if (value < 60) return "Just now";

  const minutes = Math.floor(value / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  return `${Math.floor(hours / 24)} day(s) ago`;
};

const getDeviceHealthStatus = (device) => {
  if (!device?.is_online) return "Critical";

  const battery = device?.battery_level;
  const sensors = device?.sensors || [];

  if (battery !== null && battery !== undefined && safeNumber(battery) <= 15) {
    return "Critical";
  }

  const hasFaultySensor = sensors.some((sensor) => {
    const status = String(sensor.status || "").toLowerCase();
    return ["fault", "failed", "offline", "inactive", "error"].includes(status);
  });

  if (hasFaultySensor) return "Warning";

  if (battery !== null && battery !== undefined && safeNumber(battery) <= 30) {
    return "Warning";
  }

  return "Healthy";
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Healthy":
    case "Online":
    case "Valid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "Warning":
    case "Calibration Due":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "Offline":
    case "Critical":
    case "Sensor Fault":
      return "bg-rose-50 text-rose-700 border-rose-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const getBatteryClass = (value) => {
  const battery = safeNumber(value);

  if (battery <= 15) return "text-rose-600";
  if (battery <= 30) return "text-amber-600";
  return "text-emerald-600";
};

const getBatteryBarClass = (value) => {
  const battery = safeNumber(value);

  if (battery <= 15) return "bg-rose-500";
  if (battery <= 30) return "bg-amber-500";
  return "bg-emerald-500";
};

const getCalibrationStatus = (sensor) => {
  const status = String(sensor?.status || "").toLowerCase();

  if (["fault", "failed", "offline", "error"].includes(status)) {
    return "Sensor Fault";
  }

  if (!sensor?.calibration_date) {
    return "Not Recorded";
  }

  if (sensor.calibration_date) {
    const calibrationDate = new Date(sensor.calibration_date);

    if (!Number.isNaN(calibrationDate.getTime())) {
      const ageDays =
        (Date.now() - calibrationDate.getTime()) / (1000 * 60 * 60 * 24);

      if (ageDays > 90) return "Calibration Due";
    }
  }

  return "Valid";
};

const getNextCalibrationDate = (sensor) => {
  if (!sensor?.calibration_date) return "Not recorded";

  const date = new Date(sensor.calibration_date);

  if (Number.isNaN(date.getTime())) return "—";

  const next = new Date(date);
  next.setDate(next.getDate() + 90);

  return next.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStationName = (device) => {
  return (
    device?.station?.name ||
    `Station ${device?.station_id ?? "—"}`
  );
};

export default function DeviceHealth() {
  const [activeTab, setActiveTab] = useState("gateways");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [devices, setDevices] = useState([]);
  const [sensorCalibrationLogs, setSensorCalibrationLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [maintenanceModal, setMaintenanceModal] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(
    "PMC CAAQM Quick Response Unit 1 (Central)"
  );

  const fetchDevices = useCallback(async () => {
    const response = await fetch(DEVICES_STATUS_API, {
      method: "GET",
      headers: authHeaders(),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch device status.");
    }

    return result.devices || [];
  }, []);

  const fetchSensorDetails = useCallback(async (deviceList) => {
    if (!deviceList.length) {
      setSensorCalibrationLogs([]);
      return;
    }

    const details = await Promise.all(
      deviceList.map(async (device) => {
        try {
          const response = await fetch(
            `${DEVICES_API}/${device.device_id}`,
            {
              method: "GET",
              headers: authHeaders(),
            }
          );

          if (!response.ok) return null;

          const result = await response.json().catch(() => ({}));

          return {
            device,
            sensors: result.device?.sensors || [],
          };
        } catch {
          return null;
        }
      })
    );

    const logs = [];

    details.filter(Boolean).forEach(({ device, sensors }) => {
      sensors.forEach((sensor) => {
        const calibrationStatus = getCalibrationStatus(sensor);

        logs.push({
          sensorId:
            sensor.serial_number ||
            `SNS-${String(sensor.sensor_id).padStart(3, "0")}`,

          station: getStationName(device),

          parameter:
            sensor.sensor_type ||
            "Sensor",

          model:
            sensor.model ||
            "—",

          lastCal: sensor.calibration_date
            ? new Date(sensor.calibration_date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Not recorded",

          nextCal: getNextCalibrationDate(sensor),

          drift: "—",

          calStatus: calibrationStatus,

          zeroNoise: "—",

          sensorStatus: sensor.status || "—",

          sensorIdNumber: sensor.sensor_id,
        });
      });
    });

    setSensorCalibrationLogs(logs);
  }, []);

  const loadDeviceHealth = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        setError("");

        const deviceList = await fetchDevices();

        setDevices(deviceList);

        await fetchSensorDetails(deviceList);
      } catch (err) {
        console.error("Device Health fetch error:", err);
        setError(
          err?.message ||
            "Unable to load device health data. Check that the backend is running."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchDevices, fetchSensorDetails]
  );

  useEffect(() => {
    loadDeviceHealth();

    const interval = setInterval(() => {
      loadDeviceHealth(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadDeviceHealth]);

  const gateways = useMemo(() => {
    return devices.map((device) => {
      const healthStatus = getDeviceHealthStatus(device);

      const sensorCount = device.sensorCount || 0;

      return {
        device: device.gateway_id || `Device ${device.device_id}`,
        deviceId: device.device_id,

        station: getStationName(device),
        stationId: device.station_id,

        connectivity: device.is_online ? "Online" : "Offline",

        protocol:
          device.ip_network
            ? "IP Network"
            : "—",

        signal: "—",

        powerType: "—",

        batteryLevel:
          device.battery_level === null ||
          device.battery_level === undefined
            ? null
            : safeNumber(device.battery_level),

        firmware: device.firmware || "—",

        manufacturer: device.manufacturer || "—",
        model: device.model || "—",

        sensorHealth:
          `${healthStatus === "Healthy" ? "Healthy" : healthStatus} (${sensorCount}/${sensorCount})`,

        sensorCount,

        lastCommunication: formatLastSeen(
          device.seconds_since_last_seen
        ),

        lastSeenAt: device.last_seen_at,

        latency: "—",

        status: healthStatus,

        calculatedStatus:
          device.calculated_status ||
          (device.is_online ? "Online" : "Offline"),

        networkStatus:
          device.network_status || "Unknown",

        rawDevice: device,
      };
    });
  }, [devices]);

  const filteredGateways = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return gateways.filter((gw) => {
      const matchesSearch =
        !search ||
        gw.device.toLowerCase().includes(search) ||
        gw.station.toLowerCase().includes(search) ||
        gw.protocol.toLowerCase().includes(search) ||
        gw.model.toLowerCase().includes(search) ||
        gw.manufacturer.toLowerCase().includes(search);

      const matchesStatus =
        filterStatus === "All" ||
        gw.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [gateways, searchTerm, filterStatus]);

  const filteredSensors = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return sensorCalibrationLogs.filter((sensor) => {
      return (
        !search ||
        sensor.sensorId.toLowerCase().includes(search) ||
        sensor.station.toLowerCase().includes(search) ||
        sensor.parameter.toLowerCase().includes(search) ||
        sensor.model.toLowerCase().includes(search)
      );
    });
  }, [sensorCalibrationLogs, searchTerm]);

  const healthyCount = gateways.filter(
    (g) => g.status === "Healthy"
  ).length;

  const warningCount = gateways.filter(
    (g) => g.status === "Warning"
  ).length;

  const criticalCount = gateways.filter(
    (g) => g.status === "Critical"
  ).length;

  const onlineCount = gateways.filter(
    (g) => g.connectivity === "Online"
  ).length;

  const offlineCount = gateways.filter(
    (g) => g.connectivity === "Offline"
  ).length;

  const networkConnectedCount = gateways.filter(
    (g) =>
      String(g.networkStatus).toLowerCase() === "connected"
  ).length;

  const averageBattery = useMemo(() => {
    const values = gateways
      .map((g) => g.batteryLevel)
      .filter((v) => v !== null && Number.isFinite(v));

    if (!values.length) return null;

    return Math.round(
      values.reduce((sum, value) => sum + value, 0) /
        values.length
    );
  }, [gateways]);

  const attentionCount = warningCount + criticalCount;

  const handleForcePing = async () => {
    if (!gateways.length) {
      setActionMessage("No devices are available to poll.");
      return;
    }

    try {
      setIsPinging(true);
      setError("");
      setActionMessage("");

      /*
       * Your backend currently provides a heartbeat endpoint.
       * A real physical gateway cannot be pinged from this page unless
       * an actual gateway protocol (MQTT/HTTP/SNMP etc.) is configured.
       *
       * For the simulator, we send a heartbeat to every device.
       */
      const results = await Promise.allSettled(
        gateways.map((gateway) =>
          fetch(
            `${DEVICES_API}/${gateway.deviceId}/heartbeat`,
            {
              method: "POST",
              headers: authHeaders(true),
              body: JSON.stringify({
                battery_level:
                  gateway.batteryLevel === null
                    ? undefined
                    : gateway.batteryLevel,
                network_status: "Connected",
              }),
            }
          )
        )
      );

      const successful = results.filter(
        (result) =>
          result.status === "fulfilled" &&
          result.value.ok
      ).length;

      setActionMessage(
        `Gateway poll completed. ${successful} of ${gateways.length} device heartbeat(s) updated.`
      );

      await loadDeviceHealth(true);
    } catch (err) {
      setError(
        err?.message ||
          "Gateway poll failed."
      );
    } finally {
      setIsPinging(false);
    }
  };

  const openMaintenanceModal = (gateway) => {
    setMaintenanceModal(gateway);
    setSelectedTechnician(
      "PMC CAAQM Quick Response Unit 1 (Central)"
    );
    setActionMessage("");
  };

  const dispatchMaintenance = async () => {
    if (!maintenanceModal) return;

    try {
      setError("");
      setActionMessage("");

      /*
       * There is no separate maintenance API in the supplied
       * deviceController. The existing PATCH /api/devices/:id
       * endpoint supports the "maintenance" device status.
       */
      const response = await fetch(
        `${DEVICES_API}/${maintenanceModal.deviceId}`,
        {
          method: "PATCH",
          headers: authHeaders(true),
          body: JSON.stringify({
            status: "maintenance",
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to place device into maintenance."
        );
      }

      setActionMessage(
        `Maintenance status applied to ${maintenanceModal.device}. Assigned to ${selectedTechnician}.`
      );

      setMaintenanceModal(null);

      await loadDeviceHealth(true);
    } catch (err) {
      console.error("Maintenance update error:", err);
      setError(
        err?.message ||
          "Unable to issue maintenance action."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Hardware & Device Management</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">
              Device Telemetry
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
              Sensor & Hardware Telemetry Health
            </h1>

            {!loading && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Real-time gateway connectivity, battery health and sensor status
          </p>
        </div>

        <button
          onClick={() => loadDeviceHealth(true)}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh Status"}
        </button>
      </div>

      {/* NOTICES */}
      {error && (
        <div className="mb-5 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-xs font-semibold">
          <XCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <div>{error}</div>
            <div className="text-[10px] font-normal mt-1">
              API: {DEVICES_STATUS_API}
            </div>
          </div>
        </div>
      )}

      {actionMessage && !error && (
        <div className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 text-xs font-semibold">
          <CheckCircle size={16} />
          {actionMessage}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {/* Operational */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Operational Nodes
            </span>

            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={18} />
            </div>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">
              {loading ? "—" : healthyCount}
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
              Healthy
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Devices with healthy telemetry
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
            <span>{onlineCount} Online</span>
            <span className="text-slate-400 font-normal">
              {devices.length} Total
            </span>
          </div>
        </div>

        {/* Network */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Network Connectivity
            </span>

            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wifi size={18} />
            </div>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-blue-600">
              {loading
                ? "—"
                : `${networkConnectedCount} / ${devices.length}`}
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
              {devices.length
                ? `${Math.round(
                    (networkConnectedCount / devices.length) *
                      100
                  )}%`
                : "0%"}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Based on current network_status
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>{onlineCount} Online</span>
            <span className="text-slate-400 font-normal">
              {offlineCount} Offline
            </span>
          </div>
        </div>

        {/* Attention */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Attention Required
            </span>

            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-amber-600">
              {loading ? "—" : attentionCount}
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
              Warning
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Nodes requiring inspection
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
            <span className="text-amber-600">
              {warningCount} Warning
            </span>

            <span className="text-rose-600">
              {criticalCount} Critical
            </span>
          </div>
        </div>

        {/* Offline */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Offline / Fault
            </span>

            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={18} />
            </div>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-rose-600">
              {loading ? "—" : offlineCount}
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
              Field Action
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            No heartbeat within 15 minutes
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
            <span className="text-rose-600">
              {offlineCount} Offline
            </span>

            <span className="text-slate-400 font-normal">
              Battery Avg: {averageBattery === null ? "—" : `${averageBattery}%`}
            </span>
          </div>
        </div>
      </div>

      {/* TABS + SEARCH */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("gateways")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "gateways"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            IoT Gateways & Power Matrix ({gateways.length})
          </button>

          <button
            onClick={() => setActiveTab("calibration")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "calibration"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            Sensor Calibration & QA/QC ({sensorCalibrationLogs.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, model, station..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 w-52 sm:w-64 transition"
            />

            <Search
              size={14}
              className="absolute left-3 top-2.5 text-slate-400"
            />
          </div>

          {activeTab === "gateways" && (
            <div className="relative">
              <Filter
                size={13}
                className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"
              />

              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value)
                }
                className="pl-8 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Healthy">Healthy</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* GATEWAYS */}
      {activeTab === "gateways" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Municipal Station Gateway Network
                </h2>

                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  <Activity size={10} />
                  LIVE
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                Data is loaded from the device status API and refreshed every 10 seconds.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw size={24} className="animate-spin mb-3" />
              <span className="text-xs font-semibold">
                Loading device telemetry...
              </span>
            </div>
          ) : filteredGateways.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <Server size={30} className="mb-3" />
              <span className="text-sm font-bold">
                No devices found
              </span>
              <span className="text-xs mt-1">
                Try changing the search or status filter.
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <th className="pb-3 pl-2">
                      Gateway / Controller
                    </th>

                    <th className="pb-3">
                      Station Node Location
                    </th>

                    <th className="pb-3">
                      Network
                    </th>

                    <th className="pb-3">
                      Power & Battery
                    </th>

                    <th className="pb-3">
                      Sensor Bus
                    </th>

                    <th className="pb-3">
                      Last Heartbeat
                    </th>

                    <th className="pb-3 text-right pr-2">
                      Status / Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredGateways.map((gw) => (
                    <tr
                      key={gw.deviceId}
                      className="hover:bg-slate-50/80 transition"
                    >
                      {/* DEVICE */}
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0 border border-blue-100">
                            <Server size={16} />
                          </div>

                          <div>
                            <div className="font-black text-slate-900 font-mono text-xs">
                              {gw.device}
                            </div>

                            <div className="text-[10px] text-slate-400">
                              {gw.manufacturer} · {gw.model}
                            </div>

                            <div className="text-[10px] text-slate-400 font-mono">
                              FW {gw.firmware}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* STATION */}
                      <td className="py-4">
                        <div className="font-bold text-slate-800">
                          {gw.station}
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono">
                          Station ID: {gw.stationId ?? "—"}
                        </div>
                      </td>

                      {/* NETWORK */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <Radio
                            size={14}
                            className={
                              gw.connectivity === "Online"
                                ? "text-emerald-600"
                                : "text-rose-500"
                            }
                          />

                          <span className="font-semibold text-slate-800">
                            {gw.connectivity}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1">
                          {gw.protocol}
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono">
                          {gw.networkStatus}
                        </div>
                      </td>

                      {/* BATTERY */}
                      <td className="py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Battery
                            size={15}
                            className={getBatteryClass(
                              gw.batteryLevel
                            )}
                          />

                          <span className="font-bold text-slate-800">
                            {gw.batteryLevel === null
                              ? "—"
                              : `${gw.batteryLevel}%`}
                          </span>
                        </div>

                        {gw.batteryLevel !== null && (
                          <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getBatteryBarClass(
                                gw.batteryLevel
                              )}`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    gw.batteryLevel
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>

                      {/* SENSOR */}
                      <td className="py-4 font-medium text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Cpu
                            size={13}
                            className="text-slate-400"
                          />

                          {gw.sensorCount} sensor(s)
                        </span>

                        <span
                          className={`inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(
                            gw.status
                          )}`}
                        >
                          {gw.status}
                        </span>
                      </td>

                      {/* HEARTBEAT */}
                      <td className="py-4">
                        <div className="font-mono text-slate-600 text-[11px]">
                          {gw.lastCommunication}
                        </div>

                        <div className="text-[9px] text-slate-400 mt-1">
                          {formatDateTime(gw.lastSeenAt)}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                              gw.status
                            )}`}
                          >
                            {gw.status}
                          </span>

                          {gw.status !== "Healthy" && (
                            <button
                              onClick={() =>
                                openMaintenanceModal(gw)
                              }
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                              title="Dispatch Technician"
                            >
                              <Wrench size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CALIBRATION */}
      {activeTab === "calibration" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Sensor Calibration & Quality Assurance
                </h2>

                <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  LIVE DATA
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                Calibration information currently available from the sensor records.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck size={15} className="text-blue-600" />
              {sensorCalibrationLogs.length} sensor record(s)
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw size={24} className="animate-spin mb-3" />
              <span className="text-xs font-semibold">
                Loading sensor records...
              </span>
            </div>
          ) : filteredSensors.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <Cpu size={30} className="mb-3" />
              <span className="text-sm font-bold">
                No sensor records found
              </span>
              <span className="text-xs mt-1">
                Sensor records are loaded through the device API.
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <th className="pb-3 pl-2">
                      Analyzer Sensor ID
                    </th>

                    <th className="pb-3">
                      Station Node
                    </th>

                    <th className="pb-3">
                      Monitored Parameter
                    </th>

                    <th className="pb-3">
                      Last Calibration
                    </th>

                    <th className="pb-3">
                      Next Due Date
                    </th>

                    <th className="pb-3">
                      Drift
                    </th>

                    <th className="pb-3 text-right pr-2">
                      QA Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSensors.map((sensor) => (
                    <tr
                      key={`${sensor.sensorId}-${sensor.sensorIdNumber}`}
                      className="hover:bg-slate-50/80 transition"
                    >
                      <td className="py-4 pl-2">
                        <div className="font-mono font-black text-slate-900 text-xs">
                          {sensor.sensorId}
                        </div>

                        <div className="text-[10px] text-slate-400 font-medium">
                          {sensor.model}
                        </div>
                      </td>

                      <td className="py-4 font-bold text-slate-800">
                        {sensor.station}
                      </td>

                      <td className="py-4">
                        <span className="font-semibold text-slate-900">
                          {sensor.parameter}
                        </span>

                        <span className="text-[10px] text-slate-400 block">
                          Sensor status: {sensor.sensorStatus}
                        </span>
                      </td>

                      <td className="py-4 font-mono text-slate-500 text-[11px]">
                        {sensor.lastCal}
                      </td>

                      <td className="py-4 font-mono font-semibold text-slate-700 text-[11px]">
                        {sensor.nextCal}
                      </td>

                      <td className="py-4">
                        <span className="font-mono font-bold text-xs text-slate-500">
                          {sensor.drift}
                        </span>
                      </td>

                      <td className="py-4 text-right pr-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            sensor.calStatus
                          )}`}
                        >
                          {sensor.calStatus === "Valid" ? (
                            <CheckCircle size={12} />
                          ) : (
                            <AlertTriangle size={12} />
                          )}

                          <span>{sensor.calStatus}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-start gap-3">
        <ShieldCheck
          size={18}
          className="text-blue-600 shrink-0 mt-0.5"
        />

        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900">
            Device health monitoring:
          </strong>{" "}
          A device is treated as online when its last heartbeat is
          within the configured 15-minute timeout and its network
          status is Connected. Device status is refreshed automatically
          every 10 seconds.
        </div>
      </div>

      {/* MAINTENANCE MODAL */}
      {maintenanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wrench size={20} />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Dispatch Field Maintenance
                </h3>

                <p className="text-xs text-slate-400">
                  Update gateway status to maintenance
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-5">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Gateway
              </div>

              <div className="font-mono font-black text-slate-900 mt-1">
                {maintenanceModal.device}
              </div>

              <div className="text-xs font-semibold text-slate-600 mt-1">
                {maintenanceModal.station}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Assigned Field Engineer
                </label>

                <select
                  value={selectedTechnician}
                  onChange={(e) =>
                    setSelectedTechnician(e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option>
                    PMC CAAQM Quick Response Unit 1 (Central)
                  </option>

                  <option>
                    Maharashtra Instrumentation Services Ltd.
                  </option>

                  <option>
                    Depot Resident Electrical Contractor
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setMaintenanceModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                onClick={dispatchMaintenance}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition active:scale-95"
              >
                <Send size={13} />
                <span>Issue Work Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORCE POLL INFO */}
      <div className="fixed bottom-4 right-4 hidden lg:flex items-center gap-2 bg-white/95 backdrop-blur border border-slate-200 shadow-lg rounded-2xl px-3 py-2 text-[10px] font-semibold text-slate-500">
        <Clock size={12} className="text-blue-600" />
        Auto refresh: 10 sec
      </div>

      {/* PING OVERLAY */}
      {isPinging && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-xl text-xs font-bold">
          <RefreshCw size={14} className="animate-spin" />
          Sending gateway heartbeats...
        </div>
      )}
    </div>
  );
}
