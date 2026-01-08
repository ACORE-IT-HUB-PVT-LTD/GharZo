import React from "react";
import { useParams } from "react-router-dom";
import {
  Home,
  MapPin,
  DollarSign,
  Wifi,
  Car,
  Dumbbell,
  Utensils,
  Shield,
} from "lucide-react";

const propertyDetails = {
  prop1: {
    name: "Sunshine PG",
    address: "45 MG Road, Indore, MP",
    rent: "₹6,500",
    type: "PG",
    status: "Active",
    facilities: ["WiFi", "Laundry", "CCTV", "Meals"],
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  prop2: {
    name: "Blue Ridge Apartment",
    address: "Tower B, Hinjewadi, Pune, MH",
    rent: "₹12,000",
    type: "Flat",
    status: "Pending",
    facilities: ["Parking", "Power Backup", "Gym", "Balcony"],
    image:
      "https://images.unsplash.com/photo-1586105251261-72a756497a12?auto=format&fit=crop&w=800&q=80",
  },
  prop3: {
    name: "Green Valley Hostel",
    address: "BTM Layout, Bangalore, KA",
    rent: "₹4,800",
    type: "Hostel",
    status: "Active",
    facilities: ["Shared Rooms", "Common Area", "Security"],
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348223?auto=format&fit=crop&w=800&q=80",
  },
};

const iconMap = {
  WiFi: <Wifi className="w-5 h-5 text-blue-400 drop-shadow-md" />,
  Parking: <Car className="w-5 h-5 text-green-400 drop-shadow-md" />,
  Gym: <Dumbbell className="w-5 h-5 text-red-400 drop-shadow-md" />,
  Meals: <Utensils className="w-5 h-5 text-yellow-400 drop-shadow-md" />,
  Security: <Shield className="w-5 h-5 text-purple-400 drop-shadow-md" />,
};

const TenantPropertyDetails = () => {
  const { id } = useParams();
  const property = propertyDetails[id];

  if (!property)
    return <p className="text-red-400 text-center mt-6">Property not found.</p>;

  return (
    <div className="bg-gray-800 min-h-screen p-6 flex justify-center items-center">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-3xl transform transition duration-500 hover:scale-105">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-64 object-cover rounded-xl mb-6 shadow-lg"
        />

        <h2 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
          <Home className="text-blue-400 drop-shadow-md" /> {property.name}
        </h2>
        <p className="text-gray-400 flex items-center gap-2 mb-4">
          <MapPin className="text-red-400 drop-shadow-md" /> {property.address}
        </p>

        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div className="bg-gray-700 p-3 rounded-xl shadow hover:shadow-lg transition">
            <strong className="text-gray-300">Type:</strong>
            <p className="text-white">{property.type}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-xl shadow hover:shadow-lg transition">
            <strong className="text-gray-300">Status:</strong>
            <p className="text-white">{property.status}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-xl shadow hover:shadow-lg transition col-span-2 flex items-center gap-2">
            <DollarSign className="text-green-400 drop-shadow-md" />
            <p className="text-white">{property.rent} / month</p>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold text-white mb-3">Facilities:</h4>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {property.facilities.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-gray-300 bg-gray-700 p-2 rounded-lg shadow hover:scale-105 transform transition"
              >
                {iconMap[item] || <Shield className="w-5 h-5 text-gray-400" />}{" "}
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TenantPropertyDetails;
