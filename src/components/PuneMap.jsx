import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCPCBStatus } from "../utils/aqiUtils";

const stations = [
  {
    id: "PMC-001",
    numericId: "1",
    name: "Kothrud Monitoring Station",
    ward: "Kothrud (Ward 10)",
    lat: 18.5074,
    lng: 73.8077,
    aqi: 118,
    dominant: "PM2.5",
    status: "Online",
  },
  {
    id: "PMC-002",
    numericId: "2",
    name: "Hinjewadi Monitoring Station",
    ward: "Hinjewadi (Ward 25)",
    lat: 18.5913,
    lng: 73.7389,
    aqi: 92,
    dominant: "PM10",
    status: "Online",
  },
  {
    id: "PMC-003",
    numericId: "3",
    name: "Hadapsar Monitoring Station",
    ward: "Hadapsar (Ward 15)",
    lat: 18.5089,
    lng: 73.926,
    aqi: 156,
    dominant: "PM2.5",
    status: "Online",
  },
  {
    id: "PMC-004",
    numericId: "4",
    name: "Kharadi Monitoring Station",
    ward: "Kharadi (Ward 17)",
    lat: 18.5511,
    lng: 73.9442,
    aqi: 134,
    dominant: "NO₂",
    status: "Online",
  },
  {
    id: "PMC-005",
    numericId: "5",
    name: "Baner Monitoring Station",
    ward: "Baner (Ward 8)",
    lat: 18.559,
    lng: 73.7868,
    aqi: 214,
    dominant: "PM2.5",
    status: "Offline",
  },
];

const createMarkerIcon = (aqi, isOffline) => {
  const statusTheme = getCPCBStatus(aqi);
  const bgColor = isOffline ? "#64748B" : statusTheme.hex;

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: ${bgColor};
        border: 2.5px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${Number(aqi) > 100 && Number(aqi) <= 200 ? '#1e293b' : 'white'};
        font-size: 11px;
        font-weight: 800;
        font-family: monospace;
      ">
        ${aqi}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

export default function PuneMap() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Pune Municipal GIS Spatial Monitoring
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Live geo-located CAAQM nodes with CPCB air quality indexing
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          5 Stations Monitored
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[420px] rounded-xl overflow-hidden border border-slate-200 relative z-0">
        <MapContainer
          center={[18.5304, 73.8567]}
          zoom={11}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {stations.map((station) => {
            const aqiTheme = getCPCBStatus(station.aqi);
            const isOffline = station.status === "Offline";

            return (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={createMarkerIcon(station.aqi, isOffline)}
              >
                <Popup>
                  <div className="p-1 min-w-[200px] text-slate-800 font-sans">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{station.id}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isOffline ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {station.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs">{station.name}</h3>
                    <p className="text-[11px] text-slate-500">{station.ward}</p>

                    <div className="my-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <div>
                        <div className="text-xl font-black text-slate-900 font-mono">{station.aqi}</div>
                        <div className="text-[10px] text-slate-400">Dominant: <strong>{station.dominant}</strong></div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${aqiTheme.badge}`}>
                        {aqiTheme.label}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/station/${station.numericId}`)}
                      className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                    >
                      View Station Diagnostics
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* CPCB Standard Legend Strip */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-500 text-[11px]">CPCB AQI Bands:</span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00B050]" />
            <span className="text-slate-600 text-[11px]">Good (0-50)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#92D050]" />
            <span className="text-slate-600 text-[11px]">Satisfactory (51-100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
            <span className="text-slate-600 text-[11px]">Moderate (101-200)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
            <span className="text-slate-600 text-[11px]">Poor (201-300)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]" />
            <span className="text-slate-600 text-[11px]">Very Poor (301-400)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C00000]" />
            <span className="text-slate-600 text-[11px]">Severe (401-500)</span>
          </div>
        </div>
      </div>

    </div>
  );
}