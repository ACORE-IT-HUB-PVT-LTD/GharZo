import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  BedDouble,
  Bath,
  CarFront,
  MapPin,
  Home,
  Building2,
  Hotel,
  Briefcase,
  ShoppingCart,
  BadgeIndianRupee,
  Landmark,
  ProjectorIcon,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
} from "lucide-react";

const PGHostelSection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noProperties, setNoProperties] = useState(false);

  // Filter states from URL
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");

  // Enhanced Carousel states
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    // Read filters from URL params
    const typeParam = searchParams.get("type");
    const budgetParam = searchParams.get("budget");
    const qParam = searchParams.get("q");

    if (typeParam) setSelectedType(typeParam);
    if (budgetParam) setSelectedBudget(budgetParam);
    if (qParam) setSearchQuery(qParam);

    const fetchProperties = async () => {
      setLoading(true);
      setNoProperties(false);

      try {
        const res = await axios.get(
          "https://api.gharzoreality.com/api/public/properties?page=1&limit=100"
        );

        let list = res.data?.data || [];

        // If no type param, show ALL properties
        if (!typeParam || typeParam === "") {
          list = list.filter(
            (p) => p.isActive === undefined || p.isActive === true
          );
        }
        // Filter based on type from URL
        else if (typeParam && typeParam !== "Rent") {
          list = list.filter(
            (p) =>
              ((p.listingType?.toLowerCase() === typeParam.toLowerCase() ||
                p.category?.toLowerCase() === typeParam.toLowerCase()) &&
              (p.isActive === undefined ? true : p.isActive === true))
          );
        }
        // If type is Rent, show all active properties (Rent type)
        else {
          list = list.filter(
            (p) =>
              (p.listingType === "Rent" || p.listingType === "rent") &&
              (p.isActive === undefined ? true : p.isActive === true)
          );
        }

        if (list.length === 0) {
          setNoProperties(true);
          setProperties([]);
          setFilteredProperties([]);
        } else {
          const mapped = list.map((p) => ({
            id: p._id,
            name: p.title || p.name || "Property",
            type: p.listingType || "Rent",
            category: p.category || "",
            lowestPrice: p.price?.amount || 0,
            totalBeds: p.pgDetails?.totalBeds || p.bedrooms || 1,
            totalRooms: p.pgDetails?.totalRooms || Math.ceil((p.pgDetails?.totalBeds || p.bedrooms || 1) / 2),
            images: p.images?.map((img) => img.url) || [],
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
              name: p.ownerId?.name || p.contactInfo?.name || "Property Owner",
            },
            isVerified: p.verificationStatus === "Verified",
            distance: "City location",
            roomType: p.pgDetails?.roomType || "Sharing",
            foodIncluded: p.pgDetails?.foodIncluded || false,
            genderPreference: p.pgDetails?.genderPreference || "Any",
            bathrooms: p.bathrooms || 1,
          }));

          setProperties(mapped);
          setFilteredProperties(mapped);
          setNoProperties(false);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
        setFilteredProperties([]);
        setNoProperties(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  // Enhanced Filter logic with URL params
  useEffect(() => {
    let filtered = properties;

    // Filter by Type
    if (selectedType && selectedType !== "Property Type") {
      filtered = filtered.filter((property) => {
        const matchesType =
          property.type?.toLowerCase() === selectedType.toLowerCase() ||
          property.category?.toLowerCase() === selectedType.toLowerCase();
        return matchesType;
      });
    }

    // Filter by Budget
    if (selectedBudget && selectedBudget !== "Budget") {
      filtered = filtered.filter((property) => {
        const price = parseFloat(property.lowestPrice) || 0;
        
        if (selectedBudget === "Under 5000") {
          return price <= 5000;
        } else if (selectedBudget === "5000-8000") {
          return price >= 5000 && price <= 8000;
        } else if (selectedBudget === "8000-12000") {
          return price >= 8000 && price <= 12000;
        } else if (selectedBudget === "Above 12000") {
          return price >= 12000;
        }
        return true;
      });
    }

    // Filter by Search Query (location, name, etc.)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((property) => {
        const matchesText =
          property.name?.toLowerCase().includes(q) ||
          property.type?.toLowerCase().includes(q) ||
          property.category?.toLowerCase().includes(q) ||
          property.location?.city?.toLowerCase().includes(q) ||
          property.location?.area?.toLowerCase().includes(q) ||
          property.location?.state?.toLowerCase().includes(q);
        return matchesText;
      });
    }

    setFilteredProperties(filtered);
    setCurrentSlide(0);
  }, [searchQuery, selectedType, selectedBudget, properties]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying || filteredProperties.length <= itemsPerView) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredProperties.length, itemsPerView, currentSlide]);

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  // Enhanced Carousel navigation
  const nextSlide = () => {
    const maxSlide = Math.max(0, filteredProperties.length - itemsPerView);
    setCurrentSlide((prev) => (prev < maxSlide ? prev + 1 : 0));
  };

  const prevSlide = () => {
    const maxSlide = Math.max(0, filteredProperties.length - itemsPerView);
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : maxSlide));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Navigation handlers
  const goToRent = () => navigate("/rent");
  const goToSale = () => navigate("/sale");
  const goToCommercial = () => navigate("/commercial");
  const goToPG = () => navigate("/pg");
  const goToHostels = () => navigate("/franchise-request");
  const goToServices = () => navigate("/services");
  const goToHomeLoan = () => navigate("/home-loan");

  const categoryButtons = [
    { label: "Rent", onClick: goToRent, icon: Home },
    { label: "Buy", onClick: goToSale, icon: ShoppingCart },
    { label: "Commercial", onClick: goToCommercial, icon: Building2 },
    { label: "PG/Hostel", onClick: goToPG, icon: Hotel },
    { label: "Franchise", onClick: goToHostels, icon: Briefcase },
    { label: "Services", onClick: goToServices, icon: BadgeIndianRupee },
    { label: "Home Loan", onClick: goToHomeLoan, icon: Landmark },
    { label: "Project", onClick: goToCommercial, icon: ProjectorIcon },
  ];

  const totalSlides = Math.max(0, filteredProperties.length - itemsPerView + 1);
  const maxSlide = Math.max(0, filteredProperties.length - itemsPerView);
  const canNavigate = filteredProperties.length > itemsPerView;

  return (
    <section 
      id="properties-section" 
      className="py-6 sm:py-8 px-4 sm:px-5 lg:px-6 bg-white min-h-screen"
    >
    

      <div className="text-center mb-6 md:mb-8">
        {/* Category Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 max-w-7xl mx-auto px-1">
          {categoryButtons.map((btn, index) => {
            const IconComponent = btn.icon;
            return (
              <motion.button
                key={btn.label}
                onClick={btn.onClick}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className={`
                  group relative overflow-hidden
                  px-2 sm:px-2.5 py-2 sm:py-2.5 
                  rounded-lg sm:rounded-xl font-semibold text-[10px] sm:text-xs
                  min-h-[58px] sm:min-h-[62px] 
                  flex flex-col items-center justify-center gap-0.5 sm:gap-1
                  border transition-all duration-300
                  ${
                    btn.isActive
                      ? "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white border-orange-400/50 shadow-lg shadow-orange-500/40 hover:shadow-xl hover:shadow-orange-600/50"
                      : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white/95 border-slate-600/40 shadow-md shadow-slate-800/30 hover:shadow-lg hover:shadow-slate-700/40 hover:text-white"
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className={`absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-lg sm:rounded-xl transition-opacity duration-300`} />
                <span className="relative z-10 flex flex-col items-center gap-0.5 sm:gap-1">
                  <IconComponent
                    size={16}
                    className={`transition-all duration-300 group-hover:scale-125 ${
                      btn.isActive
                        ? "drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]"
                        : "group-hover:drop-shadow-[0_2px_6px_rgba(255,255,255,0.4)]"
                    }`}
                  />
                  <span className="text-center leading-tight font-bold tracking-wide drop-shadow-sm">
                    {btn.label}
                  </span>
                </span>
                {btn.isActive && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-lg"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedType || selectedBudget) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-6 flex flex-wrap gap-2 items-center"
        >
          <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
          {searchQuery && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Search: {searchQuery}
            </span>
          )}
          {selectedType && selectedType !== "Property Type" && (
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              Type: {selectedType}
            </span>
          )}
          {selectedBudget && selectedBudget !== "Budget" && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Budget: {selectedBudget}
            </span>
          )}
        </motion.div>
      )}

      {/* Property Carousel Section */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Hotel size={80} className="text-gray-300 mb-4" />
          <p className="text-center text-gray-600 text-lg sm:text-xl font-semibold">
            No Properties Available
          </p>
          <p className="text-center text-gray-500 text-sm sm:text-base mt-2">
            {searchQuery || selectedType || selectedBudget
              ? "Try adjusting your filters"
              : "Please check back later"}
          </p>
        </div>
      ) : (
        <>
          {/* Auto-play control - top right */}
          <div className="flex justify-between items-center gap-3 mb-6 max-w-7xl mx-auto">
            <span className="text-sm font-semibold text-gray-600 bg-amber-300 px-4 rounded-2xl">
             Hot Properties
            </span>
            
              {/* Header with title and See All button */}
    
          </div>

 <div className="max-w-7xl mx-auto flex flex-col items-end mb-6 md:mb-8 px-1">
  {/* Yahan agar koi Heading hai toh wo left side rahegi agar aapne 'items-end' hataya, 
      lekin sirf button ko right karne ke liye niche wala style best hai */}
  
  <motion.button
    onClick={() => navigate('/properties')}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="self-end mt-2 sm:mt-0 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
  >
    See all Properties 
    <ArrowRight size={18} />
  </motion.button>
</div>
          {/* Carousel with Centered Navigation Buttons */}
          <div className="max-w-7xl mx-auto overflow-hidden relative">
            {/* Left Navigation Button - Centered vertically */}
            {canNavigate && currentSlide > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border-2 border-orange-500 flex items-center justify-center hover:bg-white transition-all shadow-2xl group"
              >
                <ChevronLeft className="w-6 h-6 text-orange-600 group-hover:-translate-x-0.5 transition-transform" />
              </motion.button>
            )}

            {/* Right Navigation Button - Centered vertically */}
            {canNavigate && currentSlide < maxSlide && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border-2 border-orange-500 flex items-center justify-center hover:bg-white transition-all shadow-2xl group"
              >
                <ChevronRight className="w-6 h-6 text-orange-600 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30
                }}
              >
                {filteredProperties
                  .slice(currentSlide, currentSlide + itemsPerView)
                  .map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      onClick={() => handlePropertyClick(property.id)}
                      className="group bg-white/95 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100"
                    >
                      {/* Image Section - Smaller */}
                      <div className="relative">
                        <img
                          src={property.images?.[0] || "https://via.placeholder.com/400x200"}
                          alt={property.name}
                          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 py-1 rounded-full font-bold text-xs shadow-lg">
                          ₹{property.lowestPrice?.toLocaleString() || 0}/mo
                        </div>
                        {property.isVerified && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-lg">
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Content Section - Compact */}
                      <div className="p-3">
                        <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                          {property.name}
                        </h3>

                        <div className="flex items-center text-gray-600 mt-1.5 text-xs">
                          <MapPin size={12} className="text-orange-500 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {property?.location?.city}, {property?.location?.area}
                          </span>
                        </div>

                        {/* Stats Grid - Compact */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="bg-blue-50 rounded-lg p-1.5 text-center">
                            <BedDouble size={16} className="mx-auto text-blue-600" />
                            <p className="text-[10px] font-semibold text-gray-700 mt-0.5">
                              {property.totalBeds || "N/A"}
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-1.5 text-center">
                            <Bath size={16} className="mx-auto text-blue-600" />
                            <p className="text-[10px] font-semibold text-gray-700 mt-0.5">
                              {property.totalRooms || "N/A"}
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-1.5 text-center">
                            <CarFront size={16} className="mx-auto text-blue-600" />
                            <p className="text-[10px] font-semibold text-gray-700 mt-0.5">
                              Parking
                            </p>
                          </div>
                        </div>

                        {/* Footer - Compact */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full">
                            {property.type}
                          </span>
                          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 py-1 rounded-md text-[10px] font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105">
                            View
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-orange-600 w-8"
                      : "bg-orange-300 hover:bg-orange-400 w-2.5"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default PGHostelSection;