import React, { useEffect, useState, useRef } from "react";
import { BedDouble, MapPin, Home, RotateCcw, ArrowLeft, ChevronDown, X, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { motion } from "framer-motion";
import baseurl from "../../../../BaseUrl";

// ─── FilterBar ────────────────────────────────────────────────────────────────
function FilterBar({
  searchTerm, setSearchTerm,
  purpose, setPurpose,
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

  const toggleFilter = (filter) => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleBhk = (val) => {
    setBhk((prev) =>
      prev.includes(val) ? prev.filter((b) => b !== val) : [...prev, val]
    );
  };

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

          {/* Buy / Rent Toggle — sends "Sale" / "Rent" to API */}
          <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
            <button
              onClick={() => setPurpose(purpose === "Sale" ? "" : "Sale")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                purpose === "Sale"
                  ? "bg-[#002f6c] text-white"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setPurpose(purpose === "Rent" ? "" : "Rent")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                purpose === "Rent"
                  ? "bg-[#002f6c] text-white"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Rent
            </button>
          </div>

          {/* Search Input */}
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

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">

            {/* City — populated from API filters.availableCities */}
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
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Available Cities</p>
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

            {/* More Filters — Property Type from API */}
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
                    <p className="text-xs text-gray-400 mb-3">Loading types...</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {availablePropertyTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setPropertyType((prev) => prev === type ? "" : type)}
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

// ─── Main AllProperty ─────────────────────────────────────────────────────────
function AllProperty() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const propertiesPerPage = 9;

  // Dynamic options from API response
  const [availableCities, setAvailableCities] = useState([]);
  const [availablePropertyTypes, setAvailablePropertyTypes] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [purpose, setPurpose] = useState("");        // "Sale" | "Rent" | "" — exact API value
  const [propertyType, setPropertyType] = useState(""); // "Flat" | "Room" | "Villa" etc. — exact API value
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [bhk, setBhk] = useState([]);              // ["1","2","3"]
  const [selectedCity, setSelectedCity] = useState(""); // exact city string from API

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, purpose, propertyType, minBudget, maxBudget, bhk, selectedCity]);

  // Fetch
  useEffect(() => {
    const controller = new AbortController();

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("limit", propertiesPerPage);

        if (debouncedSearch) params.append("search", debouncedSearch);

        // ✅ Title Case — "Rent" / "Sale" (not "rent"/"buy")
        if (purpose) params.append("listingType", purpose);

        // ✅ Exact property type from API — "Flat", "Room", "Villa" etc.
        if (propertyType) params.append("propertyType", propertyType);

        if (minBudget) params.append("minPrice", minBudget);
        if (maxBudget) params.append("maxPrice", maxBudget);

        // ✅ BHK — comma separated, "5+" → "5"
        if (bhk.length > 0) {
          const bhkNums = bhk.map((b) => (b === "5+" ? "5" : b));
          params.append("bhk", bhkNums.join(","));
        }

        // ✅ City — exact string from API availableCities
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
            address: item.location?.address || "",
            city: item.location?.city || "",
            locality: item.location?.locality || "",
            state: item.location?.state || "",
            price: item.price?.amount || 0,
            listingType: item.listingType || "",
            bhk: item.bhk || 0,
            bathrooms: item.bathrooms || 0,
            area: item.area?.carpet || "",
            areaUnit: item.area?.unit || "sqft",
            propertyType: item.propertyType || "",
            furnishing: item.furnishing?.type || "",
          }));

          setProperties(formatted);
          setTotalCount(data.total || formatted.length);
          setTotalPages(
            data.totalPages ||
              Math.ceil((data.total || formatted.length) / propertiesPerPage)
          );

          // ✅ Update filter options from API — so they always match what's in DB
          if (data.filters?.availableCities) {
            setAvailableCities(
              data.filters.availableCities.filter(Boolean).sort()
            );
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
  }, [debouncedSearch, purpose, propertyType, minBudget, maxBudget, bhk, selectedCity, currentPage]);

  const handleReset = () => {
    setSearchTerm("");
    setPurpose("");
    setPropertyType("");
    setMinBudget("");
    setMaxBudget("");
    setBhk([]);
    setSelectedCity("");
  };

  const hasActiveFilters =
    purpose || propertyType || minBudget || maxBudget || bhk.length > 0 || selectedCity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">

      {/* Sticky FilterBar */}
      <FilterBar
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        purpose={purpose} setPurpose={setPurpose}
        propertyType={propertyType} setPropertyType={setPropertyType}
        minBudget={minBudget} setMinBudget={setMinBudget}
        maxBudget={maxBudget} setMaxBudget={setMaxBudget}
        bhk={bhk} setBhk={setBhk}
        selectedCity={selectedCity} setSelectedCity={setSelectedCity}
        availableCities={availableCities}
        availablePropertyTypes={availablePropertyTypes}
        onReset={handleReset}
      />

      {/* Back + Hero */}
      <div className="bg-gradient-to-r from-[#002B5C] via-[#003A75] to-[#002B5C]">
        <div className="max-w-7xl mx-auto px-4 pt-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <div className="relative py-12 px-4 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative max-w-7xl mx-auto text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              Discover Your Perfect Home
            </h1>
            <p className="text-blue-200 text-base sm:text-lg">
              {loading
                ? "Loading..."
                : `${totalCount} propert${totalCount === 1 ? "y" : "ies"} found`}
              {(purpose || selectedCity || propertyType) && !loading && (
                <span className="ml-2 text-orange-300 text-sm">
                  · {[purpose === "Sale" ? "Buy" : purpose, selectedCity, propertyType]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="max-w-7xl mx-auto px-4 pt-4 flex flex-wrap gap-2">
          {purpose && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#002f6c] text-white rounded-full text-xs font-medium">
              {purpose === "Sale" ? "Buy" : "Rent"}
              <button onClick={() => setPurpose("")}><X size={11} /></button>
            </span>
          )}
          {selectedCity && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#002f6c] text-white rounded-full text-xs font-medium">
              📍 {selectedCity}
              <button onClick={() => setSelectedCity("")}><X size={11} /></button>
            </span>
          )}
          {propertyType && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f15a24] text-white rounded-full text-xs font-medium">
              🏠 {propertyType}
              <button onClick={() => setPropertyType("")}><X size={11} /></button>
            </span>
          )}
          {(minBudget || maxBudget) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f15a24] text-white rounded-full text-xs font-medium">
              💰 ₹{minBudget || "0"} – ₹{maxBudget || "∞"}
              <button onClick={() => { setMinBudget(""); setMaxBudget(""); }}><X size={11} /></button>
            </span>
          )}
          {bhk.map((b) => (
            <span key={b} className="flex items-center gap-1.5 px-3 py-1 bg-[#f15a24] text-white rounded-full text-xs font-medium">
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

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-14 h-14 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters to see more results</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Link to={`/property/${property.id}`}>
                    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 h-full flex flex-col">

                      {/* Image */}
                      <div className="relative w-full h-52 overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={
                            property.image ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCQILdjI6IvkmXukmIVc7iLEkoa_lt8vcUOyoE8SMWJebAiB_NUaWD_j-4m7Wls1v-fqk&usqp=CAU"
                          }
                          alt={property.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Property Type */}
                        {property.propertyType && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-[#002B5C] shadow">
                            {property.propertyType}
                          </div>
                        )}

                        {/* Listing Type */}
                        {property.listingType && (
                          <div
                            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold shadow ${
                              property.listingType === "Rent"
                                ? "bg-blue-600 text-white"
                                : property.listingType === "Sale"
                                ? "bg-[#f15a24] text-white"
                                : "bg-purple-600 text-white"
                            }`}
                          >
                            {property.listingType === "Sale" ? "Buy" : property.listingType}
                          </div>
                        )}

                        {/* Price */}
                        {property.price > 0 && (
                          <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                            <span className="text-white font-bold text-sm">
                              ₹{property.price.toLocaleString("en-IN")}
                            </span>
                            {property.listingType === "Rent" && (
                              <span className="text-gray-300 text-xs ml-1">/mo</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1">
                        <h2 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-[#FF6B00] transition-colors line-clamp-1">
                          {property.name}
                        </h2>

                        <div className="flex items-start gap-1.5 text-gray-500 mb-3">
                          <MapPin size={13} className="mt-0.5 text-[#FF6B00] flex-shrink-0" />
                          <p className="text-xs line-clamp-1">
                            {[property.locality, property.city, property.state]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-auto flex-wrap">
                          {property.bhk > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <BedDouble size={15} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 leading-none">BHK</p>
                                <p className="text-sm font-bold text-gray-900">{property.bhk}</p>
                              </div>
                            </div>
                          )}
                          {property.area && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                <Home size={15} className="text-orange-600" />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 leading-none">Area</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {property.area} {property.areaUnit}
                                </p>
                              </div>
                            </div>
                          )}
                          {property.furnishing && property.furnishing !== "Unfurnished" && (
                            <span className="ml-auto text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium border border-green-100">
                              {property.furnishing}
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <div className="w-full py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white text-center rounded-xl font-semibold text-sm">
                            View Details
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 border-2 border-[#FF6B00]/0 group-hover:border-[#FF6B00]/30 rounded-2xl transition-all duration-300 pointer-events-none" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center items-center mt-10 gap-2 flex-wrap"
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all text-sm"
                >
                  Previous
                </button>

                <div className="flex gap-1.5 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-full font-semibold transition-all text-sm ${
                        currentPage === i + 1
                          ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white shadow-lg scale-110"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all text-sm"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AllProperty;