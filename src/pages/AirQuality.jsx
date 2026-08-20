import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import AQIStatus from "../components/AQIStatus";
import PollutantCard from "../components/PollutantCard";

import {
  Activity,
  Wind,
  Droplets,
  Gauge,
  Clock,
} from "lucide-react";


function AirQuality() {

  const currentAQI = 142;

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <Sidebar />


      {/* Main Content */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <DashboardHeader />


        <main className="p-8">

          {/* Page Header */}
          <div className="mb-7">

            <h1 className="text-3xl font-bold text-gray-900">
              Air Quality Monitoring
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor real-time air quality conditions across Pune.
            </p>

          </div>


          {/* AQI Main Card */}
          <div className="bg-blue-600 rounded-3xl p-7 text-white shadow-sm">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>

                <p className="text-blue-100 text-sm">
                  Current Air Quality Index
                </p>

                <div className="flex items-end gap-3 mt-2">

                  <p className="text-6xl font-bold">
                    {currentAQI}
                  </p>

                  <div className="mb-2">
                    <AQIStatus aqi={currentAQI} />
                  </div>

                </div>

                <p className="text-blue-100 mt-2">
                  Pune Municipal Corporation
                </p>

              </div>


              <div className="bg-white/10 rounded-2xl p-5 min-w-[230px]">

                <p className="text-sm text-blue-100">
                  Dominant Pollutant
                </p>

                <p className="text-2xl font-bold mt-1">
                  PM2.5
                </p>

                <p className="text-blue-100 text-sm mt-1">
                  68 µg/m³
                </p>

              </div>

            </div>

          </div>


          {/* Meteorological Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">


            {/* Temperature */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Activity size={21} />
              </div>

              <p className="text-sm text-gray-500 mt-5">
                Temperature
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-1">
                24°C
              </p>

            </div>


            {/* Humidity */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets size={21} />
              </div>

              <p className="text-sm text-gray-500 mt-5">
                Relative Humidity
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-1">
                82%
              </p>

            </div>


            {/* Pressure */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Gauge size={21} />
              </div>

              <p className="text-sm text-gray-500 mt-5">
                Atmospheric Pressure
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-1">
                1008 hPa
              </p>

            </div>

          </div>


          {/* Pollutants */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mt-6">

            <div className="flex items-start justify-between mb-6">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Current Pollutant Levels
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Latest measurements from monitoring stations.
                </p>

              </div>


              <div className="flex items-center gap-2 text-sm text-gray-500">

                <span className="w-2 h-2 bg-green-500 rounded-full"></span>

                Updated just now

              </div>

            </div>


            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <PollutantCard
                name="PM2.5"
                value="68"
                unit="µg/m³"
                label="Fine particles"
              />

              <PollutantCard
                name="PM10"
                value="112"
                unit="µg/m³"
                label="Coarse particles"
              />

              <PollutantCard
                name="NO₂"
                value="42"
                unit="µg/m³"
                label="Nitrogen dioxide"
              />

              <PollutantCard
                name="SO₂"
                value="18"
                unit="µg/m³"
                label="Sulfur dioxide"
              />

              <PollutantCard
                name="CO"
                value="1.2"
                unit="mg/m³"
                label="Carbon monoxide"
              />

              <PollutantCard
                name="O₃"
                value="54"
                unit="µg/m³"
                label="Ozone"
              />

              <PollutantCard
                name="NH₃"
                value="21"
                unit="µg/m³"
                label="Ammonia"
              />

              <PollutantCard
                name="Pb"
                value="0.4"
                unit="µg/m³"
                label="Lead"
              />

            </div>

          </div>


          {/* Air Quality Information */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">


            {/* AQI Category */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <h2 className="text-lg font-semibold text-gray-900">
                AQI Category
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                CPCB air quality classification.
              </p>


              <div className="space-y-3 mt-6">

                <AQIRange
                  range="0–50"
                  category="Good"
                  description="Minimal impact"
                />

                <AQIRange
                  range="51–100"
                  category="Satisfactory"
                  description="Minor breathing discomfort"
                />

                <AQIRange
                  range="101–200"
                  category="Moderate"
                  description="Breathing discomfort for sensitive people"
                  active
                />

                <AQIRange
                  range="201–300"
                  category="Poor"
                  description="Breathing discomfort on prolonged exposure"
                />

                <AQIRange
                  range="301–400"
                  category="Very Poor"
                  description="Respiratory illness risk"
                />

                <AQIRange
                  range="401–500"
                  category="Severe"
                  description="Serious health impact"
                />

              </div>

            </div>


            {/* Data Information */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <h2 className="text-lg font-semibold text-gray-900">
                Monitoring Information
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current data collection status.
              </p>


              <div className="space-y-5 mt-7">

                <InfoRow
                  icon={<Wind size={20} />}
                  title="Wind Speed"
                  value="14 m/s"
                />

                <InfoRow
                  icon={<Wind size={20} />}
                  title="Wind Direction"
                  value="NE · 42°"
                />

                <InfoRow
                  icon={<Droplets size={20} />}
                  title="Relative Humidity"
                  value="82%"
                />

                <InfoRow
                  icon={<Droplets size={20} />}
                  title="Relative Humidity"
                  value="82%"
                />

                <InfoRow
                  icon={<Clock size={20} />}
                  title="Last Updated"
                  value="Just now"
                />

                <InfoRow
                  icon={<Activity size={20} />}
                  title="Data Availability"
                  value="98.6%"
                />

              </div>

            </div>

          </div>


        </main>

      </div>

    </div>
  );
}


/* AQI Range Component */

function AQIRange({
  range,
  category,
  description,
  active,
}) {

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-2xl ${
        active
          ? "bg-orange-50 border border-orange-100"
          : "bg-gray-50"
      }`}
    >

      <div className="flex items-center gap-4">

        <div>

          <p className="text-sm font-semibold text-gray-900">
            {range}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>

        </div>

      </div>


      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${
          category === "Good"
            ? "bg-green-100 text-green-600"
            : category === "Satisfactory"
            ? "bg-yellow-100 text-yellow-600"
            : category === "Moderate"
            ? "bg-orange-100 text-orange-600"
            : category === "Poor"
            ? "bg-red-100 text-red-600"
            : category === "Very Poor"
            ? "bg-purple-100 text-purple-600"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {category}
      </span>

    </div>
  );
}


/* Information Row */

function InfoRow({ icon, title, value }) {

  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
          {icon}
        </div>

        <p className="text-sm text-gray-600">
          {title}
        </p>

      </div>

      <p className="font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
}


export default AirQuality;