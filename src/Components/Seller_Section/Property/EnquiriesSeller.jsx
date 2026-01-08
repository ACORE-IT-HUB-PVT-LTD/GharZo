import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaUserAlt,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const EnquiriesSeller = () => {
  const [allVisits, setAllVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const showDialog = (title, message) => {
    setModalContent({ title, message });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear + i);
  };

  const getStatusConfig = (status) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case "CONFIRMED":
        return {
          icon: FaCheckCircle,
          color: "bg-green-100 text-green-800 border-green-200",
          iconColor: "text-green-600",
          text: "Confirmed"
        };
      case "SCHEDULED":
        return {
          icon: FaHourglassHalf,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          iconColor: "text-yellow-600",
          text: "Scheduled"
        };
      case "CANCELLED":
        return {
          icon: FaTimesCircle,
          color: "bg-red-100 text-red-800 border-red-200",
          iconColor: "text-red-600",
          text: "Cancelled"
        };
      default:
        return {
          icon: FaHourglassHalf,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          iconColor: "text-gray-600",
          text: status || "Pending"
        };
    }
  };

  useEffect(() => {
    const fetchAllVisits = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("sellertoken");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }
        console.log("Fetching visits with token:", token.substring(0, 20) + "...");
        const res = await axios.get(`${baseurl}api/seller/getallvisits`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched visits:", res.data);
        if (res.data && Array.isArray(res.data.visits)) {
          setAllVisits(res.data.visits);
          setFilteredVisits(res.data.visits);
        } else {
          setAllVisits([]);
          setFilteredVisits([]);
          setError("No visits data found in response.");
        }
      } catch (err) {
        console.error("Error fetching visits:", err);
        setAllVisits([]);
        setFilteredVisits([]);
        setError(
          err.response?.status === 401
            ? "Unauthorized access. Please log in again."
            : err.response?.status === 404
            ? "Visits endpoint not found. Please check the API."
            : err.response?.data?.message || err.message || "Failed to fetch visits."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAllVisits();
  }, []);

  // Filter visits based on selected date (progressive filtering)
  useEffect(() => {
    const filtered = allVisits.filter((visit) => {
      if (!visit.scheduledDate) return false;
      const visitDate = new Date(visit.scheduledDate);
      const visitYear = visitDate.getFullYear().toString();
      const visitMonth = (visitDate.getMonth() + 1).toString().padStart(2, '0');
      const visitDay = visitDate.getDate().toString().padStart(2, '0');

      // Match year if selected
      if (selectedYear && visitYear !== selectedYear) return false;

      // Match month if selected
      if (selectedMonth && visitMonth !== selectedMonth) return false;

      // Match day if selected
      if (selectedDay && visitDay !== selectedDay) return false;

      return true;
    });
    setFilteredVisits(filtered);
  }, [selectedYear, selectedMonth, selectedDay, allVisits]);

  const openDetailsModal = (visit) => {
    setSelectedVisit(visit);
    setActionError(null);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedVisit(null);
    setActionError(null);
  };

  const openConfirmModal = (visit) => {
    setSelectedVisit(visit);
    setConfirmationNotes('');
    setMeetingPoint('');
    setActionError(null);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedVisit(null);
    setConfirmationNotes('');
    setMeetingPoint('');
    setActionError(null);
  };

  const openCancelModal = (visit) => {
    setSelectedVisit(visit);
    setCancelReason('');
    setActionError(null);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedVisit(null);
    setCancelReason('');
    setActionError(null);
  };

  // Cancel visit API call
  const handleCancelVisit = async () => {
    if (!selectedVisit || !cancelReason.trim()) {
      setActionError("Please provide a reason for cancellation.");
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      console.log("Cancelling visit ID:", selectedVisit._id);
      const res = await axios.post(
        `${baseurl}api/seller/cancel-visit/${selectedVisit._id}`,
        { reason: cancelReason },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Cancel visit response:", res.data);
      if (res.data.success) {
        showDialog("Success", "Visit cancelled successfully!");
        const updatedVisits = allVisits.map(v => v._id === res.data.visit._id ? res.data.visit : v);
        setAllVisits(updatedVisits);
        let filterDate = '';
        if (selectedYear && selectedMonth && selectedDay) {
          filterDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${selectedDay.padStart(2, '0')}`;
        }
        if (filterDate) {
          const updatedFiltered = updatedVisits.filter(v => {
            const visitDate = new Date(v.scheduledDate).toISOString().split("T")[0];
            return visitDate === filterDate;
          });
          setFilteredVisits(updatedFiltered);
        } else {
          setFilteredVisits(updatedVisits);
        }
        setTimeout(() => {
          closeModal();
          closeCancelModal();
        }, 2000);
      } else {
        setActionError("Failed to cancel visit.");
      }
    } catch (err) {
      console.error("Error cancelling visit:", err);
      setActionError(
        err.response?.status === 500
          ? "Server error while cancelling visit. Please try again or contact support."
          : err.response?.data?.message || err.message || "Failed to cancel visit."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm visit API call
  const handleConfirmVisit = async () => {
    if (!selectedVisit) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      console.log("Confirming visit ID:", selectedVisit._id);
      const res = await axios.post(
        `${baseurl}api/seller/confirm-visit/${selectedVisit._id}`,
        {
          confirmationNotes,
          meetingPoint
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Confirm visit response:", res.data);
      if (res.data.success) {
        showDialog("Success", "Visit confirmed successfully!");
        const updatedVisits = allVisits.map(v => v._id === res.data.visit._id ? res.data.visit : v);
        setAllVisits(updatedVisits);
        let filterDate = '';
        if (selectedYear && selectedMonth && selectedDay) {
          filterDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${selectedDay.padStart(2, '0')}`;
        }
        if (filterDate) {
          const updatedFiltered = updatedVisits.filter(v => {
            const visitDate = new Date(v.scheduledDate).toISOString().split("T")[0];
            return visitDate === filterDate;
          });
          setFilteredVisits(updatedFiltered);
        } else {
          setFilteredVisits(updatedVisits);
        }
        setTimeout(() => {
          closeModal();
          closeConfirmModal();
        }, 2000);
      } else {
        setActionError("Failed to confirm visit.");
      }
    } catch (err) {
      console.error("Error confirming visit:", err);
      setActionError(
        err.response?.status === 500
          ? "Server error while confirming visit. Please try again or contact support."
          : err.response?.data?.message || err.message || "Failed to confirm visit."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-500 text-center">Loading visits...</p>;
    }

    if (error) {
      return <p className="text-red-500 text-center">{error}</p>;
    }

    if (!filteredVisits?.length) {
      return <p className="text-gray-500 text-center">No visits found for the selected date.</p>;
    }

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVisits.map((item, index) => {
          const displayItem = {
            property: item.propertyId?.name || "N/A",
            user: item.name || item.userId?.email || "N/A",
            status: item.status || "Pending",
            date: item.scheduledDate
              ? new Date(item.scheduledDate).toISOString().split("T")[0]
              : null,
            time: item.scheduledDate
              ? new Date(item.scheduledDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null,
            fullData: item,
          };

          const statusConfig = getStatusConfig(displayItem.status);
          const StatusIcon = statusConfig.icon;

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white border border-gray-200 p-5 rounded-xl shadow-lg hover:shadow-purple-500/20 transition"
            >
              <h3 className="flex items-center gap-2 text-purple-600 text-lg font-semibold mb-2">
                <FaHome className="text-blue-500 drop-shadow-lg" />
                {displayItem.property || "N/A"}
              </h3>
              <p className="flex items-center gap-2 text-gray-700 text-sm">
                <FaUserAlt className="text-green-500 drop-shadow-lg" /> User:{" "}
                {displayItem.user || "N/A"}
              </p>
              {displayItem.date && (
                <p className="flex items-center gap-2 text-gray-700 text-sm">
                  <FaCalendarAlt className="text-yellow-500 drop-shadow-lg" /> Date:{" "}
                  {displayItem.date}
                </p>
              )}
              {displayItem.time && (
                <p className="flex items-center gap-2 text-gray-700 text-sm">
                  <FaClock className="text-pink-500 drop-shadow-lg" /> Time:{" "}
                  {displayItem.time}
                </p>
              )}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${statusConfig.color}`}>
                <StatusIcon className={`mr-2 ${statusConfig.iconColor} drop-shadow-sm`} />
                {statusConfig.text}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => openDetailsModal(displayItem.fullData)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium flex items-center justify-center gap-1"
                >
                  <FaEye /> View Details
                </button>
                {displayItem.status.toUpperCase() === "SCHEDULED" && (
                  <button
                    onClick={() => openConfirmModal(displayItem.fullData)}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                  >
                    Confirm Visit
                  </button>
                )}
                {(displayItem.status.toUpperCase() === "SCHEDULED" || displayItem.status.toUpperCase() === "CONFIRMED") && (
                  <button
                    onClick={() => openCancelModal(displayItem.fullData)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                  >
                    Cancel Visit
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderDetailsModal = () => (
    <AnimatePresence>
      {showDetailsModal && selectedVisit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDetailsModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-600 flex items-center gap-2">
                <FaInfoCircle /> Visit Details
              </h3>
              <button onClick={closeDetailsModal} className="text-gray-500 hover:text-gray-700">
                <FaTimesCircle className="text-xl" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <FaHome className="text-blue-500" /> <strong>Property:</strong>{" "}
                {selectedVisit.propertyId?.name || "N/A"}<br />
                <FaMapMarkerAlt className="text-green-500 ml-6" />{" "}
                {selectedVisit.propertyId?.address || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaUserAlt className="text-indigo-500" /> <strong>User Name:</strong>{" "}
                {selectedVisit.name || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-orange-500" /> <strong>Email:</strong>{" "}
                {selectedVisit.email || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaPhoneAlt className="text-green-500" /> <strong>Mobile:</strong>{" "}
                {selectedVisit.mobile || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaCalendarAlt className="text-yellow-500" /> <strong>Scheduled Date:</strong>{" "}
                {selectedVisit.scheduledDate
                  ? new Date(selectedVisit.scheduledDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaClock className="text-pink-500" /> <strong>Scheduled Time:</strong>{" "}
                {selectedVisit.scheduledDate
                  ? new Date(selectedVisit.scheduledDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaInfoCircle className="text-purple-500" /> <strong>Purpose:</strong>{" "}
                {selectedVisit.purpose || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaEdit className="text-gray-500" /> <strong>Notes:</strong>{" "}
                {selectedVisit.notes || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaCheckCircle
                  className={
                    selectedVisit.status === "CONFIRMED" ? "text-green-500" : "text-yellow-500"
                  }
                />{" "}
                <strong>Status:</strong> {selectedVisit.status || "N/A"}
              </p>
              <p className="flex items-center gap-2 text-xs text-gray-500">
                <strong>Created:</strong>{" "}
                {selectedVisit.createdAt
                  ? new Date(selectedVisit.createdAt).toLocaleString()
                  : "N/A"}
              </p>
              <p className="flex items-center gap-2 text-xs text-gray-500">
                <strong>Updated:</strong>{" "}
                {selectedVisit.updatedAt
                  ? new Date(selectedVisit.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderConfirmModal = () => (
    <AnimatePresence>
      {showConfirmModal && selectedVisit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeConfirmModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-600 flex items-center gap-2">
                <FaCheckCircle /> Confirm Visit
              </h3>
              <button onClick={closeConfirmModal} className="text-gray-500 hover:text-gray-700">
                <FaTimesCircle className="text-xl" />
              </button>
            </div>
            {actionError && (
              <p className="text-red-500 flex items-center gap-2 mb-3">
                <FaExclamationTriangle /> {actionError}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation Notes</label>
                <textarea
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Enter confirmation notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Point</label>
                <input
                  type="text"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter meeting point..."
                />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVisit}
                disabled={actionLoading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-1"
              >
                {actionLoading ? "Confirming..." : (
                  <>
                    <FaCheckCircle /> Confirm
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderCancelModal = () => (
    <AnimatePresence>
      {showCancelModal && selectedVisit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeCancelModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <FaTimesCircle /> Cancel Visit
              </h3>
              <button onClick={closeCancelModal} className="text-gray-500 hover:text-gray-700">
                <FaTimesCircle className="text-xl" />
              </button>
            </div>
            {actionError && (
              <p className="text-red-500 flex items-center gap-2 mb-3">
                <FaExclamationTriangle /> {actionError}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button
                onClick={closeCancelModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelVisit}
                disabled={actionLoading || !cancelReason.trim()}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-1"
              >
                {actionLoading ? "Cancelling..." : (
                  <>
                    <FaTimesCircle /> Confirm Cancel
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Dialog Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closeModal}></div>
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full border border-green-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{modalContent.title}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle />
                </button>
              </div>
              <p className="text-sm text-green-600">
                {modalContent.message}
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="p-6 sm:p-10 max-w-7xl mx-auto bg-white min-h-screen relative">
        <h2 className="text-3xl mt-20 font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 drop-shadow-lg">
          All Visits
        </h2>

        {/* Date Filter */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
            <FaCalendarAlt className="text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="outline-none text-gray-700 p-2 border rounded"
            >
              <option value="">Year</option>
              {generateYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="outline-none text-gray-700 p-2 border rounded"
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const monthValue = String(m).padStart(2, "0");
                return (
                  <option key={monthValue} value={monthValue}>
                    {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                  </option>
                );
              })}
            </select>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="outline-none text-gray-700 p-2 border rounded"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                const dayValue = String(d).padStart(2, "0");
                return (
                  <option key={dayValue} value={dayValue}>
                    {d}
                  </option>
                );
              })}
            </select>
            {(selectedYear || selectedMonth || selectedDay) && (
              <button
                onClick={() => {
                  setSelectedYear("");
                  setSelectedMonth("");
                  setSelectedDay("");
                }}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-2xl">
          {renderContent()}
        </div>

        {renderDetailsModal()}
        {renderConfirmModal()}
        {renderCancelModal()}
      </div>
    </>
  );
};

export default EnquiriesSeller;