import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";


// Fix Leaflet marker icons

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// Monitoring stations

const stations = [
  {
    id: 1,
    name: "Kothrud Monitoring Station",
    area: "Kothrud",
    ward: "Ward 10",
    zone: "West",
    aqi: 118,
    category: "Moderate",
    status: "Online",
    position: [18.5074, 73.8077],
  },

  {
    id: 2,
    name: "Hinjewadi Monitoring Station",
    area: "Hinjewadi",
    ward: "Ward 25",
    zone: "West",
    aqi: 92,
    category: "Satisfactory",
    status: "Online",
    position: [18.5913, 73.7389],
  },

  {
    id: 3,
    name: "Hadapsar Monitoring Station",
    area: "Hadapsar",
    ward: "Ward 15",
    zone: "East",
    aqi: 156,
    category: "Moderate",
    status: "Online",
    position: [18.5089, 73.926],
  },

  {
    id: 4,
    name: "Kharadi Monitoring Station",
    area: "Kharadi",
    ward: "Ward 17",
    zone: "East",
    aqi: 134,
    category: "Moderate",
    status: "Online",
    position: [18.551, 73.9348],
  },

  {
    id: 5,
    name: "Baner Monitoring Station",
    area: "Baner",
    ward: "Ward 8",
    zone: "West",
    aqi: 214,
    category: "Poor",
    status: "Offline",
    position: [18.559, 73.7868],
  },
];


function getAQIColor(category) {
  switch (category) {
    case "Good":
      return "#22c55e";

    case "Satisfactory":
      return "#84cc16";

    case "Moderate":
      return "#f97316";

    case "Poor":
      return "#ef4444";

    case "Very Poor":
      return "#a855f7";

    case "Severe":
      return "#7f1d1d";

    default:
      return "#6b7280";
  }
}


function createMarkerIcon(category) {
  const color = getAQIColor(category);

  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width: 34px;
          height: 34px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        "
      >
        ${category === "Poor" ? "!" : "AQI"}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}


function PuneAreaMap() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

      {/* Header */}

      <div className="mb-5">

        <h2 className="text-lg font-semibold text-gray-900">
          Pune Air Quality Monitoring Map
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Monitoring stations and current AQI status across Pune.
        </p>

      </div>


      {/* Map */}

      <div className="h-[500px] rounded-2xl overflow-hidden">

        <MapContainer
          center={[18.5204, 73.8567]}
          zoom={11}
          scrollWheelZoom={true}
          className="w-full h-full"
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {stations.map((station) => (

            <Marker
              key={station.id}
              position={station.position}
              icon={createMarkerIcon(station.category)}
            >

              <Popup>

                <div className="min-w-[200px]">

                  <h3 className="font-semibold text-gray-900">
                    {station.name}
                  </h3>

                  <div className="mt-3 space-y-1 text-sm">

                    <p>
                      <strong>Area:</strong> {station.area}
                    </p>

                    <p>
                      <strong>Ward:</strong> {station.ward}
                    </p>

                    <p>
                      <strong>Zone:</strong> {station.zone}
                    </p>

                    <p>
                      <strong>AQI:</strong> {station.aqi}
                    </p>

                    <p>
                      <strong>Category:</strong> {station.category}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}

                      <span
                        style={{
                          color:
                            station.status === "Online"
                              ? "#16a34a"
                              : "#dc2626",
                          fontWeight: 600,
                        }}
                      >
                        {station.status}
                      </span>

                    </p>

                  </div>

                </div>

              </Popup>

            </Marker>

          ))}

        </MapContainer>

      </div>


      {/* Legend */}

      <div className="flex flex-wrap gap-4 mt-5">

        {[
          ["Good", "#22c55e"],
          ["Satisfactory", "#84cc16"],
          ["Moderate", "#f97316"],
          ["Poor", "#ef4444"],
          ["Very Poor", "#a855f7"],
          ["Severe", "#7f1d1d"],
        ].map(([label, color]) => (

          <div
            key={label}
            className="flex items-center gap-2 text-sm text-gray-600"
          >

            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />

            {label}

          </div>

        ))}

      </div>

    </div>
  );
}


export default PuneAreaMap;