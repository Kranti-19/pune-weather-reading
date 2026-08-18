import { useState } from "react"
import { Eye, EyeOff, LockKeyhole, UserRound, CloudRain } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Temporary frontend login.
    // Backend authentication will be connected later.

    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Section */}

        <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
                <CloudRain size={28} />
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  Pune Weather
                </h1>

                <p className="text-sm text-blue-100">
                  Weather Monitoring System
                </p>
              </div>

            </div>


            <div className="mt-16">

              <p className="text-blue-100 text-sm font-medium">
                PMC WEATHER PORTAL
              </p>

              <h2 className="text-4xl font-bold mt-4 leading-tight">
                Pune Weather
                <br />
                Monitoring System
              </h2>

              <p className="text-blue-100 mt-5 leading-7">
                Monitor weather conditions, rainfall,
                forecasts and alerts across Pune.
              </p>

            </div>

          </div>


          <div className="text-sm text-blue-200">
            Municipal Weather Monitoring Portal
          </div>

        </div>


        {/* Right Section */}

        <div className="p-8 md:p-12">

          {/* Mobile Logo */}

          <div className="md:hidden flex items-center gap-3 mb-10">

            <div className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center">
              <CloudRain size={24} />
            </div>

            <div>
              <h1 className="font-bold text-lg">
                Pune Weather
              </h1>

              <p className="text-xs text-gray-500">
                Weather Monitoring System
              </p>
            </div>

          </div>


          <div>

            <p className="text-sm text-blue-600 font-semibold">
              PMC PORTAL
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              Welcome back
            </h2>

            <p className="text-gray-500 mt-2">
              Sign in to access the weather monitoring dashboard.
            </p>

          </div>


          {/* Login Form */}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            {/* User ID */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                PMC User ID
              </label>

              <div className="relative">

                <UserRound
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Enter your user ID"
                  className="w-full border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  required
                />

              </div>

            </div>


            {/* Password */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 rounded-xl py-3.5 pl-11 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>


            {/* Remember / Forgot */}

            <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 text-sm text-gray-600">

                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-600"
                />

                Remember me

              </label>


              <button
                type="button"
                className="text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </button>

            </div>


            {/* Login button */}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition shadow-sm"
            >
              Sign In
            </button>

          </form>


          <p className="text-center text-xs text-gray-400 mt-8">
            Authorized PMC personnel only
          </p>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}

              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Create account
              </Link>
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Login