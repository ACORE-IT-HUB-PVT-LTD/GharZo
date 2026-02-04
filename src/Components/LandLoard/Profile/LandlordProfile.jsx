import React, { useEffect, useState } from "react";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCake,
  HiOutlineUser,
} from "react-icons/hi";
import {
  MdLocationOn,
  MdOutlinePin,
  MdFingerprint,
  MdAccountBox,
} from "react-icons/md";
import { FiLogOut, FiEdit, FiSave, FiTrash2, FiUpload, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instaUser from "../../../assets/Images/instaUser.jpg";

// Dummy Data
const DUMMY_PROFILE = {
  name: "Rajesh Kumar",
  email: "rajesh.kumar@gmail.com",
  mobile: "9876543210",
  dob: "1985-06-15",
  gender: "Male",
  address: "123, MG Road, Vijay Nagar",
  pinCode: "452010",
  state: "Madhya Pradesh",
  aadhaarNumber: "1234 5678 9012",
  panNumber: "ABCDE1234F",
  profilePhoto: null,
  bankAccount: {
    accountHolderName: "Rajesh Kumar",
    accountNumber: "1234567890123456",
    ifscCode: "SBIN0001234",
    bankName: "State Bank of India",
    branchName: "Vijay Nagar Branch"
  }
};

function LandlordProfile() {
  const [profile, setProfile] = useState(DUMMY_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [kycVerified, setKycVerified] = useState(true); // Pre-verified for dummy data

  // Signature state
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Sidebar hover effect
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);
      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  // Initialize with dummy data
  useEffect(() => {
    // Load from localStorage or use dummy data
    const storedProfile = localStorage.getItem("landlordProfile");
    const storedSignature = localStorage.getItem("landlordSignature");

    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setProfile(parsedProfile);
      setFormData({
        ...parsedProfile,
        bankAccountHolderName: parsedProfile.bankAccount?.accountHolderName || "",
        bankAccountNumber: parsedProfile.bankAccount?.accountNumber || "",
        bankIfscCode: parsedProfile.bankAccount?.ifscCode || "",
        bankName: parsedProfile.bankAccount?.bankName || "",
        branchName: parsedProfile.bankAccount?.branchName || ""
      });
      if (parsedProfile.bankAccount?.accountNumber && parsedProfile.bankAccount?.ifscCode) {
        setKycVerified(true);
      }
    } else {
      // Use dummy data
      setProfile(DUMMY_PROFILE);
      setFormData({
        ...DUMMY_PROFILE,
        bankAccountHolderName: DUMMY_PROFILE.bankAccount?.accountHolderName || "",
        bankAccountNumber: DUMMY_PROFILE.bankAccount?.accountNumber || "",
        bankIfscCode: DUMMY_PROFILE.bankAccount?.ifscCode || "",
        bankName: DUMMY_PROFILE.bankAccount?.bankName || "",
        branchName: DUMMY_PROFILE.bankAccount?.branchName || ""
      });
      localStorage.setItem("landlordProfile", JSON.stringify(DUMMY_PROFILE));
    }

    if (storedSignature) {
      setSignatureUrl(storedSignature);
    }

    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("landlordProfile");
    localStorage.removeItem("landlordSignature");
    toast.success("Logged out successfully!", {
      position: "top-center",
      autoClose: 1500,
      theme: "light",
    });
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePhoto") {
      if (files?.[0]) {
        setFormData((p) => ({ ...p, profilePhoto: files[0] }));
        setPreviewImage(URL.createObjectURL(files[0]));
      }
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleUpdate = () => {
    try {
      // Update profile in state and localStorage
      const updatedProfile = {
        ...profile,
        ...formData,
        bankAccount: {
          accountHolderName: formData.bankAccountHolderName || "",
          accountNumber: formData.bankAccountNumber || "",
          ifscCode: formData.bankIfscCode || "",
          bankName: formData.bankName || "",
          branchName: formData.branchName || ""
        }
      };

      // If profile photo was updated as a file, convert to base64 for localStorage
      if (formData.profilePhoto instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          updatedProfile.profilePhoto = reader.result;
          setProfile(updatedProfile);
          localStorage.setItem("landlordProfile", JSON.stringify(updatedProfile));
          toast.success("Profile Updated Successfully! 🎉", {
            position: "top-center",
            autoClose: 2000,
            theme: "light",
          });
          setEditMode(false);
          setPreviewImage(null);
        };
        reader.readAsDataURL(formData.profilePhoto);
      } else {
        setProfile(updatedProfile);
        localStorage.setItem("landlordProfile", JSON.stringify(updatedProfile));
        toast.success("Profile Updated Successfully! 🎉", {
          position: "top-center",
          autoClose: 2000,
          theme: "light",
        });
        setEditMode(false);
        setPreviewImage(null);
      }

      setFormData({
        ...updatedProfile,
        bankAccountHolderName: updatedProfile.bankAccount?.accountHolderName || "",
        bankAccountNumber: updatedProfile.bankAccount?.accountNumber || "",
        bankIfscCode: updatedProfile.bankAccount?.ifscCode || "",
        bankName: updatedProfile.bankAccount?.bankName || "",
        branchName: updatedProfile.bankAccount?.branchName || ""
      });

      if (updatedProfile.bankAccount?.accountNumber && updatedProfile.bankAccount?.ifscCode) {
        setKycVerified(true);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong while updating.");
    }
  };

  // Mock KYC Bank Verification
  const handleKycVerify = () => {
    const accountNumber = formData.bankAccountNumber;
    const ifsc = formData.bankIfscCode;
    const holderName = formData.bankAccountHolderName;

    if (!accountNumber || !ifsc || !holderName) {
      toast.error("Please enter all bank details first.", {
        position: "top-center",
        autoClose: 2000,
        theme: "light",
      });
      return;
    }

    // Mock verification - simulate API delay
    toast.info("Verifying bank details...", {
      position: "top-center",
      autoClose: 1500,
      theme: "light",
    });

    setTimeout(() => {
      setKycVerified(true);
      toast.success(`✅ Bank Verified Successfully! 
Name: ${holderName}
Bank: ${formData.bankName || "SBI"}`, {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
      });
    }, 1500);
  };

  // Upload Signature
  const uploadSignature = () => {
    if (!signatureFile) return;

    toast.info("Uploading signature...", {
      position: "top-center",
      autoClose: 1000,
      theme: "light",
    });

    setTimeout(() => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Signature = reader.result;
        setSignatureUrl(base64Signature);
        localStorage.setItem("landlordSignature", base64Signature);
        setSignatureFile(null);
        toast.success("✅ Signature uploaded successfully!", {
          position: "top-center",
          autoClose: 2000,
          theme: "light",
        });
      };
      reader.readAsDataURL(signatureFile);
    }, 1000);
  };

  // Delete Signature
  const deleteSignature = () => {
    setSignatureUrl(null);
    setSignatureFile(null);
    localStorage.removeItem("landlordSignature");
    toast.success("Signature removed successfully", {
      position: "top-center",
      autoClose: 2000,
      theme: "light",
    });
  };

  // Handle Signature Drop
  const handleSignatureDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSignatureFile(file);
      setSignatureUrl(URL.createObjectURL(file));
      toast.success("Signature file ready to upload!", {
        position: "top-center",
        autoClose: 1500,
        theme: "light",
      });
    } else {
      toast.error("Please upload an image file", {
        position: "top-center",
        autoClose: 2000,
        theme: "light",
      });
    }
  };

  const handleSignatureSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSignatureFile(file);
      setSignatureUrl(URL.createObjectURL(file));
      toast.success("Signature file ready to upload!", {
        position: "top-center",
        autoClose: 1500,
        theme: "light",
      });
    } else {
      toast.error("Please upload an image file", {
        position: "top-center",
        autoClose: 2000,
        theme: "light",
      });
    }
  };

  // Get profile image URL – fallback to local instaUser.jpg
  const getProfileImage = () => {
    if (editMode && previewImage) return previewImage;
    if (profile?.profilePhoto) {
      // Check if it's a base64 string or URL
      if (typeof profile.profilePhoto === 'string' && profile.profilePhoto.startsWith('data:')) {
        return profile.profilePhoto;
      }
    }
    return instaUser;
  };

  if (loading) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center relative transition-all duration-500 min-w-0 ${
          isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{
          background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`
        }}
      >
        <div className="w-full max-w-4xl p-6">
          <div className="animate-pulse">
            <div className="h-8 w-64 rounded-lg bg-gray-300 mx-auto mb-6" />
            <div className="h-32 w-32 rounded-full bg-gray-300 mx-auto mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen py-4 px-4 relative transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`
      }}
    >
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header with Profile Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Landlord Profile
          </h1>
          <p className="text-orange-200">Manage your personal information and settings</p>
        </div>

        {/* Main Card with Glassmorphism on dark background */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          {/* Avatar with enhanced Glassmorphism & orange accent */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-orange-500/40 blur-2xl scale-110 group-hover:scale-125 transition duration-500 -z-10" />
              <img
                src={getProfileImage()}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl ring-4 ring-orange-400/50 group-hover:ring-orange-300/70 transition duration-300"
              />
              {editMode && (
                <label className="block mt-4 text-center">
                  <input
                    type="file"
                    name="profilePhoto"
                    accept="image/*"
                    onChange={handleChange}
                    className="text-sm text-orange-300 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-white/20 file:text-white hover:file:bg-white/30 cursor-pointer backdrop-blur-sm"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Profile Fields - Glassmorphism cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Name"
              icon={<HiOutlineUser className="text-orange-300" />}
              value={formData?.name || profile?.name}
              name="name"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Email"
              icon={<HiOutlineMail className="text-orange-300" />}
              value={formData?.email || profile?.email}
              name="email"
              onChange={handleChange}
              editMode={editMode}
              type="email"
            />
            <Field
              label="Mobile"
              icon={<HiOutlinePhone className="text-orange-300" />}
              value={formData?.mobile || profile?.mobile}
              name="mobile"
              onChange={handleChange}
              editMode={editMode}
              type="tel"
            />
            <Field
              label="Date of Birth"
              icon={<HiOutlineCake className="text-orange-300" />}
              value={(formData?.dob || profile?.dob || "").slice(0, 10)}
              name="dob"
              onChange={handleChange}
              editMode={editMode}
              type="date"
            />
            <Field
              label="Gender"
              icon={<HiOutlineUser className="text-orange-300" />}
              value={formData?.gender || profile?.gender}
              name="gender"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Address"
              icon={<MdLocationOn className="text-orange-300" />}
              value={formData?.address || profile?.address}
              name="address"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Pin Code"
              icon={<MdOutlinePin className="text-orange-300" />}
              value={formData?.pinCode || profile?.pinCode}
              name="pinCode"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="State"
              icon={<MdLocationOn className="text-orange-300" />}
              value={formData?.state || profile?.state}
              name="state"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Aadhaar Number"
              icon={<MdFingerprint className="text-orange-300" />}
              value={formData?.aadhaarNumber || profile?.aadhaarNumber}
              name="aadhaarNumber"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="PAN Number"
              icon={<MdAccountBox className="text-orange-300" />}
              value={formData?.panNumber || profile?.panNumber}
              name="panNumber"
              onChange={handleChange}
              editMode={editMode}
            />
          </div>

          {/* Bank Details Section */}
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-orange-200 mb-4 flex items-center gap-2">
              <MdAccountBox className="text-orange-300 text-xl" /> Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Account Holder Name"
                icon={<HiOutlineUser className="text-orange-300" />}
                value={formData?.bankAccountHolderName || profile?.bankAccount?.accountHolderName}
                name="bankAccountHolderName"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="Account Number"
                icon={<MdAccountBox className="text-orange-300" />}
                value={formData?.bankAccountNumber || profile?.bankAccount?.accountNumber}
                name="bankAccountNumber"
                onChange={handleChange}
                editMode={editMode}
                type="text"
              />
              <Field
                label="IFSC Code"
                icon={<MdFingerprint className="text-orange-300" />}
                value={formData?.bankIfscCode || profile?.bankAccount?.ifscCode}
                name="bankIfscCode"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="Bank Name"
                icon={<MdAccountBox className="text-orange-300" />}
                value={formData?.bankName || profile?.bankAccount?.bankName}
                name="bankName"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="Branch Name"
                icon={<MdLocationOn className="text-orange-300" />}
                value={formData?.branchName || profile?.bankAccount?.branchName}
                name="branchName"
                onChange={handleChange}
                editMode={editMode}
              />
            </div>
          </div>

          {/* KYC Verification */}
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
            <h3 className="text-base font-semibold text-orange-200 mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-orange-300" /> Bank KYC Verification
            </h3>
            {!kycVerified ? (
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <button
                  onClick={handleKycVerify}
                  className="px-4 py-2 bg-orange-600/80 text-white rounded-lg hover:bg-orange-500 transition text-sm backdrop-blur-sm font-semibold"
                >
                  Verify Bank Details
                </button>
                <p className="text-xs text-orange-200/70">Click to verify your bank account</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-300 bg-green-500/10 p-3 rounded-lg">
                <FiCheckCircle className="text-xl" />
                <div>
                  <span className="font-medium block">Bank Account Verified ✓</span>
                  {(formData?.bankAccountHolderName || profile?.bankAccount?.accountHolderName) && (
                    <span className="text-sm text-green-200">
                      Holder: {formData?.bankAccountHolderName || profile?.bankAccount?.accountHolderName}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Signature Section */}
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
            <h3 className="text-base font-semibold text-orange-200 mb-3 flex items-center gap-2">
              <FiEdit className="text-orange-300" /> Digital Signature
            </h3>

            <div className="space-y-3">
              {signatureUrl ? (
                <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg border border-orange-300/30">
                  <img src={signatureUrl} alt="Signature" className="h-16 object-contain bg-white p-2 rounded" />
                  <button
                    onClick={deleteSignature}
                    className="px-3 py-1.5 bg-red-600/80 text-white rounded-lg hover:bg-red-500 text-sm font-semibold flex items-center gap-2"
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-300 text-center py-3 bg-white/5 rounded-lg">
                  📝 No signature uploaded yet
                </p>
              )}

              <div
                onDrop={handleSignatureDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-orange-400/40 rounded-lg p-6 text-center hover:border-orange-300 transition text-sm bg-white/5 cursor-pointer"
              >
                <input type="file" accept="image/*" onChange={handleSignatureSelect} className="hidden" id="sig-up" />
                <label htmlFor="sig-up" className="cursor-pointer block">
                  <FiUpload className="mx-auto text-3xl text-orange-300 mb-2" />
                  <p className="text-orange-200 font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG or GIF (Max 5MB)</p>
                </label>
              </div>

              {signatureFile && (
                <button
                  onClick={uploadSignature}
                  className="w-full px-4 py-2 bg-orange-600/80 text-white rounded-lg hover:bg-orange-500 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <FiSave /> Save Signature
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            {editMode ? (
              <>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setPreviewImage(null);
                    setFormData({
                      ...profile,
                      bankAccountHolderName: profile?.bankAccount?.accountHolderName || "",
                      bankAccountNumber: profile?.bankAccount?.accountNumber || "",
                      bankIfscCode: profile?.bankAccount?.ifscCode || "",
                      bankName: profile?.bankAccount?.bankName || "",
                      branchName: profile?.bankAccount?.branchName || ""
                    });
                  }}
                  className="px-5 py-2.5 bg-gray-600/80 text-white rounded-lg hover:bg-gray-500 transition flex items-center justify-center gap-2 text-sm backdrop-blur-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-5 py-2.5 bg-orange-600/80 text-white rounded-lg hover:bg-orange-500 transition flex items-center justify-center gap-2 text-sm backdrop-blur-sm font-semibold"
                >
                  <FiSave /> Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-5 py-2.5 bg-orange-600/80 text-white rounded-lg hover:bg-orange-500 transition flex items-center justify-center gap-2 text-sm backdrop-blur-sm font-semibold"
              >
                <FiEdit /> Edit Profile
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition flex items-center justify-center gap-2 text-sm backdrop-blur-sm font-semibold"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* Glassmorphism Field Component for dark theme */
function Field({ label, icon, value, name, onChange, editMode, type = "text" }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 hover:border-orange-300/30 transition">
      <div className="text-xl text-orange-300">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-300 mb-1">{label}</p>
        {editMode ? (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full px-2 py-1.5 border border-orange-300/30 rounded bg-white/10 text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none backdrop-blur-sm"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <p className="text-sm font-medium text-white">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

export default LandlordProfile;