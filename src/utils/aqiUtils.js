// src/utils/aqiUtils.js

export const getCPCBStatus = (aqi) => {
  const val = Number(aqi);

  if (val <= 50) {
    return {
      label: "Good",
      bg: "bg-[#00B050]",
      text: "text-[#00B050]",
      border: "border-[#00B050]",
      badge: "bg-[#00B050]/15 text-[#00B050]",
      hex: "#00B050",
    };
  }

  if (val <= 100) {
    return {
      label: "Satisfactory",
      bg: "bg-[#92D050]",
      text: "text-[#70a83b]",
      border: "border-[#92D050]",
      badge: "bg-[#92D050]/20 text-[#55832a]",
      hex: "#92D050",
    };
  }

  if (val <= 200) {
    return {
      label: "Moderate",
      bg: "bg-[#EAB308]",
      text: "text-[#CA8A04]",
      border: "border-[#EAB308]",
      badge: "bg-[#FEF08A] text-[#854D0E]",
      hex: "#EAB308",
    };
  }

  if (val <= 300) {
    return {
      label: "Poor",
      bg: "bg-[#FF9900]",
      text: "text-[#FF9900]",
      border: "border-[#FF9900]",
      badge: "bg-[#FF9900]/15 text-[#D97706]",
      hex: "#FF9900",
    };
  }

  if (val <= 400) {
    return {
      label: "Very Poor",
      bg: "bg-[#FF0000]",
      text: "text-[#FF0000]",
      border: "border-[#FF0000]",
      badge: "bg-[#FF0000]/15 text-[#DC2626]",
      hex: "#FF0000",
    };
  }

  return {
    label: "Severe",
    bg: "bg-[#C00000]",
    text: "text-[#C00000]",
    border: "border-[#C00000]",
    badge: "bg-[#C00000]/15 text-[#991B1B]",
    hex: "#C00000",
  };
};