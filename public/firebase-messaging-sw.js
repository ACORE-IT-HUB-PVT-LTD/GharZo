// Firebase Cloud Messaging Service Worker
// Place this file in /public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

console.log("[SW] 🚀 Loading Firebase Messaging Service Worker...");
console.log("[SW] Timestamp:", new Date().toISOString());

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMXR_Ff6HAxDMlHuxoy5aB2kseGxFj14g",
  authDomain: "gharzo-d5832.firebaseapp.com",
  projectId: "gharzo-d5832",
  storageBucket: "gharzo-d5832.firebasestorage.app",
  messagingSenderId: "4398272942",
  appId: "1:4398272942:web:9838cb16c064fa63b4783f"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log("[SW] ✅ Firebase initialized successfully");
} catch (error) {
  console.error("[SW] ❌ Firebase initialization failed:", error);
}

const messaging = firebase.messaging();

/**
 * 🔔 Handle background messages (when app is not in focus)
 */
messaging.onBackgroundMessage((payload) => {
  console.group("[SW] 📬 BACKGROUND MESSAGE RECEIVED");
  console.log("[SW] Timestamp:", new Date().toISOString());
  console.log("[SW] Full payload:", payload);

  // Validate payload
  if (!payload) {
    console.error("[SW] ❌ Empty payload received");
    console.groupEnd();
    return;
  }

  // Extract notification and data
  const notification = payload.notification || {};
  const data = payload.data || {};

  console.log("[SW] Notification:", notification);
  console.log("[SW] Data:", data);

  // Build notification
  const title = notification.title || data.title || "GharZo Notification";
  const body = notification.body || data.body || "You have a new notification";
  const icon = notification.icon || data.icon || "/logo.png";
  const badge = "/logo.png";

  const notificationOptions = {
    body: body,
    icon: icon,
    badge: badge,
    tag: data.tag || data.type || `notification-${Date.now()}`,
    data: {
      ...data,
      url: data.url || data.click_action,
      timestamp: Date.now(),
      fromBackground: true,
    },
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: "open",
        title: "View",
      },
      {
        action: "close",
        title: "Dismiss",
      }
    ],
  };

  console.log("[SW] ---");
  console.log(`[SW] Will show: "${title}"`);
  console.log(`[SW] Body: "${body}"`);
  console.log(`[SW] Tag: "${notificationOptions.tag}"`);

  // Show the notification
  return self.registration.showNotification(title, notificationOptions)
    .then(() => {
      console.log("[SW] ✅ Notification displayed successfully");
      console.groupEnd();
    })
    .catch((error) => {
      console.error("[SW] ❌ Failed to show notification:", error);
      console.groupEnd();
    });
});

/**
 * 🖱️ Handle notification click events
 */
self.addEventListener("notificationclick", (event) => {
  console.group("[SW] 🖱️ NOTIFICATION CLICKED");
  console.log("[SW] Timestamp:", new Date().toISOString());
  console.log("[SW] Action:", event.action);
  console.log("[SW] Notification data:", event.notification.data);

  // Close the notification
  event.notification.close();

  // Handle dismiss action
  if (event.action === "close") {
    console.log("[SW] User dismissed notification");
    console.groupEnd();
    return;
  }

  // Determine URL to open
  const data = event.notification.data || {};
  let urlToOpen = new URL("/", self.location.origin).href;

  if (data.url) {
    try {
      urlToOpen = new URL(data.url, self.location.origin).href;
    } catch (e) {
      urlToOpen = data.url.startsWith("/") 
        ? new URL(data.url, self.location.origin).href
        : data.url;
    }
  } else if (data.type) {
    // Route based on notification type
    const routes = {
      visit_request_created: "/my-visits",
      visit_request_updated: "/my-visits",
      complaint_created: "/complaints",
      complaint_updated: "/complaints",
      announcement: "/announcements",
      message: "/messages",
    };
    const route = routes[data.type] || "/";
    urlToOpen = new URL(route, self.location.origin).href;
  }

  console.log(`[SW] Will navigate to: ${urlToOpen}`);

  // Open or focus window
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        console.log(`[SW] Found ${clientList.length} open window(s)`);

        // Try to focus existing window with matching URL
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          const targetUrl = new URL(urlToOpen);
          
          if (clientUrl.pathname === targetUrl.pathname && "focus" in client) {
            console.log("[SW] ✅ Focusing existing window");
            console.groupEnd();
            return client.focus();
          }
        }

        // Try to focus any open window and navigate
        if (clientList.length > 0 && clientList[0].focus) {
          console.log("[SW] ✅ Focusing first window and navigating");
          clientList[0].focus();
          clientList[0].navigate(urlToOpen);
          console.groupEnd();
          return clientList[0];
        }

        // Open new window
        if (clients.openWindow) {
          console.log("[SW] ✅ Opening new window");
          console.groupEnd();
          return clients.openWindow(urlToOpen);
        }

        console.log("[SW] ⚠️ Cannot open window");
        console.groupEnd();
      })
      .catch((error) => {
        console.error("[SW] ❌ Error handling click:", error);
        console.groupEnd();
      })
  );
});

/**
 * 🔕 Handle notification close events
 */
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] 🔕 Notification closed:", event.notification.tag);
});

/**
 * 📨 Handle raw push events (fallback)
 */
self.addEventListener("push", (event) => {
  console.group("[SW] 📨 PUSH EVENT RECEIVED");
  console.log("[SW] Timestamp:", new Date().toISOString());

  if (!event.data) {
    console.log("[SW] ⚠️ Push event has no data");
    console.groupEnd();
    return;
  }

  try {
    const payload = event.data.json();
    console.log("[SW] Push payload:", payload);

    const notification = payload.notification || {};
    const data = payload.data || {};

    const title = notification.title || data.title || "Notification";
    const body = notification.body || data.body || "";
    const icon = notification.icon || data.icon || "/logo.png";

    console.log(`[SW] Showing: "${title}"`);

    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: icon,
        badge: "/logo.png",
        data: data,
        tag: data.tag || `push-${Date.now()}`,
        requireInteraction: false,
        vibrate: [200, 100, 200],
      }).then(() => {
        console.log("[SW] ✅ Push notification displayed");
        console.groupEnd();
      }).catch((error) => {
        console.error("[SW] ❌ Failed to show push notification:", error);
        console.groupEnd();
      })
    );
  } catch (error) {
    console.error("[SW] ❌ Error parsing push data:", error);
    console.groupEnd();
  }
});

/**
 * 🔄 Service Worker activation
 */
self.addEventListener("activate", (event) => {
  console.log("[SW] ⚡ Service Worker activated");
  event.waitUntil(clients.claim());
});

/**
 * 📥 Service Worker installation
 */
self.addEventListener("install", (event) => {
  console.log("[SW] 📥 Service Worker installing");
  self.skipWaiting();
});

console.log("[SW] ✅ Firebase Messaging Service Worker initialized");
console.log("[SW] Ready to receive background messages");