import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import {
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Leaf,
  Activity,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    userId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // =========================================================
  // HANDLE REGISTER
  // =========================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    // Check all fields
    if (
      !formData.fullName.trim() ||
      !formData.userId.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://pune-weather-reading.onrender.com/api/auth/register",
        {
          fullName: formData.fullName,
          pmcUserId: formData.userId,
          email: formData.email,
          password: formData.password,
        }
      );

      console.log(
        "Registration response:",
        response.data
      );

      alert("Account created successfully!");

      navigate("/login");
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#dcecf0] font-sans">

      {/* =====================================================
          BACKGROUND IMAGE
      ===================================================== */}

      <div
        className="fixed inset-0 bg-cover bg-center brightness-[1.12] saturate-[1.08]"
        style={{
          backgroundImage: "url('/pune-bg.jpg')",
        }}
      />

      {/* Light environmental tint */}

      <div className="fixed inset-0 bg-[#0b6175]/10" />

      {/* Soft blue atmosphere */}

      <div className="fixed inset-0 bg-gradient-to-br from-[#087b91]/10 via-transparent to-[#0b3150]/10" />

      {/* Very subtle vignette */}

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,20,30,0.10)_100%)]" />

        


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 flex min-h-[calc(100vh-75px)] items-center justify-center px-4 py-6 sm:px-6 sm:py-8">

        <div className="w-full max-w-[850px]">


          {/* =================================================
              REGISTER CARD
          ================================================= */}

          <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_25px_75px_rgba(0,0,0,0.28)]">


            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="border-b border-slate-100 bg-gradient-to-br from-white via-white to-blue-50/60 px-6 pb-5 pt-6 sm:px-8">

              <div className="flex items-center justify-between">

                {/* Brand */}

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#075BA5] text-white shadow-lg shadow-blue-200">

                    <Activity
                      size={19}
                      strokeWidth={1.8}
                    />

                  </div>

                  <div>

                    <p className="text-[14px] font-black tracking-tight text-slate-900">
                      PMC AirPulse
                    </p>

                    <p className="mt-0.5 text-[7.5px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Air Quality Monitoring
                    </p>

                  </div>

                </div>


                {/* Login link */}

                <Link
                  to="/login"
                  className="hidden items-center gap-1.5 text-[9px] font-bold text-[#075BA5] transition hover:text-[#064d8c] sm:flex"
                >
                  Already have an account?
                  <span className="underline underline-offset-2">
                    Sign in
                  </span>
                </Link>

              </div>
          

              {/* Heading */}

              <h1 className="mt-3 text-[27px] font-black leading-none tracking-[-0.035em] text-slate-950 sm:text-[31px]">
                Create your account
              </h1>

              <p className="mt-2 max-w-[520px] text-[10px] leading-5 text-slate-500 sm:text-[11px]">
                Register to access the Pune Municipal Corporation
                Air Quality Monitoring System.
              </p>

            </div>


            {/* =================================================
                FORM AREA
            ================================================= */}

            <div className="px-6 py-6 sm:px-8 sm:py-7">


              {/* ERROR MESSAGE */}

              {error && (

                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[10px] font-semibold text-red-700">

                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span className="flex-1">
                    {error}
                  </span>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="text-red-500 transition hover:text-red-700"
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>

                </div>

              )}


              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleRegister}
                className="space-y-4"
              >


                {/* =================================================
                    ROW 1
                ================================================= */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">


                  {/* FULL NAME */}

                  <div>

                    <label
                      htmlFor="fullName"
                      className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-700"
                    >
                      Full Name
                    </label>

                    <div className="relative">

                      <User
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        disabled={loading}
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-9 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#075BA5] focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                    </div>

                  </div>


                  {/* PMC USER ID */}

                  <div>

                    <label
                      htmlFor="userId"
                      className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-700"
                    >
                      PMC User ID
                    </label>

                    <div className="relative">

                      <Building2
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="userId"
                        type="text"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        placeholder="Enter your PMC User ID"
                        autoComplete="username"
                        disabled={loading}
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-9 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#075BA5] focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                    </div>

                  </div>

                </div>


                {/* =================================================
                    OFFICIAL EMAIL
                ================================================= */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-700"
                  >
                    Official Email
                  </label>

                  <div className="relative">

                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your official email address"
                      autoComplete="email"
                      disabled={loading}
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-9 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#075BA5] focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>

                </div>


                {/* =================================================
                    PASSWORD ROW
                ================================================= */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">


                  {/* PASSWORD */}

                  <div>

                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-700"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        disabled={loading}
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-10 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#075BA5] focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        disabled={loading}
                        className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center text-slate-400 transition hover:text-slate-700"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >

                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}

                      </button>

                    </div>

                  </div>


                  {/* CONFIRM PASSWORD */}

                  <div>

                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-700"
                    >
                      Confirm Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        disabled={loading}
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-10 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#075BA5] focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        disabled={loading}
                        className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center text-slate-400 transition hover:text-slate-700"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >

                        {showConfirmPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}

                      </button>

                    </div>

                  </div>

                </div>


                {/* PASSWORD REQUIREMENT */}

                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">

                  <ShieldCheck
                    size={13}
                    className="text-slate-400"
                  />

                  <p className="text-[8px] font-medium text-slate-500">

                    Password must contain at least 6 characters.

                  </p>

                </div>


                {/* =================================================
                    CREATE ACCOUNT BUTTON
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#075BA5] text-[10px] font-black uppercase tracking-[0.04em] text-white shadow-[0_10px_25px_rgba(7,91,165,0.22)] transition-all duration-200 hover:bg-[#064d8c] hover:shadow-[0_14px_30px_rgba(7,91,165,0.28)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (

                    <>

                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Creating Account...

                    </>

                  ) : (

                    <>

                      Create PMC AirPulse Account

                      <ArrowRight
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />

                    </>

                  )}

                </button>

              </form>


              {/* =================================================
                  MOBILE LOGIN LINK
              ================================================= */}

              <div className="mt-5 text-center sm:hidden">

                <p className="text-[10px] text-slate-500">

                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="font-bold text-[#075BA5]"
                  >
                    Sign in
                  </Link>

                </p>

              </div>


              {/* =================================================
                  SECURITY
              ================================================= */}

              
            </div>


            {/* =================================================
                CARD FOOTER
            ================================================= */}

            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3 sm:px-8">

              
            </div>

          </div>


          {/* =================================================
              BOTTOM SLOGAN
          ================================================= */}

          <div className="mt-3 flex items-center justify-center gap-2 text-[7px] font-bold uppercase tracking-[0.18em] text-white drop-shadow-sm">

            <span>
              Our City
            </span>

            <span className="h-1 w-1 rounded-full bg-white/70" />

            <span>
              Our Air
            </span>

            <span className="h-1 w-1 rounded-full bg-white/70" />

            <span>
              Our Responsibility
            </span>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Register;