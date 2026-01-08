import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../../assets/logo/logo.png";
// UI UPDATED: Import real estate signup image
import signupImage from "../../../assets/Images/landlord_signup.jpg";
import baseurl from "../../../../BaseUrl.js";

// Custom toast styles with gradient
const toastStyle = {
  style: {
    background: 'linear-gradient(to right, #3b82f6, #06b6d4, #22c55e)',
    color: '#fff',
    fontWeight: '500',
    padding: '16px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  iconTheme: {
    primary: '#fff',
    secondary: '#3b82f6',
  },
  duration: 4000,
};

function Signup() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mobileFromLogin = location.state?.mobile || "";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: mobileFromLogin,
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
    },
    dob: "",
  });

  // KYC states
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarDisplay, setAadhaarDisplay] = useState(""); // For formatted display
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [panNumber, setPanNumber] = useState("");
  const [panVerified, setPanVerified] = useState(false);

  // === EMAIL VERIFICATION STATES REMOVED ===
  // const [emailVerified, setEmailVerified] = useState(false);
  // const [verificationCode, setVerificationCode] = useState("");
  // const [showCodeInput, setShowCodeInput] = useState(false);

  const [profilePhoto, setProfilePhoto] = useState(null);

  // Format Aadhaar with spaces (1234 5678 9012)
  const formatAadhaar = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  // Handle Aadhaar input change
  const handleAadhaarChange = (e) => {
    const input = e.target.value;
    const cleaned = input.replace(/\D/g, ''); // Remove non-digits
    
    if (cleaned.length <= 12) {
      setAadhaarNumber(cleaned);
      setAadhaarDisplay(formatAadhaar(cleaned));
    }
  };

  // Generate Aadhaar OTP
  const generateOtp = async (e) => {
    e.preventDefault();
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      toast.error("Valid 12-digit Aadhaar number is required", toastStyle);
      return;
    }
    
    const loadingToast = toast.loading("Generating OTP...", toastStyle);
    
    try {
      const res = await axios.post(
        `${baseurl}api/kyc/aadhaar/generate-otp`,
        { aadhaarNumber },
        { headers: { "Content-Type": "application/json" } }
      );
      
      toast.dismiss(loadingToast);
      
      if (res.data.success) {
        setTxnId(res.data.txnId);
        setShowOtpInput(true);
        toast.success(res.data.message || "OTP sent successfully!", toastStyle);
      } else {
        toast.error("Failed to generate OTP", toastStyle);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("OTP generation error:", error);
      toast.error(error.response?.data?.message || "Error generating OTP", toastStyle);
    }
  };

  // Verify Aadhaar OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Valid 6-digit OTP is required", toastStyle);
      return;
    }
    if (!txnId) return;
    
    const loadingToast = toast.loading("Verifying OTP...", toastStyle);
    
    try {
      const res = await axios.post(
        `${baseurl}api/kyc/aadhaar/submit-otp`,
        { txnId, otp },
        { headers: { "Content-Type": "application/json" } }
      );
      
      toast.dismiss(loadingToast);
      
      if (res.data.success) {
        const data = res.data.data;
        setForm((prev) => ({
          ...prev,
          fullName: data.full_name || prev.fullName,
          dob: data.dob || prev.dob,
          gender:
            (data.gender === "M" ? "Male" : data.gender === "F" ? "Female" : "") ||
            prev.gender,
          address: {
            ...prev.address,
            street: data.address.street || prev.address.street || data.address.landmark || "",
            city: (data.address.po || data.address.loc || data.address.subdist || data.address.vtc || "") || prev.address.city,
            state: data.address.state || prev.address.state,
            postalCode: data.zip || prev.address.postalCode,
          },
        }));
        setAadhaarVerified(true);
        setShowOtpInput(false);
        setOtp("");
        const verifiedAadhaar = data.aadhaar_number || aadhaarNumber;
        setAadhaarNumber(verifiedAadhaar);
        setAadhaarDisplay(formatAadhaar(verifiedAadhaar));
        toast.success(res.data.message || "Aadhaar verified successfully! ✓", toastStyle);
      } else {
        toast.error("Failed to verify OTP", toastStyle);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message || "Error verifying OTP", toastStyle);
    }
  };

  // === EMAIL VERIFICATION FUNCTIONS COMMENTED OUT ===
  // const sendVerification = async (e) => { ... }
  // const verifyEmail = async (e) => { ... }

  // Verify PAN
  const verifyPan = async (e) => {
    e.preventDefault();
    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      toast.error("Valid PAN number is required (e.g., ABCDE1234F)", toastStyle);
      return;
    }
    
    const loadingToast = toast.loading("Verifying PAN...", toastStyle);
    
    try {
      const res = await axios.post(
        `${baseurl}api/kyc/pan`,
        { panNumber },
        { headers: { "Content-Type": "application/json" } }
      );
      
      toast.dismiss(loadingToast);
      
      if (res.data.success) {
        const data = res.data.data;
        if (form.fullName && form.fullName.toUpperCase() !== data.full_name.toUpperCase()) {
          toast(`Name mismatch detected. Using Aadhaar name.`, {
            ...toastStyle,
            icon: '⚠️',
          });
        } else {
          setForm((prev) => ({
            ...prev,
            fullName: data.full_name || prev.fullName,
          }));
        }
        setPanVerified(true);
        setPanNumber(data.pan_number || panNumber);
        toast.success(res.data.message || "PAN verified successfully! ✓", toastStyle);
      } else {
        toast.error("Failed to verify PAN", toastStyle);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("PAN verification error:", error);
      toast.error(error.response?.data?.message || "Error verifying PAN", toastStyle);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["street", "city", "state", "postalCode"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (e) => setProfilePhoto(e.target.files[0]);

  // Validation - REMOVED email verification requirement
  const validateForm = () => {
    if (!form.fullName) return "Full name is required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Valid Email is required";
    if (!form.phone || !/^\d{7,15}$/.test(form.phone))
      return "Valid phone number required (7-15 digits)";
    if (!form.dob) return "Date of Birth is required";
    if (!form.gender) return "Gender is required";
    if (!aadhaarVerified) return "Aadhaar verification is required";
    if (!panVerified) return "PAN verification is required";
    if (!form.address.street) return "Street is required";
    if (!form.address.city) return "City is required";
    if (!form.address.state) return "State is required";
    if (!form.address.postalCode) return "Postal Code is required";
    return null;
  };

  // Submit
  const handleSignup = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error(error, toastStyle);
      return;
    }

    const safeAddress = form?.address || {};
    const fullAddress = `${safeAddress.street || ""} ${safeAddress.city || ""}`.trim();

    const formData = new FormData();
    formData.append("name", form?.fullName?.trim() || "");
    formData.append("mobile", form?.phone || "");
    formData.append("email", form?.email || "");
    formData.append("aadhaar", aadhaarNumber || "");
    formData.append("pan", panNumber || "");
    formData.append("address", fullAddress);
    formData.append("pinCode", safeAddress.postalCode || "");
    formData.append("state", safeAddress.state || "");
    formData.append("dob", form?.dob || "");
    formData.append("gender", form?.gender || "");
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);

    const loadingToast = toast.loading("Creating your account...", toastStyle);

    try {
      const res = await axios.post(
        `${baseurl}api/landlord/register`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      toast.dismiss(loadingToast);
      
      if (res.status === 200 || res.status === 201) {
        const token = res.data.token || res.data.accessToken || res.data.data?.token;
        
        if (!token) {
          console.error("No token received in response:", res.data);
          toast.error("Registration successful but no auth token received. Please contact support.", toastStyle);
          return;
        }
        
        toast.success("Registration successful! Welcome aboard! 🎉", toastStyle);
        
        login?.({ 
          ...form, 
          token,
          isRegistered: true 
        });
        
        setTimeout(() => {
          navigate?.("/landlord");
        }, 1500);
      } else {
        toast.error("Registration failed. Please try again.", toastStyle);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Registration error:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Error while registering. Please try again.";
      toast.error(errMsg, toastStyle);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-100 flex items-center justify-center p-4 sm:p-6">
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          className: '',
          style: {
            background: 'linear-gradient(to right, #3b82f6, #06b6d4, #22c55e)',
            color: '#fff',
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Side - Image Panel (unchanged) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-2/5 relative overflow-hidden min-h-[300px] lg:min-h-[900px]"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${signupImage})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-cyan-900/60 to-blue-900/70"></div>
              </div>

              <div className="relative h-full flex flex-col justify-between p-8 sm:p-12 z-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-white rounded-xl p-2 shadow-lg">
                      <img src={logo} alt="GharZo Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">GharZo</h1>
                      <p className="text-cyan-200 text-xs">Landlord Portal</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                    List Your Properties<br />
                    <span className="text-cyan-300">Grow Your Business</span>
                  </h2>
                  <p className="text-white/90 text-base sm:text-lg mb-6 leading-relaxed">
                    Join thousands of landlords managing their properties efficiently with our platform.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {['KYC Verified', 'Secure Platform', 'Easy Management'].map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-sm font-medium"
                      >
                        ✓ {feature}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Form Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:w-3/5 p-6 sm:p-10 overflow-y-auto max-h-[110vh]"
            >
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Complete Your Registration
                </h2>
                <p className="text-gray-600 text-sm">
                  Secure KYC verification for landlords
                </p>
              </div>

              <form onSubmit={handleSignup} encType="multipart/form-data" className="space-y-5">
                
                {/* Section 1 - Personal Info (unchanged) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
                    <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                  </div>

                  <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="date" name="dob" value={form.dob} onChange={handleChange} required className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300" />
                    <select name="gender" value={form.gender} onChange={handleChange} required className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </motion.div>

                {/* Section 2 - Contact (Email verification UI removed) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
                    <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300" />
                    <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300" />
                  </div>
                </motion.div>

                {/* Section 3 - KYC Verification (unchanged) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</div>
                    <h3 className="text-lg font-bold text-gray-800">KYC Verification</h3>
                  </div>

                  {/* Aadhaar Verification (unchanged) */}
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">🆔</span>
                      Aadhaar Verification
                    </h4>
                    {!aadhaarVerified ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input placeholder="1234 5678 9012" value={aadhaarDisplay} onChange={handleAadhaarChange} maxLength={14} className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 tracking-wider font-semibold" />
                          <button type="button" onClick={generateOtp} disabled={!aadhaarNumber || aadhaarNumber.length !== 12} className="py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg transition-all duration-300">
                            Generate OTP
                          </button>
                        </div>
                        {showOtpInput && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6} className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-center font-semibold tracking-widest" />
                            <button type="button" onClick={verifyOtp} disabled={otp.length !== 6} className="py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg transition-all duration-300">
                              ✓ Verify OTP
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-green-100 border-2 border-green-300 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">✓</div>
                        <div>
                          <p className="text-green-800 font-semibold text-sm">Aadhaar Verified!</p>
                          <p className="text-green-600 text-xs tracking-wider">{aadhaarDisplay}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PAN Verification (unchanged) */}
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">💳</span>
                      PAN Verification
                    </h4>
                    {!panVerified ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input placeholder="ABCDE1234F" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} maxLength={10} className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 font-semibold uppercase" />
                        <button type="button" onClick={verifyPan} disabled={!panNumber || panNumber.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)} className="py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg transition-all duration-300">
                          Verify PAN
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-100 border-2 border-green-300 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">✓</div>
                        <div>
                          <p className="text-green-800 font-semibold text-sm">PAN Verified!</p>
                          <p className="text-green-600 text-xs">{panNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Section 4 - Address (unchanged) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">4</div>
                    <h3 className="text-lg font-bold text-gray-800">Address Details</h3>
                  </div>

                  <input name="street" placeholder="Street Address" value={form.address.street} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="city" placeholder="City" value={form.address.city} onChange={handleChange} required className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300" />
                    <input name="state" placeholder="State" value={form.address.state} onChange={handleChange} required className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300" />
                  </div>

                  <input name="postalCode" placeholder="Postal Code" value={form.address.postalCode} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300" />
                </motion.div>

                {/* Profile Photo (unchanged) */}
                <div className="pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profile Photo (Optional)
                  </label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" />
                </div>

                {/* Submit Button - Now only depends on Aadhaar & PAN */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={!aadhaarVerified || !panVerified ? {} : { scale: 1.01, y: -2 }}
                    whileTap={!aadhaarVerified || !panVerified ? {} : { scale: 0.99 }}
                    type="submit"
                    disabled={!aadhaarVerified || !panVerified}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      !aadhaarVerified || !panVerified
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/40"
                    }`}
                  >
                    {!aadhaarVerified ? "🆔 Verify Aadhaar First" : !panVerified ? "💳 Verify PAN First" : "🎉 Complete Registration"}
                  </motion.button>
                  <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;