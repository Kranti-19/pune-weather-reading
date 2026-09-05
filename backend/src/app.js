const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json());

// Health Routes
const healthRoutes = require("./routes/healthRoutes");
app.use("/api/health", healthRoutes);

// Test Routes
const testRoutes = require("./routes/testRoutes");
app.use("/api/test", testRoutes);

// Authentication Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Dashboard route
const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

// Alert Routes
const alertRoutes = require("./routes/alertRoutes");
app.use("/api/alerts", alertRoutes);

// Report Routes
const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

// Station Routes
const stationRoutes = require("./routes/stationRoutes");
app.use("/api/stations", stationRoutes);

// Root Route
app.get("/", (req, res) => {
    res.json({
        message: "Weather Reading System Backend is running"
    });
});

module.exports = app;