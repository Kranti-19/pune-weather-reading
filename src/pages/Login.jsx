// <<<<<<< Updated upstream
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Activity,
  Database,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [time, setTime] = useState("");

  // --------------------------------------------------
  // LIVE CLOCK - INDIA
  // --------------------------------------------------
  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!userId.trim() || !password) {
      setError("Please enter both your PMC User ID and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          userId: userId.trim(),
          password,
        }
      );

      if (response.data?.status === "success") {
        // Store authentication token
        if (response.data?.session?.access_token) {
          localStorage.setItem(
            "token",
            response.data.session.access_token
          );
        }

        // Store logged-in user information
        if (response.data?.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
        }

        navigate("/dashboard");
      } else {
        setError(
          response.data?.message ||
            "Unable to sign in. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
          "Invalid PMC User ID or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-sky-500 selection:text-white overflow-hidden bg-slate-100">

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes sunPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.45;
          }

          50% {
            transform: scale(1.15);
            opacity: 0.75;
          }
        }

        @keyframes cloudDrift {
          0% {
            transform: translateX(-40px);
          }

          50% {
            transform: translateX(40px);
          }

          100% {
            transform: translateX(-40px);
          }
        }

        .animate-float {
          animation: floatSlow 6s ease-in-out infinite;
        }

        .animate-pulse-sun {
          animation: sunPulse 8s ease-in-out infinite;
        }

        .animate-drift {
          animation: cloudDrift 20s ease-in-out infinite;
        }
      `}</style>

      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2560&auto=format&fit=crop')`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-tr from-sky-900/40 via-sky-500/20 to-amber-200/35 backdrop-blur-[2px]" />

      {/* Ambient light */}
      <div className="absolute -top-24 right-1/4 w-[550px] h-[550px] bg-amber-300/30 rounded-full blur-[140px] pointer-events-none animate-pulse-sun" />

      <div className="absolute -bottom-28 left-1/4 w-[500px] h-[500px] bg-cyan-300/25 rounded-full blur-[140px] pointer-events-none" />

      {/* =====================================================
          TOP TELEMETRY BAR
      ====================================================== */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">

        {/* System Icon */}
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-white/60 px-4 py-2 rounded-2xl shadow-lg pointer-events-auto">

          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
            <CloudSun size={18} />
          </div>

          <div className="hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Municipal AQMS
            </p>

            <p className="text-xs font-black text-slate-800">
              Pune Environmental Grid
            </p>
          </div>

        </div>

        {/* Live Time + Humidity */}
        <div className="hidden sm:flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-white/60 px-4 py-2 rounded-2xl shadow-lg text-slate-700 pointer-events-auto text-xs font-semibold">

          <div className="flex items-center gap-1.5 text-sky-700">
            <Droplets size={14} />
            <span>68%</span>
          </div>

          <span className="text-slate-300">•</span>

          <span className="text-slate-500 font-mono">
            {time || "12:00 PM"}
          </span>

        </div>
      </div>

      {/* =====================================================
          MAIN LOGIN CARD
      ====================================================== */}
      <div className="relative z-10 w-full max-w-4xl rounded-[36px] overflow-hidden shadow-[0_30px_90px_rgba(14,116,144,0.35)] border border-white/80 bg-white/40 backdrop-blur-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px]">

        {/* ===================================================
            LEFT PANEL
        ==================================================== */}
        <div className="md:col-span-5 bg-gradient-to-br from-sky-600/90 via-blue-600/80 to-indigo-700/90 p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">

          {/* Decorative clouds */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none animate-drift" />

          <div className="absolute bottom-4 -left-12 w-56 h-56 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

          {/* -------------------------------------------------
              PRODUCT INTRO
          -------------------------------------------------- */}
          <div className="relative z-10">

            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">

              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />

              <span>LIVE MONITORING</span>

            </div>

            <h2 className="text-2xl sm:text-3xl font-black mt-6 tracking-tight leading-tight drop-shadow-sm">
              Pune Municipal
              <br />
              Environmental Grid
            </h2>

            <p className="text-xs text-sky-100 font-medium mt-2 leading-relaxed opacity-90">
              Real-time air quality monitoring, station telemetry,
              environmental data and municipal alerts.
            </p>

          </div>

          {/* =================================================
              AQI FEATURE CARD
          ================================================== */}
          <div className="relative z-10 my-6 bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-5 shadow-xl animate-float">

            <div className="flex items-center justify-between">

              <div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-200">
                  Shivajinagar Central
                </span>

                <div className="flex items-baseline gap-2 mt-1">

                  <span className="text-5xl font-black">
                    42
                  </span>

                  <span className="text-sm font-bold text-emerald-200">
                    AQI
                  </span>

                </div>

                <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-[10px] font-bold text-emerald-100">
                  Good • CPCB
                </span>

              </div>

              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-amber-300 shadow-inner">
                <Activity size={30} />
              </div>

            </div>

            {/* Dominant pollutant */}
            <div className="mt-4 pt-3 border-t border-white/20">

              <div className="flex items-center justify-between text-xs">

                <span className="text-sky-200">
                  Dominant Pollutant
                </span>

                <span className="font-bold text-white">
                  PM2.5 • 18 µg/m³
                </span>

              </div>

            </div>

            {/* Weather context */}
            <div className="mt-3 flex items-center justify-between text-xs font-semibold">

              <div className="flex items-center gap-1.5 text-sky-100">
                <Thermometer size={13} />
                <span>28.4°C</span>
              </div>

              <div className="flex items-center gap-1 text-sky-100">
                <Droplets size={13} />
                <span>68%</span>
              </div>

              <div className="flex items-center gap-1 text-sky-100">
                <Wind size={13} />
                <span>10 km/h WNW</span>
              </div>

            </div>

          </div>

          {/* =================================================
              BOTTOM AQMS KPIs
          ================================================== */}
          <div className="grid grid-cols-2 gap-2.5 relative z-10 text-xs">

            {/* Active Stations */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20">

              <div className="flex items-center gap-1.5">

                <Activity size={12} className="text-emerald-200" />

                <span className="text-[10px] text-sky-200 font-semibold uppercase">
                  Active Stations
                </span>

              </div>

              <span className="text-lg font-black mt-0.5 block">
                5 / 5 Online
              </span>

            </div>

            {/* Data Availability */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20">

              <div className="flex items-center gap-1.5">

                <Database size={12} className="text-emerald-200" />

                <span className="text-[10px] text-sky-200 font-semibold uppercase">
                  Data Availability
                </span>

              </div>

              <span className="text-lg font-black mt-0.5 block">
                98.7% Today
              </span>

            </div>

          </div>

        </div>

        {/* ===================================================
            RIGHT LOGIN PANEL
        ==================================================== */}
        <div className="md:col-span-7 bg-white/80 backdrop-blur-3xl p-8 sm:p-12 flex flex-col justify-between">

          <div>

            {/* -------------------------------------------------
                LOGIN HEADER
            -------------------------------------------------- */}
            <div>

              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-700 bg-sky-100/80 px-2.5 py-1 rounded-md">
                Authorized Officer Access
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
                Welcome back
              </h1>

            </div>

            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-md">
              Sign in with your authorized municipal credentials
              to access the Air Quality Monitoring Dashboard.
            </p>

            {/* =================================================
                ERROR MESSAGE
            ================================================== */}
            {error && (
              <div
                role="alert"
                className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-semibold shadow-sm"
              >

                <AlertCircle
                  size={16}
                  className="shrink-0 text-rose-500"
                />

                <span className="flex-1">
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                  className="font-bold text-base leading-none hover:text-rose-900"
                >
                  ×
                </button>

              </div>
            )}

            {/* =================================================
                LOGIN FORM
            ================================================== */}
            <form
              onSubmit={handleLogin}
              className="mt-7 space-y-5"
            >

              {/* PMC USER ID */}
              <div>

                <label
                  htmlFor="userId"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 pl-1"
                >
                  PMC User ID
                </label>

                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your PMC User ID"
                  autoComplete="username"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-slate-50/90 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-2xl text-xs font-semibold text-slate-900 outline-none transition shadow-sm focus:ring-4 focus:ring-sky-500/15 disabled:opacity-60"
                />

              </div>

              {/* PASSWORD */}
              <div>

                <div className="flex items-center justify-between mb-1.5 pl-1">

                  <label
                    htmlFor="password"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 transition"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="relative">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="w-full pl-4 pr-11 py-3.5 bg-slate-50/90 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-2xl text-xs font-semibold text-slate-900 outline-none transition shadow-sm focus:ring-4 focus:ring-sky-500/15 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

              </div>

              {/* SECURITY INFORMATION */}
              <div className="flex items-center gap-2 px-1 text-xs text-emerald-600 font-semibold">

                <ShieldCheck size={15} />

                <span>
                  Secure authorized officer portal
                </span>

              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin text-white"
                    />

                    <span>
                      Signing in...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Login to Monitoring Dashboard
                    </span>

                    <ArrowRight
                      size={15}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}

              </button>

            </form>

          </div>

          {/* =================================================
              FOOTER
          ================================================== */}
          <div className="mt-8 pt-4 border-t border-slate-200/80">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs text-slate-500">
                  Need access to the monitoring system?
                </p>

                <p className="text-[10px] text-slate-400 mt-0.5">
                  Contact your municipal system administrator.
                </p>

              </div>

              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                PMC • AQMS
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
// =======
// >>>>>>> Stashed changes
