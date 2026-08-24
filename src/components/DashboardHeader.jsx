import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronDown } from "lucide-react";

import areas from "../data/areas";

function DashboardHeader() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Filter areas according to search
  const filteredAreas = areas.filter((area) =>
    area.name.toLowerCase().includes(search.toLowerCase())
  );

  // When user selects an area
  const handleSelectArea = (area) => {
    setSearch(area.name);
    setShowResults(false);

    navigate(`/dashboard?area=${encodeURIComponent(area.name)}`);
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">

      {/* LEFT SIDE */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Air Quality Monitoring Dashboard
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Pune Municipal Corporation
        </p>
      </div>


      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">

        {/* SEARCH */}
        <div className="relative hidden md:block">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search area..."
            className="w-56 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {/* SEARCH RESULTS */}
          {showResults && search.trim() !== "" && (
            <div className="absolute top-12 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">

              {filteredAreas.length > 0 ? (

                filteredAreas.map((area) => (

                  <button
                    key={area.id}
                    onClick={() => handleSelectArea(area)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >

                    <p className="text-sm font-semibold text-gray-900">
                      {area.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {area.ward} • {area.zone}
                    </p>

                  </button>

                ))

              ) : (

                <div className="px-4 py-3 text-sm text-gray-500">
                  No area found
                </div>

              )}

            </div>
          )}

        </div>


        {/* NOTIFICATION */}
        <button className="relative text-gray-500 hover:text-gray-900">

          <Bell size={21} />

          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />

        </button>


        {/* USER */}
        <div className="flex items-center gap-3">

          <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            P
          </div>

          <div className="hidden lg:block">

            <p className="text-sm font-semibold text-gray-900">
              PMC Officer
            </p>

            <p className="text-xs text-gray-500">
              Administrator
            </p>

          </div>

          <ChevronDown
            size={17}
            className="text-gray-400"
          />

        </div>

      </div>

    </header>
  );
}

export default DashboardHeader;