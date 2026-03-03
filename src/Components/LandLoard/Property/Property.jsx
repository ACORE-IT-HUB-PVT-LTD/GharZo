import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaRupeeSign,
  FaTrash,
  FaEdit,
  FaEye,
  FaHome,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl.js";

const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-slate-100 flex items-center justify-center rounded-t-2xl">
        <span className="text-slate-500 text-lg">No Images</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-t-2xl group bg-slate-100">
      <img
        src={images[current]}
        alt="property"
        className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 text-slate-700 p-2 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100"
      >
        &#10094;
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 text-slate-700 p-2 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100"
      >
        &#10095;
      </button>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === current ? "bg-orange-500 w-6" : "bg-white/70 w-1.5"}`}
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

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return undefined;

    const handleMouseEnter = () => setIsSidebarHovered(true);
    const handleMouseLeave = () => setIsSidebarHovered(false);

    sidebar.addEventListener("mouseenter", handleMouseEnter);
    sidebar.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      sidebar.removeEventListener("mouseenter", handleMouseEnter);
      sidebar.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

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
        const response = await axios.get(`${baseurl}api/v2/properties/my-properties`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
      const response = await axios.delete(`${baseurl}api/v2/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const filteredProperties = properties.filter((prop) => {
    const location = prop.location || {};
    const price = prop.price || {};

    return (
      (!filters.city ||
        location.city?.toLowerCase().includes(filters.city.toLowerCase()) ||
        location.locality?.toLowerCase().includes(filters.city.toLowerCase())) &&
      (!filters.type || prop.propertyType === filters.type) &&
      (!filters.maxRent || (price.amount && price.amount <= Number(filters.maxRent))) &&
      true
    );
  });

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background:
          "radial-gradient(circle at 10% 10%, rgba(245,124,0,0.08), transparent 32%), radial-gradient(circle at 90% 85%, rgba(13,47,82,0.08), transparent 35%), #f8fafc",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-wide text-[#0d2f52]">My Properties</h2>
          <p className="text-slate-500 text-base mt-2">Manage your listed properties</p>
        </motion.div>

        {showFilters && (
          <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                id="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="City / Locality"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
              <input
                id="type"
                value={filters.type}
                onChange={handleFilterChange}
                placeholder="Property Type"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
              <input
                id="maxRent"
                type="number"
                value={filters.maxRent}
                onChange={handleFilterChange}
                placeholder="Max Rent"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
              <button
                onClick={() => setFilters({ city: "", type: "", maxRent: "", furnished: "" })}
                className="rounded-xl bg-[#0d2f52] text-white px-4 py-2.5 hover:bg-[#123d67] transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full"
            />
          </div>
        ) : filteredProperties.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="bg-white rounded-2xl p-8 inline-block border border-slate-200 shadow-sm">
              <p className="text-2xl font-semibold text-[#0d2f52] mb-4">No properties found</p>
              <p className="text-slate-500">
                {properties.length === 0 ? "You haven't listed any properties yet" : "No matches for current filters"}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
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
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <ImageSlider images={images} />

                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="text-xl font-bold text-[#0d2f52] line-clamp-2">{property.title || "Untitled Property"}</h5>
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium shrink-0">
                        {property.propertyType || "-"} • {property.bhk || "?"} BHK
                      </span>
                    </div>

                    <div className="flex items-center text-slate-600 text-sm">
                      <FaMapMarkerAlt className="mr-2 text-orange-500 flex-shrink-0" />
                      <p className="truncate">{loc.locality || loc.city || "-"}, {loc.city || loc.state || "-"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-50 rounded-xl py-3 px-4 border border-slate-200">
                        <FaRupeeSign className="mx-auto text-lg text-orange-500 mb-1" />
                        <p className="text-xl font-bold text-[#0d2f52]">{priceInfo.amount ? `Rs ${priceInfo.amount}` : "-"}</p>
                        <p className="text-xs text-slate-500">{priceInfo.per ? `/ ${priceInfo.per}` : "Rent"}</p>
                      </div>

                      <div className="bg-slate-50 rounded-xl py-3 px-4 border border-slate-200">
                        <FaHome className="mx-auto text-lg text-[#0d2f52] mb-1" />
                        <p className="text-xl font-bold text-[#0d2f52]">{area.carpet || area.builtUp || "-"} {area.unit || "sqft"}</p>
                        <p className="text-xs text-slate-500">Area</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <Link
                        to={`/landlord/property/${property._id}`}
                        className="bg-[#0d2f52] text-white py-3 rounded-xl text-center hover:bg-[#123d67] transition shadow-sm flex items-center justify-center"
                      >
                        <FaEye className="text-base" />
                      </Link>

                      <Link
                        to={`/landlord/property/edit/${property._id}`}
                        className="bg-orange-500 text-white py-3 rounded-xl text-center hover:bg-orange-600 transition shadow-sm flex items-center justify-center"
                      >
                        <FaEdit className="text-base" />
                      </Link>

                      <button
                        onClick={() => handleDelete(property._id)}
                        disabled={deletingId === property._id}
                        className={`bg-red-500 text-white py-3 rounded-xl text-center hover:bg-red-600 transition shadow-sm flex items-center justify-center ${
                          deletingId === property._id ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        {deletingId === property._id ? <span className="text-xs">...</span> : <FaTrash className="text-base" />}
                      </button>
                    </div>

                    <div className="mt-1 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          property.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : property.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
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
