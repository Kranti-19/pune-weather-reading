function AQIStatus({ aqi }) {

  let category = "";
  let bgColor = "";
  let textColor = "";

  if (aqi <= 50) {
    category = "Good";
    bgColor = "bg-green-100";
    textColor = "text-green-600";
  } else if (aqi <= 100) {
    category = "Satisfactory";
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-600";
  } else if (aqi <= 200) {
    category = "Moderate";
    bgColor = "bg-orange-100";
    textColor = "text-orange-600";
  } else if (aqi <= 300) {
    category = "Poor";
    bgColor = "bg-red-100";
    textColor = "text-red-600";
  } else if (aqi <= 400) {
    category = "Very Poor";
    bgColor = "bg-purple-100";
    textColor = "text-purple-600";
  } else {
    category = "Severe";
    bgColor = "bg-gray-200";
    textColor = "text-gray-800";
  }

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}
    >
      {category}
    </span>
  );
}

export default AQIStatus;