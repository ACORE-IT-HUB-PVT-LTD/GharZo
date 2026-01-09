// import React from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "../Context/AuthContext"; // optional if using context

// export default function HeaderSection() {
//   const navigate = useNavigate();
//   const { logout } = useAuth(); // optional

//   const handleLogout = () => {
//     if (logout) logout(); // optional
//     navigate("/");
//   };

//   return (
//     <div className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
{
  /* <NavLink
  to="/user/profile"
  className={({ isActive }) =>
    `text-xl font-semibold ${
      isActive ? "text-[#5C4EFF]" : "text-gray-800"
    } hover:underline`
  }
>
  Profile
</NavLink> */
}

//       <NavLink
//         to="/user/bookings"
//         className={({ isActive }) =>
//           `font-medium ${
//             isActive ? "text-[#5C4EFF]" : "text-gray-800"
//           } hover:underline`
//         }
//       >
//         My Bookings
//       </NavLink>

// <button
//   onClick={handleLogout}
//   className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
// >
//   Logout
// </button>
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Building2,
  Info,
  Phone,
  Video,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import logo from "../../../assets/logo/logo.png";
import { motion } from "framer-motion";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // GSAP refs
  const logoRef = useRef(null);
  const iconRefs = useRef([]);
  const buttonRef = useRef(null);

  const navItems = [
    { text: "Home", to: "/", icon: <Home size={18} /> },
    { text: "Properties", to: "/properties", icon: <Building2 size={18} /> },
    { text: "Reels", to: "/reels", icon: <Video size={18} /> },
    { text: "About Us", to: "/about", icon: <Info size={18} /> },
    { text: "Contact", to: "/contact", icon: <Phone size={18} /> },
  ];

  useEffect(() => {
    gsap.fromTo(
      logoRef.current,
      { scale: 0, rotateY: -90, opacity: 0 },
      { scale: 1, rotateY: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
    );

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

    gsap.fromTo(
      buttonRef.current,
      { y: -20, opacity: 0, rotateX: -90 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.6,
        delay: 0.3,
        ease: "power3.out",
      }
    );
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
 <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100">
  <div className="container mx-auto flex items-center justify-between px-4 py-2">
    {/* Logo Section */}
    <motion.div
      ref={logoRef}
      whileHover={{ scale: 1.05 }}
      className="ml-12"
    >
      <img 
        src={logo} 
        alt="GharZo" 
        className="h-17 w-[150px] object-contain" 
      />
    </motion.div>

    {/* Desktop Navigation */}
    <div className="hidden md:flex items-center gap-2">
      {navItems.map((item, i) => {
        const isActive = currentPath === item.to;
        return (
          <NavLink
            key={item.text}
            ref={(el) => (iconRefs.current[i] = el)}
            to={item.to}
            className={`relative group flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
              isActive 
                ? "bg-[#3B9DF8] text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className={`${isActive ? 'text-white' : 'text-gray-600'} transition-colors text-lg`}>
              {item.icon}
            </span>
            <span className="font-medium text-sm">{item.text}</span>
          </NavLink>
        );
      })}
    </div>

    {/* Right Section */}
    <div className="flex items-center gap-3">
      <div ref={buttonRef} className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3B9DF8] text-white shadow-md hover:shadow-lg hover:bg-[#2B8DE8] transition-all duration-300 font-medium text-sm"
        >
          <LogOut size={18} className="drop-shadow-lg" />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-full bg-[#3B9DF8] text-white shadow-md hover:shadow-lg transition-all duration-300"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </div>
  </div>

  {/* Mobile Menu */}
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="md:hidden bg-white border-t border-gray-100"
    >
      <div className="container mx-auto px-6 py-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.to;
          return (
            <NavLink
              key={item.text}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ${
                isActive 
                  ? "bg-[#3B9DF8] text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className={`${isActive ? 'text-white' : 'text-gray-600'} text-lg`}>{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </NavLink>
          );
        })}
        
        <div className="h-px bg-gray-200 my-2"></div>
        
        <button
          className="flex items-center gap-3 px-4 py-3 rounded-full bg-[#3B9DF8] text-white shadow-md font-medium"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  )}
</nav>
    </>
  );
}

export default Navbar;
