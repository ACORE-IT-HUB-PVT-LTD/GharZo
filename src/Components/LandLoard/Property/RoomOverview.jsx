import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaDoorOpen, FaBed, FaMoneyBillWave, FaWarehouse, FaEdit, FaTrash,
  FaToggleOn, FaToggleOff, FaUsers, FaPlus, FaTimes, FaChevronDown,
  FaChevronUp, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle,
  FaExclamationTriangle, FaTools, FaBan, FaWindowMaximize, FaLock,
  FaSnowflake, FaBook, FaShower,
} from "react-icons/fa";
import { MdKingBed, MdBedroomParent } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

/* ─────────────────────────── helpers ─────────────────────────── */
const getToken = () => localStorage.getItem("usertoken");

const STATUS_CFG = {
  Available:           { bg: "bg-emerald-500",  dot: "bg-emerald-400", label: "Available" },
  "Partially-Occupied":{ bg: "bg-amber-500",    dot: "bg-amber-400",   label: "Partial"   },
  "Fully-Occupied":    { bg: "bg-rose-500",     dot: "bg-rose-400",    label: "Full"      },
  "Under-Maintenance": { bg: "bg-slate-500",    dot: "bg-slate-400",   label: "Maint."    },
  Blocked:             { bg: "bg-neutral-800",  dot: "bg-neutral-600", label: "Blocked"   },
  Occupied:            { bg: "bg-blue-500",     dot: "bg-blue-400",    label: "Occupied"  },
};

