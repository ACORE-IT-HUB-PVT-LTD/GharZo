import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FaVideo, 
  FaUpload, 
  FaPlay, 
  FaHeart, 
  FaComment, 
  FaEye, 
  FaTimes,
  FaSpinner,
  FaMapMarkerAlt,
  FaCalendar,
  FaShare,
  FaTrash,
  FaEdit,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

const ReelsManagement = () => {
  const [myReels, setMyReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);
  const [reelsError, setReelsError] = useState(null);
  const [uploadingReel, setUploadingReel] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [myProperties, setMyProperties] = useState([]);

  const [reelForm, setReelForm] = useState({
    propertyId: '',
    caption: '',
    tags: '',
    duration: '',
    city: '',
    locality: '',
    file: null
  });

  // Helper function to get token
  const getToken = () => {
    let token = localStorage.getItem("usertoken");
    if (!token) token = localStorage.getItem("authToken");
    if (!token) token = localStorage.getItem("access_token");
    return token;
  };

  // Fetch properties for dropdown
  useEffect(() => {
    const fetchProperties = async () => {
      const token = getToken();
      if (!token) return;

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
        }
      } catch (err) {
        console.error("Properties fetch failed:", err);
      }
    };

    fetchProperties();
  }, []);

  // Fetch reels
  useEffect(() => {
    fetchMyReels();
  }, []);

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
        fetchMyReels();
      }
    } catch (err) {
      console.error('Reel upload failed:', err);
      alert(err.response?.data?.message || 'Failed to upload reel. Please try again.');
    } finally {
      setUploadingReel(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
      case 'published':
        return 'bg-emerald-500 text-white';
      case 'pending':
      case 'processing':
        return 'bg-orange-500 text-white';
      case 'blocked':
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                My Reels
              </h1>
              <p className="text-orange-200 text-sm sm:text-base">
                Manage and showcase your property videos
              </p>
            </div>
            <button
              onClick={() => setUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-orange-500/50 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
            >
              <FaUpload className="text-lg" />
              Upload Reel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Reels</p>
                <p className="text-3xl font-bold text-white mt-1">{myReels.length}</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <FaVideo className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">Total Views</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {myReels.reduce((sum, reel) => sum + (reel.views || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <FaEye className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-200 text-sm font-medium">Total Likes</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {myReels.reduce((sum, reel) => sum + (reel.likes || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <FaHeart className="text-white text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Reels Grid */}
        {loadingReels ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <FaSpinner className="animate-spin text-6xl text-orange-500 mx-auto mb-4" />
              <p className="text-white text-xl">Loading your reels...</p>
            </div>
          </div>
        ) : reelsError ? (
          <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-8 text-center backdrop-blur-sm">
            <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <p className="text-red-400 font-medium text-lg mb-6">{reelsError}</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button 
                onClick={fetchMyReels}
                className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
              >
                Try Again
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-semibold"
              >
                Login Again
              </button>
            </div>
          </div>
        ) : myReels.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="bg-orange-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FaVideo className="text-orange-500 text-5xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Reels Yet</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Start showcasing your properties with engaging video reels. Upload your first reel now!
            </p>
            <button 
              onClick={() => setUploadModal(true)}
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Upload Your First Reel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myReels.map((reel) => (
              <motion.div
                key={reel._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedReel(reel)}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 border border-white/10 hover:border-orange-500/50 transform hover:scale-105 group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[9/16] overflow-hidden">
                  {reel.thumbnail?.url ? (
                    <img 
                      src={reel.thumbnail.url} 
                      alt={reel.caption} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                      <FaVideo className="text-white text-6xl opacity-50" />
                    </div>
                  )}
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-orange-500 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <FaPlay className="text-white text-2xl ml-1" />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${getStatusColor(reel.status)}`}>
                      {reel.status || 'Active'}
                    </span>
                  </div>

                  {/* Duration */}
                  {reel.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <FaClock className="text-orange-400" />
                      {reel.duration}s
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {reel.caption || 'Untitled Reel'}
                  </h3>
                  
                  {reel.location && (
                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <FaMapMarkerAlt className="mr-1 text-orange-500 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {reel.location.locality || reel.location.city || 'Location'}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-3 pb-3 border-b border-white/10">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                        <FaHeart className="text-pink-500" /> 
                        {reel.likes || 0}
                      </span>
                      <span className="flex items-center gap-1 hover:text-green-400 transition-colors">
                        <FaEye className="text-green-500" /> 
                        {reel.views || 0}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-xs text-gray-500">
                    <FaCalendar className="mr-1 text-blue-400" />
                    {formatDate(reel.createdAt)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => !uploadingReel && setUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-white/10 my-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <FaUpload />
                      Upload New Reel
                    </h3>
                    <p className="text-orange-100 text-sm mt-1">Share your property showcase</p>
                  </div>
                  <button 
                    onClick={() => !uploadingReel && setUploadModal(false)} 
                    disabled={uploadingReel}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>
              </div>
              
              {/* Video Preview */}
              {reelForm.file && (
                <div className="px-6 py-4 bg-slate-900/50 border-b border-white/10">
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                    <video 
                      src={URL.createObjectURL(reelForm.file)} 
                      className="w-full h-full object-contain"
                      controls
                    />
                    <button
                      onClick={() => setReelForm({...reelForm, file: null})}
                      disabled={uploadingReel}
                      className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-3 flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="font-medium text-white">Selected:</span> 
                    <span className="truncate">{reelForm.file.name}</span>
                  </p>
                </div>
              )}
              
              <form onSubmit={handleReelUpload} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Property Selection */}
                <div>
                  <label className="block text-sm font-semibold text-orange-400 mb-2">
                    Select Property *
                  </label>
                  <select
                    value={reelForm.propertyId}
                    onChange={(e) => setReelForm({...reelForm, propertyId: e.target.value})}
                    disabled={uploadingReel}
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white disabled:opacity-50"
                    required
                  >
                    <option value="">Choose a property</option>
                    {myProperties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.propertyTitle || property.title || property.name || 'Untitled Property'}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Caption */}
                <div>
                  <label className="block text-sm font-semibold text-orange-400 mb-2">
                    Caption *
                  </label>
                  <textarea
                    value={reelForm.caption}
                    onChange={(e) => setReelForm({...reelForm, caption: e.target.value})}
                    disabled={uploadingReel}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none text-white placeholder-gray-500 disabled:opacity-50"
                    placeholder="Describe your property video..."
                    required
                  />
                </div>
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-orange-400 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={reelForm.tags}
                    onChange={(e) => setReelForm({...reelForm, tags: e.target.value})}
                    disabled={uploadingReel}
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white placeholder-gray-500 disabled:opacity-50"
                    placeholder="e.g. luxury, 3bhk, indore, modern"
                  />
                </div>

                {/* Duration and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-orange-400 mb-2">
                      Duration (sec)
                    </label>
                    <input
                      type="number"
                      value={reelForm.duration}
                      onChange={(e) => setReelForm({...reelForm, duration: e.target.value})}
                      disabled={uploadingReel}
                      className="w-full px-4 py-3 bg-slate-900 border-2 border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white placeholder-gray-500 disabled:opacity-50"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-orange-400 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={reelForm.city}
                      onChange={(e) => setReelForm({...reelForm, city: e.target.value})}
                      disabled={uploadingReel}
                      className="w-full px-4 py-3 bg-slate-900 border-2 border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white placeholder-gray-500 disabled:opacity-50"
                      placeholder="Indore"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-orange-400 mb-2">
                      Locality
                    </label>
                    <input
                      type="text"
                      value={reelForm.locality}
                      onChange={(e) => setReelForm({...reelForm, locality: e.target.value})}
                      disabled={uploadingReel}
                      className="w-full px-4 py-3 bg-slate-900 border-2 border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white placeholder-gray-500 disabled:opacity-50"
                      placeholder="Vijay Nagar"
                    />
                  </div>
                </div>
                
                {/* File Upload */}
                {!reelForm.file && (
                  <div>
                    <label className="block text-sm font-semibold text-orange-400 mb-2">
                      Video File *
                    </label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-orange-500 transition-colors cursor-pointer relative bg-slate-900/50">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setReelForm({...reelForm, file: e.target.files[0]})}
                        disabled={uploadingReel}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        required
                      />
                      <div className="bg-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <FaUpload className="text-orange-500 text-3xl" />
                      </div>
                      <p className="text-white font-semibold mb-1">Click to upload video</p>
                      <p className="text-gray-400 text-sm">MP4, MOV, AVI • Max 100MB</p>
                    </div>
                  </div>
                )}
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={uploadingReel}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {uploadingReel ? (
                    <>
                      <FaSpinner className="animate-spin text-xl" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload className="text-xl" />
                      Upload Reel
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reel Preview Modal */}
      <AnimatePresence>
        {selectedReel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" 
            onClick={() => setSelectedReel(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-4xl w-full shadow-2xl border border-white/10 my-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedReel.caption || 'Reel Preview'}
                  </h3>
                  {selectedReel.location && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <FaMapMarkerAlt className="mr-2 text-orange-500" />
                      {selectedReel.location.locality && `${selectedReel.location.locality}, `}
                      {selectedReel.location.city}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedReel(null)} 
                  className="text-gray-400 hover:text-white transition-colors ml-4 bg-white/10 hover:bg-white/20 rounded-full p-2"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              
              {/* Video Player */}
              {selectedReel.videoUrl || selectedReel.video?.url ? (
                <video 
                  src={selectedReel.videoUrl || selectedReel.video?.url} 
                  controls 
                  autoPlay
                  className="w-full max-h-[70vh] object-contain rounded-xl mb-6 shadow-2xl bg-black"
                />
              ) : selectedReel.thumbnail?.url ? (
                <img 
                  src={selectedReel.thumbnail.url} 
                  alt={selectedReel.caption} 
                  className="w-full max-h-[70vh] object-contain rounded-xl mb-6 shadow-2xl" 
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl mb-6 shadow-2xl flex items-center justify-center">
                  <FaVideo className="text-white text-9xl opacity-50" />
                </div>
              )}
              
              {/* Stats and Actions */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-6 text-gray-300">
                  <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                    <FaHeart className="text-pink-500" /> 
                    <span className="font-semibold">{selectedReel.likes || 0}</span>
                    <span className="text-sm text-gray-400">Likes</span>
                  </span>
                  <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                    <FaComment className="text-blue-500" /> 
                    <span className="font-semibold">{selectedReel.comments || 0}</span>
                    <span className="text-sm text-gray-400">Comments</span>
                  </span>
                  <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                    <FaEye className="text-green-500" /> 
                    <span className="font-semibold">{selectedReel.views || 0}</span>
                    <span className="text-sm text-gray-400">Views</span>
                  </span>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all">
                  <FaShare />
                  Share
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReelsManagement;