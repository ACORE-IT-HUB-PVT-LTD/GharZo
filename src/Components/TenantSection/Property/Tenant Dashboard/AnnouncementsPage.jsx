import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ArrowLeft, Calendar, AlertCircle, Clock, CheckCircle2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [markingRead, setMarkingRead] = useState(null);

  // Fetch announcements
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("usertoken"); // Adjust based on your auth setup
      
      const response = await axios.get(
        "https://api.gharzoreality.com/api/announcements/tenant/my-announcements",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAnnouncements(response.data.data);
        setUnreadCount(response.data.unreadCount);
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch announcements");
      setLoading(false);
    }
  };

  // Fetch single announcement details
  const fetchAnnouncementDetails = async (announcementId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `https://api.gharzoreality.com/api/announcements/${announcementId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSelectedAnnouncement(response.data.data);
        
        // Mark as read if not already read
        if (!response.data.data.isRead) {
          markAsRead(announcementId);
        }
      }
    } catch (err) {
      console.error("Failed to fetch announcement details:", err);
    }
  };

  // Mark announcement as read
  const markAsRead = async (announcementId) => {
    try {
      setMarkingRead(announcementId);
      const token = localStorage.getItem("token");
      
      await axios.post(
        `https://api.gharzoreality.com/api/announcements/${announcementId}/mark-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann._id === announcementId ? { ...ann, isRead: true } : ann
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setMarkingRead(null);
    } catch (err) {
      console.error("Failed to mark as read:", err);
      setMarkingRead(null);
    }
  };

  // Handle announcement click
  const handleAnnouncementClick = (announcement) => {
    fetchAnnouncementDetails(announcement._id);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-700 border-red-300";
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "Payment Reminder":
        return "💳";
      case "Maintenance":
        return "🔧";
      case "General":
        return "📢";
      case "Emergency":
        return "🚨";
      default:
        return "📋";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading announcements...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell size={32} className="text-red-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Announcements
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {announcements.length} total • {unreadCount} unread
                </p>
              </div>
            </div>
            
            <Link
              to="/tenant"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl shadow-sm transition-all duration-200 font-medium"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Announcements List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List Column */}
          <div className="space-y-4">
            {announcements.length > 0 ? (
              <AnimatePresence>
                {announcements.map((announcement, index) => (
                  <motion.div
                    key={announcement._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleAnnouncementClick(announcement)}
                    className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-l-4 ${
                      !announcement.isRead
                        ? "border-l-red-500"
                        : "border-l-gray-200"
                    } ${
                      selectedAnnouncement?._id === announcement._id
                        ? "ring-2 ring-red-400"
                        : ""
                    }`}
                  >
                    <div className="p-4 sm:p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">
                            {getTypeIcon(announcement.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-base sm:text-lg line-clamp-2">
                              {announcement.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              From: {announcement.createdBy.name}
                            </p>
                          </div>
                        </div>
                        {!announcement.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>

                      {/* Message Preview */}
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {announcement.message}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full border font-medium ${getPriorityColor(
                            announcement.priority
                          )}`}
                        >
                          {announcement.priority}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {announcement.type}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500 ml-auto">
                          <Clock size={12} />
                          {formatDate(announcement.createdAt)}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {announcement.stats.totalReads}/{announcement.stats.totalRecipients} read
                        </span>
                        {announcement.isRead && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 size={14} />
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center"
              >
                <Bell size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No Announcements
                </h3>
                <p className="text-gray-600">
                  You don't have any announcements at the moment.
                </p>
              </motion.div>
            )}
          </div>

          {/* Detail Column (Desktop) */}
          <div className="hidden lg:block sticky top-6 h-fit">
            {selectedAnnouncement ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl p-6 max-h-[calc(100vh-8rem)] overflow-y-auto"
              >
                {/* Detail Header */}
                <div className="flex items-start gap-3 mb-4 pb-4 border-b">
                  <span className="text-3xl">
                    {getTypeIcon(selectedAnnouncement.type)}
                  </span>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {selectedAnnouncement.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded-full border font-medium ${getPriorityColor(
                          selectedAnnouncement.priority
                        )}`}
                      >
                        {selectedAnnouncement.priority}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {selectedAnnouncement.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.message}
                  </p>
                </div>

                {/* Created By */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Posted By
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                      {selectedAnnouncement.createdBy.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {selectedAnnouncement.createdBy.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedAnnouncement.landlordId.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Properties */}
                {selectedAnnouncement.targetProperties?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Target Properties
                    </h4>
                    {selectedAnnouncement.targetProperties.map((property) => (
                      <div
                        key={property._id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        {property.images?.[0] && (
                          <img
                            src={property.images[0].url}
                            alt={property.title}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        <p className="font-medium text-gray-800">
                          {property.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {property.location.address}, {property.location.locality}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>
                      Posted: {formatDate(selectedAnnouncement.createdAt)}
                    </span>
                  </div>
                  {selectedAnnouncement.expiresAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <AlertCircle size={16} />
                      <span>
                        Expires: {formatDate(selectedAnnouncement.expiresAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedAnnouncement.stats.totalRecipients}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Recipients</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {selectedAnnouncement.stats.totalReads}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Total Reads</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Eye size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Select an Announcement
                </h3>
                <p className="text-gray-600 text-sm">
                  Click on an announcement to view details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Detail Modal */}
        <AnimatePresence>
          {selectedAnnouncement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
              onClick={() => setSelectedAnnouncement(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Announcement Details</h3>
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-6">
                  {/* Same content as desktop detail view */}
                  <div className="flex items-start gap-3 mb-4 pb-4 border-b">
                    <span className="text-3xl">
                      {getTypeIcon(selectedAnnouncement.type)}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {selectedAnnouncement.title}
                      </h2>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full border font-medium ${getPriorityColor(
                            selectedAnnouncement.priority
                          )}`}
                        >
                          {selectedAnnouncement.priority}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {selectedAnnouncement.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Message
                    </h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedAnnouncement.message}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Posted By
                    </h4>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                        {selectedAnnouncement.createdBy.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {selectedAnnouncement.createdBy.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedAnnouncement.landlordId.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedAnnouncement.targetProperties?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Target Properties
                      </h4>
                      {selectedAnnouncement.targetProperties.map((property) => (
                        <div
                          key={property._id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          {property.images?.[0] && (
                            <img
                              src={property.images[0].url}
                              alt={property.title}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          )}
                          <p className="font-medium text-gray-800">
                            {property.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {property.location.address}, {property.location.locality}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>
                        Posted: {formatDate(selectedAnnouncement.createdAt)}
                      </span>
                    </div>
                    {selectedAnnouncement.expiresAt && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <AlertCircle size={16} />
                        <span>
                          Expires: {formatDate(selectedAnnouncement.expiresAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedAnnouncement.stats.totalRecipients}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Recipients</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {selectedAnnouncement.stats.totalReads}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Total Reads</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}