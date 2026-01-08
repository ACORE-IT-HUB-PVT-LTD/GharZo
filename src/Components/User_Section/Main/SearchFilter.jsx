import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaHome, FaBed, FaCheckCircle } from "react-icons/fa";

const SearchAndProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // 🏠 Fake demo data
  const fakeProperties = [
    {
      _id: "1",
      id: "101",
      name: "Sunshine PG",
      type: "PG",
      totalRooms: 12,
      images: ["https://via.placeholder.com/400x300?text=Sunshine+PG"],
      location: {
        city: "Delhi",
        area: "Saket",
        state: "Delhi",
        address: "Near Saket Metro Station",
      },
    },
    {
      _id: "2",
      id: "102",
      name: "Dream Hostel",
      type: "Hostel",
      totalRooms: 20,
      images: ["https://via.placeholder.com/400x300?text=Dream+Hostel"],
      location: {
        city: "Mumbai",
        area: "Andheri",
        state: "Maharashtra",
        address: "Opposite Andheri Station",
      },
    },
    {
      _id: "3",
      id: "103",
      name: "Cozy Nest",
      type: "PG",
      totalRooms: 8,
      images: ["https://via.placeholder.com/400x300?text=Cozy+Nest"],
      location: {
        city: "Bangalore",
        area: "Whitefield",
        state: "Karnataka",
        address: "Whitefield Main Road",
      },
    },
  ];

  // 🔍 Filter properties based on search query
  const filteredData = fakeProperties.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.location?.area?.toLowerCase().includes(q) ||
      item.location?.city?.toLowerCase().includes(q) ||
      item.location?.state?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 p-3">
      {/* 🔍 Search Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md mx-auto mt-3"
      >
        <div className="relative">
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
          >
            <Search className="w-5 h-5 text-purple-600 drop-shadow-lg" />
          </motion.div>

          <motion.input
            whileFocus={{
              scale: 1.02,
              boxShadow: "0px 3px 12px rgba(0,0,0,0.1)",
            }}
            transition={{ duration: 0.3 }}
            type="text"
            placeholder="Search by area"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-gray-200 
                       text-gray-700 placeholder-gray-400 focus:outline-none 
                       focus:ring-2 focus:ring-purple-400 focus:border-purple-400 
                       shadow-sm text-sm"
          />
        </div>
      </motion.div>

      {/* 🏠 Suggested Properties */}
      <section className="py-8 px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-8 text-center">
          Suggested Properties
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Link
                to={`/${item.type}/${item.id}`}
                state={item}
                key={item._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden text-left"
              >
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  className="w-full h-44 object-cover"
                />

                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-bold text-center text-[#5C4EFF]">
                    {item.name}
                  </h3>

                  <div className="flex items-center text-gray-600 text-sm gap-2">
                    <FaMapMarkerAlt className="text-[#5C4EFF]" />
                    <span>
                      {item.location?.city}, {item.location?.area}
                    </span>
                  </div>

                  <div className="flex items-center text-sm gap-2 text-gray-700">
                    <FaHome className="text-[#5C4EFF]" />
                    <span className="font-semibold">Type:</span>
                    <span>{item.type}</span>
                  </div>

                  <div className="flex items-center text-sm gap-2 text-gray-700">
                    <FaBed className="text-[#5C4EFF]" />
                    <span className="font-semibold">Bedrooms:</span>
                    <span>{item.totalRooms || "N/A"}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <FaCheckCircle className="mt-1 text-[#5C4EFF]" />
                    <div>
                      <p>
                        <span className="font-semibold">Location:</span>{" "}
                        {item.location?.address}
                      </p>
                      <p>
                        {item.location?.city}, {item.location?.state}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-600 text-center col-span-3">
              No properties found
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchAndProperties;
