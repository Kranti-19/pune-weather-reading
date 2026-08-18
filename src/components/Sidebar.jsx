import {
  LayoutDashboard,
  CloudSun,
  CloudRain,
  MapPin,
  Bell,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">

      {/* Logo */}

      <div className="p-6 border-b border-gray-100">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <CloudRain size={23} />
          </div>

          <div>
            <h1 className="font-bold text-gray-900">
              Pune PMC
            </h1>

            <p className="text-xs text-gray-500">
              Weather Monitoring
            </p>
          </div>

        </div>

      </div>


      {/* Navigation */}

      <nav className="flex-1 p-4">

        <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-3">
          Monitoring
        </p>


        <div className="space-y-1">

          <SidebarItem
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active
          />

          <SidebarItem
            icon={<CloudSun size={19} />}
            label="Weather"
          />

          <SidebarItem
            icon={<CloudRain size={19} />}
            label="Rainfall"
          />

          <SidebarItem
            icon={<MapPin size={19} />}
            label="Pune Areas"
          />

          <SidebarItem
            icon={<Bell size={19} />}
            label="Alerts"
          />

          <SidebarItem
            icon={<BarChart3 size={19} />}
            label="Analytics"
          />

        </div>


        <p className="text-xs font-semibold text-gray-400 uppercase px-3 mt-8 mb-3">
          System
        </p>


        <div className="space-y-1">

          <SidebarItem
            icon={<Settings size={19} />}
            label="Settings"
          />

        </div>

      </nav>


      {/* Logout */}

      <div className="p-4 border-t border-gray-100">

        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition">

          <LogOut size={19} />

          <span className="text-sm font-medium">
            Logout
          </span>

        </button>

      </div>

    </aside>
  )
}


function SidebarItem({ icon, label, active }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >

      {icon}

      <span>
        {label}
      </span>

    </button>
  )
}


export default Sidebar