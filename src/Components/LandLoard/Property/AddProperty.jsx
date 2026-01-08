import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import baseurl from "../../../../BaseUrl";
import {
  FaHome,
  FaMapMarkerAlt,
  FaCity,
  FaMap,
  FaMapPin,
  FaBed,
  FaDoorOpen,
  FaImage,
  FaMoneyBillWave,
  FaUsers,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProperty = ({ propertyData }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: propertyData?.name || "",
    type: propertyData?.type || "PG",
    address: propertyData?.address || "",
    city: propertyData?.city || "",
    state: propertyData?.state || "",
    pinCode: propertyData?.pinCode || "",
    totalRooms: propertyData?.totalRooms || "",
    totalBeds: propertyData?.totalBeds || "",
    rent: propertyData?.rent || "",
    furnished: propertyData?.furnished || false,
    description: propertyData?.description || "",
  });

  const [roomData, setRoomData] = useState({
    price: propertyData?.roomData?.price || "",
    capacity: propertyData?.roomData?.capacity || 1,
    status: propertyData?.roomData?.status || "Available",
    facilities: propertyData?.roomData?.facilities || {
      roomEssentials: {
        bed: false,
        table: false,
        chair: false,
        fan: false,
        light: false,
      },
      comfortFeatures: { ac: false, geyser: false },
      washroomHygiene: { attachedWashroom: false, westernToilet: false },
      utilitiesConnectivity: { wifi: false, powerBackup: false },
      laundryHousekeeping: { laundry: false, housekeeping: false },
      securitySafety: { cctv: false, securityGuard: false },
      parkingTransport: { bikeParking: false, carParking: false },
      propertySpecific: { kitchen: false, balcony: false },
      nearbyFacilities: { market: false, hospital: false },
    },
    beds: propertyData?.roomData?.beds || [{ price: "", status: "Available" }],
  });

  const [images, setImages] = useState(propertyData?.images || []);
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Detect sidebar hover state
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);

      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  const validateField = (name, value) => {
    if (!value.toString().trim()) {
      return "This field is required";
    }
    if (["name", "city", "state"].includes(name)) {
      if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
        return "Letters only allowed";
      }
    } else if (name === "address") {
      if (!/^[a-zA-Z0-9\s.,-]+$/.test(value.trim())) {
        return "Letters, numbers, spaces, commas, periods, and hyphens only allowed";
      }
    } else if (name === "pinCode") {
      if (!/^\d{6}$/.test(value.trim())) {
        return "Must be exactly 6 digits";
      }
    }
    return "";
  };

  // Fetch property if editing
  useEffect(() => {
    if (id && !propertyData) {
      const fetchProperty = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Not authenticated. Please login.");
            return;
          }

          const response = await axios.get(
            `${baseurl}api/landlord/properties/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = response.data.property;

          const transformFacilities = (facilitiesData) => {
            if (!facilitiesData) return roomData.facilities;
            const defaultFacilities = {
              roomEssentials: {
                bed: false,
                table: false,
                chair: false,
                fan: false,
                light: false,
              },
              comfortFeatures: { ac: false, geyser: false },
              washroomHygiene: {
                attachedWashroom: false,
                westernToilet: false,
              },
              utilitiesConnectivity: { wifi: false, powerBackup: false },
              laundryHousekeeping: { laundry: false, housekeeping: false },
              securitySafety: { cctv: false, securityGuard: false },
              parkingTransport: { bikeParking: false, carParking: false },
              propertySpecific: { kitchen: false, balcony: false },
              nearbyFacilities: { market: false, hospital: false },
            };

            const transformed = { ...defaultFacilities };
            Object.keys(facilitiesData).forEach((key) => {
              if (
                typeof facilitiesData[key] === "object" &&
                facilitiesData[key] !== null
              ) {
                Object.assign(transformed[key] || {}, facilitiesData[key]);
              } else {
                Object.keys(defaultFacilities).forEach((category) => {
                  if (defaultFacilities[category][key] !== undefined) {
                    transformed[category][key] = !!facilitiesData[key];
                  }
                });
              }
            });
            return transformed;
          };

          setFormData({
            name: data.name || "",
            type: data.type || "PG",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            pinCode: data.pinCode || "",
            totalRooms: data.totalRooms || "",
            totalBeds: data.totalBeds || "",
            rent: data.monthlyCollection || "",
            furnished: data.isActive || false,
            description: data.description || "",
          });
          setRoomData({
            price: data.roomData?.price || "",
            capacity: data.roomData?.capacity || 1,
            status: data.roomData?.status || "Available",
            facilities: transformFacilities(data.roomData?.facilities),
            beds: data.roomData?.beds || [{ price: "", status: "Available" }],
          });
          setImages(data.images || []);
          setErrors({});
        } catch (err) {
          toast.error("Failed to fetch property data");
          console.error(err);
        }
      };
      fetchProperty();
    } else if (propertyData) {
      const transformFacilities = (facilitiesData) => {
        if (!facilitiesData) return roomData.facilities;
        const defaultFacilities = {
          roomEssentials: {
            bed: false,
            table: false,
            chair: false,
            fan: false,
            light: false,
          },
          comfortFeatures: { ac: false, geyser: false },
          washroomHygiene: { attachedWashroom: false, westernToilet: false },
          utilitiesConnectivity: { wifi: false, powerBackup: false },
          laundryHousekeeping: { laundry: false, housekeeping: false },
          securitySafety: { cctv: false, securityGuard: false },
          parkingTransport: { bikeParking: false, carParking: false },
          propertySpecific: { kitchen: false, balcony: false },
          nearbyFacilities: { market: false, hospital: false },
        };

        const transformed = { ...defaultFacilities };
        Object.keys(facilitiesData).forEach((key) => {
          if (
            typeof facilitiesData[key] === "object" &&
            facilitiesData[key] !== null
          ) {
            Object.assign(transformed[key] || {}, facilitiesData[key]);
          } else {
            Object.keys(defaultFacilities).forEach((category) => {
              if (defaultFacilities[category][key] !== undefined) {
                transformed[category][key] = !!facilitiesData[key];
              }
            });
          }
        });
        return transformed;
      };

      setRoomData({
        price: propertyData.roomData?.price || "",
        capacity: propertyData.roomData?.capacity || 1,
        status: propertyData.roomData?.status || "Available",
        facilities: transformFacilities(propertyData.roomData?.facilities),
        beds: propertyData.roomData?.beds || [
          { price: "", status: "Available" },
        ],
      });
      setErrors({});
    }
  }, [id, propertyData]);

  // Handlers
  const handlePropertyChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    const error = validateField(name, newValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    setRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast.error("You can upload a maximum of 10 images.");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...previewUrls]);
    toast.success(`${files.length} image(s) selected for upload`);
  };

  // Delete image handler
  const handleDeleteImage = async (index) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated. Please login.");
      return;
    }

    const imageToDelete = images[index];
    const isNewImage = imageToDelete.startsWith("blob:");

    if (isNewImage) {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
      setImages((prev) => prev.filter((_, i) => i !== index));
      URL.revokeObjectURL(imageToDelete);
      toast.success("Image deleted successfully");
    } else {
      try {
        await axios.delete(`${baseurl}api/landlord/properties/images`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            propertyId: id,
            imageUrls: [imageToDelete],
          },
        });
        setImages((prev) => prev.filter((_, i) => i !== index));
        toast.success("Image deleted successfully");
      } catch (err) {
        console.error("Error deleting image:", err);
        toast.error(
          `Error deleting image: ${err.response?.data?.message || err.message}`
        );
      }
    }
  };

  // Upload images to the dedicated endpoint
  const uploadImages = async (propertyId, token) => {
    try {
      const imageFormData = new FormData();
      imageFormData.append("propertyId", propertyId);
      imageFiles.forEach((file) => {
        imageFormData.append(`images`, file);
      });

      const response = await axios.post(
        `${baseurl}api/landlord/properties/images`,
        imageFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Images uploaded successfully!");
        return response.data.images || [];
      } else {
        throw new Error("Failed to upload images");
      }
    } catch (err) {
      console.error("Error uploading images:", err);
      toast.error(
        `Error uploading images: ${err.response?.data?.message || err.message}`
      );
      return [];
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate all fields on submit
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (["name", "type", "address", "city", "state", "pinCode", "description"].includes(key)) {
        newErrors[key] = validateField(key, formData[key]);
      }
    });
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err);
    if (hasErrors) {
      toast.error("Please fix the errors in the form.");
      setSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated. Please login.");
      setSubmitting(false);
      return;
    }

    try {
      const propertyPayload = {
        ...formData,
        monthlyCollection: formData.rent, // FIX here
        roomData: {
          price: roomData.price,
          capacity: roomData.capacity,
          status: roomData.status,
          facilities: roomData.facilities,
          beds: roomData.beds,
        },
      };

      let propertyResponse;
      if (id) {
        propertyResponse = await axios.put(
          `${baseurl}api/landlord/properties/${id}`,
          propertyPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        propertyResponse = await axios.post(
          `${baseurl}api/landlord/properties`,
          propertyPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (propertyResponse.status === 200 || propertyResponse.status === 201) {
        const propertyId = id || propertyResponse.data.property?._id;
        if (!propertyId) {
          throw new Error("Property ID not found in response");
        }

        let uploadedImages = [];
        if (imageFiles.length > 0) {
          uploadedImages = await uploadImages(propertyId, token);
        }

        toast.success(`Property ${id ? "updated" : "added"} successfully!`);
        navigate("/landlord/property");
      }
    } catch (err) {
      console.error("Error submitting property:", err);
      toast.error(
        `Error ${id ? "updating" : "adding"} property: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "PG",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      totalRooms: "",
      totalBeds: "",
      rent: "",
      furnished: false,
      description: "",
    });
    setRoomData({
      price: "",
      capacity: 1,
      status: "Available",
      facilities: {
        roomEssentials: {
          bed: false,
          table: false,
          chair: false,
          fan: false,
          light: false,
        },
        comfortFeatures: { ac: false, geyser: false },
        washroomHygiene: { attachedWashroom: false, westernToilet: false },
        utilitiesConnectivity: { wifi: false, powerBackup: false },
        laundryHousekeeping: { laundry: false, housekeeping: false },
        securitySafety: { cctv: false, securityGuard: false },
        parkingTransport: { bikeParking: false, carParking: false },
        propertySpecific: { kitchen: false, balcony: false },
        nearbyFacilities: { market: false, hospital: false },
      },
      beds: [{ price: "", status: "Available" }],
    });
    setImages([]);
    setImageFiles([]);
    setMessage("");
    setErrors({});
  };

  const inputStyle =
    "w-full rounded-lg px-0 py-2 bg-gray-50 text-black placeholder-gray-500 border border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 transition-all";
  const iconStyle =
    "absolute left-2 top-5 transform -translate-y-1/2 text-blue-400 drop-shadow-lg";

  const isUpdate = !!id;

  return (
    <div
      className={`px-2 py-4 md:px-20 min-h-screen text-white bg-white transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <motion.div
        className="mx-auto p-4 bg-gray-100 border border-green-800 shadow-xl rounded-2xl mt-20 mb-20 lg:mt-10 w-[370px] md:w-[600px] lg:w-[1000px]  "
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-black drop-shadow-lg">
          {isUpdate ? "Update Property" : "Add Property"}
        </h2>

        {message && (
          <p
            className={`mb-4 text-center font-medium ${
              message.includes("Success") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* PROPERTY DETAILS */}
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">
              Property Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {[
                { name: "name", placeholder: "Property Name", icon: FaHome },
                {
                  name: "type",
                  placeholder: "Type",
                  icon: FaDoorOpen,
                  select: true,
                  options: [
                    "PG",
                    "Hostel",
                    "Room",
                    "Flat",
                    "Rental",
                    "1 BHK",
                    "2 BHK",
                    "3 BHK",
                    "4 BHK",
                    "1 RK",
                    "Studio Apartment",
                    "Luxury Bungalows",
                    "Villas",
                    "Builder Floor",
                  ],
                },
                { name: "address", placeholder: "Address", icon: FaMapMarkerAlt },
                { name: "city", placeholder: "City", icon: FaCity },
                { name: "state", placeholder: "State", icon: FaMap },
                { name: "pinCode", placeholder: "Pin Code", icon: FaMapPin },
                {
                  name: "description",
                  placeholder: "Property Description",
                  icon: FaHome,
                  textarea: true,
                },
              ].map((f, i) => (
                <div className="relative" key={i}>
                  <motion.div
                    whileHover={{ rotateX: 10, rotateY: -10 }}
                    className="absolute"
                  >
                    {<f.icon className={iconStyle} />}
                  </motion.div>
                  {f.select ? (
                    <select
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handlePropertyChange}
                      className={`${inputStyle} ${
                        errors[f.name] ? "border-red-500" : ""
                      }`}
                    >
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.textarea ? (
                    <textarea
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handlePropertyChange}
                      placeholder={f.placeholder}
                      className={`${inputStyle} h-24 resize-y ${
                        errors[f.name] ? "border-red-500" : ""
                      }`}
                    />
                  ) : (
                    <input
                      type={
                        f.name === "rent" ||
                        f.name.includes("Rooms") ||
                        f.name.includes("Beds")
                          ? "number"
                          : "text"
                      }
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handlePropertyChange}
                      placeholder={f.placeholder}
                      className={`${inputStyle} ${
                        errors[f.name] ? "border-red-500" : ""
                      }`}
                    />
                  )}
                  {errors[f.name] && (
                    <p className="text-red-500 text-sm mt-1 pl-10">
                      {errors[f.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* IMAGES */}
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">
              Property Images
            </h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Property ${index}`}
                      className="h-24 w-24 object-cover rounded-lg border border-gray-300 shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full shadow-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              <div className="relative">
                <FaImage className={iconStyle} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full border border-blue-800 rounded-lg px-10 py-2"
                />
              </div>
            </div>
          </section>

          {/* BUTTONS */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {submitting
                ? isUpdate
                  ? "Updating..."
                  : "Submitting..."
                : isUpdate
                ? "Update Property"
                : "Add Property"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProperty;