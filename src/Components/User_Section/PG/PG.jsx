import React, { useState, useEffect, useRef } from "react";
import {
  FaBed,
  FaCar,
  FaRulerCombined,
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHome,
  FaShieldAlt,
  FaUtensils,
  FaWifi,
  FaShower,
  FaArrowLeft,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { redirectByRole } from "../../../utils/routingUtils";
import Login from "../Login&Signup/Login";
import Signup from "../Login&Signup/UserSignup";
import AOS from "aos";
import "aos/dist/aos.css";
import { ChevronDown, Search, X, RotateCcw, Building2 } from "lucide-react";

// ─── Inline FilterBar (PG — purple/blue theme) ────────────────────────────────
function FilterBar({
  searchTerm, setSearchTerm,
  genderFilter, setGenderFilter,
  roomTypeFilter, setRoomTypeFilter,
  minBudget, setMinBudget,
  maxBudget, setMaxBudget,
  foodFilter, setFoodFilter,
  verifiedFilter, setVerifiedFilter,
  selectedCity, setSelectedCity,
  availableCities,
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

  const budgetLabel =
    minBudget || maxBudget
      ? `₹${minBudget || "0"} – ₹${maxBudget || "∞"}`
      : "Budget";

  const roomTypeOptions = [
    { label: "Single Room", value: "Single" },
    { label: "Double Sharing", value: "Double" },
    { label: "Triple Sharing", value: "Triple" },
    { label: "Dormitory", value: "Multiple" },
  ];

  const genderOptions = [
    { label: "Boys Only", value: "Male" },
    { label: "Girls Only", value: "Female" },
    { label: "Co-living (Any)", value: "Any" },
  ];

  const moreCount = [
    foodFilter,
    verifiedFilter,
    roomTypeFilter !== "",
    genderFilter !== "",
  ].filter(Boolean).length;

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
              placeholder="Search PG, city, locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 border-slate-200 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">

            {/* City */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("city")}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === "city" || selectedCity
                    ? "border-purple-500 text-purple-600 bg-purple-50"
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
                    <p className="text-xs text-gray-400 py-2">No cities found</p>
                  )}
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => { setSelectedCity(city); setActiveFilter(null); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCity === city
                          ? "bg-purple-50 text-purple-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-purple-600"
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
                    ? "border-purple-500 text-purple-600 bg-purple-50"
                    : "hover:border-slate-400"
                }`}
              >
                {budgetLabel}
                <ChevronDown size={14} />
              </button>
              {activeFilter === "budget" && (
                <div className="absolute top-12 left-0 w-72 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">Budget Range (₹/bed/month)</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      className="w-full border p-2 rounded text-sm focus:border-purple-500 outline-none"
                    />
                    <span className="text-slate-400 text-sm flex-shrink-0">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full border p-2 rounded text-sm focus:border-purple-500 outline-none"
                    />
                  </div>
                  {/* PG budget presets */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[
                      { label: "< 5K", max: "5000" },
                      { label: "5K–10K", min: "5000", max: "10000" },
                      { label: "10K–20K", min: "10000", max: "20000" },
                      { label: "20K+", min: "20000" },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => { setMinBudget(p.min || ""); setMaxBudget(p.max || ""); }}
                        className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-100 transition-all"
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
                      className="bg-purple-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Room Type */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("roomType")}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === "roomType" || roomTypeFilter
                    ? "border-purple-500 text-purple-600 bg-purple-50"
                    : "hover:border-slate-400"
                }`}
              >
                {roomTypeFilter
                  ? roomTypeOptions.find(o => o.value === roomTypeFilter)?.label || roomTypeFilter
                  : "Room Type"}
                {roomTypeFilter && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setRoomTypeFilter(""); }}
                    className="ml-0.5 hover:text-red-500"
                  >
                    <X size={12} />
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              {activeFilter === "roomType" && (
                <div className="absolute top-12 left-0 w-64 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">Room Type</p>
                  <div className="grid grid-cols-1 gap-2">
                    {roomTypeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setRoomTypeFilter(roomTypeFilter === opt.value ? "" : opt.value);
                          setActiveFilter(null);
                        }}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium text-left transition-all ${
                          roomTypeFilter === opt.value
                            ? "border-purple-500 text-purple-600 bg-purple-50"
                            : "hover:border-purple-400 hover:text-purple-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="mt-4 w-full bg-purple-600 text-white py-1.5 rounded-md text-sm font-semibold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* More Filters (Gender, Food, Verified) */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("more")}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === "more" || moreCount > 0
                    ? "border-purple-500 text-purple-600 bg-purple-50"
                    : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                More Filters
                {moreCount > 0 && (
                  <span className="bg-purple-600 text-white text-[10px] px-1.5 rounded-full ml-1">
                    {moreCount}
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              {activeFilter === "more" && (
                <div className="absolute top-12 right-0 sm:left-0 w-72 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">More Filters</p>

                  {/* Gender */}
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Gender Preference</p>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {genderOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setGenderFilter(genderFilter === opt.value ? "" : opt.value)}
                        className={`px-3 py-2 border rounded-lg text-xs font-medium text-left transition-all ${
                          genderFilter === opt.value
                            ? "border-purple-500 text-purple-600 bg-purple-50"
                            : "hover:border-purple-400 hover:text-purple-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Toggle filters */}
                  <div className="space-y-2 mb-4">
                    <label className="flex items-center justify-between gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:border-purple-400">
                      <span className="text-sm text-slate-700">🍽️ Food Included</span>
                      <input
                        type="checkbox"
                        className="accent-purple-600 w-4 h-4"
                        checked={foodFilter}
                        onChange={(e) => setFoodFilter(e.target.checked)}
                      />
                    </label>
                    <label className="flex items-center justify-between gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:border-purple-400">
                      <span className="text-sm text-slate-700">✅ Verified Only</span>
                      <input
                        type="checkbox"
                        className="accent-purple-600 w-4 h-4"
                        checked={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.checked)}
                      />
                    </label>
                  </div>

                  <button
                    onClick={() => setActiveFilter(null)}
                    className="w-full bg-purple-600 text-white py-1.5 rounded-md text-sm font-semibold"
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

// ─── Main PG Component ─────────────────────────────────────────────────────────
const PG = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [pgData, setPgData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pgLoading, setPgLoading] = useState(true);
  const [noProperties, setNoProperties] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalMessage, setRoleModalMessage] = useState("");

  // FilterBar states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [foodFilter, setFoodFilter] = useState(false);
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [availableCities, setAvailableCities] = useState([]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchPGProperties();
  }, []);

  const fetchPGProperties = async () => {
    setPgLoading(true);
    setNoProperties(false);
    try {
      const res = await fetch(`https://api.gharzoreality.com/api/public/properties?page=1&limit=100`);
      const data = await res.json();

      let list = data?.data || [];
      list = list.filter((p) => p.listingType === "PG");

      if (list.length === 0) {
        setNoProperties(true);
        setPgData([]);
        setFilteredData([]);
      } else {
        const mapped = list.map((p) => ({
          id: p._id,
          name: p.title || "PG Property",
          image:
            p.images?.find((i) => i.isPrimary)?.url ||
            p.images?.[0]?.url ||
            "",
          lowestPrice: p.price?.amount || 0,
          totalBeds: p.pgDetails?.totalBeds || 1,
          roomType: p.pgDetails?.roomType || "",
          foodIncluded: p.pgDetails?.foodIncluded || false,
          genderPreference: p.pgDetails?.genderPreference || "Any",
          commonAreas: p.pgDetails?.commonAreas || [],
          location: {
            city: p.location?.city || "",
            locality: p.location?.locality || "",
            state: p.location?.state || "",
            landmark: p.location?.landmark || "",
          },
          amenities: p.amenitiesList || [],
          isVerified: p.verificationStatus === "Verified",
          landlordName: p.ownerId?.name || p.contactInfo?.name || "Owner",
          bathrooms: p.bathrooms || 0,
          availableBeds: p.pgDetails?.availableBeds || 0,
          rating: 4.5,
        }));

        setPgData(mapped);
        setFilteredData(mapped);

        // Extract unique cities
        const cities = [...new Set(mapped.map((p) => p.location.city).filter(Boolean))].sort();
        setAvailableCities(cities);
        setNoProperties(false);
      }
    } catch (err) {
      console.error("Error fetching PG properties", err);
      setPgData([]);
      setFilteredData([]);
      setNoProperties(true);
    } finally {
      setPgLoading(false);
    }
  };

  // ── Master filter function ────────────────────────────────────────────────────
  useEffect(() => {
    if (pgData.length === 0) return;

    let filtered = pgData;

    // Search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (pg) =>
          pg.name?.toLowerCase().includes(q) ||
          pg.location?.city?.toLowerCase().includes(q) ||
          pg.location?.locality?.toLowerCase().includes(q)
      );
    }

    // City
    if (selectedCity) {
      filtered = filtered.filter(
        (pg) => pg.location.city?.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    // Budget
    const minP = minBudget ? parseInt(minBudget) : 0;
    const maxP = maxBudget ? parseInt(maxBudget) : Infinity;
    if (minBudget || maxBudget) {
      filtered = filtered.filter(
        (pg) => pg.lowestPrice >= minP && pg.lowestPrice <= maxP
      );
    }

    // Room type
    if (roomTypeFilter) {
      filtered = filtered.filter((pg) => pg.roomType === roomTypeFilter);
    }

    // Gender
    if (genderFilter) {
      filtered = filtered.filter(
        (pg) => pg.genderPreference === genderFilter || pg.genderPreference === "Any"
      );
    }

    // Food
    if (foodFilter) {
      filtered = filtered.filter((pg) => pg.foodIncluded === true);
    }

    // Verified
    if (verifiedFilter) {
      filtered = filtered.filter((pg) => pg.isVerified === true);
    }

    setFilteredData(filtered);
  }, [
    pgData,
    debouncedSearch,
    selectedCity,
    minBudget,
    maxBudget,
    roomTypeFilter,
    genderFilter,
    foodFilter,
    verifiedFilter,
  ]);

  const handleReset = () => {
    setSearchTerm("");
    setGenderFilter("");
    setRoomTypeFilter("");
    setMinBudget("");
    setMaxBudget("");
    setFoodFilter(false);
    setVerifiedFilter(false);
    setSelectedCity("");
  };

  const hasActiveFilters =
    genderFilter || roomTypeFilter || minBudget || maxBudget || foodFilter || verifiedFilter || selectedCity;

  const formatPrice = (price) => {
    if (!price) return "Price N/A";
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const handlePgClick = (pg) => {
    navigate(`/property/${pg.id}`, { state: pg });
  };

  const handleLoginSuccess = () => setShowLogin(false);
  const handleSignupComplete = () => setShowSignup(false);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));

  const genderBadge = (pref) => {
    const map = { Male: { label: "Boys Only", color: "bg-blue-100 text-blue-700" }, Female: { label: "Girls Only", color: "bg-pink-100 text-pink-700" }, Any: { label: "Co-living", color: "bg-green-100 text-green-700" } };
    const item = map[pref] || map["Any"];
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.color}`}>{item.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">

      {/* Sticky FilterBar */}
      <FilterBar
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        genderFilter={genderFilter} setGenderFilter={setGenderFilter}
        roomTypeFilter={roomTypeFilter} setRoomTypeFilter={setRoomTypeFilter}
        minBudget={minBudget} setMinBudget={setMinBudget}
        maxBudget={maxBudget} setMaxBudget={setMaxBudget}
        foodFilter={foodFilter} setFoodFilter={setFoodFilter}
        verifiedFilter={verifiedFilter} setVerifiedFilter={setVerifiedFilter}
        selectedCity={selectedCity} setSelectedCity={setSelectedCity}
        availableCities={availableCities}
        onReset={handleReset}
      />

      <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-10">

        {/* Back + Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <FaArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
                PG &amp; Hostels
              </span>
            </h2>
            <p className="mt-1 text-gray-500 text-sm">
              {pgLoading
                ? "Loading..."
                : `${filteredData.length} PG${filteredData.length === 1 ? "" : "s"} found`}
              {selectedCity && !pgLoading && (
                <span className="ml-2 text-purple-500 text-xs">· In {selectedCity}</span>
              )}
            </p>
          </div>

          <button
            onClick={() => navigate(user ? "/add-listing" : "/login")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
          >
            <FaPlus size={16} />
            List Your PG
          </button>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Active Filters:
            </span>
            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-700 text-white rounded-full text-xs font-medium">
                📍 {selectedCity}
                <button onClick={() => setSelectedCity("")}><X size={11} /></button>
              </span>
            )}
            {roomTypeFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                🛏 {roomTypeFilter}
                <button onClick={() => setRoomTypeFilter("")}><X size={11} /></button>
              </span>
            )}
            {genderFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium">
                👥 {genderFilter === "Male" ? "Boys Only" : genderFilter === "Female" ? "Girls Only" : "Co-living"}
                <button onClick={() => setGenderFilter("")}><X size={11} /></button>
              </span>
            )}
            {(minBudget || maxBudget) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-400 text-white rounded-full text-xs font-medium">
                💰 ₹{minBudget || "0"} – {maxBudget ? `₹${maxBudget}` : "∞"}/bed
                <button onClick={() => { setMinBudget(""); setMaxBudget(""); }}><X size={11} /></button>
              </span>
            )}
            {foodFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                🍽️ Food Included
                <button onClick={() => setFoodFilter(false)}><X size={11} /></button>
              </span>
            )}
            {verifiedFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                ✅ Verified Only
                <button onClick={() => setVerifiedFilter(false)}><X size={11} /></button>
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
        {pgLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-56 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[1, 2, 3].map((j) => <div key={j} className="h-14 bg-gray-100 rounded-lg" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Properties */}
        {!pgLoading && filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaHome size={64} className="text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No PG Found</h3>
            <p className="text-gray-500 mb-6">
              {noProperties
                ? "No PG listings available at the moment."
                : "Try adjusting your filters to see more results."}
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* PG Cards */}
        {!pgLoading && filteredData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredData.map((pg, index) => (
              <div
                key={pg.id}
                onClick={() => handlePgClick(pg)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-1.5"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={pg.image || "https://via.placeholder.com/800x600?text=No+Image"}
                    alt={pg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Price badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
                    {formatPrice(pg.lowestPrice)}
                    <span className="text-green-200 text-xs">/bed</span>
                  </div>

                  {/* Beds badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    {pg.totalBeds} Beds
                  </div>

                  {/* Verified */}
                  {pg.isVerified && (
                    <div className="absolute bottom-4 right-4 bg-blue-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1">
                      <FaShieldAlt size={10} /> Verified
                    </div>
                  )}

                  {/* Rating */}
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    {renderStars(pg.rating)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors mb-1">
                    {pg.name}
                  </h3>

                  <div className="flex items-center text-gray-500 mb-3">
                    <FaMapMarkerAlt className="text-red-500 mr-1 flex-shrink-0" size={13} />
                    <span className="text-xs line-clamp-1">
                      {[pg.location.locality, pg.location.city].filter(Boolean).join(", ")}
                    </span>
                  </div>

                  {/* Gender + Food badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {genderBadge(pg.genderPreference)}
                    {pg.foodIncluded && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                        🍽️ Food Incl.
                      </span>
                    )}
                    {pg.roomType && (
                      <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-100">
                        🛏 {pg.roomType}
                      </span>
                    )}
                  </div>

                  {/* Amenities chips */}
                  {pg.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {pg.amenities.slice(0, 3).map((a, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium"
                        >
                          {a}
                        </span>
                      ))}
                      {pg.amenities.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium">
                          +{pg.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
                      <FaBed className="text-purple-500 mb-1" size={16} />
                      <p className="text-[10px] font-medium text-gray-600">
                        {pg.totalBeds} Beds
                      </p>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
                      <FaShower className="text-purple-500 mb-1" size={16} />
                      <p className="text-[10px] font-medium text-gray-600">
                        {pg.bathrooms > 0 ? `${pg.bathrooms} Bath` : "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
                      <FaUser className="text-purple-500 mb-1" size={16} />
                      <p className="text-[10px] font-medium text-gray-600 truncate w-full text-center">
                        {pg.landlordName?.split(" ")[0] || "Owner"}
                      </p>
                    </div>
                  </div>

                  {/* Available beds */}
                  {pg.availableBeds > 0 && (
                    <p className="text-xs text-green-600 font-semibold mb-2">
                      ✓ {pg.availableBeds} bed{pg.availableBeds > 1 ? "s" : ""} available
                    </p>
                  )}

                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                    View Details &amp; Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!pgLoading && filteredData.length > 0 && (
          <div className="text-center mt-10 text-gray-500 text-sm">
            Showing <span className="font-semibold text-purple-600">{filteredData.length}</span>{" "}
            of <span className="font-semibold text-purple-600">{pgData.length}</span> PG properties
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <Login
          role="User"
          onClose={handleLoginSuccess}
          onRegisterClick={() => { setShowLogin(false); setShowSignup(true); }}
        />
      )}

      {/* Signup Modal */}
      {showSignup && <Signup onClose={handleSignupComplete} />}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-2 text-red-600">Access Restricted</h3>
            <p className="text-sm text-gray-700 mb-4">{roleModalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PG;