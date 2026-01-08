import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Building2,
  MessageCircle,
  User,
  CreditCard,
  LogOut,
} from "lucide-react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import logo from "../../../assets/logo/logo.png";
import { FaTachometerAlt } from "react-icons/fa";

const SellerNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // GSAP refs
  const logoRef = useRef(null);
  const iconRefs = useRef([]);
  const logoutRef = useRef(null);
  const hamburgerRef = useRef(null);

  const navItems = [
    { text: "Home", to: "/", icon: <Home size={18} /> },
    { text: "Seller Dashboard", to: "/seller/home", icon: <FaTachometerAlt size={18} /> },
    { text: "My Listings", to: "/seller/property", icon: <Building2 size={18} /> },
    { text: "Enquiries", to: "/seller/enquiries", icon: <MessageCircle size={18} /> },
    { text: "Profile", to: "/seller/seller-profile", icon: <User size={18} /> },
    { text: "Subscription", to: "/seller/subscription", icon: <CreditCard size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("sellertoken");
    localStorage.removeItem("role");
    toast.success("Logged out successfully!");
    console.log("Logged out, redirecting to /");
    setIsMenuOpen(false); // Close mobile menu
    navigate("/");
  };

  // Animations
  useEffect(() => {
    // Logo animation
    gsap.fromTo(
      logoRef.current,
      { scale: 0, rotateY: -90, opacity: 0 },
      { scale: 1, rotateY: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
    );

    // Nav items animation
    iconRefs.current.forEach((icon, i) => {
      gsap.fromTo(
        icon,
        { scale: 0, rotateY: 90, opacity: 0 },
        {
          scale: 1,
          rotateY: 0,
          opacity: 1,
          delay: i * 0.1,
          duration: 0.6,
          ease: "back.out(1.7)",
        }
      );
    });

    // Logout button animation
    gsap.fromTo(
      logoutRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: "power3.out" }
    );

    // Hamburger button animation
    gsap.fromTo(
      hamburgerRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, delay: 0.4, ease: "power3.out" }
    );
  }, []);

  return (
    <nav className="backdrop-blur-md shadow-md fixed top-0 left-0 w-full z-50 bg-white">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link to="/seller/home">
          <img ref={logoRef} src={logo} alt="Logo" className="w-28" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 text-gray-600 font-medium">
          {navItems.map((item, i) => (
            <Link
              key={item.text}
              ref={(el) => (iconRefs.current[i] = el)}
              to={item.to}
              className={`relative group flex items-center gap-2 hover:scale-110 transition-all duration-300 ${
                isActive(item.to) ? "text-sky-600 font-semibold" : ""
              }`}
            >
              <span className="text-sky-500 group-hover:drop-shadow-md">
                {item.icon}
              </span>
              <span className="group-hover:text-sky-600">{item.text}</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </div>

        {/* Right: Logout */}
        <div className="hidden md:block" ref={logoutRef}>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white shadow-lg hover:shadow-red-500/50 transition-all duration-300"
          >
            <LogOut size={18} className="drop-shadow-lg" />
            Logout
          </motion.button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <motion.button
            ref={hamburgerRef}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-white shadow-lg transition-all duration-300"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 text-white flex flex-col gap-4 p-4">
          {navItems.map((item) => (
            <Link
              key={item.text}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 hover:text-sky-300 transition-colors duration-200"
            >
              {item.icon}
              {item.text}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-500"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default SellerNavbar;