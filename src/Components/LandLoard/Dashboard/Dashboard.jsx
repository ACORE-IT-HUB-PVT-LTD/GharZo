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
    if (!sidebar) return undefined;

    const enter = () => setIsSidebarHovered(true);
    const leave = () => setIsSidebarHovered(false);

    sidebar.addEventListener("mouseenter", enter);
    sidebar.addEventListener("mouseleave", leave);

    return () => {
      sidebar.removeEventListener("mouseenter", enter);
      sidebar.removeEventListener("mouseleave", leave);
    };
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
  }, [token]);

  const ov = overview?.overview || {};
  const rooms = overview?.rooms || {};
  const tenancies = overview?.tenancies || {};
  const rent = overview?.rentCollection || {};
  const complaints = overview?.complaints || {};
  const reels = overview?.reels || {};

  const totalComplaints = (complaints.byStatus || []).reduce((sum, c) => sum + c.count, 0);

  const complaintPieData = (complaints.byStatus || []).map((c) => ({
    name: c._id,
    value: c.count,
  }));

  const monthlyBreakdown = financial?.monthlyBreakdown || [];
  const hasMonthly = monthlyBreakdown.length > 0;

  const revBreakdown = financial?.revenue?.breakdown || {};
  const revPieData = Object.entries(revBreakdown)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
    }));

  const PIE_COLORS = ["#E07B1A", "#1B2A4A", "#f5a623", "#243660", "#ff9d3f", "#0d1f36"];
  const COMPLAINT_COLORS = ["#E07B1A", "#1B2A4A", "#f5a623", "#22c55e", "#3b82f6", "#8b5cf6"];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.06, duration: 0.35 },
    }),
  };

  // Card configs with alternating orange / navy accent
  const stats = [
    {
      icon: FaBuilding,
      title: "Total Properties",
      value: ov.totalProperties ?? overview?.properties?.total ?? 0,
      accent: "#E07B1A",
      bg: "linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)",
      border: "#E07B1A33",
    },
    {
      icon: FaBed,
      title: "Total Rooms",
      value: rooms.total ?? ov.totalRooms ?? 0,
      accent: "#1B2A4A",
      bg: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)",
      border: "#1B2A4A22",
    },
    {
      icon: FaUsers,
      title: "Active Tenants",
      value: ov.activeTenants ?? tenancies.active ?? 0,
      accent: "#E07B1A",
      bg: "linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)",
      border: "#E07B1A33",
    },
    {
      icon: FaPercent,
      title: "Occupancy Rate",
      value: `${ov.occupancyRate ?? 0}%`,
      accent: "#1B2A4A",
      bg: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)",
      border: "#1B2A4A22",
    },
    {
      icon: FaBed,
      title: "Available Beds",
      value: ov.availableBeds ?? rooms.available ?? 0,
      accent: "#E07B1A",
      bg: "linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)",
      border: "#E07B1A33",
    },
    {
      icon: FaRupeeSign,
      title: "Rent Collected",
      value: `Rs ${(rent.collected ?? 0).toLocaleString("en-IN")}`,
      accent: "#16a34a",
      bg: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
      border: "#16a34a22",
    },
    {
      icon: FaRupeeSign,
      title: "Rent Pending",
      value: `Rs ${(rent.pending ?? 0).toLocaleString("en-IN")}`,
      accent: "#dc2626",
      bg: "linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)",
      border: "#dc262622",
    },
    {
      icon: FaExclamationTriangle,
      title: "Total Complaints",
      value: totalComplaints,
      accent: "#E07B1A",
      bg: "linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)",
      border: "#E07B1A33",
    },
    {
      icon: FaVideo,
      title: "Total Reels",
      value: reels.total ?? 0,
      accent: "#1B2A4A",
      bg: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)",
      border: "#1B2A4A22",
    },
    {
      icon: FaCheckCircle,
      title: "Active Reels",
      value: reels.active ?? 0,
      accent: "#E07B1A",
      bg: "linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)",
      border: "#E07B1A33",
    },
    {
      icon: FaCheckCircle,
      title: "Total Tenancies",
      value: tenancies.total ?? ov.totalTenancies ?? 0,
      accent: "#1B2A4A",
      bg: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)",
      border: "#1B2A4A22",
    },
    {
      icon: FaBuilding,
      title: "Total Capacity",
      value: ov.totalCapacity ?? rooms.capacity ?? 0,
      accent: "#E07B1A",
      bg: "linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)",
      border: "#E07B1A33",
    },
  ];

  const chartTooltipStyle = {
    backgroundColor: "#1B2A4A",
    border: "1px solid rgba(224,123,26,0.3)",
    borderRadius: "10px",
    color: "#fff",
  };

  return (
    <div
      className={`px-4 sm:px-8 lg:px-12 py-8 mx-auto w-full min-h-screen transition-all duration-500 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ background: "#ffffff" }}
    >
      {/* Header */}
      <motion.div
        className="mb-10"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-1 h-10 rounded-full"
            style={{ background: "linear-gradient(180deg, #E07B1A, #1B2A4A)" }}
          />
          <div>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: "#1B2A4A" }}>
              Landlord Dashboard
            </h2>
            <p className="text-sm text-slate-400 font-medium tracking-wide mt-0.5">
              Welcome back — here's your property overview
            </p>
          </div>
        </div>
        {/* Orange underline accent */}
        <div
          className="mt-4 h-[2px] w-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #E07B1A 0%, #1B2A4A 40%, transparent 100%)",
          }}
        />
      </motion.div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div
            className="w-14 h-14 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#E07B1A", borderTopColor: "transparent" }}
          />
          <p className="text-slate-400 font-medium text-sm">Loading dashboard data...</p>
        </div>
      )}

      {error && (
        <div
          className="text-center py-6 px-8 mb-8 rounded-2xl border"
          style={{
            background: "linear-gradient(135deg, #fff5f5, #fff)",
            borderColor: "#fca5a5",
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={`${stat.title}-${index}`}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5, boxShadow: `0 12px 30px ${stat.accent}22` }}
                  className="rounded-2xl p-5 transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: stat.bg,
                    border: `1.5px solid ${stat.border}`,
                    boxShadow: "0 2px 12px rgba(27,42,74,0.06)",
                  }}
                >
                  {/* Decorative corner accent */}
                  <div
                    className="absolute top-0 right-0 w-16 h-16 rounded-bl-[40px] opacity-[0.07]"
                    style={{ background: stat.accent }}
                  />
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ background: `${stat.accent}18`, border: `1px solid ${stat.accent}30` }}
                    >
                      <Icon size={18} style={{ color: stat.accent }} />
                    </div>
                    <span
                      className="text-[11px] font-semibold text-right leading-tight max-w-[110px]"
                      style={{ color: "#64748b" }}
                    >
                      {stat.title}
                    </span>
                  </div>
                  <h3
                    className="text-2xl font-black tracking-tight"
                    style={{ color: "#1B2A4A" }}
                  >
                    {stat.value}
                  </h3>
                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-0 h-[3px] w-1/3 rounded-r-full"
                    style={{ background: stat.accent }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Complaints Pie */}
            <motion.div
              className="rounded-2xl p-6"
              style={{
                background: "#ffffff",
                border: "1.5px solid #e8edf5",
                boxShadow: "0 2px 16px rgba(27,42,74,0.07)",
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ background: "linear-gradient(180deg, #E07B1A, #1B2A4A)" }}
                />
                <h5 className="text-lg font-bold" style={{ color: "#1B2A4A" }}>
                  Complaints by Status
                </h5>
              </div>
              {complaintPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend iconType="circle" wrapperStyle={{ color: "#475569", fontSize: "13px" }} />
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
                    >
                      {complaintPieData.map((_, index) => (
                        <Cell key={`complaint-${index}`} fill={COMPLAINT_COLORS[index % COMPLAINT_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
                  No complaint data available
                </div>
              )}
            </motion.div>

            {/* Rooms Bar Chart */}
            <motion.div
              className="rounded-2xl p-6"
              style={{
                background: "#ffffff",
                border: "1.5px solid #e8edf5",
                boxShadow: "0 2px 16px rgba(27,42,74,0.07)",
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ background: "linear-gradient(180deg, #1B2A4A, #E07B1A)" }}
                />
                <h5 className="text-lg font-bold" style={{ color: "#1B2A4A" }}>
                  Rooms Overview
                </h5>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { label: "Total", value: rooms.total ?? ov.totalRooms ?? 0 },
                    { label: "Capacity", value: rooms.capacity ?? ov.totalCapacity ?? 0 },
                    { label: "Occupied", value: rooms.occupied ?? ov.currentOccupancy ?? 0 },
                    { label: "Available", value: rooms.available ?? ov.availableBeds ?? 0 },
                  ]}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,42,74,0.06)" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 13 }} axisLine={{ stroke: "rgba(27,42,74,0.12)" }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(27,42,74,0.12)" }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {["#E07B1A", "#1B2A4A", "#f5a623", "#243660"].map((color, i) => (
                      <Cell key={`room-color-${i}`} fill={color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Financial Summary */}
          <motion.div
            className="rounded-2xl p-6 mb-6"
            style={{
              background: "#ffffff",
              border: "1.5px solid #e8edf5",
              boxShadow: "0 2px 16px rgba(27,42,74,0.07)",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ background: "linear-gradient(180deg, #E07B1A, #1B2A4A)" }}
                />
                <h5 className="text-lg font-bold" style={{ color: "#1B2A4A" }}>
                  Financial Summary — {financial?.period?.year ?? new Date().getFullYear()}
                </h5>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div
                  className="text-center px-4 py-2 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #fff8f0, #fff)", border: "1px solid #E07B1A33" }}
                >
                  <p className="text-[11px] text-slate-400 font-medium">Total Revenue</p>
                  <p className="text-lg font-black" style={{ color: "#E07B1A" }}>
                    Rs {(financial?.revenue?.total ?? 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div
                  className="text-center px-4 py-2 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #fff5f5, #fff)", border: "1px solid #dc262622" }}
                >
                  <p className="text-[11px] text-slate-400 font-medium">Pending</p>
                  <p className="text-lg font-black text-red-500">
                    Rs {(financial?.pending?.amount ?? 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div
                  className="text-center px-4 py-2 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #f0fdf4, #fff)", border: "1px solid #16a34a22" }}
                >
                  <p className="text-[11px] text-slate-400 font-medium">Collection Rate</p>
                  <p className="text-lg font-black text-green-600">
                    {financial?.collectionRate ?? 0}%
                  </p>
                </div>
              </div>
            </div>

            {hasMonthly ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,42,74,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(27,42,74,0.12)" }} />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(27,42,74,0.12)" }}
                    tickFormatter={(value) => `Rs ${value}`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => `Rs ${value.toLocaleString("en-IN")}`}
                  />
                  <Legend wrapperStyle={{ color: "#64748b", fontSize: "13px" }} />
                  <Bar dataKey="collected" name="Collected" fill="#E07B1A" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#1B2A4A" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px] gap-3">
                <div className="text-slate-400 text-sm">No monthly financial data for this period.</div>
                {revPieData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ color: "#64748b", fontSize: "13px" }} />
                      <Pie data={revPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                        {revPieData.map((_, index) => (
                          <Cell key={`revenue-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </motion.div>

          {/* Reels Overview */}
          {reels.total > 0 && (
            <motion.div
              className="rounded-2xl p-6"
              style={{
                background: "#ffffff",
                border: "1.5px solid #e8edf5",
                boxShadow: "0 2px 16px rgba(27,42,74,0.07)",
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ background: "linear-gradient(180deg, #E07B1A, #1B2A4A)" }}
                />
                <h5 className="text-lg font-bold" style={{ color: "#1B2A4A" }}>
                  Reels Overview
                </h5>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Reels", value: reels.total, accent: "#E07B1A" },
                  { label: "Active", value: reels.active, accent: "#1B2A4A" },
                  { label: "Boosted", value: reels.boosted, accent: "#E07B1A" },
                  { label: "Total Views", value: reels.engagement?.totalViews ?? 0, accent: "#1B2A4A" },
                  { label: "Total Likes", value: reels.engagement?.totalLikes ?? 0, accent: "#E07B1A" },
                  { label: "Total Saves", value: reels.engagement?.totalSaves ?? 0, accent: "#1B2A4A" },
                  { label: "Total Comments", value: reels.engagement?.totalComments ?? 0, accent: "#E07B1A" },
                ].map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className="rounded-xl p-4 text-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${item.accent}08, #ffffff)`,
                      border: `1.5px solid ${item.accent}22`,
                    }}
                  >
                    <div
                      className="absolute bottom-0 left-0 h-[3px] w-full"
                      style={{ background: `linear-gradient(90deg, ${item.accent}, transparent)` }}
                    />
                    <p className="text-[11px] font-semibold text-slate-400 mb-1">{item.label}</p>
                    <p className="text-2xl font-black" style={{ color: "#1B2A4A" }}>{item.value}</p>
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