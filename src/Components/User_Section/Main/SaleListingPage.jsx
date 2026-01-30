import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BedDouble,
  Bath,
  CarFront,
  MapPin,
  Home,
  IndianRupee,
  ChevronDown,
  Plus,
  Square,
  ArrowLeft,
} from "lucide-react";
import baseurl from "../../../../BaseUrl";

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
  
  const propertiesPerPage = 9;

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', propertiesPerPage);
        params.append('listingType', 'sale');
        if (searchQuery) params.append('search', searchQuery);
        if (selectedType) params.append('propertyType', selectedType);
        if (selectedBudget) {
          if (selectedBudget === 'Under 50L') params.append('maxPrice', '5000000');
          if (selectedBudget === '50L-1Cr') { params.append('minPrice', '5000000'); params.append('maxPrice', '10000000'); }
          if (selectedBudget === '1Cr-2Cr') { params.append('minPrice', '10000000'); params.append('maxPrice', '20000000'); }
          if (selectedBudget === 'Above 2Cr') params.append('minPrice', '20000000');
        }
        const res = await fetch(`${baseurl}api/public/properties?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        const list = data?.data || [];
        const mapped = list.map((p) => ({
          id: p._id,
          name: p.title || p.name,
          image: p.images?.[0]?.url || "",
          price: p.price?.amount || 0,
          location: p.location || { city: "", area: "" },
          bedrooms: p.bhk || p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          area: p.area?.carpet || p.area || "",
          type: p.propertyType || p.type || "",
        }));
        setFilteredProperties(mapped);
        setTotalPages(data.totalPages || Math.ceil((data.total || mapped.length) / propertiesPerPage));
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching sale properties', err);
        setFilteredProperties([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
    return () => controller.abort();
  }, [currentPage, searchQuery, selectedType, selectedBudget]);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-green-50/50 to-white min-h-screen">
      {/* Back Button + Top Navigation Buttons */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="flex-1 text-center">
          {/* You can add category navigation buttons here later if needed */}
        </div>
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
          <p className="mt-2 text-gray-600">Invest in your dream property</p>
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
              placeholder="Search by city, area..."
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
              <div className="absolute z-50 mt-2 w-48 bg-white shadow-md rounded-lg border p-2">
                {["Villa", "Apartment", "Duplex", "Penthouse", "Farmhouse"].map((t) => (
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

      {/* Property Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {(loading ? Array.from({length: propertiesPerPage}) : filteredProperties).map((property, index) => (
          !property ? (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="w-full h-60 bg-gray-200 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="grid grid-cols-3 gap-4">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />)}
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.03 }}
              onClick={() => handlePropertyClick(property.id)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500"
            >
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                  ₹{(property.price / 100000).toFixed(1)}L
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Square size={14} />
                  {property.area}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                  {property.name}
                </h3>

                <div className="flex items-center text-gray-600 mt-2">
                  <MapPin size={18} className="text-orange-500 mr-1" />
                  <span className="text-sm">
                    {property.location.city}, {property.location.area}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-5 text-center text-gray-700">
                  <div>
                    <BedDouble size={20} className="mx-auto text-orange-500" />
                    <p className="text-sm mt-1">{property.bedrooms} Beds</p>
                  </div>
                  <div>
                    <Bath size={20} className="mx-auto text-orange-500" />
                    <p className="text-sm mt-1">{property.bathrooms} Baths</p>
                  </div>
                  <div>
                    <CarFront size={20} className="mx-auto text-orange-500" />
                    <p className="text-sm mt-1">Parking</p>
                  </div>
                </div>

                <p className="mt-4 text-sm font-medium text-green-600 uppercase tracking-wider">
                  {property.type}
                </p>
              </div>
            </motion.div>
          )
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-3 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-6 py-3 bg-white border border-green-500 text-green-600 rounded-xl disabled:opacity-50 hover:bg-green-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-5 py-3 rounded-xl ${
                currentPage === i + 1
                  ? "bg-green-600 text-white"
                  : "bg-white border border-green-300 text-green-600 hover:bg-green-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 bg-white border border-green-500 text-green-600 rounded-xl disabled:opacity-50 hover:bg-green-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default SaleListingPage;