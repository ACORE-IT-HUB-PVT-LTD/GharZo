import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import WorkerSidebar from "./WorkerSidebar";

const DrWorkerLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("usertoken") || localStorage.getItem("token");
    if (!token) {
      navigate("/dr_worker_login");
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)' }}>
        <div className="text-orange-300 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <WorkerSidebar setSidebarWidth={setSidebarWidth} />

      {/* Page Content - Responsive with sidebar */}
      <div
        className="flex-1 bg-gray-100 min-h-screen transition-all duration-300"
        style={{ 
          background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)',
          marginLeft: sidebarWidth > 0 ? `${sidebarWidth}px` : '0'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default DrWorkerLayout;
