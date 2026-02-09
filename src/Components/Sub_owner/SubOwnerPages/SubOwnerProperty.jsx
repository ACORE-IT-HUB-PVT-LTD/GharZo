import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl";
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaHome,
  FaArrowRight,
  FaLayerGroup
} from "react-icons/fa";

const Property = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("usertoken");
        if (!token) {
          toast.error("Please login to view properties", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${baseurl}api/sub-owner/properties`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (response.ok && data.success) {
          setProperties(data.properties);
        } else {
          toast.error("Failed to fetch properties", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("An error occurred while fetching properties", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [navigate]);

  const handleCardClick = (propertyId) => {
    navigate(`/sub_owner/property/${propertyId}`);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="h-48 sm:h-56 lg:h-64 bg-gray-300"></div>
          <div className="p-4 sm:p-5">
            <div className="h-6 bg-gray-300 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
      <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-[#003366] to-[#004d99] rounded-full flex items-center justify-center mb-6 shadow-2xl">
        <FaBuilding className="text-4xl sm:text-5xl lg:text-6xl text-white" />
      </div>
      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#003366] mb-3">No Properties Found</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-6 text-center max-w-md px-4">
        You don't have any properties assigned yet. Please contact your administrator.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-gradient-to-r from-[#FF6B35] to-[#ff8659] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        Refresh Page
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <ToastContainer />
      
      <div className="max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#003366] mb-2 flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mt-6 bg-gradient-to-br from-[#FF6B35] to-[#ff8659] rounded-xl flex items-center justify-center shadow-lg">
                  <FaBuilding className="text-xl sm:text-2xl lg:text-3xl text-white mt-2" />
                </div>
                My Properties
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 ml-0 sm:ml-14 lg:ml-16">
                Manage and view all your assigned properties
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border-2 border-[#FF6B35]">
              <div className="flex items-center gap-2">
                <FaLayerGroup className="text-[#003366] text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Total Properties</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#003366]">
                    {properties.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingSkeleton />
        ) : properties.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {properties.map((property, index) => (
              <div
                key={property.id}
                onClick={() => handleCardClick(property.id)}
                className="group bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0
                }}
              >
                {/* Image Carousel with Overlay */}
                <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <Carousel
                    autoPlay
                    infiniteLoop
                    showThumbs={false}
                    showStatus={false}
                    interval={3000}
                    showArrows={false}
                    showIndicators={true}
                    className="h-full"
                    renderIndicator={(onClickHandler, isSelected, index, label) => {
                      const defStyle = {
                        marginLeft: 4,
                        marginRight: 4,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        display: 'inline-block',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#FF6B35' : 'rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.3s ease'
                      };
                      return (
                        <span
                          style={defStyle}
                          onClick={onClickHandler}
                          onKeyDown={onClickHandler}
                          key={index}
                          role="button"
                          tabIndex={0}
                          aria-label={`${label} ${index + 1}`}
                        />
                      );
                    }}
                  >
                    {property.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="h-48 sm:h-56 lg:h-64">
                        <img
                          src={image}
                          alt={`${property.name} ${imgIndex + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </Carousel>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
                  
                  {/* Property Type Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-gradient-to-r from-[#FF6B35] to-[#ff8659] text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                      <FaHome className="text-xs" />
                      {property.type}
                    </span>
                  </div>

                  {/* Hover Arrow Icon */}
                  <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <FaArrowRight className="text-[#FF6B35]" />
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4 sm:p-5">
                  {/* Property Name */}
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#003366] mb-2 group-hover:text-[#FF6B35] transition-colors duration-300 line-clamp-1">
                    {property.name}
                  </h2>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <FaMapMarkerAlt className="text-[#FF6B35] flex-shrink-0" />
                    <p className="text-sm sm:text-base line-clamp-1">{property.city}</p>
                  </div>

                  {/* Assigned Date */}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white px-3 py-2 rounded-lg shadow-md">
                    <FaCalendarAlt className="flex-shrink-0 text-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs opacity-90">Assigned Date</p>
                      <p className="text-sm font-semibold truncate">
                        {new Date(property.assignment.assignedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Border Accent */}
                <div className="h-1 bg-gradient-to-r from-[#003366] via-[#FF6B35] to-[#003366] group-hover:from-[#FF6B35] group-hover:via-[#003366] group-hover:to-[#FF6B35] transition-all duration-500"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add fadeInUp animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .carousel-root {
          height: 100%;
        }

        .carousel .slider-wrapper {
          height: 100%;
        }

        .carousel .slider {
          height: 100%;
        }

        .carousel .control-dots {
          bottom: 10px;
          margin: 0;
        }

        .carousel .control-dots .dot {
          box-shadow: none;
          background: rgba(255, 255, 255, 0.5);
          width: 8px;
          height: 8px;
        }

        .carousel .control-dots .dot.selected {
          background: #FF6B35;
        }
      `}</style>
    </div>
  );
};

export default Property;