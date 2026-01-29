import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Building2, Users, MapPin, TrendingUp } from "lucide-react";
import baseurl from "../../../../BaseUrl";

function FranchiseEnquiry() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    investmentCapacity: "",
    experience: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";

    if (name === "fullName" && !value.trim()) {
      error = "Full name is required";
    }
    if (name === "email") {
      if (!value.trim()) error = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Enter a valid email";
    }
    if (name === "phone") {
      const cleaned = value.replace(/\s/g, "");
      if (!value.trim()) error = "Phone number is required";
      else if (!/^\d{10}$/.test(cleaned)) error = "Must be a valid 10-digit number";
    }
    if (name === "city" && !value.trim()) {
      error = "City is required";
    }
    if (name === "investmentCapacity" && !value.trim()) {
      error = "Investment capacity is required";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "message" && !formData[key].trim()) {
        newErrors[key] = `${key.replace(/([A-Z])/g, " $1").trim()} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (!validateForm()) {
      const firstError = Object.values(errors).find((err) => err);
      if (firstError) {
        toast.error(firstError, {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${baseurl}api/public/enquiries/franchise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactInfo: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
          message: formData.message || "Franchise enquiry submitted",
          typeSpecificData: {
            franchiseDetails: {
              city: formData.city,
              investmentCapacity: formData.investmentCapacity,
              experience: formData.experience,
            },
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Enquiry submitted successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
          className: "bg-sky-500 text-white",
        });
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          city: "",
          investmentCapacity: "",
          experience: "",
          message: "",
        });
        setErrors({});
        setTouched({});
      } else {
        toast.error(data.message || "Failed to submit enquiry", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 px-4 py-16">
      <ToastContainer />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#002B5C] to-[#003A75] p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center gap-3">
              <Building2 className="text-[#FF6B00]" size={40} />
              Franchise Enquiry
            </h1>
            <p className="text-blue-200 text-lg">Join our growing network of successful franchise partners</p>
          </motion.div>
        </div>

        <div className="p-8 md:p-12 space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block mb-2 text-sm font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your name"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.fullName ? "border-red-400" : "border-gray-200"
                } focus:outline-none focus:border-[#FF6B00] transition-all`}
              />
              {errors.fullName && touched.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block mb-2 text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="name@example.com"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.email ? "border-red-400" : "border-gray-200"
                } focus:outline-none focus:border-[#FF6B00] transition-all`}
              />
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block mb-2 text-sm font-semibold text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="9876543210"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.phone ? "border-red-400" : "border-gray-200"
                } focus:outline-none focus:border-[#FF6B00] transition-all`}
              />
              {errors.phone && touched.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block mb-2 text-sm font-semibold text-gray-700">Preferred City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.city ? "border-red-400" : "border-gray-200"
                } focus:outline-none focus:border-[#FF6B00] transition-all`}
              />
              {errors.city && touched.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block mb-2 text-sm font-semibold text-gray-700">Investment Capacity (INR)</label>
              <select
                name="investmentCapacity"
                value={formData.investmentCapacity}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.investmentCapacity ? "border-red-400" : "border-gray-200"
                } focus:outline-none focus:border-[#FF6B00] transition-all`}
              >
                <option value="">Select investment range</option>
                <option value="5-10L">5 Lakh - 10 Lakh</option>
                <option value="10-25L">10 Lakh - 25 Lakh</option>
                <option value="25-50L">25 Lakh - 50 Lakh</option>
                <option value="50L+">50 Lakh+</option>
              </select>
              {errors.investmentCapacity && touched.investmentCapacity && (
                <p className="text-red-500 text-xs mt-1">{errors.investmentCapacity}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block mb-2 text-sm font-semibold text-gray-700">Business Experience</label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#FF6B00] transition-all"
              >
                <option value="">Select experience</option>
                <option value="fresher">Fresher</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </motion.div>
          </div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <label className="block mb-2 text-sm font-semibold text-gray-700">Additional Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us about your background and why you're interested in this franchise..."
              className="w-full px-4 py-3 h-28 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#FF6B00] transition-all resize-none"
            ></textarea>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            className={`w-full bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Franchise Enquiry"
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default FranchiseEnquiry;
