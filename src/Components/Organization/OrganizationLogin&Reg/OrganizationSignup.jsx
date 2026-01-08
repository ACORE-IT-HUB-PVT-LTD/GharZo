import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import baseurl from "../../../../BaseUrl.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../../assets/logo/logo.png";
import signupbg from "../../../assets/Images/signupbg.jpg";

function OrganizationSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: "",
    mobile: "",
    email: "",
    password: "",
    headquartersAddress: "",
    postalCode: "",
    country: "",
    logo: null,
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordCriteria, setPasswordCriteria] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isMinLength: false,
  });

  // Email verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const validateOrganizationName = (value) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(value) && value.trim().length > 0;
  };

  const validateMobile = (value) => {
    const regex = /^\d{10}$/;
    return regex.test(value);
  };

  const validateEmail = (value) => {
    const regex = /@gmail\.com$/i;
    return regex.test(value) && value.includes('@') && value.length > 0;
  };

  const validatePassword = (value) => {
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isMinLength = value.length >= 8;

    setPasswordCriteria({
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      isMinLength,
    });

    return hasUppercase && hasLowercase && hasNumber && hasSpecialChar && isMinLength;
  };

  const validateHeadquartersAddress = (value) => {
    const regex = /^[A-Za-z0-9\s,-.]+$/;
    return regex.test(value) && value.trim().length > 0;
  };

  const validatePostalCode = (value) => {
    const regex = /^\d{6}$/;
    return regex.test(value);
  };

  const validateCountry = (value) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(value) && value.trim().length > 0;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateOrganizationName(formData.organizationName)) {
      newErrors.organizationName = "Organization name must contain only letters and spaces.";
    }

    if (!validateMobile(formData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits.";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Email must be a valid Gmail address (ending with @gmail.com).";
    }

    if (!emailVerified) {
      newErrors.emailVerification = "Email verification is required.";
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
    }

    if (!validateHeadquartersAddress(formData.headquartersAddress)) {
      newErrors.headquartersAddress = "Headquarters address must contain letters, numbers, and common punctuation.";
    }

    if (!validatePostalCode(formData.postalCode)) {
      newErrors.postalCode = "Postal code must be exactly 6 digits.";
    }

    if (!validateCountry(formData.country)) {
      newErrors.country = "Country must contain only letters and spaces.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let error = "";

    if (name === "logo" && files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      return;
    }

    // Clear previous error for this field by deleting the key
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation only if value is provided
    if (value.trim().length > 0) {
      switch (name) {
        case "organizationName":
          if (!validateOrganizationName(value)) {
            error = "Organization name must contain only letters and spaces.";
          }
          break;
        case "mobile":
          if (!validateMobile(value)) {
            error = "Mobile number must be exactly 10 digits.";
          }
          break;
        case "password":
          if (!validatePassword(value)) {
            error = "Password must meet all criteria below.";
          }
          break;
        case "headquartersAddress":
          if (!validateHeadquartersAddress(value)) {
            error = "Headquarters address must contain letters, numbers, and common punctuation.";
          }
          break;
        case "postalCode":
          if (!validatePostalCode(value)) {
            error = "Postal code must be exactly 6 digits.";
          }
          break;
        case "country":
          if (!validateCountry(value)) {
            error = "Country must contain only letters and spaces.";
          }
          break;
        default:
          break;
      }
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));
    setEmailVerified(false);
    setShowCodeInput(false);
    setVerificationCode("");
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.email;
      delete newErrors.emailVerification;
      return newErrors;
    });
    if (value.trim().length > 0 && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: "Email must be a valid Gmail address (ending with @gmail.com)." }));
    }
  };

  // Send Email Verification
  const sendVerification = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      toast.error("Valid email is required");
      return;
    }
    try {
      const res = await axios.post(
        `${baseurl}api/organization/send-verification`,
        { email: formData.email },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setShowCodeInput(true);
        toast.success(res.data.message || "Verification email sent successfully! Please check your inbox.");
      } else {
        toast.error("Failed to send verification email");
      }
    } catch (error) {
      console.error("Send verification error:", error);
      toast.error(error.response?.data?.message || "Error sending verification email");
    }
  };

  // Verify Email Code
  const verifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Valid 6-digit code is required");
      return;
    }
    try {
      const res = await axios.post(
        `${baseurl}api/organization/verify-email`,
        { email: formData.email, code: verificationCode },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setEmailVerified(true);
        setShowCodeInput(false);
        setVerificationCode("");
        toast.success(res.data.message || "Email verified successfully!");
      } else {
        toast.error("Failed to verify email");
      }
    } catch (error) {
      console.error("Verify email error:", error);
      toast.error(error.response?.data?.message || "Error verifying email");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("organizationName", formData.organizationName);
    formDataToSend.append("mobile", formData.mobile); // Only number, no +91
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("headquartersAddress", formData.headquartersAddress);
    formDataToSend.append("postalCode", formData.postalCode);
    formDataToSend.append("country", formData.country);
    if (formData.logo) {
      formDataToSend.append("logo", formData.logo);
    }

    try {
      const res = await axios.post(`${baseurl}api/organization/register`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message || "Registration successful!");
        const user = { 
          ...formData, 
          role: "organization", 
          isRegistered: true,
          emailVerified: true 
        };
        localStorage.setItem("organization", JSON.stringify(user));
        navigate("/organization");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred during registration.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      {/* Background with opacity */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{
          backgroundImage: `url(${signupbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px)",
        }}
      ></div>

      <div className="relative bg-gray-800 bg-opacity-10 border border-green-800 rounded-2xl shadow-4xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {/* Left Side Branding */}
        <div className="md:w-1/3 bg-gradient-to-br from-green-800 to-cyan-800 flex flex-col items-center justify-center p-6">
          <img
            src={logo}
            alt="logo"
            className="w-28 h-28 object-contain mb-4"
          />
          <h1 className="text-2xl font-extrabold text-white tracking-wide text-center">
            Organization Portal
          </h1>
        </div>

        {/* Right Side Form */}
        <div className="md:w-2/3 p-4 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Complete Your Registration
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3 opacity-90">
            {/* Organization Name */}
            <div>
              <input
                name="organizationName"
                placeholder="Organization Name"
                value={formData.organizationName}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${errors.organizationName ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-600'}`}
                required
              />
              {errors.organizationName && <p className="text-red-400 text-sm mt-1">{errors.organizationName}</p>}
            </div>

            {/* Mobile + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex">
                <select
                  name="countryCode"
                  defaultValue="+91"
                  onChange={(e) => {}} // Not used in formData, just UI
                  className="p-2 border rounded-l-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled // Fixed to +91 as per requirement
                >
                  <option value="+91">+91 (IN)</option>
                </select>
                <input
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`p-2 border rounded-r-lg bg-gray-800 text-white focus:outline-none focus:ring-2 flex-1 ${errors.mobile ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-600'}`}
                  required
                />
              </div>
              {errors.mobile && <p className="text-red-400 text-sm mt-1 col-span-2">{errors.mobile}</p>}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleEmailChange}
                className={`p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-600'}`}
                required
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Email Verification */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Email Verification</h3>
              {!emailVerified ? (
                <>
                  {!showCodeInput ? (
                    <button
                      type="button"
                      onClick={sendVerification}
                      disabled={!formData.email || !!errors.email}
                      className={`w-full py-2 rounded-lg font-medium transition duration-200 ${!formData.email || !!errors.email ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                    >
                      Send Verification Code
                    </button>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        placeholder="Enter 6-digit Code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={verifyEmail}
                        disabled={verificationCode.length !== 6}
                        className={`py-2 rounded-lg font-medium transition duration-200 ${verificationCode.length !== 6 ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`}
                      >
                        Verify Code
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-900/50 rounded-lg">
                  <span className="text-green-400 font-medium">✓ Email Verified Successfully</span>
                  <span className="text-sm text-gray-300">({formData.email})</span>
                </div>
              )}
            </div>
            {errors.emailVerification && <p className="text-red-400 text-sm mt-1">{errors.emailVerification}</p>}

            {/* Password with Eye Icon and Criteria */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 pr-10 ${errors.password ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-600'}`}
                  required
                />
                <span
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-1 text-xs">
                  <p className={`text-${passwordCriteria.isMinLength ? 'green' : 'red'}-400 flex items-center`}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: passwordCriteria.isMinLength ? '#10b981' : '#ef4444' }}></span>
                    At least 8 characters
                  </p>
                  <p className={`text-${passwordCriteria.hasUppercase ? 'green' : 'red'}-400 flex items-center`}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: passwordCriteria.hasUppercase ? '#10b981' : '#ef4444' }}></span>
                    One uppercase letter
                  </p>
                  <p className={`text-${passwordCriteria.hasLowercase ? 'green' : 'red'}-400 flex items-center`}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: passwordCriteria.hasLowercase ? '#10b981' : '#ef4444' }}></span>
                    One lowercase letter
                  </p>
                  <p className={`text-${passwordCriteria.hasNumber ? 'green' : 'red'}-400 flex items-center`}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: passwordCriteria.hasNumber ? '#10b981' : '#ef4444' }}></span>
                    One number
                  </p>
                  <p className={`text-${passwordCriteria.hasSpecialChar ? 'green' : 'red'}-400 flex items-center`}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: passwordCriteria.hasSpecialChar ? '#10b981' : '#ef4444' }}></span>
                    One special character
                  </p>
                </div>
              )}
            </div>

            {/* Headquarters Address */}
            <div>
              <input
                name="headquartersAddress"
                placeholder="Headquarters Address"
                value={formData.headquartersAddress}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${errors.headquartersAddress ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-600'}`}
                required
              />
              {errors.headquartersAddress && <p className="text-red-400 text-sm mt-1">{errors.headquartersAddress}</p>}
            </div>

            {/* Postal Code + Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  name="postalCode"
                  placeholder="Postal Code"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={`p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${errors.postalCode ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-600'}`}
                  required
                />
                {errors.postalCode && <p className="text-red-400 text-sm mt-1">{errors.postalCode}</p>}
              </div>
              <div>
                <input
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${errors.country ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-600'}`}
                  required
                />
                {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
              </div>
            </div>

            {/* Logo Upload */}
            <input
              type="file"
              name="logo"
              onChange={handleChange}
              className="w-full p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept="image/*"
            />

            {/* Submit + Cancel */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={Object.keys(errors).length > 0 || !emailVerified}
                className={`w-full py-2 rounded-lg font-medium transition duration-200 ${Object.keys(errors).length > 0 || !emailVerified ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-400 to-green-500 hover:bg-blue-700'} text-white`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => navigate("/organization/login")}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
          {/* Added line for existing users */}
          <p className="text-white text-center mt-4 opacity-80">
            Already have an account?{" "}
            <Link
              to="/organization/login"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrganizationSignup;