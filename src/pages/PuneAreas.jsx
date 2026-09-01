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
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PuneMap from "../components/PuneMap";
import API from "../api/apiClient"; // Axios client created earlier

// Fallback initial stations if backend is booting or empty
const FALLBACK_STATIONS = [
  {
    id: "PMC-001",
    numericId: "1",
    name: "Kothrud Monitoring Station",
    ward: "Kothrud (Ward 10)",
    zone: "West Zone",
    aqi: 118,
    category: "Moderate",
    dominant: "PM2.5",
    pm25: 58,
    pm10: 96,
    status: "Online",
    updated: "Just now",
  },
  {
    id: "PMC-002",
    numericId: "2",
    name: "Hinjewadi Monitoring Station",
    ward: "Hinjewadi (Ward 25)",
    zone: "North-West Zone",
    aqi: 92,
    category: "Satisfactory",
    dominant: "PM10",
    pm25: 42,
    pm10: 78,
    status: "Online",
    updated: "2 min ago",
  },
  {
    id: "PMC-003",
    numericId: "3",
    name: "Hadapsar Monitoring Station",
    ward: "Hadapsar (Ward 15)",
    zone: "East Zone",
    aqi: 156,
    category: "Moderate",
    dominant: "PM2.5",
    pm25: 72,
    pm10: 118,
    status: "Online",
    updated: "1 min ago",
  },
  {
    id: "PMC-004",
    numericId: "4",
    name: "Kharadi Monitoring Station",
    ward: "Kharadi (Ward 17)",
    zone: "East Zone",
    aqi: 134,
    category: "Moderate",
    dominant: "NO₂",
    pm25: 64,
    pm10: 105,
    status: "Online",
    updated: "3 min ago",
  },
  {
    id: "PMC-005",
    numericId: "5",
    name: "Baner Monitoring Station",
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
      return "bg-[#00B050]/15 text-[#00B050] border border-[#00B050]/30";
    case "Satisfactory":
      return "bg-[#92D050]/20 text-[#4c7526] border border-[#92D050]/30";
    case "Moderate":
      return "bg-[#FEF08A] text-[#854D0E] border border-amber-300";
    case "Poor":
      return "bg-[#FF9900]/15 text-[#D97706] border border-[#FF9900]/30";
    case "Very Poor":
      return "bg-[#FF0000]/15 text-[#DC2626] border border-[#FF0000]/30";
    case "Severe":
      return "bg-[#C00000]/15 text-[#991B1B] border border-[#C00000]/30";
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

  // Fetch live stations from Backend API
  const loadStationsFromAPI = async () => {
    setLoading(true);
    try {
      const response = await API.get("/stations");
      if (response.data && Array.isArray(response.data)) {
        setStations(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setStations(response.data.data);
      }
    } catch (err) {
      console.warn("Backend /api/stations not responding, using local fallback state.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStationsFromAPI();
  }, []);

  // Filter logic
  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      const matchesSearch =
        st.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.ward?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = zoneFilter === "All" || st.zone === zoneFilter;
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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Pune Municipal Stations & Ward Overview
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Live continuous ambient air quality monitoring (CAAQM) station records across municipal wards.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadStationsFromAPI}
              disabled={loading}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : "text-slate-500"} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-sm text-xs transition"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stations</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{stations.length}</p>
                <p className="text-xs text-slate-400 mt-1">Monitored across Pune</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Transmitting</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-2">{onlineStations}</p>
                <p className="text-xs text-emerald-700/80 font-medium mt-1">Operational & sending valid data</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wifi size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attention Required</p>
                <p className="text-3xl font-extrabold text-rose-600 mt-2">{attentionRequired}</p>
                <p className="text-xs text-rose-700/80 font-medium mt-1">Offline or Poor/Severe AQI threshold</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Activity size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search station, ward, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Filter size={14} /> Filters:
            </div>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="All">All Zones</option>
              <option value="West Zone">West Zone</option>
              <option value="East Zone">East Zone</option>
              <option value="North-West Zone">North-West Zone</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Monitoring Stations Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered CAAQM Stations</h2>
              <p className="text-xs text-slate-400 mt-0.5">Showing {filteredStations.length} of {stations.length} locations</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Station Details</th>
                  <th className="px-6 py-4">Ward & Zone</th>
                  <th className="px-6 py-4">CPCB AQI</th>
                  <th className="px-6 py-4">Dominant</th>
                  <th className="px-6 py-4">PM2.5 / PM10</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Ping</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStations.map((station) => {
                  const targetId = station.numericId || station.id.replace("PMC-00", "").replace("PMC-0", "").replace("PMC-", "");
                  return (
                    <tr
                      key={station.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => navigate(`/station/${targetId}`)}
                    >
                      {/* Station Name & ID */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{station.name}</p>
                          <p className="text-xs font-mono text-slate-400 mt-0.5">{station.id}</p>
                        </div>
                      </td>

                      {/* Ward & Zone */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700 text-xs">{station.ward}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{station.zone}</p>
                      </td>

                      {/* AQI & Category Badge */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold font-mono text-slate-900 text-base">{station.aqi}</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getCategoryStyle(station.category)}`}>
                            {station.category}
                          </span>
                        </div>
                      </td>

                      {/* Dominant Pollutant */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          <Flame size={12} className="text-amber-500" />
                          {station.dominant}
                        </span>
                      </td>

                      {/* PM2.5 and PM10 */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-700">
                          PM2.5: <strong className="text-slate-900">{station.pm25}</strong> µg/m³
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          PM10: <strong className="text-slate-600">{station.pm10}</strong> µg/m³
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {station.status === "Online" ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                            <WifiOff size={14} />
                            Offline
                          </div>
                        )}
                      </td>

                      {/* Updated */}
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                        {station.updated}
                      </td>

                      {/* Action Arrow */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/station/${targetId}`);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* GIS Map Component */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Municipal GIS Station Coverage</h3>
            <p className="text-xs text-slate-400 mt-0.5">Geospatial location distribution of monitoring points across Pune wards</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <PuneMap />
          </div>
        </div>

      </main>
    </div>
  );
}