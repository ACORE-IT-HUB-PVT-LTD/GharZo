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
} from "lucide-react";
import { FaRupeeSign, FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import RoomOverview from "./RoomOverview";
import Tenant from "../Tenant/Tenant";
import TenantDues from "./TenantDues";
import Complaints from "./LandlordComplaints";
import PropertyReviews from "./PropertyReviews";
import PropertyExpenses from "./PropertyExpenses";

import baseurl from "../../../../BaseUrl";

const tabList = [
  "Details",
  "Rooms",
  "Tenant",
  "TenantDues",
  "Complaints",
  "PropertyReviews",
  "PropertyExpenses",
];

// 3D Icon Wrapper - GTharzo themed
const Icon3D = ({ children }) => (
  <motion.div
    className="relative inline-flex items-center justify-center w-12 h-12 rounded-2xl 
               bg-gradient-to-br from-[#003366] to-[#004999]
               shadow-[0_10px_30px_rgba(255,107,53,0.4)] border-2 border-[#FF6B35]/50"
    whileHover={{ y: -3, rotateX: 5, rotateY: -5 }}
    transition={{ type: "spring", stiffness: 300, damping: 18 }}
  >
    <div className="text-white text-2xl drop-shadow-lg">{children}</div>
  </motion.div>
);

// Detail item with 3D icon - GTharzo themed
const DetailItem = ({ icon, label, value }) => (
  <motion.div
    className="flex items-center gap-4 p-4 rounded-xl 
               bg-white border-2 border-[#FF6B35]/30
               shadow-lg hover:shadow-xl"
    whileHover={{ y: -2, borderColor: "rgba(255, 107, 53, 0.6)" }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <Icon3D>{icon}</Icon3D>
    <div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="text-lg font-bold text-[#003366]">{value || "N/A"}</p>
    </div>
  </motion.div>
);

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Details");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);
      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
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
              setProperty(foundV2);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Authenticated v2 details fetch failed, falling back to public API:", e?.response?.status || e.message);
            // continue to public fetch
          }
        }

        // Fallback to public API
        const res = await axios.get(`${baseurl}api/public/property/${id}`);
        setProperty(res.data.property);
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [id]);

  // Auto-slide effect (only for Details tab)
  useEffect(() => {
    if (activeTab === "Details" && property?.images?.length > 1) {
      const timer = setInterval(() => {
        setActiveImageIndex((prevIndex) =>
          prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [activeTab, property?.images]);

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

  // Image Carousel - Only for Details tab
  const ImageCarousel = () => (
    <div className="relative overflow-hidden rounded-2xl border-4 border-[#FF6B35] mb-8 shadow-2xl group">
      {property?.images?.length > 0 ? (
        <div className="relative w-full h-96">
          <AnimatePresence>
            <motion.img
              key={activeImageIndex}
              src={
                property.images[activeImageIndex]?.url ||
                "https://via.placeholder.com/600x400?text=No+Image"
              }
              alt={`${property?.title || property?.name} - Image ${activeImageIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/600x400?text=No+Image")
              }
            />
          </AnimatePresence>
          {/* Navigation Arrows */}
          {property.images.length > 1 && (
            <>
              <motion.button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#003366]/90 text-white p-3 rounded-full hover:bg-[#003366] border-2 border-[#FF6B35] shadow-xl"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={24} />
              </motion.button>
              <motion.button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#003366]/90 text-white p-3 rounded-full hover:bg-[#003366] border-2 border-[#FF6B35] shadow-xl"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={24} />
              </motion.button>
            </>
          )}
          {/* Navigation Dots */}
          {property.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {property.images.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-3 h-3 rounded-full border-2 ${
                    activeImageIndex === index
                      ? "bg-[#FF6B35] border-[#FF6B35] scale-125"
                      : "bg-white/50 border-white"
                  }`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold">
          No Image Available
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Details":
        return (
          <>
            {/* Image Carousel ONLY in Details tab */}
            <ImageCarousel />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
              <DetailItem icon={<Home />} label="Property Type" value={property?.propertyType} />
              <DetailItem
                icon={<MapPin />}
                label="Address"
                value={property?.location?.address}
              />
              <DetailItem
                icon={<Building />}
                label="City"
                value={property?.location?.city}
              />
              <DetailItem
                icon={<Landmark />}
                label="Locality"
                value={property?.location?.locality}
              />
              <DetailItem
                icon={<LocateFixed />}
                label="Pin Code"
                value={property?.location?.pincode}
              />
              <DetailItem
                icon={<Building2 />}
                label="State"
                value={property?.location?.state}
              />
              <DetailItem
                icon={<BedDouble />}
                label="BHK"
                value={property?.bhk}
              />
              <DetailItem
                icon={<Building />}
                label="Bathrooms"
                value={property?.bathrooms}
              />
              <DetailItem
                icon={<Layers />}
                label="Carpet Area"
                value={property?.area?.carpet ? `${property.area.carpet} ${property.area.unit}` : "N/A"}
              />
              <DetailItem
                icon={<Layers />}
                label="Built-up Area"
                value={property?.area?.builtUp ? `${property.area.builtUp} ${property.area.unit}` : "N/A"}
              />
              <DetailItem
                icon={<FaRupeeSign />}
                label="Price"
                value={property?.price?.amount ? `₹${property.price.amount.toLocaleString()} per ${property.price.per}` : "N/A"}
              />
              <DetailItem
                icon={<FaRupeeSign />}
                label="Security Deposit"
                value={property?.price?.securityDeposit ? `₹${property.price.securityDeposit.toLocaleString()}` : "N/A"}
              />
              <DetailItem
                icon={<Landmark />}
                label="Furnishing Type"
                value={property?.furnishing?.type}
              />
              <DetailItem
                icon={<Building />}
                label="Listing Type"
                value={property?.listingType}
              />
              <DetailItem
                icon={<Home />}
                label="Property Status"
                value={property?.status}
              />
              <DetailItem
                icon={<Landmark />}
                label="Property Age"
                value={property?.propertyAge}
              />
              <DetailItem
                icon={<Building />}
                label="Floor"
                value={property?.floor?.current && property?.floor?.total ? `${property.floor.current} of ${property.floor.total}` : "N/A"}
              />
              <DetailItem
                icon={<Building2 />}
                label="Balconies"
                value={property?.balconies}
              />
              <DetailItem
                icon={<Building2 />}
                label="Covered Parking"
                value={property?.parking?.covered}
              />
              <DetailItem
                icon={<Building2 />}
                label="Open Parking"
                value={property?.parking?.open}
              />
              <DetailItem
                icon={<Building2 />}
                label="Landmark"
                value={property?.location?.landmark}
              />
              <DetailItem
                icon={<Landmark />}
                label="Preferred Payment"
                value={property?.landlordDetails?.preferredPaymentMethod}
              />
              <DetailItem
                icon={<Building />}
                label="Total Room Stats"
                value={property?.roomStats?.totalRooms ? `Total: ${property.roomStats.totalRooms}, Occupied: ${property.roomStats.occupiedRooms}, Available: ${property.roomStats.availableRooms}` : "N/A"}
              />
              <DetailItem
                icon={<Building2 />}
                label="Completion %"
                value={`${property?.completionPercentage}%`}
              />
              <div className="col-span-1 md:col-span-2 bg-white p-5 rounded-xl border-2 border-[#FF6B35]/30 shadow-md">
                <h6 className="text-[#003366] font-bold text-lg mb-3 flex items-center">
                  <span className="w-1 h-6 bg-[#FF6B35] mr-3 rounded"></span>
                  Description
                </h6>
                <p className="text-gray-700 leading-relaxed">
                  {property?.description || "No description available"}
                </p>
              </div>
              <div className="col-span-1 md:col-span-2 bg-white p-5 rounded-xl border-2 border-[#FF6B35]/30 shadow-md">
                <h6 className="text-[#003366] font-bold text-lg mb-3 flex items-center">
                  <span className="w-1 h-6 bg-[#FF6B35] mr-3 rounded"></span>
                  Contact Information
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-gray-700"><span className="font-semibold">Name:</span> {property?.contactInfo?.name}</p>
                  <p className="text-gray-700"><span className="font-semibold">Phone:</span> {property?.contactInfo?.phone}</p>
                  <p className="text-gray-700"><span className="font-semibold">Email:</span> {property?.contactInfo?.email}</p>
                  <p className="text-gray-700"><span className="font-semibold">Preferred Call Time:</span> {property?.contactInfo?.preferredCallTime}</p>
                </div>
              </div>
            </div>
          </>
        );

      case "Rooms":
        return <RoomOverview />;

      case "TenantDues":
        return (
          // <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
            <TenantDues />
          // </div>
        );

      case "Tenant":
        return (
          <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
            <Tenant />
          </div>
        );
      
      case "Complaints":
        return (
          <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
            <Complaints />
          </div>
        );
    
      case "PropertyReviews":
        return (
          // <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
            <PropertyReviews />
          // </div>
        );
      
      case "PropertyExpenses":
        return (
          <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
            <PropertyExpenses />
          </div>
        );

      default:
        return <div className="text-gray-600 p-4">Tab content...</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="border-t-4 border-[#FF6B35] w-14 h-14 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-lg text-red-600 font-semibold">Property not found</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen transition-all duration-500 min-w-0 relative ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      {/* Navbar - GTharzo themed */}
      <nav className="bg-white border-b-4 border-[#FF6B35] sticky top-0 z-10 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6B35] rounded-full text-white shadow-lg">
              <Building2 size={24} />
            </div>
            <h1 className="text-2xl font-bold text-blue-900 tracking-wide">{property?.title || property?.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabList.map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
                  activeTab === tab
                    ? "bg-[#FF6B35] text-black border-[#FF6B35] shadow-lg scale-105"
                    : "bg-white text-[#003366] border-blue hover:bg-[#FF6B35]/10 hover:border-[#FF6B35]"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Image Carousel removed from here – now only inside Details tab */}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Back + Edit Buttons at bottom */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            to="/landlord/property"
            className="flex items-center gap-2 text-[#003366] hover:text-[#FF6B35] font-semibold text-sm transition-colors"
          >
            <ChevronLeft size={18} />
            Back to Properties
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;