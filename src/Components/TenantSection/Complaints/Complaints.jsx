import React, { useMemo, useState, useEffect } from "react";
import { 
  AlertCircle, 
  Send, 
  Clock, 
  Search, 
  AlertTriangle, 
  Bell, 
  Home, 
  FileText, 
  Zap, 
  CheckCircle,
  XCircle,
  Download,
  Eye,
  MessageSquare,
  Shield,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Calendar,
  User,
  Building2,
  MapPin,
  Hash,
  Droplet,
  Lightbulb,
  Wrench,
  Package,
  Phone,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced status colors with gradients
const statusColors = {
  Pending: "bg-gradient-to-r from-rose-400 to-pink-500",
  Accepted: "bg-gradient-to-r from-blue-400 to-cyan-500",
  "In Progress": "bg-gradient-to-r from-amber-400 to-orange-500",
  InProgress: "bg-gradient-to-r from-amber-400 to-orange-500",
  Resolved: "bg-gradient-to-r from-emerald-400 to-green-500",
  Rejected: "bg-gradient-to-r from-gray-400 to-gray-500",
  Completed: "bg-gradient-to-r from-emerald-400 to-green-500",
};

const statusClass = {
  Pending: "bg-rose-50 text-rose-700 border-rose-200",
  Accepted: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  InProgress: "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-gray-50 text-gray-700 border-gray-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityClass = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-indigo-100 text-indigo-700 border-indigo-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
};

const categoryIcons = {
  Plumbing: Droplet,
  Electrical: Lightbulb,
  Maintenance: Wrench,
  Cleaning: Sparkles,
  Other: Package
};

export default function TenantComplaints() {
  const token = localStorage.getItem("usertoken");
  const [complaints, setComplaints] = useState([]);
  const [tenancyData, setTenancyData] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedComplaint, setExpandedComplaint] = useState(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({ id: "", otp: "", message: "" });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0
  });

  // Form state
  const [form, setForm] = useState({
    title: "",
    category: "Plumbing",
    priority: "Low",
    description: "",
  });

  // Fetch tenancy data to get tenancyId and property details
  const fetchTenancyData = async () => {
    if (!token) {
      setError("Authentication token missing.");
      return;
    }

    try {
      const res = await fetch("https://api.gharzoreality.com/api/tenancies/tenant/my-tenancies", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) throw new Error("Failed to fetch tenancy data");

      const data = await res.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setTenancyData(data.data[0]);
      } else {
        setError("No active tenancy found");
      }
    } catch (err) {
      setError(`Tenancy Error: ${err.message}`);
    }
  };

  // Fetch complaints
  const fetchComplaints = async (status = "") => {
    if (!token) return;

    try {
      setRefreshing(true);
      setError(null);
      
      const url = status && status !== "All" 
        ? `https://api.gharzoreality.com/api/complaints/tenant/my-complaints?status=${status}`
        : "https://api.gharzoreality.com/api/complaints/tenant/my-complaints";

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch complaints");
      }

      const data = await res.json();
      
      if (data.success) {
        const complaintsData = data.data || [];
        setComplaints(complaintsData);

        // Calculate stats
        const stats = {
          total: complaintsData.length,
          pending: complaintsData.filter(c => c.status === 'Pending').length,
          resolved: complaintsData.filter(c => c.status === 'Resolved' || c.status === 'Completed').length,
          inProgress: complaintsData.filter(c => c.status === 'In Progress' || c.status === 'InProgress' || c.status === 'Accepted').length
        };
        setStats(stats);
      }
    } catch (err) {
      setError(`Complaints: ${err.message}`);
      setComplaints([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenancyData();
  }, [token]);

  useEffect(() => {
    if (tenancyData) {
      fetchComplaints();
    }
  }, [token, tenancyData]);

  // Filtering
  const filtered = useMemo(() => {
    return (complaints || []).filter((c) => {
      const q = query.toLowerCase();
      const matchesQ =
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.complaintNumber?.toLowerCase().includes(q);
      const matchesFilter = filter === "All" || c.status === filter;
      const matchesPriority = priorityFilter === "All" || c.priority === priorityFilter;
      return matchesQ && matchesFilter && matchesPriority;
    });
  }, [complaints, query, filter, priorityFilter]);

  // Submit complaint
  const raiseComplaint = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      setError("Title and description are required.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!tenancyData) {
      setError("Tenancy information missing. Please refresh the page.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const body = {
        tenancyId: tenancyData._id,
        category: form.category,
        title: title,
        description: description,
        priority: form.priority,
      };

      const res = await fetch("https://api.gharzoreality.com/api/complaints/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit complaint");
      }

      if (data.data && data.data.complaint) {
        // Refresh complaints list
        await fetchComplaints();

        // Show success dialog with OTP
        setDialogData({
          id: data.data.complaint.complaintNumber,
          otp: data.data.otp.code,
          message: data.data.otp.message || "Save this OTP for verification"
        });
        setDialogOpen(true);

        // Reset form
        setForm({
          title: "",
          category: "Plumbing",
          priority: "Low",
          description: "",
        });
      }
    } catch (err) {
      setError(`Submit failed: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single complaint details
  const viewComplaintDetails = async (complaintId) => {
    try {
      const res = await fetch(
        `https://api.gharzoreality.com/api/complaints/tenant/${complaintId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch complaint details");

      const data = await res.json();
      
      if (data.success) {
        setExpandedComplaint(expandedComplaint === complaintId ? null : complaintId);
      }
    } catch (err) {
      setError(`Details: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading && !tenancyData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20"></div>
          <div className="absolute inset-4 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Loader2 className="text-blue-500 animate-spin" size={32} />
          </div>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-xl font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          Loading your complaints...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-3 sm:p-5 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 lg:mb-8"
        >
          <div className="flex flex-col bg-white py-4 px-4 sm:px-6 rounded-2xl shadow-xl border border-gray-100 lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Complaints Management
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Report and track issues with your property</p>
              {tenancyData && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Building2 size={14} />
                    {tenancyData.propertyId?.title}
                  </span>
                  <span className="flex items-center gap-1">
                    <Home size={14} />
                    Room {tenancyData.roomId?.roomNumber}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchComplaints()}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-sm sm:text-base"
              >
                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                <span className="font-medium hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-blue-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-blue-600 text-xs sm:text-sm font-medium">Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{stats.total}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <AlertCircle className="text-white" size={20} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-amber-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-100 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-amber-600 text-xs sm:text-sm font-medium">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Clock className="text-white" size={20} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-purple-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-100 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-600 text-xs sm:text-sm font-medium">Active</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{stats.inProgress}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="text-white" size={20} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-emerald-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-emerald-600 text-xs sm:text-sm font-medium">Resolved</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{stats.resolved}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                  <CheckCircle className="text-white" size={20} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - New Complaint Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="p-2 sm:p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white shadow-lg"
                  >
                    <FileText size={20} className="sm:w-6 sm:h-6" />
                  </motion.div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Raise New Complaint</h2>
                    <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">Report issues quickly and efficiently</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={raiseComplaint} className="space-y-4 sm:space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="sm:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <User size={16} className="text-blue-500" />
                        Title *
                      </label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="e.g. Water leakage in bathroom"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Building2 size={16} className="text-purple-500" />
                        Category *
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      >
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-red-500" />
                        Priority *
                      </label>
                      <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-cyan-500" />
                      Description *
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className="w-full rounded-xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-all text-sm sm:text-base"
                      placeholder="Explain the issue in detail... Please include location, time of occurrence, and any other relevant information."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Provide as much detail as possible for faster resolution.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setForm({ title: "", category: "Plumbing", priority: "Low", description: "" })}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm sm:text-base"
                    >
                      Clear All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading || !tenancyData}
                      className="w-full sm:w-auto relative overflow-hidden group px-6 sm:px-8 py-2 sm:py-3 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50 text-sm sm:text-base"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Submit Complaint
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Quick Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            {/* Help & Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl sm:rounded-3xl border border-blue-200 p-4 sm:p-6 sticky top-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Quick Tips</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Provide detailed descriptions for faster resolution</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Save your OTP for technician verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Track status updates in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Use appropriate priority levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Include photos if possible</span>
                </li>
              </ul>

              {tenancyData && (
                <div className="mt-6 p-4 bg-white rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">Property Info</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p className="flex items-center gap-2">
                      <Building2 size={12} />
                      {tenancyData.propertyId?.title}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={12} />
                      {tenancyData.propertyId?.location?.locality}, {tenancyData.propertyId?.location?.city}
                    </p>
                    <p className="flex items-center gap-2">
                      <Home size={12} />
                      Room {tenancyData.roomId?.roomNumber} - {tenancyData.roomId?.roomType}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 lg:mt-8"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, description, or ID..."
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    fetchComplaints(e.target.value !== "All" ? e.target.value : "");
                  }}
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="All">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Complaints List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 lg:mt-8"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Complaints</h2>
                    <p className="text-gray-500 text-xs sm:text-sm">{filtered.length} complaints found</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {filtered.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {filtered.map((c, i) => {
                    const CategoryIcon = categoryIcons[c.category] || Package;
                    const isExpanded = expandedComplaint === c._id;
                    
                    return (
                      <motion.div
                        key={c._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 hover:border-blue-200 bg-white hover:shadow-lg transition-all duration-300"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col gap-4">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColors[c.status]} text-white flex-shrink-0`}>
                                  <CategoryIcon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 mb-2 break-words">
                                    {c.title}
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold border ${priorityClass[c.priority]}`}>
                                      {c.priority}
                                    </span>
                                    <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold border ${statusClass[c.status]}`}>
                                      {c.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => setExpandedComplaint(isExpanded ? null : c._id)}
                                className="p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
                              >
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </button>
                            </div>
                            
                            {/* Description */}
                            <p className="text-sm text-gray-600 line-clamp-2 break-words">{c.description}</p>
                            
                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                              <span className="flex items-center gap-2">
                                <Clock size={14} className="text-blue-500 flex-shrink-0" />
                                <span className="truncate">{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                              </span>
                              <span className="flex items-center gap-2">
                                <Hash size={14} className="text-purple-500 flex-shrink-0" />
                                <span className="truncate">{c.complaintNumber}</span>
                              </span>
                              <span className="flex items-center gap-2">
                                <Building2 size={14} className="text-green-500 flex-shrink-0" />
                                <span className="truncate">{c.category}</span>
                              </span>
                              {c.otp?.code && !c.otp?.verified && (
                                <span className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">
                                  <Shield size={14} className="flex-shrink-0" />
                                  <span>OTP: {c.otp.code}</span>
                                </span>
                              )}
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t pt-4 space-y-3"
                                >
                                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Property Details</h4>
                                    <div className="space-y-2 text-xs text-gray-600">
                                      <p className="flex items-center gap-2">
                                        <Building2 size={12} className="flex-shrink-0" />
                                        <span className="break-words">{c.propertyId?.title}</span>
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <MapPin size={12} className="flex-shrink-0" />
                                        <span className="break-words">
                                          {c.propertyId?.location?.address}, {c.propertyId?.location?.city}
                                        </span>
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <Home size={12} className="flex-shrink-0" />
                                        <span>Room {c.roomId?.roomNumber}</span>
                                      </p>
                                    </div>
                                  </div>

                                  {c.timeline && c.timeline.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">Timeline</h4>
                                      <div className="space-y-2">
                                        {c.timeline.map((t, idx) => (
                                          <div key={idx} className="flex gap-2 text-xs">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusColors[t.status]}`}></div>
                                            <div className="flex-1">
                                              <p className="font-medium text-gray-700">{t.status}</p>
                                              <p className="text-gray-500 break-words">{t.notes}</p>
                                              <p className="text-gray-400 mt-1">
                                                {new Date(t.timestamp).toLocaleString("en-IN")}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {c.otp && !c.otp.verified && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-amber-800">Verification OTP</p>
                                          <p className="text-xs text-amber-700 mt-1">
                                            Share this OTP only with the assigned technician: <span className="font-bold">{c.otp.code}</span>
                                          </p>
                                          <p className="text-xs text-amber-600 mt-1">
                                            {c.otp.isExpired ? "OTP Expired" : `Expires: ${new Date(c.otp.expiresAt).toLocaleString("en-IN")}`}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200"
                >
                  <AlertCircle size={48} className="mx-auto mb-4 text-gray-300 sm:w-16 sm:h-16" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No complaints found</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 px-4">
                    {query || filter !== "All" || priorityFilter !== "All"
                      ? "Try changing your search or filters"
                      : "Raise your first complaint above"}
                  </p>
                  {(query || filter !== "All" || priorityFilter !== "All") && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setFilter("All");
                        setPriorityFilter("All");
                        fetchComplaints();
                      }}
                      className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm sm:text-base"
                    >
                      Clear Filters
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Success Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring" }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Complaint Submitted!</h3>
                <p className="text-sm sm:text-base text-gray-600">Your complaint has been successfully registered.</p>
              </div>

              <div className="space-y-4 mb-6 sm:mb-8">
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Complaint ID</p>
                      <p className="font-mono font-bold text-gray-800 text-sm sm:text-base break-all">{dialogData.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verification OTP</p>
                      <p className="font-mono font-bold text-green-600 text-xl sm:text-2xl">{dialogData.otp}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs sm:text-sm text-amber-700 flex items-start gap-2">
                      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="break-words">{dialogData.message}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 py-2 sm:py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 text-sm sm:text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Complaint ID: ${dialogData.id}\nOTP: ${dialogData.otp}`);
                    setDialogOpen(false);
                  }}
                  className="flex-1 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Copy Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 p-4 rounded-2xl shadow-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm flex-1 break-words">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 flex-shrink-0"
              >
                <XCircle size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}