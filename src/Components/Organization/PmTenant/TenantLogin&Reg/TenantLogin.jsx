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
import signupbg from "../../../assets/Images/signupbg.jpg"; // ✅ background image import

function TenantLogin({ onClose }) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { login } = useAuth();
  const [resendAttempts, setResendAttempts] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("tenanttoken");
    if (token) navigate("/pm_tenant");
  }, [navigate]);

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

  const userType = "tenant";

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    try {
      const response = await axios.post(
        `${baseurl}api/tenant/auth/otp/request`,
        {
          mobile: phone,
          userType,
        }
      );

      toast.success("OTP sent successfully!");
      setOtpSent(true);
      setResendAttempts(0);
      setCountdown(0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // Reset OTP with rate limiting
  const handleResetOtp = async (e) => {
    e.preventDefault();
    if (countdown > 0) {
      toast.info("Please wait before resending OTP");
      return;
    }
    if (isResending) {
      toast.info("Resending OTP...");
      return;
    }
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setIsResending(true);
    try {
      const response = await axios.post(
        `${baseurl}api/tenant/auth/otp/request`,
        {
          mobile: phone,
          userType,
        }
      );
      toast.success("New OTP sent successfully!");
      const waitTimes = [15, 30, 60, 120, 240]; // 15s, 30s, 1min, 2min, 4min
      const nextWait = waitTimes[resendAttempts] || 300; // 5min max
      setResendAttempts((prev) => prev + 1);
      setCountdown(nextWait);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }
    try {
      const response = await axios.post(
        `${baseurl}api/tenant/auth/otp/verify`,
        {
          mobile: phone,
          otp,
          userType,
        }
      );

      const isRegistered = response.data?.isRegistered;
      const token = response.data?.token;
      const userRole = response.data?.user?.role || userType;

      if (!isRegistered) {
        toast.error("Number not registered. Redirecting to signup...");
        setTimeout(() => {
          onClose?.();
          navigate("/tenant_signup");
        }, 1500);
        return;
      }

      if (token) localStorage.setItem("tenanttoken", token);
      localStorage.setItem("role", userRole);

      login({ phone, role: userRole, isRegistered: true });
      toast.success("Login successful!");
      onClose?.();
      navigate("/pm_tenant");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") otpSent ? handleVerifyOtp(e) : handleSendOtp(e);
  };

  const particlesInit = async (main) => await loadFull(main);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* ✅ Background with blur */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${signupbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px)",
        }}
      ></div>

      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "#00000050" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              resize: true,
            },
            modes: { repulse: { distance: 100, duration: 0.4 } },
          },
          particles: {
            color: { value: "#5C4EFF" },
            links: {
              color: "#5C4EFF",
              distance: 150,
              enable: true,
              opacity: 0.4,
              width: 1,
            },
            move: { enable: true, speed: 1.5 },
            number: { value: 50 },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 -z-10"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10"
      >
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 360 }}
          transition={{ duration: 1 }}
          className="flex justify-center mb-4"
        >
          <FaUserCircle className="text-7xl text-[#5C4EFF] drop-shadow-lg" />
        </motion.div>

        <h2 className="text-2xl font-bold text-center text-[#5C4EFF] mb-6">
          Login as <span className="text-green-700">Tenant</span>
        </h2>

        <AnimatePresence mode="wait">
          {!otpSent ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex">
                <input
                  type="tel"
                  placeholder="Enter your number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#5C4EFF]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 hover:bg-[#483fd4] text-white rounded-r-lg shadow-lg"
                  onClick={handleSendOtp}
                >
                  Send OTP
                </motion.button>
              </div>

              {/* Cancel button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-4 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg shadow-lg"
                onClick={() => navigate("/")}
              >
                Cancel
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm text-gray-700 mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4EFF]"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-4 bg-[#5C4EFF] hover:bg-[#483fd4] text-white py-2 rounded-lg shadow-lg"
                onClick={handleVerifyOtp}
              >
                Verify & Login
              </motion.button>

              {/* 🔴 Reset OTP button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={countdown > 0 || isResending}
                className={`w-full mt-2 py-2 rounded-lg shadow-lg text-white ${
                  countdown > 0 || isResending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                onClick={handleResetOtp}
              >
                {isResending ? "Resending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
              </motion.button>

              {/* Cancel button in OTP step */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-2 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg shadow-lg"
                onClick={() => navigate("/")}
              >
                Cancel
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* <div className="mt-4 text-sm text-center">
          Don't have an account?{" "}
          <button
            onClick={() => {
              navigate("/tenant_signup");
            }}
            className="text-[#5C4EFF] hover:underline"
          >
            Register
          </button>
        </div> */}
      </motion.div>
    </div>
  );
}

export default TenantLogin;