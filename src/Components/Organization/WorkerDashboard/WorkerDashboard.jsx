import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Home,
  User,
  FileText,
  Clock,
  Shield,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  PhoneCall,
  Key,
} from "lucide-react";

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // OTP Verification Section States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!token) {
        toast.error("Please login to view complaints.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          "https://api.gharzoreality.com/api/workers/assigned-complaints",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setComplaints(res.data.complaints || []);
        } else {
          toast.error("No complaints found.");
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load complaints.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-orange-400" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "Resolved":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "High":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Low":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  // Open OTP Modal — Pass full complaint object
  const openOtpModal = (complaint) => {
    setSelectedComplaintId(complaint.complaintId);
    setOtp("");
    setShowOtpModal(true);
  };

  // Close OTP Modal
  const closeOtpModal = () => {
    setShowOtpModal(false);
    setSelectedComplaintId(null);
    setOtp("");
  };

  // Verify OTP — Send complaintId (custom ID)
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await axios.post(
        "https://api.gharzoreality.com/api/workers/verify-otp",
        {
          complaintId: selectedComplaintId,
          otp: otp,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Complaint resolved successfully!");
        setComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === selectedComplaintId
              ? { ...c, status: "Resolved", otp: { verified: true } }
              : c
          )
        );
        closeOtpModal();
      } else {
        toast.error(res.data.message || "Invalid OTP.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to verify OTP.";
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-orange-300">
            Loading Complaints...
          </p>
        </div>
      </div>
    );
  }

  if (error && complaints.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)' }}>
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-red-300">Error</p>
          <p className="text-orange-200 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} theme="dark" />

      {/* OTP Verification Modal - Glassmorphism */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-orange-200 flex items-center gap-2">
                <Key className="w-6 h-6 text-orange-400" />
                Verify OTP to Resolve
              </h3>
              <button
                onClick={closeOtpModal}
                className="text-gray-300 hover:text-white transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-orange-100">
                Enter the 6-digit OTP sent to the tenant to mark this complaint
                as <strong>Resolved</strong>.
              </p>

              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-white/10 border border-white/30 rounded-xl focus:border-orange-400 focus:outline-none text-white placeholder-gray-400 transition-all"
              />

              <div className="flex gap-3">
                <button
                  onClick={closeOtpModal}
                  className="flex-1 py-3 bg-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/20 transition-all border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyOtp}
                  disabled={verifyingOtp || otp.length !== 6}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Resolve"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen py-8" style={{ background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)' }}>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-300 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
              My Assigned Complaints
            </h1>
            <p className="mt-2 text-lg text-orange-200">
              Total:{" "}
              <span className="font-bold text-orange-300">
                {complaints.length}
              </span>
            </p>
          </div>

          {/* Complaints Grid - Fully Responsive */}
          {complaints.length === 0 ? (
            <div className="text-center py-16">
              <Shield className="w-20 h-20 text-orange-300 mx-auto mb-4 opacity-60" />
              <p className="text-xl font-medium text-orange-200">
                No complaints assigned yet.
              </p>
              <p className="text-orange-300 mt-2">Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:ml-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {complaints.map((complaint, index) => (
                <div
                  key={complaint._id || index}
                  className="backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-white/20"
                >
                  {/* Header: Status + Priority */}
                  <div className="bg-gradient-to-r from-orange-600/40 to-amber-600/40 backdrop-blur-sm p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(complaint.status)}
                        <span className="font-semibold text-orange-200">{complaint.status}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          complaint.priority
                        )}`}
                      >
                        {complaint.priority}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    {/* Tenant Info */}
                    <div className="flex items-center gap-3 text-orange-100">
                      <User className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="font-semibold">{complaint.tenantName}</p>
                        <p className="text-sm text-orange-300">Tenant</p>
                      </div>
                    </div>

                    {/* Call Button with Number */}
                    <div className="flex items-center justify-between text-orange-100 bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10 transition-all border border-white/10">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-400" />
                        <p className="text-sm font-medium">
                          {complaint.tenantMobile}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCall(complaint.tenantMobile)}
                        className="bg-green-500/70 hover:bg-green-500 p-2 rounded-full text-white transition-all backdrop-blur-sm"
                        title="Call Tenant"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 text-orange-100">
                      <Mail className="w-5 h-5 text-orange-400" />
                      <p className="text-sm truncate">{complaint.tenantEmail}</p>
                    </div>

                    <hr className="border-white/10" />

                    {/* Property Info */}
                    <div className="flex items-center gap-3 text-orange-100">
                      <Home className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-sm">
                          <strong>Room:</strong> {complaint.roomId || "N/A"}
                        </p>
                        {complaint.bedId && (
                          <p className="text-sm">
                            <strong>Bed:</strong> {complaint.bedId}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subject & Description */}
                    <div>
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-orange-300 mt-1" />
                        <div>
                          <p className="font-medium text-orange-200">
                            {complaint.subject}
                          </p>
                          <p className="text-sm text-orange-100 mt-1 line-clamp-2">
                            {complaint.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-col gap-1 text-xs text-orange-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {formatDate(complaint.createdAt)}</span>
                      </div>
                      {complaint.updatedAt !== complaint.createdAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Updated: {formatDate(complaint.updatedAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Resolve with OTP Button */}
                    {complaint.status === "Accepted" && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={() => openOtpModal(complaint)}
                          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm"
                        >
                          <Key className="w-5 h-5" />
                          Resolve with OTP
                        </button>
                      </div>
                    )}

                    {complaint.status === "Resolved" && (
                      <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-sm font-medium text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Resolved on {formatDate(complaint.resolvedAt || complaint.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AssignedComplaints;