import React, { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  Database,
  Save,
  CheckCircle2,
  RotateCcw,
  Settings as SettingsIcon,
  SlidersHorizontal,
  RadioTower,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const DEFAULT_SETTINGS = {
  system_name: "PMC Air Quality Monitoring System",
  organization: "Pune Municipal Corporation",
  aqi_standard: "CPCB National AQI",
  timezone: "Asia/Kolkata",
  dashboard_refresh_seconds: 10,

  aqi_warning_threshold: 101,
  aqi_critical_threshold: 201,

  pm25_warning_threshold: 60,
  pm25_critical_threshold: 90,

  pm10_warning_threshold: 100,
  pm10_critical_threshold: 250,

  no2_warning_threshold: 80,
  no2_critical_threshold: 180,

  so2_warning_threshold: 80,
  so2_critical_threshold: 380,

  o3_warning_threshold: 100,
  o3_critical_threshold: 168,

  device_offline_timeout_minutes: 15,

  openaq_sync_interval_minutes: 10,
  data_freshness_minutes: 60,

  live_monitoring: true,
  data_validation: true,
  device_health_monitoring: true,

  notify_high_aqi: true,
  notify_pollutant_threshold: true,
  notify_station_offline: true,
  notify_sensor_fault: true,
  notify_low_battery: true,
  notify_network_failure: true,
  notify_calibration_due: true,
  notify_maintenance_due: true,
};

export default function Settings() {
  // =====================================================
  // STATE
  // =====================================================

  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [activeTab, setActiveTab] =
    useState("general");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [resetting, setResetting] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/settings`
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load settings"
        );
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...data.settings,
      });
    } catch (err) {
      console.error(
        "Failed to load settings:",
        err
      );

      setError(
        err.message ||
          "Unable to load system settings"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (
    field,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleNumberChange = (
    field,
    value
  ) => {
    const numberValue =
      value === ""
        ? ""
        : Number(value);

    setSettings((prev) => ({
      ...prev,
      [field]: numberValue,
    }));

    setSaved(false);
  };

  const handleToggle = (
    field
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

    setSaved(false);
  };

  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSaved(false);

      // -----------------------------------------------
      // Frontend validation
      // -----------------------------------------------

      if (
        Number(
          settings.aqi_warning_threshold
        ) >=
        Number(
          settings.aqi_critical_threshold
        )
      ) {
        setError(
          "AQI warning threshold must be lower than critical threshold."
        );

        setSaving(false);
        return;
      }

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

      const response = await fetch(
        `${API_BASE_URL}/settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            settings
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to save settings"
        );
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...data.settings,
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to save settings:",
        err
      );

      setError(
        err.message ||
          "Unable to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // RESET SETTINGS
  // =====================================================

  const handleResetDefaults =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to reset all system settings to their default values?"
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
          ...data.settings,
        });

        setSaved(true);

        setTimeout(() => {
          setSaved(false);
        }, 3000);
      } catch (err) {
        console.error(
          "Failed to reset settings:",
          err
        );

        setError(
          err.message ||
            "Unable to reset settings"
        );
      } finally {
        setResetting(false);
      }
    };

  // =====================================================
  // TAB CONFIGURATION
  // =====================================================

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

  // =====================================================
  // TOGGLE COMPONENT
  // =====================================================

  const Toggle = ({
    value,
    onChange,
  }) => {
    return (
      <button
        type="button"
        onClick={onChange}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-200 ${
          value
            ? "bg-blue-600 justify-end"
            : "bg-slate-300 justify-start"
        }`}
      >
        <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
      </button>
    );
  };

  // =====================================================
  // INPUT COMPONENT
  // =====================================================

  const NumberInput = ({
    label,
    field,
    unit,
    description,
  }) => {
    return (
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
          {label}
        </label>

        <div className="relative">
          <input
            type="number"
            value={
              settings[field] ?? ""
            }
            onChange={(e) =>
              handleNumberChange(
                field,
                e.target.value
              )
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
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#edf3f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={28}
            className="animate-spin text-blue-600"
          />

          <p className="text-xs font-bold text-slate-500">
            Loading system settings...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#edf3f8] text-slate-800 p-6 sm:p-8 lg:p-10 font-sans">
      {/* =================================================
          HEADER
      ================================================= */}

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
              <SettingsIcon
                size={20}
              />
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
            onClick={
              handleResetDefaults
            }
            disabled={resetting}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {resetting ? (
              <Loader2
                size={13}
                className="animate-spin"
              />
            ) : (
              <RotateCcw
                size={13}
              />
            )}

            <span>
              Reset Defaults
            </span>
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

            <span>
              {saving
                ? "Saving..."
                : "Save Changes"}
            </span>
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs font-bold">
          <AlertTriangle
            size={17}
            className="text-rose-600 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

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

      {/* =================================================
          MAIN SETTINGS CONTAINER
      ================================================= */}

      <div className="bg-white rounded-[26px] border border-slate-100 shadow-sm overflow-hidden">
        {/* =================================================
            TABS
        ================================================= */}

        <div className="border-b border-slate-100 px-5 pt-5">
          <div className="flex gap-1 overflow-x-auto pb-0">
            {tabs.map((tab) => {
              const Icon =
                tab.icon;

              const active =
                activeTab ===
                tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap rounded-t-xl border-b-2 transition ${
                    active
                      ? "text-blue-600 border-blue-600 bg-blue-50/50"
                      : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    size={15}
                  />

                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-6 sm:p-7">
          {/* =================================================
              GENERAL
          ================================================= */}

          {activeTab ===
            "general" && (
            <div className="space-y-6">
              <SectionHeader
                icon={
                  <SettingsIcon
                    size={20}
                  />
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
                    handleChange(
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
                    handleChange(
                      "organization",
                      value
                    )
                  }
                />

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                    AQI Standard
                  </label>

                  <select
                    value={
                      settings.aqi_standard
                    }
                    onChange={(e) =>
                      handleChange(
                        "aqi_standard",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option>
                      CPCB National AQI
                    </option>

                    <option>
                      US EPA AQI
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                    Time Zone
                  </label>

                  <select
                    value={
                      settings.timezone
                    }
                    onChange={(e) =>
                      handleChange(
                        "timezone",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="Asia/Kolkata">
                      Asia/Kolkata (IST)
                    </option>
                  </select>
                </div>

                <NumberInput
                  label="Dashboard Refresh"
                  field="dashboard_refresh_seconds"
                  unit="sec"
                  description="Controls how often dashboard data is refreshed."
                />
              </div>
            </div>
          )}

          {/* =================================================
              AQI & ALERTS
          ================================================= */}

          {activeTab ===
            "aqi" && (
            <div className="space-y-7">
              <SectionHeader
                icon={
                  <AlertTriangle
                    size={20}
                  />
                }
                title="AQI & Alert Thresholds"
                description="Configure warning and critical levels used by the monitoring and alert system."
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
                    field="aqi_warning_threshold"
                    description="Alert when AQI reaches the warning level."
                  />

                  <NumberInput
                    label="Critical AQI"
                    field="aqi_critical_threshold"
                    description="Critical alert threshold."
                  />
                </div>
              </div>

              {/* POLLUTANTS */}

              <div>
                <h3 className="text-xs font-black text-slate-900 mb-4">
                  Pollutant Thresholds
                </h3>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full min-w-[650px]">
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
                        warningField="pm25_warning_threshold"
                        criticalField="pm25_critical_threshold"
                        unit="µg/m³"
                      />

                      <PollutantRow
                        name="PM10"
                        warningField="pm10_warning_threshold"
                        criticalField="pm10_critical_threshold"
                        unit="µg/m³"
                      />

                      <PollutantRow
                        name="NO₂"
                        warningField="no2_warning_threshold"
                        criticalField="no2_critical_threshold"
                        unit="µg/m³"
                      />

                      <PollutantRow
                        name="SO₂"
                        warningField="so2_warning_threshold"
                        criticalField="so2_critical_threshold"
                        unit="µg/m³"
                      />

                      <PollutantRow
                        name="O₃"
                        warningField="o3_warning_threshold"
                        criticalField="o3_critical_threshold"
                        unit="µg/m³"
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              DEVICES & SENSORS
          ================================================= */}

          {activeTab ===
            "devices" && (
            <div className="space-y-6">
              <SectionHeader
                icon={
                  <RadioTower
                    size={20}
                  />
                }
                title="Devices & Sensors"
                description="Configure hardware health monitoring and device timeout behavior."
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <NumberInput
                label="Device Offline Timeout"
                field="device_offline_timeout_minutes"
                unit="min"
                description="A device is considered offline when no heartbeat is received within this period."
              />

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

          {/* =================================================
              DATA SYNCHRONIZATION
          ================================================= */}

          {activeTab ===
            "sync" && (
            <div className="space-y-6">
              <SectionHeader
                icon={
                  <Database
                    size={20}
                  />
                }
                title="Data Synchronization"
                description="Configure external data ingestion and freshness rules."
                iconClass="bg-indigo-50 text-indigo-600"
              />

              {/* OpenAQ STATUS */}

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
                  field="openaq_sync_interval_minutes"
                  unit="min"
                  description="How frequently the backend synchronizes OpenAQ station data."
                />

                <NumberInput
                  label="Data Freshness Limit"
                  field="data_freshness_minutes"
                  unit="min"
                  description="Measurements older than this are treated as stale."
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
                      OpenAQ synchronization is performed automatically by the backend scheduler. The configured interval controls how frequently the system should retrieve external measurements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {activeTab ===
            "notifications" && (
            <div className="space-y-6">
              <SectionHeader
                icon={
                  <Bell size={20} />
                }
                title="Notification & Alert Routing"
                description="Choose which system events should generate notifications and alerts."
                iconClass="bg-amber-50 text-amber-600"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NotificationToggle
                  title="High AQI Alerts"
                  field="notify_high_aqi"
                />

                <NotificationToggle
                  title="Pollutant Threshold Alerts"
                  field="notify_pollutant_threshold"
                />

                <NotificationToggle
                  title="Station Offline Alerts"
                  field="notify_station_offline"
                />

                <NotificationToggle
                  title="Sensor Fault Alerts"
                  field="notify_sensor_fault"
                />

                <NotificationToggle
                  title="Low Battery Alerts"
                  field="notify_low_battery"
                />

                <NotificationToggle
                  title="Network Failure Alerts"
                  field="notify_network_failure"
                />

                <NotificationToggle
                  title="Calibration Due Alerts"
                  field="notify_calibration_due"
                />

                <NotificationToggle
                  title="Maintenance Due Alerts"
                  field="notify_maintenance_due"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          BOTTOM ACTION BAR
      ================================================= */}

      <div className="flex items-center justify-end gap-3 mt-6 pb-4">
        <button
          type="button"
          onClick={loadSettings}
          disabled={loading}
          className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-white rounded-xl transition"
        >
          Cancel Changes
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

          <span>
            {saving
              ? "Saving..."
              : "Save Changes"}
          </span>
        </button>
      </div>
    </div>
  );

  // =====================================================
  // LOCAL COMPONENTS
  // =====================================================

  function NotificationToggle({
    title,
    field,
  }) {
    return (
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
            <Bell
              size={14}
              className="text-amber-600"
            />
          </div>

          <span className="text-xs font-bold text-slate-700">
            {title}
          </span>
        </div>

        <Toggle
          value={
            settings[field]
          }
          onChange={() =>
            handleToggle(field)
          }
        />
      </div>
    );
  }

  function PollutantRow({
    name,
    warningField,
    criticalField,
    unit,
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
            value={
              settings[
                warningField
              ] ?? ""
            }
            onChange={(e) =>
              handleNumberChange(
                warningField,
                e.target.value
              )
            }
            className="w-full max-w-[150px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold outline-none focus:bg-white focus:border-blue-500"
          />
        </td>

        <td className="px-5 py-3">
          <input
            type="number"
            value={
              settings[
                criticalField
              ] ?? ""
            }
            onChange={(e) =>
              handleNumberChange(
                criticalField,
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
}

// =====================================================
// SECTION HEADER
// =====================================================

function SectionHeader({
  icon,
  title,
  description,
  iconClass,
}) {
  return (
    <div className="flex items-start gap-3.5 pb-5 border-b border-slate-100">
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${iconClass}`}
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

// =====================================================
// TEXT INPUT
// =====================================================

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
        value={value || ""}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
      />
    </div>
  );
}

// =====================================================
// TOGGLE ROW
// =====================================================

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

        <p className="text-[11px] text-slate-400 mt-0.5">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
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