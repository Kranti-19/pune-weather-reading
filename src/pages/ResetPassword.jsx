import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, Eye, EyeOff } from "lucide-react"
import axios from "axios"

function ResetPassword() {

  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)


  // ================= RESET PASSWORD =================

  const handleSubmit = async (e) => {

    e.preventDefault()

    setError("")
    setSuccess("")


    // Check fields

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.")
      return
    }


    // Check password length

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }


    // Check password match

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }


    try {

      setLoading(true)


      // Get access token from URL

      const hash = window.location.hash

      const hashParams = new URLSearchParams(
        hash.substring(1)
      )

      const accessToken = hashParams.get("access_token")


      // Check access token

      if (!accessToken) {

        setError(
          "Invalid or expired password reset link."
        )

        return
      }


      // Call backend Reset Password API

      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          accessToken: accessToken,
          newPassword: password,
        }
      )


      console.log(
        "Reset password response:",
        response.data
      )


      // Success

      setSuccess(
        "Password updated successfully!"
      )


      // Redirect to login

      setTimeout(() => {
        navigate("/login")
      }, 2000)


    } catch (error) {

      console.error(
        "Reset password error:",
        error
      )


      const message =
        error.response?.data?.message ||
        "Unable to reset password. Please try again."

      setError(message)

    } finally {

      setLoading(false)

    }
  }


  return (

    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md">


        {/* ================= LOGO ================= */}

        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">

            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl">

              🔐

            </div>

          </div>


          <h1 className="text-2xl font-bold text-gray-900">
            Pune PMC
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Weather Monitoring System
          </p>

        </div>


        {/* ================= CARD ================= */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">


          {/* Heading */}

          <div className="mb-8">

            <p className="text-blue-600 text-sm font-medium">
              PMC PORTAL
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              Reset password
            </h2>

            <p className="text-gray-500 mt-3 leading-6">
              Enter your new password below.
            </p>

          </div>


          {/* ================= FORM ================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >


            {/* New Password */}

            <div>

              <label className="block text-sm font-medium text-gray-900 mb-2">
                New Password
              </label>

              <div className="relative">

                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Enter new password"
                  className="w-full h-14 pl-11 pr-12 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
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


            {/* Confirm Password */}

            <div>

              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>

              <div className="relative">

                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Confirm new password"
                  className="w-full h-14 pl-11 pr-12 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >

                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}

                </button>

              </div>

            </div>


            {/* Error */}

            {error && (

              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">

                {error}

              </div>

            )}


            {/* Success */}

            {success && (

              <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl p-3">

                {success}

              </div>

            )}


            {/* Update Password Button */}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-14 text-white font-semibold rounded-xl transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >

              {loading
                ? "Updating Password..."
                : "Update Password"}

            </button>

          </form>

        </div>


        {/* Footer */}

        <p className="text-center text-xs text-gray-400 mt-6">
          Authorized PMC personnel only
        </p>

      </div>

    </div>
  )
}

export default ResetPassword