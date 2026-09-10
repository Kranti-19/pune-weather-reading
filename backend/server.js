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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
     startDeviceSimulator();
});