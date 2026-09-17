import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/apiClient";

import {
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Leaf,
  Activity,
  Menu,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId.trim() || !password) {
      setError("Please enter your User ID and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        userId: userId.trim(),
        password,
      });

      console.log("Login response:", response.data);

      if (
        response.data?.status === "success" ||
        response.data?.token ||
        response.data?.session
      ) {
        const token =
          response.data?.session?.access_token ||
          response.data?.token ||
          response.data?.data?.token;

        if (token) {
          localStorage.setItem("token", token);
        }

        if (response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        navigate("/dashboard", { replace: true });
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
          "Invalid User ID or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="relative h-screen overflow-hidden bg-[#061d2d] font-sans">
      {/* BACKGROUND IMAGE */}
      {/* =====================================================
    BACKGROUND IMAGE
===================================================== */}

<div
  className="absolute inset-0 bg-cover bg-center brightness-[1.08] saturate-[1.05]"
  style={{
    backgroundImage: "url('/pune-bg.jpg')",
  }}
/>

{/* Soft readable overlay */}
<div className="absolute inset-0 bg-[#073b4c]/10" />

{/* Subtle blue / teal atmosphere */}
<div className="absolute inset-0 bg-gradient-to-br from-[#0b6b7a]/15 via-transparent to-[#062238]/15" />

{/* Very light vignette */}
<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,20,30,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[#062238]/35" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#034563]/55 via-[#08788b]/15 to-[#03131f]/45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,12,20,0.38)_100%)]" />

      {/* TOP HEADER */}
      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md sm:h-12 sm:w-12">
            <Building2 size={21} strokeWidth={1.6} />
          </div>
          <div>
           
            <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-[8px]">
              Cleaner Air · Healthier Pune · Greener Tomorrow
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex h-8 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 text-[9px] font-bold text-white backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            SYSTEM OPERATIONAL
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Leaf size={20} className="text-emerald-200" />
            
          </div>
        </div>
      </header>

      {/* MAIN — height is header-aware, card scrolls internally only if it truly can't fit */}
      <main className="relative z-10 flex h-[calc(100vh-72px)] sm:h-[calc(100vh-84px)] items-center justify-center overflow-y-auto px-4 py-3">
        <div className="w-full max-w-[420px]">
          <div className="mb-3 text-center sm:hidden">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              PMC Air Quality Monitoring
            </div>
          </div>

          <div className="max-h-[90vh] overflow-y-auto rounded-[24px] border border-white/50 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            {/* CARD TOP BRANDING */}
            <div className="border-b border-slate-100 bg-gradient-to-br from-white via-white to-blue-50/60 px-6 pb-4 pt-5 sm:px-8 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#075BA5] text-white shadow-lg shadow-blue-200">
                    <Activity size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black tracking-tight text-slate-900">
                      PMC AirPulse
                    </p>
                    <p className="mt-0.5 text-[7.5px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Air Quality Monitoring
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 md:hidden"
                  aria-label="Menu"
                >
                  <Menu size={16} />
                </button>
              </div>

              

              <h2 className="mt-2.5 text-[24px] font-black leading-[1.05] tracking-[-0.03em] text-slate-950 sm:text-[27px]">
                Welcome back
              </h2>

              
            </div>

            {/* FORM */}
            <div className="px-6 py-5 sm:px-8 sm:py-6">
              {error && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[10px] font-semibold text-red-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* USER ID */}
                <div>
                  <label
                    htmlFor="userId"
                    className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-700"
                  >
                    Officer / User ID
                  </label>
                  <div className="relative">
                    <Building2
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      disabled={loading}
                      required
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-9 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#075BA5] focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-700"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[9px] font-bold text-[#075BA5] transition hover:text-[#064a87]"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <ShieldCheck
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      disabled={loading}
                      required
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-10 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#075BA5] focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-slate-400 transition hover:text-slate-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* REMEMBER ME */}
                <div className="flex items-center">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-[#075BA5]"
                    />
                    <span className="text-[10px] font-medium text-slate-500">
                      Remember me
                    </span>
                  </label>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#075BA5] text-[10px] font-black uppercase tracking-[0.04em] text-white shadow-[0_10px_25px_rgba(7,91,165,0.22)] transition-all duration-200 hover:bg-[#064d8c] hover:shadow-[0_14px_30px_rgba(7,91,165,0.28)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to AirPulse
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* SECURITY */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <ShieldCheck size={13} className="text-emerald-600" />
                <p className="text-[9px] font-semibold text-slate-500">
                  Secure access for authorized PMC personnel only
                </p>
              </div>
            </div>

            {/* CARD FOOTER */}
            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3 sm:px-8">
              <div className="flex items-center justify-between">
                <div>
                  
                  
                </div>
                
              </div>
            </div>
          </div>

          {/* BOTTOM STATUS */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[7px] font-bold uppercase tracking-[0.18em] text-white/60">
            <span>Our City</span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span>Our Air</span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span>Our Responsibility</span>
          </div>
        </div>
      </main>
    </div>
  );
}