import React, { useEffect, useState } from "react";
import {
  FaBuilding,
  FaUsers,
  FaRupeeSign,
  FaBed,
  FaExclamationTriangle,
  FaVideo,
  FaPercent,
  FaCheckCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
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
  LineChart,
  Line,
} from "recharts";

const BASE_URL = "https://api.gharzoreality.com/api";

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("usertoken");

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const enter = () => setIsSidebarHovered(true);
      const leave = () => setIsSidebarHovered(false);
      sidebar.addEventListener("mouseenter", enter);
      sidebar.addEventListener("mouseleave", leave);
      return () => {
        sidebar.removeEventListener("mouseenter", enter);
        sidebar.removeEventListener("mouseleave", leave);
      };
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const year = new Date().getFullYear();
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const [overviewRes, financialRes] = await Promise.all([
          fetch(`${BASE_URL}/landlord/dashboard/overview`, { headers }),
          fetch(`${BASE_URL}/landlord/dashboard/financial-summary?year=${year}`, { headers }),
        ]);

        const overviewJson = await overviewRes.json();
        const financialJson = await financialRes.json();

        if (overviewJson.success) setOverview(overviewJson.data);
        if (financialJson.success) setFinancial(financialJson.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived values
  const ov = overview?.overview || {};
  const rooms = overview?.rooms || {};
  const tenancies = overview?.tenancies || {};
  const rent = overview?.rentCollection || {};
  const complaints = overview?.complaints || {};
  const reels = overview?.reels || {};

  const totalComplaints = (complaints.byStatus || []).reduce((s, c) => s + c.count, 0);

  // Complaint pie data
  const complaintPieData = (complaints.byStatus || []).map((c) => ({
    name: c._id,
    value: c.count,
  }));

  // Financial monthly bar data
  const monthlyBreakdown = financial?.monthlyBreakdown || [];
  const hasMonthly = monthlyBreakdown.length > 0;

  // Revenue breakdown for pie
  const revBreakdown = financial?.revenue?.breakdown || {};
  const revPieData = Object.entries(revBreakdown)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }));

  const PIE_COLORS = ["#f57c00", "#ff9d3f", "#ffb87a", "#e65100", "#ffa726", "#ef6c00"];
  const COMPLAINT_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
  };

  const stats = [
    {
      icon: FaBuilding,
      title: "Total Properties",
      value: ov.totalProperties ?? overview?.properties?.total ?? 0,
      link: "/landlord/property",
      color: "#f57c00",
    },
    {
      icon: FaBed,
      title: "Total Rooms",
      value: rooms.total ?? ov.totalRooms ?? 0,
      link: null,
      color: "#ff9d3f",
    },
    {
      icon: FaUsers,
      title: "Active Tenants",
      value: ov.activeTenants ?? tenancies.active ?? 0,
      link: "/landlord/tenant-list",
      color: "#f57c00",
    },
    {
      icon: FaPercent,
      title: "Occupancy Rate",
      value: `${ov.occupancyRate ?? 0}%`,
      link: null,
      color: "#ff9d3f",
    },
    {
      icon: FaBed,
      title: "Available Beds",
      value: ov.availableBeds ?? rooms.available ?? 0,
      link: null,
      color: "#f57c00",
    },
    {
      icon: FaRupeeSign,
      title: "Rent Collected",
      value: `₹${(rent.collected ?? 0).toLocaleString("en-IN")}`,
      link: "/landlord/collections",
      color: "#ff9d3f",
    },
    {
      icon: FaRupeeSign,
      title: "Rent Pending",
      value: `₹${(rent.pending ?? 0).toLocaleString("en-IN")}`,
      link: "/landlord/dues",
      color: "#f57c00",
    },
    {
      icon: FaExclamationTriangle,
      title: "Total Complaints",
      value: totalComplaints,
      link: "/landlord/allComplaints",
      color: "#ff9d3f",
    },
    {
      icon: FaVideo,
      title: "Total Reels",
      value: reels.total ?? 0,
      link: null,
      color: "#f57c00",
    },
    {
      icon: FaCheckCircle,
      title: "Active Reels",
      value: reels.active ?? 0,
      link: null,
      color: "#ff9d3f",
    },
    {
      icon: FaCheckCircle,
      title: "Total Tenancies",
      value: tenancies.total ?? ov.totalTenancies ?? 0,
      link: "/landlord/tenant-list",
      color: "#f57c00",
    },
    {
      icon: FaBuilding,
      title: "Total Capacity",
      value: ov.totalCapacity ?? rooms.capacity ?? 0,
      link: null,
      color: "#ff9d3f",
    },
  ];

  return (
    <div
      className={`px-4 sm:px-8 lg:px-12 py-8 mx-auto w-full min-h-screen text-gray-100 transition-all duration-500 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`,
      }}
    >
      <motion.h2
        className="text-4xl sm:text-5xl font-black text-center mb-10"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-white">Landlord Dashboard</span>
      </motion.h2>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center text-red-400 bg-red-900/20 rounded-xl py-6 px-8 mb-8 border border-red-500/30">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const card = (
                <motion.div
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.05, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-white/15 hover:border-orange-500/40 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="p-2.5 rounded-xl"
                      style={{ background: `${stat.color}22` }}
                    >
                      <Icon className="text-2xl" style={{ color: stat.color }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 text-right leading-tight max-w-[100px]">
                      {stat.title}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                </motion.div>
              );
              return <div key={i}>{card}</div>;
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Complaints Pie */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/15"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h5 className="text-xl font-bold mb-6 text-white text-center">
                Complaints by Status
              </h5>
              {complaintPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(7,26,47,0.95)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ color: "#cbd5e1", fontSize: "13px" }}
                    />
                    <Pie
                      data={complaintPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={55}
                      paddingAngle={4}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ stroke: "rgba(255,255,255,0.3)" }}
                    >
                      {complaintPieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COMPLAINT_COLORS[index % COMPLAINT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  No complaint data available
                </div>
              )}
            </motion.div>

            {/* Rooms Overview Bar */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/15"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h5 className="text-xl font-bold mb-6 text-white text-center">
                Rooms Overview
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      label: "Total",
                      value: rooms.total ?? ov.totalRooms ?? 0,
                    },
                    {
                      label: "Capacity",
                      value: rooms.capacity ?? ov.totalCapacity ?? 0,
                    },
                    {
                      label: "Occupied",
                      value: rooms.occupied ?? ov.currentOccupancy ?? 0,
                    },
                    {
                      label: "Available",
                      value: rooms.available ?? ov.availableBeds ?? 0,
                    },
                  ]}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#94a3b8", fontSize: 13 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(7,26,47,0.95)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {["#f57c00", "#ff9d3f", "#e65100", "#ffa726"].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Financial Section */}
          <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/15 mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h5 className="text-xl font-bold text-white">
                Financial Summary — {financial?.period?.year ?? new Date().getFullYear()}
              </h5>
              <div className="flex gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Total Revenue</p>
                  <p className="text-lg font-bold text-orange-400">
                    ₹{(financial?.revenue?.total ?? 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Pending</p>
                  <p className="text-lg font-bold text-red-400">
                    ₹{(financial?.pending?.amount ?? 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Collection Rate</p>
                  <p className="text-lg font-bold text-green-400">
                    {financial?.collectionRate ?? 0}%
                  </p>
                </div>
              </div>
            </div>

            {hasMonthly ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={monthlyBreakdown}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(7,26,47,0.95)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    formatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                  />
                  <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: "13px" }} />
                  <Bar dataKey="collected" name="Collected" fill="#f57c00" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px] gap-3">
                <div className="text-gray-500 text-sm">No monthly financial data for this period.</div>
                {/* Revenue breakdown if available */}
                {revPieData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(7,26,47,0.95)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "10px",
                          color: "#fff",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: "13px" }} />
                      <Pie data={revPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                        {revPieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </motion.div>

          {/* Reels Engagement */}
          {reels.total > 0 && (
            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/15"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h5 className="text-xl font-bold mb-6 text-white text-center">Reels Overview</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Reels", value: reels.total },
                  { label: "Active", value: reels.active },
                  { label: "Boosted", value: reels.boosted },
                  { label: "Total Views", value: reels.engagement?.totalViews ?? 0 },
                  { label: "Total Likes", value: reels.engagement?.totalLikes ?? 0 },
                  { label: "Total Saves", value: reels.engagement?.totalSaves ?? 0 },
                  { label: "Total Comments", value: reels.engagement?.totalComments ?? 0 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/5 rounded-xl p-4 text-center border border-white/10"
                  >
                    <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                    <p className="text-white text-xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
