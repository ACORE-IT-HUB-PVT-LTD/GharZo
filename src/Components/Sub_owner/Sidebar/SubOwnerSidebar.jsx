import logo from "../../../assets/logo/logo.png";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Building2,
  LogOut,
  UserPlus,
  X,
  Menu,
  BadgeCheck,
} from "lucide-react";
import { FaBoxOpen, FaMoneyBill, FaTeamspeak } from "react-icons/fa";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const Colorful3DIcon = ({ icon: Icon, gradient, size = 22 }) => (
  <motion.div
    whileHover={{ scale: 1.15, rotate: 4, y: -3 }}
    className="p-2 rounded-xl shadow-lg bg-white/20 backdrop-blur-xl border border-white/30"
  >
    <div
      className={`bg-gradient-to-br ${gradient} p-2 rounded-xl shadow-xl`}
    >
      <Icon size={size} className="text-white drop-shadow" />
    </div>
  </motion.div>
);

const Sidebar = ({ setSidebarWidth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass =
    "flex items-center gap-4 py-3 px-4 text-white rounded-xl transition-all group hover:bg-white/10";
  const activeClass =
    "bg-[#0A2F56] border-l-4 border-[#FF6900] shadow-xl";

  const navItems = [
    { text: "Dashboard", to: "/sub_owner/dashboard", icon: LayoutDashboard, gradient: "from-[#0A2F56] to-[#4C6F8F]" },
    { text: "Property", to: "/sub_owner/sub_owner_property", icon: Building2, gradient: "from-[#FF6900] to-[#b74b00]" },
    { text: "Tenant", to: "/sub_owner/sub_owner_add_tenant", icon: UserPlus, gradient: "from-[#4C6F8F] to-[#0A2F56]" },
    { text: "Workers", to: "/sub_owner/sub_owner_add_workers", icon: FaTeamspeak, gradient: "from-[#C6CCD1] to-[#4C6F8F]" },
    { text: "Dues", to: "/sub_owner/dues", icon: FaBoxOpen, gradient: "from-[#FF6900] to-[#ff8e3c]" },
    { text: "Expenses", to: "/sub_owner/sub_owner_expenses", icon: FaMoneyBill, gradient: "from-[#0A2F56] to-[#1b4c7d]" },
    { text: "Announcements", to: "/sub_owner/announcements", icon: FileText, gradient: "from-[#FF6900] to-[#b74b00]" },
    // { text: "Police Verification", to: "/sub_owner/police-verification", icon: BadgeCheck, gradient: "from-[#FF6900] to-[#cc5600]" },
    { text: "Profile", to: "/sub_owner/sub_owner_profile", icon: User, gradient: "from-[#4C6F8F] to-[#0A2F56]" },
  ];

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarWidth(0);
    } else {
      setSidebarWidth(isHovered ? 240 : 90);
    }
  }, [isHovered, setSidebarWidth]);

  const handleLogout = () => {
    localStorage.removeItem("subOwnerToken");
    navigate("/");
    setIsMobileOpen(false);
  };

  const handleNavLinkClick = () => {
    if (window.innerWidth < 768) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-[10000]">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 bg-[#0A2F56] text-white rounded-lg shadow-lg"
        >
          <Menu size={22} />
        </button>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b 
          from-[#0A2F56] via-[#4C6F8F] to-[#0A2F56]
          text-white shadow-2xl border-r border-white/20
          backdrop-blur-3xl transition-all duration-500 z-[9999]
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          ${isHovered ? "md:w-60" : "md:w-24"}
          flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden
        `}
      >
        {/* Close for Mobile */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden absolute right-4 top-4 text-white"
          >
            <X size={26} />
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-3 p-5">
          <img
            src={logo}
            alt="Logo"
            className="w-19 h-12 rounded-xl shadow-xl border border-white bg-white "
          />
          {/* {(isHovered || isMobileOpen) && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-lg tracking-wide"
            >
              Sub Owner
            </motion.h1>
          )} */}
        </div>

        {/* Menu Items */}
        <ul className="space-y-2 mt-4 px-3">
          {navItems.map((item) => (
            <li key={item.text}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  isActive ? `${linkClass} ${activeClass}` : linkClass
                }
                onClick={handleNavLinkClick}
              >
                <Colorful3DIcon icon={item.icon} gradient={item.gradient} />
                {(isHovered || isMobileOpen) && (
                  <span className="text-sm font-medium">{item.text}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full py-3 px-4 rounded-xl bg-[#FF6900] hover:bg-[#d85a00] shadow-xl transition-all"
          >
            <LogOut size={22} />
            {(isHovered || isMobileOpen) && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
