import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Home,
  MapPin,
  Building,
  BedDouble,
  Layers,
  Landmark,
  LocateFixed,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { FaRupeeSign, FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RoomOverview from "./SubOwnerPropertyPage/RoomOverview";
import Tenant from "./SubOwnerPropertyPage/Tenant";
import Collections from "./SubOwnerPropertyPage/Collections";
import Dues from "./SubOwnerPropertyPage/Dues";
import Expenses from "./SubOwnerPropertyPage/Expenses";
import Maintenance from "./SubOwnerPropertyPage/Maintenance";
import PropertyReviews from "./SubOwnerPropertyPage/PropertyReviews";
import Announcements from "./SubOwnerPropertyPage/Announcement";
import Complaints from "./SubOwnerPropertyPage/Complaints";

import baseurl from "../../../../BaseUrl";

const tabList = [
  "Details",
  "Rooms",
  "Tenant",
  "Expenses",
  "Dues",
  "Complaints",
  "PropertyReviews",
  "Announcements",
];

// Modern 3D Icon Wrapper with Gharzo colors
const Icon3D = ({ children, gradient = "from-[#FF6B35] to-[#ff8659]" }) => (
  <motion.div
    className={`relative inline-flex items-center justify-center w-14 h-14 rounded-xl 
               bg-gradient-to-br ${gradient}
               shadow-lg hover:shadow-2xl transition-shadow duration-300`}
    whileHover={{ y: -4, scale: 1.08 }}
    transition={{ type: "spring", stiffness: 400, damping: 15 }}
  >
    <div className="text-white text-2xl drop-shadow-lg">{children}</div>
  </motion.div>
);

// Enhanced Detail Item Component
const DetailItem = ({ icon, label, value }) => (
  <motion.div
    className="group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl border-2 border-gray-100 hover:border-[#FF6B35] overflow-hidden transition-all duration-300"
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    {/* Animated Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#003366]/5 to-[#FF6B35]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="relative flex items-center gap-4">
      <Icon3D gradient="from-[#003366] to-[#004d99]">{icon}</Icon3D>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-[#003366] truncate">
          {value || "N/A"}
        </p>
      </div>
    </div>
  </motion.div>
);

const PropertyDetail = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Details");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to view property details", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/login");
          return;
        }

        const res = await axios.get(
          `${baseurl}api/sub-owner/properties/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.data.success) {
          setProperty(res.data.property);
        } else {
          toast.error("Failed to fetch property details", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error("An error occurred while fetching property details", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [propertyId, navigate]);

  // Auto-slide effect
  useEffect(() => {
    if (property?.images?.length > 1 && activeTab === "Details") {
      const timer = setInterval(() => {
        setActiveImageIndex((prevIndex) =>
          prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [property?.images, activeTab]);

  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDotClick = (index) => {
    setActiveImageIndex(index);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Details":
        return (
          <div className="space-y-6 sm:space-y-8">
            {/* Image Slider */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {property.images?.length > 0 ? (
                <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIndex}
                      src={
                        property.images[activeImageIndex] ||
                        "https://via.placeholder.com/800x500?text=No+Image"
                      }
                      alt={`${property.name} - Image ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/800x500?text=No+Image")
                      }
                    />
                  </AnimatePresence>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  
                  {/* Navigation Arrows */}
                  {property.images.length > 1 && (
                    <>
                      <motion.button
                        onClick={handlePrevImage}
                        className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-[#003366] p-2 sm:p-3 rounded-xl hover:bg-white shadow-lg"
                        whileHover={{ scale: 1.1, x: -4 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                      </motion.button>
                      <motion.button
                        onClick={handleNextImage}
                        className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-[#003366] p-2 sm:p-3 rounded-xl hover:bg-white shadow-lg"
                        whileHover={{ scale: 1.1, x: 4 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                      </motion.button>
                    </>
                  )}
                  
                  {/* Navigation Dots */}
                  {property.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-md rounded-full px-3 py-2">
                      {property.images.map((_, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleDotClick(index)}
                          className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                            activeImageIndex === index
                              ? "bg-[#FF6B35] w-6 sm:w-8"
                              : "bg-white/60 hover:bg-white"
                          }`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 1 }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Image Counter */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                    {activeImageIndex + 1} / {property.images.length}
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gradient-to-br from-[#003366] to-[#004d99] flex items-center justify-center text-white rounded-2xl">
                  <div className="text-center">
                    <Building2 size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-xl sm:text-2xl font-bold">No Image Available</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              <DetailItem icon={<Home />} label="Property Type" value={property?.type} />
              <DetailItem
                icon={<MapPin />}
                label="Address"
                value={property?.address || property?.location?.address || "N/A"}
              />
              <DetailItem
                icon={<Building />}
                label="City"
                value={property?.city || property?.location?.city || "N/A"}
              />
              <DetailItem
                icon={<Landmark />}
                label="State"
                value={property?.state || property?.location?.state || "N/A"}
              />
              <DetailItem
                icon={<LocateFixed />}
                label="Pin Code"
                value={property?.pinCode || property?.location?.pinCode || "N/A"}
              />
              <DetailItem
                icon={<Layers />}
                label="Total Rooms"
                value={property?.stats?.totalRooms}
              />
              <DetailItem
                icon={<BedDouble />}
                label="Total Beds"
                value={property?.stats?.totalBeds}
              />
              <DetailItem
                icon={<FaRupeeSign />}
                label="Monthly Collection"
                value={
                  property?.stats?.monthlyCollection > 0
                    ? `₹${property.stats.monthlyCollection.toLocaleString()}`
                    : "N/A"
                }
              />
            </div>

            {/* Description Card */}
            <motion.div 
              className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg border-2 border-gray-100 hover:border-[#FF6B35] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#ff8659] rounded-lg flex items-center justify-center">
                  <Building2 className="text-white" size={20} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#003366]">Description</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {property?.description || "No description available"}
              </p>
            </motion.div>
          </div>
        );

      case "Rooms":
        return <RoomOverview propertyId={propertyId} />;

      case "Dues":
        return (
          <div className="bg-white rounded-2xl shadow-lg">
            <Dues propertyId={propertyId} />
          </div>
        );

      case "Tenant":
        return (
          <div className="bg-white rounded-2xl shadow-lg">
            <Tenant propertyId={propertyId} />
          </div>
        );
      
      case "Complaints":
        return (
          <div className="bg-white rounded-2xl shadow-lg">
            <Complaints propertyId={propertyId} />
          </div>
        );
      
      case "Expenses":
        return (
          <div className="bg-white rounded-2xl shadow-lg">
            <Expenses propertyId={propertyId} />
          </div>
        );
      
      case "Maintenance":
        return (
          <div className="bg-white rounded-2xl shadow-lg">
            <Maintenance propertyId={propertyId} />
          </div>
        );
      
      case "Collections":
        return (
          <div className="bg-white rounded-2xl shadow-lg">
            <Collections propertyId={propertyId} />
          </div>
        );
      
      case "PropertyReviews":
        return (
          <div className="bg-white rounded-2xl shadow-lg">
            <PropertyReviews propertyId={propertyId} />
          </div>
        );
      
      case "Announcements":
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <Announcements propertyId={propertyId} />
          </div>
        );
      
      default:
        return (
          <div className="text-gray-600 p-8 rounded-2xl bg-white shadow-lg">
            Tab content...
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <motion.div
          className="relative w-20 h-20 sm:w-24 sm:h-24"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#003366] border-r-[#FF6B35]"></div>
        </motion.div>
        <p className="mt-6 text-lg sm:text-xl font-semibold text-[#003366]">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-6">
          <Building2 className="text-white" size={40} />
        </div>
        <div className="text-xl sm:text-2xl text-[#003366] font-bold">Property not found</div>
        <Link
          to="/sub_owner/sub_owner_property"
          className="mt-6 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#ff8659] text-white rounded-xl font-semibold hover:shadow-xl transition-all"
        >
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToastContainer theme="colored" position="top-right" />
      
      {/* Modern Header/Navbar */}
      <div className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Top Section - Property Name */}
          <div className="py-4 sm:py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#ff8659] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Building2 size={20} className="text-white sm:w-6 sm:h-6" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#003366] truncate">
                  {property.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={14} />
                  <span className="truncate">{property?.city || "City"}</span>
                </p>
              </div>
            </div>
            
            {/* Back Button - Desktop */}
            <Link
              to="/sub_owner/sub_owner_property"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
          </div>

          {/* Tabs Section - Horizontal Scroll on Mobile */}
          <div className="pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center">
              {tabList.map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#ff8659] text-white shadow-lg shadow-orange-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Mobile Back Button */}
        <div className="mt-8 sm:hidden">
          <Link
            to="/sub_owner/sub_owner_property"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Properties
          </Link>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PropertyDetail;