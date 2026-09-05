import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Building2,
  CalendarDays,
  Activity,
  Navigation,
  Layers,
  CheckCircle,
  ArrowLeft,
  Wifi,
  Cpu,
  Radio,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft as BackIcon,
} from "lucide-react";


// ============================================================
// DEFAULT VALUES
// ============================================================

const getToday = () =>
  new Date().toISOString().split("T")[0];

const initialStationData = {
  name: "",
  ward: "",
  zone: "",
  latitude: "",
  longitude: "",
  station_type: "Construction Site",
  installation_date: getToday(),
  status: "active",
};

const initialDeviceData = {
  gateway_id: "",
  manufacturer: "",
  model: "",
  firmware: "",
  ip_network: "",
  status: "active",
};

const createInitialSensor = () => ({
  sensor_type: "PM2.5",
  model: "",
  serial_number: "",
  installation_date: getToday(),
  calibration_date: "",
  status: "active",
});


// ============================================================
// COMPONENT
// ============================================================

function AddMonitoringSite() {
  const navigate = useNavigate();

  // ==========================================================
  // STEP
  // ==========================================================

  const [currentStep, setCurrentStep] = useState(1);

  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [stationData, setStationData] = useState(
    initialStationData
  );

  const [deviceData, setDeviceData] = useState(
    initialDeviceData
  );

  const [sensors, setSensors] = useState([
    createInitialSensor(),
  ]);

  // ==========================================================
  // CREATED IDS
  // ==========================================================

  const [stationId, setStationId] = useState(null);

  const [deviceId, setDeviceId] = useState(null);

  // ==========================================================
  // UI STATES
  // ==========================================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);


  // ==========================================================
  // STEP 1 - STATION INPUT
  // ==========================================================

  const handleStationChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setStationData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  // ==========================================================
  // STEP 2 - DEVICE INPUT
  // ==========================================================

  const handleDeviceChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setDeviceData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  // ==========================================================
  // STEP 3 - SENSOR INPUT
  // ==========================================================

  const handleSensorChange = (
    index,
    field,
    value
  ) => {
    setSensors((prev) =>
      prev.map((sensor, sensorIndex) =>
        sensorIndex === index
          ? {
              ...sensor,
              [field]: value,
            }
          : sensor
      )
    );

    setError("");
    setSuccess("");
  };


  // ==========================================================
  // ADD SENSOR
  // ==========================================================

  const handleAddSensor = () => {
    setSensors((prev) => [
      ...prev,
      createInitialSensor(),
    ]);

    setError("");
  };


  // ==========================================================
  // REMOVE SENSOR
  // ==========================================================

  const handleRemoveSensor = (index) => {
    if (sensors.length === 1) {
      setError(
        "At least one sensor is required."
      );
      return;
    }

    setSensors((prev) =>
      prev.filter(
        (_, sensorIndex) =>
          sensorIndex !== index
      )
    );

    setError("");
  };


  // ==========================================================
  // VALIDATE STATION
  // ==========================================================

  const validateStation = () => {
    if (!stationData.name.trim()) {
      setError(
        "Please enter the monitoring site name."
      );
      return false;
    }

    if (!stationData.ward.trim()) {
      setError(
        "Please enter the ward."
      );
      return false;
    }

    if (!stationData.zone.trim()) {
      setError(
        "Please enter the zone."
      );
      return false;
    }

    if (
      stationData.latitude === "" ||
      stationData.longitude === ""
    ) {
      setError(
        "Please enter latitude and longitude."
      );
      return false;
    }

    const latitude = Number(
      stationData.latitude
    );

    const longitude = Number(
      stationData.longitude
    );

    if (
      Number.isNaN(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      setError(
        "Please enter a valid latitude between -90 and 90."
      );
      return false;
    }

    if (
      Number.isNaN(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError(
        "Please enter a valid longitude between -180 and 180."
      );
      return false;
    }

    if (
      !stationData.installation_date
    ) {
      setError(
        "Please select the installation date."
      );
      return false;
    }

    return true;
  };


  // ==========================================================
  // STEP 1
  // CREATE STATION
  // ==========================================================

  const handleStationSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateStation()) return;

    // Do not store anything yet.
    setCurrentStep(2);
  };

  // ==========================================================
  // VALIDATE DEVICE
  // ==========================================================

  const validateDevice = () => {
    if (!deviceData.gateway_id.trim()) {
      setError(
        "Please enter the Gateway ID."
      );
      return false;
    }

    if (!deviceData.manufacturer.trim()) {
      setError(
        "Please enter the device manufacturer."
      );
      return false;
    }

    if (!deviceData.model.trim()) {
      setError(
        "Please enter the device model."
      );
      return false;
    }

    if (!deviceData.status) {
      setError(
        "Please select device status."
      );
      return false;
    }

    if (!stationId) {
      setError(
        "Station ID is missing. Please go back and create the station again."
      );
      return false;
    }

    return true;
  };


  // ==========================================================
  // STEP 2
  // CREATE DEVICE
  // ==========================================================

  const handleDeviceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateDevice()) return;

    // Do not store anything yet.
    setCurrentStep(3);
  };

  // ==========================================================
  // VALIDATE SENSORS
  // ==========================================================

  const validateSensors = () => {
    if (
      !sensors ||
      sensors.length === 0
    ) {
      setError(
        "Please add at least one sensor."
      );
      return false;
    }

    for (
      let i = 0;
      i < sensors.length;
      i++
    ) {
      const sensor =
        sensors[i];

      if (
        !sensor.sensor_type
      ) {
        setError(
          `Please select a sensor type for Sensor ${i + 1}.`
        );
        return false;
      }

      if (
        !sensor.installation_date
      ) {
        setError(
          `Please select an installation date for Sensor ${i + 1}.`
        );
        return false;
      }

      if (!sensor.status) {
        setError(
          `Please select a status for Sensor ${i + 1}.`
        );
        return false;
      }
    }

    return true;
  };


  // ==========================================================
  // STEP 3
  // CREATE SENSORS
  // ==========================================================

  const handleSensorsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate all three sections BEFORE any database request.
    if (!validateStation()) {
      setCurrentStep(1);
      return;
    }

    if (!validateDevice()) {
      setCurrentStep(2);
      return;
    }

    if (!validateSensors()) return;

    try {
      setLoading(true);

      // ONE request for the complete setup.
      // Backend/database transaction guarantees:
      // ALL Station + Device + Sensors are stored,
      // OR NONE of them are stored.
      const response = await axios.post(
        "http://localhost:5000/api/stations/setup",
        {
          station: {
            name: stationData.name.trim(),
            ward: stationData.ward.trim(),
            zone: stationData.zone.trim(),
            latitude: Number(stationData.latitude),
            longitude: Number(stationData.longitude),
            station_type: stationData.station_type,
            installation_date: stationData.installation_date,
            status: stationData.status,
          },
          device: {
            gateway_id: deviceData.gateway_id.trim(),
            manufacturer: deviceData.manufacturer.trim(),
            model: deviceData.model.trim(),
            firmware: deviceData.firmware.trim() || null,
            ip_network: deviceData.ip_network.trim() || null,
            status: deviceData.status,
          },
          sensors: sensors.map((sensor) => ({
            sensor_type: sensor.sensor_type,
            model: sensor.model.trim() || null,
            serial_number: sensor.serial_number.trim() || null,
            installation_date: sensor.installation_date,
            calibration_date: sensor.calibration_date || null,
            status: sensor.status,
          })),
        }
      );

      const setup = response.data?.setup;

      if (!setup?.station?.station_id || !setup?.device?.device_id) {
        throw new Error("Server did not return the created station/device IDs.");
      }

      setStationId(setup.station.station_id);
      setDeviceId(setup.device.device_id);

      setSuccess(
        `Monitoring site setup completed successfully. Station ID: ${setup.station.station_id}, Device ID: ${setup.device.device_id}, ${setup.sensors?.length || sensors.length} sensor(s) added.`
      );

      setTimeout(() => {
        navigate("/monitoring-stations");
      }, 1500);
    } catch (error) {
      console.error("Complete monitoring site setup error:", error);

      setError(
        error.response?.data?.message ||
        error.message ||
        "Setup failed. No station, device, or sensor data was stored."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // BACK TO PREVIOUS STEP
  // ==========================================================

  const handleBackStep = () => {
    setError("");
    setSuccess("");

    if (currentStep === 2) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(2);
    }
  };


  // ==========================================================
  // RESET EVERYTHING
  // ==========================================================

  const handleReset = () => {
    setCurrentStep(1);

    setStationData({
      ...initialStationData,
      installation_date:
        getToday(),
    });

    setDeviceData({
      ...initialDeviceData,
    });

    setSensors([
      createInitialSensor(),
    ]);

    setStationId(null);

    setDeviceId(null);

    setError("");

    setSuccess("");
  };


  // ==========================================================
  // STEP INDICATOR
  // ==========================================================

  const steps = [
    {
      number: 1,
      title: "Monitoring Site",
      description: "Station details",
      icon: Building2,
    },
    {
      number: 2,
      title: "Device",
      description: "Gateway details",
      icon: Wifi,
    },
    {
      number: 3,
      title: "Sensors",
      description: "Sensor details",
      icon: Radio,
    },
  ];


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">

      <div className="max-w-6xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <p className="text-sm font-semibold tracking-wide text-blue-600 mb-2">
              PMC ADMIN PORTAL
            </p>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Add Monitoring Site
            </h1>

            <p className="text-gray-500 mt-2 max-w-2xl">
              Register a monitoring station,
              gateway device and environmental
              sensors in the Pune monitoring
              network.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>


        {/* ==================================================
            STEP PROGRESS
        ================================================== */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {steps.map((step) => {
              const Icon =
                step.icon;

              const isActive =
                currentStep ===
                step.number;

              const isCompleted =
                currentStep >
                step.number;

              return (
                <div
                  key={
                    step.number
                  }
                  className="flex items-center gap-3"
                >

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-green-100 text-green-600"
                        : isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle
                        size={21}
                      />
                    ) : (
                      <Icon
                        size={21}
                      />
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isActive ||
                        isCompleted
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      Step{" "}
                      {step.number}{" "}
                      —{" "}
                      {step.title}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {
                        step.description
                      }
                    </p>
                  </div>

                </div>
              );
            })}

          </div>

        </div>


        {/* ==================================================
            CREATED ID INFORMATION
        ================================================== */}

        {(stationId ||
          deviceId) && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">

            <div className="flex flex-wrap gap-4 text-sm">

              {stationId && (
                <div>
                  <span className="text-blue-600 font-medium">
                    Station ID:
                  </span>{" "}
                  <span className="font-bold text-blue-900">
                    {stationId}
                  </span>
                </div>
              )}

              {deviceId && (
                <div>
                  <span className="text-blue-600 font-medium">
                    Device ID:
                  </span>{" "}
                  <span className="font-bold text-blue-900">
                    {deviceId}
                  </span>
                </div>
              )}

            </div>

          </div>
        )}


        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {success && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-4">

            <CheckCircle
              size={20}
              className="shrink-0"
            />

            <span>
              {success}
            </span>

          </div>
        )}


        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">

            {error}

          </div>
        )}


        {/* ==================================================
            STEP 1 - STATION
        ================================================== */}

        {currentStep === 1 && (
          <form
            onSubmit={
              handleStationSubmit
            }
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >

            {/* SITE INFORMATION */}

            <div className="p-6 lg:p-10 border-b border-gray-100">

              <div className="flex items-start gap-4 mb-7">

                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Site Information
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Enter the basic
                    information about
                    the monitoring
                    location.
                  </p>
                </div>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* SITE NAME */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monitoring Site Name
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Building2
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="name"
                      value={
                        stationData.name
                      }
                      onChange={
                        handleStationChange
                      }
                      placeholder="e.g. Kharadi Construction Monitoring Station"
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />

                  </div>

                </div>


                {/* WARD */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ward
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <MapPin
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="ward"
                      value={
                        stationData.ward
                      }
                      onChange={
                        handleStationChange
                      }
                      placeholder="e.g. Kharadi"
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />

                  </div>

                </div>


                {/* ZONE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Layers
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="zone"
                      value={
                        stationData.zone
                      }
                      onChange={
                        handleStationChange
                      }
                      placeholder="e.g. East"
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />

                  </div>

                </div>


                {/* STATION TYPE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Station Type
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Activity
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />

                    <select
                      name="station_type"
                      value={
                        stationData.station_type
                      }
                      onChange={
                        handleStationChange
                      }
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition appearance-none"
                    >
                      <option value="Construction Site">
                        Construction Site
                      </option>

                      <option value="Fixed">
                        Fixed
                      </option>

                      <option value="Mobile">
                        Mobile
                      </option>

                      <option value="Industrial">
                        Industrial
                      </option>

                      <option value="Traffic">
                        Traffic
                      </option>
                    </select>

                  </div>

                </div>


                {/* STATUS */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Activity
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />

                    <select
                      name="status"
                      value={
                        stationData.status
                      }
                      onChange={
                        handleStationChange
                      }
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition appearance-none"
                    >
                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>
                    </select>

                  </div>

                </div>

              </div>

            </div>


            {/* LOCATION */}

            <div className="p-6 lg:p-10 border-b border-gray-100">

              <div className="flex items-start gap-4 mb-7">

                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Location
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Enter the exact
                    geographic
                    coordinates of the
                    monitoring site.
                  </p>
                </div>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* LATITUDE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Navigation
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="number"
                      name="latitude"
                      value={
                        stationData.latitude
                      }
                      onChange={
                        handleStationChange
                      }
                      placeholder="18.5510"
                      step="any"
                      min="-90"
                      max="90"
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />

                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Range: -90 to 90
                  </p>

                </div>


                {/* LONGITUDE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Navigation
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90"
                    />

                    <input
                      type="number"
                      name="longitude"
                      value={
                        stationData.longitude
                      }
                      onChange={
                        handleStationChange
                      }
                      placeholder="73.9430"
                      step="any"
                      min="-180"
                      max="180"
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />

                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Range: -180 to 180
                  </p>

                </div>


                {/* INSTALLATION DATE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Installation Date
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <CalendarDays
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="date"
                      name="installation_date"
                      value={
                        stationData.installation_date
                      }
                      onChange={
                        handleStationChange
                      }
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />

                  </div>

                </div>

              </div>


              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">

                <div className="flex gap-3">

                  <MapPin
                    size={20}
                    className="text-blue-600 shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="text-sm font-semibold text-blue-800">
                      Location information
                    </p>

                    <p className="text-xs text-blue-700 mt-1 leading-5">
                      These coordinates
                      will be used to
                      display the
                      monitoring
                      station on the
                      Pune monitoring
                      map.
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="bg-gray-50 px-6 lg:px-10 py-6 flex flex-col sm:flex-row sm:justify-end gap-3">

              <button
                type="button"
                onClick={
                  handleReset
                }
                disabled={loading}
                className="px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >
                Clear Form
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                disabled={loading}
                className="px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`px-7 py-3 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating Site...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight
                      size={18}
                    />
                  </>
                )}
              </button>

            </div>

          </form>
        )}


        {/* ==================================================
            STEP 2 - DEVICE
        ================================================== */}

        {currentStep === 2 && (
          <form
            onSubmit={
              handleDeviceSubmit
            }
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >

            <div className="p-6 lg:p-10">

              <div className="flex items-start gap-4 mb-8">

                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Wifi size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Device / Gateway
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Register the gateway
                    device connected to
                    this monitoring
                    station.
                  </p>
                </div>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* GATEWAY ID */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gateway ID
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Wifi
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="gateway_id"
                      value={
                        deviceData.gateway_id
                      }
                      onChange={
                        handleDeviceChange
                      }
                      placeholder="e.g. GW-KHR-001"
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />

                  </div>

                </div>


                {/* MANUFACTURER */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Building2
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="manufacturer"
                      value={
                        deviceData.manufacturer
                      }
                      onChange={
                        handleDeviceChange
                      }
                      placeholder="e.g. AQMS Technologies"
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />

                  </div>

                </div>


                {/* MODEL */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Cpu
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="model"
                      value={
                        deviceData.model
                      }
                      onChange={
                        handleDeviceChange
                      }
                      placeholder="e.g. AQMS-GW-100"
                      className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />

                  </div>

                </div>


                {/* FIRMWARE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firmware Version
                  </label>

                  <input
                    type="text"
                    name="firmware"
                    value={
                      deviceData.firmware
                    }
                    onChange={
                      handleDeviceChange
                    }
                    placeholder="e.g. 1.0.0"
                    className="w-full border border-gray-200 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />

                </div>


                {/* IP NETWORK */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP / Network
                  </label>

                  <input
                    type="text"
                    name="ip_network"
                    value={
                      deviceData.ip_network
                    }
                    onChange={
                      handleDeviceChange
                    }
                    placeholder="e.g. 192.168.1.20"
                    className="w-full border border-gray-200 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />

                </div>


                {/* STATUS */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Status
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <select
                    name="status"
                    value={
                      deviceData.status
                    }
                    onChange={
                      handleDeviceChange
                    }
                    className="w-full border border-gray-200 rounded-xl py-3.5 px-4 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="online">
                      Online
                    </option>

                    <option value="offline">
                      Offline
                    </option>

                    <option value="maintenance">
                      Maintenance
                    </option>

                  </select>

                </div>

              </div>


              {/* STATION CONNECTION */}

              <div className="mt-8 bg-green-50 border border-green-100 rounded-xl p-4">

                <div className="flex gap-3">

                  <CheckCircle
                    size={20}
                    className="text-green-600 shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="text-sm font-semibold text-green-800">
                      Device will be connected
                      automatically
                    </p>

                    <p className="text-xs text-green-700 mt-1">
                      This device will be
                      linked to Station ID{" "}
                      <strong>
                        {stationId}
                      </strong>
                      .
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="bg-gray-50 px-6 lg:px-10 py-6 flex flex-col sm:flex-row sm:justify-between gap-3">

              <button
                type="button"
                onClick={
                  handleBackStep
                }
                disabled={loading}
                className="px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <BackIcon
                  size={18}
                />
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`px-7 py-3 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Adding Device...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight
                      size={18}
                    />
                  </>
                )}
              </button>

            </div>

          </form>
        )}


        {/* ==================================================
            STEP 3 - SENSORS
        ================================================== */}

        {currentStep === 3 && (
          <form
            onSubmit={
              handleSensorsSubmit
            }
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >

            <div className="p-6 lg:p-10">

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">

                <div className="flex items-start gap-4">

                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Radio size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Environmental Sensors
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Add the sensors
                      connected to the
                      gateway device.
                    </p>
                  </div>

                </div>


                <button
                  type="button"
                  onClick={
                    handleAddSensor
                  }
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                >
                  <Plus size={17} />
                  Add Sensor
                </button>

              </div>


              {/* SENSOR CARDS */}

              <div className="space-y-6">

                {sensors.map(
                  (
                    sensor,
                    index
                  ) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-2xl p-5 lg:p-6 bg-gray-50/50"
                    >

                      {/* SENSOR HEADER */}

                      <div className="flex items-center justify-between mb-5">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Radio
                              size={18}
                            />
                          </div>

                          <div>

                            <h3 className="font-bold text-gray-900">
                              Sensor{" "}
                              {index +
                                1}
                            </h3>

                            <p className="text-xs text-gray-400">
                              Connected to
                              Device{" "}
                              {
                                deviceId
                              }
                            </p>

                          </div>

                        </div>


                        {sensors.length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveSensor(
                                index
                              )
                            }
                            disabled={
                              loading
                            }
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Remove sensor"
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        )}

                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* SENSOR TYPE */}

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sensor Type
                            <span className="text-red-500 ml-1">
                              *
                            </span>
                          </label>

                          <select
                            value={
                              sensor.sensor_type
                            }
                            onChange={(
                              e
                            ) =>
                              handleSensorChange(
                                index,
                                "sensor_type",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded-xl py-3.5 px-4 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                          >

                            <option value="PM2.5">
                              PM2.5
                            </option>

                            <option value="PM10">
                              PM10
                            </option>

                            <option value="NO2">
                              NO₂
                            </option>

                            <option value="SO2">
                              SO₂
                            </option>

                            <option value="CO">
                              CO
                            </option>

                            <option value="O3">
                              O₃
                            </option>

                            <option value="NH3">
                              NH₃
                            </option>

                            <option value="Pb">
                              Lead (Pb)
                            </option>

                            <option value="Temperature">
                              Temperature
                            </option>

                            <option value="Humidity">
                              Humidity
                            </option>

                            <option value="Wind Speed">
                              Wind Speed
                            </option>

                            <option value="Wind Direction">
                              Wind Direction
                            </option>

                            <option value="Rainfall">
                              Rainfall
                            </option>

                            <option value="Pressure">
                              Pressure
                            </option>

                          </select>

                        </div>


                        {/* MODEL */}

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sensor Model
                          </label>

                          <input
                            type="text"
                            value={
                              sensor.model
                            }
                            onChange={(
                              e
                            ) =>
                              handleSensorChange(
                                index,
                                "model",
                                e.target.value
                              )
                            }
                            placeholder="e.g. PM25-S100"
                            className="w-full border border-gray-200 rounded-xl py-3.5 px-4 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                          />

                        </div>


                        {/* SERIAL NUMBER */}

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Serial Number
                          </label>

                          <input
                            type="text"
                            value={
                              sensor.serial_number
                            }
                            onChange={(
                              e
                            ) =>
                              handleSensorChange(
                                index,
                                "serial_number",
                                e.target.value
                              )
                            }
                            placeholder="e.g. SN-PM25-001"
                            className="w-full border border-gray-200 rounded-xl py-3.5 px-4 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                          />

                        </div>


                        {/* INSTALLATION DATE */}

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Installation Date
                            <span className="text-red-500 ml-1">
                              *
                            </span>
                          </label>

                          <div className="relative">

                            <CalendarDays
                              size={18}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                              type="date"
                              value={
                                sensor.installation_date
                              }
                              onChange={(
                                e
                              ) =>
                                handleSensorChange(
                                  index,
                                  "installation_date",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />

                          </div>

                        </div>


                        {/* CALIBRATION DATE */}

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Calibration Date
                          </label>

                          <div className="relative">

                            <CalendarDays
                              size={18}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                              type="date"
                              value={
                                sensor.calibration_date
                              }
                              onChange={(
                                e
                              ) =>
                                handleSensorChange(
                                  index,
                                  "calibration_date",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />

                          </div>

                        </div>


                        {/* STATUS */}

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sensor Status
                            <span className="text-red-500 ml-1">
                              *
                            </span>
                          </label>

                          <select
                            value={
                              sensor.status
                            }
                            onChange={(
                              e
                            ) =>
                              handleSensorChange(
                                index,
                                "status",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded-xl py-3.5 px-4 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                          >

                            <option value="active">
                              Active
                            </option>

                            <option value="online">
                              Online
                            </option>

                            <option value="offline">
                              Offline
                            </option>

                            <option value="maintenance">
                              Maintenance
                            </option>

                          </select>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>


              {/* SENSOR INFORMATION */}

              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4">

                <div className="flex gap-3">

                  <Radio
                    size={20}
                    className="text-blue-600 shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="text-sm font-semibold text-blue-800">
                      Sensor registration
                    </p>

                    <p className="text-xs text-blue-700 mt-1 leading-5">
                      You can add multiple
                      sensors to the same
                      gateway. Each sensor
                      will automatically be
                      connected to Device{" "}
                      <strong>
                        {deviceId}
                      </strong>
                      .
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="bg-gray-50 px-6 lg:px-10 py-6 flex flex-col sm:flex-row sm:justify-between gap-3">

              <button
                type="button"
                onClick={
                  handleBackStep
                }
                disabled={loading}
                className="px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <BackIcon
                  size={18}
                />
                Back
              </button>


              <button
                type="submit"
                disabled={loading}
                className={`px-7 py-3 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Adding Sensors...
                  </>
                ) : (
                  <>
                    <CheckCircle
                      size={18}
                    />
                    Complete Setup
                  </>
                )}
              </button>

            </div>

          </form>
        )}


        {/* ==================================================
            FOOTER
        ================================================== */}

        <p className="text-center text-xs text-gray-400 mt-6">
          Authorized PMC personnel only
        </p>

      </div>

    </div>
  );
}


export default AddMonitoringSite;