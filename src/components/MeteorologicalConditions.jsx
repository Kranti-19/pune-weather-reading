import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Gauge,
} from "lucide-react";

function MeteorologicalConditions() {
  const conditions = [
    {
      label: "Temperature",
      value: "28.4 °C",
      icon: <Thermometer size={20} />,
    },
    {
      label: "Relative Humidity",
      value: "68 %",
      icon: <Droplets size={20} />,
    },
    {
      label: "Wind Speed",
      value: "3.8 m/s",
      icon: <Wind size={20} />,
    },
    {
      label: "Wind Direction",
      value: "NE · 42°",
      icon: <Compass size={20} />,
    },
    {
      label: "Pressure",
      value: "1008 hPa",
      icon: <Gauge size={20} />,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

      {/* Header */}

      <div className="mb-6">

        <h2 className="text-lg font-semibold text-gray-900">
          Meteorological Conditions
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Current atmospheric conditions supporting air-quality analysis.
        </p>

      </div>


      {/* Conditions */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {conditions.map((condition) => (

          <div
            key={condition.label}
            className="bg-gray-50 rounded-2xl p-5"
          >

            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              {condition.icon}
            </div>

            <p className="text-sm text-gray-500">
              {condition.label}
            </p>

            <p className="text-xl font-bold text-gray-900 mt-2">
              {condition.value}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

export default MeteorologicalConditions;