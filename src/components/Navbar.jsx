import { MapPin } from "lucide-react";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b">

      {/* Title */}
      <div>
        <h1 className="font-bold text-xl text-gray-900">
          Air Quality Monitoring Dashboard
        </h1>

        <p className="text-xs text-gray-500 mt-1">
          Pune Municipal Corporation
        </p>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-gray-600">
        <MapPin size={18} />

        <span className="text-sm">
          Pune, Maharashtra
        </span>
      </div>

    </nav>
  );
}

export default Navbar;