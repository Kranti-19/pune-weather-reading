import {
  Wrench,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
} from "lucide-react";

function Maintenance() {
  const maintenanceRecords = [
    {
      station: "Kothrud Monitoring Station",
      device: "GW-001",
      issue: "Routine inspection",
      action: "Sensor inspection and cleaning",
      technician: "Field Team 01",
      date: "18 Aug 2026",
      nextService: "18 Sep 2026",
      status: "Completed",
    },
    {
      station: "Hinjewadi Monitoring Station",
      device: "GW-002",
      issue: "Routine maintenance",
      action: "Gateway and sensor check",
      technician: "Field Team 02",
      date: "15 Aug 2026",
      nextService: "15 Sep 2026",
      status: "Completed",
    },
    {
      station: "Hadapsar Monitoring Station",
      device: "GW-003",
      issue: "Communication issue",
      action: "Network connectivity inspection",
      technician: "Field Team 01",
      date: "12 Aug 2026",
      nextService: "12 Sep 2026",
      status: "Pending",
    },
    {
      station: "Kharadi Monitoring Station",
      device: "GW-004",
      issue: "Low power warning",
      action: "Power system inspection",
      technician: "Field Team 03",
      date: "10 Aug 2026",
      nextService: "10 Sep 2026",
      status: "Due",
    },
    {
      station: "Baner Monitoring Station",
      device: "GW-005",
      issue: "Sensor fault",
      action: "PM sensor inspection",
      technician: "Field Team 02",
      date: "08 Aug 2026",
      nextService: "08 Sep 2026",
      status: "Due",
    },
  ];

  const calibrationRecords = [
    {
      sensor: "SEN-PM25-001",
      station: "Kothrud Monitoring Station",
      parameter: "PM2.5",
      calibrationDate: "18 Aug 2026",
      method: "Reference comparison",
      result: "Passed",
      nextCalibration: "18 Nov 2026",
      status: "Valid",
    },
    {
      sensor: "SEN-PM10-002",
      station: "Hinjewadi Monitoring Station",
      parameter: "PM10",
      calibrationDate: "15 Aug 2026",
      method: "Reference comparison",
      result: "Passed",
      nextCalibration: "15 Nov 2026",
      status: "Valid",
    },
    {
      sensor: "SEN-NO2-003",
      station: "Hadapsar Monitoring Station",
      parameter: "NO₂",
      calibrationDate: "10 May 2026",
      method: "Reference gas",
      result: "Passed",
      nextCalibration: "10 Aug 2026",
      status: "Due",
    },
    {
      sensor: "SEN-SO2-004",
      station: "Kharadi Monitoring Station",
      parameter: "SO₂",
      calibrationDate: "05 Aug 2026",
      method: "Reference gas",
      result: "Warning",
      nextCalibration: "05 Nov 2026",
      status: "Warning",
    },
    {
      sensor: "SEN-PM25-005",
      station: "Baner Monitoring Station",
      parameter: "PM2.5",
      calibrationDate: "02 Aug 2026",
      method: "Reference comparison",
      result: "Passed",
      nextCalibration: "02 Nov 2026",
      status: "Valid",
    },
  ];

  const getStatusClass = (status) => {
    if (status === "Completed" || status === "Valid" || status === "Passed") {
      return "bg-green-100 text-green-600";
    }

    if (status === "Pending" || status === "Warning") {
      return "bg-orange-100 text-orange-500";
    }

    return "bg-red-100 text-red-500";
  };

  return (
    <div>

      {/* Page Header */}
      <div className="mb-7">

        <h1 className="text-3xl font-bold text-gray-900">
          Maintenance & Calibration
        </h1>

        <p className="text-gray-500 mt-2">
          Manage monitoring station maintenance and sensor calibration records.
        </p>

      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">

        {/* Completed Maintenance */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
            <CheckCircle size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Completed Maintenance
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            2
          </p>

          <p className="text-sm text-green-600 mt-2">
            Recently completed
          </p>

        </div>


        {/* Maintenance Due */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-5">
            <Wrench size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Maintenance Due
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            2
          </p>

          <p className="text-sm text-orange-500 mt-2">
            Requires attention
          </p>

        </div>


        {/* Valid Calibrations */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
            <Settings size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Valid Calibrations
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            3
          </p>

          <p className="text-sm text-blue-600 mt-2">
            Calibration records valid
          </p>

        </div>


        {/* Calibration Due */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
            <AlertTriangle size={22} />
          </div>

          <p className="text-sm text-gray-500">
            Calibration Due
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            1
          </p>

          <p className="text-sm text-red-500 mt-2">
            Requires attention
          </p>

        </div>

      </div>


      {/* Maintenance Records */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">

        <div className="p-6 border-b border-gray-100">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Wrench size={22} />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Maintenance Records
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Station and device maintenance history.
              </p>

            </div>

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-gray-100">

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Station
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Device
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Issue
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Action
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Technician
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Date
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Next Service
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {maintenanceRecords.map((record) => (

                <tr
                  key={`${record.device}-${record.date}`}
                  className="border-b border-gray-50 last:border-0"
                >

                  <td className="px-6 py-5 text-sm font-medium text-gray-900">
                    {record.station}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.device}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.issue}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.action}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.technician}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.date}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.nextService}
                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* Calibration Records */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Settings size={22} />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Calibration Records
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Sensor calibration history and upcoming calibration dates.
              </p>

            </div>

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-gray-100">

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Sensor
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Station
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Parameter
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Calibration Date
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Method / Reference
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Result
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Next Calibration
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {calibrationRecords.map((record) => (

                <tr
                  key={record.sensor}
                  className="border-b border-gray-50 last:border-0"
                >

                  <td className="px-6 py-5 text-sm font-semibold text-gray-900">
                    {record.sensor}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.station}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.parameter}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.calibrationDate}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.method}
                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                        record.result
                      )}`}
                    >
                      {record.result}
                    </span>

                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {record.nextCalibration}
                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pb-6">

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center gap-3 mb-4">

            <Calendar
              size={21}
              className="text-blue-600"
            />

            <h2 className="text-lg font-semibold text-gray-900">
              Maintenance Tracking
            </h2>

          </div>

          <p className="text-sm text-gray-500">
            Maintain station and device service history, record actions taken,
            assign technicians and track the next scheduled service date.
          </p>

        </div>


        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center gap-3 mb-4">

            <Clock
              size={21}
              className="text-orange-500"
            />

            <h2 className="text-lg font-semibold text-gray-900">
              Calibration Tracking
            </h2>

          </div>

          <p className="text-sm text-gray-500">
            Track calibration dates, methods or references, calibration results
            and upcoming calibration requirements for sensors.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Maintenance;