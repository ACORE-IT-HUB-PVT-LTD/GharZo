import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBed,
  FaBath,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCouch,
  FaTrash,
  FaEdit,
  FaDoorOpen,
  FaEye,
  FaHome,
  FaCalendarAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl.js";

// Compact Image Slider Component
const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-800/50 flex items-center justify-center rounded-t-2xl">
        <span className="text-gray-400 text-lg">No Images</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 bg-gradient-to-b from-black/30 to-transparent overflow-hidden rounded-t-2xl group">
      <img
        src={images[current]}
        alt="property"
        className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        ❯
      </button>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? "bg-orange-400 w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Property = () => {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    city: "",
    type: "",
    maxRent: "",
    furnished: "",
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Sidebar hover detection
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

  // Fetch my properties using new endpoint
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const token =
        localStorage.token ||
        localStorage.usertoken ||
        localStorage.landlordtoken ||
        localStorage.tenanttoken ||
        sessionStorage.token ||
        null;

      if (!token) {
        toast.error("Not authenticated. Please login.");
        setProperties([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${baseurl}api/v2/properties/my-properties`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          setProperties(response.data.data);
        } else {
          setProperties([]);
          toast.info("No properties found.");
        }
      } catch (err) {
        console.error("Fetch my-properties error:", err);
        toast.error(err.response?.data?.message || "Failed to load properties.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Scroll behavior for filter bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowFilters(false);
      } else {
        setShowFilters(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Delete property (assuming same endpoint structure — adjust if needed)
  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    setDeletingId(propertyId);
    const token =
      localStorage.token ||
      localStorage.usertoken ||
      localStorage.landlordtoken ||
      localStorage.tenanttoken ||
      sessionStorage.token ||
      null;

    if (!token) {
      toast.error("Not authenticated. Please login.");
      setDeletingId(null);
      return;
    }

    try {
      const response = await axios.delete(
        `${baseurl}api/v2/properties/${propertyId}`, // ← update if delete endpoint is different
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        setProperties((prev) => prev.filter((p) => p._id !== propertyId));
        toast.success("Property deleted successfully!");
      } else {
        toast.error("Failed to delete property.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Error deleting property.");
    } finally {
      setDeletingId(null);
    }
  };

  // Basic client-side filtering (you can expand later)
  const filteredProperties = properties.filter((prop) => {
    const location = prop.location || {};
    const price = prop.price || {};

    return (
      (!filters.city ||
        location.city?.toLowerCase().includes(filters.city.toLowerCase()) ||
        location.locality?.toLowerCase().includes(filters.city.toLowerCase())) &&
      (!filters.type || prop.propertyType === filters.type) &&
      (!filters.maxRent ||
        (price.amount && price.amount <= Number(filters.maxRent))) &&
      // furnished not present in your sample → skipping or adapt if added later
      true
    );
  });

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div
      className={`min-h-screen text-white transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `
          radial-gradient(circle at center bottom, rgba(245,124,0,0.35), transparent 60%),
          linear-gradient(180deg, rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)
        `,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold tracking-wide bg-gradient-to-r from-white to-white bg-clip-text text-transparent drop-shadow-lg">
            My Properties
          </h2>
          <p className="text-gray-400 text-base mt-2">
            Manage your listed properties
          </p>
        </motion.div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-20 h-20 border-6 border-white/20 border-t-orange-400 rounded-full"></div>
              <div className="absolute inset-0 w-20 h-20 border-6 border-white/20 border-t-indigo-400 rounded-full animate-spin [animation-delay:0.2s]"></div>
            </motion.div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 inline-block border border-white/20">
              <p className="text-2xl font-semibold text-gray-300 mb-4">
                No properties found
              </p>
              <p className="text-gray-400">
                {properties.length === 0
                  ? "You haven't listed any properties yet"
                  : "No matches for current filters"}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property, index) => {
              const loc = property.location || {};
              const priceInfo = property.price || {};
              const area = property.area || {};
              const images = property.images?.map((img) => img.url) || [];

              return (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col border border-white/20 shadow-xl hover:shadow-orange-500/30 transition-all duration-400 relative"
                >
                  <ImageSlider images={images} />

                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="text-xl font-bold text-white line-clamp-2">
                        {property.title || "Untitled Property"}
                      </h5>
                      <span className="bg-orange-600/80 text-white px-3 py-1 rounded-full text-xs font-medium shrink-0">
                        {property.propertyType || "—"} • {property.bhk || "?"} BHK
                      </span>
                    </div>

                    <div className="flex items-center text-gray-300 text-sm">
                      <FaMapMarkerAlt className="mr-2 text-orange-400 flex-shrink-0" />
                      <p className="truncate">
                        {loc.locality || loc.city || "—"}, {loc.city || loc.state || "—"}
                      </p>
                    </div>

                    {/* Price & Key Info */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl py-3 px-4 border border-white/20">
                        <FaRupeeSign className="mx-auto text-lg text-green-400 mb-1" />
                        <p className="text-xl font-bold text-white">
                          {priceInfo.amount ? `₹${priceInfo.amount}` : "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {priceInfo.per ? `/ ${priceInfo.per}` : "Rent"}
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-xl py-3 px-4 border border-white/20">
                        <FaHome className="mx-auto text-lg text-cyan-300 mb-1" />
                        <p className="text-xl font-bold text-white">
                          {area.carpet || area.builtUp || "—"} {area.unit || "sqft"}
                        </p>
                        <p className="text-xs text-gray-400">Area</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <Link
                        to={`/landlord/property/${property._id}`}
                        className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur-md text-white py-3 rounded-xl text-center hover:from-indigo-500 hover:to-purple-500 transition font-medium shadow-lg flex items-center justify-center"
                      >
                        <FaEye className="text-base" />
                      </Link>

                      <Link
                        to={`/landlord/property/edit/${property._id}`}
                        className="bg-gradient-to-r from-orange-600/80 to-amber-600/80 backdrop-blur-md text-white py-3 rounded-xl text-center hover:from-orange-500 hover:to-amber-500 transition font-medium shadow-lg flex items-center justify-center"
                      >
                        <FaEdit className="text-base" />
                      </Link>

                      <button
                        onClick={() => handleDelete(property._id)}
                        disabled={deletingId === property._id}
                        className={`bg-gradient-to-r from-red-600/80 to-rose-600/80 backdrop-blur-md text-white py-3 rounded-xl text-center hover:from-red-500 hover:to-rose-500 transition font-medium shadow-lg flex items-center justify-center ${
                          deletingId === property._id ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        {deletingId === property._id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <FaTrash className="text-base" />
                        )}
                      </button>
                    </div>

                    {/* Status badge */}
                    <div className="mt-2 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          property.status === "Active"
                            ? "bg-green-600/70"
                            : property.status === "Pending"
                            ? "bg-yellow-600/70"
                            : "bg-red-600/70"
                        }`}
                      >
                        {property.status || property.verificationStatus || "Unknown"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Property;