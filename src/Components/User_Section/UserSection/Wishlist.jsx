import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { 
  FaHeart, 
  FaMapMarkerAlt, 
  FaBed, 
  FaBath, 
  FaRulerCombined,
  FaTrash,
  FaEdit,
  FaBuilding,
  FaCalendarAlt,
  FaEye
} from 'react-icons/fa';
import { Heart, MapPin, Edit3, Trash2, Eye } from 'lucide-react';

const API_BASE_URL = "https://api.gharzoreality.com";

const Wishlist = () => {
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const token = localStorage.getItem("usertoken");

  // Fetch saved properties
  const fetchSavedProperties = async () => {
    if (!token) {
      setError("Please login to view your wishlist");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/saved-properties?page=1&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success) {
        setSavedProperties(response.data.data || []);
      } else {
        setSavedProperties([]);
      }
    } catch (err) {
      console.error("Error fetching saved properties:", err);
      setError("Failed to load wishlist");
      setSavedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedProperties();
  }, [token]);

  // Remove from wishlist
  const handleRemoveFromWishlist = async (propertyId) => {
    setRemovingId(propertyId);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/saved-properties/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success) {
        setSavedProperties(prev => prev.filter(item => item._id !== propertyId));
        toast.success("Property removed from wishlist");
      }
    } catch (err) {
      console.error("Error removing property:", err);
      toast.error("Failed to remove property from wishlist");
    } finally {
      setRemovingId(null);
    }
  };

  // Update note
  const handleUpdateNote = async (propertyId) => {
    if (!noteText.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    setSavingNote(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/saved-properties/${propertyId}/note`,
        { note: noteText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success) {
        setSavedProperties(prev => 
          prev.map(item => 
            item._id === propertyId 
              ? { ...item, note: noteText }
              : item
          )
        );
        toast.success("Note updated successfully");
        setEditingNote(null);
        setNoteText('');
      }
    } catch (err) {
      console.error("Error updating note:", err);
      toast.error("Failed to update note");
    } finally {
      setSavingNote(false);
    }
  };

  // Start editing note
  const startEditNote = (property) => {
    setEditingNote(property._id);
    setNoteText(property.note || '');
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    if (typeof price === 'object') {
      return `₹${price.amount?.toLocaleString() || '0'}${price.per ? `/${price.per}` : ''}`;
    }
    return `₹${price.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHeart className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-red-600 mb-2">Oops!</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/user/login')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Heart className="text-rose-500 fill-rose-500" size={32} />
            My Wishlist
          </h2>
          <p className="text-gray-500 mt-2">
            {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        {savedProperties.length === 0 ? (
          <div className="text-center bg-white rounded-3xl shadow-xl p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No Saved Properties</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't saved any properties yet. Browse properties and click the heart icon to save them here.
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {savedProperties.map((property, index) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-80 h-64 md:h-auto relative">
                      <img
                        src={property.images?.[0]?.url || 'https://via.placeholder.com/400x250?text=No+Image'}
                        alt={property.title || 'Property'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                          {property.listingType || 'For Rent'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <FaBuilding className="text-indigo-600" size={12} />
                          {property.propertyType || 'Property'}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          {/* Title & Price */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 hover:text-indigo-600 cursor-pointer transition-colors">
                                {property.title || 'Untitled Property'}
                              </h3>
                              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                <FaMapMarkerAlt className="text-indigo-600" size={14} />
                                {property.location?.locality || property.location?.city || 'Location not specified'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-indigo-600">
                                {formatPrice(property.price)}
                              </p>
                              {property.price?.pricePerSqft && (
                                <p className="text-gray-500 text-sm">
                                  ₹{property.price.pricePerSqft}/sqft
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-4 mb-4">
                            {property.bhk && (
                              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <FaBed className="text-indigo-600" size={16} />
                                <span className="text-gray-700 font-medium">{property.bhk} BHK</span>
                              </div>
                            )}
                            {property.bathrooms && (
                              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <FaBath className="text-indigo-600" size={16} />
                                <span className="text-gray-700 font-medium">{property.bathrooms} Bath</span>
                              </div>
                            )}
                            {property.area && (
                              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <FaRulerCombined className="text-indigo-600" size={16} />
                                <span className="text-gray-700 font-medium">
                                  {property.area.builtUp || property.area.carpet || '0'} {property.area.unit || 'sqft'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Note Section */}
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            {editingNote === property._id ? (
                              <div className="space-y-3">
                                <textarea
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder="Add a note about this property..."
                                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateNote(property._id)}
                                    disabled={savingNote}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                  >
                                    {savingNote ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingNote(null);
                                      setNoteText('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                    <Edit3 size={14} />
                                    Your Note
                                  </span>
                                  <button
                                    onClick={() => startEditNote(property)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                  >
                                    {property.note ? 'Edit' : 'Add Note'}
                                  </button>
                                </div>
                                <p className="text-gray-600 text-sm">
                                  {property.note || 'No note added yet. Click to add a note about this property.'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Saved Date */}
                          <p className="text-gray-400 text-xs flex items-center gap-1 mb-4">
                            <FaCalendarAlt size={12} />
                            Saved on {formatDate(property.savedAt)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => navigate(`/property/${property._id}`)}
                            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all"
                          >
                            <Eye size={18} />
                            View Details
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(property._id)}
                            disabled={removingId === property._id}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {removingId === property._id ? (
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <Trash2 size={18} />
                            )}
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
