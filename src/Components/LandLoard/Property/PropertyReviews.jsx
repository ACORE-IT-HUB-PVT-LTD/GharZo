import React, { useEffect, useState } from "react";
import { FaStar, FaReply, FaCheck, FaTimes, FaBuilding, FaMapMarkerAlt } from "react-icons/fa";
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
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { id } = useParams();

  // Get token from localStorage (checks multiple keys)
  const getToken = () => {
    return (
      localStorage.getItem("usertoken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null
    );
  };

  const token = getToken();

  // ─── Fetch property details ───────────────────────────────────────────────
  const fetchPropertyDetails = async () => {
    if (!token || !id) return;
    try {
      const res = await axios.get(`${BASE_URL}/v2/properties/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPropertyDetails(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch property details:", err);
    }
  };

  // ─── Fetch all landlord reviews (uses /landlord endpoint) ────────────────
  const fetchReviews = async () => {
    if (!token) {
      setError("Authentication token not found. Please login.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/property-reviews/landlord`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        let reviewsData = res.data.data || [];

        // If a property id is provided via route params, filter to that property
        if (id) {
          reviewsData = reviewsData.filter(
            (r) =>
              r.propertyId?._id === id ||
              r.propertyId === id
          );
        }

        setReviews(reviewsData);
        setTotalRatings(reviewsData.length);

        if (reviewsData.length > 0) {
          const total = reviewsData.reduce(
            (sum, r) => sum + (r.ratings?.overall || 0),
            0
          );
          setAvgRating(total / reviewsData.length);
        } else {
          setAvgRating(0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError(
        err.response?.data?.message || "Failed to load reviews. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (id) await fetchPropertyDetails();
      await fetchReviews();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── Submit landlord response ─────────────────────────────────────────────
  const handleResponseSubmit = async (reviewId) => {
    if (!responseText.trim()) {
      alert("Please enter a response before submitting.");
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
        // Update the specific review in local state so UI refreshes instantly
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  landlordResponse: res.data.data.landlordResponse,
                }
              : r
          )
        );
        setRespondingTo(null);
        setResponseText("");
      }
    } catch (err) {
      console.error("Failed to submit response:", err);
      alert(err.response?.data?.message || "Failed to submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const renderStars = (rating, size = "text-lg") => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`${size} ${i < Math.round(rating) ? "text-orange-500" : "text-gray-300"}`}
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

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Reviews</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={fetchReviews}
            className="px-6 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Header Card ── */}
        <div className="bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 text-white rounded-2xl shadow-2xl overflow-hidden mb-4 sm:mb-6">
          <div className="p-4 sm:p-8">
            {/* Property Info */}
            {propertyDetails && (
              <div className="flex items-start gap-3 mb-4 sm:mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaBuilding className="text-white text-sm sm:text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-blue-200 font-medium uppercase tracking-wide">Property</p>
                  <p className="text-sm sm:text-base font-bold truncate">{propertyDetails.title}</p>
                  {propertyDetails.location?.address && (
                    <p className="text-[10px] sm:text-xs text-blue-200 flex items-center gap-1 mt-0.5 truncate">
                      <FaMapMarkerAlt className="flex-shrink-0" />
                      {propertyDetails.location.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Rating Summary */}
            <div className="text-center">
              <h1 className="text-sm sm:text-base font-semibold text-blue-200 mb-3 uppercase tracking-widest">
                Property Reviews &amp; Feedback
              </h1>
              <div className="flex justify-center gap-1 mb-2">
                {renderStars(avgRating, "text-xl sm:text-2xl")}
              </div>
              <p className="text-5xl sm:text-6xl font-black tracking-tight">
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              </p>
              {avgRating > 0 && (
                <p className="text-base sm:text-lg font-semibold text-orange-300 mt-1">
                  {getRatingLabel(avgRating)}
                </p>
              )}
              <p className="text-sm text-blue-200 mt-1">
                Based on {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="bg-white/10 px-4 sm:px-8 py-3 flex items-center gap-3 border-t border-white/10">
            <span className="text-sm sm:text-base font-bold text-white">
              All Reviews
            </span>
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {reviews.length}
            </span>
          </div>
        </div>

        {/* ── Reviews List ── */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-10 sm:p-16 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-blue-300 text-2xl" />
              </div>
              <p className="text-gray-500 text-base sm:text-lg font-medium">No reviews yet</p>
              <p className="text-gray-400 text-sm mt-1">Reviews for this property will appear here.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  {/* Reviewer Header */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-full flex items-center justify-center text-base sm:text-lg font-bold shadow-md flex-shrink-0">
                      {(r.reviewerInfo?.name?.[0] || r.reviewerId?.name?.[0] || "U").toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                          {r.reviewerInfo?.name || r.reviewerId?.name || "Anonymous User"}
                        </h3>
                        {r.reviewerInfo?.role && (
                          <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize font-medium">
                            {r.reviewerInfo.role}
                          </span>
                        )}
                        {r.verification?.isVerified && (
                          <span className="flex items-center gap-1 text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            <FaCheck className="text-[8px]" /> Verified
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                        <div className="flex gap-0.5">{renderStars(r.ratings?.overall || 0, "text-sm sm:text-base")}</div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">
                          {(r.ratings?.overall || 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          • {formatDate(r.reviewDate || r.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property (if showing all reviews from /landlord) */}
                  {r.propertyId?.title && !id && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg mb-3 w-fit">
                      <FaBuilding className="flex-shrink-0" />
                      <span className="font-medium">{r.propertyId.title}</span>
                      {r.propertyId.location?.city && (
                        <span className="text-blue-400">· {r.propertyId.location.city}</span>
                      )}
                    </div>
                  )}

                  {/* Rating Categories */}
                  {r.ratings && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                      {r.ratings.location > 0 && (
                        <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-0.5 sm:py-1 rounded-full border border-gray-200">
                          📍 Location: {r.ratings.location}/5
                        </span>
                      )}
                      {r.ratings.cleanliness > 0 && (
                        <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-0.5 sm:py-1 rounded-full border border-gray-200">
                          ✨ Cleanliness: {r.ratings.cleanliness}/5
                        </span>
                      )}
                      {r.ratings.amenities > 0 && (
                        <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-0.5 sm:py-1 rounded-full border border-gray-200">
                          🏠 Amenities: {r.ratings.amenities}/5
                        </span>
                      )}
                    </div>
                  )}

                  {/* Review Title + Description */}
                  {r.review?.title && (
                    <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-1">
                      {r.review.title}
                    </h4>
                  )}
                  {r.review?.description && (
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3">
                      {r.review.description}
                    </p>
                  )}

                  {/* Pros */}
                  {r.review?.pros?.length > 0 && (
                    <div className="mb-2 sm:mb-3">
                      <p className="text-[10px] sm:text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Pros</p>
                      <div className="flex flex-wrap gap-1.5">
                        {r.review.pros.map((pro, idx) => (
                          <span key={idx} className="text-[10px] sm:text-xs bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded-full">
                            + {pro}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cons */}
                  {r.review?.cons?.length > 0 && (
                    <div className="mb-2 sm:mb-3">
                      <p className="text-[10px] sm:text-xs font-bold text-red-700 uppercase tracking-wide mb-1">Cons</p>
                      <div className="flex flex-wrap gap-1.5">
                        {r.review.cons.map((con, idx) => (
                          <span key={idx} className="text-[10px] sm:text-xs bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-full">
                            - {con}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {r.review?.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {r.review.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] sm:text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Would Recommend */}
                  {r.wouldRecommend !== undefined && (
                    <p className="text-xs sm:text-sm mb-3">
                      {r.wouldRecommend ? (
                        <span className="text-green-600 font-semibold">✓ Would recommend</span>
                      ) : (
                        <span className="text-red-600 font-semibold">✗ Would not recommend</span>
                      )}
                    </p>
                  )}

                  {/* Helpful Votes */}
                  {r.helpfulVotes?.helpful > 0 && (
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-3">
                      👍 {r.helpfulVotes.helpful} {r.helpfulVotes.helpful === 1 ? "person" : "people"} found this helpful
                    </p>
                  )}

                  {/* ── Landlord Response ── */}
                  {r.landlordResponse?.responded ? (
                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm font-bold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                        <FaReply className="transform rotate-180" />
                        Owner Response
                        {r.landlordResponse.respondedBy?.name && (
                          <span className="text-[10px] sm:text-xs font-normal text-emerald-600 ml-1">
                            by {r.landlordResponse.respondedBy.name}
                          </span>
                        )}
                      </p>
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                        {r.landlordResponse.response}
                      </p>
                      {r.landlordResponse.respondedAt && (
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                          Responded on {formatDate(r.landlordResponse.respondedAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3">
                      {respondingTo === r._id ? (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            Write your response
                          </p>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response to this review..."
                            className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleResponseSubmit(r._id)}
                              disabled={submitting}
                              className="px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-1.5 transition"
                            >
                              {submitting ? (
                                <>
                                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                                  <span>Submitting...</span>
                                </>
                              ) : (
                                "Submit Response"
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText("");
                              }}
                              disabled={submitting}
                              className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-300 flex items-center gap-1.5 transition disabled:opacity-50"
                            >
                              <FaTimes className="text-[10px]" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setRespondingTo(r._id);
                            setResponseText("");
                          }}
                          className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-lg text-xs sm:text-sm font-semibold hover:shadow-lg transition flex items-center gap-1.5"
                        >
                          <FaReply />
                          Respond to Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyFeedback;