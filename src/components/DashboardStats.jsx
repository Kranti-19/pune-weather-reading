function DashboardStats() {
  const stats = [
    {
      title: "Monitored Areas",
      value: "5",
      subtitle: "Pune areas",
    },
    {
      title: "Today's Rainfall",
      value: "18 mm",
      subtitle: "Average across areas",
    },
    {
      title: "Active Alerts",
      value: "3",
      subtitle: "1 high priority",
    },
    {
      title: "Average Temperature",
      value: "24°C",
      subtitle: "Across Pune",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <p className="text-sm text-gray-500">
            {stat.title}
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {stat.value}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            {stat.subtitle}
          </p>
        </div>
      ))}

    </div>
  );
}

export default DashboardStats;