import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../User_Section/Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Edit2,
  Save,
  X,
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Shield,
  Calendar,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TenantProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // Fetch user profile from /api/auth/me
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage or sessionStorage
        const token = localStorage.token || localStorage.usertoken || sessionStorage.token;
        
        if (!token) {
          setError("No authentication token found. Please log in.");
          setTimeout(() => navigate("/login", { replace: true }), 1000);
          return;
        }

        const res = await axios.get("https://api.gharzoreality.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && res.data.data?.user) {
          const userData = res.data.data.user;
          setUser(userData);
          setFormData({
            name: userData.name || "",
            phone: userData.phone || "",
          });
          setError(null);
        } else {
          setError(res.data.message || "Failed to load profile.");
          setTimeout(() => navigate("/login", { replace: true }), 1000);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Session expired. Redirecting to login...");
          setTimeout(() => navigate("/login", { replace: true }), 1000);
        } else {
          setError(err.response?.data?.message || "Could not load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      
      const token = localStorage.token || localStorage.usertoken || sessionStorage.token;
      
      if (!token) {
        setError("Authentication required.");
        return;
      }

      // Update profile via API
      const res = await axios.put(
        "https://api.gharzoreality.com/api/auth/profile",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setUser((prev) => ({ ...prev, ...formData }));
        setEditing(false);
        setError(null);
      } else {
        setError(res.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usertoken");
    localStorage.removeItem("tenanttoken");
    sessionStorage.removeItem("token");
    logout();
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto"
          />
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center border border-red-100"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Profile Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center border border-yellow-100"
        >
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No User Data</h3>
          <p className="text-gray-600 mb-6">Unable to load user profile</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-2">Manage your personal information</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600 mt-1">{user?.email || "No email registered"}</p>
              </div>

              {/* Stats */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{user?.phone || "Not set"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {new Date(user?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Account Status</p>
                      <p className="font-medium text-gray-900">
                        {user?.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              {!editing && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Right Column - Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                    activeTab === "personal"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Personal Details
                </button>
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                    activeTab === "info"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Account Info
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "personal" && (
                    <motion.div
                      key="personal"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <User className="w-4 h-4" />
                          Full Name
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                            {user?.name}
                          </div>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Phone className="w-4 h-4" />
                          Mobile Number
                        </label>
                        {editing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="Enter your mobile number"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                            {user?.phone || "Not provided"}
                          </div>
                        )}
                      </div>

                      {/* Email (Read-only) */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </label>
                        <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                          {user?.email || "Not registered"}
                        </div>
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "info" && (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* User ID */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Shield className="w-4 h-4" />
                          User ID
                        </label>
                        <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium text-sm font-mono">
                          {user?._id}
                        </div>
                      </div>

                      {/* Role */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Briefcase className="w-4 h-4" />
                          Role
                        </label>
                        <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium capitalize">
                          {user?.role}
                        </div>
                      </div>

                      {/* Account Created */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Calendar className="w-4 h-4" />
                          Account Created
                        </label>
                        <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                          {new Date(user?.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Last Login */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Clock className="w-4 h-4" />
                          Last Login
                        </label>
                        <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                          {user?.lastLogin
                            ? new Date(user.lastLogin).toLocaleString()
                            : "Not recorded"}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
                          <span className="text-sm font-medium text-gray-700">Account Status</span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              user?.isActive
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {user?.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
                          <span className="text-sm font-medium text-gray-700">Verification Status</span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              user?.isVerified
                                ? "bg-blue-200 text-blue-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {user?.isVerified ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Actions */}
                {editing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 mt-8 pt-6 border-t border-gray-200"
                  >
                    <button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user?.name || "",
                          phone: user?.phone || "",
                        });
                      }}
                      disabled={saveLoading}
                      className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;