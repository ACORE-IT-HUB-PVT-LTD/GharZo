import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaPlus,
  FaBuilding,
  FaUser,
  FaSignOutAlt,
  FaVideo,
  FaUserCircle,
  FaExchangeAlt,
  FaUserPlus,
  FaMoneyBillWave,
  FaDiagnoses,
  FaComments,
  FaMoneyBill,
} from "react-icons/fa";
import {
  FiMenu,
  FiX,
  FiChevronRight as FiChevronRightIcon,
} from "react-icons/fi";
import logo from "../../../assets/logo/logo.png";
import { useAuth } from "../../User_Section/Context/AuthContext";

const NavItem = ({ to, icon: Icon, label, onClick, badge, isExpanded }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === "/landlord"}
    title={!isExpanded ? label : ""}
    className={({ isActive }) =>
      `group relative flex items-center ${isExpanded ? "gap-3 px-3" : "justify-center px-2"} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden ${
        isActive
          ? "gharzo-nav-active text-white shadow-md"
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
            className={isActive ? "text-white" : "text-[#1B2A4A] group-hover:text-[#E07B1A]"}
          />
        </div>
        {isExpanded && (
          <span className="truncate flex-1 text-sm tracking-wide">{label}</span>
        )}
        {isExpanded && badge && (
          <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-[#E07B1A] text-white rounded-full">
            {badge}
          </span>
        )}
        {isExpanded && !isActive && (
          <FiChevronRightIcon
            size={13}
            className="flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity duration-200 text-[#E07B1A]"
          />
        )}
      </>
    )}
  </NavLink>
);

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

const Sidebar = ({ propertyId, setSidebarWidth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();
  const location = useLocation();
  const { landlordlogout } = useAuth();

  const isPropertyPage =
    location.pathname.includes("/property/") &&
    !location.pathname.includes("/add-property");

  const handleLogout = async () => {
    localStorage.removeItem("addedDues");
    localStorage.removeItem("id");
    localStorage.removeItem("landlord");
    localStorage.removeItem("userLocation");
    localStorage.removeItem("landlordId");
    localStorage.removeItem("linkedLandord");
    localStorage.removeItem("propertyId");
    try {
      await landlordlogout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("landlordId");
      navigate("/");
    }
    setIsMobileOpen(false);
  };

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarWidth(0);
    } else {
      setSidebarWidth(isHovered ? 256 : 80);
    }
  }, [isHovered, setSidebarWidth, isPropertyPage]);

  const toggleSidebar = () => setIsMobileOpen(!isMobileOpen);
  const closeSidebar = () => setIsMobileOpen(false);
  const isExpanded = !isDesktop || isHovered;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200 flex items-center justify-center active:scale-95"
        onClick={toggleSidebar}
      >
        {isMobileOpen ? (
          <FiX size={20} className="text-[#1B2A4A]" />
        ) : (
          <FiMenu size={20} className="text-[#1B2A4A]" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`sidebar
          fixed top-0 left-0 h-screen w-72 ${isHovered ? "lg:w-64" : "lg:w-[72px]"}
          bg-white z-40
          transform transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col
          gharzo-sidebar
        `}
      >
        {/* Decorative top accent line */}
        <div
          className="h-[3px] w-full flex-shrink-0"
          style={{
            background: "linear-gradient(90deg, #E07B1A 0%, #1B2A4A 60%, #E07B1A 100%)",
          }}
        />

        {/* Logo Area */}
        <div
          className="flex-shrink-0 flex flex-col items-center justify-center px-3 pt-5 pb-4 border-b border-slate-100"
          style={{
            background:
              "linear-gradient(160deg, #fff9f4 0%, #ffffff 60%, #f0f4ff 100%)",
          }}
        >
          <div
            className={`transition-all duration-300 ${
              isExpanded ? "w-32" : "w-10"
            } overflow-hidden flex items-center justify-center`}
          >
            <img
              src={logo}
              alt="Gharzo Realty"
              className="w-full h-auto object-contain"
            />
          </div>
          {isExpanded && (
            <>
              <p className="mt-2 text-[10px] font-bold tracking-[0.2em] text-[#1B2A4A]/40 uppercase">
                Management Portal
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-0.5 gharzo-scrollbar">
          <SectionDivider label="Main" isExpanded={isExpanded} />
          <NavItem to="/landlord" icon={FaTachometerAlt} label="Dashboard" onClick={closeSidebar} isExpanded={isExpanded} />
          <NavItem to="/landlord/property" icon={FaBuilding} label="Properties" onClick={closeSidebar} isExpanded={isExpanded} />
          <NavItem to="/landlord/add-property" icon={FaPlus} label="Add Property" onClick={closeSidebar} isExpanded={isExpanded} />

          <SectionDivider label="Management" isExpanded={isExpanded} />
          <NavItem to="/landlord/tenant-form" icon={FaUserPlus} label="Add Tenant" onClick={closeSidebar} isExpanded={isExpanded} />
          <NavItem to="/landlord/room-switch" icon={FaExchangeAlt} label="Room Switch" onClick={closeSidebar} isExpanded={isExpanded} />
          <NavItem to="/landlord/workers" icon={FaUser} label="Workers" onClick={closeSidebar} isExpanded={isExpanded} />
          <NavItem to="/landlord/expenses" icon={FaMoneyBillWave} label="Expenses" onClick={closeSidebar} isExpanded={isExpanded} />

          <SectionDivider label="Finance & Support" isExpanded={isExpanded} />
          <NavItem to="/landlord/allComplaints" icon={FaComments} label="All Complaints" onClick={closeSidebar} isExpanded={isExpanded} />
          <NavItem to="/landlord/payments" icon={FaMoneyBill} label="Payments" onClick={closeSidebar} isExpanded={isExpanded} />
          <NavItem to="/landlord/announcement" icon={FaDiagnoses} label="Announcements" onClick={closeSidebar} isExpanded={isExpanded} />
          <NavItem to="/landlord/review" icon={FaDiagnoses} label="Reviews" onClick={closeSidebar} isExpanded={isExpanded} />

          <SectionDivider label="Content" isExpanded={isExpanded} />
          <NavItem to="/landlord/landlord_reels" icon={FaVideo} label="Reels" onClick={closeSidebar} isExpanded={isExpanded} />
          <NavItem to="/landlord/landlord_subadmin" icon={FaUserCircle} label="SubOwner" onClick={closeSidebar} isExpanded={isExpanded} />

          <div className="h-4" />
        </nav>

        {/* Footer */}
        <div
          className="flex-shrink-0 px-2.5 py-3 border-t border-slate-100"
          style={{ background: "#f8fafc" }}
        >
          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isExpanded ? "gap-2.5 px-3" : "justify-center px-2"
            } py-2.5 rounded-xl border transition-all duration-200 cursor-pointer gharzo-logout-btn`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50">
              <FaSignOutAlt className="text-sm text-red-500" />
            </div>
            {isExpanded && (
              <span className="text-xs font-bold text-red-500 tracking-wide">
                Logout
              </span>
            )}
          </button>

          {/* Status */}
          {isExpanded && (
            <div className="flex items-center justify-between px-3 py-2 gharzo-status-card rounded-xl mt-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-semibold text-[#1B2A4A]/70">
                  System Active
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
                v2.0.1
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#1B2A4A]/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <style>{`
        /* Gharzo Brand Colors:
           Navy Blue: #1B2A4A
           Orange/Gold: #E07B1A
           White bg: #FFFFFF
        */

        .gharzo-sidebar {
          border-right: 1px solid #e8edf5;
          box-shadow: 4px 0 24px rgba(27, 42, 74, 0.06);
        }

        /* Active nav item — navy to deep navy with subtle orange glow */
        .gharzo-nav-active {
          background: linear-gradient(135deg, #1B2A4A 0%, #243660 100%);
          box-shadow:
            0 4px 15px rgba(27, 42, 74, 0.25),
            inset 0 1px 0 rgba(255,255,255,0.08);
          position: relative;
        }

        .gharzo-nav-active::before {
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
        .gharzo-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .gharzo-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .gharzo-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #E07B1A44, #1B2A4A33);
          border-radius: 10px;
        }
        .gharzo-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #E07B1A88, #1B2A4A66);
        }

        /* Logout button */
        .gharzo-logout-btn {
          background: #fff5f5;
          border: 1px solid #fecdd3;
        }
        .gharzo-logout-btn:hover {
          background: #fee2e2;
          border-color: #fca5a5;
        }

        /* Status card */
        .gharzo-status-card {
          background: linear-gradient(135deg, #f8fafc, #fff9f4);
          border: 1px solid #e8edf5;
        }

        /* Hover state for nav items */
        .group:hover .group-hover\\:bg-orange-100 {
          background: #fff3e0 !important;
        }
      `}</style>
    </>
  );
};

export default Sidebar;