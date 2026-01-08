import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DrWorkerSidebar from "./DrWorkerSidebar";

const PropertyOwnerLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(80); // desktop default collapsed

  return (
    <div className="flex">
      {/* Sidebar */}
      <DrWorkerSidebar setSidebarWidth={setSidebarWidth} />

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

export default PropertyOwnerLayout;
