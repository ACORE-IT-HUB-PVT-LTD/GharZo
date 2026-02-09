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
  MapPin,
  Briefcase,
} from "lucide-react";

const WorkerDashboardDr = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);

  // OTP Verification Section States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  // Accept / Complete Work Section States
  const [accepting, setAccepting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedCompleteId, setSelectedCompleteId] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    workNotes: "",
    materialsUsed: "", // JSON string or plain text
    actualTime: "",
    photos: null,
  });

  const token = localStorage.getItem("usertoken") || localStorage.getItem("token");

  // Fetch worker profile
  useEffect(() => {
    const fetchWorkerProfile = async () => {
      if (!token) return;
      
      try {
        const res = await axios.get(
          "https://api.gharzoreality.com/api/auth/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setWorkerProfile(res.data.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch worker profile:", err);
      }
    };

    fetchWorkerProfile();
  }, [token]);

  // Fetch worker complaints
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
          "https://api.gharzoreality.com/api/complaints/worker/my-complaints?status=Assigned&page=1",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setComplaints(res.data.data || []);
        } else {
          setComplaints([]);
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
      case "Assigned":
        return <Clock className="w-4 h-4 text-blue-400" />;
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
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCall = (number) => {
    if (number) {
      window.location.href = `tel:${number}`;
    }
  };

  // Open OTP Modal — Pass full complaint object
  const openOtpModal = (complaint) => {
    setSelectedComplaintId(complaint._id);
    setOtp("");
    setShowOtpModal(true);
  };

  // Close OTP Modal
  const closeOtpModal = () => {
    setShowOtpModal(false);
    setSelectedComplaintId(null);
    setOtp("");
  };

    // Verify OTP
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await axios.post(
        `https://api.gharzoreality.com/api/complaints/${selectedComplaintId}/verify-otp`,
        { otp: otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Complaint resolved successfully!");
        // update local state or refetch
        setComplaints((prev) =>
          prev.map((c) =>
            c._id === selectedComplaintId
              ? { ...c, status: res.data.data?.status || "Resolved", otp: { verified: true } }
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

  // Accept complaint (worker accepts assigned complaint)
  const acceptComplaint = async (complaintId) => {
    if (!complaintId) return;
    setAccepting(true);
    try {
      const res = await axios.patch(
        `https://api.gharzoreality.com/api/complaints/${complaintId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Complaint accepted.");
        setComplaints((prev) => prev.map((c) => (c._id === complaintId ? { ...c, status: res.data.data?.status || "Accepted" } : c)));
      } else {
        toast.error(res.data.message || "Failed to accept complaint.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to accept complaint.";
      toast.error(msg);
    } finally {
      setAccepting(false);
    }
  };

  // Complete work - open modal
  const openCompleteModal = (complaint) => {
    setSelectedCompleteId(complaint._id);
    setCompleteForm({ workNotes: "", materialsUsed: "", actualTime: "", photos: null });
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setSelectedCompleteId(null);
    setCompleteForm({ workNotes: "", materialsUsed: "", actualTime: "", photos: null });
  };

  const handleCompleteChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photos") {
      setCompleteForm((s) => ({ ...s, photos: files }));
    } else {
      setCompleteForm((s) => ({ ...s, [name]: value }));
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompleteId) {
      toast.error("No complaint selected");
      return;
    }

    setCompleting(true);
    try {
      const formData = new FormData();
      formData.append("workNotes", completeForm.workNotes || "");
      // ensure materialsUsed is stringified JSON if an object/array was provided
      let materials = completeForm.materialsUsed || "";
      try {
        // if user entered JSON-like text, keep it; else leave as string
        JSON.parse(materials);
      } catch (e) {
        // not valid JSON, keep as-is
      }
      formData.append("materialsUsed", materials);
      formData.append("actualTime", completeForm.actualTime || "");

      if (completeForm.photos && completeForm.photos.length) {
        Array.from(completeForm.photos).forEach((file) => {
          formData.append("completionPhotos", file);
        });
      }

      const res = await axios.patch(
        `https://api.gharzoreality.com/api/complaints/${selectedCompleteId}/complete`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Work completed successfully.");
        // update local complaint status
        setComplaints((prev) => prev.map((c) => (c._id === selectedCompleteId ? { ...c, status: res.data.data?.status || "Completed" } : c)));
        closeCompleteModal();
      } else {
        toast.error(res.data.message || "Failed to complete work.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to complete work.";
      toast.error(msg);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-orange-300">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && complaints.length === 0) {
    return (
      <div className="flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)' }}>
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

      {/* Complete Work Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border border-white/20 max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-orange-200">Complete Work</h3>
              <button onClick={closeCompleteModal} className="text-gray-300 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-orange-100 mb-1">Work Notes</label>
                <textarea name="workNotes" value={completeForm.workNotes} onChange={handleCompleteChange} rows="3" className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white" />
              </div>

              <div>
                <label className="block text-sm text-orange-100 mb-1">Materials Used (JSON)</label>
                <input name="materialsUsed" value={completeForm.materialsUsed} onChange={handleCompleteChange} placeholder='[{"item":"Washer","quantity":1,"cost":50}]' className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white" />
              </div>

              <div>
                <label className="block text-sm text-orange-100 mb-1">Actual Time (minutes)</label>
                <input name="actualTime" value={completeForm.actualTime} onChange={handleCompleteChange} type="number" min="0" className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white" />
              </div>

              <div>
                <label className="block text-sm text-orange-100 mb-1">Completion Photos</label>
                <input name="photos" onChange={handleCompleteChange} type="file" multiple className="w-full text-sm text-white" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button type="submit" disabled={completing} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-medium">
                  {completing ? "Submitting..." : "Submit Completion"}
                </button>
                <button type="button" onClick={closeCompleteModal} className="flex-1 py-3 bg-white/10 text-gray-300 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="py-8" style={{ background: 'radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Worker Profile Card */}
          {workerProfile && (
            <div className="mb-10 backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  {workerProfile.profileImage ? (
                    <img 
                      src={workerProfile.profileImage} 
                      alt={workerProfile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{workerProfile.name}</h2>
                  <p className="text-orange-200 capitalize">{workerProfile.role}</p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-2 text-orange-100">
                      <Phone className="w-4 h-4 text-orange-400" />
                      <span>{workerProfile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-100">
                      <Mail className="w-4 h-4 text-orange-400" />
                      <span>{workerProfile.email}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  {workerProfile.isVerified ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-medium">Verified</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">Pending Verification</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-300 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
              My Assigned Complaints
            </h1>
            <p className="mt-2 text-lg text-orange-200">
              Total Assigned:{" "}
              <span className="font-bold text-orange-300">
                {complaints.length}
              </span>
            </p>
          </div>

          {/* Complaints Grid - Fully Responsive */}
          {complaints.length === 0 ? (
            <div className="text-center py-16 backdrop-blur-md bg-white/10 rounded-2xl border border-white/20">
              <Shield className="w-20 h-20 text-orange-300 mx-auto mb-4 opacity-60" />
              <p className="text-xl font-medium text-orange-200">
                No complaints assigned yet.
              </p>
              <p className="text-orange-300 mt-2">Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    {/* Complaint Info */}
                    <div>
                      <p className="font-medium text-orange-200 text-lg">
                        {complaint.title}
                      </p>
                      <p className="text-sm text-orange-100 mt-1">
                        <span className="font-medium">Category:</span> {complaint.category}
                      </p>
                      <p className="text-sm text-orange-100 mt-1 line-clamp-2">
                        {complaint.description}
                      </p>
                    </div>

                    <hr className="border-white/10" />

                    {/* Tenant Info */}
                    <div className="flex items-center gap-3 text-orange-100">
                      <User className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="font-semibold">{complaint.tenantId?.name || "N/A"}</p>
                        <p className="text-sm text-orange-300">Tenant</p>
                      </div>
                    </div>

                    {/* Call Button with Number */}
                    {complaint.tenantId?.phone && (
                      <div className="flex items-center justify-between text-orange-100 bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10 transition-all border border-white/10">
                        <div className="flex items-center gap-2">
                          <Phone className="w-5 h-5 text-green-400" />
                          <p className="text-sm font-medium">
                            {complaint.tenantId.phone}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCall(complaint.tenantId.phone)}
                          className="bg-green-500/70 hover:bg-green-500 p-2 rounded-full text-white transition-all backdrop-blur-sm"
                          title="Call Tenant"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Property Info */}
                    {complaint.propertyId && (
                      <div className="flex items-start gap-3 text-orange-100">
                        <MapPin className="w-5 h-5 text-orange-400 mt-1" />
                        <div>
                          <p className="font-medium">{complaint.propertyId.title || "Property"}</p>
                          <p className="text-sm text-orange-300">
                            {complaint.propertyId.location?.address}, {complaint.propertyId.location?.city}
                          </p>
                          {complaint.roomId && (
                            <p className="text-sm">
                              <strong>Room:</strong> {complaint.roomId.roomNumber || complaint.roomId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <hr className="border-white/10" />

                    {/* Complaint Number & Dates */}
                    <div className="space-y-2">
                      <p className="text-sm text-orange-300">
                        <strong>Complaint #:</strong> {complaint.complaintNumber}
                      </p>
                      <div className="flex flex-col gap-1 text-xs text-orange-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {formatDate(complaint.dates?.reportedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Assigned: {formatDate(complaint.dates?.assignedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    {complaint.timeline && complaint.timeline.length > 0 && (
                      <div className="text-xs text-orange-200">
                        <p className="font-medium mb-1">Latest Update:</p>
                        <p>{complaint.timeline[complaint.timeline.length - 1]?.notes || "No notes"}</p>
                      </div>
                    )}

                    {/* Action Buttons: Accept / Complete / OTP Resolve */}
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      {complaint.status === "Assigned" && (
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => acceptComplaint(complaint._id)}
                            disabled={accepting}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                          >
                            {accepting ? "Accepting..." : "Accept Complaint"}
                          </button>

                          <button
                            onClick={() => openCompleteModal(complaint)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                          >
                            Complete Work
                          </button>

                          <button
                            onClick={() => openOtpModal(complaint)}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm"
                          >
                            <Key className="w-5 h-5" />
                            Resolve with OTP
                          </button>
                        </div>
                      )}

                      {complaint.status === "Accepted" && (
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => openCompleteModal(complaint)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                          >
                            Complete Work
                          </button>

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
                        <div className="mt-2 text-center">
                          <p className="text-sm font-medium text-emerald-400 flex items-center justify-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Resolved
                          </p>
                        </div>
                      )}
                    </div>
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

export default WorkerDashboardDr;
