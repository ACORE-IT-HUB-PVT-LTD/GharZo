import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail, Home, Users, MapPin, Briefcase, Calendar, DollarSign } from "lucide-react";

const Tenant = () => {
  const { id } = useParams(); // propertyId from route
  const [tenancies, setTenancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              "Content-Type": "application/json"
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
      } finally {
        setLoading(false);
      }
    };

    fetchTenancies();
  }, [id]);

  // Filter tenancies by propertyId if provided
  const filteredTenancies = id 
    ? tenancies.filter(t => t.propertyId?._id === id)
    : tenancies;

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-6">
          <div className="border-t-4 border-[#FF6B35] w-10 h-10 rounded-full animate-spin mx-auto"></div>
          <p className="text-[#003366] mt-3 font-medium text-sm">Loading tenancies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-center"
        >
          <p className="text-red-700 font-semibold text-sm">
            Failed to fetch tenancies...
          </p>
          <p className="text-red-600 text-xs mt-1">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold text-[#003366] flex items-center">
            <span className="w-1 h-6 bg-[#FF6B35] mr-3 rounded"></span>
            Tenancies Overview
          </h2>
          
          {/* Total Tenancies Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            <div>
              <p className="text-xs opacity-90">Total</p>
              <p className="text-xl font-bold">{filteredTenancies.length}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {filteredTenancies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-[#FF6B35]/30 rounded-lg p-8 text-center shadow-lg"
        >
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-[#003366] text-sm font-semibold">
            No tenancies found
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Tenancies will appear here once they are created
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenancies.map((tenancy, idx) => (
            <Link
              key={tenancy._id || idx}
              to={`/landlord/tenancy-details/${tenancy._id}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="bg-white shadow-lg rounded-lg p-4 border-2 border-[#FF6B35]/30 hover:border-[#FF6B35] hover:shadow-xl transition-all cursor-pointer h-full"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#003366]">
                      {tenancy.tenantId?.name || "Unknown Tenant"}
                    </h3>
                    <p className="text-xs text-gray-500">ID: {tenancy.tenantId?._id?.slice(0, 8)}...</p>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                    tenancy.status === "Active" 
                      ? "bg-green-100 text-green-700" 
                      : tenancy.status === "Terminated"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {tenancy.status}
                  </span>
                </div>

                {/* Contact Details */}
                <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
                  {tenancy.tenantId?.phone && (
                    <div className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                      <Phone className="w-3 h-3 text-[#FF6B35]" />
                      <span className="text-[#003366] font-medium">{tenancy.tenantId.phone}</span>
                    </div>
                  )}
                  
                  {tenancy.tenantId?.email && (
                    <div className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                      <Mail className="w-3 h-3 text-[#FF6B35]" />
                      <span className="text-[#003366] font-medium truncate">{tenancy.tenantId.email}</span>
                    </div>
                  )}
                </div>

                {/* Property & Room Info */}
                <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-xs">
                    <Home className="w-3 h-3 text-[#003366]" />
                    <span className="text-[#003366] font-medium truncate">
                      {tenancy.propertyId?.title || "N/A"}
                    </span>
                  </div>
                  
                  {tenancy.propertyId?.location?.address && (
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3 h-3 text-[#FF6B35]" />
                      <span className="text-gray-600 truncate">
                        {tenancy.propertyId.location.city}, {tenancy.propertyId.location.state}
                      </span>
                    </div>
                  )}

                  {tenancy.roomId && (
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-0.5 bg-[#003366] text-white text-xs font-semibold rounded">
                        Room {tenancy.roomId.roomNumber || "N/A"}
                      </span>
                      <span className="inline-block px-2 py-0.5 bg-[#FF6B35] text-white text-xs font-semibold rounded">
                        {tenancy.roomId.roomType || "N/A"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Financial & Date Info */}
                <div className="space-y-2 text-xs mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3 text-green-600" />
                    <span className="text-[#003366] font-medium">
                      ₹{tenancy.financials?.monthlyRent || "N/A"}/month
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    <span className="text-gray-600">
                      {new Date(tenancy.agreement?.startDate).toLocaleDateString("en-IN")} - {new Date(tenancy.agreement?.endDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  {tenancy.tenantInfo?.employmentDetails?.companyName && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3 text-purple-600" />
                      <span className="text-gray-600 truncate">
                        {tenancy.tenantInfo.employmentDetails.companyName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notice Info if under notice */}
                {tenancy.notice?.isUnderNotice && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-3 text-xs">
                    <p className="text-orange-700 font-semibold">
                      Under Notice - Vacate by {new Date(tenancy.notice.vacateByDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                )}

                {/* View Details */}
                <motion.div
                  className="pt-2"
                  whileHover={{ x: 3 }}
                >
                  <div className="flex items-center justify-between text-[#FF6B35] font-semibold text-xs">
                    <span>View Full Details</span>
                    <span>→</span>
                  </div>
                </motion.div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tenant;