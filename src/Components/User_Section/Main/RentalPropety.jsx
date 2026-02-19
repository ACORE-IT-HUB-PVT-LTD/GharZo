import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RentalProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.gharzoreality.com/api/public/properties?page=1&limit=50'
        );
        const data = await response.json();

        if (data.success && data.data) {
          // Filter only rental properties (listingType === 'Rent')
          const rentalProperties = data.data.filter(
            (property) => property.listingType === 'Rent'
          );

          // Sort by createdAt (most recent first) and take top 5
          const recentProperties = rentalProperties
            .sort(
              (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )
            .slice(0, 5);

          setProperties(recentProperties);
        } else {
          setError('Failed to fetch properties');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleViewAll = () => {
    navigate('/rent');
  };

  if (loading) {
    return (
      <section className="py-20 px-6 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] text-white overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-400 font-semibold">Loading properties...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-6 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] text-white overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-semibold">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">
            ✨ Discover Premium Rentals
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-4">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Popular Rental Properties
            </span>
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-6 rounded-full" />
          <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Smart rooms that feel like home—comfort, convenience and value in every stay
          </p>
        </motion.div>

        {/* Properties Grid */}
        {properties.length > 0 ? (
          <>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {properties.map((property, index) => (
                  <motion.div
                    key={property._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.7 }}
                    className="group relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer h-80 sm:h-96 md:h-[500px] bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${
                        property.images && property.images.length > 0
                          ? property.images[0].url
                          : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
                      })`,
                    }}
                  >
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-left">
                      <h3 className="text-xl sm:text-2xl md:text-4xl font-bold text-white line-clamp-2">
                        {property.title || property.propertyType}
                      </h3>

                      <p className="text-sm sm:text-base md:text-lg text-gray-200 mt-2">
                        {property.location?.locality || property.location?.area || 'Unknown'}, {property.location?.city || ''}
                      </p>

                      {/* Price Display */}
                      {property.price?.amount && (
                        <p className="text-orange-400 font-bold text-lg sm:text-xl md:text-2xl mt-3">
                          ₹{property.price.amount.toLocaleString()} / {property.price?.per || 'month'}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 md:mt-8">
                        <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-tight">
                          Interested in this property by{" "}
                          <span className="font-semibold text-white">
                            {property.bhk ? `${property.bhk} BHK` : property.propertyType}
                          </span>
                          ?
                        </p>

                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 transition-all hover:shadow-xl">
                          <svg
                            className="w-3 h-3 md:w-4 md:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a22 22 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          View Number
                        </button>
                      </div>
                    </div>

                    {/* Next arrow (only on non-last items) */}
                    {index < properties.length - 1 && (
                      <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* View All Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex justify-center mt-12 md:mt-16"
            >
              <button
                onClick={handleViewAll}
                className="group bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold px-8 md:px-12 py-3 md:py-4 rounded-xl shadow-lg flex items-center gap-3 transition-all hover:shadow-2xl text-base md:text-lg"
              >
                <span>View All Rentals</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <p className="text-gray-300 text-lg font-medium">
              No rental properties found
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default RentalProperties;