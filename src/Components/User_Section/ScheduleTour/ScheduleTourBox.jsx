import React, { useState, useEffect } from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaCalendarAlt,
  FaFacebookMessenger,
  FaExclamationTriangle,
  FaUser,
  FaUsers,
  FaClock,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl";

const ScheduleTourBox = () => {
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("Morning (9AM-12PM)");
  const [visitType, setVisitType] = useState("Physical");
  const [numberOfVisitors, setNumberOfVisitors] = useState(1);
  const [purpose, setPurpose] = useState("Rent");
  const [message, setMessage] = useState("");
  const [visitorDetails, setVisitorDetails] = useState([
    { name: "", relation: "Self", phone: "" },
  ]);
  const [error, setError] = useState(null);
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

  // Add visitor detail
  const addVisitor = () => {
    if (visitorDetails.length < 5) {
      setVisitorDetails([...visitorDetails, { name: "", relation: "Self", phone: "" }]);
      setNumberOfVisitors(visitorDetails.length + 1);
    }
  };

  // Remove visitor detail
  const removeVisitor = (index) => {
    if (visitorDetails.length > 1) {
      const updated = visitorDetails.filter((_, i) => i !== index);
      setVisitorDetails(updated);
      setNumberOfVisitors(updated.length);
    }
  };

  // Update visitor detail
  const updateVisitor = (index, field, value) => {
    const updated = [...visitorDetails];
    updated[index][field] = value;
    setVisitorDetails(updated);
  };

  const validateForm = () => {
    if (!preferredDate) {
      setError("Please select a preferred date");
      return false;
    }
    if (!preferredTimeSlot) {
      setError("Please select a time slot");
      return false;
    }
    if (!visitType) {
      setError("Please select a visit type");
      return false;
    }
    if (!purpose) {
      setError("Please select a purpose");
      return false;
    }
    for (let i = 0; i < visitorDetails.length; i++) {
      const visitor = visitorDetails[i];
      if (!visitor.name.trim()) {
        setError(`Please enter name for visitor ${i + 1}`);
        return false;
      }
      if (!visitor.phone.trim() || visitor.phone.length !== 10) {
        setError(`Please enter valid 10-digit phone for visitor ${i + 1}`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(error, {
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
    setSuccess(false);
    
    try {
      const response = await fetch(`${baseurl}api/visits/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: id,
          preferredDate: preferredDate,
          preferredTimeSlot: preferredTimeSlot,
          visitType: visitType,
          numberOfVisitors: numberOfVisitors,
          purpose: purpose,
          message: message,
          visitorDetails: visitorDetails,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok && data.success) {
        const successMessage = data.message || "Visit successfully scheduled!";
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 5000,
          pauseOnHover: true,
        });
        setSuccess(true);
        // Dispatch custom event to notify navbar to refetch visit count
        window.dispatchEvent(new Event('visitBooked'));
        setTimeout(() => {
          setPreferredDate("");
          setPreferredTimeSlot("Morning (9AM-12PM)");
          setVisitType("Physical");
          setNumberOfVisitors(1);
          setPurpose("Rent");
          setMessage("");
          setVisitorDetails([{ name: "", relation: "Self", phone: "" }]);
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
          {/* Preferred Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Date
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]">
                <FaCalendarAlt size={18} />
              </div>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all"
                required
              />
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Time Slot
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]">
                <FaClock size={18} />
              </div>
              <select
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all appearance-none"
              >
                <option value="Morning (9AM-12PM)">Morning (9AM-12PM)</option>
                <option value="Afternoon (12PM-4PM)">Afternoon (12PM-4PM)</option>
                <option value="Evening (4PM-7PM)">Evening (4PM-7PM)</option>
              </select>
            </div>
          </div>

          {/* Visit Type & Purpose - Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Visit Type
              </label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all appearance-none"
              >
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all appearance-none"
              >
                <option value="Rent">Rent</option>
                <option value="Buy">Buy</option>
                <option value="Investment">Investment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Visitor Details */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaUsers size={16} />
              Visitor Details
            </label>
            {visitorDetails.map((visitor, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 mb-3">
                  Visitor {index + 1}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    value={visitor.name}
                    onChange={(e) => updateVisitor(index, "name", e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={visitor.relation}
                      onChange={(e) => updateVisitor(index, "relation", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all appearance-none"
                    >
                      <option value="Self">Self</option>
                      <option value="Family">Family</option>
                      <option value="Friend">Friend</option>
                      <option value="Colleague">Colleague</option>
                      <option value="Agent">Agent</option>
                    </select>
                    <input
                      type="number"
                      value={visitor.phone}
                      onChange={(e) => updateVisitor(index, "phone", e.target.value)}
                      placeholder="10-digit Phone"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all"
                      required
                      pattern="[0-9]{10}"
                    />
                  </div>
                </div>
                {visitorDetails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVisitor(index)}
                    className="mt-3 text-red-500 text-sm hover:text-red-700 font-medium"
                  >
                    Remove Visitor
                  </button>
                )}
              </div>
            ))}
            {visitorDetails.length < 5 && (
              <button
                type="button"
                onClick={addVisitor}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all text-sm font-medium"
              >
                + Add Another Visitor
              </button>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Message (Optional)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-4 text-[#FF6B00]">
                <FaFacebookMessenger size={18} />
              </div>
              <textarea
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
              loading
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-gradient-to-r from-[#FF6B00] via-[#FF8C3A] to-[#FFB347] text-white hover:shadow-xl hover:shadow-orange-500/50"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Booking Your Visit...
              </span>
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
