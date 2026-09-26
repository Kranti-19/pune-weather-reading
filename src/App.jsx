import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import AirQuality from "./pages/AirQuality";
import PuneAreas from "./pages/PuneAreas";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

import StationDetails from "./pages/StationDetails";
import DeviceHealth from "./pages/DeviceHealth";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";

import AddMonitoringSite from "./pages/AddMonitoringSite";
import AdminAlertConfiguration from "./pages/AdminAlertConfiguration";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================================================== */}
        {/* AUTHENTICATION */}
        {/* ================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* ================================================== */}
        {/* MAIN APPLICATION */}
        {/* ================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/air-quality"
          element={
            <ProtectedRoute>
              <Layout>
                <AirQuality />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pune-areas"
          element={
            <ProtectedRoute>
              <Layout>
                <PuneAreas />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Layout>
                <Alerts />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/station/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <StationDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/device-health"
          element={
            <ProtectedRoute>
              <Layout>
                <DeviceHealth />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <Layout>
                <Maintenance />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================== */}
        {/* ADMIN ONLY */}
        {/* ================================================== */}

        {/* SETTINGS */}

        <Route
          path="/settings"
          element={
            <AdminRoute>
              <Layout>
                <Settings />
              </Layout>
            </AdminRoute>
          }
        />

        {/* ALERT CONFIGURATION */}

        <Route
          path="/admin/alert-configuration"
          element={
            <AdminRoute>
              <Layout>
                <AdminAlertConfiguration />
              </Layout>
            </AdminRoute>
          }
        />

        {/* ================================================== */}
        {/* ADD MONITORING SITE */}
        {/* ================================================== */}

        <Route
          path="/admin/add-monitoring-site"
          element={
            <ProtectedRoute>
              <AddMonitoringSite />
            </ProtectedRoute>
          }
        />

        {/* ================================================== */}
        {/* FALLBACK */}
        {/* ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;