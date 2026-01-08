import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function LeaseAgreementPage() {
  const [downloading, setDownloading] = useState(false);

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

  const Highlight = ({ children }) => (
    <span className="bg-yellow-200 px-1 rounded">{children}</span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FileText size={36} className="text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Residential Lease Agreement
          </h1>
        </div>

        {/* Agreement Body */}
        <div className="prose max-w-none text-gray-800 leading-relaxed text-justify">
          <p>
            This Lease Agreement (“Agreement”) is entered into on{" "}
            <Highlight>January 1, 2024</Highlight> between Landlord{" "}
            <Highlight>Mr. Rajesh Kumar</Highlight>, residing at{" "}
            <Highlight>45, Green Park, New Delhi</Highlight>, hereinafter
            referred to as the “Landlord”, and Tenant{" "}
            <Highlight>Mr. Amit Sharma</Highlight>, residing at{" "}
            <Highlight>Flat 201, Sunshine Apartments, Gurgaon</Highlight>,
            hereinafter referred to as the “Tenant”.
          </p>

          <h2 className="mt-6 text-lg font-semibold">1. Property</h2>
          <p>
            The Landlord hereby leases to the Tenant the residential property
            located at{" "}
            <Highlight>Flat 201, Sunshine Apartments, Gurgaon</Highlight>.
          </p>

          <h2 className="mt-6 text-lg font-semibold">2. Term</h2>
          <p>
            The lease shall commence on <Highlight>January 1, 2024</Highlight>{" "}
            and terminate on <Highlight>December 31, 2025</Highlight>.
          </p>

          <h2 className="mt-6 text-lg font-semibold">3. Rent</h2>
          <p>
            The Tenant agrees to pay a monthly rent of{" "}
            <Highlight>₹20,000</Highlight> on or before the{" "}
            <Highlight>5th day</Highlight> of each month.
          </p>

          <h2 className="mt-6 text-lg font-semibold">4. Security Deposit</h2>
          <p>
            The Tenant shall deposit an amount of <Highlight>₹40,000</Highlight>{" "}
            with the Landlord as security.
          </p>

          <h2 className="mt-6 text-lg font-semibold">5. Utilities</h2>
          <p>
            The Tenant shall be responsible for payment of utilities including{" "}
            <Highlight>electricity, water, gas, and internet</Highlight>.
          </p>

          <h2 className="mt-6 text-lg font-semibold">6. Maintenance</h2>
          <p>
            The Tenant shall maintain the premises in good condition. The
            Landlord will handle major repairs related to{" "}
            <Highlight>plumbing, electrical, and structural issues</Highlight>.
          </p>

          <h2 className="mt-6 text-lg font-semibold">7. Termination</h2>
          <p>
            Either party may terminate this agreement by giving{" "}
            <Highlight>30 days</Highlight> written notice.
          </p>

          <h2 className="mt-6 text-lg font-semibold">8. Governing Law</h2>
          <p>
            This Agreement shall be governed by the laws of{" "}
            <Highlight>India</Highlight>.
          </p>

          <h2 className="mt-6 text-lg font-semibold">Signatures</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
            <div>
              <p>
                __________________________ <br />
                <Highlight>Rajesh Kumar</Highlight> <br />
                Landlord
              </p>
            </div>
            <div>
              <p>
                __________________________ <br />
                <Highlight>Amit Sharma</Highlight> <br />
                Tenant
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadAgreement}
            disabled={downloading}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl shadow hover:bg-purple-600 disabled:opacity-50"
          >
            {downloading ? "Downloading..." : "Download Agreement"}
          </button>
          <Link
            to="/tenant"
            className="px-4 py-2 bg-gray-500 text-white rounded-xl shadow hover:bg-gray-600"
          >
            ⬅ Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
