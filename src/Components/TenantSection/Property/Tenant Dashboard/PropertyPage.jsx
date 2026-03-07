import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Bed, MapPin, DollarSign, Calendar, Building2, ArrowRight,
  Shield, CheckCircle, ChevronRight, TrendingUp, AlertTriangle,
  Phone, Mail, Key, RefreshCw, Clock, FileText, User, Wifi,
  Car, Dumbbell, Star, AlertCircle, Heart
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../User_Section/Context/AuthContext";

// ─── Token helper ─────────────────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem("tenanttoken") ||
  localStorage.getItem("usertoken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const inr = (n) => (n != null ? "₹" + Number(n).toLocaleString("en-IN") : "₹0");

const daysLeft = (endDate) => {
  if (!endDate) return 0;
  return Math.max(0, Math.ceil((new Date(endDate) - new Date()) / 86400000));
};

// ─── Status config ─────────────────────────────────────────────────────────────
const statusConfig = {
  "active":           { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#22c55e",  label: "Active"           },
  "notice-period":    { bg: "#fffbeb", color: "#b45309", border: "#fde68a", dot: "#f59e0b",  label: "Notice Period"    },
  "pending-approval": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6",  label: "Pending Approval" },
  "terminated":       { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", dot: "#ef4444",  label: "Terminated"       },
  "expired":          { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", dot: "#94a3b8",  label: "Expired"          },
};
const getStatus = (s) => statusConfig[(s || "").toLowerCase()] || statusConfig["pending-approval"];

export default function PropertyPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [tenancies, setTenancies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selected, setSelected]   = useState(0);
  const [favorites, setFavorites] = useState([]);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("Authentication required. Please login.");
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }
    try {
      const res = await fetch("https://api.gharzoreality.com/api/tenancies/tenant/my-tenancies", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setTenancies(data.data);
      } else {
        setError(data.message || "No tenancy data found.");
      }
    } catch (e) {
      setError("Failed to load. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleFav = (id) =>
    setFavorites((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600"
      />
      <p className="mt-6 text-lg font-semibold text-gray-600">Loading your properties...</p>
    </div>
  );

  // ─── Error ────────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center border border-gray-100"
      >
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={36} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Oops!</h3>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </motion.div>
    </div>
  );

  // ─── Derived ──────────────────────────────────────────────────────────────────
  const t          = tenancies[selected];
  const financials = t?.financials;
  const agreement  = t?.agreement;
  const landlord   = t?.landlordId;
  const notice     = t?.notice;
  const tenantInfo = t?.tenantInfo;
  const roomId     = t?.roomId;
  const property   = t?.propertyId;
  const sc         = getStatus(t?.status);

  const totalRent = tenancies.reduce((s, x) => s + (x.financials?.monthlyRent || 0), 0);

  // ─── Main UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 sm:px-10 py-5 rounded-2xl shadow-md mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Properties
              </h1>
              <p className="text-gray-500 mt-1 text-sm">Your tenancy details at a glance</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition self-start sm:self-auto"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: "Total Tenancies", value: tenancies.length, icon: <Building2 size={26} className="text-white" />, grad: "from-blue-500 to-indigo-600", sub: "All properties" },
              { label: "Active Tenancies", value: tenancies.filter(x => x.status?.toLowerCase() === "active").length, icon: <CheckCircle size={26} className="text-white" />, grad: "from-emerald-500 to-green-600", sub: "Currently active" },
              { label: "Total Monthly Rent", value: inr(totalRent), icon: <DollarSign size={26} className="text-white" />, grad: "from-rose-500 to-orange-500", sub: "Across all tenancies" },
            ].map((s, i) => (
              <motion.div key={i} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 250 }}
                className="relative rounded-2xl p-[1.5px] shadow-lg"
                style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${s.grad} opacity-90`} style={{ borderRadius: 'inherit' }} />
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-5 h-full flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-md flex-shrink-0`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{s.label}</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Tenancy Switcher ── */}
        {tenancies.length > 1 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
            {tenancies.map((ten, i) => {
              const s = getStatus(ten.status);
              return (
                <button key={ten._id} onClick={() => setSelected(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all ${
                    i === selected
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot }} />
                  Room #{ten.roomId?.roomNumber || i + 1}
                  <span style={{ background: i === selected ? "rgba(255,255,255,0.2)" : "#f1f5f9", color: i === selected ? "#fff" : "#64748b", borderRadius: 99, padding: "1px 7px", fontSize: 11 }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Notice Alert ── */}
        <AnimatePresence>
          {notice?.isUnderNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-start gap-4"
            >
              <AlertTriangle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-amber-800 mb-2">⚠️ Notice Issued</p>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {[["Given By", notice.noticeGivenBy], ["Notice Date", fmt(notice.noticeDate)], ["Vacate By", fmt(notice.vacateByDate)]].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-xs font-bold text-amber-700">{l}</p>
                      <p className="text-sm font-bold text-amber-900">{v || "—"}</p>
                    </div>
                  ))}
                </div>
                {notice.reason && <p className="text-xs text-amber-600 mt-2">Reason: {notice.reason}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Property + Financials + Agreement ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Property Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              {/* Image / Hero */}
              {property?.images?.[0]?.url ? (
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img src={property.images[0].url} alt="Property" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <div style={{ ...{ background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}` }, borderRadius: 99, padding: "3px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot }} />
                      <span className="text-xs font-bold">{sc.label}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleFav(t._id)} className="absolute top-4 right-4 p-2 rounded-full bg-white/90 shadow-md">
                    <Heart size={18} className={favorites.includes(t._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
                  </button>
                </div>
              ) : (
                <div className="h-36 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-between px-6 relative">
                  <div>
                    <div style={{ background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`, borderRadius: 99, padding: "3px 12px", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot }} />
                      <span className="text-xs font-bold">{sc.label}</span>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-800">Room #{roomId?.roomNumber || "—"}</p>
                    <p className="text-sm text-gray-500">{roomId?.roomType || "—"}</p>
                  </div>
                  <Building2 size={72} className="text-blue-200 opacity-60" />
                  <button onClick={() => toggleFav(t._id)} className="absolute top-4 right-4 p-2 rounded-full bg-white/80 shadow-md">
                    <Heart size={18} className={favorites.includes(t._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
                  </button>
                </div>
              )}

              <div className="p-5 sm:p-6">
                {/* Room + Bed info chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { icon: <Key size={12} className="text-purple-600" />, text: `Room #${roomId?.roomNumber || "—"}`, bg: "bg-purple-50 text-purple-700 border-purple-200" },
                    { icon: <Building2 size={12} className="text-blue-600" />, text: roomId?.roomType || "—", bg: "bg-blue-50 text-blue-700 border-blue-200" },
                    { icon: <Bed size={12} className="text-orange-600" />, text: `Bed: ${t?.bedNumber ?? "—"}`, bg: "bg-orange-50 text-orange-700 border-orange-200" },
                  ].map(({ icon, text, bg }, i) => (
                    <span key={i} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${bg}`}>
                      {icon} {text}
                    </span>
                  ))}
                </div>

                {/* Tenancy meta */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Tenancy Since", value: fmt(t?.createdAt), icon: <Calendar size={15} className="text-blue-500" /> },
                    { label: "Agreement Start", value: fmt(agreement?.startDate), icon: <Calendar size={15} className="text-green-500" /> },
                    { label: "Agreement End", value: fmt(agreement?.endDate), icon: <Calendar size={15} className="text-red-400" /> },
                    { label: "Days Remaining", value: daysLeft(agreement?.endDate), icon: <Clock size={15} className="text-purple-500" /> },
                    { label: "Duration", value: `${agreement?.durationMonths || "—"} months`, icon: <FileText size={15} className="text-indigo-500" /> },
                    { label: "Auto Renew", value: agreement?.autoRenew ? "Yes" : "No", icon: <RefreshCw size={15} className="text-teal-500" /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs text-gray-500 font-semibold">{label}</span></div>
                      <p className="font-bold text-gray-800 text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Financial Summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <DollarSign size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Financial Summary</h3>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Monthly Rent",       sub: `Due on ${financials?.rentDueDay || "—"}th`,          val: inr(financials?.monthlyRent),        color: "#16a34a", bg: "#f0fdf4" },
                  { label: "Maintenance Charge", sub: "Monthly",                                             val: inr(financials?.maintenanceCharges), color: "#7c3aed", bg: "#faf5ff" },
                  { label: "Security Deposit",   sub: financials?.securityDepositPaid ? "✓ Paid" : "Unpaid", val: inr(financials?.securityDeposit),    color: "#0369a1", bg: "#eff6ff" },
                  { label: "Late Fee",           sub: `Grace: ${financials?.gracePeriodDays || 0} days`,     val: `${inr(financials?.lateFeePerDay)}/day`, color: "#dc2626", bg: "#fef2f2" },
                ].map(({ label, sub, val, color, bg }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl px-4 py-3 border border-gray-100" style={{ background: bg }}>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{label}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                    <p className="text-xl font-extrabold" style={{ color }}>{val}</p>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-dashed border-gray-200">
                  <p className="font-bold text-gray-800">Total Monthly Outgoing</p>
                  <p className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {inr((financials?.monthlyRent || 0) + (financials?.maintenanceCharges || 0))}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Agreement Details */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <FileText size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Agreement Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-2">Duration</p>
                  <p className="text-3xl font-black text-blue-700">{agreement?.durationMonths || "—"} <span className="text-base font-semibold">months</span></p>
                  <p className="text-xs text-gray-500 mt-2">{fmt(agreement?.startDate)} → {fmt(agreement?.endDate)}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-2">Renewal</p>
                  <p className="text-3xl font-black text-purple-700">{agreement?.renewalOption ? "✓ Yes" : "✗ No"}</p>
                  <p className="text-xs text-gray-500 mt-2">Auto Renew: {agreement?.autoRenew ? "Enabled" : "Disabled"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl p-3 border text-center ${agreement?.signedByTenant ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Tenant Signed</p>
                  <p className={`font-bold text-sm ${agreement?.signedByTenant ? "text-green-700" : "text-gray-400"}`}>
                    {agreement?.signedByTenant ? "✓ Yes" : "✗ Pending"}
                  </p>
                </div>
                <div className={`rounded-xl p-3 border text-center ${agreement?.signedByLandlord ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Landlord Signed</p>
                  <p className={`font-bold text-sm ${agreement?.signedByLandlord ? "text-green-700" : "text-gray-400"}`}>
                    {agreement?.signedByLandlord ? "✓ Yes" : "✗ Pending"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-6">

            {/* Landlord Card */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <User size={17} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800">Landlord</h3>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {(landlord?.name || "L")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{landlord?.name || "—"}</p>
                  <p className="text-xs text-gray-500">Property Owner</p>
                </div>
              </div>

              <div className="space-y-2">
                {landlord?.phone && (
                  <a href={`tel:${landlord.phone}`} className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 hover:bg-blue-100 transition group">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Phone size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-bold">Call</p>
                      <p className="font-bold text-blue-700 text-sm">{landlord.phone}</p>
                    </div>
                    <ChevronRight size={15} className="text-blue-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
                {landlord?.email && (
                  <a href={`mailto:${landlord.email}`} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 hover:bg-green-100 transition group">
                    <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Mail size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-bold">Email</p>
                      <p className="font-bold text-green-700 text-sm truncate max-w-[150px]">{landlord.email}</p>
                    </div>
                    <ChevronRight size={15} className="text-green-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            </motion.div>

            {/* Tenant Info */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Shield size={17} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800">Tenant Info</h3>
              </div>

              <div className="space-y-2 text-sm">
                {tenantInfo?.idProof?.type && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">ID Proof</span>
                    <span className="font-bold text-gray-800">{tenantInfo.idProof.type}</span>
                  </div>
                )}
                {tenantInfo?.employmentDetails?.type && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Employment</span>
                    <span className="font-bold text-gray-800">{tenantInfo.employmentDetails.type}</span>
                  </div>
                )}
                {tenantInfo?.emergencyContact?.relation && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Emergency</span>
                    <span className="font-bold text-gray-800">{tenantInfo.emergencyContact.name || tenantInfo.emergencyContact.relation}</span>
                  </div>
                )}
                {tenantInfo?.emergencyContact?.phone && (
                  <a href={`tel:${tenantInfo.emergencyContact.phone}`} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Em. Phone</span>
                    <span className="font-bold text-blue-600">{tenantInfo.emergencyContact.phone}</span>
                  </a>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500 font-medium">Police Verified</span>
                  <span className={`font-bold ${tenantInfo?.policeVerification?.done ? "text-green-600" : "text-gray-400"}`}>
                    {tenantInfo?.policeVerification?.done ? "✓ Done" : "Pending"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Notice Period Info */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                  <Clock size={17} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800">Notice Info</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Notice Period</span>
                  <span className="font-bold text-gray-800">{notice?.noticePeriodDays || "—"} days</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Under Notice</span>
                  <span className={`font-bold ${notice?.isUnderNotice ? "text-amber-600" : "text-green-600"}`}>
                    {notice?.isUnderNotice ? "⚠️ Yes" : "✓ No"}
                  </span>
                </div>
                {notice?.isUnderNotice && (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Given By</span>
                      <span className="font-bold text-gray-800">{notice.noticeGivenBy || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Vacate By</span>
                      <span className="font-bold text-red-600">{fmt(notice.vacateByDate)}</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Renewal Reminders */}
            {t?.renewalReminders && (
              <motion.div
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                    <RefreshCw size={17} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800">Renewal Reminders</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ["30 Days (Landlord)", t.renewalReminders.landlord30Days?.sent],
                    ["15 Days (Tenant)",   t.renewalReminders.tenant15Days?.sent],
                    ["7 Days (Both)",      t.renewalReminders.both7Days?.sent],
                  ].map(([label, sent]) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sent ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {sent ? "Sent" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Shield size={18} className="text-blue-500" />
            All property data is secured and encrypted
          </div>
          <Link
            to="/tenant"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition hover:-translate-y-0.5 text-sm"
          >
            ⬅ Back to Dashboard <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}