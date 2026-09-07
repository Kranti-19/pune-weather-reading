import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api/alerts";

const AdminAlertConfiguration = () => {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/configurations`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load alert configurations."
        );
      }

      setConfigurations(result.configurations || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const handleChange = (id, field, value) => {
    setConfigurations((previous) =>
      previous.map((config) =>
        config.config_id === id
          ? { ...config, [field]: value }
          : config
      )
    );

    setSuccess("");
    setError("");
  };

  const handleSave = async (config) => {
    try {
      setSavingId(config.config_id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/configurations/${config.config_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            warning_threshold:
              config.warning_threshold === ""
                ? null
                : config.warning_threshold,

            critical_threshold:
              config.critical_threshold === ""
                ? null
                : config.critical_threshold,

            no_data_minutes:
              config.no_data_minutes === ""
                ? null
                : config.no_data_minutes,

            due_days:
              config.due_days === ""
                ? null
                : config.due_days,

            enabled: Boolean(config.enabled),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update configuration."
        );
      }

      setConfigurations((previous) =>
        previous.map((item) =>
          item.config_id === config.config_id
            ? result.configuration
            : item
        )
      );

      setSuccess(
        `${getDisplayName(config)} configuration updated successfully.`
      );

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update configuration.");
    } finally {
      setSavingId(null);
    }
  };

  const getDisplayName = (config) => {
    if (config.alert_type === "POLLUTANT") {
      return config.parameter || "Pollutant";
    }

    const names = {
      AQI: "AQI",
      STATION_OFFLINE: "Station Offline",
      SENSOR_FAULT: "Sensor Fault",
      BATTERY: "Battery",
      NETWORK: "Network",
      CALIBRATION: "Calibration",
      MAINTENANCE: "Maintenance",
    };

    return names[config.alert_type] || config.alert_type;
  };

  const getDescription = (config) => {
    const descriptions = {
      AQI: "Triggers alerts when AQI crosses configured levels.",
      STATION_OFFLINE: "Triggers when a station stops sending data.",
      SENSOR_FAULT:
        "Detects invalid, failed or abnormal sensor readings.",
      BATTERY: "Monitors device battery level.",
      NETWORK: "Detects communication or network failures.",
      CALIBRATION: "Alerts when sensor calibration is due.",
      MAINTENANCE: "Alerts when station maintenance is due.",
    };

    if (config.alert_type === "POLLUTANT") {
      return `Monitors ${
        config.parameter || "pollutant"
      } concentration.`;
    }

    return descriptions[config.alert_type] || "Alert monitoring rule.";
  };

  const showThresholds = (config) =>
    ["AQI", "POLLUTANT", "BATTERY"].includes(config.alert_type);

  const showNoData = (config) =>
    config.alert_type === "STATION_OFFLINE";

  const showDueDays = (config) =>
    ["CALIBRATION", "MAINTENANCE"].includes(config.alert_type);

  const getUnit = (config) => {
    if (config.alert_type === "BATTERY") return "%";

    if (config.alert_type === "AQI") return "AQI";

    return "µg/m³";
  };

  const getIcon = (config) => {
    const icons = {
      AQI: "AQ",
      POLLUTANT: "P",
      STATION_OFFLINE: "S",
      SENSOR_FAULT: "SF",
      BATTERY: "B",
      NETWORK: "N",
      CALIBRATION: "C",
      MAINTENANCE: "M",
    };

    return icons[config.alert_type] || "!";
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <div className="alert-config-page">
          <div className="alert-config-loading">
            <div className="loading-spinner"></div>
            <p>Loading alert configurations...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="alert-config-page">

        {/* PAGE HEADER */}
        <div className="alert-config-header">
          <div>
            <div className="header-breadcrumb">
              Admin <span>/</span> Alert Configuration
            </div>

            <h1>Alert Configuration</h1>

            <p>
              Configure thresholds and monitoring rules for AQMS alerts.
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchConfigurations}
          >
            <span className="refresh-icon">↻</span>
            Refresh
          </button>
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="alert-message success-message">
            <span className="message-icon">✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="alert-message error-message">
            <span className="message-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* INFO BOX */}
        <div className="configuration-info">
          <div className="info-icon">i</div>

          <div>
            <strong>How alert configuration works</strong>

            <p>
              Warning alerts are generated when the warning threshold
              is crossed. Critical alerts are generated when the
              critical threshold is crossed. Disabled rules will not
              generate alerts.
            </p>
          </div>
        </div>

        {/* CONFIGURATION LIST */}
        <div className="configuration-list">

          {configurations.map((config) => (
            <div
              className={`configuration-card ${
                !config.enabled ? "disabled-card" : ""
              }`}
              key={config.config_id}
            >

              {/* CARD HEADER */}
              <div className="configuration-card-header">

                <div className="configuration-title-section">

                  <div
                    className={`configuration-icon ${config.alert_type.toLowerCase()}`}
                  >
                    {getIcon(config)}
                  </div>

                  <div>
                    <h2>{getDisplayName(config)}</h2>

                    <p>{getDescription(config)}</p>
                  </div>

                </div>

                {/* TOGGLE */}
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={Boolean(config.enabled)}
                    onChange={(e) =>
                      handleChange(
                        config.config_id,
                        "enabled",
                        e.target.checked
                      )
                    }
                  />

                  <span className="slider"></span>
                </label>

              </div>

              {/* SETTINGS */}
              <div className="configuration-settings">

                {/* NUMERIC THRESHOLDS */}
                {showThresholds(config) && (
                  <>
                    <div className="setting-field">

                      <label>
                        Warning Threshold
                        <span className="required-star">*</span>
                      </label>

                      <div className="input-with-unit">

                        <input
                          type="number"
                          step="0.01"
                          value={config.warning_threshold ?? ""}
                          onChange={(e) =>
                            handleChange(
                              config.config_id,
                              "warning_threshold",
                              e.target.value
                            )
                          }
                        />

                        <span className="unit">
                          {getUnit(config)}
                        </span>

                      </div>

                      <small>
                        Warning level
                      </small>

                    </div>

                    <div className="setting-field">

                      <label>
                        Critical Threshold
                        <span className="required-star">*</span>
                      </label>

                      <div className="input-with-unit">

                        <input
                          type="number"
                          step="0.01"
                          value={config.critical_threshold ?? ""}
                          onChange={(e) =>
                            handleChange(
                              config.config_id,
                              "critical_threshold",
                              e.target.value
                            )
                          }
                        />

                        <span className="unit">
                          {getUnit(config)}
                        </span>

                      </div>

                      <small>
                        Critical level
                      </small>

                    </div>
                  </>
                )}

                {/* STATION OFFLINE */}
                {showNoData(config) && (
                  <div className="setting-field">

                    <label>
                      No Data Timeout
                      <span className="required-star">*</span>
                    </label>

                    <div className="input-with-unit">

                      <input
                        type="number"
                        min="1"
                        value={config.no_data_minutes ?? ""}
                        onChange={(e) =>
                          handleChange(
                            config.config_id,
                            "no_data_minutes",
                            e.target.value
                          )
                        }
                      />

                      <span className="unit">
                        minutes
                      </span>

                    </div>

                    <small>
                      Alert when no reading is received for
                      this duration.
                    </small>

                  </div>
                )}

                {/* CALIBRATION / MAINTENANCE */}
                {showDueDays(config) && (
                  <div className="setting-field">

                    <label>
                      Due Within
                      <span className="required-star">*</span>
                    </label>

                    <div className="input-with-unit">

                      <input
                        type="number"
                        min="0"
                        value={config.due_days ?? ""}
                        onChange={(e) =>
                          handleChange(
                            config.config_id,
                            "due_days",
                            e.target.value
                          )
                        }
                      />

                      <span className="unit">
                        days
                      </span>

                    </div>

                    <small>
                      Generate an alert when due within this
                      period.
                    </small>

                  </div>
                )}

                {/* EVENT BASED */}
                {(config.alert_type === "SENSOR_FAULT" ||
                  config.alert_type === "NETWORK") && (
                  <div className="event-rule">

                    <div className="event-check">
                      ✓
                    </div>

                    <div>
                      <strong>
                        Event Based Monitoring
                      </strong>

                      <p>
                        This alert is generated automatically
                        when the corresponding fault condition
                        is detected.
                      </p>
                    </div>

                  </div>
                )}

              </div>

              {/* CARD FOOTER */}
              <div className="configuration-card-footer">

                <div className="configuration-status">

                  <span
                    className={`status-dot ${
                      config.enabled
                        ? "active"
                        : "inactive"
                    }`}
                  ></span>

                  {config.enabled
                    ? "Monitoring enabled"
                    : "Monitoring disabled"}

                </div>

                <button
                  className="save-btn"
                  onClick={() => handleSave(config)}
                  disabled={
                    savingId === config.config_id
                  }
                >
                  {savingId === config.config_id ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Save Changes
                    </>
                  )}
                </button>

              </div>

            </div>
          ))}

        </div>

        {/* EMPTY STATE */}
        {configurations.length === 0 && (
          <div className="empty-state">

            <div className="empty-icon">
              ⚙
            </div>

            <h2>No Alert Configurations</h2>

            <p>
              No alert configuration rules are available.
            </p>

            <button
              className="refresh-btn"
              onClick={fetchConfigurations}
            >
              Refresh
            </button>

          </div>
        )}

      </div>
    </>
  );
};


/* =========================================================
   CSS
========================================================= */

const styles = `
  * {
    box-sizing: border-box;
  }

  .alert-config-page {
    width: 100%;
    min-height: 100vh;
    padding: 30px 36px 50px;
    background: #f6f8fb;
    color: #172033;
    font-family:
      Inter,
      "Plus Jakarta Sans",
      Arial,
      sans-serif;
  }

  /* HEADER */

  .alert-config-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 25px;
  }

  .header-breadcrumb {
    font-size: 13px;
    color: #7a8497;
    margin-bottom: 8px;
  }

  .header-breadcrumb span {
    margin: 0 7px;
    color: #b0b7c4;
  }

  .alert-config-header h1 {
    margin: 0;
    font-size: 28px;
    line-height: 1.25;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .alert-config-header p {
    margin: 8px 0 0;
    color: #7a8497;
    font-size: 14px;
  }

  /* REFRESH */

  .refresh-btn {
    border: 1px solid #dce2ea;
    background: #ffffff;
    color: #273348;
    padding: 10px 17px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .refresh-btn:hover {
    background: #f1f4f8;
    border-color: #cbd3df;
  }

  .refresh-icon {
    font-size: 17px;
  }

  /* MESSAGES */

  .alert-message {
    width: 100%;
    padding: 13px 16px;
    border-radius: 9px;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 600;
  }

  .success-message {
    background: #ecfdf3;
    color: #087443;
    border: 1px solid #b7ebcd;
  }

  .error-message {
    background: #fff1f1;
    color: #b42318;
    border: 1px solid #ffd0d0;
  }

  .message-icon {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: currentColor;
    color: white;
    font-size: 12px;
    font-weight: 700;
  }

  /* INFO */

  .configuration-info {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    background: #ffffff;
    border: 1px solid #e1e6ed;
    border-radius: 12px;
    padding: 17px 19px;
    margin-bottom: 23px;
  }

  .info-icon {
    width: 25px;
    height: 25px;
    min-width: 25px;
    border-radius: 50%;
    background: #eef3ff;
    color: #3157b7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
  }

  .configuration-info strong {
    display: block;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .configuration-info p {
    margin: 0;
    color: #727d90;
    font-size: 13px;
    line-height: 1.55;
  }

  /* LIST */

  .configuration-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  /* CARD */

  .configuration-card {
    background: #ffffff;
    border: 1px solid #e1e6ed;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(20, 35, 60, 0.035);
    transition:
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  .configuration-card:hover {
    border-color: #d3dae5;
    box-shadow: 0 6px 18px rgba(20, 35, 60, 0.06);
  }

  .disabled-card {
    opacity: 0.72;
  }

  /* CARD HEADER */

  .configuration-card-header {
    min-height: 88px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    border-bottom: 1px solid #edf0f4;
  }

  .configuration-title-section {
    display: flex;
    align-items: center;
    gap: 13px;
    min-width: 0;
  }

  .configuration-icon {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: -0.2px;
  }

  .configuration-icon.aqi {
    background: #fff1e8;
    color: #c45c13;
  }

  .configuration-icon.pollutant {
    background: #edf4ff;
    color: #3564b8;
  }

  .configuration-icon.station_offline {
    background: #fff0f0;
    color: #c53030;
  }

  .configuration-icon.sensor_fault {
    background: #f5efff;
    color: #7041a8;
  }

  .configuration-icon.battery {
    background: #eef9f1;
    color: #26804a;
  }

  .configuration-icon.network {
    background: #fff8e8;
    color: #9a6810;
  }

  .configuration-icon.calibration {
    background: #eef6ff;
    color: #2867a5;
  }

  .configuration-icon.maintenance {
    background: #f2f3f5;
    color: #586274;
  }

  .configuration-title-section h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1c2638;
  }

  .configuration-title-section p {
    margin: 4px 0 0;
    color: #7b8494;
    font-size: 12px;
    line-height: 1.45;
  }

  /* TOGGLE */

  .switch {
    position: relative;
    display: inline-block;
    width: 43px;
    height: 24px;
    min-width: 43px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: #cfd5de;
    border-radius: 20px;
    transition: 0.2s ease;
  }

  .slider::before {
    content: "";
    position: absolute;
    width: 18px;
    height: 18px;
    left: 3px;
    top: 3px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: 0.2s ease;
  }

  .switch input:checked + .slider {
    background: #2d6cdf;
  }

  .switch input:checked + .slider::before {
    transform: translateX(19px);
  }

  /* SETTINGS */

  .configuration-settings {
    min-height: 125px;
    padding: 20px;
    display: flex;
    gap: 18px;
    align-items: flex-start;
  }

  .setting-field {
    flex: 1;
    min-width: 0;
  }

  .setting-field label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #465166;
    margin-bottom: 7px;
  }

  .required-star {
    color: #d43d3d;
    margin-left: 3px;
  }

  .input-with-unit {
    height: 42px;
    display: flex;
    align-items: center;
    border: 1px solid #d8dee7;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
    transition: border-color 0.2s ease;
  }

  .input-with-unit:focus-within {
    border-color: #5c84d6;
    box-shadow: 0 0 0 3px rgba(61, 105, 190, 0.08);
  }

  .input-with-unit input {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    padding: 0 11px;
    font-size: 13px;
    color: #263247;
    background: transparent;
  }

  .input-with-unit input::-webkit-inner-spin-button,
  .input-with-unit input::-webkit-outer-spin-button {
    opacity: 1;
  }

  .unit {
    height: 100%;
    padding: 0 10px;
    display: flex;
    align-items: center;
    border-left: 1px solid #e1e5eb;
    background: #f8f9fb;
    color: #778194;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }

  .setting-field small {
    display: block;
    margin-top: 6px;
    color: #8a93a2;
    font-size: 10px;
    line-height: 1.4;
  }

  /* EVENT RULE */

  .event-rule {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border-radius: 9px;
    background: #f7f9fc;
    border: 1px solid #e7ebf1;
  }

  .event-check {
    width: 30px;
    height: 30px;
    min-width: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e9f8ef;
    color: #21864b;
    font-size: 13px;
    font-weight: 800;
  }

  .event-rule strong {
    display: block;
    font-size: 12px;
    color: #344054;
    margin-bottom: 3px;
  }

  .event-rule p {
    margin: 0;
    color: #7c8594;
    font-size: 11px;
    line-height: 1.45;
  }

  /* FOOTER */

  .configuration-card-footer {
    min-height: 57px;
    padding: 11px 20px;
    border-top: 1px solid #edf0f4;
    background: #fbfcfd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .configuration-status {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    color: #747e8f;
    font-weight: 600;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .status-dot.active {
    background: #27a65a;
  }

  .status-dot.inactive {
    background: #9da5b1;
  }

  /* SAVE BUTTON */

  .save-btn {
    border: none;
    background: #2f65c8;
    color: #ffffff;
    padding: 9px 14px;
    border-radius: 7px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
  }

  .save-btn:hover {
    background: #2758ae;
  }

  .save-btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  /* SPINNERS */

  .loading-spinner,
  .button-spinner {
    border: 2px solid rgba(0, 0, 0, 0.12);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .loading-spinner {
    width: 30px;
    height: 30px;
    color: #2f65c8;
  }

  .button-spinner {
    width: 13px;
    height: 13px;
    border-color: rgba(255, 255, 255, 0.35);
    border-top-color: #ffffff;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* LOADING */

  .alert-config-loading {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #7a8497;
    font-size: 13px;
    gap: 13px;
  }

  /* EMPTY */

  .empty-state {
    background: #ffffff;
    border: 1px solid #e1e6ed;
    border-radius: 14px;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .empty-icon {
    width: 55px;
    height: 55px;
    border-radius: 50%;
    background: #f0f3f7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 23px;
    margin-bottom: 13px;
  }

  .empty-state h2 {
    margin: 0;
    font-size: 17px;
  }

  .empty-state p {
    color: #7c8595;
    font-size: 13px;
    margin: 7px 0 18px;
  }

  /* RESPONSIVE */

  @media (max-width: 1100px) {
    .configuration-list {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {

    .alert-config-page {
      padding: 20px 15px 35px;
    }

    .alert-config-header {
      flex-direction: column;
    }

    .configuration-settings {
      flex-direction: column;
    }

    .setting-field {
      width: 100%;
    }

    .configuration-card-header {
      align-items: flex-start;
    }

    .configuration-card-footer {
      align-items: flex-start;
      flex-direction: column;
    }

    .save-btn {
      width: 100%;
      justify-content: center;
    }
  }
`;

export default AdminAlertConfiguration;