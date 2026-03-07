import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://api.gharzoreality.com/api";

// ─── Token helper ─────────────────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem("usertoken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  null;

// ─── Star renderer ────────────────────────────────────────────────────────────
const Stars = ({ rating, max = 5, size = 14 }) => (
  <span className="inline-flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill="none">
        <polygon
          points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
          fill={i < Math.round(rating) ? "#f97316" : "#e5e7eb"}
          stroke={i < Math.round(rating) ? "#ea580c" : "#d1d5db"}
          strokeWidth="0.5"
        />
      </svg>
    ))}
  </span>
);

// ─── Rating label ─────────────────────────────────────────────────────────────
const ratingLabel = (r) => {
  if (r >= 4.5) return { text: "Excellent", color: "#16a34a" };
  if (r >= 4) return { text: "Very Good", color: "#2563eb" };
  if (r >= 3) return { text: "Good", color: "#d97706" };
  if (r >= 2) return { text: "Fair", color: "#ea580c" };
  return { text: "Poor", color: "#dc2626" };
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ─── Avatar ───────────────────────────────────────────────────────────────────
const colors = ["#1d4ed8","#0369a1","#047857","#7c3aed","#b45309","#be123c","#0f766e","#4338ca"];
const Avatar = ({ name, size = 44 }) => {
  const letter = (name || "U")[0].toUpperCase();
  const bg = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, minWidth: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: size * 0.42, boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
      {letter}
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ children, bg = "#eff6ff", color = "#1d4ed8", border = "#bfdbfe" }) => (
  <span style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

// ─── Respond Modal ────────────────────────────────────────────────────────────
const RespondModal = ({ review, onClose, onSuccess, token }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!text.trim()) { setErr("Please write a response."); return; }
    setLoading(true); setErr("");
    try {
      const res = await axios.post(
        `${BASE_URL}/property-reviews/${review._id}/respond`,
        { response: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) onSuccess(review._id, res.data.data.landlordResponse);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to submit. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, boxShadow: "0 24px 80px rgba(0,0,0,0.22)", overflow: "hidden" }}>
        {/* Modal Header */}
        <div style={{ background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#93c5fd", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Responding to</p>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{review.reviewerInfo?.name || review.reviewerId?.name || "Anonymous"}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Review snippet */}
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "14px 24px" }}>
          <Stars rating={review.ratings?.overall || 0} size={13} />
          {review.review?.title && <p style={{ fontWeight: 700, color: "#1e293b", marginTop: 4, fontSize: 13 }}>{review.review.title}</p>}
          {review.review?.description && <p style={{ color: "#64748b", fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>{review.review.description}</p>}
        </div>

        {/* Textarea */}
        <div style={{ padding: "20px 24px 24px" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>Your Response</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a thoughtful response to this review..."
            rows={4}
            style={{ width: "100%", border: "1.5px solid #cbd5e1", borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.6, outline: "none", resize: "vertical", fontFamily: "inherit", color: "#1e293b", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#cbd5e1"}
          />
          {err && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{err}</p>}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              onClick={submit}
              disabled={loading}
              style={{ flex: 1, background: loading ? "#93c5fd" : "linear-gradient(135deg,#1d4ed8,#1e3a8a)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s" }}
            >
              {loading ? (
                <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Submitting...</>
              ) : "Submit Response"}
            </button>
            <button onClick={onClose} style={{ padding: "11px 20px", background: "#f1f5f9", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#475569" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Review Card ──────────────────────────────────────────────────────────────
const ReviewCard = ({ review, token, onResponseAdded, index }) => {
  const [showRespond, setShowRespond] = useState(false);
  const name = review.reviewerInfo?.name || review.reviewerId?.name || "Anonymous";
  const label = ratingLabel(review.ratings?.overall || 0);

  return (
    <>
      <div
        className="review-card"
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #e8edf5",
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(30,58,138,0.07)",
          animation: `fadeUp 0.4s ease both`,
          animationDelay: `${index * 0.07}s`,
          transition: "box-shadow 0.25s, transform 0.25s",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 36px rgba(30,58,138,0.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 16px rgba(30,58,138,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {/* Card Top Strip */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${label.color}, ${label.color}88)` }} />

        <div style={{ padding: "20px 22px 18px" }}>
          {/* Reviewer Row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
            <Avatar name={name} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{name}</span>
                {review.reviewerInfo?.role && (
                  <Badge>{review.reviewerInfo.role}</Badge>
                )}
                {review.verification?.isVerified && (
                  <Badge bg="#f0fdf4" color="#15803d" border="#bbf7d0">✓ Verified</Badge>
                )}
                {review.status && (
                  <Badge
                    bg={review.status === "Approved" ? "#f0fdf4" : review.status === "Pending" ? "#fffbeb" : "#fef2f2"}
                    color={review.status === "Approved" ? "#15803d" : review.status === "Pending" ? "#b45309" : "#dc2626"}
                    border={review.status === "Approved" ? "#bbf7d0" : review.status === "Pending" ? "#fde68a" : "#fecaca"}
                  >
                    {review.status}
                  </Badge>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <Stars rating={review.ratings?.overall || 0} size={14} />
                <span style={{ fontWeight: 700, fontSize: 13, color: label.color }}>{(review.ratings?.overall || 0).toFixed(1)}</span>
                <span style={{ fontWeight: 600, fontSize: 12, color: label.color, background: label.color + "15", padding: "1px 8px", borderRadius: 99 }}>{label.text}</span>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>· {formatDate(review.reviewDate || review.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Property Tag */}
          {review.propertyId?.title && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "4px 12px", marginBottom: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}>{review.propertyId.title}</span>
              {review.propertyId.location?.city && (
                <span style={{ fontSize: 11, color: "#60a5fa" }}>· {review.propertyId.location.city}</span>
              )}
            </div>
          )}

          {/* Sub-ratings */}
          {review.ratings && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {[["📍", "Location", review.ratings.location], ["✨", "Cleanliness", review.ratings.cleanliness], ["🏠", "Amenities", review.ratings.amenities]].filter(([,, v]) => v > 0).map(([icon, label, val]) => (
                <span key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#475569" }}>
                  {icon} {label}: <span style={{ color: "#f97316" }}>{val}/5</span>
                </span>
              ))}
            </div>
          )}

          {/* Title + Description */}
          {review.review?.title && (
            <h4 style={{ fontWeight: 800, fontSize: 14, color: "#1e293b", marginBottom: 5 }}>{review.review.title}</h4>
          )}
          {review.review?.description && (
            <p style={{ color: "#475569", fontSize: 13.5, lineHeight: 1.65, marginBottom: 12 }}>{review.review.description}</p>
          )}

          {/* Pros / Cons */}
          {review.review?.pros?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Pros</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {review.review.pros.map((p, i) => <span key={i} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 99, padding: "2px 10px", fontSize: 11, color: "#15803d", fontWeight: 600 }}>+ {p}</span>)}
              </div>
            </div>
          )}
          {review.review?.cons?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Cons</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {review.review.cons.map((c, i) => <span key={i} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 99, padding: "2px 10px", fontSize: 11, color: "#dc2626", fontWeight: 600 }}>– {c}</span>)}
              </div>
            </div>
          )}

          {/* Tags */}
          {review.review?.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
              {review.review.tags.map((t, i) => <span key={i} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 99, padding: "2px 10px", fontSize: 11, color: "#3b82f6", fontWeight: 600 }}>#{t}</span>)}
            </div>
          )}

          {/* Bottom row */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {review.wouldRecommend !== undefined && (
                <span style={{ fontSize: 12, fontWeight: 600, color: review.wouldRecommend ? "#16a34a" : "#dc2626" }}>
                  {review.wouldRecommend ? "✓ Would recommend" : "✗ Would not recommend"}
                </span>
              )}
              {review.helpfulVotes?.helpful > 0 && (
                <span style={{ fontSize: 11, color: "#94a3b8" }}>👍 {review.helpfulVotes.helpful} helpful</span>
              )}
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{review.reviewNumber}</span>
          </div>
        </div>

        {/* Landlord Response Section */}
        {review.landlordResponse?.responded ? (
          <div style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderTop: "1px solid #bbf7d0", padding: "14px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 12, color: "#15803d" }}>Owner Response</span>
              {review.landlordResponse.respondedBy?.name && (
                <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>by {review.landlordResponse.respondedBy.name}</span>
              )}
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#86efac" }}>{formatDate(review.landlordResponse.respondedAt)}</span>
            </div>
            <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6 }}>{review.landlordResponse.response}</p>
          </div>
        ) : (
          <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 22px", background: "#fafbfc" }}>
            <button
              onClick={() => setShowRespond(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#1d4ed8,#1e3a8a)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,58,138,0.25)", transition: "opacity 0.2s, transform 0.2s" }}
              onMouseEnter={e => e.target.style.opacity = "0.9"}
              onMouseLeave={e => e.target.style.opacity = "1"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
              Reply to Review
            </button>
          </div>
        )}
      </div>

      {showRespond && (
        <RespondModal
          review={review}
          token={token}
          onClose={() => setShowRespond(false)}
          onSuccess={(id, resp) => {
            onResponseAdded(id, resp);
            setShowRespond(false);
          }}
        />
      )}
    </>
  );
};

// ─── Stat Box ─────────────────────────────────────────────────────────────────
const StatBox = ({ value, label, color = "#1d4ed8" }) => (
  <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 20px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", textAlign: "center", minWidth: 80 }}>
    <p style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterReplied, setFilterReplied] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const token = getToken();

  const fetchReviews = async () => {
    if (!token) { setError("No auth token found. Please login."); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/property-reviews/landlord`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setReviews(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load reviews.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleResponseAdded = (reviewId, landlordResponse) => {
    setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, landlordResponse } : r));
  };

  // ── Derived stats ──
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + (r.ratings?.overall || 0), 0) / reviews.length : 0;
  const repliedCount = reviews.filter(r => r.landlordResponse?.responded).length;
  const recommendCount = reviews.filter(r => r.wouldRecommend).length;

  // ── Filtered & Sorted ──
  const processed = reviews
    .filter(r => {
      const nameMatch = (r.reviewerInfo?.name || r.reviewerId?.name || "").toLowerCase().includes(search.toLowerCase());
      const propMatch = (r.propertyId?.title || "").toLowerCase().includes(search.toLowerCase());
      const descMatch = (r.review?.description || "").toLowerCase().includes(search.toLowerCase());
      if (search && !nameMatch && !propMatch && !descMatch) return false;
      if (filterRating !== "all" && Math.round(r.ratings?.overall || 0) !== parseInt(filterRating)) return false;
      if (filterReplied === "replied" && !r.landlordResponse?.responded) return false;
      if (filterReplied === "pending" && r.landlordResponse?.responded) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.reviewDate || b.createdAt) - new Date(a.reviewDate || a.createdAt);
      if (sortBy === "oldest") return new Date(a.reviewDate || a.createdAt) - new Date(b.reviewDate || b.createdAt);
      if (sortBy === "highest") return (b.ratings?.overall || 0) - (a.ratings?.overall || 0);
      if (sortBy === "lowest") return (a.ratings?.overall || 0) - (b.ratings?.overall || 0);
      return 0;
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        .all-reviews-root { font-family: 'DM Sans', sans-serif; }
        .all-reviews-root h1, .all-reviews-root h2, .all-reviews-root h3, .all-reviews-root h4 { font-family: 'Sora', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        .filter-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2364748b'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px !important; }
        .review-card:hover { }
        @media (max-width: 640px) {
          .stats-row { flex-wrap: wrap !important; }
          .filters-row { flex-direction: column !important; }
        }
      `}</style>

      <div className="all-reviews-root" style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f4ff 0%,#f8fafc 50%,#fff7f0 100%)" }}>

        {/* ── Hero Header ── */}
        <div style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#1e40af 100%)", position: "relative", overflow: "hidden" }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: "30%", width: 160, height: 160, borderRadius: "50%", background: "rgba(251,146,60,0.08)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "20%", left: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 20px 32px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(251,146,60,0.18)", border: "1px solid rgba(251,146,60,0.3)", borderRadius: 99, padding: "4px 14px", marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>⭐</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.1em", textTransform: "uppercase" }}>Review Dashboard</span>
                </div>
                <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, fontFamily: "Sora,sans-serif" }}>
                  All Property Reviews
                </h1>
                <p style={{ color: "#93c5fd", fontSize: 14, marginTop: 6 }}>Manage and respond to tenant feedback</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatBox value={reviews.length} label="Total Reviews" />
              <StatBox value={avgRating > 0 ? avgRating.toFixed(1) : "—"} label="Avg Rating" />
              <StatBox value={repliedCount} label="Replied" />
              <StatBox value={reviews.length - repliedCount} label="Pending Reply" />
              <StatBox value={reviews.length ? Math.round((recommendCount / reviews.length) * 100) + "%" : "—"} label="Recommend" />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 48px" }}>

          {/* ── Filters Bar ── */}
          <div className="filters-row" style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, property, review..."
                style={{ width: "100%", paddingLeft: 36, paddingRight: 14, height: 42, border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 13, outline: "none", color: "#1e293b", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", fontFamily: "DM Sans, sans-serif", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* Rating filter */}
            <select value={filterRating} onChange={e => setFilterRating(e.target.value)} className="filter-select"
              style={{ height: 42, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "0 28px 0 14px", fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "DM Sans, sans-serif", outline: "none" }}>
              <option value="all">All Ratings</option>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>)}
            </select>

            {/* Reply filter */}
            <select value={filterReplied} onChange={e => setFilterReplied(e.target.value)} className="filter-select"
              style={{ height: 42, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "0 28px 0 14px", fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "DM Sans, sans-serif", outline: "none" }}>
              <option value="all">All Status</option>
              <option value="replied">Replied</option>
              <option value="pending">Pending Reply</option>
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select"
              style={{ height: 42, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "0 28px 0 14px", fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "DM Sans, sans-serif", outline: "none" }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          {/* ── Results count ── */}
          {!loading && !error && (
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16, fontWeight: 600 }}>
              Showing <span style={{ color: "#1d4ed8" }}>{processed.length}</span> of {reviews.length} reviews
              {search && <span> for "<span style={{ color: "#f97316" }}>{search}</span>"</span>}
            </p>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
              <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTopColor: "#1d4ed8", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
              <p style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>Loading reviews...</p>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #fecaca", padding: "40px 24px", textAlign: "center", boxShadow: "0 2px 16px rgba(220,38,38,0.06)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#dc2626"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              <p style={{ fontWeight: 800, color: "#1e293b", fontSize: 16, marginBottom: 6 }}>Failed to Load Reviews</p>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{error}</p>
              <button onClick={fetchReviews} style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Try Again</button>
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && !error && processed.length === 0 && (
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e8edf5", padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontWeight: 800, color: "#1e293b", fontSize: 17, marginBottom: 6 }}>
                {reviews.length === 0 ? "No Reviews Yet" : "No Matching Reviews"}
              </p>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                {reviews.length === 0 ? "Reviews from your tenants will appear here." : "Try adjusting your search or filters."}
              </p>
              {(search || filterRating !== "all" || filterReplied !== "all") && (
                <button onClick={() => { setSearch(""); setFilterRating("all"); setFilterReplied("all"); }}
                  style={{ marginTop: 16, background: "#eff6ff", color: "#1d4ed8", border: "none", borderRadius: 10, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* ── Reviews Grid ── */}
          {!loading && !error && processed.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {processed.map((review, i) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  token={token}
                  onResponseAdded={handleResponseAdded}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllReviews;