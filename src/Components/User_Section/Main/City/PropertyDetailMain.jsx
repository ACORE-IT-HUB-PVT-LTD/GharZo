import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  MapPin,
  Phone,
  MessageCircle,
  ArrowLeft,
  Star,
  CheckCircle2,
  Trash2,
  Flag,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const API_BASE = "https://api.gharzoreality.com/api";

const getToken = () => localStorage.getItem("usertoken") || localStorage.getItem("authToken");

const PropertyDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    username: "User",
    profilePic:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpGIEIrBlxuFjJfpK_a6hEbf6sSJK-hnjUMBLsCa3BZfZbbL1GGLQPApvV3PHB88d9g7Q&usqp=CAU",
  });

  // Add CSS for 3D animations
  const styles = `
    .animate-3d-check {
      animation: spin3D 2s infinite ease-in-out;
      transform-style: preserve-3d;
    }
    @keyframes spin3D {
      0% { transform: rotateY(0deg) scale(1); filter: drop-shadow(0 0 5px rgba(0, 255, 0, 0.3)); }
      50% { transform: rotateY(180deg) scale(1.1); filter: drop-shadow(0 0 10px rgba(0, 255, 0, 0.5)); }
      100% { transform: rotateY(360deg) scale(1); filter: drop-shadow(0 0 5px rgba(0, 255, 0, 0.3)); }
    }
    .animate-scale {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .animate-scale:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .animate-pulse:hover {
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `;

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/auth/user/profile", {
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Yjk1ZTU2MWE4NDllNGUyNGYzNTY1YiIsInJvbGUiOiJ1c2VyIiwibW9iaWxlIjoiODgyMTk5MTU3MiIsImVtYWlsIjoidmlzaGFsQGdtYWlsLmNvbSIsImlhdCI6MTc1Njk3OTQ3OCwiZXhwIjoxNzU5NTcxNDc4fQ.Bl--VZBIcLqC8v2MAIaFkjlljfwTwTK4ByLA4eWM6pY",
          },
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUserProfile({
            username: data.user.name || "User",
            profilePic:
              data.user.profilePic ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpGIEIrBlxuFjJfpK_a6hEbf6sSJK-hnjUMBLsCa3BZfZbbL1GGLQPApvV3PHB88d9g7Q&usqp=CAU",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        // Try authenticated v2 details endpoint first
        let token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");
        
        if (token) {
          try {
            const resV2 = await fetch(
              `${API_BASE}/v2/properties/${decodeURIComponent(name)}/details`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const dataV2 = await resV2.json();
            if (dataV2.success && dataV2.data) {
              const prop = dataV2.data;
              setProperty({
                ...prop,
                id: prop._id || prop.id,
                postedDays: Math.floor(
                  (new Date() - new Date(prop.createdAt)) / (1000 * 60 * 60 * 24)
                ),
                location: `${prop.location?.address || ""}, ${prop.location?.city || ""}, ${prop.location?.state || ""}`,
                manager: {
                  name: prop.contactInfo?.name || prop.landlordDetails?.name,
                  contactNumber: prop.contactInfo?.phone,
                  email: prop.contactInfo?.email,
                  location: `${prop.location?.city || ""}, ${prop.location?.state || ""}`,
                },
              });
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Authenticated v2 fetch failed:", e);
          }
        }
        
        // Fallback to v2 public endpoint
        const res = await fetch(
          `${API_BASE}/v2/properties/${decodeURIComponent(name)}`,
          { cache: "no-cache" }
        );
        const data = await res.json();
        if (data.success && data.data) {
          const prop = data.data;
          setProperty({
            ...prop,
            id: prop._id || prop.id,
            postedDays: Math.floor(
              (new Date() - new Date(prop.createdAt)) / (1000 * 60 * 60 * 24)
            ),
            location: `${prop.location?.address || ""}, ${prop.location?.city || ""}, ${prop.location?.state || ""}`,
            manager: {
              name: prop.contactInfo?.name || prop.landlordDetails?.name,
              contactNumber: prop.contactInfo?.phone,
              email: prop.contactInfo?.email,
              location: `${prop.location?.city || ""}, ${prop.location?.state || ""}`,
            },
          });
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [name]);

  // Fetch reels data
  useEffect(() => {
    const fetchReels = async () => {
      if (!property?.id) return;
      setReelsLoading(true);
      try {
        const response = await axios.get(
          `https://api.drazeapp.com/api/reels?propertyId=${property.id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.success) {
          setReels(response.data.reels || []);
        } else {
          console.error("Failed to fetch reels:", response.data.message);
          setReels([]);
        }
      } catch (err) {
        console.error("Error fetching reels:", err);
        setReels([]);
      } finally {
        setReelsLoading(false);
      }
    };

    if (property) {
      fetchReels();
    }
  }, [property]);

  // RatingAndComments Component with new API
  function RatingAndComments({ propertyId }) {
    const [rating, setRating] = useState(0);
    const [locationRating, setLocationRating] = useState(0);
    const [cleanlinessRating, setCleanlinessRating] = useState(0);
    const [amenitiesRating, setAmenitiesRating] = useState(0);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewDescription, setReviewDescription] = useState("");
    const [pros, setPros] = useState("");
    const [cons, setCons] = useState("");
    const [tags, setTags] = useState([]);
    const [wouldRecommend, setWouldRecommend] = useState(true);
    const [recommendedFor, setRecommendedFor] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [newToken, setNewToken] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Get token from localStorage
    const getToken = () => localStorage.getItem("usertoken") || localStorage.getItem("authToken");

    // Create axios instance with dynamic token
    const createAxiosInstance = () => {
      const token = getToken();
      return axios.create({
        baseURL: API_BASE,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    };

    // Fetch reviews using new API
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch reviews for this property
        const reviewsResponse = await axios.get(
          `${API_BASE}/property-reviews/property/${propertyId}`
        );
        
        if (reviewsResponse.data?.success) {
          const reviewsList = reviewsResponse.data.data || [];
          setReviews(reviewsList);
        }

        // Fetch property details to get ratings from ratingsAndReviews
        try {
          const propertyResponse = await axios.get(
            `${API_BASE}/v2/properties/${propertyId}`
          );
          
          if (propertyResponse.data?.success && propertyResponse.data.data?.ratingsAndReviews) {
            const ratingsData = propertyResponse.data.data.ratingsAndReviews;
            setStats({
              averageRating: ratingsData.averageRating || 0,
              totalRatings: ratingsData.totalReviews || 0,
              recommendationRate: ratingsData.recommendationRate || 0,
              ratings: ratingsData.ratings || {}
            });
          }
        } catch (propErr) {
          console.error("Error fetching property for ratings:", propErr);
        }

        // Get current user from token
        const token = getToken();
        if (token) {
          try {
            const decoded = jwtDecode(token);
            setCurrentUser(decoded.userName || decoded.fullName || decoded.id || decoded._id);
          } catch (err) {
            console.error("Error decoding token:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error loading reviews.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, [propertyId]);

    const handleSubmitReview = async () => {
      if (!getToken()) {
        setError("Please login to post a review.");
        setShowTokenInput(true);
        return;
      }

      if (!reviewTitle.trim() || !reviewDescription.trim()) {
        setError("Please provide a title and description for your review.");
        return;
      }

      if (rating === 0) {
        setError("Please provide an overall rating.");
        return;
      }

      try {
        setSubmitting(true);
        setError(null);
        const axiosInstance = createAxiosInstance();

        const requestBody = {
          propertyId: propertyId,
          ratings: {
            overall: rating,
            location: locationRating || rating,
            cleanliness: cleanlinessRating || rating,
            amenities: amenitiesRating || rating
          },
          review: {
            title: reviewTitle,
            description: reviewDescription
          },
          pros: pros ? pros.split(",").map(s => s.trim()).filter(Boolean) : [],
          cons: cons ? cons.split(",").map(s => s.trim()).filter(Boolean) : [],
          tags: tags,
          wouldRecommend: wouldRecommend,
          recommendedFor: recommendedFor
        };

        const response = await axiosInstance.post(
          `${API_BASE}/property-reviews/create`,
          requestBody
        );

        if (response.data?.success) {
          // Refresh reviews
          await fetchData();
          
          // Reset form
          setRating(0);
          setLocationRating(0);
          setCleanlinessRating(0);
          setAmenitiesRating(0);
          setReviewTitle("");
          setReviewDescription("");
          setPros("");
          setCons("");
          setTags([]);
          setWouldRecommend(true);
          setRecommendedFor([]);
          
          toast.success(response.data.message || "Review submitted successfully!");
        } else {
          throw new Error(response.data?.message || "Failed to submit review");
        }
      } catch (err) {
        console.error("Error submitting review:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          setShowTokenInput(true);
        } else {
          setError(err.response?.data?.message || "Failed to submit review. Please try again.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    const handleVote = async (reviewId, voteType) => {
      if (!getToken()) {
        setError("Please login to vote.");
        setShowTokenInput(true);
        return;
      }

      try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.post(
          `${API_BASE}/property-reviews/${reviewId}/vote`,
          { voteType }
        );

        if (response.data?.success) {
          await fetchData();
          toast.success("Vote recorded!");
        }
      } catch (err) {
        console.error("Error voting:", err);
        toast.error(err.response?.data?.message || "Failed to record vote");
      }
    };

    const handleFlag = async (reviewId, reason) => {
      if (!getToken()) {
        setError("Please login to flag.");
        setShowTokenInput(true);
        return;
      }

      try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.post(
          `${API_BASE}/property-reviews/${reviewId}/flag`,
          { reason }
        );

        if (response.data?.success) {
          toast.success("Review flagged successfully!");
        }
      } catch (err) {
        console.error("Error flagging:", err);
        toast.error(err.response?.data?.message || "Failed to flag review");
      }
    };

    const handleTokenSubmit = () => {
      if (newToken.trim()) {
        localStorage.setItem("usertoken", newToken);
        setShowTokenInput(false);
        setNewToken("");
        setError(null);
        fetchData();
      }
    };

    const getReviewerInfo = (review) => {
      return {
        name: review.reviewerInfo?.name || review.reviewerId?.name || "Anonymous",
        role: review.reviewerInfo?.role || "user",
        isVerified: review.verification?.isVerified || false
      };
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
      <div className="mt-8 bg-white p-4 sm:p-6 border rounded-lg shadow animate-scale">
        <ToastContainer position="top-right" />
        <h4 className="text-xl font-semibold mb-4">Rate & Comment</h4>

        {error && (
          <div className="mb-4 text-red-500 text-sm p-3 bg-red-50 rounded-lg">{error}</div>
        )}

        {showTokenInput && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter authentication token"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              className="flex-1 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleTokenSubmit}
              className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-2 rounded-lg text-sm"
            >
              Submit
            </button>
          </div>
        )}

        {stats && (
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-orange-600">
                {stats.averageRating?.toFixed(1) || "0.0"}
              </div>
              <div>
                <div className="flex text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      fill={i < Math.round(stats.averageRating || 0) ? "currentColor" : "none"} 
                      className={i < Math.round(stats.averageRating || 0) ? "text-amber-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm">
                  Based on {stats.totalRatings || 0} reviews
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {getToken() ? (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-semibold mb-3">Write a Review</h5>
            
            {/* Overall Rating */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating *</label>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <span
                      key={i}
                      onClick={() => setRating(starValue)}
                      className={`cursor-pointer text-2xl ${starValue <= rating ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ★
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Review Title */}
            <div className="mb-3">
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Review title..."
                className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Review Description */}
            <div className="mb-3">
              <textarea
                value={reviewDescription}
                onChange={(e) => setReviewDescription(e.target.value)}
                placeholder="Your experience..."
                rows={2}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <input
                type="text"
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                placeholder="Pros (comma separated)"
                className="border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                placeholder="Cons (comma separated)"
                className="border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Would Recommend */}
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={wouldRecommend}
                  onChange={(e) => setWouldRecommend(e.target.checked)}
                  className="w-4 h-4"
                />
                Would recommend this property
              </label>
            </div>

            <button
              onClick={handleSubmitReview}
              disabled={submitting || !rating || !reviewTitle.trim() || !reviewDescription.trim()}
              className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-gray-600 mb-2">Please login to write a review</p>
            <button
              onClick={() => navigate('/user/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              Login to Review
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => {
              const reviewer = getReviewerInfo(review);
              return (
                <div key={review._id || index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                        {reviewer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{reviewer.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(review.reviewDate || review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < (review.ratings?.overall || 0) ? "currentColor" : "none"} 
                          className={i < (review.ratings?.overall || 0) ? "text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                  </div>

                  {review.review?.title && (
                    <h5 className="font-semibold text-sm mb-1">{review.review.title}</h5>
                  )}
                  {review.review?.description && (
                    <p className="text-gray-700 text-sm mb-2">{review.review.description}</p>
                  )}

                  {/* Pros & Cons */}
                  {(review.review?.pros?.length > 0 || review.review?.cons?.length > 0) && (
                    <div className="flex flex-wrap gap-3 mb-2 text-xs">
                      {review.review?.pros?.length > 0 && (
                        <span className="text-emerald-600">✓ {review.review.pros.join(', ')}</span>
                      )}
                      {review.review?.cons?.length > 0 && (
                        <span className="text-red-500">✗ {review.review.cons.join(', ')}</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t">
                    <button
                      onClick={() => handleVote(review._id, 'helpful')}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600"
                    >
                      <ThumbsUp size={12} />
                      <span>({review.helpfulVotes?.helpful || 0})</span>
                    </button>
                    <button
                      onClick={() => handleVote(review._id, 'notHelpful')}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
                    >
                      <ThumbsDown size={12} />
                      <span>({review.helpfulVotes?.notHelpful || 0})</span>
                    </button>
                    <button
                      onClick={() => handleFlag(review._id, 'Offensive content')}
                      className="text-xs text-gray-500 hover:text-red-600 ml-auto"
                    >
                      <Flag size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center text-gray-500">
        Property not found for {decodeURIComponent(name)}.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-4 py-10 max-w-7xl mx-auto">
      <style>{styles}</style>
      {/* Image Carousel */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-56 sm:h-64 md:h-80 lg:h-96"
        >
          {property.images.length > 0 ? (
            property.images.map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img}
                  alt={`Property ${i}`}
                  className="w-full h-56 sm:h-64 md:h-80 lg:h-96 object-cover rounded-xl"
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <img
                src="https://via.placeholder.com/400x250?text=No+Image"
                alt="No Image"
                className="w-full h-56 sm:h-64 md:h-80 lg:h-96 object-cover rounded-xl"
              />
            </SwiperSlide>
          )}
        </Swiper>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-2 left-2 bg-white rounded-full p-2 shadow animate-scale"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className="bg-white rounded-full p-2 shadow animate-pulse"
          >
            <Heart
              size={18}
              className={liked ? "text-red-500" : "text-gray-400"}
              fill={liked ? "red" : "none"}
            />
          </button>
          <button 
            className="bg-white rounded-full p-2 shadow animate-pulse"
            onClick={() => {
              // Get property ID from the property object
              const propertyId = property.id || property._id;
              if (propertyId) {
                window.location.href = `https://gharzoreality.com/property/${propertyId}`;
              }
            }}
          >
            <Share2 size={18} className="text-gray-600" />
          </button>
          <button
            className="bg-white rounded-full p-2 shadow animate-pulse"
            onClick={() => {
              if (property.location) {
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    property.location
                  )}`,
                  "_blank"
                );
              }
            }}
            disabled={!property.location}
          >
            <MapPin
              size={18}
              className={property.location ? "text-green-600" : "text-gray-400"}
            />
          </button>
        </div>
        {property.availability.hasAvailableRooms && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded animate-scale">
            AVAILABLE ({property.availability.availableRoomCount} rooms,{" "}
            {property.availability.availableBedCount} beds)
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {property.name}
        </h1>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <MapPin size={16} className="mr-1 text-red-500" />
          {property.location}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-6 border-b mt-4 text-gray-600 overflow-x-auto">
          <button
            className={`pb-2 whitespace-nowrap ${
              activeTab === "description"
                ? "border-b-2 border-orange-500 font-medium text-orange-600"
                : ""
            } animate-scale`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`pb-2 whitespace-nowrap ${
              activeTab === "gallery"
                ? "border-b-2 border-orange-500 font-medium text-orange-600"
                : ""
            } animate-scale`}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery
          </button>
          <button
            className={`pb-2 whitespace-nowrap ${
              activeTab === "rooms"
                ? "border-b-2 border-orange-500 font-medium text-orange-600"
                : ""
            } animate-scale`}
            onClick={() => setActiveTab("rooms")}
          >
            Rooms
          </button>
          <button
            className={`pb-2 whitespace-nowrap ${
              activeTab === "review"
                ? "border-b-2 border-orange-500 font-medium text-orange-600"
                : ""
            } animate-scale`}
            onClick={() => setActiveTab("review")}
          >
            Reviews
          </button>
          <button
            className={`pb-2 whitespace-nowrap ${
              activeTab === "reels"
                ? "border-b-2 border-orange-500 font-medium text-orange-600"
                : ""
            } animate-scale`}
            onClick={() => setActiveTab("reels")}
          >
            Reels
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "description" && (
          <div className="mt-4">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {property.description}
            </p>
            <h3 className="mt-4 font-semibold text-lg">Facilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {Object.entries(property.facilitiesDetail).flatMap(
                ([category, facilities]) =>
                  Object.entries(facilities).map(([key, value]) =>
                    value.available ? (
                      <div
                        key={`${category}-${key}`}
                        className="flex items-center text-gray-700 text-sm"
                      >
                        <CheckCircle2 className="text-green-500 mr-2 animate-3d-check" />
                        {key.charAt(0).toUpperCase() +
                          key
                            .slice(1)
                            .replace(/([A-Z])/g, " $1")
                            .trim()}
                        : Available in {value.count} rooms ({value.percentage}%)
                      </div>
                    ) : null
                  )
              )}
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {property.images.length > 0 ? (
              property.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="gallery"
                  className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg animate-scale"
                />
              ))
            ) : (
              <img
                src="https://via.placeholder.com/400x250?text=No+Image"
                alt="No Image"
                className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg col-span-full animate-scale"
              />
            )}
          </div>
        )}

        {activeTab === "reels" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reelsLoading ? (
              <div className="flex justify-center items-center min-h-[200px] col-span-full">
                <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              </div>
            ) : reels.length > 0 ? (
              reels.map((reel, i) => (
                <div
                  key={i}
                  className="video-container rounded-lg overflow-hidden"
                >
                  <video
                    src={reel.videoUrl}
                    controls
                    muted
                    playsInline
                    className="w-full h-64 object-cover rounded-lg bg-black"
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-full">
                No reels available for this property.
              </p>
            )}
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="mt-4 space-y-4">
            {property.rooms.map((room) => (
              <div
                key={room.roomId}
                className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg animate-scale"
              >
                <h3 className="font-semibold text-lg">
                  {room.name} ({room.type})
                </h3>
                <p className="text-red-500 font-bold">
                  ₹{room.price.toLocaleString()}/month
                </p>
                <p className="text-gray-600 text-sm">
                  Capacity: {room.capacity}
                </p>
                <p className="text-gray-600 text-sm">
                  Beds: {room.availableBeds} available out of {room.totalBeds}
                </p>
                <p className="text-gray-600 text-sm">Status: {room.status}</p>
                {room.facilities.length > 0 && (
                  <div>
                    <p className="font-medium mt-2 text-sm">Facilities:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {room.facilities.map((facility, i) => (
                        <div
                          key={i}
                          className="flex items-center text-gray-700 text-sm"
                        >
                          <CheckCircle2 className="text-green-500 mr-2 animate-3d-check" />
                          {facility}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {room.beds && room.beds.length > 0 && (
                  <div>
                    <p className="font-medium mt-2 text-sm">Beds:</p>
                    <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                      {room.beds.map((bed) => (
                        <li key={bed.bedId}>
                          {bed.name}: ₹{bed.price.toLocaleString()}/month (
                          {bed.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "review" && (
          <div className="mt-4 space-y-4">
            <RatingAndComments propertyId={property.id} />
          </div>
        )}

        {/* Manager Info */}
        <div className="mt-6 bg-gray-100 p-4 rounded-xl shadow-md animate-scale">
          <h2 className="font-semibold mb-2">Area Manager</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">{property.manager.name}</p>
              <p className="text-sm text-gray-600">
                {property.manager.location}
              </p>
              <p className="text-sm text-gray-600">{property.manager.email}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-2 rounded-full flex items-center gap-1 animate-scale"
                onClick={() =>
                  (window.location.href = `tel:${property.manager.contactNumber}`)
                }
              >
                <Phone size={16} /> Call
              </button>
              <button
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-2 rounded-full flex items-center gap-1 animate-scale"
                onClick={() =>
                  (window.location.href = `mailto:${property.manager.email}`)
                }
              >
                <MessageCircle size={16} /> Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="sticky bottom-0 bg-white p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xl sm:text-2xl font-bold text-red-500">
          ₹{property.pricing.rooms.min.toLocaleString()} - ₹
          {property.pricing.rooms.max.toLocaleString()}/month
        </p>
        <button className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-6 py-2 rounded-full animate-scale w-full sm:w-auto">
          I'm Interested
        </button>
      </div>
    </div>
  );
};

export default PropertyDetails;