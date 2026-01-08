import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import baseurl from "../../../../BaseUrl.js";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import signupbg from "../../../assets/Images/signupbg.jpg";
import logo from "../../../assets/logo/logo.png";

function LandloardLogin({ onClose }) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { login } = useAuth();
  const [resendAttempts, setResendAttempts] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Reset states when phone changes
  useEffect(() => {
    setResendAttempts(0);
    setCountdown(0);
    setOtpSent(false);
    setOtp("");
  }, [phone]);

  // Countdown timer for resend
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Auto redirect for landlord
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("landlord");
    let role = "";
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        role = user?.role || "";
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
    console.log("Auto-redirect check:", { token, role });
    if (token && role === "landlord") {
      navigate("/landlord");
    }
  }, [navigate]);

  console.log("LandloardLogin component rendered");

  // Send OTP - LANDLORD API
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    try {
      const response = await axios.post(`${baseurl}api/auth/otp/request-otp`, {
        mobile: phone,
        userType: "landlord",
      });
      setOtpSent(true);
      toast.success("OTP sent successfully!");
      setResendAttempts(0);
      setCountdown(0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // Resend OTP with rate limiting - LANDLORD API
  const handleResendOtp = async (e) => {
    e.preventDefault();
    if (countdown > 0) {
      toast.info("Please wait before resending OTP");
      return;
    }
    if (isResending) {
      toast.info("Resending OTP...");
      return;
    }
    setIsResending(true);
    try {
      const response = await axios.post(`${baseurl}api/auth/otp/request-otp`, {
        mobile: phone,
        userType: "landlord",
      });
      toast.success("New OTP sent successfully!");
      const waitTimes = [15, 30, 60, 120, 240];
      const nextWait = waitTimes[resendAttempts] || 300;
      setResendAttempts((prev) => prev + 1);
      setCountdown(nextWait);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  // Verify OTP - LANDLORD API
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }
    try {
      const response = await axios.post(`${baseurl}api/auth/otp/verify-otp`, {
        mobile: phone,
        otp,
        userType: "landlord",
      });

      const isRegistered = response.data?.isRegistered;

      if (!isRegistered) {
        toast.error("Number not registered. Please register first!");
        setTimeout(() => {
          onClose?.();
          navigate("/landlord_signup");
        }, 2000);
        return;
      }

      const token = response.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        const user = { phone, role: "landlord" };
        localStorage.setItem("landlord", JSON.stringify(user));
      }

      login({ phone, role: "landlord", isRegistered: true });
      toast.success("OTP Verified Successfully!");
      setTimeout(() => {
        onClose?.();
        navigate("/landlord");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") otpSent ? handleVerifyOtp(e) : handleSendOtp(e);
  };

  const particlesInit = async (main) => await loadFull(main);

  return (
    // UI MATCHED WITH USER LOGIN: Split-screen layout container
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="relative w-full max-w-5xl h-[650px] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex">

        {/* UI MATCHED WITH USER LOGIN: Modern toast styling */}
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

        {/* UI MATCHED WITH USER LOGIN: LEFT SIDE - Dark sidebar with form */}
        <div className="w-full lg:w-[45%] bg-gradient-to-b from-[#0c2344] to-[#0b4f91] relative overflow-hidden flex items-center justify-center p-6 sm:p-8">
          {/* UI MATCHED WITH USER LOGIN: Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>
          
          {/* UI MATCHED WITH USER LOGIN: Animated particles background */}
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
                    links: { opacity: 0.3 }
                  } 
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
                    area: 800
                  }
                },
                opacity: { value: 0.3 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 2 } },
              },
              detectRetina: true,
            }}
            className="absolute inset-0"
          />

          {/* UI MATCHED WITH USER LOGIN: Form container */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full max-w-md z-10"
          >
            {/* UI MATCHED WITH USER LOGIN: Logo/Icon area */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-15 h-15 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <img 
                    src={logo} 
                    alt="GharZo" 
                    className="h-17 w-[150px] object-contain" 
                  />
                </div>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {!otpSent ? "Welcome back Landlord" : "Verify OTP"}
                </h2>
                <p className="text-slate-400 text-sm">
                  {!otpSent ? (
                    <>
                      New landlord?{" "}
                      <button
                        onClick={() => navigate("/landlord_signup")}
                        className="text-blue-600 hover:text-blue-300 font-semibold transition-colors"
                      >
                        Sign up here →
                      </button>
                    </>
                  ) : (
                    <span>Enter the 6-digit code sent to your phone</span>
                  )}
                </p>
              </div>
            </motion.div>

            {/* UI MATCHED WITH USER LOGIN: Form content with step transitions */}
            <AnimatePresence mode="wait">
              {!otpSent ? (
                // UI MATCHED WITH USER LOGIN: Phone input step
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setPhone(value);
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      maxLength={10}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 bg-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300"
                    onClick={handleSendOtp}
                  >
                    Send OTP
                  </motion.button>

                  <button
                    className="w-full py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-300"
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </button>

                  <p className="text-xs text-white text-center mt-6">
                    By continuing, you agree to our Terms & Conditions
                  </p>
                </motion.div>
              ) : (
                // UI MATCHED WITH USER LOGIN: OTP verification step
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* UI MATCHED WITH USER LOGIN: Phone confirmation */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
                  >
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-300">
                      OTP sent to <span className="text-white font-semibold">+91 {phone}</span>
                    </span>
                  </motion.div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      VERIFICATION CODE
                    </label>
                    <input
                      type="text"
                      placeholder="• • • • • •"
                      maxLength="6"
                      className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-center text-2xl font-semibold tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300"
                    onClick={handleVerifyOtp}
                  >
                    Verify & Continue
                  </motion.button>

                  <button
                    disabled={countdown > 0 || isResending}
                    className={`w-full py-3.5 font-medium rounded-xl transition-all duration-300 ${
                      countdown > 0 || isResending
                        ? "bg-slate-800/30 border border-slate-700 text-slate-600 cursor-not-allowed"
                        : "bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300"
                    }`}
                    onClick={handleResendOtp}
                  >
                    {isResending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resending...
                      </span>
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      "Resend OTP"
                    )}
                  </button>

                  <button
                    className="w-full py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-300"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                  >
                    ← Change Number
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* UI MATCHED WITH USER LOGIN: Footer section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-sm text-center text-slate-400"
            >
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/landlord_signup")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Register Now
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* UI MATCHED WITH USER LOGIN: RIGHT SIDE - Beautiful image background */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block lg:w-[55%] relative overflow-hidden"
        >
          {/* UI MATCHED WITH USER LOGIN: Background image with overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${signupbg})`,
            }}
          >
            {/* UI MATCHED WITH USER LOGIN: Gradient overlay for depth and text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-cyan-900/20 to-blue-900/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
          </div>

          {/* UI MATCHED WITH USER LOGIN: Content overlay on image */}
          <div className="relative h-full flex flex-col justify-end p-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-xl"
            >
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Property Management Made Easy
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                List your properties, manage tenants & grow your rental business. Join thousands of successful landlords today.
              </p>
            </motion.div>

            {/* UI MATCHED WITH USER LOGIN: Decorative stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center gap-4"
            >
            </motion.div>
          </div>

          {/* UI MATCHED WITH USER LOGIN: Floating expand button (decorative) */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
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

export default LandloardLogin;