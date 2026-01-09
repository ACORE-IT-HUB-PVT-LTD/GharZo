import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import {
  FaBed,
  FaBath,
  FaCar,
  FaRulerCombined,
  FaCalendarAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaTrash,
  FaReply
} from "react-icons/fa";
import { Heart, Star, MapPin, Share2, CheckCircle2, Home, Users } from "lucide-react";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ScheduleTourBox from "../ScheduleTour/ScheduleTourBox";
import user from "../../../assets/images/user.jpg";
import baseurl from "../../../../BaseUrl";

// Facility key mapping for display
const facilityKeyMapping = {
  roomEssentials: {
    bed: "Bed",
    mattress: "Mattress",
    pillow: "Pillow",
    blanket: "Blanket",
    fan: "Fan",
    light: "Light",
    chargingPoint: "Charging Point",
    cupboardWardrobe: "Wardrobe",
    tableStudyDesk: "Study Desk",
    chair: "Chair",
    roomLock: "Room Lock",
  },
  comfortFeatures: {
    ac: "Air Conditioner",
    cooler: "Cooler",
    heater: "Heater",
    ceilingFan: "Ceiling Fan",
    window: "Window",
    balcony: "Balcony",
    ventilation: "Ventilation",
    curtains: "Curtains",
  },
  washroomHygiene: {
    attachedBathroom: "Attached Bathroom",
    commonBathroom: "Common Bathroom",
    westernToilet: "Western Toilet",
    indianToilet: "Indian Toilet",
    geyser: "Geyser",
    water24x7: "24x7 Water",
    washBasins: "Wash Basins",
    mirror: "Mirror",
    bucketMug: "Bucket & Mug",
    cleaningService: "Cleaning Service",
  },
  utilitiesConnectivity: {
    wifi: "WiFi",
    powerBackup: "Power Backup",
    electricityIncluded: "Electricity Included",
    waterIncluded: "Water Included",
    gasIncluded: "Gas Included",
    maintenanceIncluded: "Maintenance Included",
    tv: "TV",
    dthCable: "DTH Cable",
  },
  laundryHousekeeping: {
    washingMachine: "Washing Machine",
    laundryArea: "Laundry Area",
    dryingSpace: "Drying Space",
    ironTable: "Iron Table",
  },
  securitySafety: {
    cctv: "CCTV",
    biometricEntry: "Biometric Entry",
    securityGuard: "Security Guard",
    visitorRestricted: "Visitor Restricted",
    fireSafety: "Fire Safety",
  },
  parkingTransport: {
    bikeParking: "Bike Parking",
    carParking: "Car Parking",
    coveredParking: "Covered Parking",
    nearBus: "Near Bus Stop",
    nearMetro: "Near Metro",
  },
  propertySpecific: {
    sharingType: "Sharing Type",
    genderSpecific: "Gender Specific",
    curfewTiming: "Curfew Timing",
    guestAllowed: "Guest Allowed",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    hall: "Hall",
    modularKitchen: "Modular Kitchen",
    furnishingType: "Furnishing Type",
    propertyFloor: "Property Floor",
    liftAvailable: "Lift Available",
    separateEntry: "Separate Entry",
  },
  nearbyFacilities: {
    grocery: "Grocery",
    hospital: "Hospital",
    gym: "Gym",
    park: "Park",
    schoolCollege: "School/College",
    marketMall: "Market/Mall",
  },
};

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [roomImagesMap, setRoomImagesMap] = useState({});
  const [bedImagesMap, setBedImagesMap] = useState({});
  const [reels, setReels] = useState([]);
  const [postedDays, setPostedDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [expandedRooms, setExpandedRooms] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [initialSlide, setInitialSlide] = useState(0);

  useEffect(() => {
    return () => {
      setProperty(null);
      setRoomImagesMap({});
      setBedImagesMap({});
      setReels([]);
      setPostedDays(0);
      setLoading(true);
      setReelsLoading(true);
      setLiked(false);
      setActiveTab("description");
      setExpandedRooms({});
      setShowModal(false);
      setSelectedImages([]);
      setInitialSlide(0);
    };
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const timestamp = new Date().getTime();
        const response = await axios.get(
          `${baseurl}api/public/property/${id}?_=${timestamp}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const found = response.data?.property;

        if (!found) {
          console.error("No property found in response");
          setProperty(null);
          return;
        }

        const calculatedPostedDays = Math.floor(
          (new Date() - new Date(found.createdAt)) / (1000 * 60 * 60 * 24)
        );

        const updatedProperty = {
          ...found,
          description:
            found?.description ||
            `${
              found.name
            } is a premium ${found.type.toLowerCase()} property located at ${
              found.location.address
            }, ${found.location.city}, ${found.location.state} (PIN: ${
              found.location.pinCode
            }). This expansive estate features a total of ${
              found.totalRooms
            } rooms and ${
              found.totalBeds
            } beds, designed for ultimate comfort and elegance. Managed by ${
              found.landlord.name
            }, it offers a serene and upscale living experience with various amenities tailored to your needs.`,
        };

        setProperty(updatedProperty);
        setPostedDays(calculatedPostedDays);
      } catch (err) {
        console.error("Error fetching property:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchReels = async () => {
      setReelsLoading(true);
      try {
        const timestamp = new Date().getTime();
        const response = await axios.get(
          `${baseurl}api/reels?propertyId=${id}&_=${timestamp}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.success) {
          setReels(response.data.reels || []);
        } else {
          console.error("Failed to fetch reels:", response.data.message);
          setReels([]);
        }
      } catch (err) {
        console.error("Error fetching reels:", err);
        setReels([]);
      } finally {
        setReelsLoading(false);
      }
    };

    if (id) {
      fetchProperty();
      fetchReels();
    } else {
      navigate("/", { replace: true });
    }
  }, [id, navigate]);

  useEffect(() => {
    if (property && property.rooms) {
      const fetchRoomImages = async (roomId) => {
        try {
          const timestamp = new Date().getTime();
          const response = await axios.get(
            `${baseurl}api/public/properties/${id}/rooms/${roomId}/images?_=${timestamp}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.data.success) {
            setRoomImagesMap((prev) => ({
              ...prev,
              [roomId]: response.data.images || [],
            }));
          } else {
            setRoomImagesMap((prev) => ({
              ...prev,
              [roomId]: [],
            }));
          }
        } catch (err) {
          console.error(`Error fetching images for room ${roomId}:`, err);
          setRoomImagesMap((prev) => ({
            ...prev,
            [roomId]: [],
          }));
        }
      };

      property.rooms.forEach((room) => fetchRoomImages(room.roomId));
    }
  }, [property, id]);

  useEffect(() => {
    if (property && property.rooms) {
      const fetchBedImages = async (roomId, bedId) => {
        try {
          const timestamp = new Date().getTime();
          const response = await axios.get(
            `${baseurl}api/public/properties/${id}/rooms/${roomId}/beds/${bedId}/images?_=${timestamp}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.data.success) {
            setBedImagesMap((prev) => ({
              ...prev,
              [`${roomId}-${bedId}`]: response.data.images || [],
            }));
          } else {
            setBedImagesMap((prev) => ({
              ...prev,
              [`${roomId}-${bedId}`]: [],
            }));
          }
        } catch (err) {
          console.error(`Error fetching images for bed ${bedId}:`, err);
          setBedImagesMap((prev) => ({
            ...prev,
            [`${roomId}-${bedId}`]: [],
          }));
        }
      };

      property.rooms.forEach((room) => {
        room.beds?.forEach((bed) => {
          fetchBedImages(room.roomId, bed.bedId);
        });
      });
    }
  }, [property, id]);

  const openImageModal = (images, index = 0) => {
    setSelectedImages(images);
    setInitialSlide(index);
    setShowModal(true);
  };

  const closeImageModal = () => {
    setShowModal(false);
    setSelectedImages([]);
    setInitialSlide(0);
  };

  if (loading || reelsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    useEffect(() => {
      navigate("/", { replace: true });
    }, [navigate]);
    return null;
  }

  const features = [];
  const facilityCategories = [
    "roomEssentials",
    "comfortFeatures",
    "washroomHygiene",
    "utilitiesConnectivity",
    "laundryHousekeeping",
    "securitySafety",
    "parkingTransport",
    "propertySpecific",
    "nearbyFacilities",
  ];

  property.commonFacilities?.forEach((facility) => {
    facilityCategories.forEach((category) => {
      if (facilityKeyMapping[category][facility]) {
        features.push(facilityKeyMapping[category][facility]);
      }
    });
  });

  facilityCategories.forEach((category) => {
    const facilities = property.facilitiesDetail?.[category];
    if (facilities && Object.keys(facilities).length > 0) {
      Object.entries(facilities).forEach(([key, value]) => {
        if (
          value.available &&
          !features.includes(facilityKeyMapping[category][key])
        ) {
          const displayText = facilityKeyMapping[category][key];
          features.push(
            `${displayText} (Available in ${value.count} rooms, ${value.percentage}%)`
          );
        }
      });
    }
  });

  const toggleRoomFacilities = (roomId) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const placeholderImage = "https://via.placeholder.com/400x250?text=No+Image";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
      <style>
        {`
          .animate-3d-check {
            animation: spin3D 2s infinite ease-in-out;
            transform-style: preserve-3d;
          }
          @keyframes spin3D {
            0% { transform: rotateY(0deg) scale(1); filter: drop-shadow(0 0 5px rgba(0, 255, 0, 0.3)); }
            50% { transform: rotateY(180deg) scale(1.1); filter: drop-shadow(0 0 10px rgba(0, 255, 0, 0.5)); }
            100% { transform: rotateY(360deg) scale(1); filter: drop-shadow(0 0 5px rgba(0, 255, 0, 0.3)); }
          }
          .modal-swiper .swiper-button-next,
          .modal-swiper .swiper-button-prev {
            color: white !important;
            background: rgba(255, 107, 0, 0.8) !important;
            border-radius: 50% !important;
            width: 48px !important;
            height: 48px !important;
            margin-top: -24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: background 0.3s ease !important;
          }
          .modal-swiper .swiper-button-next:hover,
          .modal-swiper .swiper-button-prev:hover {
            background: rgba(255, 107, 0, 1) !important;
          }
          .modal-swiper .swiper-button-next::after,
          .modal-swiper .swiper-button-prev::after {
            font-size: 18px !important;
            font-weight: bold !important;
          }
          .modal-swiper .swiper-pagination-bullet {
            background: rgba(255, 107, 0, 0.5) !important;
            opacity: 1 !important;
            width: 12px !important;
            height: 12px !important;
            margin: 0 4px !important;
            border-radius: 50% !important;
          }
          .modal-swiper .swiper-pagination-bullet-active {
            background: rgba(255, 107, 0, 1) !important;
          }
          .modal-swiper .swiper-slide img {
            border-radius: 12px !important;
          }
        `}
      </style>

      {/* Hero Section with Image Carousel */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[60vh] lg:h-[70vh] overflow-hidden"
        >
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full h-full"
          >
            {property.images && property.images.length > 0 ? (
              property.images.map((img, i) => (
                <SwiperSlide key={i}>
                  <div className="relative w-full h-full">
                    <img
                      src={img}
                      alt={`Property ${i}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openImageModal(property.images, i)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="relative w-full h-full">
                  <img
                    src={placeholderImage}
                    alt="No Image"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openImageModal([placeholderImage], 0)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </SwiperSlide>
            )}
          </Swiper>

          {/* Floating Action Buttons */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
          >
            <FaArrowLeft size={20} className="text-gray-700" />
          </motion.button>

          <div className="absolute top-6 right-6 z-20 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setLiked(!liked)}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
            >
              <Heart
                size={20}
                className={liked ? "text-red-500" : "text-gray-700"}
                fill={liked ? "red" : "none"}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
            >
              <Share2 size={20} className="text-gray-700" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                if (property.location?.address) {
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${property.location.address}, ${property.location.city}, ${property.location.state}`
                    )}`,
                    "_blank"
                  );
                }
              }}
              disabled={!property.location?.address}
            >
              <MapPin
                size={20}
                className={
                  property.location?.address
                    ? "text-green-600"
                    : "text-gray-400"
                }
              />
            </motion.button>
          </div>

          {/* Availability Badge */}
          {property.availability?.hasAvailableRooms && (
            <div className="absolute bottom-6 left-6 z-20 bg-emerald-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2">
              <CheckCircle2 size={18} />
              {property.availability.availableRoomCount} Rooms, {property.availability.availableBedCount} Beds Available
            </div>
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <FaMapMarkerAlt className="text-[#FF6B00]" />
                    <span className="text-sm">
                      {property.location?.address}, {property.location?.city}, {property.location?.state}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white px-4 py-2 rounded-full text-sm font-bold">
                  {property.location?.city}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Home size={24} className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.totalRooms || 0}</p>
                  <p className="text-xs text-gray-600">Total Rooms</p>
                </div>
                
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaBed size={24} className="text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.totalBeds || 0}</p>
                  <p className="text-xs text-gray-600">Total Beds</p>
                </div>

                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaBuilding size={24} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.type}</p>
                  <p className="text-xs text-gray-600">Property Type</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaCalendarAlt size={24} className="text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{postedDays}</p>
                  <p className="text-xs text-gray-600">Days Listed</p>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="flex overflow-x-auto border-b border-gray-200">
                {["description", "gallery", "rooms", "review", "reels"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "description" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-[#FF6B00] to-[#FF8C3A] rounded-full" />
                        About This Property
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {property.description}
                      </p>
                    </div>

                    {features.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-gradient-to-b from-[#FF6B00] to-[#FF8C3A] rounded-full" />
                          Amenities & Facilities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {features.map((feat, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <CheckCircle2 className="text-green-500 animate-3d-check flex-shrink-0" size={20} />
                              <span className="text-sm text-gray-700">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "gallery" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {property.images && property.images.length > 0 ? (
                      property.images.map((img, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className="relative group overflow-hidden rounded-xl shadow-md cursor-pointer"
                          onClick={() => openImageModal(property.images, i)}
                        >
                          <img
                            src={img}
                            alt={`Gallery ${i}`}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </motion.div>
                      ))
                    ) : (
                      <img
                        src={placeholderImage}
                        alt="No Image"
                        className="w-full h-48 object-cover rounded-xl col-span-full cursor-pointer"
                        onClick={() => openImageModal([placeholderImage], 0)}
                      />
                    )}
                  </motion.div>
                )}

                {activeTab === "rooms" && (
                  <div className="space-y-4">
                    {property.rooms && property.rooms.length > 0 ? (
                      property.rooms.map((room, index) => {
                        const roomFeatures = [];
                        room.facilities?.forEach((facility) => {
                          facilityCategories.forEach((category) => {
                            if (facilityKeyMapping[category][facility]) {
                              roomFeatures.push(facilityKeyMapping[category][facility]);
                            }
                          });
                        });
                        facilityCategories.forEach((category) => {
                          const facilities = room.allFacilities?.[category];
                          if (facilities && Object.keys(facilities).length > 0) {
                            Object.entries(facilities).forEach(([key, value]) => {
                              if (
                                value === true &&
                                !roomFeatures.includes(facilityKeyMapping[category][key])
                              ) {
                                roomFeatures.push(facilityKeyMapping[category][key]);
                              }
                            });
                          }
                        });

                        const roomImages = roomImagesMap[room.roomId] || (property.images && property.images.length > 0 ? property.images : [placeholderImage]);

                        return (
                          <motion.div
                            key={room.roomId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                              {/* Room Images */}
                              {roomImages.length > 0 && (
                                <div className="md:col-span-1">
                                  <Swiper
                                    modules={[Navigation, Pagination]}
                                    navigation
                                    pagination={{ clickable: true }}
                                    spaceBetween={10}
                                    slidesPerView={1}
                                    className="rounded-xl overflow-hidden"
                                  >
                                    {roomImages.map((img, i) => (
                                      <SwiperSlide key={i}>
                                        <img
                                          src={img}
                                          alt={`${room.name} ${i}`}
                                          className="w-full h-48 object-cover cursor-pointer"
                                          onClick={() => openImageModal(roomImages, i)}
                                        />
                                      </SwiperSlide>
                                    ))}
                                  </Swiper>
                                </div>
                              )}

                              {/* Room Details */}
                              <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {room.name}
                                  </h3>
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                    {room.type}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  <div className="flex items-center gap-2">
                                    <Users size={18} className="text-[#FF6B00]" />
                                    <span className="text-sm text-gray-700">Capacity: {room.capacity || "N/A"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FaBed size={18} className="text-[#FF6B00]" />
                                    <span className="text-sm text-gray-700">
                                      {room.availableBeds || 0}/{room.totalBeds || 0} Beds
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => toggleRoomFacilities(room.roomId)}
                                  className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white rounded-full font-semibold hover:shadow-lg transition-all"
                                >
                                  {expandedRooms[room.roomId] ? "Hide Facilities" : "View Facilities"}
                                </button>

                                {expandedRooms[room.roomId] && roomFeatures.length > 0 && (
                                  <div className="mt-4 grid grid-cols-2 gap-2">
                                    {roomFeatures.map((feat, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 text-sm text-gray-700"
                                      >
                                        <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />
                                        {feat}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {room.beds && room.beds.length > 0 && (
                                  <div className="mt-4">
                                    <p className="font-semibold text-sm mb-2">Available Beds:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                      {room.beds.map((bed) => {
                                        const bedImages = bedImagesMap[`${room.roomId}-${bed.bedId}`] || [];
                                        const modalImages = bedImages.length > 0 ? bedImages : (roomImages.length > 0 ? roomImages : [placeholderImage]);
                                        const bedPlaceholder = "https://via.placeholder.com/96x96?text=No+Image";
                                        
                                        return (
                                          <div key={bed.bedId} className="bg-white rounded-lg p-3 border border-gray-200">
                                            {bedImages.length > 0 ? (
                                              <Swiper
                                                modules={[Navigation, Pagination]}
                                                navigation={false}
                                                pagination={false}
                                                spaceBetween={2}
                                                slidesPerView={1}
                                                className="mb-2 rounded-lg overflow-hidden"
                                              >
                                                {bedImages.map((img, i) => (
                                                  <SwiperSlide key={i}>
                                                    <img
                                                      src={img}
                                                      alt={`${bed.name} ${i}`}
                                                      className="w-full h-20 object-cover cursor-pointer"
                                                      onClick={() => openImageModal(modalImages, bedImages.indexOf(img))}
                                                    />
                                                  </SwiperSlide>
                                                ))}
                                              </Swiper>
                                            ) : (
                                              <img
                                                src={bedPlaceholder}
                                                alt={bed.name}
                                                className="w-full h-20 object-cover rounded-lg cursor-pointer mb-2"
                                                onClick={() => openImageModal(modalImages, 0)}
                                              />
                                            )}
                                            <p className="text-xs font-medium text-gray-900 text-center">{bed.name}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-center py-8">No room details available.</p>
                    )}
                  </div>
                )}

                {activeTab === "review" && (
                  <div>
                    <RatingAndComments propertyId={id} />
                  </div>
                )}

                {activeTab === "reels" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reels.length > 0 ? (
                      reels.map((reel, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                        >
                          <video
                            src={reel.videoUrl}
                            controls
                            muted
                            playsInline
                            className="w-full h-64 object-cover bg-black"
                          />
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center col-span-full py-8">
                        No reels available for this property.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Manager Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-[#002B5C] to-[#003A75] rounded-2xl shadow-lg p-6 text-white"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF6B00] rounded-full flex items-center justify-center">
                  <Users size={18} />
                </div>
                Area Manager
              </h2>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{property.landlord?.name}</p>
                  <p className="text-blue-200 text-sm">{property.location?.city}, {property.location?.state}</p>
                  <p className="text-blue-200 text-sm">{property.landlord?.email}</p>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#002B5C] rounded-full font-semibold hover:shadow-lg transition-all"
                    onClick={() =>
                      (window.location.href = `tel:${property.landlord?.contactNumber}`)
                    }
                  >
                    <FaPhone size={16} /> Call
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] text-white rounded-full font-semibold hover:shadow-lg transition-all"
                    onClick={() =>
                      (window.location.href = `mailto:${property.landlord?.email}`)
                    }
                  >
                    <FaEnvelope size={16} /> Email
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Schedule Tour */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <ScheduleTourBox />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showModal && selectedImages.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeImageModal}
            className="absolute top-6 right-6 text-white text-4xl z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            &times;
          </button>
          <Swiper
            initialSlide={initialSlide}
            modules={[Navigation, Pagination]}
            navigation={true}
            pagination={{ clickable: true }}
            className="modal-swiper w-full h-[90vh]"
          >
            {selectedImages.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="flex items-center justify-center h-full">
                  <img
                    src={img}
                    alt={`Full view ${i}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}

/* ====================== Rating & Comments Component ====================== */
function RatingAndComments({ propertyId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const getToken = () => localStorage.getItem("usertoken");

  const createAxiosInstance = () => {
    const token = getToken();
    return axios.create({
      baseURL: "https://api.gharzoreality.com/",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchData = async () => {
    try {
      setError(null);
      const axiosInstance = createAxiosInstance();

      const timestamp = new Date().getTime();
      const statsResponse = await axios.get(
        `${baseurl}api/public/ratings/property/${propertyId}/rating-stats?_=${timestamp}`
      );
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      } else {
        setError("Failed to fetch rating stats.");
      }

      if (getToken()) {
        try {
          const ratingsResponse = await axiosInstance.get(
            `/property/${propertyId}/ratings`
          );
          const ratingList = ratingsResponse.data.success
            ? ratingsResponse.data.ratings.map((r) => ({
                id: r._id,
                username: r.userName || r.fullName || r.userId || "Anonymous",
                profilePic: r.profilePic || user,
                text: r.review,
                rating: r.rating,
                createdAt: r.createdAt,
                type: "rating",
              }))
            : [];

          const commentsResponse = await axiosInstance.get(
            `/property/${propertyId}/comments?page=1&limit=10`
          );
          const commentList = commentsResponse.data.success
            ? commentsResponse.data.comments.map((c) => ({
                id: c._id,
                username: c.userName || c.fullName || c.userId || "Anonymous",
                profilePic: c.profilePic || user,
                text: c.comment,
                createdAt: c.createdAt,
                type: "comment",
                replies: c.replies || [],
              }))
            : [];

          const combinedList = [...ratingList, ...commentList].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setComments(combinedList);

          const token = getToken();
          if (token) {
            try {
              const decoded = jwtDecode(token);
              setCurrentUser(
                decoded.userName || decoded.fullName || decoded.id
              );
            } catch (err) {
              console.error("Error decoding token:", err);
            }
          }
        } catch (err) {
          if (err.response?.status === 401) {
            setError(
              "Unauthorized: Invalid or expired token. Please enter a new token."
            );
            setShowTokenInput(true);
          } else {
            setError("Error fetching ratings or comments. Please try again.");
          }
        }
      } else {
        setError("No token provided. Please enter a new token to view reviews.");
        setShowTokenInput(true);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching data. Please check your connection.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId]);

  const handleAddComment = async () => {
    if (!comment.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    if (!getToken()) {
      setError("No token. Please enter a token first.");
      setShowTokenInput(true);
      return;
    }

    try {
      setError(null);
      const axiosInstance = createAxiosInstance();

      let newItem;
      if (rating > 0) {
        const response = await axiosInstance.post(
          `/property/${propertyId}/ratings`,
          {
            rating,
            review: comment,
          }
        );
        if (response.data.success) {
          newItem = {
            id: response.data.rating._id,
            username:
              response.data.rating.userName ||
              response.data.rating.fullName ||
              response.data.rating.userId ||
              "Anonymous",
            profilePic: response.data.rating.profilePic || user,
            text: response.data.rating.review,
            rating: response.data.rating.rating,
            createdAt: response.data.rating.createdAt,
            type: "rating",
          };
        } else {
          throw new Error(response.data.message || "Failed to submit rating.");
        }
      } else {
        const response = await axiosInstance.post(
          `/property/${propertyId}/comments`,
          {
            comment,
          }
        );
        if (response.data.success) {
          newItem = {
            id: response.data.comment._id,
            username:
              response.data.comment.userName ||
              response.data.comment.fullName ||
              response.data.comment.userId ||
              "Anonymous",
            profilePic: response.data.comment.profilePic || user,
            text: response.data.comment.comment,
            createdAt: response.data.comment.createdAt,
            type: "comment",
            replies: [],
          };
        } else {
          throw new Error(response.data.message || "Failed to submit comment.");
        }
      }

      setComments((prev) => [newItem, ...prev]);

      const timestamp = new Date().getTime();
      const statsResponse = await axios.get(
        `${baseurl}api/public/ratings/property/${propertyId}/rating-stats?_=${timestamp}`
      );
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      setComment("");
      setRating(0);
    } catch (err) {
      console.error("Error submitting:", err);
      if (err.response?.status === 401) {
        setError(
          "Unauthorized: Invalid or expired token. Please enter a new token."
        );
        setShowTokenInput(true);
      } else {
        setError(
          `Error submitting ${rating > 0 ? "rating" : "comment"}: ${
            err.response?.data?.message || err.message || "Please try again"
          }`
        );
      }
    }
  };

  const handleDelete = async (id, type) => {
    if (!getToken()) {
      setError("No token. Cannot delete.");
      return;
    }

    try {
      setError(null);
      const axiosInstance = createAxiosInstance();

      const endpoint = type === "rating" ? `/ratings/${id}` : `/comments/${id}`;
      const response = await axiosInstance.delete(endpoint);

      if (response.data.success) {
        setComments((prev) => prev.filter((item) => item.id !== id));
        const timestamp = new Date().getTime();
        const statsResponse = await axios.get(
          `${baseurl}api/public/ratings/property/${propertyId}/rating-stats?_=${timestamp}`
        );
        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }
      } else {
        setError(
          `Failed to delete ${type}: ${
            response.data.message || "Unknown error"
          }`
        );
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      if (err.response?.status === 401) {
        setError(
          "Unauthorized: Invalid or expired token. Please enter a new token."
        );
        setShowTokenInput(true);
      } else if (err.response?.status === 403) {
        setError("You are not authorized to delete this item.");
      } else if (err.response?.status === 404) {
        setError(`${type.charAt(0).toUpperCase() + type.slice(1)} not found.`);
      } else {
        setError(
          `Error deleting ${type}: ${
            err.response?.data?.message || "Please try again"
          }`
        );
      }
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) {
      setError("Reply cannot be empty.");
      return;
    }

    try {
      setError(null);
      const axiosInstance = createAxiosInstance();

      const response = await axiosInstance.post(
        `/comments/${commentId}/replies`,
        { text: replyText }
      );

      if (response.data.success) {
        setComments(prev => prev.map(c => 
          c.id === commentId 
            ? { ...c, replies: [...(c.replies || []), response.data.comment.replies.slice(-1)[0]] }
            : c
        ));

        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error("Error adding reply:", err);
      if (err.response?.status === 401) {
        setError("Token expired. Please enter a new token.");
        setShowTokenInput(true);
      } else {
        setError(err.response?.data?.message || "Failed to send reply");
      }
    }
  };

  const handleTokenSubmit = () => {
    if (newToken.trim()) {
      localStorage.setItem("usertoken", newToken);
      setShowTokenInput(false);
      setNewToken("");
      setError(null);
      fetchData();
    } else {
      setError("Token cannot be empty.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-[#FF6B00] to-[#FF8C3A] rounded-full" />
          Reviews & Ratings
        </h4>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {showTokenInput && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter authentication token"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] transition-colors"
            />
            <button
              onClick={handleTokenSubmit}
              className="px-6 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Submit
            </button>
          </div>
        )}

        {stats && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6 border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold text-[#FF6B00]">{stats.averageRating.toFixed(1)}</div>
              <div>
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < Math.round(stats.averageRating) ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-sm text-gray-600">{stats.totalRatings} reviews</p>
              </div>
            </div>
          </div>
        )}

        {/* Star Rating Input */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">Your Rating:</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => {
              const starValue = i + 1;
              return (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(starValue)}
                  className={`cursor-pointer text-3xl ${
                    starValue <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Comment Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddComment}
            disabled={!getToken()}
            className="px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </motion.button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <img
                  src={c.profilePic}
                  alt={c.username}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{c.username || "Unknown User"}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString()} at{" "}
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentUser && c.username === currentUser && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(c.id, c.type)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash size={14} />
                        </motion.button>
                      )}
                      {getToken() && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <FaReply size={14} />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-2">{c.text}</p>

                  {c.rating > 0 && (
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(c.rating)].map((_, i) => (
                        <span key={i} className="text-lg">★</span>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyingTo === c.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B00] text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleReply(c.id)}
                      />
                      <button
                        onClick={() => handleReply(c.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Display Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="mt-4 ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
                      {c.replies.map((reply, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-blue-600">
                              {reply.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({reply.userType === "landlord" ? "Landlord" : "User"})
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{reply.text}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleDateString()} at{" "}
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No reviews or comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-gray-600">
      <div className="text-lg sm:text-xl text-[#FF6B00]">{icon}</div>
      <div>
        <div className="text-base sm:text-lg font-medium">{value}</div>
        <div className="text-xs sm:text-sm">{label}</div>
      </div>
    </div>
  );
}

export default PropertyDetails;