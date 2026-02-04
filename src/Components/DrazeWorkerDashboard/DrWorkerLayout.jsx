import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import WorkerSidebar from "./WorkerSidebar";

const DrWorkerLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(80);

  return (
    <div className="flex">
      {/* Sidebar */}
      <WorkerSidebar setSidebarWidth={setSidebarWidth} />

      {/* Page Content */}
      <div
        className="flex-1 bg-gray-100 min-h-screen p-6 transition-all duration-300"
        style={{ background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)' }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default DrWorkerLayout;
