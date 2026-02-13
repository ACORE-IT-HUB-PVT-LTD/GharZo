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

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchPGProperties();
  }, []);

  const fetchPGProperties = async () => {
    setPgLoading(true);
    setNoProperties(false);
    try {
      const res = await fetch(`https://api.gharzoreality.com/api/public/properties?page=1&limit=100`);
      const data = await res.json();
      
      // Filter only properties with listingType = "PG"
      let list = data?.data || [];
      list = list.filter(p => p.listingType === "PG");
      
      if (list.length === 0) {
        setNoProperties(true);
        setPgData([]);
        setFilteredData([]);
      } else {
        // Map API data to component format
        const mapped = list.map((p) => ({
          id: p._id,
          name: p.title || p.name || "PG Property",
          type: "PG",
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
          roomType: p.pgDetails?.roomType || "Sharing",
          foodIncluded: p.pgDetails?.foodIncluded || false,
          genderPreference: p.pgDetails?.genderPreference || "Any",
          bathrooms: p.bathrooms || 1,
          occupancy: p.pgDetails?.occupancy || "Single",
        }));
        
        setPgData(mapped);
        setFilteredData(mapped);
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

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(i => i !== amenity) : [...prev, amenity]
    );
  };

  const toggleOccupancy = (occupancy) => {
    setSelectedOccupancy(prev => 
      prev.includes(occupancy) ? prev.filter(i => i !== occupancy) : [...prev, occupancy]
    );
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
    setFilteredData(pgData);
  };

  const applyFilters = () => {
    let filtered = pgData;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(pg =>
        pg.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pg.location?.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pg.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(pg => {
      const price = pg.lowestPrice;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Room type filter
    if (selectedRoomType) {
      filtered = filtered.filter(pg => pg.roomType === selectedRoomType);
    }

    // Gender filter
    if (selectedGender) {
      filtered = filtered.filter(pg => 
        pg.genderPreference === selectedGender || pg.genderPreference === "Any"
      );
    }

    // Food filter
    if (foodIncluded) {
      filtered = filtered.filter(pg => pg.foodIncluded === true);
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter(pg => pg.isVerified === true);
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(pg => {
        return selectedAmenities.every(amenity =>
          pg.amenities.some(pgAmenity =>
            pgAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        );
      });
    }

    // Occupancy filter
    if (selectedOccupancy.length > 0) {
      filtered = filtered.filter(pg => 
        selectedOccupancy.includes(pg.occupancy)
      );
    }

    setFilteredData(filtered);
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, priceRange, selectedRoomType, selectedGender, foodIncluded, verifiedOnly, selectedAmenities, selectedOccupancy, pgData]);

  // Unified role-based redirect function
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

  const handleLoginSuccess = async () => {
    setShowLogin(false);
  };

  const handleSignupComplete = async () => {
    setShowSignup(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
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
          <span
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
          >
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

      {/* Search Bar with Filter Button */}
      <div className="max-w-6xl mx-auto mb-6" data-aos="fade-up">
        <div className="bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-xl rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Search by city, area, or PG name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-blue-300/50 p-3 rounded-xl bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 border-2 border-purple-200 rounded-xl font-semibold hover:bg-purple-100 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="max-w-6xl mx-auto mb-8" data-aos="fade-down">
          <div className="bg-white p-6 shadow-xl rounded-2xl border border-blue-200">
            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="border rounded-full px-4 py-2 text-sm bg-purple-50 text-purple-700 border-purple-200 focus:outline-none cursor-pointer"
              >
                <option value="">All Room Types</option>
                <option value="Single">Single Room</option>
                <option value="Sharing">Sharing</option>
                <option value="Double">Double Sharing</option>
                <option value="Triple">Triple Sharing</option>
              </select>

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

              <label className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-purple-600"
                  checked={foodIncluded}
                  onChange={(e) => setFoodIncluded(e.target.checked)}
                />
                <span className="text-purple-600 font-semibold">🍽️ Food Included</span>
              </label>

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

            {/* Filter Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  💰 Price Range (per month)
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
                    step="1000"
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

              {/* Occupancy Type */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaBed className="text-purple-600" />
                  Occupancy
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

              {/* Amenities - PG Specific */}
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

      {/* Active Filters Display */}
      {(selectedRoomType || selectedGender || foodIncluded || verifiedOnly || selectedAmenities.length > 0 || selectedOccupancy.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000) && (
        <div className="max-w-6xl mx-auto mb-6">
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
                ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
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
      <div className="max-w-6xl mx-auto">
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
                    ₹{pg.lowestPrice.toLocaleString()}/month
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
                      <p className="text-xs text-gray-500">
                        📍 {pg.location.landmark}
                      </p>
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
                        {pg.foodIncluded ? "Food" : "No Food"}
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
              Showing <span className="font-semibold text-blue-600">{filteredData.length}</span> 
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
          onRegisterClick={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
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