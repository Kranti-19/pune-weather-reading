// services/openaqScheduler.js

const {
  syncOpenAQ,
} = require("../controllers/openaqController");

const STATION_ID = 2;

// 10 minutes
const SYNC_INTERVAL =
  10 * 60 * 1000;


// ======================================================
// Run OpenAQ synchronization
// ======================================================

async function runOpenAQSync() {

  console.log(
    "\n======================================"
  );

  console.log(
    "Automatic OpenAQ sync started"
  );

  console.log(
    "Station:",
    STATION_ID
  );

  console.log(
    "Time:",
    new Date().toISOString()
  );


  // ----------------------------------------------------
  // Fake Express request
  // ----------------------------------------------------

  const req = {
    params: {
      stationId: STATION_ID,
    },
  };


  // ----------------------------------------------------
  // Fake Express response
  // ----------------------------------------------------

  const res = {

    status(code) {

      return {

        json(data) {

          console.log(
            `OpenAQ sync response (${code}):`
          );

          console.log(
            JSON.stringify(
              data,
              null,
              2
            )
          );

        },

      };

    },


    json(data) {

      console.log(
        "OpenAQ sync response:"
      );

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

    },

  };


  try {

    await syncOpenAQ(
      req,
      res
    );

  } catch (error) {

    console.error(
      "Automatic OpenAQ sync failed:"
    );

    console.error(
      error
    );

  }


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
    "Station:",
    STATION_ID
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


module.exports = {
  startOpenAQScheduler,
};