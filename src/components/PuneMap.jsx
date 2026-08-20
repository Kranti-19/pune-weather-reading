import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const stations = [
  {
    id: "PMC-001",
    name: "Kothrud",
    lat: 18.5074,
    lng: 73.8077,
    aqi: 118,
    category: "Moderate",
    status: "Online",
  },
  {
    id: "PMC-002",
    name: "Hinjewadi",
    lat: 18.5913,
    lng: 73.7389,
    aqi: 92,
    category: "Satisfactory",
    status: "Online",
  },
  {
    id: "PMC-003",
    name: "Hadapsar",
    lat: 18.5089,
    lng: 73.926,
    aqi: 156,
    category: "Moderate",
    status: "Online",
  },
  {
    id: "PMC-004",
    name: "Kharadi",
    lat: 18.5511,
    lng: 73.9442,
    aqi: 134,
    category: "Moderate",
    status: "Online",
  },
  {
    id: "PMC-005",
    name: "Baner",
    lat: 18.559,
    lng: 73.7868,
    aqi: 214,
    category: "Poor",
    status: "Offline",
  },
];

const createMarkerIcon = (aqi) => {
  let background = "#22c55e";

  if (aqi > 200) {
    background = "#ef4444";
  } else if (aqi > 100) {
    background = "#f97316";
  } else if (aqi > 50) {
    background = "#eab308";
  }

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: ${background};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 700;
      ">
        ${aqi}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

function PuneMap() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

      {/* Header */}
      <div className="mb-5">

        <h2 className="text-lg font-semibold text-gray-900">
          Pune Air Quality Map
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Monitoring stations and current AQI status across Pune
        </p>

      </div>

      {/* Map */}
      <div className="h-[450px] rounded-2xl overflow-hidden">

        <MapContainer
          center={[18.5204, 73.8567]}
          zoom={11}
          scrollWheelZoom={false}
          className="h-full w-full"
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {stations.map((station) => (

            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={createMarkerIcon(station.aqi)}
            >

              <Popup>

                <div className="min-w-[180px]">

                  <h3 className="font-semibold text-gray-900">
                    {station.name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Station ID: {station.id}
                  </p>

                  <div className="mt-3">

                    <p className="text-sm">
                      AQI: <strong>{station.aqi}</strong>
                    </p>

                    <p className="text-sm">
                      Category: <strong>{station.category}</strong>
                    </p>

                    <p className="text-sm">
                      Status: <strong>{station.status}</strong>
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/station/${station.id.replace("PMC-", "")}`
                      )
                    }
                    className="mt-3 w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                  >
                    View Station Details
                  </button>

                </div>

              </Popup>

            </Marker>

          ))}

        </MapContainer>

      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 mt-5">

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          Good
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          Satisfactory
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          Moderate
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          Poor+
        </div>

      </div>

    </div>
  );
}

export default PuneMap;