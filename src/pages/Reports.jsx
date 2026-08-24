import { useEffect, useState } from "react";

import {
  FileText,
  Calendar,
  MapPin,
  Activity,
  Database,
  Download,
} from "lucide-react";

import axios from "axios";


function Reports() {

  // ============================================
  // STATE
  // ============================================

  const [stations, setStations] = useState([]);

  const [selectedStation, setSelectedStation] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    "2026-08-20"
  );

  const [report, setReport] = useState(null);

  const [loadingStations, setLoadingStations] =
    useState(true);

  const [loadingReport, setLoadingReport] =
    useState(false);

  const [error, setError] = useState("");


  // ============================================
  // GET STATIONS
  // ============================================

  useEffect(() => {

    const fetchStations = async () => {

      try {

        setLoadingStations(true);

        setError("");

        const response = await axios.get(
          "http://localhost:5000/api/stations"
        );

        console.log(
          "Stations response:",
          response.data
        );


        const stationList =
          response.data.stations || [];


        setStations(stationList);


        // Select first station automatically
        if (stationList.length > 0) {

          setSelectedStation(
            stationList[0].station_id
          );

        }

      } catch (error) {

        console.error(
          "Failed to fetch stations:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Failed to load monitoring stations."
        );

      } finally {

        setLoadingStations(false);

      }

    };


    fetchStations();

  }, []);


  // ============================================
  // GENERATE REPORT
  // ============================================

  const handleGenerateReport = async () => {

    if (!selectedStation) {

      setError(
        "Please select a monitoring station."
      );

      return;

    }


    if (!selectedDate) {

      setError(
        "Please select a report date."
      );

      return;

    }


    try {

      setLoadingReport(true);

      setError("");

      setReport(null);


      const response = await axios.get(
        `http://localhost:5000/api/reports/${selectedStation}?date=${selectedDate}`
      );


      console.log(
        "Report response:",
        response.data
      );


      if (
        response.data.status === "success"
      ) {

        setReport(
          response.data.report
        );

      } else {

        setError(
          response.data.message ||
          "Failed to generate report."
        );

      }

    } catch (error) {

      console.error(
        "Report error:",
        error
      );


      setError(
        error.response?.data?.message ||
        "Failed to generate report."
      );

    } finally {

      setLoadingReport(false);

    }

  };


  // ============================================
  // AUTO GENERATE REPORT
  // AFTER STATIONS LOAD
  // ============================================

  useEffect(() => {

    if (
      selectedStation &&
      selectedDate &&
      !loadingStations
    ) {

      handleGenerateReport();

    }

  }, [
    selectedStation,
    selectedDate,
    loadingStations
  ]);


  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const dateObject =
      new Date(`${date}T00:00:00`);

    return dateObject.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  };


  // ============================================
  // CATEGORY STYLE
  // ============================================

  const getCategoryStyle = (
    category
  ) => {

    switch (
      category?.toLowerCase()
    ) {

      case "good":
        return "bg-green-100 text-green-600";

      case "satisfactory":
        return "bg-lime-100 text-lime-600";

      case "moderate":
        return "bg-yellow-100 text-yellow-600";

      case "poor":
        return "bg-orange-100 text-orange-600";

      case "very poor":
        return "bg-red-100 text-red-600";

      case "severe":
        return "bg-red-200 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";

    }

  };


  // ============================================
  // STATION STATUS STYLE
  // ============================================

  const getStationStatusStyle = (
    status
  ) => {

    if (
      status?.toLowerCase() === "online"
    ) {

      return {
        dot: "bg-green-500",
        text: "text-green-600",
      };

    }

    return {
      dot: "bg-red-500",
      text: "text-red-600",
    };

  };


  // ============================================
  // EXPORT
  // ============================================

  const handleExport = () => {

    if (!report) {

      setError(
        "Generate a report before exporting."
      );

      return;

    }


    // Temporary export
    // We can connect this to a backend
    // PDF/CSV API later.

    const reportText = `

PUNE MUNICIPAL CORPORATION
AIR QUALITY MONITORING REPORT

Station:
${report.station}

Station ID:
${report.stationId}

Ward:
${report.ward}

Zone:
${report.zone}

Date:
${formatDate(report.date)}

AQI:
${report.aqi ?? "-"}

Category:
${report.category ?? "-"}

Dominant Pollutant:
${report.dominantPollutant ?? "-"}

Data Availability:
${report.dataAvailability ?? "-"}

Station Status:
${report.stationStatus ?? "-"}


POLLUTANT MEASUREMENTS

${(report.pollutants || [])
  .map(
    (pollutant) =>
      `${pollutant.name}: ${pollutant.value} ${pollutant.unit}`
  )
  .join("\n")}

`;


    const blob =
      new Blob(
        [reportText],
        {
          type: "text/plain",
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;

    link.download =
      `${report.station}_report_${report.date}.txt`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

  };


  // ============================================
  // MAIN UI
  // ============================================

  return (

    <main className="p-8">


      {/* ========================================
          PAGE HEADER
      ======================================== */}

      <div className="mb-7">

        <h1 className="text-3xl font-bold text-gray-900">
          Reports
        </h1>

        <p className="text-gray-500 mt-2">
          Generate air-quality monitoring reports for Pune.
        </p>

      </div>


      {/* ========================================
          ERROR MESSAGE
      ======================================== */}

      {error && (

        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">

          {error}

        </div>

      )}


      {/* ========================================
          REPORT CONFIGURATION
      ======================================== */}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">


        <div className="flex items-center gap-3 mb-6">


          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

            <FileText size={22} />

          </div>


          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Daily Station Report
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Generate a daily air-quality report for a monitoring station.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


          {/* ========================================
              STATION
          ======================================== */}

          <div>

            <label className="text-sm font-medium text-gray-700">
              Monitoring Station
            </label>


            <div className="relative mt-2">


              <MapPin
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />


              <select
                value={selectedStation}
                onChange={(e) =>
                  setSelectedStation(
                    e.target.value
                  )
                }
                disabled={loadingStations}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              >

                {loadingStations ? (

                  <option>
                    Loading stations...
                  </option>

                ) : stations.length === 0 ? (

                  <option>
                    No stations available
                  </option>

                ) : (

                  stations.map(
                    (station) => (

                      <option
                        key={
                          station.station_id
                        }
                        value={
                          station.station_id
                        }
                      >
                        {station.name}
                      </option>

                    )
                  )

                )}

              </select>

            </div>

          </div>


          {/* ========================================
              DATE
          ======================================== */}

          <div>

            <label className="text-sm font-medium text-gray-700">
              Report Date
            </label>


            <div className="relative mt-2">


              <Calendar
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />


              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value
                  )
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>


          {/* ========================================
              GENERATE BUTTON
          ======================================== */}

          <div className="flex items-end">

            <button
              onClick={
                handleGenerateReport
              }
              disabled={
                loadingReport ||
                loadingStations ||
                !selectedStation
              }
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            >

              <FileText size={18} />

              {loadingReport
                ? "Generating..."
                : "Generate Report"}

            </button>

          </div>

        </div>

      </div>


      {/* ========================================
          REPORT
      ======================================== */}

      {loadingReport && (

        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">

          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>

          <p className="text-gray-500 mt-4">
            Generating report...
          </p>

        </div>

      )}


      {!loadingReport && !report && (

        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">

          <FileText
            size={45}
            className="mx-auto text-gray-300"
          />

          <p className="text-gray-500 mt-4">
            Select a station and date to generate a report.
          </p>

        </div>

      )}


      {!loadingReport && report && (

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">


          {/* ========================================
              REPORT HEADER
          ======================================== */}

          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-start md:justify-between gap-4">


            <div>

              <p className="text-sm text-gray-500">
                Daily Station Report
              </p>


              <h2 className="text-xl font-semibold text-gray-900 mt-1">

                {report.station}

              </h2>


              <p className="text-sm text-gray-500 mt-1">

                {report.stationId}

                {" · "}

                {report.ward || "-"}

                {" · "}

                {report.zone || "-"}

              </p>

            </div>


            <div className="text-left md:text-right">

              <p className="text-sm text-gray-500">
                Report Date
              </p>


              <p className="text-sm font-semibold text-gray-900 mt-1">

                {formatDate(
                  report.date
                )}

              </p>

            </div>

          </div>


          {/* ========================================
              AQI SUMMARY
          ======================================== */}

          <div className="p-6 border-b border-gray-100">


            <h3 className="text-lg font-semibold text-gray-900">
              AQI Summary
            </h3>


            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">


              {/* AQI */}

              <div className="p-5 rounded-2xl bg-orange-50">


                <div className="flex items-center gap-2 text-orange-600">

                  <Activity size={18} />

                  <span className="text-sm font-medium">
                    AQI
                  </span>

                </div>


                <p className="text-3xl font-bold text-gray-900 mt-3">

                  {report.aqi ?? "-"}

                </p>


                {report.category && (

                  <span
                    className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-medium ${getCategoryStyle(
                      report.category
                    )}`}
                  >

                    {report.category}

                  </span>

                )}

              </div>


              {/* DOMINANT POLLUTANT */}

              <div className="p-5 rounded-2xl bg-gray-50">

                <p className="text-sm text-gray-500">
                  Dominant Pollutant
                </p>


                <p className="text-2xl font-bold text-gray-900 mt-3">

                  {report.dominantPollutant ||
                    "-"}

                </p>

              </div>


              {/* DATA AVAILABILITY */}

              <div className="p-5 rounded-2xl bg-green-50">


                <div className="flex items-center gap-2 text-green-600">

                  <Database size={18} />

                  <span className="text-sm font-medium">
                    Data Availability
                  </span>

                </div>


                <p className="text-2xl font-bold text-gray-900 mt-3">

                  {report.dataAvailability ||
                    "-"}

                </p>

              </div>


              {/* STATION STATUS */}

              <div className="p-5 rounded-2xl bg-blue-50">


                <p className="text-sm text-gray-500">
                  Station Status
                </p>


                <div className="flex items-center gap-2 mt-3">


                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      getStationStatusStyle(
                        report.stationStatus
                      ).dot
                    }`}
                  ></span>


                  <p
                    className={`text-xl font-bold ${
                      getStationStatusStyle(
                        report.stationStatus
                      ).text
                    }`}
                  >

                    {report.stationStatus ||
                      "-"}

                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* ========================================
              POLLUTANT MEASUREMENTS
          ======================================== */}

          <div className="p-6">


            <div className="flex items-center justify-between mb-5">

              <div>

                <h3 className="text-lg font-semibold text-gray-900">
                  Daily Pollutant Measurements
                </h3>


                <p className="text-sm text-gray-500 mt-1">
                  Recorded pollutant observations for the selected station.
                </p>

              </div>

            </div>


            <div className="overflow-x-auto">


              <table className="w-full">


                <thead>

                  <tr className="border-b border-gray-100">

                    <th className="text-left pb-3 text-sm font-medium text-gray-500">
                      Parameter
                    </th>


                    <th className="text-left pb-3 text-sm font-medium text-gray-500">
                      Value
                    </th>


                    <th className="text-left pb-3 text-sm font-medium text-gray-500">
                      Unit
                    </th>


                    <th className="text-left pb-3 text-sm font-medium text-gray-500">
                      Quality
                    </th>

                  </tr>

                </thead>


                <tbody>


                  {!report.pollutants ||
                  report.pollutants.length === 0 ? (

                    <tr>

                      <td
                        colSpan="4"
                        className="py-8 text-center text-gray-500"
                      >

                        No pollutant readings available
                        for this station and date.

                      </td>

                    </tr>

                  ) : (

                    report.pollutants.map(
                      (pollutant, index) => (

                        <tr
                          key={
                            `${pollutant.name}-${index}`
                          }
                          className="border-b border-gray-50 last:border-0"
                        >


                          <td className="py-4 font-medium text-gray-900">

                            {pollutant.name}

                          </td>


                          <td className="py-4 text-gray-900 font-semibold">

                            {pollutant.value}

                          </td>


                          <td className="py-4 text-sm text-gray-500">

                            {pollutant.unit}

                          </td>


                          <td className="py-4">

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                pollutant.qualityFlag?.toLowerCase() ===
                                "good"
                                  ? "bg-green-100 text-green-600"
                                  : pollutant.qualityFlag?.toLowerCase() ===
                                    "valid"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >

                              {pollutant.qualityFlag ||
                                "Valid"}

                            </span>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>


          {/* ========================================
              FOOTER
          ======================================== */}

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">


            <p className="text-xs text-gray-500">
              Daily station report · Pune Municipal Corporation
            </p>


            <button
              onClick={handleExport}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >

              <Download size={17} />

              Export Report

            </button>

          </div>

        </div>

      )}

    </main>

  );

}


export default Reports;