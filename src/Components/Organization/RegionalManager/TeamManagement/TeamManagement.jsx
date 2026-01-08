// DashboardBoxes.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaPlusCircle,
  FaBuilding,
  FaUserTie,
} from "react-icons/fa";

const Colorful3DIcon = ({ icon: Icon, color, size = 40 }) => (
  <motion.div
    className={`p-4 rounded-3xl shadow-lg bg-gradient-to-br ${color} cursor-pointer select-none`}
    style={{ perspective: 1000 }}
    whileHover={{ scale: 1.1, rotateY: 15, rotateX: 10 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <Icon className="text-white drop-shadow-lg" size={size} />
  </motion.div>
);

const ManagerBox = ({ count, onAdd, onView }) => (
  <motion.div
    className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center cursor-pointer"
    whileHover={{ scale: 1.05 }}
  >
    <Colorful3DIcon icon={FaUserTie} color="from-purple-700 to-indigo-700" />
    <h2 className="text-white text-2xl font-bold mt-4">Property Managers</h2>
    {/* <p className="text-white text-lg mt-2">{count} Total Managers</p> */}
    <div className="mt-4 flex gap-4">
      <button
        onClick={onAdd}
        className="bg-white text-indigo-700 font-semibold px-6 py-2 rounded-full shadow hover:bg-indigo-100 transition"
      >
        Add Property Manager
      </button>
      <button
        onClick={onView}
        className="bg-indigo-800 text-white font-semibold px-6 py-2 rounded-full shadow hover:bg-indigo-900 transition"
      >
        View All
      </button>
    </div>
  </motion.div>
);


const PropertyBox = ({ count, onView }) => (
  <motion.div
    className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center cursor-pointer"
    whileHover={{ scale: 1.05 }}
  >
    <Colorful3DIcon icon={FaBuilding} color="from-blue-700 to-cyan-700" />
    <h2 className="text-white text-2xl font-bold mt-4">Properties</h2>
    {/* <p className="text-white text-lg mt-2">{count} Total Properties</p> */}
    <button
      onClick={onView}
      className="mt-4 bg-white text-cyan-700 font-semibold px-6 py-2 rounded-full shadow hover:bg-cyan-100 transition"
    >
      View Properties
    </button>
  </motion.div>
);

const DashboardBoxes = () => {
  const navigate = useNavigate();

  // Dummy counts for demo, but load from localStorage
  const [managerCount, setManagerCount] = useState(0);
  const [workerCount, setWorkerCount] = useState(0);
  const [propertyCount, setPropertyCount] = useState(0);

  // Local storage keys
  const MANAGERS_KEY = "regional_managers";
  const WORKERS_KEY = "regional_workers";
  const PROPERTIES_KEY = "regional_properties";

  // Load counts from localStorage on mount
  useEffect(() => {
    const savedManagers = localStorage.getItem(MANAGERS_KEY);
    const savedWorkers = localStorage.getItem(WORKERS_KEY);
    const savedProperties = localStorage.getItem(PROPERTIES_KEY);
    setManagerCount(savedManagers ? JSON.parse(savedManagers).length : 0);
    setWorkerCount(savedWorkers ? JSON.parse(savedWorkers).length : 0);
    setPropertyCount(savedProperties ? JSON.parse(savedProperties).length : 0);
  }, []);

  // Handlers for navigation
  const handleAddManager = () => navigate("/regional_manager/team_management/add_manager_form");
  const handleAddWorker = () => navigate("/regional_manager/team_management/add_worker_form");
  const handleViewManagers = () => navigate("/regional_manager/team_management/view_managers");
  const handleViewWorkers = () => navigate("/regional_manager/team_management/View_workers");
  const handleViewProperties = () => navigate("/regional_manager/regional_manager_property");

  // Listen for storage changes to update counts (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedManagers = localStorage.getItem(MANAGERS_KEY);
      const savedWorkers = localStorage.getItem(WORKERS_KEY);
      const savedProperties = localStorage.getItem(PROPERTIES_KEY);
      setManagerCount(savedManagers ? JSON.parse(savedManagers).length : 0);
      setWorkerCount(savedWorkers ? JSON.parse(savedWorkers).length : 0);
      setPropertyCount(savedProperties ? JSON.parse(savedProperties).length : 0);
    };

    window.addEventListener("storage", handleStorageChange);
    // Also trigger on initial load
    handleStorageChange();

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Regional Manager Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        <ManagerBox
          count={managerCount}
          onAdd={handleAddManager}
          onView={handleViewManagers}
        />
        
        <PropertyBox count={propertyCount} onView={handleViewProperties} />
      </div>
    </div>
  );
};

export default DashboardBoxes;