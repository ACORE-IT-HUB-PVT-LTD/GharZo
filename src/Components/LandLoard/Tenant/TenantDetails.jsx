import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  Home,
  Briefcase,
  Shield,
  ChevronLeft,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ThumbsUp,
  Send,
  Star,
  Ban,
  UserX,
  Bell,
  Edit,
  Trash2,
  File,
  Upload,
  Filter,
  Check,
  X,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Constants ────────────────────────────────────────────────────────────────
const DOC_TYPES = [
  "ID Proof", "Rental Agreement", "Police Verification", "Income Proof",
  "Employment Letter", "Bank Statement", "Previous Rental History",
  "Character Reference", "Passport", "Driving License", "Voter ID",
  "PAN Card", "Aadhaar Card", "Other",
];
const DOC_SUB_TYPES = {
  "ID Proof": ["Aadhaar Card", "Passport", "Driving License", "Voter ID", "PAN Card"],
  "Income Proof": ["Salary Slip", "Bank Statement", "ITR", "Form 16"],
};
const VISIBILITY_OPTIONS = ["Private", "Landlord Only", "Public"];

const TenancyDetails = () => {
  const { tenancyId } = useParams();
  const navigate = useNavigate();
  const [tenancy, setTenancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [imageGalleryIndex, setImageGalleryIndex] = useState({ property: 0, room: 0 });

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Form states
  const [rejectReason, setRejectReason] = useState("");
  const [noticeReason, setNoticeReason] = useState("");
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Document states
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentFilter, setDocumentFilter] = useState("all");

  // Verify modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDocForVerify, setSelectedDocForVerify] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadForm, setUploadForm] = useState({
    documentType: "",
    documentSubType: "",
    title: "",
    description: "",
    documentDate: "",
    expiryDate: "",
    visibility: "Landlord Only",
    tags: "",
  });

  // ─── Fetch Tenancy Details ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchTenancyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("usertoken");
        if (!token) throw new Error("No authentication token found. Please login again.");
        const response = await fetch(
          `https://api.gharzoreality.com/api/tenancies/${tenancyId}/details`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status} - Failed to fetch tenancy details`);
        const data = await response.json();
        if (data.success && data.data) setTenancy(data.data);
        else if (data.data) setTenancy(data.data);
        else throw new Error("Invalid response format from server");
      } catch (err) {
        console.error("Error fetching tenancy details:", err);
        setError(err.message);
        toast.error(err.message || "Failed to load tenancy details");
      } finally {
        setLoading(false);
      }
    };
    if (tenancyId) fetchTenancyDetails();
    else { setError("Invalid tenancy ID"); setLoading(false); }
  }, [tenancyId]);

  useEffect(() => {
    if (activeTab === "notice" && tenancyId) fetchNoticeDetails();
    if (activeTab === "documents" && tenancyId && tenancy) fetchTenantDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tenancyId]);

  // ─── Fetch Tenant Documents ─────────────────────────────────────────────────
  const fetchTenantDocuments = async () => {
    if (!tenancy?.tenantId?._id) return;
    setDocumentsLoading(true);
    try {
      const token = localStorage.getItem("usertoken");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(
        `https://api.gharzoreality.com/api/tenant-documents/tenant/${tenancy.tenantId._id}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (data.success) setDocuments(data.data || []);
      else toast.error(data.message || "Failed to fetch documents");
    } catch (err) {
      console.error("Error fetching documents:", err);
      toast.error(err.message || "Failed to load documents");
    } finally {
      setDocumentsLoading(false);
    }
  };

  // ─── Upload Document (Landlord) ─────────────────────────────────────────────
  const handleUploadDocument = async () => {
    if (!uploadForm.documentType) return toast.error("Please select Document Type");
    if (!uploadForm.title.trim()) return toast.error("Please enter Document Title");
    if (!selectedFile) return toast.error("Please select a file");
    if (!tenancy) return toast.error("Tenancy details not loaded");

    const allowed = [
      "image/jpeg", "image/jpg", "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(selectedFile.type)) {
      return toast.error("Only JPG, PNG, PDF, DOC, DOCX files are allowed");
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      return toast.error("File size must be under 10MB");
    }

    setUploadLoading(true);
    try {
      const token = localStorage.getItem("usertoken");
      if (!token) throw new Error("No authentication token found");

      const formData = new FormData();

      // ── Form fields exactly as per API screenshot ──
      formData.append("tenantId", tenancy.tenantId?._id || "");
      formData.append("tenancyId", tenancy._id || tenancyId);
      formData.append("landlordId", tenancy.landlordId?._id || "");
      formData.append("propertyId", tenancy.propertyId?._id || "");
      formData.append("documentType", uploadForm.documentType);
      if (uploadForm.documentSubType) formData.append("documentSubType", uploadForm.documentSubType);
      if (uploadForm.documentDate) formData.append("documentDate", uploadForm.documentDate);
      formData.append("title", uploadForm.title.trim());
      if (uploadForm.description) formData.append("description", uploadForm.description.trim());
      if (uploadForm.expiryDate) formData.append("expiryDate", uploadForm.expiryDate);
      formData.append("visibility", uploadForm.visibility);
      // tags as JSON string array
      if (uploadForm.tags.trim()) {
        const tagsArray = uploadForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
        formData.append("tags", JSON.stringify(tagsArray));
      }
      // file field name = "document"
      formData.append("document", selectedFile);

      const response = await fetch(
        "https://api.gharzoreality.com/api/tenant-documents/upload",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Upload failed");

      toast.success("Document uploaded successfully!");
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({
        documentType: "", documentSubType: "", title: "", description: "",
        documentDate: "", expiryDate: "", visibility: "Landlord Only", tags: "",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchTenantDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  // ─── Verify Document ────────────────────────────────────────────────────────
  const handleVerifyDocument = async () => {
    if (!selectedDocForVerify) return;
    setVerifyLoading(true);
    try {
      const token = localStorage.getItem("usertoken");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(
        `https://api.gharzoreality.com/api/tenant-documents/${selectedDocForVerify}/verify`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ verificationNotes }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Document verified successfully");
        setShowVerifyModal(false);
        setVerificationNotes("");
        setSelectedDocForVerify(null);
        fetchTenantDocuments();
      } else {
        toast.error(data.message || "Failed to verify document");
      }
    } catch (err) {
      console.error("Error verifying document:", err);
      toast.error(err.message || "Failed to verify document");
    } finally {
      setVerifyLoading(false);
    }
  };

  // ─── Other API Actions ──────────────────────────────────────────────────────
  const fetchNoticeDetails = async () => {
    try {
      const token = localStorage.getItem("usertoken");
      if (!token) return;
      const res = await fetch(`https://api.gharzoreality.com/api/tenancies/${tenancyId}/notice`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.notice || json.data._id) setTenancy((prev) => ({ ...(prev || {}), ...json.data }));
        else if (json.data.notice) setTenancy((prev) => ({ ...(prev || {}), notice: json.data.notice }));
      }
    } catch (err) { console.error("Failed to fetch notice details", err); }
  };

  const handleApproveTenancy = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("usertoken");
      const response = await fetch(`https://api.gharzoreality.com/api/tenancies/${tenancyId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Tenancy approved successfully!");
        setTenancy(data.data);
        setShowApproveModal(false);
      } else throw new Error(data.message || "Failed to approve tenancy");
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleRejectTenancy = async () => {
    if (!rejectReason.trim()) { toast.error("Please provide a reason for rejection"); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("usertoken");
      const response = await fetch(`https://api.gharzoreality.com/api/tenancies/${tenancyId}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Tenancy rejected successfully");
        setTenancy(data.data);
        setShowRejectModal(false);
        setRejectReason("");
      } else throw new Error(data.message || "Failed to reject tenancy");
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleGiveNotice = async () => {
    if (!noticeReason.trim()) { toast.error("Please provide a reason for notice"); return; }
    if (!noticePeriodDays || noticePeriodDays < 1) { toast.error("Notice period must be at least 1 day"); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("usertoken");
      const response = await fetch(`https://api.gharzoreality.com/api/tenancies/${tenancyId}/notice`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ noticePeriodDays: parseInt(noticePeriodDays), noticeGivenBy: "Landlord", reason: noticeReason }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Notice period initiated successfully");
        if (data.data) setTenancy(data.data);
        else await fetchNoticeDetails();
        setShowNoticeModal(false);
        setNoticeReason("");
        setNoticePeriodDays(30);
      } else throw new Error(data.message || "Failed to initiate notice");
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleRateTenant = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("usertoken");
      const response = await fetch(`https://api.gharzoreality.com/api/tenancies/${tenancyId}/rate-tenant`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Rating submitted successfully");
        setTenancy(data.data);
        setShowRatingModal(false);
        setRating(0);
        setReview("");
      } else throw new Error(data.message || "Failed to submit rating");
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };
  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const diffTime = new Date(endDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 border-green-300";
      case "Terminated": return "bg-red-100 text-red-800 border-red-300";
      case "Pending-Approval": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Notice-Period": return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // ─── Loading / Error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-orange-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-xl text-gray-700 font-medium mt-6">Loading tenancy details...</p>
        </div>
      </div>
    );
  }
  if (error || !tenancy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-red-300 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-900 font-semibold mb-2">Failed to Load</p>
          <p className="text-gray-600 mb-6">{error || "No tenancy details found"}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition shadow-md">
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(tenancy.agreement?.endDate);
  const propertyImages = tenancy.propertyId?.images || [];
  const roomImages = tenancy.roomId?.media?.images || [];
  const moveInChecklist = tenancy.occupancy?.moveInChecklist || [];
  const moveOutChecklist = tenancy.occupancy?.moveOutChecklist || [];

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <motion.button onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          whileHover={{ x: -5 }}>
          <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Back to Tenancies</span>
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{tenancy.tenantId?.name || "Tenant"}</h1>
              <p className="text-gray-600 text-lg">{tenancy.propertyId?.title || "Property"}</p>
            </div>
            <motion.div className={`px-6 py-3 rounded-xl font-semibold border-2 text-lg ${getStatusColor(tenancy.status)}`} whileHover={{ scale: 1.05 }}>
              {tenancy.status || "N/A"}
            </motion.div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<DollarSign className="w-5 h-5" />} label="Monthly Rent" value={formatCurrency(tenancy.financials?.monthlyRent)} color="from-green-500 to-emerald-600" />
            <StatCard icon={<Calendar className="w-5 h-5" />} label="Days Remaining" value={daysRemaining > 0 ? `${daysRemaining}d` : "Ended"} color={daysRemaining > 30 ? "from-blue-500 to-cyan-600" : "from-orange-500 to-red-600"} />
            <StatCard icon={<Home className="w-5 h-5" />} label="Duration" value={`${tenancy.agreement?.durationMonths || 0}m`} color="from-purple-500 to-pink-600" />
            <StatCard icon={<Shield className="w-5 h-5" />} label="Security Deposit" value={formatCurrency(tenancy.financials?.securityDeposit)} color="from-indigo-500 to-blue-600" />
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              {tenancy.status === "Pending-Approval" && (
                <>
                  <ActionButton icon={<CheckCircle className="w-5 h-5" />} label="Approve" onClick={() => setShowApproveModal(true)} variant="success" />
                  <ActionButton icon={<XCircle className="w-5 h-5" />} label="Reject" onClick={() => setShowRejectModal(true)} variant="danger" />
                </>
              )}
              {tenancy.status === "Active" && (
                <>
                  <ActionButton icon={<Bell className="w-5 h-5" />} label="Give Notice" onClick={() => setShowNoticeModal(true)} variant="warning" />
                  <ActionButton icon={<Star className="w-5 h-5" />} label="Rate Tenant" onClick={() => setShowRatingModal(true)} variant="primary" />
                </>
              )}
              <ActionButton icon={<Edit className="w-5 h-5" />} label="Edit" onClick={() => navigate(`/landlord/tenant-form`, { state: tenancy })} variant="secondary" />
            </div>
          </div>
        </motion.div>

        {/* Notice Alert */}
        {tenancy.notice?.isUnderNotice && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6 mb-8 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Under Notice Period</h3>
              <p className="text-gray-700 mb-1">Notice given by: <span className="font-semibold">{tenancy.notice?.noticeGivenBy}</span></p>
              <p className="text-gray-700 mb-1">Reason: <span className="font-semibold">{tenancy.notice?.reason}</span></p>
              <p className="text-gray-700 mt-2">Vacate by: <span className="font-semibold text-orange-700">{formatDate(tenancy.notice?.vacateByDate)}</span></p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["overview", "property", "financials", "occupancy", "tenant", "documents", "notice"].map((tab) => (
            <motion.button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${activeTab === tab ? "bg-orange-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"}`}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-orange-500" /> Agreement Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="Start Date" value={formatDate(tenancy.agreement?.startDate)} />
                  <InfoItem label="End Date" value={formatDate(tenancy.agreement?.endDate)} />
                  <InfoItem label="Duration" value={`${tenancy.agreement?.durationMonths} months`} />
                  <InfoItem label="Renewal Option" value={tenancy.agreement?.renewalOption ? "Yes" : "No"} />
                  <InfoItem label="Auto Renew" value={tenancy.agreement?.autoRenew ? "Yes" : "No"} />
                  <InfoItem label="Landlord Signed" value={<span className={tenancy.agreement?.signedByLandlord ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{tenancy.agreement?.signedByLandlord ? "✓ Signed" : "✗ Not Signed"}</span>} />
                  <InfoItem label="Tenant Signed" value={<span className={tenancy.agreement?.signedByTenant ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{tenancy.agreement?.signedByTenant ? "✓ Signed" : "✗ Not Signed"}</span>} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ContactCard title="Tenant Contact" name={tenancy.tenantId?.name} phone={tenancy.tenantId?.phone} email={tenancy.tenantId?.email} />
                <ContactCard title="Landlord Contact" name={tenancy.landlordId?.name} phone={tenancy.landlordId?.phone} />
              </div>
            </div>
          )}

          {/* ── Tenant Tab ── */}
          {activeTab === "tenant" && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <User className="w-6 h-6 text-orange-500" /> Tenant Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h3>
                  <div className="space-y-3">
                    <InfoItem label="Name" value={tenancy.tenantId?.name} />
                    <InfoItem label="Phone" value={tenancy.tenantId?.phone} />
                    <InfoItem label="Email" value={tenancy.tenantId?.email} />
                  </div>
                </div>
                {tenancy.tenantInfo?.employmentDetails && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-orange-500" /> Employment</h3>
                    <div className="space-y-3">
                      <InfoItem label="Type" value={tenancy.tenantInfo.employmentDetails.type} />
                      <InfoItem label="Company" value={tenancy.tenantInfo.employmentDetails.companyName} />
                      <InfoItem label="Designation" value={tenancy.tenantInfo.employmentDetails.designation} />
                    </div>
                  </div>
                )}
                {tenancy.tenantInfo?.emergencyContact && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                    <div className="space-y-3">
                      <InfoItem label="Name" value={tenancy.tenantInfo.emergencyContact.name} />
                      <InfoItem label="Phone" value={tenancy.tenantInfo.emergencyContact.phone} />
                      <InfoItem label="Relation" value={tenancy.tenantInfo.emergencyContact.relation} />
                    </div>
                  </div>
                )}
                {tenancy.tenantInfo?.idProof && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-orange-500" /> ID Proof</h3>
                    <div className="space-y-3">
                      <InfoItem label="Type" value={tenancy.tenantInfo.idProof.type} />
                      <InfoItem label="Number" value={tenancy.tenantInfo.idProof.number} />
                    </div>
                  </div>
                )}
                {tenancy.tenantInfo?.policeVerification && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Police Verification</h3>
                    <div className="space-y-3">
                      <InfoItem label="Status" value={<span className={tenancy.tenantInfo.policeVerification.done ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{tenancy.tenantInfo.policeVerification.done ? "✓ Done" : "✗ Pending"}</span>} />
                      {tenancy.tenantInfo.policeVerification.done && <InfoItem label="Verified On" value={formatDate(tenancy.tenantInfo.policeVerification.verifiedOn)} />}
                    </div>
                  </div>
                )}
              </div>
              {tenancy.ratings && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings & Reviews</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tenancy.ratings.byTenant && <RatingCard title="Tenant's Review" rating={tenancy.ratings.byTenant.rating} review={tenancy.ratings.byTenant.review} date={tenancy.ratings.byTenant.givenAt} />}
                    {tenancy.ratings.byLandlord && <RatingCard title="Landlord's Review" rating={tenancy.ratings.byLandlord.rating} review={tenancy.ratings.byLandlord.review} date={tenancy.ratings.byLandlord.givenAt} />}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Property Tab ── */}
          {activeTab === "property" && (
            <div className="space-y-6">
              {propertyImages.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Property Images</h3>
                  <div className="space-y-4">
                    <motion.div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200" whileHover={{ scale: 1.02 }}>
                      <img src={propertyImages[imageGalleryIndex.property]?.url} alt={`Property ${imageGalleryIndex.property + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium">{imageGalleryIndex.property + 1} / {propertyImages.length}</div>
                    </motion.div>
                    {propertyImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {propertyImages.map((img, idx) => (
                          <motion.button key={idx} onClick={() => setImageGalleryIndex((prev) => ({ ...prev, property: idx }))}
                            className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${imageGalleryIndex.property === idx ? "border-orange-500 ring-2 ring-orange-300" : "border-gray-300"}`} whileHover={{ scale: 1.05 }}>
                            <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"><Building2 className="w-6 h-6 text-orange-500" /> Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="Title" value={tenancy.propertyId?.title} />
                  <InfoItem label="Property Type" value={tenancy.propertyId?.propertyType} />
                  <InfoItem label="Category" value={tenancy.propertyId?.category} />
                  <InfoItem label="Listing Type" value={tenancy.propertyId?.listingType} />
                  <InfoItem label="Status" value={<span className={`px-3 py-1 rounded-full text-sm font-semibold ${tenancy.propertyId?.status === "Approved" ? "bg-green-100 text-green-700" : tenancy.propertyId?.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{tenancy.propertyId?.status}</span>} />
                  <InfoItem label="Verification" value={<span className={`px-3 py-1 rounded-full text-sm font-semibold ${tenancy.propertyId?.verificationStatus === "Verified" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{tenancy.propertyId?.verificationStatus}</span>} />
                  <InfoItem label="Bathrooms" value={tenancy.propertyId?.bathrooms} />
                  <InfoItem label="Balconies" value={tenancy.propertyId?.balconies} />
                  <InfoItem label="City" value={tenancy.propertyId?.location?.city} />
                  <InfoItem label="Locality" value={tenancy.propertyId?.location?.locality} />
                  <InfoItem label="Sub-Locality" value={tenancy.propertyId?.location?.subLocality} />
                  <InfoItem label="Pin Code" value={tenancy.propertyId?.location?.pincode} />
                  <InfoItem label="State" value={tenancy.propertyId?.location?.state} />
                  <InfoItem label="Full Address" value={tenancy.propertyId?.location?.address} fullWidth />
                  <InfoItem label="Landmark" value={tenancy.propertyId?.location?.landmark} />
                </div>
                <div className="mt-8 pt-8 border-t-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Room & Bed Assignment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="Room Number" value={tenancy.roomId?.roomNumber} />
                    <InfoItem label="Room Type" value={tenancy.roomId?.roomType} />
                    <InfoItem label="Bed Number" value={tenancy.bedNumber} />
                    <InfoItem label="Floor" value={tenancy.roomId?.floor} />
                    <InfoItem label="Furnishing" value={tenancy.roomId?.features?.furnishing} />
                    <InfoItem label="Attached Bathroom" value={tenancy.roomId?.features?.hasAttachedBathroom ? "Yes" : "No"} />
                    <InfoItem label="Total Beds in Room" value={tenancy.roomId?.capacity?.totalBeds} />
                    <InfoItem label="Occupied Beds" value={tenancy.roomId?.capacity?.occupiedBeds} />
                  </div>
                </div>
                {tenancy.roomId?.features?.amenities?.length > 0 && (
                  <div className="mt-8 pt-8 border-t-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Room Amenities</h3>
                    <div className="flex flex-wrap gap-3">
                      {tenancy.roomId.features.amenities.map((amenity, idx) => (
                        <span key={idx} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">✓ {amenity}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {roomImages.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Room Images</h3>
                  <div className="space-y-4">
                    <motion.div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200" whileHover={{ scale: 1.02 }}>
                      <img src={roomImages[imageGalleryIndex.room]?.url} alt={`Room ${imageGalleryIndex.room + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium">{imageGalleryIndex.room + 1} / {roomImages.length}</div>
                    </motion.div>
                    {roomImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {roomImages.map((img, idx) => (
                          <motion.button key={idx} onClick={() => setImageGalleryIndex((prev) => ({ ...prev, room: idx }))}
                            className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${imageGalleryIndex.room === idx ? "border-orange-500 ring-2 ring-orange-300" : "border-gray-300"}`} whileHover={{ scale: 1.05 }}>
                            <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Financials Tab ── */}
          {activeTab === "financials" && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"><DollarSign className="w-6 h-6 text-orange-500" /> Financial Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Rent Details</h3>
                  <InfoItem label="Monthly Rent" value={formatCurrency(tenancy.financials?.monthlyRent)} />
                  <InfoItem label="Maintenance Charges" value={formatCurrency(tenancy.financials?.maintenanceCharges)} />
                  <InfoItem label="Rent Due Day" value={`${tenancy.financials?.rentDueDay}th of month`} />
                  <InfoItem label="Late Fee per Day" value={formatCurrency(tenancy.financials?.lateFeePerDay)} />
                  <InfoItem label="Grace Period" value={`${tenancy.financials?.gracePeriodDays} days`} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Security Deposit</h3>
                  <InfoItem label="Amount" value={formatCurrency(tenancy.financials?.securityDeposit)} />
                  <InfoItem label="Status" value={<span className={tenancy.financials?.securityDepositPaid ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{tenancy.financials?.securityDepositPaid ? "✓ Paid" : "✗ Not Paid"}</span>} />
                  {tenancy.financials?.securityDepositPaid && <InfoItem label="Paid On" value={formatDate(tenancy.financials?.securityDepositPaidDate)} />}
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <SummaryItem label="Rent" value={formatCurrency(tenancy.financials?.monthlyRent)} />
                  <SummaryItem label="Maintenance" value={formatCurrency(tenancy.financials?.maintenanceCharges)} />
                  <SummaryItem label="Total" value={formatCurrency((tenancy.financials?.monthlyRent || 0) + (tenancy.financials?.maintenanceCharges || 0))} />
                </div>
              </div>
            </div>
          )}

          {/* ── Occupancy Tab ── */}
          {activeTab === "occupancy" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"><Clock className="w-6 h-6 text-orange-500" /> Occupancy Timeline</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Move In</h3>
                    <div className="space-y-3">
                      <InfoItem label="Scheduled" value={formatDate(tenancy.occupancy?.moveInDate)} />
                      <InfoItem label="Actual" value={formatDate(tenancy.occupancy?.actualMoveInDate)} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Move Out</h3>
                    <div className="space-y-3">
                      <InfoItem label="Scheduled" value={formatDate(tenancy.occupancy?.moveOutDate)} />
                      <InfoItem label="Actual" value={formatDate(tenancy.occupancy?.actualMoveOutDate)} />
                    </div>
                  </div>
                </div>
              </div>
              {moveInChecklist.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3"><CheckCircle className="w-6 h-6 text-green-500" /> Move In Checklist</h3>
                  <div className="space-y-4">{moveInChecklist.map((item, idx) => <ChecklistItem key={idx} item={item} />)}</div>
                </div>
              )}
              {moveOutChecklist.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3"><CheckCircle className="w-6 h-6 text-blue-500" /> Move Out Checklist</h3>
                  <div className="space-y-4">{moveOutChecklist.map((item, idx) => <ChecklistItem key={idx} item={item} />)}</div>
                </div>
              )}
            </div>
          )}

          {/* ── Notice Tab ── */}
          {activeTab === "notice" && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"><Bell className="w-6 h-6 text-orange-500" /> Notice Details</h2>
              {tenancy.notice?.isUnderNotice ? (
                <div className="space-y-6">
                  <InfoItem label="Under Notice" value={<span className="text-orange-600 font-semibold">Yes</span>} />
                  <InfoItem label="Notice Period Days" value={tenancy.notice.noticePeriodDays} />
                  <InfoItem label="Notice Given By" value={tenancy.notice.noticeGivenBy} />
                  <InfoItem label="Notice Date" value={formatDate(tenancy.notice.noticeDate)} />
                  <InfoItem label="Vacate By Date" value={formatDate(tenancy.notice.vacateByDate)} />
                  <InfoItem label="Reason" value={tenancy.notice.reason} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-lg">No active notice period.</p>
                  {tenancy.status === "Active" && (
                    <div className="mt-4">
                      <ActionButton icon={<Bell className="w-5 h-5" />} label="Give Notice" onClick={() => setShowNoticeModal(true)} variant="warning" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              DOCUMENTS TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">

                {/* Header Row */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <File className="w-6 h-6 text-orange-500" /> Tenant Documents
                    <span className="text-sm font-normal text-gray-500">({documents.length} total)</span>
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-md transition"
                  >
                    <Upload className="w-4 h-4" /> Upload Document
                  </motion.button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                  {["all", "ID Proof", "Rental Agreement", "Police Verification", "Income Proof", "Employment Letter", "Bank Statement", "Other"].map((filter) => (
                    <button key={filter} onClick={() => setDocumentFilter(filter)}
                      className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap text-sm ${documentFilter === filter ? "bg-orange-500 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                      {filter === "all" ? "All" : filter}
                    </button>
                  ))}
                </div>

                {/* Documents Grid */}
                {documentsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No documents found</p>
                    <p className="text-gray-400 text-sm mt-1">Upload a document to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {documents
                      .filter((doc) => documentFilter === "all" || doc.documentType === documentFilter)
                      .map((doc) => (
                        <motion.div key={doc._id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -2 }}
                          className="border-2 border-gray-200 hover:border-orange-300 rounded-xl p-5 transition-all shadow-sm hover:shadow-md">

                          {/* Doc Header */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <File className="w-6 h-6 text-orange-500" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-gray-900 truncate">{doc.title}</h4>
                                <p className="text-sm text-orange-600 font-semibold">{doc.documentType}</p>
                                {doc.documentSubType && <p className="text-xs text-gray-400 mt-0.5">{doc.documentSubType}</p>}
                              </div>
                            </div>
                            {doc.verification?.isVerified ? (
                              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex-shrink-0">
                                <Check className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex-shrink-0">
                                Pending
                              </span>
                            )}
                          </div>

                          {/* File preview (image) */}
                          {doc.file?.url && ["jpeg", "jpg", "png"].includes(doc.file.fileType) && (
                            <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 h-32">
                              <img src={doc.file.url} alt={doc.title} className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = "none"; }} />
                            </div>
                          )}

                          {/* PDF badge */}
                          {doc.file?.fileType === "pdf" && (
                            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                              <FileText className="w-5 h-5 text-red-500" />
                              <span className="text-sm font-medium text-red-600">PDF Document</span>
                            </div>
                          )}

                          {/* Description */}
                          {doc.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                          )}

                          {/* Tags */}
                          {doc.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {doc.tags.map((tag) => (
                                <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded font-medium">#{tag}</span>
                              ))}
                            </div>
                          )}

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 flex-wrap">
                            <span>📅 Uploaded: {new Date(doc.createdAt).toLocaleDateString("en-IN")}</span>
                            {doc.expiryDate && (
                              <span className={`font-medium ${new Date(doc.expiryDate) < new Date() ? "text-red-500" : "text-gray-400"}`}>
                                ⏳ Expires: {new Date(doc.expiryDate).toLocaleDateString("en-IN")}
                              </span>
                            )}
                            {doc.downloadCount > 0 && <span>⬇ {doc.downloadCount} downloads</span>}
                          </div>

                          {/* Verification Info */}
                          {doc.verification?.isVerified && doc.verification?.verifiedAt && (
                            <div className="mb-4 p-2 bg-green-50 rounded-lg border border-green-100">
                              <p className="text-xs text-green-700 font-medium">
                                ✓ Verified on {new Date(doc.verification.verifiedAt).toLocaleDateString("en-IN")}
                              </p>
                              {doc.verification.verificationNotes && (
                                <p className="text-xs text-green-600 mt-0.5">{doc.verification.verificationNotes}</p>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {doc.file?.url && (
                              <a href={doc.file.url} target="_blank" rel="noopener noreferrer"
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm">
                                <Eye className="w-4 h-4" /> View
                              </a>
                            )}
                            {!doc.verification?.isVerified && (
                              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => { setSelectedDocForVerify(doc._id); setShowVerifyModal(true); }}
                                className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm">
                                <Check className="w-4 h-4" /> Verify
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}

                {/* Empty filtered state */}
                {!documentsLoading && documents.length > 0 &&
                  documents.filter((doc) => documentFilter === "all" || doc.documentType === documentFilter).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No documents found for "{documentFilter}"</p>
                    </div>
                  )}
              </div>
            </div>
          )}

        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          UPLOAD DOCUMENT MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
            onClick={() => setShowUploadModal(false)}>
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95vh] overflow-y-auto">

              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow">
                    <Upload className="text-white w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Upload Document</h2>
                    <p className="text-xs text-gray-500">For: {tenancy?.tenantId?.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* IDs (readonly info) */}
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-gray-500 block">Tenant ID</span><span className="font-mono font-semibold text-gray-700 truncate block">{tenancy?.tenantId?._id}</span></div>
                  <div><span className="text-gray-500 block">Tenancy ID</span><span className="font-mono font-semibold text-gray-700 truncate block">{tenancy?._id}</span></div>
                  <div><span className="text-gray-500 block">Landlord ID</span><span className="font-mono font-semibold text-gray-700 truncate block">{tenancy?.landlordId?._id}</span></div>
                  <div><span className="text-gray-500 block">Property ID</span><span className="font-mono font-semibold text-gray-700 truncate block">{tenancy?.propertyId?._id}</span></div>
                </div>

                {/* Document Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type *</label>
                    <select value={uploadForm.documentType}
                      onChange={(e) => setUploadForm((f) => ({ ...f, documentType: e.target.value, documentSubType: "" }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white">
                      <option value="">Select type...</option>
                      {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {DOC_SUB_TYPES[uploadForm.documentType]?.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sub Type</label>
                      <select value={uploadForm.documentSubType}
                        onChange={(e) => setUploadForm((f) => ({ ...f, documentSubType: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white">
                        <option value="">Select...</option>
                        {DOC_SUB_TYPES[uploadForm.documentType].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Document Title *</label>
                  <input type="text" placeholder="e.g. 11-Month Rental Agreement"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea rows={2} placeholder="Optional description..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm resize-none" />
                </div>

                {/* Dates & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Document Date</label>
                    <input type="date" value={uploadForm.documentDate}
                      onChange={(e) => setUploadForm((f) => ({ ...f, documentDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-400 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                    <input type="date" value={uploadForm.expiryDate}
                      onChange={(e) => setUploadForm((f) => ({ ...f, expiryDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-400 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
                    <select value={uploadForm.visibility}
                      onChange={(e) => setUploadForm((f) => ({ ...f, visibility: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-400 outline-none text-sm bg-white">
                      {VISIBILITY_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
                  <input type="text" placeholder="ID, Aadhaar, Government"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm((f) => ({ ...f, tags: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-400 outline-none text-sm" />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select File * <span className="text-gray-400 font-normal">(field: document)</span></label>
                  <div onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-orange-400 hover:bg-orange-50/30 transition cursor-pointer group">
                    <input type="file" ref={fileInputRef}
                      accept="image/jpeg,image/jpg,image/png,application/pdf,.doc,.docx"
                      onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                      className="hidden" />
                    {selectedFile ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <File className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition flex-shrink-0">
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-orange-100 flex items-center justify-center mx-auto mb-3 transition">
                          <Upload className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">Click to browse files</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF, DOC up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <motion.button onClick={handleUploadDocument}
                    disabled={uploadLoading || !uploadForm.documentType || !uploadForm.title || !selectedFile}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`flex-1 px-5 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      uploadLoading || !uploadForm.documentType || !uploadForm.title || !selectedFile
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
                    }`}>
                    {uploadLoading ? (
                      <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Uploading...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload Document</>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════════
          ACTION MODALS
      ══════════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} title="Approve Tenancy" icon={<CheckCircle className="w-8 h-8 text-green-500" />}>
        <p className="text-gray-700 mb-6">Are you sure you want to approve this tenancy? This will activate the agreement and create the first rent payment.</p>
        <div className="flex gap-3">
          <button onClick={() => setShowApproveModal(false)} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition">Cancel</button>
          <button onClick={handleApproveTenancy} disabled={actionLoading} className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition disabled:opacity-50">
            {actionLoading ? "Approving..." : "Approve"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Tenancy" icon={<XCircle className="w-8 h-8 text-red-500" />}>
        <p className="text-gray-700 mb-4">Please provide a reason for rejecting this tenancy:</p>
        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason..." rows={4}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-400 focus:outline-none mb-6 resize-none" />
        <div className="flex gap-3">
          <button onClick={() => setShowRejectModal(false)} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition">Cancel</button>
          <button onClick={handleRejectTenancy} disabled={actionLoading} className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition disabled:opacity-50">
            {actionLoading ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showNoticeModal} onClose={() => setShowNoticeModal(false)} title="Give Notice to Tenant" icon={<Bell className="w-8 h-8 text-orange-500" />}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Period (Days): <span className="text-orange-500">*</span></label>
            <div className="flex items-center gap-3">
              <input type="number" min="1" max="365" value={noticePeriodDays} onChange={(e) => setNoticePeriodDays(e.target.value)}
                className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none text-center font-semibold" />
              <span className="text-gray-600">days</span>
            </div>
          </div>
          {noticePeriodDays > 0 && (
            <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Tenant must vacate by:</span><br />
                <span className="text-orange-600 font-bold text-lg">
                  {new Date(Date.now() + parseInt(noticePeriodDays) * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason: <span className="text-orange-500">*</span></label>
            <textarea value={noticeReason} onChange={(e) => setNoticeReason(e.target.value)} placeholder="Enter reason for giving notice..." rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-400 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowNoticeModal(false)} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition">Cancel</button>
            <button onClick={handleGiveNotice} disabled={actionLoading || !noticePeriodDays || !noticeReason.trim()}
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
              {actionLoading ? "Submitting..." : "Give Notice"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} title="Rate Tenant" icon={<Star className="w-8 h-8 text-yellow-500" />}>
        <div className="mb-6">
          <p className="text-gray-700 mb-3">Select Rating:</p>
          <div className="flex gap-2 justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                <Star className={`w-10 h-10 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
          <p className="text-gray-700 mb-3">Review (optional):</p>
          <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Write your review..." rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-400 focus:outline-none resize-none" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowRatingModal(false)} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition">Cancel</button>
          <button onClick={handleRateTenant} disabled={actionLoading} className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition disabled:opacity-50">
            {actionLoading ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showVerifyModal}
        onClose={() => { setShowVerifyModal(false); setVerificationNotes(""); setSelectedDocForVerify(null); }}
        title="Verify Document"
        icon={<CheckCircle className="w-8 h-8 text-green-500" />}>
        <p className="text-gray-700 mb-4">Are you sure you want to verify this document?</p>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Notes:</label>
          <textarea value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)}
            placeholder="e.g. Document authentic, verified with government portal"
            rows={4} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-400 focus:outline-none resize-none" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowVerifyModal(false); setVerificationNotes(""); setSelectedDocForVerify(null); }}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition">Cancel</button>
          <button onClick={handleVerifyDocument} disabled={verifyLoading}
            className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition disabled:opacity-50">
            {verifyLoading ? "Verifying..." : "Verify Document"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <motion.div whileHover={{ scale: 1.05, y: -5 }} className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white shadow-lg`}>
    <div className="flex items-center justify-between">
      <div><p className="text-sm opacity-90">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div>
      <div className="text-3xl opacity-80">{icon}</div>
    </div>
  </motion.div>
);

const InfoItem = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-full" : ""}>
    <p className="text-gray-600 text-sm mb-1 font-medium">{label}</p>
    <p className="text-gray-900 font-semibold">{value || "N/A"}</p>
  </div>
);

const ContactCard = ({ title, name, phone, email }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-3">
      {name && <div className="flex items-center gap-3"><User className="w-5 h-5 text-orange-500" /><span className="text-gray-700">{name}</span></div>}
      {phone && <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-orange-500" /><a href={`tel:${phone}`} className="text-gray-700 hover:text-orange-500 transition">{phone}</a></div>}
      {email && <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-orange-500" /><a href={`mailto:${email}`} className="text-gray-700 hover:text-orange-500 transition truncate">{email}</a></div>}
    </div>
  </motion.div>
);

const RatingCard = ({ title, rating, review, date }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
    <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
    {rating && (
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
        </div>
        <span className="text-sm text-gray-600">{rating}/5</span>
      </div>
    )}
    {review && <p className="text-gray-700 text-sm mb-2">{review}</p>}
    {date && <p className="text-gray-500 text-xs">{new Date(date).toLocaleDateString("en-IN")}</p>}
  </motion.div>
);

const ChecklistItem = ({ item }) => (
  <motion.div whileHover={{ x: 5 }}
    className={`flex gap-4 p-4 rounded-lg border-2 ${item.condition?.toLowerCase() === "good" ? "bg-green-50 border-green-300" : item.condition?.toLowerCase() === "fair" ? "bg-yellow-50 border-yellow-300" : "bg-red-50 border-red-300"}`}>
    <div className="flex-shrink-0">
      {item.photo ? (
        <img src={item.photo} alt={item.item} className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200" />
      ) : (
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"><Eye className="w-6 h-6 text-gray-500" /></div>
      )}
    </div>
    <div className="flex-grow">
      <p className="font-semibold text-lg text-gray-900">{item.item}</p>
      <p className="text-sm text-gray-700 mb-1">Condition: <span className="font-medium">{item.condition}</span></p>
      {item.notes && <p className="text-sm text-gray-600">{item.notes}</p>}
    </div>
  </motion.div>
);

const SummaryItem = ({ label, value }) => (
  <div className="text-center">
    <p className="text-gray-700 text-sm mb-1">{label}</p>
    <p className="text-gray-900 font-bold text-lg">{value}</p>
  </div>
);

const ActionButton = ({ icon, label, onClick, variant = "primary" }) => {
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2 ${variants[variant]}`}>
      {icon}{label}
    </motion.button>
  );
};

const Modal = ({ isOpen, onClose, title, icon, children }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-4">{icon}<h2 className="text-2xl font-bold text-gray-900">{title}</h2></div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TenancyDetails;