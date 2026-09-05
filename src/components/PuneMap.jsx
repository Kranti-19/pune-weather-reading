import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCPCBStatus } from "../utils/aqiUtils";

/* =========================================================
   DEFAULT PUNE CENTER
========================================================= */

const PUNE_CENTER = [18.5204, 73.8567];

/* =========================================================
   FIT MAP TO DATABASE STATIONS

   This automatically moves/zooms the map according to
   the actual latitude and longitude received from backend.
========================================================= */

function MapBounds({ stations }) {
  const map = useMap();

  useEffect(() => {
    const validStations = stations.filter(
      (station) =>
        Number.isFinite(Number(station?.latitude)) &&
        Number.isFinite(Number(station?.longitude))
    );

    if (validStations.length === 0) {
      map.setView(PUNE_CENTER, 11);
      return;
    }

    const bounds = L.latLngBounds(
      validStations.map((station) => [
        Number(station.latitude),
        Number(station.longitude),
      ])
    );

    if (validStations.length === 1) {
      map.setView(
        [
          Number(validStations[0].latitude),
          Number(validStations[0].longitude),
        ],
        14
      );
    } else {
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 14,
      });
    }
  }, [stations, map]);

  return null;
}

/* =========================================================
   MARKER ICON

   AQI color comes from CPCB status.
   Offline stations are shown in grey.
========================================================= */

const createMarkerIcon = (aqi, isOffline) => {
  const numericAqi = Number(aqi) || 0;

  const statusTheme = getCPCBStatus(numericAqi);

  const bgColor = isOffline
    ? "#64748B"
    : statusTheme?.hex || "#64748B";

  /*
   * Dark text for Moderate AQI.
   * White text for other categories.
   */

  const textColor =
    numericAqi > 100 &&
    numericAqi <= 200
      ? "#1e293b"
      : "white";

  return L.divIcon({
    className: "custom-leaflet-marker",

    html: `
      <div
        style="
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: ${bgColor};
          border: 2.5px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${textColor};
          font-size: 11px;
          font-weight: 800;
          font-family: monospace;
          box-sizing: border-box;
        "
      >
        ${numericAqi}
      </div>
    `,

    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

/* =========================================================
   SAFE NUMBER FORMAT
========================================================= */

const formatValue = (value, decimals = 2) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "N/A";
  }

  return number.toFixed(decimals);
};

/* =========================================================
   MAIN COMPONENT

   IMPORTANT:
   PuneAreas.jsx should call:

   <PuneMap stations={stations} />

   The stations prop contains data from your database.
========================================================= */

export default function PuneMap({
  stations = [],
}) {
  const navigate = useNavigate();

  /* =======================================================
     VALID DATABASE STATIONS

     Only stations having valid latitude/longitude are
     displayed on the map.
  ======================================================= */

  const validStations = stations.filter(
    (station) => {
      const latitude = Number(
        station?.latitude
      );

      const longitude = Number(
        station?.longitude
      );

      return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      );
    }
  );

  /* =======================================================
     STATION COUNT
  ======================================================= */

  const stationCount = validStations.length;

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleStationNavigation = (
    station
  ) => {
    const stationId =
      station?.numericId ||
      station?.station_id ||
      station?.stationId ||
      (station?.id
        ? String(
            station.id
          ).replace(/\D/g, "")
        : "");

    if (!stationId) {
      console.error(
        "Station ID is missing:",
        station
      );

      return;
    }

    navigate(
      `/station/${stationId}`
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">

        <div>

          <h2 className="text-base font-bold text-slate-900">
            Pune Municipal GIS Spatial Monitoring
          </h2>

          <p className="text-xs text-slate-400 mt-0.5">
            Exact geo-located CAAQM stations from the
            municipal database
          </p>

        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">

          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>

          {stationCount}{" "}
          {stationCount === 1
            ? "Station"
            : "Stations"}{" "}
          Monitored

        </div>

      </div>

      {/* ===================================================
          MAP
      =================================================== */}

      <div className="h-[420px] rounded-xl overflow-hidden border border-slate-200 relative z-0">

        <MapContainer
          center={PUNE_CENTER}
          zoom={11}
          scrollWheelZoom={true}
          className="h-full w-full"
        >

          {/* =================================================
              OPENSTREETMAP
          ================================================= */}

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* =================================================
              AUTOMATIC MAP CENTERING
          ================================================= */}

          <MapBounds
            stations={validStations}
          />

          {/* =================================================
              DATABASE STATION MARKERS
          ================================================= */}

          {validStations.map(
            (station, index) => {
              const latitude = Number(
                station.latitude
              );

              const longitude = Number(
                station.longitude
              );

              const aqi =
                Number(
                  station?.aqi
                ) || 0;

              const isOffline =
                station?.status ===
                "Offline";

              const stationId =
                station?.id ||
                station?.station_id ||
                `PMC-${String(
                  index + 1
                ).padStart(
                  3,
                  "0"
                )}`;

              const numericId =
                station?.numericId ||
                station?.station_id ||
                station?.stationId ||
                String(
                  index + 1
                );

              const aqiTheme =
                getCPCBStatus(aqi);

              return (
                <Marker
                  key={`${stationId}-${latitude}-${longitude}`}
                  position={[
                    latitude,
                    longitude,
                  ]}
                  icon={createMarkerIcon(
                    aqi,
                    isOffline
                  )}
                >

                  {/* =================================================
                      POPUP
                  ================================================= */}

                  <Popup>

                    <div className="p-1 min-w-[230px] text-slate-800 font-sans">

                      {/* STATION ID + STATUS */}

                      <div className="flex justify-between items-center mb-1">

                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {stationId}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isOffline
                              ? "bg-slate-200 text-slate-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {station?.status ||
                            "Unknown"}
                        </span>

                      </div>

                      {/* STATION NAME */}

                      <h3 className="font-bold text-slate-900 text-xs">
                        {station?.name ||
                          "Unknown Station"}
                      </h3>

                      {/* WARD */}

                      <p className="text-[11px] text-slate-500">
                        {station?.ward ||
                          "Unknown Ward"}
                      </p>

                      {/* ZONE */}

                      {station?.zone && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {station.zone}
                        </p>
                      )}

                      {/* =================================================
                          EXACT COORDINATES
                      ================================================= */}

                      <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-100">

                        <div className="text-[10px] font-bold text-blue-700 mb-1">
                          Exact Station Location
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">

                          <div>
                            <span className="text-slate-400">
                              Latitude
                            </span>

                            <div className="font-mono font-bold text-slate-700">
                              {formatValue(
                                latitude,
                                6
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-400">
                              Longitude
                            </span>

                            <div className="font-mono font-bold text-slate-700">
                              {formatValue(
                                longitude,
                                6
                              )}
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          AQI
                      ================================================= */}

                      <div className="my-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">

                        <div>

                          <div className="text-[10px] text-slate-400">
                            Current AQI
                          </div>

                          <div className="text-xl font-black text-slate-900 font-mono">
                            {aqi}
                          </div>

                          <div className="text-[10px] text-slate-400">
                            Dominant:{" "}
                            <strong>
                              {station?.dominant ||
                                "N/A"}
                            </strong>
                          </div>

                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            aqiTheme?.badge ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {aqiTheme?.label ||
                            "Unknown"}
                        </span>

                      </div>

                      {/* =================================================
                          PM VALUES
                      ================================================= */}

                      <div className="grid grid-cols-2 gap-2 mb-2">

                        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">

                          <div className="text-[9px] text-slate-400">
                            PM2.5
                          </div>

                          <div className="text-xs font-bold text-blue-600">
                            {formatValue(
                              station?.pm25,
                              2
                            )}
                          </div>

                          <div className="text-[9px] text-slate-400">
                            µg/m³
                          </div>

                        </div>

                        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">

                          <div className="text-[9px] text-slate-400">
                            PM10
                          </div>

                          <div className="text-xs font-bold text-blue-600">
                            {formatValue(
                              station?.pm10,
                              2
                            )}
                          </div>

                          <div className="text-[9px] text-slate-400">
                            µg/m³
                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          VIEW STATION
                      ================================================= */}

                      <button
                        onClick={() =>
                          handleStationNavigation(
                            {
                              ...station,
                              numericId,
                            }
                          )
                        }
                        className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                      >
                        View Station Diagnostics
                      </button>

                    </div>

                  </Popup>

                </Marker>
              );
            }
          )}

          {/* =================================================
              NO VALID LOCATION MESSAGE
          ================================================= */}

          {validStations.length === 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">

              <div className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-xl px-4 py-3 text-center">

                <p className="text-xs font-bold text-slate-700">
                  No station coordinates available
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  Add latitude and longitude to the
                  station database records.
                </p>

              </div>

            </div>
          )}

        </MapContainer>

      </div>

      {/* ===================================================
          CPCB STANDARD LEGEND
      =================================================== */}

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">

        <span className="font-semibold text-slate-500 text-[11px]">
          CPCB AQI Bands:
        </span>

        <div className="flex flex-wrap items-center gap-3">

          {/* GOOD */}

          <div className="flex items-center gap-1.5">

            <span className="w-2.5 h-2.5 rounded-full bg-[#00B050]" />

            <span className="text-slate-600 text-[11px]">
              Good (0-50)
            </span>

          </div>

          {/* SATISFACTORY */}

          <div className="flex items-center gap-1.5">

            <span className="w-2.5 h-2.5 rounded-full bg-[#92D050]" />

            <span className="text-slate-600 text-[11px]">
              Satisfactory (51-100)
            </span>

          </div>

          {/* MODERATE */}

          <div className="flex items-center gap-1.5">

            <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />

            <span className="text-slate-600 text-[11px]">
              Moderate (101-200)
            </span>

          </div>

          {/* POOR */}

          <div className="flex items-center gap-1.5">

            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />

            <span className="text-slate-600 text-[11px]">
              Poor (201-300)
            </span>

          </div>

          {/* VERY POOR */}

          <div className="flex items-center gap-1.5">

            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]" />

            <span className="text-slate-600 text-[11px]">
              Very Poor (301-400)
            </span>

          </div>

          {/* SEVERE */}

          <div className="flex items-center gap-1.5">

            <span className="w-2.5 h-2.5 rounded-full bg-[#C00000]" />

            <span className="text-slate-600 text-[11px]">
              Severe (401-500)
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}