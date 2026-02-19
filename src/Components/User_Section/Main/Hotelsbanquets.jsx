import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Home,
  IndianRupee,
  X,
  Building2,
  Users,
  BedDouble,
  UtensilsCrossed,
  Star,
  Phone,
  ArrowLeft,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

// ─── Inline FilterBar ──────────────────────────────────────────────────────────
function FilterBar({
  activeTab,
  searchTerm, setSearchTerm,
  selectedCity, setSelectedCity,
  minBudget, setMinBudget,
  maxBudget, setMaxBudget,
  selectedType, setSelectedType,
  selectedCategory, setSelectedCategory,
  verifiedOnly, setVerifiedOnly,
  featuredOnly, setFeaturedOnly,
  availableCities,
  availableTypes,
  availableCategories,
  onReset,
}) {
  const [activeFilter, setActiveFilter] = useState(null);
  const dropdownRef = useRef(null);

  const toggleFilter = (f) => setActiveFilter((p) => (p === f ? null : f));

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setActiveFilter(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const accentColor = activeTab === "hotels" ? "orange" : "purple";

  const budgetLabel =
    minBudget || maxBudget
      ? `₹${minBudget || "0"} – ₹${maxBudget || "∞"}`
      : "Budget";

  const hotelBudgetPresets = [
    { label: "< 2K", max: "2000" },
    { label: "2K–5K", min: "2000", max: "5000" },
    { label: "5K–15K", min: "5000", max: "15000" },
    { label: "15K+", min: "15000" },
  ];

  const banquetBudgetPresets = [
    { label: "< 10K", max: "10000" },
    { label: "10K–50K", min: "10000", max: "50000" },
    { label: "50K–2L", min: "50000", max: "200000" },
    { label: "2L+", min: "200000" },
  ];

  const budgetPresets = activeTab === "hotels" ? hotelBudgetPresets : banquetBudgetPresets;

  const moreCount = [verifiedOnly, featuredOnly, selectedCategory !== ""].filter(Boolean).length;

  const cls = {
    active: `border-${accentColor}-500 text-${accentColor}-600 bg-${accentColor}-50`,
    dot: `bg-${accentColor}-600`,
    btn: `bg-${accentColor}-600 hover:bg-${accentColor}-700`,
    ring: `focus:ring-${accentColor}-400`,
    preset: `bg-${accentColor}-50 border-${accentColor}-200 text-${accentColor}-700 hover:bg-${accentColor}-100`,
    badge: `bg-${accentColor}-600`,
  };

  return (
    <div
      ref={dropdownRef}
      className="w-full bg-white shadow-md border-b sticky top-0 z-50 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          {/* Search */}
          <div className="flex-1 min-w-[160px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={activeTab === "hotels" ? "Search hotel, city..." : "Search banquet, city..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${accentColor === "orange" ? "focus:ring-orange-400" : "focus:ring-purple-400"} border-slate-200 text-sm`}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">

            {/* City */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("city")}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === "city" || selectedCity
                    ? accentColor === "orange"
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : "border-purple-500 text-purple-600 bg-purple-50"
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
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Cities</p>
                  {availableCities.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">No cities found</p>
                  )}
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => { setSelectedCity(city); setActiveFilter(null); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCity === city
                          ? accentColor === "orange"
                            ? "bg-orange-50 text-orange-600 font-semibold"
                            : "bg-purple-50 text-purple-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
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
                    ? accentColor === "orange"
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : "border-purple-500 text-purple-600 bg-purple-50"
                    : "hover:border-slate-400"
                }`}
              >
                {budgetLabel}
                <ChevronDown size={14} />
              </button>
              {activeFilter === "budget" && (
                <div className="absolute top-12 left-0 w-72 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">
                    Budget Range (₹{activeTab === "hotels" ? "/night" : " onwards"})
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      className={`w-full border p-2 rounded text-sm outline-none ${accentColor === "orange" ? "focus:border-orange-500" : "focus:border-purple-500"}`}
                    />
                    <span className="text-slate-400 text-sm flex-shrink-0">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className={`w-full border p-2 rounded text-sm outline-none ${accentColor === "orange" ? "focus:border-orange-500" : "focus:border-purple-500"}`}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {budgetPresets.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => { setMinBudget(p.min || ""); setMaxBudget(p.max || ""); }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          accentColor === "orange"
                            ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                            : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={() => { setMinBudget(""); setMaxBudget(""); }}
                      className="text-sm text-slate-500 underline"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setActiveFilter(null)}
                      className={`text-white px-4 py-1.5 rounded-md text-sm font-semibold ${accentColor === "orange" ? "bg-orange-600" : "bg-purple-600"}`}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Type Filter (Hotel Type / Venue Type) */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("type")}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === "type" || selectedType
                    ? accentColor === "orange"
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : "border-purple-500 text-purple-600 bg-purple-50"
                    : "hover:border-slate-400"
                }`}
              >
                {selectedType || (activeTab === "hotels" ? "Hotel Type" : "Venue Type")}
                {selectedType && (
                  <span onClick={(e) => { e.stopPropagation(); setSelectedType(""); }} className="ml-0.5 hover:text-red-500">
                    <X size={12} />
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              {activeFilter === "type" && (
                <div className="absolute top-12 left-0 w-64 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">
                    {activeTab === "hotels" ? "Hotel Type" : "Venue Type"}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {availableTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => { setSelectedType(selectedType === type ? "" : type); setActiveFilter(null); }}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium text-left transition-all ${
                          selectedType === type
                            ? accentColor === "orange"
                              ? "border-orange-500 text-orange-600 bg-orange-50"
                              : "border-purple-500 text-purple-600 bg-purple-50"
                            : "hover:border-slate-300"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveFilter(null)}
                    className={`mt-4 w-full text-white py-1.5 rounded-md text-sm font-semibold ${accentColor === "orange" ? "bg-orange-600" : "bg-purple-600"}`}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* More Filters */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("more")}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === "more" || moreCount > 0
                    ? accentColor === "orange"
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : "border-purple-500 text-purple-600 bg-purple-50"
                    : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                More Filters
                {moreCount > 0 && (
                  <span className={`text-white text-[10px] px-1.5 rounded-full ml-1 ${accentColor === "orange" ? "bg-orange-600" : "bg-purple-600"}`}>
                    {moreCount}
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              {activeFilter === "more" && (
                <div className="absolute top-12 right-0 sm:left-0 w-72 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">More Filters</p>

                  {/* Category — hotels only */}
                  {activeTab === "hotels" && availableCategories.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Category</p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {availableCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                            className={`px-3 py-2 border rounded-lg text-xs font-medium text-left transition-all ${
                              selectedCategory === cat
                                ? "border-orange-500 text-orange-600 bg-orange-50"
                                : "hover:border-orange-300"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Verified / Featured toggles */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between px-3 py-2 border rounded-lg cursor-pointer hover:border-slate-400">
                      <span className="text-sm text-slate-700 flex items-center gap-2">
                        <ShieldCheck size={14} className={accentColor === "orange" ? "text-orange-500" : "text-purple-500"} />
                        Verified Only
                      </span>
                      <input
                        type="checkbox"
                        className={`w-4 h-4 ${accentColor === "orange" ? "accent-orange-600" : "accent-purple-600"}`}
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                      />
                    </label>
                    <label className="flex items-center justify-between px-3 py-2 border rounded-lg cursor-pointer hover:border-slate-400">
                      <span className="text-sm text-slate-700 flex items-center gap-2">
                        <Sparkles size={14} className={accentColor === "orange" ? "text-orange-500" : "text-purple-500"} />
                        Featured Only
                      </span>
                      <input
                        type="checkbox"
                        className={`w-4 h-4 ${accentColor === "orange" ? "accent-orange-600" : "accent-purple-600"}`}
                        checked={featuredOnly}
                        onChange={(e) => setFeaturedOnly(e.target.checked)}
                      />
                    </label>
                  </div>

                  <button
                    onClick={() => setActiveFilter(null)}
                    className={`mt-4 w-full text-white py-1.5 rounded-md text-sm font-semibold ${accentColor === "orange" ? "bg-orange-600" : "bg-purple-600"}`}
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

// ─── Main Component ────────────────────────────────────────────────────────────
const HotelsBanquetsPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("hotels");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [noProperties, setNoProperties] = useState(false);

  const [hotels, setHotels] = useState([]);
  const [banquets, setBanquets] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // FilterBar states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedType, setSelectedType] = useState("");       // propertyType / venueType
  const [selectedCategory, setSelectedCategory] = useState(""); // hotel category
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Dynamic filter options
  const [availableCities, setAvailableCities] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  const itemsPerPage = 9;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset page & type on tab change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedType("");
    setSelectedCategory("");
  }, [activeTab]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCity, minBudget, maxBudget, selectedType, selectedCategory, verifiedOnly, featuredOnly]);

  // Fetch Hotels
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("https://api.gharzoreality.com/api/hotels", { signal: controller.signal });
        const data = await res.json();
        if (data?.success) setHotels(data?.data || []);
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    })();
    return () => controller.abort();
  }, []);

  // Fetch Banquets
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("https://api.gharzoreality.com/api/banquet-halls", { signal: controller.signal });
        const data = await res.json();
        if (data?.success) setBanquets(data?.data || []);
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    })();
    return () => controller.abort();
  }, []);

  // Update dynamic filter options whenever source data changes
  useEffect(() => {
    const source = activeTab === "hotels" ? hotels : banquets;
    const cities = [...new Set(source.map((i) => i.location?.city).filter(Boolean))].sort();
    setAvailableCities(cities);

    if (activeTab === "hotels") {
      const types = [...new Set(hotels.map((i) => i.propertyType).filter(Boolean))].sort();
      const cats = [...new Set(hotels.map((i) => i.category).filter(Boolean))].sort();
      setAvailableTypes(types);
      setAvailableCategories(cats);
    } else {
      const types = [...new Set(banquets.map((i) => i.venueType).filter(Boolean))].sort();
      setAvailableTypes(types);
      setAvailableCategories([]);
    }
  }, [activeTab, hotels, banquets]);

  // Apply filters
  useEffect(() => {
    setLoading(true);
    setNoProperties(false);

    const source = activeTab === "hotels" ? hotels : banquets;
    let list = [...source];

    // Search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.location?.city?.toLowerCase().includes(q) ||
          p.location?.locality?.toLowerCase().includes(q)
      );
    }

    // City
    if (selectedCity) {
      list = list.filter((p) => p.location?.city === selectedCity);
    }

    // Budget
    const minP = minBudget ? parseInt(minBudget) : 0;
    const maxP = maxBudget ? parseInt(maxBudget) : Infinity;
    if (minBudget || maxBudget) {
      list = list.filter((p) => {
        const price = p.priceRange?.min || 0;
        return price >= minP && price <= maxP;
      });
    }

    // Type
    if (selectedType) {
      if (activeTab === "hotels") {
        list = list.filter((p) => p.propertyType === selectedType);
      } else {
        list = list.filter((p) => p.venueType === selectedType);
      }
    }

    // Category (hotels only)
    if (activeTab === "hotels" && selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Verified
    if (verifiedOnly) list = list.filter((p) => p.isVerified === true);

    // Featured
    if (featuredOnly) list = list.filter((p) => p.isFeatured === true);

    if (list.length === 0) {
      setNoProperties(true);
      setFilteredData([]);
      setTotalPages(1);
      setTotalCount(0);
    } else {
      // Map to unified format
      const mapped = list.map((item) => ({
        id: item._id,
        name: item.name,
        description: item.description,
        image: item.images?.[0]?.url || "",
        price: item.priceRange?.min || 0,
        priceMax: item.priceRange?.max || 0,
        location: item.location || {},
        // hotel fields
        category: item.category || "",
        propertyType: item.propertyType || "",
        totalRooms: item.totalRooms || 0,
        roomTypes: item.roomTypes || [],
        amenities: item.amenities || {},
        // banquet fields
        venueType: item.venueType || "",
        halls: item.halls || [],
        totalCapacity: item.totalCapacity || {},
        eventTypes: item.eventTypes || [],
        // shared
        contactInfo: item.contactInfo || {},
        isVerified: item.isVerified || false,
        isFeatured: item.isFeatured || false,
        ratings: item.ratings || { average: 0, count: 0 },
        policies: item.policies || {},
        nearbyPlaces: item.nearbyPlaces || [],
      }));

      setTotalCount(mapped.length);
      setTotalPages(Math.ceil(mapped.length / itemsPerPage));

      const start = (currentPage - 1) * itemsPerPage;
      setFilteredData(mapped.slice(start, start + itemsPerPage));
      setNoProperties(false);
    }

    setLoading(false);
  }, [
    activeTab, hotels, banquets, currentPage,
    debouncedSearch, selectedCity, minBudget, maxBudget,
    selectedType, selectedCategory, verifiedOnly, featuredOnly,
  ]);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCity("");
    setMinBudget("");
    setMaxBudget("");
    setSelectedType("");
    setSelectedCategory("");
    setVerifiedOnly(false);
    setFeaturedOnly(false);
  };

  const hasActiveFilters =
    selectedCity || minBudget || maxBudget || selectedType || selectedCategory || verifiedOnly || featuredOnly;

  const formatPrice = (price) => {
    if (!price) return "Price N/A";
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const accentColor = activeTab === "hotels" ? "orange" : "purple";

  // All amenity lists flattened
  const getAmenitiesList = (amenities) => {
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities;
    const lists = [];
    Object.values(amenities).forEach((v) => {
      if (Array.isArray(v)) lists.push(...v);
    });
    return lists.filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">

      {/* Sticky FilterBar */}
      <FilterBar
        activeTab={activeTab}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedCity={selectedCity} setSelectedCity={setSelectedCity}
        minBudget={minBudget} setMinBudget={setMinBudget}
        maxBudget={maxBudget} setMaxBudget={setMaxBudget}
        selectedType={selectedType} setSelectedType={setSelectedType}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        verifiedOnly={verifiedOnly} setVerifiedOnly={setVerifiedOnly}
        featuredOnly={featuredOnly} setFeaturedOnly={setFeaturedOnly}
        availableCities={availableCities}
        availableTypes={availableTypes}
        availableCategories={availableCategories}
        onReset={handleReset}
      />

      <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-10">

        {/* Back */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
                Hotels &amp; Banquets
              </span>
            </h2>
            <p className="mt-1 text-gray-500 text-sm">
              {loading
                ? "Loading..."
                : `${totalCount} ${activeTab === "hotels" ? "hotel" : "banquet"}${totalCount === 1 ? "" : "s"} found`}
              {selectedCity && !loading && (
                <span className="ml-2 text-orange-500 text-xs">· In {selectedCity}</span>
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => { setActiveTab("hotels"); handleReset(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all text-sm ${
              activeTab === "hotels"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Building2 size={18} /> Hotels
          </button>
          <button
            onClick={() => { setActiveTab("banquets"); handleReset(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all text-sm ${
              activeTab === "banquets"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <UtensilsCrossed size={18} /> Banquet Halls
          </button>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Filters:</span>
            {selectedCity && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 text-white rounded-full text-xs font-medium ${accentColor === "orange" ? "bg-orange-600" : "bg-purple-600"}`}>
                📍 {selectedCity}
                <button onClick={() => setSelectedCity("")}><X size={11} /></button>
              </span>
            )}
            {selectedType && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 text-white rounded-full text-xs font-medium ${accentColor === "orange" ? "bg-orange-500" : "bg-purple-500"}`}>
                🏨 {selectedType}
                <button onClick={() => setSelectedType("")}><X size={11} /></button>
              </span>
            )}
            {selectedCategory && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 text-white rounded-full text-xs font-medium ${accentColor === "orange" ? "bg-orange-400" : "bg-purple-400"}`}>
                ⭐ {selectedCategory}
                <button onClick={() => setSelectedCategory("")}><X size={11} /></button>
              </span>
            )}
            {(minBudget || maxBudget) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                💰 ₹{minBudget || "0"} – {maxBudget ? `₹${maxBudget}` : "∞"}
                <button onClick={() => { setMinBudget(""); setMaxBudget(""); }}><X size={11} /></button>
              </span>
            )}
            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                ✅ Verified
                <button onClick={() => setVerifiedOnly(false)}><X size={11} /></button>
              </span>
            )}
            {featuredOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium">
                ⭐ Featured
                <button onClick={() => setFeaturedOnly(false)}><X size={11} /></button>
              </span>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-300 transition-all"
            >
              <RotateCcw size={11} /> Clear All
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-60 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[1,2,3].map((j) => <div key={j} className="h-14 bg-gray-100 rounded-lg" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Properties */}
        {!loading && noProperties && (
          <div className="flex flex-col items-center justify-center py-20">
            <Home size={64} className="text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No {activeTab === "hotels" ? "Hotels" : "Banquet Halls"} Found
            </h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters to see more results.</p>
            <button
              onClick={handleReset}
              className={`px-6 py-3 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all ${accentColor === "orange" ? "bg-gradient-to-r from-orange-500 to-orange-600" : "bg-gradient-to-r from-purple-600 to-purple-700"}`}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && !noProperties && filteredData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredData.map((item, index) => {
              const amenitiesList = getAmenitiesList(item.amenities);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => navigate(`/hotel-banquet/${item.id}?type=${activeTab}`)}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500"
                >
                  {/* Image */}
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    <img
                      src={item.image || "https://via.placeholder.com/800x600?text=No+Image"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Price */}
                    <div className={`absolute top-4 left-4 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg ${accentColor === "orange" ? "bg-orange-600" : "bg-blue-600"}`}>
                      {formatPrice(item.price)}
                      {item.priceMax > item.price && ` – ${formatPrice(item.priceMax)}`}
                      <span className="text-xs font-normal opacity-80 ml-1">
                        {activeTab === "hotels" ? "/night" : " onwards"}
                      </span>
                    </div>

                    {/* Type badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700">
                      {activeTab === "hotels" ? (item.category || item.propertyType || "Hotel") : (item.venueType || "Banquet Hall")}
                    </div>

                    {item.isVerified && (
                      <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">
                        ✓ Verified
                      </div>
                    )}
                    {item.isFeatured && (
                      <div className="absolute bottom-4 right-4 bg-yellow-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">
                        ⭐ Featured
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className={`text-lg font-bold text-gray-900 line-clamp-1 transition-colors group-hover:${accentColor === "orange" ? "text-orange-600" : "text-purple-600"}`}>
                      {item.name}
                    </h3>

                    <div className="flex items-center text-gray-500 mt-1.5 mb-3">
                      <MapPin size={14} className={`mr-1 flex-shrink-0 ${accentColor === "orange" ? "text-orange-500" : "text-purple-500"}`} />
                      <span className="text-xs line-clamp-1">
                        {[item.location.locality, item.location.city].filter(Boolean).join(", ")}
                      </span>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                    )}

                    {/* Amenities chips */}
                    {amenitiesList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {amenitiesList.slice(0, 3).map((a, i) => (
                          <span key={i} className={`px-2 py-0.5 text-[10px] rounded-full font-medium border ${accentColor === "orange" ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-purple-50 text-purple-700 border-purple-100"}`}>
                            {a}
                          </span>
                        ))}
                        {amenitiesList.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium">
                            +{amenitiesList.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    {activeTab === "hotels" ? (
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className={`flex flex-col items-center p-2 rounded-lg ${accentColor === "orange" ? "bg-orange-50" : "bg-purple-50"}`}>
                          <BedDouble size={16} className={accentColor === "orange" ? "text-orange-500" : "text-purple-500"} />
                          <p className="text-[10px] font-medium text-gray-600 mt-1">{item.totalRooms} Rooms</p>
                        </div>
                        <div className={`flex flex-col items-center p-2 rounded-lg ${accentColor === "orange" ? "bg-orange-50" : "bg-purple-50"}`}>
                          <Star size={16} className={accentColor === "orange" ? "text-orange-500" : "text-purple-500"} />
                          <p className="text-[10px] font-medium text-gray-600 mt-1">{item.roomTypes?.length || 0} Types</p>
                        </div>
                        <div className={`flex flex-col items-center p-2 rounded-lg ${accentColor === "orange" ? "bg-orange-50" : "bg-purple-50"}`}>
                          <MapPin size={16} className={accentColor === "orange" ? "text-orange-500" : "text-purple-500"} />
                          <p className="text-[10px] font-medium text-gray-600 mt-1">{item.nearbyPlaces?.length || 0} Nearby</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
                          <Users size={16} className="text-purple-500" />
                          <p className="text-[10px] font-medium text-gray-600 mt-1">{item.totalCapacity?.seating || 0} Seating</p>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
                          <Users size={16} className="text-purple-500" />
                          <p className="text-[10px] font-medium text-gray-600 mt-1">{item.totalCapacity?.floating || 0} Floating</p>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
                          <Building2 size={16} className="text-purple-500" />
                          <p className="text-[10px] font-medium text-gray-600 mt-1">{item.halls?.length || 0} Halls</p>
                        </div>
                      </div>
                    )}

                    {/* Banquet: Event types */}
                    {activeTab === "banquets" && item.eventTypes?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.eventTypes.slice(0, 3).map((ev, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full font-medium">
                            {ev}
                          </span>
                        ))}
                        {item.eventTypes.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">+{item.eventTypes.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Contact */}
                    {item.contactInfo?.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={12} />
                        <span>{item.contactInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !noProperties && totalPages > 1 && (
          <div className="flex justify-center mt-10 gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-5 py-2.5 bg-white border text-sm font-medium rounded-xl disabled:opacity-40 hover:opacity-80 transition-colors ${accentColor === "orange" ? "border-orange-400 text-orange-600" : "border-purple-400 text-purple-600"}`}
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
                      ? accentColor === "orange"
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-purple-600 text-white shadow-lg"
                      : `bg-white border text-sm ${accentColor === "orange" ? "border-orange-300 text-orange-600 hover:bg-orange-50" : "border-purple-300 text-purple-600 hover:bg-purple-50"}`
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-5 py-2.5 bg-white border text-sm font-medium rounded-xl disabled:opacity-40 hover:opacity-80 transition-colors ${accentColor === "orange" ? "border-orange-400 text-orange-600" : "border-purple-400 text-purple-600"}`}
            >
              Next
            </button>
          </div>
        )}

        {/* Results count */}
        {!loading && !noProperties && filteredData.length > 0 && (
          <div className="text-center mt-6 text-gray-500 text-sm">
            Showing <span className={`font-semibold ${accentColor === "orange" ? "text-orange-600" : "text-purple-600"}`}>{filteredData.length}</span>{" "}
            of <span className={`font-semibold ${accentColor === "orange" ? "text-orange-600" : "text-purple-600"}`}>{totalCount}</span>{" "}
            {activeTab === "hotels" ? "hotels" : "banquet halls"}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelsBanquetsPage;