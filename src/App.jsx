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
          element={<Navigate to="/login" replace />}
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
        {/* PROTECTED APPLICATION */}
        {/* ================================================== */}

        {/* Dashboard */}
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

        {/* Air Quality */}
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

        {/* Pune Areas */}
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

        {/* Alerts */}
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

        {/* Analytics */}
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

        {/* Station Details */}
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

        {/* Device Health */}
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

        {/* Maintenance */}
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

        {/* Reports */}
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

        {/* Settings */}
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

        {/* Add Monitoring Site */}
        <Route
          path="/admin/add-monitoring-site"
          element={
            <ProtectedRoute>
              <AddMonitoringSite />
            </ProtectedRoute>
          }
        />

        {/* Alert Configuration */}
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
        {/* FALLBACK */}
        {/* ================================================== */}

        <Route
          path="*"
          element={
            <Navigate to="/dashboard" replace />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;