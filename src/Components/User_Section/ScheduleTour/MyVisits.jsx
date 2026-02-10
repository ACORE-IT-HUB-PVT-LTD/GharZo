import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaHome,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaComment,
  FaStar,
  FaUser,
  FaHeart,
  FaClock,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaHotel,
  FaRupeeSign,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaThumbsUp,
  FaThumbsDown,
  FaTimes,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl";

const MyVisitsAndEnquiries = () => {
  const [visitorVisits, setVisitorVisits] = useState([]);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [hotelEnquiries, setHotelEnquiries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  
  // Rating states
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [interestedInBuying, setInterestedInBuying] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  const getToken = () => localStorage.getItem("usertoken") || null;

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-600 border-gray-200";
    const s = status.toLowerCase();
    if (s.includes("completed") || s.includes("confirmed") || s.includes("contacted"))
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s.includes("cancelled") || s.includes("rejected"))
      return "bg-red-50 text-red-700 border-red-200";
    if (s.includes("pending") || s.includes("confirmation"))
      return "bg-orange-50 text-orange-700 border-orange-200";
    if (s.includes("scheduled"))
      return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s.includes("completed") || s.includes("confirmed") || s.includes("contacted"))
      return <FaCheckCircle className="inline" />;
    if (s.includes("cancelled") || s.includes("rejected"))
      return <FaTimesCircle className="inline" />;
    if (s.includes("pending") || s.includes("confirmation"))
      return <FaClock className="inline" />;
    return <FaClock className="inline" />;
  };

  const filterItems = (items) =>
    filterStatus === "all"
      ? items
      : items.filter((item) =>
          (item.statusText || item.status || "").toLowerCase().includes(filterStatus)
        );

  // Fetch my visit requests from new API
  const fetchMyVisitRequests = async () => {
    const token = getToken();
    if (!token) return [];
    try {
      const res = await fetch(
        `${baseurl}api/visits/my-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        return data.data.map((v) => ({
          ...v,
          type: "myrequest",
        }));
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchUserVisits = async () => {
    const token = getToken();
    if (!token) return [];
    try {
      const decoded = decodeToken(token);
      const userId = decoded?.id;
      if (!userId) return [];

      const res = await fetch(
        `${baseurl}api/visits/user?populate[propertyId][populate]=*&populate[landlordId][populate]=*`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.visits)) {
        return data.visits.map((v) => ({
          ...v,
          type: "visitor",
          propertyId: v.propertyId?.data?.attributes || v.propertyId || {},
          landlordId: v.landlordId?.data?.attributes || v.landlordId || {},
        }));
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchSellerRequests = async () => {
    const token = getToken();
    if (!token) return [];
    try {
      const res = await fetch(`${baseurl}api/seller/uservisit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.visits)) {
        return data.visits.map((v) => ({
          ...v,
          type: "seller",
          propertyId: v.propertyId || {},
          landlordId: v.landlordId || { name: v.landlordName || v.name, mobile: v.landlordMobile || v.mobile },
        }));
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchAllData = async () => {
    const token = getToken();
    if (!token) {
      setError("Please login to view your data.");
      toast.error("Login required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [myRequests, visits, sellerReqs] = await Promise.all([
        fetchMyVisitRequests(),
        fetchUserVisits(),
        fetchSellerRequests(),
      ]);

      // Combine my requests with visitor visits (avoid duplicates)
      const combinedVisits = [...myRequests, ...visits];
      setVisitorVisits(combinedVisits);
      setSellerRequests(sellerReqs);
      setHotelEnquiries([]);
    } catch (err) {
      setError("Failed to load data");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Cancel visit function
  const handleCancelVisit = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setCancelling(true);
    const token = getToken();

    try {
      const res = await fetch(
        `${baseurl}api/visits/${selectedVisit._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: cancelReason }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Visit cancelled successfully");
        setShowCancelModal(false);
        setCancelReason("");
        setSelectedVisit(null);
        fetchAllData(); // Refresh data
      } else {
        toast.error(data.message || "Failed to cancel visit");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error cancelling visit");
    } finally {
      setCancelling(false);
    }
  };

  // Submit rating function
  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingRating(true);
    const token = getToken();

    try {
      const res = await fetch(
        `${baseurl}api/visits/${selectedVisit._id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            review,
            liked,
            disliked,
            interestedInBuying,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Rating submitted successfully");
        setShowRatingModal(false);
        resetRatingForm();
        fetchAllData(); // Refresh data
      } else {
        toast.error(data.message || "Failed to submit rating");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const resetRatingForm = () => {
    setRating(0);
    setReview("");
    setLiked([]);
    setDisliked([]);
    setInterestedInBuying(false);
    setSelectedVisit(null);
  };

  const openCancelModal = (visit) => {
    setSelectedVisit(visit);
    setShowCancelModal(true);
  };

  const openRatingModal = (visit) => {
    setSelectedVisit(visit);
    setShowRatingModal(true);
  };

  const toggleLiked = (item) => {
    setLiked((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleDisliked = (item) => {
    setDisliked((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const aspectOptions = [
    "Location",
    "Amenities",
    "Price",
    "Maintenance",
    "Security",
    "Parking",
    "Connectivity",
    "Neighbourhood",
  ];

  const renderVisitCard = (visit) => {
    const isMyRequest = visit.type === "myrequest";
    const isVisitor = visit.type === "visitor";
    
    // Handle property data
    let propertyName, address, landlordName, landlordMobile, propertyImage;
    
    if (isMyRequest) {
      propertyName = visit.propertyId?.title || "Unknown Property";
      address = visit.propertyId?.location?.address || "N/A";
      landlordName = visit.assignedTo?.name || "N/A";
      landlordMobile = visit.assignedTo?.userId?.phone || "N/A";
      propertyImage = visit.propertyId?.images?.[0]?.url || null;
    } else {
      propertyName = visit.propertyId?.name || "Unknown Property";
      address = visit.propertyId?.address || "N/A";
      landlordName = isVisitor
        ? (visit.landlordId?.name || "N/A")
        : (visit.landlordId?.name || visit.name || "N/A");
      landlordMobile = isVisitor
        ? (visit.landlordId?.mobile || "N/A")
        : (visit.landlordId?.mobile || visit.mobile || "N/A");
      propertyImage = null;
    }

    const canCancel = visit.status === "Pending" || visit.status === "Scheduled";
    const canRate = visit.status === "Completed";

    return (
      <div
        key={visit._id}
        className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1"
      >
        <div className="h-2 bg-gradient-to-r from-[#003366] via-[#FF6600] to-[#003366]"></div>
        
        {/* Property Image */}
        {propertyImage && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={propertyImage}
              alt={propertyName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border backdrop-blur-sm bg-white/90 ${getStatusColor(visit.status)}`}>
                {getStatusIcon(visit.status)}
                {visit.status}
              </span>
            </div>
          </div>
        )}

        <div className="p-6">
          {!propertyImage && (
            <div className="flex justify-between items-start mb-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border ${getStatusColor(visit.status)}`}>
                {getStatusIcon(visit.status)}
                {visit.status}
              </span>
              <div className="bg-[#003366] p-2 rounded-lg">
                <FaHome className="text-white text-lg" />
              </div>
            </div>
          )}

          <h3 className="text-xl font-bold text-[#003366] mb-3 group-hover:text-[#FF6600] transition-colors">
            {propertyName}
          </h3>

          {isMyRequest && visit.visitNumber && (
            <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-blue-700">
                Visit Number: {visit.visitNumber}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-gray-600">
              <FaMapMarkerAlt className="text-[#FF6600] mt-1 flex-shrink-0" />
              <span className="text-sm">{address}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-600">
              <FaCalendarAlt className="text-[#FF6600]" />
              <span className="text-sm font-medium">
                {formatDate(visit.preferredDate || visit.visitDate || visit.scheduledDate)}
              </span>
            </div>

            {isMyRequest && visit.preferredTimeSlot && (
              <div className="flex items-center gap-3 text-gray-600">
                <FaClock className="text-[#FF6600]" />
                <span className="text-sm">{visit.preferredTimeSlot}</span>
              </div>
            )}

            {isMyRequest && visit.visitType && (
              <div className="flex items-center gap-3 text-gray-600">
                <FaHome className="text-[#003366]" />
                <span className="text-sm">{visit.visitType} Visit</span>
              </div>
            )}

            {isMyRequest && visit.numberOfVisitors && (
              <div className="flex items-center gap-3 text-gray-600">
                <FaUsers className="text-[#003366]" />
                <span className="text-sm">{visit.numberOfVisitors} Visitor(s)</span>
              </div>
            )}

            {visit.message && (
              <div className="flex items-start gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                <FaComment className="text-[#FF6600] mt-1 flex-shrink-0" />
                <span className="text-sm italic">{visit.message}</span>
              </div>
            )}

            <div className="pt-3 mt-3 border-t border-gray-100">
              <div className="flex items-center gap-3 text-gray-700 mb-2">
                <FaUser className="text-[#003366]" />
                <span className="text-sm font-semibold">{landlordName}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <FaPhone className="text-[#FF6600]" />
                <span className="text-sm">{landlordMobile}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {isMyRequest && (
              <div className="pt-4 mt-4 border-t border-gray-100 flex gap-3">
                {canCancel && (
                  <button
                    onClick={() => openCancelModal(visit)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-semibold transition-all border border-red-200"
                  >
                    <FaBan />
                    Cancel
                  </button>
                )}
                {canRate && (
                  <button
                    onClick={() => openRatingModal(visit)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-xl font-semibold transition-all border border-yellow-200"
                  >
                    <FaStar />
                    Rate
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHotelEnquiryCard = (enq) => {
    const budget = enq.budgetRange
      ? `₹${enq.budgetRange.min} - ₹${enq.budgetRange.max}`
      : "Not specified";

    return (
      <div
        key={enq._id}
        className="group bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-orange-100 overflow-hidden hover:-translate-y-1"
      >
        <div className="h-2 bg-gradient-to-r from-[#FF6600] to-[#003366]"></div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border ${getStatusColor(enq.status)}`}>
              {getStatusIcon(enq.status)}
              {enq.status}
            </span>
            <div className="bg-[#FF6600] p-2 rounded-lg">
              <FaHotel className="text-white text-xl" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-[#003366] mb-4">{enq.name}</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-[#003366] p-2 rounded-lg">
                <FaPhone className="text-white text-xs" />
              </div>
              <span className="text-sm font-medium">{enq.phone}</span>
            </div>

            {enq.email && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-[#FF6600] p-2 rounded-lg">
                  <FaEnvelope className="text-white text-xs" />
                </div>
                <span className="text-sm">{enq.email}</span>
              </div>
            )}

            <div className="bg-gradient-to-r from-[#003366] to-[#004080] text-white px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <FaRupeeSign className="text-[#FF6600]" />
                <span className="font-bold">{budget}</span>
              </div>
            </div>

            {enq.checkInDate && enq.checkOutDate && (
              <div className="flex items-center gap-3 text-gray-700 bg-blue-50 px-4 py-3 rounded-xl">
                <FaCalendarAlt className="text-[#FF6600]" />
                <span className="text-sm font-medium">
                  {new Date(enq.checkInDate).toLocaleDateString()} → {new Date(enq.checkOutDate).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="bg-white border-2 border-orange-100 px-4 py-3 rounded-xl mt-4">
              <p className="text-xs font-semibold text-[#003366] mb-2">MESSAGE</p>
              <p className="text-sm text-gray-700">{enq.message || "No message"}</p>
            </div>

            <p className="text-xs text-gray-500 text-right mt-3">
              Sent: {formatDate(enq.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const hasAnyData =
    (visitorVisits?.length || 0) > 0 ||
    (sellerRequests?.length || 0) > 0 ||
    (hotelEnquiries?.length || 0) > 0;

  const tabs = [
    { id: "all", label: "All", icon: FaHeart, count: (visitorVisits?.length || 0) + (sellerRequests?.length || 0) + (hotelEnquiries?.length || 0) },
    { id: "hotels", label: "Hotels", icon: FaHotel, count: hotelEnquiries?.length || 0 },
    { id: "visits", label: "Visits", icon: FaHome, count: visitorVisits?.length || 0 },
    { id: "sellers", label: "Sellers", icon: FaUsers, count: sellerRequests?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-blue-50">
      <ToastContainer />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#003366] to-[#004080] text-white py-12 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-3 tracking-tight">
              My Visits & <span className="text-[#FF6600]">Enquiries</span>
            </h1>
            <p className="text-blue-100 text-lg">Track all your property visits and hotel bookings seamlessly</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        {/* Filter Buttons */}
        {hasAnyData && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 mt-11">
            <p className="text-sm font-semibold text-[#003366] mb-4">FILTER BY STATUS</p>
            <div className="flex flex-wrap gap-3">
              {["all", "pending", "confirmed", "contacted", "completed", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    filterStatus === s
                      ? "bg-gradient-to-r from-[#FF6600] to-[#FF8800] text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-center shadow-lg">
            <FaExclamationTriangle className="inline text-2xl mr-3" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block bg-white p-8 rounded-3xl shadow-2xl">
              <FaClock className="text-7xl text-[#FF6600] mx-auto animate-spin" />
              <p className="text-2xl font-bold text-[#003366] mt-6">Loading your data...</p>
            </div>
          </div>
        ) : !hasAnyData ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
            <div className="inline-block bg-gradient-to-br from-orange-100 to-blue-100 p-12 rounded-full mb-6">
              <FaHeart className="text-8xl text-[#FF6600]" />
            </div>
            <h3 className="text-3xl font-bold text-[#003366] mb-3">Nothing here yet!</h3>
            <p className="text-gray-600 text-lg">Your visits and enquiries will appear here</p>
          </div>
        ) : (
          <div className="pb-12">
            {/* Hotel Enquiries */}
            {(activeTab === "all" || activeTab === "hotels") && filterItems(hotelEnquiries || []).length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-r from-[#FF6600] to-[#FF8800] p-3 rounded-xl">
                    <FaHotel className="text-white text-2xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-[#003366]">Hotel Enquiries</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterItems(hotelEnquiries || []).map(renderHotelEnquiryCard)}
                </div>
              </div>
            )}

            {/* Seller Requests */}
            {(activeTab === "all" || activeTab === "sellers") && filterItems(sellerRequests).length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-r from-[#003366] to-[#004080] p-3 rounded-xl">
                    <FaUsers className="text-white text-2xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-[#003366]">Seller Property Requests</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterItems(sellerRequests).map(renderVisitCard)}
                </div>
              </div>
            )}

            {/* My Visits */}
            {(activeTab === "all" || activeTab === "visits") && filterItems(visitorVisits).length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-r from-[#FF6600] to-[#003366] p-3 rounded-xl">
                    <FaHome className="text-white text-2xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-[#003366]">My Scheduled Property Visits</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterItems(visitorVisits).map(renderVisitCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Visit Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-[#003366]">Cancel Visit</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setSelectedVisit(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel your visit to <span className="font-semibold">{selectedVisit?.propertyId?.title || "this property"}</span>?
              </p>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cancellation Reason *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6600] focus:border-transparent resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setSelectedVisit(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelVisit}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? "Cancelling..." : "Cancel Visit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#003366]">Rate Your Visit</h3>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  resetRatingForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Overall Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-all"
                    >
                      <FaStar
                        size={40}
                        className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Review
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6600] focus:border-transparent resize-none"
                  rows="4"
                />
              </div>

              {/* Liked Aspects */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  What did you like?
                </label>
                <div className="flex flex-wrap gap-2">
                  {aspectOptions.map((aspect) => (
                    <button
                      key={aspect}
                      onClick={() => toggleLiked(aspect)}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        liked.includes(aspect)
                          ? "bg-green-100 text-green-700 border-2 border-green-400"
                          : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {liked.includes(aspect) && <FaThumbsUp className="inline mr-2" />}
                      {aspect}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disliked Aspects */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  What could be improved?
                </label>
                <div className="flex flex-wrap gap-2">
                  {aspectOptions.map((aspect) => (
                    <button
                      key={aspect}
                      onClick={() => toggleDisliked(aspect)}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        disliked.includes(aspect)
                          ? "bg-red-100 text-red-700 border-2 border-red-400"
                          : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {disliked.includes(aspect) && <FaThumbsDown className="inline mr-2" />}
                      {aspect}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interested in Buying */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <input
                  type="checkbox"
                  id="interestedInBuying"
                  checked={interestedInBuying}
                  onChange={(e) => setInterestedInBuying(e.target.checked)}
                  className="w-5 h-5 text-[#FF6600] rounded focus:ring-[#FF6600]"
                />
                <label htmlFor="interestedInBuying" className="text-sm font-medium text-gray-700">
                  I'm interested in buying/renting this property
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  resetRatingForm();
                }}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={submittingRating || rating === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6600] to-[#FF8800] hover:from-[#FF7700] hover:to-[#FF9900] text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVisitsAndEnquiries;