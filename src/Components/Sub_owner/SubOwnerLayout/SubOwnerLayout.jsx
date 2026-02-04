import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext";
import LayoutGuard from "../../../utils/LayoutGuard";
import Sidebar from "../Sidebar/SubOwnerSidebar";

const SubOwnerLayoutContent = () => {
  const [sidebarWidth, setSidebarWidth] = useState(80);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar setSidebarWidth={setSidebarWidth} />

      {/* Page Content */}
      <div
        className="flex-1 bg-gray-100 min-h-screen p-6 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <Outlet />
      </div>
    </div>
  );
};

const SubOwnerLayout = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <LayoutGuard 
      requiredRole="sub_owner" 
      fallbackPath="/sub_owner_login"
    >
      <SubOwnerLayoutContent />
    </LayoutGuard>
  );
};

export default SubOwnerLayout;
