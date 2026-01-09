import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaUser,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaCalendar,
  FaBriefcase,
  FaHome,
  FaImage,
  FaTimesCircle,
  FaMale,
  FaFemale,
  FaUserFriends,
  FaMoneyCheckAlt,
  FaFileContract,
  FaMoneyBillWave,
  FaBolt,
  FaMapMarkerAlt,
  FaSpinner,
  FaBed,
  FaChevronDown,
  FaCheck,
  FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl";

const TenantForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const editingTenant = location.state?.tenant;
  const isEdit = Boolean(editingTenant && editingTenant.id);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProperties, setIsFetchingProperties] = useState(false);
  const [properties, setProperties] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [isFetchingBeds, setIsFetchingBeds] = useState(false);

  const initialFormData = {
    name: "",
    email: "",
    aadhaar: "",
    mobile: "",
    permanentAddress: "",
    work: "",
    dob: "",
    maritalStatus: "",
    fatherName: "",
    fatherMobile: "",
    motherName: "",
    motherMobile: "",
    photo: null,
    propertyId: "",
    roomId: "",
    bedId: "",
    moveInDate: "",
    rentAmount: "",
    securityDeposit: "",
    noticePeriod: "",
    agreementPeriod: "",
    agreementPeriodType: "months",
    rentOnDate: "",
    rentDateOption: "fixed",
    rentalFrequency: "Monthly",
    referredBy: "",
    remarks: "",
    bookedBy: "",
    electricityPerUnit: "",
    initialReading: "",
    finalReading: "",
    initialReadingDate: "",
    finalReadingDate: "",
    electricityDueDescription: "",
    openingBalanceStartDate: "",
    openingBalanceEndDate: "",
    openingBalanceAmount: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const steps = [
    { id: 1, title: "Personal", icon: <FaUser /> },
    { id: 2, title: "Family", icon: <FaUserFriends /> },
    { id: 3, title: "Property", icon: <FaHome /> },
    { id: 4, title: "Rental", icon: <FaFileContract /> },
    { id: 5, title: "Utilities", icon: <FaBolt /> },
  ];

  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setIsFetchingProperties(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required! Please login.");
          navigate("/login");
          return;
        }
        const response = await axios.get(
          `${baseurl}api/sub-owner/properties`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const propertiesData = Array.isArray(response.data?.properties)
          ? response.data.properties
          : [];
        setProperties(propertiesData);
        if (propertiesData.length === 0) {
          toast.warn("No properties available.");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch properties."
        );
      } finally {
        setIsFetchingProperties(false);
      }
    };
    fetchProperties();
  }, [navigate]);

  useEffect(() => {
    if (formData.propertyId) {
      if (!isValidObjectId(formData.propertyId)) {
        console.error("Invalid propertyId (not ObjectId):", formData.propertyId);
        toast.error("Invalid property selected. Please choose a valid property.");
        setAvailableRooms([]);
        setAvailableBeds([]);
        setFormData((prev) => ({
          ...prev,
          roomId: "",
          bedId: "",
          rentAmount: "",
        }));
        setIsFetchingRooms(false);
        return;
      }

      const fetchRooms = async () => {
        setIsFetchingRooms(true);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Authentication required! Please login.");
            navigate("/login");
            return;
          }
          const response = await axios.get(
            `${baseurl}api/sub-owner/properties/${formData.propertyId}/available-rooms`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const roomsData = Array.isArray(response.data?.rooms)
            ? response.data.rooms
            : [];
          setAvailableRooms(roomsData);
          if (!roomsData.some((room) => room.roomId === formData.roomId)) {
            setFormData((prev) => ({
              ...prev,
              roomId: "",
              bedId: "",
              rentAmount: "",
            }));
          }
          if (roomsData.length === 0) {
            toast.warn("No rooms available for this property.");
          }
        } catch (error) {
          console.error("Rooms fetch error:", error.response?.data || error.message);
          const errorMsg = error.response?.data?.message || "Failed to fetch rooms.";
          if (error.response?.status === 404) {
            toast.error("Property ID invalid. Please select a valid property.");
          } else {
            toast.error(errorMsg);
          }
          setAvailableRooms([]);
        } finally {
          setIsFetchingRooms(false);
        }
      };
      fetchRooms();
    } else {
      setAvailableRooms([]);
      setAvailableBeds([]);
      setFormData((prev) => ({
        ...prev,
        roomId: "",
        bedId: "",
        rentAmount: "",
      }));
    }
  }, [formData.propertyId, navigate]);

  useEffect(() => {
    if (formData.propertyId && formData.roomId) {
      if (!isValidObjectId(formData.propertyId)) {
        console.error("Invalid propertyId:", formData.propertyId);
        toast.error("Invalid property selected.");
        setAvailableBeds([]);
        setFormData((prev) => ({ ...prev, bedId: "", rentAmount: "" }));
        return;
      }

      const fetchBeds = async () => {
        setIsFetchingBeds(true);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Authentication required! Please login.");
            navigate("/login");
            return;
          }
          const response = await axios.get(
            `${baseurl}api/sub-owner/properties/${formData.propertyId}/rooms/${formData.roomId}/available-beds`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const bedsData = Array.isArray(response.data?.beds)
            ? response.data.beds
            : [];
          setAvailableBeds(bedsData);
          if (!bedsData.some((bed) => bed.bedId === formData.bedId)) {
            setFormData((prev) => ({
              ...prev,
              bedId: "",
              rentAmount: "",
            }));
          }
          if (bedsData.length === 0) {
            toast.warn("No beds available for this room.");
          }
        } catch (error) {
          console.error("Beds fetch error:", error.response?.data || error.message);
          const errorMsg = error.response?.data?.message || "Failed to fetch beds.";
          if (error.response?.status === 404) {
            toast.error("Bed is not available. Please select a valid room.");
          } else {
            toast.error(errorMsg);
          }
          setAvailableBeds([]);
        } finally {
          setIsFetchingBeds(false);
        }
      };
      fetchBeds();
    } else {
      setAvailableBeds([]);
      setFormData((prev) => ({
        ...prev,
        bedId: "",
        rentAmount: "",
      }));
    }
  }, [formData.roomId, formData.propertyId, navigate]);

  useEffect(() => {
    if (isEdit && editingTenant.id) {
      let validPropertyId = editingTenant.propertyId ?? "";
      if (validPropertyId && !isValidObjectId(validPropertyId)) {
        console.warn("Invalid propertyId in editingTenant:", validPropertyId);
        validPropertyId = "";
      }

      setFormData({
        name: editingTenant.name ?? "",
        email: editingTenant.email ?? "",
        aadhaar: editingTenant.aadhaar ?? "",
        mobile: editingTenant.mobile ?? "",
        permanentAddress: editingTenant.permanentAddress ?? "",
        work: editingTenant.work ?? "",
        dob: editingTenant.dob ?? "",
        maritalStatus: editingTenant.maritalStatus ?? "",
        fatherName: editingTenant.fatherName ?? "",
        fatherMobile: editingTenant.fatherMobile ?? "",
        motherName: editingTenant.motherName ?? "",
        motherMobile: editingTenant.motherMobile ?? "",
        photo: editingTenant.photo ?? null,
        propertyId: validPropertyId,
        roomId: editingTenant.roomId ?? "",
        bedId: editingTenant.bedId ?? "",
        moveInDate: editingTenant.moveInDate ?? "",
        rentAmount: editingTenant.rentAmount?.toString() ?? "",
        securityDeposit: editingTenant.securityDeposit?.toString() ?? "",
        noticePeriod: editingTenant.noticePeriod?.toString() ?? "",
        agreementPeriod: editingTenant.agreementPeriod?.toString() ?? "",
        agreementPeriodType: editingTenant.agreementPeriodType ?? "months",
        rentOnDate: editingTenant.rentOnDate?.toString() ?? "",
        rentDateOption: editingTenant.rentDateOption ?? "fixed",
        rentalFrequency: editingTenant.rentalFrequency ?? "Monthly",
        referredBy: editingTenant.referredBy ?? "",
        remarks: editingTenant.remarks ?? "",
        bookedBy: editingTenant.bookedBy ?? "",
        electricityPerUnit: editingTenant.electricityPerUnit?.toString() ?? "",
        initialReading: editingTenant.initialReading?.toString() ?? "",
        finalReading: editingTenant.finalReading?.toString() ?? "",
        initialReadingDate: editingTenant.initialReadingDate ?? "",
        finalReadingDate: editingTenant.finalReadingDate ?? "",
        electricityDueDescription: editingTenant.electricityDueDescription ?? "",
        openingBalanceStartDate: editingTenant.openingBalanceStartDate ?? "",
        openingBalanceEndDate: editingTenant.openingBalanceEndDate ?? "",
        openingBalanceAmount: editingTenant.openingBalanceAmount?.toString() ?? "",
      });
    } else if (location.state?.propertyId && location.state?.propertyTitle) {
      let validPropertyId = location.state.propertyId;
      if (!isValidObjectId(validPropertyId)) {
        console.warn("Invalid propertyId from location.state:", validPropertyId);
        toast.warn("Invalid property ID provided. Please select manually.");
        validPropertyId = "";
      }

      setFormData((prev) => ({
        ...prev,
        propertyId: validPropertyId,
        roomId: "",
        bedId: "",
        rentAmount: "",
      }));
    }
  }, [editingTenant, location.state, isEdit]);

  useEffect(() => {
    const selectedBed = availableBeds.find((bed) => bed.bedId === formData.bedId);
    const selectedRoom = availableRooms.find((room) => room.roomId === formData.roomId);
    if (selectedBed) {
      const price = selectedBed.price ?? selectedRoom?.price;
      if (price) {
        setFormData((prev) => ({
          ...prev,
          rentAmount: price.toString(),
        }));
      }
    }
  }, [formData.bedId, availableBeds, availableRooms]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
        toast.success("Image selected successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    toast.success("Image removed successfully!");
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "name", label: "Full Name" },
      { field: "mobile", label: "Mobile" },
      { field: "aadhaar", label: "Aadhaar Number" },
      { field: "propertyId", label: "Property" },
      { field: "roomId", label: "Room" },
      { field: "bedId", label: "Bed" },
      { field: "moveInDate", label: "Move-in Date" },
      { field: "rentAmount", label: "Rent Amount" },
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field]) {
        toast.error(`${label} is required.`);
        return false;
      }
    }

    if (!isValidObjectId(formData.propertyId)) {
      toast.error("Selected property ID is invalid. Please choose a valid property.");
      return false;
    }

    if (!/^\d{12}$/.test(formData.aadhaar)) {
      toast.error("Aadhaar must be a 12-digit number.");
      return false;
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error("Mobile must be a 10-digit number.");
      return false;
    }
    if (formData.fatherMobile && !/^\d{10}$/.test(formData.fatherMobile)) {
      toast.error("Father's mobile must be a 10-digit number.");
      return false;
    }
    if (formData.motherMobile && !/^\d{10}$/.test(formData.motherMobile)) {
      toast.error("Mother's mobile must be a 10-digit number.");
      return false;
    }

    if (!properties.some((prop) => prop.id === formData.propertyId)) {
      toast.error("Selected property is invalid.");
      return false;
    }
    if (!availableRooms.some((room) => room.roomId === formData.roomId)) {
      toast.error("Selected room is invalid.");
      return false;
    }
    if (!availableBeds.some((bed) => bed.bedId === formData.bedId)) {
      toast.error("Selected bed is invalid.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required! Please login.");
      navigate("/login");
      return;
    }

    if (isEdit && !editingTenant.id) {
      toast.error("Invalid tenant ID for editing.");
      setIsLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email || null,
      aadhaar: formData.aadhaar,
      mobile: formData.mobile,
      permanentAddress: formData.permanentAddress || null,
      work: formData.work || null,
      dob: formData.dob || null,
      maritalStatus: formData.maritalStatus || null,
      fatherName: formData.fatherName || null,
      fatherMobile: formData.fatherMobile || null,
      motherName: formData.motherName || null,
      motherMobile: formData.motherMobile || null,
      photo: formData.photo || null,
      propertyId: formData.propertyId,
      roomId: formData.roomId,
      bedId: formData.bedId || null,
      moveInDate: formData.moveInDate,
      rentAmount: Number(formData.rentAmount) || 0,
      securityDeposit: Number(formData.securityDeposit) || 0,
      noticePeriod: Number(formData.noticePeriod) || 0,
      agreementPeriod: Number(formData.agreementPeriod) || 0,
      agreementPeriodType: formData.agreementPeriodType || "months",
      rentOnDate: Number(formData.rentOnDate) || 0,
      rentDateOption: formData.rentDateOption || "fixed",
      rentalFrequency: formData.rentalFrequency || "Monthly",
      referredBy: formData.referredBy || null,
      remarks: formData.remarks || null,
      bookedBy: formData.bookedBy || null,
      electricityPerUnit: Number(formData.electricityPerUnit) || 0,
      initialReading: Number(formData.initialReading) || 0,
      finalReading: formData.finalReading ? Number(formData.finalReading) : null,
      initialReadingDate: formData.initialReadingDate || null,
      finalReadingDate: formData.finalReadingDate || null,
      electricityDueDescription: formData.electricityDueDescription || null,
      openingBalanceStartDate: formData.openingBalanceStartDate || null,
      openingBalanceEndDate: formData.openingBalanceEndDate || null,
      openingBalanceAmount: Number(formData.openingBalanceAmount) || 0,
    };

    try {
      const url = isEdit
        ? `https://api.drazeapp.com/api/sub-owner/updateTenant/${editingTenant.id}`
        : "https://api.drazeapp.com/api/sub-owner/addTenant";
      const response = await axios({
        method: isEdit ? "PUT" : "POST",
        url,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: payload,
      });

      toast.success(
        response?.data?.message ||
          `Tenant ${isEdit ? "updated" : "added"} successfully!`
      );
      setFormData(initialFormData);
      setTimeout(() => navigate("/sub_owner/dashboard"), 1200);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message ||
            `Failed to ${isEdit ? "update" : "add"} tenant.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 py-8 px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEdit ? "Update Tenant" : "Add New Tenant"}
          </h1>
          <p className="text-gray-600">Fill in the required information step by step</p>
        </motion.div>

        {/* Step Tracker with Animated Line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="relative">
            {/* Background Line (Gray) */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200" style={{ zIndex: 1 }}>
              {/* Animated Progress Line (Orange) */}
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] rounded-full"
                initial={{ width: "0%" }}
                animate={{ 
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
                }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeInOut"
                }}
                style={{ position: 'relative', zIndex: 2 }}
              />
            </div>

            {/* Steps Container */}
            <div className="flex items-center justify-between relative" style={{ zIndex: 3 }}>
              {steps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    {/* Step Circle */}
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                        backgroundColor: isCompleted 
                          ? "#FF6B00" 
                          : isCurrent 
                          ? "#FF6B00" 
                          : "#E5E7EB"
                      }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted || isCurrent
                          ? "text-white shadow-lg"
                          : "text-gray-500"
                      }`}
                      style={{
                        boxShadow: isCurrent ? "0 4px 15px rgba(255, 107, 0, 0.4)" : "none"
                      }}
                    >
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <FaCheck size={18} />
                        </motion.div>
                      ) : (
                        step.icon
                      )}
                    </motion.div>
                    
                    {/* Step Title */}
                    <motion.p
                      animate={{
                        color: isCompleted || isCurrent ? "#111827" : "#9CA3AF",
                        fontWeight: isCompleted || isCurrent ? 600 : 500
                      }}
                      className="text-xs mt-2 transition-all"
                    >
                      {step.title}
                    </motion.p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] rounded-lg flex items-center justify-center text-white">
                    <FaUser />
                  </div>
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    icon={<FaUser />}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                  />
                  <Input
                    label="Email Address"
                    icon={<FaEnvelope />}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                  <Input
                    label="Mobile Number"
                    icon={<FaPhone />}
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    placeholder="10-digit mobile"
                    pattern="\d{10}"
                  />
                  <Input
                    label="Aadhaar Number"
                    icon={<FaIdCard />}
                    name="aadhaar"
                    value={formData.aadhaar}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      handleChange({ target: { name: "aadhaar", value } });
                    }}
                    required
                    placeholder="12-digit Aadhaar"
                    maxLength={12}
                  />
                  <Input
                    label="Date of Birth"
                    icon={<FaCalendar />}
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <Select
                    label="Marital Status"
                    icon={<FaUserFriends />}
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Select status" },
                      { value: "Unmarried", label: "Unmarried" },
                      { value: "Married", label: "Married" },
                      { value: "Others", label: "Others" },
                    ]}
                  />
                  <Input
                    label="Occupation"
                    icon={<FaBriefcase />}
                    name="work"
                    value={formData.work}
                    onChange={handleChange}
                    placeholder="Enter occupation"
                  />
                </div>

                {/* Photo Upload */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <Label icon={<FaImage />} text="Tenant Photo (Optional)" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#FF6B00] file:text-white hover:file:bg-[#FF8C3A]"
                  />
                  {formData.photo && (
                    <div className="mt-4 relative group inline-block">
                      <img
                        src={formData.photo}
                        alt="Tenant"
                        className="w-32 h-32 object-cover rounded-xl shadow-md border-2 border-gray-200"
                      />
                      <motion.button
                        type="button"
                        onClick={handleRemoveImage}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimesCircle size={20} />
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <Label icon={<FaMapMarkerAlt />} text="Permanent Address" />
                  <textarea
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter full address"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Family Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white">
                    <FaUserFriends />
                  </div>
                  Family Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Father's Name"
                    icon={<FaMale />}
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                  />
                  <Input
                    label="Father's Mobile"
                    icon={<FaPhone />}
                    name="fatherMobile"
                    value={formData.fatherMobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile"
                    pattern="\d{10}"
                  />
                  <Input
                    label="Mother's Name"
                    icon={<FaFemale />}
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    placeholder="Enter mother's name"
                  />
                  <Input
                    label="Mother's Mobile"
                    icon={<FaPhone />}
                    name="motherMobile"
                    value={formData.motherMobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile"
                    pattern="\d{10}"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Property Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <FaHome />
                  </div>
                  Property Selection
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Property"
                    icon={<FaHome />}
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Select property" },
                      ...properties.map((prop) => ({
                        value: prop.id,
                        label: prop.name || `Property ${prop?.name}...`,
                      })),
                    ]}
                    isLoading={isFetchingProperties}
                    required
                  />
                  <Select
                    label="Room"
                    icon={<FaBed />}
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Select room" },
                      ...availableRooms.map((room) => ({
                        value: room.roomId,
                        label: room.name,
                      })),
                    ]}
                    isLoading={isFetchingRooms}
                    disabled={!formData.propertyId || isFetchingRooms}
                    required
                  />
                  <Select
                    label="Bed"
                    icon={<FaBed />}
                    name="bedId"
                    value={formData.bedId}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Select bed" },
                      ...availableBeds.map((bed) => ({
                        value: bed.bedId,
                        label: bed.name,
                      })),
                    ]}
                    isLoading={isFetchingBeds}
                    disabled={!formData.roomId || isFetchingBeds}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 4: Rental Terms */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] rounded-lg flex items-center justify-center text-white">
                    <FaFileContract />
                  </div>
                  Rental Terms & Agreement
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Move-in Date"
                    icon={<FaCalendar />}
                    name="moveInDate"
                    type="date"
                    value={formData.moveInDate}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Rent Amount (₹)"
                    icon={<FaMoneyCheckAlt />}
                    name="rentAmount"
                    type="number"
                    value={formData.rentAmount}
                    onChange={handleChange}
                    required
                    placeholder="Monthly rent"
                    min="0"
                  />
                  <Input
                    label="Security Deposit (₹)"
                    icon={<FaMoneyBillWave />}
                    name="securityDeposit"
                    type="number"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    placeholder="Security deposit"
                    min="0"
                  />
                  <Input
                    label="Notice Period (days)"
                    icon={<FaCalendar />}
                    name="noticePeriod"
                    type="number"
                    value={formData.noticePeriod}
                    onChange={handleChange}
                    placeholder="Notice period"
                    min="0"
                  />
                  <Input
                    label="Agreement Period"
                    icon={<FaFileContract />}
                    name="agreementPeriod"
                    type="number"
                    value={formData.agreementPeriod}
                    onChange={handleChange}
                    placeholder="Duration"
                    min="0"
                  />
                  <Select
                    label="Period Type"
                    icon={<FaFileContract />}
                    name="agreementPeriodType"
                    value={formData.agreementPeriodType}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Select type" },
                      { value: "months", label: "Months" },
                      { value: "years", label: "Years" },
                    ]}
                  />
                  <Input
                    label="Rent Due Date"
                    icon={<FaCalendar />}
                    name="rentOnDate"
                    type="number"
                    value={formData.rentOnDate}
                    onChange={handleChange}
                    placeholder="Date (1-31)"
                    min="1"
                    max="31"
                  />
                  <Select
                    label="Rent Date Option"
                    icon={<FaCalendar />}
                    name="rentDateOption"
                    value={formData.rentDateOption}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Select option" },
                      { value: "fixed", label: "Fixed" },
                      { value: "flexible", label: "Flexible" },
                    ]}
                  />
                  <Select
                    label="Rental Frequency"
                    icon={<FaMoneyCheckAlt />}
                    name="rentalFrequency"
                    value={formData.rentalFrequency}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Select frequency" },
                      { value: "Monthly", label: "Monthly" },
                      { value: "Quarterly", label: "Quarterly" },
                      { value: "Yearly", label: "Yearly" },
                    ]}
                  />
                  <Input
                    label="Referred By"
                    icon={<FaUserFriends />}
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleChange}
                    placeholder="Referrer name"
                  />
                  <Input
                    label="Booked By"
                    icon={<FaUser />}
                    name="bookedBy"
                    value={formData.bookedBy}
                    onChange={handleChange}
                    placeholder="Booking source"
                  />
                </div>

                <div>
                  <Label icon={<FaFileContract />} text="Remarks" />
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any additional remarks"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Utilities & Balance */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center text-white">
                    <FaBolt />
                  </div>
                  Electricity & Opening Balance
                </h2>

                {/* Electricity Section */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                  <h3 className="font-semibold text-lg text-gray-900">Electricity Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Electricity Per Unit (₹)"
                      icon={<FaBolt />}
                      name="electricityPerUnit"
                      type="number"
                      value={formData.electricityPerUnit}
                      onChange={handleChange}
                      placeholder="Rate per unit"
                      min="0"
                    />
                    <Input
                      label="Initial Reading"
                      icon={<FaBolt />}
                      name="initialReading"
                      type="number"
                      value={formData.initialReading}
                      onChange={handleChange}
                      placeholder="Initial meter reading"
                      min="0"
                    />
                    <Input
                      label="Initial Reading Date"
                      icon={<FaCalendar />}
                      name="initialReadingDate"
                      type="date"
                      value={formData.initialReadingDate}
                      onChange={handleChange}
                    />
                    <Input
                      label="Final Reading"
                      icon={<FaBolt />}
                      name="finalReading"
                      type="number"
                      value={formData.finalReading}
                      onChange={handleChange}
                      placeholder="Final reading"
                      disabled={isEdit}
                      min="0"
                    />
                    <Input
                      label="Final Reading Date"
                      icon={<FaCalendar />}
                      name="finalReadingDate"
                      type="date"
                      value={formData.finalReadingDate}
                      onChange={handleChange}
                      disabled={isEdit}
                    />
                  </div>
                  <div>
                    <Label icon={<FaFileContract />} text="Electricity Due Description" />
                    <textarea
                      name="electricityDueDescription"
                      value={formData.electricityDueDescription}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Description"
                      disabled={isEdit}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Opening Balance Section */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                  <h3 className="font-semibold text-lg text-gray-900">Opening Balance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Start Date"
                      icon={<FaCalendar />}
                      name="openingBalanceStartDate"
                      type="date"
                      value={formData.openingBalanceStartDate}
                      onChange={handleChange}
                    />
                    <Input
                      label="End Date"
                      icon={<FaCalendar />}
                      name="openingBalanceEndDate"
                      type="date"
                      value={formData.openingBalanceEndDate}
                      onChange={handleChange}
                    />
                    <Input
                      label="Opening Balance Amount (₹)"
                      icon={<FaMoneyBillWave />}
                      name="openingBalanceAmount"
                      type="number"
                      value={formData.openingBalanceAmount}
                      onChange={handleChange}
                      placeholder="Amount"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all"
            >
              <FaArrowLeft />
              Previous
            </motion.button>

            {currentStep < steps.length ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all"
              >
                Next
                <FaArrowRight />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/50 transition-all"
              >
                {isLoading && <FaSpinner className="animate-spin" />}
                {isEdit ? "Update Tenant" : "Save Tenant"}
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Input Component
const Input = ({ label, icon, ...props }) => (
  <div>
    <Label icon={icon} text={label} />
    <input
      {...props}
      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all disabled:bg-gray-100"
    />
  </div>
);

// Select Component
const Select = ({ label, icon, options, isLoading, ...props }) => (
  <div>
    <Label icon={icon} text={label} />
    <select
      {...props}
      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
      disabled={isLoading || props.disabled}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// Label Component
const Label = ({ icon, text }) => (
  <label className="block mb-2 font-semibold flex items-center text-gray-700">
    <span className="mr-2 text-[#FF6B00]">{icon}</span>
    {text}
  </label>
);

export default TenantForm;