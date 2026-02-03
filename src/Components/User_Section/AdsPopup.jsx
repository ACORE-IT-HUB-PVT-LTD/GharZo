import { useEffect, useState } from "react";

const AdsPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupAds, setPopupAds] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null); // For debugging

  // 🔥 Fetch popup ads from API on component mount
  useEffect(() => {
    const fetchPopupAds = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.gharzoreality.com/api/v2/advertisements/public/placement/homepage_hero'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch advertisements');
        }

        const data = await response.json();
        console.log('📡 API Response:', data); // Debug log

        // Filter only popup type ads
        const popups = (data.data || [])
          .filter((ad) => ad.adType === 'popup')
          .map((ad) => {
            // Better image URL extraction with multiple fallbacks
            let imageUrl = null;

            // Try to get desktop image first
            if (ad.media?.desktopImage?.url) {
              imageUrl = ad.media.desktopImage.url;
            }
            // Fallback to mobile image
            else if (ad.media?.mobileImage?.url) {
              imageUrl = ad.media.mobileImage.url;
            }
            // If no images, use a placeholder
            else {
              imageUrl = 'https://thumbs.dreamstime.com/b/executive-house-home-exterior-new-construction-canada-double-car-garage-front-elevation-street-view-upscale-433888252.jpg';
            }

            const mappedAd = {
              id: ad.id,
              title: ad.title || 'Special Offer',
              description: ad.title || 'Check out this amazing offer!',
              image: imageUrl,
              link: ad.clickAction?.url || '#',
              cta: 'View Details',
              openInNewTab: ad.clickAction?.openInNewTab !== false, // Default to true
              priority: ad.priority || 0
            };

            console.log('✅ Mapped popup ad:', mappedAd); // Debug log
            return mappedAd;
          });

        if (popups.length > 0) {
          setPopupAds(popups);
          setDebugInfo(`Found ${popups.length} popup ad(s)`);
          setError(null);
        } else {
          setError('No popup ads available');
          setDebugInfo('No popup type ads in API response');
        }
      } catch (err) {
        console.error('❌ Error fetching popup ads:', err);
        setError(err.message);
        setDebugInfo(`Error: ${err.message}`);
        setPopupAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopupAds();
  }, []);

  // 🔥 Show popup after 20 seconds if popup ads exist - only once per page load
  useEffect(() => {
    if (popupAds.length === 0 || !popupAds[0]) {
      console.log('⏭️ No popup ads available, skipping display');
      return;
    }

    console.log('⏰ Setting 20 second timer to show popup');

    // Select random popup ad (or first one if only one exists)
    const randomIndex = Math.floor(Math.random() * popupAds.length);
    const selectedAd = popupAds[randomIndex];

    console.log('🎯 Selected popup ad:', selectedAd);

    // 20 seconds baad popup show kare
    const timer = setTimeout(() => {
      console.log('📣 Showing popup after 20 seconds');
      setCurrentAd(selectedAd);
      setIsOpen(true);
      setShowClose(false);
      setImageLoaded(false);

      // 5 seconds baad close button show kare
      const closeTimer = setTimeout(() => {
        console.log('🔘 Showing close button after 5 seconds');
        setShowClose(true);
      }, 5000);

      return () => clearTimeout(closeTimer);
    }, 20000);

    return () => {
      console.log('🧹 Cleaning up popup timer');
      clearTimeout(timer);
    };
  }, [popupAds]);

  const closeAd = () => {
    console.log('❌ Closing popup');
    setIsOpen(false);
    setShowClose(false);
    setImageLoaded(false);
    setCurrentAd(null);
  };

  // Debug mode - show info if popup won't load
  if (error && !isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-[9998] bg-red-500/90 text-white p-3 rounded-lg text-xs max-w-xs">
        <p className="font-bold">Popup Ad Debug:</p>
        <p>{error}</p>
        {debugInfo && <p className="text-gray-100 mt-1">{debugInfo}</p>}
      </div>
    );
  }

  // Don't render if popup is not open or no current ad
  if (!isOpen || !currentAd) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-black rounded-2xl max-w-md w-full max-h-[85vh] shadow-2xl overflow-hidden transform transition-all animate-slideUp">
        {/* ❌ Close Button - Hidden for first 5 seconds */}
        {showClose && (
          <button
            onClick={closeAd}
            className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-gray-700 hover:text-black rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Close ad"
          >
            ✕
          </button>
        )}

        {/* 📢 Ad Content - Full Image with Overlay Text */}
        <div className="relative h-full">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="w-full h-full min-h-[500px] bg-gradient-to-br from-gray-700 to-gray-900 animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-blue-600 mx-auto mb-2"></div>
                <p className="text-white text-sm">Loading ad...</p>
              </div>
            </div>
          )}

          {/* Ad Image - Full Size */}
          <a
            href={currentAd.link}
            target={currentAd.openInNewTab ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="block relative"
            onClick={() => console.log('🔗 Ad clicked:', currentAd.link)}
          >
            <img
              src={currentAd.image}
              alt={currentAd.title}
              className={`w-full h-full min-h-[500px] max-h-[85vh] object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
              onLoad={() => {
                console.log('🖼️ Image loaded successfully');
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.error('⚠️ Image failed to load, using placeholder:', currentAd.image);
                e.target.src = 'https://via.placeholder.com/800x1000/4F46E5/FFFFFF?text=Advertisement';
                setImageLoaded(true);
              }}
            />

            {/* Bottom Gradient Blur Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/95 via-black/70 to-transparent backdrop-blur-[2px]" />
          </a>

          {/* Ad Details - Positioned Over Image */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-lg">
              {currentAd.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-100 mb-4 leading-relaxed drop-shadow-md">
              {currentAd.description}
            </p>

            {/* CTA Button - Clickable */}
            <a
              href={currentAd.link}
              target={currentAd.openInNewTab ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-center cursor-pointer"
              onClick={() => console.log('🔗 CTA clicked:', currentAd.link)}
            >
              {currentAd.cta} →
            </a>

            {/* Timer Indicator - Hide after 5 seconds */}
            {!showClose && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <p className="text-xs text-gray-200">
                  Ad closes in a few seconds...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdsPopup;