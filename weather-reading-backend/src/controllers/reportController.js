const supabase = require("../config/supabase");


// ============================================
// GET REPORT
// ============================================

const getReport = async (req, res) => {

    try {

        const { stationId } = req.params;
        const { date } = req.query;


        if (!stationId) {

            return res.status(400).json({
                status: "error",
                message: "Station ID is required"
            });

        }


        if (!date) {

            return res.status(400).json({
                status: "error",
                message: "Report date is required"
            });

        }


        // ============================================
        // GET STATION
        // ============================================

        const { data: station, error: stationError } =
            await supabase
                .from("station")
                .select(`
                    station_id,
                    name,
                    ward,
                    zone,
                    latitude,
                    longitude,
                    station_type,
                    installation_date,
                    status
                `)
                .eq("station_id", stationId)
                .single();


        if (stationError) {

            console.error(
                "Station error:",
                stationError
            );

            return res.status(404).json({
                status: "error",
                message: "Station not found"
            });

        }


        // ============================================
        // DATE RANGE
        // ============================================

        const startDate =
            `${date}T00:00:00.000Z`;

        const endDate =
            `${date}T23:59:59.999Z`;


        // ============================================
        // GET AQI
        // ============================================

        const { data: aqiData, error: aqiError } =
            await supabase
                .from("aqi_reading")
                .select(`
                    timestamp,
                    aqi,
                    category,
                    dominant_pollutant
                `)
                .eq("station_id", stationId)
                .gte("timestamp", startDate)
                .lte("timestamp", endDate)
                .order("timestamp", {
                    ascending: false
                })
                .limit(1);


        if (aqiError) {

            console.error(
                "AQI error:",
                aqiError
            );

        }


        const latestAQI =
            aqiData && aqiData.length > 0
                ? aqiData[0]
                : null;


        // ============================================
        // GET POLLUTANT READINGS
        // ============================================

        const { data: readings, error: readingError } =
            await supabase
                .from("reading")
                .select(`
                    reading_id,
                    timestamp,
                    parameter,
                    value,
                    unit,
                    quality_flag
                `)
                .eq("station_id", stationId)
                .gte("timestamp", startDate)
                .lte("timestamp", endDate)
                .order("timestamp", {
                    ascending: false
                });


        if (readingError) {

            console.error(
                "Reading error:",
                readingError
            );

            return res.status(500).json({
                status: "error",
                message: readingError.message
            });

        }


        // ============================================
        // GET LATEST READING FOR EACH PARAMETER
        // ============================================

        const latestReadings = {};


        for (const reading of readings) {

            if (
                !latestReadings[
                    reading.parameter
                ]
            ) {

                latestReadings[
                    reading.parameter
                ] = reading;

            }

        }


        // ============================================
        // POLLUTANT LIST
        // ============================================

        const pollutantNames = [
            "PM2.5",
            "PM10",
            "NO2",
            "NO₂",
            "SO2",
            "SO₂",
            "CO",
            "O3",
            "O₃",
            "NH3",
            "NH₃",
            "Pb"
        ];


        const pollutants = [];


        for (const parameter of pollutantNames) {

            const reading =
                latestReadings[parameter];


            if (reading) {

                pollutants.push({
                    name: reading.parameter,
                    value: reading.value,
                    unit: reading.unit,
                    qualityFlag:
                        reading.quality_flag
                });

            }

        }


        // ============================================
        // DATA AVAILABILITY
        // ============================================

        const expectedReadings =
            pollutantNames.length;

        const availableReadings =
            pollutants.length;


        const dataAvailability =
            expectedReadings > 0
                ? (
                    (
                        availableReadings /
                        expectedReadings
                    ) * 100
                ).toFixed(1) + "%"
                : "0%";


        // ============================================
        // RESPONSE
        // ============================================

        return res.status(200).json({

            status: "success",

            report: {

                station: station.name,

                stationId:
                    station.station_id,

                ward:
                    station.ward,

                zone:
                    station.zone,

                latitude:
                    station.latitude,

                longitude:
                    station.longitude,

                stationType:
                    station.station_type,

                installationDate:
                    station.installation_date,

                stationStatus:
                    station.status,

                date,

                aqi:
                    latestAQI
                        ? latestAQI.aqi
                        : null,

                category:
                    latestAQI
                        ? latestAQI.category
                        : null,

                dominantPollutant:
                    latestAQI
                        ? latestAQI.dominant_pollutant
                        : null,

                aqiTimestamp:
                    latestAQI
                        ? latestAQI.timestamp
                        : null,

                dataAvailability,

                pollutants

            }

        });


    } catch (error) {

        console.error(
            "Report server error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message:
                "Server error"

        });

    }

};


module.exports = {
    getReport
};