const FURNISH_CFG = {
  "Fully-Furnished": { bg: "bg-indigo-500", label: "Full" },
  "Semi-Furnished":  { bg: "bg-violet-500", label: "Semi" },
  Unfurnished:       { bg: "bg-gray-400",   label: "None" },
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CFG[status] || { bg: "bg-gray-400", label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${cfg.bg} text-white font-semibold rounded-full text-xs whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot || "bg-white/60"}`} />
      {cfg.label}
    </span>
  );
};

const FurnishPill = ({ furnishing }) => {
  const cfg = FURNISH_CFG[furnishing] || { bg: "bg-gray-400", label: furnishing };
  return (
    <span className={`inline-block px-2.5 py-1 ${cfg.bg} text-white font-semibold rounded-full text-xs`}>
      {cfg.label}
    </span>
  );
};

/* ─────────────────────────── main component ─────────────────────────── */
const RoomOverview = () => {
  const { id } = useParams();

  /* ── state ── */
  const [rooms, setRooms]             = useState([]);
  const [bedsByRoom, setBedsByRoom]   = useState({});
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterType, setFilterType]   = useState("ALL");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [expandedRooms, setExpandedRooms] = useState({});
  const [toggleLoading, setToggleLoading] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, type: null, parentRoomId: null });

  /* add-bed modal */
  const [bedModal, setBedModal]       = useState({ show: false, room: null });
  const [bedLoading, setBedLoading]   = useState(false);
  const [bedError, setBedError]       = useState(null);
  const [bedForm, setBedForm]         = useState(defaultBedForm());

  const API  = `${baseurl}api`;
  const RAPI = `${API}/rooms`;
  const BAPI = `${API}/beds`;

  /* ── fetch rooms ── */
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const token = getToken();
      if (!token) throw new Error("No auth token");

      const { data } = await axios.get(`${RAPI}/property/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const roomList = data.success ? (data.data || []) : [];
      setRooms(roomList);
      await fetchBeds(roomList, token);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch rooms.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchBeds = async (roomList, token) => {
    const map = {};
    await Promise.all(
      roomList.map(async (room) => {
        try {
          const { data } = await axios.get(`${BAPI}/room/${room._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          map[room._id] = data.success ? (data.data || []) : [];
        } catch {
          map[room._id] = [];
        }
      })
    );
    setBedsByRoom(map);
  };

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  /* ── room actions ── */
  const handleDeleteRoom = async (roomId) => {
    try {
      const { data } = await axios.delete(`${RAPI}/${roomId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (data.success) { fetchRooms(); closeDelete(); }
    } catch (e) { alert(e.response?.data?.message || "Failed to delete room"); }
  };

  const handleToggleStatus = async (roomId) => {
    setToggleLoading(roomId);
    try {
      const { data } = await axios.patch(`${RAPI}/${roomId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (data.success) fetchRooms();
    } catch (e) { alert(e.response?.data?.message || "Failed"); }
    finally { setToggleLoading(null); }
  };

  /* ── bed actions ── */
  const openBedModal = (room) => {
    const existingCount = bedsByRoom[room._id]?.length || 0;
    const capacity      = typeof room.capacity === 'number' ? room.capacity : (room.capacity?.totalBeds || room.totalBeds || 0);

    // Check capacity before opening
    if (capacity > 0 && existingCount >= capacity) {
      alert(`Room capacity reached! This room has a capacity of ${capacity} bed(s) and already has ${existingCount} bed(s). Please increase the room capacity first.`);
      return;
    }

    setBedError(null);
    setBedForm(defaultBedForm(`B${existingCount + 1}`));
    setBedModal({ show: true, room });
  };

  const closeBedModal = () => setBedModal({ show: false, room: null });

  const handleBedField = (path, val) => {
    const keys = path.split(".");
    setBedForm(prev => {
      if (keys.length === 1) return { ...prev, [keys[0]]: val };
      return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: val } };
    });
  };

  const handleSubmitBed = async (e) => {
    e.preventDefault();
    setBedLoading(true); setBedError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("No auth token");

      const room     = bedModal.room;
      const capacity = typeof room.capacity === 'number' ? room.capacity : (room.capacity?.totalBeds || room.totalBeds || 0);
      const existing = bedsByRoom[room._id]?.length || 0;

      if (capacity > 0 && existing >= capacity) {
        throw new Error(`Room capacity reached (${capacity}). Cannot add more beds.`);
      }

      const payload = {
        roomId:    room._id,
        bedNumber: bedForm.bedNumber,
        bedType:   bedForm.bedType,
        pricing: {
          rent:               Number(bedForm.pricing.rent) || 0,
          securityDeposit:    Number(bedForm.pricing.securityDeposit) || 0,
          maintenanceCharges: Number(bedForm.pricing.maintenanceCharges) || 0,
        },
        features:    bedForm.features,
        position:    bedForm.position,
        preferences: bedForm.preferences,
        bedSize: {
          length: Number(bedForm.bedSize.length) || 72,
          width:  Number(bedForm.bedSize.width) || 36,
          unit:   bedForm.bedSize.unit,
        },
        condition: bedForm.condition,
        notes:     bedForm.notes,
      };

      const { data } = await axios.post(`${BAPI}/create`, payload, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!data.success) throw new Error(data.message || "Failed to create bed");

      closeBedModal();
      await fetchRooms();
      // auto-expand that room
      setExpandedRooms(prev => ({ ...prev, [room._id]: true }));
    } catch (e) {
      setBedError(e.response?.data?.message || e.message || "Failed to create bed");
    } finally {
      setBedLoading(false);
    }
  };

  const handleToggleBedStatus = async (bedId, roomId) => {
    setToggleLoading(bedId);
    try {
      const { data } = await axios.patch(`${BAPI}/${bedId}/status`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (data.success) await fetchBeds(rooms, getToken());
    } catch (e) { alert(e.response?.data?.message || "Failed"); }
    finally { setToggleLoading(null); }
  };

  const handleDeleteBed = async (bedId) => {
    try {
      const { data } = await axios.delete(`${BAPI}/${bedId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (data.success) { await fetchRooms(); closeDelete(); }
    } catch (e) { alert(e.response?.data?.message || "Failed to delete bed"); }
  };

  /* ── ui helpers ── */
  const toggleExpand = (roomId) =>
    setExpandedRooms(prev => ({ ...prev, [roomId]: !prev[roomId] }));

  const openDelete = (type, itemId, parentRoomId = null) =>
    setDeleteModal({ show: true, type, id: itemId, parentRoomId });

  const closeDelete = () =>
    setDeleteModal({ show: false, id: null, type: null, parentRoomId: null });

  /* ── stats ── */
  const totalBeds    = Object.values(bedsByRoom).reduce((s, b) => s + b.length, 0);
  const vacantRooms  = rooms.filter(r => r.availability?.status === "Available").length;
  const occupiedBeds = Object.values(bedsByRoom).reduce(
    (s, b) => s + b.filter(bed => bed.status === "Occupied").length, 0
  );

  const STATS = [
    { label: "Total Rooms",   value: rooms.length, icon: <FaWarehouse />,    color: "from-[#003366] to-[#004999]", filter: "ALL" },
    { label: "Total Beds",    value: totalBeds,     icon: <MdKingBed />,      color: "from-slate-600 to-slate-800",  filter: "ALL" },
    { label: "Vacant Rooms",  value: vacantRooms,   icon: <FaCheckCircle />,  color: "from-[#FF6B35] to-[#e05520]", filter: "VACANT" },
    { label: "Occupied Beds", value: occupiedBeds,  icon: <FaUsers />,        color: "from-emerald-500 to-emerald-700", filter: "OCCUPIED" },
  ];

  /* ── filter ── */
  const filtered = rooms
    .filter(r =>
      !searchTerm ||
      r.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomType?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(r => {
      if (filterType === "VACANT")   return r.availability?.status === "Available";
      if (filterType === "OCCUPIED") return (bedsByRoom[r._id]?.filter(b => b.status === "Occupied").length || 0) > 0;
      return true;
    });

  /* ── render ── */
  return (
    <div className="p-4 sm:p-6 w-full bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen rounded-2xl shadow-2xl border border-[#FF6B35]/20">

      {/* Header */}
      <motion.div className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h3 className="text-xl sm:text-2xl font-bold text-[#003366] flex items-center gap-3">
          <span className="w-1.5 h-7 bg-[#FF6B35] rounded-full" />
          Room & Bed Overview
        </h3>
        <Link to={`/landlord/property/${id}/add-room`}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#004999] text-white px-4 py-2.5 rounded-xl shadow-md text-sm font-semibold">
            <FaDoorOpen /> Add Room
          </motion.button>
        </Link>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-300 text-red-700 rounded-xl flex items-center gap-2 text-sm">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        {STATS.map((s, i) => (
          <motion.div key={i} onClick={() => setFilterType(s.filter)}
            className={`cursor-pointer bg-gradient-to-br ${s.color} text-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl transition-all border border-white/10 ${filterType === s.filter ? "ring-2 ring-white/50" : ""}`}
            whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="text-3xl sm:text-4xl mb-2 flex justify-center opacity-90">{s.icon}</div>
            <div className="text-2xl sm:text-3xl font-bold">{s.value}</div>
            <div className="text-xs sm:text-sm opacity-80 mt-0.5 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <motion.div className="mb-5 flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by room number or type…"
            className="w-full pl-10 pr-4 py-2.5 border-2 border-[#FF6B35]/40 bg-white text-[#003366] rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none shadow-sm text-sm font-medium placeholder-gray-400" />
        </div>
        {filterType !== "ALL" && (
          <button onClick={() => setFilterType("ALL")}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
            <FaTimes /> Clear Filter
          </button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        {loading ? (
          <div className="text-center py-16">
            <div className="border-t-4 border-[#FF6B35] w-10 h-10 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-medium">Loading rooms…</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#003366] to-[#004999] text-white text-xs uppercase tracking-wide">
                <th className="px-3 py-4 w-10" />
                <th className="px-4 py-4 text-left">Room</th>
                <th className="px-4 py-4 text-left">Type</th>
                <th className="px-4 py-4 text-center">Floor</th>
                <th className="px-4 py-4 text-center">Capacity</th>
                <th className="px-4 py-4 text-center">Beds</th>
                <th className="px-4 py-4 text-center">Occupied</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Rent/Bed</th>
                <th className="px-4 py-4 text-center">Furnish</th>
                <th className="px-4 py-4 text-center">Active</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-14 text-gray-400">
                    <FaWarehouse className="mx-auto text-4xl mb-3 opacity-30" />
                    <p className="font-medium">No rooms found</p>
                  </td>
                </tr>
              ) : filtered.map((room, idx) => {
                const beds       = bedsByRoom[room._id] || [];
                const capacity   = typeof room.capacity === 'number' ? room.capacity : (room.capacity?.totalBeds || room.totalBeds || 0);
                const occupied   = beds.filter(b => b.status === "Occupied").length;
                const isFull     = capacity > 0 && beds.length >= capacity;
                const isExpanded = expandedRooms[room._id];

                return (
                  <React.Fragment key={room._id || idx}>
                    <motion.tr
                      className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${isExpanded ? "bg-blue-50/30" : ""}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}>
                      {/* expand toggle */}
                      <td className="px-3 py-3.5 text-center">
                        <button onClick={() => toggleExpand(room._id)}
                          className="p-1.5 bg-[#003366] text-white rounded-lg hover:bg-[#004999] transition-colors">
                          {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#003366]">{room.roomNumber || "-"}</td>
                      <td className="px-4 py-3.5 text-gray-600">{room.roomType || "-"}</td>
                      <td className="px-4 py-3.5 text-center text-gray-600">{room.floor ?? "-"}</td>
                      {/* capacity */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-bold text-sm ${isFull ? "text-rose-500" : "text-[#003366]"}`}>
                          {capacity || "—"}
                        </span>
                      </td>
                      {/* beds count */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-[#003366]">{beds.length}</span>
                        {isFull && (
                          <span className="ml-1 text-xs text-rose-500 font-medium">(Full)</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-bold ${occupied > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                          {occupied}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center"><StatusPill status={room.availability?.status} /></td>
                      <td className="px-4 py-3.5 text-center font-bold text-[#003366]">
                        ₹{room.pricing?.rentPerBed || room.pricing?.rentPerRoom || 0}
                      </td>
                      <td className="px-4 py-3.5 text-center"><FurnishPill furnishing={room.features?.furnishing} /></td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${room.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Add Bed */}
                          <motion.button whileTap={{ scale: 0.92 }}
                            onClick={() => openBedModal(room)}
                            disabled={isFull}
                            title={isFull ? "Room capacity reached" : "Add Bed"}
                            className={`p-2 rounded-lg text-white shadow-sm transition-all text-xs font-semibold ${isFull ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"}`}>
                            <FaPlus />
                          </motion.button>
                          {/* Edit Room */}
                          <Link to={`/landlord/property/${id}/add-room?roomId=${room._id}`}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm" title="Edit Room">
                            <FaEdit />
                          </Link>
                          {/* Toggle Active */}
                          <button onClick={() => handleToggleStatus(room._id)}
                            disabled={toggleLoading === room._id}
                            title="Toggle Active"
                            className={`p-2 rounded-lg text-white shadow-sm transition-all ${room.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "bg-gray-400 hover:bg-gray-500"} disabled:opacity-50`}>
                            {toggleLoading === room._id
                              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : room.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                          {/* Delete Room */}
                          <button onClick={() => openDelete("room", room._id)}
                            className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all shadow-sm" title="Delete Room">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* ── Expanded beds ── */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr key={`exp-${room._id}`}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="bg-slate-50">
                          <td colSpan="12" className="px-4 py-4">
                            <div className="bg-white rounded-2xl p-4 shadow-inner border border-gray-100">
                              {/* beds header */}
                              <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                                <div className="flex items-center gap-2">
                                  <MdKingBed className="text-[#003366] text-xl" />
                                  <h4 className="font-bold text-[#003366]">
                                    Beds — Room {room.roomNumber}
                                  </h4>
                                  {capacity > 0 && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                      {beds.length} / {capacity} capacity
                                    </span>
                                  )}
                                </div>
                                <button onClick={() => openBedModal(room)} disabled={isFull}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all ${isFull ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"}`}>
                                  <FaPlus /> {isFull ? "Capacity Full" : "Add Bed"}
                                </button>
                              </div>

                              {/* capacity warning */}
                              {isFull && (
                                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-sm text-amber-700">
                                  <FaExclamationTriangle />
                                  <span>Room capacity reached ({capacity}/{capacity}). Edit the room to increase capacity before adding more beds.</span>
                                </div>
                              )}

                              {beds.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                  {beds.map(bed => <BedCard key={bed._id} bed={bed} roomId={room._id}
                                    toggleLoading={toggleLoading}
                                    onToggle={handleToggleBedStatus}
                                    onDelete={() => openDelete("bed", bed._id, room._id)} />)}
                                </div>
                              ) : (
                                <div className="text-center py-10">
                                  <MdKingBed className="text-5xl text-gray-200 mx-auto mb-3" />
                                  <p className="text-gray-400 text-sm">No beds added yet</p>
                                  {!isFull && (
                                    <button onClick={() => openBedModal(room)}
                                      className="mt-3 text-[#FF6B35] text-sm font-semibold hover:underline flex items-center gap-1 mx-auto">
                                      <FaPlus size={10} /> Add first bed
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* ── Add Bed Modal ── */}
      <AnimatePresence>
        {bedModal.show && bedModal.room && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeBedModal}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              onClick={e => e.stopPropagation()}>

              {/* modal header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#003366] to-[#004999] rounded-t-2xl">
                <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                  <MdKingBed /> Add Bed — Room {bedModal.room.roomNumber}
                </h3>
                <button onClick={closeBedModal} className="text-white/70 hover:text-white transition-colors">
                  <FaTimes />
                </button>
              </div>

              {/* capacity info bar */}
              {(() => {
                const cap = typeof bedModal.room.capacity === 'number' ? bedModal.room.capacity : (bedModal.room.capacity?.totalBeds || bedModal.room.totalBeds || 0);
                const cur = bedsByRoom[bedModal.room._id]?.length || 0;
                if (!cap) return null;
                return (
                  <div className={`px-6 py-2.5 text-sm font-medium flex items-center gap-2 ${cur >= cap ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                    <FaBed />
                    Beds: {cur} / {cap} capacity slots used
                  </div>
                );
              })()}

              {bedError && (
                <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                  <FaExclamationTriangle /> {bedError}
                </div>
              )}

              {/* modal form */}
              <form onSubmit={handleSubmitBed} className="overflow-y-auto flex-1">
                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <Field label="Bed Number *">
                    <input required value={bedForm.bedNumber}
                      onChange={e => handleBedField("bedNumber", e.target.value)}
                      placeholder="e.g. B1" className={inputCls} />
                  </Field>

                  <Field label="Bed Type *">
                    <select value={bedForm.bedType} onChange={e => handleBedField("bedType", e.target.value)} className={inputCls}>
                      {["Single","Double","Queen","King"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>

                  <Field label="Monthly Rent (₹) *">
                    <input required type="number" min="0" value={bedForm.pricing.rent}
                      onChange={e => handleBedField("pricing.rent", e.target.value)}
                      placeholder="e.g. 8000" className={inputCls} />
                  </Field>

                  <Field label="Security Deposit (₹)">
                    <input type="number" min="0" value={bedForm.pricing.securityDeposit}
                      onChange={e => handleBedField("pricing.securityDeposit", e.target.value)}
                      placeholder="e.g. 10000" className={inputCls} />
                  </Field>

                  <Field label="Maintenance Charges (₹)">
                    <input type="number" min="0" value={bedForm.pricing.maintenanceCharges}
                      onChange={e => handleBedField("pricing.maintenanceCharges", e.target.value)}
                      placeholder="e.g. 500" className={inputCls} />
                  </Field>

                  <Field label="Condition">
                    <select value={bedForm.condition} onChange={e => handleBedField("condition", e.target.value)} className={inputCls}>
                      {["New","Excellent","Good","Fair","Poor"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>

                  <Field label="Gender Preference">
                    <select value={bedForm.preferences.genderPreference}
                      onChange={e => handleBedField("preferences.genderPreference", e.target.value)} className={inputCls}>
                      {["Any","Male","Female"].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </Field>

                  <Field label="Occupation Type">
                    <select value={bedForm.preferences.occupationType}
                      onChange={e => handleBedField("preferences.occupationType", e.target.value)} className={inputCls}>
                      {["Any","Working Professional","Student","Both"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </Field>

                  {/* Bed Size */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Bed Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" value={bedForm.bedSize.length}
                        onChange={e => handleBedField("bedSize.length", e.target.value)}
                        placeholder="Length" className={inputCls} />
                      <input type="number" value={bedForm.bedSize.width}
                        onChange={e => handleBedField("bedSize.width", e.target.value)}
                        placeholder="Width" className={inputCls} />
                      <select value={bedForm.bedSize.unit} onChange={e => handleBedField("bedSize.unit", e.target.value)} className={inputCls}>
                        {["inches","feet","cm"].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Position</label>
                    <div className="flex flex-wrap gap-4 mb-2">
                      {[["nearWindow","Near Window"],["cornerBed","Corner Bed"]].map(([k, lbl]) => (
                        <label key={k} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                          <input type="checkbox" checked={bedForm.position[k]}
                            onChange={() => setBedForm(prev => ({ ...prev, position: { ...prev.position, [k]: !prev.position[k] } }))}
                            className="w-4 h-4 accent-[#FF6B35]" />
                          {lbl}
                        </label>
                      ))}
                    </div>
                    <input value={bedForm.position.description}
                      onChange={e => handleBedField("position.description", e.target.value)}
                      placeholder="Position description…" className={inputCls} />
                  </div>

                  {/* Features */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Features</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FEATURE_LIST.map(({ key, label, icon }) => (
                        <label key={key} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm ${bedForm.features[key] ? "border-[#FF6B35] bg-orange-50 text-[#FF6B35]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                          <input type="checkbox" checked={bedForm.features[key]}
                            onChange={() => setBedForm(prev => ({ ...prev, features: { ...prev.features, [key]: !prev.features[key] } }))}
                            className="sr-only" />
                          <span className="text-base">{icon}</span>
                          <span className="font-medium text-xs">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Notes</label>
                    <textarea value={bedForm.notes} onChange={e => handleBedField("notes", e.target.value)}
                      rows={2} placeholder="Any additional notes…"
                      className={`${inputCls} resize-none`} />
                  </div>
                </div>

                {/* modal footer */}
                <div className="px-6 pb-6 flex gap-3">
                  <button type="button" onClick={closeBedModal}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={bedLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-colors font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                    {bedLoading
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
                      : <><FaPlus /> Add Bed</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeDelete}>
            <motion.div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-rose-500 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-1">
                Delete {deleteModal.type === "bed" ? "Bed" : "Room"}?
              </h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={closeDelete}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm">
                  Cancel
                </button>
                <button onClick={() => {
                  if (deleteModal.type === "bed") handleDeleteBed(deleteModal.id);
                  else handleDeleteRoom(deleteModal.id);
                }}
                  className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors font-semibold text-sm">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────── BedCard ─────────────────────────── */
const BedCard = ({ bed, roomId, toggleLoading, onToggle, onDelete }) => {
  const isOccupied = bed.status === "Occupied";
  return (
    <div className="bg-white rounded-xl p-3.5 border-2 border-gray-100 hover:border-[#FF6B35]/40 transition-all shadow-sm">
      <div className="flex justify-between items-start mb-2.5">
        <div>
          <p className="font-bold text-[#003366] text-base leading-tight">{bed.bedNumber}</p>
          <p className="text-xs text-gray-400">{bed.bedType}</p>
        </div>
        <StatusPill status={bed.status} />
      </div>
      <div className="space-y-1 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Rent</span>
          <span className="font-bold text-[#003366]">₹{bed.pricing?.rent || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Deposit</span>
          <span className="font-semibold text-gray-600">₹{bed.pricing?.securityDeposit || 0}</span>
        </div>
      </div>
      {/* feature chips */}
      {bed.features && (
        <div className="flex flex-wrap gap-1 mb-3">
          {FEATURE_LIST.filter(f => bed.features[f.key]).map(f => (
            <span key={f.key} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
              {f.label}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button onClick={() => onToggle(bed._id, roomId)} disabled={toggleLoading === bed._id}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${isOccupied ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}>
          {toggleLoading === bed._id
            ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
            : isOccupied ? "→ Available" : "→ Occupied"}
        </button>
        <button onClick={onDelete} className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-all">
          <FaTrash size={11} />
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────── small helpers ─────────────────────────── */
const inputCls = "w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none text-sm transition-colors bg-white";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const FEATURE_LIST = [
  { key: "hasAC",              label: "AC",            icon: <FaSnowflake /> },
  { key: "hasAttachedBathroom",label: "Bathroom",      icon: <FaShower /> },
  { key: "hasLocker",          label: "Locker",        icon: <FaLock /> },
  { key: "hasStudyTable",      label: "Study Table",   icon: <FaBook /> },
  { key: "hasWardrobe",        label: "Wardrobe",      icon: <MdBedroomParent /> },
];

const defaultBedForm = (bedNumber = "B1") => ({
  bedNumber,
  bedType: "Single",
  pricing: { rent: "", securityDeposit: "", maintenanceCharges: "" },
  features: { hasAC: false, hasAttachedBathroom: false, hasLocker: false, hasStudyTable: false, hasWardrobe: false },
  position: { nearWindow: false, cornerBed: false, description: "" },
  preferences: { genderPreference: "Any", occupationType: "Any" },
  bedSize: { length: "72", width: "36", unit: "inches" },
  condition: "Good",
  notes: "",
});

export default RoomOverview;