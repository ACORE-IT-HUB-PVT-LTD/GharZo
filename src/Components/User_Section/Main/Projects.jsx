import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, Star, MapPin, Building2, Calendar, TrendingUp, Award,
  Phone, Mail, ChevronLeft, ChevronRight, X, CheckCircle, Clock,
  Users, Eye, MessageSquare, ArrowRight, Download, Play, Image,
  Bed, Bath, Layers, Maximize2, Home, Sparkles, Shield, ShoppingBag,
  Gamepad2, Leaf, Wrench, Camera, Video, FileText, Filter, RotateCcw,
  BadgeCheck, Banknote, Percent, Building, Flag, ZapIcon, Heart,
  LayoutGrid, List, SlidersHorizontal, ChevronDown, AlertCircle,
  ThumbsUp, ThumbsDown, Globe, Hash, BarChart3, Loader2, Send,
  PersonStanding, Flame, Crown, Train, Plane, Navigation, Landmark,
  School, Hospital, ShoppingCart, Utensils, TreePine
} from "lucide-react";

const API_BASE = "https://api.gharzoreality.com/api";
const getToken = () => localStorage.getItem("usertoken");
const authH = () => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" });

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtCr = (n) => {
  if (!n && n !== 0) return "—";
  const num = Number(n);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
};
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtMY = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—";
const primaryImg = (p) =>
  p?.media?.images?.find((i) => i.isPrimary)?.url ||
  p?.media?.images?.[0]?.url || "";

const STATUS_COLORS = {
  "New Launch":          { bg: "bg-emerald-500", text: "text-white", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "Under Construction":  { bg: "bg-amber-500",   text: "text-white", light: "bg-amber-50 text-amber-700 border-amber-200" },
  "Ready to Move":       { bg: "bg-blue-500",    text: "text-white", light: "bg-blue-50 text-blue-700 border-blue-200" },
  "Nearing Completion":  { bg: "bg-orange-500",  text: "text-white", light: "bg-orange-50 text-orange-700 border-orange-200" },
  "Booking Open":        { bg: "bg-purple-500",  text: "text-white", light: "bg-purple-50 text-purple-700 border-purple-200" },
  "Sold Out":            { bg: "bg-slate-400",   text: "text-white", light: "bg-slate-50 text-slate-500 border-slate-200" },
};

const AMENITY_ICONS = {
  basic:         <Home size={15} />,
  premium:       <Sparkles size={15} />,
  sports:        <ZapIcon size={15} />,
  security:      <Shield size={15} />,
  convenience:   <ShoppingBag size={15} />,
  entertainment: <Gamepad2 size={15} />,
  eco:           <Leaf size={15} />,
};

const NEARBY_ICONS = {
  schools:     <School size={14} />,
  hospitals:   <Hospital size={14} />,
  malls:       <ShoppingCart size={14} />,
  restaurants: <Utensils size={14} />,
  parks:       <TreePine size={14} />,
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return (
    <div className={`fixed top-4 right-4 left-4 sm:left-auto z-[999] flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl text-white text-xs sm:text-sm font-semibold max-w-sm ${type === "error" ? "bg-red-500" : "bg-emerald-500"}`}
      style={{ animation: "toastIn .3s ease" }}>
      {type === "error" ? <AlertCircle size={18} className="flex-shrink-0" /> : <CheckCircle size={18} className="flex-shrink-0" />}
      <span className="flex-1 leading-snug">{msg}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white flex-shrink-0"><X size={14} /></button>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, wide, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-2 sm:p-3">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full flex flex-col overflow-hidden ${wide ? "max-w-lg sm:max-w-2xl" : "max-w-sm sm:max-w-md"}`}
        style={{ maxHeight: "95vh", animation: "modalIn .25s ease" }}>
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}>
          <h3 className="text-base sm:text-lg font-black text-white truncate">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition flex-shrink-0 ml-2">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
const InpCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-slate-50 focus:bg-white transition-all placeholder-slate-300";
const SelCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 focus:bg-white transition-all text-slate-700";

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

function Pills({ options, value, onChange, accent = "orange" }) {
  const on = accent === "blue" ? "bg-blue-900 text-white border-blue-900 shadow-sm" : "bg-orange-500 text-white border-orange-500 shadow-sm";
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all ${value === o ? on : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function Stars({ value = 0, onChange, size = "md" }) {
  const [hov, setHov] = useState(0);
  const sz = { sm: 14, md: 22, lg: 32 }[size] || 22;
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onMouseEnter={() => onChange && setHov(s)}
          onMouseLeave={() => onChange && setHov(0)}
          onClick={() => onChange && onChange(s)}
          className={`leading-none transition-transform ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}>
          <Star size={sz} fill={(hov || value) >= s ? "#f59e0b" : "none"} stroke={(hov || value) >= s ? "#f59e0b" : "#e2e8f0"} />
        </button>
      ))}
    </div>
  );
}

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
function Lightbox({ media, index, onClose }) {
  const [idx, setIdx] = useState(index || 0);
  const item = media[idx];
  const prev = () => setIdx((i) => (i - 1 + media.length) % media.length);
  const next = () => setIdx((i) => (i + 1) % media.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[900] bg-black/95 flex flex-col items-center justify-center" onClick={onClose}>
      <button className="absolute top-3 sm:top-4 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
        <X size={18} />
      </button>
      <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs sm:text-sm bg-black/40 px-3 sm:px-4 py-1.5 rounded-full">
        {idx + 1} / {media.length}
      </div>
      <div className="flex-1 flex items-center justify-center w-full px-4 sm:px-16 py-8" onClick={(e) => e.stopPropagation()}>
        {item.type === "video" ? (
          <video src={item.src} controls autoPlay className="max-w-full max-h-full rounded-xl sm:rounded-2xl shadow-2xl" style={{ maxHeight: "calc(100vh - 120px)" }} />
        ) : (
          <img src={item.src} alt={item.label || ""} className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-2xl" style={{ maxHeight: "calc(100vh - 120px)" }} />
        )}
      </div>
      {item.label && (
        <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-xs sm:text-sm bg-black/50 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2">
          {item.type === "video" && <Play size={12} />}{item.label}
        </div>
      )}
      {media.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}

// ─── GALLERY TAB ──────────────────────────────────────────────────────────────
function GalleryTab({ media }) {
  const [lightbox, setLightbox] = useState(null);
  const allMedia = [
    ...(media?.images || []).map((img) => ({ type: "image", src: img.url, label: img.type || "Photo", isPrimary: img.isPrimary })),
    ...(media?.videos || []).map((vid, i) => ({ type: "video", src: vid.url, label: vid.type || `Video ${i + 1}` })),
  ];
  const images = allMedia.filter((m) => m.type === "image");
  const videos = allMedia.filter((m) => m.type === "video");

  if (allMedia.length === 0 && !media?.brochure?.url) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Camera size={48} className="mx-auto mb-3 opacity-30" />
        <p className="font-semibold">No media available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {images.length > 0 && (
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Camera size={13} /> Photos ({images.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {images.map((img, i) => {
              const globalIdx = allMedia.findIndex((m) => m.src === img.src);
              return (
                <div key={i} onClick={() => setLightbox({ items: allMedia, index: globalIdx })}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group border border-slate-100 hover:border-orange-300 transition-all"
                  style={{ aspectRatio: "4/3" }}>
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <Maximize2 size={28} className="opacity-0 group-hover:opacity-100 transition-opacity text-white drop-shadow" />
                  </div>
                  {img.label && img.label !== "Other" && (
                    <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-lg backdrop-blur-sm">{img.label}</span>
                  )}
                  {img.isPrimary && <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-lg font-bold flex items-center gap-1"><Star size={10} fill="white" />Main</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {videos.length > 0 && (
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Video size={13} /> Videos ({videos.length})
          </p>
          <div className="space-y-2">
            {videos.map((vid, i) => {
              const globalIdx = allMedia.findIndex((m) => m.src === vid.src);
              return (
                <div key={i} onClick={() => setLightbox({ items: allMedia, index: globalIdx })}
                  className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors group border border-slate-700 hover:border-orange-500">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg">
                    <Play size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{vid.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click to play full video</p>
                  </div>
                  <ArrowRight size={20} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {media?.brochure?.url && (
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <FileText size={13} /> Documents
          </p>
          <a href={media.brochure.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 hover:border-blue-300 transition-all group">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
              <FileText size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-blue-800 truncate">{media.brochure.fileName || "Project Brochure"}</p>
              <p className="text-xs text-blue-500 mt-0.5">PDF · Click to download</p>
            </div>
            <Download size={20} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      )}
      {lightbox && <Lightbox media={lightbox.items} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
}

// ─── ENQUIRY MODAL ────────────────────────────────────────────────────────────
function EnquiryModal({ open, onClose, project, toast }) {
  const init = {
    name: "", phone: "", email: "",
    configurationType: "", budgetMin: "", budgetMax: "",
    purposeOfBuying: "Self Use", message: "",
    preferredContactMethod: "WhatsApp", preferredTimeSlot: "Evening (5PM-9PM)",
    siteVisitRequested: false, preferredDate: "", preferredTime: "Morning (9AM-12PM)", numberOfPeople: "2",
  };
  const [form, setForm] = useState(init);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => { if (open) { setForm(init); setErrors({}); } }, [open, project]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = "Enter valid 10-digit Indian mobile number";
    if (!form.configurationType) e.configurationType = "Please select a configuration";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const body = {
        projectId: project._id,
        name: form.name.trim(), phone: form.phone.trim(),
        ...(form.email.trim() && { email: form.email.trim() }),
        interestedIn: {
          configurationType: form.configurationType,
          purposeOfBuying: form.purposeOfBuying,
          ...(form.budgetMin && form.budgetMax && { budgetRange: { min: Number(form.budgetMin), max: Number(form.budgetMax) } }),
        },
        message: form.message,
        preferredContactMethod: form.preferredContactMethod,
        preferredTimeSlot: form.preferredTimeSlot,
        siteVisitRequested: form.siteVisitRequested,
        ...(form.siteVisitRequested && form.preferredDate && {
          siteVisitDetails: { preferredDate: form.preferredDate, preferredTime: form.preferredTime, numberOfPeople: Number(form.numberOfPeople) || 2 },
        }),
      };
      const res = await fetch(`${API_BASE}/project-enquiries/create`, { method: "POST", headers: authH(), body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { toast("Enquiry submitted! Our team will contact you shortly.", "success"); onClose(); }
      else throw new Error(data.message || "Submission failed");
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  };

  const configs = project?.configurations?.map((c) => c.type) || project?.propertyTypes || [];
  const PURPOSES = ["Self Use", "Investment", "Rental Income", "Resale"];
  const CONTACTS = ["Phone", "WhatsApp", "Email", "Any"];
  const SLOTS    = ["Morning (9AM-12PM)", "Afternoon (12PM-4PM)", "Evening (5PM-9PM)", "Any Time"];
  const VTIMES   = ["Morning (9AM-12PM)", "Afternoon (12PM-4PM)", "Evening (5PM-9PM)"];

  return (
    <Modal open={open} onClose={onClose} title={`Enquire — ${project?.projectName || ""}`} wide>
      {project && (
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-orange-100" style={{ background: "linear-gradient(135deg,#fff7ed,#eff6ff)" }}>
            {primaryImg(project) && (
              <img src={primaryImg(project)} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover flex-shrink-0 shadow-sm border border-white" alt="" />
            )}
            <div className="min-w-0">
              <p className="font-black text-slate-800 truncate text-sm sm:text-base">{project.projectName}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin size={11} className="sm:size-11" />{project.location?.locality}, {project.location?.city}</p>
              <p className="text-xs sm:text-sm font-bold text-orange-600 mt-0.5">{fmtCr(project.pricing?.priceRange?.min)} – {fmtCr(project.pricing?.priceRange?.max)}</p>
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Contact Details</p>
            <Field label="Full Name" required error={errors.name}>
              <input value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="e.g. Amit Kumar" className={InpCls} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Mobile Number" required error={errors.phone}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold select-none">+91</span>
                  <input value={form.phone} onChange={(e) => set("phone")(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" maxLength={10} className={`${InpCls} pl-12`} />
                </div>
              </Field>
              <Field label="Email Address">
                <input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="amit@example.com" className={InpCls} />
              </Field>
            </div>
          </div>
          <Field label="I'm Interested In" required error={errors.configurationType}>
            {configs.length > 0 ? <Pills options={configs} value={form.configurationType} onChange={set("configurationType")} /> : (
              <input value={form.configurationType} onChange={(e) => set("configurationType")(e.target.value)} placeholder="e.g. 3 BHK" className={InpCls} />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min Budget">
              <input type="number" value={form.budgetMin} onChange={(e) => set("budgetMin")(e.target.value)} placeholder="₹ Minimum" className={InpCls} />
            </Field>
            <Field label="Max Budget">
              <input type="number" value={form.budgetMax} onChange={(e) => set("budgetMax")(e.target.value)} placeholder="₹ Maximum" className={InpCls} />
            </Field>
          </div>
          <Field label="Purpose of Buying">
            <Pills options={PURPOSES} value={form.purposeOfBuying} onChange={set("purposeOfBuying")} accent="blue" />
          </Field>
          <Field label="Message / Requirements">
            <textarea value={form.message} onChange={(e) => set("message")(e.target.value)} rows={3}
              placeholder="Tell us more about what you're looking for..." className={`${InpCls} resize-none`} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Preferred Contact Method">
              <select value={form.preferredContactMethod} onChange={(e) => set("preferredContactMethod")(e.target.value)} className={SelCls}>
                {CONTACTS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Best Time to Call">
              <select value={form.preferredTimeSlot} onChange={(e) => set("preferredTimeSlot")(e.target.value)} className={SelCls}>
                {SLOTS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <label className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-orange-100 cursor-pointer hover:border-orange-300 transition-colors" style={{ background: "linear-gradient(135deg,#fff7ed,#fffbeb)" }}>
            <input type="checkbox" checked={form.siteVisitRequested} onChange={(e) => setForm((p) => ({ ...p, siteVisitRequested: e.target.checked }))} className="w-5 h-5 mt-0.5 accent-orange-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base"><Building size={15} className="text-orange-500" />Request a Free Site Visit</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Our executive will personally take you on a guided tour</p>
            </div>
          </label>
          {form.siteVisitRequested && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4 bg-orange-50/80 rounded-xl sm:rounded-2xl border border-orange-100">
              <Field label="Preferred Visit Date">
                <input type="date" value={form.preferredDate} onChange={(e) => set("preferredDate")(e.target.value)} min={new Date().toISOString().split("T")[0]} className={InpCls} />
              </Field>
              <Field label="Preferred Time Slot">
                <select value={form.preferredTime} onChange={(e) => set("preferredTime")(e.target.value)} className={SelCls}>
                  {VTIMES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Number of Visitors" hint="Including yourself">
                  <input type="number" min={1} max={10} value={form.numberOfPeople} onChange={(e) => set("numberOfPeople")(e.target.value)} className={InpCls} />
                </Field>
              </div>
            </div>
          )}
          <button onClick={submit} disabled={loading}
            className="w-full py-3 sm:py-4 text-white font-black text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            style={{ background: loading ? "#fb923c" : "linear-gradient(135deg,#f97316,#ea580c)" }}>
            {loading ? <><Loader2 size={18} className="animate-spin" />Submitting...</> : <><Send size={18} />Submit Enquiry</>}
          </button>
          <p className="text-center text-[10px] sm:text-xs text-slate-400 flex items-center justify-center gap-1"><Shield size={12} />Your information is 100% safe and confidential</p>
        </div>
      )}
    </Modal>
  );
}

// ─── REVIEW MODAL ─────────────────────────────────────────────────────────────
function ReviewModal({ open, onClose, project, toast, onSuccess }) {
  const [form, setForm] = useState({ rating: 0, review: "", pros: "", cons: "", reviewType: "Buyer" });
  const [loading, setLoading] = useState(false);
  const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  const TYPES  = ["Buyer", "Site Visitor", "Investor", "Tenant"];

  useEffect(() => { if (open) setForm({ rating: 0, review: "", pros: "", cons: "", reviewType: "Buyer" }); }, [open]);

  const submit = async () => {
    if (!form.rating) { toast("Please select a star rating", "error"); return; }
    if (!form.review.trim()) { toast("Please write your review", "error"); return; }
    setLoading(true);
    try {
      const body = {
        rating: form.rating, review: form.review, reviewType: form.reviewType,
        pros: form.pros ? form.pros.split(",").map((s) => s.trim()).filter(Boolean) : [],
        cons: form.cons ? form.cons.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      const res = await fetch(`${API_BASE}/projects/${project._id}/review`, { method: "POST", headers: authH(), body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { toast("Review submitted! Thank you.", "success"); onSuccess?.(); onClose(); }
      else throw new Error(data.message);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Write a Review">
      {project && (
        <div className="space-y-4 sm:space-y-5">
          <div className="text-center py-4 sm:py-5 bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-100">
            <p className="text-xs sm:text-sm text-slate-500 mb-2 font-medium">Rate {project.projectName}</p>
            <Stars value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} size="lg" />
            {form.rating > 0 && <p className="text-lg sm:text-xl font-black text-amber-600 mt-2">{LABELS[form.rating]}</p>}
          </div>
          <Field label="You are a">
            <Pills options={TYPES} value={form.reviewType} onChange={(v) => setForm((p) => ({ ...p, reviewType: v }))} accent="blue" />
          </Field>
          <Field label="Your Review" required>
            <textarea value={form.review} onChange={(e) => setForm((p) => ({ ...p, review: e.target.value }))} rows={4}
              placeholder="Tell others about the project — construction quality, location, amenities..." className={`${InpCls} resize-none`} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><ThumbsUp size={11} />Pros</label>
              <input value={form.pros} onChange={(e) => setForm((p) => ({ ...p, pros: e.target.value }))} placeholder="Location, Amenities" className={InpCls} />
              <p className="text-xs text-slate-400 mt-1">Comma separated</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-red-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><ThumbsDown size={11} />Cons</label>
              <input value={form.cons} onChange={(e) => setForm((p) => ({ ...p, cons: e.target.value }))} placeholder="High price, Traffic" className={InpCls} />
              <p className="text-xs text-slate-400 mt-1">Comma separated</p>
            </div>
          </div>
          <button onClick={submit} disabled={loading}
            className="w-full py-3 sm:py-4 text-white font-black text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all disabled:opacity-60 shadow-lg flex items-center justify-center gap-2"
            style={{ background: loading ? "#1e3a8a" : "linear-gradient(135deg,#1e3a8a,#1e40af)" }}>
            {loading ? <><Loader2 size={18} className="animate-spin" />Submitting...</> : <><Send size={18} />Submit Review</>}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── MY ENQUIRIES ─────────────────────────────────────────────────────────────
function MyEnquiriesModal({ open, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`${API_BASE}/project-enquiries/my-enquiries`, { headers: authH() })
      .then((r) => r.json()).then((d) => { if (d.success) setList(d.data || []); })
      .finally(() => setLoading(false));
  }, [open]);

  const CHIPS = {
    New: "bg-blue-100 text-blue-700", Contacted: "bg-amber-100 text-amber-700",
    "Site Visit Scheduled": "bg-purple-100 text-purple-700",
    Converted: "bg-green-100 text-green-700", Closed: "bg-slate-100 text-slate-500",
  };

  return (
    <Modal open={open} onClose={onClose} title="My Enquiries" wide>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="sm:size-36 text-slate-300" />
          </div>
          <p className="font-black text-slate-700 text-lg sm:text-xl">No Enquiries Yet</p>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">Submit an enquiry on any project to see it here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {list.map((enq) => (
            <div key={enq._id} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors bg-white shadow-sm">
              <div className="flex gap-2 sm:gap-3 items-start">
                {enq.projectId?.media?.images?.[0]?.url && (
                  <img src={enq.projectId.media.images[0].url} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover flex-shrink-0 border border-slate-100" alt="" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                    <span className="text-[10px] sm:text-xs font-mono text-slate-400 bg-slate-50 px-1.5 sm:px-2 py-0.5 rounded-lg">{enq.enquiryNumber}</span>
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${CHIPS[enq.status] || CHIPS.New}`}>{enq.status}</span>
                  </div>
                  <p className="font-black text-slate-800 truncate text-sm sm:text-base">{enq.projectId?.projectName}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} className="sm:size-10" />{enq.projectId?.location?.city} · {fmtDate(enq.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap mt-2 sm:mt-3">
                {enq.interestedIn?.configurationType && (
                  <span className="text-[10px] sm:text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 sm:py-1 rounded-full font-semibold">{enq.interestedIn.configurationType}</span>
                )}
                {enq.interestedIn?.purposeOfBuying && (
                  <span className="text-[10px] sm:text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 sm:py-1 rounded-full font-semibold">{enq.interestedIn.purposeOfBuying}</span>
                )}
                {enq.preferredContactMethod && (
                  <span className="text-[10px] sm:text-xs bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 sm:py-1 rounded-full">{enq.preferredContactMethod}</span>
                )}
                {enq.siteVisitRequested && (
                  <span className="text-[10px] sm:text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 sm:py-1 rounded-full font-semibold flex items-center gap-1"><Calendar size={10} className="sm:size-10" />Site Visit</span>
                )}
              </div>
              {enq.message && <p className="text-[10px] sm:text-xs text-slate-400 mt-2 italic line-clamp-2">"{enq.message}"</p>}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ─── FULL PAGE DETAIL VIEW ─────────────────────────────────────────────────────
function DetailPage({ project, onBack, onEnquire, onReview }) {
  const [tab, setTab] = useState("overview");
  const [imgIdx, setImgIdx] = useState(0);
  const [similar, setSimilar] = useState([]);
  const [carouselMode, setCarouselMode] = useState("all"); // "all", "images", "videos"

  useEffect(() => {
    setTab("overview"); setImgIdx(0); setSimilar([]); setCarouselMode("all");
    if (project?._id) {
      fetch(`${API_BASE}/projects/${project._id}/similar?limit=4`, { headers: { Authorization: `Bearer ${getToken()}` } })
        .then((r) => r.json()).then((d) => { if (d.success) setSimilar(d.data || []); });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [project?._id]);

  if (!project) return null;

  // Combine images and videos: images first, then videos
  const allMedia = [
    ...(project.media?.images || []).map((img, i) => ({ type: "image", src: img.url, label: img.type || "Photo", isPrimary: img.isPrimary, index: i })),
    ...(project.media?.videos || []).map((vid, i) => ({ type: "video", src: vid.url, label: vid.type || `Video ${i + 1}`, index: i })),
  ];
  const images = allMedia.filter((m) => m.type === "image");
  const videos = allMedia.filter((m) => m.type === "video");
  const imageCount = images.length;
  const videoCount = videos.length;

  // Filter media based on carousel mode
  const getFilteredMedia = () => {
    if (carouselMode === "images") return images;
    if (carouselMode === "videos") return videos;
    return allMedia;
  };
  
  const filteredMedia = getFilteredMedia();
  const currentImg = filteredMedia[imgIdx];
  const sc = STATUS_COLORS[project.projectStatus?.status] || { bg: "bg-slate-500", text: "text-white", light: "bg-slate-50 text-slate-500 border-slate-200" };

  const handlePrev = () => setImgIdx((i) => (i - 1 + filteredMedia.length) % filteredMedia.length);
  const handleNext = () => setImgIdx((i) => (i + 1) % filteredMedia.length);

  const TABS = [
    { key: "overview",  icon: <Home size={15} />,       label: "Overview" },
    { key: "gallery",   icon: <Camera size={15} />,     label: `Gallery${imageCount + videoCount > 0 ? ` (${imageCount + videoCount})` : ""}` },
    { key: "amenities", icon: <Sparkles size={15} />,   label: "Amenities" },
    { key: "specs",     icon: <Layers size={15} />,     label: "Specs" },
    { key: "location",  icon: <MapPin size={15} />,     label: "Location" },
    { key: "reviews",   icon: <Star size={15} />,       label: `Reviews (${project.ratings?.totalReviews || 0})` },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">
            <ChevronLeft size={20} /> Back to Projects
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <p className="text-slate-800 font-bold text-sm truncate">{project.projectName}</p>
          <div className="ml-auto flex gap-2">
            <button onClick={() => onEnquire(project)}
              className="text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition shadow-sm"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
              <MessageSquare size={15} /> Enquire
            </button>
            <button onClick={() => onReview(project)}
              className="text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition shadow-sm"
              style={{ background: "linear-gradient(135deg,#1e3a8a,#1e40af)" }}>
              <Star size={15} /> Review
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* ── HERO SECTION ── */}
        {/* Full Width Carousel */}
        <div className="mb-6">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900" style={{ height: 480 }}>
            {filteredMedia.length > 0 ? (
              <>
                {currentImg?.type === "video" ? (
                  <video 
                    src={currentImg?.src} 
                    className="w-full h-full object-cover"
                    controls
                    autoPlay={false}
                    controlsList="nodownload"
                  />
                ) : (
                  <img src={currentImg?.src} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {filteredMedia.length > 1 && (
                  <>
                    <button onClick={handlePrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
                      <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {filteredMedia.map((_, i) => (
                        <button key={i} onClick={() => setImgIdx(i)} className={`h-2 rounded-full transition-all ${i === imgIdx ? "bg-white w-8" : "bg-white/40 w-2"}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1e3a5f,#0f172a)" }}>
                <Building2 size={80} className="text-white/10" />
              </div>
            )}
            
            {/* Badges overlay */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>{project.projectStatus?.status}</span>
              {project.isFeatured && <span className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><Star size={10} fill="white" />Featured</span>}
              {project.isTrending && <span className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><Flame size={10} />Trending</span>}
              {project.isPremium && <span className="text-xs bg-yellow-400 text-slate-900 px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><Crown size={10} />Premium</span>}
            </div>
            
            {/* Toggle Buttons - Image and Video */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={() => { setCarouselMode("images"); setImgIdx(0); }} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors backdrop-blur-sm ${
                  (carouselMode === "images" || carouselMode === "all") 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "bg-black/50 hover:bg-black/70 text-white"
                }`}>
                <Image size={12} /> {imageCount} Photo{imageCount !== 1 ? "s" : ""}
              </button>
              {videoCount > 0 && (
                <button 
                  onClick={() => { setCarouselMode("videos"); setImgIdx(0); }} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors backdrop-blur-sm ${
                    carouselMode === "videos" 
                      ? "bg-orange-500 hover:bg-orange-600 text-white" 
                      : "bg-black/50 hover:bg-black/70 text-white"
                  }`}>
                  <Play size={12} /> {videoCount} Video{videoCount !== 1 ? "s" : ""}
                </button>
              )}
            </div>

            {/* Media type indicator */}
            {currentImg && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <span className={`text-xs bg-black/50 text-white px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1 ${
                  currentImg.type === "video" ? "bg-orange-500" : ""
                }`}>
                  {currentImg.type === "video" ? <Play size={11} /> : <Camera size={11} />}
                  {currentImg.type === "video" ? "Video" : "Photo"} {imgIdx + 1} of {filteredMedia.length}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {filteredMedia.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1 px-1">
              {filteredMedia.map((media, i) => (
                <button 
                  key={i} 
                  onClick={() => setImgIdx(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all relative ${
                    i === imgIdx ? "border-orange-500 ring-2 ring-orange-200" : "border-transparent hover:border-slate-300"
                  }`}>
                  {media.type === "video" ? (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <Play size={20} className="text-white" />
                    </div>
                  ) : (
                    <img src={media.src} alt="" className="w-full h-full object-cover" />
                  )}
                  {media.isPrimary && (
                    <span className="absolute top-1 right-1 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold">
                      <Star size={8} fill="white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── PROJECT INFO CARD (Below Carousel) ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-black text-slate-900 leading-tight">{project.projectName}</h1>
                {project.tagline && <p className="text-slate-500 text-base mt-1">{project.tagline}</p>}
                <div className="flex items-center gap-2 mt-3 text-slate-500 text-sm">
                  <MapPin size={16} className="text-orange-500 flex-shrink-0" />
                  <span>{project.location?.locality}, {project.location?.city}, {project.location?.state}</span>
                </div>
                {project.ratings?.averageRating > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Stars value={Math.round(project.ratings.averageRating)} size="sm" />
                    <span className="font-black text-amber-500">{project.ratings.averageRating}</span>
                    <span className="text-slate-400 text-xs">({project.ratings.totalReviews} reviews)</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="lg:text-right">
                <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg,#fff7ed,#fffbeb)" }}>
                  <p className="text-xs text-slate-500 font-medium">Starting From</p>
                  <p className="text-3xl font-black text-orange-600">{fmtCr(project.pricing?.priceRange?.min)}</p>
                  {project.pricing?.priceRange?.max && (
                    <p className="text-sm text-slate-500">Up to {fmtCr(project.pricing.priceRange.max)}</p>
                  )}
                  {project.pricing?.pricePerSqFt?.min && (
                    <p className="text-xs text-slate-400 mt-1">{fmtCr(project.pricing.pricePerSqFt.min)} – {fmtCr(project.pricing.pricePerSqFt.max)} per sq.ft</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4">
              {[
                { icon: <Building2 size={16} />, label: "Total Units", value: project.projectSize?.totalUnits ?? "—" },
                { icon: <Layers size={16} />, label: "Floors", value: project.projectSize?.totalFloors ?? "—" },
                { icon: <BarChart3 size={16} />, label: "Built", value: `${project.projectStatus?.completionPercentage || 0}%` },
                { icon: <Calendar size={16} />, label: "Possession", value: fmtMY(project.projectStatus?.possessionDate) },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-orange-500 mb-1">{s.icon}</div>
                  <p className="font-black text-slate-800 text-sm">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Property types */}
            {project.propertyTypes?.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-4">
                {project.propertyTypes.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg font-semibold border border-orange-100">{t}</span>
                ))}
              </div>
            )}

            {/* Approvals quick */}
            <div className="flex gap-2 flex-wrap mt-3">
              {project.approvals?.reraApproved && (
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                  <BadgeCheck size={12} /> RERA Approved
                </span>
              )}
              {project.pricing?.loanAvailable && (
                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                  <Banknote size={12} /> Loan Available
                </span>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button onClick={() => onEnquire(project)}
              className="text-white font-black py-4 rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
              <MessageSquare size={16} /> Enquire Now
            </button>
            <button onClick={() => onReview(project)}
              className="text-white font-black py-4 rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#1e3a8a,#1e40af)" }}>
              <Star size={16} /> Write Review
            </button>
            {project.media?.brochure?.url && (
              <a href={project.media.brochure.url} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl text-sm hover:bg-slate-50 hover:border-slate-300 transition col-span-2">
                <Download size={15} /> Download Brochure (PDF)
              </a>
            )}
          </div>

          {/* Developer card */}
          {project.developer && (
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              {project.developer.logo?.url ? (
                <img src={project.developer.logo.url} alt={project.developer.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#1e3a8a,#1e40af)" }}>
                  {project.developer.name?.[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-medium">Developer</p>
                <p className="font-black text-slate-800 text-lg">{project.developer.name}</p>
                {project.developer.establishedYear && <p className="text-xs text-slate-400">Est. {project.developer.establishedYear}</p>}
                <div className="flex gap-3 mt-2">
                  {project.developer.phone && (
                    <a href={`tel:${project.developer.phone}`} className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"><Phone size={11} />{project.developer.phone}</a>
                  )}
                  {project.developer.email && (
                    <a href={`mailto:${project.developer.email}`} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Mail size={11} />Email</a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-hide">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${tab === t.key ? "border-orange-500 text-orange-600 bg-orange-50/60" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                {t.icon} <span className="hidden xs:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <>
                {project.description && (
                  <p className="text-slate-600 leading-relaxed">{project.description}</p>
                )}

                {/* Progress */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between mb-2">
                    <span className="font-black text-slate-700 flex items-center gap-2"><BarChart3 size={16} className="text-orange-500" />Construction Progress</span>
                    <span className="font-black text-orange-500">{project.projectStatus?.completionPercentage || 0}%</span>
                  </div>
                  <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full rounded-full transition-all" style={{ width: `${project.projectStatus?.completionPercentage || 0}%`, background: "linear-gradient(to right,#f97316,#ea580c)" }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>Launch: {fmtMY(project.projectStatus?.launchDate)}</span>
                    <span>Start: {fmtMY(project.projectStatus?.startDate)}</span>
                    <span>Possession: {fmtMY(project.projectStatus?.possessionDate)}</span>
                  </div>
                </div>

                {/* Configurations */}
                {project.configurations?.length > 0 && (
                  <div>
                    <h3 className="font-black text-slate-800 mb-4 text-lg flex items-center gap-2">
                      <div className="w-7 h-7 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600"><Layers size={15} /></div>
                      Unit Configurations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {project.configurations.map((c) => (
                        <div key={c._id} className="p-5 rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors bg-white shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="text-2xl font-black text-slate-800">{c.type}</span>
                              <div className="flex gap-3 mt-2 flex-wrap text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><Bed size={12} />{c.bedrooms} Bed</span>
                                <span className="flex items-center gap-1"><Bath size={12} />{c.bathrooms} Bath</span>
                                {c.balconies > 0 && <span className="flex items-center gap-1"><TreePine size={12} />{c.balconies} Balcony</span>}
                                <span className="flex items-center gap-1"><Maximize2 size={12} />{c.area?.min}–{c.area?.max} {c.area?.unit}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-orange-600 text-xl">{fmtCr(c.price?.min)}</p>
                              <p className="text-xs text-slate-400">to {fmtCr(c.price?.max)}</p>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-slate-50">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-slate-400">{c.availableUnits} of {c.totalUnits} available</span>
                              <span className="font-bold text-orange-500">{Math.round(((c.totalUnits - c.availableUnits) / c.totalUnits) * 100)}% sold</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${((c.totalUnits - c.availableUnits) / c.totalUnits) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                {project.pricing && (
                  <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}>
                    <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                      <Banknote size={18} className="text-orange-400" />
                      <p className="font-black text-white text-base">Pricing & Payment</p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          ["Price Range",    `${fmtCr(project.pricing.priceRange?.min)} – ${fmtCr(project.pricing.priceRange?.max)}`],
                          ["Price / Sq.Ft",  `${fmtCr(project.pricing.pricePerSqFt?.min)} – ${fmtCr(project.pricing.pricePerSqFt?.max)}`],
                          ["Booking Amount", fmtCr(project.pricing.bookingAmount)],
                          ["EMI Starts",     project.pricing.emiStarts || "On Request"],
                        ].map(([l, v]) => (
                          <div key={l} className="bg-white/8 rounded-2xl p-4">
                            <p className="text-blue-300 text-xs font-medium">{l}</p>
                            <p className="text-white font-black text-sm mt-1">{v}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-white/8 rounded-2xl p-4">
                        <p className="text-blue-300 text-xs font-medium mb-1">Payment Plan</p>
                        <p className="text-white font-bold">{project.pricing.paymentPlan}</p>
                        {project.pricing.paymentPlanDetails && <p className="text-blue-200 text-xs mt-1">{project.pricing.paymentPlanDetails}</p>}
                      </div>
                      {!project.pricing.gstIncluded && (
                        <div className="flex items-center gap-2 text-amber-300 text-xs bg-amber-500/10 rounded-xl px-4 py-2.5">
                          <AlertCircle size={14} />GST not included. {project.pricing.registrationCharges}
                        </div>
                      )}
                      {project.pricing.additionalCharges?.length > 0 && (
                        <div className="bg-amber-500/15 rounded-2xl p-4">
                          <p className="text-amber-200 text-xs font-bold mb-2">Additional Charges</p>
                          {project.pricing.additionalCharges.map((ch) => <p key={ch} className="text-white/80 text-xs">• {ch}</p>)}
                        </div>
                      )}
                      {project.pricing.approvedBanks?.length > 0 && (
                        <div className="bg-white/8 rounded-2xl p-4">
                          <p className="text-blue-300 text-xs font-medium mb-2 flex items-center gap-1.5"><Banknote size={12} />Approved Banks</p>
                          <div className="flex gap-2 flex-wrap">
                            {project.pricing.approvedBanks.map((b) => <span key={b} className="bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-lg">{b}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Approvals */}
                {project.approvals && (
                  <div>
                    <h3 className="font-black text-slate-800 mb-4 text-lg flex items-center gap-2">
                      <div className="w-7 h-7 bg-green-100 rounded-xl flex items-center justify-center text-green-600"><BadgeCheck size={15} /></div>
                      Approvals & Certifications
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        ["RERA Approved", project.approvals.reraApproved],
                        ["Environmental Clearance", project.approvals.environmentalClearance],
                        ["Fire NOC", project.approvals.fireNOC],
                        ["Occupancy Certificate", project.approvals.occupancyCertificate],
                      ].map(([label, val]) => (
                        <div key={label} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold ${val ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                          {val ? <CheckCircle size={14} /> : <Clock size={14} />} {label}
                        </div>
                      ))}
                    </div>
                    {project.approvals.reraApproved && project.approvals.reraNumber && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-green-700 flex items-center gap-1.5"><BadgeCheck size={13} />RERA: {project.approvals.reraNumber}</span>
                        {project.approvals.reraWebsite && (
                          <a href={project.approvals.reraWebsite} target="_blank" rel="noreferrer"
                            className="text-xs text-green-600 underline hover:text-green-700 flex items-center gap-1"><Globe size={11} />Verify</a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Highlights & Why Choose */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.highlights?.length > 0 && (
                    <div>
                      <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                        <div className="w-7 h-7 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500"><Star size={14} /></div>
                        Project Highlights
                      </h3>
                      <div className="space-y-2">
                        {project.highlights.map((h) => (
                          <div key={h} className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl text-sm font-semibold text-orange-700">
                            <Sparkles size={14} className="text-orange-400 flex-shrink-0" /> {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.whyChoose?.length > 0 && (
                    <div>
                      <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><CheckCircle size={14} /></div>
                        Why Choose This Project
                      </h3>
                      <div className="space-y-2">
                        {project.whyChoose.map((w) => (
                          <div key={w} className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-semibold text-blue-700">
                            <CheckCircle size={14} className="text-blue-400 flex-shrink-0" /> {w}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {project.tags?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {project.tags.map((t) => (
                      <span key={t} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold flex items-center gap-1"><Hash size={11} />{t}</span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Eye size={22} />, v: project.stats?.views || 0, l: "Views" },
                    { icon: <MessageSquare size={22} />, v: project.stats?.enquiries || 0, l: "Enquiries" },
                    { icon: <Calendar size={22} />, v: project.stats?.siteVisits || 0, l: "Site Visits" },
                  ].map((s) => (
                    <div key={s.l} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                      <div className="flex justify-center text-orange-500 mb-2">{s.icon}</div>
                      <p className="font-black text-slate-800 text-2xl">{s.v}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── GALLERY ── */}
            {tab === "gallery" && <GalleryTab media={project.media} />}

            {/* ── AMENITIES ── */}
            {tab === "amenities" && (
              <div className="space-y-6">
                {Object.entries(project.amenities || {}).map(([cat, items]) =>
                  items?.length > 0 && (
                    <div key={cat}>
                      <h4 className="font-black text-slate-700 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">{AMENITY_ICONS[cat] || <Wrench size={15} />}</div>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)} Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <span key={item} className="px-3.5 py-2 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 shadow-sm hover:border-orange-200 transition-colors">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ── SPECS ── */}
            {tab === "specs" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {Object.entries(project.specifications || {})
                    .filter(([, v]) => v && (!Array.isArray(v) || v.length > 0))
                    .map(([key, val]) => (
                      <div key={key} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-black text-slate-400 uppercase w-28 flex-shrink-0 pt-0.5">{key}</span>
                        <span className="text-sm text-slate-700 leading-relaxed">{Array.isArray(val) ? val.join(", ") : val}</span>
                      </div>
                    ))}
                </div>
                {project.projectSize && (
                  <>
                    <h4 className="font-black text-slate-800 pt-2 flex items-center gap-2"><Building2 size={16} className="text-orange-500" />Project Size</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        ["Total Area",   `${project.projectSize.totalArea?.value} ${project.projectSize.totalArea?.unit}`],
                        ["Total Units",  project.projectSize.totalUnits],
                        ["Total Towers", project.projectSize.totalTowers],
                        ["Total Floors", project.projectSize.totalFloors],
                        ["Units / Floor",project.projectSize.unitsPerFloor],
                        ["Open Sides",   project.projectSize.openSides],
                      ].filter(([, v]) => v != null && v !== "undefined undefined").map(([l, v]) => (
                        <div key={l} className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                          <p className="text-xs text-slate-400 font-medium">{l}</p>
                          <p className="font-black text-slate-800 mt-0.5 text-lg">{v}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── LOCATION ── */}
            {tab === "location" && (
              <div className="space-y-5">
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                  <p className="font-black text-slate-800 flex items-center gap-2"><MapPin size={18} className="text-blue-500" />{project.location?.address}</p>
                  <p className="text-sm text-slate-500 mt-1 ml-7">{project.location?.locality}, {project.location?.city}, {project.location?.state} – {project.location?.pincode}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    [<Train size={20} />, "Metro",   project.location?.distanceFromMetro],
                    [<Plane size={20} />, "Airport", project.location?.distanceFromAirport],
                    [<Train size={20} />, "Railway", project.location?.distanceFromRailway],
                  ].filter(([,, d]) => d).map(([icon, label, dist]) => (
                    <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}>
                      <div className="flex justify-center text-orange-400 mb-2">{icon}</div>
                      <p className="font-black text-white text-sm">{dist}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                {project.location?.landmarkNearby?.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Landmark size={13} />Nearby Landmarks</p>
                    <div className="flex flex-wrap gap-2">
                      {project.location.landmarkNearby.map((l) => (
                        <span key={l} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1.5"><MapPin size={11} />{l}</span>
                      ))}
                    </div>
                  </div>
                )}
                {Object.entries(project.nearbyFacilities || {}).map(([cat, items]) =>
                  items?.length > 0 && (
                    <div key={cat}>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        {NEARBY_ICONS[cat] || <Navigation size={13} />}{cat}
                      </p>
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <div key={item._id} className="flex justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-slate-700 font-medium text-sm">{item.name}</span>
                            <span className="font-bold text-orange-500 text-xs bg-orange-50 px-2.5 py-0.5 rounded-lg">{item.distance}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ── REVIEWS ── */}
            {tab === "reviews" && (
              <div className="space-y-5">
                <div className="p-6 rounded-2xl border border-orange-100 flex items-center gap-6" style={{ background: "linear-gradient(135deg,#fff7ed,#fffbeb)" }}>
                  <div className="text-center flex-shrink-0">
                    <p className="text-5xl font-black text-orange-500">{project.ratings?.averageRating || 0}</p>
                    <Stars value={Math.round(project.ratings?.averageRating || 0)} size="sm" />
                    <p className="text-xs text-slate-400 mt-1">{project.ratings?.totalReviews || 0} reviews</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-700 mb-2">Enjoyed this project?</p>
                    <button onClick={() => onReview(project)}
                      className="w-full py-3 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                      <Star size={15} /> Write a Review
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {(project.reviews || []).map((r) => (
                    <div key={r._id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-orange-100 transition-colors shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                            {String(r.userId || "U").slice(-2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{r.reviewType}</p>
                            <p className="text-xs text-slate-400">{fmtDate(r.createdAt)}</p>
                          </div>
                        </div>
                        <Stars value={r.rating} size="sm" />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{r.review}</p>
                      {(r.pros?.length > 0 || r.cons?.length > 0) && (
                        <div className="flex gap-2 flex-wrap mt-3">
                          {r.pros?.map((p) => <span key={p} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full flex items-center gap-1"><ThumbsUp size={10} />{p}</span>)}
                          {r.cons?.map((c) => <span key={c} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1"><ThumbsDown size={10} />{c}</span>)}
                        </div>
                      )}
                      {r.isVerified && <p className="text-xs text-green-500 font-semibold mt-2 flex items-center gap-1"><BadgeCheck size={12} />Verified</p>}
                    </div>
                  ))}
                  {(!project.reviews || project.reviews.length === 0) && (
                    <div className="text-center py-12">
                      <MessageSquare size={48} className="mx-auto mb-3 text-slate-200" />
                      <p className="font-black text-slate-600">No reviews yet</p>
                      <p className="text-sm text-slate-400 mt-1">Be the first to share your experience!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Projects */}
        {similar.length > 0 && (
          <div className="mt-8">
            <h3 className="font-black text-slate-800 mb-4 text-xl flex items-center gap-2">
              <Building2 size={20} className="text-orange-500" /> Similar Projects
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similar.map((sp) => (
                <div key={sp._id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-orange-200 transition-colors shadow-sm cursor-pointer hover:-translate-y-1 transition-all duration-200">
                  {primaryImg(sp) ? (
                    <img src={primaryImg(sp)} alt={sp.projectName} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1e3a5f,#0f172a)" }}>
                      <Building2 size={36} className="text-white/20" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-black text-slate-800 text-sm truncate">{sp.projectName}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} />{sp.location?.city}</p>
                    <p className="text-xs font-bold text-orange-500 mt-1">{fmtCr(sp.pricing?.priceRange?.min)}+</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onClick, onEnquire }) {
  const img = primaryImg(project);
  const sc = STATUS_COLORS[project.projectStatus?.status] || { bg: "bg-slate-500", text: "text-white" };
  const videoCount = project.media?.videos?.length || 0;
  const imgCount   = project.media?.images?.length || 0;

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-1.5"
      onClick={() => onClick(project)}>
      <div className="relative overflow-hidden" style={{ height: 210 }}>
        {img ? (
          <img src={img} alt={project.projectName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1e3a5f,#0f172a)" }}>
            <Building2 size={64} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {project.isPremium  && <span className="text-xs bg-yellow-400 text-slate-900 p-1.5 rounded-full font-black shadow-sm"><Crown size={11} /></span>}
          {project.isFeatured && <span className="text-xs bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1"><Star size={10} fill="white" />Featured</span>}
          {project.isTrending && <span className="text-xs bg-red-500 text-white p-1.5 rounded-full font-bold shadow-sm"><Flame size={11} /></span>}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${sc.bg} ${sc.text}`}>{project.projectStatus?.status}</span>
        </div>
        <div className="absolute bottom-[68px] right-3 flex gap-1.5">
          {imgCount   > 0 && <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded-lg backdrop-blur-sm font-medium flex items-center gap-1"><Camera size={10} />{imgCount}</span>}
          {videoCount > 0 && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-lg font-bold flex items-center gap-1"><Play size={10} />{videoCount}</span>}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-black text-white text-lg leading-tight drop-shadow">{project.projectName}</p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-white/70 text-xs flex items-center gap-1"><MapPin size={11} />{project.location?.locality}, {project.location?.city}</p>
            {project.ratings?.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                <Star size={11} className="text-amber-300" fill="#fcd34d" />
                <span className="text-white text-xs font-bold">{project.ratings.averageRating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {project.developer?.logo?.url ? (
              <img src={project.developer.logo.url} className="w-7 h-7 rounded-lg object-cover border border-slate-100 flex-shrink-0" alt="" />
            ) : (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: "linear-gradient(135deg,#1e3a8a,#1e40af)" }}>
                {project.developer?.name?.[0] || "D"}
              </div>
            )}
            <span className="text-xs font-semibold text-slate-500 truncate">{project.developer?.name}</span>
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{project.projectType}</span>
        </div>
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-2xl font-black text-slate-800">{fmtCr(project.pricing?.priceRange?.min)}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {project.pricing?.pricePerSqFt?.min ? `${fmtCr(project.pricing.pricePerSqFt.min)}/sqft · ` : ""}onwards
            </p>
          </div>
          <div className="flex flex-wrap gap-1 justify-end max-w-[130px]">
            {project.propertyTypes?.slice(0, 3).map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-lg font-semibold border border-orange-100">{t}</span>
            ))}
          </div>
        </div>
        {project.projectStatus?.completionPercentage > 0 && (
          <div className="mb-3">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${project.projectStatus.completionPercentage}%`, background: "linear-gradient(to right,#f97316,#ea580c)" }} />
            </div>
            <div className="flex justify-between text-xs mt-1 text-slate-400">
              <span>{project.projectStatus.completionPercentage}% complete</span>
              <span>Possession: {fmtMY(project.projectStatus.possessionDate)}</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.approvals?.reraApproved && (
              <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><BadgeCheck size={10} />RERA</span>
            )}
            {project.pricing?.loanAvailable && (
              <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><Banknote size={10} />Loan</span>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onEnquire(project); }}
            className="text-xs font-black text-white px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-orange-200 flex-shrink-0 flex items-center gap-1.5"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
            Enquire <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="bg-slate-200" style={{ height: 210 }} />
      <div className="p-4 space-y-3">
        <div className="flex gap-2"><div className="w-7 h-7 bg-slate-200 rounded-lg" /><div className="h-4 bg-slate-100 rounded-full flex-1" /></div>
        <div className="h-7 bg-slate-100 rounded-full w-1/2" />
        <div className="h-1.5 bg-slate-100 rounded-full" />
        <div className="flex gap-2"><div className="h-6 bg-slate-100 rounded-xl w-16" /><div className="h-6 bg-slate-100 rounded-xl w-16" /></div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Projects() {
  const location = useLocation();
  const navigate = useNavigate();

  const [projects,   setProjects]   = useState([]);
  const [featured,   setFeatured]   = useState([]);
  const [trending,   setTrending]   = useState([]);
  const [filterOpts, setFilterOpts] = useState({ cities: [], projectTypes: [], statuses: [] });

  const [loading,   setLoading]   = useState(true);
  const [loadFeat,  setLoadFeat]  = useState(true);
  const [loadTrend, setLoadTrend] = useState(true);

  const [filters, setFilters] = useState({ search: "", city: "", projectType: "", status: "", featured: false });
  const [tab, setTab] = useState("all");

  const [detailP,   setDetailP]   = useState(null);
  const [enquireP,  setEnquireP]  = useState(null);
  const [reviewP,   setReviewP]   = useState(null);
  const [myEnqOpen, setMyEnqOpen] = useState(false);

  const [toast, setToast] = useState({ msg: "", type: "success" });
  const showToast = (msg, type = "success") => setToast({ msg, type });

  const buildQ = useCallback(() => {
    const q = new URLSearchParams();
    if (filters.search)      q.set("search",       filters.search);
    if (filters.city)        q.set("city",          filters.city);
    if (filters.projectType) q.set("projectType",   filters.projectType);
    if (filters.status)      q.set("projectStatus", filters.status);
    if (filters.featured)    q.set("isFeatured",    "true");
    return q.toString();
  }, [filters]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const q = buildQ();
      const res = await fetch(`${API_BASE}/projects${q ? `?${q}` : ""}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const d = await res.json();
      if (d.success) { setProjects(d.data || []); if (d.filterOptions) setFilterOpts(d.filterOptions); }
    } catch { showToast("Failed to load projects", "error"); }
    finally { setLoading(false); }
  }, [buildQ]);

  useEffect(() => {
    fetch(`${API_BASE}/projects/featured?limit=6`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json()).then((d) => { if (d.success) setFeatured(d.data || []); }).finally(() => setLoadFeat(false));
    fetch(`${API_BASE}/projects/trending?limit=6`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json()).then((d) => { if (d.success) setTrending(d.data || []); }).finally(() => setLoadTrend(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchProjects, 350);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    const stateProject = location.state?.openProject;
    if (stateProject && !detailP) {
      setDetailP(stateProject);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    const openProjectId = location.state?.openProjectId;
    const openProjectSlug = location.state?.openProjectSlug;
    if (detailP || (!openProjectId && !openProjectSlug)) return;

    const allProjects = [...projects, ...featured, ...trending];
    const matchedProject = allProjects.find(
      (project) =>
        (openProjectId && project?._id === openProjectId) ||
        (openProjectSlug && project?.slug === openProjectSlug)
    );

    if (matchedProject) {
      setDetailP(matchedProject);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate, detailP, projects, featured, trending]);

  const displayList = tab === "featured" ? featured : tab === "trending" ? trending : projects;
  const isLoading   = tab === "featured" ? loadFeat  : tab === "trending" ? loadTrend  : loading;
  const hasFilter   = !!(filters.search || filters.city || filters.projectType || filters.status || filters.featured);

  const handleEnquire = (p) => { setDetailP(null); setEnquireP(p); };
  const handleReview  = (p) => { setDetailP(null); setReviewP(p); };

  const PROJ_TYPES = ["Residential","Commercial","Mixed Use","Plotted Development","Villa Project","Row Houses","Industrial"];
  const STATUSES   = ["New Launch","Under Construction","Ready to Move","Nearing Completion","Booking Open","Sold Out"];

  // If detail page is open, render it full page
  if (detailP) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
          * { font-family: 'DM Sans', sans-serif; }
          @keyframes toastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
          @keyframes modalIn { from{opacity:0;transform:scale(.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
          .scrollbar-hide::-webkit-scrollbar { display:none }
          .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden }
        `}</style>
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />
        <DetailPage
          project={detailP}
          onBack={() => setDetailP(null)}
          onEnquire={handleEnquire}
          onReview={handleReview}
        />
        <EnquiryModal open={!!enquireP} onClose={() => setEnquireP(null)} project={enquireP} toast={showToast} />
        <ReviewModal  open={!!reviewP}  onClose={() => setReviewP(null)}  project={reviewP}  toast={showToast} onSuccess={fetchProjects} />
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
        @keyframes toastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .scrollbar-hide::-webkit-scrollbar { display:none }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden }
      `}</style>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%)" }}>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(to right,#f97316,#ea580c,#f97316)" }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-5" style={{ background: "#f97316", filter: "blur(60px)" }} />
          <div className="absolute -bottom-10 right-10 w-96 h-96 rounded-full opacity-5" style={{ background: "#3b82f6", filter: "blur(80px)" }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 mb-4 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors text-sm w-fit backdrop-blur-sm"
          >
            ← Back
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Find Your <span style={{ color: "#f97316" }}>Dream</span> Project
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-md">Browse curated real estate projects — featured launches, trending properties, and premium developments</p>
            </div>
            <button onClick={() => setMyEnqOpen(true)}
              className="flex items-center gap-2 text-white font-bold px-5 py-3 rounded-2xl border border-white/15 transition-all text-sm backdrop-blur-sm flex-shrink-0 hover:bg-white/15"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <List size={16} /> My Enquiries
            </button>
          </div>
          <div className="flex gap-3 mt-6 flex-wrap">
            {[
              { v: projects.length, l: "Total Projects" },
              { v: featured.length, l: "Featured" },
              { v: trending.length, l: "Trending" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10"
                style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}>
                <span className="font-black text-orange-400 text-base">{s.v}</span>
                <span className="text-slate-400 text-xs">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide items-center">
            <div className="relative flex-shrink-0 flex-1 min-w-[170px] max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                placeholder="Search project, city..." className={`${InpCls} pl-9`} />
            </div>
            {filterOpts.cities?.length > 0 && (
              <select value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))} className={`${SelCls} flex-shrink-0 min-w-[100px]`}>
                <option value="">All Cities</option>
                {filterOpts.cities.map((c) => <option key={c._id} value={c._id}>{c._id} ({c.count})</option>)}
              </select>
            )}
            <select value={filters.projectType} onChange={(e) => setFilters((p) => ({ ...p, projectType: e.target.value }))} className={`${SelCls} flex-shrink-0 min-w-[120px]`}>
              <option value="">All Types</option>
              {PROJ_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} className={`${SelCls} flex-shrink-0 min-w-[155px]`}>
              <option value="">All Status</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setFilters((p) => ({ ...p, featured: !p.featured }))}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${filters.featured ? "text-white border-orange-500 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-orange-300"}`}
              style={filters.featured ? { background: "linear-gradient(135deg,#f97316,#ea580c)" } : {}}>
              <Star size={14} fill={filters.featured ? "white" : "none"} /> Featured
            </button>
            {hasFilter && (
              <button onClick={() => setFilters({ search: "", city: "", projectType: "", status: "", featured: false })}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 bg-white transition-colors flex items-center gap-1.5">
                <RotateCcw size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab Switcher */}
        <div className="flex gap-1.5 mb-6 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
          {[
            { key: "all",      label: "All Projects", icon: <LayoutGrid size={15} />, count: projects.length },
            { key: "featured", label: "Featured",     icon: <Star size={15} />,       count: featured.length },
            { key: "trending", label: "Trending",     icon: <TrendingUp size={15} />, count: trending.length },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.key ? "text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}
              style={tab === t.key ? { background: "linear-gradient(135deg,#f97316,#ea580c)" } : {}}>
              {t.icon} {t.label}
              {t.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${tab === t.key ? "bg-white/20" : "bg-slate-100"}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Featured spotlight */}
        {tab === "all" && !hasFilter && featured.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Star size={22} className="text-orange-500" fill="#f97316" />
              <h2 className="text-xl font-black text-slate-800">Featured Projects</h2>
              <span className="px-2.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-black">{featured.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(loadFeat ? [1,2,3] : featured.slice(0,3)).map((p) =>
                loadFeat ? <Skeleton key={p} /> : <ProjectCard key={p._id} project={p} onClick={setDetailP} onEnquire={handleEnquire} />
              )}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            {tab === "featured" ? <Star size={22} className="text-orange-500" fill="#f97316" /> : tab === "trending" ? <TrendingUp size={22} className="text-red-500" /> : <Building2 size={22} className="text-slate-600" />}
            <h2 className="text-xl font-black text-slate-800">
              {tab === "featured" ? "Featured Projects" : tab === "trending" ? "Trending Projects" : "All Projects"}
            </h2>
            <span className="px-2.5 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs font-black">{displayList.length}</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map((i) => <Skeleton key={i} />)}
            </div>
          ) : displayList.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-slate-100">
                <Building2 size={44} className="text-slate-200" />
              </div>
              <p className="font-black text-slate-700 text-xl">No Projects Found</p>
              <p className="text-slate-400 mt-2 text-sm">{hasFilter ? "Try adjusting your search filters" : "No projects available right now"}</p>
              {hasFilter && (
                <button onClick={() => setFilters({ search: "", city: "", projectType: "", status: "", featured: false })}
                  className="mt-5 text-white font-bold px-7 py-3 rounded-2xl text-sm transition shadow-md flex items-center gap-2 mx-auto"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                  <RotateCcw size={15} /> Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayList.map((p) => <ProjectCard key={p._id} project={p} onClick={setDetailP} onEnquire={handleEnquire} />)}
            </div>
          )}
        </div>
      </div>

      <EnquiryModal  open={!!enquireP}  onClose={() => setEnquireP(null)}  project={enquireP}  toast={showToast} />
      <ReviewModal   open={!!reviewP}   onClose={() => setReviewP(null)}   project={reviewP}   toast={showToast} onSuccess={fetchProjects} />
      <MyEnquiriesModal open={myEnqOpen} onClose={() => setMyEnqOpen(false)} />
    </div>
  );
}


