import React from "react";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Phone size={40} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Important Contacts
          </h1>
        </div>

        <ul className="text-gray-700 space-y-2">
          <li>👨‍💼 Landlord: +91 9876543210</li>
          <li>🔧 Plumber: +91 9988776655</li>
          <li>⚡ Electrician: +91 7766554433</li>
          <li>🛡️ Security: +91 8899001122</li>
        </ul>

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
