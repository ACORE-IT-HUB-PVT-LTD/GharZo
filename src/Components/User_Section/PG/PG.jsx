import React, { useState, useEffect } from "react";
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
import { ChevronDown, Search, X } from "lucide-react";

const PG = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [pgData, setPgData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pgLoading, setPgLoading] = useState(true);
  const [noProperties, setNoProperties] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [selectedPg, setSelectedPg] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalMessage, setRoleModalMessage] = useState("");

  // Advanced Filter States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [foodIncluded, setFoodIncluded] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedOccupancy, setSelectedOccupancy] = useState([]);

  // FilterBar States (PG specific)
  const [activeFilter, setActiveFilter] = useState(null);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedLocalities, setSelectedLocalities] = useState([]);
  // ── FIXED: pgPropertyTypes now maps to real API roomType values ──
  // API pgDetails.roomType values seen: "Single", and by convention "Double", "Triple", "Multiple"
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]); // replaces selectedPropertyTypes
  const [selectedBeds, setSelectedBeds] = useState([]);           // replaces selectedBHK (now filters by totalBeds ranges)
  const [localities, setLocalities] = useState([]);

  // PG room types matching real API pgDetails.roomType values
  const pgRoomTypeOptions = [
    { label: "Single Room",     value: "Single" },
    { label: "Double Sharing",  value: "Double" },
    { label: "Triple Sharing",  value: "Triple" },
    { label: "Dormitory",       value: "Multiple" },
  ];

  // Bed count filter options (maps to pgDetails.totalBeds)
  const bedOptions = [
    { label: "1 Bed",   min: 1,  max: 1 },
    { label: "2 Beds",  min: 2,  max: 2 },
    { label: "3 Beds",  min: 3,  max: 5 },
    { label: "5+ Beds", min: 5,  max: Infinity },
  ];

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchPGProperties();
  }, []);

  // ── Extract unique localities from fetched PG data ──────────────────────────
  const extractLocalities = (pgList) => {
    const locs = [...new Set(pgList.map(p => p.location?.locality).filter(Boolean))];
    setLocalities(locs.slice(0, 15));
  };

  const fetchPGProperties = async () => {
    setPgLoading(true);
    setNoProperties(false);
    try {
      const res = await fetch(`https://api.gharzoreality.com/api/public/properties?page=1&limit=100`);
      const data = await res.json();

      // Filter only PG listing type
      let list = data?.data || [];
      list = list.filter(p => p.listingType === "PG");

      if (list.length === 0) {
        setNoProperties(true);
        setPgData([]);
        setFilteredData([]);
      } else {
        const mapped = list.map((p) => ({
          id: p._id,
          name: p.title || p.name || "PG Property",
          type: "PG",
          // price.amount is per bed for PG
          lowestPrice: p.price?.amount || 0,
          totalBeds: p.pgDetails?.totalBeds || 1,
          totalRooms: Math.ceil((p.pgDetails?.totalBeds || 1) / 2),
          images: p.images?.map(img => img.url) || [],
          location: {
            city: p.location?.city || "",
            state: p.location?.state || "",
            area: p.location?.locality || p.location?.area || "",
            landmark: p.location?.landmark || "",
          },
          amenities: p.amenitiesList || [],
          rating: 4.5,
          reviews: Math.floor(Math.random() * 100) + 20,
          landlordInfo: {
            name: p.ownerId?.name || p.contactInfo?.name || "Property Owner"
          },
          isVerified: p.verificationStatus === "Verified" || p.verified,
          distance: "City location",
          // ── Use real API field: pgDetails.roomType ──
          roomType: p.pgDetails?.roomType || "",
          foodIncluded: p.pgDetails?.foodIncluded || false,
          genderPreference: p.pgDetails?.genderPreference || "Any",
          bathrooms: p.bathrooms || 1,
          occupancy: p.pgDetails?.occupancy || p.pgDetails?.roomType || "Single",
        }));

        setPgData(mapped);
        setFilteredData(mapped);
        extractLocalities(mapped);
        setNoProperties(false);
      }
    } catch (err) {
      console.error('Error fetching PG properties', err);
      setPgData([]);
      setFilteredData([]);
      setNoProperties(true);
    } finally {
      setPgLoading(false);
    }
  };

  const toggleFilter = (filter) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  // ── Filter Handlers ──────────────────────────────────────────────────────────

  const handleLocalityChange = (locality) => {
    setSelectedLocalities(prev =>
      prev.includes(locality) ? prev.filter(l => l !== locality) : [...prev, locality]
    );
  };

  // ── FIXED: Room type filter — matches pgDetails.roomType from API ──
  const handleRoomTypeChange = (value) => {
    setSelectedRoomTypes(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    );
  };

  // ── FIXED: Bed filter — matches pgDetails.totalBeds ranges ──
  const handleBedChange = (label) => {
    setSelectedBeds(prev =>
      prev.includes(label) ? prev.filter(b => b !== label) : [...prev, label]
    );
  };

  const toggleOccupancy = (occ) => {
    setSelectedOccupancy(prev =>
      prev.includes(occ) ? prev.filter(o => o !== occ) : [...prev, occ]
    );
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // ── MASTER FILTER FUNCTION — combines all active filters ────────────────────
  const applyAllFilters = () => {
    let filtered = pgData;

    // 1. Search query (name, city, locality)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(pg =>
        pg.location?.city?.toLowerCase().includes(q) ||
        pg.location?.area?.toLowerCase().includes(q) ||
        pg.name?.toLowerCase().includes(q)
      );
    }

    // 2. Locality filter (from FilterBar dropdown)
    if (selectedLocalities.length > 0) {
      filtered = filtered.filter(pg =>
        selectedLocalities.includes(pg.location?.area)
      );
    }

    // 3. Budget filter — FilterBar min/max (per bed price)
    const minP = minBudget ? parseInt(minBudget) : 0;
    const maxP = maxBudget ? parseInt(maxBudget) : Infinity;
    if (minBudget || maxBudget) {
      filtered = filtered.filter(pg => {
        const price = pg.lowestPrice;
        return price >= minP && price <= maxP;
      });
    }

    // 4. Price range filter — Advanced filters slider
    if (priceRange[0] > 0 || priceRange[1] < 50000) {
      filtered = filtered.filter(pg =>
        pg.lowestPrice >= priceRange[0] && pg.lowestPrice <= priceRange[1]
      );
    }

    // 5. Room Type filter — matches pgDetails.roomType (Single, Double, Triple, Multiple)
    if (selectedRoomTypes.length > 0) {
      filtered = filtered.filter(pg =>
        selectedRoomTypes.includes(pg.roomType)
      );
    }

    // 6. Bed count filter — matches pgDetails.totalBeds
    if (selectedBeds.length > 0) {
      filtered = filtered.filter(pg => {
        const beds = pg.totalBeds || 0;
        return selectedBeds.some(label => {
          const opt = bedOptions.find(o => o.label === label);
          if (!opt) return false;
          if (opt.max === Infinity) return beds >= opt.min;
          return beds >= opt.min && beds <= opt.max;
        });
      });
    }

    // 7. Gender preference filter (Advanced)
    if (selectedGender) {
      filtered = filtered.filter(pg =>
        pg.genderPreference === selectedGender || pg.genderPreference === "Any"
      );
    }

    // 8. Room type filter (Advanced select — Single/Sharing/Double/Triple)
    if (selectedRoomType) {
      filtered = filtered.filter(pg => pg.roomType === selectedRoomType);
    }

    // 9. Food included filter
    if (foodIncluded) {
      filtered = filtered.filter(pg => pg.foodIncluded === true);
    }

    // 10. Verified only
    if (verifiedOnly) {
      filtered = filtered.filter(pg => pg.isVerified === true);
    }

    // 11. Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(pg =>
        selectedAmenities.every(amenity =>
          pg.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    // 12. Occupancy filter (Advanced)
    if (selectedOccupancy.length > 0) {
      filtered = filtered.filter(pg =>
        selectedOccupancy.includes(pg.roomType) || selectedOccupancy.includes(pg.occupancy)
      );
    }

    setFilteredData(filtered);
  };

  // Re-run filters whenever any filter state changes
  useEffect(() => {
    if (pgData.length > 0) applyAllFilters();
  }, [
    pgData,
    searchQuery,
    selectedLocalities,
    minBudget,
    maxBudget,
    selectedRoomTypes,
    selectedBeds,
    priceRange,
    selectedRoomType,
    selectedGender,
    foodIncluded,
    verifiedOnly,
    selectedAmenities,
    selectedOccupancy,
  ]);

  // ── Clear helpers ────────────────────────────────────────────────────────────

  const clearAllFilters = () => {
    setMinBudget("");
    setMaxBudget("");
    setSelectedLocalities([]);
    setSelectedRoomTypes([]);
    setSelectedBeds([]);
    setFilteredData(pgData);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 50000]);
    setSelectedRoomType("");
    setSelectedGender("");
    setFoodIncluded(false);
    setVerifiedOnly(false);
    setSelectedAmenities([]);
    setSelectedOccupancy([]);
    clearAllFilters();
  };

  // ── Misc helpers ─────────────────────────────────────────────────────────────

  const redirectBasedOnRole = (targetRole, pg = null) => {
    if (loading) return;
    if (!user) {
      sessionStorage.setItem("pendingRole", targetRole);
      setShowLogin(true);
      return;
    }
    const normalizeRole = (role) => {
      if (!role) return '';
      return role.toLowerCase().replace(/[_\s-]/g, '');
    };
    const userRoleNormalized = normalizeRole(user.role);
    const targetRoleNormalized = normalizeRole(targetRole);
    if (userRoleNormalized === targetRoleNormalized) {
      redirectByRole(navigate, user.role);
    } else {
      const loginPaths = {
        tenant: "/tensor_login",
        landlord: "/landlord_login",
        subowner: "/sub_owner_login",
        worker: "/dr_worker_login",
      };
      const loginPath = loginPaths[targetRoleNormalized];
      if (loginPath) {
        navigate(loginPath, { replace: true });
      } else {
        setRoleModalMessage(`Cannot redirect to ${targetRole}. Login page not found.`);
        setShowRoleModal(true);
      }
    }
  };

  const handlePgClick = (pg) => {
    navigate(`/property/${pg.id}`, { state: pg });
  };

  const handleLoginSuccess = async () => setShowLogin(false);
  const handleSignupComplete = async () => setShowSignup(false);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>★</span>
      );
    }
    return stars;
  };

  const renderAmenities = (amenities) => {
    const iconMap = {
      AC: <FaHome className="text-blue-500" />,
      Wifi: <FaWifi className="text-purple-500" />,
      "Wi-Fi": <FaWifi className="text-purple-500" />,
      Food: <FaUtensils className="text-green-500" />,
      Laundry: <FaShower className="text-pink-500" />,
      Parking: <FaCar className="text-orange-500" />,
      "Visitor Parking": <FaCar className="text-orange-500" />,
      Security: <FaShieldAlt className="text-red-500" />,
      Gym: <FaRulerCombined className="text-indigo-500" />,
    };
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {amenities.slice(0, 4).map((amenity, index) => (
          <span key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
            {iconMap[amenity] || <FaHome className="text-gray-500" />}
            {amenity}
          </span>
        ))}
        {amenities.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
            +{amenities.length - 4} more
          </span>
        )}
      </div>
    );
  };

  // ── How many FilterBar filters are active ────────────────────────────────────
  const hasFilterBarFilters = selectedLocalities.length > 0 || minBudget || maxBudget || selectedRoomTypes.length > 0 || selectedBeds.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-10 md:px-10">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent"
            data-aos="fade-down"
          >
            Discover Premium PG And Hostel
          </h2>
          <p className="text-gray-600">Find your perfect home away from home</p>
        </div>
      </div>

      {/* ── FilterBar ────────────────────────────────────────────────────────── */}
      <div className="w-full bg-white shadow-md border-b sticky top-0 z-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">

            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Enter Locality or PG Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border-slate-200"
              />
            </div>

            <div className="flex flex-wrap gap-2">

              {/* ── Locality Filter ── */}
              <div className="relative">
                <button
                  onClick={() => toggleFilter('locality')}
                  className={`flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium transition-all ${activeFilter === 'locality' ? 'border-purple-500 text-purple-600 bg-purple-50' : 'hover:border-slate-400'}`}
                >
                  Locality {selectedLocalities.length > 0 && <span className="ml-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{selectedLocalities.length}</span>}
                  <ChevronDown size={16} />
                </button>
                {activeFilter === 'locality' && (
                  <div className="absolute top-12 left-0 w-64 bg-white shadow-xl border rounded-lg p-4 z-50">
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {localities.length > 0 ? localities.map(loc => (
                        <label key={loc} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-purple-600">
                          <input
                            type="checkbox"
                            className="accent-purple-600"
                            checked={selectedLocalities.includes(loc)}
                            onChange={() => handleLocalityChange(loc)}
                          /> {loc}
                        </label>
                      )) : (
                        <p className="text-sm text-gray-400">No localities found</p>
                      )}
                    </div>
                    <button onClick={() => setActiveFilter(null)} className="mt-4 w-full bg-purple-600 text-white py-1.5 rounded-md">Done</button>
                  </div>
                )}
              </div>

              {/* ── Budget Filter ── */}
              <div className="relative">
                <button
                  onClick={() => toggleFilter('budget')}
                  className={`flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium ${activeFilter === 'budget' ? 'border-purple-500 text-purple-600' : ''} ${(minBudget || maxBudget) ? 'border-purple-400 text-purple-600 bg-purple-50' : ''}`}
                >
                  Budget {(minBudget || maxBudget) && <span className="ml-1 w-2 h-2 rounded-full bg-purple-600 inline-block" />}
                  <ChevronDown size={16} />
                </button>
                {activeFilter === 'budget' && (
                  <div className="absolute top-12 left-0 w-72 bg-white shadow-xl border rounded-lg p-4 z-50">
                    <p className="text-sm font-bold text-slate-800 mb-3">Budget Range (per bed/month)</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min ₹"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                        className="w-full border p-2 rounded text-sm focus:border-purple-500 outline-none"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="number"
                        placeholder="Max ₹"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        className="w-full border p-2 rounded text-sm focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <button onClick={() => { setMinBudget(''); setMaxBudget(''); }} className="text-sm text-slate-500 underline">Clear</button>
                      <button onClick={() => setActiveFilter(null)} className="bg-purple-600 text-white px-4 py-1.5 rounded-md text-sm">Apply</button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Room Type Filter (FIXED — maps to pgDetails.roomType) ── */}
              <div className="relative">
                <button
                  onClick={() => toggleFilter('roomType')}
                  className={`flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium ${activeFilter === 'roomType' ? 'border-purple-500 text-purple-600' : ''} ${selectedRoomTypes.length > 0 ? 'border-purple-400 text-purple-600 bg-purple-50' : ''}`}
                >
                  Room Type {selectedRoomTypes.length > 0 && <span className="ml-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{selectedRoomTypes.length}</span>}
                  <ChevronDown size={16} />
                </button>
                {activeFilter === 'roomType' && (
                  <div className="absolute top-12 left-0 w-64 bg-white shadow-xl border rounded-lg p-4 z-50">
                    <div className="grid grid-cols-1 gap-2">
                      {pgRoomTypeOptions.map(opt => (
                        <label key={opt.value} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-purple-600">
                          <input
                            type="checkbox"
                            className="accent-purple-600"
                            checked={selectedRoomTypes.includes(opt.value)}
                            onChange={() => handleRoomTypeChange(opt.value)}
                          /> {opt.label}
                        </label>
                      ))}
                    </div>
                    <button onClick={() => setActiveFilter(null)} className="mt-4 w-full bg-purple-600 text-white py-1.5 rounded-md">Done</button>
                  </div>
                )}
              </div>

              {/* ── Beds Filter (FIXED — filters by pgDetails.totalBeds) ── */}
              <div className="relative">
                <button
                  onClick={() => toggleFilter('beds')}
                  className={`flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium ${activeFilter === 'beds' ? 'border-purple-500 text-purple-600' : ''} ${selectedBeds.length > 0 ? 'border-purple-400 text-purple-600 bg-purple-50' : ''}`}
                >
                  Beds {selectedBeds.length > 0 && <span className="ml-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{selectedBeds.length}</span>}
                  <ChevronDown size={16} />
                </button>
                {activeFilter === 'beds' && (
                  <div className="absolute top-12 left-0 w-60 bg-white shadow-xl border rounded-lg p-4 z-50">
                    <div className="flex flex-wrap gap-2">
                      {bedOptions.map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => handleBedChange(opt.label)}
                          className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-all ${selectedBeds.includes(opt.label) ? 'bg-purple-600 text-white border-purple-600' : 'hover:border-purple-500 hover:text-purple-600'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setActiveFilter(null)} className="mt-4 w-full bg-purple-600 text-white py-1.5 rounded-md">Done</button>
                  </div>
                )}
              </div>

              {/* More Filters */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium transition-colors ${showAdvancedFilters ? 'border-purple-500 text-purple-600 bg-purple-50' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                More Filters
              </button>

              {/* Clear All */}
              {hasFilterBarFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-4 py-2 text-red-500 text-sm font-medium hover:underline"
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasFilterBarFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {selectedLocalities.map(loc => (
                <span key={loc} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  📍 {loc}
                  <X size={12} className="cursor-pointer" onClick={() => handleLocalityChange(loc)} />
                </span>
              ))}
              {selectedRoomTypes.map(val => {
                const opt = pgRoomTypeOptions.find(o => o.value === val);
                return (
                  <span key={val} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    🛏 {opt?.label || val}
                    <X size={12} className="cursor-pointer" onClick={() => handleRoomTypeChange(val)} />
                  </span>
                );
              })}
              {selectedBeds.map(label => (
                <span key={label} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  🛏 {label}
                  <X size={12} className="cursor-pointer" onClick={() => handleBedChange(label)} />
                </span>
              ))}
              {(minBudget || maxBudget) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  💰 ₹{minBudget || '0'} – ₹{maxBudget || 'Any'}
                  <X size={12} className="cursor-pointer" onClick={() => { setMinBudget(''); setMaxBudget(''); }} />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Advanced Filters Panel ────────────────────────────────────────────── */}
      {showAdvancedFilters && (
        <div className="max-w-6xl mx-auto mb-8 mt-4" data-aos="fade-down">
          <div className="bg-white p-6 shadow-xl rounded-2xl border border-blue-200">
            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
              {/* Room Type (Advanced) */}
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="border rounded-full px-4 py-2 text-sm bg-purple-50 text-purple-700 border-purple-200 focus:outline-none cursor-pointer"
              >
                <option value="">All Room Types</option>
                <option value="Single">Single Room</option>
                <option value="Double">Double Sharing</option>
                <option value="Triple">Triple Sharing</option>
                <option value="Multiple">Dormitory / Multiple</option>
              </select>

              {/* Gender */}
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="border rounded-full px-4 py-2 text-sm bg-purple-50 text-purple-700 border-purple-200 focus:outline-none cursor-pointer"
              >
                <option value="">All Genders</option>
                <option value="Male">Boys Only</option>
                <option value="Female">Girls Only</option>
                <option value="Any">Co-living</option>
              </select>

              {/* Food Included */}
              <label className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-purple-600"
                  checked={foodIncluded}
                  onChange={(e) => setFoodIncluded(e.target.checked)}
                />
                <span className="text-purple-600 font-semibold">🍽️ Food Included</span>
              </label>

              {/* Verified Only */}
              <label className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-purple-600"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <span className="text-purple-600 font-semibold">✅ Verified Only</span>
              </label>

              <button
                className="text-sm text-blue-600 font-medium ml-auto hover:underline"
                onClick={resetFilters}
              >
                Reset All Filters
              </button>
            </div>

            <hr className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  💰 Price Range (per bed/month)
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Occupancy / Room Type */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaBed className="text-purple-600" />
                  Occupancy Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Single', 'Double', 'Triple', 'Multiple'].map((occ) => (
                    <button
                      key={occ}
                      onClick={() => toggleOccupancy(occ)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        selectedOccupancy.includes(occ)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3 lg:col-span-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaWifi className="text-purple-600" />
                  Essential Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['WiFi', 'AC', 'Food', 'Laundry', 'Parking', 'Security', 'Power Backup', 'TV', 'Gym', 'Fridge'].map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        selectedAmenities.includes(amenity)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Advanced Filter Tags */}
      {(selectedRoomType || selectedGender || foodIncluded || verifiedOnly || selectedAmenities.length > 0 || selectedOccupancy.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000) && (
        <div className="max-w-6xl mx-auto mb-6 mt-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
            {selectedRoomType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {selectedRoomType}
                <FaTimes size={12} className="cursor-pointer" onClick={() => setSelectedRoomType("")} />
              </span>
            )}
            {selectedGender && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {selectedGender}
                <FaTimes size={12} className="cursor-pointer" onClick={() => setSelectedGender("")} />
              </span>
            )}
            {foodIncluded && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Food Included
                <FaTimes size={12} className="cursor-pointer" onClick={() => setFoodIncluded(false)} />
              </span>
            )}
            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Verified Only
                <FaTimes size={12} className="cursor-pointer" onClick={() => setVerifiedOnly(false)} />
              </span>
            )}
            {selectedAmenities.map(amenity => (
              <span key={amenity} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {amenity}
                <FaTimes size={12} className="cursor-pointer" onClick={() => toggleAmenity(amenity)} />
              </span>
            ))}
            {selectedOccupancy.map(occ => (
              <span key={occ} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {occ}
                <FaTimes size={12} className="cursor-pointer" onClick={() => toggleOccupancy(occ)} />
              </span>
            ))}
            {(priceRange[0] > 0 || priceRange[1] < 50000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                <FaTimes size={12} className="cursor-pointer" onClick={() => setPriceRange([0, 50000])} />
              </span>
            )}
          </div>
        </div>
      )}

      {/* No Properties Message */}
      {noProperties && !pgLoading && (
        <div className="max-w-6xl mx-auto">
          <div className="col-span-full text-center py-12">
            <FaHome className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No PG Properties Found</h3>
            <p className="text-gray-500">No PG listings available at the moment. Please check back later.</p>
          </div>
        </div>
      )}

      {/* PG Cards Grid */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" data-aos="fade-up" data-aos-delay="100">
          {pgLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="w-full h-56 bg-gray-200 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />)}
                  </div>
                </div>
              </div>
            ))
          ) : filteredData.length === 0 && !noProperties ? (
            <div className="col-span-full text-center py-12">
              <FaHome className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No PGs Found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredData.map((pg, index) => (
              <div
                key={pg.id}
                onClick={() => handlePgClick(pg)}
                className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={pg.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"}
                    alt={pg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    ₹{pg.lowestPrice.toLocaleString()}/bed
                  </div>
                  {pg.isVerified && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <FaShieldAlt className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    {renderStars(Math.floor(pg.rating))}
                    <span className="text-blue-300">({pg.reviews})</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {pg.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <FaMapMarkerAlt className="text-red-500" />
                      <span className="text-sm font-medium">
                        {pg.location.area}, {pg.location.city}
                      </span>
                    </div>
                    {pg.location.landmark && (
                      <p className="text-xs text-gray-500">📍 {pg.location.landmark}</p>
                    )}
                  </div>

                  {renderAmenities(pg.amenities)}

                  <div className="grid grid-cols-3 gap-3 mt-4 mb-4 text-sm">
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <FaBed className="text-blue-500 w-5 h-5 mb-1" />
                      <span className="font-semibold text-gray-800 text-xs">
                        {pg.roomType || 'Sharing'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <FaHome className="text-green-500 w-5 h-5 mb-1" />
                      <span className="font-semibold text-gray-800 text-xs">
                        {pg.totalBeds} Beds
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <FaUtensils className="text-orange-500 w-5 h-5 mb-1" />
                      <span className="font-semibold text-gray-800 text-xs">
                        {pg.foodIncluded ? "Food ✓" : "No Food"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      <FaHome className="w-3 h-3" />
                      {pg.genderPreference}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <FaUser className="w-3 h-3" />
                      {pg.landlordInfo?.name}
                    </span>
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
                    View Details & Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredData.length > 0 && !pgLoading && (
          <div className="text-center mt-8 py-6 bg-white/50 rounded-xl">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-blue-600">{filteredData.length}</span>{" "}
              out of <span className="font-semibold text-blue-600">{pgData.length}</span> PG properties
            </p>
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

      {/* Role Access Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-2 text-red-600">Access Restricted</h3>
            <p className="text-sm text-gray-700 mb-4">{roleModalMessage}</p>
            <div className="flex justify-end gap-3">
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