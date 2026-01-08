import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import baseurl from "../../../../BaseUrl"; // Adjust path if needed
import { FaTrash, FaComment, FaHeart, FaRegHeart, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

const SellerReels = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState("");
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [reels, setReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [totalAllowed, setTotalAllowed] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReelId, setDeleteReelId] = useState(null);
  const videoRefs = useRef([]);

  // Toast function
  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Helper functions for localStorage likes
  const getStoredLikes = () => {
    return JSON.parse(localStorage.getItem('sellerLikedReels') || '[]');
  };

  const updateStoredLikes = (reelId, isLiked) => {
    let storedLikes = getStoredLikes();
    if (isLiked) {
      if (!storedLikes.includes(reelId)) {
        storedLikes.push(reelId);
      }
    } else {
      storedLikes = storedLikes.filter(id => id !== reelId);
    }
    localStorage.setItem('sellerLikedReels', JSON.stringify(storedLikes));
  };

  // Confirm Delete
  const confirmDelete = async (reelId) => {
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) throw new Error("Please log in to continue.");
      await axios.delete(`${baseurl}api/seller/reel/${reelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove from stored likes if liked
      updateStoredLikes(reelId, false);
      setReels(reels.filter((reel) => reel.id !== reelId));
      setShowComments(null);
      showToast("Reel deleted successfully!", "success");
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete reel.");
    } finally {
      setShowDeleteModal(false);
      setDeleteReelId(null);
    }
  };

  // Auto-play functionality using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const index = videoRefs.current.indexOf(video);
          if (entry.isIntersecting) {
            video.play().catch((err) => console.log('Autoplay prevented:', err));
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    videoRefs.current.forEach((video) => {
      if (video) {
        observer.observe(video);
      }
    });
    return () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          observer.unobserve(video);
        }
      });
    };
  }, [reels]);

  // Fetch Properties, Reels & Subscription
  useEffect(() => {
    const token = localStorage.getItem("sellertoken");
    if (!token) {
      setError("Please log in to continue.");
      setLoadingProperties(false);
      setLoadingReels(false);
      setLoadingSubscription(false);
      return;
    }

    const fetchProperties = async () => {
      setLoadingProperties(true);
      try {
        const res = await axios.get(`${baseurl}api/seller/getproperties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperties(res.data.properties || []);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Failed to fetch properties.");
      } finally {
        setLoadingProperties(false);
      }
    };

    const fetchReels = async () => {
      setLoadingReels(true);
      try {
        const res = await axios.get(`${baseurl}api/seller/reels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const storedLikes = getStoredLikes();
        const reelsWithData = res.data.reels.map((reel) => ({
          ...reel,
          totalComments: reel.commentsCount || 0,
          comments: reel.comments || [],
          totalLikes: reel.likesCount || 0,
          likedByUser: storedLikes.includes(reel.id),
          muted: false,
          newComment: "",
        }));
        setReels(reelsWithData);
      } catch (err) {
        console.error("Error fetching reels:", err);
        setError("Failed to fetch reels.");
      } finally {
        setLoadingReels(false);
      }
    };

    const fetchSubscription = async () => {
      setLoadingSubscription(true);
      try {
        const res = await axios.get(`${baseurl}api/reel-subscription/seller/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success && res.data.subscription) {
          const sub = res.data.subscription;
          const allowed = sub.totalFreeReels + sub.totalPaidReels;
          setSubscription(sub);
          setTotalAllowed(allowed);
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError("Failed to fetch subscription.");
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchProperties();
    fetchReels();
    fetchSubscription();
  }, []);

  // File Handling
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a valid video file (e.g., MP4).");
      setSelectedFile(null);
    }
  };

  // Upload Reel
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !propertyId) {
      setError("Please fill all fields and select a video.");
      return;
    }
    // Check reel limit
    if (reels.length >= totalAllowed) {
      setError(`You have reached the maximum limit of ${totalAllowed} reels. Cannot upload more.`);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) throw new Error("Please log in to continue.");
      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append("propertyId", propertyId);
      const res = await axios.post(`${baseurl}api/seller/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        // Update stored likes if needed, but new reel starts unliked
        const newReel = { ...res.data.reel, totalComments: 0, comments: [], totalLikes: 0, likedByUser: false, muted: false, newComment: "" };
        setReels([newReel, ...reels]);
        // Optionally refetch subscription to update counts, but since we know the limit is fixed, no need unless backend updates it
        setSelectedFile(null);
        setPropertyId("");
        setIsModalOpen(false);
        showToast("Reel uploaded successfully!", "success");
      } else {
        throw new Error(res.data.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload reel.");
    } finally {
      setUploading(false);
    }
  };

  // Delete Reel
  const handleDelete = (reelId) => {
    setShowDeleteModal(true);
    setDeleteReelId(reelId);
  };

  // Toggle Like/Unlike Reel
  const handleLike = async (reelId) => {
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) throw new Error("Please log in to continue.");
      // Find the current reel state
      const currentReel = reels.find(r => r.id === reelId);
      if (!currentReel) return;
      const endpoint = currentReel.likedByUser ? 'unlike' : 'like';
      await axios.post(
        `${baseurl}api/seller/${reelId}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state and localStorage
      const newLikedStatus = !currentReel.likedByUser;
      updateStoredLikes(reelId, newLikedStatus);
      setReels((prev) =>
        prev.map((reel) =>
          reel.id === reelId
            ? {
                ...reel,
                totalLikes: reel.likedByUser ? reel.totalLikes - 1 : reel.totalLikes + 1,
                likedByUser: newLikedStatus,
              }
            : reel
        )
      );
    } catch (err) {
      console.error("Like/Unlike error:", err);
    }
  };

  // Toggle Mute
  const handleToggleMute = (reelId, index) => {
    const currentReel = reels.find(r => r.id === reelId);
    if (!currentReel) return;
    const newMuted = !currentReel.muted;
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === reelId ? { ...reel, muted: newMuted } : reel
      )
    );
    if (videoRefs.current[index]) {
      videoRefs.current[index].muted = newMuted;
    }
  };

  // Add Comment
  const handleAddComment = async (reelId, text) => {
    if (!text) return;
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) throw new Error("Please log in to continue.");
      const res = await axios.post(
        `${baseurl}api/seller/reels/${reelId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setReels((prev) =>
          prev.map((reel) =>
            reel.id === reelId
              ? {
                  ...reel,
                  comments: [...reel.comments, res.data.comment],
                  totalComments: res.data.totalComments,
                  newComment: "",
                }
              : reel
          )
        );
      }
    } catch (err) {
      console.error("Add comment error:", err.response || err);
      setError("Failed to add comment.");
    }
  };

  // Reset Form
  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    setPropertyId("");
  };

  // Check if can upload
  const canUpload = reels.length < totalAllowed && !loadingSubscription;

  return (
    <div className="min-h-screen bg-gray-800 relative">
      {error && (
        <div className="fixed top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-md z-50">
          {error}
        </div>
      )}
      {toastMessage && (
        <div className={`fixed bottom-4 left-4 right-4 bg-${toastType === 'success' ? 'green' : 'red'}-500 text-white p-3 rounded-md z-50 max-w-md mx-auto`}>
          {toastMessage}
        </div>
      )}
      {/* Total Reels Display */}
      <div className="fixed top-4 left-4 z-50 bg-black/50 text-white p-2 rounded-md">
        <span>Total Reels: {reels.length} / {totalAllowed}</span>
        {loadingSubscription && <span className="ml-2">Loading subscription...</span>}
      </div>
      {/* Upload Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!canUpload || loadingSubscription}
          className={`py-2 px-4 rounded-md text-white ${
            canUpload
              ? "bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 hover:bg-blue-600"
              : "bg-gray-500 cursor-not-allowed"
          }`}
        >
          {loadingSubscription ? "Loading..." : "Upload Reel"}
        </button>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-red-600">Confirm Delete</h2>
            <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete this reel? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteReelId(null); }}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(deleteReelId)}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Upload Reel</h2>
            {!canUpload && !loadingSubscription && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                You have reached the maximum limit of {totalAllowed} reels. Cannot upload more.
              </div>
            )}
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Select Property</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  disabled={uploading || loadingProperties || !canUpload}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a property</option>
                  {loadingProperties ? (
                    <option disabled>Loading...</option>
                  ) : properties.length > 0 ? (
                    properties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.name || `Property ID: ${property._id}`}
                      </option>
                    ))
                  ) : (
                    <option disabled>No properties available</option>
                  )}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Select Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={uploading || !canUpload}
                  className="w-full p-2 border rounded-md"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); handleReset(); }}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || !propertyId || uploading || !canUpload || loadingSubscription}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md disabled:bg-gray-400"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reels */}
      <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
        {loadingReels ? (
          <div className="h-screen flex items-center justify-center text-gray-600">
            Loading reels...
          </div>
        ) : reels.length > 0 ? (
          reels.map((reel, index) => (
            <div
              key={reel.id}
              className="h-screen flex justify-center items-center bg-black snap-start relative"
            >
              <div className="w-full max-w-[320px] relative">
                <div className="relative" style={{ paddingBottom: "177.78%" }}>
                  <video
                    ref={(el) => { videoRefs.current[index] = el; }}
                    muted={reel.muted}
                    loop
                    playsInline
                    src={reel.videoUrl || "https://via.placeholder.com/320x569.mp4"}
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                  />
                 
                  {/* Right Side Buttons - Insta-like stacked with gap */}
                  <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-4 z-20">
                    {/* Like Button */}
                    <div className="flex flex-col items-center space-y-1">
                      <button
                        onClick={() => handleLike(reel.id)}
                        className={`text-2xl p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                          reel.likedByUser
                            ? "text-red-500 bg-red-500/20 scale-110"
                            : "text-white/80 hover:text-white bg-black/30 hover:bg-black/50"
                        }`}
                      >
                        {reel.likedByUser ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      <span className="text-white text-sm font-semibold">
                        {reel.totalLikes}
                      </span>
                    </div>
                    {/* Comment Button */}
                    <div className="flex flex-col items-center space-y-1">
                      <button
                        onClick={() => setShowComments(showComments === reel.id ? null : reel.id)}
                        className="text-2xl p-2 rounded-full text-white/80 hover:text-white bg-black/30 hover:bg-black/50 transition-colors hover:scale-110"
                      >
                        <FaComment />
                      </button>
                      <span className="text-white text-sm font-semibold">
                        {reel.totalComments}
                      </span>
                    </div>
                    {/* Delete Button */}
                    <div className="flex flex-col items-center space-y-1">
                      <button
                        onClick={() => handleDelete(reel.id)}
                        className="text-2xl p-2 rounded-full text-red-500/80 hover:text-red-600 bg-red-500/20 hover:bg-red-500/30 transition-colors hover:scale-110"
                      >
                        <FaTrash />
                      </button>
                      <span className="text-white text-sm font-semibold">Delete</span>
                    </div>
                  </div>
                  {/* Mute/Unmute Button - Bottom right */}
                  <div className="absolute bottom-4 right-4 z-20">
                    <button
                      onClick={() => handleToggleMute(reel.id, index)}
                      className="text-xl p-2 rounded-full text-white/80 hover:text-white bg-black/30 hover:bg-black/50 transition-colors hover:scale-110"
                    >
                      {reel.muted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>
                  </div>
                  {/* Comments Section - Insta-like bottom sheet */}
                  {showComments === reel.id && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm rounded-t-2xl p-4 z-30 animate-slide-up">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-base font-semibold">Comments</h3>
                        <button
                          onClick={() => setShowComments(null)}
                          className="text-white/70 hover:text-white text-xl"
                        >
                          ✕
                        </button>
                      </div>
                      {/* Comments List */}
                      <div className="max-h-[50vh] overflow-y-auto mb-4 space-y-3">
                        {reel.comments.length > 0 ? (
                          reel.comments.map((comment, commentIndex) => (
                            <div key={commentIndex} className="flex space-x-3">
                              <div className="w-8 h-8 bg-gray-500 rounded-full flex-shrink-0" /> {/* Placeholder avatar */}
                              <div className="flex-1">
                                <p className="text-white text-sm">
                                  <span className="font-semibold">{comment.userId?.name || "User"}</span> {comment.text}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm text-center py-4">No comments yet.</p>
                        )}
                      </div>
                      {/* Add Comment Input - Insta-like */}
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-600">
                        <input
                          type="text"
                          value={reel.newComment}
                          onChange={(e) => {
                            const text = e.target.value;
                            setReels((prev) =>
                              prev.map((r) => (r.id === reel.id ? { ...r, newComment: text } : r))
                            );
                          }}
                          placeholder="Add a comment..."
                          className="flex-1 bg-black/20 text-white placeholder-gray-400 p-3 rounded-full focus:outline-none focus:bg-black/30"
                        />
                        <button
                          onClick={() => handleAddComment(reel.id, reel.newComment)}
                          disabled={!reel.newComment.trim()}
                          className="text-blue-400 text-sm font-semibold disabled:text-gray-500 hover:text-blue-300 disabled:hover:text-gray-500"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-screen flex items-center justify-center text-gray-600">
            No reels available.
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SellerReels;