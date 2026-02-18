import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BedDouble,
  Bath,
  CarFront,
  MapPin,
  Search,
  Home,
  IndianRupee,
  ChevronDown,
  Plus,
  ArrowLeft,
  SlidersHorizontal,
  X,
} from "lucide-react";
import FilterBar from "./FilterBar";

const RentListingPage = () => {
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
  const [priceRange, setPriceRange] = useState([0, 100000]); // Min-Max in rupees
  const [selectedBHK, setSelectedBHK] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // FilterBar States
  const [listingType, setListingType] = useState("Rent");
  const [selectedLocalities, setSelectedLocalities] = useState([]);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [showFilterBar, setShowFilterBar] = useState(true);
  
  // Plot specific filters
  const [cornerPlot, setCornerPlot] = useState(false);
  const [gatedColony, setGatedColony] = useState(false);
  
  const propertiesPerPage = 9;

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  const toggleBHK = (val) => {
    setSelectedBHK(prev => 
      prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPropertyType("");
    setPriceRange([0, 100000]);
    setSelectedBHK([]);
    setSelectedStatus("");
    setVerifiedOnly(false);
    setCornerPlot(false);
    setGatedColony(false);
    setCurrentPage(1);
    // Reset FilterBar states
    setListingType("Rent");
    setSelectedLocalities([]);
    setMinBudget("");
    setMaxBudget("");
    setSelectedPropertyTypes([]);
  };

  // Handle filter changes from FilterBar
  const handleFilterChange = (filters) => {
    if (filters.searchQuery !== undefined) setSearchQuery(filters.searchQuery);
    if (filters.listingType !== undefined) setListingType(filters.listingType);
    if (filters.selectedLocalities !== undefined) setSelectedLocalities(filters.selectedLocalities);
    if (filters.minBudget !== undefined) setMinBudget(filters.minBudget);
    if (filters.maxBudget !== undefined) setMaxBudget(filters.maxBudget);
    if (filters.selectedBHK !== undefined) setSelectedBHK(filters.selectedBHK);
    if (filters.selectedPropertyTypes !== undefined) setSelectedPropertyTypes(filters.selectedPropertyTypes);
    
    // Update price range for existing filter logic
    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
      setPriceRange([
        filters.minBudget ? parseInt(filters.minBudget) : 0,
        filters.maxBudget ? parseInt(filters.maxBudget) : 100000
      ]);
    }
    
    // Update property type for existing filter logic
    if (filters.selectedPropertyTypes && filters.selectedPropertyTypes.length > 0) {
      setPropertyType(filters.selectedPropertyTypes[0]);
    } else if (filters.selectedPropertyTypes !== undefined) {
      setPropertyType("");
    }
    
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
        
        // Filter only properties with listingType = "Rent" or "Buy"
        let list = data?.data || [];
        list = list.filter(p => p.listingType === listingType);
        
        // Apply search filter
        if (searchQuery) {
          list = list.filter(p => 
            p.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.location?.locality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.location?.area?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Apply locality filter
        if (selectedLocalities.length > 0) {
          list = list.filter(p => 
            selectedLocalities.some(loc => 
              p.location?.locality?.toLowerCase() === loc.toLowerCase()
            )
          );
        }
        
        // Apply property type filter from FilterBar
        if (selectedPropertyTypes.length > 0) {
          list = list.filter(p => 
            selectedPropertyTypes.some(type => 
              p.propertyType?.toLowerCase().includes(type.toLowerCase().split('/')[0])
            )
          );
        }
        
        // Apply property type filter
        if (propertyType) {
          list = list.filter(p => p.propertyType === propertyType);
        }
        
        // Apply price range filter
        list = list.filter(p => {
          const price = p.price?.amount || 0;
          return price >= priceRange[0] && price <= priceRange[1];
        });
        
        // Apply BHK filter
        if (selectedBHK.length > 0) {
          list = list.filter(p => {
            const bhk = p.bhk || p.bedrooms || 0;
            return selectedBHK.some(selected => {
              if (selected === "1 BHK") return bhk === 1;
              if (selected === "2 BHK") return bhk === 2;
              if (selected === "3 BHK") return bhk === 3;
              if (selected === "4+ BHK") return bhk >= 4;
              return false;
            });
          });
        }
        
        // Apply status filter
        if (selectedStatus) {
          list = list.filter(p => p.constructionStatus === selectedStatus);
        }
        
        // Apply verified filter
        if (verifiedOnly) {
          list = list.filter(p => p.verified === true);
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
            bedrooms: p.bhk || p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            area: p.area?.carpet || p.area || "",
            type: p.propertyType || p.category || "",
            verified: p.verified || false,
          }));
          
          setFilteredProperties(mapped);
          setTotalPages(Math.ceil(list.length / propertiesPerPage));
          setNoProperties(false);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching rent properties', err);
        setFilteredProperties([]);
        setTotalPages(1);
        setNoProperties(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    return () => controller.abort();
  }, [currentPage, searchQuery, propertyType, priceRange, selectedBHK, selectedStatus, verifiedOnly, listingType, selectedLocalities, minBudget, maxBudget, selectedPropertyTypes]);

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

      {/* FilterBar Component */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        listingType={listingType}
        setListingType={setListingType}
        selectedLocalities={selectedLocalities}
        setSelectedLocalities={setSelectedLocalities}
        minBudget={minBudget}
        setMinBudget={setMinBudget}
        maxBudget={maxBudget}
        setMaxBudget={setMaxBudget}
        selectedBHK={selectedBHK}
        setSelectedBHK={setSelectedBHK}
        selectedPropertyTypes={selectedPropertyTypes}
        setSelectedPropertyTypes={setSelectedPropertyTypes}
        onFilterChange={handleFilterChange}
      />

      {/* Header with Add Listing Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
              Properties for {listingType}
            </span>
          </h2>
          <p className="mt-2 text-gray-600">Find your perfect {listingType === 'Rent' ? 'rental' : 'buy'} home</p>
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

      {/* Search Bar - Hidden, using FilterBar instead */}
      {/* <div className="max-w-5xl mx-auto mb-6">
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
      </div> */}

      {/* Active Filters Display */}
      {(propertyType || selectedBHK.length > 0 || selectedStatus || verifiedOnly || priceRange[0] > 0 || priceRange[1] < 100000) && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
            
            {propertyType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {propertyType}
                <X size={14} className="cursor-pointer" onClick={() => setPropertyType("")} />
              </span>
            )}
            
            {selectedBHK.map(bhk => (
              <span key={bhk} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {bhk}
                <X size={14} className="cursor-pointer" onClick={() => toggleBHK(bhk)} />
              </span>
            ))}
            
            {selectedStatus && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {selectedStatus}
                <X size={14} className="cursor-pointer" onClick={() => setSelectedStatus("")} />
              </span>
            )}
            
            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Verified Only
                <X size={14} className="cursor-pointer" onClick={() => setVerifiedOnly(false)} />
              </span>
            )}
            
            {(priceRange[0] > 0 || priceRange[1] < 100000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                <X size={14} className="cursor-pointer" onClick={() => setPriceRange([0, 100000])} />
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
              No Properties Found
            </h3>
            <p className="text-gray-600 mb-6">
              No rental properties match your search criteria at the moment.
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
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                  ₹{(property?.price || 0).toLocaleString()}/mo
                </div>
                {property?.verified && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full font-semibold text-xs shadow-lg">
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

                <div className="grid grid-cols-3 gap-4 mt-5 text-center text-gray-700">
                  <div>
                    <BedDouble size={20} className="mx-auto text-orange-500" />
                    <p className="text-sm mt-1">{property?.bedrooms || 0} Beds</p>
                  </div>
                  <div>
                    <Bath size={20} className="mx-auto text-orange-500" />
                    <p className="text-sm mt-1">{property?.bathrooms || 0} Baths</p>
                  </div>
                  <div>
                    <CarFront size={20} className="mx-auto text-orange-500" />
                    <p className="text-sm mt-1">Parking</p>
                  </div>
                </div>

                <p className="mt-4 text-sm font-medium text-blue-600 uppercase tracking-wider">
                  {property?.type || 'Property'}
                </p>
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

export default RentListingPage;