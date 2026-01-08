import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";
// Initial mapping of frontend amenity names to backend facility keys
const initialFacilityKeyMapping = {
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
// Reverse mapping for fetching data
const computeReverseMapping = (mapping) => {
  return Object.keys(mapping).reduce((acc, category) => {
    acc[category] = {};
    Object.entries(mapping[category]).forEach(([frontendKey, backendKey]) => {
      acc[category][backendKey] = frontendKey;
    });
    return acc;
  }, {});
};
// Initial amenities options
const initialAmenitiesOptions = {
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
// Initialize facilities with all backend keys set to false
const computeInitialFacilities = (mapping) => {
  return Object.keys(mapping).reduce((acc, category) => {
    acc[category] = Object.keys(mapping[category]).reduce(
      (catAcc, frontendKey) => {
        const backendKey = mapping[category][frontendKey];
        catAcc[frontendKey] = false;
        return catAcc;
      },
      {}
    );
    return acc;
  }, {});
};
// Custom Dialog Component
const CustomDialog = ({ isOpen, onClose, title, message, onConfirm, confirmText, cancelText, isConfirmDialog }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          {isConfirmDialog && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-all duration-200"
            >
              {cancelText || "Cancel"}
            </button>
          )}
          <button
            onClick={isConfirmDialog ? onConfirm : onClose}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              isConfirmDialog
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {confirmText || (isConfirmDialog ? "Confirm" : "OK")}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
// Simple Carousel Component for Cards
const ImageCarousel = ({ images, onImageClick, roomId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!images || images.length === 0) {
    return <div className="h-48 bg-gray-200 flex items-center justify-center rounded-lg">No Images</div>;
  }
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const handleClick = () => {
    onImageClick('room', images, currentIndex, roomId);
  };
  return (
    <div className="relative w-full h-48 cursor-pointer" onClick={handleClick}>
      <motion.img
        key={currentIndex}
        src={images[currentIndex]}
        alt={`Room Image ${currentIndex + 1}`}
        className="w-full h-full object-cover rounded-t-lg"
        loading="lazy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
          >
            <FaChevronLeft size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
          >
            <FaChevronRight size={12} />
          </button>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
// Full-Screen Image Modal Carousel
const ImageModal = ({ isOpen, onClose, type, images, currentIndex, roomId, bedId }) => {
  const [modalIndex, setModalIndex] = useState(currentIndex);
  useEffect(() => {
    if (isOpen) {
      setModalIndex(currentIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, currentIndex]);
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  if (!isOpen || !images || images.length === 0) return null;
  const nextSlide = () => {
    setModalIndex((prev) => (prev + 1) % images.length);
  };
  const prevSlide = () => {
    setModalIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const handleClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50" onClick={handleClick}>
      <motion.div
        className="relative w-full h-full flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.img
          key={modalIndex}
          src={images[modalIndex]}
          alt={`${type === 'room' ? 'Room' : 'Bed'} Image ${modalIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          loading="lazy"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 text-2xl"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 text-2xl"
            >
              <FaChevronRight />
            </button>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setModalIndex(idx); }}
                  className={`w-3 h-3 rounded-full ${idx === modalIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                />
              ))}
            </div>
          </>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
        >
          <FaTimes size={20} />
        </button>
      </motion.div>
    </div>
  );
};
const RoomAdd = () => {
  const { propertyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const action = searchParams.get("action");
  const roomId = searchParams.get("roomId");
  const API_BASE = `${baseurl}api/landlord/properties/${propertyId}/rooms`;
  const [focusedField, setFocusedField] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [facilityKeyMappingState, setFacilityKeyMappingState] = useState(
    initialFacilityKeyMapping
  );
  const [amenitiesOptionsState, setAmenitiesOptionsState] = useState(
    initialAmenitiesOptions
  );
  const [initialFacilitiesState, setInitialFacilitiesState] = useState(
    computeInitialFacilities(initialFacilityKeyMapping)
  );
  const [roomData, setRoomData] = useState({
    name: "",
    type: "",
    capacity: "",
    status: "Available",
    floorNumber: "",
    roomSize: "",
    securityDeposit: "",
    noticePeriod: "",
    facilities: computeInitialFacilities(initialFacilityKeyMapping),
    beds: [],
    images: [],
  });
  const [rooms, setRooms] = useState([]);
  const [showBedForm, setShowBedForm] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [beds, setBeds] = useState([
    { name: "", status: "Available", price: "", images: [] },
  ]);
  const [showAddFacilityForm, setShowAddFacilityForm] = useState(false);
  const [newFacilityCategory, setNewFacilityCategory] = useState("");
  const [newFacilityName, setNewFacilityName] = useState("");
  const [showBedsModal, setShowBedsModal] = useState(false);
  const [bedsModalData, setBedsModalData] = useState([]);
  const [editBedModal, setEditBedModal] = useState({ open: false, bed: null });
  const [editBedNewImages, setEditBedNewImages] = useState([]);
  const [editBedLoading, setEditBedLoading] = useState(false);
  const [editBedError, setEditBedError] = useState("");
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "",
    cancelText: "",
    isConfirmDialog: false,
  });
  // New state for image modal
  const [imageModal, setImageModal] = useState({ open: false, type: '', images: [], currentIndex: 0, roomId: '', bedId: '' });
  const [globalTotalBeds, setGlobalTotalBeds] = useState(0);
  const [totalLimit, setTotalLimit] = useState(0);
  const [landlordId, setLandlordId] = useState(null);
  const getToken = () => localStorage.getItem("token");
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  const handleOpenImageModal = useCallback((type, images, index = 0, roomId, bedId) => {
    setImageModal({ open: true, type, images, currentIndex: index, roomId, bedId });
  }, []);
  const handleCloseImageModal = useCallback(() => {
    setImageModal({ open: false, type: '', images: [], currentIndex: 0, roomId: '', bedId: '' });
  }, []);
  const fetchGlobalBedsCount = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get(`${baseurl}api/landlord/properties/beds/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        setGlobalTotalBeds(res.data.totalBeds || 0);
        setLandlordId(res.data.landlordId);
      }
    } catch (err) {
      console.error("Error fetching global beds count:", err);
    }
  }, []);
  const fetchMySubscriptions = useCallback(async () => {
    if (!landlordId) return;
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get(`${baseurl}api/landlord/subscriptions/my-subscriptions/${landlordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        const activeSubsWithPlan = res.data.data.filter(sub =>
          sub.status === 'active' && sub.planId && sub.planId.maxBeds
        );
        const calculatedLimit = activeSubsWithPlan.reduce((acc, sub) => acc + sub.planId.maxBeds, 0);
        setTotalLimit(calculatedLimit || 0);
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setTotalLimit(0); // Fallback to 0 on error
    }
  }, [landlordId]);
  useEffect(() => {
    fetchGlobalBedsCount();
  }, [fetchGlobalBedsCount]);
  useEffect(() => {
    if (landlordId) {
      fetchMySubscriptions();
    }
  }, [landlordId, fetchMySubscriptions]);
  const deleteRoomImage = async (targetRoomId, imageUrl) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios.delete(
        `${baseurl}api/landlord/properties/${propertyId}/rooms/${targetRoomId}/images`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            imageUrls: [imageUrl],
          },
        }
      );
      if (res.data.success) {
        // Update local state for edit mode if applicable
        if (action === "edit" && editingId === targetRoomId) {
          setRoomData((prev) => ({
            ...prev,
            images: prev.images.filter((img) => img !== imageUrl),
          }));
        }
        // Refetch rooms to update list
        await fetchRooms();
        setDialog({
          isOpen: true,
          title: "Success",
          message: res.data.message || "Image deleted successfully.",
          isConfirmDialog: false,
        });
        return true;
      } else {
        throw new Error(res.data.message || "Failed to delete image.");
      }
    } catch (err) {
      console.error("Error deleting room image:", err.response?.data || err);
      setError(err.response?.data?.message || `Failed to delete image: ${err.message}`);
      setDialog({
        isOpen: true,
        title: "Error",
        message: `Failed to delete image: ${err.response?.data?.message || err.message}`,
        isConfirmDialog: false,
      });
      return false;
    }
  };
  const deleteBedImage = async (targetRoomId, bedId, imageUrl) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios.delete(
        `${baseurl}api/landlord/properties/${propertyId}/rooms/${targetRoomId}/beds/${bedId}/images`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            imageUrls: [imageUrl],
          },
        }
      );
      if (res.data.success) {
        // Update local state for edit bed modal if applicable
        if (editBedModal.open && editBedModal.bed.bedId === bedId) {
          setEditBedModal((prev) => ({
            ...prev,
            bed: {
              ...prev.bed,
              images: prev.bed.images.filter((img) => img !== imageUrl),
            },
          }));
        }
        // Update beds modal data if open
        if (showBedsModal) {
          setBedsModalData((prev) =>
            prev.map((b) =>
              b.bedId === bedId
                ? { ...b, images: b.images.filter((img) => img !== imageUrl) }
                : b
            )
          );
        }
        // Refetch rooms to update list
        await fetchRooms();
        setDialog({
          isOpen: true,
          title: "Success",
          message: res.data.message || "Image deleted successfully.",
          isConfirmDialog: false,
        });
        return true;
      } else {
        throw new Error(res.data.message || "Failed to delete image.");
      }
    } catch (err) {
      console.error("Error deleting bed image:", err.response?.data || err);
      setError(err.response?.data?.message || `Failed to delete image: ${err.message}`);
      setDialog({
        isOpen: true,
        title: "Error",
        message: `Failed to delete image: ${err.response?.data?.message || err.message}`,
        isConfirmDialog: false,
      });
      return false;
    }
  };
  const fetchRoomImages = async (roomId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios.get(
        `${baseurl}api/landlord/properties/${propertyId}/room/${roomId}/images`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data.images || [];
    } catch (err) {
      console.error(
        `Error fetching images for room ${roomId}:`,
        err.response?.data || err
      );
      return [];
    }
  };
  const fetchBedImages = async (roomId, bedId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios.get(
        `${baseurl}api/landlord/properties/${propertyId}/rooms/${roomId}/beds/${bedId}/images`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data.images || [];
    } catch (err) {
      console.error(
        `Error fetching images for bed ${bedId} in room ${roomId}:`,
        err.response?.data || err
      );
      return [];
    }
  };
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios.get(`${API_BASE}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      let fetchedRooms = [];
      if (Array.isArray(res.data)) {
        fetchedRooms = res.data;
      } else if (res.data && Array.isArray(res.data.rooms)) {
        fetchedRooms = res.data.rooms;
      } else {
        console.warn("Unexpected API response structure:", res.data);
        fetchedRooms = Object.values(res.data).filter((item) => item.roomId);
      }
      // Map backend facilities to frontend format and fetch images
      const roomsWithImages = await Promise.all(
        fetchedRooms.map(async (room) => {
          const mappedFacilities = Object.keys(facilityKeyMappingState).reduce(
            (acc, category) => {
              acc[category] = Object.keys(
                facilityKeyMappingState[category]
              ).reduce((catAcc, frontendKey) => {
                const backendKey = facilityKeyMappingState[category][frontendKey];
                let isSelected = false;
                if (Array.isArray(room.facilities)) {
                  isSelected = room.facilities.includes(backendKey);
                } else if (room.facilities?.[category]?.[backendKey]) {
                  isSelected = room.facilities[category][backendKey];
                } else if (room.allFacilities?.[category]?.[backendKey]) {
                  isSelected = room.allFacilities[category][backendKey];
                }
                catAcc[frontendKey] = isSelected;
                return catAcc;
              }, {});
              return acc;
            },
            {}
          );
          const images = await fetchRoomImages(room.roomId || room._id);
          // Fetch images for each bed
          const bedsWithImages = await Promise.all(
            (room.beds || []).map(async (bed) => {
              const bedImages = await fetchBedImages(room.roomId || room._id, bed.bedId);
              return { ...bed, images: bedImages };
            })
          );
          return {
            ...room,
            name:
              room.name ||
              room.roomId ||
              `Room ${Date.now().toString().slice(-4)}`,
            facilities: mappedFacilities,
            images,
            beds: bedsWithImages,
          };
        })
      );
      setRooms(roomsWithImages);
    } catch (err) {
      console.error("Error fetching rooms:", err.response?.data || err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [propertyId, facilityKeyMappingState]);
  const debouncedFetchRooms = useCallback(debounce(fetchRooms, 300), [
    fetchRooms,
  ]);
  useEffect(() => {
    if (propertyId && !action) {
      debouncedFetchRooms();
    }
  }, [propertyId, debouncedFetchRooms, action]);
  useEffect(() => {
    if (action === "edit" && roomId) {
      const fetchRoomForEdit = async () => {
        try {
          setLoading(true);
          setError(null);
          const token = getToken();
          if (!token) {
            throw new Error("No authentication token found. Please log in.");
          }
          const res = await axios.get(`${API_BASE}/${roomId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const fetchedRoom = res.data.room;
          const images = fetchedRoom.images || [];
          // Map backend facilities to frontend format
          const mappedFacilities = Object.keys(facilityKeyMappingState).reduce(
            (acc, category) => {
              acc[category] = Object.keys(
                facilityKeyMappingState[category]
              ).reduce((catAcc, frontendKey) => {
                const backendKey =
                  facilityKeyMappingState[category][frontendKey];
                let isSelected = false;
                if (Array.isArray(fetchedRoom.facilities)) {
                  isSelected = fetchedRoom.facilities.includes(backendKey);
                } else if (fetchedRoom.facilities?.[category]?.[backendKey]) {
                  isSelected = fetchedRoom.facilities[category][backendKey];
                } else if (fetchedRoom.allFacilities?.[category]?.[backendKey]) {
                  isSelected = fetchedRoom.allFacilities[category][backendKey];
                }
                catAcc[frontendKey] = isSelected;
                return catAcc;
              }, {});
              return acc;
            },
            {}
          );
          // Fetch images for each bed
          const bedsWithImages = await Promise.all(
            (fetchedRoom.beds || []).map(async (bed) => {
              const bedImages = await fetchBedImages(roomId, bed.bedId);
              return { ...bed, images: bedImages };
            })
          );
          const roomName = fetchedRoom.name || fetchedRoom.roomId || `Room ${Date.now().toString().slice(-4)}`;
          setRoomData({
            ...fetchedRoom,
            name: roomName,
            facilities: mappedFacilities,
            images,
            beds: bedsWithImages,
          });
          setEditingId(roomId);
        } catch (err) {
          console.error(
            "Error fetching room for edit:",
            err.response?.data || err
          );
          setError(err.response?.data?.message || err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRoomForEdit();
    }
  }, [action, roomId, propertyId, facilityKeyMappingState]);
  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };
  const handleFacilityToggle = (category, frontendKey) => {
    setRoomData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [category]: {
          ...prev.facilities[category],
          [frontendKey]: !prev.facilities[category][frontendKey],
        },
      },
    }));
  };
  const handleAddNewFacility = () => {
    if (!newFacilityCategory || !newFacilityName) return;
    const backendKey = newFacilityName.toLowerCase().replace(/\s+/g, "");
    setAmenitiesOptionsState((prev) => ({
      ...prev,
      [newFacilityCategory]: [...prev[newFacilityCategory], newFacilityName],
    }));
    setFacilityKeyMappingState((prev) => ({
      ...prev,
      [newFacilityCategory]: {
        ...prev[newFacilityCategory],
        [newFacilityName]: backendKey,
      },
    }));
    setRoomData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [newFacilityCategory]: {
          ...prev.facilities[newFacilityCategory],
          [newFacilityName]: false,
        },
      },
    }));
    setNewFacilityName("");
    setShowAddFacilityForm(false);
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setRoomData((prev) => ({ ...prev, images: [...prev.images.filter(img => !(img instanceof File)), ...files] }));
  };
  const handleBedChange = (index, field, value) => {
    const updatedBeds = [...beds];
    updatedBeds[index] = { ...updatedBeds[index], [field]: value };
    setBeds(updatedBeds);
  };
  const handleBedImageChange = (index, e) => {
    const files = Array.from(e.target.files);
    const updatedBeds = [...beds];
    updatedBeds[index] = { ...updatedBeds[index], images: [...updatedBeds[index].images.filter(img => !(img instanceof File)), ...files] };
    setBeds(updatedBeds);
  };
  const addBedField = () => {
    setBeds([
      ...beds,
      { name: "", status: "Available", price: "", images: [] },
    ]);
  };
  const removeBedField = (index) => {
    setBeds(beds.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedFacilities = {};
    Object.entries(roomData.facilities).forEach(([category, facilities]) => {
      const selectedInCategory = {};
      Object.entries(facilities).forEach(([frontendKey, isSelected]) => {
        if (isSelected) {
          const backendKey = facilityKeyMappingState[category][frontendKey];
          selectedInCategory[backendKey] = true;
        }
      });
      if (Object.keys(selectedInCategory).length > 0) {
        selectedFacilities[category] = selectedInCategory;
      }
    });
    const payload = {
      name: roomData.name || `Room ${Date.now().toString().slice(-4)}`,
      type: roomData.type,
      price: Number(roomData.price),
      capacity: Number(roomData.capacity),
      status: roomData.status,
      floorNumber: roomData.floorNumber ? Number(roomData.floorNumber) : null,
      roomSize: roomData.roomSize,
      securityDeposit: Number(roomData.securityDeposit) || 0,
      noticePeriod: Number(roomData.noticePeriod) || 0,
      facilities: selectedFacilities,
      beds: roomData.beds,
    };
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios({
        method: editingId ? "PUT" : "POST",
        url: editingId ? `${API_BASE}/${editingId}` : API_BASE,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: payload,
      });
      console.log("Room save response:", res.data); // Debug log
      let savedRoomId;
      if (editingId) {
        savedRoomId = editingId;
      } else {
        // For POST, extract roomId from addedRooms array or other structures
        savedRoomId = res.data?.addedRooms?.[0]?.roomId ||
                      res.data?.addedRooms?.[0]?._id ||
                      res.data?.room?.roomId ||
                      res.data?.room?._id ||
                      res.data?.roomId ||
                      res.data?._id;
      }
      if (!savedRoomId) {
        console.error('Could not extract roomId from response:', res.data);
        throw new Error('Failed to extract room ID from server response');
      }
      console.log("Uploading images for roomId:", savedRoomId); // Debug log
      // Filter only File instances for upload (skip URLs from existing images)
      const imagesToUpload = roomData.images.filter(img => img instanceof File);
      if (imagesToUpload.length > 0) {
        const formData = new FormData();
        imagesToUpload.forEach((image) => formData.append("images", image));
        await axios.post(`${API_BASE}/${savedRoomId}/images`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            // No Content-Type for FormData, let browser set it
          },
        });
        console.log("Images uploaded successfully"); // Debug log
      } else {
        console.log("No new images to upload"); // Debug log
      }
      await fetchRooms();
      // Refetch global beds count after adding room (though beds are separate)
      await fetchGlobalBedsCount();
      resetForm();
      setDialog({
        isOpen: true,
        title: "Success",
        message: "Room saved successfully.",
        isConfirmDialog: false,
      });
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
      setDialog({
        isOpen: true,
        title: "Error",
        message: `Failed to save room: ${err.response?.data?.message || err.message}`,
        isConfirmDialog: false,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleBedSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const savedBeds = [];
      for (const bed of beds) {
        if (!bed.name) {
          throw new Error("Bed name is required.");
        }
        const payload = {
          name: bed.name,
          status: bed.status,
          price: Number(bed.price) || 0, // Default to 0 if not provided, to avoid required error
        };
        const res = await axios.post(
          `${API_BASE}/${selectedRoomId}/beds`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const savedBed = res.data.bed;
        const savedBedId = savedBed?.bedId;
        if (bed.images && bed.images.length > 0 && savedBedId) {
          // Filter only File instances
          const imagesToUpload = bed.images.filter(img => img instanceof File);
          if (imagesToUpload.length > 0) {
            const formData = new FormData();
            imagesToUpload.forEach((image) => formData.append("images", image));
            const imageRes = await axios.post(
              `${API_BASE}/${selectedRoomId}/beds/${savedBedId}/images`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            savedBed.images = imageRes.data.images || [];
          } else {
            savedBed.images = bed.images; // Existing URLs
          }
        }
        savedBeds.push(savedBed);
      }
      setBeds([{ name: "", status: "Available", price: "", images: [] }]);
      await fetchRooms();
      // Refetch global beds count after adding beds
      await fetchGlobalBedsCount();
      resetBedForm();
      setDialog({
        isOpen: true,
        title: "Success",
        message: "Beds added successfully.",
        isConfirmDialog: false,
      });
    } catch (err) {
      console.error("Error adding beds:", err.response?.data || err);
      setError(
        err.response?.data?.message || `Failed to add beds: ${err.message}`
      );
      setDialog({
        isOpen: true,
        title: "Error",
        message: `Failed to add beds: ${err.response?.data?.message || err.message}`,
        isConfirmDialog: false,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAddBeds = async (room) => {
    try {
      await fetchGlobalBedsCount();
      await fetchMySubscriptions();
      if (globalTotalBeds >= totalLimit) {
        setDialog({
          isOpen: true,
          title: "Subscription Limit Reached",
          message: `You have reached your limit of ${totalLimit} active beds under your subscription. Please buy or upgrade your subscription to add more beds.`,
          onConfirm: () => navigate("/landlord/subscription-plans"),
          confirmText: "Buy Subscription",
          cancelText: "Cancel",
          isConfirmDialog: true,
        });
        return;
      }
      setSelectedRoomId(room._id || room.roomId);
      setShowBedForm(true);
    } catch (err) {
      console.error("Error checking limits:", err);
      // On error, allow proceeding or show error
      setDialog({
        isOpen: true,
        title: "Error",
        message: "Could not check subscription limits. Proceeding anyway.",
        isConfirmDialog: false,
      });
      setSelectedRoomId(room._id || room.roomId);
      setShowBedForm(true);
    }
  };
  const handleViewBeds = async (roomId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios.get(
        `${API_BASE}/${roomId}/beds`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data && Array.isArray(res.data.beds)) {
        // Fetch images for each bed
        const bedsWithImages = await Promise.all(
          res.data.beds.map(async (bed) => {
            const bedImages = await fetchBedImages(roomId, bed.bedId);
            return { ...bed, roomId, images: bedImages };
          })
        );
        setBedsModalData(bedsWithImages);
        setShowBedsModal(true);
      } else {
        setDialog({
          isOpen: true,
          title: "Error",
          message: res.data.message || "Could not fetch beds.",
          isConfirmDialog: false,
        });
      }
    } catch (err) {
      console.error("Error fetching beds:", err.response?.data || err);
      setDialog({
        isOpen: true,
        title: "Error",
        message: `Failed to fetch beds: ${err.response?.data?.message || err.message}`,
        isConfirmDialog: false,
      });
    }
  };
  const handleEditBed = (bed) => {
    let roomId = bed.roomId;
    if (!roomId) {
      const found = bedsModalData.find(b => b.bedId === bed.bedId);
      roomId = found?.roomId;
    }
    if (!roomId && selectedRoomId) {
      roomId = selectedRoomId;
    }
    setEditBedModal({ open: true, bed: { ...bed, roomId } });
    setEditBedNewImages([]);
    setEditBedError("");
  };
  const handleEditBedChange = (field, value) => {
    setEditBedModal((prev) => ({
      ...prev,
      bed: { ...prev.bed, [field]: value },
    }));
  };
  const handleEditBedImageChange = (e) => {
    const files = Array.from(e.target.files);
    setEditBedNewImages(files);
  };
  const handleEditBedSubmit = async (e) => {
    e.preventDefault();
    setEditBedLoading(true);
    setEditBedError("");
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const { bed } = editBedModal;
      const payload = {
        status: bed.status,
      };
      const res = await axios.put(
        `${API_BASE}/${bed.roomId}/beds/${bed.bedId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      let updatedImages = bed.images || [];
      if (editBedNewImages.length > 0) {
        const formData = new FormData();
        editBedNewImages.forEach((image) => formData.append("images", image));
        const imageRes = await axios.post(
          `${API_BASE}/${bed.roomId}/beds/${bed.bedId}/images`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        updatedImages = [...updatedImages, ...(imageRes.data.images || [])];
      }
      if (res.data.success) {
        setBedsModalData((prev) =>
          prev.map((b) =>
            b.bedId === bed.bedId
              ? { ...b, status: bed.status, images: updatedImages }
              : b
          )
        );
        setEditBedModal({ open: false, bed: null });
        setEditBedNewImages([]);
        setDialog({
          isOpen: true,
          title: "Success",
          message: res.data.message || "Bed updated successfully.",
          isConfirmDialog: false,
        });
        await fetchRooms();
        // Refetch global beds count after updating bed
        await fetchGlobalBedsCount();
      } else {
        throw new Error(res.data.message || "Failed to update bed.");
      }
    } catch (err) {
      console.error("Error updating bed:", err.response?.data || err);
      setEditBedError(err.response?.data?.message || `Failed to update bed: ${err.message}`);
    } finally {
      setEditBedLoading(false);
    }
  };
  const handleDeleteBed = async (bed) => {
    setDialog({
      isOpen: true,
      title: "Confirm Delete",
      message: `Are you sure you want to delete bed ${bed.name}?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          setError(null);
          const token = getToken();
          if (!token) {
            throw new Error("No authentication token found. Please log in.");
          }
          const res = await axios.delete(
            `${API_BASE}/${bed.roomId}/beds/${bed.bedId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (res.data.success) {
            setBedsModalData((prev) => prev.filter((b) => b.bedId !== bed.bedId));
            setDialog({
              isOpen: true,
              title: "Success",
              message: res.data.message || "Bed deleted successfully.",
              isConfirmDialog: false,
            });
            await fetchRooms();
            // Refetch global beds count after deleting bed
            await fetchGlobalBedsCount();
          } else {
            throw new Error(res.data.message || "Failed to delete bed.");
          }
        } catch (err) {
          console.error("Error deleting bed:", err.response?.data || err);
          setError(
            err.response?.data?.message || `Failed to delete bed: ${err.message}`
          );
          setDialog({
            isOpen: true,
            title: "Error",
            message: `Failed to delete bed: ${err.response?.data?.message || err.message}`,
            isConfirmDialog: false,
          });
        } finally {
          setLoading(false);
        }
      },
      confirmText: "Delete",
      cancelText: "Cancel",
      isConfirmDialog: true,
    });
  };
  const resetForm = () => {
    setRoomData({
      name: "",
      type: "",
      price: "",
      capacity: "",
      status: "Available",
      floorNumber: "",
      roomSize: "",
      securityDeposit: "",
      noticePeriod: "",
      facilities: initialFacilitiesState,
      beds: [],
      images: [],
    });
    setEditingId(null);
    setFocusedField("");
    navigate(location.pathname);
  };
  const resetBedForm = () => {
    setShowBedForm(false);
    setSelectedRoomId(null);
    setBeds([{ name: "", status: "Available", price: "", images: [] }]);
  };
  const handleDelete = async (roomId) => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      await axios.delete(`${API_BASE}/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchRooms();
      setDialog({
        isOpen: true,
        title: "Success",
        message: "Room deleted successfully.",
        isConfirmDialog: false,
      });
    } catch (err) {
      console.error("Error deleting room:", err.response?.data || err);
      setError(
        err.response?.data?.message || `Failed to delete room: ${err.message}`
      );
      setDialog({
        isOpen: true,
        title: "Error",
        message: `Failed to delete room: ${err.response?.data?.message || err.message}`,
        isConfirmDialog: false,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (room) => {
    setSearchParams({ action: "edit", roomId: room._id || room.roomId });
  };
  const handleAddRoom = () => {
    setSearchParams({ action: "add" });
  };
  const getFieldStyle = (name) =>
    `w-full flex items-center gap-2 border rounded-md px-4 py-2 bg-transparent transition-all duration-200 ${
      focusedField === name ? "border-blue-400" : "border-gray-300"
    } text-black`;
  const getIconStyle = (name) => ({
    color: focusedField === name ? "#3b82f6" : "#6b7280",
  });
  if (action) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 bg-white min-h-screen text-black rounded-xl shadow-lg relative">
        {error && (
          <motion.p
            className="text-red-500 text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        <motion.div
          className="bg-gray-50 p-4 sm:p-6 rounded-2xl shadow-lg w-full max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {action === "add" ? "Add Room" : "Edit Room"}
            </h3>
            <button
              onClick={() => resetForm()}
              className="text-gray-600 hover:text-black"
            >
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Room Name</label>
                <div className={getFieldStyle("roomName")}>
                  <FaListUl style={getIconStyle("roomName")} />
                  <input
                    type="text"
                    name="name"
                    value={roomData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("roomName")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-transparent"
                    placeholder="Enter room name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Room Type</label>
                <div className={getFieldStyle("roomType")}>
                  <FaThLarge style={getIconStyle("roomType")} />
                  <select
                    name="type"
                    value={roomData.type}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("roomType")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-gray-50 text-black"
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
                    <option value="More Than 6 Sharing">
                      More Than 6 Sharing
                    </option>
                    <option value="Private Room">Private Room</option>
                    <option value="Shared Room">Shared Room</option>
                    <option value="Couple">Couple</option>
                    <option value="Family">Family</option>
                    <option value="Male Only">Male Only</option>
                    <option value="Female Only">Female Only</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Student Only">Student Only</option>
                    <option value="Working Professionals Only">
                      Working Professionals Only
                    </option>
                  </select>
                </div>
              </div>
     
          
              <div>
                <label className="block font-semibold mb-1">Capacity</label>
                <div className={getFieldStyle("capacity")}>
                  <FaUsers style={getIconStyle("capacity")} />
                  <input
                    type="number"
                    name="capacity"
                    value={roomData.capacity}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("capacity")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-transparent"
                    placeholder="Enter capacity"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Status</label>
                <div className={getFieldStyle("status")}>
                  <FaToggleOn style={getIconStyle("status")} />
                  <select
                    name="status"
                    value={roomData.status}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("status")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-gray-50"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                    <option value="Partially Available">Partially Available</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Floor Number</label>
                <div className={getFieldStyle("floorNumber")}>
                  <FaLayerGroup style={getIconStyle("floorNumber")} />
                  <input
                    type="number"
                    name="floorNumber"
                    value={roomData.floorNumber || ""}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("floorNumber")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-transparent"
                    placeholder="Enter floor number"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Room Size</label>
                <div className={getFieldStyle("roomSize")}>
                  <FaThLarge style={getIconStyle("roomSize")} />
                  <input
                    type="text"
                    name="roomSize"
                    value={roomData.roomSize || ""}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("roomSize")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-transparent"
                    placeholder="Enter room size (e.g., 200 sq ft)"
                  />
                </div>
              </div>
              <div className="lg:col-span-3">
                <label className="block font-semibold mb-1">
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
                    className="w-full outline-none bg-transparent"
                    multiple
                    accept="image/*"
                  />
                </div>
                {roomData.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {roomData.images.map((img, i) => (
                      <div key={i} className="relative">
                        {img instanceof File ? (
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${i + 1}`}
                            className="h-16 w-16 object-cover rounded border"
                            loading="lazy"
                          />
                        ) : (
                          <>
                            <img
                              src={img}
                              alt={`Room Image ${i + 1}`}
                              className="h-16 w-16 object-cover rounded border"
                              loading="lazy"
                            />
                            <button
                              onClick={() => deleteRoomImage(editingId || roomId, img)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                              title="Delete Image"
                            >
                              <FaTrash size={10} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* <div>
                <label className="block font-semibold mb-1">Security Deposit (₹)</label>
                <div className={getFieldStyle("securityDeposit")}>
                  <FaMoneyBillWave style={getIconStyle("securityDeposit")} />
                  <input
                    type="number"
                    name="securityDeposit"
                    value={roomData.securityDeposit || ""}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("securityDeposit")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-transparent"
                    placeholder="Enter security deposit"
                  />
                </div>
              </div> */}
              <div>
                <label className="block font-semibold mb-1">Notice Period (days)</label>
                <div className={getFieldStyle("noticePeriod")}>
                  <FaToggleOn style={getIconStyle("noticePeriod")} />
                  <input
                    type="number"
                    name="noticePeriod"
                    value={roomData.noticePeriod || ""}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("noticePeriod")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-transparent"
                    placeholder="Enter notice period"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-2">Facilities</label>
              <div className="flex flex-wrap gap-3">
                {Object.entries(amenitiesOptionsState).map(
                  ([category, options]) => (
                    <div key={category} className="w-full">
                      <h4 className="text-lg font-medium mb-2 capitalize">
                        {category.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {options.map((option) => {
                          const isActive = roomData.facilities[category]?.[option] || false;
                          return (
                            <button
                              key={option}
                              onClick={() =>
                                handleFacilityToggle(category, option)
                              }
                              type="button"
                              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300
              ${
                isActive
                  ? "bg-green-500 border-green-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-black"
              }`}
                            >
                              <div
                                className={`w-6 h-6 flex items-center justify-center rounded-md
                ${
                  isActive
                    ? "bg-gradient-to-br from-green-400 to-green-600 shadow-md shadow-green-700"
                    : "bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner"
                }
                `}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={3}
                                  stroke="white"
                                  className={`w-4 h-4 transition-opacity duration-200
                  ${isActive ? "opacity-100" : "opacity-40"}`}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <span className="text-sm font-medium">
                                {option}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4">
                {/* <motion.button
                  type="button"
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-all duration-200"
                  onClick={() => setShowAddFacilityForm(!showAddFacilityForm)}
                  whileTap={{ scale: 0.95 }}
                >
                  Add More Facilities
                </motion.button> */}
                {/* {showAddFacilityForm && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <label className="block font-semibold mb-1">Category</label>
                    <select
                      value={newFacilityCategory}
                      onChange={(e) => setNewFacilityCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-transparent text-black mb-2"
                    >
                      <option value="">Select Category</option>
                      {Object.keys(amenitiesOptionsState).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.replace(/([A-Z])/g, " $1").trim()}
                        </option>
                      ))}
                    </select>
                    <label className="block font-semibold mb-1">
                      Facility Name
                    </label>
                    <input
                      type="text"
                      value={newFacilityName}
                      onChange={(e) => setNewFacilityName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-transparent text-black mb-2"
                      placeholder="Enter new facility name"
                    />
                    <motion.button
                      type="button"
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all duration-200"
                      onClick={handleAddNewFacility}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add Facility
                    </motion.button>
                  </div>
                )} */}
              </div>
            </div>
            <motion.button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
              whileTap={{ scale: 0.95 }}
            >
              {action === "add" ? "Add Room" : "Update Room"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 bg-gray-100 min-h-screen text-black rounded-xl shadow-lg relative">
      <motion.h2
        className="text-3xl font-bold mb-6 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Rooms
      </motion.h2>
      {error && (
        <motion.p
          className="text-red-500 text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {globalTotalBeds > totalLimit && (
        <motion.div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <span className="font-medium">Total Properties Beds: {globalTotalBeds}</span>
                <br />
                <span className="font-medium">Total Subscribed Beds: {totalLimit}</span>
                <br />
                You have more properties beds ({globalTotalBeds}) than subscribed. Upgrade your plan to utilize all!
              </p>
              <div className="mt-2">
                <button
                  onClick={() => navigate("/landlord/subscription-plans")}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <div className="text-center mb-6">
        <motion.button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
          onClick={handleAddRoom}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus className="inline mr-2" /> Add Room
        </motion.button>
      </div>
      {rooms.length === 0 && !loading && !error ? (
        <p className="text-center text-gray-500">No rooms added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, index) => {
            if (!room) {
              console.warn("Undefined room found in rooms array:", room);
              return null;
            }
            return (
              <motion.div
                key={`${room.roomId}-${index}`}
                className="rounded-xl overflow-hidden shadow-md bg-white border border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ImageCarousel images={room.images} onImageClick={handleOpenImageModal} roomId={room.roomId} />
                {room.beds && room.beds.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3">
                    {room.beds.map((bed, bidx) => (
                      <React.Fragment key={bed.bedId || bidx}>
                        <BedImagesDisplay
                          propertyId={propertyId}
                          roomId={room.roomId}
                          bedId={bed.bedId}
                          images={bed.images}
                          onDeleteImage={(imageUrl) => deleteBedImage(room.roomId, bed.bedId, imageUrl)}
                          onImageClick={handleOpenImageModal}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                )}
                <div className="p-3 flex flex-col justify-between flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-black">
                      {room.name || room.roomId || "Unnamed Room"}
                    </h3>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                      {room.type || "N/A"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    <div className="text-xs text-gray-700">
                      <FaBed className="inline mr-1 text-blue-400" /> Beds:{" "}
                      <span className="font-medium">
                        {room.beds && room.beds.length
                          ? room.beds.length
                          : room.availableBeds || "N/A"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700">
                      <FaUsers className="inline mr-1 text-pink-400" />{" "}
                      Capacity:{" "}
                      <span className="font-medium">
                        {room.capacity || room.totalBeds || "N/A"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700">
                      <FaMoneyBillWave className="inline mr-1 text-green-400" />{" "}
                      Rent:{" "}
                      <span className="font-medium">
                        ₹{room.price || "N/A"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700">
                      <FaToggleOn className="inline mr-1 text-yellow-400" />{" "}
                      Status:{" "}
                      <span className="font-medium">
                        {room.status || "N/A"}
                      </span>
                    </div>
                    {room.floorNumber && (
                      <div className="text-xs text-gray-700">
                        <FaLayerGroup className="inline mr-1 text-purple-400" />{" "}
                        Floor:{" "}
                        <span className="font-medium">
                          {room.floorNumber}
                        </span>
                      </div>
                    )}
                    {room.roomSize && (
                      <div className="text-xs text-gray-700">
                        <FaThLarge className="inline mr-1 text-indigo-400" />{" "}
                        Size:{" "}
                        <span className="font-medium">
                          {room.roomSize} sq ft
                        </span>
                      </div>
                    )}
                    {room.securityDeposit > 0 && (
                      <div className="text-xs text-gray-700">
                        <FaMoneyBillWave className="inline mr-1 text-green-400" />{" "}
                        Deposit:{" "}
                        <span className="font-medium">
                          ₹{room.securityDeposit}
                        </span>
                      </div>
                    )}
                    {room.noticePeriod > 0 && (
                      <div className="text-xs text-gray-700">
                        <FaToggleOn className="inline mr-1 text-orange-400" />{" "}
                        Notice:{" "}
                        <span className="font-medium">
                          {room.noticePeriod} days
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex justify-end gap-1 flex-nowrap">
                    <button
                      onClick={() => handleEdit(room)}
                      className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleAddBeds(room)}
                      className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      Add Beds
                    </button>
                    <button
                      onClick={() => handleViewBeds(room.roomId)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      <FaEye className="inline mr-1" /> View Beds
                    </button>
                    <button
                      onClick={() => handleDelete(room.roomId)}
                      className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.open}
        onClose={handleCloseImageModal}
        type={imageModal.type}
        images={imageModal.images}
        currentIndex={imageModal.currentIndex}
        roomId={imageModal.roomId}
        bedId={imageModal.bedId}
      />
      {showBedsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setShowBedsModal(false)}
            >
              <FaTimes />
            </button>
            <h3 className="text-xl font-bold mb-4">Beds</h3>
            {bedsModalData.length === 0 ? (
              <p className="text-center text-gray-500">No beds found.</p>
            ) : (
              <table className="min-w-full text-sm mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Bed Name</th>
                    <th className="p-2 text-left">Bed ID</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Tenants</th>
                    <th className="p-2 text-left">Images</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bedsModalData.map((bed) => (
                    <tr key={bed.bedId} className="border-b">
                      <td className="p-2">{bed.name}</td>
                      <td className="p-2">{bed.bedId}</td>
                      <td className="p-2">₹{bed.price}</td>
                      <td className="p-2">{bed.status}</td>
                      <td className="p-2">
                        {bed.tenants && bed.tenants.length > 0
                          ? bed.tenants.map((t) => t.name).join(", ")
                          : "None"}
                      </td>
                      <td className="p-2">
                        {bed.images && bed.images.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {bed.images.slice(0, 3).map((img, i) => (
                              <div key={i} className="relative">
                                <motion.img
                                  src={img}
                                  alt={`Bed ${bed.bedId} Image ${i + 1}`}
                                  className="h-20 w-20 object-cover rounded border border-gray-300 cursor-pointer"
                                  loading="lazy"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.1 }}
                                  onClick={() => handleOpenImageModal('bed', bed.images, i, bed.roomId, bed.bedId)}
                                />
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteBedImage(bed.roomId, bed.bedId, img); }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                  title="Delete Image"
                                >
                                  <FaTrash size={10} />
                                </button>
                              </div>
                            ))}
                            {bed.images.length > 3 && (
                              <div className="h-20 w-20 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500 cursor-pointer" onClick={() => handleOpenImageModal('bed', bed.images, 0, bed.roomId, bed.bedId)}>
                                +{bed.images.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          "No images"
                        )}
                      </td>
                      <td className="p-2 flex gap-2">
                        <button
                          className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                          onClick={() => handleEditBed(bed)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                          onClick={() => handleDeleteBed(bed)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {editBedModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                  onClick={() => {
                    setEditBedModal({ open: false, bed: null });
                    setEditBedNewImages([]);
                  }}
                >
                  <FaTimes />
                </button>
                <h3 className="text-lg font-bold mb-4">Edit Bed</h3>
                <form onSubmit={handleEditBedSubmit} className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-1">Bed Name</label>
                    <input
                      type="text"
                      value={editBedModal.bed.name}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Bed ID</label>
                    <input
                      type="text"
                      value={editBedModal.bed.bedId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
                    />
                  </div>
               
                  <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                      value={editBedModal.bed.status}
                      onChange={(e) =>
                        handleEditBedChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Not Available">Not Available</option>
                      <option value="Unavailable">Unavailable</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Upload New Bed Images</label>
                    <input
                      type="file"
                      onChange={handleEditBedImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                      multiple
                      accept="image/*"
                    />
                    {editBedNewImages.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {editBedNewImages.map((file, i) => (
                          <img
                            key={i}
                            src={URL.createObjectURL(file)}
                            alt={`New Preview ${i + 1}`}
                            className="h-16 w-16 object-cover rounded border"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {editBedModal.bed.images && editBedModal.bed.images.length > 0 && (
                    <div>
                      <label className="block font-semibold mb-1">Existing Images</label>
                      <div className="flex flex-wrap gap-2">
                        {editBedModal.bed.images.slice(0, 3).map((img, i) => (
                          <div key={i} className="relative">
                            <img
                              src={img}
                              alt={`Existing ${i + 1}`}
                              className="h-16 w-16 object-cover rounded border cursor-pointer"
                              loading="lazy"
                              onClick={() => handleOpenImageModal('bed', editBedModal.bed.images, i, editBedModal.bed.roomId, editBedModal.bed.bedId)}
                            />
                            <button
                              onClick={() => deleteBedImage(editBedModal.bed.roomId, editBedModal.bed.bedId, img)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                              title="Delete Image"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        ))}
                        {editBedModal.bed.images.length > 3 && (
                          <div className="h-16 w-16 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500 cursor-pointer" onClick={() => handleOpenImageModal('bed', editBedModal.bed.images, 0, editBedModal.bed.roomId, editBedModal.bed.bedId)}>
                            +{editBedModal.bed.images.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {editBedError && (
                    <div className="text-red-500 text-sm">{editBedError}</div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                    disabled={editBedLoading}
                  >
                    {editBedLoading ? "Saving..." : "Save"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
     {showBedForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <motion.div
      className="bg-gray-50 p-6 rounded-2xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Add Beds</h3>
        <button
          onClick={() => resetBedForm()}
          className="text-gray-600 hover:text-black"
        >
          <FaTimes />
        </button>
      </div>
      <form onSubmit={handleBedSubmit} className="space-y-6">
        {beds.map((bed, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-4" // Changed from md:grid-cols-4 to column layout
          >
            <div>
              <label className="block font-semibold mb-1">Bed Name</label>
              <input
                type="text"
                value={bed.name}
                onChange={(e) =>
                  handleBedChange(index, "name", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-transparent text-black"
                placeholder="Enter bed name"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Status</label>
              <select
                value={bed.status}
                onChange={(e) =>
                  handleBedChange(index, "status", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-transparent text-black"
                required
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
           
            <div>
              <label className="block font-semibold mb-1">
                Upload Bed Image
              </label>
              <input
                type="file"
                onChange={(e) => handleBedImageChange(index, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-transparent text-black"
                multiple
                accept="image/*"
              />
              {bed.images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {bed.images.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={img instanceof File ? URL.createObjectURL(img) : img}
                        alt={`Preview ${i + 1}`}
                        className="h-16 w-16 object-cover rounded border"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeBedField(index)}
                className="mt-6 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
        <motion.button
          type="button"
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all duration-200"
          onClick={addBedField}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus className="inline mr-2" /> Add Another Bed
        </motion.button>
        <motion.button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
          whileTap={{ scale: 0.95 }}
        >
          Save Beds
        </motion.button>
      </form>
    </motion.div>
  </div>
)}
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        onConfirm={dialog.onConfirm}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        isConfirmDialog={dialog.isConfirmDialog}
      />
    </div>
  );
};
function BedImagesDisplay({ propertyId, roomId, bedId, images, onDeleteImage, onImageClick }) {
  const [bedImages, setBedImages] = useState(images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!images && propertyId && roomId && bedId) {
      const fetchImages = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No authentication token found. Please log in.");
          }
          const res = await axios.get(
            `${baseurl}api/landlord/properties/${propertyId}/rooms/${roomId}/beds/${bedId}/images`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setBedImages(res.data.images || []);
        } catch (err) {
          console.error(
            `Error fetching images for bed ${bedId} in room ${roomId}:`,
            err.response?.data || err
          );
          setError(err.response?.data?.message || "Failed to load bed images.");
        } finally {
          setLoading(false);
        }
      };
      fetchImages();
    } else {
      setBedImages(images || []);
    }
  }, [propertyId, roomId, bedId, images]);
  if (loading) {
    return (
      <div className="flex items-center text-xs text-gray-500 px-2">
        <FaImage className="mr-1" /> Loading images...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center text-xs text-red-500 px-2">
        <FaImage className="mr-1" /> {error}
      </div>
    );
  }
  if (!bedImages || bedImages.length === 0) {
    return (
      <div className="flex items-center text-xs text-gray-500 px-2">
        <FaImage className="mr-1" /> No images
      </div>
    );
  }
  return (
    <div className="flex flex-row flex-wrap gap-1">
      {bedImages.slice(0, 3).map((img, i) => (
        <div key={i} className="relative">
          <motion.img
            src={img}
            alt={`Bed ${bedId} Image ${i + 1}`}
            className="h-24 w-24 object-cover rounded border border-gray-300 cursor-pointer"
            loading="lazy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onImageClick('bed', bedImages, i, roomId, bedId)}
          />
          {onDeleteImage && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteImage(img); }}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
              title="Delete Image"
            >
              <FaTrash size={10} />
            </button>
          )}
        </div>
      ))}
      {bedImages.length > 3 && (
        <div className="h-24 w-24 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500 cursor-pointer" onClick={() => onImageClick('bed', bedImages, 0, roomId, bedId)}>
          +{bedImages.length - 3}
        </div>
      )}
    </div>
  );
}
export default RoomAdd;