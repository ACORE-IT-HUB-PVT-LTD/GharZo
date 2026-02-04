import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, X, Home, User, LogOut } from "lucide-react";
import axios from "axios";
import { useAuth } from "../User_Section/Context/AuthContext";
import { motion } from "framer-motion";
import TenantSidebar from "./TenantSidebar";
import LayoutGuard from "../../utils/LayoutGuard";

const TenantLayoutContent = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tenantId, setTenantId] = useState(null);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(80);

  // Wait for auth to load, then fetch tenant-specific data if needed
  useEffect(() => {
    if (loading || !user) return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("usertoken");
        if (!token) return;

        const res = await axios.get("https://api.gharzoreality.com/api/tenant/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setNotifications(res.data.notifications || []);
          setNotificationCount(res.data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user, loading]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <TenantSidebar setSidebarWidth={setSidebarWidth} tenantId={tenantId} />

      {/* Main Content with Header */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-slate-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Gradient Title */}
            <motion.h1
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/tenant")}
              className="text-3xl font-extrabold cursor-pointer bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight"
            >
              Tenant Dashboard
            </motion.h1>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Home */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-400/40"
              >
                <Home className="w-5 h-5 text-white" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNotificationModalOpen(true)}
                className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-400/40"
              >
                <Bell className="w-5 h-5 text-white" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </motion.button>

              {/* Profile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/tenant/profile")}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-400/40"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-semibold">Profile</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Notifications Modal */}
      {isNotificationModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsNotificationModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 sm:right-8 z-50 max-w-sm w-full max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200"
          >
            <div className="p-4 sm:p-6 sticky top-0 bg-white border-b border-gray-200 rounded-t-xl">
              <div className="flex justify-between items-center mb-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Notifications</h2>
                <button
                  onClick={() => setIsNotificationModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-2 sm:p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">No any notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm text-gray-800 break-words">
                        {notif.message || notif.title || notif.content || "New notification"}
                      </p>
                      {notif.createdAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

const TenantLayout = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <LayoutGuard 
      requiredRole="tenant" 
      fallbackPath="/tenant_login"
    >
      <TenantLayoutContent />
    </LayoutGuard>
  );
};

export default TenantLayout;