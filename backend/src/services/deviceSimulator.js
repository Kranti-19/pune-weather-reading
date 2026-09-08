const supabase = require("../config/supabase");


// =========================================================
// DEVICE SIMULATOR
// =========================================================

const HEARTBEAT_INTERVAL = 30 * 1000;


// =========================================================
// SIMULATE DEVICE HEARTBEATS
// =========================================================

const simulateDeviceHeartbeat = async () => {
    try {

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


        if (!devices || devices.length === 0) {

            console.log(
                "Device simulator: no simulated devices found."
            );

            return;
        }


        for (const device of devices) {

            let battery =
                Number(device.battery_level);


            if (!Number.isFinite(battery)) {
                battery = 100;
            }


            // Slowly decrease battery
            battery = Math.max(
                0,
                battery - 0.01
            );


            const {
                error: updateError,
            } = await supabase
                .from("device")
                .update({
                    last_seen_at:
                        new Date().toISOString(),

                    status:
                        "Online",

                    network_status:
                        "Connected",

                    battery_level:
                        Number(
                            battery.toFixed(2)
                        ),
                })
                .eq(
                    "device_id",
                    device.device_id
                );


            if (updateError) {

                console.error(
                    `Device ${device.device_id} heartbeat failed:`,
                    updateError
                );

            } else {

                console.log(
                    `Heartbeat → ${device.gateway_id}`
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
// START SIMULATOR
// =========================================================

const startDeviceSimulator = () => {

    console.log(
        "======================================"
    );

    console.log(
        "DEVICE SIMULATOR STARTED"
    );

    console.log(
        "Heartbeat: every 30 seconds"
    );

    console.log(
        "======================================"
    );


    // First heartbeat immediately

    simulateDeviceHeartbeat();


    // Continue every 30 seconds

    setInterval(
        simulateDeviceHeartbeat,
        HEARTBEAT_INTERVAL
    );
};


module.exports = {
    startDeviceSimulator,
    simulateDeviceHeartbeat,
};