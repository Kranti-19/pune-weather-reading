import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  Wifi,
  WifiOff,
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  MapPin,
  Calendar,
  ShieldCheck,
  Cpu,
  Zap,
  Flame,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import API from "../api/apiClient";
import { getCPCBStatus } from "../utils/aqiUtils";

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRelative = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  const diff = Math.max(0, Date.now() - d.getTime());
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  return `${Math.floor(hours / 24)} day(s) ago`;
};

const normalizePollutantName = (value) => {
  const name = String(value || "").trim().toUpperCase();
  const map = {
    PM25: "PM2.5",
    PM2_5: "PM2.5",
    "PM2.5": "PM2.5",
    PM10: "PM10",
    NO2: "NO₂",
    SO2: "SO₂",
    O3: "O₃",
    NH3: "NH₃",
    CO: "CO",
    PB: "Pb",
  };
  return map[name] || value;
};

const pollutantDefaults = {
  "PM2.5": { unit: "µg/m³", standard: 60 },
  PM10: { unit: "µg/m³", standard: 100 },
  "NO₂": { unit: "µg/m³", standard: 80 },
  "SO₂": { unit: "µg/m³", standard: 80 },
  CO: { unit: "mg/m³", standard: 2 },
  "O₃": { unit: "µg/m³", standard: 100 },
  "NH₃": { unit: "µg/m³", standard: 400 },
  Pb: { unit: "µg/m³", standard: 1 },
};

export default function StationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [station, setStation] = useState(null);
  const [period, setPeriod] = useState("24 Hours");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStation = async () => {
    if (!id) {
      setError("Station ID is missing from the URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/stations/${encodeURIComponent(id)}`);
      const payload = response?.data;

      setStation(
        payload?.station ||
          payload?.data ||
          payload?.result ||
          payload ||
          null
      );
    } catch (err) {
      console.error("Station diagnosis error:", err);
      setStation(null);
      setError(
        err?.response?.data?.message ||
          "Unable to load station details from the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStation();
  }, [id]);

  const aqi = safeNumber(station?.aqi, 0);
  const aqiTheme = getCPCBStatus(aqi);

  const pollutants = useMemo(() => {
    if (!station) return [];

    if (Array.isArray(station.pollutants) && station.pollutants.length) {
      return station.pollutants.map((p) => {
        const name = normalizePollutantName(p.name || p.parameter);
        const defaults = pollutantDefaults[name] || {};
        return {
          name,
          value: safeNumber(p.value),
          unit: p.unit || defaults.unit || "N/A",
          standard: safeNumber(p.standard, defaults.standard || 0),
          subIndex: safeNumber(p.subIndex, 0),
          flag: p.flag || p.quality_flag || "Valid",
        };
      });
    }

    return (station.readings || []).map((r) => {
      const name = normalizePollutantName(r.parameter);
      const defaults = pollutantDefaults[name] || {};
      return {
        name,
        value: safeNumber(r.value),
        unit: r.unit || defaults.unit || "N/A",
        standard: safeNumber(r.standard, defaults.standard || 0),
        subIndex: safeNumber(r.subIndex, 0),
        flag: r.quality_flag || "Valid",
      };
    });
  }, [station]);

  const history = useMemo(() => {
    const rows = Array.isArray(station?.aqiHistory)
      ? station.aqiHistory
      : Array.isArray(station?.history)
      ? station.history
      : [];

    if (!rows.length) return [];

    const sorted = [...rows]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((row) => ({
        time: new Date(row.timestamp).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date(row.timestamp).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        aqi: safeNumber(row.aqi),
        timestamp: row.timestamp,
      }));

    if (period === "24 Hours") return sorted.slice(-24);
    if (period === "7 Days") return sorted.slice(-168);
    return sorted.slice(-720);
  }, [station, period]);

  const weather = station?.weather || {};
  const devices = Array.isArray(station?.devices) ? station.devices : [];
  const sensors = Array.isArray(station?.sensors) ? station.sensors : [];
  const alerts = Array.isArray(station?.alerts) ? station.alerts : [];
  const maintenance = Array.isArray(station?.maintenance)
    ? station.maintenance
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw size={30} className="animate-spin text-blue-600" />
          <p className="font-semibold">Loading station diagnosis...</p>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 max-w-lg w-full text-center shadow-sm">
          <AlertCircle className="mx-auto text-rose-500 mb-3" size={36} />
          <h1 className="text-lg font-bold text-slate-900">
            Unable to load station
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {error || "Station was not found."}
          </p>
          <div className="flex justify-center gap-2 mt-5">
            <button
              onClick={loadStation}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/pune-areas")}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Back to Stations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <button
          onClick={() => navigate("/pune-areas")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Pune Stations
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {station.name || "Monitoring Station"}
              </h1>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  station.status === "Online"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {station.status === "Online" ? "●" : "●"}{" "}
                {station.status || "Offline"}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1 font-mono">
              ID: {station.id || `PMC-${station.station_id}`} •{" "}
              {station.ward || "Unknown Ward"} •{" "}
              {station.zone || "Unknown Zone"} • Last Ping:{" "}
              {formatRelative(station.lastReadingAt || station.updated)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Station Class:
            </span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              {station.station_type || "CAAQM"}
            </span>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current AQI
            </p>

            <div className="flex items-center justify-between mt-2">
              <div className="text-4xl font-black text-slate-900">{aqi}</div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${aqiTheme.badge}`}>
                {station.category || aqiTheme.label}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 mt-3">
              <Flame size={14} className="text-amber-500" />
              Dominant Pollutant:
              <strong className="text-slate-800 ml-1">
                {station.dominant || "N/A"}
              </strong>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${aqiTheme.bg}`} />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Data Quality
            </p>

            <div className="mt-2 text-2xl font-bold text-slate-900">
              {pollutants.length}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                Pollutants loaded
              </span>
            </div>

            <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              {sensors.length || station.sensorCount || 0} sensors connected
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Gateway & Telemetry
            </p>

            <div className="mt-2 text-sm font-semibold text-slate-800">
              Gateway:{" "}
              <span className="font-mono text-blue-600">
                {station.gatewayId || station.gateway_id || "N/A"}
              </span>
            </div>

            <div className="text-xs text-slate-400 mt-1">
              Device(s):{" "}
              <strong className="text-slate-600">
                {devices.length || station.deviceCount || 0}
              </strong>
            </div>

            <div className="text-xs text-slate-400 mt-1">
              Last updated:{" "}
              <strong className="text-slate-600">
                {formatDateTime(station.lastReadingAt || station.updated)}
              </strong>
            </div>
          </div>
        </div>

        {/* LOCATION */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Station Location
              </h2>
              <p className="text-xs text-slate-400">
                Exact coordinates stored in the monitoring station database
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoBox label="Latitude" value={station.latitude ?? "N/A"} />
            <InfoBox label="Longitude" value={station.longitude ?? "N/A"} />
            <InfoBox label="Ward" value={station.ward || "N/A"} />
            <InfoBox label="Zone" value={station.zone || "N/A"} />
          </div>
        </div>

        {/* POLLUTANTS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pollutant Concentrations & Sub-Indices
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Values are loaded from the station reading/AQI data.
              </p>
            </div>

            <span className="text-[11px] font-medium text-slate-400">
              Live database values
            </span>
          </div>

          {pollutants.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {pollutants.map((p) => {
                const theme = getCPCBStatus(p.subIndex || p.value);
                const exceeded =
                  p.standard > 0 && p.value > p.standard;

                return (
                  <div
                    key={`${p.name}-${p.value}`}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>{p.name}</span>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-white text-slate-400 border border-slate-200">
                        {p.flag}
                      </span>
                    </div>

                    <div className="my-2">
                      <div
                        className={`text-xl font-extrabold ${
                          exceeded ? "text-amber-600" : "text-slate-900"
                        }`}
                      >
                        {p.value}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.unit}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Sub-Index:</span>
                      <span className={`font-bold px-1 rounded ${theme.badge}`}>
                        {p.subIndex || "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No pollutant readings are available for this station." />
          )}
        </div>

        {/* AQI HISTORY */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Historical AQI Trend
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Actual AQI observations returned by the backend
              </p>
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {["24 Hours", "7 Days", "30 Days"].map((item) => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    period === item
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {history.length ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={history}
                  margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F1F5F9"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 500]}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      fontSize: "12px",
                      border: "1px solid #E2E8F0",
                    }}
                    formatter={(value) => [`${value} AQI`, "Station AQI"]}
                  />
                  <ReferenceLine y={100} stroke="#92D050" strokeDasharray="3 3" />
                  <ReferenceLine y={200} stroke="#EAB308" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="aqi"
                    stroke={aqiTheme.hex}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: aqiTheme.hex }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="No historical AQI records are available for this station." />
          )}
        </div>

        {/* WEATHER */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Meteorological Dispersion Context
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Latest weather reading associated with this station/site.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <WeatherBox
              icon={<Thermometer size={18} />}
              label="Temperature"
              value={
                weather.temperature != null
                  ? `${weather.temperature}°C`
                  : "N/A"
              }
            />
            <WeatherBox
              icon={<Droplets size={18} />}
              label="Relative Humidity"
              value={
                weather.humidity != null ? `${weather.humidity}%` : "N/A"
              }
            />
            <WeatherBox
              icon={<Wind size={18} />}
              label="Wind Speed"
              value={
                weather.wind_speed != null
                  ? `${weather.wind_speed} m/s`
                  : "N/A"
              }
            />
            <WeatherBox
              icon={<Wind size={18} />}
              label="Wind Direction"
              value={
                weather.wind_direction != null
                  ? `${weather.wind_direction}°`
                  : "N/A"
              }
            />
            <WeatherBox
              icon={<Gauge size={18} />}
              label="Pressure"
              value={
                weather.pressure != null
                  ? `${weather.pressure} hPa`
                  : "N/A"
              }
            />
          </div>
        </div>

        {/* DEVICES / SENSORS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={18} className="text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Devices
              </h2>
            </div>

            {devices.length ? (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.device_id}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <strong className="text-sm">
                        {device.manufacturer || "Device"}{" "}
                        {device.model || ""}
                      </strong>
                      <span className="text-xs font-bold text-slate-500">
                        {device.status || "Unknown"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Gateway: {device.gateway_id || "N/A"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Firmware: {device.firmware || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No devices are registered for this station." />
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">
                Sensors
              </h2>
            </div>

            {sensors.length ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {sensors.map((sensor) => (
                  <div
                    key={sensor.sensor_id}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex justify-between">
                      <strong className="text-sm">
                        {sensor.sensor_type || "Sensor"}
                      </strong>
                      <span className="text-xs font-bold text-slate-500">
                        {sensor.status || "Unknown"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Model: {sensor.model || "N/A"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Serial: {sensor.serial_number || "N/A"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Calibration: {formatDate(sensor.calibration_date)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No sensors are registered for this station." />
            )}
          </div>
        </div>

        {/* ALERTS / MAINTENANCE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleRecordCard
            title="Recent Alerts"
            icon={<AlertCircle size={18} className="text-rose-500" />}
            records={alerts}
            empty="No alerts are available for this station."
            render={(item) => (
              <>
                <strong>{item.parameter || "Station Alert"}</strong>
                <p>{item.severity || "N/A"} • {item.acknowledgement || "Open"}</p>
                <p>{formatDateTime(item.started_time)}</p>
              </>
            )}
          />

          <SimpleRecordCard
            title="Maintenance History"
            icon={<Calendar size={18} className="text-blue-600" />}
            records={maintenance}
            empty="No maintenance records are available."
            render={(item) => (
              <>
                <strong>{item.issue || "Maintenance"}</strong>
                <p>{item.action || "N/A"} • {item.status || "N/A"}</p>
                <p>{formatDate(item.service_date)}</p>
              </>
            )}
          />
        </div>
      </main>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-sm font-bold text-slate-900 mt-1 break-all">
        {value}
      </p>
    </div>
  );
}

function WeatherBox({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="text-blue-600">{icon}</div>
      <p className="text-xs text-slate-400 mt-2 font-medium">{label}</p>
      <p className="text-base font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-10 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
      <AlertCircle size={17} />
      {text}
    </div>
  );
}

function SimpleRecordCard({ title, icon, records, empty, render }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>

      {records.length ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {records.map((item, index) => (
            <div
              key={item.alert_id || item.maintenance_id || index}
              className="border border-slate-200 rounded-xl p-4 text-xs text-slate-500"
            >
              <div className="text-slate-800">{render(item)}</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text={empty} />
      )}
    </div>
  );
}
