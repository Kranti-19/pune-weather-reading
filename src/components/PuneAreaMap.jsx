import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink, Navigation } from "lucide-react";

// Fix Leaflet marker icon asset resolution
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Standardized 5 CAAQM Municipal Stations with Code & ID sync
const DEFAULT_STATIONS = [
  {
    id: 1,
    code: "PMC-001",
    name: "Shivajinagar Central",
    area: "Shivajinagar",
    ward: "Ward 7",
    zone: "Central Zone",
    aqi: 68,
    category: "Satisfactory",
    status: "Online",
    pm25: 38.2,
    pm10: 78.4,
    dominant: "PM2.5",
    position: [18.5314, 73.8446],
  },
  {
    id: 2,
    code: "PMC-002",
    name: "Kothrud Depot Basin",
    area: "Kothrud",
    ward: "Ward 10",
    zone: "West Zone",
    aqi: 54,
    category: "Satisfactory",
    status: "Online",
    pm25: 28.1,
    pm10: 52.0,
    dominant: "PM10",
    position: [18.5074, 73.8077],
  },
  {
    id: 3,
    code: "PMC-003",
    name: "Hadapsar Industrial",
    area: "Hadapsar",
    ward: "Ward 15",
    zone: "East Zone",
    aqi: 134,
    category: "Moderate",
    status: "Online",
    pm25: 84.6,
    pm10: 142.0,
    dominant: "PM2.5",
    position: [18.5089, 73.926],
  },
  {
    id: 4,
    code: "PMC-004",
    name: "Katraj Lake Reserve",
    area: "Katraj",
    ward: "Ward 21",
    zone: "South Zone",
    aqi: 39,
    category: "Good",
    status: "Online",
    pm25: 18.4,
    pm10: 42.0,
    dominant: "O3",
    position: [18.4575, 73.8677],
  },
  {
    id: 5,
    code: "PMC-005",
    name: "Hinjewadi Tech Corridor",
    area: "Hinjewadi",
    ward: "Ward 25",
    zone: "North-West Zone",
    aqi: 82,
    category: "Satisfactory",
    status: "Online",
    pm25: 44.0,
    pm10: 86.0,
    dominant: "NO2",
    position: [18.5913, 73.7389],
  },
];

function getAQIColor(category) {
  switch (category) {
    case "Good":
      return "#10b981";
    case "Satisfactory":
      return "#84cc16";
    case "Moderate":
      return "#f59e0b";
    case "Poor":
      return "#ea580c";
    case "Very Poor":
      return "#e11d48";
    case "Severe":
      return "#7f1d1d";
    default:
      return "#64748b";
  }
}

function createMarkerIcon(aqi, category) {
  const color = getAQIColor(category);

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div
        style="
          width: 36px;
          height: 36px;
          background: ${color};
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.22);
          cursor: pointer;
        "
      >
        ${aqi || "AQI"}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function PuneAreaMap({ stations: propStations }) {
  const navigate = useNavigate();

  // Allow custom props or fall back to the synchronized list
  const stationList = propStations && propStations.length > 0
    ? propStations.map((st, idx) => ({
        ...st,
        id: st.id || idx + 1,
        code: st.code || `PMC-00${idx + 1}`,
        position: st.position || [st.latitude, st.longitude],
        category: st.category || st.status || "Satisfactory",
        status: st.health === "Failed" ? "Offline" : "Online"
      }))
    : DEFAULT_STATIONS;

  const handleNavigateToStation = (station) => {
    // Route by station.code (primary) or station.id (fallback)
    const targetParam = station.code || station.id;
    navigate(`/station/${targetParam}`);
  };

  return (
    <div className="bg-white rounded-[22px] p-5 sm:p-6 shadow-sm border border-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 mb-0.5">
            <Navigation size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Spatial Surveillance</span>
          </div>
          <h2 className="text-sm font-black text-slate-900">
            Pune Municipal GIS Spatial Monitoring
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Exact geo-located CAAQM stations reporting live ambient telemetry.
          </p>
        </div>

        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full w-fit">
          {stationList.length} Stations Monitored
        </span>
      </div>

      {/* Leaflet Map Frame */}
      <div className="h-[420px] rounded-xl overflow-hidden border border-slate-200/80 shadow-inner">
        <MapContainer
          center={[18.5204, 73.8567]}
          zoom={11}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {stationList.map((station) => (
            <Marker
              key={station.code || station.id}
              position={station.position}
              icon={createMarkerIcon(station.aqi, station.category)}
            >
              <Popup className="pmc-custom-popup">
                <div className="p-1 min-w-[210px] font-sans">
                  
                  {/* Popup Header */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-[9.5px] font-bold text-blue-600 block leading-tight">
                        {station.code}
                      </span>
                      <h3 className="font-bold text-xs text-slate-900 mt-0.5">
                        {station.name}
                      </h3>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-bold"
                      style={{
                        backgroundColor: `${getAQIColor(station.category)}18`,
                        color: getAQIColor(station.category),
                      }}
                    >
                      {station.category}
                    </span>
                  </div>

                  {/* Ward / Zone / Status Info */}
                  <div className="my-2.5 space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ward & Zone:</span>
                      <span className="font-semibold text-slate-800">{station.ward}, {station.zone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current AQI:</span>
                      <span className="font-mono font-black text-slate-900">{station.aqi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dominant Pollutant:</span>
                      <span className="font-semibold text-slate-800">{station.dominant || "PM2.5"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Telemetry Status:</span>
                      <span
                        className="font-bold"
                        style={{
                          color: station.status === "Online" ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {station.status}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Button */}
                  <button
                    onClick={() => handleNavigateToStation(station)}
                    className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-bold py-2 px-3 rounded-lg shadow-sm transition mt-1"
                  >
                    <span>View Station Diagnostics</span>
                    <ExternalLink size={12} />
                  </button>

                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* CPCB Classification Legend */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-4 pt-3 border-t border-slate-100 text-[9.5px] font-bold text-slate-600">
        {[
          ["Good (0–50)", "#10b981"],
          ["Satisfactory (51–100)", "#84cc16"],
          ["Moderate (101–200)", "#f59e0b"],
          ["Poor (201–300)", "#ea580c"],
          ["Very Poor (301–400)", "#e11d48"],
          ["Severe (401–500)", "#7f1d1d"],
        ].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default PuneAreaMap;