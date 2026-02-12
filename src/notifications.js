import { getToken, onMessage } from "firebase/messaging";
import axios from "axios";
import { messaging } from "./firebase";

const API_BASE_URL = "https://api.gharzoreality.com";
const FCM_VAPID_KEY = "BEwspx18TL6UIcFt9OU_Hr5wR8yASJo2vr8FeTe83qYc6OxpMiysEDekBuGF5EUWqKUWlLlO4G-o06ePqcI_hPA";

/**
 * 🔔 Request notification permission and get FCM token
 */
export const requestPermissionAndGetToken = async () => {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.warn("⚠️ This browser does not support notifications");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log("🔔 Notification Permission:", permission);

    if (permission !== "granted") {
      console.log("⚠️ Notification permission denied");
      return null;
    }

    // Register service worker if not already registered
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log("✅ Service Worker registered:", registration);
      } catch (error) {
        console.error("❌ Service Worker registration failed:", error);
      }
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
    });

    if (token) {
      console.log("✅ FCM Token obtained:", token);
      return token;
    } else {
      console.log("⚠️ No FCM token available");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    return null;
  }
};

/**
 * 📤 Send FCM token to backend
 * @param {string} authToken - JWT token from login
 * @param {string} fcmToken - FCM token (optional, will get new one if not provided)
 */
export const sendFCMTokenToServer = async (authToken, fcmToken = null) => {
  try {
    // Get FCM token if not provided
    if (!fcmToken) {
      fcmToken = await requestPermissionAndGetToken();
    }

    if (!fcmToken) {
      console.log("⚠️ No FCM token available to send");
      return false;
    }

    // Check if auth token exists
    if (!authToken) {
      console.log("⚠️ No auth token provided, saving FCM token for later");
      localStorage.setItem("pending_fcm_token", fcmToken);
      return false;
    }

    console.log("📤 Sending FCM token to backend...");

    // Send token to backend
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/save-token`,
      {
        token: fcmToken,
        device: "web",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      console.log("✅ FCM token saved successfully to backend");
      // Clear any pending token
      localStorage.removeItem("pending_fcm_token");
      return true;
    } else {
      console.error("❌ Failed to save FCM token:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Error saving FCM token to backend:", error.response?.data || error.message);
    return false;
  }
};

/**
 * 📤 Send pending FCM token (call after login if token was saved earlier)
 * @param {string} authToken - JWT token from login
 */
export const sendPendingFCMToken = async (authToken) => {
  try {
    const pendingToken = localStorage.getItem("pending_fcm_token");

    if (pendingToken && authToken) {
      console.log("📤 Sending pending FCM token...");
      await sendFCMTokenToServer(authToken, pendingToken);
    }
  } catch (error) {
    console.error("❌ Error sending pending FCM token:", error);
  }
};

/**
 * 🔔 Listen for foreground notifications
 * @param {function} callback - Function to handle incoming messages
 */
export const onForegroundMessage = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("🔔 Foreground message received:", payload);
    callback(payload);
  });
};

/**
 * 🔔 Initialize notifications (call once on app start)
 * @param {string} authToken - JWT token if user is already logged in
 */
export const initializeNotifications = async (authToken = null) => {
  try {
    // Request permission and get token
    const fcmToken = await requestPermissionAndGetToken();

    // If user is logged in, send token immediately
    if (authToken && fcmToken) {
      await sendFCMTokenToServer(authToken, fcmToken);
    }

    // Setup foreground message listener
    onForegroundMessage((payload) => {
      console.log("Foreground notification:", payload);

      // Show browser notification
      if (payload?.notification) {
        const notificationTitle = payload.notification.title || "New Notification";
        const notificationOptions = {
          body: payload.notification.body || "",
          icon: "/logo.png",
          badge: "/logo.png",
          data: payload.data,
        };

        // Show notification if permission granted
        if (Notification.permission === "granted") {
          new Notification(notificationTitle, notificationOptions);
        }
      }
    });
  } catch (error) {
    console.error("❌ Error initializing notifications:", error);
  }
};