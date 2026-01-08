import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

const LandlordLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(80); // desktop default collapsed

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar setSidebarWidth={setSidebarWidth} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-gray-50  ml-0 sm:ml-0 ">
        <Outlet />
      </div>
    </div>
  );
};

export default LandlordLayout;
