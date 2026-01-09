import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Phone,
  Mail,
  Home,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  MapPin,
  Camera,
  Lock,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import baseurl from "../../../../BaseUrl";

const AddWorkerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    contactNumber: "",
    email: "",
    address: "",
    availabilityDays: [],
    availableTimeSlots: [],
    chargePerService: "",
    idProofType: "",
    idProofNumber: "",
    assignedProperties: [],
    profileImage: null,
    password: "",
  });
  const [properties, setProperties] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timeSlots = ["Morning", "Afternoon", "Evening", "Night"];
  const idProofOptions = ["Aadhaar", "PAN Card", "Driving License", "Passport"];
  const roleOptions = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Painter",
    "Cleaner",
    "Pest Control",
    "AC Technician",
    "RO Technician",
    "Lift Maintenance",
    "Security Guard",
    "CCTV Technician",
    "Gardener",
    "Generator Technician",
    "Internet Technician",
    "Other",
  ];

  const fetchPropertiesAndWorkers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }
      const propRes = await fetch(`${baseurl}api/sub-owner/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const propData = await propRes.json();
      if (!propData.success) {
        setError("Failed to fetch properties");
        return;
      }
      const workerRes = await fetch(`${baseurl}api/sub-owner/workers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const workerData = await workerRes.json();
      if (!workerData.success) {
        setError("Failed to fetch workers");
        return;
      }
      setProperties(propData.properties || []);
      setAllWorkers(workerData.workers || []);
    } catch (err) {
      setError("Error fetching data: " + err.message);
    }
  };

  useEffect(() => {
    fetchPropertiesAndWorkers();
  }, []);

  const unassignedProperties = properties.filter((property) => {
    return !allWorkers.some((worker) =>
      worker.assignedProperties?.some((prop) => prop.id === property.id)
    );
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.role.trim()) newErrors.role = "Role is required";
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Enter a valid 10-digit mobile number";
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (formData.availabilityDays.length === 0)
      newErrors.availabilityDays = "At least one day is required";
    if (formData.availableTimeSlots.length === 0)
      newErrors.availableTimeSlots = "At least one time slot is required";
    if (!formData.chargePerService || formData.chargePerService <= 0)
      newErrors.chargePerService = "Valid charge is required";
    if (!formData.idProofType)
      newErrors.idProofType = "ID Proof Type is required";
    if (!formData.idProofNumber.trim())
      newErrors.idProofNumber = "ID Proof Number is required";
    else {
      if (
        formData.idProofType === "Aadhaar" &&
        !/^\d{4}\s\d{4}\s\d{4}$/.test(formData.idProofNumber)
      ) {
        newErrors.idProofNumber = "Aadhaar should be in format XXXX XXXX XXXX";
      } else if (
        formData.idProofType === "PAN Card" &&
        !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.idProofNumber)
      ) {
        newErrors.idProofNumber = "PAN should be in format ABCDE1234F";
      }
    }
    if (formData.assignedProperties.length === 0)
      newErrors.assignedProperties = "At least one property must be selected";
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "idProofNumber" && formData.idProofType === "Aadhaar") {
      const cleaned = value.replace(/\D/g, "");
      let formatted = "";
      for (let i = 0; i < cleaned.length && i < 12; i++) {
        if (i === 4 || i === 8) formatted += " ";
        formatted += cleaned[i];
      }
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "contactNumber") {
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, profileImage: file }));
    }
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newArray = checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value);
      return { ...prev, [field]: newArray };
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePropertyChange = (propertyId) => {
    setFormData((prev) => {
      const newAssignedProperties = prev.assignedProperties.includes(propertyId)
        ? prev.assignedProperties.filter((id) => id !== propertyId)
        : [...prev.assignedProperties, propertyId];
      return { ...prev, assignedProperties: newAssignedProperties };
    });
    if (errors.assignedProperties)
      setErrors((prev) => ({ ...prev, assignedProperties: "" }));
  };

  const handleIdProofChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      idProofType: value,
      idProofNumber: "",
    }));
    if (errors.idProofType) setErrors((prev) => ({ ...prev, idProofType: "" }));
    if (errors.idProofNumber)
      setErrors((prev) => ({ ...prev, idProofNumber: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    const {
      profileImage,
      assignedProperties,
      chargePerService,
      password,
      ...rest
    } = formData;

    Object.keys(rest).forEach((key) => {
      if (Array.isArray(rest[key])) {
        rest[key].forEach((val) => formDataToSend.append(key, val));
      } else {
        formDataToSend.append(key, rest[key]);
      }
    });

    formDataToSend.append("password", password);
    assignedProperties.forEach((id) =>
      formDataToSend.append("propertyIds", id)
    );
    formDataToSend.append("chargePerService", parseFloat(chargePerService));

    const idProofNumber =
      formData.idProofType === "Aadhaar"
        ? formData.idProofNumber.replace(/\s/g, "")
        : formData.idProofNumber;
    formDataToSend.append("idProofNumber", idProofNumber);

    if (profileImage) {
      formDataToSend.append("profileImage", profileImage);
    }

    try {
      const res = await fetch(`${baseurl}api/sub-owner/workers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to add worker");
      }

      const data = await res.json();
      setResponse(data);

      setFormData({
        name: "",
        role: "",
        contactNumber: "",
        email: "",
        address: "",
        availabilityDays: [],
        availableTimeSlots: [],
        chargePerService: "",
        idProofType: "",
        idProofNumber: "",
        assignedProperties: [],
        profileImage: null,
        password: "",
      });
      setImagePreview(null);
      setShowPassword(false);
      fetchPropertiesAndWorkers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIdProofPlaceholder = () => {
    switch (formData.idProofType) {
      case "Aadhaar":
        return "XXXX XXXX XXXX";
      case "PAN Card":
        return "ABCDE1234F";
      case "Driving License":
        return "Enter Driving License Number";
      case "Passport":
        return "Enter Passport Number";
      default:
        return "Select ID Proof Type first";
    }
  };

  const getIdProofPattern = () => {
    switch (formData.idProofType) {
      case "Aadhaar":
        return "\\d{4}\\s\\d{4}\\s\\d{4}";
      case "PAN Card":
        return "[A-Z]{5}[0-9]{4}[A-Z]{1}";
      default:
        return ".*";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <div
            className="bg-gradient-to-b 
from-[#0A2F56] via-[#1E4569] to-[#0A2F56]
 px-10 py-8 text-center"
          >
            <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
              <User className="h-10 w-10" />
              Add New Worker
            </h2>
            <p className="text-indigo-100 mt-2 text-lg">
              Register a service worker for your properties
            </p>
          </div>

          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Image */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-300 shadow-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-indigo-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-3 cursor-pointer shadow-lg hover:bg-indigo-700 transition">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((prev) => ({
                          ...prev,
                          profileImage: null,
                        }));
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name & Role */}
                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter worker's name"
                    className={`w-full px-5 py-4 rounded-2xl border-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all ${
                      errors.name ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" /> Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 rounded-2xl border-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all ${
                      errors.role ? "border-red-400" : "border-gray-200"
                    }`}
                  >
                    <option value="">Choose role</option>
                    {roleOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-sm">{errors.role}</p>
                  )}
                </div>

                {/* Contact & Email */}
                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold flex items-center gap-2">
                    <Phone className="w-5 h-5 text-teal-600" /> Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="10-digit number"
                    className={`w-full px-5 py-4 rounded-2xl border-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-teal-300 transition-all ${
                      errors.contactNumber
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  {errors.contactNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold flex items-center gap-2">
                    <Mail className="w-5 h-5 text-pink-600" /> Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="worker@example.com"
                    className={`w-full px-5 py-4 rounded-2xl border-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all ${
                      errors.email ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Address & Password */}
                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold flex items-center gap-2">
                    <Home className="w-5 h-5 text-amber-600" /> Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Full residential address"
                    className={`w-full px-5 py-4 rounded-2xl border-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all ${
                      errors.address ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-600" /> Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Min 6 characters"
                      className={`w-full px-5 py-4 pr-14 rounded-2xl border-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-red-300 transition-all ${
                        errors.password ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Assigned Properties - Chip Style */}
              <div>
                <label className="text-gray-700 font-semibold flex items-center gap-2 mb-4">
                  <MapPin className="w-6 h-6 text-indigo-600" /> Assign
                  Properties *
                </label>
                <div className="bg-gray-50/80 rounded-2xl p-6">
                  <div className="flex flex-wrap gap-3">
                    {unassignedProperties.map((property) => {
                      const isSelected = formData.assignedProperties.includes(
                        property.id
                      );
                      const isAssignedElsewhere = allWorkers.some((w) =>
                        w.assignedProperties?.some((p) => p.id === property.id)
                      );
                      return (
                        <button
                          key={property.id}
                          type="button"
                          disabled={isAssignedElsewhere}
                          onClick={() => handlePropertyChange(property.id)}
                          className={`px-6 py-3 rounded-full font-medium transition-all shadow-md ${
                            isAssignedElsewhere
                              ? "bg-orange-100 text-orange-700 cursor-not-allowed"
                              : isSelected
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                              : "bg-white border-2 border-gray-300 text-gray-700 hover:border-indigo-400 hover:shadow"
                          }`}
                        >
                          {property.name}
                          {isAssignedElsewhere && " (Assigned)"}
                        </button>
                      );
                    })}
                    {unassignedProperties.length === 0 && (
                      <p className="text-gray-500">No available properties</p>
                    )}
                  </div>
                  {errors.assignedProperties && (
                    <p className="text-red-500 text-sm mt-3">
                      {errors.assignedProperties}
                    </p>
                  )}
                </div>
              </div>

              {/* Availability Days */}
              <div>
                <label className="text-gray-700 font-semibold flex items-center gap-2 mb-4">
                  <Calendar className="w-6 h-6 text-teal-600" /> Available Days
                  *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-4">
                  {days.map((day) => {
                    const selected = formData.availabilityDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const e = {
                            target: { value: day, checked: !selected },
                          };
                          handleCheckboxChange(e, "availabilityDays");
                        }}
                        className={`py-4 rounded-2xl font-semibold transition-all shadow-md ${
                          selected
                            ? "bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg"
                            : "bg-white border-2 border-gray-300 text-gray-700 hover:border-teal-400"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                {errors.availabilityDays && (
                  <p className="text-red-500 text-sm mt-3">
                    {errors.availabilityDays}
                  </p>
                )}
              </div>

              {/* Time Slots */}
              <div>
                <label className="text-gray-700 font-semibold flex items-center gap-2 mb-4">
                  <Clock className="w-6 h-6 text-amber-600" /> Time Slots *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {timeSlots.map((slot) => {
                    const selected = formData.availableTimeSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          const e = {
                            target: { value: slot, checked: !selected },
                          };
                          handleCheckboxChange(e, "availableTimeSlots");
                        }}
                        className={`py-5 rounded-2xl font-semibold transition-all shadow-md ${
                          selected
                            ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg"
                            : "bg-white border-2 border-gray-300 text-gray-700 hover:border-amber-400"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                {errors.availableTimeSlots && (
                  <p className="text-red-500 text-sm mt-3">
                    {errors.availableTimeSlots}
                  </p>
                )}
              </div>

              {/* Charge & ID Proof */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" /> Charge Per
                    Service (₹) *
                  </label>
                  <input
                    type="number"
                    name="chargePerService"
                    value={formData.chargePerService}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="e.g. 500"
                    className={`w-full px-5 py-4 rounded-2xl border-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-green-300 transition-all ${
                      errors.chargePerService
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  {errors.chargePerService && (
                    <p className="text-red-500 text-sm">
                      {errors.chargePerService}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold flex items-center gap-2">
                    <FileText className="w-6 h-6 text-red-600" /> ID Proof Type
                    *
                  </label>
                  <select
                    name="idProofType"
                    value={formData.idProofType}
                    onChange={handleIdProofChange}
                    className={`w-full px-5 py-4 rounded-2xl border-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-red-300 transition-all ${
                      errors.idProofType ? "border-red-400" : "border-gray-200"
                    }`}
                  >
                    <option value="">Select type</option>
                    {idProofOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors.idProofType && (
                    <p className="text-red-500 text-sm">{errors.idProofType}</p>
                  )}
                </div>
              </div>

              {/* ID Proof Number */}
              <div className="md:col-span-2">
                <label className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                  <FileText className="w-6 h-6 text-red-600" /> ID Proof Number
                  *
                </label>
                <input
                  type="text"
                  name="idProofNumber"
                  value={formData.idProofNumber}
                  onChange={handleInputChange}
                  placeholder={getIdProofPlaceholder()}
                  className={`w-full px-5 py-4 rounded-2xl border-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-red-300 transition-all ${
                    errors.idProofNumber ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.idProofNumber && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.idProofNumber}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-b from-[#0A2F56] via-[#1E4569] to-[#0A2F56] text-white font-bold text-xl py-5 rounded-2xl shadow-2xl hover:shadow-indigo-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding Worker..." : "Add Worker"}
                </button>
              </div>
            </form>

            {/* Messages */}
            {response && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 flex items-center gap-4">
                <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-semibold text-lg">
                  Worker{" "}
                  <span className="text-green-900">{response.worker.name}</span>{" "}
                  added successfully!
                </p>
              </div>
            )}
            {error && (
              <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200 flex items-center gap-4">
                <AlertCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-semibold">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWorkerForm;
