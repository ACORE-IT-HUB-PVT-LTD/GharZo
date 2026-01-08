import React from "react";
import { motion } from "framer-motion";
import { Home, Wallet, Wrench, Phone, Bell, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Card = ({ icon: Icon, title, desc, color, path }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.07, rotate: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(path)}
      className="cursor-pointer p-5 bg-white rounded-2xl shadow-xl flex flex-col items-center text-center hover:shadow-2xl transition"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Icon size={45} className={`${color} mb-3`} />
      </motion.div>
      <h2 className="font-semibold text-lg">{title}</h2>
      <p className="text-gray-600 text-sm">{desc}</p>
    </motion.div>
  );
};

const TenantDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-blue-100 p-6">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-6 text-center"
      >
        🏡 Tenant Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          icon={Home}
          title="My Propert"
          desc="View property details"
          color="text-indigo-500"
          path="/pm_tenant/property"
        />
      
      </div>
    </div>
  );
};

export default TenantDashboard;
