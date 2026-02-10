// src/pages/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Building, Sofa, Wrench, Zap, Paintbrush, Home, ThermometerSun, Sparkles, Shield, Bug, ArrowLeft, MapPin, Star, Phone, Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const API_URL = 'https://api.gharzoreality.com/api/services';

// Helper to get primary image from API data
const getPrimaryImage = (images) => {
  if (!images || images.length === 0) return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800';
  const primary = images.find(img => img.isPrimary);
  return primary ? primary.url : (images[0]?.url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800');
};

// Helper to format price
const formatPrice = (pricing) => {
  if (!pricing) return 'Price on request';
  return `${pricing.currency || '₹'} ${pricing.amount || 'N/A'}`;
};

// Service Card Component for API data
const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  
  const handleContact = () => {
    // Navigate to service detail or contact page
    navigate(`/service/${service._id}`);
  };

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 cursor-pointer"
      onClick={handleContact}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={getPrimaryImage(service.images)}
          alt={service.serviceName}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
          <Star size={12} fill="currentColor" />
          {service.ratings?.averageRating || 0}
        </div>
        {service.isFeatured && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            Featured
          </div>
        )}
        {service.isPremium && (
          <div className="absolute top-12 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            Premium
          </div>
        )}
        {service.isVerified && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
            <Shield size={12} />
            Verified
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {service.category}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {service.serviceName}
        </h3>
        <p className="text-gray-600 font-medium mb-2 text-sm">
          {service.provider?.companyName || 'Provider'}
        </p>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {service.shortDescription || service.description}
        </p>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {service.features.slice(0, 3).map((feature, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {feature}
              </span>
            ))}
            {service.features.length > 3 && (
              <span className="text-xs text-gray-500">+{service.features.length - 3} more</span>
            )}
          </div>
        )}

        {/* Service Areas */}
        {service.serviceAreas && service.serviceAreas.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin size={14} />
            <span className="line-clamp-1">
              {service.serviceAreas.slice(0, 3).join(', ')}
              {service.serviceAreas.length > 3 && ` +${service.serviceAreas.length - 3} more`}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm mb-4">
          <span className="font-semibold text-green-600">
            {formatPrice(service.pricing)}
            {service.pricing?.type && <span className="text-xs text-gray-500 ml-1">({service.pricing.type})</span>}
          </span>
        </div>

        {/* Availability */}
        {service.availability && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
            <Clock size={14} />
            <span>{service.availability.hours || 'Flexible'}</span>
          </div>
        )}

        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleContact();
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Phone size={16} />
          Contact Provider
        </button>
      </div>
    </div>
  );
};

// Category Filter Component
const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          selectedCategory === null
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
        }`}
      >
        All Services
      </button>
      {categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => onSelectCategory(cat._id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            selectedCategory === cat._id
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
          }`}
        >
          {cat._id}
          <span className="ml-1 text-xs opacity-75">({cat.count})</span>
        </button>
      ))}
    </div>
  );
};

// Loading Skeleton
const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-10 bg-gray-200 rounded w-full" />
    </div>
  </div>
);

// Services Page Component
const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data || []);
        setCategories(data.categories || []);
      } else {
        throw new Error(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedCategory
    ? services.filter(s => s.category === selectedCategory)
    : services;

  // Fallback to static data if API fails
  const displayServices = filteredServices.length > 0 ? filteredServices : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 text-gray-900">
              Home Services
            </h1>
            <p className="text-gray-600 text-lg">
              Professional & trusted service providers for all your home needs
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {services.length} services available
            </p>
          </div>
        </div>
      </div>

      {/* Services Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Category Filter */}
        {categories.length > 0 && (
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-red-600 font-bold text-lg mb-2">Error Loading Services</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchServices}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && (
          <>
            {displayServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {displayServices.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
                  <h3 className="text-gray-600 font-bold text-lg mb-2">No Services Found</h3>
                  <p className="text-gray-500">Try selecting a different category</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
