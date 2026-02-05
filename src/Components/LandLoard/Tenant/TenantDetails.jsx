import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  Home,
  Briefcase,
  Shield,
  ChevronLeft,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TenancyDetails = () => {
  const { tenancyId } = useParams();
  const navigate = useNavigate();
  const [tenancy, setTenancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [imageGalleryIndex, setImageGalleryIndex] = useState({
    property: 0,
    room: 0,
  });

  // Fetch tenancy details
  useEffect(() => {
    const fetchTenancyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("usertoken");
        if (!token) {
          throw new Error("No authentication token found. Please login again.");
        }

        const response = await fetch(
          `https://api.gharzoreality.com/api/tenancies/${tenancyId}/details`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - Failed to fetch tenancy details`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setTenancy(data.data);
        } else if (data.data) {
          setTenancy(data.data);
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching tenancy details:", err);
        setError(err.message);
        toast.error(err.message || "Failed to load tenancy details", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });
      } finally {
        setLoading(false);
      }
    };

    if (tenancyId) {
      fetchTenancyDetails();
    } else {
      setError("Invalid tenancy ID");
      setLoading(false);
    }
  }, [tenancyId]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-300";
      case "Terminated":
        return "bg-red-100 text-red-800 border-red-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case "good":
        return "bg-green-100 text-green-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-orange-400/20 border-t-orange-400 rounded-full animate-spin mb-6"></div>
          <p className="text-xl text-gray-300 font-medium">Loading tenancy details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tenancy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-red-500/50 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-xl text-white font-semibold mb-2">Failed to Load</p>
          <p className="text-gray-300 mb-6">{error || "No tenancy details found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-orange-500/80 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(tenancy.agreement?.endDate);
  const propertyImages = tenancy.propertyId?.images || [];
  const roomImages = tenancy.roomId?.media?.images || [];
  const moveInChecklist = tenancy.occupancy?.moveInChecklist || [];
  const moveOutChecklist = tenancy.occupancy?.moveOutChecklist || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 text-gray-100">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          whileHover={{ x: -5 }}
        >
          <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Back</span>
        </motion.button>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {tenancy.tenantId?.name || "Tenant"}
              </h1>
              <p className="text-gray-400">
                {tenancy.propertyId?.title || "Property"}
              </p>
            </div>
            <motion.div
              className={`px-6 py-3 rounded-xl font-semibold border-2 text-lg ${getStatusColor(
                tenancy.status
              )}`}
              whileHover={{ scale: 1.05 }}
            >
              {tenancy.status || "N/A"}
            </motion.div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Monthly Rent"
              value={formatCurrency(tenancy.financials?.monthlyRent)}
              color="from-green-500 to-emerald-600"
            />
            <StatCard
              icon={<Calendar className="w-5 h-5" />}
              label="Days Remaining"
              value={daysRemaining > 0 ? `${daysRemaining}d` : "Ended"}
              color={daysRemaining > 30 ? "from-blue-500 to-cyan-600" : "from-orange-500 to-red-600"}
            />
            <StatCard
              icon={<Home className="w-5 h-5" />}
              label="Duration"
              value={`${tenancy.agreement?.durationMonths || 0}m`}
              color="from-purple-500 to-pink-600"
            />
            <StatCard
              icon={<Shield className="w-5 h-5" />}
              label="Security Deposit"
              value={formatCurrency(tenancy.financials?.securityDeposit)}
              color="from-indigo-500 to-blue-600"
            />
          </div>
        </motion.div>

        {/* Notice Alert */}
        {tenancy.notice?.isUnderNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-500/20 border-2 border-orange-500/50 rounded-xl p-6 mb-8 flex gap-4"
          >
            <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-300 mb-2">
                Under Notice
              </h3>
              <p className="text-gray-300">
                Notice given by: <span className="font-semibold">{tenancy.notice?.noticeGivenBy}</span>
              </p>
              <p className="text-gray-300">
                Reason: <span className="font-semibold">{tenancy.notice?.reason}</span>
              </p>
              <p className="text-gray-300 mt-2">
                Vacate by: <span className="font-semibold text-orange-300">{formatDate(tenancy.notice?.vacateByDate)}</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Tabs Navigation */}
        <motion.div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["overview",  "property", "financials", "occupancy", "documents"].map(
            (tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "bg-orange-500 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            )
          )}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Agreement Overview */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-orange-400" />
                  Agreement Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="Start Date" value={formatDate(tenancy.agreement?.startDate)} />
                  <InfoItem label="End Date" value={formatDate(tenancy.agreement?.endDate)} />
                  <InfoItem label="Duration" value={`${tenancy.agreement?.durationMonths} months`} />
                  <InfoItem label="Renewal Option" value={tenancy.agreement?.renewalOption ? "Yes" : "No"} />
                  <InfoItem label="Auto Renew" value={tenancy.agreement?.autoRenew ? "Yes" : "No"} />
                  <InfoItem
                    label="Landlord Signed"
                    value={
                      <span className={tenancy.agreement?.signedByLandlord ? "text-green-400" : "text-red-400"}>
                        {tenancy.agreement?.signedByLandlord ? "✓ Signed" : "✗ Not Signed"}
                      </span>
                    }
                  />
                  <InfoItem
                    label="Tenant Signed"
                    value={
                      <span className={tenancy.agreement?.signedByTenant ? "text-green-400" : "text-red-400"}>
                        {tenancy.agreement?.signedByTenant ? "✓ Signed" : "✗ Not Signed"}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Quick Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ContactCard
                  title="Tenant Contact"
                  name={tenancy.tenantId?.name}
                  phone={tenancy.tenantId?.phone}
                  email={tenancy.tenantId?.email}
                />
                <ContactCard
                  title="Landlord Contact"
                  name={tenancy.landlordId?.name}
                  phone={tenancy.landlordId?.phone}
                />
              </div>
            </div>
          )}

          {/* Tenant Tab */}
          {activeTab === "tenant" && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <User className="w-6 h-6 text-orange-400" />
                Tenant Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Details</h3>
                  <div className="space-y-3">
                    <InfoItem label="Name" value={tenancy.tenantId?.name} />
                    <InfoItem label="Phone" value={tenancy.tenantId?.phone} />
                    <InfoItem label="Email" value={tenancy.tenantId?.email} />
                  </div>
                </div>

                {/* Employment */}
                {tenancy.tenantInfo?.employmentDetails && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-orange-400" />
                      Employment
                    </h3>
                    <div className="space-y-3">
                      <InfoItem
                        label="Type"
                        value={tenancy.tenantInfo.employmentDetails.type}
                      />
                      <InfoItem
                        label="Company"
                        value={tenancy.tenantInfo.employmentDetails.companyName}
                      />
                      <InfoItem
                        label="Designation"
                        value={tenancy.tenantInfo.employmentDetails.designation}
                      />
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {tenancy.tenantInfo?.emergencyContact && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
                    <div className="space-y-3">
                      <InfoItem
                        label="Name"
                        value={tenancy.tenantInfo.emergencyContact.name}
                      />
                      <InfoItem
                        label="Phone"
                        value={tenancy.tenantInfo.emergencyContact.phone}
                      />
                      <InfoItem
                        label="Relation"
                        value={tenancy.tenantInfo.emergencyContact.relation}
                      />
                    </div>
                  </div>
                )}

                {/* ID Proof */}
                {tenancy.tenantInfo?.idProof && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-400" />
                      ID Proof
                    </h3>
                    <div className="space-y-3">
                      <InfoItem label="Type" value={tenancy.tenantInfo.idProof.type} />
                      <InfoItem
                        label="Number"
                        value={tenancy.tenantInfo.idProof.number}
                      />
                    </div>
                  </div>
                )}

                {/* Police Verification */}
                {tenancy.tenantInfo?.policeVerification && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Police Verification</h3>
                    <div className="space-y-3">
                      <InfoItem
                        label="Status"
                        value={
                          <span className={tenancy.tenantInfo.policeVerification.done ? "text-green-400" : "text-red-400"}>
                            {tenancy.tenantInfo.policeVerification.done ? "✓ Done" : "✗ Pending"}
                          </span>
                        }
                      />
                      {tenancy.tenantInfo.policeVerification.done && (
                        <InfoItem
                          label="Verified On"
                          value={formatDate(tenancy.tenantInfo.policeVerification.verifiedOn)}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ratings */}
              {tenancy.ratings && (
                <div className="mt-8 pt-8 border-t border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Ratings & Reviews</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tenancy.ratings.byTenant && (
                      <RatingCard
                        title="Tenant's Review"
                        rating={tenancy.ratings.byTenant.rating}
                        review={tenancy.ratings.byTenant.review}
                        date={tenancy.ratings.byTenant.givenAt}
                      />
                    )}
                    {tenancy.ratings.byLandlord && (
                      <RatingCard
                        title="Landlord's Review"
                        rating={tenancy.ratings.byLandlord.rating}
                        review={tenancy.ratings.byLandlord.review}
                        date={tenancy.ratings.byLandlord.givenAt}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Property Tab */}
          {activeTab === "property" && (
            <div className="space-y-6">
              {/* Property Images */}
              {propertyImages.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Property Images</h3>
                  <div className="space-y-4">
                    <motion.div
                      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/30 border border-white/20"
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={propertyImages[imageGalleryIndex.property]?.url}
                        alt={`Property ${imageGalleryIndex.property + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                        {imageGalleryIndex.property + 1} / {propertyImages.length}
                      </div>
                    </motion.div>

                    {propertyImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {propertyImages.map((img, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() =>
                              setImageGalleryIndex((prev) => ({
                                ...prev,
                                property: idx,
                              }))
                            }
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              imageGalleryIndex.property === idx
                                ? "border-orange-400"
                                : "border-white/20"
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            <img
                              src={img.url}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Property Details */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-orange-400" />
                  Property Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="Title" value={tenancy.propertyId?.title} />
                  <InfoItem label="City" value={tenancy.propertyId?.location?.city} />
                  <InfoItem label="Locality" value={tenancy.propertyId?.location?.locality} />
                  <InfoItem label="Sub-Locality" value={tenancy.propertyId?.location?.subLocality} />
                  <InfoItem label="Pin Code" value={tenancy.propertyId?.location?.pincode} />
                  <InfoItem label="State" value={tenancy.propertyId?.location?.state} />
                  <InfoItem
                    label="Full Address"
                    value={tenancy.propertyId?.location?.address}
                    fullWidth
                  />
                  <InfoItem label="Landmark" value={tenancy.propertyId?.location?.landmark} />
                  <InfoItem
                    label="Coordinates"
                    value={`${tenancy.propertyId?.location?.coordinates?.latitude}, ${tenancy.propertyId?.location?.coordinates?.longitude}`}
                  />
                  <InfoItem label="Room Number" value={tenancy.roomId?.roomNumber} />
                  <InfoItem label="Room Type" value={tenancy.roomId?.roomType} />
                  <InfoItem label="Bed Number" value={tenancy.bedNumber} />
                </div>
              </div>

              {/* Room Images */}
              {roomImages.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Room Images</h3>
                  <div className="space-y-4">
                    <motion.div
                      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/30 border border-white/20"
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={roomImages[imageGalleryIndex.room]?.url}
                        alt={`Room ${imageGalleryIndex.room + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                        {imageGalleryIndex.room + 1} / {roomImages.length}
                      </div>
                    </motion.div>

                    {roomImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {roomImages.map((img, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() =>
                              setImageGalleryIndex((prev) => ({
                                ...prev,
                                room: idx,
                              }))
                            }
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              imageGalleryIndex.room === idx
                                ? "border-orange-400"
                                : "border-white/20"
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            <img
                              src={img.url}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === "financials" && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-orange-400" />
                Financial Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Rent Details</h3>
                  <InfoItem
                    label="Monthly Rent"
                    value={formatCurrency(tenancy.financials?.monthlyRent)}
                  />
                  <InfoItem
                    label="Maintenance Charges"
                    value={formatCurrency(tenancy.financials?.maintenanceCharges)}
                  />
                  <InfoItem label="Rent Due Day" value={`${tenancy.financials?.rentDueDay}th of month`} />
                  <InfoItem
                    label="Late Fee per Day"
                    value={formatCurrency(tenancy.financials?.lateFeePerDay)}
                  />
                  <InfoItem label="Grace Period" value={`${tenancy.financials?.gracePeriodDays} days`} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Security Deposit</h3>
                  <InfoItem
                    label="Amount"
                    value={formatCurrency(tenancy.financials?.securityDeposit)}
                  />
                  <InfoItem
                    label="Status"
                    value={
                      <span className={tenancy.financials?.securityDepositPaid ? "text-green-400" : "text-red-400"}>
                        {tenancy.financials?.securityDepositPaid ? "✓ Paid" : "✗ Not Paid"}
                      </span>
                    }
                  />
                  {tenancy.financials?.securityDepositPaid && (
                    <InfoItem
                      label="Paid On"
                      value={formatDate(tenancy.financials?.securityDepositPaidDate)}
                    />
                  )}
                </div>
              </div>

              {/* Financial Summary Card */}
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Monthly Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <SummaryItem
                    label="Rent"
                    value={formatCurrency(tenancy.financials?.monthlyRent)}
                  />
                  <SummaryItem
                    label="Maintenance"
                    value={formatCurrency(tenancy.financials?.maintenanceCharges)}
                  />
                  <SummaryItem
                    label="Total"
                    value={formatCurrency(
                      (tenancy.financials?.monthlyRent || 0) +
                        (tenancy.financials?.maintenanceCharges || 0)
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Occupancy Tab */}
          {activeTab === "occupancy" && (
            <div className="space-y-6">
              {/* Move In/Out Dates */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-400" />
                  Occupancy Timeline
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Move In</h3>
                    <div className="space-y-3">
                      <InfoItem
                        label="Scheduled"
                        value={formatDate(tenancy.occupancy?.moveInDate)}
                      />
                      <InfoItem
                        label="Actual"
                        value={formatDate(tenancy.occupancy?.actualMoveInDate)}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Move Out</h3>
                    <div className="space-y-3">
                      <InfoItem
                        label="Scheduled"
                        value={formatDate(tenancy.occupancy?.moveOutDate)}
                      />
                      <InfoItem
                        label="Actual"
                        value={formatDate(tenancy.occupancy?.actualMoveOutDate)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Move In Checklist */}
              {moveInChecklist.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    Move In Checklist
                  </h3>
                  <div className="space-y-4">
                    {moveInChecklist.map((item, idx) => (
                      <ChecklistItem key={idx} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Move Out Checklist */}
              {moveOutChecklist.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-400" />
                    Move Out Checklist
                  </h3>
                  <div className="space-y-4">
                    {moveOutChecklist.map((item, idx) => (
                      <ChecklistItem key={idx} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-orange-400" />
                Documents
              </h2>
              <p className="text-gray-400 text-center py-8">
                Document management features coming soon. Upload and manage documents through the main interface.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white shadow-lg`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="text-3xl opacity-50">{icon}</div>
    </div>
  </motion.div>
);

const InfoItem = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-full" : ""}>
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className="text-white font-medium">{value || "N/A"}</p>
  </div>
);

const ContactCard = ({ title, name, phone, email }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
  >
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    <div className="space-y-3">
      {name && (
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-orange-400" />
          <span className="text-gray-300">{name}</span>
        </div>
      )}
      {phone && (
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-orange-400" />
          <a href={`tel:${phone}`} className="text-gray-300 hover:text-white transition">
            {phone}
          </a>
        </div>
      )}
      {email && (
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-orange-400" />
          <a href={`mailto:${email}`} className="text-gray-300 hover:text-white transition">
            {email}
          </a>
        </div>
      )}
    </div>
  </motion.div>
);

const RatingCard = ({ title, rating, review, date }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
  >
    <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
    {rating && (
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-500"}>
              ★
            </span>
          ))}
        </div>
        <span className="text-sm text-gray-400">{rating}/5</span>
      </div>
    )}
    {review && <p className="text-gray-300 text-sm mb-2">{review}</p>}
    {date && <p className="text-gray-500 text-xs">{formatDate(date)}</p>}
  </motion.div>
);

const ChecklistItem = ({ item }) => (
  <motion.div
    whileHover={{ x: 5 }}
    className={`flex gap-4 p-4 rounded-lg ${getConditionColor(item.condition)}`}
  >
    <div className="flex-shrink-0">
      {item.photo ? (
        <img
          src={item.photo}
          alt={item.item}
          className="w-16 h-16 rounded-lg object-cover border border-white/20"
        />
      ) : (
        <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
          <Eye className="w-6 h-6" />
        </div>
      )}
    </div>
    <div className="flex-grow">
      <p className="font-semibold text-lg">{item.item}</p>
      <p className="text-sm opacity-75 mb-1">Condition: {item.condition}</p>
      {item.notes && <p className="text-sm opacity-75">{item.notes}</p>}
    </div>
  </motion.div>
);

const SummaryItem = ({ label, value }) => (
  <div className="text-center">
    <p className="text-gray-300 text-sm mb-1">{label}</p>
    <p className="text-white font-bold text-lg">{value}</p>
  </div>
);

const getConditionColor = (condition) => {
  switch (condition?.toLowerCase()) {
    case "good":
      return "bg-green-500/20 border border-green-500/50";
    case "fair":
      return "bg-yellow-500/20 border border-yellow-500/50";
    case "poor":
      return "bg-red-500/20 border border-red-500/50";
    default:
      return "bg-gray-500/20 border border-gray-500/50";
  }
};

export default TenancyDetails;