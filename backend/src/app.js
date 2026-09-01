const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());



const healthRoutes = require("./routes/healthRoutes");
app.use("/api/health", healthRoutes);




const testRoutes = require("./routes/testRoutes");
app.use("/api/test", testRoutes);



const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


//Alert Controllers
const alertRoutes = require("./routes/alertRoutes");
app.use("/api/alerts", alertRoutes);



const reportRoutes = require("./routes/reportRoutes");

app.use("/api/reports",reportRoutes);



const stationRoutes = require("./routes/stationRoutes");

app.use(
    "/api/stations",
    stationRoutes
);





app.get("/", (req, res) => {
    res.json({
        message: "Weather Reading System Backend is running"
    });
});

module.exports = app;