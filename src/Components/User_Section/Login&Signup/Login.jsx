import React, { useState, useEffect } from "react";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import signupbg from "../../../assets/Images/signupbg.jpg";
import logo from "../../../assets/logo/logo.png";
import { sendFCMTokenToServer, requestPermissionAndGetToken } from "../../../notifications.js";

const API_BASE_URL = "https://api.gharzoreality.com";

function Login({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("buyer");

  const [otpSent, setOtpSent] = useState(false);
  const [purpose, setPurpose] = useState(null);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [countdown, setCountdown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);

  const { from = "/user" } = location.state || {};

  const ROLES = [
    { value: "buyer", label: "Owner / Buyer" },
    { value: "agent", label: "Broker" },
    { value: "landlord", label: "PG Landlord" },
  ];

  const MAX_RESEND_ATTEMPTS = 3;
  const RESEND_COUNTDOWN = 30;

  useEffect(() => {
    const token = localStorage.getItem("usertoken");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) navigate(from, { replace: true });
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
  }, [navigate, from]);

  useEffect(() => {
    if (phone.length === 0) resetForm();
  }, [phone]);

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const resetForm = () => {
    setOtpSent(false);
    setOtp("");
    setName("");
    setRole("buyer");
    setPurpose(null);
    setCountdown(0);
    setResendAttempts(0);
  };

  const isPhoneValid = (p) => p.length === 10;
  const isNameValid = (n) => n.trim().length > 0;
  const isRoleValid = (r) => !!r;
  const isOtpValid = (o) => o.length === 6;

  const canVerify = () => {
    if (isVerifying || !isOtpValid(otp)) return false;
    if (purpose === "registration") return isNameValid(name) && isRoleValid(role);
    return true;
  };

  const isSendOtpDisabled = isSendingOtp || !isPhoneValid(phone);
  const isResendDisabled = countdown > 0 || isResending || resendAttempts >= MAX_RESEND_ATTEMPTS;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isPhoneValid(phone)) return toast.error("Enter valid phone");

    setIsSendingOtp(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { phone });
      if (!res.data.success) return toast.error(res.data.message);

      const apiPurpose = res.data.data?.purpose || res.data.purpose;
      if (!["login", "registration"].includes(apiPurpose))
        return toast.error("Invalid server response");

      setPurpose(apiPurpose);
      setOtpSent(true);
      setCountdown(RESEND_COUNTDOWN);
      setResendAttempts(0);

      toast.success(res.data.message || "OTP sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Send OTP failed");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    if (countdown > 0 || isResending || resendAttempts >= MAX_RESEND_ATTEMPTS) return;

    setIsResending(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/resend-otp`, { phone });
      if (!res.data.success) return toast.error(res.data.message);

      setOtp("");
      setResendAttempts((prev) => prev + 1);
      setCountdown(RESEND_COUNTDOWN);

      toast.success(res.data.message || "OTP resent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!isOtpValid(otp)) return toast.error("Enter valid OTP");

    if (purpose === "registration") {
      if (!isNameValid(name)) return toast.error("Enter name");
      if (!isRoleValid(role)) return toast.error("Select role");
    }

    setIsVerifying(true);

    try {
      const payload = { phone, otp };
      if (purpose === "registration") {
        payload.name = name.trim();
        payload.role = role;
      }

      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, payload);
      if (!res.data.success) return toast.error(res.data.message);

      const { user, token } = res.data.data;

      // Save auth token and user data
      if (token) localStorage.setItem("usertoken", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
      }

      // Update auth context
      login({
        phone: user.phone,
        role: user.role,
        isRegistered: true,
        fullName: user.name,
        email: user.email || "",
      });

      // 🔥 Send FCM token to backend after successful login
      console.log("🟡 Attempting to send FCM token to backend...");
      try {
        // First, request permission and get FCM token
        const fcmToken = await requestPermissionAndGetToken();
        
        if (typeof fcmToken === "string" && fcmToken.length > 0) {
          // Send to backend with the auth token
          const fcmSaved = await sendFCMTokenToServer(token, fcmToken);
          if (fcmSaved) {
            console.log("🟢 FCM token successfully saved to backend");
          } else {
            console.log("🟡 FCM token not saved, will retry later");
          }
        } else {
          console.log("🟡 No FCM token obtained (permission may be denied)");
        }
      } catch (fcmError) {
        console.error("❌ Error handling FCM token:", fcmError);
        // Don't block login if FCM fails
      }

      toast.success(
        purpose === "registration"
          ? "Registration successful 🎉"
          : "Login successful 👋"
      );

      setTimeout(() => {
        onClose?.();
        navigate(from, { replace: true });
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verify failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangeNumber = () => {
    resetForm();
    setPhone("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      !otpSent ? handleSendOtp(e) : handleVerifyOtp(e);
    }
  };

  const particlesInit = async (main) => await loadFull(main);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="relative w-full max-w-5xl h-[650px] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Toast Notifications */}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          draggable
          pauseOnHover={false}
          toastClassName="backdrop-blur-xl bg-slate-800/95 shadow-2xl rounded-xl border border-cyan-500/20"
          bodyClassName="text-white font-medium"
        />

        {/* LEFT SIDE - Authentication Form */}
        <div className="w-full lg:w-[45%] bg-gradient-to-b from-[#0c2344] to-[#0b4f91] relative overflow-hidden flex items-center justify-center p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>

          {/* Particle Background */}
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
              background: { color: { value: "transparent" } },
              fpsLimit: 60,
              interactivity: {
                events: {
                  onHover: { enable: true, mode: "grab" },
                  resize: true,
                },
                modes: {
                  grab: {
                    distance: 120,
                    links: { opacity: 0.3 },
                  },
                },
              },
              particles: {
                color: { value: "#06b6d4" },
                links: {
                  color: "#06b6d4",
                  distance: 150,
                  enable: true,
                  opacity: 0.15,
                  width: 1,
                },
                move: {
                  enable: true,
                  speed: 0.5,
                },
                number: {
                  value: 40,
                  density: {
                    enable: true,
                    area: 800,
                  },
                },
                opacity: { value: 0.3 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 2 } },
              },
              detectRetina: true,
            }}
            className="absolute inset-0"
          />

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full max-w-md z-10"
          >
            {/* Header */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              {/* Logo */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-15 h-15 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <img
                    src={logo}
                    alt="GharZo"
                    className="h-17 w-[150px] object-contain"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {!otpSent
                    ? "Welcome back"
                    : purpose === "registration"
                    ? "Complete Registration"
                    : "Verify OTP"}
                </h2>
                <p className="text-slate-400 text-sm">
                  {!otpSent
                    ? "Enter your phone number to continue"
                    : "Enter the 6-digit code sent to your phone"}
                </p>
              </div>
            </motion.div>

            {/* Form Content - Conditional Rendering Based on otpSent */}
            <AnimatePresence mode="wait">
              {!otpSent ? (
                // ==================== PHONE INPUT SCREEN ====================
                <motion.form
                  key="phone-input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                  {/* Phone Number Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter your 10-digit phone number"
                      maxLength="10"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                    />
                  </div>

                  {/* Send OTP Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: isSendOtpDisabled ? 1 : 1.01 }}
                    whileTap={{ scale: isSendOtpDisabled ? 1 : 0.99 }}
                    disabled={isSendOtpDisabled}
                    className={`w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2 ${
                      isSendOtpDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSendingOtp ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Checking...</span>
                      </>
                    ) : (
                      "Continue"
                    )}
                  </motion.button>

                  {/* Cancel Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate("/")}
                    className="w-full py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </motion.button>

                  {/* Terms */}
                  <p className="text-xs text-slate-400 text-center mt-4">
                    By continuing, you agree to our Terms & Conditions
                  </p>
                </motion.form>
              ) : (
                // ==================== OTP VERIFICATION SCREEN ====================
                <motion.form
                  key="otp-verification"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  {/* Phone Display */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
                  >
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-300">
                      OTP sent to{" "}
                      <span className="text-white font-semibold">+91 {phone}</span>
                    </span>
                  </motion.div>

                  {/* REGISTRATION FIELDS - ONLY shown when purpose === "registration" */}
                  {purpose === "registration" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Full Name Input */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          FULL NAME <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                        />
                      </div>

                      {/* Role Selection */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          SELECT ROLE <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2 bg-slate-800/30 p-1.5 rounded-xl border border-slate-700">
                          {ROLES.map((r) => (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => setRole(r.value)}
                              className={`px-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                                role === r.value
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                                  : "bg-transparent text-slate-300 hover:text-white"
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* OTP Input Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      VERIFICATION CODE
                    </label>
                    <input
                      type="text"
                      placeholder="• • • • • •"
                      maxLength="6"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-center text-2xl font-semibold tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                    />
                  </div>

                  {/* Resend OTP Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: isResendDisabled ? 1 : 1.01 }}
                    whileTap={{ scale: isResendDisabled ? 1 : 0.99 }}
                    disabled={isResendDisabled}
                    onClick={handleResendOtp}
                    className={`w-full py-3.5 font-medium rounded-xl transition-all duration-300 ${
                      isResendDisabled
                        ? "bg-slate-800/30 border border-slate-700 text-slate-600 cursor-not-allowed"
                        : "bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300"
                    }`}
                  >
                    {isResending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Resending...</span>
                      </span>
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : resendAttempts >= MAX_RESEND_ATTEMPTS ? (
                      "Max resend attempts reached"
                    ) : (
                      "Resend OTP"
                    )}
                  </motion.button>

                  {/* Verify Button - Enabled only when all required fields are valid */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: canVerify() ? 1.01 : 1 }}
                    whileTap={{ scale: canVerify() ? 0.99 : 1 }}
                    disabled={!canVerify()}
                    className={`w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2 ${
                      !canVerify() ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Verifying...</span>
                      </>
                    ) : purpose === "registration" ? (
                      "Complete Registration"
                    ) : (
                      "Verify & Login"
                    )}
                  </motion.button>

                  {/* Change Number Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleChangeNumber}
                    className="w-full py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-300"
                  >
                    ← Change Number
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* RIGHT SIDE - Hero Image Section */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block lg:w-[55%] relative overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${signupbg})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-cyan-900/20 to-blue-900/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex flex-col justify-end p-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-xl"
            >
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Find Your Perfect Home
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Discover rental properties, PGs & more — designed for your
                comfort. Join thousands of happy residents today.
              </p>
            </motion.div>
          </div>

          {/* Floating Action Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            disabled
            className="absolute bottom-8 right-8 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
          >
            <svg
              className="w-6 h-6 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
