import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaBed,
  FaMoneyBillWave,
  FaLayerGroup,
  FaListUl,
  FaImage,
  FaThLarge,
  FaUsers,
  FaToggleOn,
  FaTimes,
  FaTrash,
  FaEye,
  FaArrowLeft,
  FaCheck,
  FaHome,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../../BaseUrl";

// Mapping of frontend amenity names to backend facility keys (unchanged)
const facilityKeyMapping = {
  roomEssentials: {
    Bed: "bed",
    Table: "tableStudyDesk",
    Chair: "chair",
    Fan: "fan",
    Light: "light",
    Lamp: "chargingPoint",
    Wardrobe: "cupboardWardrobe",
  },
  comfortFeatures: {
    "Air Conditioner": "ac",
    Geyser: "geyser",
    Heater: "heater",
    TV: "tv",
    Fridge: "cooler",
    Sofa: "sofa",
    Mattress: "mattress",
  },
  washroomHygiene: {
    Toilet: "westernToilet",
    Shower: "shower",
    Sink: "washBasins",
    Mirror: "mirror",
    "Western Toilet": "westernToilet",
    Towels: "bucketMug",
    Toiletries: "toiletries",
  },
  utilitiesConnectivity: {
    WiFi: "wifi",
    "Power Backup": "powerBackup",
    "Water Supply": "water24x7",
    Electricity: "electricityIncluded",
    Internet: "wifi",
  },
  laundryHousekeeping: {
    "Washing Machine": "washingMachine",
    Dryer: "dryingSpace",
    "Cleaning Service": "cleaningService",
    Iron: "ironTable",
    "Laundry Service": "laundryArea",
  },
  securitySafety: {
    CCTV: "cctv",
    "Fire Extinguisher": "fireSafety",
    "First Aid Kit": "fireSafety",
    "Security Guard": "securityGuard",
    "Smoke Alarm": "fireSafety",
  },
  parkingTransport: {
    Parking: "carParking",
    "Bike Parking": "bikeParking",
    "Car Parking": "carParking",
    "Public Transport Access": "nearBus",
  },
  propertySpecific: {
    Lift: "liftAvailable",
    Gym: "gym",
    Kitchen: "modularKitchen",
    "Common Area": "hall",
    Balcony: "balcony",
    Terrace: "terrace",
    Garden: "garden",
  },
  nearbyFacilities: {
    Hospital: "hospital",
    School: "schoolCollege",
    Market: "marketMall",
    Metro: "nearMetro",
    "Bus Stop": "nearBus",
    Restaurant: "marketMall",
  },
};

const amenitiesOptions = {
  roomEssentials: ["Bed", "Table", "Chair", "Fan", "Light", "Lamp", "Wardrobe"],
  comfortFeatures: [
    "Air Conditioner",
    "Geyser",
    "Heater",
    "TV",
    "Fridge",
    "Sofa",
    "Mattress",
  ],
  washroomHygiene: [
    "Toilet",
    "Shower",
    "Sink",
    "Mirror",
    "Western Toilet",
    "Towels",
    "Toiletries",
  ],
  utilitiesConnectivity: [
    "WiFi",
    "Power Backup",
    "Water Supply",
    "Electricity",
    "Internet",
  ],
  laundryHousekeeping: [
    "Washing Machine",
    "Dryer",
    "Cleaning Service",
    "Iron",
    "Laundry Service",
  ],
  securitySafety: [
    "CCTV",
    "Fire Extinguisher",
    "First Aid Kit",
    "Security Guard",
    "Smoke Alarm",
  ],
  parkingTransport: [
    "Parking",
    "Bike Parking",
    "Car Parking",
    "Public Transport Access",
  ],
  propertySpecific: [
    "Lift",
    "Gym",
    "Kitchen",
    "Common Area",
    "Balcony",
    "Terrace",
    "Garden",
  ],
  nearbyFacilities: [
    "Hospital",
    "School",
    "Market",
    "Metro",
    "Bus Stop",
    "Restaurant",
  ],
};

// Initialize facilities with all backend keys set to false (unchanged)
const initialFacilities = Object.keys(facilityKeyMapping).reduce(
  (acc, category) => {
    acc[category] = Object.keys(facilityKeyMapping[category]).reduce(
      (catAcc, frontendKey) => {
        const backendKey = facilityKeyMapping[category][frontendKey];
        catAcc[backendKey] = false;
        return catAcc;
      },
      {}
    );
    return acc;
  },
  {}
);

const SubOwnerAddRooms = () => {
  const { propertyId } = useParams();
  console.log("Property ID from URL:", propertyId);
  const navigate = useNavigate();

  const [focusedField, setFocusedField] = useState("");
  const [roomData, setRoomData] = useState({
    name: "",
    type: "",
    price: "",
    capacity: "",
    status: "Available",
    facilities: initialFacilities,
    beds: [],
    images: [],
  });
  const [showBedForm, setShowBedForm] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [beds, setBeds] = useState([
    { name: "", price: "", status: "Available", images: [] },
  ]);

  // Define API base URL
  const API_BASE = `${baseurl}api/sub-owner/properties/${propertyId}/rooms`;

  // getToken function
  const getToken = () => localStorage.getItem("token");

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const handleFacilityToggle = (category, frontendKey) => {
    const backendKey = facilityKeyMapping[category][frontendKey];
    setRoomData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [category]: {
          ...prev.facilities[category],
          [backendKey]: !prev.facilities[category][backendKey],
        },
      },
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setRoomData((prev) => ({ ...prev, images: files }));
  };

  const handleBedChange = (index, field, value) => {
    const updatedBeds = [...beds];
    updatedBeds[index] = { ...updatedBeds[index], [field]: value };
    setBeds(updatedBeds);
  };

  const handleBedImageChange = (index, e) => {
    const files = Array.from(e.target.files);
    const updatedBeds = [...beds];
    updatedBeds[index] = { ...updatedBeds[index], images: files };
    setBeds(updatedBeds);
  };

  const addBedField = () => {
    setBeds([
      ...beds,
      { name: "", price: "", status: "Available", images: [] },
    ]);
  };

  const removeBedField = (index) => {
    setBeds(beds.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Create a flat array of selected facility keys
    const selectedFacilities = {};
    Object.entries(roomData.facilities).forEach(([category, facilities]) => {
      // Only include categories with at least one true value
      const selectedInCategory = {};
      Object.entries(facilities).forEach(([backendKey, isSelected]) => {
        if (isSelected) {
          selectedInCategory[backendKey] = true;
        }
      });
      if (Object.keys(selectedInCategory).length > 0) {
        selectedFacilities[category] = selectedInCategory;
      }
    });
    console.log("roomData.facilities:", roomData.facilities);
    console.log("Selected Facilities:", selectedFacilities);
    const payload = [
      {
        name: roomData.name || `Room ${Date.now().toString().slice(-4)}`,
        type: roomData.type,
        price: Number(roomData.price),
        capacity: Number(roomData.capacity),
        status: roomData.status,
        facilities: selectedFacilities,
        beds: roomData.beds,
      },
    ];

    console.log("Payload being sent to backend:", payload);
    console.log("roomData.facilities:", roomData.facilities);

    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios.post(API_BASE, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const savedRoomId = res.data.addedRooms[0].roomId;

      toast.success("Room added successfully!");
      setSelectedRoomId(savedRoomId);
      setShowBedForm(true);
      resetForm();
    } catch (err) {
      console.error("Error saving room:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        requestData: payload,
      });
      setError(
        err.response?.data?.message || `Failed to save room: ${err.message}`
      );
      toast.error(
        err.response?.data?.message || `Failed to save room: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBedSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError("Please add a room first before adding beds.");
      toast.error("Please add a room first before adding beds.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const bedsAPI = `${baseurl}api/sub-owner/properties/${propertyId}/rooms/${selectedRoomId}/beds`;
      for (const bed of beds) {
        if (!bed.name || !bed.price) {
          throw new Error("Bed name and price are required.");
        }
        const payload = {
          name: bed.name,
          price: Number(bed.price),
          status: bed.status,
        };
        const res = await axios.post(bedsAPI, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const savedBedId = res.data.bedId || res.data.id;
      }
      setBeds([{ name: "", price: "", status: "Available", images: [] }]);
      toast.success("Beds added successfully!");
      resetBedForm();
    } catch (err) {
      console.error("Error adding beds:", err.response?.data || err);
      setError(
        err.response?.data?.message || `Failed to add beds: ${err.message}`
      );
      toast.error(
        err.response?.data?.message || `Failed to add beds: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRoomData({
      name: "",
      type: "",
      price: "",
      capacity: "",
      status: "Available",
      facilities: initialFacilities,
      beds: [],
      images: [],
    });
    setFocusedField("");
  };

  const resetBedForm = () => {
    setShowBedForm(false);
    setSelectedRoomId(null);
    setBeds([{ name: "", price: "", status: "Available", images: [] }]);
  };

  const getFieldStyle = (name) =>
    `w-full flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-white transition-all duration-300 ${
      focusedField === name
        ? "border-[#FF6B35] ring-4 ring-[#FF6B35]/20 shadow-lg"
        : "border-gray-200 hover:border-gray-300"
    }`;

  const getIconStyle = (name) => ({
    color: focusedField === name ? "#FF6B35" : "#9ca3af",
    fontSize: "1.25rem",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6 sm:py-8 px-3 sm:px-4 lg:px-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#FF6B35] to-[#ff8659] rounded-xl flex items-center justify-center shadow-lg">
              <FaHome className="text-white text-xl sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#003366]">
                Add New Room
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-0.5">
                Create and configure a new room for your property
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3"
            >
              <FaTimes className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm sm:text-base">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Room Add Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border-2 border-gray-100 p-5 sm:p-6 lg:p-8 mb-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#003366] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#003366] to-[#004d99] rounded-lg flex items-center justify-center">
                  <FaListUl className="text-white text-sm" />
                </div>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                    Room Name
                  </label>
                  <div className={getFieldStyle("roomName")}>
                    <FaListUl style={getIconStyle("roomName")} />
                    <input
                      type="text"
                      name="name"
                      value={roomData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("roomName")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none text-gray-800 text-sm sm:text-base"
                      placeholder="e.g., Deluxe Room 101"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                    Room Type
                  </label>
                  <div className={getFieldStyle("roomType")}>
                    <FaThLarge style={getIconStyle("roomType")} />
                    <select
                      name="type"
                      value={roomData.type}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("roomType")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-white text-gray-800 text-sm sm:text-base"
                      required
                    >
                      <option value="">Select Room Type</option>
                      <option value="PG">PG</option>
                      <option value="AC">AC</option>
                      <option value="Single Sharing">Single Sharing</option>
                      <option value="Double Sharing">Double Sharing</option>
                      <option value="Triple Sharing">Triple Sharing</option>
                      <option value="Four Sharing">Four Sharing</option>
                      <option value="Five Sharing">Five Sharing</option>
                      <option value="Six Sharing">Six Sharing</option>
                      <option value="More Than 6 Sharing">More Than 6 Sharing</option>
                      <option value="Private Room">Private Room</option>
                      <option value="Shared Room">Shared Room</option>
                      <option value="Couple">Couple</option>
                      <option value="Family">Family</option>
                      <option value="Male Only">Male Only</option>
                      <option value="Female Only">Female Only</option>
                      <option value="Unisex">Unisex</option>
                      <option value="Student Only">Student Only</option>
                      <option value="Working Professionals Only">Working Professionals Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                    Capacity
                  </label>
                  <div className={getFieldStyle("capacity")}>
                    <FaUsers style={getIconStyle("capacity")} />
                    <input
                      type="number"
                      name="capacity"
                      value={roomData.capacity}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("capacity")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none text-gray-800 text-sm sm:text-base"
                      placeholder="Number of occupants"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                    Status
                  </label>
                  <div className={getFieldStyle("status")}>
                    <FaToggleOn style={getIconStyle("status")} />
                    <select
                      name="status"
                      value={roomData.status}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("status")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-white text-gray-800 text-sm sm:text-base"
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                    Upload Room Images
                  </label>
                  <div className={getFieldStyle("images")}>
                    <FaImage style={getIconStyle("images")} />
                    <input
                      type="file"
                      name="images"
                      onChange={handleImageChange}
                      onFocus={() => setFocusedField("images")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none text-sm sm:text-base"
                      multiple
                      accept="image/*"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload multiple images to showcase your room
                  </p>
                </div>
              </div>
            </div>

            {/* Facilities Section */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#003366] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#ff8659] rounded-lg flex items-center justify-center">
                  <FaLayerGroup className="text-white text-sm" />
                </div>
                Room Facilities
              </h3>
              <div className="space-y-6">
                {Object.entries(amenitiesOptions).map(([category, options]) => (
                  <div key={category} className="bg-gray-50 rounded-xl p-4 sm:p-5">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 text-[#003366] capitalize">
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </h4>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {options.map((option) => {
                        const isActive =
                          roomData.facilities[category][
                            facilityKeyMapping[category][option]
                          ] || false;

                        return (
                          <motion.button
                            key={option}
                            onClick={() => handleFacilityToggle(category, option)}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 transition-all duration-300 text-xs sm:text-sm font-medium ${
                              isActive
                                ? "bg-gradient-to-r from-[#FF6B35] to-[#ff8659] border-[#FF6B35] text-white shadow-lg"
                                : "bg-white border-gray-200 text-gray-700 hover:border-[#FF6B35] hover:bg-orange-50"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 flex items-center justify-center rounded-md transition-all duration-300 ${
                                isActive
                                  ? "bg-white/30"
                                  : "bg-gray-100"
                              }`}
                            >
                              {isActive && (
                                <FaCheck className="text-white text-xs" />
                              )}
                            </div>
                            <span>{option}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-[#003366] to-[#004d99] text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Adding Room...
                </>
              ) : (
                <>
                  <FaPlus />
                  Add Room
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Add Beds Section Toggle */}
        <motion.button
          onClick={() => setShowBedForm(!showBedForm)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-[#FF6B35] to-[#ff8659] text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg mb-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          {showBedForm ? <FaTimes /> : <FaBed />}
          {showBedForm ? "Cancel Adding Beds" : "Add Beds to Room"}
        </motion.button>

        {/* Add Beds Form */}
        <AnimatePresence>
          {showBedForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border-2 border-gray-100 p-5 sm:p-6 lg:p-8"
            >
              <h3 className="text-lg sm:text-xl font-bold text-[#003366] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#ff8659] rounded-lg flex items-center justify-center">
                  <FaBed className="text-white text-sm" />
                </div>
                Add Beds to Room
              </h3>
              
              <form onSubmit={handleBedSubmit} className="space-y-6">
                {beds.map((bed, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-4 sm:p-5 border-2 border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                        Bed #{index + 1}
                      </h4>
                      {index > 0 && (
                        <motion.button
                          type="button"
                          onClick={() => removeBedField(index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </motion.button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-medium mb-2 text-gray-700 text-sm">
                          Bed Name
                        </label>
                        <input
                          type="text"
                          value={bed.name}
                          onChange={(e) => handleBedChange(index, "name", e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-gray-800 text-sm focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/20 outline-none transition-all"
                          placeholder="e.g., Bed A"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block font-medium mb-2 text-gray-700 text-sm">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={bed.price}
                          onChange={(e) => handleBedChange(index, "price", e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-gray-800 text-sm focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/20 outline-none transition-all"
                          placeholder="Monthly rent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block font-medium mb-2 text-gray-700 text-sm">
                          Status
                        </label>
                        <select
                          value={bed.status}
                          onChange={(e) => handleBedChange(index, "status", e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-gray-800 text-sm focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/20 outline-none transition-all"
                          required
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                      
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block font-medium mb-2 text-gray-700 text-sm">
                          Upload Bed Images
                        </label>
                        <input
                          type="file"
                          onChange={(e) => handleBedImageChange(index, e)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-gray-800 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#e55a25] transition-all"
                          multiple
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                <motion.button
                  type="button"
                  onClick={addBedField}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white border-2 border-dashed border-[#FF6B35] text-[#FF6B35] py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaPlus />
                  Add Another Bed
                </motion.button>

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#FF6B35] to-[#ff8659] text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Saving Beds...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Save Beds
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubOwnerAddRooms;