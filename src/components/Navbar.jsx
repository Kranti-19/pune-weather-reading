import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, X, Bell } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PUNE_AREAS_LIST = [
  { name: "Katraj", ward: "Ward 42", zone: "South Zone", aqi: 125, id: "6" },
  { name: "Kothrud", ward: "Ward 10", zone: "West Zone", aqi: 118, id: "1" },
  { name: "Hinjewadi", ward: "Ward 25", zone: "North-West Zone", aqi: 92, id: "2" },
  { name: "Hadapsar", ward: "Ward 15", zone: "East Zone", aqi: 156, id: "3" },
  { name: "Kharadi", ward: "Ward 17", zone: "East Zone", aqi: 134, id: "4" },
  { name: "Baner", ward: "Ward 8", zone: "West Zone", aqi: 214, id: "5" },
];

export default function Navbar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentArea = searchParams.get("area") || "";

  const [query, setQuery] = useState(currentArea);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Keep input in sync with URL
  useEffect(() => {
    setQuery(currentArea);
  }, [currentArea]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = PUNE_AREAS_LIST.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.ward.toLowerCase().includes(query.toLowerCase()) ||
      item.zone.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectArea = (areaName) => {
    setQuery(areaName);
    setIsOpen(false);
    navigate(`/dashboard?area=${encodeURIComponent(areaName)}`);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    navigate("/dashboard");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30">
      <div>
        <h1 className="font-bold text-lg text-slate-900">
          Air Quality Monitoring Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Pune Municipal Corporation
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-72" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search area..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full pl-9 pr-8 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {query && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleClear();
                }}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && filtered.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
              {filtered.map((item) => (
                <div
                  key={item.name}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevents blur before click executes
                    handleSelectArea(item.name);
                  }}
                  className="p-3 hover:bg-slate-50 cursor-pointer transition flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.ward} • {item.zone}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    AQI {item.aqi}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bell */}
        <button
          onClick={() => navigate("/alerts")}
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* Officer Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
            P
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800">PMC Officer</p>
            <p className="text-[10px] text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </nav>
  );
}