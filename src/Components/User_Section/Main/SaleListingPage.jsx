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
} from "lucide-react";

const SaleListingPage = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [noProperties, setNoProperties] = useState(false);
  
  const propertiesPerPage = 9;

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
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
        
        // Filter only properties with listingType = "Sale"
        let list = data?.data || [];
        list = list.filter(p => p.listingType === "Sale");
        
        // Apply search filter
        if (searchQuery) {
          list = list.filter(p => 
            p.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.location?.locality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.location?.area?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Apply property type filter
        if (selectedType) {
          list = list.filter(p => p.propertyType === selectedType);
        }
        
        // Apply budget filter
        if (selectedBudget) {
          list = list.filter(p => {
            const price = p.price?.amount || 0;
            if (selectedBudget === "Under 50L") return price < 5000000;
            if (selectedBudget === "50L-1Cr") return price >= 5000000 && price <= 10000000;
            if (selectedBudget === "1Cr-2Cr") return price >= 10000000 && price <= 20000000;
            if (selectedBudget === "Above 2Cr") return price > 20000000;
            return true;
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
            bedrooms: p.bhk || p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            area: p.area?.carpet || p.area || "",
            type: p.propertyType || p.category || "",
          }));
          
          setFilteredProperties(mapped);
          setTotalPages(Math.ceil(list.length / propertiesPerPage));
          setNoProperties(false);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching sale properties', err);
        setFilteredProperties([]);
        setTotalPages(1);
        setNoProperties(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    return () => controller.abort();
  }, [currentPage, searchQuery, selectedType, selectedBudget]);

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

      {/* Header with Add Listing Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
              Properties for Sale
            </span>
          </h2>
          <p className="mt-2 text-gray-600">Find your dream property to buy</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/add-listing')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          Add Your Properties
        </motion.button>
      </div>

      {/* Search + Filters */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col md:flex-row items-center gap-4">
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

          <div className="hidden md:block w-px h-10 bg-gray-300" />

          <div className="relative">
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-4 rounded-xl border border-gray-200 hover:border-orange-400 text-gray-700"
            >
              <Home size={18} />
              {selectedType || "Property Type"}
              <ChevronDown size={18} />
            </button>
            {showTypeDropdown && (
              <div className="absolute z-50 mt-2 w-40 bg-white shadow-md rounded-lg border p-2">
                <p
                  onClick={() => {
                    setSelectedType("");
                    setShowTypeDropdown(false);
                  }}
                  className="p-2 cursor-pointer hover:bg-orange-50 rounded-md font-semibold text-gray-600"
                >
                  All Types
                </p>
                {["Apartment", "Villa", "Studio", "Penthouse", "Office", "Shop"].map((t) => (
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

          <div className="relative">
            <button
              onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
              className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-4 rounded-xl border border-gray-200 hover:border-orange-400 text-gray-700"
            >
              <IndianRupee size={18} />
              {selectedBudget || "Budget"}
              <ChevronDown size={18} />
            </button>
            {showBudgetDropdown && (
              <div className="absolute z-50 mt-2 w-48 bg-white shadow-md rounded-lg border p-2">
                <p
                  onClick={() => {
                    setSelectedBudget("");
                    setShowBudgetDropdown(false);
                  }}
                  className="p-2 cursor-pointer hover:bg-orange-50 rounded-md font-semibold text-gray-600"
                >
                  All Budgets
                </p>
                {["Under 50L", "50L-1Cr", "1Cr-2Cr", "Above 2Cr"].map((b) => (
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
        </div>
      </div>

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
              No properties for sale match your search criteria at the moment.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("");
                setSelectedBudget("");
                setCurrentPage(1);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Clear Filters
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
                <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                  ₹{(property?.price || 0).toLocaleString()}
                </div>
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
            className="px-6 py-3 bg-white border border-blue-500 text-blue-600 rounded-xl disabled:opacity-50 hover:bg-blue-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-5 py-3 rounded-xl ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-blue-300 text-blue-600 hover:bg-blue-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 bg-white border border-blue-500 text-blue-600 rounded-xl disabled:opacity-50 hover:bg-blue-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default SaleListingPage;