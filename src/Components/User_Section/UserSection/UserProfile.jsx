import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaIdBadge,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileTabs from './ProfileTabs';

const API_BASE_URL = "https://api.gharzoreality.com";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem("usertoken");

  // Validate function
  const validate = (data) => {
    const newErrors = {};

    // Name
    const name = String(data.name || '').trim();
    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Phone (read-only but validate structure)
    const phone = String(data.phone || '').trim();
    if (!phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    // Address fields (optional but validate if provided)
    if (data.address) {
      const city = String(data.address.city || '').trim();
      if (city && !/^[A-Za-z\s]+$/.test(city)) {
        newErrors.city = "City must contain only letters";
      }

      const state = String(data.address.state || '').trim();
      if (state && !/^[A-Za-z\s]+$/.test(state)) {
        newErrors.state = "State must contain only letters";
      }

      const pincode = String(data.address.pincode || '').trim();
      if (pincode && !/^\d{6}$/.test(pincode)) {
        newErrors.pincode = "Pincode must be exactly 6 digits";
      }
    }

    return newErrors;
  };

  // Real-time validation when in edit mode
  useEffect(() => {
    if (editMode) {
      const newErrors = validate(formData);
      setErrors(newErrors);
    }
  }, [formData, editMode]);

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (res.data.success) {
          const userData = res.data.data.user;
          setProfile(userData);
          setFormData({
            name: userData.name || '',
            phone: userData.phone || '',
            role: userData.role || '',
            address: {
              city: userData.address?.city || '',
              state: userData.address?.state || '',
              pincode: userData.address?.pincode || ''
            }
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Update Profile
  const handleUpdate = async () => {
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please correct the errors in the form");
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/update_profile`,
        {
          name: formData.name,
          address: {
            city: formData.address.city,
            state: formData.address.state,
            pincode: formData.address.pincode
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const updatedUser = res.data.data;
        setProfile(updatedUser);
        setFormData({
          name: updatedUser.name || '',
          phone: updatedUser.phone || '',
          role: updatedUser.role || '',
          address: {
            city: updatedUser.address?.city || '',
            state: updatedUser.address?.state || '',
            pincode: updatedUser.address?.pincode || ''
          }
        });
        setErrors({});
        setEditMode(false);
        toast.success(res.data.message || "Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // Enter edit mode
  const handleEdit = () => {
    setEditMode(true);
    setErrors({});
  };

  // Cancel edit mode
  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        role: profile.role || '',
        address: {
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          pincode: profile.address?.pincode || ''
        }
      });
    }
    setEditMode(false);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <SkeletonHeader />
          <div className="mt-8 bg-white rounded-3xl shadow-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonField key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-l-4 border-red-500 rounded-xl px-8 py-6 shadow-xl"
        >
          <p className="text-red-600 font-semibold text-center">Failed to load profile.</p>
        </motion.div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header with Edit Toggle */}
        <div className="flex justify-between items-center mb-8 mt-9 ml-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your personal information</p>
          </div>
          
          {!editMode ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-3 bg-[#3B9DF8] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <FaEdit />
              Edit Profile
            </motion.button>
          ) : (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: updating ? 1 : 1.05 }}
                whileTap={{ scale: updating ? 1 : 0.95 }}
                onClick={handleUpdate}
                disabled={updating || Object.keys(errors).length > 0}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all ${
                  (updating || Object.keys(errors).length > 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {updating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                disabled={updating}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                <FaTimes />
                Cancel
              </motion.button>
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3">
            
            {/* Left Sidebar - Avatar & Basic Info */}
            <div className="lg:col-span-1 bg-gradient-to-br from-[#002B5C] to-[#004080] p-8 text-white">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                {/* Avatar */}
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C3A] p-1">
                    <div className="w-full h-full rounded-full bg-[#002B5C] flex items-center justify-center">
                      {profile.profileImage ? (
                        <img 
                          src={profile.profileImage} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-6xl text-[#FF6B00]" />
                      )}
                    </div>
                  </div>
                  {/* Status Indicator */}
                  {profile.isActive && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-400 rounded-full border-4 border-[#002B5C]" />
                  )}
                </div>

                {/* Name */}
                <h2 className="text-2xl font-bold mb-2">{formData?.name || "User Name"}</h2>
                <p className="text-blue-200 text-sm mb-2 capitalize">
                  <FaIdBadge className="inline mr-2" />
                  {formData?.role || "User"}
                </p>
                
                {/* Verification Status */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                  {profile.isVerified ? (
                    <>
                      <FaCheckCircle className="text-emerald-400" />
                      <span className="text-sm">Verified Account</span>
                    </>
                  ) : (
                    <>
                      <FaClock className="text-yellow-400" />
                      <span className="text-sm">Pending Verification</span>
                    </>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="space-y-4 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FF6B00]/20 rounded-lg flex items-center justify-center">
                        <FaPhone className="text-[#FF6B00] text-xl" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs text-blue-200">Phone</p>
                        <p className="font-semibold">{formData?.phone || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FF6B00]/20 rounded-lg flex items-center justify-center">
                        <FaClock className="text-[#FF6B00] text-xl" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs text-blue-200">Member Since</p>
                        <p className="font-semibold text-xs">{formatDate(profile.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FF6B00]/20 rounded-lg flex items-center justify-center">
                        <FaClock className="text-[#FF6B00] text-xl" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs text-blue-200">Last Login</p>
                        <p className="font-semibold text-xs">{formatDate(profile.lastLogin)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Form Fields */}
            <div className="lg:col-span-2 p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {/* Personal Information Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-[#FF6B00] to-[#FF8C3A] rounded-full" />
                    Personal Information
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">Update your personal details</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                      label="Name"
                      icon={<FaUser />}
                      value={formData?.name}
                      name="name"
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      editMode={editMode}
                      error={errors.name}
                    />
                    
                    <Field
                      label="Phone Number"
                      icon={<FaPhone />}
                      value={formData?.phone}
                      name="phone"
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      editMode={false} // Phone is always read-only
                      type="tel"
                      readOnly
                    />
                    
                    <Field
                      label="Role"
                      icon={<FaIdBadge />}
                      value={formData?.role}
                      name="role"
                      editMode={false} // Role is always read-only
                      readOnly
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-[#FF6B00] to-[#FF8C3A] rounded-full" />
                    Address Details
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">Manage your location information</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                      label="City"
                      icon={<FaMapMarkerAlt />}
                      value={formData?.address?.city || ''}
                      name="city"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...(formData.address || {}), city: e.target.value },
                        })
                      }
                      editMode={editMode}
                      error={errors.city}
                    />
                    
                    <Field
                      label="State"
                      icon={<FaMapMarkerAlt />}
                      value={formData?.address?.state || ''}
                      name="state"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...(formData.address || {}), state: e.target.value },
                        })
                      }
                      editMode={editMode}
                      error={errors.state}
                    />
                    
                    <Field
                      label="Pincode"
                      icon={<FaMapMarkerAlt />}
                      value={formData?.address?.pincode || ''}
                      name="pincode"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...(formData.address || {}),
                            pincode: e.target.value,
                          },
                        })
                      }
                      editMode={editMode}
                      type="text"
                      maxLength="6"
                      error={errors.pincode}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ProfileTabs Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <ProfileTabs />
        </motion.div>

      </motion.div>
    </div>
  );
};

// Modern Field Component
function Field({
  label,
  icon,
  value,
  name,
  onChange,
  editMode,
  type = "text",
  error,
  readOnly = false,
  maxLength
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {readOnly && <span className="text-gray-400 text-xs">(Read-only)</span>}
      </label>
      
      {editMode && !readOnly ? (
        <div className="space-y-1">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
            <input
              type={type}
              name={name}
              value={value || ""}
              onChange={onChange}
              maxLength={maxLength}
              placeholder={`Enter ${label.toLowerCase()}`}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-[#FF6B00] focus:bg-white focus:outline-none transition-all"
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs font-medium ml-1"
            >
              {error}
            </motion.p>
          )}
        </div>
      ) : (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          readOnly ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`text-lg ${readOnly ? 'text-gray-400' : 'text-[#FF6B00]'}`}>
            {icon}
          </div>
          <p className={`font-medium flex-1 ${readOnly ? 'text-gray-500' : 'text-gray-800'}`}>
            {value || <span className="text-gray-400 italic">Not provided</span>}
          </p>
        </div>
      )}
    </div>
  );
}

// Loading Skeleton Components
function SkeletonHeader() {
  return (
    <div className="flex justify-between items-center mb-8 animate-pulse">
      <div>
        <div className="h-10 w-48 bg-gray-300 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded" />
      </div>
      <div className="h-12 w-32 bg-gray-300 rounded-full" />
    </div>
  );
}

function SkeletonField() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 w-24 bg-gray-300 rounded" />
      <div className="h-12 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default ProfilePage;