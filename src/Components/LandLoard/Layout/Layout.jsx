import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext";
import LayoutGuard from "../../../utils/LayoutGuard";
import Sidebar from "../Sidebar/Sidebar";

const LandlordLayoutContent = () => {
  const [sidebarWidth, setSidebarWidth] = useState(80);
  const location = useLocation();
  const hideSidebar = location.pathname === "/landlord/add-property" || location.pathname.includes("/landlord/property/edit/");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {!hideSidebar && <Sidebar setSidebarWidth={setSidebarWidth} />}

      {/* Main content */}
      <div 
        className={`flex-1 overflow-y-auto bg-gray-50 ml-0 sm:ml-0 ${hideSidebar ? 'w-full' : ''}`}
        style={{ background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)' }}
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
