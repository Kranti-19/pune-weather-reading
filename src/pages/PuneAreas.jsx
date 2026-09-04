import React, { useState, useEffect, useMemo } from "react";
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
  Layers,
  ShieldCheck,
  Building2,
  Navigation
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PuneMap from "../components/PuneMap";
import API from "../api/apiClient";

const FALLBACK_STATIONS = [
  {
    id: "PMC-001",
    numericId: "1",
    name: "Kothrud Monitoring Station",
    ward: "Kothrud (Ward 10)",
    zone: "West Zone",
    aqi: 54,
    category: "Satisfactory",
    dominant: "PM10",
    pm25: 28,
    pm10: 64,
    status: "Online",
    updated: "Just now",
  },
  {
    id: "PMC-002",
    numericId: "2",
    name: "Hinjewadi Monitoring Station",
    ward: "Hinjewadi (Ward 25)",
    zone: "North-West Zone",
    aqi: 82,
    category: "Satisfactory",
    dominant: "NO₂",
    pm25: 44,
    pm10: 88,
    status: "Online",
    updated: "2 min ago",
  },
  {
    id: "PMC-003",
    numericId: "3",
    name: "Hadapsar Monitoring Station",
    ward: "Hadapsar (Ward 15)",
    zone: "East Zone",
    aqi: 134,
    category: "Moderate",
    dominant: "PM2.5",
    pm25: 84,
    pm10: 142,
    status: "Online",
    updated: "1 min ago",
  },
  {
    id: "PMC-004",
    numericId: "4",
    name: "Shivajinagar Monitoring Station",
    ward: "Shivajinagar (Ward 7)",
    zone: "Central Zone",
    aqi: 68,
    category: "Satisfactory",
    dominant: "PM2.5",
    pm25: 38,
    pm10: 78,
    status: "Online",
    updated: "Just now",
  },
  {
    id: "PMC-005",
    numericId: "5",
    name: "Katraj Monitoring Station",
    ward: "Katraj (Ward 21)",
    zone: "South Zone",
    aqi: 39,
    category: "Good",
    dominant: "O₃",
    pm25: 18,
    pm10: 42,
    status: "Online",
    updated: "2 min ago",
  },
  {
    id: "PMC-006",
    numericId: "6",
    name: "Baner Highway Node",
    ward: "Baner (Ward 8)",
    zone: "West Zone",
    aqi: 214,
    category: "Poor",
    dominant: "PM2.5",
    pm25: 91,
    pm10: 142,
    status: "Offline",
    updated: "18 min ago",
  },
];

