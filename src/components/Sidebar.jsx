import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Bell,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Radio,
  CloudRain,
  Cpu,
  ShieldCheck
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: "Pune Areas",
      path: "/pune-areas",
      icon: MapPin,
      badge: "5 Nodes"
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: Bell,
      badge: "2",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      badge: null
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileText,
      badge: null
    }
  ];

  const adminItems = [
    {
      name: "Device Health",
      path: "/device-health",
      icon: Cpu,
      badge: "QA/QC",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-[#0b1329] via-[#0f1c3f] to-[#090e1f] text-slate-200 border-r border-slate-800/80 h-screen flex flex-col justify-between select-none sticky top-0 shrink-0 font-sans z-30 shadow-[4px_0_24px_rgba(0,0,0,0.35)] relative overflow-hidden">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute -top-16 -left-16 w-44 h-44 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header: Municipal Brand Identity */}
      <div className="relative z-10">
        <div className="p-6 pb-5 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0 border border-white/20">
              <CloudRain size={22} className="drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-tight">PMC Weather</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              </div>
              <p className="text-[11px] font-semibold text-blue-300/80">CAAQM Air Portal</p>
            </div>
          </div>

          {/* Real-Time Grid Status Capsule */}
          <div className="mt-4 flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-[11px] font-semibold backdrop-blur-md">
            <span className="flex items-center gap-2 text-slate-300">
              <Radio size={13} className="text-emerald-400 animate-ping" />
              <span>Telemetry Grid</span>
            </span>
            <span className="text-emerald-300 font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              Active
            </span>
          </div>
        </div>

        {/* 2. Primary Navigation */}
        <div className="px-3.5 py-4 space-y-5">
          
          {/* Main Monitoring Section */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2 font-mono">
              Monitoring Core
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 relative ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30 translate-x-1"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            size={17}
                            className={`${
                              isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                            } transition-colors`}
                          />
                          <span>{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              isActive
                                ? "bg-white/20 text-white border-white/30"
                                : item.badgeColor || "bg-blue-500/20 text-blue-300 border-blue-400/30"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Configuration & System Admin Section */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2 font-mono">
              System Admin
            </span>
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 relative ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30 translate-x-1"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            size={17}
                            className={`${
                              isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                            } transition-colors`}
                          />
                          <span>{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              isActive
                                ? "bg-white/20 text-white border-white/30"
                                : item.badgeColor || "bg-blue-500/20 text-blue-300 border-blue-400/30"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

        </div>
      </div>

      {/* 3. Bottom Hardware Health Dock & Officer Profile */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40 backdrop-blur-md relative z-10">
        
        
        {/* Officer Card with Inline Logout */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
              PO
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">PMC Officer</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">Ward Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>

    </aside>
  );
}