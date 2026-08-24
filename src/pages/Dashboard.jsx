// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Activity, Radio, AlertTriangle, Bell, Database, ShieldCheck, 
  Wind, Droplets, Thermometer, Compass, ChevronRight, CheckCircle, RotateCcw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, ReferenceLine 
} from 'recharts';
import { getCPCBStatus } from '../utils/aqiUtils';

// Area specific database mapping
const AREA_DATA = {
  "Katraj": {
    name: "Katraj Ward Monitoring",
    wardInfo: "Ward 42 • South Zone (Station: PMC-006)",
    aqi: 125,
    dominant: "PM10",
    activeStations: "1/1",
    activeText: "1 Online • 0 Offline",
    criticalWards: "0",
    activeAlerts: "1",
    dataAvailability: "99.1%",
    sensorHealth: "8",
    sensorBreakdown: "8 Healthy • 0 Warn",
    pollutants: [
      { key: 'pm25', name: 'PM2.5', value: 48, unit: 'µg/m³', standard: 60 },
      { key: 'pm10', name: 'PM10', value: 125, unit: 'µg/m³', standard: 100 },
      { key: 'no2', name: 'NO₂', value: 36, unit: 'µg/m³', standard: 80 },
      { key: 'so2', name: 'SO₂', value: 14, unit: 'µg/m³', standard: 80 },
      { key: 'co', name: 'CO', value: 0.9, unit: 'mg/m³', standard: 2 },
      { key: 'o3', name: 'O₃', value: 46, unit: 'µg/m³', standard: 100 },
      { key: 'nh3', name: 'NH₃', value: 19, unit: 'µg/m³', standard: 400 },
      { key: 'pb', name: 'Pb', value: 0.3, unit: 'µg/m³', standard: 1.0 },
    ],
    weather: { temp: "27.8 °C", humidity: "65 %", wind: "3.2 m/s", pressure: "1009 hPa" },
    trends: [
      { time: '00:00', val: 95 }, { time: '03:00', val: 88 },
      { time: '06:00', val: 110 }, { time: '09:00', val: 135 },
      { time: '12:00', val: 125 }, { time: '15:00', val: 115 },
      { time: '18:00', val: 130 }, { time: '21:00', val: 125 }
    ]
  },
  "Baner": {
    name: "Baner Ward Monitoring",
    wardInfo: "Ward 8 • West Zone (Station: PMC-005)",
    aqi: 214,
    dominant: "PM2.5",
    activeStations: "0/1",
    activeText: "0 Online • 1 Offline",
    criticalWards: "1",
    activeAlerts: "2",
    dataAvailability: "88.4%",
    sensorHealth: "8",
    sensorBreakdown: "6 Healthy • 1 Warn • 1 Fail",
    pollutants: [
      { key: 'pm25', name: 'PM2.5', value: 91, unit: 'µg/m³', standard: 60 },
      { key: 'pm10', name: 'PM10', value: 142, unit: 'µg/m³', standard: 100 },
      { key: 'no2', name: 'NO₂', value: 61, unit: 'µg/m³', standard: 80 },
      { key: 'so2', name: 'SO₂', value: 25, unit: 'µg/m³', standard: 80 },
      { key: 'co', name: 'CO', value: 1.8, unit: 'mg/m³', standard: 2 },
      { key: 'o3', name: 'O₃', value: 63, unit: 'µg/m³', standard: 100 },
      { key: 'nh3', name: 'NH₃', value: 29, unit: 'µg/m³', standard: 400 },
      { key: 'pb', name: 'Pb', value: 0.7, unit: 'µg/m³', standard: 1.0 },
    ],
    weather: { temp: "23.0 °C", humidity: "72 %", wind: "1.9 m/s", pressure: "1005 hPa" },
    trends: [
      { time: '00:00', val: 180 }, { time: '03:00', val: 195 },
      { time: '06:00', val: 220 }, { time: '09:00', val: 240 },
      { time: '12:00', val: 214 }, { time: '15:00', val: 205 },
      { time: '18:00', val: 230 }, { time: '21:00', val: 214 }
    ]
  },
  "Hadapsar": {
    name: "Hadapsar Ward Monitoring",
    wardInfo: "Ward 15 • East Zone (Station: PMC-003)",
    aqi: 156,
    dominant: "PM2.5",
    activeStations: "1/1",
    activeText: "1 Online • 0 Offline",
    criticalWards: "0",
    activeAlerts: "1",
    dataAvailability: "97.8%",
    sensorHealth: "8",
    sensorBreakdown: "8 Healthy • 0 Warn",
    pollutants: [
      { key: 'pm25', name: 'PM2.5', value: 72, unit: 'µg/m³', standard: 60 },
      { key: 'pm10', name: 'PM10', value: 118, unit: 'µg/m³', standard: 100 },
      { key: 'no2', name: 'NO₂', value: 49, unit: 'µg/m³', standard: 80 },
      { key: 'so2', name: 'SO₂', value: 21, unit: 'µg/m³', standard: 80 },
      { key: 'co', name: 'CO', value: 1.4, unit: 'mg/m³', standard: 2 },
      { key: 'o3', name: 'O₃', value: 57, unit: 'µg/m³', standard: 100 },
      { key: 'nh3', name: 'NH₃', value: 24, unit: 'µg/m³', standard: 400 },
      { key: 'pb', name: 'Pb', value: 0.5, unit: 'µg/m³', standard: 1.0 },
    ],
    weather: { temp: "25.0 °C", humidity: "70 %", wind: "2.4 m/s", pressure: "1006 hPa" },
    trends: [
      { time: '00:00', val: 140 }, { time: '03:00', val: 145 },
      { time: '06:00', val: 165 }, { time: '09:00', val: 175 },
      { time: '12:00', val: 156 }, { time: '15:00', val: 150 },
      { time: '18:00', val: 168 }, { time: '21:00', val: 156 }
    ]
  },
  "Kothrud": {
    name: "Kothrud Ward Monitoring",
    wardInfo: "Ward 10 • West Zone (Station: PMC-001)",
    aqi: 118,
    dominant: "PM2.5",
    activeStations: "1/1",
    activeText: "1 Online • 0 Offline",
    criticalWards: "0",
    activeAlerts: "0",
    dataAvailability: "98.6%",
    sensorHealth: "8",
    sensorBreakdown: "8 Healthy • 0 Warn",
    pollutants: [
      { key: 'pm25', name: 'PM2.5', value: 58, unit: 'µg/m³', standard: 60 },
      { key: 'pm10', name: 'PM10', value: 96, unit: 'µg/m³', standard: 100 },
      { key: 'no2', name: 'NO₂', value: 42, unit: 'µg/m³', standard: 80 },
      { key: 'so2', name: 'SO₂', value: 18, unit: 'µg/m³', standard: 80 },
      { key: 'co', name: 'CO', value: 1.2, unit: 'mg/m³', standard: 2 },
      { key: 'o3', name: 'O₃', value: 54, unit: 'µg/m³', standard: 100 },
      { key: 'nh3', name: 'NH₃', value: 21, unit: 'µg/m³', standard: 400 },
      { key: 'pb', name: 'Pb', value: 0.4, unit: 'µg/m³', standard: 1.0 },
    ],
    weather: { temp: "23.0 °C", humidity: "68 %", wind: "2.8 m/s", pressure: "1008 hPa" },
    trends: [
      { time: '00:00', val: 105 }, { time: '03:00', val: 110 },
      { time: '06:00', val: 125 }, { time: '09:00', val: 130 },
      { time: '12:00', val: 118 }, { time: '15:00', val: 112 },
      { time: '18:00', val: 126 }, { time: '21:00', val: 118 }
    ]
  },
  "Hinjewadi": {
    name: "Hinjewadi Ward Monitoring",
    wardInfo: "Ward 25 • North-West Zone (Station: PMC-002)",
    aqi: 92,
    dominant: "PM10",
    activeStations: "1/1",
    activeText: "1 Online • 0 Offline",
    criticalWards: "0",
    activeAlerts: "0",
    dataAvailability: "99.4%",
    sensorHealth: "8",
    sensorBreakdown: "8 Healthy • 0 Warn",
    pollutants: [
      { key: 'pm25', name: 'PM2.5', value: 42, unit: 'µg/m³', standard: 60 },
      { key: 'pm10', name: 'PM10', value: 78, unit: 'µg/m³', standard: 100 },
      { key: 'no2', name: 'NO₂', value: 35, unit: 'µg/m³', standard: 80 },
      { key: 'so2', name: 'SO₂', value: 14, unit: 'µg/m³', standard: 80 },
      { key: 'co', name: 'CO', value: 0.9, unit: 'mg/m³', standard: 2 },
      { key: 'o3', name: 'O₃', value: 48, unit: 'µg/m³', standard: 100 },
      { key: 'nh3', name: 'NH₃', value: 18, unit: 'µg/m³', standard: 400 },
      { key: 'pb', name: 'Pb', value: 0.3, unit: 'µg/m³', standard: 1.0 },
    ],
    weather: { temp: "24.0 °C", humidity: "64 %", wind: "3.1 m/s", pressure: "1007 hPa" },
    trends: [
      { time: '00:00', val: 80 }, { time: '03:00', val: 82 },
      { time: '06:00', val: 95 }, { time: '09:00', val: 105 },
      { time: '12:00', val: 92 }, { time: '15:00', val: 88 },
      { time: '18:00', val: 98 }, { time: '21:00', val: 92 }
    ]
  },
  "Kharadi": {
    name: "Kharadi Ward Monitoring",
    wardInfo: "Ward 17 • East Zone (Station: PMC-004)",
    aqi: 134,
    dominant: "NO₂",
    activeStations: "1/1",
    activeText: "1 Online • 0 Offline",
    criticalWards: "0",
    activeAlerts: "1",
    dataAvailability: "96.5%",
    sensorHealth: "8",
    sensorBreakdown: "8 Healthy • 0 Warn",
    pollutants: [
      { key: 'pm25', name: 'PM2.5', value: 64, unit: 'µg/m³', standard: 60 },
      { key: 'pm10', name: 'PM10', value: 105, unit: 'µg/m³', standard: 100 },
      { key: 'no2', name: 'NO₂', value: 44, unit: 'µg/m³', standard: 80 },
      { key: 'so2', name: 'SO₂', value: 19, unit: 'µg/m³', standard: 80 },
      { key: 'co', name: 'CO', value: 1.3, unit: 'mg/m³', standard: 2 },
      { key: 'o3', name: 'O₃', value: 52, unit: 'µg/m³', standard: 100 },
      { key: 'nh3', name: 'NH₃', value: 22, unit: 'µg/m³', standard: 400 },
      { key: 'pb', name: 'Pb', value: 0.4, unit: 'µg/m³', standard: 1.0 },
    ],
    weather: { temp: "25.0 °C", humidity: "66 %", wind: "2.7 m/s", pressure: "1007 hPa" },
    trends: [
      { time: '00:00', val: 115 }, { time: '03:00', val: 120 },
      { time: '06:00', val: 140 }, { time: '09:00', val: 150 },
      { time: '12:00', val: 134 }, { time: '15:00', val: 128 },
      { time: '18:00', val: 145 }, { time: '21:00', val: 134 }
    ]
  }
};

const CITY_DEFAULT = {
  name: "Pune PMC Air Quality Command Center",
  wardInfo: "CPCB Guideline Framework Monitoring • Central Ward Network",
  aqi: 142,
  dominant: "PM2.5",
  activeStations: "22/24",
  activeText: "22 Online • 2 Offline",
  criticalWards: "5",
  activeAlerts: "3",
  dataAvailability: "96.4%",
  sensorHealth: "24",
  sensorBreakdown: "18 Healthy • 3 Warn • 1 Fail",
  pollutants: [
    { key: 'pm25', name: 'PM2.5', value: 68, unit: 'µg/m³', standard: 60 },
    { key: 'pm10', name: 'PM10', value: 112, unit: 'µg/m³', standard: 100 },
    { key: 'no2', name: 'NO₂', value: 42, unit: 'µg/m³', standard: 80 },
    { key: 'so2', name: 'SO₂', value: 18, unit: 'µg/m³', standard: 80 },
    { key: 'co', name: 'CO', value: 1.2, unit: 'mg/m³', standard: 2 },
    { key: 'o3', name: 'O₃', value: 54, unit: 'µg/m³', standard: 100 },
    { key: 'nh3', name: 'NH₃', value: 21, unit: 'µg/m³', standard: 400 },
    { key: 'pb', name: 'Pb', value: 0.4, unit: 'µg/m³', standard: 1.0 },
  ],
  weather: { temp: "28.4 °C", humidity: "68 %", wind: "3.8 m/s", pressure: "1008 hPa" },
  trends: [
    { time: '00:00', val: 110 }, { time: '03:00', val: 118 },
    { time: '06:00', val: 155 }, { time: '09:00', val: 172 },
    { time: '12:00', val: 142 }, { time: '15:00', val: 130 },
    { time: '18:00', val: 160 }, { time: '21:00', val: 142 }
  ]
};

