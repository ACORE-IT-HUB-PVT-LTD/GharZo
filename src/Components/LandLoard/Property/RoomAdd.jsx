import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaListUl,
  FaThLarge,
  FaUsers,
  FaToggleOn,
  FaLayerGroup,
  FaMoneyBillWave,
  FaImage,
  FaTrash,
  FaRulerCombined,
  FaClock,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheck,
  FaArrowLeft,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const RoomAdd = () => {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomId");

  const getToken = () => localStorage.getItem("usertoken");
  const API_BASE = `${baseurl}api/rooms`;

  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  const [showEnableRentalModal, setShowEnableRentalModal] = useState(false);
  const [enablingRental, setEnablingRental] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkRooms, setBulkRooms] = useState([]);

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => {
      setToast({ show: false, message: "", type: "error" });
    }, 4000);
    return () => clearTimeout(t);
  }, [toast.show]);

  const [roomData, setRoomData] = useState({
    propertyId: propertyId,
    roomNumber: "",
    roomType: "",
    floor: "",
    rentPerBed: "",
    rentPerRoom: "",
    securityDeposit: "",
    maintenanceCharges: "",
    maintenanceIncluded: false,
    electricityCharges: "Extra",
    waterCharges: "Included",
    totalBeds: "",
    furnishing: "Unfurnished",
    hasAttachedBathroom: false,
    hasBalcony: false,
    hasAC: false,
    hasWardrobe: false,
    hasFridge: false,
    amenities: [],
    genderPreference: "Any",
    foodType: "Both",
    smokingAllowed: false,
    petsAllowed: false,
    guestsAllowed: false,
    noticePeriod: "30",
    lockInPeriod: "0",
    carpetArea: "",
    areaUnit: "sqft",
    newImages: [],
    existingImages: [],
  });

  const [propertyInfo, setPropertyInfo] = useState(null);
  const [propertyValid, setPropertyValid] = useState(true);

  const amenitiesList = [
    "WiFi",
    "Study Table",
    "Chair",
    "Bed",
    "Mattress",
    "Pillow",
    "Blanket",
    "Washing Machine",
    "Geyser",
    "TV",
    "Sofa",
    "Dining Table",
    "Microwave",
    "Refrigerator",
    "Water Purifier",
    "Power Backup",
    "CCTV",
    "Security Guard",
    "Parking",
    "Gym",
    "Common Area",
    "Garden",
    "Lift",
  ];

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  useEffect(() => {
    if (roomId && propertyValid) {
      fetchRoomDetails();
    }
  }, [roomId, propertyValid]);

  const fetchProperty = async () => {
    try {
      const token = getToken();
      if (!token) {
        setToast({
          show: true,
          message: "Authentication required. Please login.",
          type: "error",
        });
        return;
      }

      const res = await axios.get(`${baseurl}api/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        const prop = res.data.data;
        setPropertyInfo(prop);
        const isRental = prop.listingType === "Rent" && prop.isRentalManagement === true;
        setPropertyValid(isRental);

        if (!isRental) {
          setShowEnableRentalModal(true);
        }
      }
    } catch (err) {
      console.error("Error fetching property:", err);
      const errorMsg = err.response?.data?.message || "Failed to fetch property details";
      setError(errorMsg);
      setToast({
        show: true,
        message: errorMsg,
        type: "error",
      });
    }
  };

  const handleEnableRentalManagement = async () => {
    try {
      setEnablingRental(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${baseurl}api/properties/${propertyId}`,
        { isRentalManagement: true },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPropertyValid(true);
        setShowEnableRentalModal(false);
        setToast({
          show: true,
          message: "Rental management enabled successfully!",
          type: "success",
        });
        await fetchProperty();
      }
    } catch (err) {
      console.error("Error enabling rental management:", err);
      setToast({
        show: true,
        message: err.response?.data?.message || "Failed to enable rental management",
        type: "error",
      });
    } finally {
      setEnablingRental(false);
    }
  };

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_BASE}/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const room = response.data.data;
        setRoomData({
          propertyId: room.propertyId,
          roomNumber: room.roomNumber || "",
          roomType: room.roomType || "",
          floor: room.floor || "",
          rentPerBed: room.pricing?.rentPerBed || "",
          rentPerRoom: room.pricing?.rentPerRoom || "",
          securityDeposit: room.pricing?.securityDeposit || "",
          maintenanceCharges: room.pricing?.maintenanceCharges?.amount || "",
          maintenanceIncluded: room.pricing?.maintenanceCharges?.includedInRent || false,
          electricityCharges: room.pricing?.electricityCharges || "Extra",
          waterCharges: room.pricing?.waterCharges || "Included",
          totalBeds: room.capacity?.totalBeds || "",
          furnishing: room.features?.furnishing || "Unfurnished",
          hasAttachedBathroom: room.features?.hasAttachedBathroom || false,
          hasBalcony: room.features?.hasBalcony || false,
          hasAC: room.features?.hasAC || false,
          hasWardrobe: room.features?.hasWardrobe || false,
          hasFridge: room.features?.hasFridge || false,
          amenities: room.features?.amenities || [],
          genderPreference: room.rules?.genderPreference || "Any",
          foodType: room.rules?.foodType || "Both",
          smokingAllowed: room.rules?.smokingAllowed || false,
          petsAllowed: room.rules?.petsAllowed || false,
          guestsAllowed: room.rules?.guestsAllowed || false,
          noticePeriod: room.rules?.noticePeriod || "30",
          lockInPeriod: room.rules?.lockInPeriod || "0",
          carpetArea: room.area?.carpet || "",
          areaUnit: room.area?.unit || "sqft",
          newImages: [],
          existingImages: room.media?.images?.map((img) => img.url) || [],
        });
      }
    } catch (err) {
      console.error("Error fetching room details:", err);
      setError(err.response?.data?.message || "Failed to fetch room details");
      setToast({
        show: true,
        message: err.response?.data?.message || "Failed to fetch room details",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setRoomData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setRoomData((prev) => ({
      ...prev,
      newImages: [...prev.newImages, ...files],
    }));
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setRoomData((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
      }));
    } else {
      setRoomData((prev) => ({
        ...prev,
        newImages: prev.newImages.filter((_, i) => i !== index),
      }));
    }
  };

  // Bulk room management
  const addBulkRoom = () => {
    const newBulkRoom = {
      roomNumber: "",
      roomType: "",
      floor: "",
      rentPerBed: "",
      rentPerRoom: "",
      securityDeposit: "",
      maintenanceCharges: "",
      maintenanceIncluded: false,
      electricityCharges: "Extra",
      waterCharges: "Included",
      totalBeds: "",
      furnishing: "Unfurnished",
      hasAttachedBathroom: false,
      hasBalcony: false,
      hasAC: false,
      hasWardrobe: false,
      hasFridge: false,
      amenities: [],
      genderPreference: "Any",
      foodType: "Both",
      smokingAllowed: false,
      petsAllowed: false,
      guestsAllowed: false,
      noticePeriod: "30",
      lockInPeriod: "0",
      carpetArea: "",
      areaUnit: "sqft",
    };
    setBulkRooms([...bulkRooms, newBulkRoom]);
  };

  const removeBulkRoom = (index) => {
    setBulkRooms(bulkRooms.filter((_, i) => i !== index));
  };

  const updateBulkRoom = (index, field, value, isCheckbox = false) => {
    const updatedRooms = [...bulkRooms];
    updatedRooms[index] = {
      ...updatedRooms[index],
      [field]: isCheckbox ? !updatedRooms[index][field] : value,
    };
    setBulkRooms(updatedRooms);
  };

  const toggleBulkAmenity = (index, amenity) => {
    const updatedRooms = [...bulkRooms];
    const amenities = updatedRooms[index].amenities;
    updatedRooms[index].amenities = amenities.includes(amenity)
      ? amenities.filter((a) => a !== amenity)
      : [...amenities, amenity];
    setBulkRooms(updatedRooms);
  };

  // Validation function for bulk rooms
  const validateBulkRooms = () => {
    for (let i = 0; i < bulkRooms.length; i++) {
      const room = bulkRooms[i];
      if (!room.roomNumber || !room.roomType || !room.totalBeds || !room.securityDeposit) {
        setToast({
          show: true,
          message: `Room ${i + 1}: Please fill all required fields (Room Number, Type, Total Beds, Security Deposit)`,
          type: "error",
        });
        return false;
      }
    }
    return true;
  };

  // Single room submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propertyValid) {
      setToast({
        show: true,
        message: "Please enable rental management for this property first",
        type: "error",
      });
      setShowEnableRentalModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Prepare room payload
      const roomPayload = {
        propertyId: propertyId,
        roomNumber: roomData.roomNumber,
        roomType: roomData.roomType,
        floor: roomData.floor ? Number(roomData.floor) : undefined,
        pricing: {
          rentPerBed: roomData.rentPerBed ? Number(roomData.rentPerBed) : undefined,
          rentPerRoom: roomData.rentPerRoom ? Number(roomData.rentPerRoom) : undefined,
          securityDeposit: Number(roomData.securityDeposit),
          maintenanceCharges: {
            amount: Number(roomData.maintenanceCharges) || 0,
            includedInRent: roomData.maintenanceIncluded,
          },
          electricityCharges: roomData.electricityCharges,
          waterCharges: roomData.waterCharges,
        },
        capacity: {
          totalBeds: Number(roomData.totalBeds),
          occupiedBeds: 0,
        },
        features: {
          furnishing: roomData.furnishing,
          hasAttachedBathroom: roomData.hasAttachedBathroom,
          hasBalcony: roomData.hasBalcony,
          hasAC: roomData.hasAC,
          hasWardrobe: roomData.hasWardrobe,
          hasFridge: roomData.hasFridge,
          amenities: roomData.amenities,
        },
        rules: {
          genderPreference: roomData.genderPreference,
          foodType: roomData.foodType,
          smokingAllowed: roomData.smokingAllowed,
          petsAllowed: roomData.petsAllowed,
          guestsAllowed: roomData.guestsAllowed,
          noticePeriod: Number(roomData.noticePeriod),
          lockInPeriod: Number(roomData.lockInPeriod),
        },
        area: {
          carpet: Number(roomData.carpetArea) || undefined,
          unit: roomData.areaUnit,
        },
      };

      let response;

      if (roomId) {
        // Update existing room - send JSON
        response = await axios.put(`${API_BASE}/${roomId}`, roomPayload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Create new room - send FormData if images exist, otherwise JSON
        if (roomData.newImages.length > 0) {
          const formData = new FormData();
          formData.append("roomData", JSON.stringify(roomPayload));
          roomData.newImages.forEach((image) => {
            formData.append("images", image);
          });

          response = await axios.post(`${API_BASE}/create`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                setUploadProgress(
                  Math.round((progressEvent.loaded * 100) / progressEvent.total)
                );
              }
            },
          });
        } else {
          // No images - send JSON
          response = await axios.post(`${API_BASE}/create`, roomPayload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }

      if (response.data.success) {
        const successMsg = roomId ? "Room updated successfully!" : "Room created successfully!";
        setSuccessMessage(successMsg);
        setToast({ show: true, message: successMsg, type: "success" });

        setTimeout(() => {
          navigate(`/landlord/property/${propertyId}`);
        }, 2000);
      } else {
        const msg = response.data.message || "Failed to save room";
        setError(msg);
        setToast({ show: true, message: msg, type: "error" });
      }
    } catch (err) {
      console.error("Error saving room:", err);
      const msg = err.response?.data?.message || err.message || "Failed to save room";
      setError(msg);
      setToast({ show: true, message: msg, type: "error" });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Bulk room submission - FIXED
  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    if (!propertyValid) {
      setToast({
        show: true,
        message: "Please enable rental management for this property first",
        type: "error",
      });
      setShowEnableRentalModal(true);
      return;
    }

    if (bulkRooms.length === 0) {
      setToast({
        show: true,
        message: "Please add at least one room",
        type: "error",
      });
      return;
    }

    // Validate all bulk rooms
    if (!validateBulkRooms()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Prepare bulk payload - FIXED
      const payload = {
        propertyId: propertyId,
        rooms: bulkRooms.map((room) => ({
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          floor: room.floor ? Number(room.floor) : undefined,
          pricing: {
            rentPerBed: room.rentPerBed ? Number(room.rentPerBed) : undefined,
            rentPerRoom: room.rentPerRoom ? Number(room.rentPerRoom) : undefined,
            securityDeposit: Number(room.securityDeposit),
            maintenanceCharges: {
              amount: Number(room.maintenanceCharges) || 0,
              includedInRent: room.maintenanceIncluded,
            },
            electricityCharges: room.electricityCharges,
            waterCharges: room.waterCharges,
          },
          capacity: {
            totalBeds: Number(room.totalBeds),
            occupiedBeds: 0,
          },
          features: {
            furnishing: room.furnishing,
            hasAttachedBathroom: room.hasAttachedBathroom,
            hasBalcony: room.hasBalcony,
            hasAC: room.hasAC,
            hasWardrobe: room.hasWardrobe,
            hasFridge: room.hasFridge,
            amenities: room.amenities,
          },
          rules: {
            genderPreference: room.genderPreference,
            foodType: room.foodType,
            smokingAllowed: room.smokingAllowed,
            petsAllowed: room.petsAllowed,
            guestsAllowed: room.guestsAllowed,
            noticePeriod: Number(room.noticePeriod),
            lockInPeriod: Number(room.lockInPeriod),
          },
          area: {
            carpet: Number(room.carpetArea) || undefined,
            unit: room.areaUnit,
          },
        })),
      };

      console.log("Sending bulk rooms payload:", payload); // Debug log

      const response = await axios.post(`${API_BASE}/bulk-create`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const createdCount = response.data.data?.createdRooms?.length || bulkRooms.length;
        const successMsg = `Successfully created ${createdCount} room${createdCount !== 1 ? 's' : ''}!`;
        setSuccessMessage(successMsg);
        setToast({ show: true, message: successMsg, type: "success" });

        setTimeout(() => {
          navigate(`/landlord/property/${propertyId}`);
        }, 2000);
      } else {
        const msg = response.data.message || "Failed to create rooms";
        setError(msg);
        setToast({ show: true, message: msg, type: "error" });
      }
    } catch (err) {
      console.error("Error saving bulk rooms:", err);
      const msg = err.response?.data?.message || err.message || "Failed to save rooms";
      setError(msg);
      setToast({ show: true, message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getFieldStyle = (name) =>
    `w-full flex items-center gap-3 border rounded-lg px-4 py-3 bg-white transition-all duration-300 ${
      focusedField === name
        ? "border-orange-500 shadow-lg ring-2 ring-orange-100"
        : "border-gray-200 hover:border-gray-300"
    } text-gray-900`;

  const getIconStyle = (name) => ({
    color: focusedField === name ? "#FF6B35" : "#9CA3AF",
    fontSize: "18px",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Messages */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-6 right-6 z-50 max-w-sm px-6 py-4 rounded-xl shadow-2xl font-medium flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <span className="text-xl">{toast.type === "success" ? "✓" : "⚠"}</span>
          {toast.message}
        </motion.div>
      )}

      {/* Enable Rental Modal */}
      <AnimatePresence>
        {showEnableRentalModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-amber-600 text-3xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Enable Rental Management
              </h3>
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                This property isn't set up for rental management yet. Enable it to start adding rooms.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                <p className="text-sm text-blue-900">
                  <strong>Property Status:</strong>
                  <br />
                  Type: {propertyInfo?.listingType || "N/A"}
                  <br />
                  Rental: {propertyInfo?.isRentalManagement ? "✓ Enabled" : "✗ Disabled"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEnableRentalModal(false);
                    navigate(`/landlord/property/${propertyId}`);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnableRentalManagement}
                  disabled={enablingRental}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold disabled:opacity-50 shadow-lg"
                >
                  {enablingRental ? "Enabling..." : "Enable Now"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(`/landlord/property/${propertyId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
          >
            <FaArrowLeft size={18} />
            Back to Property
          </button>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {bulkMode ? "Add Multiple Rooms" : roomId ? "Edit Room" : "Add New Room"}
              </h1>
              <p className="text-gray-600">
                {bulkMode
                  ? "Create multiple rooms in bulk"
                  : roomId
                  ? "Update room details and pricing"
                  : "Create a new room listing"}
              </p>
            </div>

            {/* Mode Toggle */}
            {!roomId && (
              <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => {
                    setBulkMode(false);
                    setBulkRooms([]);
                  }}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    !bulkMode
                      ? "bg-orange-500 text-white"
                      : "bg-transparent text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Single Room
                </button>
                <button
                  onClick={() => {
                    setBulkMode(true);
                    if (bulkRooms.length === 0) {
                      addBulkRoom(); // Add first room automatically
                    }
                  }}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    bulkMode
                      ? "bg-orange-500 text-white"
                      : "bg-transparent text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Bulk Rooms
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            className="mb-8 p-5 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-start gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FaExclamationTriangle size={20} className="mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <motion.div
            className="mb-8 p-5 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl flex items-start gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FaCheck size={20} className="mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Success</h3>
              <p className="text-sm">{successMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Single Room Form */}
        {!bulkMode ? (
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
              {/* Basic Information Section */}
              <Section title="Basic Information" icon="📋">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    label="Room Number *"
                    icon={<FaListUl />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <input
                      type="text"
                      name="roomNumber"
                      value={roomData.roomNumber}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("roomNumber")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent"
                      placeholder="e.g., 101, A-205"
                      required
                    />
                  </FormField>

                  <FormField
                    label="Room Type *"
                    icon={<FaThLarge />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <select
                      name="roomType"
                      value={roomData.roomType}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("roomType")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent text-gray-900"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Single">Single</option>
                      <option value="Double Sharing">Double Sharing</option>
                      <option value="Triple Sharing">Triple Sharing</option>
                      <option value="Dormitory">Dormitory</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Floor"
                    icon={<FaLayerGroup />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <input
                      type="number"
                      name="floor"
                      value={roomData.floor}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("floor")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent"
                      placeholder="Floor number"
                    />
                  </FormField>

                  <FormField
                    label="Total Beds *"
                    icon={<FaUsers />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <input
                      type="number"
                      name="totalBeds"
                      value={roomData.totalBeds}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("totalBeds")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent"
                      placeholder="Number of beds"
                      required
                      min="1"
                    />
                  </FormField>

                  <FormField
                    label="Carpet Area"
                    icon={<FaRulerCombined />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <input
                      type="number"
                      name="carpetArea"
                      value={roomData.carpetArea}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("carpetArea")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent"
                      placeholder="Area size"
                    />
                  </FormField>

                  <FormField
                    label="Area Unit"
                    icon={<FaRulerCombined />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <select
                      name="areaUnit"
                      value={roomData.areaUnit}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("areaUnit")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent text-gray-900"
                    >
                      <option value="sqft">Square Feet (sqft)</option>
                      <option value="sqm">Square Meters (sqm)</option>
                    </select>
                  </FormField>
                </div>
              </Section>

              {/* Pricing Section */}
              <Section title="Pricing" icon="💰">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    label="Rent Per Bed (₹)"
                    icon={<FaMoneyBillWave />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <input
                      type="number"
                      name="rentPerBed"
                      value={roomData.rentPerBed}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("rentPerBed")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent"
                      placeholder="Rent per bed"
                    />
                  </FormField>

                  <FormField
                    label="Rent Per Room (₹)"
                    icon={<FaMoneyBillWave />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <input
                      type="number"
                      name="rentPerRoom"
                      value={roomData.rentPerRoom}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("rentPerRoom")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent"
                      placeholder="Rent per room"
                    />
                  </FormField>

                  <FormField
                    label="Security Deposit (₹) *"
                    icon={<FaShieldAlt />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <input
                      type="number"
                      name="securityDeposit"
                      value={roomData.securityDeposit}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("securityDeposit")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent"
                      placeholder="Security deposit"
                      required
                    />
                  </FormField>

                  <FormField
                    label="Maintenance Charges (₹)"
                    icon={<FaMoneyBillWave />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <input
                      type="number"
                      name="maintenanceCharges"
                      value={roomData.maintenanceCharges}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("maintenanceCharges")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent"
                      placeholder="Maintenance charges"
                    />
                  </FormField>

                  <FormField
                    label="Electricity Charges"
                    icon={<FaToggleOn />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <select
                      name="electricityCharges"
                      value={roomData.electricityCharges}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("electricityCharges")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent text-gray-900"
                    >
                      <option value="Included">Included</option>
                      <option value="Extra">Extra</option>
                      <option value="Per-Unit">Per-Unit</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Water Charges"
                    icon={<FaToggleOn />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <select
                      name="waterCharges"
                      value={roomData.waterCharges}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("waterCharges")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent text-gray-900"
                    >
                      <option value="Included">Included</option>
                      <option value="Extra">Extra</option>
                    </select>
                  </FormField>
                </div>

                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200 mt-6">
                  <input
                    type="checkbox"
                    name="maintenanceIncluded"
                    checked={roomData.maintenanceIncluded}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-500 rounded cursor-pointer"
                  />
                  <label className="font-medium text-gray-900 cursor-pointer">
                    Maintenance Charges Included in Rent
                  </label>
                </div>
              </Section>

              {/* Features Section */}
              <Section title="Room Features" icon="✨">
                <div className="mb-6">
                  <FormField
                    label="Furnishing"
                    icon={<FaThLarge />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <select
                      name="furnishing"
                      value={roomData.furnishing}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("furnishing")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent text-gray-900"
                    >
                      <option value="Unfurnished">Unfurnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Fully-Furnished">Fully-Furnished</option>
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "hasAttachedBathroom", label: "Attached Bathroom" },
                    { name: "hasBalcony", label: "Balcony" },
                    { name: "hasAC", label: "Air Conditioning" },
                    { name: "hasWardrobe", label: "Wardrobe" },
                    { name: "hasFridge", label: "Refrigerator" },
                  ].map((feature) => (
                    <label
                      key={feature.name}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all border border-gray-200"
                    >
                      <input
                        type="checkbox"
                        name={feature.name}
                        checked={roomData[feature.name]}
                        onChange={handleChange}
                        className="w-5 h-5 text-orange-500 rounded cursor-pointer"
                      />
                      <span className="font-medium text-gray-900">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </Section>

              {/* Amenities Section */}
              <Section title="Amenities" icon="🏠">
                <div className="flex flex-wrap gap-3">
                  {amenitiesList.map((amenity) => {
                    const isActive = roomData.amenities.includes(amenity);
                    return (
                      <motion.button
                        key={amenity}
                        type="button"
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-200 border-2 ${
                          isActive
                            ? "bg-orange-500 border-orange-600 text-white shadow-lg"
                            : "bg-white border-gray-200 text-gray-700 hover:border-orange-300"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {amenity}
                      </motion.button>
                    );
                  })}
                </div>
              </Section>

              {/* Rules Section */}
              <Section title="Rules & Policies" icon="📋">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <FormField
                    label="Gender Preference"
                    icon={<FaUsers />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <select
                      name="genderPreference"
                      value={roomData.genderPreference}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("genderPreference")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent text-gray-900"
                    >
                      <option value="Any">Any Gender</option>
                      <option value="Male">Male Only</option>
                      <option value="Female">Female Only</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Food Type"
                    icon={<FaThLarge />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <select
                      name="foodType"
                      value={roomData.foodType}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("foodType")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent text-gray-900"
                    >
                      <option value="Both">Both Veg & Non-Veg</option>
                      <option value="Veg">Vegetarian Only</option>
                      <option value="Non-Veg">Non-Vegetarian Only</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Notice Period (days)"
                    icon={<FaClock />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <input
                      type="number"
                      name="noticePeriod"
                      value={roomData.noticePeriod}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("noticePeriod")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent"
                      placeholder="30"
                    />
                  </FormField>

                  <FormField
                    label="Lock-in Period (months)"
                    icon={<FaClock />}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    getFieldStyle={getFieldStyle}
                    getIconStyle={getIconStyle}
                  >
                    <input
                      type="number"
                      name="lockInPeriod"
                      value={roomData.lockInPeriod}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("lockInPeriod")}
                      onBlur={() => setFocusedField("")}
                      className="w-full outline-none bg-transparent"
                      placeholder="0"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "smokingAllowed", label: "Smoking Allowed" },
                    { name: "petsAllowed", label: "Pets Allowed" },
                    { name: "guestsAllowed", label: "Guests Allowed" },
                  ].map((rule) => (
                    <label
                      key={rule.name}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all border border-gray-200"
                    >
                      <input
                        type="checkbox"
                        name={rule.name}
                        checked={roomData[rule.name]}
                        onChange={handleChange}
                        className="w-5 h-5 text-orange-500 rounded cursor-pointer"
                      />
                      <span className="font-medium text-gray-900">{rule.label}</span>
                    </label>
                  ))}
                </div>
              </Section>

              {/* Images Section */}
              <Section title="Room Images" icon="🖼️">
                <FormField
                  label="Upload Images"
                  icon={<FaImage />}
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                  getFieldStyle={getFieldStyle}
                  getIconStyle={getIconStyle}
                >
                  <input
                    type="file"
                    onChange={handleImageChange}
                    onFocus={() => setFocusedField("images")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-transparent"
                    multiple
                    accept="image/*"
                  />
                </FormField>

                {/* Existing Images */}
                {roomData.existingImages.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Existing Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {roomData.existingImages.map((img, i) => (
                        <motion.div
                          key={`existing-${i}`}
                          className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-all"
                          whileHover={{ scale: 1.05 }}
                        >
                          <img
                            src={img}
                            alt={`Existing ${i + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <motion.button
                            type="button"
                            onClick={() => removeImage(i, true)}
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all"
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                          >
                            <FaTrash className="text-white opacity-0 group-hover:opacity-100" size={16} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {roomData.newImages.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">New Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {roomData.newImages.map((img, i) => (
                        <motion.div
                          key={`new-${i}`}
                          className="relative group rounded-lg overflow-hidden border-2 border-blue-200 hover:border-orange-500 transition-all bg-blue-50"
                          whileHover={{ scale: 1.05 }}
                        >
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`New ${i + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <motion.button
                            type="button"
                            onClick={() => removeImage(i, false)}
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all"
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                          >
                            <FaTrash className="text-white opacity-0 group-hover:opacity-100" size={16} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Uploading images...</span>
                      <span className="text-sm font-semibold text-blue-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </Section>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(`/landlord/property/${propertyId}`)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading || !propertyValid}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg ${
                    loading || !propertyValid ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  whileTap={{ scale: loading || !propertyValid ? 1 : 0.95 }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : roomId ? (
                    "Update Room"
                  ) : (
                    "Create Room"
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          // Bulk Rooms Form
          <div className="space-y-6">
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  Rooms ({bulkRooms.length})
                </h2>
                <motion.button
                  type="button"
                  onClick={addBulkRoom}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlus size={18} />
                  Add Room
                </motion.button>
              </div>

              {bulkRooms.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FaListUl className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-2">No rooms added yet</p>
                  <p className="text-gray-500 text-sm">Click "Add Room" button to start creating rooms</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {bulkRooms.map((room, index) => (
                    <motion.div
                      key={index}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-6 hover:border-orange-300 transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Room Header */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">
                          Room {index + 1} {room.roomNumber && `- #${room.roomNumber}`}
                        </h3>
                        <motion.button
                          type="button"
                          onClick={() => removeBulkRoom(index)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaMinus size={18} />
                        </motion.button>
                      </div>

                      {/* Room Form Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Room Number */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Room Number *
                          </label>
                          <input
                            type="text"
                            value={room.roomNumber}
                            onChange={(e) => updateBulkRoom(index, "roomNumber", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900"
                            placeholder="e.g., 101"
                            required
                          />
                        </div>

                        {/* Room Type */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Room Type *
                          </label>
                          <select
                            value={room.roomType}
                            onChange={(e) => updateBulkRoom(index, "roomType", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900"
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="Single">Single</option>
                            <option value="Double Sharing">Double Sharing</option>
                            <option value="Triple Sharing">Triple Sharing</option>
                            <option value="Dormitory">Dormitory</option>
                            <option value="1 BHK">1 BHK</option>
                            <option value="2 BHK">2 BHK</option>
                            <option value="3 BHK">3 BHK</option>
                          </select>
                        </div>

                        {/* Floor */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Floor
                          </label>
                          <input
                            type="number"
                            value={room.floor}
                            onChange={(e) => updateBulkRoom(index, "floor", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900"
                            placeholder="Floor number"
                          />
                        </div>

                        {/* Total Beds */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Total Beds *
                          </label>
                          <input
                            type="number"
                            value={room.totalBeds}
                            onChange={(e) => updateBulkRoom(index, "totalBeds", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900"
                            placeholder="Number of beds"
                            required
                            min="1"
                          />
                        </div>

                        {/* Rent Per Bed */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Rent Per Bed (₹)
                          </label>
                          <input
                            type="number"
                            value={room.rentPerBed}
                            onChange={(e) => updateBulkRoom(index, "rentPerBed", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900"
                            placeholder="Rent per bed"
                          />
                        </div>

                        {/* Security Deposit */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Security Deposit (₹) *
                          </label>
                          <input
                            type="number"
                            value={room.securityDeposit}
                            onChange={(e) => updateBulkRoom(index, "securityDeposit", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900"
                            placeholder="Security deposit"
                            required
                          />
                        </div>

                        {/* Furnishing */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Furnishing
                          </label>
                          <select
                            value={room.furnishing}
                            onChange={(e) => updateBulkRoom(index, "furnishing", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900"
                          >
                            <option value="Unfurnished">Unfurnished</option>
                            <option value="Semi-Furnished">Semi-Furnished</option>
                            <option value="Fully-Furnished">Fully-Furnished</option>
                          </select>
                        </div>

                        {/* Gender Preference */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Gender
                          </label>
                          <select
                            value={room.genderPreference}
                            onChange={(e) => updateBulkRoom(index, "genderPreference", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900"
                          >
                            <option value="Any">Any</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>

                        {/* Carpet Area */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Carpet Area
                          </label>
                          <input
                            type="number"
                            value={room.carpetArea}
                            onChange={(e) => updateBulkRoom(index, "carpetArea", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900"
                            placeholder="Area size"
                          />
                        </div>
                      </div>

                      {/* Features Checkboxes */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Features</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {[
                            { name: "hasAttachedBathroom", label: "Bathroom" },
                            { name: "hasBalcony", label: "Balcony" },
                            { name: "hasAC", label: "AC" },
                            { name: "hasWardrobe", label: "Wardrobe" },
                            { name: "hasFridge", label: "Fridge" },
                          ].map((feature) => (
                            <label
                              key={feature.name}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={room[feature.name]}
                                onChange={() => updateBulkRoom(index, feature.name, "", true)}
                                className="w-4 h-4 text-orange-500 rounded cursor-pointer"
                              />
                              <span className="text-sm text-gray-700">{feature.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Bulk Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/landlord/property/${propertyId}`)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleBulkSubmit}
                disabled={loading || !propertyValid || bulkRooms.length === 0}
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg ${
                  loading || !propertyValid || bulkRooms.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                whileTap={{
                  scale:
                    loading || !propertyValid || bulkRooms.length === 0 ? 1 : 0.95,
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating {bulkRooms.length} Rooms...
                  </span>
                ) : (
                  `Create ${bulkRooms.length} Room${bulkRooms.length !== 1 ? "s" : ""}`
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const Section = ({ title, icon, children }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
      <span className="text-3xl">{icon}</span>
      {title}
    </h2>
    <div className="bg-gray-50 p-6 rounded-xl">{children}</div>
  </div>
);

const FormField = ({
  label,
  icon,
  focusedField,
  setFocusedField,
  getFieldStyle,
  getIconStyle,
  children,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
    <div className={getFieldStyle(label)}>
      <span style={getIconStyle(label)}>{icon}</span>
      {children}
    </div>
  </div>
);

export default RoomAdd;