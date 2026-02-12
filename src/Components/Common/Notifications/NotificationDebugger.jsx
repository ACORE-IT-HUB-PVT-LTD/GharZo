import { useState, useEffect } from "react";
import {
  runNotificationDiagnostics,
  requestNotificationPermission,
  getFCMToken,
  showSystemNotification,
  testNotification,
  sendFCMTokenToServer,
} from "../../notifications.js";

function NotificationDebugger() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    addLog("Running diagnostics...");
    try {
      const results = await runNotificationDiagnostics();
      setDiagnostics(results);
      addLog(`Diagnostics complete: ${results.permission}`);
    } catch (error) {
      addLog(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const requestPermission = async () => {
    setLoading(true);
    addLog("Requesting permission...");
    const result = await requestNotificationPermission();
    addLog(`Permission result: ${result.reason}`);
    setLoading(false);
  };

  const getToken = async () => {
    setLoading(true);
    addLog("Getting FCM token...");
    const token = await getFCMToken();
    if (token) {
      setFcmToken(token);
      addLog(`FCM Token: ${token.substring(0, 30)}...`);
    } else {
      addLog("Failed to get FCM token");
    }
    setLoading(false);
  };

  const testSystemNotification = () => {
    addLog("Testing system notification...");
    const notif = testNotification();
    if (notif) {
      addLog("System notification created successfully");
    } else {
      addLog("Failed to create system notification");
    }
  };

  const sendTokenToBackend = async () => {
    if (!fcmToken) {
      addLog("No FCM token to send");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("usertoken");
    if (!token) {
      addLog("No auth token - please login first");
      setLoading(false);
      return;
    }
    addLog("Sending token to backend...");
    const result = await sendFCMTokenToServer(token, fcmToken);
    if (result) {
      addLog("Token sent to backend successfully");
    } else {
      addLog("Failed to send token to backend");
    }
    setLoading(false);
  };

  // Listen for FCM messages
  useEffect(() => {
    const unsubscribe = import("../../notifications.js").then(({ setupForegroundListener }) => {
      return setupForegroundListener((payload) => {
        addLog(`FCM Message received: ${payload?.notification?.title || "No title"}`);
      });
    });
    return () => {
      // Cleanup handled by the function itself
    };
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">🔔 Notification Debugger</h2>

      {/* Status Display */}
      <div className="mb-4 p-3 bg-white rounded-lg">
        <h3 className="font-semibold mb-2">Current Status:</h3>
        <p>Browser: {diagnostics?.browser ? "✅" : "❌"}</p>
        <p>Permission: {diagnostics?.permission || "unknown"}</p>
        <p>Service Worker: {diagnostics?.serviceWorker?.registered ? "✅" : "❌"}</p>
        <p>Protocol: {diagnostics?.protocol?.valid ? "✅" : "❌"}</p>
        <p>Firebase: {diagnostics?.firebase || "unknown"}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          🔍 Run Diagnostics
        </button>
        <button
          onClick={requestPermission}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          🔔 Request Permission
        </button>
        <button
          onClick={getToken}
          disabled={loading}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          🔥 Get FCM Token
        </button>
        <button
          onClick={testSystemNotification}
          disabled={loading}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          🧪 Test Popup
        </button>
        <button
          onClick={sendTokenToBackend}
          disabled={loading || !fcmToken}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          📤 Send to Backend
        </button>
      </div>

      {/* FCM Token Display */}
      {fcmToken && (
        <div className="mb-4 p-3 bg-white rounded-lg">
          <h3 className="font-semibold mb-1">FCM Token:</h3>
          <p className="text-xs break-all font-mono bg-gray-100 p-2 rounded">
            {fcmToken}
          </p>
        </div>
      )}

      {/* Console Logs */}
      <div className="p-3 bg-black rounded-lg">
        <h3 className="font-semibold text-white mb-2">Console Logs:</h3>
        <div className="max-h-48 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No logs yet. Run diagnostics first.</p>
          ) : (
            logs.map((log, i) => (
              <p key={i} className="text-green-400 text-xs font-mono">
                [{log.time}] {log.message}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationDebugger;
