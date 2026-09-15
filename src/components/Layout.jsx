import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <DashboardHeader />

        {/* Page */}
        <main className="p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default Layout;