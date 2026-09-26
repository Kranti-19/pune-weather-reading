import React, { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Database,
  Loader2,
  RadioTower,
  RefreshCw,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";

// ============================================================
// API
// ============================================================

const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api`;

// ============================================================
// DEFAULT SETTINGS
// ============================================================

const DEFAULT_SETTINGS = {
  // ----------------------------------------------------------
  // General
  // ----------------------------------------------------------

  system_name: "PMC Air Quality Monitoring System",
  organization: "Pune Municipal Corporation",
  aqi_standard: "CPCB National AQI",
  timezone: "Asia/Kolkata",

  dashboard_refresh_seconds: 10,

  // ----------------------------------------------------------
  // AQI
  // Values come from alert_configuration
  // ----------------------------------------------------------

  aqi_warning_threshold: 201,
  aqi_critical_threshold: 301,

  // ----------------------------------------------------------
  // Pollutants
  // Values come from alert_configuration
  // ----------------------------------------------------------

  pm25_warning_threshold: 60,
  pm25_critical_threshold: 90,

  pm10_warning_threshold: 100,
  pm10_critical_threshold: 150,

  no2_warning_threshold: 80,
  no2_critical_threshold: 120,

  so2_warning_threshold: 80,
  so2_critical_threshold: 120,

  co_warning_threshold: 2,
  co_critical_threshold: 4,

  o3_warning_threshold: 100,
  o3_critical_threshold: 180,

  // ----------------------------------------------------------
  // Device
  // ----------------------------------------------------------

  device_offline_timeout_minutes: 15,

  battery_warning_threshold: 30,
  battery_critical_threshold: 15,

  // ----------------------------------------------------------
  // Data
  // ----------------------------------------------------------

  openaq_sync_interval_minutes: 10,
  data_freshness_minutes: 60,

  // ----------------------------------------------------------
  // Monitoring
  // ----------------------------------------------------------

  live_monitoring: true,
  data_validation: true,
  device_health_monitoring: true,

  // ----------------------------------------------------------
  // Notifications
  // ----------------------------------------------------------

  notify_high_aqi: true,
  notify_pollutant_threshold: true,
  notify_station_offline: true,
  notify_sensor_fault: true,
  notify_low_battery: true,
  notify_network_failure: true,
  notify_calibration_due: true,
  notify_maintenance_due: true,

  // ----------------------------------------------------------
  // Maintenance
  // ----------------------------------------------------------

  calibration_due_days: 7,
  maintenance_due_days: 7,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Settings() {
  const [settings, setSettings] = useState(
    DEFAULT_SETTINGS
  );

  const [activeTab, setActiveTab] = useState(
    "general"
  );

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [resetting, setResetting] = useState(false);

  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");

  const [
    desktopNotifPermission,
    setDesktopNotifPermission,
  ] = useState(
    typeof window !== "undefined" &&
      "Notification" in window
      ? Notification.permission
      : "default"
  );

  // ==========================================================
  // LOAD SETTINGS
  // ==========================================================

  useEffect(() => {
    loadSettings();
  }, []);

  // ==========================================================
  // LOAD SETTINGS FROM BACKEND
  // ==========================================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setSaved(false);

      const response = await fetch(
        `${API_BASE_URL}/settings`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load settings"
        );
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(data.settings || {}),
      });

      if (
        typeof window !== "undefined" &&
        "Notification" in window
      ) {
        setDesktopNotifPermission(
          Notification.permission
        );
      }
    } catch (err) {
      console.error(
        "Load settings error:",
        err
      );

      setError(
        err.message ||
          "Unable to load system settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // HANDLE TEXT
  // ==========================================================

  const handleTextChange = (
    field,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
    setError("");
  };

  // ==========================================================
  // HANDLE NUMBER
  // ==========================================================

  const handleNumberChange = (
    field,
    value
  ) => {
    const convertedValue =
      value === "" ? "" : Number(value);

    setSettings((prev) => ({
      ...prev,
      [field]: convertedValue,
    }));

    setSaved(false);
    setError("");
  };

  // ==========================================================
  // HANDLE TOGGLE
  // ==========================================================

  const handleToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

    setSaved(false);
    setError("");
  };

  // ==========================================================
  // REQUEST BROWSER NOTIFICATION
  // ==========================================================

  const handleRequestDesktopPermission =
    async () => {
      if (
        typeof window === "undefined" ||
        !("Notification" in window)
      ) {
        alert(
          "This browser does not support desktop notifications."
        );
        return;
      }

      try {
        const permission =
          await Notification.requestPermission();

        setDesktopNotifPermission(
          permission
        );

        if (permission === "granted") {
          new Notification(
            "PMC Air Quality System",
            {
              body:
                "Desktop notifications successfully enabled.",
              icon: "/favicon.ico",
            }
          );
        }
      } catch (err) {
        console.error(
          "Notification permission error:",
          err
        );
      }
    };

  // ==========================================================
  // VALIDATE THRESHOLDS
  // ==========================================================

  const validateThresholds = () => {
    const thresholdPairs = [
      [
        "AQI",
        "aqi_warning_threshold",
        "aqi_critical_threshold",
      ],
      [
        "PM2.5",
        "pm25_warning_threshold",
        "pm25_critical_threshold",
      ],
      [
        "PM10",
        "pm10_warning_threshold",
        "pm10_critical_threshold",
      ],
      [
        "NO2",
        "no2_warning_threshold",
        "no2_critical_threshold",
      ],
      [
        "SO2",
        "so2_warning_threshold",
        "so2_critical_threshold",
      ],
      [
        "CO",
        "co_warning_threshold",
        "co_critical_threshold",
      ],
      [
        "O3",
        "o3_warning_threshold",
        "o3_critical_threshold",
      ],
      [
        "Battery",
        "battery_critical_threshold",
        "battery_warning_threshold",
      ],
    ];

    for (const [
      name,
      firstField,
      secondField,
    ] of thresholdPairs) {
      const first = Number(
        settings[firstField]
      );

      const second = Number(
        settings[secondField]
      );

      if (
        Number.isNaN(first) ||
        Number.isNaN(second)
      ) {
        return `${name} thresholds must contain valid numbers.`;
      }

      /*
       * For Battery:
       * critical should be LOWER than warning.
       *
       * For everything else:
       * warning should be LOWER than critical.
       */
      if (name === "Battery") {
        if (first >= second) {
          return `${name} critical threshold must be lower than warning threshold.`;
        }
      } else {
        if (first >= second) {
          return `${name} warning threshold must be lower than critical threshold.`;
        }
      }
    }

    return "";
  };

  // ==========================================================
  // SAVE SETTINGS
  // ==========================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSaved(false);

      // ------------------------------------------------------
      // Validate thresholds
      // ------------------------------------------------------

      const thresholdError =
        validateThresholds();

      if (thresholdError) {
        setError(thresholdError);
        setSaving(false);
        return;
      }

      // ------------------------------------------------------
      // General validation
      // ------------------------------------------------------

      if (
        Number(
          settings.dashboard_refresh_seconds
        ) < 1
      ) {
        setError(
          "Dashboard refresh must be at least 1 second."
        );
        setSaving(false);
        return;
      }

      if (
        Number(
          settings.openaq_sync_interval_minutes
        ) < 1
      ) {
        setError(
          "OpenAQ sync interval must be at least 1 minute."
        );
        setSaving(false);
        return;
      }

      if (
        Number(
          settings.data_freshness_minutes
        ) < 1
      ) {
        setError(
          "Data freshness must be at least 1 minute."
        );
        setSaving(false);
        return;
      }

      if (
        Number(
          settings.device_offline_timeout_minutes
        ) < 1
      ) {
        setError(
          "Device offline timeout must be at least 1 minute."
        );
        setSaving(false);
        return;
      }

      // ------------------------------------------------------
      // Send to backend
      // ------------------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to save settings"
        );
      }

      // ------------------------------------------------------
      // Use backend response as final source
      // ------------------------------------------------------

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(data.settings || {}),
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      console.error(
        "Save settings error:",
        err
      );

      setError(
        err.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // RESET SETTINGS
  // ==========================================================

  const handleResetDefaults =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to reset all system settings and alert thresholds to their default values?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setResetting(true);
        setError("");
        setSaved(false);

        const response =
          await fetch(
            `${API_BASE_URL}/settings/reset`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to reset settings"
          );
        }

        setSettings({
          ...DEFAULT_SETTINGS,
          ...(data.settings || {}),
        });

        setSaved(true);

        setTimeout(() => {
          setSaved(false);
        }, 3000);
      } catch (err) {
        console.error(
          "Reset settings error:",
          err
        );

        setError(
          err.message ||
            "Unable to reset settings."
        );
      } finally {
        setResetting(false);
      }
    };

  // ==========================================================
  // TABS
  // ==========================================================

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: SettingsIcon,
    },
    {
      id: "aqi",
      label: "AQI & Alerts",
      icon: AlertTriangle,
    },
    {
      id: "devices",
      label: "Devices & Sensors",
      icon: RadioTower,
    },
    {
      id: "sync",
      label: "Data Sync",
      icon: RefreshCw,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
  ];

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#edf3f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={30}
            className="animate-spin text-blue-600"
          />

          <p className="text-xs font-bold text-slate-500">
            Loading system settings...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#edf3f8] text-slate-800 p-6 sm:p-8 lg:p-10 font-sans">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-7">

        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <span>
              System Administration
            </span>

            <span>/</span>

            <span className="text-blue-600 font-bold">
              Settings
            </span>
          </div>

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <SettingsIcon size={20} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                System Settings
              </h1>

              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                Configure PMC air quality monitoring parameters
              </p>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={resetting}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {resetting ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <RotateCcw size={14} />
            )}

            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition disabled:opacity-60"
          >
            {saving ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Save size={14} />
            )}

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs font-bold">

          <AlertTriangle
            size={17}
            className="text-rose-600 shrink-0"
          />

          <span>{error}</span>

        </div>
      )}

      {/* ================================================== */}
      {/* SUCCESS */}
      {/* ================================================== */}

      {saved && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs font-bold shadow-sm">

          <CheckCircle2
            className="text-emerald-600"
            size={17}
          />

          <span>
            Settings saved successfully and synchronized with the system.
          </span>

        </div>
      )}

      {/* ================================================== */}
      {/* MAIN SETTINGS CARD */}
      {/* ================================================== */}

      <div className="bg-white rounded-[26px] border border-slate-100 shadow-sm overflow-hidden">

        {/* ================================================= */}
        {/* TABS */}
        {/* ================================================= */}

        <div className="border-b border-slate-100 px-5 pt-5">

          <div className="flex gap-1 overflow-x-auto">

            {tabs.map((tab) => {
              const Icon = tab.icon;

              const isActive =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap rounded-t-xl border-b-2 transition ${
                    isActive
                      ? "text-blue-600 border-blue-600 bg-blue-50/50"
                      : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={15} />

                  {tab.label}
                </button>
              );
            })}

          </div>

        </div>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="p-6 sm:p-7">

          {/* ================================================= */}
          {/* GENERAL */}
          {/* ================================================= */}

          {activeTab === "general" && (
            <div className="space-y-6">

              <SectionHeader
                icon={
                  <SettingsIcon size={20} />
                }
                title="General System Configuration"
                description="Basic configuration used throughout the monitoring platform."
                iconClass="bg-blue-50 text-blue-600"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <TextInput
                  label="System Name"
                  value={
                    settings.system_name
                  }
                  onChange={(value) =>
                    handleTextChange(
                      "system_name",
                      value
                    )
                  }
                />

                <TextInput
                  label="Organization"
                  value={
                    settings.organization
                  }
                  onChange={(value) =>
                    handleTextChange(
                      "organization",
                      value
                    )
                  }
                />

                <SelectInput
                  label="AQI Standard"
                  value={
                    settings.aqi_standard
                  }
                  options={[
                    "CPCB National AQI",
                    "US EPA AQI",
                  ]}
                  onChange={(value) =>
                    handleTextChange(
                      "aqi_standard",
                      value
                    )
                  }
                />

                <SelectInput
                  label="Time Zone"
                  value={
                    settings.timezone
                  }
                  options={[
                    "Asia/Kolkata",
                  ]}
                  onChange={(value) =>
                    handleTextChange(
                      "timezone",
                      value
                    )
                  }
                />

                <NumberInput
                  label="Dashboard Refresh"
                  value={
                    settings.dashboard_refresh_seconds
                  }
                  unit="sec"
                  description="Controls how often dashboard data is refreshed."
                  onChange={(value) =>
                    handleNumberChange(
                      "dashboard_refresh_seconds",
                      value
                    )
                  }
                />

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* AQI & ALERTS */}
          {/* ================================================= */}

          {activeTab === "aqi" && (
            <div className="space-y-8">

              <SectionHeader
                icon={
                  <AlertTriangle size={20} />
                }
                title="AQI & Alert Thresholds"
                description="These values are stored in alert_configuration and are used by the alert engine."
                iconClass="bg-rose-50 text-rose-600"
              />

              {/* AQI */}

              <div>

                <h3 className="text-xs font-black text-slate-900 mb-4">
                  AQI Thresholds
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <NumberInput
                    label="Warning AQI"
                    value={
                      settings.aqi_warning_threshold
                    }
                    onChange={(value) =>
                      handleNumberChange(
                        "aqi_warning_threshold",
                        value
                      )
                    }
                    description="Warning threshold stored in alert_configuration."
                  />

                  <NumberInput
                    label="Critical AQI"
                    value={
                      settings.aqi_critical_threshold
                    }
                    onChange={(value) =>
                      handleNumberChange(
                        "aqi_critical_threshold",
                        value
                      )
                    }
                    description="Critical threshold stored in alert_configuration."
                  />

                </div>

              </div>

              {/* POLLUTANTS */}

              <div>

                <h3 className="text-xs font-black text-slate-900 mb-4">
                  Pollutant Thresholds
                </h3>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">

                  <table className="w-full min-w-[720px]">

                    <thead>
                      <tr className="bg-slate-50">

                        <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-black text-slate-500">
                          Parameter
                        </th>

                        <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-black text-slate-500">
                          Warning
                        </th>

                        <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-black text-slate-500">
                          Critical
                        </th>

                        <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-black text-slate-500">
                          Unit
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      <PollutantRow
                        name="PM2.5"
                        warningValue={
                          settings.pm25_warning_threshold
                        }
                        criticalValue={
                          settings.pm25_critical_threshold
                        }
                        unit="µg/m³"
                        onWarningChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "pm25_warning_threshold",
                            value
                          )
                        }
                        onCriticalChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "pm25_critical_threshold",
                            value
                          )
                        }
                      />

                      <PollutantRow
                        name="PM10"
                        warningValue={
                          settings.pm10_warning_threshold
                        }
                        criticalValue={
                          settings.pm10_critical_threshold
                        }
                        unit="µg/m³"
                        onWarningChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "pm10_warning_threshold",
                            value
                          )
                        }
                        onCriticalChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "pm10_critical_threshold",
                            value
                          )
                        }
                      />

                      <PollutantRow
                        name="NO₂"
                        warningValue={
                          settings.no2_warning_threshold
                        }
                        criticalValue={
                          settings.no2_critical_threshold
                        }
                        unit="µg/m³"
                        onWarningChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "no2_warning_threshold",
                            value
                          )
                        }
                        onCriticalChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "no2_critical_threshold",
                            value
                          )
                        }
                      />

                      <PollutantRow
                        name="SO₂"
                        warningValue={
                          settings.so2_warning_threshold
                        }
                        criticalValue={
                          settings.so2_critical_threshold
                        }
                        unit="µg/m³"
                        onWarningChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "so2_warning_threshold",
                            value
                          )
                        }
                        onCriticalChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "so2_critical_threshold",
                            value
                          )
                        }
                      />

                      <PollutantRow
                        name="CO"
                        warningValue={
                          settings.co_warning_threshold
                        }
                        criticalValue={
                          settings.co_critical_threshold
                        }
                        unit="mg/m³"
                        onWarningChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "co_warning_threshold",
                            value
                          )
                        }
                        onCriticalChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "co_critical_threshold",
                            value
                          )
                        }
                      />

                      <PollutantRow
                        name="O₃"
                        warningValue={
                          settings.o3_warning_threshold
                        }
                        criticalValue={
                          settings.o3_critical_threshold
                        }
                        unit="µg/m³"
                        onWarningChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "o3_warning_threshold",
                            value
                          )
                        }
                        onCriticalChange={(
                          value
                        ) =>
                          handleNumberChange(
                            "o3_critical_threshold",
                            value
                          )
                        }
                      />

                    </tbody>

                  </table>

                </div>

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* DEVICES */}
          {/* ================================================= */}

          {activeTab === "devices" && (
            <div className="space-y-6">

              <SectionHeader
                icon={
                  <RadioTower size={20} />
                }
                title="Devices & Sensors"
                description="Configure hardware health monitoring and device timeout behavior."
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <NumberInput
                label="Device Offline Timeout"
                value={
                  settings.device_offline_timeout_minutes
                }
                unit="min"
                description="A station is considered offline when no heartbeat is received within this period."
                onChange={(value) =>
                  handleNumberChange(
                    "device_offline_timeout_minutes",
                    value
                  )
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <NumberInput
                  label="Battery Warning"
                  value={
                    settings.battery_warning_threshold
                  }
                  unit="%"
                  description="Battery warning threshold."
                  onChange={(value) =>
                    handleNumberChange(
                      "battery_warning_threshold",
                      value
                    )
                  }
                />

                <NumberInput
                  label="Battery Critical"
                  value={
                    settings.battery_critical_threshold
                  }
                  unit="%"
                  description="Battery critical threshold."
                  onChange={(value) =>
                    handleNumberChange(
                      "battery_critical_threshold",
                      value
                    )
                  }
                />

              </div>

              <ToggleRow
                title="Hardware & Gateway Health Monitoring"
                description="Monitor device power, battery level, gateway connectivity and heartbeat status."
                value={
                  settings.device_health_monitoring
                }
                onChange={() =>
                  handleToggle(
                    "device_health_monitoring"
                  )
                }
              />

              <ToggleRow
                title="Data Quality & Anomaly Validation"
                description="Validate incoming readings and identify suspect or out-of-range sensor values."
                value={
                  settings.data_validation
                }
                onChange={() =>
                  handleToggle(
                    "data_validation"
                  )
                }
              />

              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100">

                <div className="flex gap-3">

                  <ShieldCheck
                    size={19}
                    className="text-blue-600 shrink-0"
                  />

                  <div>

                    <p className="text-xs font-black text-blue-900">
                      Sensor Management
                    </p>

                    <p className="text-[11px] text-blue-700 mt-1">
                      Individual sensor installation, calibration and maintenance details are managed from the Device Health and Maintenance modules.
                    </p>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* DATA SYNC */}
          {/* ================================================= */}

          {activeTab === "sync" && (
            <div className="space-y-6">

              <SectionHeader
                icon={
                  <Database size={20} />
                }
                title="Data Synchronization"
                description="Configure external data ingestion and freshness rules."
                iconClass="bg-indigo-50 text-indigo-600"
              />

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">

                    <Activity
                      size={18}
                      className="text-emerald-600"
                    />

                  </div>

                  <div>

                    <p className="text-xs font-black text-slate-900">
                      OpenAQ Data Source
                    </p>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      External air quality data synchronization
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-emerald-500" />

                  <span className="text-[10px] font-black text-emerald-600">
                    Configured
                  </span>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <NumberInput
                  label="OpenAQ Sync Interval"
                  value={
                    settings.openaq_sync_interval_minutes
                  }
                  unit="min"
                  description="How frequently the backend synchronizes OpenAQ station data."
                  onChange={(value) =>
                    handleNumberChange(
                      "openaq_sync_interval_minutes",
                      value
                    )
                  }
                />

                <NumberInput
                  label="Data Freshness Limit"
                  value={
                    settings.data_freshness_minutes
                  }
                  unit="min"
                  description="Measurements older than this are treated as stale."
                  onChange={(value) =>
                    handleNumberChange(
                      "data_freshness_minutes",
                      value
                    )
                  }
                />

              </div>

              <ToggleRow
                title="Live Monitoring"
                description="Enable continuous ingestion and monitoring of incoming station data."
                value={
                  settings.live_monitoring
                }
                onChange={() =>
                  handleToggle(
                    "live_monitoring"
                  )
                }
              />

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">

                <div className="flex gap-3">

                  <RefreshCw
                    size={18}
                    className="text-amber-600 shrink-0"
                  />

                  <div>

                    <p className="text-xs font-black text-amber-900">
                      Synchronization Configuration
                    </p>

                    <p className="text-[11px] text-amber-700 mt-1">
                      OpenAQ synchronization is performed automatically by the backend scheduler. The configured interval controls how frequently the system retrieves external measurements.
                    </p>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* NOTIFICATIONS */}
          {/* ================================================= */}

          {activeTab === "notifications" && (
            <div className="space-y-6">

              <SectionHeader
                icon={
                  <Bell size={20} />
                }
                title="Notification & Alert Routing"
                description="Choose which system events should generate notifications and alerts."
                iconClass="bg-amber-50 text-amber-600"
              />

              {/* Browser notifications */}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-blue-50 border border-blue-200">

                <div className="flex items-center gap-3.5">

                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bell size={20} />
                  </div>

                  <div>

                    <h4 className="text-xs font-bold text-slate-900">
                      Browser Desktop Notifications
                    </h4>

                    <p className="text-[11px] text-slate-600 mt-0.5">

                      {desktopNotifPermission ===
                      "granted"
                        ? "Desktop notifications are currently active and allowed."
                        : desktopNotifPermission ===
                          "denied"
                        ? "Notifications are blocked by your browser. Allow them from browser site settings."
                        : "Enable desktop notifications for new air-quality alerts."}

                    </p>

                  </div>

                </div>

                {desktopNotifPermission !==
                  "granted" && (
                  <button
                    type="button"
                    onClick={
                      handleRequestDesktopPermission
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Turn On
                  </button>
                )}

                {desktopNotifPermission ===
                  "granted" && (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-lg">
                    Enabled
                  </span>
                )}

              </div>

              {/* Notification controls */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <ToggleRow
                  title="High AQI Alerts"
                  description="Generate alerts when AQI crosses configured thresholds."
                  value={
                    settings.notify_high_aqi
                  }
                  onChange={() =>
                    handleToggle(
                      "notify_high_aqi"
                    )
                  }
                />

                <ToggleRow
                  title="Pollutant Threshold Alerts"
                  description="Generate alerts for PM2.5, PM10, NO2, SO2, CO and O3."
                  value={
                    settings.notify_pollutant_threshold
                  }
                  onChange={() =>
                    handleToggle(
                      "notify_pollutant_threshold"
                    )
                  }
                />

                <ToggleRow
                  title="Station Offline Alerts"
                  description="Alert when a station exceeds the configured offline timeout."
                  value={
                    settings.notify_station_offline
                  }
                  onChange={() =>
                    handleToggle(
                      "notify_station_offline"
                    )
                  }
                />

                <ToggleRow
                  title="Sensor Fault Alerts"
                  description="Alert when a sensor reports a fault."
                  value={
                    settings.notify_sensor_fault
                  }
                  onChange={() =>
                    handleToggle(
                      "notify_sensor_fault"
                    )
                  }
                />

                <ToggleRow
                  title="Low Battery Alerts"
                  description="Alert when device battery crosses configured levels."
                  value={
                    settings.notify_low_battery
                  }
                  onChange={() =>
                    handleToggle(
                      "notify_low_battery"
                    )
                  }
                />

                <ToggleRow
                  title="Network Failure Alerts"
                  description="Alert when device network connectivity fails."
                  value={
                    settings.notify_network_failure
                  }
                  onChange={() =>
                    handleToggle(
                      "notify_network_failure"
                    )
                  }
                />

                <ToggleRow
                  title="Calibration Due Alerts"
                  description="Alert when sensor calibration becomes due."
                  value={
                    settings.notify_calibration_due
                  }
                  onChange={() =>
                    handleToggle(
                      "notify_calibration_due"
                    )
                  }
                />

                <ToggleRow
                  title="Maintenance Due Alerts"
                  description="Alert when maintenance becomes due."
                  value={
                    settings.notify_maintenance_due
                  }
                  onChange={() =>
                    handleToggle(
                      "notify_maintenance_due"
                    )
                  }
                />

              </div>

            </div>
          )}

        </div>
      </div>

      {/* ================================================== */}
      {/* BOTTOM BUTTONS */}
      {/* ================================================== */}

      <div className="flex items-center justify-end gap-3 mt-6 pb-4">

        <button
          type="button"
          onClick={loadSettings}
          disabled={saving || resetting}
          className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-white rounded-xl transition disabled:opacity-50"
        >
          Reload
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition disabled:opacity-60"
        >

          {saving ? (
            <Loader2
              size={14}
              className="animate-spin"
            />
          ) : (
            <Save size={14} />
          )}

          {saving
            ? "Saving..."
            : "Save Changes"}

        </button>

      </div>

    </div>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  icon,
  title,
  description,
  iconClass,
}) {
  return (
    <div className="flex items-start gap-3.5 pb-5 border-b border-slate-100">

      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconClass}`}
      >
        {icon}
      </div>

      <div>

        <h2 className="text-base font-black text-slate-900">
          {title}
        </h2>

        <p className="text-[11px] text-slate-400 mt-1">
          {description}
        </p>

      </div>

    </div>
  );
}

// ============================================================
// TEXT INPUT
// ============================================================

function TextInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
        {label}
      </label>

      <input
        type="text"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
      />

    </div>
  );
}

// ============================================================
// SELECT INPUT
// ============================================================

function SelectInput({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <div>

      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
        {label}
      </label>

      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

    </div>
  );
}

// ============================================================
// NUMBER INPUT
// ============================================================

function NumberInput({
  label,
  value,
  unit,
  description,
  onChange,
}) {
  return (
    <div>

      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
        {label}
      </label>

      <div className="relative">

        <input
          type="number"
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="w-full px-4 py-2.5 pr-16 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
        />

        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
            {unit}
          </span>
        )}

      </div>

      {description && (
        <span className="text-[10px] text-slate-400 block mt-1.5 pl-1">
          {description}
        </span>
      )}

    </div>
  );
}

// ============================================================
// POLLUTANT ROW
// ============================================================

function PollutantRow({
  name,
  warningValue,
  criticalValue,
  unit,
  onWarningChange,
  onCriticalChange,
}) {
  return (
    <tr className="border-t border-slate-100">

      <td className="px-5 py-4">

        <span className="text-xs font-black text-slate-800">
          {name}
        </span>

      </td>

      <td className="px-5 py-3">

        <input
          type="number"
          value={warningValue ?? ""}
          onChange={(e) =>
            onWarningChange(
              e.target.value
            )
          }
          className="w-full max-w-[150px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold outline-none focus:bg-white focus:border-blue-500"
        />

      </td>

      <td className="px-5 py-3">

        <input
          type="number"
          value={criticalValue ?? ""}
          onChange={(e) =>
            onCriticalChange(
              e.target.value
            )
          }
          className="w-full max-w-[150px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold outline-none focus:bg-white focus:border-blue-500"
        />

      </td>

      <td className="px-5 py-3">

        <span className="text-[10px] font-bold text-slate-400">
          {unit}
        </span>

      </td>

    </tr>
  );
}

// ============================================================
// TOGGLE ROW
// ============================================================

function ToggleRow({
  title,
  description,
  value,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">

      <div>

        <p className="text-xs font-bold text-slate-900">
          {title}
        </p>

        {description && (
          <p className="text-[11px] text-slate-400 mt-0.5">
            {description}
          </p>
        )}

      </div>

      <button
        type="button"
        onClick={onChange}
        aria-label={title}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-200 ${
          value
            ? "bg-blue-600 justify-end"
            : "bg-slate-300 justify-start"
        }`}
      >
        <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
      </button>

    </div>
  );
}