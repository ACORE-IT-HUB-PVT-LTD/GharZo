import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BedDouble, Bath, CarFront, MapPin, Home,
  Plus, ArrowLeft, X, RotateCcw, ChevronDown, Search,
} from "lucide-react";
import baseurl from "../../../../BaseUrl";

// ─── Inline FilterBar (same design as AllProperty) ───────────────────────────
function FilterBar({
  searchTerm, setSearchTerm,
  listingType, setListingType,
  propertyType, setPropertyType,
  minBudget, setMinBudget,
  maxBudget, setMaxBudget,
  bhk, setBhk,
  selectedCity, setSelectedCity,
  availableCities,
  availablePropertyTypes,
  onReset,
}) {
  const [activeFilter, setActiveFilter] = useState(null);
  const dropdownRef = useRef(null);
  const bhkOptions = ["1", "2", "3", "4", "5+"];

  const toggleFilter = (f) => setActiveFilter((p) => (p === f ? null : f));

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setActiveFilter(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleBhk = (val) =>
    setBhk((prev) =>
      prev.includes(val) ? prev.filter((b) => b !== val) : [...prev, val]
    );

  const budgetLabel =
    minBudget || maxBudget
      ? `₹${minBudget || "0"} – ₹${maxBudget || "∞"}`
      : "Budget";

  const moreCount = [propertyType !== "", bhk.length > 0].filter(Boolean).length;

  return (
    <div
      ref={dropdownRef}
      className="w-full bg-white shadow-md border-b sticky top-0 z-50 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          {/* Buy / Rent Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
            <button
              onClick={() => setListingType(listingType === "Sale" ? "" : "Sale")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                listingType === "Sale"
                  ? "bg-[#002f6c] text-white"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setListingType(listingType === "Rent" ? "" : "Rent")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                listingType === "Rent"
                  ? "bg-[#002f6c] text-white"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Rent
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[160px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, city or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f15a24] border-slate-200 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">

            {/* City */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("city")}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === "city" || selectedCity
                    ? "border-[#f15a24] text-[#f15a24] bg-orange-50"
                    : "hover:border-slate-400"
                }`}
              >
                {selectedCity || "City"}
                {selectedCity && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setSelectedCity(""); }}
                    className="ml-0.5 hover:text-red-500"
                  >
                    <X size={12} />
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              {activeFilter === "city" && (
                <div className="absolute top-12 left-0 w-56 bg-white shadow-xl border rounded-lg p-3 z-50 max-h-60 overflow-y-auto">
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Available Cities
                  </p>
                  {availableCities.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">Loading cities...</p>
                  )}
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => { setSelectedCity(city); setActiveFilter(null); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCity === city
                          ? "bg-orange-50 text-[#f15a24] font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-[#f15a24]"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("budget")}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === "budget" || minBudget || maxBudget
                    ? "border-[#f15a24] text-[#f15a24] bg-orange-50"
                    : "hover:border-slate-400"
                }`}
              >
                {budgetLabel}
                <ChevronDown size={14} />
              </button>
              {activeFilter === "budget" && (
                <div className="absolute top-12 left-0 w-72 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">Budget Range (₹)</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      className="w-full border p-2 rounded text-sm focus:border-[#f15a24] outline-none"
                    />
                    <span className="text-slate-400 text-sm flex-shrink-0">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full border p-2 rounded text-sm focus:border-[#f15a24] outline-none"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => { setMinBudget(""); setMaxBudget(""); }}
                      className="text-sm text-slate-500 underline"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setActiveFilter(null)}
                      className="bg-[#f15a24] text-white px-4 py-1.5 rounded-md text-sm font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BHK */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("bhk")}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === "bhk" || bhk.length > 0
                    ? "border-[#f15a24] text-[#f15a24] bg-orange-50"
                    : "hover:border-slate-400"
                }`}
              >
                BHK
                {bhk.length > 0 && (
                  <span className="bg-[#f15a24] text-white text-[10px] px-1.5 rounded-full">
                    {bhk.length}
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              {activeFilter === "bhk" && (
                <div className="absolute top-12 left-0 w-60 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">Select BHK</p>
                  <div className="flex flex-wrap gap-2">
                    {bhkOptions.map((b) => (
                      <button
                        key={b}
                        onClick={() => toggleBhk(b)}
                        className={`px-3 py-1.5 border rounded-full text-sm font-medium transition-all ${
                          bhk.includes(b)
                            ? "border-[#f15a24] text-[#f15a24] bg-orange-50"
                            : "hover:border-[#f15a24] hover:text-[#f15a24]"
                        }`}
                      >
                        {b} BHK
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="mt-4 w-full bg-[#f15a24] text-white py-1.5 rounded-md text-sm font-semibold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* More Filters — Property Type */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("more")}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === "more" || moreCount > 0
                    ? "border-[#f15a24] text-[#f15a24] bg-orange-50"
                    : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                More Filters
                {moreCount > 0 && (
                  <span className="bg-[#f15a24] text-white text-[10px] px-1.5 rounded-full ml-1">
                    {moreCount}
                  </span>
                )}
              </button>
              {activeFilter === "more" && (
                <div className="absolute top-12 right-0 sm:left-0 w-72 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">Property Type</p>
                  {availablePropertyTypes.length === 0 && (
                    <p className="text-xs text-gray-400 mb-3">Loading...</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {availablePropertyTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setPropertyType((prev) => (prev === type ? "" : type))
                        }
                        className={`px-3 py-2 border rounded-lg text-xs font-medium text-left transition-all ${
                          propertyType === type
                            ? "border-[#f15a24] text-[#f15a24] bg-orange-50"
                            : "hover:border-[#f15a24] hover:text-[#f15a24]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="mt-4 w-full bg-[#f15a24] text-white py-1.5 rounded-md text-sm font-semibold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main RentListingPage ─────────────────────────────────────────────────────
const RentListingPage = () => {
  const navigate = useNavigate();
  const user = null; // replace with your auth state

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const propertiesPerPage = 9;

  // Dynamic filter options from API
  const [availableCities, setAvailableCities] = useState([]);
  const [availablePropertyTypes, setAvailablePropertyTypes] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [listingType, setListingType] = useState("Rent"); // default Rent
  const [propertyType, setPropertyType] = useState("");   // "Flat" | "Room" etc.
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [bhk, setBhk] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, listingType, propertyType, minBudget, maxBudget, bhk, selectedCity]);

  // Fetch from API with all filters as query params
  useEffect(() => {
    const controller = new AbortController();

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("limit", propertiesPerPage);

        // ✅ "Rent" / "Sale" — exact Title Case
        if (listingType) params.append("listingType", listingType);

        // ✅ Exact property type string from API
        if (propertyType) params.append("propertyType", propertyType);

        if (debouncedSearch) params.append("search", debouncedSearch);
        if (minBudget) params.append("minPrice", minBudget);
        if (maxBudget) params.append("maxPrice", maxBudget);

        // ✅ BHK — comma separated, "5+" → "5"
        if (bhk.length > 0) {
          params.append("bhk", bhk.map((b) => (b === "5+" ? "5" : b)).join(","));
        }

        // ✅ City — exact string from API
        if (selectedCity) params.append("city", selectedCity);

        const url = `${baseurl}api/public/properties?${params.toString()}`;
        const res = await fetch(url, { signal: controller.signal, cache: "no-cache" });
        const data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          const formatted = data.data.map((item) => ({
            id: item._id,
            name: item.title || "Untitled Property",
            image:
              item.images?.find((i) => i.isPrimary)?.url ||
              item.images?.[0]?.url ||
              "",
            price: item.price?.amount || 0,
            listingType: item.listingType || "",
            location: {
              city: item.location?.city || "",
              locality: item.location?.locality || "",
              state: item.location?.state || "",
            },
            bedrooms: item.bhk || 0,
            bathrooms: item.bathrooms || 0,
            area: item.area?.carpet || "",
            areaUnit: item.area?.unit || "sqft",
            type: item.propertyType || "",
            furnishing: item.furnishing?.type || "",
            verified: item.verificationStatus === "Verified",
          }));

          setProperties(formatted);
          setTotalCount(data.total || formatted.length);
          setTotalPages(
            data.totalPages ||
              Math.ceil((data.total || formatted.length) / propertiesPerPage)
          );

          // ✅ Dynamic filter options from API response
          if (data.filters?.availableCities) {
            setAvailableCities(data.filters.availableCities.filter(Boolean).sort());
          }
          if (data.filters?.availablePropertyTypes) {
            setAvailablePropertyTypes(
              data.filters.availablePropertyTypes.filter(Boolean).sort()
            );
          }
        } else {
          setProperties([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Fetch error:", err);
        setProperties([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    return () => controller.abort();
  }, [debouncedSearch, listingType, propertyType, minBudget, maxBudget, bhk, selectedCity, currentPage]);

  const handleReset = () => {
    setSearchTerm("");
    setListingType("Rent");
    setPropertyType("");
    setMinBudget("");
    setMaxBudget("");
    setBhk([]);
    setSelectedCity("");
  };

  const hasActiveFilters =
    propertyType || minBudget || maxBudget || bhk.length > 0 || selectedCity;

  const pageTitle = listingType === "Sale" ? "Buy" : listingType || "All";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">

      {/* Sticky FilterBar */}
      <FilterBar
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        listingType={listingType} setListingType={setListingType}
        propertyType={propertyType} setPropertyType={setPropertyType}
        minBudget={minBudget} setMinBudget={setMinBudget}
        maxBudget={maxBudget} setMaxBudget={setMaxBudget}
        bhk={bhk} setBhk={setBhk}
        selectedCity={selectedCity} setSelectedCity={setSelectedCity}
        availableCities={availableCities}
        availablePropertyTypes={availablePropertyTypes}
        onReset={handleReset}
      />

      <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-10">

        {/* Back + Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
                Properties for {pageTitle}
              </span>
            </h2>
            <p className="mt-1 text-gray-500 text-sm">
              {loading
                ? "Loading..."
                : `${totalCount} propert${totalCount === 1 ? "y" : "ies"} found`}
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(user ? "/add-listing" : "/login")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
          >
            <Plus size={18} />
            Add Your Property
          </motion.button>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Active Filters:
            </span>
            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#002f6c] text-white rounded-full text-xs font-medium">
                📍 {selectedCity}
                <button onClick={() => setSelectedCity("")}><X size={11} /></button>
              </span>
            )}
            {propertyType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#f15a24] text-white rounded-full text-xs font-medium">
                🏠 {propertyType}
                <button onClick={() => setPropertyType("")}><X size={11} /></button>
              </span>
            )}
            {(minBudget || maxBudget) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#f15a24] text-white rounded-full text-xs font-medium">
                💰 ₹{minBudget || "0"} – ₹{maxBudget || "∞"}
                <button onClick={() => { setMinBudget(""); setMaxBudget(""); }}><X size={11} /></button>
              </span>
            )}
            {bhk.map((b) => (
              <span key={b} className="inline-flex items-center gap-1 px-3 py-1 bg-[#f15a24] text-white rounded-full text-xs font-medium">
                {b} BHK
                <button onClick={() => setBhk((prev) => prev.filter((x) => x !== b))}><X size={11} /></button>
              </span>
            ))}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-300 transition-all"
            >
              <RotateCcw size={11} /> Clear All
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {Array.from({ length: propertiesPerPage }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-60 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Properties */}
        {!loading && properties.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Home size={64} className="text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-6">
              No properties match your search criteria. Try adjusting the filters.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Property Cards */}
        {!loading && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => navigate(`/property/${property.id}`)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden bg-gray-100">
                  <img
                    src={
                      property.image ||
                      "https://via.placeholder.com/800x600?text=No+Image"
                    }
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Price */}
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-full font-semibold text-sm shadow-lg">
                    ₹{(property.price || 0).toLocaleString("en-IN")}
                    {property.listingType === "Rent" && (
                      <span className="text-blue-200 text-xs ml-1">/mo</span>
                    )}
                  </div>
                  {/* Listing type badge */}
                  {property.listingType && (
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                        property.listingType === "Rent"
                          ? "bg-blue-100 text-blue-700"
                          : property.listingType === "Sale"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {property.listingType === "Sale" ? "Buy" : property.listingType}
                    </div>
                  )}
                  {/* Verified */}
                  {property.verified && (
                    <div className="absolute bottom-4 right-4 bg-green-500 text-white px-2.5 py-1 rounded-full font-semibold text-xs shadow-lg">
                      ✓ Verified
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {property.name}
                  </h3>

                  <div className="flex items-center text-gray-500 mt-1.5">
                    <MapPin size={14} className="text-orange-500 mr-1 flex-shrink-0" />
                    <span className="text-xs line-clamp-1">
                      {[property.location.locality, property.location.city, property.location.state]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-4 text-center text-gray-600">
                    <div className="flex flex-col items-center">
                      <BedDouble size={18} className="text-orange-500" />
                      <p className="text-xs mt-1">
                        {property.bedrooms > 0 ? `${property.bedrooms} BHK` : "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Bath size={18} className="text-orange-500" />
                      <p className="text-xs mt-1">
                        {property.bathrooms > 0 ? `${property.bathrooms} Bath` : "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Home size={18} className="text-orange-500" />
                      <p className="text-xs mt-1">
                        {property.area ? `${property.area} ${property.areaUnit}` : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      {property.type || "Property"}
                    </p>
                    {property.furnishing && property.furnishing !== "Unfurnished" && (
                      <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100 font-medium">
                        {property.furnishing}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-10 gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-5 py-2.5 bg-white border border-blue-400 text-blue-600 rounded-xl disabled:opacity-40 hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white border border-blue-300 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-5 py-2.5 bg-white border border-blue-400 text-blue-600 rounded-xl disabled:opacity-40 hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentListingPage;