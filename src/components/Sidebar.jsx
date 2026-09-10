import React, { useEffect, useState } from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  MapPin,
  Bell,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Wind,
  RadioTower,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        "Unable to read logged-in user:",
        error
      );
    }
  }, []);

  // =====================================================
  // USER DETAILS
  // =====================================================

  const fullName =
    user?.fullName || "PMC Officer";

  const pmcUserId =
    user?.pmcUserId || "PMC User";

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (name) => {
    if (!name) return "PO";

    const parts =
      name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const initials = getInitials(fullName);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const token =
        localStorage.getItem("token");

      if (token) {
        try {
          await fetch(
            "http://localhost:5000/api/auth/logout",
            {
              method: "POST",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            }
          );
        } catch (error) {
          console.warn(
            "Backend logout failed:",
            error
          );
        }
      }
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);

      navigate("/login", {
        replace: true,
      });

      setLoggingOut(false);
    }
  };

  // =====================================================
  // MAIN NAVIGATION
  // =====================================================

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Pune Areas",
      path: "/pune-areas",
      icon: MapPin,
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: Bell,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileText,
    },
  ];

  // =====================================================
  // ADMIN NAVIGATION
  // =====================================================

  const adminItems = [
    {
      name: "Device Health",
      path: "/device-health",
      icon: RadioTower,
      badge: "QA/QC",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  // =====================================================
  // NAVIGATION ITEM
  // =====================================================

  const NavigationItem = ({ item }) => {
    const Icon = item.icon;

    return (
      <NavLink
        to={item.path}
        className={({ isActive }) => `
          group
          flex
          items-center
          justify-between

          w-full
          h-[45px]

          px-3
          rounded-xl

          border

          transition-all
          duration-200

          ${
            isActive
              ? `
                bg-[#7BBDE8]
                border-[#7BBDE8]
                text-white
                shadow-[0_4px_10px_rgba(73,118,159,0.16)]
              `
              : `
                bg-transparent
                border-transparent
                text-white
                hover:bg-[#4E8EA2]
                hover:border-[#6EA2B3]
              `
          }
        `}
      >
        {({ isActive }) => (
          <>
            {/* LEFT */}

            <div className="flex items-center gap-3">

              {/* ICON */}

              <div
                className={`
                  w-8
                  h-8
                  rounded-lg

                  flex
                  items-center
                  justify-center

                  shrink-0

                  ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-[#E2F0F6]"
                  }
                `}
              >
                <Icon
                  size={17}
                  strokeWidth={
                    isActive ? 2.4 : 2
                  }
                />
              </div>

              {/* NAME */}

              <span
                className="
                  text-[13px]
                  font-semibold
                  whitespace-nowrap
                "
              >
                {item.name}
              </span>

            </div>

            {/* BADGE */}

            {item.badge && (
              <span
                className="
                  px-2
                  py-1

                  rounded-md

                  bg-white/15

                  border
                  border-white/25

                  text-[8px]
                  font-bold
                  text-white
                "
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  // =====================================================
  // SIDEBAR
  // =====================================================

  return (
    <aside
      className="
        w-[270px]
        min-w-[270px]

        h-screen

        sticky
        top-0

        z-40

        flex
        flex-col

        bg-[#49769F]

        text-white

        border-r
        border-[#3F668A]

        font-sans

        select-none

        shrink-0

        overflow-hidden
      "
    >

      {/* =================================================
          BRAND HEADER
      ================================================= */}

      <div
        className="
          h-[88px]
          min-h-[88px]

          px-6

          flex
          items-center

          bg-[#49769F]

          border-b
          border-white/15

          shrink-0
        "
      >

        <div className="flex items-center gap-3">

          {/* LOGO */}

          <div
            className="
              relative

              w-[46px]
              h-[46px]

              rounded-2xl

              bg-[#BDD8E9]

              flex
              items-center
              justify-center

              shrink-0

              shadow-[0_4px_12px_rgba(30,70,100,0.18)]
            "
          >

            <div
              className="
                w-[35px]
                h-[35px]

                rounded-xl

                bg-[#4E8EA2]

                flex
                items-center
                justify-center
              "
            >
              <Wind
                size={22}
                strokeWidth={2.4}
                className="text-white"
              />
            </div>

            <span
              className="
                absolute

                top-[5px]
                right-[5px]

                w-[6px]
                h-[6px]

                rounded-full

                bg-[#7BBDE8]

                border
                border-white
              "
            />

          </div>

          {/* BRAND */}

          <div>

            <div className="flex items-center gap-2">

              <span
                className="
                  text-[16px]
                  font-extrabold
                  tracking-tight
                  text-white
                  whitespace-nowrap
                "
              >
                PMC Weather
              </span>

              <span
                className="
                  w-[7px]
                  h-[7px]
                  rounded-full
                  bg-[#BDD8E9]
                "
              />

            </div>

            <div
              className="
                mt-0.5

                text-[9px]
                font-bold

                tracking-[0.07em]

                text-[#E2F0F6]

                whitespace-nowrap
              "
            >
              AIR QUALITY MONITORING
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div
        className="
          flex-1

          px-5

          pt-5
          pb-3

          overflow-hidden
        "
      >

        {/* =================================================
            MONITORING CORE
        ================================================= */}

        <div>

          <div
            className="
              px-2
              mb-2

              text-[10px]
              font-extrabold

              uppercase

              tracking-[0.13em]

              text-[#BDD8E9]
            "
          >
            Monitoring Core
          </div>

          <nav className="space-y-1">

            {navItems.map(
              (item) => (
                <NavigationItem
                  key={item.name}
                  item={item}
                />
              )
            )}

          </nav>

        </div>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div
          className="
            mx-2

            my-4

            h-px

            bg-white/15
          "
        />

        {/* =================================================
            SYSTEM ADMIN
        ================================================= */}

        <div>

          <div
            className="
              px-2
              mb-2

              text-[10px]
              font-extrabold

              uppercase

              tracking-[0.13em]

              text-[#BDD8E9]
            "
          >
            System Admin
          </div>

          <nav className="space-y-1">

            {adminItems.map(
              (item) => (
                <NavigationItem
                  key={item.name}
                  item={item}
                />
              )
            )}

          </nav>

        </div>

      </div>

      {/* =================================================
          LOGGED-IN USER
      ================================================= */}

      <div
        className="
          px-4
          py-3

          bg-[#4E8EA2]

          border-t
          border-white/15

          shrink-0
        "
      >

        <div
          className="
            flex
            items-center
            justify-between

            p-2.5

            rounded-xl

            bg-[#BDD8E9]

            border
            border-white/20

            shadow-[0_3px_9px_rgba(30,70,100,0.12)]
          "
        >

          {/* USER */}

          <div
            className="
              flex
              items-center
              gap-2.5

              min-w-0
            "
          >

            {/* AVATAR */}

            <div
              className="
                relative

                w-10
                h-10

                rounded-xl

                bg-[#49769F]

                flex
                items-center
                justify-center

                shrink-0
              "
            >

              <span
                className="
                  text-[11px]
                  font-black
                  text-white
                "
              >
                {initials}
              </span>

              {/* ONLINE */}

              <span
                className="
                  absolute

                  bottom-[-1px]
                  right-[-1px]

                  w-2.5
                  h-2.5

                  rounded-full

                  bg-[#4CAF78]

                  border-2
                  border-[#BDD8E9]
                "
              />

            </div>

            {/* DETAILS */}

            <div
              className="
                min-w-0
                max-w-[145px]
              "
            >

              <p
                className="
                  text-[12px]
                  font-extrabold

                  text-[#263F55]

                  truncate
                "
                title={fullName}
              >
                {fullName}
              </p>

              <p
                className="
                  text-[9px]
                  font-semibold

                  text-[#49769F]

                  mt-0.5

                  truncate
                "
                title={pmcUserId}
              >
                PMC ID: {pmcUserId}
              </p>

            </div>

          </div>

          {/* =================================================
              LOGOUT
          ================================================= */}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="
              w-8
              h-8

              rounded-lg

              flex
              items-center
              justify-center

              shrink-0

              text-[#49769F]

              hover:bg-white/40
              hover:text-[#263F55]

              transition-all

              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >

            {loggingOut ? (
              <span
                className="
                  w-4
                  h-4

                  rounded-full

                  border-2
                  border-[#49769F]

                  border-t-transparent

                  animate-spin
                "
              />
            ) : (
              <LogOut
                size={17}
                strokeWidth={2.2}
              />
            )}

          </button>

        </div>

      </div>

    </aside>
  );
}
