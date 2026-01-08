import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import OrgSidebar from "../sidebar/OrgSidebar"; // Corrected import path

const OrganizationLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(80); // Desktop default collapsed width (matches w-20 in Tailwind)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <OrgSidebar setSidebarWidth={setSidebarWidth} />

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto bg-gray-100 transition-all duration-500"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default OrganizationLayout;