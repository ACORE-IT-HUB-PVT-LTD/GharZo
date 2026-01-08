import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Trash2, RefreshCcw, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function LeasePage() {
  const [downloading, setDownloading] = useState(false);
  const [documents, setDocuments] = useState({});
  const [extraDocs, setExtraDocs] = useState([]);

  const downloadAgreement = async () => {
    try {
      setDownloading(true);
      const res = await axios.get("https://api.example.com/lease/download", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "LeaseAgreement.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("❌ Failed to download agreement");
    } finally {
      setDownloading(false);
    }
  };

  // Handle Upload
  const handleUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setDocuments((prev) => ({ ...prev, [type]: { file, previewUrl } }));
    }
  };

  // Handle Delete
  const handleDelete = (type) => {
    setDocuments((prev) => ({ ...prev, [type]: null }));
  };

  const renderUploadBox = (label, type) => {
    const doc = documents[type];
    return (
      <div className="relative group border rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
        {doc ? (
          <>
            {/* Preview */}
            <img
              src={doc.previewUrl}
              alt="preview"
              className="w-full h-40 object-cover rounded-lg"
            />
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition">
              <label className="cursor-pointer flex items-center gap-1 px-3 py-1 bg-white text-sm rounded-lg shadow">
                <RefreshCcw size={16} /> Change
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleUpload(e, type)}
                />
              </label>
              <button
                onClick={() => handleDelete(type)}
                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded-lg shadow"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center text-gray-600">
            <Upload size={30} className="mb-2 text-purple-500" />
            <span className="text-sm">{label}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleUpload(e, type)}
            />
          </label>
        )}
      </div>
    );
  };

  const defaultDocs = [
    { label: "Aadhaar Card Front", type: "aadhaarFront" },
    { label: "Aadhaar Card Back", type: "aadhaarBack" },
    { label: "PAN Card", type: "panCard" },
    { label: "Voter ID", type: "voterId" },
    { label: "Driving License", type: "drivingLicense" },
    { label: "Passport", type: "passport" },
    { label: "College / Job ID Front", type: "collegeFront" },
    { label: "College / Job ID Back", type: "collegeBack" },
    { label: "Passport Size Photo", type: "photo" },
    { label: "Lease Agreement Photo", type: "leasePhoto" },
    { label: "Rent Receipt", type: "rentReceipt" },
    { label: "Utility Bill", type: "utilityBill" },
  ];

  const addMoreDocument = () => {
    const label = prompt("Enter Document Name:");
    if (label) {
      const newType = `extra_${Date.now()}`;
      setExtraDocs((prev) => [...prev, { label, type: newType }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 p-6">
      <motion.div
        initial={{ opacity: 0, rotate: -5 }}
        animate={{ opacity: 1, rotate: 0 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FileText size={40} className="text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Lease Agreement</h1>
        </div>

        {/* Lease Info */}
        <p className="text-gray-700">📅 Start Date: Jan 2024</p>
        <p className="text-gray-700">📅 End Date: Dec 2025</p>
        <p className="text-gray-700">📄 Status: Active</p>

        {/* Download Button */}
        <button
          onClick={downloadAgreement}
          disabled={downloading}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-xl shadow hover:bg-purple-600 disabled:opacity-50"
        >
          {downloading ? "Downloading..." : "Download Agreement"}
        </button>

        {/* Document Upload Section */}
        <h2 className="mt-8 text-lg font-semibold text-gray-800">
          Upload Required Documents
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {defaultDocs.map((doc) => renderUploadBox(doc.label, doc.type))}
          {extraDocs.map((doc) => renderUploadBox(doc.label, doc.type))}
        </div>

        {/* Add More Document Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={addMoreDocument}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl shadow hover:bg-green-600"
          >
            <Plus size={18} /> Add More Document
          </button>
        </div>

        {/* Back Button */}
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
