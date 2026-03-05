import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext";
import LayoutGuard from "../../../utils/LayoutGuard";
import Sidebar from "../Sidebar/Sidebar";

const LandlordLayoutContent = () => {
  const [sidebarWidth, setSidebarWidth] = useState(80);
  const location = useLocation();
  const hideSidebar =
    location.pathname === "/landlord/add-property" ||
    location.pathname.includes("/landlord/property/edit/") ||
    /\/landlord\/property\/[^/]+\/edit$/.test(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      {!hideSidebar && <Sidebar setSidebarWidth={setSidebarWidth} />}

      {/* Main content */}
      <div 
        className={`flex-1 overflow-y-auto ml-0 sm:ml-0 ${hideSidebar ? 'w-full' : ''}`}
        style={{
          background:
            "radial-gradient(circle at 10% 15%, rgba(245, 124, 0, 0.08), transparent 38%), radial-gradient(circle at 90% 85%, rgba(13, 47, 82, 0.08), transparent 36%), #f8fafc",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

const LandlordLayout = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <LayoutGuard 
      requiredRole="landlord" 
      fallbackPath="/landlord_login"
    >
      <LandlordLayoutContent />
    </LayoutGuard>
  );
};

export default LandlordLayout;
