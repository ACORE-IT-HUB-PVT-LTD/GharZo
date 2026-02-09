import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import axios from "axios";

function ExploreCities() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiZ2hhcnpvcmVhbGl0eSIsImEiOiJjbWxidHB3MnAwcWlkM2ZxdTAwbzA3dTNwIn0.c9lvlGEs7OJccySib0p44g";

  // ✅ Top 10 Areas of Indore with their coordinates
  const indoreAreas = [
    { 
      name: "Vijay Nagar", 
      lat: 22.7196, 
      lng: 75.8577
    },
    { 
      name: "Super Corridor", 
      lat: 22.6920, 
      lng: 75.8859
    },
    { 
      name: "Rajwada", 
      lat: 22.7149, 
      lng: 75.8550
    },
    { 
      name: "AB Road", 
      lat: 22.7058, 
      lng: 75.8697
    },
    { 
      name: "Bhawarkua", 
      lat: 22.6970, 
      lng: 75.8650
    },
    { 
      name: "Palasia", 
      lat: 22.7120, 
      lng: 75.8480
    },
    { 
      name: "MR-10", 
      lat: 22.7350, 
      lng: 75.8450
    },
    { 
      name: "Annapurna", 
      lat: 22.7080, 
      lng: 75.8580
    },
    { 
      name: "Pipliyahana", 
      lat: 22.6850, 
      lng: 75.8750
    },
    { 
      name: "LIG Colony", 
      lat: 22.6980, 
      lng: 75.8720
    },
  ];

  const areaDescriptions = {
    "Vijay Nagar": "Premium residential & commercial hub with malls and offices",
    "Super Corridor": "Fast developing IT & business corridor of Indore",
    "Rajwada": "Historic heart of Indore with palace & vibrant street markets",
    "AB Road": "Main commercial artery with hotels, showrooms & restaurants",
    "Bhawarkua": "Popular student & middle-class residential area",
    "Palasia": "Upscale area known for high-end shopping & dining",
    "MR-10": "Emerging residential & plotted area with good connectivity",
    "Annapurna": "Calm residential locality with good schools & markets",
    "Pipliyahana": "Developing area with affordable housing & new projects",
    "LIG Colony": "Well-planned, peaceful & value-for-money residential area",
  };

  const itemsPerView = {
    sm: 1,
    md: 2,
    lg: 4,
  };

  const getItemsPerView = () => {
    if (window.innerWidth >= 1024) return itemsPerView.lg;
    if (window.innerWidth >= 768) return itemsPerView.md;
    return itemsPerView.sm;
  };

  const [visibleCount, setVisibleCount] = useState(getItemsPerView());

  // ✅ Fetch street view images using Mapbox Static Images API
  const fetchAreaImage = async (areaName, lat, lng) => {
    try {
      // Using Mapbox Static Images API with street view style
      // The URL generates a beautiful street-view like image of the area
      const mapboxImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},15,0,0/600x400@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
      
      return {
        id: areaName,
        name: areaName,
        description: areaDescriptions[areaName] || "Explore this amazing area",
        image: mapboxImageUrl,
        latitude: lat,
        longitude: lng,
      };
    } catch (error) {
      console.error(`Error fetching image for ${areaName}:`, error);
      return {
        id: areaName,
        name: areaName,
        description: areaDescriptions[areaName] || "Explore this amazing area",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format",
        latitude: lat,
        longitude: lng,
      };
    }
  };

  // ✅ Initialize and fetch cities data
  useEffect(() => {
    const initializeCities = async () => {
      try {
        setLoading(true);
        const citiesData = await Promise.all(
          indoreAreas.map((area) =>
            fetchAreaImage(area.name, area.lat, area.lng)
          )
        );
        setCities(citiesData);
      } catch (error) {
        console.error("Error initializing cities:", error);
        setCities(
          indoreAreas.map((area) => ({
            id: area.name,
            name: area.name,
            description: areaDescriptions[area.name],
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format",
            latitude: area.lat,
            longitude: area.lng,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    initializeCities();
  }, []);

  // ✅ Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newCount = getItemsPerView();
      setVisibleCount(newCount);
      setCurrentIndex((prev) => Math.min(prev, cities.length - newCount));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cities.length]);

  // ✅ Auto slide effect
  useEffect(() => {
    if (cities.length === 0) return;

    const maxIndex = cities.length - visibleCount;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [visibleCount, cities.length]);

  const maxIndex = cities.length > 0 ? cities.length - visibleCount : 0;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleCityClick = (cityName) => {
    // Navigate to toparea and pass both city (Indore) and area params
    // so PropertyListMain can fetch all properties and filter by area.
    const destination = `/toparea?city=${encodeURIComponent("Indore")}&area=${encodeURIComponent(
      cityName
    )}`;
    navigate(destination);
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Loading Indore's best areas...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
            <span className="bg-gradient-to-r from-[#0c2344] via-[#0b4f91] to-[#0c2344] bg-clip-text text-transparent">
              Explore Indore's Best Areas
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg bg-yellow-400 rounded-2xl text-black max-w-3xl mx-auto">
            Discover premium localities, modern developments & classic neighborhoods
          </p>
          <div className="w-28 sm:w-32 h-1.5 bg-gradient-to-r from-[#0c2344] to-[#0b4f91] mx-auto mt-6 rounded-full" />
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              }}
            >
              {cities.map((city) => (
                <div
                  key={city.id}
                  className="flex-shrink-0 px-3 sm:px-4 w-full sm:w-1/2 lg:w-1/4"
                >
                  <div
                    onClick={() => handleCityClick(city.name)}
                    className="group bg-white border-2 border-orange-400 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-4"
                  >
                    <div className="relative overflow-hidden h-48 sm:h-56 md:h-64">
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                    </div>

                    <div className="p-5 sm:p-6 text-center">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#0b4f91] transition-colors">
                        {city.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 line-clamp-2">
                        {city.description}
                      </p>

                      <button className="inline-flex items-center px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#0c2344] to-[#0b4f91] text-white font-medium rounded-full shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base">
                        Explore Area →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dark Navigation Buttons */}
          {cities.length > visibleCount && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 bg-black/75 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all duration-300 shadow-xl z-10 border border-white/10"
              >
                <span className="text-2xl font-bold">←</span>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 bg-black/75 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all duration-300 shadow-xl z-10 border border-white/10"
              >
                <span className="text-2xl font-bold">→</span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default ExploreCities;