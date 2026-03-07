import React, { useState, useEffect, useRef } from "react";
import {
  FaEye, FaFileAlt, FaUpload, FaFileSignature, FaFileUpload,
  FaInfoCircle, FaUser, FaFile, FaBuilding, FaDownload,
  FaArrowRight, FaCalendarAlt, FaClock, FaTrash, FaTimes,
  FaFilePdf, FaCheckCircle, FaTimesCircle, FaShieldAlt,
  FaTag, FaHashtag, FaEyeSlash, FaExclamationTriangle, FaPlus
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Auth Helper ──────────────────────────────────────────────────────────────
const getToken = () => {
  const token = localStorage.getItem("usertoken");
  if (!token) throw new Error("Authentication token not found. Please login again.");
  return token;
};

// ─── Get TenantId from JWT ────────────────────────────────────────────────────
const getTenantIdFromToken = () => {
  try {
    const token = localStorage.getItem("usertoken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id || payload.userId || null;
  } catch {
    return null;
  }
};

// ─── Generate Document Number ─────────────────────────────────────────────────
const generateDocNumber = () => {
  const now = new Date();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const rand2 = Math.floor(1000 + Math.random() * 9000);
  const rand3 = Math.floor(1000 + Math.random() * 9000);
  return `${rand}-${rand2}-${rand3}`;
};

// ─── Document Type Options (from schema enum) ─────────────────────────────────
const DOC_TYPES = [
  "ID Proof", "Rental Agreement", "Police Verification", "Income Proof",
  "Employment Letter", "Bank Statement", "Previous Rental History",
  "Character Reference", "Passport", "Driving License", "Voter ID",
  "PAN Card", "Aadhaar Card", "Other"
];

const DOC_SUB_TYPES = {
  "ID Proof": ["Aadhaar Card", "Passport", "Driving License", "Voter ID", "PAN Card"],
  "Income Proof": ["Salary Slip", "Bank Statement", "ITR", "Form 16"],
  "Other": []
};

const VISIBILITY_OPTIONS = ["Private", "Landlord Only", "Public"];

// ─── File Size Formatter ───────────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// ─── Date Formatter ───────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

// ─── Image/PDF Preview ────────────────────────────────────────────────────────
const DocPreview = ({ url, fileType, name, className = "" }) => {
  const isPdf = fileType === "pdf";
  if (isPdf) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 ${className}`}>
        <FaFilePdf className="text-red-400 text-5xl mb-2" />
        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">PDF</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name}
      className={`object-cover ${className}`}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%239ca3af' font-size='12'%3ENo Preview%3C/text%3E%3C/svg%3E";
      }}
    />
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DocumentManager() {
  // Documents State
  const [tenantDocs, setTenantDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tenancy State (for upload IDs)
  const [tenancies, setTenancies] = useState([]);
  const [selectedTenancy, setSelectedTenancy] = useState(null);

  // Upload Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState({
    documentType: "",
    documentSubType: "",
    title: "",
    description: "",
    visibility: "Landlord Only",
    tags: "",
  });
  const fileInputRef = useRef(null);

  // View Modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Filter State
  const [activeFilter, setActiveFilter] = useState("All");

  // ─── Fetch Tenancies ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTenancies = async () => {
      try {
        const token = getToken();
        const res = await fetch("https://api.gharzoreality.com/api/tenancies/tenant/my-tenancies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setTenancies(data.data);
          setSelectedTenancy(data.data[0]); // default to first active tenancy
        }
      } catch (err) {
        console.error("Tenancy fetch error:", err);
      }
    };
    fetchTenancies();
  }, []);

  // ─── Fetch My Documents ───────────────────────────────────────────────────────
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("https://api.gharzoreality.com/api/tenant-documents/my-documents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTenantDocs(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch documents");
      }
    } catch (err) {
      toast.error(err.message || "Error fetching documents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  // ─── Upload Document ──────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!form.documentType) return toast.error("Please select Document Type");
    if (!form.title.trim()) return toast.error("Please enter Document Title");
    if (!selectedFile) return toast.error("Please select a file");
    if (!selectedTenancy) return toast.error("No active tenancy found");

    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(selectedFile.type)) {
      return toast.error("Only JPG, PNG, PDF, DOC, DOCX files are allowed");
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      return toast.error("File size must be under 10MB");
    }

    setUploading(true);
    try {
      const token = getToken();
      const tenantId = getTenantIdFromToken();
      const docNumber = generateDocNumber();

      const formData = new FormData();

      // ── Exact fields as per API screenshot ──
      if (tenantId) formData.append("tenantId", tenantId);
      formData.append("tenancyId", selectedTenancy._id);
      formData.append("landlordId", selectedTenancy.landlordId._id);
      formData.append("propertyId", selectedTenancy.propertyId._id);
      formData.append("documentType", form.documentType);
      if (form.documentSubType) formData.append("documentSubType", form.documentSubType);
      formData.append("title", form.title.trim());
      if (form.description) formData.append("description", form.description.trim());
      formData.append("documentNumber", docNumber);
      formData.append("visibility", form.visibility);

      // tags as JSON string array: ["ID", "Aadhaar", "Government"]
      if (form.tags.trim()) {
        const tagsArray = form.tags.split(",").map(t => t.trim()).filter(Boolean);
        formData.append("tags", JSON.stringify(tagsArray));
      }

      // file field name = "document" as per API
      formData.append("document", selectedFile);

      const res = await fetch("https://api.gharzoreality.com/api/tenant-documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Upload failed");

      toast.success("Document uploaded successfully! 🎉");
      setShowUploadForm(false);
      setSelectedFile(null);
      setForm({ documentType: "", documentSubType: "", title: "", description: "", visibility: "Landlord Only", tags: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchDocuments();
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ─── Download Document ────────────────────────────────────────────────────────
  const handleDownload = async (doc) => {
    setDownloading(true);
    try {
      const token = getToken();
      const res = await fetch(`https://api.gharzoreality.com/api/tenant-documents/${doc._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Download failed");

      const link = document.createElement("a");
      link.href = data.data.fileUrl;
      link.download = data.data.title || doc.title;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");

      // Update download count in state
      setTenantDocs(prev => prev.map(d =>
        d._id === doc._id ? { ...d, downloadCount: data.data.downloadCount } : d
      ));
    } catch (err) {
      toast.error(err.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  // ─── Delete Document ──────────────────────────────────────────────────────────
  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) return;
    try {
      const token = getToken();
      const res = await fetch(`https://api.gharzoreality.com/api/tenant-documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");

      toast.success("Document deleted successfully");
      setTenantDocs(prev => prev.filter(d => d._id !== docId));
      setSelectedDoc(null);
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  // ─── Filtered Docs ─────────────────────────────────────────────────────────────
  const docTypes = ["All", ...new Set(tenantDocs.map(d => d.documentType))];
  const filteredDocs = activeFilter === "All"
    ? tenantDocs
    : tenantDocs.filter(d => d.documentType === activeFilter);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
              <FaFileAlt className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Document Manager</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Manage your important documents securely</p>
            </div>
          </div>
          <motion.button
            onClick={() => setShowUploadForm(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <FaPlus className="text-xs" />
            <span>Upload Doc</span>
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Tenancy Selector ── */}
        {tenancies.length > 1 && (
          <div className="flex flex-wrap gap-3">
            <span className="text-sm font-semibold text-gray-600 self-center">Active Tenancy:</span>
            {tenancies.map(t => (
              <button
                key={t._id}
                onClick={() => setSelectedTenancy(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  selectedTenancy?._id === t._id
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                Room {t.roomId?.roomNumber} • {t.status}
              </button>
            ))}
          </div>
        )}

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Docs", value: tenantDocs.length, color: "from-blue-500 to-indigo-500", icon: <FaFileAlt /> },
            { label: "Verified", value: tenantDocs.filter(d => d.verification?.isVerified).length, color: "from-green-500 to-emerald-500", icon: <FaCheckCircle /> },
            { label: "Pending", value: tenantDocs.filter(d => !d.verification?.isVerified).length, color: "from-amber-500 to-orange-500", icon: <FaClock /> },
            { label: "Downloads", value: tenantDocs.reduce((sum, d) => sum + (d.downloadCount || 0), 0), color: "from-purple-500 to-pink-500", icon: <FaDownload /> },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-lg shadow`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Filter Tabs ── */}
        {tenantDocs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {docTypes.map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  activeFilter === type
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* ── Documents Grid ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
              <FaUser className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">My Documents</h2>
              <p className="text-xs text-gray-500">{filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""} found</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {filteredDocs.map((doc, idx) => (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    {/* Preview */}
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
                      <DocPreview
                        url={doc.file?.url}
                        fileType={doc.file?.fileType}
                        name={doc.title}
                        className="w-full h-full"
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={e => { e.stopPropagation(); setSelectedDoc(doc); }}
                          className="p-2.5 bg-white rounded-full shadow hover:shadow-lg"
                        >
                          <FaEye className="text-indigo-600 text-sm" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={e => { e.stopPropagation(); handleDownload(doc); }}
                          className="p-2.5 bg-white rounded-full shadow hover:shadow-lg"
                        >
                          <FaDownload className="text-green-600 text-sm" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={e => { e.stopPropagation(); handleDelete(doc._id); }}
                          className="p-2.5 bg-white rounded-full shadow hover:shadow-lg"
                        >
                          <FaTrash className="text-red-500 text-sm" />
                        </motion.button>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-gray-700 uppercase">
                          {doc.file?.fileType || "doc"}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        {doc.verification?.isVerified ? (
                          <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                            <FaCheckCircle className="text-xs" /> Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-400 text-white rounded-full text-xs font-bold flex items-center gap-1">
                            <FaClock className="text-xs" /> Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-0.5">{doc.title}</h3>
                      <p className="text-xs text-indigo-600 font-semibold mb-2">{doc.documentType}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt /> {formatDate(doc.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaDownload /> {doc.downloadCount || 0}
                        </span>
                      </div>
                      {doc.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
                <FaFile className="text-3xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Documents Yet</h3>
              <p className="text-gray-400 text-sm mb-5">Upload your first document to get started</p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow hover:shadow-lg transition-all"
              >
                Upload Now
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          UPLOAD MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUploadForm(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow">
                    <FaUpload className="text-white text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Upload Document</h2>
                    <p className="text-xs text-gray-500">Fill details and attach your file</p>
                  </div>
                </div>
                <button onClick={() => setShowUploadForm(false)} className="p-2 rounded-xl hover:bg-gray-100 transition">
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* Tenancy Selector */}
                {tenancies.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2"><FaBuilding className="text-blue-500" /> Select Tenancy</span>
                    </label>
                    <select
                      value={selectedTenancy?._id || ""}
                      onChange={e => setSelectedTenancy(tenancies.find(t => t._id === e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
                    >
                      {tenancies.map(t => (
                        <option key={t._id} value={t._id}>
                          Room {t.roomId?.roomNumber} ({t.roomId?.roomType}) • {t.status} • {t.landlordId?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Document Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2"><FaFileAlt className="text-indigo-500" /> Document Type *</span>
                    </label>
                    <select
                      value={form.documentType}
                      onChange={e => setForm(f => ({ ...f, documentType: e.target.value, documentSubType: "" }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
                    >
                      <option value="">Select type...</option>
                      {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {DOC_SUB_TYPES[form.documentType]?.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sub Type</label>
                      <select
                        value={form.documentSubType}
                        onChange={e => setForm(f => ({ ...f, documentSubType: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
                      >
                        <option value="">Select sub type...</option>
                        {DOC_SUB_TYPES[form.documentType].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2"><FaFileSignature className="text-purple-500" /> Document Title *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aadhaar Card - Front & Back"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Optional description..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm resize-none"
                  />
                </div>

                {/* Visibility & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2"><FaShieldAlt className="text-teal-500" /> Visibility</span>
                    </label>
                    <select
                      value={form.visibility}
                      onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
                    >
                      {VISIBILITY_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2"><FaTag className="text-pink-500" /> Tags (comma separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ID, Aadhaar, Government"
                      value={form.tags}
                      onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2"><FaFileUpload className="text-orange-500" /> Select File *</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={e => setSelectedFile(e.target.files[0] || null)}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          {selectedFile.type === "application/pdf" ? (
                            <FaFilePdf className="text-red-500 text-xl" />
                          ) : (
                            <FaFile className="text-blue-500 text-xl" />
                          )}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)} • {selectedFile.type}</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition"
                        >
                          <FaTimes className="text-red-400 text-sm" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-blue-100 flex items-center justify-center mx-auto mb-3 transition">
                          <FaUpload className="text-gray-400 group-hover:text-blue-500 text-xl transition" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">Click to browse files</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF, DOC up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleUpload}
                    disabled={uploading || !form.documentType || !form.title || !selectedFile}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 px-5 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      uploading || !form.documentType || !form.title || !selectedFile
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <><FaUpload /> Upload Document</>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW / DETAIL MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoc(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow flex-shrink-0">
                    <FaFile className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{selectedDoc.title}</h3>
                    <p className="text-xs text-indigo-600 font-semibold">{selectedDoc.documentType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => handleDownload(selectedDoc)}
                    disabled={downloading}
                    className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition"
                    title="Download"
                  >
                    <FaDownload />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDoc(null)}
                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
                  >
                    <FaTimes />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1">
                {/* Image/PDF Preview */}
                <div className="bg-gradient-to-br from-slate-100 to-indigo-50 p-4 flex items-center justify-center min-h-52">
                  <DocPreview
                    url={selectedDoc.file?.url}
                    fileType={selectedDoc.file?.fileType}
                    name={selectedDoc.title}
                    className="max-h-72 w-auto rounded-xl shadow-lg object-contain"
                  />
                </div>

                {/* Document Details */}
                <div className="p-6 space-y-5">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Document #", value: selectedDoc.documentNumber, icon: <FaHashtag /> },
                      { label: "Type", value: selectedDoc.documentType, icon: <FaFileAlt /> },
                      { label: "Sub Type", value: selectedDoc.documentSubType || "—", icon: <FaFile /> },
                      { label: "Status", value: selectedDoc.status, icon: <FaCheckCircle /> },
                      { label: "Visibility", value: selectedDoc.visibility, icon: <FaEye /> },
                      { label: "Downloads", value: selectedDoc.downloadCount || 0, icon: <FaDownload /> },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                          {item.icon} {item.label}
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  {selectedDoc.description && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-xs font-semibold text-blue-600 mb-1">Description</p>
                      <p className="text-sm text-gray-700">{selectedDoc.description}</p>
                    </div>
                  )}

                  {/* Verification */}
                  <div className={`rounded-xl p-4 border flex items-center gap-3 ${
                    selectedDoc.verification?.isVerified
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}>
                    {selectedDoc.verification?.isVerified ? (
                      <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                    ) : (
                      <FaClock className="text-amber-500 text-xl flex-shrink-0" />
                    )}
                    <div>
                      <p className={`font-semibold text-sm ${selectedDoc.verification?.isVerified ? "text-green-700" : "text-amber-700"}`}>
                        {selectedDoc.verification?.isVerified ? "Verified by Landlord" : "Verification Pending"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedDoc.verification?.isVerified
                          ? `Verified on ${formatDate(selectedDoc.verification.verifiedAt)}`
                          : "Awaiting landlord review"}
                      </p>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2">File Information</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs">Size</span>
                        <p className="font-medium text-gray-700">{formatFileSize(selectedDoc.file?.fileSize)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Type</span>
                        <p className="font-medium text-gray-700 uppercase">{selectedDoc.file?.fileType}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Uploaded</span>
                        <p className="font-medium text-gray-700">{formatDate(selectedDoc.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Uploaded By</span>
                        <p className="font-medium text-gray-700">{selectedDoc.uploadedBy?.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedDoc.tags?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoc.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold border border-indigo-100">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer - Delete */}
              <div className="px-6 py-4 border-t border-gray-100 bg-red-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-400 text-sm" />
                  <p className="text-xs text-gray-500 font-medium">Permanently delete this document</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => handleDelete(selectedDoc._id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold text-sm shadow hover:shadow-lg transition"
                >
                  <FaTrash /> Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}