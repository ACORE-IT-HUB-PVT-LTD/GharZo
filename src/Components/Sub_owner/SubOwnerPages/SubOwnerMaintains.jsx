// src/Components/Sub_owner/SubOwnerPages/SubOwnerMaintains.jsx
import React from "react";

const requests = [
  { id: "M-201", requester: "Amit Sharma", property: "Happy Apartments", desc: "Pipe replacement", priority: "High", status: "Scheduled" },
  { id: "M-202", requester: "Neha Verma", property: "Sunset Villa", desc: "Light fixture", priority: "Low", status: "Pending" },
];

export default function SubOwnerMaintains() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Maintenance Requests</h1>
      <p className="text-gray-600 mb-4">Track and manage maintenance requests.</p>

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="bg-white rounded shadow p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{r.requester} — <span className="text-sm text-gray-500">{r.property}</span></div>
              <div className="text-sm text-gray-600">{r.desc}</div>
            </div>
            <div className="text-right">
              <div className="text-sm">Priority: <b>{r.priority}</b></div>
              <div className="text-sm text-gray-500">Status: {r.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
