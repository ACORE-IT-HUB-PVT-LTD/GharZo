import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */
const BASE = "https://api.gharzoreality.com/api";
const SERVICE_REELS_BASE = "https://api.gharzoreality.com/api/service-reels";

const TABS = [
  { key: "property", label: "🏠 Property" },
  { key: "services", label: "🔧 Services" },
  { key: "banquets", label: "🏨 Hotels & Banquets" },
];

/* ──────────────────────────────────────────────
   UTILITY HELPERS
   ────────────────────────────────────────────── */
const getToken = () => localStorage.getItem("usertoken");

function formatCompact(num) {
  if (!num || isNaN(num)) return "0";
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(num);
  } catch {
    return String(num);
  }
}

function buildThresholdList(steps = 30) {
  return Array.from({ length: steps }, (_, i) => (i + 1) / steps);
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/* ──────────────────────────────────────────────
   GLOBAL INJECTED STYLES
   ────────────────────────────────────────────── */
(() => {
  if (document.getElementById("service-reels-styles")) return;
  const s = document.createElement("style");
  s.id = "service-reels-styles";
  s.textContent = `
    .sr-no-scrollbar          { scrollbar-width: none; }
    .sr-no-scrollbar::-webkit-scrollbar { display: none; }
    .sr-line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .sr-line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    @media (max-width: 640px) {
      .sr-reel-card        { height: 100vh !important; }
      .sr-reel-card > div { height: 100%; max-height: 100vh !important; border-radius: 0 !important; }
    }
    .sr-tab-active {
      background: white;
      color: black;
      box-shadow: 0 2px 12px rgba(255,255,255,0.3);
    }
    .sr-tab-inactive {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.75);
      border: 1px solid rgba(255,255,255,0.15);
    }
    .sr-tab-inactive:hover {
      background: rgba(255,255,255,0.15);
    }
  `;
  document.head.appendChild(s);
})();

/* ══════════════════════════════════════════════
   ACTION BUTTON
   ════════════════════════════════════════════ */
function ActionBtn({ label, count, active, onClick, icon: Icon }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 group">
      <div
        className={`p-2.5 rounded-full transition-all duration-200 ${
          active
            ? "bg-pink-500/30 scale-110"
            : "bg-black/40 group-hover:bg-black/60 group-hover:scale-105"
        }`}
      >
        <Icon active={active} />
      </div>
      {count !== undefined && Number(count) > 0 && (
        <span className="text-[11px] text-white font-semibold tabular-nums">
          {formatCompact(count)}
        </span>
      )}
      <span className="text-[10px] text-white/50">{label}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════
   COMMENT MODAL  (works for ALL entity types)
   ════════════════════════════════════════════ */
function CommentModal({ reelId, entityType, onClose, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null); // { id, username }
  const [expandedReplies, setExpandedReplies] = useState({});

  /* ── Correct comment URL based on entityType ── */
  const getCommentBaseUrl = useCallback(() => {
    if (entityType === "Property") {
      return `${BASE}/reels/${reelId}/comments`;
    }
    return `${SERVICE_REELS_BASE}/${reelId}/comments`;
  }, [reelId, entityType]);

  /* ── Fetch comments ── */
  const fetchComments = useCallback(async () => {
    setFetchLoading(true);
    try {
      const token = getToken();
      const res = await fetch(getCommentBaseUrl(), {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (json.success) {
        setComments(json.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch comments:", e);
    } finally {
      setFetchLoading(false);
    }
  }, [getCommentBaseUrl]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /* ── Post a comment or reply ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = getToken();
    if (!token) {
      alert("Please log in to comment.");
      return;
    }

    setLoading(true);
    try {
      let url = getCommentBaseUrl();
      let body = { comment: newComment };

      // If replying to a comment (service reels support replies)
      if (replyTo && entityType !== "Property") {
        url = `${SERVICE_REELS_BASE}/comments/${replyTo.id}/reply`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (json.success) {
        if (replyTo) {
          setExpandedReplies((prev) => ({
            ...prev,
            [replyTo.id]: [...(prev[replyTo.id] || []), json.data],
          }));
          setReplyTo(null);
        } else {
          setComments((prev) => [json.data, ...prev]);
        }
        setNewComment("");
        if (onCommentAdded) onCommentAdded(reelId);
      } else {
        alert(json.message || "Failed to post comment.");
      }
    } catch (e) {
      console.error("Post comment error:", e);
      alert("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Fetch replies for a comment ── */
  const fetchReplies = useCallback(async (commentId) => {
    if (expandedReplies[commentId] !== undefined) {
      setExpandedReplies((prev) => {
        const n = { ...prev };
        delete n[commentId];
        return n;
      });
      return;
    }
    try {
      const token = getToken();
      // For service reels, fetch replies by parentId
      const url = entityType !== "Property"
        ? `${SERVICE_REELS_BASE}/${reelId}/comments?parentId=${commentId}`
        : `${BASE}/reels/${reelId}/comments?parentId=${commentId}`;

      const res = await fetch(url, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      if (json.success) {
        setExpandedReplies((prev) => ({
          ...prev,
          [commentId]: json.data?.filter((c) => c.parentId === commentId) || [],
        }));
      }
    } catch (e) {
      console.error("Fetch replies error:", e);
    }
  }, [expandedReplies, reelId, entityType]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 w-full max-w-lg h-[72vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-bold text-base">
            Comments
            {comments.length > 0 && (
              <span className="text-white/40 text-sm font-normal ml-2">({comments.length})</span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto sr-no-scrollbar p-4 space-y-4">
          {fetchLoading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="animate-spin h-7 w-7 text-white/40" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((comment, i) => (
              <div key={comment._id || i}>
                {/* Top-level comment */}
                <div className="flex gap-3">
                  <img
                    src={
                      comment.userId?.profileImage?.url ||
                      comment.userId?.profileImage ||
                      `https://i.pravatar.cc/80?img=${(i % 70) + 1}`
                    }
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/20"
                    onError={(e) => { e.target.src = `https://i.pravatar.cc/80?img=${(i % 70) + 1}`; }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">
                        {comment.userId?.name || comment.userId?.fullName || "User"}
                      </span>
                      <span className="text-white/35 text-xs">{timeAgo(comment.createdAt)}</span>
                      {comment.isEdited && (
                        <span className="text-white/30 text-[10px]">(edited)</span>
                      )}
                    </div>
                    <p className="text-white/80 text-sm mt-0.5 leading-relaxed">
                      {comment.comment || comment.text}
                    </p>
                    {/* Reply button - only for service reels */}
                    {entityType !== "Property" && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <button
                          onClick={() => setReplyTo({ id: comment._id, username: comment.userId?.name || "user" })}
                          className="text-[11px] text-white/40 hover:text-white/80 transition font-medium"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => fetchReplies(comment._id)}
                          className="text-[11px] text-sky-400/80 hover:text-sky-300 transition font-medium"
                        >
                          {expandedReplies[comment._id] !== undefined ? "Hide replies" : "View replies"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {expandedReplies[comment._id] && expandedReplies[comment._id].length > 0 && (
                  <div className="ml-11 mt-2 space-y-2 border-l border-white/10 pl-3">
                    {expandedReplies[comment._id].map((reply, ri) => (
                      <div key={reply._id || ri} className="flex gap-2">
                        <img
                          src={
                            reply.userId?.profileImage?.url ||
                            reply.userId?.profileImage ||
                            `https://i.pravatar.cc/60?img=${(ri % 70) + 10}`
                          }
                          alt="avatar"
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-white/10"
                          onError={(e) => { e.target.src = `https://i.pravatar.cc/60?img=${(ri % 70) + 10}`; }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-semibold text-xs">
                              {reply.userId?.name || "User"}
                            </span>
                            <span className="text-white/30 text-[10px]">{timeAgo(reply.createdAt)}</span>
                          </div>
                          <p className="text-white/70 text-xs mt-0.5 leading-relaxed">
                            {reply.comment || reply.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Reply indicator */}
        {replyTo && (
          <div className="mx-4 flex items-center justify-between bg-white/8 rounded-lg px-3 py-1.5 border border-white/10">
            <span className="text-[11px] text-white/60">
              Replying to <strong className="text-white/90">@{replyTo.username}</strong>
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-white/40 hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? `Reply to @${replyTo.username}...` : "Add a comment..."}
              className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white/15 transition"
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-pink-600 active:scale-95 transition"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ENTITY DETAIL MODAL
   ════════════════════════════════════════════ */
function EntityModal({ entity, entityType, onClose }) {
  const navigate = useNavigate();

  if (!entity) return null;

  const entityName = entity.serviceName || entity.name || "Unknown";
  const addressParts = [
    entity.location?.address,
    entity.location?.locality,
    entity.location?.city,
  ].filter(Boolean);
  const address = addressParts.join(", ");

  const getEntityBadge = () => {
    const map = {
      Property: { label: "🏠 Property", bg: "bg-emerald-500/90" },
      Service: { label: "🔧 Service", bg: "bg-blue-500/90" },
      Hotel: { label: "🏨 Hotel", bg: "bg-amber-500/90" },
      BanquetHall: { label: "🎉 Banquet Hall", bg: "bg-pink-500/90" },
    };
    return map[entityType] || { label: entityType, bg: "bg-gray-500/90" };
  };

  const badge = getEntityBadge();

  const handleViewDetails = () => {
    onClose();
    const id = entity._id;
    if (entityType === "Property") navigate(`/property/${id}`);
    else if (entityType === "Service") navigate(`/service/${id}`);
    else if (entityType === "Hotel") navigate(`/hotel-banquet/${id}`);
    else if (entityType === "BanquetHall") navigate(`/hotel-banquet/${id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 w-full max-w-lg max-h-[88vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-44 bg-neutral-800 flex-shrink-0">
          {entity.images?.[0]?.url ? (
            <img
              src={entity.images[0].url}
              alt={entityName}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="opacity-20">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
          )}
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 ${badge.bg} text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg`}>
              {badge.label}
            </span>
          </div>

          {/* Entity name at bottom of image */}
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-white font-bold text-lg leading-tight">{entityName}</h2>
            {entity.category && (
              <p className="text-white/60 text-xs mt-0.5">{entity.category}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto sr-no-scrollbar p-4 space-y-4">
          {/* Address */}
          {address && (
            <div className="flex items-start gap-2 text-white/60 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{address}</span>
            </div>
          )}

          {/* Description */}
          {entity.description && (
            <p className="text-white/75 text-sm leading-relaxed">{entity.description}</p>
          )}

          {/* Property Pricing */}
          {entityType === "Property" && entity.pricing && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/8">
              <p className="text-white/50 text-xs font-medium mb-1 uppercase tracking-wide">Pricing</p>
              <p className="text-emerald-400 font-bold text-xl">
                ₹{(entity.pricing?.rent || entity.pricing?.amount)?.toLocaleString() || "N/A"}
                <span className="text-white/40 text-xs font-normal ml-1">
                  {entity.pricing?.type || "/ month"}
                </span>
              </p>
            </div>
          )}

          {/* Service Pricing */}
          {entityType === "Service" && entity.pricing && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/8">
              <p className="text-white/50 text-xs font-medium mb-1 uppercase tracking-wide">Pricing</p>
              <p className="text-blue-400 font-bold text-xl">
                ₹{entity.pricing?.amount?.toLocaleString() || "N/A"}
                <span className="text-white/40 text-xs font-normal ml-1">
                  {entity.pricing?.type || ""}
                </span>
              </p>
            </div>
          )}

          {/* Hotel Price Range */}
          {entityType === "Hotel" && entity.priceRange && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/8">
              <p className="text-white/50 text-xs font-medium mb-1 uppercase tracking-wide">Price Range</p>
              <p className="text-amber-400 font-bold text-xl">
                ₹{entity.priceRange.min?.toLocaleString()} – ₹{entity.priceRange.max?.toLocaleString()}
                <span className="text-white/40 text-xs font-normal ml-1">per night</span>
              </p>
            </div>
          )}

          {/* Hotel Room Types */}
          {entityType === "Hotel" && entity.roomTypes?.length > 0 && (
            <div>
              <p className="text-white/70 font-semibold text-sm mb-2">Room Types</p>
              <div className="space-y-2">
                {entity.roomTypes.map((room, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/8 flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium text-sm">{room.type}</p>
                      <p className="text-white/45 text-xs">
                        Max {room.maxOccupancy} guests
                        {room.bedType ? ` · ${room.bedType} bed` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-semibold">₹{room.price?.basePrice?.toLocaleString() || "N/A"}</p>
                      <p className="text-white/35 text-xs">/ night</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotel Amenities */}
          {entityType === "Hotel" && entity.amenities && (
            <div>
              <p className="text-white/70 font-semibold text-sm mb-2">Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(entity.amenities)
                  .flatMap(([, items]) => (Array.isArray(items) ? items : []))
                  .slice(0, 10)
                  .map((a, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white/10 rounded-full text-white/65 text-xs border border-white/5">
                      {a}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Hotel Policies */}
          {entityType === "Hotel" && entity.policies && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/8 space-y-1">
              <p className="text-white/70 font-semibold text-sm mb-2">Policies</p>
              {entity.policies.checkIn && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/45">Check-in</span>
                  <span className="text-white/80">{entity.policies.checkIn}</span>
                </div>
              )}
              {entity.policies.checkOut && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/45">Check-out</span>
                  <span className="text-white/80">{entity.policies.checkOut}</span>
                </div>
              )}
              {entity.policies.cancellation && (
                <p className="text-white/50 text-xs mt-1">{entity.policies.cancellation}</p>
              )}
            </div>
          )}

          {/* BanquetHall Capacity */}
          {entityType === "BanquetHall" && entity.capacity && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/8">
              <p className="text-white/50 text-xs font-medium mb-1 uppercase tracking-wide">Capacity</p>
              <p className="text-pink-400 font-bold text-xl">
                {entity.capacity?.toLocaleString()} guests
              </p>
            </div>
          )}

          {/* Contact Info */}
          {(entity.contactInfo || entity.provider) && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/8 space-y-2">
              <p className="text-white/70 font-semibold text-sm">Contact</p>
              {[entity.contactInfo, entity.provider].map(
                (info, i) =>
                  info && (
                    <React.Fragment key={i}>
                      {info.phone && (
                        <a
                          href={`tel:${info.phone}`}
                          className="flex items-center gap-2 text-white/65 text-sm hover:text-pink-400 transition"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 15a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 4.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6z" />
                          </svg>
                          {info.phone}
                        </a>
                      )}
                      {info.email && (
                        <a
                          href={`mailto:${info.email}`}
                          className="flex items-center gap-2 text-white/65 text-sm hover:text-pink-400 transition"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          {info.email}
                        </a>
                      )}
                      {info.whatsapp && (
                        <a
                          href={`https://wa.me/${info.whatsapp}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-white/65 text-sm hover:text-green-400 transition"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                          WhatsApp: {info.whatsapp}
                        </a>
                      )}
                    </React.Fragment>
                  )
              )}
            </div>
          )}

          {/* View Button */}
          <button
            onClick={handleViewDetails}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 active:scale-98 transition shadow-lg shadow-pink-500/20"
          >
            View Full Details →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════ */
function ServiceReelsPage() {
  const [activeTab, setActiveTab] = useState("property");
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCommentsFor, setShowCommentsFor] = useState(null); // { reelId, entityType }
  const [showEntityModal, setShowEntityModal] = useState(null); // { entity, entityType }
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const navigate = useNavigate();

  /* ── Fetch Reels Based on Tab ── */
  const fetchReels = useCallback(async () => {
    setLoading(true);
    setReels([]);
    try {
      const token = getToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (activeTab === "property") {
        const res = await fetch(
          `${BASE}/reels/feed?type=latest&city=Indore&page=1&limit=20`,
          { headers }
        );
        if (!res.ok) throw new Error("Property reels fetch failed");
        const json = await res.json();
        const raw = json.data || json.reels || [];
        setReels(
          raw
            .filter((r) => !r.status || r.status === "Active" || r.status === "active")
            .map((item) => ({
              id: item._id,
              entityType: "Property",
              entityId: item.propertyId,
              src: item.videoUrl,
              poster: item.thumbnail?.url || "",
              caption: item.caption || "",
              tags: item.tags || [],
              username: item.uploadedBy?.name || "Landlord",
              avatar: item.uploadedBy?.profileImage
                ? item.uploadedBy.profileImage.startsWith("http")
                  ? item.uploadedBy.profileImage
                  : `https://api.gharzoreality.com${item.uploadedBy.profileImage}`
                : `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70) + 1}`,
              likes: item.likes || 0,
              comments: item.comments || 0,
              liked: !!item.isLiked,
              views: item.views || 0,
              uploadedBy: item.uploadedBy,
              isBoosted: !!item.isBoosted,
            }))
        );
      } else if (activeTab === "services") {
        const res = await fetch(
          `${SERVICE_REELS_BASE}?entityType=Service&page=1&limit=20`,
          { headers }
        );
        if (!res.ok) throw new Error("Service reels fetch failed");
        const json = await res.json();
        const raw = json.data || [];
        setReels(
          raw
            .filter((r) => r.status === "Active" || r.status === "active")
            .map((item) => ({
              id: item._id,
              entityType: "Service",
              entityId: item.entityId,
              src: item.video?.url || "",
              poster: item.thumbnail?.url || "",
              caption: item.title || item.description || "",
              tags: item.tags || [],
              username: item.entityId?.serviceName || item.entityId?.name || "Service",
              avatar:
                item.entityId?.images?.[0]?.url ||
                `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70) + 1}`,
              likes: item.stats?.likes || 0,
              comments: item.stats?.comments || 0,
              liked: !!item.isLiked,
              views: item.stats?.views || 0,
              category: item.category || item.entityId?.category || "",
              isBoosted: item.isFeatured || false,
            }))
        );
      } else if (activeTab === "banquets") {
        const [hotelRes, banquetRes] = await Promise.all([
          fetch(`${SERVICE_REELS_BASE}?entityType=Hotel&page=1&limit=20`, { headers }),
          fetch(`${SERVICE_REELS_BASE}?entityType=BanquetHall&page=1&limit=20`, { headers }),
        ]);

        const hotelJson = await hotelRes.json();
        const banquetJson = await banquetRes.json();

        const allData = [
          ...(hotelJson.success ? hotelJson.data || [] : []),
          ...(banquetJson.success ? banquetJson.data || [] : []),
        ];

        // Sort by order
        allData.sort((a, b) => (a.order || 999) - (b.order || 999));

        setReels(
          allData
            .filter((r) => r.status === "Active" || r.status === "active")
            .map((item) => ({
              id: item._id,
              entityType: item.entityType,
              entityId: item.entityId,
              src: item.video?.url || "",
              poster: item.thumbnail?.url || "",
              caption: item.title || item.description || "",
              tags: item.tags || [],
              username:
                item.entityId?.name ||
                (item.entityType === "Hotel" ? "Hotel" : "Banquet Hall"),
              avatar:
                item.entityId?.images?.[0]?.url ||
                `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70) + 1}`,
              likes: item.stats?.likes || 0,
              comments: item.stats?.comments || 0,
              liked: !!item.isLiked,
              views: item.stats?.views || 0,
              category: item.category || item.entityId?.category || "",
              isBoosted: item.isFeatured || false,
            }))
        );
      }
    } catch (e) {
      console.error("fetchReels error:", e);
      setReels([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchReels(); }, [fetchReels]);

  /* ── Track engagement (view) ── */
  const trackEngagement = useCallback(async (reel, type = "view") => {
    if (reel.entityType === "Property") return;
    try {
      await fetch(`${SERVICE_REELS_BASE}/${reel.id}/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
    } catch (_) {}
  }, []);

  /* ── Autoplay first reel on load ── */
  useEffect(() => {
    if (reels.length > 0) {
      const timer = setTimeout(() => {
        const v = document.querySelector("video[data-index='0']");
        if (v) {
          v.play().catch(() => {});
          setActiveIndex(0);
          setPaused(false);
          trackEngagement(reels[0]);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [reels, trackEngagement]);

  /* ── Reset on tab change ── */
  useEffect(() => {
    setActiveIndex(0);
    setPaused(false);
    setIsMuted(false);
    setShowCommentsFor(null);
    setShowEntityModal(null);
    if (containerRef.current) containerRef.current.scrollTop = 0;
    document.querySelectorAll("video").forEach((v) => {
      v.pause();
      v.currentTime = 0;
    });
  }, [activeTab]);

  /* ── IntersectionObserver → auto-play centred reel ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reels.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (!(el instanceof HTMLVideoElement)) return;
          if (entry.isIntersecting && entry.intersectionRatio > 0.85) {
            el.play().catch(() => {});
            const idx = Number(el.dataset.index || 0);
            setActiveIndex(idx);
            setPaused(false);
            if (reels[idx]) trackEngagement(reels[idx]);
          } else {
            el.pause();
          }
        });
      },
      { root: container, threshold: buildThresholdList(30) }
    );

    container.querySelectorAll("video").forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [reels, trackEngagement]);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA") return;
      if (showCommentsFor || showEntityModal) return;
      if (["ArrowDown", "PageDown", "j"].includes(e.key)) {
        e.preventDefault();
        snapTo(activeIndex + 1);
      } else if (["ArrowUp", "PageUp", "k"].includes(e.key)) {
        e.preventDefault();
        snapTo(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, showCommentsFor, showEntityModal]);

  const snapTo = (idx) => {
    const c = containerRef.current;
    if (!c) return;
    const clamped = Math.max(0, Math.min(reels.length - 1, idx));
    c.querySelector(`[data-card-index="${clamped}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  /* ── Like ── */
  const toggleLike = async (reel) => {
    const token = getToken();
    if (!token) { alert("Please log in to like."); return; }

    try {
      const url =
        reel.entityType === "Property"
          ? `${BASE}/reels/${reel.id}/like`
          : `${SERVICE_REELS_BASE}/${reel.id}/like`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Like failed: ${res.status}`);
      const data = await res.json();

      setReels((prev) =>
        prev.map((r) =>
          r.id === reel.id
            ? {
                ...r,
                liked: data.isLiked ?? !r.liked,
                likes: data.likes ?? (r.liked ? r.likes - 1 : r.likes + 1),
              }
            : r
        )
      );

      if (reel.entityType !== "Property" && data.isLiked) {
        trackEngagement(reel, "like");
      }
    } catch (e) {
      console.error("Like error:", e);
      alert("Failed to like. Please try again.");
    }
  };

  /* ── Share ── */
  const handleShare = async (reel) => {
    const shareData = {
      title: reel.caption || "Check this out on GharzoReality",
      text: `Check out: ${reel.caption}`,
      url: reel.src || window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
      if (reel.entityType !== "Property") {
        trackEngagement(reel, "share");
      }
    } catch (_) {}
  };

  /* ── Mute/Unmute ── */
  const toggleMute = (idx) => {
    if (activeIndex !== idx) return;
    const v = document.querySelector(`video[data-index="${idx}"]`);
    if (v) {
      v.muted = !v.muted;
      setIsMuted(v.muted);
    }
  };

  /* ── Video click (play/pause) ── */
  const handleVideoClick = (e, idx) => {
    if (activeIndex !== idx) return;
    const v = e.currentTarget;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  /* ── Fetch entity details and show modal ── */
  const handleEntityClick = async (reel) => {
    const token = getToken();
    try {
      let url = "";
      if (reel.entityType === "Property") {
        const propId = reel.entityId?._id || reel.entityId;
        if (!propId) return;
        url = `${BASE}/properties/${propId}`;
      } else {
        const entityId = reel.entityId?._id || reel.entityId;
        if (!entityId) return;
        url = `${SERVICE_REELS_BASE}/entity/${reel.entityType}/${entityId}`;
        trackEngagement(reel, "click");
      }

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Entity fetch failed");
      const json = await res.json();
      const entityData = json.data || json;

      if (entityData?._id) {
        setShowEntityModal({ entity: entityData, entityType: reel.entityType });
      }
    } catch (e) {
      console.error("Entity fetch error:", e);
    }
  };

  /* ── Comment count update ── */
  const handleCommentAdded = useCallback((reelId) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelId ? { ...r, comments: (r.comments || 0) + 1 } : r
      )
    );
  }, []);

  /* ── Entity badge config ── */
  const getEntityBadge = (entityType) => {
    const map = {
      Property: { label: "🏠 Property", bg: "bg-emerald-500/90" },
      Service: { label: "🔧 Service", bg: "bg-blue-500/90" },
      Hotel: { label: "🏨 Hotel", bg: "bg-amber-500/90" },
      BanquetHall: { label: "🎉 Banquet", bg: "bg-pink-500/90" },
    };
    return map[entityType] || { label: entityType, bg: "bg-gray-500/90" };
  };

  /* ──────── RENDER ──────── */
  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-black text-white">

      {/* ── TOP HEADER ── */}
      <header
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3"
        style={{ paddingTop: "env(safe-area-inset-top, 10px)", paddingBottom: "6px" }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-full bg-black/60 backdrop-blur border border-white/15 hover:bg-black/80 transition flex-shrink-0"
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Tab Pills */}
        <div className="flex gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10 overflow-x-auto sr-no-scrollbar mx-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key ? "sr-tab-active" : "sr-tab-inactive"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="w-10 flex-shrink-0" />
      </header>

      {/* ── REEL FEED ── */}
      <main className="h-screen w-full overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0 h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth sr-no-scrollbar"
        >
          <div className="h-14" />

          {/* Loading */}
          {loading && (
            <div className="h-screen flex flex-col items-center justify-center text-white/40">
              <svg className="animate-spin h-9 w-9 mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm">Loading reels...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && reels.length === 0 && (
            <div className="h-screen flex flex-col items-center justify-center text-white/35 px-6 text-center">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-30">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <p className="text-base font-medium">No reels found</p>
              <p className="text-sm mt-1 text-white/25">Check back soon for new content</p>
              <button
                onClick={fetchReels}
                className="mt-5 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white/70 text-sm font-medium transition border border-white/15"
              >
                Retry
              </button>
            </div>
          )}

          {/* Reels */}
          {reels.map((reel, idx) => {
            const badge = getEntityBadge(reel.entityType);
            return (
              <article
                key={reel.id}
                data-card-index={idx}
                className="sr-reel-card snap-center flex items-center justify-center py-1"
                style={{ height: "calc(100vh)" }}
              >
                <div
                  className="relative w-full max-w-[390px] h-full bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 mx-2 sm:mx-auto"
                  style={{ maxHeight: "720px" }}
                >
                  {/* Video */}
                  <video
                    data-index={idx}
                    className="absolute inset-0 h-full w-full object-cover cursor-pointer select-none"
                    src={reel.src}
                    poster={reel.poster}
                    playsInline
                    loop
                    muted={isMuted}
                    preload="metadata"
                    onClick={(e) => handleVideoClick(e, idx)}
                  />

                  {/* Play Indicator */}
                  {activeIndex === idx && paused && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse scale-150" />
                        <div className="relative bg-black/50 backdrop-blur rounded-full p-5">
                          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gradient Overlays */}
                  <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-[1]" />
                  <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-[1]" />

                  {/* Entity Badge */}
                  <div className="absolute top-14 left-3 z-10">
                    <span className={`inline-flex items-center gap-1 ${badge.bg} text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm`}>
                      {badge.label}
                    </span>
                    {reel.isBoosted && (
                      <span className="ml-1.5 inline-flex items-center gap-1 bg-amber-400/90 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  {/* ── Bottom Left Info ── */}
                  <div className="absolute left-4 bottom-20 pr-16 z-[2] space-y-2">
                    {/* Username */}
                    <button
                      onClick={() => handleEntityClick(reel)}
                      className="flex items-center gap-2 group"
                    >
                      <img
                        src={reel.avatar}
                        alt={reel.username}
                        className="w-9 h-9 rounded-full border-2 border-white/80 object-cover shadow-md"
                        onError={(e) => {
                          e.target.src = `https://i.pravatar.cc/100?img=${idx + 1}`;
                        }}
                      />
                      <span className="text-sm font-bold text-white group-hover:underline drop-shadow-md">
                        {reel.username}
                      </span>
                    </button>

                    {/* Caption */}
                    {reel.caption && (
                      <p className="text-white text-sm leading-snug sr-line-clamp-3 drop-shadow-sm">
                        {reel.caption}
                      </p>
                    )}

                    {/* Category */}
                    {reel.category && (
                      <span className="inline-block text-[11px] text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                        {reel.category}
                      </span>
                    )}

                    {/* Tags */}
                    {reel.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {reel.tags.slice(0, 4).map((t) => (
                          <span key={t} className="text-[11px] text-sky-300/90 font-medium">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Right Action Rail ── */}
                  <div className="absolute right-2 bottom-16 flex flex-col items-center gap-4 z-[2]">
                    {/* Like */}
                    <ActionBtn
                      label="Like"
                      active={reel.liked}
                      count={reel.likes}
                      onClick={() => toggleLike(reel)}
                      icon={({ active }) => (
                        <svg width="24" height="24" viewBox="0 0 24 24"
                          fill={active ? "#fb7185" : "none"}
                          stroke={active ? "#fb7185" : "white"}
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      )}
                    />

                    {/* Comment */}
                    <ActionBtn
                      label="Comment"
                      count={reel.comments}
                      onClick={() =>
                        setShowCommentsFor({ reelId: reel.id, entityType: reel.entityType })
                      }
                      icon={() => (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      )}
                    />

                    {/* Share */}
                    <ActionBtn
                      label="Share"
                      onClick={() => handleShare(reel)}
                      icon={() => (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                      )}
                    />

                    {/* Details */}
                    <ActionBtn
                      label="Details"
                      onClick={() => handleEntityClick(reel)}
                      icon={() => (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    />
                  </div>

                  {/* Views Count */}
                  {reel.views > 0 && (
                    <div className="absolute bottom-4 left-4 z-[2] flex items-center gap-1 text-white/45 text-xs">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {formatCompact(reel.views)} views
                    </div>
                  )}

                  {/* Mute Button */}
                  <div className="absolute bottom-4 right-2 z-10">
                    <button
                      onClick={() => toggleMute(idx)}
                      className="p-2 rounded-full bg-black/55 backdrop-blur hover:bg-black/75 transition text-white"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="h-20" />
        </div>
      </main>

      {/* ── Comment Modal ── */}
      {showCommentsFor && (
        <CommentModal
          reelId={showCommentsFor.reelId}
          entityType={showCommentsFor.entityType}
          onClose={() => setShowCommentsFor(null)}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* ── Entity Detail Modal ── */}
      {showEntityModal && (
        <EntityModal
          entity={showEntityModal.entity}
          entityType={showEntityModal.entityType}
          onClose={() => setShowEntityModal(null)}
        />
      )}
    </div>
  );
}

export default ServiceReelsPage;