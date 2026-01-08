import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaDoorOpen,
  FaBed,
  FaMoneyBillWave,
  FaWarehouse,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const OrganizationRoomOverview = () => {
  const { id } = useParams(); // Property ID from route
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Change API_BASE to get all rooms (not just available)
  const API_BASE = `${baseurl}api/landlord/properties/${id}/rooms`;

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("orgToken");
        if (!token) {
          throw new Error("No access token found in localStorage");
        }

        // Use the all rooms API
        const response = await axios.get(API_BASE, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.rooms)) {
          data = response.data.rooms;
        } else {
          data = [];
        }

        // Log the response data for debugging
        console.log("Fetched rooms:", data);

        // Map and transform data to ensure capacity is available
        const transformedRooms = data.map((room) => ({
          ...room,
          capacity:
            room.capacity || room.totalBeds || room.roomData?.capacity || 0,
          name:
            room.name ||
            room.roomId ||
            `Room ${Date.now().toString().slice(-4)}`,
          price: room.price || room.roomData?.price || 0,
          status: room.status || "N/A",
          type: room.type || "N/A",
          beds: room.beds || [],
        }));

        setRooms(transformedRooms);
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
    fetchRooms();
  }, [id]);

  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce(
    (sum, room) => sum + (room.beds?.length || 0),
    0
  );
  const vacantRooms = rooms.filter(
    (room) => room.status === "Available"
  ).length;

  const roomStats = [
    {
      label: "Total Rooms",
      count: totalRooms,
      type: "ALL",
      icon: <FaWarehouse />,
      color:
        "bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white",
    },
    {
      label: "Total Beds",
      count: totalBeds,
      type: "ALL",
      icon: <FaBed />,
      color:
        "bg-gradient-to-r from-blue-800 to-green-400 hover:from-blue-600 hover:to-green-500 text-white",
    },
    {
      label: "Vacant Rooms",
      count: vacantRooms,
      type: "VACANT",
      icon: <FaMoneyBillWave />,
      color:
        "bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-300 hover:to-green-500 text-white",
    },
  ];

  const filteredRooms = rooms
    .filter(
      (room) =>
        !searchTerm ||
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ""
    )
    .filter((room) => {
      if (filterType === "VACANT") return room.status === "Available";
      return true;
    });

  // Log filtered rooms for debugging
  console.log("Filtered rooms:", filteredRooms);

  return (
    <div className="p-4 w-full bg-white min-h-screen rounded-lg shadow-lg">
      <motion.h3
        className="text-xl sm:text-2xl font-bold mb-6 text-white"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Room Overview
      </motion.h3>

      {error && (
        <motion.div
          className="mb-6 p-4 bg-red-600 text-white rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {roomStats.map((stat, index) => (
          <motion.div
            key={index}
            className={`cursor-pointer bg-gradient-to-br ${stat.color} text-white rounded-xl shadow-lg p-5 text-center hover:shadow-2xl transition-transform`}
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilterType(stat.type)}
          >
            <div className="flex justify-center mb-2 text-4xl">{stat.icon}</div>
            <h2 className="text-3xl font-bold">{stat.count}</h2>
            <p className="text-sm mt-1 opacity-90">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Room..."
          className="w-full sm:w-96 px-4 py-2 border border-gray-600 bg-[#0f2a4a] text-white rounded-md focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
        />
      </motion.div>

      <motion.div
        className="overflow-x-auto bg-[#132f54] rounded-lg shadow-md border border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <p className="text-center py-6 text-gray-300">Loading rooms...</p>
        ) : (
          <table className="min-w-full text-sm text-gray-200">
            <thead className="bg-[#1b3d6b] text-xs text-gray-300 uppercase">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Capacity</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Rent</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-gray-400 py-6">
                    No rooms found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room, idx) => (
                  <motion.tr
                    key={room._id || idx} // Ensure unique key
                    className="text-center border-t border-gray-700 hover:bg-[#1e3d66]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td className="px-4 py-2">{room.name || "-"}</td>
                    <td className="px-4 py-2">{room.capacity || "-"}</td>
                    <td className="px-4 py-2">
                      {room.status === "Available" ? (
                        <span className="text-orange-400 font-medium">
                          Vacant
                        </span>
                      ) : (
                        <span className="text-green-400 font-medium">
                          {room.status || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">₹{room.price || 0}</td>
                    <td className="px-4 py-2">{room.type || "-"}</td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/organization/property/${id}/room-add`}
                        className="text-white hover:text-blue-200 underline text-xs bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white p-2  rounded-xl"
                      >
                        view
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      <motion.div
        className="mt-6 text-right"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link to={`/organization/property/${id}/room-add`}>
          <motion.button
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaDoorOpen className="mr-2" />
            Add Room
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default OrganizationRoomOverview;
