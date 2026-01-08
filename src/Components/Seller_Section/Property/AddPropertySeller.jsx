import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaHome,
  FaBuilding,
  FaRupeeSign,
  FaFileAlt,
  FaImage,
  FaMapMarkerAlt,
  FaCity,
  FaGlobe,
  FaMapPin,
  FaEnvelope,
  FaPhoneAlt,
  FaUser,
  FaMapSigns,
  FaMap,
  FaListUl,
  FaLocationArrow,
  FaEdit,
  FaTrash,
  FaExclamationCircle,
  FaCrosshairs, // Added for the "Get Coordinates" button icon
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyAc0p_mCDiRFX_up_KkMCFtlXuoimG3iWg" || "";

// Only keep amenities that are relevant to the API
const amenitiesList = [
  "WiFi",
  "CCTV",
  "Parking",
  "24x7 Water",
];

const AddPropertySeller = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    type: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    landmark: "",
    contactNumber: "",
    ownerName: "",
    description: "",
    amenities: [],
    images: [],
    latitude: "",
    longitude: "",
    _id: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Track edit mode explicitly
  const [geoLoading, setGeoLoading] = useState(false); // For geocoding loading state
  const [geoError, setGeoError] = useState(null); // For geocoding errors

  // Validation patterns
  const validationPatterns = {
    name: /^[a-zA-Z\s]+$/,
    description: /^[a-zA-Z\s.,!?-]+$/,
    address: /^[a-zA-Z0-9\s,.-]+$/,
    city: /^[a-zA-Z\s]+$/,
    state: /^[a-zA-Z\s]+$/,
    pinCode: /^\d{6}$/,
    contactNumber: /^\d{10}$/,
    ownerName: /^[a-zA-Z\s]+$/,
    latitude: /^-?\d+(\.\d+)?$/,
    longitude: /^-?\d+(\.\d+)?$/,
  };

  // Function to fetch latitude and longitude from address using Google Maps Geocoding API
  const fetchCoordinates = async () => {
    if (!form.address || !form.city || !form.state) {
      setGeoError("Please fill in Address, City, and State to fetch coordinates.");
      return;
    }

    const fullAddress = `${form.address}, ${form.city}, ${form.state}${form.pinCode ? ` ${form.pinCode}` : ''}${form.landmark ? `, ${form.landmark}` : ''}`;
    
    setGeoLoading(true);
    setGeoError(null);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setForm(prev => ({
          ...prev,
          latitude: location.lat.toString(),
          longitude: location.lng.toString(),
        }));
        setApiSuccess("Coordinates fetched successfully!"); // Reuse success state for feedback
        setGeoError(null);
      } else {
        setGeoError(`Unable to fetch coordinates. Status: ${data.status}`);
      }
    } catch (err) {
      setGeoError("Failed to fetch coordinates. Please check your internet connection.");
      console.error("Geocoding error:", err);
    } finally {
      setGeoLoading(false);
    }
  };

  // Fetch property details if propertyId is provided
  useEffect(() => {
    const fetchProperty = async () => {
      const id = new URLSearchParams(window.location.search).get("id");
      if (id) {
        setApiLoading(true);
        try {
          const token = localStorage.getItem("sellertoken");
          if (!token) throw new Error("No authentication token found.");

          const res = await axios.get(`${baseurl}api/seller/getproperties/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.data && res.data.property) {
            const property = res.data.property;
            let images = property.images || [];

            // Fetch latest images using get-image API
            try {
              const imgRes = await axios.get(`${baseurl}api/seller/get-image/${id}/images`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (imgRes.data.success && imgRes.data.images) {
                images = imgRes.data.images.filter(img => img && img !== "/uploads/properties/undefined");
              }
            } catch (imgErr) {
              console.error("Failed to fetch images:", imgErr);
              // Fallback to property.images, filtered
              images = images.filter(img => img && img !== "/uploads/properties/undefined");
            }

            setForm({
              name: property.name || "",
              type: property.type || "",
              address: property.address || "",
              city: property.city || "",
              state: property.state || "",
              pinCode: property.pinCode || "",
              landmark: property.landmark || "",
              contactNumber: property.contactNumber || "",
              ownerName: property.ownerName || "",
              description: property.description || "",
              amenities: property.amenities || [],
              images,
              latitude: property.latitude || "",
              longitude: property.longitude || "",
              _id: property._id || "",
            });
            setPropertyId(property._id);
            setIsEditing(true);
          }
        } catch (err) {
          setApiError("Failed to fetch property details.");
        } finally {
          setApiLoading(false);
        }
      }
    };

    fetchProperty();
  }, []);

  const validateField = (name, value) => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required.`;
    }
    if (validationPatterns[name]) {
      if (!validationPatterns[name].test(value)) {
        let patternDesc;
        switch (name) {
          case 'name':
          case 'ownerName':
          case 'city':
          case 'state':
            patternDesc = 'only letters allowed';
            break;
          case 'description':
            patternDesc = 'only letters, spaces, and common punctuation allowed';
            break;
          case 'address':
            patternDesc = 'only letters, numbers, spaces, commas, periods, hyphens, and dots allowed';
            break;
          case 'pinCode':
            patternDesc = 'exactly 6 digits required';
            break;
          case 'contactNumber':
            patternDesc = 'exactly 10 digits required';
            break;
          case 'latitude':
          case 'longitude':
            patternDesc = 'valid decimal number required';
            break;
          default:
            patternDesc = 'invalid format';
        }
        return `Invalid format for ${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}. ${patternDesc}.`;
      }
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const validateStep = () => {
    let newErrors = {};
    let isValid = true;

    const requiredFieldsByStep = {
      1: ['name', 'type', 'description'],
      2: ['address', 'city', 'state', 'pinCode'],
      3: ['contactNumber', 'ownerName', 'latitude', 'longitude'],
    };

    const currentRequired = requiredFieldsByStep[step] || [];
    currentRequired.forEach(field => {
      const error = validateField(field, form[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Type validation for step 1
    if (step === 1 && !form.type) {
      newErrors.type = 'Property type is required.';
      isValid = false;
    }

    // Amenities optional, but if required, add check
    // Assuming optional as per original

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return; // Validate current step (step 4 has no specific fields beyond previous)

    // Final full validation
    let fullErrors = {};
    Object.keys(form).forEach(key => {
      if (key !== 'amenities' && key !== 'images' && key !== '_id') {
        const error = validateField(key, form[key]);
        if (error) fullErrors[key] = error;
      }
    });

    if (Object.keys(fullErrors).length > 0) {
      setErrors(fullErrors);
      return;
    }

    setApiLoading(true);
    setApiError(null);
    setApiSuccess(null);

    const payload = {
      ...form,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
    };

    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) throw new Error("No authentication token found.");

      // Prepare FormData for property without images
      const propertyFormData = new FormData();
      Object.keys(payload).forEach((key) => {
        if (key === "amenities") {
          propertyFormData.append(key, JSON.stringify(payload[key]));
        } else if (key !== "images" && key !== "_id") {
          propertyFormData.append(key, payload[key] || "");
        }
      });

      const url = propertyId
        ? `${baseurl}api/seller/edit-property/${propertyId}`
        : `${baseurl}api/seller/add-property`;
      const method = propertyId ? "put" : "post";

      const res = await axios({
        method,
        url,
        data: propertyFormData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      let successMessage = res.data.message || (propertyId ? "Property updated successfully!" : "Property added successfully!");
      let currentPropertyId = res.data.property?._id || propertyId;

      // Handle image upload if there are new files
      if (imageFiles.length > 0) {
        const imageFormData = new FormData();
        imageFiles.forEach((file) => imageFormData.append("images", file));

        const imgRes = await axios.post(
          `${baseurl}api/seller/add-image/${currentPropertyId}`,
          imageFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (imgRes.data.success) {
          const validImages = imgRes.data.images.filter(img => img && img !== "/uploads/properties/undefined");
          setForm(prev => ({ 
            ...prev, 
            images: [...prev.images, ...validImages] 
          }));
          successMessage += ` Images added successfully.`;
        } else {
          setApiError(imgRes.data.message || "Image upload failed.");
        }
      }

      if (res.data.success) {
        setApiSuccess(successMessage);
        setPropertyId(currentPropertyId);
        if (!propertyId) {
          setForm({
            name: "",
            type: "",
            address: "",
            city: "",
            state: "",
            pinCode: "",
            landmark: "",
            contactNumber: "",
            ownerName: "",
            description: "",
            amenities: [],
            images: [],
            latitude: "",
            longitude: "",
            _id: "",
          });
          setImageFiles([]);
          setStep(1);
          navigate('/seller/property');
        }
      } else {
        setApiError(res.data.message || "Failed to save property.");
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        err.message ||
        "Failed to save property."
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!propertyId || !window.confirm("Are you sure you want to delete this property?")) return;

    setApiLoading(true);
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) throw new Error("No authentication token found.");

      const res = await axios.delete(`${baseurl}api/seller/delete-property/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setApiSuccess("Property deleted successfully!");
        setForm({
          name: "",
          type: "",
          address: "",
          city: "",
          state: "",
          pinCode: "",
          landmark: "",
          contactNumber: "",
          ownerName: "",
          description: "",
          amenities: [],
          images: [],
          latitude: "",
          longitude: "",
          _id: "",
        });
        setImageFiles([]);
        setPropertyId(null);
        setStep(1);
      } else {
        setApiError(res.data.message || "Failed to delete property.");
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete property."
      );
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const inputBox = (icon, props) => {
    const fieldName = props.name;
    return (
      <div className="w-full">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition">
          <span className="text-indigo-600 text-lg pr-2 drop-shadow-lg">
            {icon}
          </span>
          <input
            {...props}
            className="flex-1 bg-transparent outline-none text-black placeholder-gray-500"
          />
        </div>
        {errors[fieldName] && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <FaExclamationCircle className="mr-1" /> {errors[fieldName]}
          </p>
        )}
      </div>
    );
  };

  const renderImageGallery = (images, maxHeight = "h-48") => (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto ${maxHeight}`}>
      {images.map((imagePath, index) => (
        <img
          key={index}
          src={`${baseurl}${imagePath}`}
          alt={`Property image ${index + 1}`}
          className="w-full h-24 sm:h-32 object-cover rounded-lg border"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ))}
    </div>
  );

  const renderPreview = () => (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-indigo-600 mb-4">Property Preview</h3>
      <p><strong>Name:</strong> {form.name || "Not provided"}</p>
      <p><strong>Type:</strong> {form.type || "Not provided"}</p>
      <p><strong>Description:</strong> {form.description || "Not provided"}</p>
      <div className="mb-2">
        <strong>Images:</strong> 
        {form.images.length > 0 ? (
          <>
            <span> {form.images.length} images</span>
            {renderImageGallery(form.images, "h-32")}
          </>
        ) : (
          (imageFiles.length > 0 ? `${imageFiles.length} new files selected` : "Not provided")
        )}
      </div>
      <p><strong>Address:</strong> {form.address}, {form.city}, {form.state} - {form.pinCode || "Not provided"}</p>
      <p><strong>Landmark:</strong> {form.landmark || "Not provided"}</p>
      <p><strong>Contact Number:</strong> {form.contactNumber || "Not provided"}</p>
      <p><strong>Owner Name:</strong> {form.ownerName || "Not provided"}</p>
      <p><strong>Amenities:</strong> {form.amenities.length > 0 ? form.amenities.join(", ") : "None selected"}</p>
      <p><strong>Latitude:</strong> {form.latitude || "Not provided"}</p>
      <p><strong>Longitude:</strong> {form.longitude || "Not provided"}</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 px-2 sm:px-6 bg-white flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white w-full max-w-6xl p-4 sm:p-8 rounded-2xl shadow-2xl border border-gray-300"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 mb-6 text-center drop-shadow-lg">
          🏠 {isEditing ? "Edit Property" : "Add Property"} (Step {step}/4)
        </h2>

        {/* API feedback */}
        {apiError && (
          <div className="mb-4 text-red-600 text-center font-semibold">{apiError}</div>
        )}
        {apiSuccess && (
          <div className="mb-4 text-green-600 text-center font-semibold">{apiSuccess}</div>
        )}

        {/* Geocoding feedback (shown in step 2) */}
        {step === 2 && geoError && (
          <div className="mb-4 text-red-600 text-center font-semibold">{geoError}</div>
        )}

        {/* Edit/Delete Buttons (visible only when editing) */}
        {isEditing && (
          <div className="flex justify-end gap-4 mb-6">
            <button
              type="button"
              onClick={() => {/* Edit action handled by form submission */}}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              disabled={apiLoading}
            >
              <FaEdit className="mr-2" /> Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              disabled={apiLoading}
            >
              <FaTrash className="mr-2" /> Delete
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {inputBox(<FaHome />, {
                  name: "name",
                  value: form.name,
                  onChange: handleChange,
                  placeholder: "Property Name",
                  required: true,
                })}
                <div className="w-full">
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition">
                    <span className="text-indigo-600 text-lg pr-2 drop-shadow-lg">
                      <FaBuilding />
                    </span>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="flex-1 bg-transparent outline-none text-black"
                      required
                    >
                      <option value="">Select Property Type</option>
                      <option value="PG">PG</option>
                      <option value="Flat">Flat</option>
                      <option value="Hostel">Hostel</option>
                    </select>
                  </div>
                  {errors.type && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationCircle className="mr-1" /> {errors.type}
                    </p>
                  )}
                </div>
                {inputBox(<FaFileAlt />, {
                  name: "description",
                  value: form.description,
                  onChange: handleChange,
                  placeholder: "Description",
                  required: true,
                })}
                {/* Image file input */}
                <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition w-full">
                  <span className="text-indigo-600 text-lg pr-2 drop-shadow-lg">
                    <FaImage />
                  </span>
                  <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 bg-transparent outline-none text-black"
                  />
                </div>
                {/* Show selected image names */}
                {imageFiles.length > 0 && (
                  <div className="text-xs text-gray-600 px-2">
                    Selected: {imageFiles.map(f => f.name).join(", ")}
                  </div>
                )}
                {/* Show current images gallery */}
                {form.images.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 px-2 mb-1">Current Images ({form.images.length}):</div>
                    {renderImageGallery(form.images, "h-48")}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {inputBox(<FaMapMarkerAlt />, {
                  name: "address",
                  value: form.address,
                  onChange: handleChange,
                  placeholder: "Full Address",
                  required: true,
                })}
                {inputBox(<FaCity />, {
                  name: "city",
                  value: form.city,
                  onChange: handleChange,
                  placeholder: "City",
                  required: true,
                })}
                {inputBox(<FaGlobe />, {
                  name: "state",
                  value: form.state,
                  onChange: handleChange,
                  placeholder: "State",
                  required: true,
                })}
                {inputBox(<FaMapPin />, {
                  name: "pinCode",
                  type: "text",
                  value: form.pinCode,
                  onChange: handleChange,
                  placeholder: "Pincode",
                  required: true,
                })}
                {inputBox(<FaMapSigns />, {
                  name: "landmark",
                  value: form.landmark,
                  onChange: handleChange,
                  placeholder: "Landmark (optional)",
                })}
                {/* Get Coordinates Button */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={fetchCoordinates}
                    disabled={geoLoading || !GOOGLE_MAPS_API_KEY}
                    className={`w-full flex items-center justify-center py-2 px-4 rounded-lg transition font-medium ${
                      geoLoading || !GOOGLE_MAPS_API_KEY
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    <FaCrosshairs className="mr-2" />
                    {geoLoading ? "Fetching Coordinates..." : "Get Coordinates from Address"}
                  </button>
                  {!GOOGLE_MAPS_API_KEY && (
                    <p className="text-red-500 text-xs mt-1">Google Maps API key is missing.</p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {inputBox(<FaPhoneAlt />, {
                  name: "contactNumber",
                  type: "tel",
                  value: form.contactNumber,
                  onChange: handleChange,
                  placeholder: "Contact Number",
                  required: true,
                })}
                {inputBox(<FaUser />, {
                  name: "ownerName",
                  value: form.ownerName,
                  onChange: handleChange,
                  placeholder: "Owner Name",
                  required: true,
                })}
                <h3 className="text-lg font-semibold text-indigo-600 mb-4">Select Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {amenitiesList.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center justify-center py-2 px-3 rounded-lg transition ${
                        form.amenities.includes(amenity)
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <FaCheckCircle className="mr-2" />
                      {amenity}
                    </button>
                  ))}
                </div>
                {inputBox(<FaLocationArrow />, {
                  name: "latitude",
                  type: "number",
                  value: form.latitude,
                  onChange: handleChange,
                  placeholder: "Latitude (optional)",
                  step: "any",
                })}
                {inputBox(<FaLocationArrow />, {
                  name: "longitude",
                  type: "number",
                  value: form.longitude,
                  onChange: handleChange,
                  placeholder: "Longitude (optional)",
                  step: "any",
                })}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {renderPreview()}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                disabled={apiLoading}
              >
                Previous
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md"
                disabled={apiLoading}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-md"
                disabled={apiLoading}
              >
                {apiLoading ? "Submitting..." : isEditing ? "Update Property" : "Submit Property"}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddPropertySeller;