import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaDoorOpen,
  FaBed,
  FaMoneyBillWave,
  FaWarehouse,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaEye,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const RoomOverview = () => {
  const { id } = useParams(); // Property ID from route
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, roomId: null });
  const [toggleLoading, setToggleLoading] = useState(null);

  // Get token from localStorage
  const getToken = () => localStorage.getItem("usertoken");

  const API_BASE = `${baseurl}api/rooms`;

  useEffect(() => {
    fetchRooms();
  }, [id]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        throw new Error("No access token found in localStorage");
      }

      const response = await axios.get(`${API_BASE}/property/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      let data = [];
      if (response.data.success) {
        data = response.data.data || [];
      }

      console.log("Fetched rooms:", data);
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch rooms. Please check your authentication or network."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const token = getToken();
      const response = await axios.delete(`${API_BASE}/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Refresh the room list
        fetchRooms();
        setDeleteModal({ show: false, roomId: null });
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      alert(error.response?.data?.message || "Failed to delete room");
    }
  };

  const handleToggleStatus = async (roomId) => {
    try {
      setToggleLoading(roomId);
      const token = getToken();
      
      const response = await axios.patch(
        `${API_BASE}/${roomId}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Refresh the room list
        fetchRooms();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert(error.response?.data?.message || "Failed to toggle status");
    } finally {
      setToggleLoading(null);
    }
  };

  // Calculate statistics
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce(
    (sum, room) => sum + (room.capacity?.totalBeds || 0),
    0
  );
  const vacantRooms = rooms.filter(
    (room) => room.availability?.status === "Available"
  ).length;
  const occupiedBeds = rooms.reduce(
    (sum, room) => sum + (room.capacity?.occupiedBeds || 0),
    0
  );

  const roomStats = [
    {
      label: "Total Rooms",
      count: totalRooms,
      type: "ALL",
      icon: <FaWarehouse />,
      color: "from-[#003366] to-[#004999]",
    },
    {
      label: "Total Beds",
      count: totalBeds,
      type: "ALL",
      icon: <FaBed />,
      color: "from-[#003366] to-[#005099]",
    },
    {
      label: "Vacant Rooms",
      count: vacantRooms,
      type: "VACANT",
      icon: <FaMoneyBillWave />,
      color: "from-[#FF6B35] to-[#FF8C42]",
    },
    {
      label: "Occupied Beds",
      count: occupiedBeds,
      type: "OCCUPIED",
      icon: <FaUsers />,
      color: "from-green-500 to-green-600",
    },
  ];

  const filteredRooms = rooms
    .filter(
      (room) =>
        !searchTerm ||
        room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomType?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((room) => {
      if (filterType === "VACANT") return room.availability?.status === "Available";
      if (filterType === "OCCUPIED") return room.capacity?.occupiedBeds > 0;
      return true;
    });

  const getStatusBadge = (status) => {
    const statusConfig = {
      Available: { color: "bg-green-500", text: "Available" },
      "Partially-Occupied": { color: "bg-yellow-500", text: "Partial" },
      "Fully-Occupied": { color: "bg-red-500", text: "Occupied" },
      "Under-Maintenance": { color: "bg-gray-500", text: "Maintenance" },
      Blocked: { color: "bg-black", text: "Blocked" },
    };

    const config = statusConfig[status] || { color: "bg-gray-400", text: status };

    return (
      <span
        className={`inline-block px-3 py-1 ${config.color} text-white font-semibold rounded-full text-xs`}
      >
        {config.text}
      </span>
    );
  };

  const getFurnishingBadge = (furnishing) => {
    const furnishingConfig = {
      "Fully-Furnished": { color: "bg-blue-500", text: "Fully" },
      "Semi-Furnished": { color: "bg-purple-500", text: "Semi" },
      "Unfurnished": { color: "bg-gray-500", text: "Unfurnished" },
    };

    const config = furnishingConfig[furnishing] || { color: "bg-gray-400", text: furnishing };

    return (
      <span
        className={`inline-block px-2 py-1 ${config.color} text-white font-semibold rounded-full text-xs`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 w-full bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen rounded-2xl shadow-2xl border-2 border-[#FF6B35]/30">
      <motion.h3
        className="text-xl sm:text-2xl font-bold mb-6 text-[#003366] flex items-center"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="w-2 h-6 bg-[#FF6B35] mr-4 rounded"></span>
        Room Overview
      </motion.h3>

      {error && (
        <motion.div
          className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {roomStats.map((stat, index) => (
          <motion.div
            key={index}
            className={`cursor-pointer bg-gradient-to-br ${stat.color} text-white rounded-2xl shadow-xl p-4 text-center hover:shadow-2xl transition-all border-2 border-white/20`}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilterType(stat.type)}
          >
            <div className="flex justify-center mb-3 text-4xl sm:text-5xl drop-shadow-lg">
              {stat.icon}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">{stat.count}</h2>
            <p className="text-xs sm:text-sm opacity-90 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mb-6 flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search Room by Number or Type..."
          className="flex-1 px-5 py-3 border-2 border-[#FF6B35] bg-white text-[#003366] rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none shadow-md font-medium placeholder-gray-400"
        />
        {filterType !== "ALL" && (
          <button
            onClick={() => setFilterType("ALL")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Clear Filter
          </button>
        )}
      </motion.div>

      <motion.div
        className="overflow-x-auto bg-white rounded-2xl shadow-xl border-2 border-[#FF6B35]/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="text-center py-10">
            <div className="border-t-4 border-[#FF6B35] w-12 h-12 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading rooms...</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-[#003366] to-[#004999] text-white">
              <tr>
                <th className="px-4 py-4 text-left font-semibold">Room No.</th>
                <th className="px-4 py-4 text-left font-semibold">Type</th>
                <th className="px-4 py-4 text-center font-semibold">Floor</th>
                <th className="px-4 py-4 text-center font-semibold">Total Beds</th>
                <th className="px-4 py-4 text-center font-semibold">Occupied</th>
                <th className="px-4 py-4 text-center font-semibold">Status</th>
                <th className="px-4 py-4 text-center font-semibold">Rent/Bed</th>
                <th className="px-4 py-4 text-center font-semibold">Furnishing</th>
                <th className="px-4 py-4 text-center font-semibold">Active</th>
                <th className="px-4 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center text-gray-500 py-8 font-medium"
                  >
                    No rooms found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room, idx) => (
                  <motion.tr
                    key={room._id || idx}
                    className="text-center border-b border-gray-200 hover:bg-blue-50 transition-colors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td className="px-4 py-4 text-left font-semibold text-[#003366]">
                      {room.roomNumber || "-"}
                    </td>
                    <td className="px-4 py-4 text-left text-gray-700">
                      {room.roomType || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {room.floor || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-700 font-medium">
                      {room.capacity?.totalBeds || 0}
                    </td>
                    <td className="px-4 py-4 text-gray-700 font-medium">
                      <span
                        className={`${
                          room.capacity?.occupiedBeds > 0
                            ? "text-orange-600"
                            : "text-green-600"
                        } font-bold`}
                      >
                        {room.capacity?.occupiedBeds || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(room.availability?.status)}
                    </td>
                    <td className="px-4 py-4 text-[#003366] font-bold">
                      ₹{room.pricing?.rentPerBed || room.pricing?.rentPerRoom || 0}
                    </td>
                    <td className="px-4 py-4">
                      {getFurnishingBadge(room.features?.furnishing)}
                    </td>
                    <td className="px-4 py-4">
                      {room.isActive ? (
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/landlord/property/${id}/add-room?roomId=${room._id}`}
                          className="inline-block p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
                          title="Edit Room"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(room._id)}
                          disabled={toggleLoading === room._id}
                          className={`p-2 ${
                            room.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-500 hover:bg-gray-600"
                          } text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50`}
                          title="Toggle Active Status"
                        >
                          {toggleLoading === room._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : room.isActive ? (
                            <FaToggleOn />
                          ) : (
                            <FaToggleOff />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({ show: true, roomId: room._id })
                          }
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
                          title="Delete Room"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      <motion.div
        className="mt-8 text-right"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link to={`/landlord/property/${id}/add-room`}>
          <motion.button
            className="inline-flex items-center bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-[#FF8C42] hover:to-[#FF6B35] transition-all font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaDoorOpen className="mr-2 text-lg" />
            Add New Room
          </motion.button>
        </Link>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModal({ show: false, roomId: null })}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrash className="text-red-500 text-3xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                Delete Room?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this room? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, roomId: null })}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRoom(deleteModal.roomId)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomOverview;