import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMXR_Ff6HAxDMlHuxoy5aB2kseGxFj14g",
  authDomain: "gharzo-d5832.firebaseapp.com",
  projectId: "gharzo-d5832",
  storageBucket: "gharzo-d5832.firebasestorage.app",
  messagingSenderId: "4398272942",
  appId: "1:4398272942:web:9838cb16c064fa63b4783f",
  measurementId: "G-4BJRQWGYS0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
export const messaging = getMessaging(app);

export default app;