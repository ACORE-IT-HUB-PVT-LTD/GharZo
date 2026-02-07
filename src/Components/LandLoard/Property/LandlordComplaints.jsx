import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  AlertCircle, 
  Clock, 
  Search, 
  AlertTriangle, 
  Home, 
  FileText, 
  CheckCircle,
  XCircle,
  Eye,
  Shield,
  TrendingUp,
  Sparkles,
  RefreshCw,
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
  Loader2,
  Download,
  Calendar,
  CheckCheck,
  Users,
  Activity,
  BarChart3,
  FileCheck,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced status colors with gradients
const statusColors = {
  Pending: "bg-gradient-to-r from-rose-400 to-pink-500",
  Assigned: "bg-gradient-to-r from-indigo-400 to-purple-500",
  Accepted: "bg-gradient-to-r from-blue-400 to-cyan-500",
  "In Progress": "bg-gradient-to-r from-amber-400 to-orange-500",
  InProgress: "bg-gradient-to-r from-amber-400 to-orange-500",
  Completed: "bg-gradient-to-r from-emerald-400 to-green-500",
  Resolved: "bg-gradient-to-r from-emerald-400 to-green-500",
  Rejected: "bg-gradient-to-r from-gray-400 to-gray-500",
};

const statusClass = {
  Pending: "bg-rose-50 text-rose-700 border-rose-200",
  Assigned: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Accepted: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  InProgress: "bg-amber-50 text-amber-700 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-gray-50 text-gray-700 border-gray-200",
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

export default function LandlordComplaints() {
  const { id: propertyId } = useParams();
  const token = localStorage.getItem("usertoken");
  
  const [complaints, setComplaints] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    resolved: 0
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setError("Copied to clipboard!");
    setTimeout(() => setError(null), 2000);
  };

  const fetchComplaints = async (status = "", pageNum = 1) => {
    if (!token || !propertyId) {
      setError("Authentication token or property ID missing");
      return;
    }

    try {
      setRefreshing(true);
      setError(null);
      
      let url = `https://api.gharzoreality.com/api/complaints/landlord/all-complaints?propertyId=${propertyId}&page=${pageNum}`;
      
      if (status && status !== "All") {
        url += `&status=${status}`;
      }

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
        setComplaints(data.data || []);
        setStats(data.stats || {
          total: 0,
          pending: 0,
          assigned: 0,
          accepted: 0,
          inProgress: 0,
          completed: 0,
          resolved: 0
        });
        setPage(data.page || 1);
        setTotalPages(data.pages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setComplaints([]);
      setTimeout(() => setError(null), 5000);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchComplaintDetails = async (complaintId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.gharzoreality.com/api/complaints/${complaintId}`,
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
        setSelectedComplaint(data.data);
        setDetailsDialogOpen(true);
      }
    } catch (err) {
      setError(`Details: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId && token) {
      setLoading(true);
      fetchComplaints(statusFilter, 1);
    }
  }, [propertyId, token]);

  const filtered = useMemo(() => {
    return (complaints || []).filter((c) => {
      const q = query.toLowerCase();
      const matchesQ =
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.complaintNumber?.toLowerCase().includes(q) ||
        c.tenantId?.name?.toLowerCase().includes(q);
      const matchesPriority = priorityFilter === "All" || c.priority === priorityFilter;
      return matchesQ && matchesPriority;
    });
  }, [complaints, query, priorityFilter]);

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
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
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20"></div>
          <div className="absolute inset-3 sm:inset-4 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Loader2 className="text-blue-500 animate-spin" size={32} />
          </div>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 sm:mt-8 text-lg sm:text-xl font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          Loading complaints...
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
          <div className="bg-white py-4 px-4 sm:px-6 rounded-2xl shadow-xl border border-gray-100 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg"
                  >
                    <FileCheck size={20} className="sm:w-6 sm:h-6" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Property Complaints
                    </h1>
                    <p className="text-gray-600 text-xs sm:text-sm mt-0.5">Manage and track all tenant complaints</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPage(1);
                    fetchComplaints(statusFilter !== "All" ? statusFilter : "", 1);
                  }}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-sm sm:text-base shadow-sm hover:shadow-md"
                >
                  <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                  <span className="font-medium hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
            {[
              { key: "total", label: "Total", icon: Activity, color: "blue", onClick: () => { setStatusFilter("All"); fetchComplaints("", 1); } },
              { key: "pending", label: "Pending", icon: Clock, color: "rose", onClick: () => { setStatusFilter("Pending"); fetchComplaints("Pending", 1); } },
              { key: "assigned", label: "Assigned", icon: Users, color: "indigo", onClick: () => { setStatusFilter("Assigned"); fetchComplaints("Assigned", 1); } },
              { key: "accepted", label: "Accepted", icon: CheckCheck, color: "cyan", onClick: () => { setStatusFilter("Accepted"); fetchComplaints("Accepted", 1); } },
              { key: "inProgress", label: "Active", icon: TrendingUp, color: "amber", onClick: () => { setStatusFilter("InProgress"); fetchComplaints("InProgress", 1); } },
              { key: "completed", label: "Done", icon: FileCheck, color: "green", onClick: () => { setStatusFilter("Completed"); fetchComplaints("Completed", 1); } },
              { key: "resolved", label: "Resolved", icon: CheckCircle, color: "emerald", onClick: () => { setStatusFilter("Resolved"); fetchComplaints("Resolved", 1); } },
            ].map(({ key, label, icon: Icon, color, onClick }) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`bg-gradient-to-br from-${color}-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-${color}-100 shadow-lg cursor-pointer`}
                onClick={onClick}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-${color}-600 text-xs sm:text-sm font-medium truncate`}>{label}</p>
                    <Icon size={14} className={`text-${color}-500 flex-shrink-0`} />
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{stats[key]}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, tenant, description, or ID..."
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base bg-white transition-all"
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
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      {statusFilter === "All" ? "All Complaints" : `${statusFilter} Complaints`}
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {filtered.length} of {totalCount} complaints
                    </p>
                  </div>
                </div>
                <button 
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
                >
                  <Download size={16} />
                  <span className="font-medium hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {filtered.length > 0 ? (
                <div className="space-y-4">
                  {filtered.map((c, i) => {
                    const CategoryIcon = categoryIcons[c.category] || Package;
                    const isExpanded = expandedComplaint === c._id;
                    
                    return (
                      <motion.div
                        key={c._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-blue-300 bg-white hover:shadow-xl transition-all duration-300"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${statusColors[c.status]} text-white shadow-lg`}>
                                  <CategoryIcon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 mb-2 break-words">
                                    {c.title}
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${priorityClass[c.priority]}`}>
                                      {c.priority}
                                    </span>
                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${statusClass[c.status]}`}>
                                      {c.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => fetchComplaintDetails(c._id)}
                                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100"
                                >
                                  <Eye size={18} className="text-blue-600" />
                                </button>
                                <button
                                  onClick={() => setExpandedComplaint(isExpanded ? null : c._id)}
                                  className="p-2 rounded-lg hover:bg-gray-100"
                                >
                                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                                <User size={14} className="text-blue-500" />
                                <span className="truncate">{c.tenantId?.name || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                                <Phone size={14} className="text-green-500" />
                                <span className="truncate">{c.tenantId?.phone || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                                <Clock size={14} className="text-purple-500" />
                                <span className="truncate">{new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t pt-4 space-y-3"
                                >
                                  {c.timeline && (
                                    <div className="bg-amber-50 rounded-lg p-4">
                                      <h4 className="font-semibold mb-2">Timeline</h4>
                                      {c.timeline.map((t, idx) => (
                                        <div key={idx} className="flex gap-2 text-xs mb-2">
                                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1"></div>
                                          <div>
                                            <p className="font-medium">{t.status}</p>
                                            <p className="text-gray-500">{t.notes}</p>
                                          </div>
                                        </div>
                                      ))}
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
                <div className="text-center py-16">
                  <AlertCircle size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-600">No complaints found</h3>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="border-t px-6 py-4 flex justify-between">
                <button
                  onClick={() => fetchComplaints(statusFilter, page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  onClick={() => fetchComplaints(statusFilter, page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Details Dialog */}
      <AnimatePresence>
        {detailsDialogOpen && selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setDetailsDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedComplaint.title}</h2>
                <button onClick={() => setDetailsDialogOpen(false)}>
                  <XCircle size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p>{selectedComplaint.description}</p>
                </div>
                {selectedComplaint.otp && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold mb-2">OTP</h3>
                        <p className="text-2xl font-mono font-bold text-green-600">{selectedComplaint.otp.code}</p>
                      </div>
                      <button onClick={() => copyToClipboard(selectedComplaint.otp.code)}>
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`${error.includes("Copied") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"} border p-4 rounded-xl shadow-lg flex items-center gap-3`}>
              {error.includes("Copied") ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              <p>{error}</p>
              <button onClick={() => setError(null)}>
                <XCircle size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}