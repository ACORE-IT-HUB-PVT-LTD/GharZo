import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SellerSidebar from "../Sidebar/Sidebar"; // Adjust the import path based on your project structure

const SellerLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(80); // Desktop default collapsed width (matches w-20 in Tailwind)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <SellerSidebar setSidebarWidth={setSidebarWidth} />

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

export default SellerLayout;