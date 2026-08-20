function PollutantCard({ name, value, unit, label }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5">

      <p className="text-sm font-medium text-gray-500">
        {name}
      </p>

      <div className="flex items-end gap-1 mt-2">

        <p className="text-2xl font-bold text-gray-900">
          {value}
        </p>

        <span className="text-xs text-gray-500 mb-1">
          {unit}
        </span>

      </div>

      <p className="text-xs text-gray-400 mt-2">
        {label}
      </p>

    </div>
  );
}

export default PollutantCard;