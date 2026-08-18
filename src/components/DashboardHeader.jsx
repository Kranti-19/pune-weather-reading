import {
  Bell,
  Search,
  ChevronDown,
} from "lucide-react"

function DashboardHeader() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">

      {/* Left */}

      <div>

        <h2 className="text-xl font-bold text-gray-900">
          Weather Monitoring Dashboard
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Pune Municipal Corporation
        </p>

      </div>


      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="relative hidden md:block">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search area..."
            className="w-52 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />

        </div>


        {/* Notification */}

        <button className="relative text-gray-500 hover:text-gray-900">

          <Bell size={21} />

          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />

        </button>


        {/* User */}

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            P
          </div>

          <div className="hidden lg:block">

            <p className="text-sm font-semibold text-gray-900">
              PMC Officer
            </p>

            <p className="text-xs text-gray-500">
              Administrator
            </p>

          </div>

          <ChevronDown
            size={17}
            className="text-gray-400"
          />

        </div>

      </div>

    </header>
  )
}

export default DashboardHeader