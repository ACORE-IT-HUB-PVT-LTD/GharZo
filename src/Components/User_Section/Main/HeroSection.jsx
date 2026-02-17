import { FaAngleDown } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch, FaMapMarkerAlt, FaHome, FaBuilding,
  FaWarehouse, FaTimes, FaUserAlt, FaUserTie, FaTools,
  FaRupeeSign
} from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";

/* ─────────────────────────────────────────────
   Budget presets per property type
───────────────────────────────────────────── */
const BUDGET_PRESETS = {
  Buy:        ["₹5 Lac","₹10 Lac","₹20 Lac","₹30 Lac","₹40 Lac","₹50 Lac","₹60 Lac","₹75 Lac","₹1 Cr","₹1.5 Cr","₹2 Cr","₹3 Cr"],
  Rent:       ["₹2,000","₹5,000","₹8,000","₹10,000","₹15,000","₹20,000","₹25,000","₹30,000","₹40,000","₹50,000"],
  PG:         ["₹2,000","₹3,000","₹4,000","₹5,000","₹6,000","₹8,000","₹10,000","₹12,000","₹15,000"],
  Plot:       ["₹5 Lac","₹10 Lac","₹15 Lac","₹25 Lac","₹30 Lac","₹40 Lac","₹50 Lac","₹75 Lac","₹1 Cr","₹2 Cr"],
  Commercial: ["₹20,000","₹50,000","₹1 Lac","₹2 Lac","₹3 Lac","₹5 Lac","₹7 Lac","₹10 Lac"],
  Hostel:     ["₹2,000","₹3,000","₹4,000","₹5,000","₹7,000","₹10,000","₹12,000","₹15,000"],
  Hotel:      ["₹50,000","₹1 Lac","₹2 Lac","₹3 Lac","₹5 Lac","₹7 Lac","₹10 Lac"],
  Banquet:    ["₹20,000","₹50,000","₹1 Lac","₹2 Lac","₹3 Lac","₹5 Lac"],
  default:    ["₹5,000","₹10,000","₹20,000","₹30,000","₹50,000","₹75,000","₹1 Lac","₹2 Lac","₹3 Lac"],
};

