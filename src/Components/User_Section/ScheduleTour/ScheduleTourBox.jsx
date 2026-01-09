import React, { useState, useEffect } from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaCalendarAlt,
  FaFacebookMessenger,
  FaExclamationTriangle,
  FaUser,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl";

const ScheduleTourBox = () => {
  const [visitDate, setVisitDate] = useState("");
  const [notes, setNotes] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [error, setError] = useState(null);
  const [dateTimeError, setDateTimeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [landlordNumber, setLandlordNumber] = useState("");
  const [fetchingProperty, setFetchingProperty] = useState(true);
  const { id } = useParams();

  const getToken = () => {
    return localStorage.getItem("usertoken") || null;
  };

  const handleCall = () => {
    window.location.href = `tel:+91${landlordNumber}`;
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id) return;

      try {
        setFetchingProperty(true);
        const response = await fetch(
          `${baseurl}api/public/property/${id}?_=${Date.now()}`
        );
        const data = await response.json();
        console.log(data);
        

        if (data.success && data.property) {
          const number = data.property?.landlord?.contactNumber;

          if (number && number.length === 10) {
            setLandlordNumber(number);
          } else {
            console.warn("Landlord number missing or invalid.");
            setLandlordNumber("");
          }
        } else {
          console.warn("Property details not found");
          setLandlordNumber("");
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setLandlordNumber("");
      } finally {
        setFetchingProperty(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const validateDateTime = (dateTimeValue) => {
    if (!dateTimeValue) {
      return "Please select a date and time";
    }
    const selectedDateTime = new Date(dateTimeValue);
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 30 * 60 * 1000);

    if (selectedDateTime <= bufferTime) {
      return "Please select a future time (at least 30 minutes from now)";
    }
    return null;
  };

  const handleDateTimeChange = (e) => {
    const value = e.target.value;
    setVisitDate(value);
    setError(null);
    setSuccess(false);

    setDateTimeError("");

    const validationError = validateDateTime(value);
    if (validationError) {
      setDateTimeError(validationError);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateValidationError = validateDateTime(visitDate);
    if (dateValidationError) {
      setDateTimeError(dateValidationError);
      setError("Please select a valid future date and time");
      toast.error("Please select a valid future date and time", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    const token = getToken();
    if (!token) {
      setError("Please log in to book a visit");
      toast.error("Please log in to book a visit", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    setLoading(true);
    setError(null);
    setDateTimeError("");
    setSuccess(false);
    try {
      const response = await fetch(`${baseurl}api/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: id,
          visitDate: new Date(visitDate).toISOString(),
          notes,
          contactNumber,
        }),
      });
      const data = await response.json();
      console.log(data);
      
      if (response.ok) {
        const successMessage = data.message || "Visit successfully scheduled!";
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 5000,
          pauseOnHover: true,
        });
        setSuccess(true);
        setTimeout(() => {
          setVisitDate("");
          setNotes("");
          setContactNumber("");
        }, 1000);
      } else {
        setError(data.message || "Failed to book visit.");
        toast.error(data.message || "Failed to book visit.", {
          position: "top-right",
          autoClose: 5000,
        });
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          toast.error("Session expired. Please log in again.", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        err.message.includes("not found")
          ? "Property ID not found."
          : "Something went wrong. Please try again."
      );
      toast.error(
        err.message.includes("not found")
          ? "Property ID not found."
          : "Something went wrong. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return (
      <div className="text-red-500 text-sm">
        Invalid property ID. Please select a valid property.
      </div>
    );
  }

  if (fetchingProperty) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 font-medium">Loading property details...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#002B5C] to-[#003A75] p-6">
        <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <FaCalendarAlt className="text-[#FF6B00]" />
          Schedule Your Visit
        </h2>
        <p className="text-blue-200 text-sm">Book a tour to explore this property</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3"
          >
            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Success Alert */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3"
          >
            <FaExclamationTriangle className="text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-700 text-sm font-semibold">Visit booked successfully!</p>
              <p className="text-green-600 text-xs mt-1">You can schedule another visit anytime.</p>
            </div>
          </motion.div>
        )}

        <motion.form onSubmit={handleSubmit} className="space-y-5">
          {/* Date & Time Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Date & Time
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]">
                <FaCalendarAlt size={18} />
              </div>
              <input
                type="datetime-local"
                value={visitDate}
                onChange={handleDateTimeChange}
                min={new Date(new Date().getTime() + 30 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16)}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all ${
                  dateTimeError
                    ? "border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50"
                    : "border-gray-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100"
                }`}
                required
              />
            </div>
            {dateTimeError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs mt-2 flex items-center gap-1"
              >
                <FaExclamationTriangle size={12} />
                {dateTimeError}
              </motion.p>
            )}
          </div>

          {/* Contact Number Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Number
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]">
                <FaPhone size={18} />
              </div>
              <input
                type="number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all"
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
              />
            </div>
          </div>

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-4 text-[#FF6B00]">
                <FaFacebookMessenger size={18} />
              </div>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific requirements or questions..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all resize-none"
              />
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quick Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: landlordNumber ? 1.05 : 1 }}
                whileTap={{ scale: landlordNumber ? 0.95 : 1 }}
                onClick={landlordNumber ? handleCall : undefined}
                disabled={!landlordNumber}
                className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                  landlordNumber
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <FaPhone size={16} />
                <span className="text-sm">Call Now</span>
              </motion.button>

              <motion.a
                whileHover={{ scale: landlordNumber ? 1.05 : 1 }}
                whileTap={{ scale: landlordNumber ? 0.95 : 1 }}
                href={
                  landlordNumber ? `https://wa.me/+91${landlordNumber}` : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                  landlordNumber
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none"
                }`}
              >
                <FaWhatsapp size={16} />
                <span className="text-sm">WhatsApp</span>
              </motion.a>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: loading || dateTimeError ? 1 : 1.02 }}
            whileTap={{ scale: loading || dateTimeError ? 1 : 0.98 }}
            disabled={loading || !!dateTimeError}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
              loading || dateTimeError
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-gradient-to-r from-[#FF6B00] via-[#FF8C3A] to-[#FFB347] text-white hover:shadow-xl hover:shadow-orange-500/50"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Booking Your Visit...
              </span>
            ) : dateTimeError ? (
              "Please Select Valid Date"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FaCalendarAlt />
                Schedule Tour
              </span>
            )}
          </motion.button>
        </motion.form>

        {/* Info Footer */}
        <div className="mt-6 pt-5 border-t border-gray-200">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="text-blue-600" size={14} />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-800 mb-1">Important Note</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Please arrive on time for your scheduled visit. Our property manager will contact you 30 minutes before your tour.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleTourBox;