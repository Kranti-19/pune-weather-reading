import {
  Activity,
  Wifi,
  Battery,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
} from "lucide-react";

function DeviceHealth() {
  const devices = [
    {
      device: "GW-001",
      station: "Kothrud Monitoring Station",
      connectivity: "Online",
      power: "Good",
      sensor: "Healthy",
      lastCommunication: "Just now",
      status: "Healthy",
    },
    {
      device: "GW-002",
      station: "Hinjewadi Monitoring Station",
      connectivity: "Online",
      power: "Good",
      sensor: "Healthy",
      lastCommunication: "2 min ago",
      status: "Healthy",
    },
    {
      device: "GW-003",
      station: "Hadapsar Monitoring Station",
      connectivity: "Offline",
      power: "Good",
      sensor: "Healthy",
      lastCommunication: "18 min ago",
      status: "Warning",
    },
    {
      device: "GW-004",
      station: "Kharadi Monitoring Station",
      connectivity: "Online",
      power: "Low",
      sensor: "Healthy",
      lastCommunication: "1 min ago",
      status: "Warning",
    },
    {
      device: "GW-005",
      station: "Baner Monitoring Station",
      connectivity: "Online",
      power: "Good",
      sensor: "Fault",
      lastCommunication: "5 min ago",
      status: "Critical",
    },
  ];

  const getStatusClass = (status) => {
    if (status === "Healthy") {
      return "bg-green-100 text-green-600";
    }

    if (status === "Warning") {
      return "bg-orange-100 text-orange-500";
    }

    return "bg-red-100 text-red-500";
  };

  const getConnectivityClass = (value) => {
    return value === "Online"
      ? "text-green-600"
      : "text-red-500";
  };

  const getPowerClass = (value) => {
    return value === "Good"
      ? "text-green-600"
      : "text-orange-500";
  };

  const getSensorClass = (value) => {
    return value === "Healthy"
      ? "text-green-600"
      : "text-red-500";
  };

  return (
    <div>

      {/* Page Header */}
      <div className="mb-7">

        <h1 className="text-3xl font-bold text-gray-900">
          Sensor & Device Health
        </h1>

        <p className="text-gray-500 mt-2">
          Monitor device connectivity, power, sensor status and communication health.
        </p>

      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">

        {/* Healthy Devices */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
            <CheckCircle size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Healthy Devices
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            3
          </p>

          <p className="text-sm text-green-600 mt-2">
            Operating normally
          </p>

        </div>


        {/* Online Devices */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
            <Wifi size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Online Devices
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            4
          </p>

          <p className="text-sm text-blue-600 mt-2">
            Currently connected
          </p>

        </div>


        {/* Warning Devices */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-5">
            <AlertTriangle size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Warning Devices
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            1
          </p>

          <p className="text-sm text-orange-500 mt-2">
            Requires attention
          </p>

        </div>


        {/* Critical Devices */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
            <XCircle size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Critical Devices
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            1
          </p>

          <p className="text-sm text-red-500 mt-2">
            Immediate attention
          </p>

        </div>

      </div>


      {/* Device Health Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-gray-100">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server size={22} />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Device Health
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current health and connectivity status of monitoring devices.
              </p>

            </div>

          </div>

        </div>


        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-gray-100">

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Device
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Station
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Connectivity
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Power
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Sensor
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Last Communication
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {devices.map((device) => (

                <tr
                  key={device.device}
                  className="border-b border-gray-50 last:border-0"
                >

                  {/* Device */}
                  <td className="px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                        <Server size={18} />
                      </div>

                      <span className="font-semibold text-gray-900">
                        {device.device}
                      </span>

                    </div>

                  </td>


                  {/* Station */}
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {device.station}
                  </td>


                  {/* Connectivity */}
                  <td className="px-6 py-5">

                    <div className={`flex items-center gap-2 text-sm font-medium ${getConnectivityClass(device.connectivity)}`}>

                      <span
                        className={`w-2 h-2 rounded-full ${
                          device.connectivity === "Online"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />

                      {device.connectivity}

                    </div>

                  </td>


                  {/* Power */}
                  <td className="px-6 py-5">

                    <div className={`flex items-center gap-2 text-sm font-medium ${getPowerClass(device.power)}`}>

                      <Battery size={17} />

                      {device.power}

                    </div>

                  </td>


                  {/* Sensor */}
                  <td className="px-6 py-5">

                    <div className={`flex items-center gap-2 text-sm font-medium ${getSensorClass(device.sensor)}`}>

                      <Activity size={17} />

                      {device.sensor}

                    </div>

                  </td>


                  {/* Last Communication */}
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {device.lastCommunication}
                  </td>


                  {/* Status */}
                  <td className="px-6 py-5">

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(device.status)}`}
                    >
                      {device.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* Device Health Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        {/* Connectivity */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wifi size={20} />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Connectivity Monitoring
            </h2>

          </div>

          <p className="text-sm text-gray-500">
            Track communication status and identify stations that have exceeded
            the configured communication timeout.
          </p>

        </div>


        {/* Maintenance */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Wrench size={20} />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Device Maintenance
            </h2>

          </div>

          <p className="text-sm text-gray-500">
            Monitor sensor faults, maintenance requirements and device health
            conditions requiring field-team attention.
          </p>

        </div>

      </div>

    </div>
  );
}

export default DeviceHealth;