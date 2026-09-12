import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  ArrowUpRight,
  ArrowUpDown,
  Search,
  Flame,
} from "lucide-react";

const numberValue = (val, fallback = 0) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

const getCategoryDetails = (aqi) => {
  const val = numberValue(aqi);
  if (val <= 50) {
    return {
      label: "Good",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      gaugeColor: "#10b981",
      benchmark: "Within limit",
    };
  }
  if (val <= 100) {
    return {
      label: "Satisfactory",
      badge: "bg-lime-50 text-lime-800 border-lime-200",
      gaugeColor: "#84cc16",
      benchmark: "Within limit",
    };
  }
  if (val <= 200) {
    return {
      label: "Moderate",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      gaugeColor: "#f59e0b",
      benchmark: `${(val / 100).toFixed(1)}x limit`,
    };
  }
  if (val <= 300) {
    return {
      label: "Poor",
      badge: "bg-orange-50 text-orange-800 border-orange-200",
      gaugeColor: "#ea580c",
      benchmark: `${(val / 100).toFixed(1)}x limit`,
    };
  }
  if (val <= 400) {
    return {
      label: "Very Poor",
      badge: "bg-rose-50 text-rose-800 border-rose-200",
      gaugeColor: "#e11d48",
      benchmark: `${(val / 100).toFixed(1)}x limit`,
    };
  }
  return {
    label: "Severe",
    badge: "bg-red-50 text-red-900 border-red-300",
    gaugeColor: "#7f1d1d",
    benchmark: `${(val / 100).toFixed(1)}x limit`,
  };
};

export default function WardPollutionLeaderboard({ stations = [] }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAscending, setSortAscending] = useState(false);

  const baseStations = useMemo(() => {
    if (stations && stations.length > 0) return stations;
    return [
      { id: 1, code: "PMC-004", name: "Hadapsar Monitoring Station", ward: "Hadapsar", zone: "East", aqi: 77, pm25: 40.68, pm10: 76.92 },
      { id: 2, code: "PMC-003", name: "Kothrud Monitoring Station", ward: "Kothrud", zone: "West", aqi: 75, pm25: 45.2, pm10: 72.8 },
      { id: 3, code: "PMC-001", name: "Baner Monitoring Station", ward: "Aundh-Baner", zone: "West", aqi: 67, pm25: 14.89, pm10: 66.71 },
      { id: 4, code: "PMC-002", name: "Shivajinagar Monitoring Station", ward: "Shivajinagar", zone: "Central", aqi: 64, pm25: 8.97, pm10: 64.21 },
      { id: 5, code: "PMC-010", name: "Aundh Air Monitoring Station", ward: "Aundh", zone: "West", aqi: 0, pm25: "—", pm10: "—" },
    ];
  }, [stations]);

  const filteredAndRanked = useMemo(() => {
    return [...baseStations]
      .filter((st) => {
        const query = searchTerm.toLowerCase();
        return (
          st.name?.toLowerCase().includes(query) ||
          st.ward?.toLowerCase().includes(query) ||
          st.zone?.toLowerCase().includes(query) ||
          st.code?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const aqiA = numberValue(a.aqi);
        const aqiB = numberValue(b.aqi);
        return sortAscending ? aqiA - aqiB : aqiB - aqiA;
      });
  }, [baseStations, searchTerm, sortAscending]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Trophy size={16} />
            </div>
            <h2 className="text-sm font-black text-slate-900">
              Pune Ward Air Quality Leaderboard
            </h2>
            <span className="text-[9.5px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Ranked Real-Time
            </span>
          </div>
          
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-48 sm:w-60">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ward or station..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
            />
          </div>

          <button
            onClick={() => setSortAscending((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition shrink-0"
          >
            <ArrowUpDown size={12} className="text-slate-500" />
            <span>{sortAscending ? "Lowest First" : "Highest First"}</span>
          </button>
        </div>
      </div>

      {/* Table Container without horizontal scrollbar */}
      <div className="w-full">
        <table className="w-full table-auto text-left">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <th className="pb-3 pl-2 w-12">Rank</th>
              <th className="pb-3 px-3">Ward & Station</th>
              <th className="pb-3 px-3 text-center w-24">Live AQI</th>
              <th className="pb-3 px-3 w-36">Status & Limit</th>
              <th className="pb-3 px-3 w-40">PM2.5 / PM10</th>
              <th className="pb-3 pr-2 text-right w-28">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredAndRanked.map((st, index) => {
              const cat = getCategoryDetails(st.aqi);
              const rankNumber = index + 1;
              const isTopPolluted = !sortAscending && rankNumber === 1;

              return (
                <tr
                  key={st.code || st.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3.5 pl-2 align-middle">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-mono font-black text-xs ${
                        isTopPolluted
                          ? "bg-rose-100 text-rose-700"
                          : rankNumber <= 3
                          ? "bg-slate-100 text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      #{rankNumber}
                    </span>
                  </td>

                  {/* Ward & Station */}
                  <td className="py-3.5 px-3 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 text-xs block truncate group-hover:text-blue-600 transition-colors">
                          {st.ward || "Ward"} • {st.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          {st.zone || "Zone"} • {st.code || `PMC-00${st.id}`}
                        </span>
                      </div>
                      {isTopPolluted && (
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-tight flex items-center gap-0.5 shrink-0">
                          <Flame size={10} /> Highest
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Live AQI */}
                  <td className="py-3.5 px-3 text-center align-middle whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.gaugeColor }}
                      />
                      <span className="font-mono font-black text-xs text-slate-900 leading-none">
                        {st.aqi}
                      </span>
                    </div>
                  </td>

                  {/* Merged CPCB Status + Benchmark */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${cat.badge}`}
                    >
                      {cat.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                      {cat.benchmark}
                    </span>
                  </td>

                  {/* PM2.5 / PM10 */}
                  <td className="py-3.5 px-3 font-mono text-xs text-slate-600 align-middle whitespace-nowrap">
                    <span className="font-bold text-slate-800">{st.pm25 ?? "—"}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="font-bold text-slate-800">{st.pm10 ?? "—"}</span>
                    <span className="text-slate-400 text-[9.5px] ml-1 font-sans">µg/m³</span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 pr-2 text-right align-middle whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/station/${st.code || st.id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[11px] font-bold transition shadow-2xs group/btn"
                    >
                      <span>Diagnose</span>
                      <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}