import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */
const BASE = "https://api.gharzoreality.com/api";
const CATEGORIES = [
  { key: "latest", label: "Latest" },
  { key: "popular", label: "Popular" },
  { key: "trending", label: "Trending" },
];

/* ──────────────────────────────────────────────
   UTILITY HELPERS
   ────────────────────────────────────────────── */
const getToken = () => localStorage.getItem("usertoken");

function formatCompact(num) {
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
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/* ──────────────────────────────────────────────
   GLOBAL INJECTED STYLES  (no-scrollbar, clamp, mobile snap)
   ────────────────────────────────────────────── */
(() => {
  if (document.getElementById("reels-styles")) return;
  const s = document.createElement("style");
  s.id = "reels-styles";
  s.textContent = `
    .no-scrollbar          { scrollbar-width: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    @media (max-width: 640px) {
      .reel-snap-card        { height: 100vh !important; }
      .reel-snap-card > div { height: 100%; max-height: 100vh !important; border-radius: 0 !important; }
    }
  `;
  document.head.appendChild(s);
})();

/* ══════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════== */
function ReelsPage() {
  /* ── state ── */
  const [reels, setReels]                   = useState([]);
  const [activeIndex, setActiveIndex]       = useState(0);
  const [paused, setPaused]                 = useState(false);
  const [isMuted, setIsMuted]               = useState(false);
  const [category, setCategory]             = useState("latest");
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [showLandlordModal, setShowLandlordModal] = useState(null);
  const [showSearch, setShowSearch]         = useState(false);

  const containerRef = useRef(null);
  const navigate     = useNavigate();

  /* ── fetch feed ── */
  const fetchFeed = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) { setReels([]); return; }

      const res = await fetch(
        `${BASE}/reels/feed?type=${category}&city=Indore&page=1&limit=10`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Feed fetch failed");
      const json = await res.json();

      const active = (json.data || []).filter(
        (r) => r.status === "Active" || r.status === "active"
      );

      setReels(
        active.map((item, i) => ({
          id:            item._id,
          propertyId:    item.propertyId,           // full nested object
          src:           item.videoUrl,
          poster:        item.thumbnail?.url || "",
          caption:       item.caption || "",
          tags:          item.tags || [],
          username:      item.uploadedBy?.name || "landlord",
          avatar:        item.uploadedBy?.profileImage
                           ? `https://api.gharzoreality.com${item.uploadedBy.profileImage}`
                           : `https://i.pravatar.cc/100?img=${(i + 12) % 70}`,
          likes:         item.likes || 0,
          comments:      item.comments || 0,
          liked:         !!item.isLiked,
          saved:         !!item.isSaved,
          isBoosted:     !!item.isBoosted,
          views:         item.views || 0,
          uploadedBy:    item.uploadedBy,
        }))
      );
    } catch (e) {
      console.error(e);
      setReels([]);
    }
  }, [category]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  /* ── autoplay first reel when reels load ── */
  useEffect(() => {
    if (reels.length > 0) {
      setTimeout(() => {
        const firstVideo = document.querySelector("video[data-index='0']");
        if (firstVideo) {
          firstVideo.play().catch(() => {});
          setActiveIndex(0);
          setPaused(false);
        }
      }, 100);
    }
  }, [reels]);

  /* ── reset scroll / video on category change ── */
  useEffect(() => {
    setActiveIndex(0);
    setPaused(false);
    setIsMuted(false);
    if (containerRef.current) containerRef.current.scrollTop = 0;
    document.querySelectorAll("video").forEach((v) => { v.pause(); v.currentTime = 0; });
  }, [category]);

  /* ── IntersectionObserver → auto play centred reel ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
          } else {
            el.pause();
          }
        });
      },
      { root: container, threshold: buildThresholdList(30) }
    );

    container.querySelectorAll("video").forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [reels]);

  /* ── keyboard nav ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA") return;
      if (showSearch || showCommentsFor) return; // don't scroll when overlays open
      if (["ArrowDown", "PageDown", "j"].includes(e.key)) { e.preventDefault(); snapTo(activeIndex + 1); }
      else if (["ArrowUp", "PageUp", "k"].includes(e.key)) { e.preventDefault(); snapTo(activeIndex - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, showSearch, showCommentsFor]);

  const snapTo = (idx) => {
    const c = containerRef.current;
    if (!c) return;
    const clamped = Math.max(0, Math.min(reels.length - 1, idx));
    c.querySelector(`[data-card-index="${clamped}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  /* ── like ── */
  const toggleLike = async (id) => {
    try {
      const token = getToken();
      if (!token) { alert("Please log in."); return; }
      const res = await fetch(`${BASE}/reels/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Like failed");
      const data = await res.json();                          // { success, isLiked, likes }
      setReels((prev) =>
        prev.map((r) => (r.id === id ? { ...r, liked: data.isLiked, likes: data.likes } : r))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to like. Try again.");
    }
  };

  /* ── share ── */
  const handleShare = async (reel) => {
    const share = { title: reel.caption || "Reel", text: `Check out this reel by @${reel.username}`, url: reel.src };
    try {
      if (navigator.share) await navigator.share(share);
      else { await navigator.clipboard.writeText(share.url); alert("Link copied!"); }
    } catch {}
  };

  /* ── mute / pause ── */
  const toggleMute = (idx) => {
    if (activeIndex !== idx) return;
    const v = document.querySelector(`video[data-index="${idx}"]`);
    if (v) { v.muted = !v.muted; setIsMuted(v.muted); }
  };

  const handleVideoClick = (e, idx) => {
    if (activeIndex !== idx) return;
    const v = e.currentTarget;
    if (v.paused) { v.play().catch(() => {}); setPaused(false); }
    else          { v.pause(); setPaused(true); }
  };

  /* ── landlord modal ── */
  const handleLandlordClick = (reel) => {
    setShowLandlordModal({
      name:         reel.username,
      profilePhoto: reel.uploadedBy?.profileImage || null,
      mobile:       reel.uploadedBy?.mobile       || null,
      email:        reel.uploadedBy?.email        || null,
      propertyId:   reel.propertyId?._id          || null,
      propertyTitle:reel.propertyId?.title         || "",
      price:        reel.propertyId?.price         || {},
    });
  };

  /* ── after search returns results, swap into reels list ── */
  const handleSearchResults = (results) => {
    // results already mapped from SearchOverlay
    setReels(results);
    setActiveIndex(0);
    setShowSearch(false);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  };

  /* ──────── RENDER ──────── */
  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-black text-white">

      {/* ── top header bar: category tabs + search icon ── */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-safe-top"
              style={{ paddingTop: "env(safe-area-inset-top, 8px)" }}>
        {/* Category pills */}
        <div className="flex gap-2 py-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200
                ${category === cat.key
                  ? "bg-white text-black shadow-lg"
                  : "bg-black/50 text-white/80 backdrop-blur border border-white/15 hover:bg-black/70"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search icon */}
        <button
          onClick={() => setShowSearch(true)}
          className="p-2 rounded-full bg-black/50 backdrop-blur border border-white/15 hover:bg-black/70 transition"
          aria-label="Search reels"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </header>

      {/* ── scrollable reel feed ── */}
      <main className="h-screen w-full overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0 h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        >
          <div className="h-12" /> {/* top spacer for header */}

          {reels.length === 0 && (
            <div className="h-screen flex flex-col items-center justify-center text-white/40 text-sm px-6 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mb-4 opacity-40">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              No reels found. Check back soon!
            </div>
          )}

          {reels.map((reel, idx) => (
            <article
              key={reel.id}
              data-card-index={idx}
              className="reel-snap-card snap-center flex items-center justify-center py-1"
              style={{ height: "calc(100vh - 0rem)" }}
            >
              <div className="relative w-full max-w-[380px] h-full bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 mx-2 sm:mx-auto"
                   style={{ maxHeight: "700px" }}>

                {/* Video */}
                <video
                  data-index={idx}
                  className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                  src={reel.src}
                  poster={reel.poster}
                  playsInline
                  loop
                  muted={isMuted}
                  autoPlay
                  preload="metadata"
                  onClick={(e) => handleVideoClick(e, idx)}
                />

                {/* Play / Pause overlay */}
                {activeIndex === idx && paused && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse" />
                      <div className="relative bg-white/20 backdrop-blur rounded-full p-5">
                        <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gradient overlays */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                {/* ── Boosted badge ── */}
                {reel.isBoosted && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 bg-amber-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" /></svg>
                      Boosted
                    </span>
                  </div>
                )}

                {/* ── Bottom-left info: username row + caption + tags ── */}
                <div className="absolute left-4 bottom-20 pr-14 z-5 space-y-1.5">

                  {/* Username row (clickable → landlord modal) */}
                  <button
                    onClick={() => handleLandlordClick(reel)}
                    className="flex items-center gap-2 group"
                  >
                    <img
                      src={reel.avatar}
                      alt={reel.username}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                    <span className="text-sm font-semibold text-white group-hover:underline">{reel.username}</span>
                  </button>

                  {/* Caption */}
                  <p className="text-white text-sm leading-snug line-clamp-3">{reel.caption}</p>

                  {/* Tags */}
                  {reel.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {reel.tags.map((t) => (
                        <span key={t} className="text-[11px] text-sky-300/90 font-medium">#{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Audio line (decorative) */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                    </svg>
                    <span className="text-[11px] text-white/60 truncate">Original audio – {reel.username}</span>
                  </div>
                </div>

                {/* ── Right action rail ── */}
                <div className="absolute right-2 bottom-20 flex flex-col items-center gap-5 pb-4">
                  {/* Like */}
                  <ActionBtn
                    label="Like"
                    active={reel.liked}
                    count={reel.likes}
                    onClick={() => toggleLike(reel.id)}
                    icon={(active) => (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#fb7185" : "none"} stroke={active ? "#fb7185" : "white"} strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    )}
                  />

                  {/* Comment */}
                  <ActionBtn
                    label="Comment"
                    count={reel.comments}
                    onClick={() => setShowCommentsFor(showCommentsFor === reel.id ? null : reel.id)}
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
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                    )}
                  />

                  {/* View Property (house icon) */}
                  <ActionBtn
                    label="View Property"
                    onClick={() => {
                      if (reel.propertyId?._id) {
                        navigate(`/property/${reel.propertyId._id}`);
                      } else if (reel.propertyId && typeof reel.propertyId === 'string') {
                        navigate(`/property/${reel.propertyId}`);
                      } else {
                        alert('Property details not available');
                      }
                    }}
                    icon={() => (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9,22 9,12 15,12 15,22" />
                      </svg>
                    )}
                  />
                </div>

                {/* ── Mute / Unmute ── */}
                <div className="absolute bottom-4 right-2 z-10">
                  <button
                    onClick={() => toggleMute(idx)}
                    className="p-2 rounded-full bg-black/55 hover:bg-black/75 transition text-white"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                        <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* ── Comments sheet (inside card) ── */}
                {showCommentsFor === reel.id && (
                  <CommentsSheet
                    reelId={reel.id}
                    totalComments={reel.comments}
                    onClose={() => setShowCommentsFor(null)}
                    onCommentAdded={() => {
                      // optimistic +1
                      setReels((prev) => prev.map((r) => (r.id === reel.id ? { ...r, comments: r.comments + 1 } : r)));
                    }}
                  />
                )}
              </div>
            </article>
          ))}

          <div className="h-24" /> {/* bottom spacer */}
        </div>
      </main>

      {/* ══════ LANDLORD MODAL ══════ */}
      {showLandlordModal && (
        <LandlordModal
          data={showLandlordModal}
          onClose={() => setShowLandlordModal(null)}
          navigate={navigate}
        />
      )}

      {/* ══════ SEARCH OVERLAY ══════ */}
      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          onResults={handleSearchResults}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   ACTION BUTTON
   ════════════════════════════════════════════== */
function ActionBtn({ label, count, icon, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5"
      aria-label={label}
    >
      <div className="p-1.5 rounded-full hover:bg-white/10 transition">
        {icon?.(!!active)}
      </div>
      {typeof count === "number" && count > 0 && (
        <span className="text-[11px] text-white/90 font-medium tabular-nums">{formatCompact(count)}</span>
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════
   COMMENTS SHEET  (fetches its own data, supports threaded replies)
   ════════════════════════════════════════════== */
function CommentsSheet({ reelId, totalComments, onClose, onCommentAdded }) {
  const [comments, setComments]     = useState([]);   // top-level comments
  const [loading, setLoading]       = useState(true);
  const [text, setText]             = useState("");
  const [replyTo, setReplyTo]       = useState(null); // { id, username }
  const [expandedReplies, setExpandedReplies] = useState({}); // commentId → [replies]

  /* fetch top-level comments */
  useEffect(() => {
    async function load() {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch(`${BASE}/reels/${reelId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("comments fetch failed");
        const json = await res.json();
        // top-level = parentId is null
        const top = (json.data || []).filter((c) => !c.parentId);
        setComments(top);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reelId]);

  /* fetch replies for a given parent */
  const fetchReplies = async (parentId) => {
    if (expandedReplies[parentId]) {
      // toggle off
      setExpandedReplies((prev) => { const n = { ...prev }; delete n[parentId]; return n; });
      return;
    }
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/reels/${reelId}/comments?parentId=${parentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("replies fetch failed");
      const json = await res.json();
      setExpandedReplies((prev) => ({ ...prev, [parentId]: json.data || [] }));
    } catch (e) { console.error(e); }
  };

  /* post comment or reply */
  const postComment = async () => {
    if (!text.trim()) return;
    try {
      const token = getToken();
      if (!token) { alert("Please log in."); return; }
      const body = { text: text.trim() };
      if (replyTo) body.parentId = replyTo.id;

      const res = await fetch(`${BASE}/reels/${reelId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("post comment failed");
      const json = await res.json();
      const newComment = json.data;

      if (replyTo) {
        // append reply into expanded replies
        setExpandedReplies((prev) => ({
          ...prev,
          [replyTo.id]: [...(prev[replyTo.id] || []), newComment],
        }));
        setReplyTo(null);
      } else {
        // prepend as new top-level comment
        setComments((prev) => [newComment, ...prev]);
        onCommentAdded?.();
      }
      setText("");
    } catch (e) {
      console.error(e);
      alert("Failed to post comment.");
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col">
      {/* semi-transparent backdrop (top portion) */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* actual sheet */}
      <div className="bg-neutral-950/97 backdrop-blur-sm border-t border-white/10 rounded-t-2xl max-h-[65%] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="text-sm font-semibold text-white">
            Comments · <span className="text-white/50">{totalComments}</span>
          </span>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* comment list */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-2 space-y-3">
          {loading && (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          {!loading && comments.length === 0 && (
            <p className="text-center text-white/35 text-sm py-4">No comments yet. Be the first!</p>
          )}
          {!loading && comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              replies={expandedReplies[c._id]}
              onExpandReplies={() => fetchReplies(c._id)}
              onReply={() => setReplyTo({ id: c._id, username: c.userId?.name || "user" })}
            />
          ))}
        </div>

        {/* reply-to indicator */}
        {replyTo && (
          <div className="mx-4 mt-1 flex items-center justify-between bg-white/8 rounded-lg px-3 py-1.5">
            <span className="text-[11px] text-white/60">Replying to <strong className="text-white/90">@{replyTo.username}</strong></span>
            <button onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* input row */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/8">
          <img src={`https://i.pravatar.cc/40?u=me`} alt="" className="w-7 h-7 rounded-full border border-white/15 object-cover" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && postComment()}
            placeholder={replyTo ? `Reply to @${replyTo.username}…` : "Add a comment…"}
            className="flex-1 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/35 transition"
          />
          <button
            disabled={!text.trim()}
            onClick={postComment}
            className="text-sky-400 text-sm font-semibold disabled:opacity-30 hover:text-sky-300 transition"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── single comment row + replies ── */
function CommentItem({ comment, replies, onExpandReplies, onReply }) {
  const hasReplies = comment.replyCount > 0 || (replies && replies.length > 0);

  return (
    <div>
      <div className="flex items-start gap-3">
        <img
          src={comment.userId?.profileImage ? `https://api.gharzoreality.com${comment.userId.profileImage}` : `https://i.pravatar.cc/40?u=${comment.userId?.name}`}
          alt=""
          className="w-7 h-7 rounded-full border border-white/15 object-cover mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{comment.userId?.name || "Anonymous"}</span>
            <span className="text-[10px] text-white/35">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-white/85 mt-0.5 leading-snug">{comment.text}</p>

          {/* reply link */}
          <div className="flex items-center gap-3 mt-1">
            <button onClick={onReply} className="text-[11px] text-white/45 hover:text-white/80 transition">Reply</button>
            {(hasReplies || (replies && replies.length > 0)) && (
              <button onClick={onExpandReplies} className="text-[11px] text-sky-400/80 hover:text-sky-300 transition">
                {replies ? "Hide replies" : `View replies`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* expanded replies */}
      {replies && replies.length > 0 && (
        <div className="ml-10 mt-2 space-y-2 border-l border-white/10 pl-3">
          {replies.map((r) => (
            <div key={r._id} className="flex items-start gap-2">
              <img
                src={r.userId?.profileImage ? `https://api.gharzoreality.com${r.userId.profileImage}` : `https://i.pravatar.cc/40?u=${r.userId?.name}`}
                alt=""
                className="w-5 h-5 rounded-full border border-white/15 object-cover mt-0.5"
              />
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[12px] font-semibold text-white">{r.userId?.name || "Anonymous"}</span>
                  <span className="text-[10px] text-white/35">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="text-[12px] text-white/80 leading-snug">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   LANDLORD MODAL
   ════════════════════════════════════════════== */
function LandlordModal({ data, onClose, navigate }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div className="relative w-full max-w-sm bg-neutral-900 rounded-2xl p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* close */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-3">
          {/* avatar */}
          <img
            src={data.profilePhoto ? `https://api.gharzoreality.com${data.profilePhoto}` : `https://i.pravatar.cc/100?u=${data.name}`}
            alt={data.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
          />
          <h2 className="text-lg font-bold text-white">{data.name}</h2>

          {/* contact info */}
          <div className="w-full space-y-2 text-sm text-white/75 mt-1">
            {data.mobile && (
              <div className="flex justify-between">
                <span className="text-white/45 font-medium">Mobile</span>
                <span>{data.mobile}</span>
              </div>
            )}
            {data.email && (
              <div className="flex justify-between">
                <span className="text-white/45 font-medium">Email</span>
                <span className="truncate ml-2">{data.email}</span>
              </div>
            )}
          </div>

          {/* property preview card */}
          {data.propertyTitle && (
            <div className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-[11px] text-white/40 uppercase tracking-wide mb-0.5">Property</p>
              <p className="text-sm text-white font-medium">{data.propertyTitle}</p>
              {data.price?.amount && (
                <p className="text-[12px] text-emerald-400 mt-0.5">
                  ₹{data.price.amount.toLocaleString()} / {data.price.per}
                  {data.price.negotiable && <span className="text-white/35 ml-1">(Negotiable)</span>}
                </p>
              )}
            </div>
          )}

          {/* CTA */}
          {data.propertyId && (
            <button
              onClick={() => { onClose(); navigate(`/property/${data.propertyId}`); }}
              className="mt-2 w-full py-2.5 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition"
            >
              View Full Property →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SEARCH OVERLAY
   ════════════════════════════════════════════== */
function SearchOverlay({ onClose, onResults }) {
  const [query, setQuery]           = useState("");
  const [city, setCity]             = useState("Indore");
  const [tags, setTags]             = useState("");
  const [results, setResults]       = useState(null);   // null = not searched yet
  const [loading, setLoading]       = useState(false);
  const [searchedOnce, setSearchedOnce] = useState(false);
  const inputRef                    = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = async () => {
    setLoading(true);
    setSearchedOnce(true);
    try {
      const token = getToken();
      if (!token) { alert("Please log in."); setLoading(false); return; }

      const params = new URLSearchParams();
      if (query.trim())  params.set("q", query.trim());
      if (city.trim())   params.set("city", city.trim());
      if (tags.trim())   params.set("tags", tags.trim().replace(/\s/g, ""));
      params.set("page", "1");
      params.set("limit", "10");

      const res = await fetch(`${BASE}/reels/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("search failed");
      const json = await res.json();

      const mapped = (json.data || []).map((item, i) => ({
        id:            item._id,
        propertyId:    item.propertyId,
        src:           item.videoUrl,
        poster:        item.thumbnail?.url || "",
        caption:       item.caption || "",
        tags:          item.tags || [],
        username:      item.uploadedBy?.name || "landlord",
        avatar:        item.uploadedBy?.profileImage
                         ? `https://api.gharzoreality.com${item.uploadedBy.profileImage}`
                         : `https://i.pravatar.cc/100?img=${(i + 12) % 70}`,
        likes:         item.likes || 0,
        comments:      item.comments || 0,
        liked:         !!item.isLiked,
        saved:         !!item.isSaved,
        isBoosted:     !!item.isBoosted,
        views:         item.views || 0,
        uploadedBy:    item.uploadedBy,
      }));

      setResults(mapped);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const doNearbySearch = async () => {
    setLoading(true);
    setSearchedOnce(true);
    try {
      const token = getToken();
      if (!token) { alert("Please log in."); setLoading(false); return; }

      // Try browser geolocation first, fallback to Indore coords
      let lat = 22.7196, lng = 75.8762;
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {}

      const res = await fetch(`${BASE}/reels/search?lat=${lat}&lng=${lng}&radius=10&page=1&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("nearby search failed");
      const json = await res.json();

      const mapped = (json.data || []).map((item, i) => ({
        id:            item._id,
        propertyId:    item.propertyId,
        src:           item.videoUrl,
        poster:        item.thumbnail?.url || "",
        caption:       item.caption || "",
        tags:          item.tags || [],
        username:      item.uploadedBy?.name || "landlord",
        avatar:        item.uploadedBy?.profileImage
                         ? `https://api.gharzoreality.com${item.uploadedBy.profileImage}`
                         : `https://i.pravatar.cc/100?img=${(i + 12) % 70}`,
        likes:         item.likes || 0,
        comments:      item.comments || 0,
        liked:         !!item.isLiked,
        saved:         !!item.isSaved,
        isBoosted:     !!item.isBoosted,
        views:         item.views || 0,
        uploadedBy:    item.uploadedBy,
      }));

      setResults(mapped);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* user clicks "Use in feed" on a result → load into main feed */
  const useInFeed = () => {
    if (results && results.length > 0) onResults(results);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
      {/* header */}
      <div className="flex items-center gap-2 px-4 pt-safe-top pb-2" style={{ paddingTop: "env(safe-area-inset-top, 12px)" }}>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>

        <div className="flex-1 relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
               className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Search reels…"
            className="w-full rounded-full border border-white/15 bg-white/8 pl-9 pr-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30 transition"
          />
        </div>
      </div>

      {/* filters row */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="flex-1 min-w-[80px] max-w-[140px] rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[12px] text-white placeholder-white/35 outline-none focus:border-white/30"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
          className="flex-1 min-w-[120px] rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[12px] text-white placeholder-white/35 outline-none focus:border-white/30"
        />
        <button
          onClick={doSearch}
          className="px-4 py-1.5 bg-white text-black rounded-full text-[12px] font-semibold hover:bg-white/90 transition"
        >
          Search
        </button>

        {/* nearby btn */}
        <button
          onClick={doNearbySearch}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 rounded-full text-[12px] text-white/80 hover:bg-white/8 transition"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
          </svg>
          Nearby
        </button>
      </div>

      {/* results */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-safe-bottom" style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {!loading && searchedOnce && results && results.length === 0 && (
          <p className="text-center text-white/35 text-sm py-10">No results found. Try different keywords.</p>
        )}

        {!loading && results && results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-white/45">{results.length} result{results.length !== 1 ? "s" : ""} found</span>
              <button
                onClick={useInFeed}
                className="text-[11px] text-sky-400 font-semibold hover:text-sky-300 transition"
              >
                Load in feed →
              </button>
            </div>

            <div className="space-y-3">
              {results.map((reel) => (
                <SearchResultCard key={reel.id} reel={reel} />
              ))}
            </div>
          </>
        )}

        {!loading && !searchedOnce && (
          <div className="flex flex-col items-center justify-center h-full text-white/25 text-sm py-16">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mb-3 opacity-50">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search for properties, locations or tags
          </div>
        )}
      </div>
    </div>
  );
}

/* ── single search result card ── */
function SearchResultCard({ reel }) {
  return (
    <div className="flex gap-3 bg-white/5 border border-white/8 rounded-xl p-3">
      {/* thumbnail / poster */}
      <div className="w-24 h-16 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
        {reel.poster ? (
          <img src={reel.poster} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-sm text-white font-medium line-clamp-2 leading-snug">{reel.caption || "Untitled"}</p>
          <p className="text-[11px] text-white/40 mt-0.5">@{reel.username}</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {/* likes */}
          <span className="flex items-center gap-1 text-[11px] text-white/45">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {reel.likes}
          </span>
          {/* comments */}
          <span className="flex items-center gap-1 text-[11px] text-white/45">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {reel.comments}
          </span>
          {/* tags */}
          {reel.tags.length > 0 && (
            <span className="text-[10px] text-sky-400/70">#{reel.tags[0]}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DEFAULT EXPORT
   ════════════════════════════════════════════== */
export default ReelsPage;