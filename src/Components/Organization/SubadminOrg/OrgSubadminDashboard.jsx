import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubAdminList from "./OrgSubadminlist";
import AddSubAdmin from "./OrgAddSubadmin";
import AddPermission from "./OrgSubadminPermission";

function OrgSubadminDashboard() {
  const [activeTab, setActiveTab] = useState("list");

  const handlePermissionAdded = (permission) => {
    // You can add logic here to update state or refresh permission list if needed
    console.log("Permission added:", permission);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-50 to-teal-100 py-6 px-4">
      <ToastContainer />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-500 via-teal-400 to-green-400 bg-clip-text text-transparent mb-6">
          Organization Sub-Admin Management
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-5 py-2 rounded-l-lg font-semibold transition-all duration-300 shadow-md ${
              activeTab === "list"
                ? "bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Sub-Admin List
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`px-5 py-2 font-semibold transition-all duration-300 shadow-md ${
              activeTab === "add"
                ? "bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Add Sub-Admin
          </button>
          <button
            onClick={() => setActiveTab("add-permission")}
            className={`px-5 py-2 rounded-r-lg font-semibold transition-all duration-300 shadow-md ${
              activeTab === "add-permission"
                ? "bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Add Permission
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "list" ? (
          <SubAdminList />
        ) : activeTab === "add" ? (
          <AddSubAdmin />
        ) : (
          <AddPermission onPermissionAdded={handlePermissionAdded} />
        )}
      </div>
    </div>
  );
}

export default OrgSubadminDashboard;