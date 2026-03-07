// TenantSidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Building2,
  LogOut,
  Home,
  CreditCard,
  FileText,
  Megaphone,
  Receipt,
  Move,
  Menu,
  X,
  ChevronRight,
  Bell,
} from "lucide-react";

import logo from "../../assets/logo/logo.png";
import dd from "../../assets/logo/icon.png";

/* ─── NavItem (matches Landlord sidebar pattern) ─────────────────────────── */
const NavItem = ({ to, icon: Icon, label, onClick, isExpanded, gradient }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === "/tenant"}
    title={!isExpanded ? label : ""}
    className={({ isActive }) =>
      `group relative flex items-center ${
        isExpanded ? "gap-3 px-3" : "justify-center px-2"
      } py-2.5 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden ${
        isActive
          ? "tenant-nav-active text-white shadow-md"
          : "text-slate-600 hover:bg-orange-50 hover:text-[#E07B1A]"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
            isActive
              ? "bg-white/20"
              : "bg-slate-100 group-hover:bg-orange-100"
          }`}
        >
          <Icon
            size={15}
            className={
              isActive
                ? "text-white"
                : "text-[#1B2A4A] group-hover:text-[#E07B1A]"
            }
          />
        </div>

        {isExpanded && (
          <span className="truncate flex-1 text-sm tracking-wide">{label}</span>
        )}

        {isExpanded && !isActive && (
          <ChevronRight
            size={13}
            className="flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity duration-200 text-[#E07B1A]"
          />
        )}
      </>
    )}
  </NavLink>
);

/* ─── Section Divider ─────────────────────────────────────────────────────── */
const SectionDivider = ({ label, isExpanded }) => (
  <div className="flex items-center gap-2 px-3 pt-5 pb-2">
    {isExpanded && (
      <span className="text-[9px] font-black text-[#1B2A4A]/40 uppercase tracking-[0.15em] whitespace-nowrap">
        {label}
      </span>
    )}
    <div
      className="flex-1 h-px"
      style={{
        background: isExpanded
          ? "linear-gradient(90deg, #E07B1A33, #1B2A4A22, transparent)"
          : "#e2e8f0",
      }}
    />
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */
const TenantSidebar = ({ setSidebarWidth, tenantId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const navigate = useNavigate();

  /* ── Resize listener ── */
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── Sidebar width callback ── */
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarWidth(0);
    } else {
      setSidebarWidth(isHovered ? 256 : 80);
    }
  }, [isHovered, setSidebarWidth]);

  const isExpanded = !isDesktop || isHovered;

  /* ── Clear storage ── */
  const clearLocalStorage = () => {
    localStorage.removeItem("tenantId");
    localStorage.removeItem("tenanttoken");
    localStorage.removeItem("tenant");
    localStorage.removeItem("rzp_checkout_anon_id");
    localStorage.removeItem("rzp_device_id");
    localStorage.removeItem("rzp_stored_checkout_id");
  };

  /* ── Logout ── */
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("tenanttoken");
      if (!token) {
        clearLocalStorage();
        navigate("/");
        setIsMobileOpen(false);
        return;
      }

      const response = await fetch(
        "https://api.gharzoreality.com/api/tenant/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      clearLocalStorage();

      if (!response.ok) {
        console.warn("Logout API failed, but storage cleared.");
      }

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      clearLocalStorage();
      navigate("/");
    }
    setIsMobileOpen(false);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 768) setIsMobileOpen(false);
  };

  /* ── Nav items ── */
  const navItems = [
    { name: "Dashboard",     path: "/tenant",                                                icon: Home,      section: "Main" },
    { name: "Properties",    path: "/tenant/property",                                       icon: Building2, section: "Main" },
    { name: "Tenant Notice", path: tenantId ? `/tenant/notice/${tenantId}` : "/tenant/notice",         icon: Bell,      section: "Management" },
    { name: "Complaints",    path: tenantId ? `/tenant/complaints/${tenantId}` : "/tenant/complaints", icon: FileText,  section: "Management" },
    { name: "Announcements", path: tenantId ? `/tenant/announcements/${tenantId}` : "/tenant/announcements", icon: Megaphone, section: "Management" },
    { name: "Payment",       path: tenantId ? `/tenant/payment/${tenantId}` : "/tenant/payment",       icon: CreditCard, section: "Finance" },
    { name: "Documents",     path: "/tenant/documents",                                     icon: Receipt,   section: "Finance" },
    { name: "Roomswitch",    path: "/tenant/room-switch",                                   icon: Move,      section: "Finance" },
    { name: "Profile",       path: "/tenant/profile",                                       icon: User,      section: "Account" },
  ];

  const sections = ["Main", "Management", "Finance", "Account"];

  return (
    <>
      {/* ── Mobile Toggle ── */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200 flex items-center justify-center active:scale-95"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X size={20} className="text-[#1B2A4A]" />
        ) : (
          <Menu size={20} className="text-[#1B2A4A]" />
        )}
      </button>

      {/* ── Sidebar ── */}
      <aside
        onMouseEnter={() => isDesktop && setIsHovered(true)}
        onMouseLeave={() => isDesktop && setIsHovered(false)}
        className={`
          fixed top-0 left-0 h-screen
          ${isHovered ? "lg:w-64" : "lg:w-[72px]"} w-72
          bg-white z-40
          transform transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col
          tenant-sidebar
        `}
      >
        {/* Top accent line — orange → navy → orange */}
        <div
          className="h-[3px] w-full flex-shrink-0"
          style={{
            background:
              "linear-gradient(90deg, #E07B1A 0%, #1B2A4A 60%, #E07B1A 100%)",
          }}
        />

        {/* ── Logo Area ── */}
        <div
          className="flex-shrink-0 flex flex-col items-center justify-center px-3 pt-5 pb-4 border-b border-slate-100"
          style={{
            background:
              "linear-gradient(160deg, #fff9f4 0%, #ffffff 60%, #f0f4ff 100%)",
          }}
        >
          <div
            className={`transition-all duration-300 overflow-hidden flex items-center justify-center ${
              isExpanded ? "w-28" : "w-10"
            }`}
          >
            <img
              src={logo}
              alt="Logo"
              className="w-full h-auto object-contain"
            />
          </div>

          {isExpanded && (
            <>
              <p className="mt-2 text-[10px] font-black tracking-[0.2em] text-[#1B2A4A]/40 uppercase">
                Tenant Portal
              </p>
              <div
                className="mt-2 w-3/4 h-px rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #E07B1A88, transparent)",
                }}
              />
            </>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-0.5 tenant-scrollbar">
          {sections.map((section) => {
            const items = navItems.filter((i) => i.section === section);
            if (!items.length) return null;
            return (
              <React.Fragment key={section}>
                <SectionDivider label={section} isExpanded={isExpanded} />
                {items.map((item) => (
                  <NavItem
                    key={item.name}
                    to={item.path}
                    icon={item.icon}
                    label={item.name}
                    onClick={closeSidebar}
                    isExpanded={isExpanded}
                  />
                ))}
              </React.Fragment>
            );
          })}
          <div className="h-4" />
        </nav>

        {/* ── Footer ── */}
        <div
          className="flex-shrink-0 px-2.5 py-3 border-t border-slate-100"
          style={{ background: "#f8fafc" }}
        >
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isExpanded ? "gap-2.5 px-3" : "justify-center px-2"
            } py-2.5 rounded-xl border transition-all duration-200 cursor-pointer tenant-logout-btn`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50">
              <LogOut size={15} className="text-red-500" />
            </div>
            {isExpanded && (
              <span className="text-xs font-bold text-red-500 tracking-wide">
                Logout
              </span>
            )}
          </button>

          {/* Status badge */}
          {isExpanded && (
            <div className="flex items-center justify-between px-3 py-2 tenant-status-card rounded-xl mt-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-semibold text-[#1B2A4A]/70">
                  Active Session
                </span>
              </div>
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-lg tracking-wide"
                style={{
                  background: "linear-gradient(135deg, #E07B1A22, #1B2A4A11)",
                  color: "#E07B1A",
                  border: "1px solid #E07B1A33",
                }}
              >
                Tenant
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Overlay ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#1B2A4A]/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ── Styles ── */}
      <style>{`
        /* Gharzo Brand: Navy #1B2A4A · Orange #E07B1A · White #FFFFFF */

        .tenant-sidebar {
          border-right: 1px solid #e8edf5;
          box-shadow: 4px 0 24px rgba(27, 42, 74, 0.06);
        }

        /* Active nav — navy gradient with orange left-bar accent */
        .tenant-nav-active {
          background: linear-gradient(135deg, #1B2A4A 0%, #243660 100%);
          box-shadow:
            0 4px 15px rgba(27, 42, 74, 0.25),
            inset 0 1px 0 rgba(255,255,255,0.08);
          position: relative;
        }
        .tenant-nav-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 3px;
          background: linear-gradient(180deg, #E07B1A, #f5a623);
          border-radius: 0 4px 4px 0;
        }

        /* Scrollbar */
        .tenant-scrollbar::-webkit-scrollbar { width: 3px; }
        .tenant-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .tenant-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #E07B1A44, #1B2A4A33);
          border-radius: 10px;
        }
        .tenant-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #E07B1A88, #1B2A4A66);
        }

        /* Logout */
        .tenant-logout-btn {
          background: #fff5f5;
          border: 1px solid #fecdd3;
        }
        .tenant-logout-btn:hover {
          background: #fee2e2;
          border-color: #fca5a5;
        }

        /* Status card */
        .tenant-status-card {
          background: linear-gradient(135deg, #f8fafc, #fff9f4);
          border: 1px solid #e8edf5;
        }
      `}</style>
    </>
  );
};

export default TenantSidebar;