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
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl.js"; // Adjust path to your BaseUrl.js

// Image Slider Component
const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
      <img
        src={images[current]}
        alt="property"
        className="w-full h-48 object-cover transition-all duration-500"
      />
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
      >
        ❯
      </button>
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

  // Detect sidebar hover state
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

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login.");
        setProperties([]);
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${baseurl}api/landlord/properties`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        if (Array.isArray(data.properties)) {
          setProperties(data.properties);
        } else if (Array.isArray(data)) {
          setProperties(data);
        } else {
          setProperties([]);
          toast.error("No properties found.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to fetch properties.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Handle scroll for filter bar visibility
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

  // Delete property
  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;

    setDeletingId(propertyId);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated. Please login.");
      setDeletingId(null);
      return;
    }

    try {
      const response = await axios.delete(
        `${baseurl}api/landlord/properties/${propertyId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200 || response.status === 204) {
        setProperties((prev) => prev.filter((prop) => prop._id !== propertyId));
        toast.success("Property deleted successfully!");
      } else {
        toast.error("Failed to delete property.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting property.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter properties
  const filteredProperties = properties.filter((prop) => {
    return (
      (!filters.city ||
        prop.city?.toLowerCase().includes(filters.city.toLowerCase()) ||
        prop.name?.toLowerCase().includes(filters.city.toLowerCase())) &&
      (!filters.type || prop.type === filters.type) &&
      (!filters.maxRent ||
        (prop.rent && prop.rent <= Number(filters.maxRent))) &&
      (!filters.furnished || prop.furnished?.toString() === filters.furnished)
    );
  });

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div
      className={`px-2 py-4 md:px-20 min-h-screen text-white bg-white transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      {/* Filter Bar */}
      <div
        className={`top-0 z-50 bg-gradient-to-r from-blue-300/80 to-green-700/80 backdrop-blur-lg py-4 shadow-xl rounded-xl mb-6 border border-green-400 transition-transform duration-500 ${
          showFilters ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <h2 className="text-center text-2xl font-bold text-white mb-4">
          All Properties
        </h2>
        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 px-2 sm:px-4 text-white">
          <div>
            <label htmlFor="city" className="text-sm font-medium block mb-1">
              City / Title
            </label>
            <input
              type="text"
              id="city"
              value={filters.city}
              onChange={handleFilterChange}
              placeholder="Enter city or title"
              className="w-full border border-green-400 rounded-xl px-3 py-2 text-sm bg-white text-black"
            />
          </div>
          <div>
            <label htmlFor="type" className="text-sm font-medium block mb-1">
              Type
            </label>
            <select
              id="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full border border-green-400 rounded-xl px-3 py-2 text-sm bg-white text-black"
            >
              <option value="">All</option>
              <option value="PG">PG</option>
              <option value="Hostel">Hostel</option>
              <option value="Rental">Rental</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="1 RK">1 RK</option>
              <option value="Studio Apartment">Studio Apartment</option>
              <option value="Luxury Bungalows">Luxury Bungalows</option>
              <option value="Villas">Villas</option>
              <option value="Builder Floor">Builder Floor</option>
              <option value="Flat">Flat</option>
              <option value="Room">Room</option>
            </select>
          </div>
        </form>
      </div>

      {/* Property Cards */}
      {loading ? (
        <div className="text-center my-10">
          <div className="border-t-4 border-green-400 w-10 h-10 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center my-10">
          <p className="text-gray-400">No properties match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-fit">
          {filteredProperties.map((property) => (
            <motion.div
              key={property._id}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`bg-gradient-to-b from-blue-100 to-green-100 shadow-xl rounded-2xl overflow-hidden flex flex-col border ${
                !property.isActive ? "border-red-500" : "border-green-400"
              } flex-shrink-0 flex-grow-0 relative`}
            >
              {/* Deactivated Overlay */}
              {!property.isActive && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10 rounded-2xl">
                  <div className="text-center text-white">
                    <p className="text-2xl font-bold">Deactivated</p>
                    <p className="text-sm mt-1">This property is deactivated on admin side</p>
                  </div>
                </div>
              )}

              <ImageSlider images={property.images} />
              <div className="p-4 flex flex-col gap-2 text-sm text-black">
                <h5 className="font-semibold text-xl text-black">
                  {property.name}
                </h5>
                <p className="flex items-center text-gray-700">
                  <FaMapMarkerAlt className="mr-2 text-green-600" />
                  {property.address}, {property.city}
                  {property.state && `, ${property.state} ${property.pinCode}`}
                </p>
                <p className="flex items-center text-green-700">
                  <FaDoorOpen className="mr-2 animate-bounce" />
                  {property.totalRooms} Rooms
                  <FaBed className="ml-4 mr-2 animate-pulse" />
                  {property.totalBeds} Beds
                </p>
                <p className="text-gray-600">Type: {property.type}</p>

                {/* Action Buttons - Hidden if deactivated */}
                {property.isActive && (
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/landlord/property/${property._id}`}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-green-400 text-white px-3 py-2 rounded-lg text-sm text-center hover:opacity-90 flex items-center justify-center"
                    >
                      <FaEye className="mr-2 text-lg" />
                      <span className="hidden sm:inline">View Details</span>
                    </Link>
                    <Link
                      to={`/landlord/property/edit/${property._id}`}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-400 text-white px-4 py-2 rounded-lg text-sm text-center hover:opacity-90 flex items-center justify-center"
                    >
                      <FaEdit className="mr-2" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(property._id)}
                      disabled={deletingId === property._id}
                      className={`flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm text-center hover:bg-red-700 flex items-center justify-center ${
                        deletingId === property._id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {deletingId === property._id ? (
                        <span>Deleting...</span>
                      ) : (
                        <>
                          <FaTrash className="mr-2" />
                          <span className="hidden sm:inline">Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Property;