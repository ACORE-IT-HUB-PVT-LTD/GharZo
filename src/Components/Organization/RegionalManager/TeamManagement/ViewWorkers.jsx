// ViewWorkersModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaTimes,
  FaUserTie,
  FaPhoneAlt,
  FaMailBulk,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
} from "react-icons/fa";

const Colorful3DIcon = ({ icon: Icon, color, size = 28 }) => (
  <motion.div
    className={`p-3 rounded-3xl shadow-lg bg-gradient-to-br ${color} inline-flex items-center justify-center`}
    style={{ perspective: 1000 }}
    whileHover={{ scale: 1.1, rotateY: 15, rotateX: 10 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <Icon className="text-white drop-shadow-lg" size={size} />
  </motion.div>
);

const WorkerCard = ({ worker }) => (
  <motion.div
    className="bg-white rounded-3xl shadow-xl p-6 flex flex-col md:flex-row items-center gap-6 cursor-default"
    whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.2)" }}
    transition={{ duration: 0.3 }}
  >
    <Colorful3DIcon icon={FaUserTie} color="from-green-600 to-emerald-600" size={60} />
    <div className="flex-1 w-full">
      <h3 className="text-xl font-bold text-green-900">{worker.name}</h3>
      <p className="text-green-700 font-semibold mb-2">{worker.role}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 text-sm">
        <div className="flex items-center gap-2">
          <FaPhoneAlt className="text-green-600" />
          <span>{worker.contactNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaMailBulk className="text-green-600" />
          <span>{worker.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-green-600" />
          <span>{worker.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-green-600" />
          <span>{worker.availabilityDays?.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-green-600" />
          <span>{worker.availableTimeSlots?.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaDollarSign className="text-green-600" />
          <span>₹{worker.chargePerService}</span>
        </div>
        {worker.assignedProperties && worker.assignedProperties.length > 0 && (
          <div className="flex items-center gap-2 col-span-full">
            <FaBriefcase className="text-green-600" />
            <span>Assigned Properties: {worker.assignedProperties.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const ViewWorkersModal = ({ onClose }) => {
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("workersList");
    if (stored) {
      setWorkers(JSON.parse(stored));
    } else {
      setWorkers([
        {
          id: 1,
          name: "Alice Johnson",
          role: "Electrician",
          contactNumber: "9876543210",
          email: "alice@example.com",
          address: "123 Main St, City",
          availabilityDays: ["Monday", "Wednesday", "Friday"],
          availableTimeSlots: ["Morning", "Afternoon"],
          chargePerService: 500,
          assignedProperties: ["Sunshine Apartments", "Greenwood Villas"],
        },
        {
          id: 2,
          name: "Bob Smith",
          role: "Plumber",
          contactNumber: "9123456780",
          email: "bob@example.com",
          address: "456 Oak Ave, City",
          availabilityDays: ["Tuesday", "Thursday"],
          availableTimeSlots: ["Evening"],
          chargePerService: 600,
          assignedProperties: ["Maple Residency"],
        },
        {
          id: 3,
          name: "Charlie Brown",
          role: "Carpenter",
          contactNumber: "9988776655",
          email: "charlie@example.com",
          address: "789 Pine Rd, City",
          availabilityDays: ["Monday", "Tuesday", "Friday"],
          availableTimeSlots: ["Morning", "Evening"],
          chargePerService: 550,
          assignedProperties: ["Ocean View"],
        },
        {
          id: 4,
          name: "Diana Prince",
          role: "Painter",
          contactNumber: "9871234567",
          email: "diana@example.com",
          address: "321 Elm St, City",
          availabilityDays: ["Wednesday", "Thursday"],
          availableTimeSlots: ["Afternoon", "Evening"],
          chargePerService: 700,
          assignedProperties: ["Sunshine Apartments"],
        },
        {
          id: 5,
          name: "Ethan Hunt",
          role: "Cleaner",
          contactNumber: "9765432109",
          email: "ethan@example.com",
          address: "654 Maple Ln, City",
          availabilityDays: ["Saturday", "Sunday"],
          availableTimeSlots: ["Morning"],
          chargePerService: 400,
          assignedProperties: ["Greenwood Villas", "Maple Residency"],
        },
      ]);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 max-w-5xl w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          aria-label="Close"
        >
          <FaTimes size={28} />
        </button>
        <h2 className="text-3xl font-bold mb-6 text-center text-green-700">
          Workers List
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {workers.length === 0 ? (
            <p className="text-center text-gray-600 col-span-full">
              No workers found.
            </p>
          ) : (
            workers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ViewWorkersModal;
