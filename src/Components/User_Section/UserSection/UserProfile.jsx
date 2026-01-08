import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import axios from "axios";
import profileBG from "../../../assets/Images/profileBG.jpg"; // Retain original background image
import baseurl from "../../../../BaseUrl";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true); // Added for skeleton loading
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem("usertoken");

  // Validate function
  const validate = (data) => {
    const newErrors = {};

    // Full Name
    const fullName = String(data.fullName || '').trim();
    if (!fullName) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[A-Za-z\s]+$/.test(fullName) || fullName.split(/\s+/).filter(Boolean).length < 2) {
      newErrors.fullName = "Full name must contain only letters and at least first and last name";
    }

    // Email
    const email = String(data.email || '').trim();
    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const localPart = email.split('@')[0];
      if (!/\S+@gmail\.com$/.test(email) || !/^[a-zA-Z]/.test(localPart) || !/[0-9]/.test(localPart)) {
        newErrors.email = "Email must be a valid Gmail address starting with a letter, containing numbers, and ending with @gmail.com";
      }
    }

    // Phone
    const phone = String(data.phone || '').trim();
    if (!phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    // Age
    const age = String(data.age || '').trim();
    if (!age) {
      newErrors.age = "Age is required";
    } else if (!/^\d{2}$/.test(age)) {
      newErrors.age = "Age must be 2 digits";
    }

    // Gender
    const gender = String(data.gender || '').trim();
    if (!gender) {
      newErrors.gender = "Gender is required";
    } else if (!['Male', 'Female'].includes(gender)) {
      newErrors.gender = "Please select Male or Female";
    }

    // Address fields
    const street = String(data.address?.street || '').trim();
    if (!street) {
      newErrors.street = "Street is required";
    } else if (!/^[A-Za-z0-9\s]+$/.test(street)) {
      newErrors.street = "Street must contain letters and numbers only";
    }

    const city = String(data.address?.city || '').trim();
    if (!city) {
      newErrors.city = "City is required";
    } else if (!/^[A-Za-z\s]+$/.test(city)) {
      newErrors.city = "City must contain only letters";
    }

    const state = String(data.address?.state || '').trim();
    if (!state) {
      newErrors.state = "State is required";
    } else if (!/^[A-Za-z\s]+$/.test(state)) {
      newErrors.state = "State must contain only letters";
    }

    const postalCode = String(data.address?.postalCode || '').trim();
    if (!postalCode) {
      newErrors.postalCode = "Postal code is required";
    } else if (!/^\d{6}$/.test(postalCode)) {
      newErrors.postalCode = "Postal code must be exactly 6 digits";
    }

    const country = String(data.address?.country || '').trim();
    if (!country) {
      newErrors.country = "Country is required";
    } else if (!/^[A-Za-z\s]+$/.test(country)) {
      newErrors.country = "Country must contain only letters";
    }

    return newErrors;
  };

  // Real-time validation when in edit mode
  useEffect(() => {
    if (editMode) {
      const newErrors = validate(formData);
      setErrors(newErrors);
    }
  }, [formData, editMode]);

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${baseurl}api/auth/user/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile(res.data);
        setFormData({
          ...res.data,
          address: res.data.address || {}
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Update Profile
  const handleUpdate = async () => {
    // Since real-time validation is on, check current errors
    if (Object.keys(errors).length > 0) {
      alert("Please correct the errors in the form.");
      return;
    }

    try {
      const res = await axios.put(
        `${baseurl}api/auth/user/updateprofile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(res.data.updatedUser || res.data);
      setFormData({
        ... (res.data.updatedUser || res.data),
        address: (res.data.updatedUser || res.data).address || {}
      });
      setErrors({});
      setEditMode(false);
      alert(res.data.message || "Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // Enter edit mode
  const handleEdit = () => {
    setEditMode(true);
    setErrors({}); // Clear errors when entering edit mode
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950">
        <div className="w-full max-w-3xl p-8">
          <SkeletonHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonField key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950">
        <div className="text-center text-red-300 font-medium bg-red-900/20 border border-red-600/30 px-4 py-3 rounded-xl">
          Failed to load profile.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-2 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-6xl"
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-50 pointer-events-none">
          <div className="mx-auto h-64 w-64 bg-indigo-600/40 rounded-full translate-y-10" />
        </div>

        {/* Card with margin-top for mobile */}
        <div className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 border border-white/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl mt-6">
          {/* Top Title */}
          <div className="flex items-center justify-center px-6 sm:px-10 pt-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white/90">
              User Profile
            </h1>
          </div>

          {/* Avatar */}
          <div className="px-6 sm:px-10 mt-8 flex justify-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 15 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-2xl -z-10" />
            </motion.div>
          </div>

          {/* Fields */}
          <div className="px-6 sm:px-10 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                icon={<FaUser />}
                value={formData?.fullName}
                name="fullName"
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                editMode={editMode}
                error={errors.fullName}
              />
              <Field
                label="Email"
                icon={<FaEnvelope />}
                value={formData?.email}
                name="email"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                editMode={editMode}
                type="email"
                error={errors.email}
              />
              <Field
                label="Phone"
                icon={<FaPhone />}
                value={formData?.phone}
                name="phone"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                editMode={editMode}
                type="tel"
                error={errors.phone}
              />
              <Field
                label="Age"
                icon={<FaBirthdayCake />}
                value={formData?.age}
                name="age"
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                editMode={editMode}
                type="number"
                error={errors.age}
              />
              <Field
                label="Gender"
                icon={<FaVenusMars />}
                value={formData?.gender}
                name="gender"
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                editMode={editMode}
                dropdown
                error={errors.gender}
              />
              <Field
                label="Street"
                icon={<FaMapMarkerAlt />}
                value={formData?.address?.street || ''}
                name="street"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...(formData.address || {}), street: e.target.value },
                  })
                }
                editMode={editMode}
                error={errors.street}
              />
              <Field
                label="City"
                icon={<FaMapMarkerAlt />}
                value={formData?.address?.city || ''}
                name="city"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...(formData.address || {}), city: e.target.value },
                  })
                }
                editMode={editMode}
                error={errors.city}
              />
              <Field
                label="State"
                icon={<FaMapMarkerAlt />}
                value={formData?.address?.state || ''}
                name="state"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...(formData.address || {}), state: e.target.value },
                  })
                }
                editMode={editMode}
                error={errors.state}
              />
              <Field
                label="Postal Code"
                icon={<FaMapMarkerAlt />}
                value={formData?.address?.postalCode || ''}
                name="postalCode"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: {
                      ...(formData.address || {}),
                      postalCode: e.target.value,
                    },
                  })
                }
                editMode={editMode}
                error={errors.postalCode}
              />
              <Field
                label="Country"
                icon={<FaMapMarkerAlt />}
                value={formData?.address?.country || ''}
                name="country"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...(formData.address || {}), country: e.target.value },
                  })
                }
                editMode={editMode}
                error={errors.country}
              />
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-between px-6 sm:px-10 pb-6">
            {editMode ? (
              <NeonButton
                onClick={handleUpdate}
                variant="success"
                icon={FaSave}
              >
                Save
              </NeonButton>
            ) : (
              <NeonButton
                onClick={handleEdit}
                variant="primary"
                icon={FaEdit}
              >
                Edit
              </NeonButton>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Neon Button Component
function NeonButton({ children, icon: Icon, onClick, variant = "primary" }) {
  const variants = {
    primary:
      "bg-gradient-to-b from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.45)]",
    success:
      "bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.45)]",
    danger:
      "bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white shadow-[0_8px_20px_rgba(244,63,94,0.45)]",
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`${variants} flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-white/10`}
    >
      {Icon && <Icon className="text-lg drop-shadow" />}
      {children}
    </motion.button>
  );
}

// Field Component
function Field({
  label,
  icon,
  value,
  name,
  onChange,
  editMode,
  type = "text",
  dropdown,
  error,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex items-center gap-3 rounded-2xl p-3 md:p-4 bg-white text-indigo-600 border border-white/10 hover:border-indigo-400/30 transition-all"
    >
      <IconBadge>{icon}</IconBadge>

      {editMode ? (
        <div className="flex flex-col w-full">
          <label className="text-xs md:text-sm text-indigo-200/70 mb-1">
            {label}
          </label>
          {dropdown ? (
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className="w-full rounded-xl px-3 py-2 bg-slate-800/80 text-indigo-50 placeholder-indigo-200/40 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={value || ""}
              onChange={onChange}
              className="w-full rounded-xl px-3 py-2 bg-slate-800/80 text-indigo-50 placeholder-indigo-200/40 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent"
              placeholder={label}
            />
          )}
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <span className="text-xs md:text-sm text-indigo-600">{label}</span>
          <span className="text-indigo-600 font-medium break-words">
            {value || <span className="opacity-40">—</span>}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// Icon Badge Component
function IconBadge({ children }) {
  return (
    <motion.div
      whileHover={{ rotateX: 8, rotateY: -8 }}
      transition={{ type: "spring", stiffness: 180, damping: 12 }}
      className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 grid place-items-center
                 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700
                 shadow-[inset_0_1px_8px_rgba(255,255,255,0.35),0_15px_30px_rgba(0,0,0,0.45)]
                 border border-white/10"
    >
      {/* top glossy streak */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/15 blur-lg rounded-full pointer-events-none" />
      {/* side glow */}
      <div className="absolute -inset-1 rounded-2xl bg-indigo-400/0 group-hover:bg-indigo-400/10 transition-colors" />
      <div className="text-white text-2xl drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]">
        {children}
      </div>
    </motion.div>
  );
}

// Skeleton Components for Loading
function SkeletonHeader() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-indigo-400/20" />
      <div className="mt-6 h-36 w-36 rounded-full bg-indigo-400/20 mx-auto" />
    </div>
  );
}

function SkeletonField() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-indigo-400/20" />
      <div className="flex-1">
        <div className="h-3 w-24 bg-indigo-400/20 rounded mb-2" />
        <div className="h-4 w-40 bg-indigo-400/20 rounded" />
      </div>
    </div>
  );
}

export default ProfilePage;