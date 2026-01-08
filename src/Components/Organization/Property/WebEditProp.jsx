// Full Updated WebEditProp.jsx - With localStorage for sync
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaHome,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaUtensils,
  FaWifi,
  FaCar,
  FaShieldAlt,
  FaLock,
  FaPhone,
  FaEnvelope,
  FaQuestionCircle,
} from "react-icons/fa";

// Icon mapping for amenities
const iconMap = {
  FaHome,
  FaBed,
  FaBath,
  FaUtensils,
  FaWifi,
  FaCar,
  FaShieldAlt,
  FaLock,
};

const iconOptions = [
  { value: "FaHome", label: "Home", icon: FaHome },
  { value: "FaBed", label: "Bed", icon: FaBed },
  { value: "FaBath", label: "Bath", icon: FaBath },
  { value: "FaUtensils", label: "Utensils", icon: FaUtensils },
  { value: "FaWifi", label: "WiFi", icon: FaWifi },
  { value: "FaCar", label: "Car", icon: FaCar },
  { value: "FaShieldAlt", label: "Shield", icon: FaShieldAlt },
  { value: "FaLock", label: "Lock", icon: FaLock },
];

const WebEditProp = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    about: {
      title: "",
      description: "",
      images: [],
      beds: "",
      baths: "",
      rooms: "",
      capacity: "",
      rent: "",
      securityDeposit: "",
      lockInPeriod: "",
      noticePeriod: "",
    },
    amenities: [],
    rules: [],
    location: {
      address: "",
      latitude: "",
      longitude: "",
      distance: "",
      nearby: [],
    },
    contact: {
      phone: "",
      email: "",
      agent: "",
    },
    faq: [],
  });
  const [newRule, setNewRule] = useState("");
  const [newNearby, setNewNearby] = useState("");
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [newImage, setNewImage] = useState("");

  // Function to get icon component from string name
  const getIcon = (iconName) => iconMap[iconName] || FaHome;

  // Input sanitization function
  const sanitizeInput = (value) => {
    return typeof value === 'string' ? value.replace(/[<>&"]/g, (char) => ({
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;'
    }[char])) : value;
  };

  // Load property from localStorage
  useEffect(() => {
    console.log("Edit page: Loading property for ID:", id);
    const propertyId = parseInt(id, 10);
    if (isNaN(propertyId)) {
      console.error("Invalid property ID:", id);
      setError("Invalid property ID");
      setLoading(false);
      return;
    }

    try {
      const saved = localStorage.getItem('mockProperties');
      let data = saved ? JSON.parse(saved) : []; // Load from localStorage or empty
      const foundProperty = data.find((p) => p.id === propertyId);
      console.log("Found property:", foundProperty);
      if (foundProperty) {
        setProperty(foundProperty);
        const newFormData = {
          about: { ...foundProperty.about },
          amenities: foundProperty.amenities ? foundProperty.amenities.map((amenity) => ({ ...amenity })) : [],
          rules: foundProperty.rules ? [...foundProperty.rules] : [],
          location: { 
            ...foundProperty.location, 
            nearby: foundProperty.location.nearby ? [...foundProperty.location.nearby] : [] 
          },
          contact: { ...foundProperty.contact },
          faq: foundProperty.faq ? [...foundProperty.faq] : [],
        };
        setFormData(newFormData);
        setLoading(false);
      } else {
        console.error("Property not found for ID:", propertyId);
        setError("Property not found");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
      setError("Failed to load property");
      setLoading(false);
    }
  }, [id]);

  // Debug: Log formData after update
  useEffect(() => {
    if (!loading && !error) {
      console.log("Form data loaded/updated:", formData);
    }
  }, [formData, loading, error]);

  const handleInputChange = (e, section, field) => {
    const value = e.target.type === "checkbox" ? e.target.checked : sanitizeInput(e.target.value);
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleAmenityChange = (index, field, value) => {
    const sanitizedValue = field === "name" ? sanitizeInput(value) : value;
    setFormData((prev) => {
      const updatedAmenities = [...prev.amenities];
      updatedAmenities[index] = { ...updatedAmenities[index], [field]: sanitizedValue };
      return { ...prev, amenities: updatedAmenities };
    });
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData((prev) => ({
        ...prev,
        rules: [...prev.rules, sanitizeInput(newRule.trim())],
      }));
      setNewRule("");
    }
  };

  const removeRule = (index) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const addNearby = () => {
    if (newNearby.trim()) {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          nearby: [...prev.location.nearby, sanitizeInput(newNearby.trim())],
        },
      }));
      setNewNearby("");
    }
  };

  const removeNearby = (index) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        nearby: prev.location.nearby.filter((_, i) => i !== index),
      },
    }));
  };

  const addFaq = () => {
    if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
      setFormData((prev) => ({
        ...prev,
        faq: [
          ...prev.faq,
          { question: sanitizeInput(newFaqQuestion.trim()), answer: sanitizeInput(newFaqAnswer.trim()) },
        ],
      }));
      setNewFaqQuestion("");
      setNewFaqAnswer("");
    }
  };

  const removeFaq = (index) => {
    setFormData((prev) => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index),
    }));
  };

  const addImage = () => {
    const imageUrl = newImage.trim();
    if (imageUrl && imageUrl.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif)$/i)) {
      setFormData((prev) => ({
        ...prev,
        about: {
          ...prev.about,
          images: [...prev.about.images, imageUrl],
        },
      }));
      setNewImage("");
    } else {
      alert("Please enter a valid image URL (jpg, jpeg, png, gif)");
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        images: prev.about.images.filter((_, i) => i !== index),
      },
    }));
  };

  const addAmenity = () => {
    setFormData((prev) => ({
      ...prev,
      amenities: [...prev.amenities, { name: "", icon: "FaHome", available: false }],
    }));
  };

  const removeAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const propertyId = parseInt(id, 10);

    // Validation (same as before)
    if (!formData.about.title || !formData.about.description || !formData.location.address) {
      alert("Please fill in all required fields (Title, Description, Address)");
      return;
    }
    if (
      isNaN(parseInt(formData.about.beds, 10)) ||
      isNaN(parseInt(formData.about.baths, 10)) ||
      isNaN(parseInt(formData.about.rooms, 10)) ||
      isNaN(parseInt(formData.about.capacity, 10)) ||
      parseInt(formData.about.beds, 10) < 0 ||
      parseInt(formData.about.baths, 10) < 0 ||
      parseInt(formData.about.rooms, 10) < 0 ||
      parseInt(formData.about.capacity, 10) < 0
    ) {
      alert("Beds, Baths, Rooms, and Capacity must be valid non-negative numbers");
      return;
    }
    if (!formData.about.rent.match(/^₹?\d+(,\d{3})*(\.\d{2})?$/)) {
      alert("Rent must be a valid currency amount (e.g., ₹25,000 or ₹25,000.00)");
      return;
    }
    if (!formData.about.securityDeposit.match(/^₹?\d+(,\d{3})*(\.\d{2})?$/)) {
      alert("Security Deposit must be a valid currency amount (e.g., ₹50,000 or ₹50,000.00)");
      return;
    }
    if (!formData.contact.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!formData.contact.phone.match(/^\+?\d{10,12}$/)) {
      alert("Please enter a valid phone number (10-12 digits, optional + prefix)");
      return;
    }

    // Load current data from localStorage
    try {
      const saved = localStorage.getItem('mockProperties');
      let data = saved ? JSON.parse(saved) : [];
      const updatedPropertyIndex = data.findIndex((p) => p.id === propertyId);
      if (updatedPropertyIndex !== -1) {
        data[updatedPropertyIndex] = {
          ...data[updatedPropertyIndex],
          ...formData,
          // Sync flat fields for list
          name: formData.about.title,
          address: formData.location.address,
          rooms: parseInt(formData.about.rooms, 10),
          beds: parseInt(formData.about.beds, 10),
          type: data[updatedPropertyIndex].type, // Keep original type
          furnished: data[updatedPropertyIndex].furnished || formData.about.furnished || "Furnished",
          image: data[updatedPropertyIndex].image || formData.about.images[0],
          about: formData.about,
          amenities: formData.amenities,
          rules: formData.rules,
          location: formData.location,
          contact: formData.contact,
          faq: formData.faq,
        };
        localStorage.setItem('mockProperties', JSON.stringify(data));
        console.log("Updated and saved to localStorage:", data[updatedPropertyIndex]);
      } else {
        alert("Property not found for update");
        return;
      }
    } catch (err) {
      console.error("Error saving to localStorage:", err);
      alert("Failed to save changes");
      return;
    }

    console.log("Updated property data:", { id: propertyId, ...formData });
    alert("Property updated successfully! Changes saved.");
    navigate("/organization/property/web-property-list");
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
          <span className="text-gray-600 text-lg">Loading Property...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-medium">Error: {error}</p>
          <Link
            to="/organization/property/web-property-list"
            className="mt-2 inline-block text-blue-500 hover:underline"
          >
            Back to Property List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Property: {property.about.title}</h1>
          <Link
            to="/organization/property/web-property-list"
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Back to List
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-lg">
          {/* About Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaHome className="text-blue-500" /> About
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  value={formData.about.title}
                  onChange={(e) => handleInputChange(e, "about", "title")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  value={formData.about.description}
                  onChange={(e) => handleInputChange(e, "about", "description")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Beds *</label>
                <input
                  type="number"
                  value={formData.about.beds}
                  onChange={(e) => handleInputChange(e, "about", "beds")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Baths *</label>
                <input
                  type="number"
                  value={formData.about.baths}
                  onChange={(e) => handleInputChange(e, "about", "baths")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rooms *</label>
                <input
                  type="number"
                  value={formData.about.rooms}
                  onChange={(e) => handleInputChange(e, "about", "rooms")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                <input
                  type="number"
                  value={formData.about.capacity}
                  onChange={(e) => handleInputChange(e, "about", "capacity")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rent (₹/month) *</label>
                <input
                  type="text"
                  value={formData.about.rent}
                  onChange={(e) => handleInputChange(e, "about", "rent")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., ₹25,000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Security Deposit *</label>
                <input
                  type="text"
                  value={formData.about.securityDeposit}
                  onChange={(e) => handleInputChange(e, "about", "securityDeposit")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., ₹50,000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lock-in Period *</label>
                <input
                  type="text"
                  value={formData.about.lockInPeriod}
                  onChange={(e) => handleInputChange(e, "about", "lockInPeriod")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 6 months"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notice Period *</label>
                <input
                  type="text"
                  value={formData.about.noticePeriod}
                  onChange={(e) => handleInputChange(e, "about", "noticePeriod")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 1 month"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Images (URLs)</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter image URL"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add Image
                </button>
              </div>
              {formData.about.images.length === 0 && (
                <p className="text-sm text-gray-500">No images added yet.</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.about.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={img} 
                      alt={`Property image ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-md border" 
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Amenities Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaWifi className="text-blue-500" /> Amenities
            </h2>
            <div className="space-y-3">
              {formData.amenities.map((amenity, index) => {
                const IconComponent = getIcon(amenity.icon);
                return (
                  <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                    <IconComponent className="text-2xl text-gray-600 flex-shrink-0 mt-2" />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={amenity.name}
                        onChange={(e) => handleAmenityChange(index, "name", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Amenity name (e.g., WiFi)"
                      />
                      <div className="flex items-center gap-4">
                        <select
                          value={amenity.icon}
                          onChange={(e) => handleAmenityChange(index, "icon", e.target.value)}
                          className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {iconOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={amenity.available}
                            onChange={(e) => handleAmenityChange(index, "available", e.target.checked)}
                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">Available</span>
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="text-red-500 hover:text-red-700 ml-2 text-sm font-medium self-start mt-2"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              {formData.amenities.length === 0 && (
                <p className="text-sm text-gray-500">No amenities added yet.</p>
              )}
              <button
                type="button"
                onClick={addAmenity}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                + Add Amenity
              </button>
            </div>
          </section>

          {/* Rules Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaLock className="text-blue-500" /> Rules
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter new rule (e.g., No smoking)"
              />
              <button
                type="button"
                onClick={addRule}
                className="bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Rule
              </button>
            </div>
            {formData.rules.length === 0 && (
              <p className="text-sm text-gray-500">No rules added yet.</p>
            )}
            <ul className="space-y-2">
              {formData.rules.map((rule, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                  <span className="text-gray-600">{rule}</span>
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Location Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500" /> Location
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address *</label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange(e, "location", "address")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.latitude}
                  onChange={(e) => handleInputChange(e, "location", "latitude")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 28.6353"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.longitude}
                  onChange={(e) => handleInputChange(e, "location", "longitude")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 77.2240"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Distance to Key Landmark</label>
                <input
                  type="text"
                  value={formData.location.distance}
                  onChange={(e) => handleInputChange(e, "location", "distance")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 1km from metro"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nearby Landmarks</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newNearby}
                  onChange={(e) => setNewNearby(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter nearby landmark (e.g., Metro Station)"
                />
                <button
                  type="button"
                  onClick={addNearby}
                  className="bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add Landmark
                </button>
              </div>
              {formData.location.nearby.length === 0 && (
                <p className="text-sm text-gray-500">No landmarks added yet.</p>
              )}
              <ul className="space-y-2">
                {formData.location.nearby.map((landmark, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                    <span className="text-gray-600">{landmark}</span>
                    <button
                      type="button"
                      onClick={() => removeNearby(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Contact Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaPhone className="text-blue-500" /> Contact
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Agent Name *</label>
                <input
                  type="text"
                  value={formData.contact.agent}
                  onChange={(e) => handleInputChange(e, "contact", "agent")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone *</label>
                <input
                  type="text"
                  value={formData.contact.phone}
                  onChange={(e) => handleInputChange(e, "contact", "phone")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+91-XXXXXXXXXX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange(e, "contact", "email")}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaQuestionCircle className="text-blue-500" /> FAQs
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter FAQ question"
                />
                <input
                  type="text"
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter FAQ answer"
                />
                <button
                  type="button"
                  onClick={addFaq}
                  className="bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 transition-colors w-32"
                >
                  Add FAQ
                </button>
              </div>
              {formData.faq.length === 0 && (
                <p className="text-sm text-gray-500">No FAQs added yet.</p>
              )}
              <div className="space-y-4">
                {formData.faq.map((faq, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="font-medium text-gray-800 mb-1">{faq.question}</div>
                    <div className="text-gray-600 mb-2">{faq.answer}</div>
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-3 px-6 rounded-md hover:bg-green-600 transition-colors font-medium shadow-md"
            >
              Save Changes
            </button>
            <Link
              to="/organization/property/web-property-list"
              className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-md text-center hover:bg-gray-600 transition-colors font-medium shadow-md"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebEditProp;