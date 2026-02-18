import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Roomswitch = () => {
  const navigate = useNavigate();
  const [tenancyId, setTenancyId] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [mySwitches, setMySwitches] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    reason: "",
    preferredSwitchDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [switchesLoading, setSwitchesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("switch"); // 'switch' or 'history'

  // Get token from localStorage
  const getToken = () => localStorage.getItem("usertoken");

  // Fetch tenancies to get the tenancyId
  const fetchTenancyId = async () => {
    const token = getToken();
    if (!token) return null;

    try {
      const res = await fetch(
        "https://api.gharzoreality.com/api/tenancies/tenant/my-tenancies",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok && data.success && data.data?.length > 0) {
        return data.data[0]._id;
      }
    } catch (err) {
      console.error("Error fetching tenancy:", err);
    }
    return null;
  };

  // Fetch available rooms
  const fetchAvailableRooms = async (tId) => {
    const token = getToken();
    if (!token || !tId) {
      setRoomsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://api.gharzoreality.com/api/room-switches/available-rooms/${tId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentRoom(data.currentRoom);
        setAvailableRooms(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching available rooms:", err);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Fetch my switch requests
  const fetchMySwitches = async () => {
    const token = getToken();
    if (!token) {
      setSwitchesLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "https://api.gharzoreality.com/api/room-switches/tenant/my-switches",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setMySwitches(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching switches:", err);
    } finally {
      setSwitchesLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      const token = getToken();
      if (!token) {
        toast.error("Please login first");
        navigate("/tenant_login");
        return;
      }

      // Fetch tenancyId from API
      const tId = await fetchTenancyId();
      
      if (tId) {
        setTenancyId(tId);
        fetchAvailableRooms(tId);
      } else {
        toast.error("No active tenancy found");
        setRoomsLoading(false);
      }

      fetchMySwitches();
    };

    initializeData();
  }, [navigate]);

  // Submit switch request
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRoom) {
      toast.error("Please select a room");
      return;
    }

    if (!formData.reason.trim()) {
      toast.error("Please provide a reason for switching");
      return;
    }

    if (!formData.preferredSwitchDate) {
      toast.error("Please select a preferred switch date");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://api.gharzoreality.com/api/room-switches/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tenancyId: tenancyId,
            toRoomId: selectedRoom._id,
            reason: formData.reason,
            preferredSwitchDate: formData.preferredSwitchDate,
          }),
        }
      );
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(data.message || "Switch request submitted successfully!");
        setFormData({ reason: "", preferredSwitchDate: "" });
        setSelectedRoom(null);
        fetchMySwitches(); // Refresh switch history
        setActiveTab("history");
      } else {
        toast.error(data.message || "Failed to submit request");
      }
    } catch (err) {
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <ToastContainer position="top-center" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Room Switch Request
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Request to switch to a different room
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("switch")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === "switch"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            New Request
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            My Switches ({mySwitches.length})
          </button>
        </div>

        {/* Switch Request Form */}
        {activeTab === "switch" && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6">
            {/* Current Room Info */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                Your Current Room
              </h2>
              
              {roomsLoading ? (
                <div className="animate-pulse flex gap-4">
                  <div className="h-20 bg-slate-700 rounded-xl flex-1"></div>
                  <div className="h-20 bg-slate-700 rounded-xl flex-1"></div>
                  <div className="h-20 bg-slate-700 rounded-xl flex-1"></div>
                </div>
              ) : currentRoom ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                    <div className="text-slate-400 text-xs mb-1">Room No.</div>
                    <div className="text-white font-bold text-lg">{currentRoom.roomNumber}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                    <div className="text-slate-400 text-xs mb-1">Type</div>
                    <div className="text-white font-bold text-lg">{currentRoom.roomType}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                    <div className="text-slate-400 text-xs mb-1">Floor</div>
                    <div className="text-white font-bold text-lg">{currentRoom.floor || "—"}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                    <div className="text-slate-400 text-xs mb-1">Rent</div>
                    <div className="text-white font-bold text-lg">₹{currentRoom.monthlyRent}</div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400">Could not load current room</div>
              )}
            </div>

            {/* Available Rooms */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Available Rooms
                <span className="ml-auto text-sm text-slate-400">
                  {availableRooms.length} rooms
                </span>
              </h2>

              {roomsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-24 bg-slate-700 rounded-xl"></div>
                  ))}
                </div>
              ) : availableRooms.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No available rooms found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRooms.map((room) => (
                    <button
                      key={room._id}
                      onClick={() => setSelectedRoom(room)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedRoom?._id === room._id
                          ? "border-blue-500 bg-blue-500/20"
                          : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-bold">Room {room.roomNumber}</div>
                          <div className="text-slate-400 text-sm">{room.roomType}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          room.availabilityStatus === "Available" 
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {room.availabilityStatus}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-white font-semibold">₹{room.monthlyRent}/mo</div>
                        <div className={`text-sm font-medium ${
                          room.rentDifference > 0 
                            ? "text-red-400" 
                            : room.rentDifference < 0 
                              ? "text-green-400" 
                              : "text-slate-400"
                        }`}>
                          {room.rentDifference > 0 
                            ? `+₹${room.rentDifference}` 
                            : room.rentDifference < 0 
                              ? `₹${room.rentDifference}` 
                              : "Same rent"}
                        </div>
                      </div>
                      <div className="text-slate-400 text-xs mt-2">
                        {room.availableBeds} of {room.totalBeds} beds available
                        {room.floor && ` • Floor ${room.floor}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Switch Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reason for Switch <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain why you want to switch rooms..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Preferred Date */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preferred Switch Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.preferredSwitchDate}
                  onChange={(e) => setFormData({ ...formData, preferredSwitchDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedRoom}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  loading || !selectedRoom
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Switch Request"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Switch History */}
        {activeTab === "history" && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
              My Switch Requests
            </h2>

            {switchesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse h-32 bg-slate-700 rounded-xl"></div>
                ))}
              </div>
            ) : mySwitches.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="text-5xl mb-4">📋</div>
                <p>No switch requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mySwitches.map((switchItem) => (
                  <div
                    key={switchItem._id}
                    className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <div className="text-white font-semibold">
                          {switchItem.switchNumber}
                        </div>
                        <div className="text-slate-400 text-sm">
                          Requested on {formatDate(switchItem.createdAt)}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(switchItem.status)}`}>
                        {switchItem.status}
                      </span>
                    </div>

                    {/* Room Switch Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-slate-400 text-xs mb-1">From Room</div>
                        <div className="text-white font-medium">
                          {switchItem.fromRoom?.roomNumber} ({switchItem.fromRoom?.roomType})
                        </div>
                        <div className="text-slate-400 text-sm">
                          ₹{switchItem.fromRoom?.monthlyRent}/mo
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-slate-400 text-xs mb-1">To Room</div>
                        <div className="text-white font-medium">
                          {switchItem.toRoom?.roomNumber} ({switchItem.toRoom?.roomType})
                        </div>
                        <div className="text-slate-400 text-sm">
                          ₹{switchItem.toRoom?.monthlyRent}/mo
                        </div>
                      </div>
                    </div>

                    {/* Rent Change */}
                    {switchItem.rentChange && (
                      <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                        <div className="text-slate-400 text-xs mb-2">Rent Change</div>
                        <div className="flex justify-between items-center">
                          <div className="text-white">
                            ₹{switchItem.rentChange.oldRent} → ₹{switchItem.rentChange.newRent}
                          </div>
                          <div className={`font-semibold ${
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
                    <div className="text-sm">
                      <div className="text-slate-400 mb-1">
                        <span className="font-medium">Reason:</span> {switchItem.reason}
                      </div>
                      <div className="text-slate-400">
                        <span className="font-medium">Preferred Date:</span> {formatDate(switchItem.preferredSwitchDate)}
                      </div>
                    </div>

                    {/* Property Info */}
                    {switchItem.propertyId && (
                      <div className="mt-4 pt-4 border-t border-slate-600/50">
                        <div className="text-slate-400 text-xs mb-1">Property</div>
                        <div className="text-white font-medium">
                          {switchItem.propertyId.title || "N/A"}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {switchItem.propertyId.location?.address}, {switchItem.propertyId.location?.city}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roomswitch;
