const supabase = require("../config/supabase");

// =========================================================
// DEVICE SIMULATOR CONFIGURATION
// =========================================================

const HEARTBEAT_INTERVAL = 30 * 1000;

// Default battery for a newly added simulated device
const DEFAULT_BATTERY = 75;

// Battery starts charging when it reaches this level
const LOW_BATTERY_LIMIT = 30;

// Amount consumed every heartbeat
const BATTERY_CONSUMPTION = 0.01;

// Amount charged every heartbeat when battery is low
const BATTERY_CHARGE = 0.20;

// Maximum simulated battery
const MAX_BATTERY = 100;


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
            battery_level,
            network_status,
            is_simulated
        `)
        .eq("is_simulated", true);

    if (error) {
        throw error;
    }

    return devices || [];
};


// =========================================================
// CALCULATE BATTERY
// =========================================================

const calculateBattery = (currentBattery) => {

    let battery = Number(currentBattery);

    // ---------------------------------------------------------
    // NEW DEVICE
    // ---------------------------------------------------------
    // If battery is NULL, undefined, or invalid,
    // automatically start at 75%.
    // ---------------------------------------------------------

    if (!Number.isFinite(battery)) {
        battery = DEFAULT_BATTERY;
    }

    // ---------------------------------------------------------
    // SAFETY CHECK
    // ---------------------------------------------------------

    if (battery < 0) {
        battery = DEFAULT_BATTERY;
    }

    // ---------------------------------------------------------
    // LOW BATTERY
    // ---------------------------------------------------------
    // When battery reaches 30%, simulate charging.
    // ---------------------------------------------------------

    if (battery <= LOW_BATTERY_LIMIT) {

        battery += BATTERY_CHARGE;

    } else {

        // -----------------------------------------------------
        // NORMAL DEVICE POWER CONSUMPTION
        // -----------------------------------------------------

        battery -= BATTERY_CONSUMPTION;
    }

    // ---------------------------------------------------------
    // KEEP BATTERY BETWEEN 30% AND 100%
    // ---------------------------------------------------------

    battery = Math.min(
        MAX_BATTERY,
        Math.max(LOW_BATTERY_LIMIT, battery)
    );

    return Number(battery.toFixed(2));
};


// =========================================================
// SIMULATE DEVICE HEARTBEATS
// =========================================================

const simulateDeviceHeartbeat = async () => {

    try {

        // -----------------------------------------------------
        // GET ALL SIMULATED DEVICES
        // -----------------------------------------------------

        const devices = await getSimulatedDevices();


        // -----------------------------------------------------
        // NO DEVICES
        // -----------------------------------------------------

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

                // =================================================
                // BATTERY
                // =================================================

                const oldBattery = Number(device.battery_level);

                const battery = calculateBattery(
                    device.battery_level
                );


                // =================================================
                // DEVICE HEARTBEAT DATA
                // =================================================

                const heartbeatData = {

                    // Current server time
                    last_seen_at:
                        new Date().toISOString(),

                    // Device is alive
                    status:
                        "Online",

                    // Network is connected
                    network_status:
                        "Connected",

                    // Updated simulated battery
                    battery_level:
                        battery,
                };


                // =================================================
                // UPDATE DATABASE
                // =================================================

                const {
                    error: updateError,
                } = await supabase
                    .from("device")
                    .update(heartbeatData)
                    .eq(
                        "device_id",
                        device.device_id
                    );


                // =================================================
                // HANDLE UPDATE ERROR
                // =================================================

                if (updateError) {

                    console.error(
                        `Device ${device.device_id} heartbeat failed:`,
                        updateError
                    );

                    continue;
                }


                // =================================================
                // LOG
                // =================================================

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
            "Device simulator error:",
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
        "DEVICE SIMULATOR STARTED"
    );

    console.log(
        `Heartbeat: every ${HEARTBEAT_INTERVAL / 1000} seconds`
    );

    console.log(
        `Default battery for new devices: ${DEFAULT_BATTERY}%`
    );

    console.log(
        `Low battery threshold: ${LOW_BATTERY_LIMIT}%`
    );

    console.log(
        "======================================"
    );


    // ---------------------------------------------------------
    // FIRST HEARTBEAT IMMEDIATELY
    // ---------------------------------------------------------

    simulateDeviceHeartbeat();


    // ---------------------------------------------------------
    // CONTINUE EVERY 30 SECONDS
    // ---------------------------------------------------------

    setInterval(
        simulateDeviceHeartbeat,
        HEARTBEAT_INTERVAL
    );
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    startDeviceSimulator,

    simulateDeviceHeartbeat,

};