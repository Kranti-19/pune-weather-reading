import PollutantCard from "../components/PollutantCard";
import AQIStatus from "../components/AQIStatus";
import MeteorologicalConditions from "../components/MeteorologicalConditions";
import PuneAreaMap from "../components/PuneAreaMap";
import PuneAreaMonitoring from "../components/PuneAreaMonitoring";

import {
  Activity,
  Radio,
  MapPin,
  Bell,
  TrendingUp,
} from "lucide-react";


function Dashboard() {

  const currentAQI = 142;

  return (
    
    <div>

        <main className="p-8">

          {/* Page Header */}
          <div className="mb-7">

            <h1 className="text-3xl font-bold text-gray-900">
              PMC Officer
            </h1>

            <p className="text-gray-500 mt-2">
              Here's today's air quality overview for Pune.
            </p>

          </div>


          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">


            {/* Overall AQI */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Activity size={21} />
                </div>

                <AQIStatus aqi={currentAQI} />

              </div>


              <p className="text-sm text-gray-500 mt-5">
                Overall AQI
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-1">
                {currentAQI}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Pune
              </p>

            </div>


            {/* Active Stations */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Radio size={21} />
              </div>

              <p className="text-sm text-gray-500 mt-5">
                Active Stations
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-1">
                24
              </p>

              <p className="text-xs text-gray-400 mt-1">
                22 online · 2 offline
              </p>

            </div>


            {/* High AQI Areas */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <MapPin size={21} />
              </div>

              <p className="text-sm text-gray-500 mt-5">
                High AQI Areas
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-1">
                5
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Require attention
              </p>

            </div>


            {/* Active Alerts */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell size={21} />
              </div>

              <p className="text-sm text-gray-500 mt-5">
                Active Alerts
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-1">
                3
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Unresolved alerts
              </p>

            </div>

          </div>


          {/* Current Air Quality */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mt-6">

            <div className="flex items-start justify-between mb-6">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Current Air Quality
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Latest pollutant measurements across Pune.
                </p>

              </div>


              <div className="flex items-center gap-2 text-sm text-gray-500">

                <span className="w-2 h-2 bg-green-500 rounded-full"></span>

                Live data

              </div>

            </div>


            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">

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

          <div className="mt-6">
            <MeteorologicalConditions />
          </div>

          <div className="mt-6">
            <PuneAreaMonitoring />
          </div>

          <div className="mt-6">
            <PuneAreaMap />
          </div>


          {/* Bottom Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">


            {/* AQI Overview */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    AQI Overview
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Current air quality condition.
                  </p>

                </div>

                <TrendingUp
                  size={20}
                  className="text-blue-600"
                />

              </div>


              <div className="flex items-center gap-8 mt-7">

                <div>

                  <p className="text-5xl font-bold text-gray-900">
                    {currentAQI}
                  </p>

                  <div className="mt-3">
                    <AQIStatus aqi={currentAQI} />
                  </div>

                </div>


                <div className="border-l border-gray-100 pl-8">

                  <p className="text-sm text-gray-500">
                    Dominant Pollutant
                  </p>

                  <p className="text-xl font-semibold text-gray-900 mt-1">
                    PM2.5
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    68 µg/m³
                  </p>

                </div>

              </div>

            </div>


            {/* Station Status */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">

              <h2 className="text-lg font-semibold text-gray-900">
                Monitoring Station Status
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current connectivity status.
              </p>


              <div className="grid grid-cols-2 gap-4 mt-7">

                <div className="bg-green-50 rounded-2xl p-5">

                  <p className="text-sm text-green-700">
                    Online
                  </p>

                  <p className="text-3xl font-bold text-green-700 mt-1">
                    22
                  </p>

                  <p className="text-xs text-green-600 mt-1">
                    Sending valid data
                  </p>

                </div>


                <div className="bg-red-50 rounded-2xl p-5">

                  <p className="text-sm text-red-700">
                    Offline
                  </p>

                  <p className="text-3xl font-bold text-red-700 mt-1">
                    2
                  </p>

                  <p className="text-xs text-red-600 mt-1">
                    Need attention
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* Recent Alerts */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mt-6">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Alerts
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Latest air-quality and system alerts.
                </p>

              </div>

              <button className="text-sm text-blue-600 font-medium">
                View all
              </button>

            </div>


            <div className="space-y-3">

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">

                <div>

                  <p className="font-medium text-gray-900">
                    High AQI detected
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Hadapsar · AQI 214
                  </p>

                </div>

                <span className="text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full">
                  Critical
                </span>

              </div>


              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl">

                <div>

                  <p className="font-medium text-gray-900">
                    PM2.5 concentration above threshold
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Baner · PM2.5 92 µg/m³
                  </p>

                </div>

                <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                  Warning
                </span>

              </div>


              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">

                <div>

                  <p className="font-medium text-gray-900">
                    Monitoring station offline
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Kharadi · Last communication 27 min ago
                  </p>

                </div>

                <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                  Device
                </span>

              </div>

            </div>

          </div>

        </main>

      </div>
  );
}

export default Dashboard;