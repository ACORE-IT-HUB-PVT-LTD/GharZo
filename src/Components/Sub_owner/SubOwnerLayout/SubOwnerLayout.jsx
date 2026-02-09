import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if SubOwner token exists
    const token = localStorage.getItem("usertoken");
    if (!token) {
      // No token found, redirect to login
      navigate("/login", { replace: true });
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <SubOwnerLayoutContent />;
};

export default SubOwnerLayout;
