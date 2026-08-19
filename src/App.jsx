import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import Dashboard from "./pages/Dashboard"
import Weather from "./pages/Weather";
import Rainfall from "./pages/Rainfall";
import PuneAreas from "./pages/PuneAreas";
import Alerts from "./pages/Alerts";

function App() {
  return (
    <BrowserRouter>

      <Routes>

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
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/weather"
          element={<Weather />}
        />

        <Route
          path="/rainfall"
          element={<Rainfall />}
        />

        <Route
          path="/areas"
          element={<PuneAreas />}
        />

        <Route
          path="/alerts"
          element={<Alerts />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App