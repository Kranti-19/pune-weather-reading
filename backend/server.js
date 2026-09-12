require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

console.log("URL:", process.env.SUPABASE_URL);
console.log(
    "Secret key loaded:",
    process.env.SUPABASE_SECRET_KEY ? "YES" : "NO"
);

console.log("WAQI token exists:", !!process.env.WAQI_TOKEN);


const {
    startDeviceSimulator,
} = require("./src/services/deviceSimulator");



const {
  syncAllWaqiStations,
} = require("./src/controllers/airQualityController");

// Run once when backend starts
syncAllWaqiStations();

// Run every 10 minutes
setInterval(() => {
  syncAllWaqiStations();
}, 10 * 60 * 1000);




const {
  startOpenAQScheduler,
} = require("./src/services/openaqScheduler");



app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
     startDeviceSimulator();
     startOpenAQScheduler();
});