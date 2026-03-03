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

  const PIE_COLORS = ["#f57c00", "#ff9d3f", "#ffb87a", "#e65100", "#ffa726", "#ef6c00"];
  const COMPLAINT_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.06, duration: 0.35 },
    }),
  };

  const stats = [
    {
      icon: FaBuilding,
      title: "Total Properties",
      value: ov.totalProperties ?? overview?.properties?.total ?? 0,
      color: "#f57c00",
    },
    {
      icon: FaBed,
      title: "Total Rooms",
      value: rooms.total ?? ov.totalRooms ?? 0,
      color: "#ff9d3f",
    },
    {
      icon: FaUsers,
      title: "Active Tenants",
      value: ov.activeTenants ?? tenancies.active ?? 0,
      color: "#f57c00",
    },
    {
      icon: FaPercent,
      title: "Occupancy Rate",
      value: `${ov.occupancyRate ?? 0}%`,
      color: "#ff9d3f",
    },
    {
      icon: FaBed,
      title: "Available Beds",
      value: ov.availableBeds ?? rooms.available ?? 0,
      color: "#f57c00",
    },
    {
      icon: FaRupeeSign,
      title: "Rent Collected",
      value: `Rs ${(rent.collected ?? 0).toLocaleString("en-IN")}`,
      color: "#ff9d3f",
    },
    {
      icon: FaRupeeSign,
      title: "Rent Pending",
      value: `Rs ${(rent.pending ?? 0).toLocaleString("en-IN")}`,
      color: "#f57c00",
    },
    {
      icon: FaExclamationTriangle,
      title: "Total Complaints",
      value: totalComplaints,
      color: "#ff9d3f",
    },
    {
      icon: FaVideo,
      title: "Total Reels",
      value: reels.total ?? 0,
      color: "#f57c00",
    },
    {
      icon: FaCheckCircle,
      title: "Active Reels",
      value: reels.active ?? 0,
      color: "#ff9d3f",
    },
    {
      icon: FaCheckCircle,
      title: "Total Tenancies",
      value: tenancies.total ?? ov.totalTenancies ?? 0,
      color: "#f57c00",
    },
    {
      icon: FaBuilding,
      title: "Total Capacity",
      value: ov.totalCapacity ?? rooms.capacity ?? 0,
      color: "#ff9d3f",
    },
  ];

  return (
    <div
      className={`px-4 sm:px-8 lg:px-12 py-8 mx-auto w-full min-h-screen transition-all duration-500 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background:
          "radial-gradient(circle at 12% 18%, rgba(245, 124, 0, 0.08), transparent 35%), radial-gradient(circle at 88% 82%, rgba(13, 47, 82, 0.08), transparent 32%), #f8fafc",
      }}
    >
      <motion.h2
        className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-8 text-[#0d2f52]"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Landlord Dashboard
      </motion.h2>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center text-red-700 bg-red-50 rounded-xl py-6 px-8 mb-8 border border-red-200">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={`${stat.title}-${index}`}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-md p-5 border border-slate-200 hover:border-orange-300 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl" style={{ background: `${stat.color}22` }}>
                      <Icon className="text-2xl" style={{ color: stat.color }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 text-right leading-tight max-w-[100px]">{stat.title}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0d2f52] mt-1">{stat.value}</h3>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              className="bg-white rounded-2xl shadow-md p-6 border border-slate-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h5 className="text-xl font-bold mb-6 text-[#0d2f52] text-center">Complaints by Status</h5>
              {complaintPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0d2f52",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
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
                <div className="flex items-center justify-center h-[300px] text-slate-500">No complaint data available</div>
              )}
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow-md p-6 border border-slate-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <h5 className="text-xl font-bold mb-6 text-[#0d2f52] text-center">Rooms Overview</h5>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                  <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 13 }} axisLine={{ stroke: "rgba(15,23,42,0.15)" }} />
                  <YAxis tick={{ fill: "#475569", fontSize: 12 }} axisLine={{ stroke: "rgba(15,23,42,0.15)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d2f52",
                      border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {["#f57c00", "#ff9d3f", "#e65100", "#ffa726"].map((color, i) => (
                      <Cell key={`room-color-${i}`} fill={color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div
            className="bg-white rounded-2xl shadow-md p-6 border border-slate-200 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h5 className="text-xl font-bold text-[#0d2f52]">Financial Summary - {financial?.period?.year ?? new Date().getFullYear()}</h5>
              <div className="flex gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Total Revenue</p>
                  <p className="text-lg font-bold text-orange-500">Rs {(financial?.revenue?.total ?? 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="text-lg font-bold text-red-500">Rs {(financial?.pending?.amount ?? 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Collection Rate</p>
                  <p className="text-lg font-bold text-green-600">{financial?.collectionRate ?? 0}%</p>
                </div>
              </div>
            </div>

            {hasMonthly ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 12 }} axisLine={{ stroke: "rgba(15,23,42,0.15)" }} />
                  <YAxis
                    tick={{ fill: "#475569", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(15,23,42,0.15)" }}
                    tickFormatter={(value) => `Rs ${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d2f52",
                      border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    formatter={(value) => `Rs ${value.toLocaleString("en-IN")}`}
                  />
                  <Legend wrapperStyle={{ color: "#475569", fontSize: "13px" }} />
                  <Bar dataKey="collected" name="Collected" fill="#f57c00" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px] gap-3">
                <div className="text-slate-500 text-sm">No monthly financial data for this period.</div>
                {revPieData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0d2f52",
                          border: "1px solid rgba(255,255,255,0.25)",
                          borderRadius: "10px",
                          color: "#fff",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#475569", fontSize: "13px" }} />
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

          {reels.total > 0 && (
            <motion.div
              className="bg-white rounded-2xl shadow-md p-6 border border-slate-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <h5 className="text-xl font-bold mb-6 text-[#0d2f52] text-center">Reels Overview</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Reels", value: reels.total },
                  { label: "Active", value: reels.active },
                  { label: "Boosted", value: reels.boosted },
                  { label: "Total Views", value: reels.engagement?.totalViews ?? 0 },
                  { label: "Total Likes", value: reels.engagement?.totalLikes ?? 0 },
                  { label: "Total Saves", value: reels.engagement?.totalSaves ?? 0 },
                  { label: "Total Comments", value: reels.engagement?.totalComments ?? 0 },
                ].map((item, index) => (
                  <div key={`${item.label}-${index}`} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                    <p className="text-slate-500 text-xs mb-1">{item.label}</p>
                    <p className="text-[#0d2f52] text-xl font-bold">{item.value}</p>
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
