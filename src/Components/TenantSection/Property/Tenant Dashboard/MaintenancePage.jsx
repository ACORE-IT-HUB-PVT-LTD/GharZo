import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function MaintenancePage() {
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const raiseRequest = async () => {
    try {
      setLoading(true);
      await axios.post("https://api.example.com/maintenance/request", {
        tenantId: "12345",
        issue,
      });
      setMsg("✅ Request submitted successfully!");
      setIssue("");
    } catch (err) {
      setMsg("❌ Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-50 to-amber-50 p-6">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Wrench size={40} className="text-yellow-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Maintenance Requests
          </h1>
        </div>

        <textarea
          placeholder="Describe your issue..."
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          className="w-full p-3 border rounded-xl mb-4"
        />

        <button
          onClick={raiseRequest}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Raise Request"}
        </button>

        {msg && <p className="mt-3 text-sm">{msg}</p>}

        <Link
          to="/tenant"
          className="mt-6 inline-block px-4 py-2 bg-gray-500 text-white rounded-xl shadow hover:bg-gray-600"
        >
          ⬅ Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
