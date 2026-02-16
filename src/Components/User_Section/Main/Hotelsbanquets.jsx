import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Home,
  IndianRupee,
  SlidersHorizontal,
  X,
  Building2,
  Users,
  BedDouble,
  UtensilsCrossed,
  Star,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

const HotelsBanquetsPage = () => {
  const navigate = useNavigate();
  
  // Tab state: 'hotels' or 'banquets'
  const [activeTab, setActiveTab] = useState("hotels");
  
  // Search and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [noProperties, setNoProperties] = useState(false);
  
  // Data states
  const [hotels, setHotels] = useState([]);
  const [banquets, setBanquets] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Filter States
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVenueType, setSelectedVenueType] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const itemsPerPage = 9;

  const handlePropertyClick = (id) => {
    navigate(`/hotel-banquet/${id}?type=${activeTab}`);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setPriceRange([0, 500000]);
    setSelectedCategory("");
    setSelectedVenueType("");
    setVerifiedOnly(false);
    setFeaturedOnly(false);
    setCurrentPage(1);
  };

  // Fetch Hotels
  useEffect(() => {
    const controller = new AbortController();
    const fetchHotels = async () => {
      try {
        const res = await fetch(`https://api.gharzoreality.com/api/hotels`, { 
          signal: controller.signal 
        });
        const data = await res.json();
        if (data?.success) {
          setHotels(data?.data || []);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching hotels', err);
      }
    };
    fetchHotels();
    return () => controller.abort();
  }, []);

  // Fetch Banquets
  useEffect(() => {
    const controller = new AbortController();
    const fetchBanquets = async () => {
      try {
        const res = await fetch(`https://api.gharzoreality.com/api/banquet-halls`, { 
          signal: controller.signal 
        });
        const data = await res.json();
        if (data?.success) {
          setBanquets(data?.data || []);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching banquets', err);
      }
    };
    fetchBanquets();
    return () => controller.abort();
  }, []);

  // Filter and process data
  useEffect(() => {
    setLoading(true);
    setNoProperties(false);
    
    const sourceData = activeTab === 'hotels' ? hotels : banquets;
    
    let list = [...sourceData];
    
    // Apply search filter
    if (searchQuery) {
      list = list.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.locality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.landmark?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply city filter
    if (selectedCity) {
      list = list.filter(p => p.location?.city === selectedCity);
    }
    
    // Apply price range filter
    list = list.filter(p => {
      const minPrice = p.priceRange?.min || 0;
      const maxPrice = p.priceRange?.max || 0;
      return (minPrice >= priceRange[0] && minPrice <= priceRange[1]) || 
             (maxPrice >= priceRange[0] && maxPrice <= priceRange[1]) ||
             (minPrice <= priceRange[0] && maxPrice >= priceRange[1]);
    });
    
    // Apply category filter for hotels
    if (activeTab === 'hotels' && selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }
    
    // Apply venue type filter for banquets
    if (activeTab === 'banquets' && selectedVenueType) {
      list = list.filter(p => p.venueType === selectedVenueType);
    }
    
    // Apply verified filter
    if (verifiedOnly) {
      list = list.filter(p => p.isVerified === true);
    }
    
    // Apply featured filter
    if (featuredOnly) {
      list = list.filter(p => p.isFeatured === true);
    }
    
    // Check if no properties found
    if (list.length === 0) {
      setNoProperties(true);
      setFilteredData([]);
      setTotalPages(1);
    } else {
      // Map data to display format
      const mapped = list.map((item) => {
        if (activeTab === 'hotels') {
          return {
            id: item._id,
            name: item.name,
            description: item.description,
            image: item.images?.[0]?.url || "",
            images: item.images || [],
            price: item.priceRange?.min || 0,
            priceMax: item.priceRange?.max || 0,
            location: item.location || { city: "", locality: "", landmark: "" },
            category: item.category || "",
            propertyType: item.propertyType || "",
            totalRooms: item.totalRooms || 0,
            roomTypes: item.roomTypes || [],
            amenities: item.amenities || {},
            policies: item.policies || {},
            contactInfo: item.contactInfo || {},
            nearbyPlaces: item.nearbyPlaces || [],
            isVerified: item.isVerified || false,
            isFeatured: item.isFeatured || false,
            ratings: item.ratings || { average: 0, count: 0 },
            type: 'hotel'
          };
        } else {
          return {
            id: item._id,
            name: item.name,
            description: item.description,
            image: item.images?.[0]?.url || "",
            images: item.images || [],
            price: item.priceRange?.min || 0,
            priceMax: item.priceRange?.max || 0,
            location: item.location || { city: "", locality: "", landmark: "" },
            venueType: item.venueType || "",
            halls: item.halls || [],
            totalCapacity: item.totalCapacity || { seating: 0, floating: 0 },
            eventTypes: item.eventTypes || [],
            amenities: item.amenities || {},
            policies: item.policies || {},
            contactInfo: item.contactInfo || {},
            nearbyPlaces: item.nearbyPlaces || [],
            isVerified: item.isVerified || false,
            isFeatured: item.isFeatured || false,
            ratings: item.ratings || { average: 0, count: 0 },
            type: 'banquet'
          };
        }
      });
      
      // Paginate
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedData = mapped.slice(startIndex, startIndex + itemsPerPage);
      
      setFilteredData(paginatedData);
      setTotalPages(Math.ceil(list.length / itemsPerPage));
      setNoProperties(false);
    }
    
    setLoading(false);
  }, [activeTab, hotels, banquets, currentPage, searchQuery, selectedCity, priceRange, selectedCategory, selectedVenueType, verifiedOnly, featuredOnly]);

  // Get unique cities from data
  const getUniqueCities = () => {
    const sourceData = activeTab === 'hotels' ? hotels : banquets;
    const cities = [...new Set(sourceData.map(item => item.location?.city).filter(Boolean))];
    return cities;
  };

  // Get categories for hotels
  const getHotelCategories = () => {
    const categories = [...new Set(hotels.map(item => item.category).filter(Boolean))];
    return categories;
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
      {/* Back Button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
            Hotels & Banquets
          </span>
        </h2>
        <p className="mt-2 text-gray-600">Find the perfect venue for your stay or event</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setActiveTab('hotels'); setCurrentPage(1); resetFilters(); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
            activeTab === 'hotels'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Building2 size={20} />
          Hotels
        </button>
        <button
          onClick={() => { setActiveTab('banquets'); setCurrentPage(1); resetFilters(); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
            activeTab === 'banquets'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <UtensilsCrossed size={20} />
          Banquet Halls
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4">
          <div className="flex-1 relative w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
            <input
              type="text"
              placeholder={`Search by name, city, locality...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none"
            />
          </div>
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-4 rounded-xl bg-purple-50 text-purple-700 border-2 border-purple-200 hover:bg-purple-100 transition-colors font-semibold"
          >
            <SlidersHorizontal size={20} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="max-w-5xl mx-auto mb-8"
        >
          <div className="bg-white p-6 shadow-xl rounded-2xl border border-gray-100">
            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
              <select 
                className="border rounded-full px-4 py-2 text-sm bg-purple-50 text-purple-700 border-purple-200 focus:outline-none cursor-pointer"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {getUniqueCities().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {activeTab === 'hotels' && (
                <select 
                  className="border rounded-full px-4 py-2 text-sm bg-purple-50 text-purple-700 border-purple-200 focus:outline-none cursor-pointer"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {getHotelCategories().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}

              <label className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="accent-purple-600"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <span className="text-purple-600 font-semibold">Verified ✅</span>
              </label>

              <label className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="accent-purple-600"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                />
                <span className="text-purple-600 font-semibold">Featured ⭐</span>
              </label>

              <button 
                className="text-sm text-blue-600 font-medium ml-auto hover:underline"
                onClick={resetFilters}
              >
                Reset All Filters
              </button>
            </div>

            <hr className="mb-6" />

            {/* Price Range Slider */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <IndianRupee size={18} className="text-purple-600" />
                Budget Range
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
                  max="500000" 
                  step="10000"
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
          </div>
        </motion.div>
      )}

      {/* Active Filters Display */}
      {(selectedCity || selectedCategory || selectedVenueType || verifiedOnly || featuredOnly || priceRange[0] > 0 || priceRange[1] < 500000) && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
            
            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {selectedCity}
                <X size={14} className="cursor-pointer" onClick={() => setSelectedCity("")} />
              </span>
            )}
            
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {selectedCategory}
                <X size={14} className="cursor-pointer" onClick={() => setSelectedCategory("")} />
              </span>
            )}
            
            {selectedVenueType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {selectedVenueType}
                <X size={14} className="cursor-pointer" onClick={() => setSelectedVenueType("")} />
              </span>
            )}
            
            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Verified Only
                <X size={14} className="cursor-pointer" onClick={() => setVerifiedOnly(false)} />
              </span>
            )}
            
            {featuredOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Featured Only
                <X size={14} className="cursor-pointer" onClick={() => setFeaturedOnly(false)} />
              </span>
            )}
            
            {(priceRange[0] > 0 || priceRange[1] < 500000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                <X size={14} className="cursor-pointer" onClick={() => setPriceRange([0, 500000])} />
              </span>
            )}
          </div>
        </div>
      )}

      {/* No Properties Message */}
      {noProperties && !loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Home size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No {activeTab === 'hotels' ? 'Hotels' : 'Banquet Halls'} Found
            </h3>
            <p className="text-gray-600 mb-6">
              No {activeTab === 'hotels' ? 'hotels' : 'banquet halls'} match your search criteria at the moment.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Clear All Filters
            </button>
          </motion.div>
        </div>
      )}

      {/* Property Cards */}
      {!noProperties && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {(loading ? Array.from({length: itemsPerPage}) : filteredData).map((property, index) => (
            <motion.div
              key={property?.id || `ph-${index}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.03 }}
              onClick={() => !loading && handlePropertyClick(property?.id)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500"
            >
              <div className="relative">
                <img
                  src={property?.image || 'https://via.placeholder.com/800x600?text=Loading'}
                  alt={property?.name || 'Loading'}
                  className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                  {activeTab === 'hotels' ? '₹' : '₹'}{(property?.price || 0).toLocaleString()}
                  {property?.priceMax > property?.price && ` - ₹${property.priceMax.toLocaleString()}`}
                  <span className="text-xs font-normal">
                    {activeTab === 'hotels' ? '/night' : (property?.type === 'banquet' ? ' onwards' : '')}
                  </span>
                </div>
                
                {/* Property Type Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-lg">
                  {activeTab === 'hotels' ? (property?.category || 'Hotel') : (property?.venueType || 'Banquet Hall')}
                </div>
                
                {property?.isVerified && (
                  <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full font-semibold text-xs shadow-lg">
                    ✓ Verified
                  </div>
                )}
                
                {property?.isFeatured && (
                  <div className="absolute bottom-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full font-semibold text-xs shadow-lg">
                    ⭐ Featured
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                  {property?.name || 'Loading...'}
                </h3>

                <div className="flex items-center text-gray-600 mt-2">
                  <MapPin size={18} className="text-orange-500 mr-1" />
                  <span className="text-sm">
                    {property?.location?.city || 'City'}, {property?.location?.locality || 'Locality'}
                  </span>
                </div>

                {/* Hotel specific info */}
                {activeTab === 'hotels' && property?.totalRooms > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-5 text-center text-gray-700">
                    <div>
                      <BedDouble size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">{property?.totalRooms} Rooms</p>
                    </div>
                    <div>
                      <Star size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">{property?.roomTypes?.length || 0} Types</p>
                    </div>
                    <div>
                      <MapPin size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">Nearby</p>
                    </div>
                  </div>
                )}

                {/* Banquet specific info */}
                {activeTab === 'banquets' && property?.totalCapacity && (
                  <div className="grid grid-cols-3 gap-4 mt-5 text-center text-gray-700">
                    <div>
                      <Users size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">{property?.totalCapacity?.seating || 0} Seating</p>
                    </div>
                    <div>
                      <Users size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">{property?.totalCapacity?.floating || 0} Floating</p>
                    </div>
                    <div>
                      <MapPin size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">{property?.halls?.length || 0} Halls</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                  {property?.description || 'No description available'}
                </p>

                {/* Contact Info Preview */}
                <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                  {property?.contactInfo?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      <span>{property.contactInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!noProperties && totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-3 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-6 py-3 bg-white border border-blue-500 text-blue-600 rounded-xl disabled:opacity-50 hover:bg-blue-50 transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-5 py-3 rounded-xl transition-colors ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-blue-300 text-blue-600 hover:bg-blue-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 bg-white border border-blue-500 text-blue-600 rounded-xl disabled:opacity-50 hover:bg-blue-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default HotelsBanquetsPage;
