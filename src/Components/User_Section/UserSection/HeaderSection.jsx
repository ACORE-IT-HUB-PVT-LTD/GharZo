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
      <nav className="backdrop-blur-md shadow-md fixed top-0 left-0 w-full z-50 bg-gray-900">
        <div className="container mx-auto flex items-center justify-between p-4">
          {/* Logo */}
          <img ref={logoRef} src={logo} alt="Draze" className="w-28" />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-8 text-gray-300 font-medium">
            {navItems.map((item, i) => {
              const isActive = currentPath === item.to;
              return (
                <NavLink
                  key={item.text}
                  ref={(el) => (iconRefs.current[i] = el)}
                  to={item.to}
                  className={`relative group flex items-center gap-2 hover:scale-110 transition-all duration-300 ${
                    isActive ? "text-sky-600 font-semibold" : ""
                  }`}
                >
                  <span className="text-sky-500 group-hover:drop-shadow-md">
                    {item.icon}
                  </span>
                  <span className="group-hover:text-sky-600">{item.text}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-400 group-hover:w-full transition-all duration-300"></span>
                </NavLink>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Only Logout Button */}
            <div ref={buttonRef} className="relative">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
              >
                <LogOut className="drop-shadow-lg" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white shadow-lg hover:scale-110 transition-all duration-300"
              >
                {isOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-gray-800 text-white flex flex-col gap-4 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.text}
                to={item.to}
                className="flex items-center gap-2 hover:text-sky-300 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.text}
              </NavLink>
            ))}

            {/* Mobile Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              <LogOut />
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;
