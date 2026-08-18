import { MapPin, Search } from "lucide-react"

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b">

      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
          🌦️
        </div>

        <div>
          <h1 className="font-bold text-xl">
            Pune Weather
          </h1>

          <p className="text-xs text-gray-500">
            Local Weather Intelligence
          </p>
        </div>
      </div>


      <div className="flex items-center gap-2 text-gray-600">
        <MapPin size={18} />
        <span>Pune, Maharashtra</span>
      </div>


      <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search area..."
          className="outline-none text-sm w-32"
        />
      </div>

    </nav>
  )
}

export default Navbar