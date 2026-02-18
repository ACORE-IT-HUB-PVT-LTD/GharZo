import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  FaExchangeAlt, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUser,
  FaHome,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaHistory
} from "react-icons/fa";

const LandlordRoomSwitch = () => {
  const navigate = useNavigate();
  const [switches, setSwitches] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'approve', 'reject', 'complete'
  const [formData, setFormData] = useState({
    remarks: "",
    switchChargesAmount: "",
    confirmedSwitchDate: "",
    actualSwitchDate: "",
    oldRoomCondition: "Good",
    notes: "",
    checklist: [
      { item: "Bed", condition: "Good" },
      { item: "Fan", condition: "Good" },
      { item: "Almirah", condition: "Good" },
    ]
  });
  const [submitting, setSubmitting] = useState(false);

  const getToken = () => localStorage.getItem("usertoken");

  // Fetch all switch requests
  const fetchSwitches = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Please login first");
      navigate("/landlord_login");
      return;
    }

    try {
      const res = await fetch(
        "https://api.gharzoreality.com/api/room-switches/landlord/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setSwitches(data.data || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      toast.error("Failed to fetch switch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwitches();
  }, [navigate]);

  // Filter switches
  const filteredSwitches = switches.filter((s) => {
    if (filter === "all") return true;
    return s.status?.toLowerCase() === filter.toLowerCase();
  });

  // Handle review (approve/reject)
  const handleReview = async (e) => {
    e.preventDefault();
    if (!selectedSwitch) return;

    const token = getToken();
    if (!token) return;

    setSubmitting(true);

    try {
      const payload = {
        action: modalType, // 'approve' or 'reject'
        remarks: formData.remarks,
      };

      if (modalType === "approve") {
        if (formData.switchChargesAmount) {
          payload.switchChargesAmount = Number(formData.switchChargesAmount);
        }
        if (formData.confirmedSwitchDate) {
          payload.confirmedSwitchDate = formData.confirmedSwitchDate;
        }
      }

      const res = await fetch(
        `https://api.gharzoreality.com/api/room-switches/${selectedSwitch._id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `Request ${modalType}d successfully`);
        setShowModal(false);
        setSelectedSwitch(null);
        fetchSwitches();
      } else {
        toast.error(data.message || "Failed to process request");
      }
    } catch (err) {
      toast.error("Failed to connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle complete
  const handleComplete = async (e) => {
    e.preventDefault();
    if (!selectedSwitch) return;

    const token = getToken();
    if (!token) return;

    setSubmitting(true);

    try {
      const payload = {
        actualSwitchDate: formData.actualSwitchDate,
        oldRoomCondition: formData.oldRoomCondition,
        newRoomChecklist: formData.checklist,
        notes: formData.notes,
      };

      const res = await fetch(
        `https://api.gharzoreality.com/api/room-switches/${selectedSwitch._id}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Switch completed successfully");
        setShowModal(false);
        setSelectedSwitch(null);
        fetchSwitches();
      } else {
        toast.error(data.message || "Failed to complete switch");
      }
    } catch (err) {
      toast.error("Failed to connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  // Open modal
  const openModal = (switchItem, type) => {
    setSelectedSwitch(switchItem);
    setModalType(type);
    setFormData({
      remarks: "",
      switchChargesAmount: "",
      confirmedSwitchDate: "",
      actualSwitchDate: "",
      oldRoomCondition: "Good",
      notes: "",
      checklist: [
        { item: "Bed", condition: "Good" },
        { item: "Fan", condition: "Good" },
        { item: "Almirah", condition: "Good" },
      ]
    });
    setShowModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "approved":
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6" 
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`
      }}
    >
      <ToastContainer position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <FaExchangeAlt className="text-orange-500" />
            Room Switch Requests
          </h1>
          <p className="text-slate-400">Manage tenant room switch requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "from-blue-500 to-indigo-600" },
            { label: "Pending", value: stats.pending, color: "from-amber-500 to-orange-600" },
            { label: "Under Review", value: stats.underReview, color: "from-purple-500 to-pink-600" },
            { label: "Approved", value: stats.approved, color: "from-emerald-500 to-teal-600" },
            { label: "Completed", value: stats.completed, color: "from-green-500 to-lime-600" },
            { label: "Rejected", value: stats.rejected, color: "from-red-500 to-rose-600" },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white shadow-lg`}>
              <div className="text-2xl font-bold">{stat.value || 0}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "pending", "underReview", "approved", "scheduled", "completed", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                filter === f
                  ? "bg-orange-500 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, " ")}
            </button>
          ))}
        </div>

        {/* Switch Requests List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white/10 rounded-2xl h-48"></div>
            ))}
          </div>
        ) : filteredSwitches.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FaExchangeAlt className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No switch requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSwitches.map((switchItem) => (
              <div
                key={switchItem._id}
                className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
              >
                {/* Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="text-white font-bold text-lg">
                      {switchItem.switchNumber}
                    </div>
                    <div className="text-slate-400 text-sm">
                      Requested on {formatDate(switchItem.createdAt)}
                    </div>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${getStatusColor(switchItem.status)}`}>
                    {switchItem.status}
                  </span>
                </div>

                {/* Tenant Info */}
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                    <FaUser /> Tenant Details
                  </div>
                  <div className="text-white font-semibold">
                    {switchItem.tenantId?.name || "N/A"}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {switchItem.tenantId?.phone || "No phone"}
                  </div>
                </div>

                {/* Room Switch Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* From Room */}
                  <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                    <div className="text-red-400 text-xs font-semibold mb-2">FROM ROOM</div>
                    <div className="text-white font-bold">{switchItem.fromRoom?.roomNumber}</div>
                    <div className="text-slate-400 text-sm">{switchItem.fromRoom?.roomType}</div>
                    <div className="text-slate-400 text-sm">₹{switchItem.fromRoom?.monthlyRent}/mo</div>
                  </div>

                  {/* To Room */}
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                    <div className="text-green-400 text-xs font-semibold mb-2">TO ROOM</div>
                    <div className="text-white font-bold">{switchItem.toRoom?.roomNumber}</div>
                    <div className="text-slate-400 text-sm">{switchItem.toRoom?.roomType}</div>
                    <div className="text-slate-400 text-sm">₹{switchItem.toRoom?.monthlyRent}/mo</div>
                  </div>
                </div>

                {/* Rent Change */}
                {switchItem.rentChange && (
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-slate-400 text-sm">Rent Change</div>
                      <div className={`font-bold ${
                        switchItem.rentChange.difference > 0 
                          ? "text-red-400" 
                          : switchItem.rentChange.difference < 0 
                            ? "text-green-400" 
                            : "text-slate-400"
                      }`}>
                        {switchItem.rentChange.difference > 0 
                          ? `+₹${switchItem.rentChange.difference}` 
                          : switchItem.rentChange.difference < 0 
                            ? `₹${switchItem.rentChange.difference}` 
                            : "No change"}
                      </div>
                    </div>
                    {switchItem.rentChange.effectiveFrom && (
                      <div className="text-slate-400 text-xs mt-2">
                        Effective from: {formatDate(switchItem.rentChange.effectiveFrom)}
                      </div>
                    )}
                  </div>
                )}

                {/* Reason & Date */}
                <div className="text-slate-300 text-sm mb-4">
                  <div className="mb-2">
                    <span className="text-slate-500">Reason:</span> {switchItem.reason}
                  </div>
                  <div className="text-slate-500">
                    Preferred Date: {formatDate(switchItem.preferredSwitchDate)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {switchItem.status === "Pending" && (
                    <>
                      <button
                        onClick={() => openModal(switchItem, "approve")}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        onClick={() => openModal(switchItem, "reject")}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <FaTimes /> Reject
                      </button>
                    </>
                  )}
                  {switchItem.status === "Scheduled" && (
                    <button
                      onClick={() => openModal(switchItem, "complete")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <FaCheckCircle /> Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              {modalType === "approve" && <><FaCheck className="text-green-500" /> Approve Request</>}
              {modalType === "reject" && <><FaTimes className="text-red-500" /> Reject Request</>}
              {modalType === "complete" && <><FaCheckCircle className="text-blue-500" /> Complete Switch</>}
            </h3>

            <form onSubmit={modalType === "complete" ? handleComplete : handleReview}>
              {/* Remarks */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Remarks {modalType !== "complete" && <span className="text-red-400">*</span>}
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Enter your remarks..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  required={modalType !== "complete"}
                />
              </div>

              {/* Approve specific fields */}
              {modalType === "approve" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Switch Charges (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.switchChargesAmount}
                      onChange={(e) => setFormData({ ...formData, switchChargesAmount: e.target.value })}
                      placeholder="Enter switch charges amount"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirmed Switch Date
                    </label>
                    <input
                      type="date"
                      value={formData.confirmedSwitchDate}
                      onChange={(e) => setFormData({ ...formData, confirmedSwitchDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </>
              )}

              {/* Complete specific fields */}
              {modalType === "complete" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Actual Switch Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.actualSwitchDate}
                      onChange={(e) => setFormData({ ...formData, actualSwitchDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Old Room Condition
                    </label>
                    <select
                      value={formData.oldRoomCondition}
                      onChange={(e) => setFormData({ ...formData, oldRoomCondition: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional notes..."
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedSwitch(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    modalType === "approve" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : modalType === "reject"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                  } text-white disabled:opacity-50`}
                >
                  {submitting ? "Processing..." : 
                    modalType === "approve" ? "Approve" : 
                    modalType === "reject" ? "Reject" : "Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordRoomSwitch;
