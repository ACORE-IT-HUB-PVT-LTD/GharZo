import React, { useState, useEffect } from 'react';
import { Building2, Phone, MapPin, IndianRupee, Loader, ChevronDown, CheckCircle, X, Search } from 'lucide-react';
import { useParams } from 'react-router-dom';

const API_BASE_URL = 'https://api.gharzoreality.com/api/v2';
const PUBLIC_API_BASE = 'https://api.gharzoreality.com/api/public';

export default function PropertyInquiryForm() {
  const { propertyId: paramPropertyId } = useParams();

  // ─── States ────────────────────────────────────────────
  const [propertiesList, setPropertiesList] = useState([]);   // all properties from public API
  const [selectedProperty, setSelectedProperty] = useState(null); // currently picked property object
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);   // success banner flag
  const [dropdownOpen, setDropdownOpen] = useState(false);     // custom dropdown toggle
  const [propertySearch, setPropertySearch] = useState('');   // search term for property dropdown

  const [formData, setFormData] = useState({
    enquiryType: '',
    name: '',
    mobile: '',
    email: '',
    message: '',
    additionalPropertyRequest: '', // New field for general enquiry
    agree: false,
  });

  // ─── Fetch all properties on mount ─────────────────────
  useEffect(() => {
    fetchAllProperties();
  }, []);

  // ─── If propertyId comes from URL params, auto-select it ───
  useEffect(() => {
    if (paramPropertyId && propertiesList.length > 0) {
      const match = propertiesList.find((p) => p._id === paramPropertyId);
      if (match) setSelectedProperty(match);
    }
  }, [paramPropertyId, propertiesList]);

  const fetchAllProperties = async () => {
    try {
      setLoadingProperties(true);
      setError('');
      const response = await fetch(`${PUBLIC_API_BASE}/properties?page=1&limit=100`);
      const data = await response.json();
      if (data.success && data.data) {
        setPropertiesList(data.data);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties list');
    } finally {
      setLoadingProperties(false);
    }
  };

  // ─── Form change handler ───────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ─── Property dropdown select ──────────────────────────
  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setDropdownOpen(false);
  };

  // ─── Format price helper ───────────────────────────────
  const formatPrice = (price) => {
    if (!price?.amount) return '';
    const amt = price.amount;
    if (amt >= 10000000) return `${(amt / 10000000).toFixed(1)} Cr`;
    if (amt >= 100000) return `${(amt / 100000).toFixed(1)} L`;
    return amt.toLocaleString('en-IN');
  };

  // ─── Filter properties based on search ─────────────────────
  const filteredProperties = propertiesList.filter((property) => {
    const searchLower = propertySearch.toLowerCase();
    return (
      property.title?.toLowerCase().includes(searchLower) ||
      property.location?.city?.toLowerCase().includes(searchLower) ||
      property.location?.locality?.toLowerCase().includes(searchLower) ||
      property.category?.toLowerCase().includes(searchLower) ||
      property.listingType?.toLowerCase().includes(searchLower)
    );
  });

  // ─── Submit handler ────────────────────────────────────
  const handleSubmit = async () => {
    // ── Validations ──
    if (!formData.agree) {
      alert('Please agree to the terms to submit');
      return;
    }

    const requiredFields = ['enquiryType', 'name', 'mobile', 'email'];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      alert('Please fill all required fields: ' + missingFields.join(', '));
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // ── Build payload based on enquiry type ──
    let inquiryPayload;
    let endpoint;

    if (formData.enquiryType === 'general') {
      // General enquiry - property selection is optional
      endpoint = `${API_BASE_URL}/enquiries/property`;
      inquiryPayload = {
        enquiryType: 'general',
        contactInfo: {
          name: formData.name,
          phone: formData.mobile,
          email: formData.email,
        },
        message: formData.message || '',
        additionalPropertyRequest: formData.additionalPropertyRequest || '',
      };
    } else {
      // Property-specific enquiry (buy/rent/sale)
      if (!selectedProperty) {
        alert('Please select a property for this enquiry type');
        return;
      }
      endpoint = `${API_BASE_URL}/enquiries/property`;
      inquiryPayload = {
        propertyId: selectedProperty._id,
        enquiryType: formData.enquiryType,
        contactInfo: {
          name: formData.name,
          phone: formData.mobile,
          email: formData.email,
        },
        message: formData.message || '',
      };
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryPayload),
      });

      const result = await response.json();

      if (result.success) {
        // ── Show success banner ──
        setSubmitSuccess(true);
        // Reset form after 4 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
          setFormData({
            enquiryType: '',
            name: '',
            mobile: '',
            email: '',
            message: '',
            additionalPropertyRequest: '',
            agree: false,
          });
          setSelectedProperty(null);
        }, 4000);
      } else {
        setError(result.message || 'Failed to submit inquiry');
        alert(result.message || 'Error submitting inquiry');
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setError('Failed to submit inquiry. Please try again.');
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c2344] via-[#0b4f91] to-[#1a3c6e] py-8 px-4 md:px-6 lg:px-8">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* ───── LEFT SIDE ────────────────────────────── */}
          <div className="text-white space-y-6 lg:space-y-8 px-4 lg:px-0">
            <div className="flex items-center gap-4">
              <Building2 className="w-12 h-12 md:w-16 md:h-16 text-orange-400" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Find Your <span className="text-orange-400">Dream Property</span>
              </h1>
            </div>

            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
              Discover premium residential and commercial properties in Indore and nearby areas.
              Let us help you find the perfect home or investment opportunity.
            </p>

            <div className="space-y-4 text-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-orange-400" />
                </div>
                <span>Quick &amp; Free Consultation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-400" />
                </div>
                <span>Best Locations in Indore</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-orange-400" />
                </div>
                <span>Best Price Guarantee</span>
              </div>
            </div>
          </div>

          {/* ───── RIGHT SIDE – Form ──────────────────────── */}
          <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            {/* Background image + overlay */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD50ig-1yJkfMC66gTEkQC3WUbtnjK5CYqDQ&s')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0c2344]/85 via-[#0b4f91]/80 to-orange-900/65 mix-blend-multiply" />
            </div>

            {/* Glass form wrapper */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20">

              {/* ── Success Banner ── */}
              {submitSuccess && (
                <div className="mx-4 mt-4 mb-2 flex items-center gap-3 bg-green-600/25 border border-green-400/40 rounded-xl p-4 animate-pulse-once">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-green-200 font-semibold text-sm">Inquiry Submitted Successfully!</p>
                    <p className="text-green-300/80 text-xs mt-0.5">
                      {formData.enquiryType === 'general' 
                        ? 'Our team will contact you soon with suitable options.'
                        : 'The property owner will contact you soon.'}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Header ── */}
              <div className="bg-gradient-to-r from-[#0c2344]/90 to-[#0b4f91]/90 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Building2 className="w-7 h-7" />
                  Property Inquiry
                </h2>
                <p className="text-blue-100 mt-1 text-sm">
                  Fill details &amp; we'll get back to you within 24 hours
                </p>

                {/* Error */}
                {error && (
                  <div className="mt-3 p-3 bg-red-500/20 rounded-lg text-red-200 text-sm border border-red-500/30 flex items-center justify-between">
                    <span>{error}</span>
                    <X className="w-4 h-4 cursor-pointer hover:text-red-100" onClick={() => setError('')} />
                  </div>
                )}
              </div>

              {/* ── Form Fields ── */}
              <div className="p-6 md:p-8 space-y-5">

                {/* ── Inquiry Type (moved to top) ── */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Inquiry Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="enquiryType"
                    value={formData.enquiryType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder:text-gray-300 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Type</option>
                    <option value="general" className="text-black">General Inquiry</option>
                    <option value="property_buy" className="text-black">Buy Property</option>
                    <option value="property_rent" className="text-black">Rent Property</option>
                    <option value="property_sale" className="text-black">Sell Property</option>
                  </select>
                </div>

                {/* ── Property Dropdown (conditionally shown) ── */}
                {formData.enquiryType && formData.enquiryType !== 'general' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Select Property <span className="text-red-400">*</span>
                    </label>

                    <div className="relative" onClick={() => !loadingProperties && setDropdownOpen(!dropdownOpen)}>
                      {/* Trigger */}
                      <div
                        className={`w-full px-4 py-2.5 bg-white/10 border text-white rounded-lg cursor-pointer flex items-center justify-between
                          ${dropdownOpen ? 'border-orange-400 ring-2 ring-orange-500' : 'border-white/30'}`}
                      >
                        {loadingProperties ? (
                          <span className="flex items-center gap-2 text-gray-300">
                            <Loader className="w-4 h-4 animate-spin" /> Loading properties...
                          </span>
                        ) : selectedProperty ? (
                          <span className="truncate">
                            <span className="text-orange-300 font-medium">{selectedProperty.title}</span>
                            <span className="text-gray-400 text-xs ml-2">
                              – {selectedProperty.location?.city || ''}{' '}
                              {selectedProperty.price ? `(₹${formatPrice(selectedProperty.price)}/${selectedProperty.price.per})` : ''}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-300">Choose a property...</span>
                        )}
                        <ChevronDown
                          className={`w-5 h-5 text-gray-300 flex-shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </div>

                      {/* Dropdown list */}
                      {dropdownOpen && !loadingProperties && (
                        <div className="absolute z-50 mt-1 w-full max-h-72 rounded-lg border border-white/20 bg-[#0c2344]/95 backdrop-blur-lg shadow-xl">
                          {/* Search input */}
                          <div className="p-2 border-b border-white/20 sticky top-0 bg-[#0c2344]/95">
                            <input
                              type="text"
                              value={propertySearch}
                              onChange={(e) => setPropertySearch(e.target.value)}
                              placeholder="Search properties..."
                              className="w-full px-3 py-2 bg-white/10 border border-white/30 text-white rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder:text-gray-400"
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto max-h-52">
                            {filteredProperties.length === 0 ? (
                              <div className="px-4 py-3 text-gray-400 text-sm text-center">No properties found</div>
                            ) : (
                              filteredProperties.map((property) => {
                                const isSelected = selectedProperty?._id === property._id;
                                return (
                                  <div
                                    key={property._id}
                                    onClick={() => handlePropertySelect(property)}
                                    className={`px-4 py-3 cursor-pointer border-b border-white/10 last:border-0 transition-colors duration-150
                                      ${isSelected ? 'bg-orange-500/15' : 'hover:bg-white/8'}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 min-w-0">
                                        {isSelected && <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                                        <span className={`font-medium truncate ${isSelected ? 'text-orange-300' : 'text-white'}`}>
                                          {property.title}
                                        </span>
                                        {/* Type badge */}
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0
                                            ${property.listingType === 'Sale' ? 'bg-green-500/20 text-green-300' :
                                              property.listingType === 'Rent' ? 'bg-blue-500/20 text-blue-300' :
                                                'bg-purple-500/20 text-purple-300'}`}
                                        >
                                          {property.listingType}
                                        </span>
                                      </div>
                                      {/* Price */}
                                      {property.price && (
                                        <span className="text-orange-300 text-sm font-semibold flex-shrink-0 ml-2">
                                          ₹{formatPrice(property.price)}
                                          <span className="text-gray-500 font-normal text-xs">/{property.price.per}</span>
                                        </span>
                                      )}
                                    </div>
                                    {/* Location line */}
                                    <div className="flex items-center gap-1 mt-0.5 ml-6">
                                      <MapPin className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-400 text-xs truncate">
                                        {[property.location?.locality, property.location?.city].filter(Boolean).join(', ')}
                                      </span>
                                      {/* Category */}
                                      <span className="text-gray-600 text-xs ml-auto flex-shrink-0">
                                        {property.category}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Additional Property Request (shown only for general enquiry) ── */}
                {formData.enquiryType === 'general' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Property Requirements
                      <span className="text-gray-400 text-xs ml-2 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      name="additionalPropertyRequest"
                      value={formData.additionalPropertyRequest}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 resize-none placeholder:text-gray-300"
                      placeholder="E.g., Need 2BHK in Vijay Nagar, budget 50L, near schools..."
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      Tell us your specific requirements: location preference, budget, BHK, amenities, etc.
                    </p>
                  </div>
                )}

                {/* ── Two Column: Name + Email ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder:text-gray-300"
                      placeholder="Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder:text-gray-300"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* ── Mobile Number ── */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Mobile <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    onInput={(e) => {
                      // Only allow digits, max 10
                      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    }}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder:text-gray-300"
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </div>

                {/* ── Message ── */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Message 
                    <span className="text-gray-400 text-xs ml-2 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 resize-none placeholder:text-gray-300"
                    placeholder="Any specific requirements or questions..."
                  />
                </div>

                {/* ── Agree checkbox ── */}
                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                  <input
                    type="checkbox"
                    name="agree"
                    id="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-orange-600 border-white/40 rounded focus:ring-orange-500 bg-white/10"
                  />
                  <label htmlFor="agree" className="text-sm text-gray-200">
                    I agree to the terms &amp; conditions and allow contact regarding this inquiry
                  </label>
                </div>

                {/* ── Submit button ── */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || loadingProperties || submitSuccess}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700
                    disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed
                    text-white py-3 px-6 rounded-lg font-medium text-base
                    transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                    flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submitted!
                    </>
                  ) : (
                    'Submit Inquiry'
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}