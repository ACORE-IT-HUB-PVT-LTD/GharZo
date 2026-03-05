import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt, FaRupeeSign, FaTrash, FaEdit, FaEye, FaHome, FaSearch, FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl.js";

const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-52 bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center rounded-t-2xl">
        <FaHome className="text-3xl text-slate-300 mb-2" />
        <span className="text-slate-400 text-sm font-medium">No Images</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-52 overflow-hidden rounded-t-2xl group bg-slate-100">
      <img
        src={images[current]}
        alt="property"
        className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent pointer-events-none" />
      <button onClick={prevSlide} className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/90 text-[#1B2A4A] w-8 h-8 flex items-center justify-center rounded-full hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100 text-xs font-bold">&#10094;</button>
      <button onClick={nextSlide} className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/90 text-[#1B2A4A] w-8 h-8 flex items-center justify-center rounded-full hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100 text-xs font-bold">&#10095;</button>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all cursor-pointer ${i === current ? "bg-[#E07B1A] w-5" : "bg-white/70 w-1.5"}`} />
          ))}
        </div>
      )}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
          {current + 1}/{images.length}
        </div>
      )}
    </div>
  );
};

const Property = () => {
  const [properties, setProperties] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, ids: [], names: [] });
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const getAuthToken = () =>
    localStorage.token || localStorage.usertoken || localStorage.landlordtoken ||
    localStorage.tenanttoken || sessionStorage.token || null;

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return undefined;
    const handleMouseEnter = () => setIsSidebarHovered(true);
    const handleMouseLeave = () => setIsSidebarHovered(false);
    sidebar.addEventListener("mouseenter", handleMouseEnter);
    sidebar.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      sidebar.removeEventListener("mouseenter", handleMouseEnter);
      sidebar.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const token = getAuthToken();
      if (!token) { toast.error("Not authenticated. Please login."); setLoading(false); return; }
      try {
        const response = await axios.get(`${baseurl}api/v2/properties/my-properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success && Array.isArray(response.data.data)) {
          setProperties(response.data.data);
        } else {
          setProperties([]);
          toast.info("No properties found.");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load properties.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Filter by title and status
  const filteredProperties = properties.filter((prop) => {
    // Status filter
    if (statusFilter !== "all" && prop.status !== statusFilter) {
      return false;
    }
    // Title filter
    if (searchTitle.trim()) {
      return (prop.title || "").toLowerCase().includes(searchTitle.trim().toLowerCase());
    }
    return true;
  });

  const openDeleteModal = (ids) => {
    const uniqueIds = [...new Set(ids)];
    const names = properties.filter((p) => uniqueIds.includes(p._id)).map((p) => p.title || "Untitled Property");
    setDeleteModal({ open: true, ids: uniqueIds, names });
  };
  const closeDeleteModal = () => setDeleteModal({ open: false, ids: [], names: [] });

  const handleConfirmDelete = async () => {
    if (!deleteModal.ids.length) return;
    const token = getAuthToken();
    if (!token) { toast.error("Not authenticated."); return; }
    const isBulk = deleteModal.ids.length > 1;
    if (isBulk) setIsBulkDeleting(true);
    else setDeletingId(deleteModal.ids[0]);
    try {
      const idsToDelete = deleteModal.ids;
      await Promise.all(idsToDelete.map((id) => axios.delete(`${baseurl}api/v2/properties/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
      setProperties((prev) => prev.filter((p) => !idsToDelete.includes(p._id)));
      setSelectedPropertyIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
      toast.success(idsToDelete.length > 1 ? `${idsToDelete.length} properties deleted!` : "Property deleted!");
      closeDeleteModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting property.");
    } finally {
      setDeletingId(null);
      setIsBulkDeleting(false);
    }
  };

  const isAllFilteredSelected = filteredProperties.length > 0 && filteredProperties.every((p) => selectedPropertyIds.includes(p._id));

  const handleSelectAllFiltered = (checked) => {
    if (checked) setSelectedPropertyIds((prev) => [...new Set([...prev, ...filteredProperties.map((p) => p._id)])]);
    else setSelectedPropertyIds((prev) => prev.filter((id) => !filteredProperties.some((p) => p._id === id)));
  };

  const handleSelectProperty = (propertyId, checked) => {
    if (checked) setSelectedPropertyIds((prev) => [...new Set([...prev, propertyId])]);
    else setSelectedPropertyIds((prev) => prev.filter((id) => id !== propertyId));
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 min-w-0 ${isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"}`}
      style={{ background: "#f8fafc" }}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #E07B1A, transparent 70%)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #1B2A4A, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #E07B1A, #1B2A4A)" }} />
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1B2A4A]">My Properties</h2>
              </div>
              <p className="text-slate-500 text-sm ml-4 pl-3">Manage and track all your listed properties</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm" style={{ background: "linear-gradient(135deg, #1B2A4A, #243660)" }}>
                {properties.length} Total
              </div>
              {filteredProperties.length !== properties.length && (
                <div className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm" style={{ background: "linear-gradient(135deg, #E07B1A, #f5a623)" }}>
                  {filteredProperties.length} Filtered
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E07B1A] text-sm" />
              <input
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search by property title..."
                className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#E07B1A] focus:ring-2 placeholder-slate-400"
                style={{ "--tw-ring-color": "rgba(224,123,26,0.15)" }}
              />
              {searchTitle && (
                <button onClick={() => setSearchTitle("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition">
                  <FaTimes className="text-slate-400 text-xs" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status Filter Tabs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All", color: "slate" },
              { value: "Active", label: "Active", color: "green" },
              { value: "Pending", label: "Pending", color: "yellow" },
              { value: "Draft", label: "Draft", color: "gray" },
              { value: "Rejected", label: "Rejected", color: "red" },
            ].map((status) => {
              const count = status.value === "all" 
                ? properties.length 
                : properties.filter(p => p.status === status.value).length;
              return (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    statusFilter === status.value
                      ? status.color === "slate" ? "bg-slate-700 text-white"
                      : status.color === "green" ? "bg-green-600 text-white"
                      : status.color === "yellow" ? "bg-yellow-500 text-white"
                      : status.color === "gray" ? "bg-gray-500 text-white"
                      : "bg-red-500 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {status.label}
                  <span className="ml-1.5 opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Bulk actions */}
        {!loading && filteredProperties.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 font-semibold cursor-pointer w-fit select-none">
                <input type="checkbox" checked={isAllFilteredSelected} onChange={(e) => handleSelectAllFiltered(e.target.checked)} className="w-4 h-4 rounded border-slate-300" style={{ accentColor: "#E07B1A" }} />
                <span>Select All <span className="text-[#1B2A4A] font-black">({filteredProperties.length})</span></span>
              </label>
              <button
                onClick={() => openDeleteModal(selectedPropertyIds)}
                disabled={!selectedPropertyIds.length || isBulkDeleting}
                className={`px-5 py-2 rounded-xl text-sm font-bold text-white transition-all ${!selectedPropertyIds.length || isBulkDeleting ? "bg-red-200 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 shadow-sm"}`}
              >
                {isBulkDeleting ? "Deleting..." : selectedPropertyIds.length ? `Delete Selected (${selectedPropertyIds.length})` : "Delete Selected"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="relative w-16 h-16">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#E07B1A] absolute inset-0" />
              <div className="absolute inset-0 flex items-center justify-center"><FaHome className="text-[#1B2A4A] text-lg" /></div>
            </div>
            <p className="text-slate-400 text-sm font-medium">Loading properties...</p>
          </div>

        ) : filteredProperties.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center min-h-[40vh]">
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm max-w-md w-full">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #fff3e0, #f0f4ff)" }}>
                <FaHome className="text-2xl text-[#E07B1A]" />
              </div>
              <p className="text-xl font-black text-[#1B2A4A] mb-2">{properties.length === 0 ? "No Properties Yet" : "No Results Found"}</p>
              <p className="text-slate-500 text-sm">{properties.length === 0 ? "You haven't listed any properties yet." : `No property matches "${searchTitle}"`}</p>
              {searchTitle && (
                <button onClick={() => setSearchTitle("")} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #E07B1A, #f5a623)" }}>
                  Clear Search
                </button>
              )}
            </div>
          </motion.div>

        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {filteredProperties.map((property, index) => {
                const loc = property.location || {};
                const priceInfo = property.price || {};
                const area = property.area || {};
                const images = property.images?.map((img) => img.url) || [];
                const isSelected = selectedPropertyIds.includes(property._id);

                return (
                  <motion.div
                    key={property._id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300"
                    style={isSelected ? { border: "2px solid #E07B1A", boxShadow: "0 0 0 3px rgba(224,123,26,0.12), 0 8px 24px rgba(27,42,74,0.1)" } : { border: "1px solid #e2e8f0" }}
                  >
                    {/* Image + checkbox */}
                    <div className="relative">
                      <ImageSlider images={images} />
                      <div className="absolute top-3 left-3 z-10">
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={isSelected} onChange={(e) => handleSelectProperty(property._id, e.target.checked)} className="sr-only" />
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shadow-sm ${isSelected ? "bg-[#E07B1A] border-[#E07B1A]" : "bg-white/90 border-white/70 hover:border-[#E07B1A]"}`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col gap-4 flex-1">
                      {/* Title + type */}
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="text-lg font-black text-[#1B2A4A] line-clamp-2 leading-snug flex-1">{property.title || "Untitled Property"}</h5>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap" style={{ background: "linear-gradient(135deg, #fff3e0, #ffecd2)", color: "#E07B1A", border: "1px solid #E07B1A33" }}>
                          {property.propertyType || "-"} · {property.bhk || "?"} BHK
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-slate-500 text-sm gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <FaMapMarkerAlt className="text-[#E07B1A] text-xs" />
                        </div>
                        <p className="truncate">{loc.locality || loc.city || "-"}, {loc.city || loc.state || "-"}</p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl py-3 px-3 text-center border" style={{ background: "linear-gradient(135deg, #fffaf5, #fff)", borderColor: "#E07B1A22" }}>
                          <FaRupeeSign className="mx-auto text-sm text-[#E07B1A] mb-1" />
                          <p className="text-lg font-black text-[#1B2A4A]">{priceInfo.amount ? priceInfo.amount.toLocaleString() : "-"}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{priceInfo.per ? `/ ${priceInfo.per}` : "Rent"}</p>
                        </div>
                        <div className="rounded-xl py-3 px-3 text-center border" style={{ background: "linear-gradient(135deg, #f4f7ff, #fff)", borderColor: "#1B2A4A22" }}>
                          <FaHome className="mx-auto text-sm text-[#1B2A4A] mb-1" />
                          <p className="text-lg font-black text-[#1B2A4A]">{area.carpet || area.builtUp || "-"}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{area.unit || "sqft"}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <Link to={`/landlord/property/${property._id}`} title="View" className="py-3 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md" style={{ background: "linear-gradient(135deg, #1B2A4A, #243660)" }}>
                          <FaEye className="text-white text-sm" />
                        </Link>
                        <Link to={`/landlord/property/${property._id}/edit`} title="Edit" className="py-3 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md" style={{ background: "linear-gradient(135deg, #E07B1A, #f5a623)" }}>
                          <FaEdit className="text-white text-sm" />
                        </Link>
                        <button onClick={() => openDeleteModal([property._id])} disabled={deletingId === property._id} title="Delete" className={`py-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm ${deletingId === property._id ? "opacity-50 cursor-not-allowed bg-red-300" : "bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-95 hover:shadow-md"}`}>
                          {deletingId === property._id ? <span className="text-white text-[10px] font-bold">...</span> : <FaTrash className="text-white text-sm" />}
                        </button>
                      </div>

                      {/* Status */}
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${property.status === "Active" ? "bg-green-50 text-green-600 border border-green-200" : property.status === "Pending" ? "bg-yellow-50 text-yellow-600 border border-yellow-200" : "bg-red-50 text-red-500 border border-red-200"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${property.status === "Active" ? "bg-green-500" : property.status === "Pending" ? "bg-yellow-500" : "bg-red-500"}`} />
                          {property.status || property.verificationStatus || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(27,42,74,0.5)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.25 }} className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
              <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #E07B1A, #1B2A4A)" }} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <FaTrash className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1B2A4A]">Confirm Delete</h3>
                    <p className="text-xs text-slate-500">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">You are about to delete <span className="font-black text-[#1B2A4A]">{deleteModal.ids.length}</span> {deleteModal.ids.length > 1 ? "properties" : "property"}.</p>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 mb-5 gharzo-scrollbar">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selected Properties</p>
                  <ul className="space-y-1.5">
                    {deleteModal.names.map((name, idx) => (
                      <li key={`${name}-${idx}`} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 text-white" style={{ background: "#1B2A4A" }}>{idx + 1}</span>
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-3">
                  <button onClick={closeDeleteModal} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition">Cancel</button>
                  <button onClick={handleConfirmDelete} disabled={isBulkDeleting || !!deletingId} className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition ${isBulkDeleting || deletingId ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 shadow-sm"}`}>
                    {isBulkDeleting || deletingId ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .gharzo-scrollbar::-webkit-scrollbar { width: 3px; }
        .gharzo-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .gharzo-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #E07B1A66, #1B2A4A44); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Property;  
