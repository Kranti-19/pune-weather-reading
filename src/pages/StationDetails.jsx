import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  Wifi,
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
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { getCPCBStatus } from "../utils/aqiUtils";

export default function StationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedPeriod, setSelectedPeriod] = useState("24 Hours");

  const stations = {
    "1": {
      id: "PMC-001",
      gatewayId: "GW-KTH-09",
      firmware: "v2.4.1",
      name: "Kothrud Monitoring Station",
      ward: "Kothrud (Ward 10)",
      zone: "West Zone",
      aqi: 118,
      dominant: "PM2.5",
      status: "Online",
      power: "Mains (Battery 98%)",
      lastCalibration: "12 Jan 2026",
      updated: "Just now",
      pollutants: [
        { name: "PM2.5", value: 58, unit: "µg/m³", standard: 60, subIndex: 118, flag: "Valid" },
        { name: "PM10", value: 96, unit: "µg/m³", standard: 100, subIndex: 96, flag: "Valid" },
        { name: "NO₂", value: 42, unit: "µg/m³", standard: 80, subIndex: 53, flag: "Valid" },
        { name: "SO₂", value: 18, unit: "µg/m³", standard: 80, subIndex: 23, flag: "Valid" },
        { name: "CO", value: 1.2, unit: "mg/m³", standard: 2.0, subIndex: 60, flag: "Valid" },
        { name: "O₃", value: 54, unit: "µg/m³", standard: 100, subIndex: 54, flag: "Valid" },
        { name: "NH₃", value: 21, unit: "µg/m³", standard: 400, subIndex: 15, flag: "Valid" },
        { name: "Pb", value: 0.4, unit: "µg/m³", standard: 1.0, subIndex: 40, flag: "Valid" },
      ],
      temperature: "23°C",
      humidity: "68%",
      windSpeed: "2.8 m/s",
      windDirection: "NW (315°)",
      pressure: "1008 hPa",
    },
    "2": {
      id: "PMC-002",
      gatewayId: "GW-HNJ-02",
      firmware: "v2.4.0",
      name: "Hinjewadi Monitoring Station",
      ward: "Hinjewadi (Ward 25)",
      zone: "North-West Zone",
      aqi: 92,
      dominant: "PM10",
      status: "Online",
      power: "Solar + Mains",
      lastCalibration: "05 Feb 2026",
      updated: "2 min ago",
      pollutants: [
        { name: "PM2.5", value: 42, unit: "µg/m³", standard: 60, subIndex: 70, flag: "Valid" },
        { name: "PM10", value: 78, unit: "µg/m³", standard: 100, subIndex: 92, flag: "Valid" },
        { name: "NO₂", value: 35, unit: "µg/m³", standard: 80, subIndex: 44, flag: "Valid" },
        { name: "SO₂", value: 14, unit: "µg/m³", standard: 80, subIndex: 18, flag: "Valid" },
        { name: "CO", value: 0.9, unit: "mg/m³", standard: 2.0, subIndex: 45, flag: "Valid" },
        { name: "O₃", value: 48, unit: "µg/m³", standard: 100, subIndex: 48, flag: "Valid" },
        { name: "NH₃", value: 18, unit: "µg/m³", standard: 400, subIndex: 12, flag: "Valid" },
        { name: "Pb", value: 0.3, unit: "µg/m³", standard: 1.0, subIndex: 30, flag: "Valid" },
      ],
      temperature: "24°C",
      humidity: "64%",
      windSpeed: "3.1 m/s",
      windDirection: "W (270°)",
      pressure: "1007 hPa",
    },
    "3": {
      id: "PMC-003",
      gatewayId: "GW-HDP-04",
      firmware: "v2.4.1",
      name: "Hadapsar Monitoring Station",
      ward: "Hadapsar (Ward 15)",
      zone: "East Zone",
      aqi: 156,
      dominant: "PM2.5",
      status: "Online",
      power: "Mains (Battery 92%)",
      lastCalibration: "18 Dec 2025",
      updated: "1 min ago",
      pollutants: [
        { name: "PM2.5", value: 72, unit: "µg/m³", standard: 60, subIndex: 156, flag: "Valid" },
        { name: "PM10", value: 118, unit: "µg/m³", standard: 100, subIndex: 112, flag: "Valid" },
        { name: "NO₂", value: 49, unit: "µg/m³", standard: 80, subIndex: 61, flag: "Valid" },
        { name: "SO₂", value: 21, unit: "µg/m³", standard: 80, subIndex: 26, flag: "Valid" },
        { name: "CO", value: 1.4, unit: "mg/m³", standard: 2.0, subIndex: 70, flag: "Valid" },
        { name: "O₃", value: 57, unit: "µg/m³", standard: 100, subIndex: 57, flag: "Valid" },
        { name: "NH₃", value: 24, unit: "µg/m³", standard: 400, subIndex: 17, flag: "Valid" },
        { name: "Pb", value: 0.5, unit: "µg/m³", standard: 1.0, subIndex: 50, flag: "Valid" },
      ],
      temperature: "25°C",
      humidity: "70%",
      windSpeed: "2.4 m/s",
      windDirection: "E (90°)",
      pressure: "1006 hPa",
    },
    "4": {
      id: "PMC-004",
      gatewayId: "GW-KHR-01",
      firmware: "v2.3.9",
      name: "Kharadi Monitoring Station",
      ward: "Kharadi (Ward 17)",
      zone: "East Zone",
      aqi: 134,
      dominant: "PM2.5",
      status: "Online",
      power: "Mains",
      lastCalibration: "22 Jan 2026",
      updated: "3 min ago",
      pollutants: [
        { name: "PM2.5", value: 64, unit: "µg/m³", standard: 60, subIndex: 134, flag: "Valid" },
        { name: "PM10", value: 105, unit: "µg/m³", standard: 100, subIndex: 103, flag: "Valid" },
        { name: "NO₂", value: 44, unit: "µg/m³", standard: 80, subIndex: 55, flag: "Valid" },
        { name: "SO₂", value: 19, unit: "µg/m³", standard: 80, subIndex: 24, flag: "Valid" },
        { name: "CO", value: 1.3, unit: "mg/m³", standard: 2.0, subIndex: 65, flag: "Valid" },
        { name: "O₃", value: 52, unit: "µg/m³", standard: 100, subIndex: 52, flag: "Valid" },
        { name: "NH₃", value: 22, unit: "µg/m³", standard: 400, subIndex: 16, flag: "Valid" },
        { name: "Pb", value: 0.4, unit: "µg/m³", standard: 1.0, subIndex: 40, flag: "Valid" },
      ],
      temperature: "25°C",
      humidity: "66%",
      windSpeed: "2.7 m/s",
      windDirection: "NE (45°)",
      pressure: "1007 hPa",
    },
    "5": {
      id: "PMC-005",
      gatewayId: "GW-BNR-07",
      firmware: "v2.4.1",
      name: "Baner Monitoring Station",
      ward: "Baner (Ward 8)",
      zone: "West Zone",
      aqi: 214,
      dominant: "PM2.5",
      status: "Offline",
      power: "Battery (Critical 14%)",
      lastCalibration: "10 Nov 2025",
      updated: "18 min ago",
      pollutants: [
        { name: "PM2.5", value: 91, unit: "µg/m³", standard: 60, subIndex: 214, flag: "Suspect" },
        { name: "PM10", value: 142, unit: "µg/m³", standard: 100, subIndex: 128, flag: "Suspect" },
        { name: "NO₂", value: 61, unit: "µg/m³", standard: 80, subIndex: 76, flag: "Valid" },
        { name: "SO₂", value: 25, unit: "µg/m³", standard: 80, subIndex: 31, flag: "Valid" },
        { name: "CO", value: 1.8, unit: "mg/m³", standard: 2.0, subIndex: 90, flag: "Valid" },
        { name: "O₃", value: 63, unit: "µg/m³", standard: 100, subIndex: 63, flag: "Valid" },
        { name: "NH₃", value: 29, unit: "µg/m³", standard: 400, subIndex: 20, flag: "Valid" },
        { name: "Pb", value: 0.7, unit: "µg/m³", standard: 1.0, subIndex: 70, flag: "Valid" },
      ],
      temperature: "23°C",
      humidity: "72%",
      windSpeed: "1.9 m/s",
      windDirection: "SW (225°)",
      pressure: "1005 hPa",
    },
  };

  const station = stations[id] || stations["1"];
  const aqiTheme = getCPCBStatus(station.aqi);

  const aqiData = {
    "24 Hours": [
      { time: "00:00", aqi: station.aqi - 12 },
      { time: "03:00", aqi: station.aqi - 8 },
      { time: "06:00", aqi: station.aqi - 5 },
      { time: "09:00", aqi: station.aqi + 14 },
      { time: "12:00", aqi: station.aqi + 10 },
      { time: "15:00", aqi: station.aqi + 6 },
      { time: "18:00", aqi: station.aqi + 18 },
      { time: "21:00", aqi: station.aqi },
    ],
    "7 Days": [
      { time: "Mon", aqi: station.aqi - 18 },
      { time: "Tue", aqi: station.aqi - 10 },
      { time: "Wed", aqi: station.aqi - 4 },
      { time: "Thu", aqi: station.aqi + 8 },
      { time: "Fri", aqi: station.aqi + 15 },
      { time: "Sat", aqi: station.aqi + 7 },
      { time: "Sun", aqi: station.aqi },
    ],
    "30 Days": [
      { time: "Wk 1", aqi: station.aqi - 22 },
      { time: "Wk 2", aqi: station.aqi - 12 },
      { time: "Wk 3", aqi: station.aqi + 6 },
      { time: "Wk 4", aqi: station.aqi },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate("/pune-areas")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          Back to Pune Stations
        </button>

        {/* Station Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{station.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  station.status === "Online"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                ● {station.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              ID: {station.id} • {station.ward} • {station.zone} • Last Ping: {station.updated}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">CPCB Station Class:</span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              Continuous CAAQM (Real-Time)
            </span>
          </div>
        </div>

        {/* Primary AQI & Diagnostics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* AQI Score Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Calculated AQI</p>
                <div className="text-4xl font-black text-slate-900 mt-2">{station.aqi}</div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${aqiTheme.badge}`}>
                {aqiTheme.label}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-3">
              <Flame size={14} className="text-amber-500" />
              Dominant Driver: <strong className="text-slate-800">{station.dominant}</strong>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${aqiTheme.bg}`}></div>
          </div>

          {/* Sub-Index Critical Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Quality & Sub-Index</p>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {station.pollutants.find(p => p.name === station.dominant)?.subIndex || station.aqi}
              <span className="text-xs font-normal text-slate-400 ml-1.5">Max Sub-Index</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1.5">
              <ShieldCheck size={14} /> 8 of 8 Pollutant Analyzers Transmitting
            </p>
          </div>

          {/* Power & Gateway Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gateway & Telemetry</p>
            <div className="mt-2 text-sm font-semibold text-slate-800">
              Gateway: <span className="font-mono text-blue-600">{station.gatewayId}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Power: <strong className="text-slate-600">{station.power}</strong>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Last Calibrated: <strong className="text-slate-600">{station.lastCalibration}</strong>
            </div>
          </div>

        </div>

        {/* 8 CPCB Pollutants Matrix with Sub-Indices */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Continuous 8-Pollutant Concentrations & Sub-Indices</h2>
              <p className="text-xs text-slate-400 mt-0.5">Parameters measured according to Central Pollution Control Board (CPCB) standards</p>
            </div>
            <span className="text-[11px] font-medium text-slate-400">15-min rolling window</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {station.pollutants.map((p) => {
              const pTheme = getCPCBStatus(p.subIndex);
              const isExceeded = p.value > p.standard;
              return (
                <div key={p.name} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>{p.name}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-white text-slate-400 border border-slate-200">
                      {p.flag}
                    </span>
                  </div>

                  <div className="my-2">
                    <div className={`text-xl font-extrabold ${isExceeded ? 'text-amber-600' : 'text-slate-900'}`}>
                      {p.value}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.unit}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Sub-Index:</span>
                    <span className={`font-bold px-1 rounded ${pTheme.badge}`}>{p.subIndex}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historical AQI Trend Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Historical AQI Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Time-series observations for {station.name}</p>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {["24 Hours", "7 Days", "30 Days"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    selectedPeriod === period
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aqiData[selectedPeriod]} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 400]} tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }}
                  formatter={(value) => [`${value} AQI`, 'Station AQI']}
                />
                <ReferenceLine y={100} stroke="#92D050" strokeDasharray="3 3" label={{ value: 'Satisfactory (100)', fill: '#70a83b', fontSize: 10 }} />
                <ReferenceLine y={200} stroke="#EAB308" strokeDasharray="3 3" label={{ value: 'Moderate (200)', fill: '#CA8A04', fontSize: 10 }} />
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
        </div>

        {/* Meteorological Strip */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <h2 className="text-base font-bold text-slate-900 mb-1">Meteorological Dispersion Context</h2>
          <p className="text-xs text-slate-400 mb-4">Atmospheric conditions impacting localized air pollutant movement</p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <Thermometer className="text-orange-500" size={18} />
              <p className="text-xs text-slate-400 mt-2 font-medium">Temperature</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{station.temperature}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <Droplets className="text-blue-500" size={18} />
              <p className="text-xs text-slate-400 mt-2 font-medium">Relative Humidity</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{station.humidity}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <Wind className="text-emerald-600" size={18} />
              <p className="text-xs text-slate-400 mt-2 font-medium">Wind Speed</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{station.windSpeed}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <Wind className="text-sky-600" size={18} />
              <p className="text-xs text-slate-400 mt-2 font-medium">Wind Direction</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{station.windDirection}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <Gauge className="text-purple-500" size={18} />
              <p className="text-xs text-slate-400 mt-2 font-medium">Atmospheric Pressure</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{station.pressure}</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}