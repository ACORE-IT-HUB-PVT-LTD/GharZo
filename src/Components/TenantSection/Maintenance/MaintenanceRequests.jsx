import React, { useState } from "react";
import { Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";

const TenantMaintenance = () => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [requests, setRequests] = useState([
    {
      title: "Leaky tap in bathroom",
      description: "Water keeps dripping, even after turning off.",
      status: "Pending",
      date: "2025-07-25",
    },
    {
      title: "Broken light in room",
      description: "Tube light not working in my room.",
      status: "Resolved",
      date: "2025-06-18",
    },
  ]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      ...formData,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };
    setRequests((prev) => [newRequest, ...prev]);
    setFormData({ title: "", description: "" });
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-center bg-gray-800 text-transparent bg-clip-text drop-shadow-md">
        <Wrench className="inline-block mr-2 text-blue-600" size={28} />
        Maintenance Requests
      </h2>

      {/* Request Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-10 transform transition hover:scale-[1.01]"
      >
        <div className="mb-4">
          <label className="block mb-2 text-white font-semibold">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="e.g. Water leakage"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-white font-semibold">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Describe the issue in detail..."
          />
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transform transition"
        >
          Submit Request
        </button>
      </form>

      {/* Request List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-white text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <tr
                key={index}
                className="border-t hover:bg-blue-50 transition duration-300"
              >
                <td className="px-4 py-3 font-medium">{req.title}</td>
                <td className="px-4 py-3">{req.description}</td>
                <td className="px-4 py-3">{req.date}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  {req.status === "Resolved" ? (
                    <CheckCircle2
                      size={18}
                      className="text-green-600 drop-shadow"
                    />
                  ) : (
                    <AlertTriangle
                      size={18}
                      className="text-orange-500 drop-shadow"
                    />
                  )}
                  <span
                    className={`font-semibold ${
                      req.status === "Resolved"
                        ? "text-green-600"
                        : "text-orange-500"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray-400 py-6">
                  No requests yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantMaintenance;
