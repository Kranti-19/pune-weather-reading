import { useState } from "react";

import {
  Activity,
  TrendingUp,
  Database,
  BarChart3,
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

const aqiData = {
  "24 Hours": [
    { time: "12 AM", aqi: 118 },
    { time: "3 AM", aqi: 112 },
    { time: "6 AM", aqi: 125 },
    { time: "9 AM", aqi: 138 },
    { time: "12 PM", aqi: 151 },
    { time: "3 PM", aqi: 146 },
    { time: "6 PM", aqi: 158 },
    { time: "9 PM", aqi: 142 },
  ],

  "7 Days": [
    { time: "Mon", aqi: 126 },
    { time: "Tue", aqi: 134 },
    { time: "Wed", aqi: 129 },
    { time: "Thu", aqi: 145 },
    { time: "Fri", aqi: 151 },
    { time: "Sat", aqi: 147 },
    { time: "Sun", aqi: 142 },
  ],

  "30 Days": [
    { time: "Week 1", aqi: 118 },
    { time: "Week 2", aqi: 132 },
    { time: "Week 3", aqi: 148 },
    { time: "Week 4", aqi: 142 },
  ],
};

function Analytics() {
    const [selectedPeriod, setSelectedPeriod] = useState("24 Hours");
    
  return (
    <div>

      {/* Page Header */}
      <div className="mb-7">

        <h1 className="text-3xl font-bold text-gray-900">
          Air Quality Analytics
        </h1>

        <p className="text-gray-500 mt-2">
          Analyze air quality trends and monitoring performance across Pune.
        </p>

      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">

        {/* Average AQI */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-5">
            <Activity size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Average AQI
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            142
          </p>

          <p className="text-sm text-orange-500 mt-2">
            Moderate
          </p>

        </div>


        {/* Highest AQI */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
            <TrendingUp size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Highest AQI
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            214
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Baner
          </p>

        </div>


        {/* Data Availability */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
            <Database size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Data Availability
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            98.6%
          </p>

          <p className="text-sm text-green-600 mt-2">
            Excellent
          </p>

        </div>


        {/* Monitored Stations */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
            <BarChart3 size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Monitored Stations
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            24
          </p>

          <p className="text-sm text-gray-500 mt-2">
            22 online · 2 offline
          </p>

        </div>

      </div>


      {/* AQI Trend */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              AQI Trend
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Air Quality Index over time
            </p>
          </div>


          {/* Time Filters */}
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


        {/* Chart Placeholder */}
        {/* AQI Chart */}
<div className="h-72 mt-6">

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
        domain={[0, 300]}
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


      {/* Pollutant Trends */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Pollutant Trends
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Historical pollutant measurements
          </p>
        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

          {[
            ["PM2.5", "68 µg/m³"],
            ["PM10", "112 µg/m³"],
            ["NO₂", "42 µg/m³"],
            ["SO₂", "18 µg/m³"],
            ["CO", "1.2 mg/m³"],
            ["O₃", "54 µg/m³"],
            ["NH₃", "21 µg/m³"],
            ["Pb", "0.4 µg/m³"],
          ].map(([name, value]) => (

            <div
              key={name}
              className="bg-gray-50 rounded-2xl p-5"
            >

              <p className="text-sm text-gray-500">
                {name}
              </p>

              <p className="text-xl font-bold text-gray-900 mt-2">
                {value}
              </p>

            </div>

          ))}

        </div>

      </div>


      {/* Ward Comparison */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

        <div className="flex items-start justify-between">

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Ward-wise AQI Comparison
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Compare air quality across monitored Pune areas
            </p>

          </div>

          <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
            View all
          </button>

        </div>


        <div className="mt-6 space-y-5">

          {[
            ["Baner", 214],
            ["Hadapsar", 156],
            ["Kharadi", 134],
            ["Kothrud", 118],
            ["Hinjewadi", 92],
          ].map(([area, aqi]) => (

            <div key={area}>

              <div className="flex justify-between mb-2">

                <span className="text-sm font-medium text-gray-700">
                  {area}
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {aqi}
                </span>

              </div>

              <div className="w-full h-2 bg-gray-100 rounded-full">

                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.min((aqi / 300) * 100, 100)}%`,
                  }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Analytics;