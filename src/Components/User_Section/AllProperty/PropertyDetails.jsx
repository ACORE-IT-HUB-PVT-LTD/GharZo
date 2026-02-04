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
  FaReply,
  FaCompass,
  FaHome,
  FaCouch,
  FaWifi,
  FaShieldAlt,
  FaTree,
  FaUtensils,
  FaDumbbell,
  FaSwimmingPool,
  FaParking,
  FaFileContract,
  FaMoneyBillWave,
  FaHammer,
  FaChartLine,
  FaMapMarkedAlt,
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUsers,
  FaDoorOpen,
  FaSnowflake,
  FaFire,
  FaTint,
  FaBolt,
  FaLock,
  FaVideo,
  FaLayerGroup,
  FaClipboardList,
  FaRupeeSign,
  FaUniversity,
  FaMobileAlt,
  FaQrcode
} from "react-icons/fa";
import { 
  Heart, 
  MapPin, 
  Share2, 
  CheckCircle2, 
  Home as HomeIcon, 
  Users as UsersIcon,
  Star,
  Eye,
  MessageCircle,
  Bookmark
} from "lucide-react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ScheduleTourBox from "../ScheduleTour/ScheduleTourBox";
import user from "../../../assets/images/user.jpg";
import baseurl from "../../../../BaseUrl";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [postedDays, setPostedDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [initialSlide, setInitialSlide] = useState(0);

  useEffect(() => {
    return () => {
      setProperty(null);
      setPostedDays(0);
      setLoading(true);
      setLiked(false);
      setActiveTab("overview");
      setShowModal(false);
      setSelectedImages([]);
      setInitialSlide(0);
    };
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        // Try authenticated v2 details endpoint first (token from localStorage)
        let token = localStorage.getItem("usertoken") || localStorage.getItem("authToken") || localStorage.getItem("access_token");

        if (token) {
          try {
            const resV2 = await axios.get(
              `https://api.gharzoreality.com/api/v2/properties/${id}/details`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            const foundV2 = resV2.data?.data;
            if (foundV2) {
              // when v2 returns full property object in data
              const calculatedPostedDays = Math.floor(
                (new Date() - new Date(foundV2.createdAt)) / (1000 * 60 * 60 * 24)
              );

              const updatedProperty = {
                ...foundV2,
                description:
                  foundV2?.description ||
                  `${foundV2.title} is a premium ${foundV2.propertyType?.toLowerCase() || "property"} located at ${
                    foundV2.location?.address
                  }, ${foundV2.location?.city}.`,
              };

              setProperty(updatedProperty);
              setPostedDays(calculatedPostedDays);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Authenticated v2 details fetch failed, falling back to public API:", e?.response?.status || e.message);
            // continue to public fetch
          }
        }

        // Fallback to public API
        const timestamp = new Date().getTime();
        const response = await axios.get(
          `${baseurl}api/public/properties/${id}?_=${timestamp}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const found = response.data?.data?.property;

        if (!found) {
          console.error("No property found in response");
          setProperty(null);
          return;
        }

        if (found) {
          const calculatedPostedDays = Math.floor(
            (new Date() - new Date(found.createdAt)) / (1000 * 60 * 60 * 24)
          );

          const updatedProperty = {
            ...found,
            description:
              found?.description ||
              `${found.title} is a premium ${found.propertyType?.toLowerCase() || "property"} located at ${
                found.location?.address
              }, ${found.location?.city}. This property features ${found.bhk} BHK with ${found.bathrooms} bathrooms.`,
          };

          setProperty(updatedProperty);
          setPostedDays(calculatedPostedDays);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    } else {
      navigate("/", { replace: true });
    }
  }, [id, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
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

  const placeholderImage = "https://via.placeholder.com/400x250?text=No+Image";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');
          
          .font-display { font-family: 'Playfair Display', serif; }
          .font-body { font-family: 'DM Sans', sans-serif; }
          
          .animate-3d-check {
            animation: spin3D 2s infinite ease-in-out;
            transform-style: preserve-3d;
          }
          @keyframes spin3D {
            0% { transform: rotateY(0deg) scale(1); filter: drop-shadow(0 0 5px rgba(79, 70, 229, 0.3)); }
            50% { transform: rotateY(180deg) scale(1.1); filter: drop-shadow(0 0 10px rgba(79, 70, 229, 0.5)); }
            100% { transform: rotateY(360deg) scale(1); filter: drop-shadow(0 0 5px rgba(79, 70, 229, 0.3)); }
          }
          
          .modal-swiper .swiper-button-next,
          .modal-swiper .swiper-button-prev {
            color: white !important;
            background: rgba(79, 70, 229, 0.9) !important;
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
            background: rgba(79, 70, 229, 1) !important;
          }
          .modal-swiper .swiper-button-next::after,
          .modal-swiper .swiper-button-prev::after {
            font-size: 18px !important;
            font-weight: bold !important;
          }
          .modal-swiper .swiper-pagination-bullet {
            background: rgba(79, 70, 229, 0.5) !important;
            opacity: 1 !important;
            width: 12px !important;
            height: 12px !important;
            margin: 0 4px !important;
            border-radius: 50% !important;
          }
          .modal-swiper .swiper-pagination-bullet-active {
            background: rgba(79, 70, 229, 1) !important;
          }
          .modal-swiper .swiper-slide img {
            border-radius: 12px !important;
          }
          
          .gradient-overlay {
            background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
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
              property.images.map((imgObj, i) => (
                <SwiperSlide key={i}>
                  <div className="relative w-full h-full">
                    <img
                      src={imgObj?.url || imgObj}
                      alt={`Property ${i}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openImageModal(property.images.map(it => it?.url || it), i)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
              </SwiperSlide>
            )}
          </Swiper>

          {/* Floating Action Buttons */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-md rounded-full p-3 shadow-2xl hover:shadow-3xl transition-all"
          >
            <FaArrowLeft size={20} className="text-gray-800" />
          </motion.button>

          <div className="absolute top-6 right-6 z-20 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setLiked(!liked)}
              className="bg-white/95 backdrop-blur-md rounded-full p-3 shadow-2xl hover:shadow-3xl transition-all"
            >
              <Heart
                size={20}
                className={liked ? "text-rose-500" : "text-gray-800"}
                fill={liked ? "#f43f5e" : "none"}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/95 backdrop-blur-md rounded-full p-3 shadow-2xl hover:shadow-3xl transition-all"
            >
              <Share2 size={20} className="text-gray-800" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/95 backdrop-blur-md rounded-full p-3 shadow-2xl hover:shadow-3xl transition-all"
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
                className={property.location?.address ? "text-emerald-600" : "text-gray-400"}
              />
            </motion.button>
          </div>

          {/* Property Status Badge */}
          {property.status && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-2xl">
              {property.status}
            </div>
          )}

          {/* Availability Badge for PG/Rental */}
          {(property.listingType === "PG" || property.isRentalManagement) && property.roomStats && (
            <div className="absolute bottom-6 left-6 z-20 bg-emerald-500 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-2xl flex items-center gap-2">
              <CheckCircle2 size={18} />
              {property.roomStats.availableRooms} Rooms Available
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
            <PropertyHeaderCard 
              property={property} 
              postedDays={postedDays} 
            />

            {/* Tabs */}
            <PropertyTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              property={property}
              openImageModal={openImageModal}
              placeholderImage={placeholderImage}
            />

            {/* Owner/Landlord Info Card */}
            <OwnerInfoCard property={property} />
          </div>

          {/* Right Column - Schedule Tour & Stats */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 space-y-6"
            >
              <ScheduleTourBox />
              
              {/* Property Analytics */}
              {property.stats && (
                <PropertyStats stats={property.stats} />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showModal && selectedImages.length > 0 && (
        <ImageModal 
          selectedImages={selectedImages}
          initialSlide={initialSlide}
          closeImageModal={closeImageModal}
        />
      )}
    </div>
  );
}

/* ====================== Property Header Card Component ====================== */
function PropertyHeaderCard({ property, postedDays }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 font-body"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
            {property.title || property.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <FaMapMarkerAlt className="text-indigo-600" />
            <span className="text-base">
              {property.location?.address}, {property.location?.locality}, {property.location?.city}, {property.location?.state} - {property.location?.pincode}
            </span>
          </div>
          {property.location?.landmark && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <FaMapMarkedAlt className="text-indigo-400" />
              Near: {property.location.landmark}
            </p>
          )}
        </div>
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg">
          {property.category} • {property.propertyType}
        </div>
      </div>

      {/* Price Section */}
      <PriceSection property={property} />

      {/* Quick Stats Grid */}
      <QuickStatsGrid property={property} postedDays={postedDays} />

      {/* Property Type Specific Details */}
      <PropertyTypeSpecificDetails property={property} />
    </motion.div>
  );
}

/* ====================== Price Section Component ====================== */
function PriceSection({ property }) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 mb-6">
      <div className="flex items-baseline justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <FaRupeeSign className="text-2xl text-indigo-600" />
            <span className="text-4xl font-display font-bold text-gray-900">
              {property.price?.amount?.toLocaleString('en-IN')}
            </span>
            {property.price?.per && property.price.per !== "Property" && (
              <span className="text-lg text-gray-600">/ {property.price.per}</span>
            )}
          </div>
          {property.listingType && (
            <p className="text-sm text-gray-600 mt-1">For {property.listingType}</p>
          )}
          {property.price?.negotiable && (
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
              Negotiable
            </span>
          )}
        </div>
        
        <div className="text-right">
          {property.price?.pricePerSqft && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">₹{property.price.pricePerSqft}/sqft</span>
            </div>
          )}
          {property.price?.securityDeposit && (
            <div className="text-sm text-gray-600 mt-1">
              Security: ₹{property.price.securityDeposit.toLocaleString('en-IN')}
            </div>
          )}
          {property.price?.bookingAmount && (
            <div className="text-sm text-gray-600 mt-1">
              Booking: ₹{property.price.bookingAmount.toLocaleString('en-IN')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====================== Quick Stats Grid Component ====================== */
function QuickStatsGrid({ property, postedDays }) {
  const stats = [];

  // BHK for residential
  if (property.bhk) {
    stats.push({
      icon: <FaBed size={24} />,
      label: "BHK",
      value: property.bhk,
      color: "blue"
    });
  }

  // Bathrooms
  if (property.bathrooms) {
    stats.push({
      icon: <FaBath size={24} />,
      label: "Bathrooms",
      value: property.bathrooms,
      color: "cyan"
    });
  }

  // Balconies
  if (property.balconies) {
    stats.push({
      icon: <FaDoorOpen size={24} />,
      label: "Balconies",
      value: property.balconies,
      color: "green"
    });
  }

  // Carpet Area
  if (property.area?.carpet) {
    stats.push({
      icon: <FaRulerCombined size={24} />,
      label: "Carpet Area",
      value: `${property.area.carpet} ${property.area.unit || 'sqft'}`,
      color: "purple"
    });
  }

  // Floor
  if (property.floor?.current !== undefined && property.floor?.total) {
    stats.push({
      icon: <FaLayerGroup size={24} />,
      label: "Floor",
      value: `${property.floor.current}/${property.floor.total}`,
      color: "orange"
    });
  }

  // Parking
  if (property.parking?.covered || property.parking?.open) {
    const totalParking = (property.parking?.covered || 0) + (property.parking?.open || 0);
    stats.push({
      icon: <FaParking size={24} />,
      label: "Parking",
      value: totalParking,
      color: "indigo"
    });
  }

  // Property Age
  if (property.propertyAge) {
    stats.push({
      icon: <FaCalendarAlt size={24} />,
      label: "Age",
      value: property.propertyAge,
      color: "pink"
    });
  }

  // Posted Days
  stats.push({
    icon: <FaClock size={24} />,
    label: "Listed",
    value: `${postedDays} days ago`,
    color: "gray"
  });

  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    cyan: "from-cyan-500 to-cyan-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    indigo: "from-indigo-500 to-indigo-600",
    pink: "from-pink-500 to-pink-600",
    gray: "from-gray-500 to-gray-600"
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-lg transition-all"
        >
          <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[stat.color]} rounded-full flex items-center justify-center mx-auto mb-2 text-white`}>
            {stat.icon}
          </div>
          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ====================== Property Type Specific Details Component ====================== */
function PropertyTypeSpecificDetails({ property }) {
  // PG Details
  if (property.listingType === "PG" && property.pgDetails) {
    return <PGSpecificDetails pgDetails={property.pgDetails} />;
  }

  // Rental Management Stats
  if (property.isRentalManagement && property.roomStats) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <HomeIcon size={20} className="text-emerald-600" />
          Rental Management
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{property.roomStats.totalRooms}</p>
            <p className="text-xs text-gray-600">Total Rooms</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{property.roomStats.availableRooms}</p>
            <p className="text-xs text-gray-600">Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{property.roomStats.occupiedRooms}</p>
            <p className="text-xs text-gray-600">Occupied</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ====================== PG Specific Details Component ====================== */
function PGSpecificDetails({ pgDetails }) {
  return (
    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
        <UsersIcon size={22} className="text-violet-600" />
        PG Details
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {pgDetails.roomType && (
          <InfoBadge icon={<FaBed />} label="Room Type" value={pgDetails.roomType} />
        )}
        {pgDetails.totalBeds && (
          <InfoBadge icon={<FaBed />} label="Total Beds" value={pgDetails.totalBeds} />
        )}
        {pgDetails.availableBeds !== undefined && (
          <InfoBadge icon={<CheckCircle2 />} label="Available Beds" value={pgDetails.availableBeds} color="emerald" />
        )}
        {pgDetails.genderPreference && (
          <InfoBadge icon={<UsersIcon />} label="Gender" value={pgDetails.genderPreference} />
        )}
        {pgDetails.foodIncluded !== undefined && (
          <InfoBadge 
            icon={<FaUtensils />} 
            label="Food" 
            value={pgDetails.foodIncluded ? `Included (${pgDetails.foodType || 'N/A'})` : 'Not Included'} 
          />
        )}
        {pgDetails.commonWashroom !== undefined && (
          <InfoBadge 
            icon={<FaBath />} 
            label="Washroom" 
            value={pgDetails.commonWashroom ? 'Common' : pgDetails.attachedWashroom ? 'Attached' : 'N/A'} 
          />
        )}
      </div>

      {pgDetails.foodTimings && (
        <div className="mt-4 p-3 bg-white rounded-lg">
          <p className="font-semibold text-sm mb-2">Meal Timings:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {pgDetails.foodTimings.breakfast && (
              <div><span className="font-medium">Breakfast:</span> {pgDetails.foodTimings.breakfast}</div>
            )}
            {pgDetails.foodTimings.lunch && (
              <div><span className="font-medium">Lunch:</span> {pgDetails.foodTimings.lunch}</div>
            )}
            {pgDetails.foodTimings.dinner && (
              <div><span className="font-medium">Dinner:</span> {pgDetails.foodTimings.dinner}</div>
            )}
          </div>
        </div>
      )}

      {pgDetails.commonAreas && pgDetails.commonAreas.length > 0 && (
        <div className="mt-4 p-3 bg-white rounded-lg">
          <p className="font-semibold text-sm mb-2">Common Areas:</p>
          <div className="flex flex-wrap gap-2">
            {pgDetails.commonAreas.map((area, i) => (
              <span key={i} className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {pgDetails.rules && pgDetails.rules.length > 0 && (
        <div className="mt-4 p-3 bg-white rounded-lg">
          <p className="font-semibold text-sm mb-2">Rules & Regulations:</p>
          <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
            {pgDetails.rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ====================== Property Tabs Component ====================== */
function PropertyTabs({ activeTab, setActiveTab, property, openImageModal, placeholderImage }) {
  const tabs = [
    { id: "overview", label: "Overview", icon: <FaHome /> },
    { id: "details", label: "Details", icon: <FaClipboardList /> },
    { id: "amenities", label: "Amenities", icon: <FaCheckCircle /> },
    { id: "location", label: "Location", icon: <FaMapMarkerAlt /> },
    { id: "gallery", label: "Gallery", icon: <Eye /> },
    { id: "legal", label: "Legal & Pricing", icon: <FaFileContract /> },
    { id: "reviews", label: "Reviews", icon: <MessageCircle /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden font-body"
    >
      <div className="flex overflow-x-auto border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8">
        {activeTab === "overview" && <OverviewTab property={property} />}
        {activeTab === "details" && <DetailsTab property={property} />}
        {activeTab === "amenities" && <AmenitiesTab property={property} />}
        {activeTab === "location" && <LocationTab property={property} />}
        {activeTab === "gallery" && (
          <GalleryTab 
            property={property} 
            openImageModal={openImageModal}
            placeholderImage={placeholderImage}
          />
        )}
        {activeTab === "legal" && <LegalPricingTab property={property} />}
        {activeTab === "reviews" && <RatingAndComments propertyId={property._id} />}
      </div>
    </motion.div>
  );
}

/* ====================== Overview Tab Component ====================== */
function OverviewTab({ property }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-7 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full" />
          About This Property
        </h3>
        <p className="text-gray-700 leading-relaxed text-base">
          {property.description}
        </p>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {property.facing && (
          <HighlightCard 
            icon={<FaCompass className="text-indigo-600" />}
            title="Facing"
            value={property.facing}
          />
        )}
        {property.furnishing?.type && (
          <HighlightCard 
            icon={<FaCouch className="text-violet-600" />}
            title="Furnishing"
            value={property.furnishing.type}
          />
        )}
        {property.availableFrom && (
          <HighlightCard 
            icon={<FaCalendarAlt className="text-emerald-600" />}
            title="Available From"
            value={new Date(property.availableFrom).toLocaleDateString()}
          />
        )}
        {property.ownership?.type && (
          <HighlightCard 
            icon={<FaFileContract className="text-blue-600" />}
            title="Ownership"
            value={property.ownership.type}
          />
        )}
      </div>

      {/* Furnishing Items */}
      {property.furnishing?.items && property.furnishing.items.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 mb-3">Furnishing Includes:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {property.furnishing.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="text-indigo-500" size={16} />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ====================== Details Tab Component ====================== */
function DetailsTab({ property }) {
  const details = [];

  // Area Details
  if (property.area) {
    if (property.area.carpet) details.push({ label: "Carpet Area", value: `${property.area.carpet} ${property.area.unit || 'sqft'}`, icon: <FaRulerCombined /> });
    if (property.area.builtUp) details.push({ label: "Built-up Area", value: `${property.area.builtUp} ${property.area.unit || 'sqft'}`, icon: <FaRulerCombined /> });
    if (property.area.superBuiltUp) details.push({ label: "Super Built-up Area", value: `${property.area.superBuiltUp} ${property.area.unit || 'sqft'}`, icon: <FaRulerCombined /> });
    if (property.area.plotArea) details.push({ label: "Plot Area", value: `${property.area.plotArea} ${property.area.unit || 'sqft'}`, icon: <FaRulerCombined /> });
  }

  // Property Features
  if (property.propertyFeatures) {
    if (property.propertyFeatures.powerBackup) details.push({ label: "Power Backup", value: property.propertyFeatures.powerBackup, icon: <FaBolt /> });
    if (property.propertyFeatures.waterSupply) details.push({ label: "Water Supply", value: property.propertyFeatures.waterSupply, icon: <FaTint /> });
    if (property.propertyFeatures.liftAvailable !== undefined) details.push({ label: "Lift Available", value: property.propertyFeatures.liftAvailable ? "Yes" : "No", icon: <FaBuilding /> });
    if (property.propertyFeatures.gatedSecurity !== undefined) details.push({ label: "Gated Security", value: property.propertyFeatures.gatedSecurity ? "Yes" : "No", icon: <FaShieldAlt /> });
    if (property.propertyFeatures.petFriendly !== undefined) details.push({ label: "Pet Friendly", value: property.propertyFeatures.petFriendly ? "Yes" : "No", icon: <FaCheckCircle /> });
    if (property.propertyFeatures.bachelorsAllowed !== undefined) details.push({ label: "Bachelors Allowed", value: property.propertyFeatures.bachelorsAllowed ? "Yes" : "No", icon: <UsersIcon /> });
    if (property.propertyFeatures.nonVegAllowed !== undefined) details.push({ label: "Non-Veg Allowed", value: property.propertyFeatures.nonVegAllowed ? "Yes" : "No", icon: <FaUtensils /> });
    if (property.propertyFeatures.wheelchairAccessible !== undefined) details.push({ label: "Wheelchair Accessible", value: property.propertyFeatures.wheelchairAccessible ? "Yes" : "No", icon: <FaCheckCircle /> });
  }

  // Builder/Project Info
  if (property.builder) {
    if (property.builder.name) details.push({ label: "Builder Name", value: property.builder.name, icon: <FaHammer /> });
    if (property.builder.reraId) details.push({ label: "RERA ID", value: property.builder.reraId, icon: <FaFileContract /> });
    if (property.builder.projectName) details.push({ label: "Project Name", value: property.builder.projectName, icon: <FaBuilding /> });
    if (property.builder.possessionDate) details.push({ label: "Possession Date", value: new Date(property.builder.possessionDate).toLocaleDateString(), icon: <FaCalendarAlt /> });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-7 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full" />
        Property Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map((detail, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
            <div className="text-indigo-600 text-xl">
              {detail.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{detail.label}</p>
              <p className="text-sm font-bold text-gray-900">{detail.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Status */}
      {property.verificationStatus && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-3">
            {property.verificationStatus === "Verified" ? (
              <FaCheckCircle className="text-green-600 text-2xl" />
            ) : (
              <FaClock className="text-orange-600 text-2xl" />
            )}
            <div>
              <p className="font-bold text-gray-900">Verification Status</p>
              <p className="text-sm text-gray-600">{property.verificationStatus}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ====================== Amenities Tab Component ====================== */
function AmenitiesTab({ property }) {
  const allAmenities = [
    ...(property.amenities?.basic || []),
    ...(property.amenities?.society || []),
    ...(property.amenities?.nearby || []),
    ...(property.amenitiesList || [])
  ];

  const uniqueAmenities = [...new Set(allAmenities)];

  // PG Facilities
  const pgFacilities = property.pgDetails?.facilities || {};
  const securityFeatures = property.pgDetails?.securityFeatures || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-7 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full" />
        Amenities & Facilities
      </h3>

      {/* General Amenities */}
      {uniqueAmenities.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-indigo-600" />
            Property Amenities
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uniqueAmenities.map((amenity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl hover:shadow-md transition-all"
              >
                <CheckCircle2 className="text-indigo-600 animate-3d-check flex-shrink-0" size={18} />
                <span className="text-sm text-gray-800 font-medium">{amenity}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* PG Facilities */}
      {Object.keys(pgFacilities).length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HomeIcon className="text-violet-600" />
            PG Facilities
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(pgFacilities).map(([key, value]) => value && (
              <div key={key} className="flex items-center gap-2 p-3 bg-violet-50 rounded-lg">
                <FaCheckCircle className="text-violet-600" size={16} />
                <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Features */}
      {Object.keys(securityFeatures).length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-emerald-600" />
            Security Features
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(securityFeatures).map(([key, value]) => value && (
              <div key={key} className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                <FaLock className="text-emerald-600" size={16} />
                <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ====================== Location Tab Component ====================== */
function LocationTab({ property }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-7 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full" />
        Location & Connectivity
      </h3>

      {/* Address Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <FaMapMarkerAlt className="text-indigo-600 text-2xl flex-shrink-0 mt-1" />
          <div>
            <p className="font-bold text-gray-900 mb-2">Full Address</p>
            <p className="text-gray-700">{property.location?.address}</p>
            <p className="text-gray-600 text-sm mt-1">
              {property.location?.locality}, {property.location?.subLocality && `${property.location.subLocality}, `}
              {property.location?.city}, {property.location?.state} - {property.location?.pincode}
            </p>
            {property.location?.landmark && (
              <p className="text-gray-600 text-sm mt-2 flex items-center gap-2">
                <FaMapMarkedAlt className="text-indigo-500" />
                <span>Near: {property.location.landmark}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      {property.location?.coordinates?.latitude && property.location?.coordinates?.longitude && (
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <iframe
            title="Property Location"
            width="100%"
            height="400"
            frameBorder="0"
            src={`https://www.google.com/maps?q=${property.location.coordinates.latitude},${property.location.coordinates.longitude}&z=15&output=embed`}
            allowFullScreen
            className="w-full"
          />
        </div>
      )}

      {/* Virtual Tour */}
      {property.virtualTour?.url && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <FaVideo className="text-purple-600 text-2xl" />
            <div>
              <p className="font-bold text-gray-900">Virtual Tour Available</p>
              <p className="text-sm text-gray-600">Provider: {property.virtualTour.provider || 'N/A'}</p>
            </div>
          </div>
          <a 
            href={property.virtualTour.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Take Virtual Tour
          </a>
        </div>
      )}
    </motion.div>
  );
}

/* ====================== Gallery Tab Component ====================== */
function GalleryTab({ property, openImageModal, placeholderImage }) {
  const images = property.images && property.images.length > 0 
    ? property.images.map(img => img?.url || img)
    : [placeholderImage];

  const videos = property.videos || [];
  const floorPlans = property.floorPlan || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Images */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="text-indigo-600" />
          Property Images
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-square"
              onClick={() => openImageModal(images, i)}
            >
              <img
                src={img}
                alt={`Gallery ${i}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Videos */}
      {videos.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaVideo className="text-indigo-600" />
            Videos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-lg">
                <video 
                  controls 
                  className="w-full"
                  poster={video.thumbnail}
                >
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floor Plans */}
      {floorPlans.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaLayerGroup className="text-indigo-600" />
            Floor Plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {floorPlans.map((plan, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="rounded-xl overflow-hidden shadow-lg cursor-pointer"
                onClick={() => openImageModal(floorPlans.map(p => p.url), i)}
              >
                <img
                  src={plan.url}
                  alt={`Floor Plan ${i + 1}`}
                  className="w-full h-auto"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ====================== Legal & Pricing Tab Component ====================== */
function LegalPricingTab({ property }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-7 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full" />
        Legal & Pricing Details
      </h3>

      {/* Ownership */}
      {property.ownership && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaFileContract className="text-indigo-600" />
            Ownership Information
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Ownership Type:</span>
              <span className="font-semibold">{property.ownership.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                property.ownership.verified 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {property.ownership.verified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Landlord Payment Details */}
      {property.landlordDetails && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaMoneyBillWave className="text-emerald-600" />
            Payment Information
          </h4>
          
          {property.landlordDetails.preferredPaymentMethod && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Preferred Payment Method:</p>
              <p className="font-semibold">{property.landlordDetails.preferredPaymentMethod}</p>
            </div>
          )}

          {property.landlordDetails.bankAccount && (
            <div className="mb-4 p-4 bg-white rounded-lg">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <FaUniversity className="text-indigo-600" />
                Bank Account Details
              </p>
              <div className="space-y-1 text-sm">
                {property.landlordDetails.bankAccount.accountHolderName && (
                  <p><span className="text-gray-600">Account Holder:</span> <span className="font-medium">{property.landlordDetails.bankAccount.accountHolderName}</span></p>
                )}
                {property.landlordDetails.bankAccount.bankName && (
                  <p><span className="text-gray-600">Bank:</span> <span className="font-medium">{property.landlordDetails.bankAccount.bankName}</span></p>
                )}
                {property.landlordDetails.bankAccount.branchName && (
                  <p><span className="text-gray-600">Branch:</span> <span className="font-medium">{property.landlordDetails.bankAccount.branchName}</span></p>
                )}
                {property.landlordDetails.bankAccount.accountNumber && (
                  <p><span className="text-gray-600">Account Number:</span> <span className="font-medium">****{property.landlordDetails.bankAccount.accountNumber.slice(-4)}</span></p>
                )}
                {property.landlordDetails.bankAccount.ifscCode && (
                  <p><span className="text-gray-600">IFSC:</span> <span className="font-medium">{property.landlordDetails.bankAccount.ifscCode}</span></p>
                )}
              </div>
            </div>
          )}

          {property.landlordDetails.upiDetails && (
            <div className="p-4 bg-white rounded-lg">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <FaMobileAlt className="text-violet-600" />
                UPI Details
              </p>
              {property.landlordDetails.upiDetails.upiId && (
                <p className="text-sm mb-2">
                  <span className="text-gray-600">UPI ID:</span> 
                  <span className="font-medium ml-2">{property.landlordDetails.upiDetails.upiId}</span>
                </p>
              )}
              {property.landlordDetails.upiDetails.qrCodeUrl && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">Scan QR Code:</p>
                  <img 
                    src={property.landlordDetails.upiDetails.qrCodeUrl} 
                    alt="UPI QR Code" 
                    className="w-32 h-32 border-2 border-gray-200 rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {(property.landlordDetails.gstNumber || property.landlordDetails.panNumber) && (
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="font-semibold mb-2">Tax Details</p>
              <div className="space-y-1 text-sm">
                {property.landlordDetails.gstNumber && (
                  <p><span className="text-gray-600">GST Number:</span> <span className="font-medium">{property.landlordDetails.gstNumber}</span></p>
                )}
                {property.landlordDetails.panNumber && (
                  <p><span className="text-gray-600">PAN Number:</span> <span className="font-medium">{property.landlordDetails.panNumber}</span></p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaRupeeSign className="text-orange-600" />
          Pricing Breakdown
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-gray-700">Property Price:</span>
            <span className="text-xl font-bold text-gray-900">
              ₹{property.price?.amount?.toLocaleString('en-IN')}
            </span>
          </div>
          {property.price?.pricePerSqft && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700">Price per sqft:</span>
              <span className="font-semibold">₹{property.price.pricePerSqft}/sqft</span>
            </div>
          )}
          {property.price?.securityDeposit && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700">Security Deposit:</span>
              <span className="font-semibold">₹{property.price.securityDeposit.toLocaleString('en-IN')}</span>
            </div>
          )}
          {property.price?.bookingAmount && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700">Booking Amount:</span>
              <span className="font-semibold">₹{property.price.bookingAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ====================== Owner Info Card Component ====================== */
function OwnerInfoCard({ property }) {
  const ownerName = property.ownerId?.name || property.contactInfo?.name || "Property Manager";
  const ownerEmail = property.ownerId?.email || property.contactInfo?.email || "";
  const ownerPhone = property.contactInfo?.phone || "";
  const alternatePhone = property.contactInfo?.alternatePhone || "";
  const preferredCallTime = property.contactInfo?.preferredCallTime || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl shadow-2xl p-8 text-white font-body"
    >
      <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <FaUserTie size={20} />
        </div>
        Contact Information
      </h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-xl font-bold">{ownerName}</p>
          <p className="text-indigo-100 text-sm">{property.postedBy || 'Owner'}</p>
        </div>

        {ownerEmail && (
          <div className="flex items-center gap-2 text-indigo-100">
            <FaEnvelope size={16} />
            <span className="text-sm">{ownerEmail}</span>
          </div>
        )}

        {ownerPhone && (
          <div className="flex items-center gap-2 text-indigo-100">
            <FaPhone size={16} />
            <span className="text-sm">{ownerPhone}</span>
          </div>
        )}

        {alternatePhone && (
          <div className="flex items-center gap-2 text-indigo-100">
            <FaPhone size={16} />
            <span className="text-sm">{alternatePhone} (Alternate)</span>
          </div>
        )}

        {preferredCallTime && (
          <div className="flex items-center gap-2 text-indigo-100">
            <FaClock size={16} />
            <span className="text-sm">Best time to call: {preferredCallTime}</span>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white text-indigo-600 rounded-full font-bold hover:shadow-2xl transition-all"
            onClick={() => window.location.href = `tel:${ownerPhone}`}
          >
            <FaPhone size={16} /> Call Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-bold hover:bg-white/30 transition-all"
            onClick={() => window.location.href = `mailto:${ownerEmail}`}
          >
            <FaEnvelope size={16} /> Email
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ====================== Property Stats Component ====================== */
function PropertyStats({ stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100"
    >
      <h3 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaChartLine className="text-indigo-600" />
        Property Analytics
      </h3>
      
      <div className="space-y-3">
        <StatItem icon={<Eye />} label="Total Views" value={stats.views || 0} />
        <StatItem icon={<UsersIcon />} label="Unique Views" value={stats.uniqueViews || 0} />
        <StatItem icon={<MessageCircle />} label="Enquiries" value={stats.enquiries || 0} />
        <StatItem icon={<Bookmark />} label="Shortlists" value={stats.shortlists || 0} />
        <StatItem icon={<Share2 />} label="Shares" value={stats.shares || 0} />
      </div>

      {stats.lastViewedAt && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last viewed: {new Date(stats.lastViewedAt).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* ====================== Helper Components ====================== */
function HighlightCard({ icon, title, value }) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-base font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoBadge({ icon, label, value, color = "indigo" }) {
  return (
    <div className={`bg-${color}-50 rounded-lg p-3 border border-${color}-100`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-${color}-600`}>{icon}</span>
        <p className="text-xs text-gray-600 font-medium">{label}</p>
      </div>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-indigo-600">{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

/* ====================== Image Modal Component ====================== */
function ImageModal({ selectedImages, initialSlide, closeImageModal }) {
  return (
    <div className="fixed inset-0 bg-black/97 z-50 flex items-center justify-center p-4">
      <button
        onClick={closeImageModal}
        className="absolute top-6 right-6 text-white text-4xl z-10 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
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
      baseURL: baseurl,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchData = async () => {
    try {
      setError(null);
      const timestamp = new Date().getTime();
      
      // Fetch rating stats (public endpoint)
      const statsResponse = await axios.get(
        `${baseurl}api/public/ratings/property/${propertyId}/rating-stats?_=${timestamp}`
      );
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      // Fetch ratings and comments if token exists
      if (getToken()) {
        try {
          const axiosInstance = createAxiosInstance();
          
          const ratingsResponse = await axiosInstance.get(
            `property/${propertyId}/ratings`
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
            `property/${propertyId}/comments?page=1&limit=10`
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
              setCurrentUser(decoded.userName || decoded.fullName || decoded.id);
            } catch (err) {
              console.error("Error decoding token:", err);
            }
          }
        } catch (err) {
          if (err.response?.status === 401) {
            setError("Session expired. Please login again.");
            setShowTokenInput(true);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error loading reviews.");
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
      setError("Please login to post a review.");
      setShowTokenInput(true);
      return;
    }

    try {
      setError(null);
      const axiosInstance = createAxiosInstance();

      let newItem;
      if (rating > 0) {
        const response = await axiosInstance.post(
          `property/${propertyId}/ratings`,
          { rating, review: comment }
        );
        if (response.data.success) {
          newItem = {
            id: response.data.rating._id,
            username: response.data.rating.userName || "You",
            profilePic: response.data.rating.profilePic || user,
            text: response.data.rating.review,
            rating: response.data.rating.rating,
            createdAt: response.data.rating.createdAt,
            type: "rating",
          };
        }
      } else {
        const response = await axiosInstance.post(
          `property/${propertyId}/comments`,
          { comment }
        );
        if (response.data.success) {
          newItem = {
            id: response.data.comment._id,
            username: response.data.comment.userName || "You",
            profilePic: response.data.comment.profilePic || user,
            text: response.data.comment.comment,
            createdAt: response.data.comment.createdAt,
            type: "comment",
            replies: [],
          };
        }
      }

      setComments((prev) => [newItem, ...prev]);
      setComment("");
      setRating(0);
      
      // Refresh stats
      const timestamp = new Date().getTime();
      const statsResponse = await axios.get(
        `${baseurl}api/public/ratings/property/${propertyId}/rating-stats?_=${timestamp}`
      );
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
    } catch (err) {
      console.error("Error submitting:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setShowTokenInput(true);
      } else {
        setError(err.response?.data?.message || "Failed to post review.");
      }
    }
  };

  const handleDelete = async (id, type) => {
    try {
      setError(null);
      const axiosInstance = createAxiosInstance();
      const endpoint = type === "rating" ? `ratings/${id}` : `comments/${id}`;
      
      await axiosInstance.delete(endpoint);
      setComments((prev) => prev.filter((item) => item.id !== id));
      
      // Refresh stats
      const timestamp = new Date().getTime();
      const statsResponse = await axios.get(
        `${baseurl}api/public/ratings/property/${propertyId}/rating-stats?_=${timestamp}`
      );
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
    } catch (err) {
      console.error("Error deleting:", err);
      setError(err.response?.data?.message || "Failed to delete.");
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
        `comments/${commentId}/replies`,
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
      setError(err.response?.data?.message || "Failed to send reply");
    }
  };

  const handleTokenSubmit = () => {
    if (newToken.trim()) {
      localStorage.setItem("usertoken", newToken);
      setShowTokenInput(false);
      setNewToken("");
      setError(null);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-7 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full" />
        Reviews & Ratings
      </h3>

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
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-colors"
          />
          <button
            onClick={handleTokenSubmit}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Submit
          </button>
        </div>
      )}

      {stats && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-amber-200">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-display font-bold text-orange-600">
              {stats.averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    fill={i < Math.round(stats.averageRating) ? "currentColor" : "none"} 
                    className={i < Math.round(stats.averageRating) ? "text-amber-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Based on {stats.totalRatings} reviews
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rating Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating:</label>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            return (
              <motion.span
                key={i}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(starValue)}
                className={`cursor-pointer text-4xl transition-colors ${
                  starValue <= rating ? "text-amber-400" : "text-gray-300"
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
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-colors"
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddComment}
          disabled={!getToken()}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post
        </motion.button>
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
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
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
                      <p className="font-bold text-gray-900">{c.username}</p>
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
                      {getToken() && c.type === "comment" && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <FaReply size={14} />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {c.rating && (
                    <div className="flex text-amber-400 mb-2">
                      {[...Array(c.rating)].map((_, i) => (
                        <span key={i} className="text-lg">★</span>
                      ))}
                    </div>
                  )}

                  <p className="text-gray-700 mb-2">{c.text}</p>

                  {/* Reply Input */}
                  {replyingTo === c.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleReply(c.id)}
                      />
                      <button
                        onClick={() => handleReply(c.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
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
                    <div className="mt-4 ml-4 space-y-3 border-l-2 border-indigo-100 pl-4">
                      {c.replies.map((reply, idx) => (
                        <div key={idx} className="bg-indigo-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-indigo-700">
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
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={40} className="text-indigo-600" />
            </div>
            <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyDetails;