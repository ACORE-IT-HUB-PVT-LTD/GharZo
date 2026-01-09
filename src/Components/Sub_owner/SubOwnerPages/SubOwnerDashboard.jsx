import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaUser,
  FaChartBar,
  FaBuilding,
  FaBed,
  FaUsers,
  FaExclamationTriangle,
  FaDollarSign,
  FaMoneyBillWave,
  FaUserTie,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    totalBeds: 0,
    totalTenants: 0,
    totalWorkers: 0,
    monthlyCollection: 0,
    pendingDues: 0,
    totalComplaints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced animation variants
  const cardVariants = {
    initial: { scale: 1, y: 0 },
    hover: { 
      scale: 1.05, 
      y: -12,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const shimmer = {
    initial: { backgroundPosition: "-200% 0" },
    animate: {
      backgroundPosition: "200% 0",
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please login again.");
          setLoading(false);
          return;
        }

        // Fetch properties data
        const propertiesResponse = await axios.get(
          `${baseurl}api/sub-owner/properties`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch workers data
        const workersResponse = await axios.get(
          `${baseurl}api/sub-owner/workers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch dues summary data
        const duesResponse = await axios.get(
          `${baseurl}api/subowner/dues/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch complaints summary data
        const complaintsResponse = await axios.get(
          `${baseurl}api/sub-owner/properties/complaints/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (
          propertiesResponse.data.success &&
          workersResponse.data.success &&
          duesResponse.data.tenants &&
          complaintsResponse.data.success
        ) {
          const properties = propertiesResponse.data.properties || [];
          const workers = workersResponse.data.workers || [];
          const tenantsWithDues = duesResponse.data.tenants || [];
          const complaintProperties = complaintsResponse.data.properties || [];

          // Calculate total stats
          const totalProperties = properties.length;
          const totalRooms = properties.reduce(
            (sum, prop) => sum + (prop.stats?.totalRooms || 0),
            0
          );
          const totalBeds = properties.reduce(
            (sum, prop) => sum + (prop.stats?.totalBeds || 0),
            0
          );
          const totalTenants = properties.reduce(
            (sum, prop) => sum + (prop.stats?.occupancy?.occupied || 0),
            0
          );
          const totalWorkers = workers.length;
          const monthlyCollection = properties.reduce(
            (sum, prop) => sum + (prop.stats?.monthlyCollection || 0),
            0
          );
          const pendingDues = tenantsWithDues.reduce(
            (sum, tenantInfo) => sum + (tenantInfo.totalAmount || 0),
            0
          );
          const totalComplaints = complaintProperties.reduce(
            (sum, prop) => sum + (prop.totalComplaints || 0),
            0
          );

          setDashboardStats({
            totalProperties,
            totalRooms,
            totalBeds,
            totalTenants,
            totalWorkers,
            monthlyCollection,
            pendingDues,
            totalComplaints,
          });
        } else {
          setError("Failed to fetch dashboard data.");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.message || "Failed to fetch dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div 
            className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#003366] border-r-[#FF6B35] animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaBuilding className="text-3xl sm:text-4xl text-[#FF6B35]" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-[#003366] mb-2">Loading Dashboard</h3>
            <p className="text-sm sm:text-base text-gray-600">Please wait while we fetch your data...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 max-w-md w-full text-center"
        >
          <motion.div 
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaExclamationTriangle className="text-4xl sm:text-5xl text-red-500" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003366] mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto bg-gradient-to-r from-[#FF6B35] to-[#ff8659] text-white px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header Section - Fully Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex-1">
              <motion.h1 
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#003366] mb-2 leading-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Dashboard Overview
              </motion.h1>
              <motion.p 
                className="text-gray-600 text-sm sm:text-base"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Welcome back! Here's what's happening today.
              </motion.p>
            </div>
            <motion.div 
              className="lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 border-2 border-[#FF6B35] hover:shadow-2xl transition-shadow duration-300">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Sub Owner Portal</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#003366] tracking-tight">Gharzo</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Stats Grid - Responsive Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 lg:mb-10"
        >
          {/* Properties Card */}
          <motion.div
            variants={itemVariants}
            role="button"
            onClick={() => navigate("/sub_owner/sub_owner_property")}
            className="relative bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl p-4 sm:p-5 lg:p-6 cursor-pointer overflow-hidden group transform transition-all duration-300"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            initial="initial"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#003366] via-[#004d99] to-[#0066cc] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-20"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                backgroundSize: "200% 100%"
              }}
              variants={shimmer}
              initial="initial"
              whileHover="animate"
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#FF6B35] to-[#ff8659] bg-opacity-10 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:bg-opacity-10 transition-all duration-300 shadow-lg">
                  <FaBuilding className="text-xl sm:text-2xl lg:text-3xl text-[#FF6B35] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:bg-white group-hover:bg-opacity-20 transition-all duration-300">
                    <FaArrowUp className="text-green-600 text-xs sm:text-sm group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 group-hover:text-green-200 transition-colors">Active</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mb-2 group-hover:text-gray-200 transition-colors duration-300 font-medium">Total Properties</p>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#003366] group-hover:text-white transition-colors duration-300 mb-2">
                {dashboardStats.totalProperties}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden group-hover:bg-white group-hover:bg-opacity-20">
                  <motion.div 
                    className="h-full bg-[#FF6B35] group-hover:bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 group-hover:text-gray-300 transition-colors">Click to manage properties</p>
            </div>
          </motion.div>

          {/* Rooms Card */}
          <motion.div
            variants={itemVariants}
            className="relative bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl p-4 sm:p-5 lg:p-6 overflow-hidden group transform transition-all duration-300"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            initial="initial"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] via-[#ff8659] to-[#ffa07a] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-20"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                backgroundSize: "200% 100%"
              }}
              variants={shimmer}
              initial="initial"
              whileHover="animate"
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#003366] to-[#004d99] bg-opacity-10 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:bg-opacity-20 transition-all duration-300 shadow-lg">
                  <FaBed className="text-xl sm:text-2xl lg:text-3xl text-[#003366] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:bg-white group-hover:bg-opacity-20 transition-all duration-300">
                    <FaChartLine className="text-blue-600 text-xs sm:text-sm group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-200 transition-colors">100%</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mb-2 group-hover:text-gray-200 transition-colors duration-300 font-medium">Total Rooms</p>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#003366] group-hover:text-white transition-colors duration-300 mb-2">
                {dashboardStats.totalRooms}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden group-hover:bg-white group-hover:bg-opacity-20">
                  <motion.div 
                    className="h-full bg-[#003366] group-hover:bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 group-hover:text-gray-300 transition-colors">Across all properties</p>
            </div>
          </motion.div>

          {/* Workers Card */}
          <motion.div
            variants={itemVariants}
            role="button"
            onClick={() => navigate("/sub_owner/sub_owner_workers_list")}
            className="relative bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl p-4 sm:p-5 lg:p-6 cursor-pointer overflow-hidden group transform transition-all duration-300"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            initial="initial"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#003366] via-[#004d99] to-[#0066cc] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-20"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                backgroundSize: "200% 100%"
              }}
              variants={shimmer}
              initial="initial"
              whileHover="animate"
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#FF6B35] to-[#ff8659] bg-opacity-10 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:bg-opacity-20 transition-all duration-300 shadow-lg">
                  <FaUsers className="text-xl sm:text-2xl lg:text-3xl text-[#FF6B35] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center group-hover:bg-white group-hover:bg-opacity-20 transition-all duration-300">
                    <FaCheckCircle className="text-purple-600 text-xs sm:text-sm group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-semibold text-purple-600 group-hover:text-purple-200 transition-colors">Team</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mb-2 group-hover:text-gray-200 transition-colors duration-300 font-medium">Total Workers</p>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#003366] group-hover:text-white transition-colors duration-300 mb-2">
                {dashboardStats.totalWorkers}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden group-hover:bg-white group-hover:bg-opacity-20">
                  <motion.div 
                    className="h-full bg-[#FF6B35] group-hover:bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 group-hover:text-gray-300 transition-colors">Active staff members</p>
            </div>
          </motion.div>

          {/* Complaints Card */}
          <motion.div
            variants={itemVariants}
            role="button"
            onClick={() => navigate("/sub_owner/complaints")}
            className="relative bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl p-4 sm:p-5 lg:p-6 cursor-pointer overflow-hidden group transform transition-all duration-300"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            initial="initial"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-20"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                backgroundSize: "200% 100%"
              }}
              variants={shimmer}
              initial="initial"
              whileHover="animate"
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:bg-opacity-20 transition-all duration-300 shadow-lg">
                  <FaExclamationTriangle className="text-xl sm:text-2xl lg:text-3xl text-red-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:bg-white group-hover:bg-opacity-20 transition-all duration-300 animate-pulse">
                    <FaClock className="text-orange-600 text-xs sm:text-sm group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-semibold text-orange-600 group-hover:text-orange-200 transition-colors">Urgent</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mb-2 group-hover:text-gray-200 transition-colors duration-300 font-medium">Total Complaints</p>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#003366] group-hover:text-white transition-colors duration-300 mb-2">
                {dashboardStats.totalComplaints}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden group-hover:bg-white group-hover:bg-opacity-20">
                  <motion.div 
                    className="h-full bg-red-500 group-hover:bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: "45%" }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 group-hover:text-gray-300 transition-colors">Needs attention</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Financial Overview Section - Responsive Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 lg:mb-10"
        >
          {/* Monthly Collection Card */}
          <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-br from-[#003366] via-[#004d99] to-[#0066cc] rounded-2xl lg:rounded-3xl shadow-2xl p-5 sm:p-6 lg:p-8 text-white overflow-hidden group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-white opacity-5 rounded-full -mr-16 -mt-16 sm:-mr-20 sm:-mt-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white opacity-5 rounded-full -ml-12 -mb-12 sm:-ml-16 sm:-mb-16"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-white to-transparent opacity-5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg">
                      <FaMoneyBillWave className="text-lg sm:text-xl text-white" />
                    </div>
                    <p className="text-blue-200 text-sm sm:text-base font-medium">Monthly Collection</p>
                  </div>
                  <motion.h2 
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    ₹{dashboardStats.monthlyCollection.toLocaleString()}
                  </motion.h2>
                  <p className="text-blue-200 text-xs sm:text-sm">Total revenue collected this month</p>
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <FaMoneyBillWave className="text-2xl sm:text-3xl lg:text-4xl text-[#FF6B35]" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-green-500 bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                  <FaArrowUp className="text-green-300 text-xs mr-2" />
                  <span className="text-green-300 text-xs font-semibold">Active Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-200 text-xs">Live tracking</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pending Dues Card */}
          <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-br from-[#FF6B35] via-[#ff8659] to-[#ffa07a] rounded-2xl lg:rounded-3xl shadow-2xl p-5 sm:p-6 lg:p-8 text-white overflow-hidden group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-white opacity-5 rounded-full -mr-16 -mt-16 sm:-mr-20 sm:-mt-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white opacity-5 rounded-full -ml-12 -mb-12 sm:-ml-16 sm:-mb-16"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-white to-transparent opacity-5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                      <FaDollarSign className="text-lg sm:text-xl text-white" />
                    </div>
                    <p className="text-orange-100 text-sm sm:text-base font-medium">Pending Dues</p>
                  </div>
                  <motion.h2 
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    ₹{dashboardStats.pendingDues.toLocaleString()}
                  </motion.h2>
                  <p className="text-orange-100 text-xs sm:text-sm">Outstanding payments to collect</p>
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <FaDollarSign className="text-2xl sm:text-3xl lg:text-4xl text-[#003366]" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-red-500 bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                  <FaExclamationTriangle className="text-red-100 text-xs mr-2" />
                  <span className="text-red-100 text-xs font-semibold">Action Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
                  <span className="text-orange-100 text-xs">Follow up needed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions Section - Fully Responsive */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#003366] mb-2">Quick Actions</h2>
            <p className="text-gray-600 text-sm sm:text-base">Navigate to different sections quickly</p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {/* Complaints Action */}
            <motion.div
              variants={itemVariants}
              role="button"
              onClick={() => navigate("/sub_owner/complaints")}
              className="bg-white rounded-xl lg:rounded-2xl shadow-md hover:shadow-2xl p-4 sm:p-5 lg:p-6 xl:p-7 cursor-pointer border-2 border-transparent hover:border-[#FF6B35] transition-all duration-300 group transform hover:-translate-y-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-gradient-to-br group-hover:from-[#FF6B35] group-hover:to-[#ff8659] transition-all duration-300 shadow-lg">
                  <FaExclamationTriangle className="text-xl sm:text-2xl lg:text-3xl text-red-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[#003366] font-semibold text-xs sm:text-sm lg:text-base group-hover:text-[#FF6B35] transition-colors duration-300">Complaints</h3>
                <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-600 transition-colors">View all</p>
              </div>
            </motion.div>

            {/* Dues Action */}
            <motion.div
              variants={itemVariants}
              role="button"
              onClick={() => navigate("/sub_owner/dues")}
              className="bg-white rounded-xl lg:rounded-2xl shadow-md hover:shadow-2xl p-4 sm:p-5 lg:p-6 xl:p-7 cursor-pointer border-2 border-transparent hover:border-[#FF6B35] transition-all duration-300 group transform hover:-translate-y-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-gradient-to-br group-hover:from-[#FF6B35] group-hover:to-[#ff8659] transition-all duration-300 shadow-lg">
                  <FaDollarSign className="text-xl sm:text-2xl lg:text-3xl text-yellow-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[#003366] font-semibold text-xs sm:text-sm lg:text-base group-hover:text-[#FF6B35] transition-colors duration-300">Dues</h3>
                <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-600 transition-colors">Manage</p>
              </div>
            </motion.div>

            {/* Collection Action */}
            <motion.div
              variants={itemVariants}
              role="button"
              onClick={() => navigate("/sub_owner/collections")}
              className="bg-white rounded-xl lg:rounded-2xl shadow-md hover:shadow-2xl p-4 sm:p-5 lg:p-6 xl:p-7 cursor-pointer border-2 border-transparent hover:border-[#FF6B35] transition-all duration-300 group transform hover:-translate-y-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-gradient-to-br group-hover:from-[#FF6B35] group-hover:to-[#ff8659] transition-all duration-300 shadow-lg">
                  <FaMoneyBillWave className="text-xl sm:text-2xl lg:text-3xl text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[#003366] font-semibold text-xs sm:text-sm lg:text-base group-hover:text-[#FF6B35] transition-colors duration-300">Collection</h3>
                <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-600 transition-colors">Track</p>
              </div>
            </motion.div>

            {/* My Owner Action */}
            <motion.div
              variants={itemVariants}
              role="button"
              onClick={() => navigate("/sub_owner/my_owner")}
              className="bg-white rounded-xl lg:rounded-2xl shadow-md hover:shadow-2xl p-4 sm:p-5 lg:p-6 xl:p-7 cursor-pointer border-2 border-transparent hover:border-[#FF6B35] transition-all duration-300 group transform hover:-translate-y-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-gradient-to-br group-hover:from-[#FF6B35] group-hover:to-[#ff8659] transition-all duration-300 shadow-lg">
                  <FaUserTie className="text-xl sm:text-2xl lg:text-3xl text-purple-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[#003366] font-semibold text-xs sm:text-sm lg:text-base group-hover:text-[#FF6B35] transition-colors duration-300">My Owner</h3>
                <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-600 transition-colors">Profile</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;