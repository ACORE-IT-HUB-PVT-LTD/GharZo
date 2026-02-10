import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const PropertyInquiryPage = () => {
  // ==================== STATE MANAGEMENT ====================
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    propertyRegistration: false,
    mortgage: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ==================== HANDLERS ====================

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    // Validate name
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    if (formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return false;
    }

    // Validate phone
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Validate at least one inquiry type is selected
    if (!formData.propertyRegistration && !formData.mortgage) {
      toast.error("Please select at least one inquiry type");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the payload
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ""),
        email: formData.email.trim() || null,
        inquiryTypes: [],
      };

      if (formData.propertyRegistration) {
        payload.inquiryTypes.push("property_registration");
      }
      if (formData.mortgage) {
        payload.inquiryTypes.push("mortgage");
      }

      // Send to API
      const response = await axios.post(
        "https://api.gharzoreality.com/api/inquiries/submit",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Inquiry submitted successfully!"
        );
        setIsSubmitted(true);

        // Reset form after 2 seconds
        setTimeout(() => {
          setFormData({
            name: "",
            phone: "",
            email: "",
            propertyRegistration: false,
            mortgage: false,
          });
          setIsSubmitted(false);
        }, 2000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to submit inquiry. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-12 md:py-20 overflow-hidden">
        {/* Background with gradient and effects */}
        <div className="absolute inset-0 z-0">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 opacity-80"></div>

          {/* Animated gradient blobs */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          ></motion.div>

          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          ></motion.div>

          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform -translate-x-1/2 -translate-y-1/2"
          ></motion.div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,_68,_68,.2)_25%,rgba(68,_68,_68,.2)_50%,transparent_50%,transparent_75%,rgba(68,_68,_68,.2)_75%,rgba(68,_68,_68,.2))] bg-[length:40px_40px]"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-7xl w-full items-center">
          {/* Left side - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-full w-fit">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-400 text-sm font-medium">
                  Your Property Partner
                </span>
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-white">Discover Your</span>{" "}
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Dream Property
                </span>{" "}
                <span className="text-white">Today</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-lg">
                Expert guidance for property registration and mortgage services.
                Let us help you make the right decision for your future.
              </p>
            </motion.div>

            {/* Features list */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="space-y-4 pt-4"
            >
              {[
                "Hassle-free property registration",
                "Expert mortgage consultation",
                "24/7 dedicated support",
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-200">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Hero Image with Effects */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-96 md:h-[500px] lg:h-[600px]"
          >
            {/* Glow effect background */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-blue-500/20 to-orange-600/30 rounded-3xl blur-2xl"
            ></motion.div>

            {/* Image container with border */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative h-full w-full rounded-3xl overflow-hidden border-2 border-orange-500/30 shadow-2xl"
            >
              {/* Image with gradient overlay */}
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                alt="Modern Property"
                className="w-full h-full object-cover"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40"></div>

              {/* Orange accent border */}
              <motion.div
                animate={{
                  boxShadow: [
                    "inset 0 0 20px rgba(249, 115, 22, 0.1)",
                    "inset 0 0 40px rgba(249, 115, 22, 0.2)",
                    "inset 0 0 20px rgba(249, 115, 22, 0.1)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute inset-0 rounded-3xl pointer-events-none"
              ></motion.div>

              {/* Floating badge on image */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute bottom-8 left-8 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 rounded-full text-sm font-semibold shadow-xl"
              >
                ✨ Limited Offers
              </motion.div>
            </motion.div>

            {/* Floating elements */}
            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-blue-600/20 rounded-2xl border border-blue-500/30 backdrop-blur-md flex items-center justify-center"
            >
              <span className="text-3xl">🏠</span>
            </motion.div>

            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: 1,
              }}
              className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-500/20 rounded-2xl border border-orange-500/30 backdrop-blur-md flex items-center justify-center"
            >
              <span className="text-2xl">📊</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-slate-400">Scroll to explore</span>
            <svg
              className="w-6 h-6 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* ==================== INQUIRY FORM SECTION ==================== */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Get Your Free Consultation
              </span>
            </h2>
            <p className="text-slate-400 text-lg">
              Fill out the form below and our experts will get back to you
              within 24 hours.
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 md:p-12 shadow-2xl overflow-hidden"
          >
            {/* Glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-blue-500/5 to-orange-500/5 opacity-50"></div>

            {/* Border gradient effect */}
            <motion.div
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
              className="absolute inset-0 opacity-0 hover:opacity-20 pointer-events-none rounded-2xl transition-opacity"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, transparent 25%, rgba(249, 115, 22, 0.1), transparent 75%)",
                backgroundSize: "200% 200%",
              }}
            ></motion.div>

            {/* Form content */}
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 md:space-y-8 relative z-10"
                >
                  {/* Name field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      Full Name <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full px-6 py-3.5 bg-slate-700/50 border-2 border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 backdrop-blur-sm"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-500">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Phone field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      Phone Number <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const phoneNum = e.target.value.replace(/\D/g, "");
                          if (phoneNum.length <= 10) {
                            handleInputChange({
                              ...e,
                              target: { ...e.target, value: phoneNum },
                            });
                          }
                        }}
                        placeholder="Enter 10-digit phone number"
                        maxLength="10"
                        inputMode="numeric"
                        className="w-full px-6 py-3.5 bg-slate-700/50 border-2 border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 backdrop-blur-sm"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-500">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.692 1.608 2.25 3.166 3.86 4.858l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Email field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      Email Address{" "}
                      <span className="text-slate-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className="w-full px-6 py-3.5 bg-slate-700/50 border-2 border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 backdrop-blur-sm"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-500">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Inquiry Type */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                  >
                    <label className="block text-sm font-semibold text-slate-200">
                      Inquiry Type <span className="text-orange-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {/* Property Registration */}
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center p-4 bg-slate-700/30 border-2 border-slate-600/30 rounded-lg cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:bg-slate-700/50"
                      >
                        <input
                          type="checkbox"
                          name="propertyRegistration"
                          checked={formData.propertyRegistration}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-orange-500 text-orange-500 focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
                        />
                        <div className="ml-4 flex-1">
                          <p className="text-white font-medium">
                            Property Registration
                          </p>
                          <p className="text-sm text-slate-400">
                            Help with property registration and documentation
                          </p>
                        </div>
                        <span className="text-2xl">📋</span>
                      </motion.label>

                      {/* Mortgage */}
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center p-4 bg-slate-700/30 border-2 border-slate-600/30 rounded-lg cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:bg-slate-700/50"
                      >
                        <input
                          type="checkbox"
                          name="mortgage"
                          checked={formData.mortgage}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-orange-500 text-orange-500 focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
                        />
                        <div className="ml-4 flex-1">
                          <p className="text-white font-medium">
                            Mortgage Consultation
                          </p>
                          <p className="text-sm text-slate-400">
                            Expert guidance on mortgage options and rates
                          </p>
                        </div>
                        <span className="text-2xl">💰</span>
                      </motion.label>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-500/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
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
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </motion.button>

                  {/* Privacy notice */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center text-xs text-slate-500"
                  >
                    We respect your privacy. Your information will be kept
                    confidential.
                  </motion.p>
                </motion.form>
              ) : (
                // Success message
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12 space-y-4 relative z-10"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6 }}
                    className="text-6xl mb-4"
                  >
                    ✨
                  </motion.div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    Thank You!
                  </h3>

                  <p className="text-slate-300 text-lg">
                    Your inquiry has been submitted successfully. Our team will
                    contact you within 24 hours.
                  </p>

                  <div className="pt-6 text-orange-400 font-medium">
                    Redirecting...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: "📞",
                title: "Call Us",
                content: "+91 (XXX) XXX-XXXX",
              },
              {
                icon: "📧",
                title: "Email",
                content: "info@gharzoreality.com",
              },
              {
                icon: "🕐",
                title: "Working Hours",
                content: "9 AM - 6 PM (Mon - Sat)",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-orange-500/50 transition-all duration-300"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                <p className="text-slate-400">{item.content}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default PropertyInquiryPage;