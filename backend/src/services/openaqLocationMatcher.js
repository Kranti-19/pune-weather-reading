const supabase = require("../config/supabase");

const OPENAQ_BASE_URL = "https://api.openaq.org/v3";

function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

async function findNearestOpenAQLocation(station) {
    const { latitude, longitude } = station;

    const url =
        `${OPENAQ_BASE_URL}/locations` +
        `?coordinates=${latitude},${longitude}` +
        `&radius=25000` +
        `&limit=100`;

    const response = await fetch(url, {
        headers: {
            "X-API-Key": process.env.OPENAQ_API_KEY
        }
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `OpenAQ location search failed: ${response.status} ${errorText}`
        );
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        return null;
    }

    const locations = data.results
        .map(location => {
            const openaqLat = location.coordinates?.latitude;
            const openaqLon = location.coordinates?.longitude;

            if (
                openaqLat === null ||
                openaqLat === undefined ||
                openaqLon === null ||
                openaqLon === undefined
            ) {
                return null;
            }

            const distanceKm = getDistanceKm(
                Number(latitude),
                Number(longitude),
                Number(openaqLat),
                Number(openaqLon)
            );

            const sensors = location.sensors || [];

            const parameterNames = sensors
                .map(sensor =>
                    sensor.parameter?.name?.toLowerCase()
                )
                .filter(Boolean);

            const hasPM25 = parameterNames.some(
                name => name === "pm25" || name.includes("pm2.5")
            );

            const hasPM10 = parameterNames.some(
                name => name === "pm10"
            );

            return {
                ...location,
                distanceKm,
                hasPM25,
                hasPM10
            };
        })
        .filter(Boolean);

    if (locations.length === 0) {
        return null;
    }

    /*
     * Prefer locations that:
     * 1. Are reference monitors
     * 2. Have PM2.5/PM10
     * 3. Are closest
     */

    locations.sort((a, b) => {
        const aScore =
            (a.isMonitor ? 100000 : 0) +
            (a.hasPM25 ? 10000 : 0) +
            (a.hasPM10 ? 5000 : 0) -
            a.distanceKm;

        const bScore =
            (b.isMonitor ? 100000 : 0) +
            (b.hasPM25 ? 10000 : 0) +
            (b.hasPM10 ? 5000 : 0) -
            b.distanceKm;

        return bScore - aScore;
    });

    return locations[0];
}

async function matchStationToOpenAQ(station) {
    const location = await findNearestOpenAQLocation(station);

    if (!location) {
        return {
            success: false,
            stationId: station.station_id,
            stationName: station.name,
            message: "No OpenAQ location found within 25 km"
        };
    }

    const distanceKm = Number(location.distanceKm.toFixed(3));

    /*
     * IMPORTANT:
     * Don't automatically map a very distant station.
     */

    const MAX_MAPPING_DISTANCE_KM = 5;

    if (distanceKm > MAX_MAPPING_DISTANCE_KM) {
        return {
            success: false,
            stationId: station.station_id,
            stationName: station.name,
            nearestOpenAQ: {
                id: location.id,
                name: location.name,
                distanceKm,
                latitude: location.coordinates?.latitude,
                longitude: location.coordinates?.longitude
            },
            message:
                `Nearest OpenAQ location is ${distanceKm} km away. ` +
                `Mapping limit is ${MAX_MAPPING_DISTANCE_KM} km.`
        };
    }

    /*
     * Save the mapping.
     */

    const { error } = await supabase
        .from("station")
        .update({
            external_source: "OPENAQ",
            external_station_id: String(location.id)
        })
        .eq("station_id", station.station_id);

    if (error) {
        throw error;
    }

    return {
        success: true,
        stationId: station.station_id,
        stationName: station.name,
        openaqStationId: location.id,
        openaqStationName: location.name,
        stationLatitude: station.latitude,
        stationLongitude: station.longitude,
        openaqLatitude: location.coordinates?.latitude,
        openaqLongitude: location.coordinates?.longitude,
        distanceKm,
        isMonitor: location.isMonitor,
        hasPM25: location.hasPM25,
        hasPM10: location.hasPM10
    };
}

async function matchAllStations() {
    const { data: stations, error } = await supabase
        .from("station")
        .select(
            "station_id,name,latitude,longitude,station_type,status"
        )
        .order("station_id");

    if (error) {
        throw error;
    }

    const results = [];

    for (const station of stations) {
        try {
            console.log(
                `Finding OpenAQ location for ${station.name}...`
            );

            const result = await matchStationToOpenAQ(station);

            results.push(result);

            console.log(result);
        } catch (error) {
            results.push({
                success: false,
                stationId: station.station_id,
                stationName: station.name,
                error: error.message
            });
        }
    }

    return results;
}

module.exports = {
    findNearestOpenAQLocation,
    matchStationToOpenAQ,
    matchAllStations
};