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
      <div className="flex-1 overflow-y-auto bg-gray-50  ml-0 sm:ml-0 "
      style={{ background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)' }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default LandlordLayout;
