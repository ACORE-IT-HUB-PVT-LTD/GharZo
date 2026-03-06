import React, { useEffect, useState } from "react";
import { FaStar, FaReply, FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";

const BASE_URL = "https://api.gharzoreality.com/api";

const PropertyFeedback = () => {
  const [reviews, setReviews] = useState([]);
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("reviews");
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { id } = useParams();
  
  // Get token from local storage (check multiple keys)
  const getToken = () => {
    let token = localStorage.getItem("usertoken");
    if (!token) token = localStorage.getItem("token");
    if (!token) token = localStorage.getItem("authToken");
    return token;
  };
  
  const token = getToken();

  // Fetch property details
  const fetchPropertyDetails = async () => {
    if (!token || !id) return;
    try {
      const res = await axios.get(
        `${BASE_URL}/v2/properties/${id}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setPropertyDetails(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch property details:", err);
    }
  };

  // Fetch reviews for the property
  const fetchReviews = async () => {
    if (!token || !id) {
      setError("Missing token or property ID");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const reviewsRes = await axios.get(
        `${BASE_URL}/property-reviews/property/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (reviewsRes.data.success) {
        const reviewsData = reviewsRes.data.data || [];
        setReviews(reviewsData);
        setTotalRatings(reviewsData.length);
        
        // Calculate average rating from the reviews
        if (reviewsData.length > 0) {
          const total = reviewsData.reduce((sum, r) => sum + (r.ratings?.overall || 0), 0);
          setAvgRating(total / reviewsData.length);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchPropertyDetails();
      await fetchReviews();
    };
    loadData();
  }, [id, token]);

  // Handle response submit
  const handleResponseSubmit = async (reviewId) => {
    if (!responseText.trim()) {
      alert("Please enter a response");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/property-reviews/${reviewId}/respond`,
        { response: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        alert("Response added successfully!");
        setRespondingTo(null);
        setResponseText("");
        // Refresh reviews to show updated data
        await fetchReviews();
      }
    } catch (err) {
      console.error("Failed to submit response:", err);
      alert(err.response?.data?.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`text-lg ${i < rating ? "text-orange-500" : "text-gray-300"}`}
      />
    ));
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4) return "Very Good";
    if (rating >= 3) return "Good";
    if (rating >= 2) return "Fair";
    return "Poor";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden">
        {/* Header - Gharzo Branded */}
        <div className="bg-gradient-to-br from-blue-800 to-blue-900 text-white p-3 sm:p-6 relative">
          {/* Property Info Badge */}
          {propertyDetails && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2">
              <p className="text-[10px] sm:text-xs opacity-80">Property</p>
              <p className="text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-[200px]">{propertyDetails.title}</p>
            </div>
          )}
          
          <h1 className="text-base sm:text-xl font-bold mb-2 sm:mb-4 mt-1 sm:mt-2">Property Reviews & Feedback</h1>
          <div className="flex justify-center gap-1 mb-2">
            {renderStars(Math.round(avgRating))}
          </div>
          <p className="text-4xl font-extrabold">{avgRating.toFixed(1)}</p>
          <p className="text-lg opacity-90">Based on {totalRatings} reviews</p>
          {avgRating > 0 && (
            <p className="text-sm opacity-75 mt-1">{getRatingLabel(avgRating)}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-3 sm:py-5 text-base sm:text-lg font-bold transition-all ${
              activeTab === "reviews"
                ? "text-orange-600 border-b-4 border-orange-600 bg-white"
                : "text-gray-600 hover:text-blue-800"
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <div className="p-3 sm:p-6">
          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-center text-gray-500 text-base sm:text-lg py-8 sm:py-12">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-blue-200 shadow-md">
                    <div className="flex items-start gap-2 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-full flex items-center justify-center text-base sm:text-xl font-bold shadow-lg flex-shrink-0">
                        {r.reviewerInfo?.name?.[0]?.toUpperCase() || r.reviewerId?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-extrabold text-blue-900">
                              {r.reviewerInfo?.name || r.reviewerId?.name || "Anonymous User"}
                            </h3>
                            {r.reviewerInfo?.role && (
                              <span className="text-[10px] sm:text-xs bg-blue-200 text-blue-800 px-1.5 sm:px-2 py-0.5 rounded-full capitalize ml-1 sm:ml-0">
                                {r.reviewerInfo.role}
                              </span>
                            )}
                          </div>
                          {r.verification?.isVerified && (
                            <span className="flex items-center gap-1 text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full mt-1 sm:mt-0">
                              <FaCheck className="text-[8px] sm:text-[10px]" /> Verified
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 mb-2 sm:mb-3">
                          <div className="flex gap-0.5 sm:gap-1">
                            {renderStars(r.ratings?.overall || 0)}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            {r.ratings?.overall?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-xs text-gray-500">
                            • {new Date(r.reviewDate || r.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        {/* Rating Categories */}
                        {r.ratings && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-3 mb-2 sm:mb-3">
                            {r.ratings.location > 0 && (
                              <span className="text-[10px] sm:text-xs bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-blue-200">
                                Location: {r.ratings.location}/5
                              </span>
                            )}
                            {r.ratings.cleanliness > 0 && (
                              <span className="text-[10px] sm:text-xs bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-blue-200">
                                Cleanliness: {r.ratings.cleanliness}/5
                              </span>
                            )}
                            {r.ratings.amenities > 0 && (
                              <span className="text-[10px] sm:text-xs bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-blue-200">
                                Amenities: {r.ratings.amenities}/5
                              </span>
                            )}
                          </div>
                        )}

                        {/* Review Title */}
                        {r.review?.title && (
                          <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">
                            {r.review.title}
                          </h4>
                        )}
                        
                        {/* Review Description */}
                        {r.review?.description && (
                          <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-2 sm:mb-3">
                            {r.review.description}
                          </p>
                        )}

                        {/* Pros */}
                        {r.review?.pros && r.review.pros.length > 0 && (
                          <div className="mb-2 sm:mb-3">
                            <p className="text-[10px] sm:text-sm font-semibold text-green-700 mb-0.5 sm:mb-1">Pros:</p>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {r.review.pros.map((pro, idx) => (
                                <span key={idx} className="text-[10px] sm:text-xs bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 rounded-full">
                                  + {pro}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cons */}
                        {r.review?.cons && r.review.cons.length > 0 && (
                          <div className="mb-2 sm:mb-3">
                            <p className="text-[10px] sm:text-sm font-semibold text-red-700 mb-0.5 sm:mb-1">Cons:</p>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {r.review.cons.map((con, idx) => (
                                <span key={idx} className="text-[10px] sm:text-xs bg-red-100 text-red-800 px-1.5 sm:px-2 py-0.5 rounded-full">
                                  - {con}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {r.review?.tags && r.review.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            {r.review.tags.map((tag, idx) => (
                              <span key={idx} className="text-[10px] sm:text-xs bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Would Recommend */}
                        {r.wouldRecommend !== undefined && (
                          <p className="text-xs sm:text-sm mb-2 sm:mb-3">
                            {r.wouldRecommend ? (
                              <span className="text-green-600 font-medium">✓ Would recommend</span>
                            ) : (
                              <span className="text-red-600 font-medium">✗ Would not recommend</span>
                            )}
                          </p>
                        )}

                        {/* Landlord Response */}
                        {r.landlordResponse?.responded ? (
                          <div className="mt-3 sm:mt-4 bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
                            <p className="text-xs sm:text-sm font-semibold text-green-800 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                              <FaReply className="transform rotate-180" /> Owner Response
                            </p>
                            <p className="text-gray-700 text-sm sm:text-base">{r.landlordResponse.response}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">
                              Responded on {new Date(r.landlordResponse.respondedAt).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                        ) : (
                          /* Response Form */
                          <div className="mt-3 sm:mt-4">
                            {respondingTo === r._id ? (
                              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Respond to this review</p>
                                <textarea
                                  value={responseText}
                                  onChange={(e) => setResponseText(e.target.value)}
                                  placeholder="Write your response to this review..."
                                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                                  rows={3}
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleResponseSubmit(r._id)}
                                    disabled={submitting}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 sm:gap-2"
                                  >
                                    {submitting ? (
                                      <>
                                        <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        <span className="hidden sm:inline">Submitting...</span>
                                      </>
                                    ) : (
                                      <>Submit Response</>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRespondingTo(null);
                                      setResponseText("");
                                    }}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 flex items-center gap-1.5 sm:gap-2"
                                  >
                                    <FaTimes />
                                    <span className="hidden sm:inline">Cancel</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setRespondingTo(r._id)}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg transition flex items-center gap-1.5 sm:gap-2"
                              >
                                <FaReply />
                                <span className="hidden sm:inline">Respond to Review</span>
                                <span className="sm:hidden">Respond</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Helpful Votes */}
                        {r.helpfulVotes && (
                          <div className="mt-2 sm:mt-3 text-[10px] sm:text-sm text-gray-500">
                            {r.helpfulVotes.helpful} found this helpful
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyFeedback;
