import { getToken, onMessage } from "firebase/messaging";
import axios from "axios";
import { messaging } from "./firebase";

const API_BASE_URL = "https://api.gharzoreality.com";
const FCM_VAPID_KEY = "BEwspx18TL6UIcFt9OU_Hr5wR8yASJo2vr8FeTe83qYc6OxpMiysEDekBuGF5EUWqKUWlLlO4G-o06ePqcI_hPA";
const LAST_SYNCED_FCM_TOKEN_KEY = "last_synced_fcm_token";
let saveTokenInFlight = null;

/**
 * 🔍 Comprehensive Diagnostic System
 */
export const runNotificationDiagnostics = async () => {
  console.group("🔍 NOTIFICATION DIAGNOSTICS");
  console.log("Timestamp:", new Date().toISOString());
  console.log("---");

  const results = {
    browser: null,
    permission: null,
    serviceWorker: null,
    protocol: null,
    firebase: null,
    issues: [],
    fixes: []
  };

  // 1. Browser Support
  const hasNotificationAPI = "Notification" in window;
  results.browser = hasNotificationAPI;
  console.log(`${hasNotificationAPI ? "✅" : "❌"} Notification API: ${hasNotificationAPI ? "Supported" : "NOT SUPPORTED"}`);
  if (!hasNotificationAPI) {
    results.issues.push("Browser does not support Notification API");
    results.fixes.push("Use a modern browser (Chrome, Firefox, Edge, Safari)");
  }

  // 2. Permission Status
  if (hasNotificationAPI) {
    const permission = Notification.permission;
    results.permission = permission;
    
    const icon = permission === "granted" ? "✅" : permission === "denied" ? "❌" : "⚠️";
    console.log(`${icon} Permission Status: "${permission}"`);
    
    if (permission === "denied") {
      results.issues.push("Notification permission DENIED by user");
      results.fixes.push("MANUAL FIX REQUIRED:");
      results.fixes.push("  1. Click the lock/info icon in browser address bar");
      results.fixes.push("  2. Find 'Notifications' setting");
      results.fixes.push("  3. Change from 'Block' to 'Allow'");
      results.fixes.push("  4. Refresh the page");
      console.log("🛠️  FIX: Browser Settings → Site Settings → Notifications → Allow");
    } else if (permission === "default") {
      results.issues.push("Notification permission not yet requested");
      results.fixes.push("Call requestNotificationPermission() to prompt user");
    }
  }

  // 3. Service Worker Support & Status
  const hasServiceWorker = "serviceWorker" in navigator;
  results.serviceWorker = { supported: hasServiceWorker };
  console.log(`${hasServiceWorker ? "✅" : "❌"} Service Worker: ${hasServiceWorker ? "Supported" : "NOT SUPPORTED"}`);
  
  if (hasServiceWorker) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      results.serviceWorker.registered = registrations.length > 0;
      
      if (registrations.length > 0) {
        const reg = registrations[0];
        const state = reg.active?.state || reg.installing?.state || reg.waiting?.state || "unknown";
        results.serviceWorker.state = state;
        results.serviceWorker.scope = reg.scope;
        
        console.log(`✅ Service Worker Registered:`);
        console.log(`   Scope: ${reg.scope}`);
        console.log(`   State: ${state}`);
        
        if (state !== "activated") {
          results.issues.push(`Service worker state is "${state}" (should be "activated")`);
          results.fixes.push("Wait a moment and refresh the page");
        }
      } else {
        console.log(`⚠️  Service Worker NOT registered yet`);
        results.issues.push("Service worker not registered");
        results.fixes.push("Ensure firebase-messaging-sw.js exists in /public folder");
        results.fixes.push("Call initializeNotifications() to register it");
      }
      
      // Check for controller
      const controller = navigator.serviceWorker.controller;
      console.log(`${controller ? "✅" : "⚠️"} Service Worker Controller: ${controller ? "Active" : "None"}`);
      if (!controller) {
        results.issues.push("No active service worker controller");
        results.fixes.push("Refresh the page after service worker registration");
      }
    } catch (error) {
      console.error("❌ Error checking service worker:", error.message);
      results.issues.push(`Service worker error: ${error.message}`);
    }
  }

  // 4. Protocol Check
  const isHTTPS = window.location.protocol === "https:";
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const protocolOK = isHTTPS || isLocalhost;
  results.protocol = { isHTTPS, isLocalhost, valid: protocolOK };
  
  console.log(`${protocolOK ? "✅" : "❌"} Protocol: ${window.location.protocol}//${window.location.hostname}`);
  if (!protocolOK) {
    results.issues.push("Push notifications require HTTPS (or localhost)");
    results.fixes.push("Deploy to HTTPS domain or test on localhost");
  }

  // 5. Firebase Status
  results.firebase = messaging ? "initialized" : "not initialized";
  console.log(`${messaging ? "✅" : "❌"} Firebase Messaging: ${results.firebase}`);
  if (!messaging) {
    results.issues.push("Firebase messaging not initialized");
    results.fixes.push("Check Firebase configuration in firebase.js");
  }

  // 6. Summary
  console.log("---");
  const readyForNotifications = 
    hasNotificationAPI && 
    Notification.permission === "granted" && 
    hasServiceWorker && 
    protocolOK && 
    messaging;
  
  if (readyForNotifications) {
    console.log("✅ READY: All systems operational for notifications");
  } else {
    console.log("❌ NOT READY: Issues detected");
    console.log("\n📋 ISSUES FOUND:");
    results.issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
    console.log("\n🛠️  FIXES NEEDED:");
    results.fixes.forEach((fix, i) => console.log(`   ${i + 1}. ${fix}`));
  }

  console.groupEnd();
  return results;
};

/**
 * 🔔 Request notification permission (smart - only when needed)
 */
export const requestNotificationPermission = async () => {
  console.group("🔔 REQUEST PERMISSION");

  if (!("Notification" in window)) {
    console.error("❌ Browser does not support notifications");
    console.groupEnd();
    return { granted: false, reason: "unsupported" };
  }

  const current = Notification.permission;
  console.log(`Current status: "${current}"`);

  // Already granted
  if (current === "granted") {
    console.log("✅ Permission already granted - skipping request");
    console.groupEnd();
    return { granted: true, reason: "already_granted" };
  }

  // Permanently denied
  if (current === "denied") {
    console.error("❌ Permission DENIED - user must enable manually");
    console.log("🛠️  User must:");
    console.log("   1. Click lock icon in address bar");
    console.log("   2. Change Notifications from 'Block' to 'Allow'");
    console.log("   3. Refresh page");
    console.groupEnd();
    return { granted: false, reason: "denied" };
  }

  // Request permission
  console.log("📨 Requesting permission from user...");
  try {
    const result = await Notification.requestPermission();
    console.log(`Result: "${result}"`);
    
    if (result === "granted") {
      console.log("✅ SUCCESS - Permission granted!");
      console.groupEnd();
      return { granted: true, reason: "newly_granted" };
    } else {
      console.warn(`⚠️  User ${result === "denied" ? "denied" : "dismissed"} permission request`);
      console.groupEnd();
      return { granted: false, reason: result };
    }
  } catch (error) {
    console.error("❌ Error requesting permission:", error);
    console.groupEnd();
    return { granted: false, reason: "error", error };
  }
};

// Alias for backward compatibility
export const requestPermissionAndGetToken = async () => {
  const permissionResult = await requestNotificationPermission();
  if (!permissionResult?.granted) {
    return null;
  }
  return await getFCMToken();
};

/**
 * 🔥 Get FCM Token with diagnostics
 */
export const getFCMToken = async () => {
  console.group("🔥 FCM TOKEN GENERATION");

  if (!messaging) {
    console.error("❌ Firebase messaging not initialized");
    console.groupEnd();
    return null;
  }

  if (Notification.permission !== "granted") {
    console.error(`❌ Cannot get token - permission is "${Notification.permission}"`);
    console.groupEnd();
    return null;
  }

  try {
    // Get service worker registration
    console.log("📋 Checking service worker...");
    const registrations = await navigator.serviceWorker.getRegistrations();
    const swRegistration = registrations[0];
    
    if (!swRegistration) {
      console.error("❌ No service worker registered");
      console.log("🛠️  Service worker must be registered first");
      console.groupEnd();
      return null;
    }

    console.log(`✅ Using service worker: ${swRegistration.scope}`);
    
    // Get token
    console.log("📨 Requesting FCM token from Firebase...");
    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log(`✅ FCM Token obtained successfully`);
      console.log(`   Token (first 50 chars): ${token.substring(0, 50)}...`);
      console.log(`   Full token length: ${token.length} chars`);
      console.groupEnd();
      return token;
    } else {
      console.error("❌ No token returned from Firebase");
      console.log("🛠️  Possible causes:");
      console.log("   - VAPID key mismatch");
      console.log("   - Firebase config error");
      console.log("   - Service worker not active");
      console.groupEnd();
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:");
    console.error(error);
    console.log("🛠️  Check:");
    console.log("   - Firebase project settings");
    console.log("   - VAPID key is correct");
    console.log("   - Service worker file exists and is valid");
    console.groupEnd();
    return null;
  }
};

/**
 * 🔔 Show REAL system notification (Windows popup)
 */
export const showSystemNotification = (title, options = {}) => {
  console.group("🔔 SHOW SYSTEM NOTIFICATION");
  
  if (!("Notification" in window)) {
    console.error("❌ Notification API not supported");
    console.groupEnd();
    return null;
  }

  if (Notification.permission !== "granted") {
    console.error(`❌ Cannot show notification - permission is "${Notification.permission}"`);
    console.groupEnd();
    return null;
  }

  const notificationOptions = {
    body: options.body || "",
    icon: options.icon || "/logo.png",
    badge: options.badge || "/logo.png",
    tag: options.tag || `notification-${Date.now()}`,
    requireInteraction: options.requireInteraction || false,
    silent: options.silent || false,
    data: options.data || {},
    vibrate: options.vibrate || [200, 100, 200],
    ...options,
  };

  console.log(`Title: "${title}"`);
  console.log(`Body: "${notificationOptions.body}"`);
  console.log(`Tag: "${notificationOptions.tag}"`);

  try {
    const notification = new Notification(title, notificationOptions);
    console.log("✅ System notification created successfully");

    notification.onshow = () => {
      console.log("✅ Notification displayed on screen");
    };

    notification.onclick = (event) => {
      console.log("🖱️  Notification clicked");
      event.preventDefault();
      window.focus();
      notification.close();
      
      if (options.data?.url) {
        window.location.href = options.data.url;
      } else if (options.onClick) {
        options.onClick(event);
      }
    };

    notification.onerror = (error) => {
      console.error("❌ Notification error:", error);
    };

    notification.onclose = () => {
      console.log("🔕 Notification closed");
    };

    console.groupEnd();
    return notification;
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
    console.groupEnd();
    return null;
  }
};

/**
 * 👂 Listen for foreground FCM messages
 */
export const setupForegroundListener = (callback) => {
  if (!messaging) {
    console.error("❌ Cannot setup listener - Firebase messaging not initialized");
    return () => {};
  }

  console.log("👂 Setting up foreground message listener...");

  const unsubscribe = onMessage(messaging, (payload) => {
    console.group("📬 FOREGROUND MESSAGE RECEIVED");
    console.log("Timestamp:", new Date().toISOString());
    console.log("---");
    console.log("Full payload:", payload);

    if (!payload) {
      console.error("❌ Empty payload received");
      console.groupEnd();
      return;
    }

    const notification = payload.notification || {};
    const data = payload.data || {};

    console.log("Notification object:", notification);
    console.log("Data object:", data);

    const title = notification.title || data.title || "New Notification";
    const body = notification.body || data.body || "";
    const icon = notification.icon || data.icon || "/logo.png";

    console.log("---");
    console.log(`Will display: "${title}"`);
    console.log(`Body: "${body}"`);

    // Show system notification
    const systemNotif = showSystemNotification(title, {
      body: body,
      icon: icon,
      badge: "/logo.png",
      tag: data.tag || `fcm-${Date.now()}`,
      data: {
        ...data,
        url: data.url || data.click_action,
        timestamp: Date.now(),
      },
      requireInteraction: false,
    });

    if (systemNotif) {
      console.log("✅ System notification triggered successfully");
    } else {
      console.error("❌ Failed to trigger system notification");
    }

    console.groupEnd();

    // User callback
    if (typeof callback === "function") {
      try {
        callback(payload);
      } catch (error) {
        console.error("❌ Error in user callback:", error);
      }
    }
  });

  console.log("✅ Foreground listener registered");
  return unsubscribe;
};

/**
 * 🚀 Initialize Notifications (Main Entry Point)
 */
export const initializeNotifications = async (authToken = null) => {
  console.group("🚀 INITIALIZE NOTIFICATIONS");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Auth token provided:", !!authToken);
  console.log("---");

  try {
    // Step 1: Run diagnostics
    console.log("Step 1: Running diagnostics...");
    const diagnostics = await runNotificationDiagnostics();

    if (!diagnostics.browser) {
      console.error("❌ ABORT: Browser does not support notifications");
      console.groupEnd();
      return { success: false, reason: "unsupported_browser" };
    }

    if (!diagnostics.protocol.valid) {
      console.error("❌ ABORT: Requires HTTPS or localhost");
      console.groupEnd();
      return { success: false, reason: "insecure_protocol" };
    }

    // Step 2: Request permission
    console.log("\nStep 2: Requesting permission...");
    const permissionResult = await requestNotificationPermission();
    
    if (!permissionResult.granted) {
      console.warn(`⚠️  STOP: Permission ${permissionResult.reason}`);
      console.groupEnd();
      return { success: false, reason: permissionResult.reason };
    }

    // Step 3: Register service worker
    console.log("\nStep 3: Registering service worker...");
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
        });
        
        console.log(`✅ Service worker registered: ${registration.scope}`);
        
        // Wait for service worker to activate
        if (registration.installing) {
          console.log("⏳ Service worker installing...");
          await new Promise((resolve) => {
            registration.installing.addEventListener("statechange", (e) => {
              if (e.target.state === "activated") {
                console.log("✅ Service worker activated");
                resolve();
              }
            });
          });
        } else if (registration.waiting) {
          console.log("⏳ Service worker waiting...");
        } else if (registration.active) {
          console.log("✅ Service worker already active");
        }

        // Force page to use new service worker
        await navigator.serviceWorker.ready;
        console.log("✅ Service worker ready");
        
      } catch (error) {
        console.error("❌ Service worker registration failed:", error);
        console.log("🛠️  Ensure /public/firebase-messaging-sw.js exists");
        console.groupEnd();
        return { success: false, reason: "sw_registration_failed", error };
      }
    }

    // Step 4: Get FCM token
    console.log("\nStep 4: Getting FCM token...");
    const fcmToken = await getFCMToken();
    
    if (!fcmToken) {
      console.error("❌ Failed to get FCM token");
      console.groupEnd();
      return { success: false, reason: "token_generation_failed" };
    }

    // Step 5: Send token to backend
    if (authToken) {
      console.log("\nStep 5: Sending token to backend...");
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/save-token`,
          { token: fcmToken, device: "web" },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log("✅ Token saved to backend:", response.data);
      } catch (error) {
        console.error("❌ Failed to save token to backend:", error.message);
        // Continue anyway - token can be sent later
      }
    } else {
      console.log("\nStep 5: Skipped (no auth token) - will send token after login");
      localStorage.setItem("pending_fcm_token", fcmToken);
    }

    // Step 6: Setup foreground listener
    console.log("\nStep 6: Setting up foreground listener...");
    setupForegroundListener((payload) => {
      console.log("📨 Message received in app:", payload);
    });

    console.log("\n✅ ========================================");
    console.log("✅ NOTIFICATIONS FULLY INITIALIZED");
    console.log("✅ ========================================");
    console.groupEnd();

    return { 
      success: true, 
      token: fcmToken,
      diagnostics 
    };

  } catch (error) {
    console.error("❌ FATAL ERROR during initialization:", error);
    console.groupEnd();
    return { success: false, reason: "fatal_error", error };
  }
};

/**
 * 📤 Send FCM token to server
 */
export const sendFCMTokenToServer = async (authToken, fcmToken = null) => {
  console.group("📤 SEND TOKEN TO SERVER");
  
  try {
    if (!authToken) {
      console.error("❌ No auth token provided");
      console.groupEnd();
      return false;
    }

    if (!fcmToken) {
      console.log("No token provided, generating new one...");
      fcmToken = await getFCMToken();
    }

    if (!fcmToken || typeof fcmToken !== "string") {
      console.error("❌ No FCM token available");
      console.groupEnd();
      return false;
    }

    console.log("📨 Sending to backend...");
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/save-token`,
      { token: fcmToken, device: "web" },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log("✅ Success:", response.data);
    
    // Clear pending token
    localStorage.removeItem("pending_fcm_token");
    
    console.groupEnd();
    return true;
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.groupEnd();
    return false;
  }
};

/**
 * 📤 Send pending FCM token (call after login)
 */
export const sendPendingFCMToken = async (authToken) => {
  const pendingToken = localStorage.getItem("pending_fcm_token");
  
  if (pendingToken && authToken) {
    console.log("📨 Sending pending FCM token from storage...");
    return await sendFCMTokenToServer(authToken, pendingToken);
  }
  
  return false;
};

/**
 * 🧪 TEST: Manual notification test
 */
export const testNotification = () => {
  console.log("🧪 Testing manual notification...");
  return showSystemNotification("Test Notification", {
    body: "This is a test notification from GharZo",
    icon: "/logo.png",
    tag: "test",
    requireInteraction: true,
  });
};

// Export diagnostics globally for console debugging
if (typeof window !== "undefined") {
  window.runNotificationDiagnostics = runNotificationDiagnostics;
  window.testNotification = testNotification;
  window.requestNotificationPermission = requestNotificationPermission;
  window.getFCMToken = getFCMToken;
}

console.log("📦 Notification utility loaded");
console.log("🔧 Available in console: runNotificationDiagnostics(), testNotification()");
