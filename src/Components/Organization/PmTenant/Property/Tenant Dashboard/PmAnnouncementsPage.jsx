import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    axios
      .get("https://api.example.com/announcements")
      .then((res) => setAnnouncements(res.data))
      .catch(() => setAnnouncements([]));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-red-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Bell size={40} className="text-red-600" />
          <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
        </div>

        {announcements.length > 0 ? (
          <ul className="text-gray-700 space-y-3">
            {announcements.map((a, i) => (
              <li key={i}>📢 {a.message}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No announcements available</p>
        )}

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
