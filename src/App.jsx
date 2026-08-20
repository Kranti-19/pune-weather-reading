import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

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

import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ========================= */}
        {/* Authentication Pages */}
        {/* ========================= */}

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


        {/* ========================= */}
        {/* Main Application */}
        {/* ========================= */}

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/air-quality"
          element={
            <Layout>
              <AirQuality />
            </Layout>
          }
        />

        <Route
          path="/pune-areas"
          element={
            <Layout>
              <PuneAreas />
            </Layout>
          }
        />

        <Route
          path="/alerts"
          element={
            <Layout>
              <Alerts />
            </Layout>
          }
        />

        <Route
          path="/analytics"
          element={
            <Layout>
              <Analytics />
            </Layout>
          }
        />

        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />

        <Route
          path="/station/:id"
          element={
            <Layout>
              <StationDetails />
            </Layout>
          }
        />

        <Route
          path="/device-health"
          element={
            <Layout>
              <DeviceHealth />
            </Layout>
          }
        />

        <Route
          path="/maintenance"
          element={
            <Layout>
              <Maintenance />
            </Layout>
          }
        />

        <Route
          path="/reports"
          element={
            <Layout>
              <Reports />
            </Layout>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;