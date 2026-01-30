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

const RentListingPage = () => {
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
        params.append("page", currentPage);
        params.append("limit", propertiesPerPage);
        params.append("listingType", "rent");
        if (searchQuery) params.append("search", searchQuery);
        if (selectedType) params.append("propertyType", selectedType);
        if (selectedBudget) {
          if (selectedBudget === "Under 20K") params.append("maxPrice", "20000");
          if (selectedBudget === "20K-40K") { params.append("minPrice", "20000"); params.append("maxPrice", "40000"); }
          if (selectedBudget === "40K-60K") { params.append("minPrice", "40000"); params.append("maxPrice", "60000"); }
          if (selectedBudget === "Above 60K") params.append("minPrice", "60000");
        }
        const res = await fetch(`https://api.gharzoreality.com/api/public/properties?${params.toString()}`, { signal: controller.signal });
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
        console.error('Error fetching rent properties', err);
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
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
      {/* Back Button + Top Navigation Buttons */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* <div className="flex-1 text-center">
          <div className="inline-flex flex-wrap justify-center gap-4 sm:gap-6">
            <button 
              onClick={() => navigate('/rent')}
              className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-br from-[#0b4f91] via-[#0c2344] to-[#1565c0] text-white shadow-2xl min-w-[120px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">Rent</span>
            </button>
            <button 
              onClick={() => navigate('/sale')}
              className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-white border-2 border-[#0b4f91] text-[#0b4f91] hover:bg-[#0b4f91] hover:text-white transition-all min-w-[120px]"
            >
              Sale
            </button>
            <button 
              onClick={() => navigate('/rooms')}
              className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-white border-2 border-[#0b4f91] text-[#0b4f91] hover:bg-[#0b4f91] hover:text-white transition-all min-w-[120px]"
            >
              Rooms
            </button>
            <button 
              onClick={() => navigate('/pg')}
              className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-white border-2 border-[#0b4f91] text-[#0b4f91] hover:bg-[#0b4f91] hover:text-white transition-all min-w-[120px]"
            >
              PG
            </button>
            <button 
              onClick={() => navigate('/hostels')}
              className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-white border-2 border-[#0b4f91] text-[#0b4f91] hover:bg-[#0b4f91] hover:text-white transition-all min-w-[120px]"
            >
              Hostels
            </button>
          </div>
        </div> */}
      </div>

      {/* Header with Add Listing Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
              Properties for Rent
            </span>
          </h2>
          <p className="mt-2 text-gray-600">Find your perfect rental home</p>
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
              <div className="absolute z-50 mt-2 w-40 bg-white shadow-md rounded-lg border p-2">
                {["Apartment", "Villa", "Studio", "Penthouse"].map((t) => (
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
                {["Under 20K", "20K-40K", "40K-60K", "Above 60K"].map((b) => (
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
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                {property?.name}
              </h3>

              <div className="flex items-center text-gray-600 mt-2">
                <MapPin size={18} className="text-orange-500 mr-1" />
                <span className="text-sm">
                  {property?.location?.city}, {property?.location?.area}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-5 text-center text-gray-700">
                <div>
                  <BedDouble size={20} className="mx-auto text-orange-500" />
                  <p className="text-sm mt-1">{property?.bedrooms} Beds</p>
                </div>
                <div>
                  <Bath size={20} className="mx-auto text-orange-500" />
                  <p className="text-sm mt-1">{property?.bathrooms} Baths</p>
                </div>
                <div>
                  <CarFront size={20} className="mx-auto text-orange-500" />
                  <p className="text-sm mt-1">Parking</p>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-blue-600 uppercase tracking-wider">
                {property?.type}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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

export default RentListingPage;