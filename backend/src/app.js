const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration
// Dynamic CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://pune-weather-reading.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") // Handles Vercel preview/branch builds
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicitly handle preflight OPTIONS requests for all endpoints
app.options("*", cors());

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

const alertRoutes =require("./routes/alertRoutes");
app.use("/api/alerts",alertRoutes);


// Report Routes
const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);


// Station Routes
const stationRoutes = require("./routes/stationRoutes");
app.use("/api/stations", stationRoutes);

//Analytics Routes
const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);

//Device Routes
const deviceRoutes = require("./routes/deviceRoutes");
app.use("/api/devices",deviceRoutes);

//Sensor Routes
const sensorRoutes = require("./routes/sensorRoutes");
app.use( "/api/sensors",sensorRoutes);



//whether API
const weatherRoutes = require("./routes/weatherRoutes");
app.use("/api/weather", weatherRoutes);


//AQI API
const airQualityRoutes = require("./routes/airQualityRoutes");
app.use("/api/air-quality", airQualityRoutes);



const openaqRoutes =
  require("./routes/openaqRoutes");


app.use(
  "/api/air-quality/openaq",
  openaqRoutes
);


// const settingsRoutes = require("./routes/settingsRoutes");

// app.use("/api/settings", settingsRoutes);



const openaqLocationRoutes = require("./routes/openaqLocationRoutes");
app.use("/api/air-quality/openaq",openaqLocationRoutes);


// Root Route
app.get("/", (req, res) => {
    res.json({
        message: "Weather Reading System Backend is running"
    });
});

module.exports = app;