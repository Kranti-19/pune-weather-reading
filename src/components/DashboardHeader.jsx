import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";

import areas from "../data/areas";

function DashboardHeader() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Unable to read logged-in user:", error);
      }
    }
  }, []);

  // =====================================================
  // SEARCH AREAS
  // =====================================================

  const filteredAreas = areas.filter((area) =>
    area.name.toLowerCase().includes(search.toLowerCase())
  );

  // =====================================================
  // SELECT AREA
  // =====================================================

  const handleSelectArea = (area) => {
    setSearch(area.name);
    setShowResults(false);

    navigate(
      `/dashboard?area=${encodeURIComponent(area.name)}`
    );
  };

  // =====================================================
  // OPEN ALERT CONFIGURATION
  // =====================================================

  const handleAlertConfiguration = () => {
    setShowProfileMenu(false);

    navigate("/admin/alert-configuration");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear frontend session
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      setShowProfileMenu(false);

      navigate("/login");
    }
  };

  // =====================================================
  // USER INFORMATION
  // =====================================================

  const fullName = user?.fullName || "PMC Officer";
  const pmcUserId = user?.pmcUserId || "PMC User";

  const avatarLetter = fullName
    .charAt(0)
    .toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">

      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Air Quality Monitoring Dashboard
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Pune Municipal Corporation
        </p>
      </div>


      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="flex items-center gap-5">

        {/* =================================================
            SEARCH
        ================================================= */}

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


        {/* =================================================
            NOTIFICATION
        ================================================= */}

        <button
          className="relative text-gray-500 hover:text-gray-900 transition"
          title="Notifications"
          onClick={() => navigate("/alerts")}
        >

          <Bell size={21} />

          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />

        </button>


        {/* =================================================
            USER PROFILE
        ================================================= */}

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setShowProfileMenu((previous) => !previous)
            }
            className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition"
          >

            {/* AVATAR */}

            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
              {avatarLetter}
            </div>


            {/* USER DETAILS */}

            <div className="hidden lg:block text-left">

              <p className="text-sm font-semibold text-gray-900">
                {fullName}
              </p>

              <p className="text-xs text-gray-500">
                PMC ID: {pmcUserId}
              </p>

            </div>


            {/* ARROW */}

            <ChevronDown
              size={17}
              className={`text-gray-400 transition-transform duration-200 ${
                showProfileMenu
                  ? "rotate-180"
                  : ""
              }`}
            />

          </button>


          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

          {showProfileMenu && (

            <div className="absolute right-0 top-14 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden">

              {/* USER INFORMATION */}

              <div className="px-4 py-4 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {avatarLetter}
                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {fullName}
                    </p>

                    <p className="text-xs text-gray-500 truncate">
                      PMC ID: {pmcUserId}
                    </p>

                    <p className="text-[11px] text-blue-600 mt-1">
                      PMC Officer
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  ADMIN ALERT CONFIGURATION
              ================================================= */}

              <button
                type="button"
                onClick={handleAlertConfiguration}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
              >

                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Settings
                    size={17}
                    className="text-blue-600"
                  />
                </div>

                <div>

                  <p className="font-medium text-gray-800">
                    Alert Configuration
                  </p>

                  <p className="text-xs text-gray-400 mt-0.5">
                    Manage alert thresholds
                  </p>

                </div>

              </button>


              {/* =================================================
                  LOGOUT
              ================================================= */}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition text-left border-t border-gray-100"
              >

                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <LogOut size={17} />
                </div>

                <span className="font-medium">
                  Logout
                </span>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default DashboardHeader;