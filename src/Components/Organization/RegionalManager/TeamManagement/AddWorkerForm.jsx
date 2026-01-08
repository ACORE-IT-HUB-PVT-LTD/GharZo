// AddWorkerForm.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { FaTimes } from "react-icons/fa";

const AddWorkerForm = ({ onClose, onAdded }) => {
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
  });

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

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.role.trim()) errs.role = "Role is required";
    if (!formData.contactNumber.trim() || !/^\d{10}$/.test(formData.contactNumber))
      errs.contactNumber = "Valid 10-digit phone number is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      errs.email = "Valid email is required";
    if (!formData.address.trim()) errs.address = "Address is required";
    if (formData.availabilityDays.length === 0)
      errs.availabilityDays = "At least one day is required";
    if (formData.availableTimeSlots.length === 0)
      errs.availableTimeSlots = "At least one time slot is required";
    if (!formData.chargePerService || formData.chargePerService <= 0)
      errs.chargePerService = "Valid charge is required";
    if (!formData.idProofType) errs.idProofType = "ID Proof Type is required";
    if (!formData.idProofNumber.trim()) errs.idProofNumber = "ID Proof Number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((p) => {
        const arr = p[name];
        if (checked) {
          return { ...p, [name]: [...arr, value] };
        } else {
          return { ...p, [name]: arr.filter((v) => v !== value) };
        }
      });
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Save to localStorage (simulate backend)
    const workers = JSON.parse(localStorage.getItem("workersList") || "[]");
    const newWorker = {
      id: Date.now(),
      ...formData,
    };
    workers.push(newWorker);
    localStorage.setItem("workersList", JSON.stringify(workers));
    onAdded();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          aria-label="Close"
        >
          <FaTimes size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-green-700">
          <User /> Add Worker
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <User size={20} /> Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <Briefcase size={20} /> Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.role ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Role</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <Phone size={20} /> Contact Number *
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              pattern="\d{10}"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.contactNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="10-digit phone number"
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <Mail size={20} /> Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="example@mail.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <Home size={20} /> Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Full address"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          {/* Availability Days */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <Calendar size={20} /> Availability Days *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 p-3 border rounded-lg bg-gray-50">
              {days.map((day) => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="availabilityDays"
                    value={day}
                    checked={formData.availabilityDays.includes(day)}
                    onChange={handleChange}
                    className="cursor-pointer"
                  />
                  <span className="text-sm">{day}</span>
                </label>
              ))}
            </div>
            {errors.availabilityDays && (
              <p className="text-red-500 text-sm mt-1">{errors.availabilityDays}</p>
            )}
          </div>

          {/* Available Time Slots */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <Clock size={20} /> Available Time Slots *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border rounded-lg bg-gray-50">
              {timeSlots.map((slot) => (
                <label key={slot} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="availableTimeSlots"
                    value={slot}
                    checked={formData.availableTimeSlots.includes(slot)}
                    onChange={handleChange}
                    className="cursor-pointer"
                  />
                  <span className="text-sm capitalize">{slot}</span>
                </label>
              ))}
            </div>
            {errors.availableTimeSlots && (
              <p className="text-red-500 text-sm mt-1">{errors.availableTimeSlots}</p>
            )}
          </div>

          {/* Charge Per Service */}
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <DollarSign size={20} /> Charge Per Service (₹) *
            </label>
            <input
              type="number"
              name="chargePerService"
              value={formData.chargePerService}
              onChange={handleChange}
              min="1"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.chargePerService ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Amount in ₹"
            />
            {errors.chargePerService && (
              <p className="text-red-500 text-sm mt-1">{errors.chargePerService}</p>
            )}
          </div>

          {/* ID Proof Type */}
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <FileText size={20} /> ID Proof Type *
            </label>
            <select
              name="idProofType"
              value={formData.idProofType}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.idProofType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select ID Proof Type</option>
              {idProofOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.idProofType && (
              <p className="text-red-500 text-sm mt-1">{errors.idProofType}</p>
            )}
          </div>

          {/* ID Proof Number */}
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <FileText size={20} /> ID Proof Number *
            </label>
            <input
              type="text"
              name="idProofNumber"
              value={formData.idProofNumber}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.idProofNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter ID Proof Number"
            />
            {errors.idProofNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.idProofNumber}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Add Worker
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddWorkerForm;
