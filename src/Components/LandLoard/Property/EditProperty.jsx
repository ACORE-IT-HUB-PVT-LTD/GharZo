import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import baseurl from "../../../../BaseUrl";
import {
  FaHome,
  FaCity,
  FaMapMarkerAlt,
  FaBed,
  FaRupeeSign,
  FaPlus,
  FaClipboardList,
  FaInfoCircle,
  FaImages,
  FaCheck,
} from "react-icons/fa";

// -----------------------------
// Helpers
// -----------------------------
const sky = {
  from: "from-sky-50",
  to: "to-white",
  text: "text-sky-700",
  ring: "focus:ring-sky-300",
  border: "border-sky-200",
  bg: "bg-sky-500",
  bgHover: "hover:bg-sky-600",
  pill: "bg-sky-100 text-sky-700",
};


const toNumberOrNull = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const sanitizeArrays = (obj, keys) => {
  const copy = { ...obj };
  keys.forEach((k) => {
    copy[k] = (copy[k] || [])
      .map((x) => (typeof x === "string" ? x.trim() : x))
      .filter((x) => x !== "" && x !== null && x !== undefined);
  });
  return copy;
};

// -----------------------------
// Component
// -----------------------------
const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const propertyFromState = location.state?.property;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    // common
    name: "",
    type: "PG", // PG | Hostel | Flat | Room
    address: "",
    city: "",
    state: "",
    pinCode: "",
    totalRooms: "",
    totalBeds: "",
    rent: "",
    deposit: "",
    furnished: false,
    description: "",
    amenities: [],
    rules: [],
    images: [],

    // PG/Hostel
    genderPreference: "", // Any | Male | Female
    mealIncluded: false,
    roomSharing: "", // 1,2,3,4

    // Flat
    bhk: "",
    carpetAreaSqft: "",
    furnishedLevel: "", // Unfurnished | Semi | Fully

    // Room
    attachedBath: false,
    balcony: false,
  });

  // ------- Load property -------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (propertyFromState) {
          setFormData((prev) => ({ ...prev, ...propertyFromState }));
          return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. Redirecting to login?");
          setLoading(false);
          return;
        }

        // You were fetching the list and filtering by id—kept that but hardened it
        const res = await axios.get(`${baseurl}/api/landlord/properties/:id`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("📡 Load Status:", res.status);
        console.log("✅ Load Body:", res.data);

        if (res.data?.success && Array.isArray(res.data.properties)) {
          const found = res.data.properties.find(
            (p) => String(p._id) === String(id)
          );
          if (found) {
            setFormData((prev) => ({ ...prev, ...found }));
          } else {
            console.error("Property not found for id:", id);
            alert("Property not found.");
            navigate("/landlord/properties");
          }
        } else {
          console.warn("Unexpected load response shape:", res.data);
          alert("Failed to load property. Unexpected response.");
        }
      } catch (err) {
        console.error("💥 Error loading property:", err);
        alert("Failed to load property.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, propertyFromState, navigate]);

  // ------- Field helpers -------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayChange = (name, index, value) => {
    const updatedArray = [...(formData[name] || [])];
    updatedArray[index] = value;
    setFormData((prev) => ({ ...prev, [name]: updatedArray }));
  };

  const addArrayItem = (name) => {
    setFormData((prev) => ({ ...prev, [name]: [...(prev[name] || []), ""] }));
  };

  const removeArrayItem = (name, index) => {
    setFormData((prev) => ({
      ...prev,
      [name]: (prev[name] || []).filter((_, i) => i !== index),
    }));
  };

  // ------- Submit -------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not logged in. Please log in again.");
        setSaving(false);
        return;
      }

      // normalize types
      let payload = {
        ...formData,
        totalRooms: toNumberOrNull(formData.totalRooms),
        totalBeds: toNumberOrNull(formData.totalBeds),
        rent: toNumberOrNull(formData.rent),
        deposit: toNumberOrNull(formData.deposit),
        roomSharing: toNumberOrNull(formData.roomSharing),
        bhk: toNumberOrNull(formData.bhk),
        carpetAreaSqft: toNumberOrNull(formData.carpetAreaSqft),
        pinCode: (formData.pinCode || "").toString().trim(),
        type: (formData.type || "").trim(),
        genderPreference: (formData.genderPreference || "").trim(),
        furnishedLevel: (formData.furnishedLevel || "").trim(),
      };

      payload = sanitizeArrays(payload, ["amenities", "rules", "images"]);

      console.log("📝 PUT Payload:", payload);

      const res = await axios.put(
        `${baseurl}/api/landlord/property/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📡 Update Status:", res.status);
      console.log("✅ Update Body:", res.data);

      if (res.data?.success) {
        alert("✅ Property updated successfully");
        navigate(`/landlord/property/${id}`, { replace: true });
      } else {
        console.warn("⚠️ Update returned unexpected shape:", res.data);
        alert(
          `Update failed. ${
            res.data?.message || "Unexpected response from server."
          }`
        );
      }
    } catch (err) {
      console.error("💥 Error updating property:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error updating property";
      alert(`❌ Failed to update property: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // ------- Conditional fields per type -------
  const type = useMemo(() => formData.type || "PG", [formData.type]);

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`max-w-6xl mx-auto p-4 sm:p-6 md:p-8 rounded-3xl shadow-xl bg-gray-800
`}
    >
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`text-3xl md:text-4xl font-extrabold mb-4 text-center ${sky.text}`}
      >
        ✏️ Edit Property
      </motion.h2>

      {/* Type Switcher */}
      <div className="mb-6 flex  flex-wrap gap-2 justify-center">
        {["PG", "Hostel", "Flat", "Room"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFormData((p) => ({ ...p, type: t }))}
            className={`px-4 py-2 rounded-full border ${
              sky.border
            } text-sm shadow-sm transition
              ${
                type === t
                  ? "bg-sky-500 text-white"
                  : "bg-white text-sky-700 hover:bg-sky-50"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {[
          { key: "basic", label: "Basic Info", icon: <FaInfoCircle /> },
          { key: "loc", label: "Location", icon: <FaMapMarkerAlt /> },
          { key: "price", label: "Pricing", icon: <FaRupeeSign /> },
          { key: "features", label: "Features", icon: <FaBed /> },
          {
            key: "lists",
            label: "Amenities & Rules",
            icon: <FaClipboardList />,
          },
          { key: "media", label: "Images", icon: <FaImages /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              sky.border
            } text-sm transition
              ${
                activeTab === tab.key
                  ? "bg-sky-500 text-white"
                  : "bg-white text-sky-700 hover:bg-sky-50"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="  space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === "basic" && (
            <motion.section
              key="basic"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid   grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Field
                icon={<FaHome />}
                name="name"
                placeholder="Property Name"
                value={formData.name}
                onChange={handleChange}
              />
              <Select
                icon={<FaClipboardList />}
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={["PG", "Hostel", "Flat", "Room"]}
                placeholder="Property Type"
              />
              <Textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </motion.section>
          )}

          {activeTab === "loc" && (
            <motion.section
              key="loc"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Field
                icon={<FaMapMarkerAlt />}
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
              <Field
                icon={<FaCity />}
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
              />
              <Field
                icon={<FaCity />}
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
              />
              <Field
                icon={<FaMapMarkerAlt />}
                name="pinCode"
                placeholder="Pin Code"
                value={formData.pinCode}
                onChange={handleChange}
              />
            </motion.section>
          )}

          {activeTab === "price" && (
            <motion.section
              key="price"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Field
                icon={<FaRupeeSign />}
                name="rent"
                type="number"
                placeholder="Monthly Rent"
                value={formData.rent}
                onChange={handleChange}
              />
              <Field
                icon={<FaRupeeSign />}
                name="deposit"
                type="number"
                placeholder="Security Deposit"
                value={formData.deposit}
                onChange={handleChange}
              />
            </motion.section>
          )}

          {activeTab === "features" && (
            <motion.section
              key="features"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Field
                icon={<FaBed />}
                name="totalRooms"
                type="number"
                placeholder="Total Rooms"
                value={formData.totalRooms}
                onChange={handleChange}
              />
              <Field
                icon={<FaBed />}
                name="totalBeds"
                type="number"
                placeholder="Total Beds"
                value={formData.totalBeds}
                onChange={handleChange}
              />

              {/* Common furnished */}
              <Toggle
                name="furnished"
                checked={!!formData.furnished}
                onChange={handleChange}
                label="Furnished"
              />

              {/* Conditional fields */}
              {["PG", "Hostel"].includes(type) && (
                <>
                  <Select
                    name="genderPreference"
                    value={formData.genderPreference || ""}
                    onChange={handleChange}
                    options={["Any", "Male", "Female"]}
                    placeholder="Gender Preference"
                  />
                  <Select
                    name="roomSharing"
                    value={formData.roomSharing || ""}
                    onChange={handleChange}
                    options={["1", "2", "3", "4"]}
                    placeholder="Room Sharing (beds per room)"
                  />
                  <Toggle
                    name="mealIncluded"
                    checked={!!formData.mealIncluded}
                    onChange={handleChange}
                    label="Meals Included"
                  />
                </>
              )}

              {type === "Flat" && (
                <>
                  <Select
                    name="bhk"
                    value={formData.bhk || ""}
                    onChange={handleChange}
                    options={["1", "2", "3", "4", "5"]}
                    placeholder="BHK"
                  />
                  <Field
                    name="carpetAreaSqft"
                    type="number"
                    placeholder="Carpet Area (sqft)"
                    value={formData.carpetAreaSqft || ""}
                    onChange={handleChange}
                  />
                  <Select
                    name="furnishedLevel"
                    value={formData.furnishedLevel || ""}
                    onChange={handleChange}
                    options={["Unfurnished", "Semi", "Fully"]}
                    placeholder="Furnishing Level"
                  />
                </>
              )}

              {type === "Room" && (
                <>
                  <Toggle
                    name="attachedBath"
                    checked={!!formData.attachedBath}
                    onChange={handleChange}
                    label="Attached Bathroom"
                  />
                  <Toggle
                    name="balcony"
                    checked={!!formData.balcony}
                    onChange={handleChange}
                    label="Balcony"
                  />
                </>
              )}
            </motion.section>
          )}

          {activeTab === "lists" && (
            <motion.section
              key="lists"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 gap-4"
            >
              <ArrayField
                label="Amenities"
                name="amenities"
                values={formData.amenities || []}
                onChange={handleArrayChange}
                addItem={addArrayItem}
                removeItem={removeArrayItem}
              />
              <ArrayField
                label="Rules"
                name="rules"
                values={formData.rules || []}
                onChange={handleArrayChange}
                addItem={addArrayItem}
                removeItem={removeArrayItem}
              />
            </motion.section>
          )}

          {activeTab === "media" && (
            <motion.section
              key="media"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 gap-4"
            >
              <ArrayField
                label="Image URLs"
                name="images"
                values={formData.images || []}
                onChange={handleArrayChange}
                addItem={addArrayItem}
                removeItem={removeArrayItem}
                placeholder="https://..."
              />

              {/* Tiny gallery preview */}
              {Array.isArray(formData.images) && formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {formData.images.map((src, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-xl overflow-hidden border border-sky-100 bg-white"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`img-${i}`}
                        className="w-full h-28 object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-sky-700 border border-sky-200 hover:bg-sky-50 transition"
          >
            Cancel
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className={`w-full sm:w-auto px-5 py-2 rounded-xl text-white font-semibold shadow
              ${
                saving
                  ? "bg-sky-300 cursor-not-allowed"
                  : `${sky.bg} ${sky.bgHover}`
              }
            `}
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <FaCheck />
                Save Changes
              </span>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

// -----------------------------
// Reusable Inputs
// -----------------------------
const Field = ({ icon, name, placeholder, value, onChange, type = "text" }) => (
  <div
    className={`flex items-center gap-3 p-3 border rounded-xl shadow-sm bg-white hover:shadow-md transition ${sky.border}`}
  >
    {icon && <div className="text-sky-500 text-xl">{icon}</div>}
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
      className={`flex-1 outline-none bg-transparent placeholder-gray-400`}
    />
  </div>
);

const Textarea = ({ name, placeholder, value, onChange, rows = 3 }) => (
  <div className={`p-3 border rounded-xl shadow-sm bg-white ${sky.border}`}>
    <textarea
      name={name}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
      rows={rows}
      className={`w-full outline-none bg-transparent placeholder-gray-400`}
    />
  </div>
);

const Select = ({ icon, name, value, onChange, options, placeholder }) => (
  <div
    className={`flex items-center gap-3 p-3 border rounded-xl shadow-sm bg-white ${sky.border}`}
  >
    {icon && <div className="text-sky-500 text-xl">{icon}</div>}
    <select
      name={name}
      value={value ?? ""}
      onChange={onChange}
      className={`flex-1 outline-none bg-transparent`}
    >
      <option value="">{placeholder || "Select"}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const Toggle = ({ name, checked, onChange, label }) => (
  <label
    className={`flex items-center justify-between gap-3 p-3 border rounded-xl shadow-sm bg-white cursor-pointer ${sky.border}`}
  >
    <span className="text-gray-700 font-medium">{label}</span>
    <input
      type="checkbox"
      name={name}
      checked={!!checked}
      onChange={onChange}
      className="w-5 h-5 accent-sky-500"
    />
  </label>
);

const ArrayField = ({
  label,
  name,
  values,
  onChange,
  addItem,
  removeItem,
  placeholder = "Enter value",
}) => (
  <div className="w-full">
    <p className={`font-semibold mb-2 ${sky.text}`}>{label}</p>
    <div className="space-y-2">
      {(values || []).map((item, idx) => (
        <motion.div
          key={`${name}-${idx}`}
          layout
          className="flex gap-2 items-center"
        >
          <input
            type="text"
            value={item}
            onChange={(e) => onChange(name, idx, e.target.value)}
            placeholder={placeholder}
            className={`flex-1 p-2 border rounded-lg bg-white ${sky.border} ${sky.ring} focus:outline-none focus:ring`}
          />
          <button
            type="button"
            onClick={() => removeItem(name, idx)}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            aria-label={`Remove ${label} item`}
          >
            ❌
          </button>
        </motion.div>
      ))}
    </div>
    <button
      type="button"
      onClick={() => addItem(name)}
      className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg ${sky.bg} ${sky.bgHover} text-white shadow`}
    >
      <FaPlus /> Add {label}
    </button>
  </div>
);

export default EditProperty;
