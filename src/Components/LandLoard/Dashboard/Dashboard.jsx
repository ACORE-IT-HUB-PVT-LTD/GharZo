import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaRupeeSign,
  FaPlusCircle,
  FaBell,
  FaChartBar,
  FaWrench,
  FaVideo,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaTag,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [allComplaints, setAllComplaints] = useState(0);
  const [occupancy, setOccupancy] = useState({ totalRooms: 0, occupied: 0 });
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalSubAdmins, setTotalSubAdmins] = useState(0);
  const [totalPlans, setTotalPlans] = useState(0);
  const [totalDues, setTotalDues] = useState(0);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [properties, setProperties] = useState([]);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [propertyMixData, setPropertyMixData] = useState([
    { name: "PG", value: 14 },
    { name: "Flats", value: 9 },
    { name: "Hostel", value: 20 },
  ]);
  const [occupancyTrendData, setOccupancyTrendData] = useState([
    { month: "Feb", occupied: 62 },
    { month: "Mar", occupied: 65 },
    { month: "Apr", occupied: 69 },
    { month: "May", occupied: 72 },
    { month: "Jun", occupied: 76 },
    { month: "Jul", occupied: 74 },
  ]);

  

  // Sidebar hover effect
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);

      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const storedProperties = JSON.parse(localStorage.getItem("properties")) || [];
    const storedTenants = JSON.parse(localStorage.getItem("tenants")) || [];
    
    setTotalProperties(storedProperties.length);
    setTotalTenants(storedTenants.length);
    setProperties(storedProperties);
    setOccupancy({ totalRooms: 50, occupied: 38 });
    setTotalVisits(0);
    setAllComplaints(0);
    setTotalCollected(0);
    setTotalSubAdmins(0);
    setTotalPlans(0);
    setTotalDues(0);
  }, []);

  // Update graph data based on properties
  useEffect(() => {
    const totalRooms = properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);
    const occupied = totalTenants;
    const occupancyRate = totalRooms > 0 ? ((occupied / totalRooms) * 100).toFixed(1) : 0;

    const updatedOccupancyTrend = occupancyTrendData.map((data) => ({
      ...data,
      occupied: parseFloat(occupancyRate),
    }));
    setOccupancyTrendData(updatedOccupancyTrend);

    const typeCounts = properties.reduce((acc, p) => {
      const type = p.type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const updatedPropertyMix = Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
    }));
    
    setPropertyMixData(
      updatedPropertyMix.length > 0
        ? updatedPropertyMix
        : [
            { name: "PG", value: 14 },
            { name: "Flats", value: 9 },
            { name: "Hostel", value: 20 },
          ]
    );
  }, [properties, totalTenants]);

  const occupancyRate = occupancy.totalRooms
    ? ((occupancy.occupied / occupancy.totalRooms) * 100).toFixed(1)
    : 0;

  // Brand Colors
  const ACCENT_ORANGE = "white";
  const PIE_COLORS = ["#f57c00", "#ff9d3f", "#ffb87a"];

  return (
    <div
      className={`px-6 lg:px-12 py-8 mx-auto w-full min-h-screen text-gray-100 transition-all duration-500 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`,
      }}
    >
      {loading && (
        <div className="text-center text-gray-400 text-lg py-12">Loading dashboard data...</div>
      )}

      <motion.h2
        className="text-5xl font-black text-center mb-12"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <span style={{ color: ACCENT_ORANGE }}>Landlord Dashboard</span>
      </motion.h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            icon: FaCalendarCheck,
            title: "Total Visits",
            value: totalVisits,
            link: "/landlord/visit-requests",
          },
          {
            icon: FaBuilding,
            title: "Total Properties",
            value: totalProperties,
            link: "/landlord/property",
          },
          {
            icon: FaUsers,
            title: "Total Tenants",
            value: totalTenants,
            link: "/landlord/tenant-list",
          },
          {
            icon: FaRupeeSign,
            title: "Collections",
            value: `₹${totalCollected.toLocaleString("en-IN")}`,
            link: "/landlord/collections",
          },
          {
            icon: FaUsers,
            title: "Total Sub Owner",
            value: totalSubAdmins,
            link: "/landlord/landlord_subadmin",
          },
          {
            icon: FaExclamationTriangle,
            title: "Total Complaints",
            value: allComplaints,
            link: "/landlord/allComplaints",
          },
          {
            icon: FaTag,
            title: "Subscription Plans",
            value: totalPlans,
            link: "/landlord/subscription-plans",
          },
          {
            icon: FaRupeeSign,
            title: "Total Dues",
            value: `₹${totalDues.toLocaleString("en-IN")}`,
            link: "/landlord/dues",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          const card = (
            <motion.div
              whileHover={{ scale: 1.06, y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 hover:shadow-orange-500/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="text-4xl text-orange-600" />
                <span className="text-sm font-medium text-gray-300">{stat.title}</span>
              </div>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </motion.div>
          );
          return stat.link ? (
            <Link key={i} to={stat.link}>
              {card}
            </Link>
          ) : (
            <div key={i}>{card}</div>
          );
        })}
      </div>

      {/* Property Mix Pie Chart */}
      <motion.div
        className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h5 className="text-2xl font-bold mb-8 text-center text-white">
          Property Type Distribution
        </h5>
        <ResponsiveContainer width="100%" height={380}>
          <PieChart>
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px" }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend iconType="circle" />
            <Pie
              data={propertyMixData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              innerRadius={60}
              paddingAngle={5}
              label={({ name, value }) => `${name}: ${value}`}
              labelStyle={{ fill: "#fff", fontSize: "14px" }}
            >
              {propertyMixData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default Dashboard;