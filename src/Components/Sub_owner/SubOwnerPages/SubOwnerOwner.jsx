import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaCity,
  FaCalendarAlt,
  FaShieldAlt,
  FaSpinner,
  FaBed,
  FaDoorOpen,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import baseurl from "../../../../BaseUrl";

const BrandIcon = ({ icon: Icon, accent = false, size = "xl", className = "" }) => (
  <motion.div
    className={`relative p-4 rounded-2xl shadow-lg bg-gradient-to-br ${
      accent ? "from-[#FF6600] to-[#FF994D]" : "from-[#003366] to-[#336699]"
    } transform hover:scale-110 hover:rotate-2 transition-all duration-300 ${className}`}
    whileHover={{ y: -6, rotate: 3 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className={`text-white text-${size} drop-shadow-md`} />
  </motion.div>
);

const LandlordProfile = () => {
  const navigate = useNavigate();
  const [landlord, setLandlord] = useState(null);
  const [properties, setProperties] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [subOwnerInfo, setSubOwnerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("usertoken");
        if (!token) {
          toast.error("Authentication required! Please login first.");
          navigate("/login");
          return;
        }

        console.log("Fetching profile with Token:", token);
        setLoading(true);
        
        const response = await axios.get(
          `${baseurl}api/subowners/me/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          const { subOwner, permissionCodes, accessiblePropertiesCount } = response.data.data;
          
          // Set landlord data
          const landlordData = subOwner.landlordId;
          if (!landlordData) {
            throw new Error("Landlord data not found in response.");
          }
          
          setLandlord({
            id: landlordData._id,
            name: landlordData.name,
            phone: landlordData.phone,
            email: landlordData.email || "N/A",
          });

          // Set sub-owner info
          setSubOwnerInfo({
            id: subOwner._id,
            userId: subOwner.userId,
            name: subOwner.name,
            email: subOwner.email,
            phone: subOwner.phone,
            status: subOwner.status,
            hasFullPropertyAccess: subOwner.hasFullPropertyAccess,
            accessiblePropertiesCount,
            notes: subOwner.notes,
            createdAt: subOwner.createdAt,
            firstLogin: subOwner.firstLogin,
          });

          // Set properties
          setProperties(
            subOwner.assignedProperties.map((prop) => ({
              id: prop._id,
              title: prop.title,
              location: prop.location,
              images: prop.images,
              roomStats: prop.roomStats,
            }))
          );

          // Set permissions
          setPermissions(subOwner.permissions || []);
          
          toast.success("Profile loaded successfully!");
        } else {
          toast.error("Failed to fetch profile data.");
          setError("Failed to load profile. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err);
        toast.error(
          err.response?.data?.message ||
            "An error occurred while fetching profile."
        );
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          >
            <BrandIcon icon={FaSpinner} size="6xl" accent={true} />
          </motion.div>
          <p className="mt-6 text-xl font-medium text-gray-700">
            Loading Landlord Profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !landlord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 shadow-xl max-w-lg w-full text-center border border-red-100">
          <BrandIcon icon={FaTimesCircle} size="6xl" accent={true} />
          <p className="mt-6 text-xl font-medium text-red-700">
            {error || "No landlord data available."}
          </p>
          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            className="mt-6 bg-[#FF6600] text-white px-8 py-3 rounded-xl font-medium shadow-md hover:bg-[#FF994D] transition-colors"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 pb-16">
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
        theme="colored"
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-12">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-12"
        >
          <span className="text-[#003366]">Landlord</span>
          <span className="bg-gradient-to-r from-[#FF6600] to-[#FF994D] bg-clip-text text-transparent ml-3">
            Profile
          </span>
        </motion.h1>

        {/* Landlord Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-10 mb-12 border border-gray-200"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <BrandIcon icon={FaUser} size="6xl" accent={true} />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md">
                <FaShieldAlt className="text-[#003366] text-xl" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-[#003366] mb-2">
                {landlord.name}
              </h2>
              <p className="text-sm text-gray-500 mb-6">Property Owner</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <FaEnvelope className="text-[#FF6600] text-xl flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium truncate">{landlord.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <FaPhone className="text-[#FF6600] text-xl flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{landlord.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl sm:col-span-2">
                  <FaShieldAlt className="text-[#FF6600] text-xl flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Landlord ID</p>
                    <p className="font-medium font-mono text-xs sm:text-sm truncate">{landlord.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sub-Owner Information */}
        {subOwnerInfo && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-lg p-8 md:p-10 mb-12 border border-blue-200"
          >
            <h2 className="text-2xl font-bold text-[#003366] mb-6 flex items-center gap-3">
              <FaUser className="text-[#FF6600]" />
              My Account Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-semibold text-gray-800">{subOwnerInfo.name}</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-800 truncate">{subOwnerInfo.email}</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="font-semibold text-gray-800">{subOwnerInfo.phone}</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  subOwnerInfo.status === "Active" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {subOwnerInfo.status === "Active" ? <FaCheckCircle /> : <FaTimesCircle />}
                  {subOwnerInfo.status}
                </span>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Properties Access</p>
                <p className="font-semibold text-gray-800">
                  {subOwnerInfo.hasFullPropertyAccess ? "Full Access" : `${subOwnerInfo.accessiblePropertiesCount} Properties`}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Member Since</p>
                <p className="font-semibold text-gray-800">
                  {new Date(subOwnerInfo.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {subOwnerInfo.notes && (
              <div className="mt-6 bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-gray-700">{subOwnerInfo.notes}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Assigned Properties */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[#003366] mb-8 flex items-center gap-3"
        >
          <BrandIcon icon={FaBuilding} size="4xl" />
          Assigned Properties ({properties.length})
        </motion.h2>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {properties.map((prop, index) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
              >
                {/* Property Image */}
                {prop.images?.[0]?.url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={prop.images[0].url}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                )}

                <div className="p-7">
                  <h3 className="text-xl font-bold text-[#003366] mb-5">
                    {prop.title}
                  </h3>

                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-[#FF6600] text-lg mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {prop.location.address}
                        </p>
                        <p className="text-sm text-gray-600">
                          {prop.location.locality}, {prop.location.city}
                        </p>
                        <p className="text-xs text-gray-500">
                          {prop.location.state} - {prop.location.pincode}
                        </p>
                      </div>
                    </div>

                    {prop.location.landmark && (
                      <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
                        <FaMapMarkerAlt className="text-blue-600 text-sm mt-0.5" />
                        <p className="text-sm text-blue-800">
                          Near {prop.location.landmark}
                        </p>
                      </div>
                    )}

                    {/* Room Statistics */}
                    {prop.roomStats && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
                            <FaDoorOpen className="text-[#003366] text-xl mx-auto mb-1" />
                            <p className="text-2xl font-bold text-[#003366]">
                              {prop.roomStats.totalRooms}
                            </p>
                            <p className="text-xs text-gray-600">Total</p>
                          </div>
                          
                          <div className="text-center bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
                            <FaCheckCircle className="text-green-600 text-xl mx-auto mb-1" />
                            <p className="text-2xl font-bold text-green-600">
                              {prop.roomStats.availableRooms}
                            </p>
                            <p className="text-xs text-gray-600">Available</p>
                          </div>
                          
                          <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl">
                            <FaBed className="text-[#FF6600] text-xl mx-auto mb-1" />
                            <p className="text-2xl font-bold text-[#FF6600]">
                              {prop.roomStats.occupiedRooms}
                            </p>
                            <p className="text-xs text-gray-600">Occupied</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center mb-12">
            <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No properties assigned yet</p>
          </div>
        )}

        {/* Permissions */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[#003366] mb-8 flex items-center gap-3"
        >
          <BrandIcon icon={FaShieldAlt} size="4xl" accent={true} />
          My Permissions ({permissions.length})
        </motion.h2>

        {permissions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {permissions.map((perm, index) => (
              <motion.div
                key={perm._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 flex items-start gap-4"
              >
                <div className="bg-gradient-to-br from-[#FF6600] to-[#FF994D] p-3 rounded-xl flex-shrink-0">
                  <FaShieldAlt className="text-white text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg text-[#003366] mb-1">
                    {perm.name}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2 font-mono">
                    {perm.code}
                  </p>
                  <p className="text-sm text-gray-600">{perm.description}</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {perm.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
            <FaShieldAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No permissions assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordProfile;