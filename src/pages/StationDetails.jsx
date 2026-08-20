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
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


function StationDetails() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [selectedPeriod, setSelectedPeriod] = useState("24 Hours");


  /* Station Data */

  const stations = {
    "1": {
      id: "PMC-001",
      name: "Kothrud Monitoring Station",
      ward: "Kothrud",
      zone: "West Zone",
      aqi: 118,
      category: "Moderate",
      status: "Online",
      updated: "Just now",

      pm25: 58,
      pm10: 96,
      no2: 42,
      so2: 18,
      co: 1.2,
      o3: 54,
      nh3: 21,
      pb: 0.4,

      temperature: "23°C",
      humidity: "68%",
      windSpeed: "2.8 m/s",
      windDirection: "NW",
      pressure: "1008 hPa",
    },

    "2": {
      id: "PMC-002",
      name: "Hinjewadi Monitoring Station",
      ward: "Hinjewadi",
      zone: "North-West Zone",
      aqi: 92,
      category: "Satisfactory",
      status: "Online",
      updated: "2 min ago",

      pm25: 42,
      pm10: 78,
      no2: 35,
      so2: 14,
      co: 0.9,
      o3: 48,
      nh3: 18,
      pb: 0.3,

      temperature: "24°C",
      humidity: "64%",
      windSpeed: "3.1 m/s",
      windDirection: "W",
      pressure: "1007 hPa",
    },

    "3": {
      id: "PMC-003",
      name: "Hadapsar Monitoring Station",
      ward: "Hadapsar",
      zone: "East Zone",
      aqi: 156,
      category: "Moderate",
      status: "Online",
      updated: "1 min ago",

      pm25: 72,
      pm10: 118,
      no2: 49,
      so2: 21,
      co: 1.4,
      o3: 57,
      nh3: 24,
      pb: 0.5,

      temperature: "25°C",
      humidity: "70%",
      windSpeed: "2.4 m/s",
      windDirection: "E",
      pressure: "1006 hPa",
    },

    "4": {
      id: "PMC-004",
      name: "Kharadi Monitoring Station",
      ward: "Kharadi",
      zone: "East Zone",
      aqi: 134,
      category: "Moderate",
      status: "Online",
      updated: "3 min ago",

      pm25: 64,
      pm10: 105,
      no2: 44,
      so2: 19,
      co: 1.3,
      o3: 52,
      nh3: 22,
      pb: 0.4,

      temperature: "25°C",
      humidity: "66%",
      windSpeed: "2.7 m/s",
      windDirection: "NE",
      pressure: "1007 hPa",
    },

    "5": {
      id: "PMC-005",
      name: "Baner Monitoring Station",
      ward: "Baner",
      zone: "West Zone",
      aqi: 214,
      category: "Poor",
      status: "Offline",
      updated: "18 min ago",

      pm25: 91,
      pm10: 142,
      no2: 61,
      so2: 25,
      co: 1.8,
      o3: 63,
      nh3: 29,
      pb: 0.7,

      temperature: "23°C",
      humidity: "72%",
      windSpeed: "1.9 m/s",
      windDirection: "SW",
      pressure: "1005 hPa",
    },
  };


  const station = stations[id] || stations["1"];


  /* Historical AQI Data */

  const aqiData = {

    "24 Hours": [
      { time: "12 AM", aqi: station.aqi - 12 },
      { time: "3 AM", aqi: station.aqi - 8 },
      { time: "6 AM", aqi: station.aqi - 5 },
      { time: "9 AM", aqi: station.aqi + 4 },
      { time: "12 PM", aqi: station.aqi + 10 },
      { time: "3 PM", aqi: station.aqi + 6 },
      { time: "6 PM", aqi: station.aqi + 14 },
      { time: "9 PM", aqi: station.aqi },
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
      { time: "Week 1", aqi: station.aqi - 22 },
      { time: "Week 2", aqi: station.aqi - 12 },
      { time: "Week 3", aqi: station.aqi + 6 },
      { time: "Week 4", aqi: station.aqi },
    ],

  };


  const pollutantData = [
    ["PM2.5", station.pm25, "µg/m³"],
    ["PM10", station.pm10, "µg/m³"],
    ["NO₂", station.no2, "µg/m³"],
    ["SO₂", station.so2, "µg/m³"],
    ["CO", station.co, "mg/m³"],
    ["O₃", station.o3, "µg/m³"],
    ["NH₃", station.nh3, "µg/m³"],
    ["Pb", station.pb, "µg/m³"],
  ];


  return (
    <div className="min-h-screen bg-gray-50">

      <main className="p-8">

        {/* Back Button */}

        <button
          onClick={() => navigate("/pune-areas")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Pune Areas
        </button>


        {/* Page Header */}

        <div className="mb-7">

          <div className="flex items-center gap-3">

            <h1 className="text-3xl font-bold text-gray-900">
              {station.name}
            </h1>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                station.status === "Online"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {station.status}
            </span>

          </div>

          <p className="text-gray-500 mt-2">
            {station.id} · {station.ward} · {station.zone}
          </p>

        </div>


        {/* Current AQI + Station Information */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">


          {/* AQI Card */}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Current AQI
                </p>

                <p className="text-4xl font-bold text-gray-900 mt-3">
                  {station.aqi}
                </p>

                <p className="text-sm text-orange-500 mt-2">
                  {station.category}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Activity size={24} />
              </div>

            </div>

          </div>


          {/* Station Status */}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wifi size={22} />
              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Station Status
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {station.status}
                </p>

              </div>

            </div>

            <p className="text-sm text-gray-500">
              Last updated
            </p>

            <p className="text-sm font-medium text-gray-900 mt-1">
              {station.updated}
            </p>

          </div>


          {/* Location */}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <MapPin size={22} />
              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Monitoring Area
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {station.ward}
                </p>

              </div>

            </div>

            <p className="text-sm text-gray-500">
              Zone
            </p>

            <p className="text-sm font-medium text-gray-900 mt-1">
              {station.zone}
            </p>

          </div>

        </div>


        {/* Current Pollutant Values */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Current Pollutant Values
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest measurements from the monitoring station.
            </p>

          </div>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {pollutantData.map(([name, value, unit]) => (

              <div
                key={name}
                className="bg-gray-50 rounded-2xl p-5"
              >

                <p className="text-sm text-gray-500">
                  {name}
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {value}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {unit}
                </p>

              </div>

            ))}

          </div>

        </div>


        {/* Meteorological Conditions */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Meteorological Conditions
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Current meteorological measurements at the station.
            </p>

          </div>


          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">


            <div className="bg-gray-50 rounded-2xl p-5">

              <Thermometer className="text-orange-500" size={20} />

              <p className="text-sm text-gray-500 mt-3">
                Temperature
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {station.temperature}
              </p>

            </div>


            <div className="bg-gray-50 rounded-2xl p-5">

              <Droplets className="text-blue-500" size={20} />

              <p className="text-sm text-gray-500 mt-3">
                Relative Humidity
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {station.humidity}
              </p>

            </div>


            <div className="bg-gray-50 rounded-2xl p-5">

              <Wind className="text-green-600" size={20} />

              <p className="text-sm text-gray-500 mt-3">
                Wind Speed
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {station.windSpeed}
              </p>

            </div>


            <div className="bg-gray-50 rounded-2xl p-5">

              <Wind className="text-blue-600" size={20} />

              <p className="text-sm text-gray-500 mt-3">
                Wind Direction
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {station.windDirection}
              </p>

            </div>


            <div className="bg-gray-50 rounded-2xl p-5">

              <Gauge className="text-purple-500" size={20} />

              <p className="text-sm text-gray-500 mt-3">
                Pressure
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {station.pressure}
              </p>

            </div>

          </div>

        </div>


        {/* Historical AQI */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

          <div className="flex items-start justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Historical AQI
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                AQI trend for {station.name}.
              </p>

            </div>


            <div className="flex gap-2">

              {["24 Hours", "7 Days", "30 Days"].map((period) => (

                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPeriod === period
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {period}
                </button>

              ))}

            </div>

          </div>


          <div className="h-80 mt-6">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart
                data={aqiData[selectedPeriod]}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  domain={[0, 500]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#2563eb",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* Station Information */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Station Information
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Monitoring station identification and status.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="flex items-center gap-3">

              <Calendar
                size={20}
                className="text-gray-400"
              />

              <div>

                <p className="text-xs text-gray-500">
                  Station ID
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {station.id}
                </p>

              </div>

            </div>


            <div className="flex items-center gap-3">

              <MapPin
                size={20}
                className="text-gray-400"
              />

              <div>

                <p className="text-xs text-gray-500">
                  Ward
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {station.ward}
                </p>

              </div>

            </div>


            <div className="flex items-center gap-3">

              <Wifi
                size={20}
                className="text-gray-400"
              />

              <div>

                <p className="text-xs text-gray-500">
                  Connectivity
                </p>

                <p
                  className={`text-sm font-medium mt-1 ${
                    station.status === "Online"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {station.status}
                </p>

              </div>

            </div>

          </div>

        </div>


      </main>

    </div>
  );
}


export default StationDetails;