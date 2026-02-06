import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Home,
  Users,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Building2,
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  Star,
  Bell,
} from "lucide-react";
import { toast } from "react-toastify";

const Tenant = () => {
  const { id } = useParams(); // propertyId from route
  const [tenancies, setTenancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTenancies = async () => {
      try {
        const token = localStorage.getItem("usertoken");
        if (!token) throw new Error("No token found. Please login again.");

        const res = await fetch(
          "https://api.gharzoreality.com/api/tenancies/landlord/my-tenancies",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const raw = await res.text();
        console.log("Raw tenancy response:", raw);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${raw}`);
        }

        let data;
        try {
          data = JSON.parse(raw);
        } catch (err) {
          throw new Error("Invalid JSON response from server");
        }

        // Handle different response formats
        if (data.success && Array.isArray(data.data)) {
          setTenancies(data.data);
        } else if (Array.isArray(data)) {
          setTenancies(data);
        } else {
          throw new Error("Unexpected response format from server");
        }
      } catch (err) {
        console.error("Error fetching tenancies:", err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenancies();
  }, [id]);

  // Filter tenancies by propertyId if provided
  const filteredTenancies = id
    ? tenancies.filter((t) => t.propertyId?._id === id)
    : tenancies;

  // Apply additional filters
  const displayedTenancies = filteredTenancies.filter((tenancy) => {
    const matchesStatus =
      filterStatus === "all" || tenancy.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      tenancy.tenantId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenancy.propertyId?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: filteredTenancies.length,
    active: filteredTenancies.filter((t) => t.status === "Active").length,
    pending: filteredTenancies.filter((t) => t.status === "Pending-Approval").length,
    notice: filteredTenancies.filter((t) => t.status === "Notice-Period").length,
    terminated: filteredTenancies.filter((t) => t.status === "Terminated").length,
    totalRevenue: filteredTenancies
      .filter((t) => t.status === "Active")
      .reduce((sum, t) => sum + (t.financials?.monthlyRent || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-orange-200 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-gray-700 mt-6 font-medium text-lg">
              Loading tenancies...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-red-300 rounded-2xl p-8 text-center shadow-xl"
          >
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-semibold text-lg mb-2">
              Failed to fetch tenancies
            </p>
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Tenancies Management
              </h1>
              <p className="text-gray-600">
                Manage and monitor all your tenancy agreements
              </p>
            </div>
            <Link
              to="/landlord/tenant-form"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              + Add New Tenant
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Total Tenancies"
              value={stats.total}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <StatCard
              icon={<CheckCircle className="w-6 h-6" />}
              label="Active"
              value={stats.active}
              color="from-green-500 to-green-600"
              bgColor="bg-green-50"
              textColor="text-green-700"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="Pending Approval"
              value={stats.pending}
              color="from-yellow-500 to-yellow-600"
              bgColor="bg-yellow-50"
              textColor="text-yellow-700"
            />
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              label="Monthly Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by tenant name or property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* View Toggle */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-md"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-md"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Filter by Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "all", label: "All" },
                        { value: "Active", label: "Active" },
                        { value: "Pending-Approval", label: "Pending" },
                        { value: "Notice-Period", label: "Notice Period" },
                        { value: "Terminated", label: "Terminated" },
                      ].map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => setFilterStatus(filter.value)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            filterStatus === filter.value
                              ? "bg-orange-500 text-white shadow-md"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tenancies Display */}
        {displayedTenancies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center shadow-lg"
          >
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 text-xl font-semibold mb-2">
              No tenancies found
            </p>
            <p className="text-gray-500">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Start by adding your first tenant"}
            </p>
          </motion.div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {displayedTenancies.map((tenancy, idx) => (
              <TenancyCard
                key={tenancy._id || idx}
                tenancy={tenancy}
                index={idx}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ icon, label, value, color, bgColor, textColor }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    className={`${bgColor} rounded-xl p-6 shadow-md border border-gray-100`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className={`bg-gradient-to-br ${color} p-4 rounded-xl text-white shadow-lg`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// Tenancy Card Component
const TenancyCard = ({ tenancy, index, viewMode }) => {
  const getStatusBadge = (status) => {
    const styles = {
      Active: "bg-green-100 text-green-700 border-green-300",
      "Pending-Approval": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "Notice-Period": "bg-orange-100 text-orange-700 border-orange-300",
      Terminated: "bg-red-100 text-red-700 border-red-300",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (viewMode === "list") {
    return (
      <Link to={`/landlord/tenancy-details/${tenancy._id}`}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-100 hover:border-orange-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              {/* Tenant Info */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {tenancy.tenantId?.name || "Unknown Tenant"}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {tenancy.tenantId?.phone || "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {tenancy.tenantId?.email || "N/A"}
                  </span>
                </div>
              </div>

              {/* Property Info */}
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Property</p>
                <p className="font-semibold text-gray-900">
                  {tenancy.propertyId?.title || "N/A"}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tenancy.propertyId?.location?.city},{" "}
                  {tenancy.propertyId?.location?.state}
                </p>
              </div>

              {/* Financial */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{tenancy.financials?.monthlyRent?.toLocaleString() || "N/A"}
                </p>
              </div>

              {/* Status */}
              <div>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${getStatusBadge(
                    tenancy.status
                  )}`}
                >
                  {tenancy.status}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/landlord/tenancy-details/${tenancy._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="bg-white shadow-lg rounded-2xl p-6 border-2 border-gray-100 hover:border-orange-300 hover:shadow-2xl transition-all cursor-pointer h-full"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {tenancy.tenantId?.name || "Unknown Tenant"}
            </h3>
            <p className="text-xs text-gray-500">
              ID: {tenancy.tenantId?._id?.slice(0, 8)}...
            </p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getStatusBadge(
              tenancy.status
            )}`}
          >
            {tenancy.status}
          </span>
        </div>

        {/* Contact Details */}
        <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
          {tenancy.tenantId?.phone && (
            <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg">
              <Phone className="w-4 h-4 text-orange-500" />
              <span className="text-gray-700 font-medium">
                {tenancy.tenantId.phone}
              </span>
            </div>
          )}

          {tenancy.tenantId?.email && (
            <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg">
              <Mail className="w-4 h-4 text-orange-500" />
              <span className="text-gray-700 font-medium truncate">
                {tenancy.tenantId.email}
              </span>
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <Home className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700 font-medium truncate">
              {tenancy.propertyId?.title || "N/A"}
            </span>
          </div>

          {tenancy.propertyId?.location?.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-gray-600 truncate">
                {tenancy.propertyId.location.city},{" "}
                {tenancy.propertyId.location.state}
              </span>
            </div>
          )}

          {tenancy.roomId && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
                Room {tenancy.roomId.roomNumber || "N/A"}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">
                {tenancy.roomId.roomType || "N/A"}
              </span>
            </div>
          )}
        </div>

        {/* Financial Info */}
        <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Monthly Rent</span>
            <span className="text-lg font-bold text-green-600">
              ₹{tenancy.financials?.monthlyRent?.toLocaleString() || "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Security Deposit</span>
            <span className="font-semibold text-gray-900">
              ₹{tenancy.financials?.securityDeposit?.toLocaleString() || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600 text-xs">
              {new Date(tenancy.agreement?.startDate).toLocaleDateString("en-IN")} -{" "}
              {new Date(tenancy.agreement?.endDate).toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>

        {/* Notice Alert */}
        {tenancy.notice?.isUnderNotice && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-orange-700">
                  Under Notice
                </p>
                <p className="text-xs text-orange-600">
                  Vacate by:{" "}
                  {new Date(tenancy.notice.vacateByDate).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View Details Button */}
        <motion.div className="pt-2" whileHover={{ x: 5 }}>
          <div className="flex items-center justify-between text-orange-500 font-semibold text-sm">
            <span>View Full Details</span>
            <span>→</span>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default Tenant;