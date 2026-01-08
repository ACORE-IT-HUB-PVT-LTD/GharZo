import React, { useEffect, useState, useRef } from "react";
import { BedDouble, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import baseurl from "../../../../BaseUrl";

function AllProperty() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [city, setCity] = useState("");
  const [rooms, setRooms] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [gender, setGender] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 9; // 3 rows × 3 columns

  const searchIconRef = useRef(null);

  // Fetch all properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${baseurl}api/public/all-properties`,
          {
            cache: "no-cache",
          }
        );
        const data = await res.json();
        console.log("API Response:", data);
        const raw = data;

        if (raw?.properties && Array.isArray(raw.properties)) {
          // ✅ Filter: only properties with hasAvailability === true
          const availableProps = raw.properties.filter(
            (item) => item.isActive === true
          );

          const formatted = availableProps.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.images?.[0] || "",
            images: item.images || [],
            address: item.location?.address || "",
            city: item.location?.city || "",
            state: item.location?.state || "",
            location: `${item.location?.city}, ${item.location?.state}`,
            price: item.lowestPrice || item.price || 0,
            bedrooms: item.totalBeds,
            area: item.area || "",
            description: item.description || "",
            propertyType: item.type,
            totalRooms: item.totalRooms,
            totalBeds: item.totalBeds,
            createdAt: item.createdAt || new Date().toISOString(),
            gender:
              item.rooms &&
              item.rooms.length > 0 &&
              item.rooms[0].allFacilities?.propertySpecific?.genderSpecific
                ? item.rooms[0].allFacilities.propertySpecific.genderSpecific.toLowerCase()
                : "unisex",
          }));
          setProperties(formatted);
          setFilteredProperties(formatted);
        } else {
          console.error("Unexpected API response:", raw);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Animate search icon (3D effect)
  useEffect(() => {
    if (searchIconRef.current) {
      gsap.to(searchIconRef.current, {
        y: -2,
        scale: 1.2,
        duration: 0.6,
        ease: "elastic.out(1,0.3)",
        repeat: -1,
        yoyo: true,
      });
    }
  }, []);

  // Auto Filter handler
  useEffect(() => {
    const filtered = properties.filter((property) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        property.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesCity = city
        ? property.city.toLowerCase() === city.toLowerCase()
        : true;

      const matchesType = propertyType
        ? property.propertyType.toLowerCase() === propertyType.toLowerCase()
        : true;

      const matchesRooms = rooms
        ? rooms === "4"
          ? property.totalRooms >= 4
          : property.totalRooms === parseInt(rooms)
        : true;

      const matchesGender = gender
        ? property.gender.toLowerCase() === gender.toLowerCase()
        : true;

      const price = property.price;
      const matchesPrice = (() => {
        if (priceRange === "0-5000") return price <= 5000;
        if (priceRange === "5001-6000") return price > 5000 && price <= 6000;
        if (priceRange === "6001-7000") return price > 6000 && price <= 7000;
        if (priceRange === "7001+") return price > 7000;
        return true;
      })();

      return (
        matchesSearch &&
        matchesCity &&
        matchesType &&
        matchesRooms &&
        matchesGender &&
        matchesPrice
      );
    });

    setFilteredProperties(filtered);
    setCurrentPage(1); // reset pagination on filter
  }, [debouncedSearchTerm, city, rooms, priceRange, gender, propertyType, properties]);

  // Reset handler
  const handleReset = () => {
    setSearchTerm("");
    setCity("");
    setRooms("");
    setPriceRange("");
    setGender("");
    setPropertyType("");
  };

  // Pagination logic
  const indexOfLast = currentPage * propertiesPerPage;
  const indexOfFirst = indexOfLast - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-6 mt-10 text-blue-700">
        All Properties
      </h1>

      {/* Filter Section */}
      <div
        className="max-w-6xl mx-auto mb-8 bg-white/30 backdrop-blur-md border border-blue-500/50 shadow-lg rounded-xl p-4 flex flex-wrap items-center gap-3 justify-center mt-8"
        style={{ boxShadow: "0 0 12px rgba(59,130,246,0.6)" }}
      >
        <div className="relative filter-item w-full sm:w-72">
          <MapPin
            ref={searchIconRef}
            size={18}
            className="absolute left-3 top-[13px]"
          />
          <input
            type="text"
            placeholder="Search by name, city or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border border-blue-500/50 p-2 rounded w-full bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-36 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 filter-item text-sm"
        >
          <option value="">All Types</option>
          {[...new Set(properties.map((p) => p.propertyType).filter((type) => type))]
            .sort()
            .map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
        </select>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-36 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 filter-item text-sm"
        >
          <option value="">All Cities</option>
          {[...new Set(properties.map((p) => p.city).filter((cityName) => cityName))]
            .sort()
            .map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
        </select>

        <select
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-36 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 filter-item text-sm"
        >
          <option value="">All Rooms</option>
          <option value="1">1 Room</option>
          <option value="2">2 Rooms</option>
          <option value="3">3 Rooms</option>
          <option value="4">4+ Rooms</option>
        </select>

        {/* <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-36 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 filter-item text-sm"
        >
          <option value="">All Prices</option>
          <option value="0-5000">₹0 - ₹5,000</option>
          <option value="5001-6000">₹5,001 - ₹6,000</option>
          <option value="6001-7000">₹6,001 - ₹7,000</option>
          <option value="7001+">₹7,001+</option>
        </select> */}

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-32 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 filter-item text-sm"
        >
          <option value="">All Genders</option>
          <option value="girl">Girls</option>
          <option value="boy">Boys</option>
          <option value="unisex">Unisex</option>
        </select>

        <button
          onClick={handleReset}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 filter-item text-sm"
        >
          Reset
        </button>
      </div>

      <div className="min-h-screen bg-[#f6f8fa] py-12 px-4">
        {/* Property Cards */}
        <div className="p-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <p className="text-center text-gray-500">No properties found.</p>
          ) : (
            <>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {currentProperties.map((property) => (
                  <Link to={`/property/${property.id}`} key={property.id}>
                    <div className="relative bg-white rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={
                            property.images?.[0] ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCQILdjI6IvkmXukmIVc7iLEkoa_lt8vcUOyoE8SMWJebAiB_NUaWD_j-4m7Wls1v-fqk&usqp=CAU"
                          }
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">
                          {property.name}
                        </h2>
                        <p className="text-sm text-gray-600 mb-2">
                          {property.address}, {property.city}, {property.state}
                        </p>
                        <div className="text-sm text-gray-700 font-medium">
                          Total Rooms: {property.totalRooms || "N/A"}
                        </div>
                        <div className="text-sm font-medium text-gray-600 mt-1">
                          Type: {property.propertyType}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-10 space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-300"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllProperty;
