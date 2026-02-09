import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ChevronDown, Plus, Search, Phone, Mail, Calendar, Clock, AlertCircle, Loader } from "lucide-react";

const WORKER_TYPES = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Cleaner",
  "Painter",
  "General Maintenance",
  "AC Repair",
  "Appliance Repair",
  "Pest Control",
  "Other",
];

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Workers = () => {
  const [properties, setProperties] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ status: "Active", workerType: "" });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({
    complaintId: "",
    estimatedTime: "60",
    notes: "",
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    workerType: "Plumber",
    specialization: "",
    experienceYears: "",
    experienceDescription: "",
    assignedProperties: [],
    hasFullPropertyAccess: false,
    availabilityStatus: "Available",
    workingDays: [],
    workingFrom: "09:00",
    workingTo: "18:00",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });

  const token = localStorage.getItem("usertoken");

  useEffect(() => {
    fetchProperties();
    fetchWorkers();
    fetchComplaints();
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [filters]);

  async function fetchProperties() {
    try {
      const res = await fetch("https://api.gharzoreality.com/api/v2/properties/my-properties", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProperties(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load properties");
    }
  }

  async function fetchWorkers() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (filters.status) q.set("status", filters.status);
      if (filters.workerType) q.set("workerType", filters.workerType);
      q.set("page", "1");
      q.set("limit", "50");
      
      const res = await fetch(`https://api.gharzoreality.com/api/workers/my-workers?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setWorkers(data.data || []);
      } else {
        setWorkers([]);
        toast.error(data.message || "Failed to load workers");
      }
    } catch (err) {
      console.error(err);
      setWorkers([]);
      toast.error("Network error while fetching workers");
    } finally {
      setLoading(false);
    }
  }

  async function fetchComplaints() {
    try {
      // Use landlord complaints endpoint to get all pending complaints for landlord
      const q = new URLSearchParams();
      q.set("status", "Pending");
      q.set("page", "1");
      const url = `https://api.gharzoreality.com/api/complaints/landlord/all-complaints?${q.toString()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // landlord endpoint returns data.data as array; if nested under data.docs adapt accordingly
        setComplaints(data.data || data.docs || []);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      setComplaints([]);
    }
  }

  function openAssignModal(worker) {
    setSelectedWorker(worker);
    setAssignForm({
      complaintId: "",
      estimatedTime: "60",
      notes: "",
    });
    // refresh latest pending complaints before opening
    fetchComplaints();
    setShowAssignModal(true);
  }

  function closeAssignModal() {
    setShowAssignModal(false);
    setSelectedWorker(null);
    setAssignForm({
      complaintId: "",
      estimatedTime: "60",
      notes: "",
    });
  }

  async function handleAssignComplaint(e) {
    e.preventDefault();

    if (!assignForm.complaintId || !selectedWorker) {
      toast.error("Please select a complaint");
      return;
    }

    setAssignLoading(true);
    try {
      const res = await fetch(
        `https://api.gharzoreality.com/api/complaints/${assignForm.complaintId}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            workerId: selectedWorker._id,
            estimatedTime: Number(assignForm.estimatedTime),
            notes: assignForm.notes,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        // show success, refresh complaints and workers to reflect assignment
        toast.success(data.message || "Complaint assigned to worker successfully");
        closeAssignModal();
        // refresh list of pending complaints and workers
        fetchComplaints();
        fetchWorkers();
      } else {
        toast.error(data.message || "Failed to assign complaint");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while assigning complaint");
    } finally {
      setAssignLoading(false);
    }
  }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (name === "assignedProperties") {
      const opts = Array.from(e.target.selectedOptions || []).map((o) => o.value);
      setForm((s) => ({ ...s, assignedProperties: opts }));
      return;
    }
    
    if (name === "workingDays") {
      const opts = Array.from(e.target.selectedOptions || []).map((o) => o.value);
      setForm((s) => ({ ...s, workingDays: opts }));
      return;
    }
    
    if (type === "checkbox") {
      setForm((s) => ({ ...s, [name]: checked }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  }

  function resetForm() {
    setForm({
      name: "",
      phone: "",
      email: "",
      workerType: "Plumber",
      specialization: "",
      experienceYears: "",
      experienceDescription: "",
      assignedProperties: [],
      hasFullPropertyAccess: false,
      availabilityStatus: "Available",
      workingDays: [],
      workingFrom: "09:00",
      workingTo: "18:00",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelation: "",
    });
  }

  async function handleCreate(e) {
    e.preventDefault();
    
    if (!form.name || !form.phone) {
      toast.error("Name and phone are required");
      return;
    }

    setCreating(true);
    try {
      const body = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        workerType: form.workerType,
        specialization: form.specialization 
          ? form.specialization.split(",").map(s => s.trim()).filter(s => s)
          : [],
        experience: {
          years: Number(form.experienceYears) || 0,
          description: form.experienceDescription,
        },
        assignedProperties: form.assignedProperties,
        hasFullPropertyAccess: form.hasFullPropertyAccess,
        availability: {
          status: form.availabilityStatus,
          workingDays: form.workingDays,
          workingHours: { from: form.workingFrom, to: form.workingTo },
        },
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
          relation: form.emergencyRelation,
        },
      };

      const res = await fetch("https://api.gharzoreality.com/api/workers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message || "Worker created successfully!");
        resetForm();
        setShowForm(false);
        fetchWorkers();
      } else {
        toast.error(data.message || "Failed to create worker");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while creating worker");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8 lg:ml-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Workers Management</h1>
          <p className="text-slate-600">Manage and organize your service workers efficiently</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-slate-700 mb-2">Worker Type</label>
              <select
                value={filters.workerType}
                onChange={(e) => setFilters((f) => ({ ...f, workerType: e.target.value }))}
                className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Types</option>
                {WORKER_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchWorkers()}
              className="mt-auto w-full sm:w-auto px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors duration-200"
            >
              Refresh
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-auto w-full sm:w-auto ml-0 sm:ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add Worker
            </button>
          </div>
        </div>

        {/* Create Form Modal/Section */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-5xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Create New Worker</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Full Name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    required
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="Phone Number"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="Email Address"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Worker Type & Specialization */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Professional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    name="workerType"
                    value={form.workerType}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {WORKER_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    name="specialization"
                    value={form.specialization}
                    onChange={handleFormChange}
                    placeholder="Specializations (comma separated)"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <input
                    name="experienceYears"
                    type="number"
                    min="0"
                    value={form.experienceYears}
                    onChange={handleFormChange}
                    placeholder="Years of Experience"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    name="experienceDescription"
                    value={form.experienceDescription}
                    onChange={handleFormChange}
                    placeholder="Experience description"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Assignments & Access */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Property Assignment</h3>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Properties</label>
                <select
                  name="assignedProperties"
                  multiple
                  value={form.assignedProperties}
                  onChange={handleFormChange}
                  className="w-full h-32 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {properties.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title || `${p._id} - ${p.location?.address || "No address"}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">Hold Ctrl/Cmd to select multiple properties</p>

                <label className="flex items-center gap-3 mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    name="hasFullPropertyAccess"
                    checked={form.hasFullPropertyAccess}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-medium text-slate-700">Grant full access to all properties</span>
                </label>
              </div>

              {/* Working Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Working Schedule</h3>
                <label className="block text-sm font-medium text-slate-700 mb-2">Available Days</label>
                <select
                  name="workingDays"
                  multiple
                  value={form.workingDays}
                  onChange={handleFormChange}
                  className="w-full h-28 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white mb-4"
                >
                  {WEEK_DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mb-4">Hold Ctrl/Cmd to select multiple days</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Working From</label>
                    <input
                      name="workingFrom"
                      type="time"
                      value={form.workingFrom}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Working To</label>
                    <input
                      name="workingTo"
                      type="time"
                      value={form.workingTo}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    name="emergencyName"
                    placeholder="Contact Name"
                    value={form.emergencyName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    name="emergencyPhone"
                    placeholder="Contact Phone"
                    value={form.emergencyPhone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    name="emergencyRelation"
                    placeholder="Relationship"
                    value={form.emergencyRelation}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 sm:flex-none px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader size={18} className="animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> Create Worker
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="flex-1 sm:flex-none px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* Assign Complaint Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">Assign Complaint</h2>
                <button
                  onClick={closeAssignModal}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAssignComplaint} className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Assigning to: <span className="font-bold text-blue-600">{selectedWorker?.name}</span>
                  </p>
                  <p className="text-sm text-slate-600 mb-1">Type: {selectedWorker?.workerType}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Complaint</label>
                  <select
                    value={assignForm.complaintId}
                    onChange={(e) =>
                      setAssignForm((f) => ({ ...f, complaintId: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Select a complaint --</option>
                    {complaints
                      .filter((c) => c.status === "Pending")
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.complaintNumber} - {c.title} ({c.category})
                        </option>
                      ))}
                  </select>
                  {complaints.filter((c) => c.status === "Pending").length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">No pending complaints available</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Time (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={assignForm.estimatedTime}
                    onChange={(e) =>
                      setAssignForm((f) => ({ ...f, estimatedTime: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={assignForm.notes}
                    onChange={(e) =>
                      setAssignForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    placeholder="Add notes for the worker (e.g., special instructions)"
                    rows="3"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={assignLoading}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {assignLoading ? (
                      <>
                        <Loader size={16} className="animate-spin" /> Assigning...
                      </>
                    ) : (
                      "Assign"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeAssignModal}
                    className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Workers List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Workers List</h2>
              {loading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader size={18} className="animate-spin" />
                  <span className="text-sm font-medium">Loading...</span>
                </div>
              )}
            </div>
          </div>

          {workers.length === 0 && !loading ? (
            <div className="p-8 text-center">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 text-lg">No workers found for selected filters.</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or create a new worker.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
              {workers.map((w) => (
                <div
                  key={w._id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200 bg-gradient-to-br from-slate-50 to-slate-100"
                >
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">{w.name}</h3>
                      <p className="text-blue-600 font-medium text-sm">{w.workerType}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                        w.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone size={16} className="text-slate-500" />
                      <a href={`tel:${w.phone}`} className="text-sm hover:text-blue-600 transition-colors">
                        {w.phone}
                      </a>
                    </div>
                    {w.email && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail size={16} className="text-slate-500" />
                        <a href={`mailto:${w.email}`} className="text-sm hover:text-blue-600 transition-colors truncate">
                          {w.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Working Hours */}
                  {w.availability?.workingHours && (
                    <div className="mb-3 p-2 bg-white rounded border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-700 text-sm">
                        <Clock size={14} className="text-slate-500" />
                        <span>
                          {w.availability.workingHours.from} - {w.availability.workingHours.to}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Working Days */}
                  {w.availability?.workingDays?.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-slate-600 mb-1">Working Days:</div>
                      <div className="flex flex-wrap gap-1">
                        {w.availability.workingDays.map((day) => (
                          <span
                            key={day}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                          >
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assigned Properties */}
                  {w.assignedProperties?.length > 0 && (
                    <div className="p-2 bg-amber-50 rounded border border-amber-200">
                      <div className="text-xs font-semibold text-amber-900 mb-1">Assigned Properties:</div>
                      <p className="text-xs text-amber-800">
                        {w.assignedProperties.map(p => p.title || p._id).join(", ")}
                      </p>
                    </div>
                  )}

                  {w.hasFullPropertyAccess && (
                    <div className="mt-2 px-2 py-1 bg-purple-100 rounded border border-purple-200">
                      <p className="text-xs font-semibold text-purple-800">✓ Full Property Access</p>
                    </div>
                  )}

                  {/* Assign Complaint Button */}
                  <button
                    onClick={() => openAssignModal(w)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors duration-200"
                  >
                    Assign Complaint
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workers;