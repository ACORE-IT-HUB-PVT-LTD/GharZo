import {
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// Auth context
import { AuthProvider } from "./Components/User_Section/Context/AuthContext";

// Import all routes
import {
  publicRoutes,
  userRoutes,
  landlordRoutes,
  tenantRoutes,
  subOwnerRoutes,
  workerRoutes,
} from "./routes";

// ScrollToTop Component
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return null;
};

function App() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="">
      <AuthProvider>
        <Router>
          <ScrollToTop />

          <Routes>
            {/* Public Website Routes */}
            {publicRoutes}

            {/* User Section Routes */}
            {userRoutes}

            {/* Landlord Section Routes */}
            {Array.isArray(landlordRoutes) ? landlordRoutes.map((route) => route) : landlordRoutes}

            {/* Tenant Section Routes */}
            {tenantRoutes}

            {/* Sub Owner Section Routes */}
            {Array.isArray(subOwnerRoutes) ? subOwnerRoutes.map((route) => route) : subOwnerRoutes}

            {/* Draze Worker Section Routes */}
            {Array.isArray(workerRoutes) ? workerRoutes.map((route) => route) : workerRoutes}
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;