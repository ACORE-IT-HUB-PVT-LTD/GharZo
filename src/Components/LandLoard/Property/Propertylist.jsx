import React from "react";
import {
  FaHome,
  FaRegBuilding,
  FaUserPlus,
  FaWalking,
  FaVideo,
  FaPhoneAlt,
  FaBed,
  FaRupeeSign,
  FaHeart,
} from "react-icons/fa";

const statsData = [
  { title: "Listed ", count: 0, icon: <FaHome />, color: "bg-indigo-600" },
  { title: "Unlisted Properties", count: 2, icon: <FaRegBuilding />, color: "bg-red-500" },
  { title: "New Leads", count: 0, icon: <FaUserPlus />, color: "bg-yellow-500" },
  { title: "Physical Tours", count: 0, icon: <FaWalking />, color: "bg-green-500" },
  { title: "Video Tours", count: 0, icon: <FaVideo />, color: "bg-purple-600" },
  { title: "Calls Scheduled", count: 0, icon: <FaPhoneAlt />, color: "bg-orange-500" },
  { title: "Reserved Beds", count: 0, icon: <FaBed />, color: "bg-blue-600" },
  { title: "Total Collection", count: 0, icon: <FaRupeeSign />, color: "bg-gray-800" },
  { title: "Total Wishlists", count: 0, icon: <FaHeart />, color: "bg-pink-500" },
];

const PropertyList = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h3 className="text-2xl font-bold text-center text-blue-700 mb-8">
        Property Overview
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {statsData.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex items-center gap-4"
          >
            <div
              className={`text-white text-2xl p-3 rounded-full ${item.color} flex items-center justify-center w-12 h-12`}
            >
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-gray-800">{item.count}</span>
              <span className="text-sm text-gray-500">{item.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyList;