const getCategoryStyle = (category) => {
  switch (category) {
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
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export default function PuneAreas() {
  const navigate = useNavigate();
  const [stations, setStations] = useState(FALLBACK_STATIONS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [zoneFilter, setZoneFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadStationsFromAPI = async () => {
    setLoading(true);
    try {
      const response = await API.get("/stations");
      const list = response.data?.stations || response.data?.data || (Array.isArray(response.data) ? response.data : null);
      if (list && list.length > 0) {
        setStations(list);
      }
    } catch (err) {
      console.warn("Backend /api/stations unavailable, utilizing cached municipal roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStationsFromAPI();
  }, []);

  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      const matchesSearch =
        st.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.ward?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = zoneFilter === "All" || st.zone?.includes(zoneFilter);
      const matchesStatus = statusFilter === "All" || st.status === statusFilter;
      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [stations, searchTerm, zoneFilter, statusFilter]);

  const onlineStations = stations.filter((s) => s.status === "Online").length;
  const attentionRequired = stations.filter((s) => s.status === "Offline" || s.aqi > 200).length;

  const handleExportCSV = () => {
    const headers = "Station ID,Name,Ward,Zone,AQI,Category,Dominant Pollutant,PM2.5,PM10,Status,Last Updated\n";
    const rows = filteredStations
      .map((s) => `"${s.id}","${s.name}","${s.ward}","${s.zone}",${s.aqi},"${s.category}","${s.dominant}",${s.pm25},${s.pm10},"${s.status}","${s.updated}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `PMC_Air_Quality_Stations_${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header with Breadcrumb & Export Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Geospatial Surveillance</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">Pune Municipal Corporation (PMC)</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pune Ward Monitoring Stations
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {onlineStations} of {stations.length} Online
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous Ambient Air Quality Monitoring (CAAQM) stations and spatial ward distribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadStationsFromAPI}
            disabled={loading}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-blue-600" : "text-slate-400"} />
            <span>Poll Sensor Nodes</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition"
          >
            <Download size={14} />
            <span>Export Roster (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
        
        {/* Card 1: Total Registered Stations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Monitored Nodes</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stations.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Covering 5 municipal zones</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner border border-blue-100">
            <MapPin size={22} />
          </div>
        </div>

        {/* Card 2: Active Transmitting */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Telemetry Active</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{onlineStations}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Transmitting 60s packets</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner border border-emerald-100">
            <Wifi size={22} />
          </div>
        </div>

        {/* Card 3: Attention Required */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Attention Required</p>
            <p className="text-3xl font-black text-rose-600 mt-1">{attentionRequired}</p>
            <p className="text-xs text-rose-600 font-medium mt-1">Exceeding 200 AQI or offline</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-inner border border-rose-100">
            <Activity size={22} />
          </div>
        </div>

      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search station, ward, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
            <Filter size={13} />
            <span>Filters:</span>
          </div>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Municipal Zones</option>
            <option value="West">West Zone</option>
            <option value="East">East Zone</option>
            <option value="North-West">North-West Zone</option>
            <option value="Central">Central Zone</option>
            <option value="South">South Zone</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Online">Online Only</option>
            <option value="Offline">Offline Only</option>
          </select>
        </div>
      </div>

      {/* 4. Monitoring Stations Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] mb-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">
                Registered CAAQM Station Registry
              </h2>
              <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                NAAQS Audited
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredStations.length} of {stations.length} active spatial nodes
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Protocol: <strong className="text-slate-800">CPCB Continuous 24h Sampling</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="pb-3 pl-2">Station Details</th>
                <th className="pb-3">Ward & Zone</th>
                <th className="pb-3">CPCB AQI</th>
                <th className="pb-3">Dominant</th>
                <th className="pb-3">PM2.5 / PM10</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Ping</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStations.map((station) => {
                const targetId = station.numericId || station.id.replace(/\D/g, "") || "1";
                return (
                  <tr
                    key={station.id}
                    className="hover:bg-slate-50/80 transition duration-150 cursor-pointer"
                    onClick={() => navigate(`/station/${targetId}`)}
                  >
                    {/* Station Name & ID */}
                    <td className="py-4 pl-2">
                      <div className="font-black text-slate-900 text-sm">{station.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{station.id}</div>
                    </td>

                    {/* Ward & Zone */}
                    <td className="py-4">
                      <div className="font-bold text-slate-800">{station.ward}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{station.zone}</div>
                    </td>

                    {/* AQI & Category Badge */}
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black font-mono text-slate-900 text-base">{station.aqi}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getCategoryStyle(station.category)}`}>
                          {station.category}
                        </span>
                      </div>
                    </td>

                    {/* Dominant Pollutant */}
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl border border-slate-200/60">
                        <Flame size={12} className="text-amber-500" />
                        <span>{station.dominant}</span>
                      </span>
                    </td>

                    {/* PM2.5 and PM10 */}
                    <td className="py-4">
                      <div className="text-xs font-bold text-slate-800">
                        PM2.5: <span className="text-blue-600">{station.pm25}</span> µg/m³
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        PM10: {station.pm10} µg/m³
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      {station.status === "Online" ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Online</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600">
                          <WifiOff size={13} />
                          <span>Offline</span>
                        </div>
                      )}
                    </td>

                    {/* Updated */}
                    <td className="py-4 text-xs text-slate-400 font-mono font-medium">
                      {station.updated}
                    </td>

                    {/* Action Arrow */}
                    <td className="py-4 text-right pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/station/${targetId}`);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. GIS Map Component Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-base">Municipal GIS Station Coverage</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Live Geofence
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Geospatial placement and real-time CPCB air quality heat map across Pune wards
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Navigation size={13} className="text-blue-600" />
            <span>Center: 18.5204° N, 73.8567° E</span>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
          <PuneMap />
        </div>
      </div>

    </div>
  );
}