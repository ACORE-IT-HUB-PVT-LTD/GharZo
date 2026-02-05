import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FaBuilding, 
  FaVideo, 
  FaCrown, 
  FaMapMarkerAlt, 
  FaRupeeSign,
  FaBed,
  FaBath,
  FaRuler,
  FaPlay,
  FaHeart,
  FaComment,
  FaShare,
  FaEye,
  FaCalendar,
  FaCheckCircle,
  FaUpload,
  FaTimes,
  FaTools,
  FaWrench,
  FaHardHat,
  FaStar,
  FaClipboardList,
  FaClock,
  FaPhone,
  FaUser,
  FaSpinner
} from 'react-icons/fa';

const ProfileTabs = ({ role }) => {
  // If the logged-in user is a tenant, hide the tabs and only show profile data
  if (role === 'tenant') return null;

  const [activeTab, setActiveTab] = useState('listings');
  const [selectedReel, setSelectedReel] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [serviceModal, setServiceModal] = useState(false);
  const [reelForm, setReelForm] = useState({
    propertyId: '',
    caption: '',
    tags: '',
    duration: '',
    city: '',
    locality: '',
    file: null
  });
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: '',
    price: '',
    location: '',
    experience: '',
    description: ''
  });

  // ── States for real API (Listings tab) ──
  const [myProperties, setMyProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [propertiesError, setPropertiesError] = useState(null);

  // ── States for real API (Reels tab) ──
  const [myReels, setMyReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);
  const [reelsError, setReelsError] = useState(null);
  const [uploadingReel, setUploadingReel] = useState(false);

  // Dummy Data (unchanged)
  const myServices = [
    {
      id: 1,
      title: 'Interior Designing & Execution',
      category: 'Interior Design',
      price: '₹45,000 - ₹2,50,000',
      location: 'Indore & Nearby',
      rating: 4.8,
      reviews: 67,
      experience: '8+ Years',
      image: 'https://space13design.com/wp-content/uploads/2024/04/Execution-Of-Interior-Designing-Project-In-Vadodara-1024x768.jpg',
      status: 'Available'
    },
    {
      id: 2,
      title: 'Property Legal Consultation',
      category: 'Legal Services',
      price: '₹5,000 - ₹15,000',
      location: 'Indore',
      rating: 4.9,
      reviews: 112,
      experience: '12+ Years',
      image: 'https://aranlaw.in/wp-content/uploads/2024/09/Property-Legal-Advisors-in-Chennai.png',
      status: 'Available'
    },
    {
      id: 3,
      title: 'Home Construction & Renovation',
      category: 'Construction',
      price: 'Custom Quote',
      location: 'Indore & MP',
      rating: 4.6,
      reviews: 89,
      experience: '15+ Years',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSevzSgq9oBAktWFWMDTOS7sXVPwC1X6ASZGw&s',
      status: 'Busy till Feb 15'
    }
  ];

  const myVisits = [
    {
      id: 1,
      propertyTitle: 'Luxury 3BHK Apartment',
      propertyType: 'Apartment',
      location: 'Vijay Nagar, Indore',
      visitDate: '2026-01-25',
      visitTime: '10:30 AM',
      status: 'Completed',
      agentName: 'Rajesh Kumar',
      agentPhone: '+91 98765 43210',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500',
      rating: 4,
      feedback: 'Great property, well maintained. Location is perfect.'
    },
    {
      id: 2,
      propertyTitle: 'Commercial Office Space',
      propertyType: 'Office',
      location: 'MG Road, Indore',
      visitDate: '2026-01-28',
      visitTime: '2:00 PM',
      status: 'Scheduled',
      agentName: 'Priya Sharma',
      agentPhone: '+91 98765 43211',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500',
      rating: null,
      feedback: null
    },
    {
      id: 3,
      propertyTitle: 'Penthouse with City View',
      propertyType: 'Penthouse',
      location: 'South Tukoganj, Indore',
      visitDate: '2026-01-20',
      visitTime: '11:00 AM',
      status: 'Completed',
      agentName: 'Amit Verma',
      agentPhone: '+91 98765 43212',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
      rating: 5,
      feedback: 'Absolutely stunning! The view is breathtaking.'
    },
    {
      id: 4,
      propertyTitle: 'Modern Villa',
      propertyType: 'Villa',
      location: 'Nipania, Indore',
      visitDate: '2026-01-15',
      visitTime: '4:30 PM',
      status: 'Cancelled',
      agentName: 'Sneha Patel',
      agentPhone: '+91 98765 43213',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500',
      rating: null,
      feedback: null
    }
  ];

  const mySubscriptions = [
    {
      id: 1,
      plan: 'Premium Pro',
      type: 'Monthly',
      price: '₹999',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      status: 'Active',
      features: ['Unlimited Listings', 'Featured Ads', 'Priority Support', 'Analytics Dashboard']
    },
    {
      id: 2,
      plan: 'Basic',
      type: 'Yearly',
      price: '₹4,999',
      startDate: '2025-06-15',
      endDate: '2026-06-14',
      status: 'Active',
      features: ['10 Listings/month', 'Email Support', 'Basic Analytics']
    }
  ];

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: <FaBuilding /> },
    { id: 'reels', label: 'My Reels', icon: <FaVideo /> },
    { id: 'visits', label: 'My Visits', icon: <FaClipboardList /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <FaCrown /> }
  ];

  // Helper function to get token
  const getToken = () => {
    let token = localStorage.getItem("usertoken");
    if (!token) token = localStorage.getItem("authToken");
    if (!token) token = localStorage.getItem("access_token");
    return token;
  };

  // Fetch real properties when listings tab is active
  useEffect(() => {
    if (activeTab !== 'listings') return;

    const fetchMyProperties = async () => {
      setLoadingProperties(true);
      setPropertiesError(null);

      const token = getToken();

      if (!token) {
        setPropertiesError("Authentication token not found. Please login again.");
        setLoadingProperties(false);
        return;
      }

      try {
        const res = await axios.get(
          "https://api.gharzoreality.com/api/v2/properties/my-properties",
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );

        if (res.data.success && Array.isArray(res.data.data)) {
          setMyProperties(res.data.data);
        } else {
          setMyProperties([]);
        }
      } catch (err) {
        console.error("My properties fetch failed:", err);
        
        if (err.response?.status === 401) {
          setPropertiesError("Your session has expired. Please login again.");
        } else if (err.response?.status === 403) {
          setPropertiesError("You don't have permission to view properties.");
        } else {
          setPropertiesError(
            err.response?.data?.message ||
            "Failed to load your properties. Please try again."
          );
        }
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchMyProperties();
  }, [activeTab]);

  // Fetch real reels when reels tab is active
  useEffect(() => {
    if (activeTab !== 'reels') return;

    const fetchMyReels = async () => {
      setLoadingReels(true);
      setReelsError(null);

      const token = getToken();

      if (!token) {
        setReelsError("Authentication token not found. Please login again.");
        setLoadingReels(false);
        return;
      }

      try {
        const res = await axios.get(
          "https://api.gharzoreality.com/api/reels/my-reels?page=1&limit=20",
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );

        if (res.data.success && Array.isArray(res.data.data)) {
          setMyReels(res.data.data);
        } else {
          setMyReels([]);
        }
      } catch (err) {
        console.error("My reels fetch failed:", err);
        
        if (err.response?.status === 401) {
          setReelsError("Your session has expired. Please login again.");
        } else if (err.response?.status === 403) {
          setReelsError("You don't have permission to view reels.");
        } else {
          setReelsError(
            err.response?.data?.message ||
            "Failed to load your reels. Please try again."
          );
        }
      } finally {
        setLoadingReels(false);
      }
    };

    fetchMyReels();
  }, [activeTab]);

  const navigate = useNavigate();

  const handleReelUpload = async (e) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token) {
      alert('Please login to upload reels');
      return;
    }

    if (!reelForm.file) {
      alert('Please select a video file');
      return;
    }

    setUploadingReel(true);

    try {
      const formData = new FormData();
      formData.append('video', reelForm.file);
      formData.append('propertyId', reelForm.propertyId);
      formData.append('caption', reelForm.caption);
      
      // Convert comma-separated tags to array
      if (reelForm.tags) {
        const tagsArray = reelForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        tagsArray.forEach(tag => {
          formData.append('tags[]', tag);
        });
      }
      
      if (reelForm.duration) {
        formData.append('duration', reelForm.duration);
      }
      
      if (reelForm.city) {
        formData.append('location[city]', reelForm.city);
      }
      
      if (reelForm.locality) {
        formData.append('location[locality]', reelForm.locality);
      }

      const res = await axios.post(
        'https://api.gharzoreality.com/api/reels',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res.data.success) {
        alert('Reel uploaded successfully!');
        setUploadModal(false);
        setReelForm({
          propertyId: '',
          caption: '',
          tags: '',
          duration: '',
          city: '',
          locality: '',
          file: null
        });
        
        // Refresh reels list
        if (activeTab === 'reels') {
          const reelsRes = await axios.get(
            "https://api.gharzoreality.com/api/reels/my-reels?page=1&limit=20",
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            }
          );
          if (reelsRes.data.success && Array.isArray(reelsRes.data.data)) {
            setMyReels(reelsRes.data.data);
          }
        }
      }
    } catch (err) {
      console.error('Reel upload failed:', err);
      alert(err.response?.data?.message || 'Failed to upload reel. Please try again.');
    } finally {
      setUploadingReel(false);
    }
  };

  const handleServiceUpload = (e) => {
    e.preventDefault();
    console.log('Service added:', serviceForm);
    alert('Service added successfully!');
    setServiceModal(false);
    setServiceForm({ title: '', category: '', price: '', location: '', experience: '', description: '' });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active':
      case 'Available':
      case 'Completed':
        return 'bg-green-500 text-white';
      case 'Scheduled':
      case 'Pending':
        return 'bg-blue-500 text-white';
      case 'Cancelled':
      case 'Inactive':
      case 'Blocked':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Tabs Header */}
      <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 border border-gray-200">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'listings' && (
          <motion.div
            key="listings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loadingProperties ? (
              <div className="col-span-full flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-5xl text-blue-600 mr-4" />
                <span className="text-xl text-gray-700">Loading your properties...</span>
              </div>
            ) : propertiesError ? (
              <div className="col-span-full bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <p className="text-red-600 font-medium text-lg mb-4">{propertiesError}</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/login';
                    }}
                    className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Login Again
                  </button>
                </div>
              </div>
            ) : myProperties.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-xl shadow">
                <p className="text-xl text-gray-600 mb-6">You haven't listed any properties yet.</p>
                <button className="px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md">
                  Add New Property
                </button>
              </div>
            ) : (
              myProperties.map((property) => {
                const primaryImg = property.images?.find(i => i.isPrimary)?.url || property.images?.[0]?.url || '';
                const loc = property.location || {};

                return (
                  <div 
                    key={property._id} 
                    onClick={() => navigate(`/property/${property._id}`)}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer"
                  >
                    <div className="relative aspect-[4/3]">
                      <img 
                        src={primaryImg || 'https://via.placeholder.com/600x450?text=No+Photo'} 
                        alt={property.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
                          {property.status || 'Unknown'}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {property.propertyType || 'Property'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">
                        {property.title || 'Property Listing'}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <FaMapMarkerAlt className="mr-1 text-blue-500" />
                        <span className="line-clamp-1">
                          {loc.locality || loc.city || 'Location not specified'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-5 mb-4 text-sm text-gray-600">
                        {property.bhk && (
                          <div className="flex items-center gap-1">
                            <FaBed className="text-indigo-500" /> {property.bhk}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FaBath className="text-indigo-500" /> {property.bathrooms || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <FaRuler className="text-indigo-500" /> 
                          {property.area?.carpet || property.area?.builtUp || '—'} {property.area?.unit || 'sqft'}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-blue-600 font-bold text-xl">
                          ₹{property.price?.amount?.toLocaleString() || '—'} 
                          {property.price?.per ? `/${property.price.per}` : ''}
                        </span>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaEye className="text-green-500" /> {property.stats?.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaComment className="text-purple-500" /> {property.stats?.enquiries || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === 'reels' && (
          <motion.div
            key="reels"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setUploadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-md hover:shadow-xl transition-all duration-300"
              >
                <FaUpload />
                Upload New Reel
              </button>
            </div>

            {loadingReels ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-5xl text-purple-600 mr-4" />
                <span className="text-xl text-gray-700">Loading your reels...</span>
              </div>
            ) : reelsError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <p className="text-red-600 font-medium text-lg mb-4">{reelsError}</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/login';
                    }}
                    className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Login Again
                  </button>
                </div>
              </div>
            ) : myReels.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow">
                <p className="text-xl text-gray-600 mb-6">You haven't uploaded any reels yet.</p>
                <button 
                  onClick={() => setUploadModal(true)}
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition shadow-md"
                >
                  Upload Your First Reel
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myReels.map((reel) => (
                  <div
                    key={reel._id}
                    onClick={() => setSelectedReel(reel)}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
                  >
                    <div className="relative aspect-[9/16]">
                      {reel.thumbnail?.url ? (
                        <img 
                          src={reel.thumbnail.url} 
                          alt={reel.caption} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <FaVideo className="text-white text-6xl" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <FaPlay className="text-white text-5xl" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reel.status)}`}>
                          {reel.status}
                        </span>
                      </div>
                      {reel.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
                          {reel.duration}s
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">
                        {reel.caption || 'Untitled Reel'}
                      </h3>
                      {reel.location && (
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <FaMapMarkerAlt className="mr-1 text-blue-500" />
                          <span className="line-clamp-1">
                            {reel.location.locality || reel.location.city || 'Location'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1">
                            <FaEye className="text-green-500" /> {reel.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaHeart className="text-red-500" /> {reel.likes || 0}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(reel.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'visits' && (
          <motion.div
            key="visits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {myVisits.map((visit) => (
              <div 
                key={visit.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="relative h-48">
                  <img 
                    src={visit.image} 
                    alt={visit.propertyTitle} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(visit.status)}`}>
                      {visit.status}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {visit.propertyType}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{visit.propertyTitle}</h3>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <FaMapMarkerAlt className="mr-1 text-blue-500" />
                    <span>{visit.location}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaCalendar className="text-purple-500" />
                      <span className="font-medium">{visit.visitDate}</span>
                      <FaClock className="text-orange-500 ml-2" />
                      <span>{visit.visitTime}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaUser className="text-green-500" />
                      <span>{visit.agentName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaPhone className="text-blue-500" />
                      <span>{visit.agentPhone}</span>
                    </div>
                  </div>

                  {visit.rating && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < visit.rating ? 'text-yellow-500' : 'text-gray-300'} 
                          />
                        ))}
                      </div>
                      {visit.feedback && (
                        <p className="text-sm text-gray-600 italic">"{visit.feedback}"</p>
                      )}
                    </div>
                  )}

                  {visit.status === 'Scheduled' && (
                    <button className="w-full mt-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'subscriptions' && (
          <motion.div
            key="subscriptions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {mySubscriptions.map((sub) => (
              <div 
                key={sub.id} 
                className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md p-6 border border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{sub.plan}</h3>
                    <span className="text-sm text-gray-600">{sub.type} Plan</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sub.status === 'Active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    <FaCheckCircle className="inline mr-1" />
                    {sub.status}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{sub.price}</div>
                  <div className="flex items-center text-sm text-gray-600 gap-4">
                    <span className="flex items-center gap-1">
                      <FaCalendar className="text-blue-500" />
                      {sub.startDate}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <FaCalendar className="text-blue-500" />
                      {sub.endDate}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4 border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Features:</h4>
                  <ul className="space-y-2">
                    {sub.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheckCircle className="text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                  Manage Plan
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Reel Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl my-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Upload Reel</h3>
              <button onClick={() => setUploadModal(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FaTimes size={24} />
              </button>
            </div>
            
            <form onSubmit={handleReelUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property ID</label>
                <input
                  type="text"
                  value={reelForm.propertyId}
                  onChange={(e) => setReelForm({...reelForm, propertyId: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Enter property ID"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Caption</label>
                <textarea
                  value={reelForm.caption}
                  onChange={(e) => setReelForm({...reelForm, caption: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  placeholder="Describe your reel"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={reelForm.tags}
                  onChange={(e) => setReelForm({...reelForm, tags: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="e.g. indore, 2bhk, palasia, luxury"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (seconds)</label>
                <input
                  type="number"
                  value={reelForm.duration}
                  onChange={(e) => setReelForm({...reelForm, duration: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="e.g. 40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={reelForm.city}
                    onChange={(e) => setReelForm({...reelForm, city: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="e.g. Indore"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Locality</label>
                  <input
                    type="text"
                    value={reelForm.locality}
                    onChange={(e) => setReelForm({...reelForm, locality: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="e.g. Sukhliya"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setReelForm({...reelForm, file: e.target.files[0]})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={uploadingReel}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingReel ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Reel'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Service Modal */}
      {serviceModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setServiceModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Add New Service</h3>
              <button 
                onClick={() => setServiceModal(false)}
                className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
              <form onSubmit={handleServiceUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="Enter service title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Interior Design">Interior Design</option>
                    <option value="Legal Services">Legal Services</option>
                    <option value="Construction">Construction</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Vastu Consultant">Vastu Consultant</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Range</label>
                  <input
                    type="text"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="e.g. ₹45,000 - ₹2,50,000 or Custom Quote"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={serviceForm.location}
                    onChange={(e) => setServiceForm({...serviceForm, location: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="e.g. Indore & Nearby Cities"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience</label>
                  <input
                    type="text"
                    value={serviceForm.experience}
                    onChange={(e) => setServiceForm({...serviceForm, experience: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="e.g. 8+ Years"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                    placeholder="Describe your service, what you offer, typical timeline, etc..."
                  />
                </div>

                <div className="pt-2 pb-4">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
                  >
                    Add Service
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reel Preview Modal */}
      {selectedReel && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => setSelectedReel(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{selectedReel.caption || 'Reel'}</h3>
              <button onClick={() => setSelectedReel(null)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FaTimes size={24} />
              </button>
            </div>
            
            {selectedReel.videoUrl ? (
              <video 
                src={selectedReel.videoUrl} 
                controls 
                className="w-full h-96 object-cover rounded-xl mb-4 shadow-md bg-black"
              />
            ) : selectedReel.thumbnail?.url ? (
              <img 
                src={selectedReel.thumbnail.url} 
                alt={selectedReel.caption} 
                className="w-full h-96 object-cover rounded-xl mb-4 shadow-md" 
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-4 shadow-md flex items-center justify-center">
                <FaVideo className="text-white text-8xl" />
              </div>
            )}
            
            <div className="flex justify-between items-center text-gray-600">
              <div className="flex gap-6">
                <span className="flex items-center gap-2"><FaHeart className="text-red-500" /> {selectedReel.likes || 0} Likes</span>
                <span className="flex items-center gap-2"><FaComment className="text-blue-500" /> {selectedReel.comments || 0} Comments</span>
                <span className="flex items-center gap-2"><FaEye className="text-green-500" /> {selectedReel.views || 0} Views</span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 transition-colors">
                <FaShare size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfileTabs;