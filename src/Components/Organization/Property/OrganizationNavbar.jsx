import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  User,
  Home,
  Building2,
  Info,
  Phone,
  LogOut,
  MapPin,
  UserCircle,
  Building,
  Key,
  Users,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { motion, useReducedMotion } from "framer-motion";
import logo from "../../../assets/logo/logo.png"; // Update path as needed
import { useAuth } from "../../User_Section/Context/AuthContext.jsx"; // Assume similar auth context; adjust if needed

// Component for displaying location
const LocationDisplay = ({ city, error }) => (
  <div className="relative group flex items-center gap-2 text-white bg-black/60 px-3 py-2 rounded-lg">
    <MapPin className="text-lg" />
    <span className="hidden md:inline text-xs">{error || city}</span>
    <span className="absolute top-full left-0 mt-2 hidden group-hover:block text-white bg-black/80 px-2 py-1 rounded text-xs z-50">
      {error || city}
    </span>
  </div>
);

function OrganizationNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, logout, role } = useAuth(); // Assuming similar auth context
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
    { text: "Home", to: "/home", icon: <Home size={18} /> },
    { text: "About Us", to: "/about", icon: <Info size={18} /> },
    {
      text: "Properties",
      to: "/properties",
      icon: <Building2 size={18} />,
      protected: true,
    },
    { text: "Contact", to: "/contact", icon: <Phone size={18} /> },
  ];

  const roleItems = [
    { role: "Regional Manager", icon: <Building size={24} />, to: "/regional-manager/login" },
    { role: "Property Manager", icon: <Building size={24} />, to: "/property-manager/login" },
    { role: "Tenant", icon: <Key size={24} />, to: "/tenant/login" },
    { role: "Worker", icon: <Users size={24} />, to: "/worker/login" },
  ];

  const [currentLocation, setCurrentLocation] = useState({ city: "" });
  const [locationError, setLocationError] = useState("");

  // Use environment variable for API key (update with your key)
  const GOOGLE_MAPS_API_KEY = "AIzaSyAc0p_mCDiRFX_up_KkMCFtlXuoimG3iWg" || "";

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
      console.log("Token check:", !!token); // Debug log
    };

    checkToken();

    // Listen for storage changes
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
    if (currentPath !== "/properties") { // Adjusted for your site
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
    localStorage.removeItem('usertoken'); // Explicitly remove token
    setHasToken(false); // Immediately update local state
    logout(); // Call context logout if it does additional cleanup
    setIsModalOpen(true); // Open role selection modal after logout
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    setIsOpen(false);
    navigate("/profile/"); // Adjust to your profile route
  };

  // Respect reduced motion preferences
  const shouldReduceMotion = useReducedMotion();
  const buttonVariants = shouldReduceMotion
    ? {}
    : { whileHover: { scale: 1.1, rotate: 5 }, whileTap: { scale: 0.95 } };

  // Filter nav items to hide those with protected if no token
  const filteredNavItems = navItems.filter(
    (item) => !(item.protected && !hasToken)
  );

  return (
    <>
      <nav className="backdrop-blur-md shadow-md fixed top-0 left-0 w-full z-50 bg-gray-900">
        <div className="container mx-auto flex items-center justify-between p-4">
          <img ref={logoRef} src={logo} alt="Your Organization" className="w-28" /> {/* Update logo path */}

          <div className="hidden md:flex gap-8 text-gray-300 font-medium">
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

          <div className="flex items-center gap-2">
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
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white shadow-lg hover:shadow-green-400/50 transition-all duration-300"
                aria-label={hasToken ? "User Menu" : "Select Role"}
              >
                {hasToken ? (
                  <User className="drop-shadow-lg" />
                ) : (
                  <User className="drop-shadow-lg" />
                )}
              </motion.button>

              {/* User Menu Dropdown for Desktop - Shows after login */}
              {hasToken && showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl py-2 w-48 z-50"
                >
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
            {(currentLocation.city || locationError) && (
              <LocationDisplay city={currentLocation.city} error={locationError} />
            )}

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white shadow-lg hover:scale-110 transition-all duration-300"
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-gray-800 text-white flex flex-col gap-4 p-4">
            {filteredNavItems.map((item) => {
              const linkTo = item.protected && !hasToken ? "/login" : item.to;
              const linkState = item.protected && !hasToken ? { from: item.to } : null;
              return (
                <NavLink
                  key={item.text}
                  to={linkTo}
                  state={linkState}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 hover:text-sky-300 transition-colors duration-200"
                >
                  {item.icon}
                  {item.text}
                </NavLink>
              );
            })}
            {(currentLocation.city || locationError) && (
              <LocationDisplay city={currentLocation.city} error={locationError} />
            )}
            {hasToken ? (
              <>
                <button
                  className="flex items-center gap-2 hover:text-sky-300 transition-colors duration-200"
                  onClick={handleProfileClick}
                >
                  <User size={18} />
                  Profile
                </button>
                <button
                  className="flex items-center gap-2 hover:text-sky-300 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <button
                className="flex items-center gap-2 hover:text-sky-300 transition-colors duration-200"
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                aria-label="Login"
              >
                <User size={18} />
                Login
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Role Selection Modal - Shows only if not authenticated */}
      {!hasToken && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white/90 rounded-lg shadow-xl p-6 w-11/12 max-w-lg"
            role="dialog"
            aria-labelledby="role-selection-title"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="role-selection-title" className="text-xl font-semibold text-gray-800">
                Select Role
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
                aria-label="Close role selection modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {roleItems.map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleRoleClick(item.to)}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-100 rounded-md hover:bg-sky-100 hover:scale-105 transition-all duration-200"
                  aria-label={`Select ${item.role} role`}
                >
                  <span className="text-sky-500">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {item.role}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default OrganizationNavbar;