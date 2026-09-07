/// 1. CPCB National Air Quality Index (NAAQS) Categories & Scales
export const AQI_CATEGORIES = [
  {
    range: [0, 50],
    label: "Good",
    color: "#10b981",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Minimal health impact; clean ambient air."
  },
  {
    range: [51, 100],
    label: "Satisfactory",
    color: "#16a34a",
    badgeClass: "bg-green-50 text-green-700 border-green-200",
    description: "Minor breathing discomfort to sensitive people."
  },
  {
    range: [101, 200],
    label: "Moderate",
    color: "#f59e0b",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Breathing discomfort to people with asthma, lung, and heart diseases."
  },
  {
    range: [201, 300],
    label: "Poor",
    color: "#ea580c",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    description: "Breathing discomfort to most people on prolonged exposure."
  },
  {
    range: [301, 400],
    label: "Very Poor",
    color: "#e11d48",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Respiratory illness on prolonged exposure."
  },
  {
    range: [401, 500],
    label: "Severe",
    color: "#7f1d1d",
    badgeClass: "bg-red-900 text-white border-red-950",
    description: "Affects healthy people and seriously impacts those with existing diseases."
  }
];

// 2. 8 CPCB Criteria Pollutants & Standard Permissible Limits
export const CRITERIA_POLLUTANTS = [
  {
    code: "PM2.5",
    name: "Fine Particulate Matter",
    unit: "µg/m³",
    limit24h: 60,
    purpose: "Fine particulate matter; major AQI pollutant"
  },
  {
    code: "PM10",
    name: "Coarse Particulate Matter",
    unit: "µg/m³",
    limit24h: 100,
    purpose: "Coarse particulate matter; major AQI pollutant"
  },
  {
    code: "NO2",
    name: "Nitrogen Dioxide",
    unit: "µg/m³",
    limit24h: 80,
    purpose: "Traffic/combustion-related gaseous pollutant"
  },
  {
    code: "SO2",
    name: "Sulfur Dioxide",
    unit: "µg/m³",
    limit24h: 80,
    purpose: "Combustion/industrial emissions"
  },
  {
    code: "CO",
    name: "Carbon Monoxide",
    unit: "mg/m³",
    limit24h: 2.0,
    purpose: "Incomplete-combustion pollutant"
  },
  {
    code: "O3",
    name: "Ground-level Ozone",
    unit: "µg/m³",
    limit24h: 100,
    purpose: "Ground-level ozone"
  },
  {
    code: "NH3",
    name: "Ammonia",
    unit: "µg/m³",
    limit24h: 400,
    purpose: "Ammonia; relevant to AQI"
  },
  {
    code: "Pb",
    name: "Lead Trace",
    unit: "µg/m³",
    limit24h: 1.0,
    purpose: "Lead; relevant under CPCB AQI framework where measured"
  }
];

// 3. Meteorological Monitoring Parameters
export const METEOROLOGICAL_PARAMETERS = [
  { parameter: "Temperature", unit: "°C", purpose: "Meteorological context" },
  { parameter: "Relative Humidity", unit: "%", purpose: "Meteorological context / data interpretation" },
  { parameter: "Wind Speed", unit: "m/s", purpose: "Dispersion analysis" },
  { parameter: "Wind Direction", unit: "degrees", purpose: "Pollution-source/dispersion analysis" },
  { parameter: "Pressure", unit: "hPa", purpose: "Meteorological context" }
];

// 4. Modal Dropdown Form Options
export const STATION_DROPDOWN_OPTIONS = {
  zones: [
    "Central Zone",
    "West Zone",
    "East Zone",
    "South Zone",
    "North-West Zone"
  ],
  stationTypes: [
    "CAAQM Ambient",
    "Construction Site",
    "Traffic Corridor",
    "Industrial Area"
  ],
  protocols: [
    "4G-LTE",
    "Ethernet / Fiber",
    "LoRaWAN",
    "Wi-Fi"
  ],
  powerSources: [
    "Mains + Battery",
    "Solar + Battery",
    "Battery Only"
  ]
};

// 5. Official Regulatory Disclaimers & Notes
export const REGULATORY_NOTICES = {
  sitingNotice:
    "Low-cost sensors are complementary and not equivalent to primary reference-grade CAAQM monitors. Siting, calibration, and QA/QC verification are mandatory prior to official enforcement reporting.",
  cpcbStandard:
    "AQI calculation adheres to Central Pollution Control Board (CPCB) piecewise linear interpolation guidelines based on 24-hour weighted pollutant concentrations."
};

// 6. Helper Function for Dynamic Category Resolution
export function getAqiCategory(aqi) {
  const numericAqi = Number(aqi) || 0;
  const match = AQI_CATEGORIES.find(
    (cat) => numericAqi >= cat.range[0] && numericAqi <= cat.range[1]
  );
  return match || AQI_CATEGORIES[AQI_CATEGORIES.length - 1];
}