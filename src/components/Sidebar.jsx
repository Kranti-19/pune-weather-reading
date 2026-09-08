import React from "react";
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
  Activity,
  Waves,
  RadioTower,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
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

  const NavigationItem = ({
    item,
  }) => {
    const Icon = item.icon;

    return (
      <NavLink
        to={item.path}
        className={({ isActive }) => `
          relative
          group
          flex
          items-center
          justify-between
          w-full
          px-3
          py-2.5
          rounded-xl
          text-[13px]
          font-semibold
          transition-all
          duration-200
          border
          ${
            isActive
              ? `
                bg-gradient-to-r
                from-[#4F46E5]
                to-[#6366F1]
                text-white
                border-[#4F46E5]
                shadow-[0_7px_18px_rgba(79,70,229,0.20)]
              `
              : `
                bg-transparent
                text-[#526176]
                border-transparent
                hover:bg-[#EEF2FF]
                hover:text-[#4338CA]
              `
          }
        `}
      >
        {({ isActive }) => (
          <>
            {/* LEFT SIDE */}

            <div className="flex items-center gap-3">

              {/* ICON BOX */}

              <div
                className={`
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  shrink-0
                  transition-all
                  ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-white text-[#64748B] shadow-[0_1px_4px_rgba(15,23,42,0.05)] group-hover:text-[#4F46E5]"
                  }
                `}
              >
                <Icon
                  size={17}
                  strokeWidth={
                    isActive
                      ? 2.4
                      : 2
                  }
                />
              </div>

              <span>
                {item.name}
              </span>

            </div>

            {/* BADGE */}

            {item.badge && (
              <span
                className={`
                  px-2
                  py-1
                  rounded-md
                  text-[8px]
                  font-extrabold
                  tracking-wide
                  ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-[#EEFDF7] text-[#059669] border border-[#D1FAE5]"
                  }
                `}
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
        bg-[#F7F8FC]
        text-[#1E293B]
        border-r
        border-[#E5E7EB]
        font-sans
        select-none
        shrink-0
      "
    >

      {/* =================================================
          BRAND AREA
      ================================================= */}

      <div
        className="
          h-[108px]
          px-6
          flex
          items-center
          bg-white
          border-b
          border-[#E7EAF0]
        "
      >

        <div className="flex items-center gap-3">

          {/* =================================================
              NEW CUSTOM AIR QUALITY LOGO
          ================================================= */}

          <div
            className="
              relative
              w-[48px]
              h-[48px]
              rounded-[15px]
              bg-gradient-to-br
              from-[#4F46E5]
              via-[#6366F1]
              to-[#06B6D4]
              flex
              items-center
              justify-center
              shrink-0
              shadow-[0_7px_18px_rgba(79,70,229,0.22)]
              overflow-hidden
            "
          >

            {/* DECORATIVE CIRCLE */}

            <div
              className="
                absolute
                -right-3
                -top-3
                w-7
                h-7
                rounded-full
                bg-white/10
              "
            />

            {/* AIR WAVE */}

            <div className="relative">

              <Waves
                size={27}
                strokeWidth={2.4}
                className="text-white"
              />

            </div>

            {/* SENSOR DOT */}

            <span
              className="
                absolute
                bottom-[8px]
                right-[9px]
                w-[5px]
                h-[5px]
                rounded-full
                bg-[#A7F3D0]
                shadow-[0_0_6px_rgba(167,243,208,0.9)]
              "
            />

          </div>

          {/* =================================================
              BRAND TEXT
          ================================================= */}

          <div>

            <div className="flex items-center gap-2">

              <span
                className="
                  text-[16px]
                  font-extrabold
                  tracking-[-0.02em]
                  text-[#172033]
                "
              >
                PMC Weather
              </span>

              <span
                className="
                  w-[7px]
                  h-[7px]
                  rounded-full
                  bg-[#10B981]
                "
              />

            </div>

            <div
              className="
                mt-1
                text-[9px]
                font-semibold
                tracking-[0.02em]
                text-[#94A3B8]
              "
            >
              AIR QUALITY • MONITORING
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          MAIN NAVIGATION
      ================================================= */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-4
          py-6
        "
      >

        {/* =================================================
            MONITORING CORE
        ================================================= */}

        <div className="mb-8">

          <div className="flex items-center gap-2 px-3 mb-3">

            <span
              className="
                w-5
                h-[1px]
                bg-[#CBD5E1]
              "
            />

            <span
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.16em]
                text-[#94A3B8]
              "
            >
              Monitoring Core
            </span>

          </div>

          <nav className="space-y-1.5">

            {navItems.map(
              (item) => (
                <NavigationItem
                  key={
                    item.name
                  }
                  item={
                    item
                  }
                />
              )
            )}

          </nav>

        </div>

        {/* =================================================
            SYSTEM ADMIN
        ================================================= */}

        <div>

          <div className="flex items-center gap-2 px-3 mb-3">

            <span
              className="
                w-5
                h-[1px]
                bg-[#CBD5E1]
              "
            />

            <span
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.16em]
                text-[#94A3B8]
              "
            >
              System Admin
            </span>

          </div>

          <nav className="space-y-1.5">

            {adminItems.map(
              (item) => (
                <NavigationItem
                  key={
                    item.name
                  }
                  item={
                    item
                  }
                />
              )
            )}

          </nav>

        </div>

      </div>

      {/* =================================================
          BOTTOM AREA
      ================================================= */}

      <div
        className="
          px-4
          py-4
          bg-white
          border-t
          border-[#E7EAF0]
        "
      >

        {/* =================================================
            LIVE SYSTEM STATUS
        ================================================= */}

        <div
          className="
            relative
            flex
            items-center
            justify-between
            px-3
            py-2.5
            mb-3
            rounded-xl
            bg-gradient-to-r
            from-[#F0FDF9]
            to-[#F0F9FF]
            border
            border-[#D9F3EA]
          "
        >

          <div className="flex items-center gap-2.5">

            {/* STATUS ICON */}

            <div
              className="
                w-7
                h-7
                rounded-lg
                bg-white
                border
                border-[#D9F3EA]
                flex
                items-center
                justify-center
              "
            >
              <Activity
                size={14}
                className="text-[#10B981]"
              />
            </div>

            <div>

              <p
                className="
                  text-[9px]
                  font-bold
                  text-[#64748B]
                "
              >
                System Status
              </p>

              <p
                className="
                  text-[10px]
                  font-extrabold
                  text-[#059669]
                "
              >
                All systems operational
              </p>

            </div>

          </div>

          <span
            className="
              w-2
              h-2
              rounded-full
              bg-[#10B981]
              shadow-[0_0_7px_rgba(16,185,129,0.55)]
            "
          />

        </div>

        {/* =================================================
            OFFICER PROFILE
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            p-2.5
            rounded-xl
            bg-[#F8FAFC]
            border
            border-[#E2E8F0]
            shadow-[0_2px_7px_rgba(15,23,42,0.04)]
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              min-w-0
            "
          >

            {/* PROFILE */}

            <div
              className="
                relative
                w-10
                h-10
                rounded-xl
                bg-gradient-to-br
                from-[#EEF2FF]
                to-[#E0F2FE]
                border
                border-[#D9E2FF]
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
                  text-[#4F46E5]
                "
              >
                PO
              </span>

              <span
                className="
                  absolute
                  bottom-[-1px]
                  right-[-1px]
                  w-2.5
                  h-2.5
                  rounded-full
                  bg-[#10B981]
                  border-2
                  border-white
                "
              />

            </div>

            {/* USER */}

            <div className="min-w-0">

              <p
                className="
                  text-[12px]
                  font-extrabold
                  text-[#1E293B]
                  truncate
                "
              >
                PMC Officer
              </p>

              <p
                className="
                  text-[9px]
                  font-medium
                  text-[#94A3B8]
                  mt-0.5
                  truncate
                "
              >
                Ward Administrator
              </p>

            </div>

          </div>

          {/* LOGOUT */}

          <button
            onClick={
              handleLogout
            }
            title="Sign Out"
            className="
              w-8
              h-8
              rounded-lg
              flex
              items-center
              justify-center
              text-[#94A3B8]
              hover:text-[#EF4444]
              hover:bg-[#FEF2F2]
              transition-all
              duration-200
              shrink-0
            "
          >
            <LogOut
              size={16}
              strokeWidth={2}
            />
          </button>

        </div>

      </div>

    </aside>
  );
}