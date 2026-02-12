// Firebase Cloud Messaging Service Worker
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Firebase configuration - replace with your actual values
firebase.initializeApp({
  apiKey: "AIzaSyCMXR_Ff6HAxDMlHuxoy5aB2kseGxFj14g",
  authDomain: "gharzo-d5832.firebaseapp.com",
  projectId: "gharzo-d5832",
  storageBucket: "gharzo-d5832.firebasestorage.app",
  messagingSenderId: "4398272942",
  appId: "1:4398272942:web:9838cb16c064fa63b4783f",
  measurementId: "G-4BJRQWGYS0"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/logo.png", // Make sure this path is correct
    badge: "/logo.png",
    data: payload.data,
    tag: payload.data?.id || Date.now().toString(),
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received.");
  
  event.notification.close();

  // Handle navigation based on notification data
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/")
  );
});