import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const SellerProperty = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [images, setImages] = useState({});
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [propertyType, setPropertyType] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("sellertoken");
        if (!token) return;

        // Fetch properties
        const propRes = await axios.get(`${baseurl}api/seller/getproperties`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (propRes.data && Array.isArray(propRes.data.properties)) {
          setProperties(propRes.data.properties);
        } else {
          setProperties([]);
        }

        // Fetch subscription
        const subRes = await axios.get(`${baseurl}api/seller/subscription/my-subscription`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (subRes.data && subRes.data.success) {
          setSubscription(subRes.data.data);
        } else {
          setSubscription(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setProperties([]);
        setSubscription(null);
      } finally {
        setLoadingSubscription(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (properties.length > 0 && !loadingSubscription) {
      const token = localStorage.getItem("sellertoken");
      if (!token) return;

      const fetchAllImages = async () => {
        const imagesMap = new Map();
        await Promise.all(
          properties.map(async (prop) => {
            if (prop._id) {
              try {
                const imgRes = await axios.get(
                  `${baseurl}api/seller/get-image/${prop._id}/images`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                if (imgRes.data.success && imgRes.data.images) {
                  const validImages = imgRes.data.images.filter(
                    (img) => img && img !== "/uploads/properties/undefined"
                  );
                  imagesMap.set(prop._id, validImages);
                } else {
                  imagesMap.set(prop._id, []);
                }
              } catch (err) {
                console.error(`Error fetching images for ${prop._id}:`, err);
                imagesMap.set(prop._id, []);
              }
            }
          })
        );
        setImages(Object.fromEntries(imagesMap));
      };

      fetchAllImages();
    }
  }, [properties, loadingSubscription]);

  const handleAddProperty = () => {
    if (loadingSubscription) {
      // Optionally show a loading toast or wait
      return;
    }

    if (!subscription || !subscription.isActive) {
      navigate("/seller/subscription");
      return;
    }

    if (properties.length >= subscription.propertyLimit) {
      setShowLimitModal(true);
      return;
    }

    // Navigate to add property page (adjust path as needed)
    navigate("/seller/add-property");
  };

  const handleSubscribeNow = () => {
    setShowLimitModal(false);
    navigate("/seller/subscription");
  };

  const handleCloseModal = () => {
    setShowLimitModal(false);
  };

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.name?.toLowerCase().includes(search.toLowerCase()) ||
      prop.address?.toLowerCase().includes(search.toLowerCase()) ||
      prop.city?.toLowerCase().includes(search.toLowerCase());

    // If price is not present, always show (or you can skip)
    const price = prop.price || 0;
    const matchesPrice = price >= minPrice && price <= maxPrice;

    const matchesType =
      !propertyType || prop.type?.toLowerCase() === propertyType.toLowerCase();

    return matchesSearch && matchesPrice && matchesType;
  });

  const PropertyCarousel = ({ propertyId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const propertyImages = images[propertyId] || [];
    const placeholderImage = "https://via.placeholder.com/400x250?text=No+Image";

    if (propertyImages.length === 0) {
      return (
        <img
          src={placeholderImage}
          alt="No Image"
          className="h-full w-full object-cover rounded-t-[16px]"
        />
      );
    }

    const currentImage = propertyImages[currentIndex] ? `${baseurl}${propertyImages[currentIndex]}` : placeholderImage;

    const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
    };

    const prevSlide = () => {
      setCurrentIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
    };

    return (
      <div className="relative h-48 overflow-hidden rounded-t-[16px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={currentImage}
            alt={`Property image ${currentIndex + 1}`}
            className="absolute top-0 left-0 h-full w-full object-cover transition-opacity duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
        </AnimatePresence>

        {propertyImages.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            >
              <FaArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            >
              <FaArrowRight className="w-4 h-4" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
              {propertyImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="pt-24 px-4 md:px-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-[#333]]">
        Available Properties
      </h2>

      {/* Add Property Button */}
      <div className="flex justify-end mb-4">
        <motion.button
          onClick={handleAddProperty}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loadingSubscription}
          className={`flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 ${
            loadingSubscription
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#5c4eff] to-[#8b7bff] hover:shadow-xl"
          }`}
        >
          <FaPlus className="w-4 h-4" />
          Add New Property
        </motion.button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Filter */}
        <div className="bg-white p-4 md:p-5 shadow rounded-lg h-fit sticky top-24 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 md:mb-5 flex items-center gap-2">
            <FaFilter className="text-[#5c4eff]" /> Filter Properties
          </h3>

          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <div className="flex items-center gap-2 mt-1 border border-gray-300 rounded-lg px-2 focus-within:border-[#5c4eff]">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, Address, City"
                className="w-full p-2 outline-none text-gray-800"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-gray-300 focus:border-[#5c4eff] outline-none"
            >
              <option value="">Select Property Type</option>
              <option value="PG">PG</option>
              <option value="Flat">Flat</option>
              <option value="Hostel">Hostel</option>
            </select>
          </div>

          {/* Min Price */}
        </div>

        {/* Property Cards */}
        <div className="md:col-span-3 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((prop, index) => (
              <div
                key={prop._id || index}
                className="bg-white border border-gray-200 rounded-[16px] overflow-hidden shadow-lg hover:shadow-xl transition duration-300 w-full max-w-[700px] transform hover:-translate-y-1"
              >
                {/* Image Carousel */}
                <div className="relative h-48">
                  <PropertyCarousel propertyId={prop._id} />
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-[#5c4eff] to-[#8b7bff] text-white text-sm px-3 py-1 rounded-full font-semibold shadow-md">
                    For Sale
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                 

                  <h3 className="text-2xl font-semibold text-gray-800 mt-1 mb-2">
                    {prop.name || "Untitled Property"}
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    {prop.address || "Location not specified"}
                  </p>

                  {/* Details */}
                  <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 gap-3 mb-5">
                    <div className="flex items-center gap-2 hover:scale-110 transition transform">
                      <FaBed className="text-[#5c4eff] text-lg" /> {prop.totalBeds || 0} Beds
                    </div>
                    <div className="flex items-center gap-2 hover:scale-110 transition transform">
                      <FaBath className="text-[#5c4eff] text-lg" /> {prop.totalRooms || 0} Rooms
                    </div>
                    <div className="flex items-center gap-2 hover:scale-110 transition transform">
                      <FaRulerCombined className="text-[#5c4eff] text-lg" /> {prop.totalCapacity || "-"} Capacity
                    </div>
                  </div>

                  {/* Button */}
                  <Link
                    to={`/seller/property/${prop._id || index}`}
                    className="block text-center bg-gradient-to-r from-[#5c4eff] to-[#8b7bff] text-white py-3 rounded-lg hover:bg-gradient-to-r hover:from-[#4a3de6] hover:to-[#7a6bff] transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">No properties match your filters.</p>
          )}
        </div>
      </div>

      {/* Limit Reached Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <FaExclamationTriangle className="text-yellow-500 w-5 h-5" />
                <h3 className="text-lg font-bold text-gray-800">Property Limit Reached!</h3>
              </div>
              <p className="text-gray-600 mb-6">
                You have reached your current subscription limit of {subscription?.propertyLimit || 0} properties. To add more properties, please subscribe to a higher plan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubscribeNow}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-[#5c4eff] to-[#8b7bff] text-white rounded-lg hover:from-[#4a3de6] hover:to-[#7a6bff] transition font-semibold"
                >
                  Subscribe Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerProperty;