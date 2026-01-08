import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  User,
  Home,
  Building2,
  Info,
  Phone,
  Video,
  LogOut,
  MapPin,
  UserCircle,
  HomeIcon,
  Building,
  Hotel,
  Key,
  Workflow,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import logo from "../../../assets/logo/logo.png";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";

// Component for displaying location
const LocationDisplay = ({ city, error }) => (
  <div className="relative group flex items-center gap-2 text-white bg-gradient-to-r from-blue-600/80 to-cyan-500/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/20 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
    <MapPin className="text-lg animate-pulse" />
    <span className="hidden md:inline text-sm font-medium tracking-wide">{error || city}</span>
    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-3 hidden group-hover:block text-white bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 rounded-lg text-sm z-50 whitespace-nowrap shadow-xl border border-white/20">
      {error || city}
    </span>
  </div>
);

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Local state for token check
  const [hasToken, setHasToken] = useState(false);

  // GSAP refs
  const logoRef = useRef(null);
  const iconRefs = useRef([]);
  const buttonRef = useRef(null);

  const navItems = [
    { text: "Home", to: "/", icon: <Home size={18} /> },
    {
      text: "Properties",
      to: "/properties",
      icon: <Building2 size={18} />,
      protected: true,
    },
    {
      text: "Reels",
      to: "/reels",
      icon: <Video size={18} />,
      protected: true,
      onClick: () => setIsOpen(false),
    },
    { text: "About Us", to: "/about", icon: <Info size={18} /> },
    {
      text: "My Visits",
      to: "/my-visits",
      icon: <MapPin size={18} />,
      hiddenIfUnauth: true,
      protected: true,
    },
    { text: "Contact", to: "/contact", icon: <Phone size={18} /> },
  ];

  const roleItems = [
    { role: "User", icon: <UserCircle size={24} />, to: "/login" },
    { role: "Landlord", icon: <HomeIcon size={24} />, to: "/landlord_login" },
    { role: "Seller", icon: <Building size={24} />, to: "/seller_login" },
    { role: "Tenant", icon: <Key size={24} />, to: "/tenant_login" },
    { role: "Sub Owner", icon: <UserCircle size={24} />, to: "/sub_owner_login" },
    { role: "Worker Dashboard", icon: <Workflow size={24} />, to: "/dr_worker_login" },
  ];

  const [currentLocation, setCurrentLocation] = useState({ city: "" });
  const [locationError, setLocationError] = useState("");

  const GOOGLE_MAPS_API_KEY = "AIzaSyAc0p_mCDiRFX_up_KkMCFtlXuoimG3iWg " || "";

  const getCurrentLocation = async (latitude, longitude) => {
    try {
      localStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }));

      if (!GOOGLE_MAPS_API_KEY) {
        throw new Error("Google Maps API key is missing");
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        let city = "";
        addressComponents.forEach((component) => {
          if (component.types.includes("locality")) {
            city = component.long_name;
          }
        });
        setCurrentLocation({ city });
        setLocationError("");
      } else {
        setCurrentLocation({ city: "" });
        setLocationError("Location not found");
      }
    } catch (error) {
      setCurrentLocation({ city: "" });
      setLocationError("Unable to fetch location");
    }
  };

  // Check for usertoken in localStorage
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("usertoken");
      setHasToken(!!token);
      console.log("Token check:", !!token);
    };

    checkToken();

    const handleStorageChange = (e) => {
      if (e.key === "usertoken") {
        checkToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (navigator.geolocation) {
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setLocationError("Location request timed out");
        }
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            clearTimeout(timeoutId);
            const { latitude, longitude } = position.coords;
            getCurrentLocation(latitude, longitude);
          }
        },
        (error) => {
          if (isMounted) {
            clearTimeout(timeoutId);
            setLocationError("Location not found");
          }
        },
        { timeout: 10000 }
      );
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentPath !== "/reels") {
      gsap.fromTo(
        logoRef.current,
        { scale: 0, rotateY: -90, opacity: 0 },
        { scale: 1, rotateY: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
      );

      iconRefs.current.forEach((icon, i) => {
        if (icon) {
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
        }
      });

      gsap.fromTo(
        buttonRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: "power3.out" }
      );
    }
  }, [currentPath]);

  const handleRoleClick = (to) => {
    setIsModalOpen(false);
    navigate(to);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    setIsOpen(false);
    localStorage.removeItem('usertoken');
    setHasToken(false);
    logout();
    setIsModalOpen(true);
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    setIsOpen(false);
    navigate("/user/");
  };

  const shouldReduceMotion = useReducedMotion();
  const buttonVariants = shouldReduceMotion
    ? {}
    : { whileHover: { scale: 1.05, y: -2 }, whileTap: { scale: 0.98 } };

  const filteredNavItems = navItems.filter(
    (item) => !(item.hiddenIfUnauth && !hasToken)
  );

  if (currentPath === "/reels") {
    return null;
  }

  return (
    <>
<nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-xl shadow-lg border-b border-blue-100">
  <div className=" flex items-center justify-between px-4 py-2">
    {/* Logo Section - Bigger Logo Without Affecting Navbar Size */}
    <motion.div
      ref={logoRef}
      whileHover={{ scale: 1.05 }}
      className=" ml-12" // Prevents shrinking/compression
    >
      <img 
        src={logo} 
        alt="GharZo" 
        className="h-17 w-[150px] object-contain" 
      />
    </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {filteredNavItems.map((item, i) => {
              const isActive = currentPath === item.to;
              const linkTo = item.protected && !hasToken ? "/login" : item.to;
              const linkState = item.protected && !hasToken ? { from: item.to } : null;
              return (
                <NavLink
                  key={item.text}
                  ref={(el) => (iconRefs.current[i] = el)}
                  to={linkTo}
                  state={linkState}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                  }}
                  className={`relative group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/50" 
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-blue-500 group-hover:text-blue-600'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold text-sm tracking-wide">{item.text}</span>
                  {!isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-3/4 transition-all duration-300"></span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <div ref={buttonRef} className="relative">
              <motion.button
                {...buttonVariants}
                onClick={() => {
                  if (hasToken) {
                    setShowUserMenu(!showUserMenu);
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold text-sm"
                aria-label={hasToken ? "User Menu" : "Select Role"}
              >
                <User size={18} className="drop-shadow-lg" />
                <span className="hidden sm:inline">{hasToken ? "Account" : "Sign In"}</span>
              </motion.button>

              {/* User Menu Dropdown */}
              {hasToken && showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl py-2 w-56 z-50 border border-blue-100 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-5 py-3 text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                  >
                    <UserCircle size={18} className="text-blue-500 group-hover:text-blue-600" />
                    <span className="font-medium">My Profile</span>
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                  >
                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    <span className="font-medium">Logout</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Location Display */}
            {(currentLocation.city || locationError) && (
              <LocationDisplay city={currentLocation.city} error={locationError} />
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
            className="lg:hidden bg-gradient-to-b from-white to-blue-50 border-t border-blue-100"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-2">
              {filteredNavItems.map((item) => {
                const linkTo = item.protected && !hasToken ? "/login" : item.to;
                const linkState = item.protected && !hasToken ? { from: item.to } : null;
                const isActive = currentPath === item.to;
                return (
                  <NavLink
                    key={item.text}
                    to={linkTo}
                    state={linkState}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      else setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg" 
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-blue-500'}>{item.icon}</span>
                    <span className="font-semibold">{item.text}</span>
                  </NavLink>
                );
              })}
              
              {(currentLocation.city || locationError) && (
                <div className="mt-2">
                  <LocationDisplay city={currentLocation.city} error={locationError} />
                </div>
              )}
              
              <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent my-2"></div>
              
              {hasToken ? (
                <>
                  <button
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 transition-all duration-300"
                    onClick={handleProfileClick}
                  >
                    <User size={18} className="text-blue-500" />
                    <span className="font-semibold">Profile</span>
                  </button>
                  <button
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span className="font-semibold">Logout</span>
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-lg font-semibold"
                  onClick={() => setIsOpen(false)}
                  aria-label="Login"
                >
                  <User size={18} />
                  Login
                </NavLink>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Role Selection Modal */}
      {!hasToken && isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-blue-100"
            role="dialog"
            aria-labelledby="role-selection-title"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 id="role-selection-title" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Select Your Role
                </h2>
                <p className="text-gray-600 mt-1">Choose how you'd like to continue</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
                aria-label="Close role selection modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {roleItems.map((item, index) => (
                <motion.button
                  key={item.role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleRoleClick(item.to)}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 border-2 border-transparent hover:border-blue-300 shadow-md hover:shadow-xl"
                  aria-label={`Select ${item.role} role`}
                >
                  <div className="p-4 bg-white rounded-xl shadow-md group-hover:shadow-lg transition-all">
                    <span className="text-blue-500 group-hover:text-cyan-500 transition-colors">{item.icon}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 text-center leading-tight">
                    {item.role}
                  </span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/10 group-hover:to-cyan-400/10 transition-all duration-300"></div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default Navbar;