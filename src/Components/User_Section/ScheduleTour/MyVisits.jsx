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
      const [visits, sellerReqs, hotelEnqs] = await Promise.all([
        fetchUserVisits(),
        fetchSellerRequests(),
      ]);

      setVisitorVisits(visits);
      setSellerRequests(sellerReqs);
      setHotelEnquiries(hotelEnqs);
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

  const renderVisitCard = (visit) => {
    const isVisitor = visit.type === "visitor";
    const propertyName = visit.propertyId?.name || "Unknown Property";
    const address = visit.propertyId?.address || "N/A";
    const landlordName = isVisitor
      ? (visit.landlordId?.name || "N/A")
      : (visit.landlordId?.name || visit.name || "N/A");
    const landlordMobile = isVisitor
      ? (visit.landlordId?.mobile || "N/A")
      : (visit.landlordId?.mobile || visit.mobile || "N/A");

    return (
      <div 
        key={visit._id} 
        className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1"
      >
        <div className="h-2 bg-gradient-to-r from-[#003366] via-[#FF6600] to-[#003366]"></div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border ${getStatusColor(visit.statusText || visit.status)}`}>
              {getStatusIcon(visit.statusText || visit.status)}
              {visit.statusText || visit.status}
            </span>
            <div className="bg-[#003366] p-2 rounded-lg">
              <FaHome className="text-white text-lg" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-[#003366] mb-3 group-hover:text-[#FF6600] transition-colors">
            {propertyName}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-gray-600">
              <FaMapMarkerAlt className="text-[#FF6600] mt-1 flex-shrink-0" />
              <span className="text-sm">{address}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <FaCalendarAlt className="text-[#FF6600]" />
              <span className="text-sm font-medium">{formatDate(visit.visitDate || visit.scheduledDate)}</span>
            </div>
            
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
        {/* Tabs */}
        {/* {hasAnyData && (
          <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 border border-gray-100">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-lg scale-105"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className={activeTab === tab.id ? "text-[#FF6600]" : ""} />
                  {tab.label}
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? "bg-[#FF6600] text-white" : "bg-gray-200 text-gray-700"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )} */}

        {/* Filter Buttons */}
        {hasAnyData && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 mt-11">
            <p className="text-sm font-semibold text-[#003366] mb-4 ">FILTER BY STATUS</p>
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
                  <h2 className="text-3xl font-bold text-[#003366]">
                    Hotel  Enquiries
                  </h2>
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
                  <h2 className="text-3xl font-bold text-[#003366]">
                    Seller Property Requests
                  </h2>
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
                  <h2 className="text-3xl font-bold text-[#003366] ">
                    My Scheduled Property Visits
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterItems(visitorVisits).map(renderVisitCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVisitsAndEnquiries;