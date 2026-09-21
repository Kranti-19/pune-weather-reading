const supabase = require("../config/supabase");

// =========================================================
// DEVICE SIMULATOR CONFIGURATION
// =========================================================

const HEARTBEAT_INTERVAL = 30 * 1000;

// Generate new pollutant readings every 60 seconds
const READING_INTERVAL = 60 * 1000;

// Battery configuration
const DEFAULT_BATTERY = 75;
const LOW_BATTERY_LIMIT = 30;
const BATTERY_CONSUMPTION = 0.01;
const BATTERY_CHARGE = 0.20;
const MAX_BATTERY = 100;


// =========================================================
// POLLUTANT CONFIGURATION
// =========================================================

const POLLUTANTS = [
    {
        parameter: "PM2.5",
        unit: "µg/m³",
        min: 8,
        max: 95,
        decimals: 2,
    },

    {
        parameter: "PM10",
        unit: "µg/m³",
        min: 20,
        max: 120,
        decimals: 2,
    },

    {
        parameter: "NO2",
        unit: "µg/m³",
        min: 8,
        max: 70,
        decimals: 2,
    },

    {
        parameter: "SO2",
        unit: "µg/m³",
        min: 2,
        max: 40,
        decimals: 2,
    },

    {
        parameter: "CO",
        unit: "mg/m³",
        min: 0.3,
        max: 1.9,
        decimals: 2,
    },

    {
        parameter: "O3",
        unit: "µg/m³",
        min: 10,
        max: 90,
        decimals: 2,
    },

    {
        parameter: "NH3",
        unit: "µg/m³",
        min: 5,
        max: 80,
        decimals: 2,
    },

    {
        parameter: "Pb",
        unit: "µg/m³",
        min: 0.05,
        max: 0.85,
        decimals: 3,
    },
];


// =========================================================
// RANDOM VALUE GENERATOR
// =========================================================

const randomValue = (min, max, decimals = 2) => {

    const value =
        Math.random() * (max - min) + min;

    return Number(
        value.toFixed(decimals)
    );
};


// =========================================================
// GET SIMULATED DEVICES
// =========================================================

const getSimulatedDevices = async () => {

    const {
        data: devices,
        error,
    } = await supabase
        .from("device")
        .select(`
            device_id,
            gateway_id,
            station_id,
            battery_level,
            network_status,
            status,
            is_simulated
        `)
        .eq("is_simulated", true);

    if (error) {
        throw error;
    }

    return devices || [];
};


// =========================================================
// GET SENSORS
// =========================================================

const getSensors = async () => {

    const {
        data: sensors,
        error,
    } = await supabase
        .from("sensor")
        .select(`
            sensor_id,
            sensor_type,
            model,
            serial_number,
            device_id,
            status
        `)
        .order("sensor_id", {
            ascending: true,
        });

    if (error) {
        throw error;
    }

    return sensors || [];
};


// =========================================================
// CALCULATE BATTERY
// =========================================================

const calculateBattery = (currentBattery) => {

    let battery = Number(currentBattery);

    // New device
    if (!Number.isFinite(battery)) {
        battery = DEFAULT_BATTERY;
    }

    // Safety
    if (battery < 0) {
        battery = DEFAULT_BATTERY;
    }

    // Charging
    if (battery <= LOW_BATTERY_LIMIT) {

        battery += BATTERY_CHARGE;

    } else {

        // Consumption
        battery -= BATTERY_CONSUMPTION;
    }

    // Keep between 30 and 100
    battery = Math.min(
        MAX_BATTERY,
        Math.max(
            LOW_BATTERY_LIMIT,
            battery
        )
    );

    return Number(
        battery.toFixed(2)
    );
};


// =========================================================
// SIMULATE DEVICE HEARTBEAT
// =========================================================

const simulateDeviceHeartbeat = async () => {

    try {

        const devices =
            await getSimulatedDevices();

        if (!devices.length) {

            console.log(
                "Device simulator: no simulated devices found."
            );

            return;
        }

        console.log(
            `Device simulator: processing ${devices.length} simulated device(s).`
        );


        // -----------------------------------------------------
        // PROCESS EACH DEVICE
        // -----------------------------------------------------

        for (const device of devices) {

            try {

                const oldBattery =
                    Number(device.battery_level);

                const battery =
                    calculateBattery(
                        device.battery_level
                    );


                const heartbeatData = {

                    last_seen_at:
                        new Date().toISOString(),

                    status:
                        "Online",

                    network_status:
                        "Connected",

                    battery_level:
                        battery,
                };


                const {
                    error: updateError,
                } = await supabase
                    .from("device")
                    .update(heartbeatData)
                    .eq(
                        "device_id",
                        device.device_id
                    );


                if (updateError) {

                    console.error(
                        `Device ${device.device_id} heartbeat failed:`,
                        updateError
                    );

                    continue;
                }


                // -------------------------------------------------
                // LOG
                // -------------------------------------------------

                if (!Number.isFinite(oldBattery)) {

                    console.log(
                        `New Device → ${device.gateway_id} | ` +
                        `Battery initialized: ${battery}%`
                    );

                } else if (
                    battery > oldBattery
                ) {

                    console.log(
                        `Charging → ${device.gateway_id} | ` +
                        `${oldBattery.toFixed(2)}% → ${battery}%`
                    );

                } else {

                    console.log(
                        `Heartbeat → ${device.gateway_id} | ` +
                        `Battery: ${battery}%`
                    );
                }

            } catch (deviceError) {

                console.error(
                    `Device simulator error for ${device.gateway_id}:`,
                    deviceError
                );
            }
        }

    } catch (error) {

        console.error(
            "Device simulator heartbeat error:",
            error
        );
    }
};


// =========================================================
// GENERATE POLLUTANT READINGS
// =========================================================

const generatePollutantReadings = async () => {

    try {

        const devices =
            await getSimulatedDevices();

        if (!devices.length) {

            console.log(
                "Reading simulator: no simulated devices found."
            );

            return;
        }


        const sensors =
            await getSensors();


        // -----------------------------------------------------
        // CREATE DEVICE LOOKUP
        // -----------------------------------------------------

        const deviceMap = new Map();

        for (const device of devices) {

            deviceMap.set(
                Number(device.device_id),
                device
            );
        }


        // -----------------------------------------------------
        // FIND ONE SENSOR PER STATION
        //
        // Device 3 and Device 5 both belong to Station 3.
        // We therefore keep only the first sensor for a station.
        // -----------------------------------------------------

        const stationSensorMap = new Map();


        for (const sensor of sensors) {

            const device =
                deviceMap.get(
                    Number(sensor.device_id)
                );

            if (!device) {
                continue;
            }


            const stationId =
                Number(device.station_id);

            if (!stationId) {
                continue;
            }


            // First sensor wins
            if (
                !stationSensorMap.has(
                    stationId
                )
            ) {

                stationSensorMap.set(
                    stationId,
                    {
                        sensor,
                        device,
                    }
                );
            }
        }


        if (!stationSensorMap.size) {

            console.log(
                "Reading simulator: no sensors found for simulated stations."
            );

            return;
        }


        // -----------------------------------------------------
        // GENERATE READINGS
        // -----------------------------------------------------

        const timestamp =
            new Date().toISOString();

        const readings = [];


        for (
            const [
                stationId,
                stationInfo
            ]
            of stationSensorMap
        ) {

            const sensor =
                stationInfo.sensor;


            // ---------------------------------------------
            // Generate all pollutants
            // ---------------------------------------------

            for (
                const pollutant
                of POLLUTANTS
            ) {

                const value =
                    randomValue(
                        pollutant.min,
                        pollutant.max,
                        pollutant.decimals
                    );


                readings.push({

    station_id:
        stationId,

    sensor_id:
        sensor.sensor_id,

    timestamp,

    parameter:
        pollutant.parameter,

    value,

    unit:
        pollutant.unit,

    // Required by the reading table
    quality_flag:
        "Simulated",

    // Current simulated measurement
    data_status:
        "Current",
});
            }
        }


        // -----------------------------------------------------
        // INSERT INTO READING TABLE
        // -----------------------------------------------------

        if (!readings.length) {

            console.log(
                "Reading simulator: no readings generated."
            );

            return;
        }


        const {
            data,
            error,
        } = await supabase
            .from("reading")
            .insert(readings)
            .select();


        if (error) {

            console.error(
                "Reading simulator insert error:",
                error
            );

            return;
        }


        console.log(
            `Reading simulator: inserted ${data?.length || readings.length} pollutant readings.`
        );


        // -----------------------------------------------------
        // SUMMARY
        // -----------------------------------------------------

        console.log(
            `Stations updated: ${stationSensorMap.size}`
        );

        console.log(
            `Pollutants per station: ${POLLUTANTS.length}`
        );

        console.log(
            `Timestamp: ${timestamp}`
        );

    } catch (error) {

        console.error(
            "Reading simulator error:",
            error
        );
    }
};


// =========================================================
// START DEVICE SIMULATOR
// =========================================================

const startDeviceSimulator = () => {

    console.log(
        "======================================"
    );

    console.log(
        "DEVICE + SENSOR SIMULATOR STARTED"
    );

    console.log(
        `Heartbeat: every ${HEARTBEAT_INTERVAL / 1000} seconds`
    );

    console.log(
        `Readings: every ${READING_INTERVAL / 1000} seconds`
    );

    console.log(
        `Default battery: ${DEFAULT_BATTERY}%`
    );

    console.log(
        `Low battery threshold: ${LOW_BATTERY_LIMIT}%`
    );

    console.log(
        `Pollutants generated: ${POLLUTANTS.length}`
    );

    console.log(
        "======================================"
    );


    // -----------------------------------------------------
    // FIRST HEARTBEAT
    // -----------------------------------------------------

    simulateDeviceHeartbeat();


    // -----------------------------------------------------
    // FIRST SENSOR READING
    // -----------------------------------------------------

    generatePollutantReadings();


    // -----------------------------------------------------
    // DEVICE HEARTBEAT
    // -----------------------------------------------------

    setInterval(
        simulateDeviceHeartbeat,
        HEARTBEAT_INTERVAL
    );


    // -----------------------------------------------------
    // SENSOR READINGS
    // -----------------------------------------------------

    setInterval(
        generatePollutantReadings,
        READING_INTERVAL
    );
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    startDeviceSimulator,

    simulateDeviceHeartbeat,

    generatePollutantReadings,

};