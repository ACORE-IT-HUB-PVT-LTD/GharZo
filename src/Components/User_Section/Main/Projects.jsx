import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE = "https://api.gharzoreality.com/api";
const getToken = () => localStorage.getItem("usertoken");
const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtPrice = (n) => {
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—";

const PRIMARY_IMG = (project) =>
  project?.media?.images?.find((i) => i.isPrimary)?.url ||
  project?.media?.images?.[0]?.url ||
  null;

const STATUS_COLORS = {
  "New Launch": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Under Construction": "bg-amber-100 text-amber-700 border-amber-200",
  "Ready to Move": "bg-blue-100 text-blue-700 border-blue-200",
  "Nearing Completion": "bg-orange-100 text-orange-700 border-orange-200",
  "Booking Open": "bg-purple-100 text-purple-700 border-purple-200",
  "Sold Out": "bg-slate-100 text-slate-500 border-slate-200",
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return (
    <div className={`fixed top-5 right-5 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white animate-toast-in ${type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
      <span className="text-lg">{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, wide, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[92vh] overflow-y-auto animate-modal-in`}>
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm flex items-center justify-between px-7 py-5 border-b border-slate-100 rounded-t-3xl z-10">
          <h3 className="text-xl font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors font-bold">✕</button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </div>
    </div>
  );
}

// ─── STAR RATING ─────────────────────────────────────────────────────────────
function StarRating({ value, onChange, size = "md" }) {
  const [hover, setHover] = useState(0);
  const s = size === "lg" ? "text-3xl" : "text-xl";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(star)}
          className={`${s} transition-transform ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}>
          <span className={(hover || value) >= star ? "text-amber-400" : "text-slate-200"}>★</span>
        </button>
      ))}
    </div>
  );
}

// ─── ENQUIRY MODAL ────────────────────────────────────────────────────────────
function EnquiryModal({ open, onClose, project, toast }) {
  const [form, setForm] = useState({
    configurationType: "",
    budgetMin: "",
    budgetMax: "",
    purposeOfBuying: "Self Use",
    message: "",
    preferredContactMethod: "WhatsApp",
    preferredTimeSlot: "Evening (5PM-9PM)",
    siteVisitRequested: false,
    preferredDate: "",
    preferredTime: "Morning (9AM-12PM)",
    numberOfPeople: 1,
    mobileNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const configTypes = project?.configurations?.map((c) => c.type) || project?.propertyTypes || [];
  const PURPOSES = ["Self Use", "Investment", "Rental Income", "Resale"];
  const CONTACT_METHODS = ["Phone", "WhatsApp", "Email", "Any"];
  const TIME_SLOTS = ["Morning (9AM-12PM)", "Afternoon (12PM-4PM)", "Evening (5PM-9PM)", "Any Time"];
  const VISIT_TIMES = ["Morning (9AM-12PM)", "Afternoon (12PM-4PM)", "Evening (5PM-9PM)"];

  const submit = async () => {
    if (!form.configurationType) { toast("Please select configuration type", "error"); return; }
    if (!form.mobileNumber || form.mobileNumber.length < 10) { toast("Please enter a valid mobile number", "error"); return; }
    setLoading(true);
    try {
      const body = {
        projectId: project._id,
        interestedIn: {
          configurationType: form.configurationType,
          purposeOfBuying: form.purposeOfBuying,
          ...(form.budgetMin && form.budgetMax && {
            budgetRange: { min: Number(form.budgetMin), max: Number(form.budgetMax) }
          }),
        },
        message: form.message,
        preferredContactMethod: form.preferredContactMethod,
        preferredTimeSlot: form.preferredTimeSlot,
        siteVisitRequested: form.siteVisitRequested,
        mobileNumber: form.mobileNumber,
        ...(form.siteVisitRequested && {
          siteVisitDetails: {
            preferredDate: form.preferredDate,
            preferredTime: form.preferredTime,
            numberOfPeople: Number(form.numberOfPeople),
          }
        }),
      };
      const res = await fetch(`${API_BASE}/project-enquiries/create`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) { toast("Enquiry submitted! Team will contact you soon.", "success"); onClose(); }
      else throw new Error(data.message);
    } catch (e) { toast(e.message || "Failed to submit enquiry", "error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Enquiry">
      {project && (
        <div className="space-y-5">
          {/* Project Preview */}
          <div className="flex gap-3 p-4 bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl border border-orange-100">
            {PRIMARY_IMG(project) && (
              <img src={PRIMARY_IMG(project)} alt={project.projectName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            )}
            <div>
              <p className="font-bold text-slate-800">{project.projectName}</p>
              <p className="text-xs text-slate-500">{project.location?.city}, {project.location?.state}</p>
              <p className="text-sm font-semibold text-orange-600 mt-0.5">{fmtPrice(project.pricing?.priceRange?.min)} – {fmtPrice(project.pricing?.priceRange?.max)}</p>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Mobile Number <span className="text-orange-500">*</span></label>
            <input 
              type="tel" 
              value={form.mobileNumber} 
              onChange={(e) => f("mobileNumber")(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter your mobile number"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 focus:bg-white transition"
              maxLength={10}
            />
            <p className="text-xs text-slate-400 mt-1">We'll contact you on this number</p>
          </div>

          {/* Config Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Configuration Type <span className="text-orange-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {configTypes.map((t) => (
                <button key={t} onClick={() => f("configurationType")(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${form.configurationType === t ? "bg-orange-500 text-white border-orange-500 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Budget Min</label>
              <input type="number" value={form.budgetMin} onChange={(e) => f("budgetMin")(e.target.value)}
                placeholder="e.g. 8500000" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 focus:bg-white transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Budget Max</label>
              <input type="number" value={form.budgetMax} onChange={(e) => f("budgetMax")(e.target.value)}
                placeholder="e.g. 14000000" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 focus:bg-white transition" />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Purpose of Buying</label>
            <div className="flex flex-wrap gap-2">
              {PURPOSES.map((p) => (
                <button key={p} onClick={() => f("purposeOfBuying")(p)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${form.purposeOfBuying === p ? "bg-blue-900 text-white border-blue-900" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Message</label>
            <textarea value={form.message} onChange={(e) => f("message")(e.target.value)} rows={3}
              placeholder="Share your requirements..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none bg-slate-50 focus:bg-white transition" />
          </div>

          {/* Contact Preference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Preferred Contact</label>
              <select value={form.preferredContactMethod} onChange={(e) => f("preferredContactMethod")(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50">
                {CONTACT_METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Best Time to Call</label>
              <select value={form.preferredTimeSlot} onChange={(e) => f("preferredTimeSlot")(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50">
                {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Site Visit */}
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
            <input type="checkbox" checked={form.siteVisitRequested} onChange={(e) => setForm((p) => ({ ...p, siteVisitRequested: e.target.checked }))}
              className="w-5 h-5 accent-orange-500" />
            <div>
              <p className="font-semibold text-slate-700 text-sm">Request a Site Visit</p>
              <p className="text-xs text-slate-400">Our team will arrange a visit to the project</p>
            </div>
          </label>

          {form.siteVisitRequested && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Preferred Date</label>
                <input type="date" value={form.preferredDate} onChange={(e) => f("preferredDate")(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Preferred Time</label>
                <select value={form.preferredTime} onChange={(e) => f("preferredTime")(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                  {VISIT_TIMES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Number of People</label>
                <input type="number" min={1} max={10} value={form.numberOfPeople} onChange={(e) => f("numberOfPeople")(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
              </div>
            </div>
          )}

          <button onClick={submit} disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg hover:shadow-orange-300 disabled:opacity-60 disabled:cursor-not-allowed text-base">
            {loading ? "Submitting..." : "Submit Enquiry →"}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── REVIEW MODAL ─────────────────────────────────────────────────────────────
function ReviewModal({ open, onClose, project, toast, onSuccess }) {
  const [form, setForm] = useState({ rating: 0, review: "", pros: "", cons: "", reviewType: "Buyer" });
  const [loading, setLoading] = useState(false);
  const REVIEW_TYPES = ["Buyer", "Site Visitor", "Investor", "Tenant"];

  const submit = async () => {
    if (!form.rating) { toast("Please select a rating", "error"); return; }
    if (!form.review.trim()) { toast("Please write a review", "error"); return; }
    setLoading(true);
    try {
      const body = {
        rating: form.rating,
        review: form.review,
        reviewType: form.reviewType,
        pros: form.pros ? form.pros.split(",").map((s) => s.trim()).filter(Boolean) : [],
        cons: form.cons ? form.cons.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      const res = await fetch(`${API_BASE}/projects/${project._id}/review`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) { toast("Review submitted!", "success"); onSuccess && onSuccess(); onClose(); }
      else throw new Error(data.message);
    } catch (e) { toast(e.message || "Failed to submit review", "error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Write a Review">
      {project && (
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-sm text-slate-500">Your overall rating</p>
            <StarRating value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} size="lg" />
            <p className="text-lg font-black text-slate-700">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating] || ""}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Review Type</label>
            <div className="flex gap-2 flex-wrap">
              {REVIEW_TYPES.map((t) => (
                <button key={t} onClick={() => setForm((p) => ({ ...p, reviewType: t }))}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${form.reviewType === t ? "bg-blue-900 text-white border-blue-900" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Your Review <span className="text-orange-500">*</span></label>
            <textarea value={form.review} onChange={(e) => setForm((p) => ({ ...p, review: e.target.value }))} rows={4}
              placeholder="Share your experience with this project..." className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none bg-slate-50 focus:bg-white transition" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">✅ Pros (comma separated)</label>
              <input value={form.pros} onChange={(e) => setForm((p) => ({ ...p, pros: e.target.value }))}
                placeholder="Great location, Good amenities" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 focus:bg-white transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-red-500 uppercase tracking-widest mb-1.5">❌ Cons (comma separated)</label>
              <input value={form.cons} onChange={(e) => setForm((p) => ({ ...p, cons: e.target.value }))}
                placeholder="High price, Parking issues" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-slate-50 focus:bg-white transition" />
            </div>
          </div>

          <button onClick={submit} disabled={loading}
            className="w-full bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg disabled:opacity-60 text-base">
            {loading ? "Submitting..." : "Submit Review →"}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── PROJECT DETAIL MODAL ─────────────────────────────────────────────────────
function ProjectDetailModal({ open, onClose, project, onEnquire, onReview, toast }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeImg, setActiveImg] = useState(0);
  const [similarProjects, setSimilarProjects] = useState([]);

  useEffect(() => {
    if (open && project?._id) {
      fetch(`${API_BASE}/projects/${project._id}/similar?limit=4`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      }).then((r) => r.json()).then((d) => { if (d.success) setSimilarProjects(d.data || []); });
    }
  }, [open, project?._id]);

  if (!open || !project) return null;

  const images = project.media?.images || [];
  const videos = project.media?.videos || [];
  const hasMedia = images.length > 0 || videos.length > 0;
  const TABS = ["overview", "amenities", "specs", "location", "reviews"];

  const AmenityChip = ({ icon, label }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-600">
      {icon} {label}
    </span>
  );

  const amenityIcons = {
    basic: "🏠", premium: "✨", sports: "🏸", security: "🔒", convenience: "🛒", entertainment: "🎮", eco: "🌱"
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-stretch justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-slide-from-right">
        {/* Header Image/Video */}
        <div className="relative h-72 bg-slate-900 overflow-hidden flex-shrink-0">
          {hasMedia ? (
            <>
              {/* Show video if available and active, otherwise show images */}
              {videos.length > 0 && activeImg < videos.length ? (
                <div className="w-full h-full relative">
                  <video 
                    src={videos[activeImg]?.url} 
                    className="w-full h-full object-cover opacity-90"
                    controls 
                    autoPlay 
                    muted 
                    loop
                    playsInline
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      ▶ Video
                    </span>
                  </div>
                </div>
              ) : (
                <img src={images[activeImg >= images.length ? 0 : activeImg]?.url} alt={project.projectName} className="w-full h-full object-cover opacity-90" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              
              {/* Media Tabs - Show both images and videos */}
              {(images.length > 1 || videos.length > 0) && (
                <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap max-w-[80%]">
                  {/* Video thumbnails */}
                  {videos.map((_, i) => (
                    <button 
                      key={`video-${i}`} 
                      onClick={() => setActiveImg(i)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                        activeImg === i && activeImg < videos.length 
                          ? "bg-red-500 text-white" 
                          : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                      }`}
                    >
                      ▶ Video {i + 1}
                    </button>
                  ))}
                  {/* Image thumbnails */}
                  {images.map((_, i) => (
                    <button 
                      key={`img-${i}`} 
                      onClick={() => setActiveImg(images.length > 0 && videos.length > 0 ? images.length + i : i)}
                      className={`w-6 h-6 rounded-full transition-all ${
                        activeImg === (images.length > 0 && videos.length > 0 ? images.length + i : i) 
                          ? "bg-white w-8" 
                          : "bg-white/50"
                      }`} 
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <span className="text-6xl opacity-30">🏢</span>
            </div>
          )}
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition font-bold">✕</button>
          {/* Project Name Overlay */}
          <div className="absolute bottom-5 left-5 right-16">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {project.isFeatured && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">⭐ Featured</span>}
              {project.isPremium && <span className="text-xs bg-yellow-400 text-slate-800 px-2 py-0.5 rounded-full font-bold">👑 Premium</span>}
              {project.isTrending && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">🔥 Trending</span>}
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">{project.projectName}</h2>
            <p className="text-white/80 text-sm">{project.tagline}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 border-b border-slate-100">
          {[
            { label: "Price From", value: fmtPrice(project.pricing?.priceRange?.min) },
            { label: "Possession", value: fmtDate(project.projectStatus?.possessionDate) },
            { label: "Completion", value: `${project.projectStatus?.completionPercentage || 0}%` },
          ].map((stat) => (
            <div key={stat.label} className="py-4 px-4 text-center border-r last:border-r-0 border-slate-100">
              <p className="font-black text-slate-800 text-lg">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 px-5 py-4 border-b border-slate-100">
          <button onClick={() => onEnquire(project)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-2xl text-sm hover:from-orange-400 hover:to-orange-500 transition shadow-md hover:shadow-orange-200">
            📩 Enquire Now
          </button>
          <button onClick={() => onReview(project)}
            className="flex-1 bg-gradient-to-r from-blue-800 to-blue-900 text-white font-bold py-3 rounded-2xl text-sm hover:from-blue-700 hover:to-blue-800 transition shadow-md">
            ✍️ Write Review
          </button>
          {project.media?.brochure?.url && (
            <a href={project.media.brochure.url} target="_blank" rel="noreferrer"
              className="px-4 bg-slate-50 border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl text-sm hover:bg-slate-100 transition flex items-center gap-1">
              📄
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-bold capitalize whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? "border-orange-500 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <div>
                <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${STATUS_COLORS[project.projectStatus?.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                  🏗️ {project.projectStatus?.status}
                </span>
                {project.approvals?.reraApproved && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200">✅ RERA: {project.approvals.reraNumber}</span>
                )}
                {project.projectType && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">🏠 {project.projectType}</span>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">Construction Progress</span>
                  <span className="text-sm font-black text-orange-500">{project.projectStatus?.completionPercentage || 0}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                    style={{ width: `${project.projectStatus?.completionPercentage || 0}%` }} />
                </div>
              </div>

              {/* Configurations */}
              {project.configurations?.length > 0 && (
                <div>
                  <h4 className="font-black text-slate-800 mb-3">Configurations</h4>
                  <div className="space-y-3">
                    {project.configurations.map((c) => (
                      <div key={c._id} className="p-4 bg-gradient-to-r from-slate-50 to-orange-50/30 rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-black text-slate-800 text-lg">{c.type}</span>
                            <div className="flex gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs text-slate-500">📐 {c.area?.min}–{c.area?.max} {c.area?.unit}</span>
                              <span className="text-xs text-slate-500">🛏 {c.bedrooms} Bed</span>
                              <span className="text-xs text-slate-500">🚿 {c.bathrooms} Bath</span>
                              {c.balconies > 0 && <span className="text-xs text-slate-500">🌿 {c.balconies} Balcony</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-orange-600">{fmtPrice(c.price?.min)}</p>
                            <p className="text-xs text-slate-400">to {fmtPrice(c.price?.max)}</p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                          <span>{c.availableUnits} / {c.totalUnits} units available</span>
                          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-400 rounded-full" style={{ width: `${((c.totalUnits - c.availableUnits) / c.totalUnits) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Info */}
              {project.pricing && (
                <div className="p-5 bg-blue-900 rounded-2xl text-white">
                  <h4 className="font-black mb-3 text-lg">💰 Pricing & Payment</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["Price Range", `${fmtPrice(project.pricing.priceRange?.min)} – ${fmtPrice(project.pricing.priceRange?.max)}`],
                      ["Price/Sq.Ft", `${fmtPrice(project.pricing.pricePerSqFt?.min)} – ${fmtPrice(project.pricing.pricePerSqFt?.max)}`],
                      ["Booking Amount", fmtPrice(project.pricing.bookingAmount)],
                      ["EMI Starts", project.pricing.emiStarts || "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-white/10 rounded-xl p-3">
                        <p className="text-blue-200 text-xs">{label}</p>
                        <p className="font-bold mt-0.5 text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm text-blue-200 font-medium">{project.pricing.paymentPlan} · {project.pricing.paymentPlanDetails}</p>
                    {project.pricing.approvedBanks?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {project.pricing.approvedBanks.map((b) => (
                          <span key={b} className="px-2 py-1 bg-white/10 rounded-lg text-xs font-semibold">{b}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {project.highlights?.length > 0 && (
                <div>
                  <h4 className="font-black text-slate-800 mb-3">✨ Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.highlights.map((h) => (
                      <span key={h} className="px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl text-xs font-semibold text-orange-700">✦ {h}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["👁️", project.stats?.views, "Views"],
                  ["💬", project.stats?.enquiries, "Enquiries"],
                  ["📅", project.stats?.siteVisits, "Site Visits"],
                ].map(([icon, val, label]) => (
                  <div key={label} className="bg-slate-50 rounded-2xl p-3 text-center">
                    <p className="text-xl">{icon}</p>
                    <p className="font-black text-slate-800 text-lg">{val || 0}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* AMENITIES TAB */}
          {activeTab === "amenities" && (
            <div className="space-y-5">
              {Object.entries(project.amenities || {}).map(([cat, items]) =>
                items?.length > 0 && (
                  <div key={cat}>
                    <h4 className="font-black text-slate-700 mb-2.5 capitalize flex items-center gap-2">
                      {amenityIcons[cat] || "🔧"} {cat.charAt(0).toUpperCase() + cat.slice(1)} Amenities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => <AmenityChip key={item} label={item} icon="" />)}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* SPECIFICATIONS TAB */}
          {activeTab === "specs" && (
            <div className="space-y-3">
              {Object.entries(project.specifications || {}).filter(([, v]) => v && (!Array.isArray(v) || v.length > 0)).map(([key, value]) => (
                <div key={key} className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-500 capitalize w-28 flex-shrink-0 text-sm">{key}</span>
                  <span className="text-sm text-slate-700 font-medium">{Array.isArray(value) ? value.join(", ") : value}</span>
                </div>
              ))}
              {/* Project Size */}
              {project.projectSize && (
                <div>
                  <h4 className="font-black text-slate-800 mt-4 mb-3">📐 Project Size</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Total Area", `${project.projectSize.totalArea?.value} ${project.projectSize.totalArea?.unit}`],
                      ["Total Units", project.projectSize.totalUnits],
                      ["Towers", project.projectSize.totalTowers],
                      ["Floors", project.projectSize.totalFloors],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
                        <p className="font-black text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOCATION TAB */}
          {activeTab === "location" && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">📍 {project.location?.address}</p>
                <p className="text-sm text-slate-500">{project.location?.locality}, {project.location?.city}, {project.location?.state} - {project.location?.pincode}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  ["🚇", "Metro", project.location?.distanceFromMetro],
                  ["✈️", "Airport", project.location?.distanceFromAirport],
                  ["🚂", "Railway", project.location?.distanceFromRailway],
                ].map(([icon, label, dist]) => dist && (
                  <div key={label} className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
                    <p className="text-xl">{icon}</p>
                    <p className="font-black text-blue-800 text-sm">{dist}</p>
                    <p className="text-xs text-blue-400">{label}</p>
                  </div>
                ))}
              </div>

              {project.location?.landmarkNearby?.length > 0 && (
                <div>
                  <h4 className="font-black text-slate-700 mb-2.5">🗺️ Nearby Landmarks</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.location.landmarkNearby.map((l) => (
                      <span key={l} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600">📌 {l}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby Facilities */}
              {Object.entries(project.nearbyFacilities || {}).map(([cat, items]) =>
                items?.length > 0 && (
                  <div key={cat}>
                    <h4 className="font-bold text-slate-700 mb-2 capitalize text-sm">{cat}</h4>
                    <div className="space-y-1.5">
                      {items.map((item) => (
                        <div key={item._id} className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl text-sm">
                          <span className="text-slate-700 font-medium">{item.name}</span>
                          <span className="text-orange-500 font-bold text-xs">{item.distance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <div className="space-y-5">
              {/* Rating Summary */}
              <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                <div className="text-center">
                  <p className="text-5xl font-black text-orange-500">{project.ratings?.averageRating || 0}</p>
                  <StarRating value={Math.round(project.ratings?.averageRating || 0)} />
                  <p className="text-xs text-slate-400 mt-1">{project.ratings?.totalReviews || 0} reviews</p>
                </div>
                <button onClick={() => onReview(project)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-2xl text-sm hover:from-orange-400 hover:to-orange-500 transition">
                  ✍️ Write a Review
                </button>
              </div>

              {(project.reviews || []).map((r) => (
                <div key={r._id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-orange-100 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {r.userId?.toString().slice(-2)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600">{r.reviewType}</p>
                        <p className="text-xs text-slate-400">{fmtDate(r.createdAt)}</p>
                      </div>
                    </div>
                    <StarRating value={r.rating} />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.review}</p>
                  {(r.pros?.length > 0 || r.cons?.length > 0) && (
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {r.pros?.map((p) => <span key={p} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">+ {p}</span>)}
                      {r.cons?.map((c) => <span key={c} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-medium">- {c}</span>)}
                    </div>
                  )}
                </div>
              ))}
              {(!project.reviews || project.reviews.length === 0) && (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-3xl mb-2">📝</p>
                  <p className="font-medium">No reviews yet. Be the first!</p>
                </div>
              )}
            </div>
          )}

          {/* Similar Projects */}
          {similarProjects.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-black text-slate-800 mb-3">Similar Projects</h4>
              <div className="grid grid-cols-2 gap-3">
                {similarProjects.map((sp) => (
                  <div key={sp._id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:border-orange-200 transition-colors cursor-pointer">
                    {PRIMARY_IMG(sp) ? (
                      <img src={PRIMARY_IMG(sp)} alt={sp.projectName} className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-2xl">🏢</div>
                    )}
                    <div className="p-3">
                      <p className="font-bold text-slate-800 text-sm truncate">{sp.projectName}</p>
                      <p className="text-xs text-slate-400">{sp.location?.city}</p>
                      <p className="text-xs font-bold text-orange-500 mt-0.5">{fmtPrice(sp.pricing?.priceRange?.min)}+</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MY ENQUIRIES MODAL ───────────────────────────────────────────────────────
function MyEnquiriesModal({ open, onClose }) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`${API_BASE}/project-enquiries/my-enquiries`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { if (d.success) setEnquiries(d.data || []); })
      .finally(() => setLoading(false));
  }, [open]);

  const STATUS_CHIP = {
    New: "bg-blue-50 text-blue-700 border-blue-200",
    Contacted: "bg-amber-50 text-amber-700 border-amber-200",
    "Site Visit Scheduled": "bg-purple-50 text-purple-700 border-purple-200",
    Converted: "bg-green-50 text-green-700 border-green-200",
    Closed: "bg-slate-50 text-slate-500 border-slate-200",
  };

  return (
    <Modal open={open} onClose={onClose} title="My Enquiries" wide>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-bold text-slate-600">No enquiries yet</p>
          <p className="text-sm mt-1">Submit an enquiry on any project to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div key={enq._id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-orange-200 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-mono text-slate-400">{enq.enquiryNumber}</span>
                  <h4 className="font-black text-slate-800">{enq.projectId?.projectName || "Project"}</h4>
                  <p className="text-xs text-slate-400">📍 {enq.projectId?.location?.city}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${STATUS_CHIP[enq.status] || STATUS_CHIP.New}`}>{enq.status}</span>
              </div>
              <div className="flex gap-3 flex-wrap text-xs">
                <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full font-semibold">{enq.interestedIn?.configurationType}</span>
                <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-full font-semibold">{enq.interestedIn?.purposeOfBuying}</span>
                {enq.siteVisitRequested && <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-semibold">📅 Site Visit</span>}
                <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-full">{fmtDate(enq.createdAt)}</span>
              </div>
              {enq.message && <p className="text-sm text-slate-500 mt-3 italic leading-relaxed line-clamp-2">"{enq.message}"</p>}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onClick, onEnquire }) {
  const img = PRIMARY_IMG(project);
  const status = project.projectStatus?.status;

  return (
    <div onClick={() => onClick(project)}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-52 bg-slate-900 overflow-hidden">
        {img ? (
          <img src={img} alt={project.projectName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <span className="text-5xl opacity-20">🏢</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {project.isFeatured && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">⭐ Featured</span>}
          {project.isPremium && <span className="text-xs bg-yellow-400 text-slate-800 px-2 py-0.5 rounded-full font-bold shadow-sm">👑 Premium</span>}
          {project.isTrending && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">🔥</span>}
        </div>

        {/* Status */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${STATUS_COLORS[status] || "bg-slate-50/90 text-slate-600 border-slate-200"}`}>
            {status}
          </span>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div>
            <p className="font-black text-white text-lg leading-tight">{project.projectName}</p>
            <p className="text-white/70 text-xs">📍 {project.location?.locality}, {project.location?.city}</p>
          </div>
          {project.ratings?.averageRating > 0 && (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-xl">
              <span className="text-amber-300 text-sm">★</span>
              <span className="text-white text-xs font-bold">{project.ratings.averageRating}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Developer */}
        <div className="flex items-center gap-2 mb-3">
          {project.developer?.logo?.url ? (
            <img src={project.developer.logo.url} alt={project.developer.name} className="w-7 h-7 rounded-lg object-cover border border-slate-100" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
              {project.developer?.name?.charAt(0)}
            </div>
          )}
          <span className="text-xs font-semibold text-slate-500">{project.developer?.name}</span>
        </div>

        {/* Price & Config */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xl font-black text-slate-800">{fmtPrice(project.pricing?.priceRange?.min)}</p>
            <p className="text-xs text-slate-400">to {fmtPrice(project.pricing?.priceRange?.max)}</p>
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {project.propertyTypes?.slice(0, 3).map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-lg font-semibold border border-orange-100">{t}</span>
            ))}
          </div>
        </div>

        {/* Progress */}
        {project.projectStatus?.completionPercentage > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Construction</span>
              <span className="font-bold text-orange-500">{project.projectStatus.completionPercentage}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                style={{ width: `${project.projectStatus.completionPercentage}%` }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
          <div className="flex gap-3 text-xs text-slate-400">
            <span>📐 {project.pricing?.pricePerSqFt?.min ? `${fmtPrice(project.pricing.pricePerSqFt.min)}/sqft` : "—"}</span>
            <span>🏗️ {fmtDate(project.projectStatus?.possessionDate)}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onEnquire(project); }}
            className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors border border-orange-100">
            Enquire
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, count }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-2xl font-black text-slate-800">{title}</h2>
          {count > 0 && <span className="text-sm bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full font-bold">{count}</span>}
        </div>
        {subtitle && <p className="text-sm text-slate-400 ml-9">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="h-52 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded-full w-1/2" />
        <div className="h-6 bg-slate-200 rounded-full w-3/4" />
        <div className="h-3 bg-slate-200 rounded-full w-full" />
        <div className="h-3 bg-slate-200 rounded-full w-2/3" />
      </div>
    </div>
  );
}

// ─── FILTER BAR ───────────────────────────────────────────────────────────────
function FilterBar({ filters, setFilters, filterOptions }) {
  const PROJECT_TYPES = ["Residential", "Commercial", "Mixed Use", "Plotted Development", "Villa Project", "Row Houses", "Industrial"];
  const STATUSES = ["New Launch", "Under Construction", "Ready to Move", "Nearing Completion", "Booking Open", "Sold Out"];

  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide items-center">
          {/* Search */}
          <div className="relative flex-shrink-0 flex-1 min-w-[200px] max-w-xs">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              placeholder="Search projects, city..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 focus:bg-white transition" />
          </div>

          {/* City */}
          <select value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
            className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-400 flex-shrink-0">
            <option value="">All Cities</option>
            {filterOptions.cities?.map((c) => <option key={c._id} value={c._id}>{c._id} ({c.count})</option>)}
          </select>

          {/* Type */}
          <select value={filters.projectType} onChange={(e) => setFilters((p) => ({ ...p, projectType: e.target.value }))}
            className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-400 flex-shrink-0">
            <option value="">All Types</option>
            {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>

          {/* Status */}
          <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-400 flex-shrink-0">
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>

          {/* Featured Toggle */}
          <button onClick={() => setFilters((p) => ({ ...p, featured: !p.featured }))}
            className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all ${filters.featured ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-500 border-slate-200 hover:border-orange-300"}`}>
            ⭐ Featured
          </button>

          {/* Clear */}
          {(filters.search || filters.city || filters.projectType || filters.status || filters.featured) && (
            <button onClick={() => setFilters({ search: "", city: "", projectType: "", status: "", featured: false })}
              className="flex-shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ cities: [], projectTypes: [], statuses: [] });
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const [filters, setFilters] = useState({ search: "", city: "", projectType: "", status: "", featured: false });
  const [activeTab, setActiveTab] = useState("all"); // all | featured | trending

  const [selectedProject, setSelectedProject] = useState(null);
  const [enquireProject, setEnquireProject] = useState(null);
  const [reviewProject, setReviewProject] = useState(null);
  const [myEnquiriesOpen, setMyEnquiriesOpen] = useState(false);

  const [toast, setToast] = useState({ msg: "", type: "success" });
  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Build query string
  const buildQuery = useCallback(() => {
    const q = new URLSearchParams();
    if (filters.search) q.set("search", filters.search);
    if (filters.city) q.set("city", filters.city);
    if (filters.projectType) q.set("projectType", filters.projectType);
    if (filters.status) q.set("projectStatus", filters.status);
    if (filters.featured) q.set("isFeatured", "true");
    return q.toString();
  }, [filters]);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const q = buildQuery();
      const res = await fetch(`${API_BASE}/projects${q ? `?${q}` : ""}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || []);
        if (data.filterOptions) setFilterOptions(data.filterOptions);
      }
    } catch (e) { showToast("Failed to load projects", "error"); }
    finally { setLoading(false); }
  }, [buildQuery]);

  // Fetch featured
  const fetchFeatured = useCallback(async () => {
    setLoadingFeatured(true);
    try {
      const res = await fetch(`${API_BASE}/projects/featured?limit=6`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setFeatured(data.data || []);
    } finally { setLoadingFeatured(false); }
  }, []);

  // Fetch trending
  const fetchTrending = useCallback(async () => {
    setLoadingTrending(true);
    try {
      const res = await fetch(`${API_BASE}/projects/trending?limit=6`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setTrending(data.data || []);
    } finally { setLoadingTrending(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => { fetchFeatured(); fetchTrending(); }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchProjects(), 400);
    return () => clearTimeout(t);
  }, [filters]);

  const displayProjects = activeTab === "featured" ? featured : activeTab === "trending" ? trending : projects;
  const isLoading = activeTab === "featured" ? loadingFeatured : activeTab === "trending" ? loadingTrending : loading;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Sora', sans-serif; }
        @keyframes toast-in { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
        @keyframes modal-in { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes slide-from-right { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
        .animate-toast-in { animation: toast-in 0.3s ease-out; }
        .animate-modal-in { animation: modal-in 0.25s ease-out; }
        .animate-slide-from-right { animation: slide-from-right 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />

      {/* ── HERO HEADER ── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-lg">🏗</div>
                <span className="text-slate-400 text-sm font-medium">GharZo Reality</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Discover <span className="text-orange-400">Premium</span> Projects
              </h1>
              <p className="text-slate-400 text-sm mt-2">Explore new launches, featured & trending real estate projects</p>
            </div>
            <button onClick={() => setMyEnquiriesOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold px-5 py-3 rounded-2xl border border-white/20 transition-all text-sm flex-shrink-0">
              📋 My Enquiries
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <FilterBar filters={filters} setFilters={setFilters} filterOptions={filterOptions} />

      {/* ── TABS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-slate-100 shadow-sm w-fit mb-6">
          {[
            { key: "all", label: "All Projects", count: projects.length },
            { key: "featured", label: "⭐ Featured", count: featured.length },
            { key: "trending", label: "🔥 Trending", count: trending.length },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {activeTab === "all" && (
          <>
            {/* Featured Section (inline when all tab) */}
            {featured.length > 0 && !filters.search && !filters.city && !filters.projectType && !filters.status && !filters.featured && (
              <div className="mb-8">
                <SectionHeader icon="⭐" title="Featured Projects" subtitle="Hand-picked premium developments" count={featured.length} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(loadingFeatured ? [1, 2, 3] : featured.slice(0, 3)).map((p) =>
                    loadingFeatured ? <SkeletonCard key={p} /> : <ProjectCard key={p._id} project={p} onClick={setSelectedProject} onEnquire={setEnquireProject} />
                  )}
                </div>
              </div>
            )}

            {/* All Projects */}
            <div>
              <SectionHeader icon="🏘️" title="All Projects" subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""} found`} count={projects.length} />
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : projects.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">🏚️</div>
                  <p className="font-black text-slate-700 text-lg">No projects found</p>
                  <p className="text-slate-400 text-sm mt-2">Try adjusting your filters</p>
                  <button onClick={() => setFilters({ search: "", city: "", projectType: "", status: "", featured: false })}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-colors shadow-md">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map((p) => (
                    <ProjectCard key={p._id} project={p} onClick={setSelectedProject} onEnquire={setEnquireProject} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {(activeTab === "featured" || activeTab === "trending") && (
          <div>
            <SectionHeader
              icon={activeTab === "featured" ? "⭐" : "🔥"}
              title={activeTab === "featured" ? "Featured Projects" : "Trending Projects"}
              subtitle={activeTab === "featured" ? "Premium curated developments" : "Most viewed & enquired projects"}
              count={displayProjects.length}
            />
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayProjects.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">
                  {activeTab === "featured" ? "⭐" : "🔥"}
                </div>
                <p className="font-black text-slate-700 text-lg">No {activeTab} projects yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayProjects.map((p) => (
                  <ProjectCard key={p._id} project={p} onClick={setSelectedProject} onEnquire={setEnquireProject} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DETAIL PANEL ── */}
      {selectedProject && (
        <>
          <div className="fixed inset-0 z-[85] bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
          <ProjectDetailModal
            open={!!selectedProject}
            onClose={() => setSelectedProject(null)}
            project={selectedProject}
            onEnquire={(p) => { setSelectedProject(null); setEnquireProject(p); }}
            onReview={(p) => { setSelectedProject(null); setReviewProject(p); }}
            toast={showToast}
          />
        </>
      )}

      {/* ── MODALS ── */}
      <EnquiryModal
        open={!!enquireProject}
        onClose={() => setEnquireProject(null)}
        project={enquireProject}
        toast={showToast}
      />

      <ReviewModal
        open={!!reviewProject}
        onClose={() => setReviewProject(null)}
        project={reviewProject}
        toast={showToast}
        onSuccess={fetchProjects}
      />

      <MyEnquiriesModal
        open={myEnquiriesOpen}
        onClose={() => setMyEnquiriesOpen(false)}
      />
    </div>
  );
}