import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';

const API_URL = 'https://api.gharzoreality.com/api/public/properties?page=1&limit=100';

const PlotsHome = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          // Filter only Plot and Flat, take 5 most recent (already sorted by createdAt desc from API)
          const filtered = data.data
            .filter((p) =>
              p.propertyType === 'Plot' || p.propertyType === 'Flat'
            )
            .slice(0, 5);

          const mapped = filtered.map((item) => ({
            id: item._id,
            name: item.title || 'Untitled Property',
            location: {
              area: item.location?.locality || '',
              city: item.location?.city || '',
            },
            builder: item.contactInfo?.name || item.ownerId?.name || 'Owner',
            propertyType: item.propertyType,
            listingType: item.listingType,
            price: item.price?.amount || 0,
            images: item.images?.length > 0
              ? item.images.map((i) => i.url)
              : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
          }));

          setProperties(mapped);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Fallback dummy data while loading or if no data
  const fallbackProperties = [
    {
      id: 'f1',
      name: 'The Address Lakeview',
      location: { area: 'Vijay Nagar', city: 'Indore' },
      builder: 'DB Realty',
      propertyType: 'Flat',
      listingType: 'Rent',
      price: 0,
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    },
    {
      id: 'f2',
      name: 'Astral Park Residency',
      location: { area: 'Super Corridor', city: 'Indore' },
      builder: 'Astral Group',
      propertyType: 'Plot',
      listingType: 'Sale',
      price: 0,
      images: ['https://images.unsplash.com/photo-1583608205776-b77a0a53f81e?w=800'],
    },
    {
      id: 'f3',
      name: 'Treasure Island Sky',
      location: { area: 'MG Road', city: 'Indore' },
      builder: 'Treasure Vistas',
      propertyType: 'Flat',
      listingType: 'Rent',
      price: 0,
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    },
    {
      id: 'f4',
      name: 'Crystal Residency',
      location: { area: 'Bhawarkua', city: 'Indore' },
      builder: 'Crystal Builders',
      propertyType: 'Plot',
      listingType: 'Sale',
      price: 0,
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    },
    {
      id: 'f5',
      name: 'Silver Spring Heights',
      location: { area: 'AB Road', city: 'Indore' },
      builder: 'Silverstone Group',
      propertyType: 'Flat',
      listingType: 'Rent',
      price: 0,
      images: ['https://images.unsplash.com/photo-1600563438938-a9a78e01d44a?w=800'],
    },
  ];

  const displayProperties = loading || properties.length === 0 ? fallbackProperties : properties;

  return (
    <section className="py-20 px-6 text-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mt-4">
            <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
              Your Perfect Home and Plot
            </span>
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-6 rounded-full" />
          <p className="mt-6 bg-yellow-400 text-black rounded-2xl max-w-2xl mx-auto px-4 py-2">
            Find trusted homes and open plots in good locations at the right price.
          </p>
        </motion.div>

        {/* Properties Grid */}
        <div className="max-w-6xl mx-auto">

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl overflow-hidden h-96 md:h-[500px] bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Cards */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.7 }}
                  className="group relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer h-96 md:h-[500px] bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${property.images[0] || '/placeholder-project.jpg'})`,
                  }}
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Property Type Badge */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                      property.propertyType === 'Flat'
                        ? 'bg-blue-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}>
                      {property.propertyType}
                    </span>
                    {property.listingType && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                        property.listingType === 'Rent'
                          ? 'bg-orange-500 text-white'
                          : 'bg-purple-600 text-white'
                      }`}>
                        {property.listingType === 'Sale' ? 'Buy' : property.listingType}
                      </span>
                    )}
                  </div>

                  {/* Price badge */}
                  {property.price > 0 && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow">
                      ₹{property.price.toLocaleString('en-IN')}
                      {property.listingType === 'Rent' && '/mo'}
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-white line-clamp-2">
                      {property.name}
                    </h3>

                    <p className="text-base md:text-lg text-gray-200 mt-2 flex items-center gap-1">
                      <MapPin size={14} className="text-orange-400 flex-shrink-0" />
                      {[property.location.area, property.location.city].filter(Boolean).join(', ')}
                    </p>

                    <div className="flex items-center justify-between mt-6">
                      <p className="text-gray-300 text-sm md:text-base">
                        Listed by{' '}
                        <span className="font-semibold text-white">{property.builder}</span>
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/property/${property.id}`);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:shadow-xl text-sm"
                      >
                        View Details
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Hover arrow */}
                  {index < displayProperties.length - 1 && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => navigate('/properties')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#0c2344] to-[#0b4f91] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-base"
            >
              View All Properties
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlotsHome;