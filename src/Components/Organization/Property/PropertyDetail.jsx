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

import Complaints from "./OrgComplaints";
 import PropertyReviews from "./PropertyReviews";
 import PropertyExpenses from "./PropertyExpenses";

import baseurl from "../../../../BaseUrl";
import OrganizationRoomOverview from "./RoomOverview";

const tabList = [
  "Details",
  "Rooms",
  "Tenant",
  "TenantDues",
  "Complaints",
  "PropertyReviews",
  // "PropertyExpenses",
];

// 3D Icon Wrapper
const Icon3D = ({ children }) => (
  <motion.div
    className="relative inline-flex items-center justify-center w-12 h-12 rounded-2xl 
               bg-gradient-to-br from-indigo-500 to-purple-600
               shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-indigo-400/40"
    whileHover={{ y: -3, rotateX: 5, rotateY: -5 }}
    transition={{ type: "spring", stiffness: 300, damping: 18 }}
  >
    <div className="text-white text-2xl drop-shadow-lg">{children}</div>
  </motion.div>
);

// Detail item with 3D icon
const DetailItem = ({ icon, label, value }) => (
  <motion.div
    className="flex items-center gap-4 p-4 rounded-xl 
               bg-gradient-to-r from-blue-300 to-green-300 
               border border-indigo-500/30"
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <Icon3D>{icon}</Icon3D>
    <div>
      <p className="text-sm text-black">{label}</p>
      <p className="text-lg font-semibold text-black">{value || "N/A"}</p>
    </div>
  </motion.div>
);

const OrganizationPropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Details");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        // Use orgToken for Organization section
        const token = localStorage.getItem("orgToken");
        const res = await axios.get(`${baseurl}api/public/property/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setProperty(res.data.property);
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [id]);

  // Auto-slide effect
  useEffect(() => {
    if (property?.images?.length > 1) {
      const timer = setInterval(() => {
        setActiveImageIndex((prevIndex) =>
          prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [property?.images]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-200 p-6 rounded-lg border border-indigo-500/30">
            <DetailItem icon={<Home />} label="Type" value={property?.type} />
            <DetailItem
              icon={<MapPin />}
              label="Address"
              value={property?.location?.address || property?.address}
            />
            <DetailItem
              icon={<Building />}
              label="City"
              value={property?.location?.city || property?.city}
            />
            <DetailItem
              icon={<Landmark />}
              label="State"
              value={property?.location?.state || property?.state}
            />
            <DetailItem
              icon={<LocateFixed />}
              label="Pin Code"
              value={property?.location?.pinCode || property?.pinCode}
            />
            <DetailItem
              icon={<Layers />}
              label="Total Rooms"
              value={property?.totalRooms}
            />
            <DetailItem
              icon={<BedDouble />}
              label="Total Beds"
              value={property?.totalBeds}
            />
            <div className="col-span-1 md:col-span-2 text-black">
              {/* <p className="mb-1 flex items-center">
                <FaRupeeSign className="mr-2 text-indigo-400" />
                Rent: {property?.rent || "N/A"} / month
              </p> */}
              {/* <p className="mb-1">
                Furnished: {property?.furnished ? "Yes" : "No"}
              </p> */}
              <p className="mt-4">
                <h6 className="text-green-800 font-bold">Description</h6>
                {property?.description || "No description available"}
              </p>
            </div>
          </div>
        );

      case "Rooms":
        return <OrganizationRoomOverview />;

      case "TenantDues":
        return (
          <div className="bg-gray-50 p-6 rounded-lg border border-indigo-500/30">
            <TenantDues />
          </div>
        );

      case "Tenant":
        return (
          <div className="bg-gray-50 p-6 rounded-lg border border-indigo-500/30">
            <Tenant />
          </div>
        );
      case "Complaints":
        return (
          <div className="bg-gray-50 p-6 rounded-lg border border-indigo-500/30">
            <Complaints />
          </div>
        );
    
      case "PropertyReviews":
        return (
          <div className="bg-gray-50 p-6 rounded-lg border border-green-500/30">
            <PropertyReviews />
          </div>
        );
        case "PropertyExpenses":
        return (
          <div className="bg-gray-50 p-6 rounded-lg border border-green-500/30">
            <PropertyExpenses />
          </div>
        );
          

      default:
        return <div className="text-gray-300 p-4">Tab content...</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="border-t-4 border-indigo-500 w-10 h-10 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="text-lg text-red-500">Property not found</div>
      </div>
    );
  }

  return (
    <div className="bg-green-100 min-h-screen text-white">
      {/* Navbar */}
      <nav className="bg-black border-b border-indigo-500/40 top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-full text-white">
              <Building2 size={22} />
            </div>
            <h1 className="text-2xl font-bold text-white">{property.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabList.map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-md"
                    : "bg-blue-300 hover:from-blue-600 hover:to-green-500 text-black"
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
      <div className="max-w-5xl mx-auto p-6">
        {/* Image Slider */}
        <div className="relative overflow-hidden rounded-lg border border-indigo-500/30 mb-8 group">
          {property.images?.length > 0 ? (
            <div className="relative w-full h-80">
              <AnimatePresence>
                <motion.img
                  key={activeImageIndex}
                  src={
                    property.images[activeImageIndex] ||
                    "https://via.placeholder.com/600x400?text=No+Image"
                  }
                  alt={`${property.name} - Image ${activeImageIndex + 1}`}
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
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                  <motion.button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    whileHover={{ scale: 1.1 }}
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
                      className={`w-3 h-3 rounded-full ${
                        activeImageIndex === index
                          ? "bg-indigo-400"
                          : "bg-gray-500"
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-80 bg-gray-900 flex items-center justify-center text-gray-500">
              No Image Available
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Back + Edit Buttons at bottom */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            to="/organization/property-list"
            className="text-indigo-400 hover:underline text-sm"
          >
            ← Back to Properties
          </Link>
          {/* Uncomment if you want to restore the Edit button */}
          {/* <button
            onClick={() =>
              navigate(`/landlord/add-property`, {
                state: { property },
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded hover:opacity-90"
          >
            <FaEdit />
            Edit Property
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default OrganizationPropertyDetail;
