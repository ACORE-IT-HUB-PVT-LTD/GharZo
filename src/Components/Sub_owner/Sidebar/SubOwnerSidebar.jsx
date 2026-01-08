import dd from "../../../assets/logo/dd.png";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Building2,
  LogOut,
  Plus,
  UserPlus,
  X,
  Home,
  Menu,
  BadgeCheck,
} from "lucide-react";
import { FaBoxOpen, FaMoneyBill, FaTeamspeak } from "react-icons/fa";
import { motion } from "framer-motion";

const Colorful3DIcon = ({ icon: Icon, gradient, size = 20 }) => (
  <motion.div
    className={`relative p-2 rounded-full shadow-lg transform hover:scale-110 hover:rotate-6 transition-all duration-300 perspective-1000`}
    style={{ transformStyle: "preserve-3d" }}
    whileHover={{ y: -2 }}
  >
    <div
      className={`bg-gradient-to-br ${gradient} rounded-full p-1 shadow-md`}
    >
      <Icon size={size} className="text-white drop-shadow-lg" />
    </div>
    <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
  </motion.div>
);

const Sidebar = ({ setSidebarWidth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const linkClass =
    "flex items-center gap-3 py-2 px-3 rounded-md hover:bg-teal-600 hover:text-white transition-all relative group";
  const activeClass = "bg-teal-700 text-white";
  // Update sidebar width for desktop only
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarWidth(0); // mobile: no space for sidebar
    } else {
      setSidebarWidth(isHovered ? 224 : 80);
    }
  }, [isHovered, setSidebarWidth]);
  const handleLogout = () => {
    localStorage.removeItem("subOwnerToken");
    navigate("/");
    setIsMobileOpen(false); // Hide sidebar on logout (mobile)
  };
  // Function to handle NavLink clicks and hide sidebar on mobile
  const handleNavLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false); // Hide sidebar on mobile when any NavLink is clicked
    }
  };

  const navItems = [
    { text: "Home", to: "/", icon: Home, gradient: "from-indigo-500 to-purple-600" },
    { text: "Dashboard", to: "/sub_owner/dashboard", icon: LayoutDashboard, gradient: "from-blue-500 to-blue-700" },
    { text: "Property", to: "/sub_owner/sub_owner_property", icon: Building2, gradient: "from-green-500 to-emerald-600" },
    { text: "Tenant", to: "/sub_owner/sub_owner_add_tenant", icon: UserPlus, gradient: "from-cyan-500 to-teal-600" },
    { text: "Workers", to: "/sub_owner/sub_owner_add_workers", icon: FaTeamspeak, gradient: "from-purple-500 to-pink-600" },
    { text: "Dues", to: "/sub_owner/dues", icon: FaBoxOpen, gradient: "from-yellow-500 to-amber-600" },
    { text: "Expenses", to: "/sub_owner/sub_owner_expenses", icon: FaMoneyBill, gradient: "from-red-500 to-rose-600" },
    { text: "Police Verification", to: "/sub_owner/police-verification", icon: BadgeCheck, gradient: "from-slate-500 to-orange-300" },
    { text: "Profile", to: "/sub_owner/sub_owner_profile", icon: User, gradient: "from-slate-500 to-gray-600" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-[10000]">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 bg-teal-600 text-white rounded-md"
        >
          <Menu size={22} />
        </button>
      </div>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
      {/* Sidebar */}
      <div
        style={{ background: "linear-gradient(180deg, #ceb86fff, #625da7ff, #c8eb67ff)" }}
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        className={`
          fixed top-0 left-0 h-screen text-white shadow-2xl transition-all duration-500 ease-in-out z-[9999]
          ${
            isMobileOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full md:translate-x-0"
          }
          ${isHovered ? "md:w-56" : "md:w-20"}
          flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden
        `}
      >
        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden absolute right-4 top-4 text-white"
          >
            <X size={24} />
          </button>
        )}
        {/* Logo */}
        <div className="flex items-center gap-2 p-4">
          <img
            src={dd}
            alt="Logo"
            className="w-10 h-10 object-contain rounded-md shadow-md"
          />
          
        </div>
        {/* Menu */}
        <ul className="space-y-2 mt-6 px-2">
          {navItems.map((item) => (
            <li key={item.text}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  isActive ? `${linkClass} ${activeClass}` : linkClass
                }
                onClick={handleNavLinkClick}
              >
                <span className="group-hover:drop-shadow-md">
                  <Colorful3DIcon icon={item.icon} gradient={item.gradient} size={20} />
                </span>
                {(isHovered || isMobileOpen) && <span>{item.text}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
        {/* Logout */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full py-2 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white transition-all"
          >
            <LogOut size={20} />
            {(isHovered || isMobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};
export default Sidebar;