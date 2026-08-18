import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import {
  CloudRain,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"

function Register() {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
    fullName: "",
    userId: "",
    email: "",
    password: "",
    confirmPassword: "",
    })

    const [error, setError] = useState("")

    const handleRegister = (e) => {

  e.preventDefault()

  if (
    !formData.fullName ||
    !formData.userId ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword
  ) {
    setError("Please fill in all fields.")
    return
  }

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.")
    return
  }

  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters.")
    return
  }

  // Frontend only for now
  alert("Account created successfully!")

  navigate("/login")
}

    const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  })

  setError("")
}

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* ================= LEFT SIDE ================= */}

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-10 lg:p-12 flex flex-col justify-between min-h-[650px]">

          {/* Logo */}

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <CloudRain size={27} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Pune Weather
              </h2>

              <p className="text-sm text-blue-100">
                Weather Monitoring System
              </p>
            </div>

          </div>


          {/* Main Content */}

          <div>

            <p className="text-sm font-semibold tracking-wide mb-5">
              PMC WEATHER PORTAL
            </p>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Create your
              <br />
              PMC account
            </h1>

            <p className="mt-6 text-blue-100 leading-7 max-w-md">
              Register to access the Pune weather monitoring
              system and monitor weather conditions, rainfall,
              forecasts and alerts across Pune.
            </p>

          </div>


          {/* Footer */}

          <p className="text-sm text-blue-100">
            Municipal Weather Monitoring Portal
          </p>

        </div>


        {/* ================= RIGHT SIDE ================= */}

        <div className="p-8 lg:p-12">

          <div className="max-w-md mx-auto">

            {/* Heading */}

            <div className="mb-7">

              <p className="text-sm font-medium text-blue-600 mb-2">
                PMC PORTAL
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                Create account
              </h2>

              <p className="text-gray-500 mt-2">
                Register to access the weather monitoring dashboard.
              </p>

            </div>


            {/* ================= FORM ================= */}

            <form className="space-y-4">

              {/* Full Name */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <div className="relative">

                  <User
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* PMC User ID */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PMC User ID
                </label>

                <div className="relative">

                  <User
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Enter your PMC user ID"
                    className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Official Email */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Official Email
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    placeholder="Enter your official email"
                    className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Password */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>


              {/* Confirm Password */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>

                <div className="relative">

                  <Lock
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>


              {/* Create Account */}

              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition mt-2"
              >
                Create Account
              </button>

            </form>


            {/* Login Link */}

            <div className="text-center mt-6">

              <p className="text-sm text-gray-500">

                Already have an account?{" "}

                <Link
                  to="/login"
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Sign in
                </Link>

              </p>

            </div>


            {/* Footer */}

            <p className="text-center text-xs text-gray-400 mt-7">
              Authorized PMC personnel only
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Register