const MOCK_WARDS = [
  { id: 'W08', name: 'Baner', ward: 'Ward 8', aqi: 214 },
  { id: 'W15', name: 'Hadapsar', ward: 'Ward 15', aqi: 156 },
  { id: 'W17', name: 'Kharadi', ward: 'Ward 17', aqi: 134 },
  { id: 'W42', name: 'Katraj', ward: 'Ward 42', aqi: 125 },
  { id: 'W10', name: 'Kothrud', ward: 'Ward 10', aqi: 118 },
  { id: 'W25', name: 'Hinjewadi', ward: 'Ward 25', aqi: 92 },
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState('24h');

  // Read search query parameter from URL
  const selectedAreaParam = searchParams.get('area');
  const currentData = (selectedAreaParam && AREA_DATA[selectedAreaParam]) ? AREA_DATA[selectedAreaParam] : CITY_DEFAULT;
  const aqiTheme = getCPCBStatus(currentData.aqi);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* 1. Header & Location Filter Indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{currentData.name}</h1>
            {selectedAreaParam && (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 font-semibold transition"
              >
                <RotateCcw size={12} /> Reset to City
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">{currentData.wardInfo}</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Stream: Updated 2 mins ago
        </div>
      </div>

      {/* 2. Top Metric KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-medium">
              {selectedAreaParam ? `${selectedAreaParam} AQI` : "City AQI"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${aqiTheme.badge}`}>
              {aqiTheme.label}
            </span>
          </div>
          <div className="text-3xl font-extrabold mt-2 text-slate-900">{currentData.aqi}</div>
          <div className="text-[11px] text-slate-400 mt-1">Dominant: <strong className="text-slate-600">{currentData.dominant}</strong></div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${aqiTheme.bg}`}></div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Active Stations</span>
          <div className="text-3xl font-extrabold mt-2 text-slate-900">{currentData.activeStations}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">{currentData.activeText}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Critical Wards</span>
          <div className="text-3xl font-extrabold mt-2 text-rose-600">{currentData.criticalWards}</div>
          <div className="text-[11px] text-slate-400 mt-1">Require attention</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Active Alerts</span>
          <div className="text-3xl font-extrabold mt-2 text-amber-600">{currentData.activeAlerts}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active notifications</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Data Availability</span>
          <div className="text-3xl font-extrabold mt-2 text-slate-900">{currentData.dataAvailability}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">CPCB Compliance passed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Sensor Health</span>
          <div className="text-3xl font-extrabold mt-2 text-slate-900">{currentData.sensorHealth}</div>
          <div className="text-[11px] text-slate-400 mt-1">{currentData.sensorBreakdown}</div>
        </div>
      </div>

      {/* 3. Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Spatial Heatmap Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Station & Ward Spatial Heatmap</h3>
                <p className="text-xs text-slate-400">
                  {selectedAreaParam ? `Focused on ${selectedAreaParam} Monitoring Node` : "Live geo-tagged monitoring nodes across Pune limits"}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600">GIS Layer Active</span>
            </div>
            <div className="h-72 w-full bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
              <div className="z-10 text-center">
                <p className="text-xs text-slate-600 font-semibold">
                  {selectedAreaParam ? `📍 Target Location: ${selectedAreaParam} Ward` : "Integrated Leaflet/Mapbox Instance"}
                </p>
                <div className="flex gap-2 justify-center mt-2">
                  <span className="px-2 py-1 bg-white shadow-sm border border-slate-200 rounded text-[11px] font-semibold text-emerald-600">● 18 Good/Mod</span>
                  <span className="px-2 py-1 bg-white shadow-sm border border-slate-200 rounded text-[11px] font-semibold text-amber-600">● 4 Poor</span>
                  <span className="px-2 py-1 bg-white shadow-sm border border-slate-200 rounded text-[11px] font-semibold text-rose-600">● 2 Offline</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Trend Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{selectedAreaParam || "City"} AQI Trend</h3>
                <p className="text-xs text-slate-400">Rolling hourly concentration vs CPCB 24h Standard Limit</p>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-2.5 py-1 text-xs rounded font-medium ${selectedRange === range ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData.trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} domain={[0, 260]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }}
                    formatter={(value) => [`${value} AQI`, 'Index Score']}
                  />
                  <ReferenceLine y={100} stroke="#92D050" strokeDasharray="4 4" label={{ value: 'Satisfactory (100)', position: 'insideTopRight', fill: '#70a83b', fontSize: 10 }} />
                  <Line type="monotone" dataKey="val" stroke={aqiTheme.hex} strokeWidth={2.5} dot={{ r: 3, fill: aqiTheme.hex }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right 5 Columns */}
        <div className="lg:col-span-5 space-y-6">

          {/* Ward Comparative Ranking */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-1">Ward-Wise Comparative Ranking</h3>
            <p className="text-xs text-slate-400 mb-4">Highest to lowest AQI impact areas</p>
            
            <div className="space-y-3.5">
              {MOCK_WARDS.map((item, idx) => {
                const itemTheme = getCPCBStatus(item.aqi);
                const isSelected = selectedAreaParam === item.name;
                return (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(`/dashboard?area=${item.name}`)}
                    className={`text-xs p-1.5 rounded-lg transition cursor-pointer ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-400">#{idx + 1}</span>
                        <span className={`font-semibold ${isSelected ? 'text-blue-700 font-bold' : 'text-slate-800'}`}>
                          {item.name}
                        </span>
                        <span className="text-slate-400 text-[10px]">({item.ward})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{item.aqi}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${itemTheme.badge}`}>
                          {itemTheme.label}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${itemTheme.bg}`}
                        style={{ width: `${Math.min(100, (item.aqi / 400) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Quality */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Data Quality & Telemetry Audit</h3>
            
            <div className="grid grid-cols-4 gap-2 mb-4 text-center">
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                <div className="text-xs font-bold text-emerald-700">{currentData.dataAvailability}</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Valid</div>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                <div className="text-xs font-bold text-amber-700">1.8%</div>
                <div className="text-[10px] text-amber-600 mt-0.5">Suspect</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-700">1.2%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Missing</div>
              </div>
              <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                <div className="text-xs font-bold text-rose-700">0.6%</div>
                <div className="text-[10px] text-rose-600 mt-0.5">Invalid</div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-500">Telemetry Status:</span>
              <span className="font-medium text-emerald-600">4G LTE Transmission Live</span>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Complete 8-Pollutant Strip */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {selectedAreaParam ? `${selectedAreaParam} 8-Pollutant Matrix` : "Real-time CPCB 8-Pollutant Matrix"}
            </h3>
            <p className="text-xs text-slate-400">Current ambient concentrations vs 24h standard guidelines</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">15-min rolling window</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {currentData.pollutants.map((pol) => {
            const isExceeded = pol.value > pol.standard;
            return (
              <div key={pol.key} className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-slate-700">{pol.name}</div>
                <div className={`text-lg font-black mt-1 ${isExceeded ? 'text-amber-600' : 'text-slate-800'}`}>
                  {pol.value}
                </div>
                <div className="text-[10px] text-slate-400">{pol.unit}</div>
                <div className={`mt-1.5 text-[9px] font-semibold px-1 py-0.5 rounded ${isExceeded ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  Std: {pol.standard}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Meteorological Parameter Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Thermometer size={18} /></div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Temperature</div>
            <div className="text-base font-bold text-slate-900">{currentData.weather.temp}</div>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg"><Droplets size={18} /></div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Humidity</div>
            <div className="text-base font-bold text-slate-900">{currentData.weather.humidity}</div>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg"><Wind size={18} /></div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Wind Speed</div>
            <div className="text-base font-bold text-slate-900">{currentData.weather.wind}</div>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><Compass size={18} /></div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Pressure</div>
            <div className="text-base font-bold text-slate-900">{currentData.weather.pressure}</div>
          </div>
        </div>
      </div>

    </div>
  );
}