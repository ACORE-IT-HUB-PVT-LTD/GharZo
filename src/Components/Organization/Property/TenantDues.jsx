import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import baseurl from "../../../../BaseUrl";

const OrganizationTenantDues = () => {
  const { id } = useParams(); // Retrieve id from URL params
  const location = useLocation(); // For debugging URL
  const [duesData, setDuesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Current URL:", location.pathname); // Debug URL
    console.log("Property ID from useParams:", id); // Debug id

    const fetchDues = async () => {
      if (!id) {
        setError("No property ID provided. Please ensure the URL includes a valid property ID.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("orgToken");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const response = await axios.get(
          `${baseurl}api/dues/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            validateStatus: (status) => status === 200 || status === 304,
          }
        );

        console.log("API Response:", response.data); // Debug response

        if ((response.status === 200 || response.status === 304) && response.data?.success) {
          const tenantsWithOpen = response.data.tenants.map((tenant) => ({
            ...tenant,
            isOpen: false,
          }));
          setDuesData({ ...response.data, tenants: tenantsWithOpen });
        } else {
          setError("No dues data found for this property.");
        }
      } catch (err) {
        console.error("Error fetching dues:", err.response?.data || err);
        const errorMessage =
          err.response?.status === 401
            ? "Unauthorized: Invalid or missing token."
            : err.response?.status === 304
            ? "Data not modified, using cached data."
            : err.response?.data?.message || "Failed to fetch dues data. Please try again later.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDues();
  }, [id]);

  const toggleTenant = (tenantId) => {
    setDuesData((prev) => ({
      ...prev,
      tenants: prev.tenants.map((tenant) =>
        tenant.tenantId === tenantId
          ? { ...tenant, isOpen: !tenant.isOpen }
          : tenant
      ),
    }));
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 py-6 px-2 sm:px-4 md:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 transition-all duration-300">
        {/* Header with Logo Theme */}
        <motion.div
          className="flex items-center justify-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-800 font-sans">
            Tenant Dues
          </h1>
          <span className="ml-2 text-indigo-600 text-2xl">🌟</span> {/* Placeholder for logo icon */}
        </motion.div>
        <motion.div
          className="mb-4 text-center text-gray-600 text-xs sm:text-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Property ID: <span className="font-mono text-indigo-700">{id || "Not provided"}</span>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            className="text-center bg-red-100 text-red-700 p-3 sm:p-4 rounded-lg mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {error}
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 sm:px-4 py-1 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all text-sm sm:text-base"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <motion.div
            className="text-center text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-block animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base">Loading dues...</p>
          </motion.div>
        ) : (
          <>
            {/* Dues Section */}
            {duesData && duesData.tenants?.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {duesData.tenants.map((tenant, index) => (
                  <motion.div
                    key={tenant.tenantId}
                    className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => toggleTenant(tenant.tenantId)}
                      className="w-full flex flex-col sm:flex-row justify-between items-center px-2 sm:px-4 py-2 sm:py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors rounded-t-lg"
                    >
                      <span className="font-semibold text-base sm:text-lg truncate text-gray-900">
                        {tenant.tenantName}
                      </span>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-0">
                        <span className="text-xs sm:text-sm bg-indigo-600 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
                          {tenant.totalDues} Dues
                        </span>
                        <span className="text-lg sm:text-xl text-gray-900">
                          {tenant.isOpen ? "▼" : "▶"}
                        </span>
                      </div>
                    </button>
                    <motion.div
                      className="overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: tenant.isOpen ? "auto" : 0,
                        opacity: tenant.isOpen ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {tenant.isOpen && (
                        <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                          {tenant.dues.map((due, dueIndex) => (
                            <motion.div
                              key={due.dueId}
                              className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-100 rounded-lg p-2 sm:p-3"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: dueIndex * 0.05 }}
                            >
                              <div className="mb-1 sm:mb-0">
                                <div className="font-medium text-sm sm:text-base text-gray-900">
                                  {due.dueName}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  Due Date: {new Date(due.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 mt-1 sm:mt-0">
                                <span className="font-bold text-base sm:text-lg text-green-600">
                                  ₹{due.amount.toLocaleString()}
                                </span>
                                <span
                                  className={`text-xs sm:text-sm px-1 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                                    due.status === "PENDING"
                                      ? "bg-yellow-400 text-gray-900"
                                      : "bg-green-500 text-white"
                                  }`}
                                >
                                  {due.status}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                          <div className="text-right mt-1 sm:mt-2">
                            <span className="text-base sm:text-lg font-bold text-indigo-700">
                              Total: ₹
                              {tenant.dues
                                .reduce((sum, due) => sum + due.amount, 0)
                                .toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.p
                className="text-gray-500 text-center text-base sm:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                No dues data available for this property.
              </motion.p>
            )}
            {duesData && (
              <motion.div
                className="mt-4 sm:mt-6 text-center text-gray-500 text-xs sm:text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Showing {duesData.tenantCount} tenants
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default OrganizationTenantDues;