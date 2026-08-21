import { useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

function ForgotPassword() {

  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)


  // ================= HANDLE SUBMIT =================

  const handleSubmit = async (e) => {

    e.preventDefault()

    setError("")

    if (!email) {
      setError("Please enter your email address.")
      return
    }

    try {

      setLoading(true)

      // Call backend Forgot Password API
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        {
          email: email.trim().toLowerCase(),
        }
      )

      console.log("Forgot password response:", response.data)

      // Show success screen
      setSubmitted(true)

    } catch (error) {

      console.error("Forgot password error:", error)

      const message =
        error.response?.data?.message ||
        "Unable to send reset link. Please try again."

      setError(message)

    } finally {

      setLoading(false)

    }
  }


  return (

    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md">


        {/* ================= LOGO / BRAND ================= */}

        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">

            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl">

              🌧️

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


          {!submitted ? (

            <>


              {/* Heading */}

              <div className="mb-8">

                <p className="text-blue-600 text-sm font-medium">
                  PMC PORTAL
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  Forgot password?
                </h2>

                <p className="text-gray-500 mt-3 leading-6">

                  Enter your registered official email address and
                  we'll send you a link to reset your password.

                </p>

              </div>


              {/* ================= FORM ================= */}

              <form onSubmit={handleSubmit}>


                {/* Email */}

                <div className="mb-6">

                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Official Email
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      ✉
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError("")
                      }}
                      placeholder="Enter your official email"
                      className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />

                  </div>

                </div>


                {/* Error */}

                {error && (

                  <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">

                    {error}

                  </div>

                )}


                {/* Button */}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-14 text-white font-semibold rounded-xl transition shadow-sm ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >

                  {loading
                    ? "Sending..."
                    : "Send Reset Link"}

                </button>

              </form>


              {/* Back to login */}

              <div className="text-center mt-6">

                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to Login
                </Link>

              </div>

            </>

          ) : (

            /* ================= SUCCESS STATE ================= */

            <div className="text-center py-6">

              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-3xl mb-5">
                ✓
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Check your email
              </h2>

              <p className="text-gray-500 mt-3 leading-6">

                If an account exists with this email address,
                you will receive a password reset link shortly.

              </p>

              <Link
                to="/login"
                className="inline-block mt-6 text-blue-600 font-medium hover:text-blue-700"
              >
                ← Back to Login
              </Link>

            </div>

          )}

        </div>


        {/* ================= FOOTER ================= */}

        <p className="text-center text-xs text-gray-400 mt-6">
          Authorized PMC personnel only
        </p>

      </div>

    </div>
  )
}

export default ForgotPassword