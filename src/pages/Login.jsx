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
  MapPin,
  Building2,
  Leaf,
  BarChart3,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId.trim() || !password) {
      setError("Please enter both your User ID and password.");
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
        if (response.data?.session?.access_token) {
          localStorage.setItem("token", response.data.session.access_token);
        }
        if (response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
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
      setError(err.response?.data?.message || "Invalid User ID or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans flex flex-col bg-slate-900">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/pune-bg.jpg')" }}
      />

      {/* Gradient overlays for legibility */}
      <div className="absolute inset-0 bg-slate-950/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#062B50]/45 via-[#0B63B6]/15 to-[#061827]/50" />

      {/* ==========================================
          TOP BRANDING
      ========================================== */}
      <header className="relative z-20 flex items-start justify-between px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8">
        <div className="flex items-center gap-3 text-white">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-white/50 bg-white/10 backdrop-blur-md flex items-center justify-center">
            <Building2 size={24} className="text-white" />
          </div>
          <div>
            
            <p className="text-[7px] sm:text-[9px] uppercase tracking-[0.22em] text-white/65 mt-1">
              Cleaner Air ·  Greener Tomorrow
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-start gap-2 text-white/85">
          <Leaf size={25} className="text-emerald-200 mt-1" />
          <div>
            <p className="text-sm font-medium">Breathe Better</p>
            
            <div className="w-8 h-px bg-white/50 mt-2" />
          </div>
        </div>
      </header>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[680px] h-auto md:h-[460px] grid grid-cols-1 md:grid-cols-[42%_58%] overflow-hidden rounded-[24px] border border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
          {/* ==========================================
              LEFT MONITORING PANEL
          ========================================== */}
          <section className="relative bg-gradient-to-br from-[#063E73]/95 via-[#075BA5]/95 to-[#08396B]/95 text-white p-6 sm:p-8 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute bottom-0 -left-16 w-52 h-52 rounded-full bg-sky-400/10" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-300/20 text-[9px] font-bold tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 animate-ping opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                LIVE AIR QUALITY MONITORING
              </div>

              <div className="mt-6">
                
                <div className="flex gap-3 mt-2 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <CloudSun size={21} />
                  </div>
                  <h1 className="text-xl sm:text-[25px] font-black leading-tight">
                    Air Quality
                    <br />
                    Monitoring System
                  </h1>
                </div>
                
              </div>

              {/* AQI CARD */}
              <div className="mt-5 bg-white/[0.10] backdrop-blur-md border border-white/15 rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-200">
                      <MapPin size={11} />
                      <span className="text-[9px] font-bold tracking-wide">
                        SHIVAJINAGAR CENTRAL
                      </span>
                    </div>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-4xl font-black leading-none">42</span>
                      <span className="text-xs font-bold text-blue-100 mb-1">AQI</span>
                    </div>
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-emerald-400/20 text-[8px] font-bold text-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                      GOOD AIR QUALITY
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-300">
                    <Activity size={22} />
                  </div>
                </div>

                <div className="border-t border-white/15 mt-4 pt-3">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-blue-200">Dominant Pollutant</span>
                    <span className="font-bold">PM2.5 · 18 µg/m³</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 mt-3 text-[9px] text-blue-100">
                  <div className="flex items-center gap-1">
                    <Thermometer size={11} />
                    28.4°C
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <Droplets size={11} />
                    68%
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Wind size={11} />
                    10 km/h
                  </div>
                </div>
              </div>

              {/* BOTTOM KPIs */}
              

              
            </div>
          </section>

          {/* ==========================================
              RIGHT LOGIN PANEL
          ========================================== */}
          <section className="bg-white/95 backdrop-blur-xl p-7 sm:p-9 flex flex-col">
            <div>
              <div className="flex items-center gap-2 text-[#075BA5]">
                <ShieldCheck size={15} />
                <span className="text-[9px] font-bold uppercase tracking-[0.12em]">
                  Authorized Access
                </span>
              </div>
              <h2 className="text-[27px] sm:text-[32px] font-black text-slate-900 mt-3 tracking-tight">
                Welcome back
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5">
                Sign in to access the PMC Air Quality Monitoring Dashboard.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-[11px] font-semibold"
              >
                <AlertCircle size={15} />
                <span className="flex-1">{error}</span>
                <button type="button" onClick={() => setError("")} className="font-bold">
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {/* USER ID */}
              <div>
                <label
                  htmlFor="userId"
                  className="block text-[9px] font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Officer / User ID
                </label>
                <div className="relative">
                  <Building2
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="userId"
                    type="text"
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your registered User ID"
                    autoComplete="username"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-900 outline-none transition focus:bg-white focus:border-[#075BA5] focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-[9px] font-bold uppercase tracking-wider text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[9px] font-bold text-[#075BA5] hover:text-[#063E73]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <ShieldCheck
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
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
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-900 outline-none transition focus:bg-white focus:border-[#075BA5] focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-3.5 h-3.5 accent-[#075BA5]"
                />
                <label htmlFor="remember">Remember me</label>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#075BA5] to-[#063E73] hover:from-[#0869BD] hover:to-[#052F59] text-white text-[10px] font-bold tracking-wide shadow-lg shadow-blue-900/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    LOGIN TO MONITORING DASHBOARD
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              
            </form>

            {/* FOOTER */}
            
          </section>
        </div>
      </main>

      {/* ==========================================
          BOTTOM SLOGAN
      ========================================== */}
      <div className="relative z-20 hidden sm:flex justify-end px-10 lg:px-14 pb-4 text-white/70">
        <div className="flex items-center gap-3 text-[8px] uppercase tracking-[0.2em]">
          <span>Our City</span>
          <span className="w-1 h-1 rounded-full bg-white/60" />
          <span>Our Air</span>
          <span className="w-1 h-1 rounded-full bg-white/60" />
          <span>Our Responsibility</span>
        </div>
      </div>
    </div>
  );
}