import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle,
  Users,
  BedDouble,
  UtensilsCrossed,
  Calendar,
  Clock,
  CarFront,
  Wifi,
  Waves,
  Dumbbell,
  Coffee,
  Shield,
  TreeDeciduous,
  Building2,
  Image as ImageIcon,
  IndianRupee,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const HotelBanquetDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") || "hotels";
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiEndpoint = type === "hotels" 
          ? `https://api.gharzoreality.com/api/hotels/${id}`
          : `https://api.gharzoreality.com/api/banquet-halls/${id}`;
        
        const res = await fetch(apiEndpoint);
        const data = await res.json();
        
        if (data?.success) {
          setProperty(data?.data);
        } else {
          setError("Property not found");
        }
      } catch (err) {
        console.error('Error fetching property detail', err);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetail();
    }
  }, [id, type]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getAmenitiesIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi size={16} />;
    if (amenityLower.includes('pool') || amenityLower.includes('swimming')) return <Waves size={16} />;
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return <Dumbbell size={16} />;
    if (amenityLower.includes('parking')) return <CarFront size={16} />;
    if (amenityLower.includes('restaurant') || amenityLower.includes('dining') || amenityLower.includes('food')) return <Coffee size={16} />;
    if (amenityLower.includes('security') || amenityLower.includes('safe')) return <Shield size={16} />;
    if (amenityLower.includes('garden') || amenityLower.includes('park')) return <TreeDeciduous size={16} />;
    return <CheckCircle size={16} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Property not found"}</p>
          <button
            onClick={() => navigate('/hotelsbanquets')}
            className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const isHotel = type === "hotels";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <button
            onClick={() => navigate('/hotelsbanquets')}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Listings</span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Image */}
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
            <img
              src={property.images?.[activeImageIndex]?.url || 'https://via.placeholder.com/800x600?text=No+Image'}
              alt={property.name}
              className="w-full h-full object-cover"
            />
            {property.isVerified && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <CheckCircle size={16} /> Verified
              </div>
            )}
            {property.isFeatured && (
              <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ⭐ Featured
              </div>
            )}
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-2 gap-4">
            {property.images?.slice(0, 4).map((img, index) => (
              <div 
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`relative h-32 md:h-48 rounded-xl overflow-hidden cursor-pointer transition-all ${
                  activeImageIndex === index ? 'ring-4 ring-orange-500' : ''
                }`}
              >
                <img
                  src={img.url}
                  alt={`${property.name} - ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                {index === 3 && property.images?.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">+{property.images.length - 4} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-2">
                    {isHotel ? property.category : property.venueType}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <MapPin size={18} className="text-orange-500" />
                    <span>
                      {property.location?.address}, {property.location?.city}, {property.location?.state}
                    </span>
                  </div>
                </div>
                {property.ratings?.average > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl">
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">{property.ratings.average}</span>
                    <span className="text-gray-500">({property.ratings.count} reviews)</span>
                  </div>
                )}
              </div>

              <p className="mt-4 text-gray-600">{property.description}</p>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {isHotel ? (
                <>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <BedDouble size={24} className="mx-auto text-orange-500" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">{property.totalRooms}</p>
                    <p className="text-sm text-gray-500">Total Rooms</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <Building2 size={24} className="mx-auto text-orange-500" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">{property.roomTypes?.length || 0}</p>
                    <p className="text-sm text-gray-500">Room Types</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <Users size={24} className="mx-auto text-orange-500" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">{property.totalCapacity?.seating || 0}</p>
                    <p className="text-sm text-gray-500">Seating Capacity</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <Users size={24} className="mx-auto text-orange-500" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">{property.totalCapacity?.floating || 0}</p>
                    <p className="text-sm text-gray-500">Floating Capacity</p>
                  </div>
                </>
              )}
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <MapPin size={24} className="mx-auto text-orange-500" />
                <p className="text-2xl font-bold text-gray-900 mt-2">{property.nearbyPlaces?.length || 0}</p>
                <p className="text-sm text-gray-500">Nearby Places</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <ImageIcon size={24} className="mx-auto text-orange-500" />
                <p className="text-2xl font-bold text-gray-900 mt-2">{property.images?.length || 0}</p>
                <p className="text-sm text-gray-500">Photos</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex border-b">
                {['overview', 'amenities', 'policies', 'location'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 font-semibold capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {isHotel && property.roomTypes && property.roomTypes.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Room Types</h3>
                        <div className="space-y-4">
                          {property.roomTypes.map((room, index) => (
                            <div key={index} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{room.type}</h4>
                                  <p className="text-sm text-gray-500">{room.bedType} Bed • Max {room.maxOccupancy} Guests</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {room.amenities?.map((amenity, idx) => (
                                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {amenity}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-orange-600">{formatPrice(room.price?.basePrice)}</p>
                                  <p className="text-sm text-gray-500">per night</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isHotel && property.halls && property.halls.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Halls & Venues</h3>
                        <div className="space-y-4">
                          {property.halls.map((hall, index) => (
                            <div key={index} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{hall.name}</h4>
                                  <p className="text-sm text-gray-500">{hall.type} • {hall.area?.value} {hall.area?.unit}</p>
                                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                    <span>👥 {hall.capacity?.seating} Seating</span>
                                    <span>🎉 {hall.capacity?.floating} Floating</span>
                                    {hall.acAvailable && <span>❄️ AC Available</span>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-orange-600">{formatPrice(hall.price?.perEvent)}</p>
                                  <p className="text-sm text-gray-500">per event</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Event Types for Banquets */}
                    {!isHotel && property.eventTypes && property.eventTypes.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Event Types</h3>
                        <div className="flex flex-wrap gap-2">
                          {property.eventTypes.map((event, index) => (
                            <span key={index} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nearby Places */}
                    {property.nearbyPlaces && property.nearbyPlaces.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Nearby Places</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {property.nearbyPlaces.map((place, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                              <MapPin size={18} className="text-orange-500" />
                              <div>
                                <p className="font-medium text-gray-900">{place.name}</p>
                                <p className="text-sm text-gray-500">{place.type} • {place.distance}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Amenities Tab */}
                {activeTab === 'amenities' && (
                  <div className="space-y-6">
                    {isHotel ? (
                      <>
                        {property.amenities?.recreation?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Recreation</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {property.amenities.recreation.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                  {getAmenitiesIcon(item)}
                                  <span className="text-gray-700">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {property.amenities?.basic?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Basic Facilities</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {property.amenities.basic.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                  {getAmenitiesIcon(item)}
                                  <span className="text-gray-700">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {property.amenities?.venue?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Venue Facilities</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {property.amenities.venue.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                  {getAmenitiesIcon(item)}
                                  <span className="text-gray-700">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {property.amenities?.audioVisual?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Audio Visual</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {property.amenities.audioVisual.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                  <CheckCircle size={16} className="text-green-500" />
                                  <span className="text-gray-700">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {property.amenities?.furniture?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Furniture</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {property.amenities.furniture.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                  <CheckCircle size={16} className="text-green-500" />
                                  <span className="text-gray-700">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Policies Tab */}
                {activeTab === 'policies' && (
                  <div className="space-y-6">
                    {isHotel ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                              <Clock size={18} />
                              <span className="text-sm">Check-in</span>
                            </div>
                            <p className="font-semibold text-gray-900">{property.policies?.checkIn}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                              <Clock size={18} />
                              <span className="text-sm">Check-out</span>
                            </div>
                            <p className="font-semibold text-gray-900">{property.policies?.checkOut}</p>
                          </div>
                        </div>
                        {property.policies?.cancellation && (
                          <div className="p-4 bg-blue-50 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-1">Cancellation Policy</h4>
                            <p className="text-gray-600">{property.policies.cancellation}</p>
                          </div>
                        )}
                        {property.policies?.childPolicy && (
                          <div className="p-4 bg-green-50 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-1">Child Policy</h4>
                            <p className="text-gray-600">{property.policies.childPolicy}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {property.policies?.timings && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Clock size={18} />
                                <span className="text-sm">Timings</span>
                              </div>
                              <p className="font-semibold text-gray-900">{property.policies.timings}</p>
                            </div>
                          )}
                          {property.policies?.alcohol && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <span className="text-sm">Alcohol</span>
                              </div>
                              <p className="font-semibold text-gray-900">{property.policies.alcohol}</p>
                            </div>
                          )}
                          {property.policies?.djMusic && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <span className="text-sm">DJ Music</span>
                              </div>
                              <p className="font-semibold text-gray-900">{property.policies.djMusic}</p>
                            </div>
                          )}
                        </div>
                        {property.pricing?.cancellationCharges && (
                          <div className="p-4 bg-blue-50 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-1">Cancellation Charges</h4>
                            <p className="text-gray-600">{property.pricing.cancellationCharges}</p>
                          </div>
                        )}
                        {property.pricing?.advanceBooking && (
                          <div className="p-4 bg-green-50 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-1">Advance Booking</h4>
                            <p className="text-gray-600">{property.pricing.advanceBooking} days in advance</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Location Tab */}
                {activeTab === 'location' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                      <p className="text-gray-600">
                        {property.location?.address}<br />
                        {property.location?.locality}, {property.location?.city}<br />
                        {property.location?.state} - {property.location?.pincode}
                      </p>
                    </div>
                    {property.location?.landmark && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-2">Landmark</h4>
                        <p className="text-gray-600">{property.location.landmark}</p>
                      </div>
                    )}
                    {property.location?.coordinates && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-2">Coordinates</h4>
                        <p className="text-gray-600">
                          Latitude: {property.location.coordinates.latitude}<br />
                          Longitude: {property.location.coordinates.longitude}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Starting from</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-orange-600">
                    {formatPrice(property.priceRange?.min)}
                  </span>
                  {property.priceRange?.max > property.priceRange?.min && (
                    <span className="text-gray-500"> - {formatPrice(property.priceRange?.max)}</span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                {property.contactInfo?.phone && (
                  <a
                    href={`tel:${property.contactInfo.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Phone size={18} className="text-orange-500" />
                    <span className="text-gray-700">{property.contactInfo.phone}</span>
                  </a>
                )}
                {property.contactInfo?.whatsapp && (
                  <a
                    href={`https://wa.me/${property.contactInfo.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl">💬</span>
                    <span className="text-gray-700">{property.contactInfo.whatsapp}</span>
                  </a>
                )}
                {property.contactInfo?.email && (
                  <a
                    href={`mailto:${property.contactInfo.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Mail size={18} className="text-orange-500" />
                    <span className="text-gray-700">{property.contactInfo.email}</span>
                  </a>
                )}
                {property.contactInfo?.website && (
                  <a
                    href={property.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Globe size={18} className="text-orange-500" />
                    <span className="text-gray-700">Visit Website</span>
                  </a>
                )}
              </div>

              {/* Enquiry Button */}
              <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                Book Now / Enquire
              </button>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{property.stats?.views || 0}</p>
                  <p className="text-sm text-gray-500">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{property.stats?.enquiries || 0}</p>
                  <p className="text-sm text-gray-500">Enquiries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelBanquetDetail;
