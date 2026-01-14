import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import axios from "axios";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  BedDouble,
  Bath,
  CarFront,
  MapPin,
  Search,
  Home,
  IndianRupee,
  ChevronDown,
} from "lucide-react";
import baseurl from "../../../../BaseUrl.js";

const PGHostelSection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  // New filter states
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");

  // Dropdown toggles
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 9;

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${baseurl}api/public/all-properties`);
        const pgHostels = (res.data.properties || []).filter(
          (p) =>
            (p.type?.toLowerCase() === "pg" ||
              p.type?.toLowerCase() === "hostel") &&
            p.isActive === true
        );

        setProperties(pgHostels);
        setFilteredProperties(pgHostels);
      } catch (error) {
        console.error("Error fetching PG & Hostel properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // UNIVERSAL FILTER FUNCTION (search + type + budget)
  useEffect(() => {
    let q = searchQuery.toLowerCase().trim();
    let minPrice = 0;
    let maxPrice = Infinity;
    let textQuery = q;

    const singlePriceMatch = q.match(/\b(\d+)\b/);
    const priceRangeMatch = q.match(/(\d+)-(\d+)/);

    if (priceRangeMatch) {
      minPrice = parseFloat(priceRangeMatch[1]);
      maxPrice = parseFloat(priceRangeMatch[2]);
      textQuery = q.replace(priceRangeMatch[0], "").trim();
    } else if (singlePriceMatch) {
      minPrice = parseFloat(singlePriceMatch[1]);
      maxPrice = minPrice + 1000;
      textQuery = q.replace(singlePriceMatch[0], "").trim();
    }

    let filtered = properties.filter((property) => {
      const price = parseFloat(property.lowestPrice) || 0;

      const matchesPrice = price >= minPrice && price <= maxPrice;

      const matchesText =
        !textQuery ||
        property.name?.toLowerCase().includes(textQuery) ||
        property.type?.toLowerCase().includes(textQuery) ||
        property.location?.city?.toLowerCase().includes(textQuery) ||
        property.location?.area?.toLowerCase().includes(textQuery) ||
        property.location?.state?.toLowerCase().includes(textQuery);

      const matchesType =
        !selectedType ||
        property.type?.toLowerCase() === selectedType.toLowerCase();

      const matchesBudget =
        !selectedBudget ||
        (selectedBudget === "Under 5000" && price <= 5000) ||
        (selectedBudget === "5000-8000" &&
          price >= 5000 &&
          price <= 8000) ||
        (selectedBudget === "8000-12000" &&
          price >= 8000 &&
          price <= 12000) ||
        (selectedBudget === "Above 12000" && price >= 12000);

      return matchesPrice && matchesText && matchesType && matchesBudget;
    });

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedBudget, properties]);

  // Handle Search button + Enter key
  const handleSearch = () => {
    // Clean up the query (removes extra spaces) and trigger filter
    setSearchQuery((prev) => prev.trim());
  };

  const handlePropertyClick = (id) => {
    if (isAuthenticated) navigate(`/property/${id}`);
    else navigate("/login", { state: { from: `/property/${id}` } });
  };

  // Pagination
  const indexOfLast = currentPage * propertiesPerPage;
  const indexOfFirst = indexOfLast - propertiesPerPage;
  const currentProperties = filteredProperties.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    filteredProperties.length / propertiesPerPage
  );

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-amber-50/50 to-white min-h-screen">
<div className="text-center mb-8">
  <div className="inline-flex flex-wrap justify-center gap-4 sm:gap-6">
    
    {/* Rent Button */}
    <button className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-br from-[#0b4f91] via-[#0c2344] to-[#1565c0] text-white shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:scale-110 hover:-translate-y-1 active:scale-95 min-w-[120px] overflow-hidden">
      <span className="relative z-10 flex items-center justify-center gap-2">
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        Rent
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </button>

    {/* Sale Button */}
    <button className="group relative px-8 py-4 rounded-2xl font-semibold text-lg  bg-gradient-to-br from-[#0b4f91] via-[#0c2344] to-[#1565c0] text-white shadow-2xl hover:shadow-blue-600/40 transition-all duration-500 hover:scale-110 hover:-translate-y-1 active:scale-95 min-w-[120px] overflow-hidden">
      <span className="relative z-10 flex items-center justify-center gap-2">
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Sale
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </button>

    {/* Rooms Button */}
    <button className="group relative px-8 py-4 rounded-2xl font-semibold text-lg  bg-gradient-to-br from-[#0b4f91] via-[#0c2344] to-[#1565c0] text-white shadow-2xl hover:shadow-blue-700/40 transition-all duration-500 hover:scale-110 hover:-translate-y-1 active:scale-95 min-w-[120px] overflow-hidden">
      <span className="relative z-10 flex items-center justify-center gap-2">
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
        </svg>
        Rooms
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </button>

    {/* PG Button - Subtle orange accent */}
    <button className="group relative px-8 py-4 rounded-2xl font-semibold text-lg  bg-gradient-to-br from-[#0b4f91] via-[#0c2344] to-[#1565c0] text-white shadow-2xl hover:shadow-[#0c2344]/40 transition-all duration-500 hover:scale-110 hover:-translate-y-1 active:scale-95 min-w-[120px] overflow-hidden">
      <span className="relative z-10 flex items-center justify-center gap-2">
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        PG
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </button>

    {/* Hostels Button */}
    <button className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-br from-[#0b4f91] via-[#0c2344] to-[#1565c0] text-white shadow-2xl hover:shadow-blue-800/40 transition-all duration-500 hover:scale-110 hover:-translate-y-1 active:scale-95 min-w-[120px] overflow-hidden">
      <span className="relative z-10 flex items-center justify-center gap-2">
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
        Hostels
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </button>

  </div>
</div>
      {/* Header */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">
          <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
            Affordable Rooms, PG & Property
          </span>
        </h2>

        <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600 px-2">
          Find comfortable stays with great amenities in top locations
        </p>
      </motion.div> */}

      {/* Search + Filters */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col md:flex-row items-center gap-4">

          {/* Location Search */}
          <div className="flex-1 relative w-full">
            <MapPin
              className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by city, area, project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 text-gray-700 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-gray-300" />

          {/* Filter Buttons */}
          <div className="relative">
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-4 rounded-xl border border-gray-200 hover:border-orange-400 text-gray-700 text-sm sm:text-base"
            >
              <Home size={18} />
              {selectedType || "Property Type"}
              <ChevronDown size={18} />
            </button>

            {showTypeDropdown && (
              <div className="absolute z-50 mt-2 w-40 bg-white shadow-md rounded-lg border p-2">
                {["PG", "Hostel"].map((t) => (
                  <p
                    key={t}
                    onClick={() => {
                      setSelectedType(t);
                      setShowTypeDropdown(false);
                    }}
                    className="p-2 cursor-pointer hover:bg-orange-50 rounded-md"
                  >
                    {t}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Budget Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
              className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-4 rounded-xl border border-gray-200 hover:border-orange-400 text-gray-700 text-sm sm:text-base"
            >
              <IndianRupee size={18} />
              {selectedBudget || "Budget Range"}
              <ChevronDown size={18} />
            </button>

            {showBudgetDropdown && (
              <div className="absolute z-50 mt-2 w-48 bg-white shadow-md rounded-lg border p-2">
                {[
                  "Under 5000",
                  "5000-8000",
                  "8000-12000",
                  "Above 12000",
                ].map((b) => (
                  <p
                    key={b}
                    onClick={() => {
                      setSelectedBudget(b);
                      setShowBudgetDropdown(false);
                    }}
                    className="p-2 cursor-pointer hover:bg-orange-50 rounded-md"
                  >
                    {b}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Working Search Button */}
          {/* <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 transition-all active:scale-95"
          >
            <Search size={20} />
            Search
          </button> */}
        </div>
      </div>

      {/* Property Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProperties.length === 0 ? (
        <p className="text-center text-gray-500 py-20 text-lg sm:text-xl">
          No PG/Hostel found matching your filters.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {currentProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                onClick={() => handlePropertyClick(property.id)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500"
              >
                <div className="relative">
                  <img
                    src={
                      property.images?.[0] ||
                      "https://via.placeholder.com/400x300"
                    }
                    alt={property.name}
                    className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  <div className="absolute top-4 left-4 bg-orange-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                    ₹{property.lowestPrice}/mo
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {property.name}
                  </h3>

                  <div className="flex items-center text-gray-600 mt-2">
                    <MapPin size={18} className="text-orange-500 mr-1" />
                    <span className="text-sm">
                      {property?.location?.city}, {property?.location?.area}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-5 text-center text-gray-700">
                    <div>
                      <BedDouble size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">
                        {property.totalBeds || "N/A"} Beds
                      </p>
                    </div>

                    <div>
                      <Bath size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">
                        {property.totalRooms || "N/A"} Baths
                      </p>
                    </div>

                    <div>
                      <CarFront size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">Parking</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-medium text-orange-600 uppercase tracking-wider">
                    {property.type}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-3 flex-wrap">
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                className="px-6 py-3 bg-white border border-orange-500 text-orange-600 rounded-xl disabled:opacity-50 hover:bg-orange-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-5 py-3 rounded-xl ${
                    currentPage === i + 1
                      ? "bg-orange-600 text-white"
                      : "bg-white border border-orange-300 text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-white border border-orange-500 text-orange-600 rounded-xl disabled:opacity-50 hover:bg-orange-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default PGHostelSection;