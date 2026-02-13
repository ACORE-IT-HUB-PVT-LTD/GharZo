import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BedDouble,
  Bath,
  MapPin,
  Home,
  IndianRupee,
  ChevronDown,
  Plus,
  Users,
  Wifi,
  ArrowLeft,
  Building2,
  SlidersHorizontal,
  X,
  Square,
} from "lucide-react";

const CommercialListingPage = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [noProperties, setNoProperties] = useState(false);
  const [user, setUser] = useState(null); // Add your user state logic
  
  // Advanced Filter States
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000000]); // 0 to 1 Cr for commercial
  const [areaRange, setAreaRange] = useState([0, 50000]); // 0 to 50,000 sqft
  const [listingType, setListingType] = useState(""); // Rent or Sale
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [furnishingStatus, setFurnishingStatus] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const propertiesPerPage = 9;

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(i => i !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPropertyType("");
    setPriceRange([0, 10000000]);
    setAreaRange([0, 50000]);
    setListingType("");
    setSelectedAmenities([]);
    setVerifiedOnly(false);
    setFurnishingStatus("");
    setCurrentPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchProperties = async () => {
      setLoading(true);
      setNoProperties(false);
      try {
        const params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("limit", propertiesPerPage);
        
        const res = await fetch(`https://api.gharzoreality.com/api/public/properties?${params.toString()}`, { 
          signal: controller.signal 
        });
        const data = await res.json();
        
        // Filter only properties with category = "Commercial"
        let list = data?.data || [];
        list = list.filter(p => p.category === "Commercial");
        
        // Apply search filter
        if (searchQuery) {
          list = list.filter(p => 
            p.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.location?.locality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.location?.area?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Apply property type filter
        if (propertyType) {
          list = list.filter(p => p.propertyType === propertyType);
        }
        
        // Apply listing type filter (Rent/Sale)
        if (listingType) {
          list = list.filter(p => p.listingType === listingType);
        }
        
        // Apply price range filter
        list = list.filter(p => {
          const price = p.price?.amount || 0;
          return price >= priceRange[0] && price <= priceRange[1];
        });
        
        // Apply area range filter
        list = list.filter(p => {
          const area = p.area?.carpet || p.area?.builtUp || 0;
          return area >= areaRange[0] && area <= areaRange[1];
        });
        
        // Apply furnishing status filter
        if (furnishingStatus) {
          list = list.filter(p => p.furnishingStatus === furnishingStatus);
        }
        
        // Apply verified filter
        if (verifiedOnly) {
          list = list.filter(p => p.verified === true);
        }
        
        // Apply amenities filter
        if (selectedAmenities.length > 0) {
          list = list.filter(p => {
            const propertyAmenities = p.amenitiesList || p.amenities?.basic || [];
            return selectedAmenities.every(amenity => 
              propertyAmenities.some(pAmenity => 
                pAmenity.toLowerCase().includes(amenity.toLowerCase())
              )
            );
          });
        }
        
        // Check if no properties found
        if (list.length === 0) {
          setNoProperties(true);
          setFilteredProperties([]);
          setTotalPages(1);
        } else {
          // Map properties to display format
          const mapped = list.map((p) => ({
            id: p._id,
            name: p.title || p.name,
            image: p.images?.[0]?.url || "",
            price: p.price?.amount || 0,
            location: p.location || { city: "", locality: "" },
            capacity: p.capacity || 0,
            amenities: p.amenitiesList || p.amenities?.basic || [],
            area: p.area?.carpet || p.area?.builtUp || "",
            bathrooms: p.bathrooms || 0,
            type: p.propertyType || p.category || "",
            listingType: p.listingType || "",
            verified: p.verified || false,
          }));
          
          setFilteredProperties(mapped);
          setTotalPages(Math.ceil(list.length / propertiesPerPage));
          setNoProperties(false);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching commercial properties', err);
        setFilteredProperties([]);
        setTotalPages(1);
        setNoProperties(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    return () => controller.abort();
  }, [currentPage, searchQuery, propertyType, priceRange, areaRange, listingType, selectedAmenities, verifiedOnly, furnishingStatus]);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-purple-50/50 to-white min-h-screen">
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

      {/* Header with Add Listing Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
              Commercial Properties 
            </span>
          </h2>
          <p className="mt-2 text-gray-600">Find the perfect space for your business</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!user) {
              navigate('/login');
            } else {
              navigate('/add-listing');
            }
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          Add Your Properties 
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4">
          <div className="flex-1 relative w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
            <input
              type="text"
              placeholder="Search by city, locality..."
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
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">All Property Types</option>
                <option value="Office">Office</option>
                <option value="Shop">Shop / Retail</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Showroom">Showroom</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Coworking">Co-working Space</option>
              </select>

              <select 
                className="border rounded-full px-4 py-2 text-sm bg-purple-50 text-purple-700 border-purple-200 focus:outline-none cursor-pointer"
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
              >
                <option value="">Rent & Sale</option>
                <option value="Rent">For Rent</option>
                <option value="Sale">For Sale</option>
              </select>

              <label className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="accent-purple-600"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <span className="text-purple-600 font-semibold">Verified ✅</span>
              </label>

              <button 
                className="text-sm text-blue-600 font-medium ml-auto hover:underline"
                onClick={resetFilters}
              >
                Reset All Filters
              </button>
            </div>

            <hr className="mb-6" />

            {/* Dynamic Filter Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Price Range */}
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
                    max="10000000" 
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₹{(priceRange[0] / 100000).toFixed(1)}L</span>
                    <span>₹{(priceRange[1] / 10000000).toFixed(1)}Cr</span>
                  </div>
                </div>
              </div>

              {/* Area Range */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Square size={18} className="text-purple-600" />
                  Area (sq.ft)
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      placeholder="Min"
                      value={areaRange[0]}
                      onChange={(e) => setAreaRange([Number(e.target.value), areaRange[1]])}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                      type="number"
                      placeholder="Max"
                      value={areaRange[1]}
                      onChange={(e) => setAreaRange([areaRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50000" 
                    step="500"
                    value={areaRange[1]}
                    onChange={(e) => setAreaRange([areaRange[0], Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{areaRange[0]} sqft</span>
                    <span>{areaRange[1]} sqft</span>
                  </div>
                </div>
              </div>

              {/* Furnishing Status */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Furnishing</h3>
                <div className="flex flex-wrap gap-2">
                  {['Furnished', 'Semi-Furnished', 'Unfurnished'].map((status) => (
                    <button 
                      key={status}
                      onClick={() => setFurnishingStatus(furnishingStatus === status ? "" : status)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                        furnishingStatus === status
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities - Commercial Specific */}
              <div className="space-y-3 lg:col-span-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Wifi size={18} className="text-purple-600" />
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Parking', 'WiFi', 'AC', 'Power Backup', 'Elevator', 'Cafeteria', 'Reception', 'Security', 'Conference Room', 'Pantry'].map((amenity) => (
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
        </motion.div>
      )}

      {/* Active Filters Display */}
      {(propertyType || listingType || selectedAmenities.length > 0 || furnishingStatus || verifiedOnly || priceRange[0] > 0 || priceRange[1] < 10000000 || areaRange[0] > 0 || areaRange[1] < 50000) && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
            
            {propertyType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {propertyType}
                <X size={14} className="cursor-pointer" onClick={() => setPropertyType("")} />
              </span>
            )}
            
            {listingType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                For {listingType}
                <X size={14} className="cursor-pointer" onClick={() => setListingType("")} />
              </span>
            )}
            
            {selectedAmenities.map(amenity => (
              <span key={amenity} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {amenity}
                <X size={14} className="cursor-pointer" onClick={() => toggleAmenity(amenity)} />
              </span>
            ))}
            
            {furnishingStatus && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {furnishingStatus}
                <X size={14} className="cursor-pointer" onClick={() => setFurnishingStatus("")} />
              </span>
            )}
            
            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Verified Only
                <X size={14} className="cursor-pointer" onClick={() => setVerifiedOnly(false)} />
              </span>
            )}
            
            {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                ₹{(priceRange[0] / 100000).toFixed(1)}L - ₹{(priceRange[1] / 10000000).toFixed(1)}Cr
                <X size={14} className="cursor-pointer" onClick={() => setPriceRange([0, 10000000])} />
              </span>
            )}
            
            {(areaRange[0] > 0 || areaRange[1] < 50000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {areaRange[0]} - {areaRange[1]} sqft
                <X size={14} className="cursor-pointer" onClick={() => setAreaRange([0, 50000])} />
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
            <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Commercial Properties Found
            </h3>
            <p className="text-gray-600 mb-6">
              No commercial properties match your search criteria at the moment.
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
          {(loading ? Array.from({length: propertiesPerPage}) : filteredProperties).map((property, index) => (
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
                <div className="absolute top-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                  ₹{(property?.price || 0).toLocaleString()}{property?.listingType === "Rent" ? "/mo" : ""}
                </div>
                {property?.area && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {property?.area} sqft
                  </div>
                )}
                {property?.verified && (
                  <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full font-semibold text-xs shadow-lg">
                    ✓ Verified
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

                {property?.amenities && property.amenities.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {property.amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        +{property.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-5 text-center text-gray-700">
                  <div>
                    <Building2 size={20} className="mx-auto text-orange-500" />
                    <p className="text-sm mt-1">{property?.type || 'Commercial'}</p>
                  </div>
                  <div>
                    <Bath size={20} className="mx-auto text-orange-500" />
                    <p className="text-sm mt-1">{property?.bathrooms || 0} Baths</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-600 uppercase tracking-wider">
                    {property?.listingType || 'For Sale'}
                  </p>
                  {property?.area && (
                    <p className="text-xs text-gray-500">
                      ₹{Math.round((property?.price || 0) / (property?.area || 1))}/sqft
                    </p>
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
            className="px-6 py-3 bg-white border border-purple-500 text-purple-600 rounded-xl disabled:opacity-50 hover:bg-purple-50 transition-colors"
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
                    ? "bg-purple-600 text-white"
                    : "bg-white border border-purple-300 text-purple-600 hover:bg-purple-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 bg-white border border-purple-500 text-purple-600 rounded-xl disabled:opacity-50 hover:bg-purple-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default CommercialListingPage;