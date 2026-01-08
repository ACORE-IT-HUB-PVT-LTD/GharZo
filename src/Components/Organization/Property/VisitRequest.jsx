import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";
import {
  FaArrowLeft,
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

const OrganizationVisitRequest = () => {
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
  // Use orgToken instead of token
  const token = localStorage.getItem("orgToken");

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

  // Fetch visit by ID
  const fetchVisitById = async (visitId) => {
    try {
      console.log("Fetching visit by ID:", visitId);
      const response = await axios.get(`${baseurl}api/visits/${visitId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Visit Details Response:", response.data);
      if (response.data.success) {
        setSelectedVisit(response.data.visit);
        setIsModalOpen(true);
        setError(null);
      } else {
        setError("Failed to fetch visit details.");
      }
    } catch (err) {
      setError("Error fetching visit details. Please try again.");
      console.error(err);
    }
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

  // Handle delete visit
  const handleDeleteVisit = async (visitId) => {
    if (
      !window.confirm("Are you sure you want to delete this visit request?")
    ) {
      return;
    }

    try {
      const response = await axios.delete(`${baseurl}api/visits/${visitId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        const updatedVisits = visits.filter((visit) => visit._id !== visitId);
        setVisits(updatedVisits);
        setTotalVisits(updatedVisits.length);

        const updatedStatusCounts = { ...statusCounts };
        const deletedVisit = visits.find((visit) => visit._id === visitId);
        if (deletedVisit && updatedStatusCounts[deletedVisit.status]) {
          updatedStatusCounts[deletedVisit.status] -= 1;
          setStatusCounts(updatedStatusCounts);
        }

        setError(null);
      } else {
        setError("Failed to delete visit request.");
      }
    } catch (err) {
      setError("Error deleting visit request. Please try again.");
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
    <div className="px-4 sm:px-10 lg:px-20 py-2 max-w-screen-2xl mx-auto w-full min-h-screen text-black">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-6 text-center">
          {error}
        </div>
      )}

      {/* Header */}
      <motion.h2
        className="text-3xl font-extrabold text-center mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Visit Requests
      </motion.h2>

      {/* Back to Dashboard */}
      <Link
        to="/landlord"
        className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6"
      >
        <FaArrowLeft className={icon3DStyle} /> Back to Dashboard
      </Link>

      {/* Status Filter Dropdown */}
      <div className="mb-6">
        <label htmlFor="status-filter" className="mr-2 font-semibold">
          Filter by Status:
        </label>
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border rounded bg-white text-black"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Summary Cards */}
      <motion.div
        className="bg-darkblue-800 rounded-xl shadow-lg p-6 mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h5 className="font-semibold mb-4 text-white">Visit Summary</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            className="text-center p-4 rounded-lg bg-gradient-to-r from-[#00C4CC] to-[#00FF95] text-white shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <p className="text-lg font-bold">{totalVisits}</p>
            <p className="text-sm">Total Visits</p>
          </motion.div>
          <motion.div
            className="text-center p-4 rounded-lg bg-gradient-to-r from-[#00C4CC] to-[#00FF95] text-white shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-lg font-bold">{statusCounts.pending || 0}</p>
            <p className="text-sm">Pending</p>
          </motion.div>
          <motion.div
            className="text-center p-4 rounded-lg bg-gradient-to-r from-[#00C4CC] to-[#00FF95] text-white shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-lg font-bold">{statusCounts.confirmed || 0}</p>
            <p className="text-sm">Confirmed</p>
          </motion.div>
          <motion.div
            className="text-center p-4 rounded-lg bg-gradient-to-r from-[#00C4CC] to-[#00FF95] text-white shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <p className="text-lg font-bold">{statusCounts.cancelled || 0}</p>
            <p className="text-sm">Cancelled</p>
          </motion.div>
          <motion.div
            className="text-center p-4 rounded-lg bg-gradient-to-r from-[#00C4CC] to-[#00FF95] text-white shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <p className="text-lg font-bold">{statusCounts.completed || 0}</p>
            <p className="text-sm">Completed</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Visits Table Grouped by Date */}
      <motion.div
        className="bg-darkblue-800 rounded-xl shadow-lg p-6 overflow-x-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h5 className="font-semibold mb-4 text-white">Visit Details</h5>
        {Object.keys(groupedVisits).length === 0 && (
          <div className="text-white text-center py-8">
            No visit requests found.
          </div>
        )}
        {Object.entries(groupedVisits).map(([date, visitsOnDate]) => (
          <div key={date} className="mb-8">
            <div className="text-lg font-bold text-blue-300 mb-2">{date}</div>
            <table className="min-w-full text-sm text-black mb-4">
              <thead>
                <tr className="bg-darkblue-700">
                  <th className="px-4 py-3 text-left font-bold w-32 sm:w-40">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left font-bold w-48 sm:w-64">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left font-bold w-32 sm:w-40">
                    Visit Date
                  </th>
                  <th className="px-4 py-3 text-left font-bold w-24 sm:w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-bold w-40 sm:w-48">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-left font-bold w-40 sm:w-48">
                    Feedback
                  </th>
                  <th className="px-4 py-3 text-center font-bold w-48 sm:w-56">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visitsOnDate.map((visit) => (
                  <tr
                    key={visit._id}
                    className="border-b border-gray-600 hover:bg-darkblue-600 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 border border-gray-600 w-32 sm:w-40 truncate">
                      {visit.propertyId?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 w-48 sm:w-64 max-w-48 sm:max-w-64 truncate">
                      {visit.propertyId?.address || "N/A"}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 w-32 sm:w-40 whitespace-nowrap">
                      {visit.visitDateFormatted || "N/A"}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 w-24 sm:w-32">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                          visit.status === "pending"
                            ? "bg-yellow-500 text-black"
                            : visit.status === "completed"
                            ? "bg-green-500 text-white"
                            : visit.status === "cancelled"
                            ? "bg-red-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {visit.status
                          ? visit.status.charAt(0).toUpperCase() +
                            visit.status.slice(1)
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 border border-gray-600 w-40 sm:w-48 max-w-40 sm:max-w-48 truncate">
                      {visit.notes || "No notes"}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 w-40 sm:w-48 max-w-40 sm:max-w-48 truncate">
                      {visit.feedback?.comment || "No feedback"}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 w-40 m:w-56 flex justify-center items-center space-x-3">
                      <button
                        onClick={() => fetchVisitById(visit._id)}
                        className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                        title="View Details"
                      >
                        <FaEye className={icon3DStyle} />
                      </button>
                      {visit.status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedVisit(visit);
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-green-500 hover:text-green-700 transition-colors duration-200"
                            title="Confirm Visit"
                          >
                            <FaCheck className={icon3DStyle} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVisit(visit);
                              setIsCancelModalOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                            title="Cancel Visit"
                          >
                            <FaTimes className={icon3DStyle} />
                          </button>
                        </>
                      )}
                      {visit.status === "confirmed" && (
                        <button
                          onClick={() => {
                            setSelectedVisit(visit);
                            setIsCompleteModalOpen(true);
                          }}
                          className="text-green-500 hover:text-green-700 transition-colors duration-200"
                          title="Complete Visit"
                        >
                          <FaCheckCircle className={icon3DStyle} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVisit(visit._id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="Delete Visit"
                      >
                        <FaTrash className={icon3DStyle} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </motion.div>

      {/* Modal for Visit Details */}
      {isModalOpen && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-gradient-to-r from-[#00C4CC] to-[#00FF95] rounded-xl p-6 w-full max-w-lg text-black border-4 border-gradient-to-r from-[#00C4CC] to-[#00FF95]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3
              className="text-xl font-bold mb-4 bg-blue-500 rounded-2xl text-white p-2"
              style={{ textAlign: "center" }}
            >
              Visit Details
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Property:</strong>{" "}
                {selectedVisit.propertyId?.name || "N/A"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {selectedVisit.propertyId?.address || "N/A"}
              </p>
              <p>
                <strong>Landlord:</strong>{" "}
                {selectedVisit.landlordId?.name || "N/A"}
              </p>
              <p>
                <strong>Landlord Email:</strong>{" "}
                {selectedVisit.landlordId?.email || "N/A"}
              </p>
              <p>
                <strong>Landlord Mobile:</strong>{" "}
                {selectedVisit.landlordId?.mobile || "N/A"}
              </p>
              <p>
                <strong>User:</strong> {selectedVisit.userId?.name || "N/A"}
              </p>
              <p>
                <strong>User Email:</strong>{" "}
                {selectedVisit.userId?.email || "N/A"}
              </p>
              <p>
                <strong>User Mobile:</strong>{" "}
                {selectedVisit.userId?.mobile || "N/A"}
              </p>
              <p>
                <strong>Visit Date:</strong>{" "}
                {selectedVisit.visitDateFormatted || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded ${
                    selectedVisit.status === "pending"
                      ? "bg-yellow-500 text-black"
                      : selectedVisit.status === "completed"
                      ? "bg-green-500 text-white"
                      : selectedVisit.status === "cancelled"
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {selectedVisit.status
                    ? selectedVisit.status.charAt(0).toUpperCase() +
                      selectedVisit.status.slice(1)
                    : "N/A"}
                </span>
              </p>
              <p>
                <strong>Notes:</strong> {selectedVisit.notes || "No notes"}
              </p>
              <p>
                <strong>Confirmation Notes:</strong>{" "}
                {selectedVisit.confirmationNotes || "N/A"}
              </p>
              <p>
                <strong>Meeting Point:</strong>{" "}
                {selectedVisit.meetingPoint || "N/A"}
              </p>
              <p>
                <strong>Cancellation Reason:</strong>{" "}
                {selectedVisit.cancellationReason || "N/A"}
              </p>
              <p>
                <strong>Confirmed At:</strong>{" "}
                {selectedVisit.confirmedAtFormatted || "N/A"}
              </p>
              <p>
                <strong>Cancelled At:</strong>{" "}
                {selectedVisit.cancelledAtFormatted || "N/A"}
              </p>
              <p>
                <strong>Completed At:</strong>{" "}
                {selectedVisit.completedAtFormatted || "N/A"}
              </p>
              <p>
                <strong>Feedback:</strong>{" "}
                {selectedVisit.feedback?.comment || "No feedback"}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal for Confirm Visit */}
      {isConfirmModalOpen && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-darkblue-800 rounded-xl p-6 w-full max-w-md text-white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4">Confirm Visit</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Confirmation Notes:</label>
                <textarea
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-700 text-white"
                  placeholder="Enter confirmation notes..."
                />
              </div>
              <div>
                <label className="block mb-1">Meeting Point:</label>
                <input
                  type="text"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-700 text-white"
                  placeholder="Enter meeting point..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeConfirmModal}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmVisit(selectedVisit._id)}
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal for Cancel Visit */}
      {isCancelModalOpen && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-darkblue-800 rounded-xl p-6 w-full max-w-md text-white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4">Cancel Visit</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Cancellation Reason:</label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-700 text-white"
                  placeholder="Enter cancellation reason..."
                />
              </div>
              <div>
                <label className="block mb-1">Meeting Point:</label>
                <input
                  type="text"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-700 text-white"
                  placeholder="Enter meeting point (optional)..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeCancelModal}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCancelVisit(selectedVisit._id)}
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Cancel Visit
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal for Complete Visit */}
      {isCompleteModalOpen && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-darkblue-800 rounded-xl p-6 w-full max-w-md text-white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4">Complete Visit</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Completion Notes:</label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-700 text-white"
                  placeholder="Enter completion notes..."
                />
              </div>
              <div>
                <label className="block mb-1">Feedback:</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-700 text-white"
                  placeholder="Enter feedback..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeCompleteModal}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteVisit(selectedVisit._id)}
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Complete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrganizationVisitRequest;