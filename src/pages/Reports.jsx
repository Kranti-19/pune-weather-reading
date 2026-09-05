import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Building2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================================
// BACKEND
// ============================================================

const API_BASE_URL = "http://localhost:5000/api";

// ============================================================
// TODAY
// ============================================================

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ============================================================
// REPORT TEMPLATES
// ============================================================

const REPORT_TEMPLATES = [
  {
    id: "CPCB_DAILY",
    title: "Daily CAAQM Station Audit",
    code: "FORM-IV / CPCB",
    desc: "24-hour weighted mean for 8 NAAQS parameters with sub-index classification.",
    frequency: "Daily Automatic",
    status: "Ready",
  },
  {
    id: "WARD_EXCEED",
    title: "Ward Exceedance & Breach Log",
    code: "PMC-ENV-2026",
    desc: "Audit of particulate PM2.5/PM10 threshold spikes linked to construction sites.",
    frequency: "Event Driven",
    status: "Ready",
  },
  {
    id: "UPTIME_QAQC",
    title: "Station Uptime & Data Completeness",
    code: "QAQC-TEL-99",
    desc: "Sensor drift, packet loss rate, and battery telemetry health report.",
    frequency: "Weekly Audit",
    status: "Certified",
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function Reports() {
  const [selectedStation, setSelectedStation] =
    useState("ALL");

  const [reportType, setReportType] =
    useState("CPCB_DAILY");

  const [observationDate, setObservationDate] =
    useState("2026-09-03");

  const [stations, setStations] = useState([]);

  const [complianceRecords, setComplianceRecords] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // FETCH REPORT DATA
  // ============================================================

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError("");

      let url =
        `${API_BASE_URL}/reports` +
        `?date=${encodeURIComponent(observationDate)}`;

      if (selectedStation !== "ALL") {
        url +=
          `&stationId=${encodeURIComponent(selectedStation)}`;
      }

      console.log("Fetching report:", url);

      const response = await fetch(url);

      const contentType =
        response.headers.get("content-type") || "";

      // --------------------------------------------------------
      // SERVER ERROR
      // --------------------------------------------------------

      if (!response.ok) {
        let message =
          `Server returned ${response.status}`;

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          try {
            const errorData =
              await response.json();

            message =
              errorData?.message ||
              errorData?.error ||
              message;
          } catch {
            // ignore
          }
        } else {
          try {
            const text =
              await response.text();

            if (
              text.includes("<!DOCTYPE") ||
              text.includes("<html")
            ) {
              message =
                `Backend route not found (${response.status}). ` +
                `Check /api/reports in server.js.`;
            }
          } catch {
            // ignore
          }
        }

        throw new Error(message);
      }

      // --------------------------------------------------------
      // CHECK JSON
      // --------------------------------------------------------

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "Backend did not return JSON. Check your /api/reports route."
        );
      }

      const result =
        await response.json();

      console.log(
        "Report API response:",
        result
      );

      if (result.status !== "success") {
        throw new Error(
          result.message ||
            "Unable to load report data."
        );
      }

      setStations(
        Array.isArray(result.stations)
          ? result.stations
          : []
      );

      setComplianceRecords(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(
        "Report API error:",
        err
      );

      setError(
        err?.message ||
          "Unable to connect to the backend."
      );

      setStations([]);
      setComplianceRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // LOAD REPORT
  // ============================================================

  useEffect(() => {
    fetchReportData();
  }, [
    observationDate,
    selectedStation,
  ]);

  // ============================================================
  // NORMALIZE DATA
  // ============================================================

  const normalizedRecords = useMemo(() => {
    return complianceRecords.map(
      (row, index) => {
        const station =
          row.station ??
          row.stationName ??
          row.station_name ??
          "Unknown Station";

        const stationId =
          row.stationId ??
          row.station_id ??
          row.id ??
          `ROW-${index + 1}`;

        const ward =
          row.ward ??
          row.stationWard ??
          "";

        const pm25 =
          row.pm25 ??
          row.PM25 ??
          row.pm2_5 ??
          row.pm2_5_avg ??
          null;

        const pm10 =
          row.pm10 ??
          row.PM10 ??
          row.pm10_avg ??
          null;

        const no2 =
          row.no2 ??
          row.NO2 ??
          row.no2_avg ??
          null;

        const aqi =
          row.aqi ??
          row.AQI ??
          row.latestAqi ??
          row.latest_aqi ??
          null;

        const category =
          row.category ??
          row.aqiCategory ??
          row.aqi_category ??
          "N/A";

        const dominant =
          row.dominant ??
          row.dominantPollutant ??
          row.dominant_pollutant ??
          "-";

        const availability =
          row.availability ??
          row.dataAvailability ??
          row.data_availability ??
          row.dataRate ??
          null;

        const compliance =
          row.compliance ??
          (
            row.isCompliant === true
              ? "Compliant"
              : row.isCompliant === false
              ? "Action Triggered"
              : "N/A"
          );

        return {
          ...row,

          station,
          stationId,
          ward,

          pm25,
          pm10,
          no2,

          aqi,
          category,
          dominant,

          availability,
          compliance,
        };
      }
    );
  }, [complianceRecords]);

  // ============================================================
  // FORMAT NUMBER
  // ============================================================

  const numberValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      Number.isNaN(Number(value))
    ) {
      return null;
    }

    return Number(value);
  };

  // ============================================================
  // FORMAT POLLUTANT FOR SCREEN
  // ============================================================

  const formatPollutant = (value) => {
    const number = numberValue(value);

    if (number === null) {
      return "N/A";
    }

    return `${number.toFixed(1)} µg/m³`;
  };

  // ============================================================
  // FORMAT AQI
  // ============================================================

  const formatAQI = (value) => {
    const number = numberValue(value);

    if (number === null) {
      return "N/A";
    }

    return Math.round(number);
  };

  // ============================================================
  // FORMAT AVAILABILITY
  // ============================================================

  const formatAvailability = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    if (typeof value === "number") {
      return `${value.toFixed(1)}%`;
    }

    const text = String(value);

    if (text.includes("%")) {
      return text;
    }

    return `${text}%`;
  };

  // ============================================================
  // COMPLIANCE
  // ============================================================

  const isCompliant = (value) => {
    if (!value) {
      return false;
    }

    return String(value)
      .toLowerCase()
      .includes("compliant");
  };

  // ============================================================
  // SELECTED TEMPLATE
  // ============================================================

  const selectedTemplate =
    REPORT_TEMPLATES.find(
      (item) =>
        item.id === reportType
    ) ||
    REPORT_TEMPLATES[0];

  // ============================================================
  // EXCEL EXPORT
  // ============================================================

  const exportExcel = async () => {
    if (!normalizedRecords.length) {
      alert(
        "No report data is available for export."
      );

      return;
    }

    try {
      setIsGenerating(true);

      const workbook =
        new ExcelJS.Workbook();

      workbook.creator =
        "PMC CAAQM System";

      workbook.lastModifiedBy =
        "PMC CAAQM System";

      workbook.created =
        new Date();

      workbook.modified =
        new Date();

      const worksheet =
        workbook.addWorksheet(
          "Air Quality Report"
        );

      // --------------------------------------------------------
      // COLUMN WIDTHS
      // --------------------------------------------------------

      worksheet.columns = [
        {
          header: "Station / Ward Node",
          key: "station",
          width: 32,
        },
        {
          header: "Station ID",
          key: "stationId",
          width: 16,
        },
        {
          header: "Ward",
          key: "ward",
          width: 18,
        },
        {
          header: "PM2.5 (µg/m³)",
          key: "pm25",
          width: 18,
        },
        {
          header: "PM10 (µg/m³)",
          key: "pm10",
          width: 18,
        },
        {
          header: "NO2 (µg/m³)",
          key: "no2",
          width: 18,
        },
        {
          header: "AQI",
          key: "aqi",
          width: 12,
        },
        {
          header: "AQI Category",
          key: "category",
          width: 18,
        },
        {
          header: "Dominant Pollutant",
          key: "dominant",
          width: 22,
        },
        {
          header: "Data Availability",
          key: "availability",
          width: 20,
        },
        {
          header: "Regulatory Audit",
          key: "compliance",
          width: 22,
        },
      ];

      // --------------------------------------------------------
      // TITLE
      // --------------------------------------------------------

      worksheet.mergeCells(
        "A1:K1"
      );

      const titleCell =
        worksheet.getCell("A1");

      titleCell.value =
        "PUNE MUNICIPAL CORPORATION";

      titleCell.font = {
        name: "Arial",
        size: 18,
        bold: true,
      };

      titleCell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet.getRow(1).height = 30;

      // --------------------------------------------------------
      // SUBTITLE
      // --------------------------------------------------------

      worksheet.mergeCells(
        "A2:K2"
      );

      const subtitleCell =
        worksheet.getCell("A2");

      subtitleCell.value =
        "REGULATORY AIR QUALITY MONITORING REPORT";

      subtitleCell.font = {
        name: "Arial",
        size: 14,
        bold: true,
      };

      subtitleCell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet.getRow(2).height = 25;

      // --------------------------------------------------------
      // REPORT INFORMATION
      // --------------------------------------------------------

      worksheet.mergeCells(
        "A4:B4"
      );

      worksheet.getCell(
        "A4"
      ).value = "Report Type";

      worksheet.getCell(
        "A4"
      ).font = {
        bold: true,
      };

      worksheet.mergeCells(
        "C4:E4"
      );

      worksheet.getCell(
        "C4"
      ).value =
        selectedTemplate.title;

      worksheet.mergeCells(
        "F4:G4"
      );

      worksheet.getCell(
        "F4"
      ).value =
        "Observation Date";

      worksheet.getCell(
        "F4"
      ).font = {
        bold: true,
      };

      worksheet.mergeCells(
        "H4:K4"
      );

      worksheet.getCell(
        "H4"
      ).value =
        observationDate;

      worksheet.mergeCells(
        "A5:B5"
      );

      worksheet.getCell(
        "A5"
      ).value = "Report Code";

      worksheet.getCell(
        "A5"
      ).font = {
        bold: true,
      };

      worksheet.mergeCells(
        "C5:E5"
      );

      worksheet.getCell(
        "C5"
      ).value =
        selectedTemplate.code;

      worksheet.mergeCells(
        "F5:G5"
      );

      worksheet.getCell(
        "F5"
      ).value =
        "Station Filter";

      worksheet.getCell(
        "F5"
      ).font = {
        bold: true,
      };

      worksheet.mergeCells(
        "H5:K5"
      );

      const selectedStationName =
        selectedStation === "ALL"
          ? "All Municipal Wards"
          : (
              stations.find(
                (station) =>
                  String(
                    station.station_id ??
                    station.stationId ??
                    station.id
                  ) ===
                  String(
                    selectedStation
                  )
              )?.name ||
              stations.find(
                (station) =>
                  String(
                    station.station_id ??
                    station.stationId ??
                    station.id
                  ) ===
                  String(
                    selectedStation
                  )
              )?.station_name ||
              "Selected Station"
            );

      worksheet.getCell(
        "H5"
      ).value =
        selectedStationName;

      // --------------------------------------------------------
      // TABLE HEADER
      // --------------------------------------------------------

      const headerRow =
        worksheet.addRow([]);

      headerRow.values = [
        "Station / Ward Node",
        "Station ID",
        "Ward",
        "PM2.5 (µg/m³)",
        "PM10 (µg/m³)",
        "NO2 (µg/m³)",
        "AQI",
        "AQI Category",
        "Dominant Pollutant",
        "Data Availability",
        "Regulatory Audit",
      ];

      headerRow.height = 30;

      headerRow.eachCell(
        (cell) => {
          cell.font = {
            bold: true,
            color: {
              argb: "FFFFFF",
            },
          };

          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: "1D4ED8",
            },
          };

          cell.border = {
            top: {
              style: "thin",
              color: {
                argb: "CBD5E1",
              },
            },
            bottom: {
              style: "thin",
              color: {
                argb: "CBD5E1",
              },
            },
            left: {
              style: "thin",
              color: {
                argb: "CBD5E1",
              },
            },
            right: {
              style: "thin",
              color: {
                argb: "CBD5E1",
              },
            },
          };
        }
      );

      // --------------------------------------------------------
      // DATA ROWS
      // --------------------------------------------------------

      normalizedRecords.forEach(
        (row) => {
          const excelRow =
            worksheet.addRow([
              row.station,
              row.stationId,
              row.ward || "-",
              numberValue(row.pm25),
              numberValue(row.pm10),
              numberValue(row.no2),
              numberValue(row.aqi),
              row.category || "N/A",
              row.dominant || "-",
              row.availability ?? "N/A",
              row.compliance || "N/A",
            ]);

          excelRow.height = 25;

          excelRow.eachCell(
            (cell, columnNumber) => {
              cell.alignment = {
                vertical: "middle",
                horizontal:
                  columnNumber >= 4 &&
                  columnNumber <= 7
                    ? "center"
                    : "left",
              };

              cell.border = {
                top: {
                  style: "thin",
                  color: {
                    argb: "E2E8F0",
                  },
                },
                bottom: {
                  style: "thin",
                  color: {
                    argb: "E2E8F0",
                  },
                },
                left: {
                  style: "thin",
                  color: {
                    argb: "E2E8F0",
                  },
                },
                right: {
                  style: "thin",
                  color: {
                    argb: "E2E8F0",
                  },
                },
              };
            }
          );

          // Number formatting
          excelRow.getCell(4).numFmt =
            "0.0";

          excelRow.getCell(5).numFmt =
            "0.0";

          excelRow.getCell(6).numFmt =
            "0.0";

          excelRow.getCell(7).numFmt =
            "0";

          // Compliance formatting
          const complianceCell =
            excelRow.getCell(11);

          if (
            isCompliant(
              row.compliance
            )
          ) {
            complianceCell.font = {
              bold: true,
              color: {
                argb: "047857",
              },
            };

            complianceCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: {
                argb: "DCFCE7",
              },
            };
          } else {
            complianceCell.font = {
              bold: true,
              color: {
                argb: "B45309",
              },
            };

            complianceCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: {
                argb: "FEF3C7",
              },
            };
          }
        }
      );

      // --------------------------------------------------------
      // SUMMARY
      // --------------------------------------------------------

      const total =
        normalizedRecords.length;

      const compliant =
        normalizedRecords.filter(
          (row) =>
            isCompliant(
              row.compliance
            )
        ).length;

      const actionRequired =
        total - compliant;

      const summaryStart =
        worksheet.rowCount + 3;

      worksheet.mergeCells(
        `A${summaryStart}:K${summaryStart}`
      );

      worksheet.getCell(
        `A${summaryStart}`
      ).value =
        "REPORT SUMMARY";

      worksheet.getCell(
        `A${summaryStart}`
      ).font = {
        bold: true,
        size: 13,
      };

      worksheet.getCell(
        `A${summaryStart}`
      ).alignment = {
        horizontal: "left",
      };

      worksheet.getCell(
        `A${summaryStart}`
      ).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "DBEAFE",
        },
      };

      worksheet.mergeCells(
        `A${summaryStart + 1}:C${summaryStart + 1}`
      );

      worksheet.getCell(
        `A${summaryStart + 1}`
      ).value =
        "Total Stations";

      worksheet.getCell(
        `A${summaryStart + 1}`
      ).font = {
        bold: true,
      };

      worksheet.mergeCells(
        `D${summaryStart + 1}:E${summaryStart + 1}`
      );

      worksheet.getCell(
        `D${summaryStart + 1}`
      ).value = total;

      worksheet.mergeCells(
        `F${summaryStart + 1}:H${summaryStart + 1}`
      );

      worksheet.getCell(
        `F${summaryStart + 1}`
      ).value =
        "Compliant Stations";

      worksheet.getCell(
        `F${summaryStart + 1}`
      ).font = {
        bold: true,
      };

      worksheet.mergeCells(
        `I${summaryStart + 1}:K${summaryStart + 1}`
      );

      worksheet.getCell(
        `I${summaryStart + 1}`
      ).value =
        compliant;

      worksheet.mergeCells(
        `A${summaryStart + 2}:C${summaryStart + 2}`
      );

      worksheet.getCell(
        `A${summaryStart + 2}`
      ).value =
        "Action Required";

      worksheet.getCell(
        `A${summaryStart + 2}`
      ).font = {
        bold: true,
      };

      worksheet.mergeCells(
        `D${summaryStart + 2}:E${summaryStart + 2}`
      );

      worksheet.getCell(
        `D${summaryStart + 2}`
      ).value =
        actionRequired;

      // --------------------------------------------------------
      // FOOTER
      // --------------------------------------------------------

      const footerRow =
        summaryStart + 4;

      worksheet.mergeCells(
        `A${footerRow}:K${footerRow}`
      );

      worksheet.getCell(
        `A${footerRow}`
      ).value =
        "Prepared by PMC CAAQM System Gateway Engine | Maharashtra Pollution Control Board (MPCB)";

      worksheet.getCell(
        `A${footerRow}`
      ).font = {
        italic: true,
        size: 10,
        color: {
          argb: "64748B",
        },
      };

      worksheet.getCell(
        `A${footerRow}`
      ).alignment = {
        horizontal: "center",
      };

      // --------------------------------------------------------
      // AUTO FILTER
      // --------------------------------------------------------

      const tableHeaderNumber =
        7;

      const lastDataRow =
        worksheet.rowCount -
        (footerRow - worksheet.rowCount);

      worksheet.autoFilter = {
        from: `A${tableHeaderNumber}`,
        to: `K${tableHeaderNumber + normalizedRecords.length}`,
      };

      // --------------------------------------------------------
      // PAGE SETUP
      // --------------------------------------------------------

      worksheet.pageSetup = {
        orientation: "landscape",
        paperSize:
          worksheet.PAPERSIZE_A4,
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.25,
          right: 0.25,
          top: 0.5,
          bottom: 0.5,
          header: 0.2,
          footer: 0.2,
        },
      };

      // --------------------------------------------------------
      // DOWNLOAD XLSX
      // --------------------------------------------------------

      const buffer =
        await workbook.xlsx.writeBuffer();

      const blob = new Blob(
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
        `PMC_Air_Quality_Report_${observationDate}.xlsx`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(
        "Excel generation error:",
        err
      );

      alert(
        "Unable to generate the Excel report."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================
  // PDF EXPORT
  // ============================================================

  const exportPDF = () => {
    if (!normalizedRecords.length) {
      alert(
        "No report data is available for export."
      );

      return;
    }

    try {
      setIsGenerating(true);

      const doc =
        new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      // --------------------------------------------------------
      // TITLE
      // --------------------------------------------------------

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(18);

      doc.text(
        "PUNE MUNICIPAL CORPORATION",
        pageWidth / 2,
        15,
        {
          align: "center",
        }
      );

      doc.setFontSize(14);

      doc.text(
        "REGULATORY AIR QUALITY MONITORING REPORT",
        pageWidth / 2,
        23,
        {
          align: "center",
        }
      );

      // --------------------------------------------------------
      // REPORT DETAILS
      // --------------------------------------------------------

      doc.setFontSize(9);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `Report Type: ${selectedTemplate.title}`,
        14,
        32
      );

      doc.text(
        `Report Code: ${selectedTemplate.code}`,
        14,
        38
      );

      doc.text(
        `Observation Date: ${observationDate}`,
        14,
        44
      );

      doc.text(
        `Station: ${selectedStationName}`,
        120,
        32
      );

      doc.text(
        `Generated: ${new Date().toLocaleString(
          "en-IN"
        )}`,
        120,
        38
      );

      doc.text(
        "Standard: 24h Weighted CPCB Breakpoints",
        120,
        44
      );

      // --------------------------------------------------------
      // TABLE
      // --------------------------------------------------------

      const tableRows =
        normalizedRecords.map(
          (row) => [
            row.station,
            String(row.stationId),
            row.ward || "-",
            row.pm25 !== null &&
            row.pm25 !== undefined
              ? Number(row.pm25).toFixed(1)
              : "N/A",
            row.pm10 !== null &&
            row.pm10 !== undefined
              ? Number(row.pm10).toFixed(1)
              : "N/A",
            row.no2 !== null &&
            row.no2 !== undefined
              ? Number(row.no2).toFixed(1)
              : "N/A",
            row.aqi !== null &&
            row.aqi !== undefined
              ? String(
                  Math.round(
                    Number(row.aqi)
                  )
                )
              : "N/A",
            row.category || "N/A",
            row.dominant || "-",
            formatAvailability(
              row.availability
            ),
            row.compliance || "N/A",
          ]
        );

      autoTable(doc, {
        startY: 50,

        head: [
          [
            "Station / Ward",
            "ID",
            "Ward",
            "PM2.5",
            "PM10",
            "NO2",
            "AQI",
            "Category",
            "Dominant",
            "Data Rate",
            "Audit",
          ],
        ],

        body: tableRows,

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 7.5,
          cellPadding: 2.5,
          valign: "middle",
          lineWidth: 0.1,
        },

        headStyles: {
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
          fontSize: 7.5,
        },

        bodyStyles: {
          valign: "middle",
        },

        columnStyles: {
          0: {
            cellWidth: 39,
          },
          1: {
            cellWidth: 17,
            halign: "center",
          },
          2: {
            cellWidth: 22,
          },
          3: {
            cellWidth: 18,
            halign: "center",
          },
          4: {
            cellWidth: 18,
            halign: "center",
          },
          5: {
            cellWidth: 18,
            halign: "center",
          },
          6: {
            cellWidth: 13,
            halign: "center",
          },
          7: {
            cellWidth: 23,
          },
          8: {
            cellWidth: 25,
          },
          9: {
            cellWidth: 20,
            halign: "center",
          },
          10: {
            cellWidth: 28,
          },
        },

        didParseCell: (data) => {
          if (
            data.section ===
            "body"
          ) {
            // Compliance column
            if (
              data.column.index ===
              10
            ) {
              const value =
                String(
                  data.cell.raw || ""
                ).toLowerCase();

              if (
                value.includes(
                  "compliant"
                )
              ) {
                data.cell.styles.fontStyle =
                  "bold";
              } else {
                data.cell.styles.fontStyle =
                  "bold";
              }
            }
          }
        },
      });

      // --------------------------------------------------------
      // SUMMARY
      // --------------------------------------------------------

      const finalY =
        doc.lastAutoTable
          ?.finalY || 55;

      const total =
        normalizedRecords.length;

      const compliant =
        normalizedRecords.filter(
          (row) =>
            isCompliant(
              row.compliance
            )
        ).length;

      const actionRequired =
        total - compliant;

      let summaryY =
        finalY + 12;

      if (
        summaryY >
        pageHeight - 35
      ) {
        doc.addPage();
        summaryY = 20;
      }

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        "REPORT SUMMARY",
        14,
        summaryY
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(9);

      doc.text(
        `Total Stations: ${total}`,
        14,
        summaryY + 7
      );

      doc.text(
        `Compliant Stations: ${compliant}`,
        80,
        summaryY + 7
      );

      doc.text(
        `Action Required: ${actionRequired}`,
        160,
        summaryY + 7
      );

      // --------------------------------------------------------
      // FOOTER
      // --------------------------------------------------------

      doc.setFontSize(7.5);

      doc.setFont(
        "helvetica",
        "italic"
      );

      doc.text(
        "PMC CAAQM System Gateway Engine | Maharashtra Pollution Control Board (MPCB)",
        pageWidth / 2,
        pageHeight - 12,
        {
          align: "center",
        }
      );

      doc.text(
        `Page 1`,
        pageWidth - 14,
        pageHeight - 6,
        {
          align: "right",
        }
      );

      // --------------------------------------------------------
      // SAVE
      // --------------------------------------------------------

      doc.save(
        `PMC_Air_Quality_Report_${observationDate}.pdf`
      );
    } catch (err) {
      console.error(
        "PDF generation error:",
        err
      );

      alert(
        "Unable to generate the PDF report."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================
  // EXPORT HANDLER
  // ============================================================

  const handleExport = (
    format
  ) => {
    if (format === "PDF") {
      exportPDF();
    }

    if (format === "XLSX") {
      exportExcel();
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetFilters = () => {
    setSelectedStation("ALL");
    setObservationDate("2026-09-03");
    setReportType("CPCB_DAILY");
  };

  // ============================================================
  // SELECTED STATION NAME
  // ============================================================

  const selectedStationName =
    selectedStation === "ALL"
      ? "All Municipal Wards"
      : (
          stations.find(
            (station) =>
              String(
                station.station_id ??
                station.stationId ??
                station.id
              ) ===
              String(
                selectedStation
              )
          )?.name ||
          stations.find(
            (station) =>
              String(
                station.station_id ??
                station.stationId ??
                station.id
              ) ===
              String(
                selectedStation
              )
          )?.station_name ||
          "Selected Station"
        );

  // ============================================================
  // SUMMARY
  // ============================================================

  const totalStations =
    normalizedRecords.length;

  const compliantStations =
    normalizedRecords.filter(
      (row) =>
        isCompliant(
          row.compliance
        )
    ).length;

  const actionRequired =
    totalStations -
    compliantStations;

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">

        <div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">

            <span>
              Regulatory Compliance & Audits
            </span>

            <span>/</span>

            <span className="text-blue-600 font-bold">
              CPCB Section 11 Documentation
            </span>

          </div>

          <div className="flex items-center gap-3 flex-wrap">

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Regulatory Air Quality Reports
            </h1>

            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">

              <CheckCircle2 size={12} />

              NAAQS Certified

            </span>

          </div>

          <p className="text-xs text-slate-500 mt-1">
            Generate CPCB format compliance reports,
            daily ward audits, and continuous
            observation exports.
          </p>

        </div>

        {/* EXPORT BUTTONS */}

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() =>
              handleExport("PDF")
            }
            disabled={
              isGenerating ||
              isLoading ||
              !normalizedRecords.length
            }
            className="flex items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >

            {isGenerating ? (
              <RefreshCw
                size={14}
                className="animate-spin"
              />
            ) : (
              <Download
                size={14}
                className="text-rose-500"
              />
            )}

            <span>
              Export Official PDF
            </span>

          </button>

          <button
            type="button"
            onClick={() =>
              handleExport("XLSX")
            }
            disabled={
              isGenerating ||
              isLoading ||
              !normalizedRecords.length
            }
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition active:scale-95"
          >

            {isGenerating ? (
              <RefreshCw
                size={14}
                className="animate-spin"
              />
            ) : (
              <FileSpreadsheet
                size={14}
              />
            )}

            <span>
              Export Excel (.xlsx)
            </span>

          </button>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">

          <div className="flex items-start gap-3">

            <XCircle
              size={20}
              className="text-red-500 mt-0.5"
            />

            <div className="flex-1">

              <p className="text-sm font-black text-red-700">
                Unable to load report data
              </p>

              <p className="text-xs text-red-600 mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchReportData}
                className="mt-3 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >

                <RefreshCw size={13} />

                Retry

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          REPORT TEMPLATES
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">

        {REPORT_TEMPLATES.map(
          (item) => {

            const isSelected =
              reportType === item.id;

            return (
              <div
                key={item.id}
                onClick={() =>
                  setReportType(
                    item.id
                  )
                }
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-blue-500 shadow-[0_10px_30px_rgba(37,99,235,0.12)] ring-2 ring-blue-500/20"
                    : "bg-white/80 hover:bg-white border-slate-200 shadow-sm"
                }`}
              >

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      {item.code}
                    </span>

                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {item.status}
                    </span>

                  </div>

                  <h3 className="text-base font-black text-slate-900 mt-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>

                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">

                  <span>
                    Cycle: {item.frequency}
                  </span>

                  <span className="text-blue-600 font-bold">
                    {isSelected
                      ? "Selected ✓"
                      : "Select Template →"}
                  </span>

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* ======================================================
          PARAMETERS
      ====================================================== */}

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] mb-7">

        <div className="flex items-center gap-2 mb-5">

          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

            <FileText size={18} />

          </div>

          <div>

            <h2 className="text-sm font-black text-slate-900">
              Report Generation Parameters
            </h2>

            <p className="text-xs text-slate-400">
              Filter parameters before compiling
              the official regulatory log
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* STATION */}

          <div>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
              Monitoring Station / Node
            </label>

            <div className="relative">

              <Building2
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />

              <select
                value={selectedStation}
                onChange={(e) =>
                  setSelectedStation(
                    e.target.value
                  )
                }
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 cursor-pointer transition shadow-inner"
              >

                <option value="ALL">
                  All Municipal Wards
                  (Consolidated)
                </option>

                {stations.map(
                  (station) => {

                    const stationId =
                      station.station_id ??
                      station.stationId ??
                      station.id;

                    const stationName =
                      station.name ??
                      station.station_name ??
                      station.stationName ??
                      "Unnamed Station";

                    const ward =
                      station.ward
                        ? ` (${station.ward})`
                        : "";

                    return (
                      <option
                        key={stationId}
                        value={stationId}
                      >
                        {stationName}
                        {ward}
                      </option>
                    );
                  }
                )}

              </select>

            </div>

          </div>

          {/* DATE */}

          <div>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
              Observation Date
            </label>

            <div className="relative">

              <Calendar
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />

              <input
                type="date"
                value={observationDate}
                onChange={(e) =>
                  setObservationDate(
                    e.target.value
                  )
                }
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition shadow-inner"
              />

            </div>

          </div>

          {/* ACTION */}

          <div className="flex items-end gap-2">

            <button
              type="button"
              onClick={fetchReportData}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >

              {isLoading ? (
                <>
                  <RefreshCw
                    size={15}
                    className="animate-spin"
                  />

                  Loading...
                </>
              ) : (
                <>
                  <Search size={15} />

                  Compile & Preview
                </>
              )}

            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl transition"
            >
              Reset
            </button>

          </div>

        </div>

      </div>

      {/* ======================================================
          REPORT TABLE
      ====================================================== */}

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

          <div>

            <div className="flex items-center gap-2">

              <h2 className="text-base font-black text-slate-900">
                Official Municipal Environmental Audit Table
              </h2>

              <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">
                Ref: {observationDate}
              </span>

            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              CPCB Schedule VII Ambient Air Quality
              Monitoring Compliance Matrix
            </p>

          </div>

          <div className="text-xs text-slate-500 font-medium">

            Standard:{" "}

            <strong className="text-slate-800">
              24h Weighted CPCB Breakpoints
            </strong>

          </div>

        </div>

        {/* LOADING */}

        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center">

            <RefreshCw
              size={32}
              className="text-blue-600 animate-spin"
            />

            <p className="text-sm font-black text-slate-700 mt-4">
              Loading report data...
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Fetching data from the backend
            </p>

          </div>
        )}

        {/* EMPTY */}

        {!isLoading &&
          !error &&
          normalizedRecords.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">

              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">

                <FileText
                  size={28}
                  className="text-slate-400"
                />

              </div>

              <h3 className="text-sm font-black text-slate-700 mt-4">
                No report data found
              </h3>

              <p className="text-xs text-slate-400 mt-1 max-w-md">
                There are no readings or AQI
                records available for the
                selected station and observation
                date.
              </p>

            </div>
          )}

        {/* TABLE */}

        {!isLoading &&
          normalizedRecords.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs">

                <thead>

                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">

                    <th className="pb-3 pl-2">
                      Station / Ward Node
                    </th>

                    <th className="pb-3">
                      PM2.5 (24h)
                    </th>

                    <th className="pb-3">
                      PM10 (24h)
                    </th>

                    <th className="pb-3">
                      NO2 (24h)
                    </th>

                    <th className="pb-3">
                      Calculated AQI
                    </th>

                    <th className="pb-3">
                      Dominant
                    </th>

                    <th className="pb-3">
                      Data Rate
                    </th>

                    <th className="pb-3 text-right pr-2">
                      Regulatory Audit
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {normalizedRecords.map(
                    (row, index) => {

                      const compliant =
                        isCompliant(
                          row.compliance
                        );

                      return (
                        <tr
                          key={`${row.stationId}-${index}`}
                          className="hover:bg-slate-50 transition"
                        >

                          <td className="py-4 pl-2">

                            <div className="font-black text-slate-900">
                              {row.station}
                            </div>

                            {row.ward && (
                              <div className="text-[10px] text-slate-400">
                                {row.ward}
                              </div>
                            )}

                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {row.stationId}
                            </div>

                          </td>

                          <td className="py-4 font-bold text-slate-700">
                            {formatPollutant(
                              row.pm25
                            )}
                          </td>

                          <td className="py-4 font-bold text-slate-700">
                            {formatPollutant(
                              row.pm10
                            )}
                          </td>

                          <td className="py-4 font-bold text-slate-700">
                            {formatPollutant(
                              row.no2
                            )}
                          </td>

                          <td className="py-4">

                            <span className="text-sm font-black text-slate-900">
                              {formatAQI(
                                row.aqi
                              )}
                            </span>

                            {row.category &&
                              row.category !==
                                "N/A" && (
                                <span className="text-[10px] text-slate-400 ml-1">
                                  (
                                  {
                                    row.category
                                  }
                                  )
                                </span>
                              )}

                          </td>

                          <td className="py-4 font-semibold text-blue-600">
                            {row.dominant}
                          </td>

                          <td className="py-4 font-mono font-bold text-emerald-600">
                            {formatAvailability(
                              row.availability
                            )}
                          </td>

                          <td className="py-4 text-right pr-2">

                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                                compliant
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >

                              {compliant ? (
                                <CheckCircle2
                                  size={12}
                                />
                              ) : (
                                <AlertTriangle
                                  size={12}
                                />
                              )}

                              {row.compliance}

                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        {!isLoading &&
          normalizedRecords.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Stations Reported
                </p>

                <p className="text-2xl font-black text-slate-900 mt-1">
                  {totalStations}
                </p>

              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">

                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
                  Compliant
                </p>

                <p className="text-2xl font-black text-emerald-700 mt-1">
                  {compliantStations}
                </p>

              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">

                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-600">
                  Action Required
                </p>

                <p className="text-2xl font-black text-amber-700 mt-1">
                  {actionRequired}
                </p>

              </div>

            </div>
          )}

        {/* ====================================================
            SIGN OFF
        ==================================================== */}

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">

          <span>
            Digital Signature:{" "}
            <strong className="text-slate-600">
              PMC CAAQM System Gateway Engine
            </strong>
          </span>

          <span>
            Prepared for: Maharashtra Pollution
            Control Board (MPCB)
          </span>

        </div>

      </div>

      {/* ======================================================
          BOTTOM ACTION
      ====================================================== */}

      <div className="mt-5 flex items-center justify-between">

        <div className="text-[11px] text-slate-400 flex items-center gap-2">

          <CheckCircle2
            size={13}
            className="text-emerald-500"
          />

          Report data retrieved from PMC CAAQM backend

        </div>

        <button
          type="button"
          onClick={exportPDF}
          disabled={
            isGenerating ||
            isLoading ||
            !normalizedRecords.length
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
        >

          <Printer size={14} />

          {isGenerating
            ? "Generating..."
            : "Generate PDF"}

        </button>

      </div>

    </div>
  );
}