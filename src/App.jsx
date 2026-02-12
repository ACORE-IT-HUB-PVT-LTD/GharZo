import {
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// 🔥 Firebase notification imports
import {
  initializeNotifications,
  sendPendingFCMToken,
} from "./notifications.js";

// Auth context
import { AuthProvider, useAuth } from "./Components/User_Section/Context/AuthContext";

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

// AppContent Component - uses auth context inside AuthProvider
function AppContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    // 🔔 Initialize Firebase notifications
    const initFirebaseNotifications = async () => {
      try {
        // Get auth token from localStorage
        const authToken = localStorage.getItem("usertoken") || 
                          localStorage.getItem("token") || 
                          sessionStorage.getItem("token");

        console.log("🔔 Initializing Firebase notifications...");
        
        // Initialize notifications with auth token if available
        await initializeNotifications(authToken);

        // If user just logged in, try to send any pending FCM token
        if (!loading && user && authToken) {
          console.log("🔔 User authenticated, checking for pending FCM token...");
          await sendPendingFCMToken(authToken);
        }
      } catch (error) {
        console.error("❌ Error initializing notifications:", error);
      }
    };

    initFirebaseNotifications();
  }, [user, loading]);

  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* Public Website Routes */}
        {publicRoutes}

        {/* User Section Routes */}
        {userRoutes}

        {/* Landlord Section Routes */}
        {Array.isArray(landlordRoutes)
          ? landlordRoutes.map((route) => route)
          : landlordRoutes}

        {/* Tenant Section Routes */}
        {tenantRoutes}

        {/* Sub Owner Section Routes */}
        {Array.isArray(subOwnerRoutes)
          ? subOwnerRoutes.map((route) => route)
          : subOwnerRoutes}

        {/* Worker Section Routes */}
        {Array.isArray(workerRoutes)
          ? workerRoutes.map((route) => route)
          : workerRoutes}
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;