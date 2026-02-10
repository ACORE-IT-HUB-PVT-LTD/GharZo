import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Globe, Clock, Star, Shield, Check, Share2, Heart, X, Send } from 'lucide-react';

const API_URL = 'https://api.gharzoreality.com/api/services';
const ENQUIRY_API_URL = 'https://api.gharzoreality.com/api/service-enquiries';

// Enquiry Form Modal Component
const EnquiryFormModal = ({ isOpen, onClose, service, onSubmit, submitting, result }) => {
  const ENQUIRY_TIME_SLOTS = [
    'Morning (9AM-12PM)',
    'Afternoon (12PM-5PM)',
    'Evening (5PM-9PM)',
    'Anytime'
  ];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    preferredContactMethod: 'WhatsApp',
    preferredTimeSlot: 'Morning (9AM-12PM)',
    location: {
      city: '',
      locality: '',
      pincode: '',
      address: ''
    }
  });

  const WEEKDAYS = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const PRICING_TYPES = [
    'Fixed',
    'Starting From',
    'Per Hour',
    'Per Square Foot',
    'Custom',
    'Contact for Quote'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">Submit Enquiry</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Success Result */}
        {result && result.success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Enquiry Submitted!</h3>
            <p className="text-gray-600 mb-2">{result.message}</p>
            {result.enquiryNumber && (
              <p className="text-blue-600 font-medium">Enquiry Number: {result.enquiryNumber}</p>
            )}
            <button
              onClick={onClose}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* Error Result */
          result && !result.success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Submission Failed</h3>
              <p className="text-gray-600 mb-4">{result.message}</p>
              <button
                onClick={() => setResult(null)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your Name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="10-digit mobile"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Brief description of your requirement"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your requirement in detail..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Contact Preference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    name="preferredTimeSlot"
                    value={formData.preferredTimeSlot}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {ENQUIRY_TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Your Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                    <input
                      type="text"
                      name="location.locality"
                      value={formData.location.locality}
                      onChange={handleChange}
                      placeholder="Area/Locality"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="location.pincode"
                      value={formData.location.pincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleChange}
                      placeholder="Full Address"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Enquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
};

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [enquiryResult, setEnquiryResult] = useState(null);

  useEffect(() => {
    fetchServiceDetail();
  }, [id]);

  const fetchServiceDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}`);
      const data = await response.json();
      
      if (data.success) {
        const foundService = data.data.find(s => s._id === id);
        if (foundService) {
          setService(foundService);
        } else {
          throw new Error('Service not found');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch service');
      }
    } catch (err) {
      console.error('Error fetching service detail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (service?.provider?.phone) {
      window.location.href = `tel:${service.provider.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (service?.provider?.whatsappNumber) {
      window.open(`https://wa.me/${service.provider.whatsappNumber}`, '_blank');
    }
  };

  const handleEnquirySubmit = async (formData) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${ENQUIRY_API_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          serviceId: service._id,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEnquiryResult({
          success: true,
          message: data.message,
          enquiryNumber: data.data?.enquiry?.enquiryNumber,
        });
      } else {
        throw new Error(data.message || 'Failed to submit enquiry');
      }
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      setEnquiryResult({
        success: false,
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Service</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/services')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Not Found</h2>
          <button
            onClick={() => navigate('/services')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

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

      {/* Service Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Main Image */}
          <div className="relative h-64 md:h-96">
            <img
              src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'}
              alt={service.serviceName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Heart size={20} className="text-gray-600" />
              </button>
              <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Share2 size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              {service.isVerified && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Shield size={14} /> Verified
                </span>
              )}
              {service.isPremium && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Premium
                </span>
              )}
              {service.isFeatured && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Title and Category */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {service.category}
              </span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={18} fill="currentColor" />
                <span className="font-medium text-gray-800">{service.ratings?.averageRating || 0}</span>
                <span className="text-gray-500 text-sm">({service.ratings?.totalReviews || 0} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              {service.serviceName}
            </h1>

            <p className="text-gray-600 text-lg mb-6">
              {service.description}
            </p>

            {/* Pricing */}
            <div className="bg-green-50 rounded-xl p-4 mb-6 inline-block">
              <span className="text-gray-600 text-sm">Starting from </span>
              <span className="text-2xl font-bold text-green-600">
                {service.pricing?.currency || '₹'} {service.pricing?.amount || 'N/A'}
              </span>
              <span className="text-gray-500 text-sm"> / {service.pricing?.type || 'service'}</span>
            </div>

            {/* Service Areas */}
            {service.serviceAreas && service.serviceAreas.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <MapPin size={18} /> Service Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.serviceAreas.map((area, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                      <Check size={18} className="text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Provider Info */}
            {service.provider && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold text-gray-800 mb-4">Provider Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-lg font-medium text-gray-900">{service.provider.companyName}</p>
                    <p className="text-gray-600">Contact: {service.provider.contactPerson}</p>
                    {service.provider.website && (
                      <a href={service.provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center gap-1 mt-1">
                        <Globe size={14} /> {service.provider.website}
                      </a>
                    )}
                  </div>
                  {service.provider.address && (
                    <div>
                      <p className="text-gray-600 flex items-center gap-2">
                        <MapPin size={16} />
                        {service.provider.address.street}, {service.provider.address.city}, {service.provider.address.state} - {service.provider.address.pincode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Availability */}
            {service.availability && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Availability</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <span>{service.availability.hours}</span>
                  {service.availability.days && service.availability.days.length > 0 && (
                    <span className="text-sm text-gray-500">
                      ({service.availability.days.join(', ')})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Contact Buttons */}
            <div className="border-t pt-6 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleContact}
                className="bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                Call Now
              </button>
              <button
                onClick={handleWhatsApp}
                className="bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                WhatsApp
              </button>
              <button
                onClick={() => setShowEnquiryForm(true)}
                className="bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Send Enquiry
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Form Modal */}
      <EnquiryFormModal 
        isOpen={showEnquiryForm} 
        onClose={() => {
          setShowEnquiryForm(false);
          setEnquiryResult(null);
        }} 
        service={service}
        onSubmit={handleEnquirySubmit}
        submitting={submitting}
        result={enquiryResult}
      />
    </div>
  );
};

export default ServiceDetailPage;