/* ─────────────────────────────────────────────
   BudgetDropdown — self-contained component
───────────────────────────────────────────── */
const BudgetDropdown = ({ selectedType, minPrice, setMinPrice, maxPrice, setMaxPrice }) => {
  const [open, setOpen]           = useState(false);
  const [activeTab, setActiveTab] = useState("min");
  const wrapperRef                = useRef(null);

  const presets = BUDGET_PRESETS[selectedType] || BUDGET_PRESETS.default;

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // reset on type change
  useEffect(() => {
    setMinPrice("");
    setMaxPrice("");
  }, [selectedType]);

  const label = () => {
    if (minPrice && maxPrice) return `${minPrice} – ${maxPrice}`;
    if (minPrice)             return `Min ${minPrice}`;
    if (maxPrice)             return `Max ${maxPrice}`;
    return "Budget";
  };

  const hasValue = minPrice || maxPrice;

  const handlePreset = (val) => {
    if (activeTab === "min") {
      setMinPrice(val);
      setActiveTab("max");
    } else {
      setMaxPrice(val);
      setOpen(false);
      setActiveTab("min");
    }
  };

  const clearAll = (e) => {
    e.stopPropagation();
    setMinPrice("");
    setMaxPrice("");
    setActiveTab("min");
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>

      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => { setOpen((p) => !p); if (!open) setActiveTab("min"); }}
        style={{
          width: "100%",
          height: "46px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "0 12px",
          background: "rgba(255,255,255,0.20)",
          border: "1px solid rgba(255,255,255,0.30)",
          borderRadius: "12px",
          color: "white",
          fontSize: "14px",
          cursor: "pointer",
          backdropFilter: "blur(12px)",
          transition: "background 0.2s",
          outline: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
      >
        {/* rupee icon */}
        <FaRupeeSign style={{ color: "#fb923c", flexShrink: 0, fontSize: "11px" }} />

        {/* label */}
        <span style={{
          flex: 1,
          textAlign: "left",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: hasValue ? "white" : "rgba(255,255,255,0.55)",
          fontWeight: hasValue ? 600 : 400,
        }}>
          {label()}
        </span>

        {/* clear × */}
        {hasValue && (
          <span
            onMouseDown={clearAll}
            style={{ color: "rgba(255,255,255,0.5)", flexShrink: 0, cursor: "pointer", padding: "2px" }}
          >
            <FaTimes size={10} />
          </span>
        )}

        {/* chevron */}
        <FaAngleDown
          size={12}
          style={{
            flexShrink: 0,
            color: "rgba(255,255,255,0.7)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: "260px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)",
            border: "1px solid #f1f5f9",
            zIndex: 99999,
            overflow: "hidden",
          }}
        >
          {/* Min / Max tabs */}
          <div style={{ display: "flex", gap: "8px", padding: "12px 12px 10px", borderBottom: "1px solid #f1f5f9" }}>
            {["min", "max"].map((tab) => {
              const isActive = activeTab === tab;
              const val      = tab === "min" ? minPrice : maxPrice;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: "10px",
                    border: isActive ? "2px solid #111827" : "2px solid #e2e8f0",
                    background: isActive ? "#111827" : "#f8fafc",
                    color: isActive ? "white" : "#64748b",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    lineHeight: 1.3,
                  }}
                >
                  {tab === "min" ? "Min Price" : "Max Price"}
                  {val && (
                    <span style={{
                      display: "block",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: isActive ? "#fb923c" : "#f97316",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {val}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Manual input */}
          <div style={{ padding: "10px 12px 6px" }}>
            <input
              type="text"
              placeholder={activeTab === "min" ? "Type min price..." : "Type max price..."}
              value={activeTab === "min" ? minPrice : maxPrice}
              onChange={(e) =>
                activeTab === "min" ? setMinPrice(e.target.value) : setMaxPrice(e.target.value)
              }
              style={{
                width: "100%",
                border: "2px solid #e2e8f0",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "13px",
                color: "#1e293b",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e)  => (e.target.style.borderColor = "#f97316")}
              onBlur={(e)   => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Preset list */}
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {/* No min / No max */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === "min") { setMinPrice(""); setActiveTab("max"); }
                else { setMaxPrice(""); setOpen(false); setActiveTab("min"); }
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 16px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#94a3b8",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {activeTab === "min" ? "No Min" : "No Max"}
            </button>

            {presets.map((val) => {
              const isSelected = activeTab === "min" ? minPrice === val : maxPrice === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePreset(val)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "#ea580c" : "#334155",
                    background: isSelected ? "#fff7ed" : "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "#fff7ed";
                      e.currentTarget.style.color = "#ea580c";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.color = "#334155";
                    }
                  }}
                >
                  {val}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            display: "flex",
            gap: "8px",
            padding: "10px 12px",
            borderTop: "1px solid #f1f5f9",
            background: "#f8fafc",
          }}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setMinPrice(""); setMaxPrice(""); setActiveTab("min"); }}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#64748b",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "12px",
                fontWeight: 700,
                color: "white",
                background: "#f97316",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#ea580c")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f97316")}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


/* ─────────────────────────────────────────────
   Main HeroSection
───────────────────────────────────────────── */
const HeroSection = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused,          setIsPaused]          = useState(false);
  const [searchQuery,       setSearchQuery]        = useState("");
  const [selectedCategory,  setSelectedCategory]   = useState("Rent");
  const [selectedType,      setSelectedType]       = useState("");
  const [isModalOpen,       setIsModalOpen]        = useState(false);
  const [minPrice,          setMinPrice]           = useState("");
  const [maxPrice,          setMaxPrice]           = useState("");

  const heroImages = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80",
  ];

  const categories = [
    { id: "Buy",        label: "Buy",        icon: FaHome      },
    { id: "Rent",       label: "Rent",       icon: FaBuilding  },
    { id: "PG",         label: "PG",         icon: FaUserAlt   },
    { id: "Plot",       label: "Plot",       icon: FaWarehouse },
    { id: "Commercial", label: "Commercial", icon: FaBuilding  },
  ];

  const propertyTypes = [
    "Property Type","Buy","Rent","PG","Plot","Commercial","Hostel","Hotel","Banquet",
  ];

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setCurrentImageIndex((p) => (p === heroImages.length - 1 ? 0 : p + 1));
    }, 5000);
    return () => clearInterval(id);
  }, [isPaused, heroImages.length]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim())                               params.set("q",        searchQuery.trim());
    if (selectedType && selectedType !== "Property Type") params.set("type",     selectedType);
    if (minPrice)                                         params.set("minPrice", minPrice);
    if (maxPrice)                                         params.set("maxPrice", maxPrice);
    navigate(`/?${params.toString()}`);
    document.getElementById("properties-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-[75vh] sm:min-h-[80vh] md:min-h-[65vh] flex items-center justify-center text-white hero-section pt-16 sm:pt-10 pb-8"
      style={{ overflow: "visible" }}
    >
      {/* Background Slider */}
      <div className="absolute inset-0 z-0" style={{ overflow: "hidden" }}>
        <AnimatePresence initial={false}>
          <motion.img
            key={currentImageIndex}
            src={heroImages[currentImageIndex]}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main Content */}
      <div className="relative z-30 px-4 sm:px-6 max-w-6xl mx-auto w-full" style={{ overflow: "visible" }}>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.h1
            onClick={() => navigate("/")}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-cyan-100 to-orange-200 bg-clip-text text-transparent drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            Welcome to GharZo
          </motion.h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-200 px-4">
            Your one-stop solution to rent, buy, and sell property
          </p>
        </motion.div>

        {/* Search Card — overflow:visible is critical */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-white/25 shadow-2xl"
          style={{ overflow: "visible" }}
        >
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 border-b border-white/20 pb-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
              Find Your Perfect <span className="text-orange-400">Property</span>
            </h1>

            <button
              onClick={() => navigate(user ? "/add-listing" : "/login")}
              className="relative bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/30 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                Add Property
              </span>
              <motion.span
                animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-2 -right-2 bg-blue-600 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow border border-orange-300 font-bold text-white"
              >
                FREE
              </motion.span>
            </button>
          </div>

          {/* Inputs row — overflow visible so dropdown is never clipped */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3"
            style={{ overflow: "visible" }}
          >

            {/* Location */}
            <div className="sm:col-span-2 lg:col-span-4 relative">
              <FaMapMarkerAlt className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-orange-400 z-10 text-sm" />
              <input
                type="text"
                placeholder="Enter City, Locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full bg-white/20 border border-white/30 rounded-xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-3 outline-none focus:ring-2 ring-orange-500/50 focus:bg-white/25 transition-all text-white placeholder:text-white/60 text-sm sm:text-base backdrop-blur-sm"
              />
            </div>

            {/* Property Type */}
            <div className="sm:col-span-1 lg:col-span-3 relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-xl py-3 sm:py-3.5 px-3 sm:px-4 outline-none appearance-none cursor-pointer text-white text-sm sm:text-base backdrop-blur-sm focus:ring-2 ring-orange-500/50 focus:bg-white/25 transition-all"
              >
                {propertyTypes.map((t) => (
                  <option key={t} value={t === "Property Type" ? "" : t} className="text-black bg-white">
                    {t}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/70">
                <FaAngleDown size={12} />
              </div>
            </div>

            {/* Budget */}
            <div
              className="sm:col-span-1 lg:col-span-3"
              style={{ position: "relative", zIndex: 9999, overflow: "visible" }}
            >
              <BudgetDropdown
                selectedType={selectedType}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="sm:col-span-2 lg:col-span-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-3 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <FaSearch className="text-sm sm:text-base" />
              <span>Search</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Post Property Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md sm:max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 sm:p-8 text-center relative">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes size={20} />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 pr-8">
                  Reach out to 15 Lac Buyers & Tenants
                </h2>
                <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 font-medium">
                  Post your property in just 5 minutes!
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {[
                    { label: "Owner",   icon: FaUserAlt },
                    { label: "Agent",   icon: FaUserTie },
                    { label: "Builder", icon: FaTools   },
                  ].map((role) => (
                    <button
                      key={role.label}
                      className="group flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 transition-all active:scale-95"
                    >
                      <role.icon className="text-xl sm:text-2xl mb-1.5 sm:mb-2 text-gray-400 group-hover:text-orange-500 transition-colors" />
                      <span className="text-xs sm:text-sm font-bold text-gray-700">{role.label}</span>
                    </button>
                  ))}
                </div>
                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl text-base sm:text-lg shadow-lg transition-all active:scale-95">
                  Continue to Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 hidden md:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <div className="w-5 h-8 border-2 border-white/40 rounded-full flex justify-center items-start pt-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="text-white text-xs"
          >
            <FaAngleDown />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;