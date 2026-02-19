import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, MapPin, Star, Phone, Clock, Shield, Search,
  ChevronDown, X, RotateCcw, Sparkles, CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://api.gharzoreality.com/api/services';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getPrimaryImage = (images) => {
  if (!images || images.length === 0)
    return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800';
  const primary = images.find((img) => img.isPrimary);
  return primary?.url || images[0]?.url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800';
};

const formatPrice = (pricing) => {
  if (!pricing) return 'Price on request';
  if (pricing.amount) return `₹${pricing.amount}`;
  if (pricing.priceRange?.min)
    return `₹${pricing.priceRange.min} – ₹${pricing.priceRange.max}`;
  return 'Price on request';
};

// ─── FilterBar ────────────────────────────────────────────────────────────────
function FilterBar({
  searchTerm, setSearchTerm,
  selectedCategory, setSelectedCategory,
  selectedCity, setSelectedCity,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  verifiedOnly, setVerifiedOnly,
  featuredOnly, setFeaturedOnly,
  premiumOnly, setPremiumOnly,
  availableCategories,
  availableCities,
  onReset,
}) {
  const [activeFilter, setActiveFilter] = useState(null);
  const dropdownRef = useRef(null);

  const toggleFilter = (f) => setActiveFilter((p) => (p === f ? null : f));

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setActiveFilter(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const budgetLabel =
    minPrice || maxPrice
      ? `₹${minPrice || '0'} – ₹${maxPrice || '∞'}`
      : 'Price Range';

  const pricePresets = [
    { label: '< ₹100', max: '100' },
    { label: '₹100–500', min: '100', max: '500' },
    { label: '₹500–2K', min: '500', max: '2000' },
    { label: '₹2K+', min: '2000' },
  ];

  const moreCount = [verifiedOnly, featuredOnly, premiumOnly].filter(Boolean).length;

  return (
    <div
      ref={dropdownRef}
      className="w-full bg-white shadow-md border-b sticky top-0 z-50 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          {/* Search */}
          <div className="flex-1 min-w-[160px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search service, provider, area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border-slate-200 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">

            {/* Category */}
            <div className="relative">
              <button
                onClick={() => toggleFilter('category')}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === 'category' || selectedCategory
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'hover:border-slate-400'
                }`}
              >
                {selectedCategory || 'Category'}
                {selectedCategory && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setSelectedCategory(''); }}
                    className="ml-0.5 hover:text-red-500"
                  >
                    <X size={12} />
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              {activeFilter === 'category' && (
                <div className="absolute top-12 left-0 w-64 bg-white shadow-xl border rounded-lg p-3 z-50 max-h-60 overflow-y-auto">
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Service Categories
                  </p>
                  {availableCategories.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">No categories found</p>
                  )}
                  {availableCategories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { setSelectedCategory(cat._id === selectedCategory ? '' : cat._id); setActiveFilter(null); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between items-center ${
                        selectedCategory === cat._id
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      <span>{cat._id}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{cat.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* City / Service Area */}
            <div className="relative">
              <button
                onClick={() => toggleFilter('city')}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === 'city' || selectedCity
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'hover:border-slate-400'
                }`}
              >
                {selectedCity || 'City / Area'}
                {selectedCity && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setSelectedCity(''); }}
                    className="ml-0.5 hover:text-red-500"
                  >
                    <X size={12} />
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              {activeFilter === 'city' && (
                <div className="absolute top-12 left-0 w-56 bg-white shadow-xl border rounded-lg p-3 z-50 max-h-60 overflow-y-auto">
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Service Areas
                  </p>
                  {availableCities.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">No areas found</p>
                  )}
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => { setSelectedCity(city === selectedCity ? '' : city); setActiveFilter(null); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCity === city
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="relative">
              <button
                onClick={() => toggleFilter('price')}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === 'price' || minPrice || maxPrice
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'hover:border-slate-400'
                }`}
              >
                {budgetLabel}
                <ChevronDown size={14} />
              </button>
              {activeFilter === 'price' && (
                <div className="absolute top-12 left-0 w-72 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">Price Range (₹ per unit)</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full border p-2 rounded text-sm focus:border-blue-500 outline-none"
                    />
                    <span className="text-slate-400 text-sm flex-shrink-0">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full border p-2 rounded text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pricePresets.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => { setMinPrice(p.min || ''); setMaxPrice(p.max || ''); }}
                        className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-all"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                      className="text-sm text-slate-500 underline"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setActiveFilter(null)}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* More Filters */}
            <div className="relative">
              <button
                onClick={() => toggleFilter('more')}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === 'more' || moreCount > 0
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                More Filters
                {moreCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full ml-1">
                    {moreCount}
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              {activeFilter === 'more' && (
                <div className="absolute top-12 right-0 sm:left-0 w-72 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">More Filters</p>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between px-3 py-2 border rounded-lg cursor-pointer hover:border-blue-300">
                      <span className="text-sm text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-green-500" />
                        Verified Only
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-600"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                      />
                    </label>
                    <label className="flex items-center justify-between px-3 py-2 border rounded-lg cursor-pointer hover:border-blue-300">
                      <span className="text-sm text-slate-700 flex items-center gap-2">
                        <Sparkles size={14} className="text-blue-500" />
                        Featured Only
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-600"
                        checked={featuredOnly}
                        onChange={(e) => setFeaturedOnly(e.target.checked)}
                      />
                    </label>
                    <label className="flex items-center justify-between px-3 py-2 border rounded-lg cursor-pointer hover:border-blue-300">
                      <span className="text-sm text-slate-700 flex items-center gap-2">
                        <Star size={14} className="text-yellow-500" />
                        Premium Only
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-600"
                        checked={premiumOnly}
                        onChange={(e) => setPremiumOnly(e.target.checked)}
                      />
                    </label>
                  </div>
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="mt-4 w-full bg-blue-600 text-white py-1.5 rounded-md text-sm font-semibold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Service Card ──────────────────────────────────────────────────────────────
const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-gray-100 cursor-pointer"
      onClick={() => navigate(`/service/${service._id}`)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={getPrimaryImage(service.images)}
          alt={service.serviceName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Rating */}
        <div className="absolute top-4 right-4 bg-green-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1">
          <Star size={11} fill="currentColor" />
          {service.ratings?.averageRating || '0.0'}
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          {service.isVerified && (
            <span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow flex items-center gap-1">
              <Shield size={10} /> Verified
            </span>
          )}
          {service.isFeatured && (
            <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow">
              Featured
            </span>
          )}
          {service.isPremium && (
            <span className="bg-yellow-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow">
              Premium
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category chip */}
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          {service.category}
        </span>

        <h3 className="text-base font-bold text-gray-900 mt-2 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {service.serviceName}
        </h3>

        <p className="text-sm text-gray-500 font-medium mb-2">
          {service.provider?.companyName || 'Provider'}
        </p>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {service.shortDescription || service.description}
        </p>

        {/* Features */}
        {service.features?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {service.features.slice(0, 3).map((f, i) => (
              <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {f}
              </span>
            ))}
            {service.features.length > 3 && (
              <span className="text-[10px] text-gray-400">+{service.features.length - 3}</span>
            )}
          </div>
        )}

        {/* Service Areas */}
        {service.serviceAreas?.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin size={12} className="text-blue-500 flex-shrink-0" />
            <span className="line-clamp-1">
              {service.serviceAreas.slice(0, 3).join(', ')}
              {service.serviceAreas.length > 3 && ` +${service.serviceAreas.length - 3}`}
            </span>
          </div>
        )}

        {/* Price + Availability */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm font-bold text-green-600">
              {formatPrice(service.pricing)}
            </span>
            {service.pricing?.type && (
              <span className="text-[10px] text-gray-400 ml-1">/{service.pricing.type}</span>
            )}
          </div>
          {service.availability?.hours && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Clock size={11} />
              <span>{service.availability.hours}</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/service/${service._id}`); }}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
        >
          <Phone size={15} />
          Contact Provider
        </button>
      </div>
    </div>
  );
};

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-10 bg-gray-200 rounded-xl w-full mt-2" />
    </div>
  </div>
);

// ─── Main ServicesPage ─────────────────────────────────────────────────────────
const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FilterBar states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);

  // Dynamic options
  const [availableCities, setAvailableCities] = useState([]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch data
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.success) {
        setServices(data.data || []);
        setCategories(data.categories || []);

        // Extract unique service areas
        const allAreas = [];
        (data.data || []).forEach((s) => {
          if (s.serviceAreas) allAreas.push(...s.serviceAreas);
        });
        setAvailableCities([...new Set(allAreas)].sort());
      } else {
        throw new Error(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Apply filters
  useEffect(() => {
    let list = [...services];

    // Search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.serviceName?.toLowerCase().includes(q) ||
          s.provider?.companyName?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.serviceAreas?.some((a) => a.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory) {
      list = list.filter((s) => s.category === selectedCategory);
    }

    // City / Area
    if (selectedCity) {
      list = list.filter((s) => s.serviceAreas?.includes(selectedCity));
    }

    // Price
    const minP = minPrice ? parseInt(minPrice) : 0;
    const maxP = maxPrice ? parseInt(maxPrice) : Infinity;
    if (minPrice || maxPrice) {
      list = list.filter((s) => {
        const price = s.pricing?.amount || s.pricing?.priceRange?.min || 0;
        return price >= minP && price <= maxP;
      });
    }

    // Verified
    if (verifiedOnly) list = list.filter((s) => s.isVerified === true);

    // Featured
    if (featuredOnly) list = list.filter((s) => s.isFeatured === true);

    // Premium
    if (premiumOnly) list = list.filter((s) => s.isPremium === true);

    setFilteredServices(list);
  }, [
    services,
    debouncedSearch,
    selectedCategory,
    selectedCity,
    minPrice,
    maxPrice,
    verifiedOnly,
    featuredOnly,
    premiumOnly,
  ]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setVerifiedOnly(false);
    setFeaturedOnly(false);
    setPremiumOnly(false);
  };

  const hasActiveFilters =
    selectedCategory || selectedCity || minPrice || maxPrice || verifiedOnly || featuredOnly || premiumOnly;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-white">

      {/* Sticky FilterBar */}
      <FilterBar
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        selectedCity={selectedCity} setSelectedCity={setSelectedCity}
        minPrice={minPrice} setMinPrice={setMinPrice}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        verifiedOnly={verifiedOnly} setVerifiedOnly={setVerifiedOnly}
        featuredOnly={featuredOnly} setFeaturedOnly={setFeaturedOnly}
        premiumOnly={premiumOnly} setPremiumOnly={setPremiumOnly}
        availableCategories={categories}
        availableCities={availableCities}
        onReset={handleReset}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">

        {/* Back */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
                Home Services
              </span>
            </h2>
            <p className="mt-1 text-gray-500 text-sm">
              {loading
                ? 'Loading...'
                : `${filteredServices.length} service${filteredServices.length === 1 ? '' : 's'} found`}
              {selectedCategory && !loading && (
                <span className="ml-2 text-blue-500 text-xs">· {selectedCategory}</span>
              )}
            </p>
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Active Filters:
            </span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                🗂 {selectedCategory}
                <button onClick={() => setSelectedCategory('')}><X size={11} /></button>
              </span>
            )}
            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                📍 {selectedCity}
                <button onClick={() => setSelectedCity('')}><X size={11} /></button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-400 text-white rounded-full text-xs font-medium">
                💰 ₹{minPrice || '0'} – {maxPrice ? `₹${maxPrice}` : '∞'}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}><X size={11} /></button>
              </span>
            )}
            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                ✅ Verified
                <button onClick={() => setVerifiedOnly(false)}><X size={11} /></button>
              </span>
            )}
            {featuredOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500 text-white rounded-full text-xs font-medium">
                ✨ Featured
                <button onClick={() => setFeaturedOnly(false)}><X size={11} /></button>
              </span>
            )}
            {premiumOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium">
                ⭐ Premium
                <button onClick={() => setPremiumOnly(false)}><X size={11} /></button>
              </span>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-300 transition-all"
            >
              <RotateCcw size={11} /> Clear All
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
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

        {/* No results */}
        {!loading && !error && filteredServices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Services Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters to see more results.</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && filteredServices.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            {/* Results count */}
            <div className="text-center mt-10 text-gray-500 text-sm">
              Showing{' '}
              <span className="font-semibold text-blue-600">{filteredServices.length}</span>{' '}
              of{' '}
              <span className="font-semibold text-blue-600">{services.length}</span>{' '}
              services
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;