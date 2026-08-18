import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

import CurrentWeather from "../components/CurrentWeather";
import HourlyForecast from "../components/HourlyForecast";
import WeeklyForecast from "../components/WeeklyForecast";

function Dashboard() {
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
              PMC Officer
            </h1>

            <p className="text-gray-500 mt-2">
              Here's today's weather overview for Pune.
            </p>

          </div>


          {/* Current Weather + Weather Details */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Current Weather */}
            <CurrentWeather />


            {/* Weather Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

              <h3 className="text-lg font-semibold text-gray-900">
                Weather Details
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Current atmospheric conditions
              </p>


              <div className="grid grid-cols-2 gap-4 mt-6">

                {/* Humidity */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">
                    Humidity
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    82%
                  </p>
                </div>


                {/* Wind */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">
                    Wind Speed
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    14 km/h
                  </p>
                </div>


                {/* Pressure */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">
                    Pressure
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    1008 hPa
                  </p>
                </div>


                {/* Visibility */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">
                    Visibility
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    8 km
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* Hourly Forecast */}
          <div className="mt-6">
            <HourlyForecast />
          </div>


          {/* Weekly Forecast */}
          <div className="mt-6">
            <WeeklyForecast />
          </div>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;