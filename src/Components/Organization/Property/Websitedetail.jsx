import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaSearch,
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
  FaUserEdit,
  FaQuestionCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600">
              Please try refreshing the page or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              aria-label="Refresh the page"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Static dummy data (aligned with WebProplist.jsx)
const mockProperties = [
  {
    id: 1,
    about: {
      title: "Green Meadows Apartment",
      description:
        "This beautiful apartment is located in a safe and convenient neighborhood. Perfect for families or professionals looking for comfort and accessibility. The property features modern amenities and is well-maintained.",
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1551524160-5c5b579cfca0?w=400&h=300&fit=crop",
      ],
      beds: 3,
      baths: 2,
      rooms: 4,
      capacity: 6,
      rent: "₹25,000",
      securityDeposit: "₹50,000",
      lockInPeriod: "3 months",
      noticePeriod: "30 days",
    },
    amenities: [
      { name: "WiFi", icon: FaWifi, available: true },
      { name: "Parking", icon: FaCar, available: true },
      { name: "Power Backup", icon: FaShieldAlt, available: true },
      { name: "CCTV Security", icon: FaLock, available: true },
      { name: "AC Rooms", icon: FaHome, available: true },
      { name: "Kitchen", icon: FaUtensils, available: true },
      { name: "Gym", icon: FaBed, available: false },
      { name: "Laundry", icon: FaBath, available: true },
    ],
    rules: [
      "No smoking in the premises",
      "Pets not allowed",
      "Quiet hours from 10 PM to 6 AM",
      "Guests allowed with prior notice",
      "No subletting without permission",
      "Maintain cleanliness",
    ],
    location: {
      address: "Green Meadows, Sector 12, Noida, Uttar Pradesh 201301",
      latitude: 28.5355,
      longitude: 77.3910,
      distance: "5 km from Sector 18 Metro Station",
      nearby: [
        "Sector 18 Metro Station - 5 km",
        "DLF Mall of India - 3 km",
        "Fortis Hospital - 4 km",
        "Noida City Centre - 6 km",
      ],
    },
    contact: {
      phone: "+91 98765 43210",
      email: "contact@greenmeadows.com",
      agent: "John Doe",
    },
    faq: [
      {
        question: "What is the minimum lease term?",
        answer:
          "The minimum lease term is 6 months, with an option to extend based on mutual agreement.",
      },
      {
        question: "Are utilities included in the rent?",
        answer:
          "No, utilities such as electricity, water, and internet are not included in the rent and will be billed separately.",
      },
      {
        question: "Is parking available?",
        answer:
          "Yes, parking is available for all residents with one designated spot per unit.",
      },
      {
        question: "What is the pet policy?",
        answer:
          "Pets are not allowed in the apartment complex as per the property rules.",
      },
      {
        question: "How can I schedule a visit?",
        answer:
          "You can schedule a visit by contacting our agent directly via phone or email, or by using the 'Schedule a Visit' button on this page.",
      },
    ],
  },
  {
    id: 2,
    about: {
      title: "Silicon",
      description:
        "A modern PG accommodation ideal for students and young professionals. Located in a bustling area with easy access to public transport and local amenities.",
      images: [
        "https://images.unsplash.com/photo-1757711990572-5aa72167eb33?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      ],
      beds: 12,
      baths: 8,
      rooms: 22,
      capacity: 24,
      rent: "₹10,000",
      securityDeposit: "₹20,000",
      lockInPeriod: "1 month",
      noticePeriod: "15 days",
    },
    amenities: [
      { name: "WiFi", icon: FaWifi, available: true },
      { name: "Parking", icon: FaCar, available: false },
      { name: "Power Backup", icon: FaShieldAlt, available: true },
      { name: "CCTV Security", icon: FaLock, available: true },
      { name: "AC Rooms", icon: FaHome, available: false },
      { name: "Kitchen", icon: FaUtensils, available: true },
      { name: "Gym", icon: FaBed, available: false },
      { name: "Laundry", icon: FaBath, available: true },
    ],
    rules: [
      "No smoking in shared areas",
      "Guests not allowed after 10 PM",
      "Maintain hygiene in shared spaces",
      "No loud music after 9 PM",
    ],
    location: {
      address: "Rajendra Nagar, Indore, Madhya Pradesh 234455",
      latitude: 22.7196,
      longitude: 75.8577,
      distance: "2 km from Indore Railway Station",
      nearby: [
        "Indore Railway Station - 2 km",
        "Sarwate Bus Stand - 3 km",
        "Treasure Island Mall - 4 km",
        "Holkar Hospital - 3 km",
      ],
    },
    contact: {
      phone: "+91 91234 56789",
      email: "contact@siliconpg.com",
      agent: "Jane Smith",
    },
    faq: [
      {
        question: "What is the minimum lease term?",
        answer: "The minimum lease term is 1 month, with flexible extensions.",
      },
      {
        question: "Are meals included in the rent?",
        answer: "Meals are optional and can be availed at an additional cost.",
      },
      {
        question: "Is parking available?",
        answer: "Parking is not available at this property.",
      },
      {
        question: "What is the pet policy?",
        answer: "Pets are not allowed in the PG accommodation.",
      },
      {
        question: "How can I schedule a visit?",
        answer: "Contact our agent via phone or email to schedule a visit.",
      },
    ],
  },
  {
    id: 3,
    about: {
      title: "Universal Place",
      description:
        "Luxury bungalows offering spacious living with premium amenities. Ideal for those seeking an upscale lifestyle in a prime location.",
      images: [
        "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      ],
      beds: 16,
      baths: 10,
      rooms: 6,
      capacity: 12,
      rent: "₹75,000",
      securityDeposit: "₹150,000",
      lockInPeriod: "6 months",
      noticePeriod: "60 days",
    },
    amenities: [
      { name: "WiFi", icon: FaWifi, available: true },
      { name: "Parking", icon: FaCar, available: true },
      { name: "Power Backup", icon: FaShieldAlt, available: true },
      { name: "CCTV Security", icon: FaLock, available: true },
      { name: "AC Rooms", icon: FaHome, available: true },
      { name: "Kitchen", icon: FaUtensils, available: true },
      { name: "Gym", icon: FaBed, available: true },
      { name: "Laundry", icon: FaBath, available: true },
    ],
    rules: [
      "No smoking in indoor areas",
      "Pets allowed with prior approval",
      "Quiet hours from 11 PM to 7 AM",
      "No parties without permission",
      "Maintain garden and outdoor areas",
    ],
    location: {
      address: "Film City, Mumbai, Maharashtra 400001",
      latitude: 19.0759,
      longitude: 72.8777,
      distance: "8 km from Chhatrapati Shivaji Airport",
      nearby: [
        "Chhatrapati Shivaji Airport - 8 km",
        "Juhu Beach - 5 km",
        "Infinity Mall - 4 km",
        "Kokilaben Hospital - 3 km",
      ],
    },
    contact: {
      phone: "+91 99876 54321",
      email: "contact@universalplace.com",
      agent: "Michael Brown",
    },
    faq: [
      {
        question: "What is the minimum lease term?",
        answer: "The minimum lease term is 6 months, with an option to extend.",
      },
      {
        question: "Are utilities included in the rent?",
        answer: "Utilities are included in the rent for this property.",
      },
      {
        question: "Is parking available?",
        answer: "Yes, ample parking space is available for residents.",
      },
      {
        question: "What is the pet policy?",
        answer: "Pets are allowed with prior approval from the management.",
      },
      {
        question: "How can I schedule a visit?",
        answer: "Contact our agent via phone or email to schedule a visit.",
      },
    ],
  },
];

const WebsiteDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("about");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    console.log("URL id:", id); // Debug: Log the id from useParams
    const propertyId = parseInt(id, 10); // Explicitly parse as base-10 integer
    console.log("Parsed ID:", propertyId); // Debug: Log parsed ID
    if (isNaN(propertyId)) {
      console.error("Invalid ID:", id);
      setError("Invalid property ID");
      setLoading(false);
      return;
    }

    const foundProperty = mockProperties.find((p) => {
      console.log("Comparing:", p.id, propertyId); // Debug: Log comparison
      return p.id === propertyId;
    });
    console.log("Found property:", foundProperty); // Debug: Log found property

    if (foundProperty) {
      setProperty(foundProperty);
      setSelectedImage(foundProperty.about.images[0]);
      setLoading(false);
    } else {
      console.error("Property not found for ID:", propertyId);
      setError("Property not found");
      setLoading(false);
    }
  }, [id]);

  const scrollToSection = (section) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openImageModal = (img) => {
    setSelectedImage(img);
    setShowImageModal(true);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading Property...</span>
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
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-lg sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">🏠 MyWebsite</div>
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => scrollToSection("about")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeSection === "about"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                aria-label="Go to About section"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("amenities")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeSection === "amenities"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                aria-label="Go to Amenities section"
              >
                Amenities
              </button>
              <button
                onClick={() => scrollToSection("rules")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeSection === "rules"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                aria-label="Go to Rules section"
              >
                Rules
              </button>
              <button
                onClick={() => scrollToSection("location")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeSection === "location"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                aria-label="Go to Location section"
              >
                Location
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeSection === "contact"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                aria-label="Go to Contact section"
              >
                Contact
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeSection === "faq"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                aria-label="Go to FAQ section"
              >
                FAQ
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <FaSearch className="text-gray-600" aria-hidden="true" />
              <button
                className="md:hidden text-blue-600 font-semibold"
                aria-label="Open mobile menu"
              >
                Menu
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                aria-label="Add to wishlist"
              >
                Add to Wishlist
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                aria-label="Share property"
              >
                Share
              </button>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* About Section */}
          <section id="about" className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* Images Gallery */}
                <div className="grid grid-cols-2 gap-2">
                  {property.about.images.map((img, index) => (
                    <motion.div
                      key={index}
                      className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => openImageModal(img)}
                    >
                      <img
                        src={img}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                      {index === 0 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                          +{property.about.images.length - 1}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* About Info */}
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {property.about.title}
                  </h1>
                  <p className="text-gray-600 leading-relaxed">
                    {property.about.description}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg shadow-md">
                      <FaBed
                        className="text-2xl text-blue-500 mx-auto mb-2"
                        aria-hidden="true"
                      />
                      <div className="font-bold text-gray-800">
                        {property.about.beds}
                      </div>
                      <div className="text-sm text-gray-600">Beds</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-md">
                      <FaBath
                        className="text-2xl text-green-500 mx-auto mb-2"
                        aria-hidden="true"
                      />
                      <div className="font-bold text-gray-800">
                        {property.about.baths}
                      </div>
                      <div className="text-sm text-gray-600">Baths</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-md">
                      <div className="text-2xl text-purple-500 mx-auto mb-2">🏠</div>
                      <div className="font-bold text-gray-800">
                        {property.about.rooms}
                      </div>
                      <div className="text-sm text-gray-600">Rooms</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-md">
                      <div className="text-2xl text-indigo-500 mx-auto mb-2">👥</div>
                      <div className="font-bold text-gray-800">
                        {property.about.capacity}
                      </div>
                      <div className="text-sm text-gray-600">Capacity</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {property.about.rent}/month
                        </div>
                        <div className="text-sm text-gray-600">Rent</div>
                      </div>
                      <button
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
                        aria-label="Book this property"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Renting Terms */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Renting Terms
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-sm text-gray-600">Renting Terms</div>
                  <div className="text-lg font-bold text-blue-600">Flexible</div>
                  <button
                    className="mt-2 text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full"
                    aria-label="View renting terms details"
                  >
                    View Details
                  </button>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-sm text-gray-600">Security Deposit</div>
                  <div className="text-lg font-bold text-green-600">
                    {property.about.securityDeposit}
                  </div>
                  <button
                    className="mt-2 text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full"
                    aria-label="Security deposit details"
                  >
                    Refundable
                  </button>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-sm text-gray-600">Lock-in Period</div>
                  <div className="text-lg font-bold text-purple-600">
                    {property.about.lockInPeriod}
                  </div>
                  <button
                    className="mt-2 text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full"
                    aria-label="Lock-in period details"
                  >
                    Details
                  </button>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-sm text-gray-600">Notice Period</div>
                  <div className="text-lg font-bold text-indigo-600">
                    {property.about.noticePeriod}
                  </div>
                  <button
                    className="mt-2 text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full"
                    aria-label="Notice period details"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Amenities Section */}
          <section id="amenities" className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Property Amenities
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {property.amenities.map((amenity, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md flex items-center gap-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <amenity.icon
                      className={`text-2xl ${
                        amenity.available ? "text-green-500" : "text-gray-400"
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-medium text-gray-800">
                        {amenity.name}
                      </div>
                      <div
                        className={`text-sm ${
                          amenity.available ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {amenity.available ? "Available" : "Not Available"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Property Rules Section */}
          <section id="rules" className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Property Rules
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.rules.map((rule, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md flex items-start gap-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{rule}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Location Section */}
          <section id="location" className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Location</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {property.location.address}
                    </h3>
                    <div className="flex items-center gap-2 text-blue-600">
                      <FaMapMarkerAlt aria-hidden="true" />
                      <span className="text-sm">
                        Your current location is {property.location.distance} from
                        this property
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Nearby Landmarks
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {property.location.nearby.map((landmark, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <FaMapMarkerAlt
                            className="text-blue-500"
                            aria-hidden="true"
                          />
                          {landmark}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-64 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <div className="text-center text-white">
                      <FaMapMarkerAlt
                        className="text-4xl mx-auto mb-2"
                        aria-hidden="true"
                      />
                      <div className="text-lg font-semibold">Map View</div>
                      <div className="text-sm">Interactive map coming soon</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact</h2>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Agent Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FaUserEdit
                          className="text-blue-500"
                          aria-hidden="true"
                        />
                        <div>
                          <div className="font-medium text-gray-800">
                            {property.contact.agent}
                          </div>
                          <div className="text-sm text-gray-600">
                            Property Manager
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaPhone
                          className="text-green-500"
                          aria-hidden="true"
                        />
                        <a
                          href={`tel:${property.contact.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {property.contact.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaEnvelope
                          className="text-orange-500"
                          aria-hidden="true"
                        />
                        <a
                          href={`mailto:${property.contact.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {property.contact.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold"
                      aria-label="Schedule a property visit"
                    >
                      Schedule a Visit
                    </button>
                    <p className="text-sm text-gray-600 mt-2">Available 24/7</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaQuestionCircle
                  className="text-blue-500"
                  aria-hidden="true"
                />{" "}
                Frequently Asked Questions
              </h2>
              <div className="bg-white p-6 rounded-lg shadow-md">
                {property.faq.map((item, index) => (
                  <motion.div
                    key={index}
                    className="border-b border-gray-200 last:border-b-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left py-4 flex justify-between items-center font-medium text-gray-800 hover:text-blue-500 transition-colors"
                      aria-expanded={openFaq === index}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <span>{item.question}</span>
                      <span>{openFaq === index ? "−" : "+"}</span>
                    </button>
                    {openFaq === index && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden text-gray-600 text-sm py-2"
                      >
                        {item.answer}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Back to List Button */}
          <section className="mb-12">
            <Link
              to="/organization/web-property-list"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Back to Property List
            </Link>
          </section>
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.img
              src={selectedImage}
              alt="Full size property image"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              aria-label="Close image modal"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-6 py-3 space-x-4 z-40">
          <button
            onClick={() => scrollToSection("about")}
            className="text-gray-600 hover:text-blue-500"
            aria-label="Go to About section"
          >
            <FaHome className="text-xl" aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollToSection("amenities")}
            className="text-gray-600 hover:text-blue-500"
            aria-label="Go to Amenities section"
          >
            <FaWifi className="text-xl" aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollToSection("rules")}
            className="text-gray-600 hover:text-blue-500"
            aria-label="Go to Rules section"
          >
            <FaLock className="text-xl" aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollToSection("location")}
            className="text-gray-600 hover:text-blue-500"
            aria-label="Go to Location section"
          >
            <FaMapMarkerAlt className="text-xl" aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-gray-600 hover:text-blue-500"
            aria-label="Go to Contact section"
          >
            <FaPhone className="text-xl" aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-gray-600 hover:text-blue-500"
            aria-label="Go to FAQ section"
          >
            <FaQuestionCircle className="text-xl" aria-hidden="true" />
          </button>
        </div>

        <style>
          {`
            .drop-shadow-glow {
              filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5));
            }
            @media (max-width: 768px) {
              .grid {
                grid-template-columns: 1fr;
              }
              .md\\:grid-cols-2 {
                grid-template-columns: 1fr;
              }
            }
          `}
        </style>
      </div>
    </ErrorBoundary>
  );
};

export default WebsiteDetail;