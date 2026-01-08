import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RegionalManagerList from "./RegionalManagerList";
import AddRegionalManager from "./AddRegionalManager";
import { motion } from "framer-motion";
import { Users, UserPlus } from "lucide-react";

// Enhanced Icon Component with Gradient Theme
const GradientIcon = ({ icon: Icon, size = 20, gradient }) => (
  <motion.div
    className="relative p-2 rounded-full shadow-md hover:shadow-xl transition-all duration-300"
    whileHover={{ scale: 1.1, rotate: 5 }}
  >
    <div className={`bg-gradient-to-br ${gradient} rounded-full p-1`}>
      <Icon size={size} className="text-white drop-shadow-sm" />
    </div>
  </motion.div>
);

const RegionalManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <ToastContainer position="top-right" theme="light" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-6xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-white/30"
      >
        {/* Header */}
        

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row justify-center mb-10 gap-4">
          <motion.button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
              activeTab === "list"
                ? "bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-white scale-105"
                : "bg-white/60 text-gray-700 hover:bg-white/80 hover:scale-102 border border-gray-200"
            }`}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <GradientIcon
              icon={Users}
              gradient="from-[#00C2FF] to-[#00FFAA]"
            />
            Regional Manager List
          </motion.button>
          <motion.button
            onClick={() => setActiveTab("add")}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
              activeTab === "add"
                ? "bg-gradient-to-r from-[#00C2FF] via-[#00D4AA] to-[#00FFAA] text-white scale-105"
                : "bg-white/60 text-gray-700 hover:bg-white/80 hover:scale-102 border border-gray-200"
            }`}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <GradientIcon
              icon={UserPlus}
              gradient="from-[#00C2FF] via-[#00D4AA] to-[#00FFAA]"
            />
            Add Regional Manager
          </motion.button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "list" ? -20 : 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: activeTab === "list" ? 20 : -20, scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="space-y-8"
        >
          {activeTab === "list" ? (
            <RegionalManagerList />
          ) : (
            <AddRegionalManager />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegionalManagerDashboard;