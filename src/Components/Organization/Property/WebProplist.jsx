// Full Updated WebProplist.jsx - With localStorage for sync
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function WebProplist() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to load from localStorage or default mock
  const loadProperties = () => {
    try {
      const saved = localStorage.getItem('mockProperties');
      let data;
      if (saved) {
        data = JSON.parse(saved);
        console.log("Loaded from localStorage:", data);
      } else {
        // Default mock data (copy full from edit if needed, but flat for list)
        data = [
          {
            id: 1,
            name: "Green Meadows Apartment",
            address: "Green Meadows, Sector 12, Noida, Uttar Pradesh 201301",
            type: "Apartment",
            rooms: 4,
            beds: 3,
            furnished: "Furnished",
            image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            // Full nested data (about, amenities, etc.) - copy from edit's mock for completeness
            about: {
              title: "Green Meadows Apartment",
              description: "A spacious furnished apartment in a prime location.",
              images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"],
              beds: "3",
              baths: "2",
              rooms: "4",
              capacity: "6",
              rent: "₹25,000",
              securityDeposit: "₹50,000",
              lockInPeriod: "6 months",
              noticePeriod: "1 month"
            },
            amenities: [
              { name: "WiFi", icon: "FaWifi", available: true },
              { name: "Parking", icon: "FaCar", available: true },
              { name: "Furnished", icon: "FaHome", available: true }
            ],
            rules: ["No pets", "No smoking"],
            location: {
              address: "Green Meadows, Sector 12, Noida, Uttar Pradesh 201301",
              latitude: "28.6353",
              longitude: "77.2240",
              distance: "1km from metro",
              nearby: ["Sector 12 Metro", "Local Market"]
            },
            contact: {
              phone: "+91-9876543210",
              email: "agent1@example.com",
              agent: "Agent One"
            },
            faq: [
              { question: "Is parking available?", answer: "Yes, free parking for residents." }
            ]
          },
          {
            id: 2,
            name: "Silicon",
            address: "Rajendra Nagar, Indore, Madhya Pradesh 234455",
            type: "PG",
            rooms: 22,
            beds: 12,
            furnished: "Unfurnished",
            image: "https://images.unsplash.com/photo-1757711990572-5aa72167eb33?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            about: {
              title: "Silicon",
              description: "A large PG accommodation suitable for students and professionals.",
              images: ["https://images.unsplash.com/photo-1757711990572-5aa72167eb33?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"],
              beds: "12",
              baths: "6",
              rooms: "22",
              capacity: "24",
              rent: "₹8,000",
              securityDeposit: "₹16,000",
              lockInPeriod: "3 months",
              noticePeriod: "1 month"
            },
            amenities: [
              { name: "WiFi", icon: "FaWifi", available: true },
              { name: "Common Kitchen", icon: "FaUtensils", available: true }
            ],
            rules: ["Quiet hours after 10 PM", "No cooking in rooms"],
            location: {
              address: "Rajendra Nagar, Indore, Madhya Pradesh 234455",
              latitude: "22.7196",
              longitude: "75.8577",
              distance: "2km from university",
              nearby: ["IIT Indore", "Local Bus Stop"]
            },
            contact: {
              phone: "+91-9876543211",
              email: "agent2@example.com",
              agent: "Agent Two"
            },
            faq: [
              { question: "Is it suitable for girls?", answer: "Yes, separate sections available." }
            ]
          },
          {
            id: 3,
            name: "Universal Place",
            address: "Film City, Mumbai, Maharashtra 400001",
            type: "Luxury Bungalows",
            rooms: 6,
            beds: 16,
            furnished: "Unfurnished",
            image: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            about: {
              title: "Universal Place",
              description: "Luxury bungalows in the heart of Film City.",
              images: ["https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"],
              beds: "16",
              baths: "8",
              rooms: "6",
              capacity: "32",
              rent: "₹1,50,000",
              securityDeposit: "₹3,00,000",
              lockInPeriod: "12 months",
              noticePeriod: "2 months"
            },
            amenities: [
              { name: "Security", icon: "FaShieldAlt", available: true },
              { name: "Garden", icon: "FaHome", available: true },
              { name: "Pool", icon: "FaUtensils", available: false }
            ],
            rules: ["No parties", "Maintain cleanliness"],
            location: {
              address: "Film City, Mumbai, Maharashtra 400001",
              latitude: "19.0760",
              longitude: "72.8777",
              distance: "500m from studios",
              nearby: ["Film City Studios", "Highway"]
            },
            contact: {
              phone: "+91-9876543212",
              email: "agent3@example.com",
              agent: "Agent Three"
            },
            faq: [
              { question: "What is the maintenance cost?", answer: "₹5,000 per month." }
            ]
          }
        ];
        localStorage.setItem('mockProperties', JSON.stringify(data)); // Init localStorage
      }
      // Map to flat for display
      const flatProperties = data.map((p) => ({
        id: p.id,
        name: p.about.title, // Use updated title from edit
        address: p.location.address, // Use updated address
        type: p.type,
        rooms: parseInt(p.about.rooms, 10),
        beds: parseInt(p.about.beds, 10),
        furnished: p.furnished || p.about.furnished || "Furnished",
        image: p.image || p.about.images[0],
      }));
      setProperties(flatProperties);
      setLoading(false);
    } catch (err) {
      console.error("Error loading properties:", err);
      setError("Failed to load properties");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading Properties...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <div className="relative">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                {property.type}
              </div>
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  className="text-white bg-gray-500 hover:bg-gray-600 p-1 rounded-full"
                  aria-label="View property details"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  className="text-white bg-gray-500 hover:bg-gray-600 p-1 rounded-full"
                  aria-label="Share property"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {property.name}
              </h2>
              <p className="text-gray-600 text-sm mb-2">{property.address}</p>
              <div className="text-sm text-green-600 mb-2">
                <span>📍 {property.rooms} Rooms</span>{" "}
                <span>🛏️ {property.beds} Beds</span>{" "}
                <span>{property.furnished}</span>
              </div>
              <div className="flex justify-between space-x-2">
                <Link
                  to={`/organization/website-detail/${property.id}`}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-md text-center hover:bg-blue-600 transition-colors"
                  onClick={() => console.log("Navigating to:", `/organization/website-detail/${property.id}`)}
                >
                  View Details
                </Link>
                <Link
                  to={`/organization/property/web-edit-property/${property.id}`}
                  className="flex-1 bg-green-500 text-white py-2 px-3 rounded-md text-center hover:bg-green-600 transition-colors"
                  onClick={() => console.log("Editing property:", property.id)}
                >
                  Edit Property
                </Link>
                <button
                  className="flex-1 bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 transition-colors"
                  onClick={async () => {
                    if (window.confirm(`Delete property ${property.name}?`)) {
                      const saved = localStorage.getItem('mockProperties');
                      let data = saved ? JSON.parse(saved) : []; // Load current
                      data = data.filter(p => p.id !== property.id);
                      localStorage.setItem('mockProperties', JSON.stringify(data));
                      loadProperties(); // Reload list
                      alert("Property deleted!");
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WebProplist;