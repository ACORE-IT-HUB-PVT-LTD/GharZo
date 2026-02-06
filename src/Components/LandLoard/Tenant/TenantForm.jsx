import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaBriefcase,
  FaHome,
  FaImage,
  FaTimesCircle,
  FaMale,
  FaFemale,
  FaUserFriends,
  FaFileContract,
  FaMoneyBillWave,
  FaBolt,
  FaBed,
  FaSpinner,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

const TenantForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingTenant = location.state;
  const isEdit = Boolean(editingTenant);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    // Tenant Info (from tenantInfo in tenancy)
    name: "",
    phone: "",

    // Property & Room Selection
    propertyId: "",
    roomId: "",
    bedNumber: 1,

    // Agreement
    startDate: "",
    endDate: "",
    durationMonths: 12,
    renewalOption: true,
    autoRenew: false,

    // Financials
    monthlyRent: 8000,
    securityDeposit: 10000,
    securityDepositPaid: false,
    securityDepositPaidDate: "",
    maintenanceCharges: 500,
    rentDueDay: 5,
    lateFeePerDay: 50,
    gracePeriodDays: 3,

    // Tenant Info
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "Father",
    idProofType: "Aadhaar",
    idProofNumber: "",
    policeVerificationDone: false,
    policeVerificationDate: "",
    employmentType: "Student",
    companyName: "",
    designation: "",
  });

  // Fetch Properties from my-properties endpoint
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("usertoken");
        const response = await axios.get(
          "https://api.gharzoreality.com/api/v2/properties/my-properties",
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            } 
          }
        );
        
        if (response.data?.success && response.data?.data) {
          const propertiesData = response.data.data.map(property => ({
            _id: property._id,
            title: property.title || property.name || `${property.propertyType}`,
            type: property.propertyType,
            category: property.category,
            location: property.location?.city ? 
              `${property.location?.locality || ''}, ${property.location.city}` : 
              'Location not set',
            totalRooms: property.roomStats?.totalRooms || 0,
            availableRooms: property.roomStats?.availableRooms || 0,
            monthlyRent: property.price?.amount || 0,
            status: property.status,
            verificationStatus: property.verificationStatus,
          }));
          
          setProperties(propertiesData);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("Failed to fetch properties");
        setProperties([]);
      }
    };
    
    fetchProperties();
  }, []);

  // Fetch Rooms when property is selected
  useEffect(() => {
    if (!formData.propertyId) {
      setAvailableRooms([]);
      setFormData(prev => ({ ...prev, roomId: "", bedNumber: 1 }));
      return;
    }
    
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("usertoken");
        
        // Fetch rooms from /api/rooms/property/{propertyId} endpoint
        const response = await axios.get(
          `https://api.gharzoreality.com/api/rooms/property/${formData.propertyId}`,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            } 
          }
        );
        
        if (response.data?.success && response.data?.data) {
          // Parse rooms data according to API response structure
          const roomsData = response.data.data.map(room => {
            const totalBeds = room.capacity?.totalBeds || 0;
            const occupiedBeds = room.capacity?.occupiedBeds || 0;
            const availableBeds = totalBeds - occupiedBeds;
            
            return {
              _id: room._id,
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              label: `Room ${room.roomNumber} (${room.roomType}) - ${availableBeds} beds available`,
              status: availableBeds > 0 ? 'Available' : 'Occupied',
              totalBeds: totalBeds,
              availableBeds: availableBeds,
              occupiedBeds: occupiedBeds,
              rentPerBed: room.pricing?.rentPerBed || 0,
              securityDeposit: room.pricing?.securityDeposit || 0,
              maintenanceCharges: room.pricing?.maintenanceCharges?.amount || 0,
              floor: room.floor || 0,
              furnishing: room.features?.furnishing || 'Unfurnished',
            };
          });
          
          // Filter only rooms with available beds
          const availRooms = roomsData.filter(room => room.availableBeds > 0);
          
          if (availRooms.length > 0) {
            setAvailableRooms(availRooms);
          } else {
            setAvailableRooms([]);
            toast.info("No rooms with available beds for this property");
          }
        } else {
          setAvailableRooms([]);
          toast.error("No rooms found for this property");
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to fetch rooms. Please ensure rooms are properly configured.");
        setAvailableRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    
    fetchRooms();
  }, [formData.propertyId, properties]);

  // Generate Available Beds when room is selected
  useEffect(() => {
    if (!formData.propertyId || !formData.roomId) {
      setAvailableBeds([]);
      setFormData(prev => ({ ...prev, bedNumber: 1 }));
      return;
    }
    
    // Get available beds from selected room
    const selectedRoom = availableRooms.find(r => r._id === formData.roomId);
    if (selectedRoom && selectedRoom.availableBeds > 0) {
      // Generate bed numbers from 1 to availableBeds
      const beds = Array.from(
        { length: selectedRoom.availableBeds }, 
        (_, i) => ({
          _id: `${selectedRoom._id}-bed-${i + 1}`,
          bedNumber: i + 1,
          status: 'available',
          rentPerBed: selectedRoom.rentPerBed,
          securityDeposit: selectedRoom.securityDeposit,
        })
      );
      setAvailableBeds(beds);
      
      // Auto-set first bed as default
      if (beds.length > 0) {
        setFormData(prev => ({ ...prev, bedNumber: 1 }));
      }
    } else {
      setAvailableBeds([]);
      setFormData(prev => ({ ...prev, bedNumber: 1 }));
    }
  }, [formData.roomId, availableRooms]);

  // Auto-populate rent and security deposit from selected room
  useEffect(() => {
    if (!formData.roomId) return;
    
    const selectedRoom = availableRooms.find(r => r._id === formData.roomId);
    if (selectedRoom) {
      setFormData(prev => ({
        ...prev,
        monthlyRent: selectedRoom.rentPerBed || prev.monthlyRent,
        securityDeposit: selectedRoom.securityDeposit || prev.securityDeposit,
        maintenanceCharges: selectedRoom.maintenanceCharges || prev.maintenanceCharges,
      }));
    }
  }, [formData.roomId, availableRooms]);

  // Auto-calculate end date based on start date and duration
  useEffect(() => {
    if (formData.startDate && formData.durationMonths) {
      const start = new Date(formData.startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + parseInt(formData.durationMonths));
      setFormData((prev) => ({
        ...prev,
        endDate: end.toISOString().split("T")[0],
      }));
    }
  }, [formData.startDate, formData.durationMonths]);

  // Load editing data
  useEffect(() => {
    if (editingTenant) {
      // Map tenancy data to form fields
      setFormData({
        name: editingTenant.tenantId?.name || "",
        phone: editingTenant.tenantId?.phone || "",
        propertyId: editingTenant.propertyId?._id || "",
        roomId: editingTenant.roomId?._id || "",
        bedNumber: editingTenant.bedNumber || 1,
        startDate: editingTenant.agreement?.startDate?.split("T")[0] || "",
        endDate: editingTenant.agreement?.endDate?.split("T")[0] || "",
        durationMonths: editingTenant.agreement?.durationMonths || 12,
        renewalOption: editingTenant.agreement?.renewalOption ?? true,
        autoRenew: editingTenant.agreement?.autoRenew ?? false,
        monthlyRent: editingTenant.financials?.monthlyRent || 8000,
        securityDeposit: editingTenant.financials?.securityDeposit || 10000,
        securityDepositPaid: editingTenant.financials?.securityDepositPaid || false,
        securityDepositPaidDate: editingTenant.financials?.securityDepositPaidDate?.split("T")[0] || "",
        maintenanceCharges: editingTenant.financials?.maintenanceCharges || 500,
        rentDueDay: editingTenant.financials?.rentDueDay || 5,
        lateFeePerDay: editingTenant.financials?.lateFeePerDay || 50,
        gracePeriodDays: editingTenant.financials?.gracePeriodDays || 3,
        emergencyContactName: editingTenant.tenantInfo?.emergencyContact?.name || "",
        emergencyContactPhone: editingTenant.tenantInfo?.emergencyContact?.phone || "",
        emergencyContactRelation: editingTenant.tenantInfo?.emergencyContact?.relation || "Father",
        idProofType: editingTenant.tenantInfo?.idProof?.type || "Aadhaar",
        idProofNumber: editingTenant.tenantInfo?.idProof?.number || "",
        policeVerificationDone: editingTenant.tenantInfo?.policeVerification?.done || false,
        policeVerificationDate: editingTenant.tenantInfo?.policeVerification?.verifiedOn?.split("T")[0] || "",
        employmentType: editingTenant.tenantInfo?.employmentDetails?.type || "Student",
        companyName: editingTenant.tenantInfo?.employmentDetails?.companyName || "",
        designation: editingTenant.tenantInfo?.employmentDetails?.designation || "",
      });
    }
  }, [editingTenant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    // Phone validation
    if (["phone", "emergencyContactPhone"].includes(name)) {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // Reset dependent fields when parent changes
    if (name === "propertyId") {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: newValue,
        roomId: "",
        bedNumber: 1
      }));
    } else if (name === "roomId") {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: newValue,
        bedNumber: 1
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
    
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateCurrentStep = () => {
    const errors = {};

    if (step === 1) {
      if (!formData.name.trim()) errors.name = "Name is required";
      if (!formData.phone || formData.phone.length !== 10)
        errors.phone = "10-digit mobile required";
    }

    if (step === 2) {
      if (!formData.propertyId) errors.propertyId = "Property is required";
      if (!formData.roomId) errors.roomId = "Room is required";
      if (!formData.startDate) errors.startDate = "Start date is required";
    }

    if (step === 3) {
      if (!formData.monthlyRent || formData.monthlyRent <= 0)
        errors.monthlyRent = "Monthly rent is required";
      if (!formData.securityDeposit || formData.securityDeposit <= 0)
        errors.securityDeposit = "Security deposit is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep(step + 1);
    } else {
      toast.error("Please fill all required fields correctly");
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    // Validate that we have real room ID
    if (!formData.roomId) {
      toast.error("Please select a valid room");
      return;
    }

    setIsLoading(true);

    const token = localStorage.getItem("token") || localStorage.getItem("usertoken");
    if (!token) {
      toast.error("Please login again");
      setIsLoading(false);
      return;
    }

    // Build payload according to API format
    const payload = {
      propertyId: formData.propertyId,
      roomId: formData.roomId,
      bedNumber: Number(formData.bedNumber),
      tenantInfo: {
        name: formData.name,
        phone: formData.phone,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        },
        idProof: {
          type: formData.idProofType,
          number: formData.idProofNumber,
        },
        policeVerification: {
          done: formData.policeVerificationDone,
          verifiedOn: formData.policeVerificationDate || undefined,
        },
        employmentDetails: {
          type: formData.employmentType,
          companyName: formData.companyName || undefined,
          designation: formData.designation || undefined,
        },
      },
      agreement: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationMonths: Number(formData.durationMonths),
        renewalOption: formData.renewalOption,
        autoRenew: formData.autoRenew,
      },
      financials: {
        monthlyRent: Number(formData.monthlyRent),
        securityDeposit: Number(formData.securityDeposit),
        securityDepositPaid: formData.securityDepositPaid,
        securityDepositPaidDate: formData.securityDepositPaidDate || undefined,
        maintenanceCharges: Number(formData.maintenanceCharges),
        rentDueDay: Number(formData.rentDueDay),
        lateFeePerDay: Number(formData.lateFeePerDay),
        gracePeriodDays: Number(formData.gracePeriodDays),
      },
    };

    console.log("Submitting payload:", payload); // Debug log

    try {
      const response = await axios({
        method: isEdit ? "PUT" : "POST",
        url: isEdit
          ? `https://api.gharzoreality.com/api/tenancies/${editingTenant._id}`
          : "https://api.gharzoreality.com/api/tenancies/create",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: payload,
      });

      toast.success(
        response.data.message ||
          `Tenant ${isEdit ? "updated" : "created"} successfully!`
      );
      setTimeout(() => navigate("/landlord/tenant-form"), 1500);
    } catch (error) {
      console.error("Submission error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Submission failed. Please check if the room exists in the system."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stepLabels = ["Tenant Info", "Property & Agreement", "Financials", "Additional Details"];
  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-5xl mx-auto">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 px-8">
            <h2 className="text-4xl font-extrabold drop-shadow-lg mb-2">
              {isEdit ? "Update Tenancy" : "Create New Tenancy"}
            </h2>
            <p className="text-orange-100">Complete the form step by step</p>
          </div>

          <div className="p-8 md:p-12">
            {/* Progress Bar */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                {stepLabels.map((label, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all ${
                          step > i + 1
                            ? "bg-green-500"
                            : step === i + 1
                            ? "bg-orange-500 ring-4 ring-orange-200 scale-110"
                            : "bg-gray-300"
                        }`}
                      >
                        {step > i + 1 ? (
                          <FaCheckCircle className="text-xl" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <p
                        className={`text-xs mt-2 font-medium ${
                          step === i + 1
                            ? "text-orange-600"
                            : "text-gray-600"
                        }`}
                      >
                        {label}
                      </p>
                    </div>
                    {i < totalSteps - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                          step > i + 1 ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-orange-600 font-semibold text-xl mb-10">
              Step {step}: {stepLabels[step - 1]}
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Tenant Info */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <Input
                      label="Tenant Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={fieldErrors.name}
                      icon={<FaUser />}
                      placeholder="Full name"
                    />
                    <MobileInput
                      label="Mobile Number *"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      error={fieldErrors.phone}
                      placeholder="10-digit mobile"
                    />
                    <Input
                      label="Emergency Contact Name *"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      icon={<FaUserFriends />}
                      placeholder="Contact person name"
                    />
                    <MobileInput
                      label="Emergency Contact Phone *"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      placeholder="10-digit mobile"
                    />
                    <Select
                      label="Emergency Contact Relation *"
                      name="emergencyContactRelation"
                      value={formData.emergencyContactRelation}
                      onChange={handleChange}
                      options={[
                        { value: "Father", label: "Father" },
                        { value: "Mother", label: "Mother" },
                        { value: "Spouse", label: "Spouse" },
                        { value: "Sibling", label: "Sibling" },
                        { value: "Other", label: "Other" },
                      ]}
                    />
                    <Select
                      label="Employment Type *"
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      options={[
                        { value: "Student", label: "Student" },
                        { value: "Working Professional", label: "Working Professional" },
                        { value: "Business", label: "Business" },
                        { value: "Retired", label: "Retired" },
                        { value: "Other", label: "Other" },
                      ]}
                    />
                    {formData.employmentType === "Working Professional" && (
                      <>
                        <Input
                          label="Company Name"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          icon={<FaBriefcase />}
                          placeholder="Company name"
                        />
                        <Input
                          label="Designation"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          icon={<FaBriefcase />}
                          placeholder="Job title"
                        />
                      </>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Property & Agreement */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <Select
                      label="Property *"
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      error={fieldErrors.propertyId}
                      options={properties.map((p) => ({
                        value: p._id,
                        label: `${p.title} - ${p.location}`,
                      }))}
                      disabled={properties.length === 0}
                    />
                    <Select
                      label="Room *"
                      name="roomId"
                      value={formData.roomId}
                      onChange={handleChange}
                      error={fieldErrors.roomId}
                      options={availableRooms.map((r) => ({
                        value: r._id,
                        label: r.label || `Room ${r.roomNumber}`,
                      }))}
                      disabled={!formData.propertyId || availableRooms.length === 0 || loadingRooms}
                      loading={loadingRooms}
                    />
                    <Select
                      label="Bed Number *"
                      name="bedNumber"
                      value={formData.bedNumber.toString()}
                      onChange={(e) => {
                        handleChange({
                          ...e,
                          target: {
                            ...e.target,
                            value: parseInt(e.target.value)
                          }
                        });
                      }}
                      options={availableBeds.map((b) => ({
                        value: b.bedNumber.toString(),
                        label: `Bed ${b.bedNumber}`,
                      }))}
                      disabled={!formData.roomId || availableBeds.length === 0 || loadingBeds}
                      icon={<FaBed />}
                      loading={loadingBeds}
                    />
                    <Input
                      label="Start Date *"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      error={fieldErrors.startDate}
                      min={today}
                      icon={<FaCalendar />}
                    />
                    <Input
                      label="Duration (months) *"
                      name="durationMonths"
                      type="number"
                      value={formData.durationMonths}
                      onChange={handleChange}
                      min="1"
                      icon={<FaCalendar />}
                    />
                    <Input
                      label="End Date"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      readOnly
                      icon={<FaCalendar />}
                      disabled
                    />
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="renewalOption"
                          checked={formData.renewalOption}
                          onChange={handleChange}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-400"
                        />
                        <span className="text-gray-700 font-medium">Renewal Option</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="autoRenew"
                          checked={formData.autoRenew}
                          onChange={handleChange}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-400"
                        />
                        <span className="text-gray-700 font-medium">Auto Renew</span>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Financials */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <Input
                      label="Monthly Rent (₹) *"
                      name="monthlyRent"
                      type="number"
                      value={formData.monthlyRent}
                      onChange={handleChange}
                      error={fieldErrors.monthlyRent}
                      min="0"
                      icon={<FaMoneyBillWave />}
                    />
                    <Input
                      label="Security Deposit (₹) *"
                      name="securityDeposit"
                      type="number"
                      value={formData.securityDeposit}
                      onChange={handleChange}
                      error={fieldErrors.securityDeposit}
                      min="0"
                      icon={<FaMoneyBillWave />}
                    />
                    <Input
                      label="Maintenance Charges (₹)"
                      name="maintenanceCharges"
                      type="number"
                      value={formData.maintenanceCharges}
                      onChange={handleChange}
                      min="0"
                      icon={<FaMoneyBillWave />}
                    />
                    <Input
                      label="Rent Due Day (1-31)"
                      name="rentDueDay"
                      type="number"
                      value={formData.rentDueDay}
                      onChange={handleChange}
                      min="1"
                      max="31"
                      icon={<FaCalendar />}
                    />
                    <Input
                      label="Late Fee per Day (₹)"
                      name="lateFeePerDay"
                      type="number"
                      value={formData.lateFeePerDay}
                      onChange={handleChange}
                      min="0"
                      icon={<FaMoneyBillWave />}
                    />
                    <Input
                      label="Grace Period (days)"
                      name="gracePeriodDays"
                      type="number"
                      value={formData.gracePeriodDays}
                      onChange={handleChange}
                      min="0"
                      icon={<FaCalendar />}
                    />
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="securityDepositPaid"
                          checked={formData.securityDepositPaid}
                          onChange={handleChange}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-400"
                        />
                        <span className="text-gray-700 font-medium">
                          Security Deposit Paid
                        </span>
                      </label>
                    </div>
                    {formData.securityDepositPaid && (
                      <Input
                        label="Payment Date"
                        name="securityDepositPaidDate"
                        type="date"
                        value={formData.securityDepositPaidDate}
                        onChange={handleChange}
                        max={today}
                        icon={<FaCalendar />}
                      />
                    )}
                  </motion.div>
                )}

                {/* Step 4: Additional Details */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <Select
                      label="ID Proof Type"
                      name="idProofType"
                      value={formData.idProofType}
                      onChange={handleChange}
                      options={[
                        { value: "Aadhaar", label: "Aadhaar" },
                        { value: "PAN", label: "PAN Card" },
                        { value: "Driving License", label: "Driving License" },
                        { value: "Voter ID", label: "Voter ID" },
                        { value: "Passport", label: "Passport" },
                      ]}
                    />
                    <Input
                      label="ID Proof Number"
                      name="idProofNumber"
                      value={formData.idProofNumber}
                      onChange={handleChange}
                      placeholder="Enter ID number"
                    />
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="policeVerificationDone"
                          checked={formData.policeVerificationDone}
                          onChange={handleChange}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-400"
                        />
                        <span className="text-gray-700 font-medium">
                          Police Verification Done
                        </span>
                      </label>
                    </div>
                    {formData.policeVerificationDone && (
                      <Input
                        label="Verification Date"
                        name="policeVerificationDate"
                        type="date"
                        value={formData.policeVerificationDate}
                        onChange={handleChange}
                        max={today}
                        icon={<FaCalendar />}
                      />
                    )}

                    <div className="md:col-span-2 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-bold text-blue-900 mb-2">
                            Important Note
                          </h3>
                          <p className="text-blue-800 text-sm">
                            After submission, this tenancy will be in "Pending-Approval" status.
                            You'll need to approve it from the tenancy details page to activate it.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition shadow-md"
                  >
                    ← Previous
                  </button>
                )}

                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition shadow-md"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition shadow-2xl flex items-center gap-3"
                  >
                    {isLoading && <FaSpinner className="animate-spin text-2xl" />}
                    {isEdit ? "Update Tenancy" : "Create Tenancy"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Reusable Components
const Input = ({ label, error, icon, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`w-full ${
          icon ? "pl-12" : "pl-4"
        } pr-4 py-3 bg-white border-2 ${
          error ? "border-red-400" : "border-gray-300"
        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition`}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const MobileInput = ({ label, error, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="flex">
      <span className="inline-flex items-center px-4 text-gray-700 bg-gray-100 border-2 border-r-0 border-gray-300 rounded-l-xl font-medium">
        +91
      </span>
      <input
        {...props}
        maxLength={10}
        className={`flex-1 px-4 py-3 bg-white border-2 ${
          error ? "border-red-400" : "border-gray-300"
        } rounded-r-xl focus:outline-none focus:border-orange-400 transition`}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const Select = ({ label, options = [], disabled = false, error, loading = false, icon, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          {icon}
        </div>
      )}
      <select
        {...props}
        disabled={disabled || loading}
        className={`w-full ${icon ? "pl-12" : "pl-4"} pr-4 py-3 bg-white border-2 ${
          error ? "border-red-400" : "border-gray-300"
        } rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 transition ${
          disabled || loading ? "opacity-60 cursor-not-allowed bg-gray-50" : ""
        }`}
      >
        <option value="" className="text-gray-500">
          {loading ? "Loading..." : disabled ? "No options available" : `Select ${label.toLowerCase()}`}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <FaSpinner className="animate-spin text-orange-500" />
        </div>
      )}
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default TenantForm;