import React from "react";
import { FaShieldAlt, FaUndoAlt, FaFileContract, FaEnvelope, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";

const Policies = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8 lg:px-16">
      {/* Title */}
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-center mb-10 bg-blue-900 pb-3 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Policies & Legal Information
      </motion.h1>

      {/* Container with proper height management */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* PG/Hostel Rules & Regulations Section */}
        <motion.div
          className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3 mb-6">
            <FaShieldAlt className="text-blue-500 mt-1 flex-shrink-0" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                PG/Hostel Rules & Regulations
              </h2>
              <p className="text-gray-600 text-sm">
                Please read and understand these rules before booking
              </p>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="text-gray-700 text-sm space-y-3 leading-relaxed list-disc pl-6">
              <li className="break-words">
                Tenant shall occupy premises for residential purposes only and not
                for any other purposes without prior written permission/consent of
                the owner.
              </li>
              <li className="break-words">
                Tenant shall return the room in the same condition as it was given
                at the time of rent agreement. (If anything is found damaged or
                misplaced during your tenure at the premises, you have to pay the
                marked price of those things.)
              </li>
              <li className="break-words">
                Tenant shall not make any addition/alteration in the rented premises
                without prior consent/permission of the owner and shall not do any
                work which will cause damage to the rented premises.
              </li>
              <li className="break-words">
                Tenant shall pay rent monthly in the first week of every month on
                every 5th day of the month, and if you do not pay it within the
                given time period, then you will pay a fine of ₹100/- per day until
                the payment is received.
              </li>
              <li className="break-words">
                Tenant can't vacate the room before the completion of 6/11 months as
                agreed and shall only vacate the rented premises with prior
                notice/information of one month.
              </li>
              <li className="break-words">
                Notice will be valid if it is documented on the 1st calendar day of
                the month.
              </li>
              <li className="break-words">
                You have to vacate the room within the notice period realization.
                (If such is failed, you have to pay the full month's rent, and your
                security money will not be refunded.)
              </li>
              <li className="break-words">
                In case of any dispute, the matter shall be referred to Phagwara
                Court only.
              </li>
              <li className="break-words">
                Tenant shall be responsible for any illegal work done in PG premises
                (drugs, fights, or any other illegal activities).
              </li>
              <li className="break-words">
                If a tenant is found violating the rules, then a two-day notice will
                be served to vacate the room. (In such a condition, the security
                will not be refunded, and all the dues like the electricity bill,
                maintenance charges, or any other charges must be paid separately.)
              </li>
              <li className="break-words">
                Electricity bill will be collected before the 5th of every month.
              </li>
              <li className="break-words">
                It is requested to not misbehave with any of the staff members of
                GharZo.
              </li>
              <li className="break-words">
                Maintenance charges ₹300/- will be taken every month.
              </li>
              <li className="break-words">
                Security deposit will be refunded upon receipt of written notice to
                vacate at least one month prior to the end of the lock-in period.
              </li>
              <li className="break-words">
                WIFI is not included in rent (it is complementary).
              </li>
              <li className="break-words">
                No loud music, parties, or disturbances are allowed inside the PG
                premises.
              </li>
              <li className="break-words">
                We are not responsible for anything stolen outside your room from the
                common area.
              </li>
              <li className="break-words">
                Outsiders are not allowed to stay at night. Only parents are allowed
                with prior permission.
              </li>
              <li className="break-words">
                Motor charges per room will be 15 units per month.
              </li>
              <li className="break-words">
                For international students, a C-form is necessary, and you must
                take the C-form 30 days prior to visa expiry.
              </li>
              <li className="break-words">
                On non-payment of rent, it is the owner/manager's right to lock the
                room until the rent is paid.
              </li>
              <li className="break-words">
                Vacating charges: ₹500.
              </li>
              <li className="break-words">
                All rights reserved by GharZo.
              </li>
            </ul>
          </div>

         
        </motion.div>

        {/* Refund & Cancellation Policy */}
        <motion.div
          className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3 mb-6">
            <FaUndoAlt className="text-green-500 mt-1 flex-shrink-0" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Refund & Cancellation Policy
              </h2>
              <p className="text-gray-600 text-sm">
                Our fair refund policy for your peace of mind
              </p>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Cancellation Before Move-in:</h3>
              <ul className="text-gray-700 text-sm space-y-1 list-disc pl-4">
                <li>7+ days before move-in: Full refund (minus ₹500 processing fee)</li>
                <li>3-7 days before move-in: 50% refund</li>
                <li>Less than 3 days: No refund</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">During Stay:</h3>
              <ul className="text-gray-700 text-sm space-y-1 list-disc pl-4">
                <li>Monthly notice required for vacating</li>
                <li>Security deposit refunded after final inspection</li>
                <li>Outstanding dues must be cleared before refund</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-800 mb-2">Important Notes:</h3>
              <ul className="text-blue-700 text-sm space-y-1 list-disc pl-4">
                <li>Refunds processed within 7-10 business days</li>
                <li>Bank transfer fees may apply</li>
                <li>Cancellation must be in writing</li>
                <li>Peak season policies may vary</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Terms & Conditions */}
        <motion.div
          className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3 mb-6">
            <FaFileContract className="text-purple-500 mt-1 flex-shrink-0" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Terms & Conditions
              </h2>
              <p className="text-gray-600 text-sm">
                Legal agreement between you and GharZo
              </p>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">User Responsibilities:</h3>
                <ul className="text-gray-700 text-sm space-y-2 list-disc pl-4">
                  <li className="break-words">Provide accurate information during registration</li>
                  <li className="break-words">Use the platform only for lawful purposes</li>
                  <li className="break-words">Respect property rules and other users</li>
                  <li className="break-words">Report any issues immediately to support</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Platform Rights:</h3>
                <ul className="text-gray-700 text-sm space-y-2 list-disc pl-4">
                  <li className="break-words">Suspend accounts for violations</li>
                  <li className="break-words">Modify terms with 30 days notice</li>
                  <li className="break-words">Collect necessary user data for service</li>
                  <li className="break-words">Terminate service at discretion</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-semibold text-purple-800 mb-2">Liability Disclaimer:</h3>
              <p className="text-purple-700 text-sm leading-relaxed">
                GharZo acts as a facilitator between property owners and tenants. We do not guarantee the accuracy of listings or the suitability of properties. Users are responsible for verifying all information before making decisions.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold text-gray-800 mb-3">Governing Law:</h3>
              <p className="text-gray-700 text-sm">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Phagwara, Punjab.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-gray-500 mb-3">
              Last updated: January 15, 2024
            </p>
           
          </div>
        </motion.div>

        {/* Contact Support Section */}
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Need Help with Policies?
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Have questions about our policies? Our support team is here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:support@drazeapp.com"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaEnvelope size={16} />
              Email Support
            </a>
            <a
              href="tel:+919110091413"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaPhone size={16} />
              Call Us
            </a>
          </div>
        </motion.div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default Policies;