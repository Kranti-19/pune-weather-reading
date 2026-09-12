import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowUpRight, AlertTriangle, ShieldCheck } from "lucide-react";

const numberValue = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

// Maps raw pollutant keys to clear primary formulas and secondary full names
const getPollutantDisplay = (rawName) => {
  const key = String(rawName || "").toUpperCase().trim();
  switch (key) {
    case "PM2.5":
    case "PM25":
      return {
        formula: <>PM<sub className="font-bold">2.5</sub></>,
        fullName: "Particulate Matter",
      };
    case "PM10":
      return {
        formula: <>PM<sub className="font-bold">10</sub></>,
        fullName: "Particulate Matter",
      };
    case "NO2":
      return {
        formula: <>NO<sub className="font-bold">2</sub></>,
        fullName: "Nitrogen Dioxide",
      };
    case "SO2":
      return {
        formula: <>SO<sub className="font-bold">2</sub></>,
        fullName: "Sulfur Dioxide",
      };
    case "O3":
      return {
        formula: <>O<sub className="font-bold">3</sub></>,
        fullName: "Ozone",
      };
    case "NH3":
      return {
        formula: <>NH<sub className="font-bold">3</sub></>,
        fullName: "Ammonia",
      };
    case "CO":
      return {
        formula: "CO",
        fullName: "Carbon Monoxide",
      };
    case "PB":
      return {
        formula: "Pb",
        fullName: "Lead",
      };
    default:
      return {
        formula: rawName,
        fullName: "Criteria Pollutant",
      };
  }
};

export default function MajorPollutantGrid({ pollutants = [] }) {
  const navigate = useNavigate();

  const getRibbonTheme = (val, standard) => {
    const value = numberValue(val);
    const std = numberValue(standard);

    if (val === null || val === undefined) {
      return {
        ribbon: "bg-slate-300",
        badge: "bg-slate-100 text-slate-500 border-slate-200",
        statusText: "No Data",
        isAlert: false,
      };
    }

    const ratio = std > 0 ? value / std : 0;

    if (ratio > 1.0) {
      return {
        ribbon: "bg-rose-500",
        badge: "bg-rose-50 text-rose-700 border-rose-200",
        statusText: "Exceeded Limit",
        isAlert: true,
      };
    }

    if (ratio >= 0.75) {
      return {
        ribbon: "bg-amber-400",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        statusText: "Moderate Exposure",
        isAlert: false,
      };
    }

    return {
      ribbon: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      statusText: "Within Safe Limit",
      isAlert: false,
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Activity size={15} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">
              Major Ambient Pollutants
            </h2>
            
          </div>
        </div>

        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 w-fit">
          {pollutants.length} Monitored Parameters
        </span>
      </div>

      {/* 4-column balanced grid (2 rows of 4 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {pollutants.map((pollutant) => {
          const theme = getRibbonTheme(pollutant.value, pollutant.standard);
          const display = getPollutantDisplay(pollutant.name);
          const formattedVal =
            pollutant.value != null ? numberValue(pollutant.value).toFixed(1) : "—";

          return (
            <div
              key={pollutant.name || pollutant.key}
              onClick={() => navigate("/analytics")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/analytics")}
              className="relative overflow-hidden bg-white border border-slate-200/90 rounded-xl p-3 pl-3.5 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-150 cursor-pointer flex flex-col justify-between group"
            >
              {/* Left Colored Ribbon Indicator */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.ribbon}`}
              />

              {/* Top Row: Formula Name & Value */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-slate-900 tracking-tight block truncate group-hover:text-blue-600 transition-colors">
                      {display.formula}
                    </span>
                    {theme.isAlert && (
                      <AlertTriangle size={12} className="text-rose-500 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[9.5px] text-slate-400 block truncate font-medium">
                    {display.fullName}
                  </span>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-black font-mono tracking-tight text-slate-900 leading-none">
                    {formattedVal}
                  </div>
                  <span className="text-[9px] font-semibold font-mono text-slate-400">
                    {pollutant.unit || "µg/m³"}
                  </span>
                </div>
              </div>

              {/* Bottom Row: CPCB Limit & Status Badge */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                <span className="text-[9px] text-slate-400 font-mono truncate">
                  Limit: {pollutant.standard ?? "—"}
                </span>

                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold border ${theme.badge} shrink-0`}
                >
                  {!theme.isAlert && <ShieldCheck size={8} />}
                  {theme.statusText === "Within Safe Limit" ? "Safe" : theme.statusText === "Moderate Exposure" ? "Moderate" : "Exceeded"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}