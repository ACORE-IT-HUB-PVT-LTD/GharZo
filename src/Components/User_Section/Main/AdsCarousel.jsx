import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPause, FaPlay } from 'react-icons/fa';

const AdsCarousel = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const autoPlayRef = useRef(null);

  // Fetch advertisements from API
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.gharzoreality.com/api/v2/advertisements/public/placement/homepage_hero'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch advertisements');
        }
        
        const data = await response.json();
        
        // Filter only banner type ads and format them
        const bannerAds = (data.data || [])
          .filter((ad) => ad.adType === 'banner' || ad.adType === 'video')
          .map((ad) => ({
            id: ad.id,
            title: ad.title,
            description: ad.title, // Using title as description since API doesn't provide it
            image: window.innerWidth < 768 ? ad.media.mobileImage.url : ad.media.desktopImage.url,
            cta: 'View Details',
            badge: ad.priority ? `Priority: ${ad.priority}` : 'Featured',
            clickUrl: ad.clickAction?.url,
            openInNewTab: ad.clickAction?.openInNewTab || true
          }));

        if (bannerAds.length === 0) {
          throw new Error('No banner ads available');
        }

        setAdvertisements(bannerAds);
        setError(null);
      } catch (err) {
        console.error('Error fetching advertisements:', err);
        setError(err.message);
        // Fallback to dummy data if API fails
        setAdvertisements([
          {
            id: 1,
            title: 'Luxury Apartments in Vijay Nagar',
            description: 'Premium 3BHK & 4BHK apartments starting from ₹75 Lakhs',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
            cta: 'View Details',
            badge: 'New Launch',
            clickUrl: '#',
            openInNewTab: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && advertisements.length > 0) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentSlide, isAutoPlaying, advertisements.length]);

  const handlePrevious = () => {
    if (advertisements.length === 0) return;
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? advertisements.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (advertisements.length === 0) return;
    setDirection(1);
    setCurrentSlide((prev) => (prev === advertisements.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    if (advertisements.length === 0) return;
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Handle CTA button click
  const handleCtaClick = () => {
    const currentAd = advertisements[currentSlide];
    if (currentAd?.clickUrl) {
      window.open(
        currentAd.clickUrl,
        currentAd.openInNewTab ? '_blank' : '_self'
      );
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setIsAutoPlaying(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setCurrentX(e.pageX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const diff = startX - currentX;
    const threshold = 50;

    if (diff > threshold) {
      handleNext();
    } else if (diff < -threshold) {
      handlePrevious();
    }

    setStartX(0);
    setCurrentX(0);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e) => {
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const diff = startX - currentX;
    const threshold = 50;

    if (diff > threshold) {
      handleNext();
    } else if (diff < -threshold) {
      handlePrevious();
    }

    setStartX(0);
    setCurrentX(0);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="relative h-[200px] sm:h-[280px] md:h-[340px] lg:h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-white border-t-blue-600"></div>
              <p className="text-white mt-4">Loading advertisements...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with fallback
  if (advertisements.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="relative h-[200px] sm:h-[280px] md:h-[340px] lg:h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-white text-lg">No advertisements available</p>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Carousel Container */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-xl">
        {/* Carousel Wrapper */}
        <div
          className="relative h-[200px] sm:h-[280px] md:h-[340px] lg:h-[400px] overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0"
            >
              {/* Background Image with Overlay */}
              <div className="relative h-full w-full">
                <img
                  src={advertisements[currentSlide].image}
                  alt={advertisements[currentSlide].title}
                  className="w-full h-full object-cover"
                  draggable="false"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/1200x400?text=Ad+Image';
                  }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 lg:p-16">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block mb-4"
                  >
                    <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
                      {advertisements[currentSlide].badge}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight"
                  >
                    {advertisements[currentSlide].title}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl"
                  >
                    {advertisements[currentSlide].description}
                  </motion.p>

                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCtaClick}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    {advertisements[currentSlide].cta}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 z-10 group"
          aria-label="Previous slide"
        >
          <FaChevronLeft className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 z-10 group"
          aria-label="Next slide"
        >
          <FaChevronRight className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform" />
        </button>

        {/* Auto-play Toggle */}
        <button
          onClick={toggleAutoPlay}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 z-10"
          aria-label={isAutoPlaying ? 'Pause autoplay' : 'Play autoplay'}
        >
          {isAutoPlaying ? (
            <FaPause className="text-sm sm:text-base" />
          ) : (
            <FaPlay className="text-sm sm:text-base ml-0.5" />
          )}
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
          {advertisements.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-8 sm:w-10 md:w-12 h-2 sm:h-2.5 bg-white'
                  : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold z-10">
          {currentSlide + 1} / {advertisements.length}
        </div>
      </div>

      {/* Thumbnail Navigation (Desktop Only) */}
      <div className="hidden lg:flex gap-4 mt-6 overflow-x-auto pb-2">
        {advertisements.map((ad, index) => (
          <button
            key={ad.id}
            onClick={() => goToSlide(index)}
            className={`relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
              index === currentSlide
                ? 'ring-4 ring-blue-500 scale-105'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={ad.image}
              alt={ad.title}
              className="w-full h-full object-cover"
              draggable="false"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/1200x400?text=Ad';
              }}
            />
            {index === currentSlide && (
              <div className="absolute inset-0 bg-blue-600/30" />
            )}
          </button>
        ))}
      </div>

      {/* Mobile Thumbnail Navigation */}
      <div className="flex lg:hidden gap-2 sm:gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {advertisements.map((ad, index) => (
          <button
            key={ad.id}
            onClick={() => goToSlide(index)}
            className={`relative flex-shrink-0 w-20 sm:w-24 h-14 sm:h-16 rounded-lg overflow-hidden transition-all duration-300 ${
              index === currentSlide
                ? 'ring-2 sm:ring-4 ring-blue-500 scale-105'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={ad.image}
              alt={ad.title}
              className="w-full h-full object-cover"
              draggable="false"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/1200x400?text=Ad';
              }}
            />
            {index === currentSlide && (
              <div className="absolute inset-0 bg-blue-600/30" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdsCarousel;