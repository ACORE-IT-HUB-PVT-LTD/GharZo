import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";
import {
  FaArrowLeft,
  FaEye,
  FaCheck,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

const VisitRequest = () => {
  const [visits, setVisits] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});
  const [error, setError] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const token = localStorage.getItem("token");

  // Detect sidebar hover state
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);

      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  // --- UI Colors ---
  const primaryColor = "#5C4EFF";
  const accentColor = "#1fc9b2";
  const logoBg = "bg-gradient-to-br from-[#e7eaff] via-white to-[#7cf7b7]";
  const cardGradient = "bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] hover:from-[#00AEEA] hover:to-[#00E099]";

  // Fetch visits data with optional status filter
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        console.log("Fetching visits with token:", token);
        let url = `${baseurl}api/visits/landlord`;
        if (selectedStatus) {
          url += `?status=${selectedStatus}`;
        }
        console.log("Fetch URL:", url);
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Visit Requests Response:", response.data);
        if (response.data.success) {
          setVisits(response.data.visits);
          setTotalVisits(response.data.totalVisits);
          setStatusCounts(response.data.statusCounts || {});
          setError(null);
        } else {
          setError(
            "Failed to fetch visit requests. Check server configuration."
          );
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError(
            "Access denied (403). You may need a 'landlord' role token. Please log in with the correct account or contact support."
          );
        } else {
          setError(
            `Error fetching visit requests: ${err.message}. Ensure the API supports 'status' filter.`
          );
        }
        console.error(err);
      }
    };

    if (token) {
      fetchVisits();
    } else {
      setError("Please log in to view visit requests.");
    }
  }, [token, selectedStatus]);

  // Open visit details directly from list data
  const openVisitDetails = (visit) => {
    setSelectedVisit(visit);
    setIsModalOpen(true);
    setError(null);
  };

  // Handle confirm visit
  const handleConfirmVisit = async (visitId) => {
    if (!confirmationNotes || !meetingPoint) {
      setError("Please fill in both confirmation notes and meeting point.");
      return;
    }

    try {
      const response = await axios.put(
        `${baseurl}api/visits/${visitId}/confirm`,
        {
          confirmationNotes,
          meetingPoint,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const updatedVisits = visits.map((visit) =>
          visit._id === visitId
            ? { ...visit, status: "confirmed", confirmationNotes, meetingPoint }
            : visit
        );
        setVisits(updatedVisits);

        const updatedStatusCounts = { ...statusCounts };
        if (
          updatedStatusCounts[visits.find((v) => v._id === visitId)?.status]
        ) {
          updatedStatusCounts[
            visits.find((v) => v._id === visitId)?.status
          ] -= 1;
        }
        updatedStatusCounts.confirmed =
          (updatedStatusCounts.confirmed || 0) + 1;
        setStatusCounts(updatedStatusCounts);

        setError(null);
        setIsConfirmModalOpen(false);
        setConfirmationNotes("");
        setMeetingPoint("");
      } else {
        setError("Failed to confirm visit request.");
      }
    } catch (err) {
      setError("Error confirming visit request. Please try again.");
      console.error(err);
    }
  };

  // Handle cancel visit
  const handleCancelVisit = async (visitId) => {
    if (!cancellationReason) {
      setError("Please provide a cancellation reason.");
      return;
    }

    try {
      const response = await axios.put(
        `${baseurl}api/visits/${visitId}/cancel`,
        {
          cancellationReason,
          meetingPoint,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const updatedVisits = visits.map((visit) =>
          visit._id === visitId
            ? { ...visit, status: "cancelled", cancellationReason }
            : visit
        );
        setVisits(updatedVisits);

        const updatedStatusCounts = { ...statusCounts };
        if (
          updatedStatusCounts[visits.find((v) => v._id === visitId)?.status]
        ) {
          updatedStatusCounts[
            visits.find((v) => v._id === visitId)?.status
          ] -= 1;
        }
        updatedStatusCounts.cancelled =
          (updatedStatusCounts.cancelled || 0) + 1;
        setStatusCounts(updatedStatusCounts);

        setError(null);
        setIsCancelModalOpen(false);
        setCancellationReason("");
        setMeetingPoint("");
      } else {
        setError("Failed to cancel visit request.");
      }
    } catch (err) {
      setError("Error canceling visit request. Please try again.");
      console.error(err);
    }
  };

  // Handle complete visit
  const handleCompleteVisit = async (visitId) => {
    if (!completionNotes || !feedback) {
      setError("Please fill in both completion notes and feedback.");
      return;
    }

    try {
      const response = await axios.put(
        `${baseurl}api/visits/${visitId}/complete`,
        {
          completionNotes,
          feedback,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const updatedVisits = visits.map((visit) =>
          visit._id === visitId
            ? { ...visit, status: "completed", completionNotes, feedback }
            : visit
        );
        setVisits(updatedVisits);

        const updatedStatusCounts = { ...statusCounts };
        if (
          updatedStatusCounts[visits.find((v) => v._id === visitId)?.status]
        ) {
          updatedStatusCounts[
            visits.find((v) => v._id === visitId)?.status
          ] -= 1;
        }
        updatedStatusCounts.completed =
          (updatedStatusCounts.completed || 0) + 1;
        setStatusCounts(updatedStatusCounts);

        setError(null);
        setIsCompleteModalOpen(false);
        setCompletionNotes("");
        setFeedback("");
      } else {
        setError("Failed to complete visit request.");
      }
    } catch (err) {
      setError("Error completing visit request. Please try again.");
      console.error(err);
    }
  };

  // Close modals
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVisit(null);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmationNotes("");
    setMeetingPoint("");
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setCancellationReason("");
    setMeetingPoint("");
  };

  const closeCompleteModal = () => {
    setIsCompleteModalOpen(false);
    setCompletionNotes("");
    setFeedback("");
  };

  // Group visits by date
  const groupVisitsByDate = (visits) => {
    const grouped = {};
    visits.forEach((visit) => {
      const dateKey = visit.visitDateFormatted
        ? visit.visitDateFormatted.split(" at ")[0]
        : "Unknown Date";
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(visit);
    });
    return grouped;
  };

  const groupedVisits = groupVisitsByDate(visits);

  const icon3DStyle =
    "drop-shadow-lg transform scale-110 hover:scale-125 transition-transform duration-300";

  return (
    <div
      className={`min-h-screen ${logoBg} text-gray-800 p-2 sm:p-4 transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className={`bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-4 border-[${primaryColor}]`}>
          <div className="flex items-center gap-3">
            <Link
              to="/landlord"
              className={`flex items-center gap-2 text-[${primaryColor}] hover:text-[${primaryColor}]/80 transition-colors`}
            >
              <FaArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <h1 className={`text-2xl sm:text-3xl font-bold text-[${primaryColor}] tracking-tight`}>
              Visit Requests
            </h1>
          </div>
          <p className={`text-[${accentColor}] mt-1 text-sm`}>
            Manage and track all incoming visit requests for your properties.
          </p>
        </header>

        {/* Status Filter Dropdown */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <label htmlFor="status-filter" className="mr-2 font-semibold text-gray-700">
              Filter by Status:
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all bg-white text-gray-800`}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={`text-center p-6 rounded-xl ${cardGradient} text-white shadow-lg transition duration-300 transform hover:scale-105`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <p className="text-3xl font-bold">{totalVisits}</p>
            <p className="text-sm font-medium opacity-90 mt-1">Total Visits</p>
          </motion.div>
          <motion.div
            className={`text-center p-6 rounded-xl ${cardGradient} text-white shadow-lg transition duration-300 transform hover:scale-105`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-3xl font-bold">{statusCounts.pending || 0}</p>
            <p className="text-sm font-medium opacity-90 mt-1">Pending</p>
          </motion.div>
          <motion.div
            className={`text-center p-6 rounded-xl ${cardGradient} text-white shadow-lg transition duration-300 transform hover:scale-105`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-3xl font-bold">{statusCounts.confirmed || 0}</p>
            <p className="text-sm font-medium opacity-90 mt-1">Confirmed</p>
          </motion.div>
          <motion.div
            className={`text-center p-6 rounded-xl ${cardGradient} text-white shadow-lg transition duration-300 transform hover:scale-105`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <p className="text-3xl font-bold">{statusCounts.cancelled || 0}</p>
            <p className="text-sm font-medium opacity-90 mt-1">Cancelled</p>
          </motion.div>
          <motion.div
            className={`text-center p-6 rounded-xl ${cardGradient} text-white shadow-lg transition duration-300 transform hover:scale-105`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <p className="text-3xl font-bold">{statusCounts.completed || 0}</p>
            <p className="text-sm font-medium opacity-90 mt-1">Completed</p>
          </motion.div>
        </motion.div>

        {/* Visits Table Grouped by Date */}
        <motion.div
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className={`text-xl font-semibold text-[${primaryColor}] mb-2`}>Visit Details</h2>
            <p className="text-gray-600 text-sm">Grouped by date for easy tracking.</p>
          </div>
          {Object.keys(groupedVisits).length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Visits Found</h3>
              <p className="text-gray-500">No visit requests available at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedVisits).map(([date, visitsOnDate]) => (
                <div key={date} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {visitsOnDate.length} Visits
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Visit Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Feedback</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {visitsOnDate.map((visit) => {
                          const userName = visit.userId?.name || visit.userInfo?.name || "N/A";
                          const userMobile = visit.userId?.mobile || visit.userInfo?.mobile || "";
                          return (
                            <tr key={visit._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate">
                                {visit.propertyId?.name || visit.propertyInfo?.name || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-md truncate">
                                {visit.propertyId?.address || visit.propertyInfo?.address || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={`${userName}${userMobile ? ` - ${userMobile}` : ""}`}>
                                  <div>{userName}</div>
                                  {userMobile && <div className="text-xs text-gray-500 truncate">{userMobile}</div>}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {visit.visitDateFormatted || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    visit.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : visit.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : visit.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {visit.status
                                    ? visit.status.charAt(0).toUpperCase() + visit.status.slice(1)
                                    : "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={visit.notes || "No notes"}>
                                {visit.notes || "No notes"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={visit.feedback?.comment || "No feedback"}>
                                {visit.feedback?.comment || "No feedback"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => openVisitDetails(visit)}
                                    className={`text-[${primaryColor}] hover:text-[${primaryColor}]/80 transition-colors p-1 rounded-full hover:bg-[${primaryColor}]/10`}
                                    title="View Details"
                                  >
                                    <FaEye className="w-4 h-4" />
                                  </button>
                                  {visit.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setSelectedVisit(visit);
                                          setIsConfirmModalOpen(true);
                                        }}
                                        className="text-green-500 hover:text-green-700 transition-colors p-1 rounded-full hover:bg-green-100"
                                        title="Confirm Visit"
                                      >
                                        <FaCheck className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedVisit(visit);
                                          setIsCancelModalOpen(true);
                                        }}
                                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                                        title="Cancel Visit"
                                      >
                                        <FaTimes className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  {visit.status === "confirmed" && (
                                    <button
                                      onClick={() => {
                                        setSelectedVisit(visit);
                                        setIsCompleteModalOpen(true);
                                      }}
                                      className="text-green-500 hover:text-green-700 transition-colors p-1 rounded-full hover:bg-green-100"
                                      title="Complete Visit"
                                    >
                                      <FaCheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Modal for Visit Details */}
        {isModalOpen && selectedVisit && (() => {
          const userName = selectedVisit.userId?.name || selectedVisit.userInfo?.name || "N/A";
          const userMobile = selectedVisit.userId?.mobile || selectedVisit.userInfo?.mobile || "N/A";
          const visitDate = selectedVisit.visitDateFormatted || "N/A";
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Visit Details</h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Property</label>
                      <p className="text-gray-900">{selectedVisit.propertyId?.name || selectedVisit.propertyInfo?.name || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900">{selectedVisit.propertyId?.address || selectedVisit.propertyInfo?.address || "N/A"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">User</label>
                      <p className="text-gray-900">{userName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile</label>
                      <p className="text-gray-900">{userMobile}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Visit Date</label>
                    <p className="text-gray-900">{visitDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedVisit.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedVisit.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : selectedVisit.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedVisit.status
                        ? selectedVisit.status.charAt(0).toUpperCase() + selectedVisit.status.slice(1)
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                    <p className="text-gray-900">{selectedVisit.notes || "No notes"}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmation Notes</label>
                      <p className="text-gray-900">{selectedVisit.confirmationNotes || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Meeting Point</label>
                      <p className="text-gray-900">{selectedVisit.meetingPoint || "N/A"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Cancellation Reason</label>
                      <p className="text-gray-900">{selectedVisit.cancellationReason || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Feedback</label>
                      <p className="text-gray-900">{selectedVisit.feedback?.comment || "No feedback"}</p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={closeModal}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-xl font-medium transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}

        {/* Modal for Confirm Visit */}
        {isConfirmModalOpen && selectedVisit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Confirm Visit</h3>
                  <button
                    onClick={closeConfirmModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmation Notes *</label>
                  <textarea
                    value={confirmationNotes}
                    onChange={(e) => setConfirmationNotes(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    placeholder="Enter confirmation notes..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Point *</label>
                  <input
                    type="text"
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    placeholder="Enter meeting point..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={closeConfirmModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmVisit(selectedVisit._id)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-medium shadow-lg transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal for Cancel Visit */}
        {isCancelModalOpen && selectedVisit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Cancel Visit</h3>
                  <button
                    onClick={closeCancelModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cancellation Reason *</label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    placeholder="Enter cancellation reason..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Point (Optional)</label>
                  <input
                    type="text"
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    placeholder="Enter meeting point..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={closeCancelModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCancelVisit(selectedVisit._id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-xl font-medium shadow-lg transition-all"
                  >
                    Cancel Visit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal for Complete Visit */}
        {isCompleteModalOpen && selectedVisit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Complete Visit</h3>
                  <button
                    onClick={closeCompleteModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Completion Notes *</label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    placeholder="Enter completion notes..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback *</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    placeholder="Enter feedback..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={closeCompleteModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCompleteVisit(selectedVisit._id)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-medium shadow-lg transition-all"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitRequest;