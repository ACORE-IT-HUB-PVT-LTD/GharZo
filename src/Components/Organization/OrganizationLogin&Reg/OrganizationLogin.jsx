import React, { useState, useEffect } from "react";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import baseurl from "../../../../BaseUrl.js";

const orgbg = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8UHJvcGVydHl8ZW58MHx8MHx8fDA%3D";

function OrganizationLogin({ onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  // Auto-redirect if orgToken exists
  useEffect(() => {
    const token = localStorage.getItem("orgToken");
    if (token && token.trim().length > 0) {
      navigate("/organization");
    }
  }, [navigate]);

  // Validate email and password
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const res = await axios.post(`${baseurl}api/organization/login`, {
        email,
        password,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200 || res.status === 201) {
        const { data } = res.data;
        const user = {
          ...data,
          role: "organization",
          isRegistered: true,
          emailVerified: data.emailVerified,
        };
        localStorage.setItem("orgToken", res.data.token); // Consistent key
        login(user); // Update auth context
        toast.success("Login successful!");
        onClose?.();
        navigate("/organization");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred during login.";
      toast.error(errorMessage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit(e);
  };

  const particlesInit = async (main) => await loadFull(main);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${orgbg})`,
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative z-10"
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
          Login as <span className="text-green-700">Organization</span>
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-sm text-gray-700 mb-1">Email ID</label>
            <input
              type="email"
              placeholder="Enter your email ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4EFF] mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Email ID"
            />

            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4EFF]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-4 bg-[#5C4EFF] hover:bg-[#483fd4] text-white py-2 rounded-lg shadow-lg"
              onClick={handleSubmit}
              aria-label="Login"
            >
              Login
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-3 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg shadow-lg"
              onClick={() => navigate("/")}
              aria-label="Cancel"
            >
              Cancel
            </motion.button>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 text-sm text-center">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/organization/signup")}
            className="text-[#5C4EFF] hover:underline"
          >
            Register
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default OrganizationLogin;