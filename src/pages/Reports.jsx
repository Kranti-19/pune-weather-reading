import { useEffect, useState } from "react";

import {
  FileText,
  Calendar,
  MapPin,
  Activity,
  Database,
  Download,
  FileSpreadsheet,
} from "lucide-react";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";


function Reports() {

  // =========================================================
  // STATE
  // =========================================================

  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-08-20");

  const [report, setReport] = useState(null);

  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  const [error, setError] = useState("");


  // =========================================================
  // GET STATIONS
  // =========================================================

  useEffect(() => {

    const fetchStations = async () => {

      try {

        setLoadingStations(true);
        setError("");

        const response = await axios.get(
          "http://localhost:5000/api/stations"
        );

        console.log("Stations response:", response.data);

        const stationList =
          response.data.stations || [];

        setStations(stationList);

        if (stationList.length > 0) {

          setSelectedStation(
            String(stationList[0].station_id)
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


  // =========================================================
  // GENERATE REPORT
  // =========================================================

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


  // =========================================================
  // AUTO GENERATE REPORT
  // =========================================================

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


  // =========================================================
  // FORMAT DATE
  // =========================================================

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


  // =========================================================
  // CATEGORY STYLE
  // =========================================================

  const getCategoryStyle = (category) => {

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


  // =========================================================
  // STATION STATUS STYLE
  // =========================================================

  const getStationStatusStyle = (status) => {

    if (
      status?.toLowerCase() === "online" ||
      status?.toLowerCase() === "active"
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


  // =========================================================
  // EXCEL HELPER FUNCTIONS
  // =========================================================

  const applyBorder = (cell) => {

    cell.border = {

      top: {
        style: "thin",
        color: {
          argb: "D1D5DB",
        },
      },

      bottom: {
        style: "thin",
        color: {
          argb: "D1D5DB",
        },
      },

      left: {
        style: "thin",
        color: {
          argb: "D1D5DB",
        },
      },

      right: {
        style: "thin",
        color: {
          argb: "D1D5DB",
        },
      },

    };

  };


  const styleSectionHeading = (
    worksheet,
    cellAddress,
    text
  ) => {

    const cell =
      worksheet.getCell(cellAddress);

    cell.value = text;

    cell.font = {
      name: "Calibri",
      size: 12,
      bold: true,
      color: {
        argb: "FFFFFF",
      },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "2563EB",
      },
    };

    cell.alignment = {
      horizontal: "left",
      vertical: "middle",
    };

  };


  // =========================================================
  // EXCEL EXPORT
  // =========================================================

  const handleExportExcel = async () => {

    if (!report) {

      setError(
        "Generate a report before exporting."
      );

      return;

    }


    try {

      setError("");


      // -----------------------------------------------------
      // CREATE WORKBOOK
      // -----------------------------------------------------

      const workbook =
        new ExcelJS.Workbook();

      workbook.creator =
        "Pune Municipal Corporation";

      workbook.lastModifiedBy =
        "Air Quality Monitoring System";

      workbook.created =
        new Date();

      workbook.modified =
        new Date();


      // -----------------------------------------------------
      // CREATE WORKSHEET
      // -----------------------------------------------------

      const worksheet =
        workbook.addWorksheet(
          "Air Quality Report"
        );


      // -----------------------------------------------------
      // COLUMN WIDTHS
      // -----------------------------------------------------

      worksheet.columns = [

        {
          key: "A",
          width: 27,
        },

        {
          key: "B",
          width: 25,
        },

        {
          key: "C",
          width: 27,
        },

        {
          key: "D",
          width: 25,
        },

      ];


      // -----------------------------------------------------
      // PAGE SETUP
      // -----------------------------------------------------

      worksheet.pageSetup = {

        paperSize: 9,

        orientation: "portrait",

        fitToPage: true,

        fitToWidth: 1,

        fitToHeight: 0,

        horizontalCentered: true,

        verticalCentered: false,

        margins: {

          left: 0.25,

          right: 0.25,

          top: 0.5,

          bottom: 0.5,

          header: 0.2,

          footer: 0.2,

        },

      };


      // =====================================================
      // TITLE
      // =====================================================

      worksheet.mergeCells("A1:D1");

      const titleCell =
        worksheet.getCell("A1");

      titleCell.value =
        "PUNE MUNICIPAL CORPORATION";

      titleCell.font = {

        name: "Calibri",

        size: 18,

        bold: true,

        color: {
          argb: "FFFFFF",
        },

      };

      titleCell.fill = {

        type: "pattern",

        pattern: "solid",

        fgColor: {
          argb: "2563EB",
        },

      };

      titleCell.alignment = {

        horizontal: "center",

        vertical: "middle",

      };

      worksheet.getRow(1).height = 34;


      // =====================================================
      // SUBTITLE
      // =====================================================

      worksheet.mergeCells("A2:D2");

      const subtitleCell =
        worksheet.getCell("A2");

      subtitleCell.value =
        "AIR QUALITY MONITORING REPORT";

      subtitleCell.font = {

        name: "Calibri",

        size: 14,

        bold: true,

        color: {
          argb: "1E3A8A",
        },

      };

      subtitleCell.alignment = {

        horizontal: "center",

        vertical: "middle",

      };

      worksheet.getRow(2).height = 26;


      // Empty row

      worksheet.getRow(3).height = 8;


      // =====================================================
      // STATION DETAILS
      // =====================================================

      worksheet.mergeCells("A4:D4");

      styleSectionHeading(
        worksheet,
        "A4",
        "STATION DETAILS"
      );

      worksheet.getRow(4).height = 24;


      // Station row

      worksheet.addRow([

        "Station",

        report.station || "-",

        "Station ID",

        report.stationId ?? "-",

      ]);


      // Ward row

      worksheet.addRow([

        "Ward",

        report.ward || "-",

        "Zone",

        report.zone || "-",

      ]);


      // Date row

      worksheet.addRow([

        "Report Date",

        formatDate(report.date),

        "Station Status",

        report.stationStatus || "-",

      ]);


      // Style rows 5-7

      for (
        let rowNumber = 5;
        rowNumber <= 7;
        rowNumber++
      ) {

        const row =
          worksheet.getRow(rowNumber);

        row.height = 24;

        for (
          let columnNumber = 1;
          columnNumber <= 4;
          columnNumber++
        ) {

          const cell =
            row.getCell(columnNumber);

          applyBorder(cell);

          cell.alignment = {

            vertical: "middle",

            wrapText: true,

          };

        }

        row.getCell(1).font = {
          bold: true,
        };

        row.getCell(3).font = {
          bold: true,
        };

      }


      // =====================================================
      // SPACE
      // =====================================================

      worksheet.getRow(8).height = 8;


      // =====================================================
      // AQI SUMMARY
      // =====================================================

      worksheet.mergeCells("A9:D9");

      styleSectionHeading(
        worksheet,
        "A9",
        "AQI SUMMARY"
      );

      worksheet.getRow(9).height = 24;


      worksheet.addRow([

        "AQI",

        report.aqi ?? "-",

        "Category",

        report.category || "-",

      ]);


      worksheet.addRow([

        "Dominant Pollutant",

        report.dominantPollutant || "-",

        "Data Availability",

        report.dataAvailability || "-",

      ]);


      // Style AQI rows

      for (
        let rowNumber = 10;
        rowNumber <= 11;
        rowNumber++
      ) {

        const row =
          worksheet.getRow(rowNumber);

        row.height = 25;

        for (
          let columnNumber = 1;
          columnNumber <= 4;
          columnNumber++
        ) {

          const cell =
            row.getCell(columnNumber);

          applyBorder(cell);

          cell.alignment = {

            vertical: "middle",

            wrapText: true,

          };

        }

        row.getCell(1).font = {
          bold: true,
        };

        row.getCell(3).font = {
          bold: true,
        };

      }


      // AQI value

      worksheet.getCell("B10").font = {

        bold: true,

        size: 15,

      };

      worksheet.getCell("B10").alignment = {

        horizontal: "center",

        vertical: "middle",

      };


      // Category

      worksheet.getCell("D10").font = {

        bold: true,

      };


      // =====================================================
      // SPACE
      // =====================================================

      worksheet.getRow(12).height = 8;


      // =====================================================
      // POLLUTANT MEASUREMENTS
      // =====================================================

      worksheet.mergeCells("A13:D13");

      styleSectionHeading(
        worksheet,
        "A13",
        "POLLUTANT MEASUREMENTS"
      );

      worksheet.getRow(13).height = 24;


      // -----------------------------------------------------
      // TABLE HEADER
      // -----------------------------------------------------

      const headerRow =
        worksheet.addRow([

          "Parameter",

          "Value",

          "Unit",

          "Quality",

        ]);


      headerRow.height = 27;


      headerRow.eachCell(
        (cell) => {

          cell.font = {

            name: "Calibri",

            size: 11,

            bold: true,

            color: {
              argb: "FFFFFF",
            },

          };

          cell.fill = {

            type: "pattern",

            pattern: "solid",

            fgColor: {
              argb: "1E40AF",
            },

          };

          cell.alignment = {

            horizontal: "center",

            vertical: "middle",

          };

          applyBorder(cell);

        }
      );


      // =====================================================
      // POLLUTANT DATA
      // =====================================================

      if (
        report.pollutants &&
        report.pollutants.length > 0
      ) {

        report.pollutants.forEach(
          (pollutant) => {

            const row =
              worksheet.addRow([

                pollutant.name || "-",

                pollutant.value ?? "-",

                pollutant.unit || "-",

                pollutant.qualityFlag ||
                "Valid",

              ]);


            row.height = 24;


            row.eachCell(
              (cell) => {

                applyBorder(cell);

                cell.alignment = {

                  vertical: "middle",

                  wrapText: true,

                };

              }
            );


            row.getCell(2).alignment = {

              horizontal: "center",

              vertical: "middle",

            };


            row.getCell(3).alignment = {

              horizontal: "center",

              vertical: "middle",

            };


            row.getCell(4).alignment = {

              horizontal: "center",

              vertical: "middle",

            };


            const quality =
              pollutant.qualityFlag
                ?.toLowerCase();


            if (
              quality === "good" ||
              quality === "valid"
            ) {

              row.getCell(4).font = {

                bold: true,

                color: {
                  argb: "15803D",
                },

              };

            }

          }
        );

      } else {

        const row =
          worksheet.addRow([

            "No pollutant readings available",

            "-",

            "-",

            "-",

          ]);


        row.height = 24;


        row.eachCell(
          (cell) => {

            applyBorder(cell);

            cell.alignment = {

              vertical: "middle",

              wrapText: true,

            };

          }
        );

      }


      // =====================================================
      // FOOTER
      // =====================================================

      const footerSpacer =
        worksheet.addRow([]);

      footerSpacer.height = 12;


      const footer =
        worksheet.addRow([

          "Pune Municipal Corporation - Air Quality Monitoring System",

        ]);


      worksheet.mergeCells(
        `A${footer.number}:D${footer.number}`
      );


      footer.height = 22;


      footer.getCell(1).font = {

        name: "Calibri",

        italic: true,

        size: 9,

        color: {
          argb: "6B7280",
        },

      };


      footer.getCell(1).alignment = {

        horizontal: "center",

        vertical: "middle",

      };


      // =====================================================
      // IMPORTANT:
      // NO FREEZE PANES
      // =====================================================

      /*
        Do NOT add:

        worksheet.views = [
          {
            state: "frozen",
            ySplit: 14
          }
        ];

        That causes the top rows to remain visible while
        scrolling and makes the report look duplicated.
      */


      // =====================================================
      // PRINT AREA
      // =====================================================

      worksheet.pageSetup.printArea =
        `A1:D${footer.number}`;


      // =====================================================
      // HEADER / FOOTER
      // =====================================================

      // The report already contains a footer row inside the worksheet.
      // Do not use worksheet.headerFooter.oddFooter.center.text here.
      // ExcelJS does not initialize oddFooter as an object in this
      // browser-side workbook, which causes the export error.

      // =====================================================
      // DOWNLOAD EXCEL
      // =====================================================

      const buffer =
        await workbook.xlsx.writeBuffer();


      const blob =
        new Blob(
          [buffer],
          {
            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }
        );


      const url =
        window.URL.createObjectURL(blob);


      const link =
        document.createElement("a");


      link.href = url;


      link.download =
        `${report.station || "Station"}_Report_${report.date}.xlsx`;


      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);


      window.URL.revokeObjectURL(url);


    } catch (error) {

      console.error(
        "Excel export error:",
        error
      );

      setError(
        "Failed to export Excel report."
      );

    }

  };


  // =========================================================
  // PDF EXPORT
  // =========================================================

  const handleExportPDF = () => {

    if (!report) {

      setError(
        "Generate a report before exporting."
      );

      return;

    }


    try {

      const doc =
        new jsPDF();


      // =====================================================
      // TITLE
      // =====================================================

      doc.setFontSize(18);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "PUNE MUNICIPAL CORPORATION",
        105,
        20,
        {
          align: "center",
        }
      );


      doc.setFontSize(14);

      doc.text(
        "AIR QUALITY MONITORING REPORT",
        105,
        30,
        {
          align: "center",
        }
      );


      // =====================================================
      // STATION DETAILS
      // =====================================================

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(11);


      doc.text(
        `Station: ${report.station || "-"}`,
        15,
        45
      );


      doc.text(
        `Station ID: ${report.stationId || "-"}`,
        15,
        53
      );


      doc.text(
        `Ward: ${report.ward || "-"}`,
        15,
        61
      );


      doc.text(
        `Zone: ${report.zone || "-"}`,
        15,
        69
      );


      doc.text(
        `Report Date: ${formatDate(report.date)}`,
        15,
        77
      );


      doc.text(
        `Station Status: ${report.stationStatus || "-"}`,
        15,
        85
      );


      // =====================================================
      // AQI SUMMARY
      // =====================================================

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(13);

      doc.text(
        "AQI Summary",
        15,
        98
      );


      const aqiRows = [

        [

          report.aqi ?? "-",

          report.category || "-",

          report.dominantPollutant || "-",

          report.dataAvailability || "-",

        ],

      ];


      autoTable(
        doc,
        {

          startY: 103,

          head: [

            [

              "AQI",

              "Category",

              "Dominant Pollutant",

              "Availability",

            ],

          ],

          body: aqiRows,

          theme: "grid",

          styles: {

            fontSize: 9,

            cellPadding: 3,

          },

          headStyles: {

            fillColor: [
              37,
              99,
              235,
            ],

            textColor: 255,

            fontStyle: "bold",

          },

        }
      );


      // =====================================================
      // POLLUTANT TABLE
      // =====================================================

      const finalY =
        doc.lastAutoTable.finalY + 15;


      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(13);

      doc.text(
        "Pollutant Measurements",
        15,
        finalY
      );


      const pollutantRows =
        (report.pollutants || []).map(
          (pollutant) => [

            pollutant.name || "-",

            pollutant.value ?? "-",

            pollutant.unit || "-",

            pollutant.qualityFlag ||
            "Valid",

          ]
        );


      autoTable(
        doc,
        {

          startY: finalY + 6,

          head: [

            [

              "Parameter",

              "Value",

              "Unit",

              "Quality",

            ],

          ],

          body:

            pollutantRows.length > 0

              ? pollutantRows

              : [

                  [

                    "No readings",

                    "-",

                    "-",

                    "-",

                  ],

                ],

          theme: "grid",

          styles: {

            fontSize: 10,

            cellPadding: 3,

          },

          headStyles: {

            fillColor: [
              30,
              64,
              175,
            ],

            textColor: 255,

            fontStyle: "bold",

          },

        }
      );


      // =====================================================
      // FOOTER
      // =====================================================

      const pageHeight =
        doc.internal.pageSize.height;


      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.text(
        "Pune Municipal Corporation - Air Quality Monitoring System",
        105,
        pageHeight - 10,
        {
          align: "center",
        }
      );


      // =====================================================
      // DOWNLOAD
      // =====================================================

      doc.save(
        `${report.station || "Station"}_Report_${report.date}.pdf`
      );


    } catch (error) {

      console.error(
        "PDF export error:",
        error
      );

      setError(
        "Failed to export PDF report."
      );

    }

  };


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <main className="p-8">


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-7">

        <h1 className="text-3xl font-bold text-gray-900">

          Reports

        </h1>


        <p className="text-gray-500 mt-2">

          Generate air-quality monitoring reports for Pune.

        </p>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">

          {error}

        </div>

      )}


      {/* =====================================================
          REPORT CONFIGURATION
      ===================================================== */}

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


          {/* =================================================
              STATION
          ================================================= */}

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


          {/* =================================================
              DATE
          ================================================= */}

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


          {/* =================================================
              GENERATE
          ================================================= */}

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


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loadingReport && (

        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">

          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>


          <p className="text-gray-500 mt-4">

            Generating report...

          </p>

        </div>

      )}


      {/* =====================================================
          NO REPORT
      ===================================================== */}

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


      {/* =====================================================
          REPORT
      ===================================================== */}

      {!loadingReport && report && (

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">


          {/* =================================================
              REPORT HEADER
          ================================================= */}

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


          {/* =================================================
              AQI SUMMARY
          ================================================= */}

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


          {/* =================================================
              POLLUTANTS
          ================================================= */}

          <div className="p-6">


            <div className="mb-5">

              <h3 className="text-lg font-semibold text-gray-900">

                Daily Pollutant Measurements

              </h3>


              <p className="text-sm text-gray-500 mt-1">

                Recorded pollutant observations for the selected station.

              </p>

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


          {/* =================================================
              EXPORT
          ================================================= */}

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">


            <p className="text-xs text-gray-500">

              Daily station report · Pune Municipal Corporation

            </p>


            <div className="flex flex-wrap items-center gap-3">


              {/* EXCEL */}

              <button

                onClick={
                  handleExportExcel
                }

                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition text-sm font-medium"

              >

                <FileSpreadsheet
                  size={17}
                />

                Export Excel

              </button>


              {/* PDF */}

              <button

                onClick={
                  handleExportPDF
                }

                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition text-sm font-medium"

              >

                <Download
                  size={17}
                />

                Export PDF

              </button>


            </div>

          </div>


        </div>

      )}

    </main>

  );

}


export default Reports;