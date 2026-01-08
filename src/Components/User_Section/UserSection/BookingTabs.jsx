import React, { useState } from "react";
import BookingTable from "./BookingTable";

const bookingsData = {
  Rent: [
    { id: "RENT001", date: "2025-07-25", amount: 1500, status: "Confirmed" },
  ],
  Property: [
    { id: "PROPERTY001", date: "2025-07-22", amount: 750000, status: "Completed" },
  ],
  PG: [
    { id: "PG001", date: "2025-07-21", amount: 5000, status: "Cancelled" },
  ],
  Hostel: [
    { id: "HOS001", date: "2025-07-23", amount: 3000, status: "Pending" },
  ],
  Hotel: [
    { id: "HOT001", date: "2025-07-24", amount: 2500, status: "Confirmed" },
  ],
};

const TABS = ["Rent", "Property", "PG", "Hostel", "Hotel"];

export default function BookingTabs() {
  const [activeTab, setActiveTab] = useState("Rent");

  const currentBookings = bookingsData[activeTab] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? "border-b-2 border-[#5C4EFF] text-[#5C4EFF]"
                : "text-gray-500 hover:text-[#5C4EFF]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <BookingTable bookings={currentBookings} />
    </div>
  );
}
