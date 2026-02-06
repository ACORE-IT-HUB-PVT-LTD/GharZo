import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaCalendar,
  FaFileAlt,
  FaSpinner,
  FaCheckCircle,
  FaInfoCircle,
  FaHome,
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const TenantNotice = () => {
  const navigate = useNavigate();
  const { tenancyId: urlTenancyId } = useParams();
  
  const [tenancyId, setTenancyId] = useState(urlTenancyId || null);
  const [tenancyData, setTenancyData] = useState(null);
  const [fetchingTenancy, setFetchingTenancy] = useState(!urlTenancyId);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    noticePeriodDays: 30,
    reason: "",
  });
  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split("T")[0];

  // Fetch tenant's tenancies if tenancyId is not provided via URL
  useEffect(() => {
    if (urlTenancyId) {
      setFetchingTenancy(false);
      return;
    }

    const fetchTenancies = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("usertoken");
        if (!token) {
          toast.error("Please login to continue");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://api.gharzoreality.com/api/tenancies/tenant/my-tenancies",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.success && response.data?.data?.length > 0) {
          const tenancy = response.data.data[0]; // Get first tenancy
          setTenancyId(tenancy._id);
          setTenancyData(tenancy);

          // Pre-populate form with existing notice data if available
          if (tenancy.notice?.isUnderNotice) {
            setFormData({
              noticePeriodDays: tenancy.notice?.noticePeriodDays || 30,
              reason: tenancy.notice?.reason || "",
            });
          }
        } else {
          toast.error("No active tenancies found");
          navigate("/tenant");
        }
      } catch (error) {
        console.error("Error fetching tenancies:", error);
        toast.error("Failed to load tenancy information");
        navigate("/tenant");
      } finally {
        setFetchingTenancy(false);
      }
    };

    fetchTenancies();
  }, [urlTenancyId, navigate]);

  // Calculate vacate by date
  const calculateVacateDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(days));
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.noticePeriodDays || formData.noticePeriodDays < 1) {
      newErrors.noticePeriodDays = "Notice period must be at least 1 day";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason for notice is required";
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = "Reason must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    if (!tenancyId) {
      toast.error("Tenancy ID is missing");
      return;
    }

    setIsLoading(true);

    const token = localStorage.getItem("token") || localStorage.getItem("usertoken");
    if (!token) {
      toast.error("Please login again");
      setIsLoading(false);
      navigate("/login");
      return;
    }

    // Tenant always sends "Tenant" as noticeGivenBy
    const payload = {
      noticePeriodDays: parseInt(formData.noticePeriodDays),
      noticeGivenBy: "Tenant",
      reason: formData.reason.trim(),
    };

    console.log("Submitting notice payload:", payload);

    try {
      const response = await axios.post(
        `https://api.gharzoreality.com/api/tenancies/${tenancyId}/notice`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Notice period initiated successfully!");
        
        // Navigate back to tenant dashboard after 2 seconds
        setTimeout(() => {
          navigate(`/tenant`);
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to initiate notice period");
      }
    } catch (error) {
      console.error("Notice submission error:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to initiate notice period"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-3xl mx-auto">
        {/* Loading State */}
        {fetchingTenancy && (
          <motion.div
            className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FaSpinner className="w-16 h-16 text-red-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-semibold">Loading your tenancy information...</p>
          </motion.div>
        )}

        {/* Form State */}
        {!fetchingTenancy && tenancyId && (
          <>
            <motion.div
              className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-8 px-8">
                <div className="flex items-center gap-4 mb-2">
                  <FaExclamationTriangle className="text-5xl" />
                  <div>
                    <h2 className="text-4xl font-extrabold drop-shadow-lg">
                      Give Notice to Landlord
                    </h2>
                    <p className="text-red-100 mt-1">
                      Initiate notice period to vacate the property
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12">
                {/* Property Information */}
                {tenancyData?.propertyId && (
                  <div className="mb-8 bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <FaHome className="w-5 h-5" />
                      Property Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-700 font-semibold">Property</p>
                        <p className="text-blue-900">{tenancyData.propertyId.title}</p>
                      </div>
                      <div>
                        <p className="text-blue-700 font-semibold">Location</p>
                        <p className="text-blue-900">
                          {tenancyData.propertyId.location?.city}, {tenancyData.propertyId.location?.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700 font-semibold">Room Number</p>
                        <p className="text-blue-900">Room {tenancyData.roomId?.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-blue-700 font-semibold">Bed Number</p>
                        <p className="text-blue-900">Bed {tenancyData.bedNumber}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning Box */}
                <div className="mb-8 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-2">
                        Important Information
                      </h3>
                      <ul className="text-yellow-800 text-sm space-y-1 list-disc list-inside">
                        <li>Once notice is submitted, the tenancy status will change to "Notice-Period"</li>
                        <li>You must vacate the property by the calculated date</li>
                        <li>Ensure all rent and dues are cleared before vacating</li>
                        <li>Security deposit will be refunded after final settlement</li>
                        <li>This action cannot be easily reversed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Notice Period Days */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notice Period (Days) *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaCalendar />
                      </div>
                      <input
                        type="number"
                        name="noticePeriodDays"
                        value={formData.noticePeriodDays}
                        onChange={handleChange}
                        min="1"
                        max="365"
                        className={`w-full pl-12 pr-4 py-3 bg-white border-2 ${
                          errors.noticePeriodDays ? "border-red-400" : "border-gray-300"
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 transition`}
                        placeholder="Enter notice period in days"
                      />
                    </div>
                    {errors.noticePeriodDays && (
                      <p className="text-red-500 text-sm mt-1">{errors.noticePeriodDays}</p>
                    )}
                    
                    {/* Calculated Vacate Date */}
                    {formData.noticePeriodDays > 0 && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>You need to vacate by:</strong>{" "}
                          {calculateVacateDate(formData.noticePeriodDays)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason for Leaving *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-4 text-gray-400">
                        <FaFileAlt />
                      </div>
                      <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows="4"
                        maxLength="500"
                        className={`w-full pl-12 pr-4 py-3 bg-white border-2 ${
                          errors.reason ? "border-red-400" : "border-gray-300"
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 transition resize-none`}
                        placeholder="Provide a clear reason for leaving (minimum 10 characters)"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {errors.reason && (
                        <p className="text-red-500 text-sm">{errors.reason}</p>
                      )}
                      <p className="text-gray-500 text-sm ml-auto">
                        {formData.reason.length}/500 characters
                      </p>
                    </div>
                  </div>

                  {/* Common Reasons (Quick Fill) */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Common Reasons (Click to use):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Moving to another city due to job transfer.",
                        "Shifting to a different location for better commute.",
                        "Moving back to hometown.",
                        "Found a more suitable accommodation.",
                        "Lease period ending, not renewing.",
                        "Personal reasons.",
                      ].map((quickReason, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, reason: quickReason }))
                          }
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:border-red-400 transition"
                        >
                          {quickReason}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition shadow-2xl flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin text-xl" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="text-xl" />
                          Submit Notice
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                What Happens After Submitting Notice?
              </h3>
              <ul className="text-gray-700 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Your landlord will be notified about your decision to vacate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Tenancy status will change to "Notice-Period"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>You must vacate the property by the calculated date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Clear all pending rent and dues before vacating</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Security deposit will be refunded after final inspection and settlement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Contact your landlord to coordinate the move-out process</span>
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default TenantNotice;