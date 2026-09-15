// services/openaqScheduler.js

const supabase = require("../config/supabase");

const {
  syncOpenAQ,
} = require("../controllers/openaqController");


// ======================================================
// Configuration
// ======================================================

// 10 minutes
const SYNC_INTERVAL =
  10 * 60 * 1000;


// ======================================================
// Create fake Express response
// ======================================================

function createSchedulerResponse(stationId) {

  return {

    statusCode: 200,


    status(code) {

      this.statusCode = code;

      return this;

    },


    json(data) {

      console.log(
        `OpenAQ sync response for Station ${stationId} (${this.statusCode}):`
      );

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      return data;

    },

  };

}


// ======================================================
// Get all stations mapped to OpenAQ
// ======================================================

async function getMappedStations() {

  console.log(
    "Fetching PMC stations mapped to OpenAQ..."
  );


  const {
    data: stations,
    error,
  } = await supabase

    .from("station")

    .select(`
      station_id,
      name,
      latitude,
      longitude,
      status,
      external_source,
      external_station_id
    `)

    .eq(
      "external_source",
      "OPENAQ"
    )

    .not(
      "external_station_id",
      "is",
      null
    )

    .order(
      "station_id",
      {
        ascending: true,
      }
    );


  if (error) {

    console.error(
      "Failed to fetch OpenAQ mapped stations:"
    );

    console.error(error);

    throw error;

  }


  return stations || [];

}


// ======================================================
// Sync one station
// ======================================================

async function syncStation(station) {

  console.log(
    "\n--------------------------------------"
  );

  console.log(
    "Starting OpenAQ sync for station"
  );

  console.log(
    "Station ID:",
    station.station_id
  );

  console.log(
    "Station Name:",
    station.name
  );

  console.log(
    "OpenAQ Location:",
    station.external_station_id
  );

  console.log(
    "--------------------------------------"
  );


  // ----------------------------------------------------
  // Fake Express request
  // ----------------------------------------------------

  const req = {

    params: {

      stationId:
        station.station_id,

    },

  };


  // ----------------------------------------------------
  // Fake Express response
  // ----------------------------------------------------

  const res =
    createSchedulerResponse(
      station.station_id
    );


  try {

    await syncOpenAQ(
      req,
      res
    );


    console.log(
      `OpenAQ sync completed for station ${station.station_id}`
    );


  } catch (error) {

    console.error(
      `OpenAQ sync failed for station ${station.station_id}:`
    );

    console.error(
      error
    );

  }

}


// ======================================================
// Run OpenAQ synchronization for ALL mapped stations
// ======================================================

async function runOpenAQSync() {

  console.log(
    "\n======================================"
  );

  console.log(
    "Automatic OpenAQ sync started"
  );

  console.log(
    "Time:",
    new Date().toISOString()
  );

  console.log(
    "======================================"
  );


  try {

    // --------------------------------------------------
    // Get all stations mapped to OpenAQ
    // --------------------------------------------------

    const stations =
      await getMappedStations();


    // --------------------------------------------------
    // No stations found
    // --------------------------------------------------

    if (
      stations.length === 0
    ) {

      console.log(
        "No stations mapped to OpenAQ."
      );

      console.log(
        "Nothing to synchronize."
      );

      return;

    }


    console.log(
      `Found ${stations.length} OpenAQ mapped station(s).`
    );


    // --------------------------------------------------
    // Display stations
    // --------------------------------------------------

    stations.forEach(
      (station, index) => {

        console.log(
          `${index + 1}. ${station.name} ` +
          `(Station ID: ${station.station_id}, ` +
          `OpenAQ: ${station.external_station_id})`
        );

      }
    );


    // --------------------------------------------------
    // Sync each station
    // --------------------------------------------------

    for (
      const station of stations
    ) {

      await syncStation(
        station
      );

    }


    console.log(
      "\nAll OpenAQ stations synchronized."
    );


  } catch (error) {

    console.error(
      "Automatic OpenAQ synchronization failed:"
    );

    console.error(
      error
    );

  }


  console.log(
    "======================================"
  );

  console.log(
    "Automatic OpenAQ sync finished"
  );

  console.log(
    "======================================\n"
  );

}


// ======================================================
// Start Scheduler
// ======================================================

function startOpenAQScheduler() {

  console.log(
    "======================================"
  );

  console.log(
    "OpenAQ Scheduler Started"
  );

  console.log(
    "Mode: ALL MAPPED STATIONS"
  );

  console.log(
    "Interval: Every 10 minutes"
  );

  console.log(
    "======================================"
  );


  // ----------------------------------------------------
  // Run immediately when server starts
  // ----------------------------------------------------

  runOpenAQSync();


  // ----------------------------------------------------
  // Run every 10 minutes
  // ----------------------------------------------------

  setInterval(
    runOpenAQSync,
    SYNC_INTERVAL
  );

}


// ======================================================
// Exports
// ======================================================

module.exports = {

  startOpenAQScheduler,

  runOpenAQSync,

};