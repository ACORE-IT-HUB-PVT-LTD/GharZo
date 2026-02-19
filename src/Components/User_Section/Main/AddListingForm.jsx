import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiHome, FiMapPin, FiCamera, FiCheckCircle, FiEye, FiChevronRight,
  FiChevronLeft, FiPlus, FiMinus, FiX, FiUpload, FiPhone, FiMail,
  FiUser, FiDollarSign, FiLayers, FiShield, FiZap, FiDroplet,
  FiWifi, FiTruck, FiStar, FiInfo, FiAlertCircle, FiCheck,
  FiSearch, FiLoader, FiGrid, FiBriefcase, FiKey, FiClock,
  FiCalendar, FiAward, FiTool, FiPackage, FiSun, FiWind, FiMenu
} from "react-icons/fi";
import {
  MdPool, MdFitnessCenter, MdSecurity, MdLocalParking, MdElevator,
  MdOutdoorGrill, MdSolarPower, MdBalcony, MdKitchen, MdBed,
  MdChair, MdAir, MdLocalLaundryService, MdOutlineGasMeter,
  MdOutlineWaterDrop, MdFireExtinguisher, MdPets, MdOutlineApartment,
  MdVilla, MdStorefront, MdOutlineWarehouse, MdDoorSliding
} from "react-icons/md";
import { BiBuildingHouse, BiBuildings, BiArea } from "react-icons/bi";
import {
  GiFireplace, GiParkBench, GiCctvCamera, GiWaterTower
} from "react-icons/gi";
import { TbBuildingCommunity, TbSwimming, TbParking } from "react-icons/tb";
import { RiHotelBedLine, RiParkingBoxLine, RiBuilding2Line } from "react-icons/ri";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { LuBuilding2, LuBath } from "react-icons/lu";
import { PiHouseLine, PiBuilding, PiBuildingApartment } from "react-icons/pi";

const API_BASE = "https://api.gharzoreality.com/api/v2/properties";
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const getAuthToken = () => localStorage.getItem("usertoken");

const STEPS = [
  { id: "property-type", label: "Property Details", icon: FiHome, score: null },
  { id: "location-details", label: "Address", icon: FiMapPin, score: 15 },
  { id: "upload-photos", label: "Photos", icon: FiCamera, score: 15 },
  { id: "ownership-details", label: "Verify", icon: FiShield, score: 20 },
  { id: "property-features", label: "Property Highlights", icon: FiStar, score: null },
  { id: "preview-submit", label: "Review", icon: FiEye, score: null },
];

// Toast Component
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium min-w-[280px] animate-slide-in
            ${t.type === "success" ? "bg-emerald-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500"}`}
        >
          {t.type === "success" ? <FiCheck size={16} /> : <FiAlertCircle size={16} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100">
            <FiX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// Counter Box Component
function CounterBox({ label, value, onChange, min = 0, max = 20, icon: Icon }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
        <Icon size={20} />
      </div>
      <span className="text-xs text-gray-500 font-medium text-center">{label}</span>
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-violet-50 hover:text-violet-600 transition-colors"
        >
          <FiMinus size={12} />
        </button>
        <span className="w-6 text-center font-bold text-gray-800 text-sm">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-violet-50 hover:text-violet-600 transition-colors"
        >
          <FiPlus size={12} />
        </button>
      </div>
    </div>
  );
}

// Selection Card
function SelectCard({ label, icon: Icon, selected, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer text-center
        ${selected
          ? "border-violet-500 bg-violet-50 text-violet-700"
          : "border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:bg-violet-50/50"
        } ${className}`}
    >
      {Icon && <Icon size={22} />}
      <span className="text-xs font-medium leading-tight">{label}</span>
    </button>
  );
}

// Chip Toggle
function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
        ${selected
          ? "bg-violet-600 border-violet-600 text-white"
          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"}`}
    >
      {label}
    </button>
  );
}

// Input Field with validation
function InputField({ label, required, error, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <FiAlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all bg-white
        ${props.disabled ? "bg-gray-50 opacity-60" : ""}
        ${className}`}
    />
  );
}

function SelectInput({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 
        focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all bg-white appearance-none
        ${className}`}
    >
      {children}
    </select>
  );
}

// Main Component
export default function PropertyListingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [propertyId, setPropertyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Form Data
  const [form, setForm] = useState({
    // Step 1
    category: "Residential",
    propertyType: "",
    listingType: "Rent",
    // Step 2 - Basic
    title: "",
    description: "",
    bhk: 2,
    bathrooms: 1,
    balconies: 1,
    propertyAge: "",
    availableFrom: "",
    floor: { current: 0, total: 1 },
    area: { carpet: "", builtUp: "", unit: "sqft" },
    price: {
      amount: "",
      negotiable: true,
      securityDeposit: "",
      maintenanceCharges: { amount: "", frequency: "Monthly" },
      lockInPeriod: "",
      noticePeriod: "",
      per: "Property",
    },
    // Step 3 - Features
    furnishing: { type: "Unfurnished", items: [] },
    parking: { covered: 0, open: 0 },
    facing: "",
    amenities: { society: [], security: [], essential: [], nearby: [] },
    propertyFeatures: {
      powerBackup: "",
      waterSupply: "",
      gatedSecurity: false,
      liftAvailable: false,
      petFriendly: false,
      bachelorsAllowed: false,
      nonVegAllowed: false,
      electricityStatus: "Available",
      flooring: "",
      ceilingHeight: "",
      overlooking: [],
      widthOfFacingRoad: "",
      boundaryWall: false,
      corners: 0,
      fireSafety: { fireExtinguisher: false, fireSensor: false, sprinklers: false },
      constructionQuality: "",
      rainwaterHarvesting: false,
      wasteDisposal: "",
      servantsRoom: false,
      studyRoom: false,
      poojaRoom: false,
      storeRoom: false,
    },
    // Step 4 - Location
    location: {
      address: "",
      city: "",
      locality: "",
      subLocality: "",
      landmark: "",
      pincode: "",
      state: "",
      coordinates: { latitude: null, longitude: null },
    },
    // Step 5 - Ownership
    ownership: {
      type: "",
      verified: false,
      occupancyCertificate: false,
      approvedBy: [],
      stampDutyCharges: "Excluded - Paid by Buyer",
      registrationCharges: "Excluded - Paid by Buyer",
      propertyTaxPerYear: "",
      legalDocumentsAvailable: false,
    },
    builder: {
      name: "",
      reraId: "",
      projectName: "",
      possessionDate: "",
      totalUnits: "",
      totalTowers: "",
      totalFloors: "",
      launchDate: "",
      loanFacility: { available: false, approvedBanks: [] },
      bookingProcess: { tokenAmount: "", documentsRequired: [] },
    },
    transactionType: "Resale",
    inclusionsInPrice: [],
    additionalRooms: [],
    // Step 6 - Photos
    images: [],
    imageFiles: [],
    // Step 7 - Contact
    contactInfo: {
      name: "",
      phone: "",
      alternatePhone: "",
      email: "",
      preferredCallTime: "Anytime",
    },
  });

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const apiHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  };

  // Load cities
  useEffect(() => {
    fetch("https://api.gharzoreality.com/api/master-data/v2/cities")
      .then((r) => r.json())
      .then((d) => setCities(d.data || []))
      .catch(() => {});
  }, []);

  // Load Mapbox
  useEffect(() => {
    if (currentStep === 3 && !mapLoaded) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    }
  }, [currentStep]);

  useEffect(() => {
    if (mapLoaded && currentStep === 3 && mapRef.current && !mapInstanceRef.current) {
      const mapboxgl = window.mapboxgl;
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const lat = form.location.coordinates.latitude || 22.7196;
      const lng = form.location.coordinates.longitude || 75.8577;

      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: 13,
      });

      const marker = new mapboxgl.Marker({ color: "#7c3aed", draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        setForm((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: { latitude: lngLat.lat, longitude: lngLat.lng },
          },
        }));
      });

      map.on("click", (e) => {
        marker.setLngLat(e.lngLat);
        setForm((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: { latitude: e.lngLat.lat, longitude: e.lngLat.lng },
          },
        }));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }
  }, [mapLoaded, currentStep]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((prev) => ({
          ...prev,
          location: { ...prev.location, coordinates: { latitude, longitude } },
        }));
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo({ center: [longitude, latitude], zoom: 15 });
          markerRef.current.setLngLat([longitude, latitude]);
        }
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.features && d.features[0]) {
              const place = d.features[0];
              setForm((prev) => ({
                ...prev,
                location: { ...prev.location, address: place.place_name },
              }));
            }
          });
      },
      () => addToast("Could not get location", "error")
    );
  };

  const searchAddress = async (query) => {
    if (!query || query.length < 3) return;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=in&limit=5`
    );
    const data = await res.json();
    setLocationSuggestions(data.features || []);
  };

  const selectSuggestion = (feat) => {
    const [lng, lat] = feat.center;
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        address: feat.place_name,
        coordinates: { latitude: lat, longitude: lng },
      },
    }));
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 15 });
      markerRef.current.setLngLat([lng, lat]);
    }
    setLocationSuggestions([]);
  };

  const updateForm = (path, value) => {
    setForm((prev) => {
      const keys = path.split(".");
      const newForm = { ...prev };
      let obj = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return newForm;
    });
    if (errors[path]) {
      setErrors((prev) => { const e = { ...prev }; delete e[path]; return e; });
    }
  };

  const toggleArray = (path, value) => {
    const keys = path.split(".");
    let arr = form;
    for (const k of keys) arr = arr[k];
    const newArr = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    updateForm(path, newArr);
  };

  const validateStep = () => {
    const errs = {};
    if (currentStep === 0) {
      if (!form.category) errs.category = "Category is required";
      if (!form.listingType) errs.listingType = "Listing type is required";
      if (!form.propertyType) errs.propertyType = "Property type is required";
    } else if (currentStep === 1) {
      if (!form.title.trim()) errs.title = "Title is required";
      if (!form.description.trim()) errs.description = "Description is required";
      if (!form.price.amount) errs["price.amount"] = "Price is required";
      if (!form.area.carpet) errs["area.carpet"] = "Carpet area is required";
      if (!form.propertyAge) errs.propertyAge = "Property age is required";
    } else if (currentStep === 3) {
      if (!form.location.address.trim()) errs["location.address"] = "Address is required";
      if (!form.location.city.trim()) errs["location.city"] = "City is required";
      if (!form.location.locality.trim()) errs["location.locality"] = "Locality is required";
      if (!form.location.pincode || !/^[0-9]{6}$/.test(form.location.pincode))
        errs["location.pincode"] = "Valid 6-digit pincode required";
    } else if (currentStep === 6) {
      if (!form.contactInfo.name.trim()) errs["contactInfo.name"] = "Name is required";
      if (!form.contactInfo.phone || !/^[0-9]{10}$/.test(form.contactInfo.phone))
        errs["contactInfo.phone"] = "Valid 10-digit phone required";
      if (form.contactInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactInfo.email))
        errs["contactInfo.email"] = "Invalid email format";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const createDraft = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/create-draft`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          category: form.category,
          propertyType: form.propertyType,
          listingType: form.listingType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPropertyId(data.data.propertyId);
        addToast("Property draft created!");
        setCurrentStep(1);
      } else throw new Error(data.message);
    } catch (e) {
      addToast(e.message || "Failed to create draft", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveBasicDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${propertyId}/basic-details`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          bhk: form.bhk,
          bathrooms: form.bathrooms,
          balconies: form.balconies,
          propertyAge: form.propertyAge,
          availableFrom: form.availableFrom,
          floor: form.floor,
          area: { carpet: Number(form.area.carpet), builtUp: Number(form.area.builtUp || 0), unit: form.area.unit },
          price: {
            amount: Number(form.price.amount),
            negotiable: form.price.negotiable,
            securityDeposit: Number(form.price.securityDeposit) || 0,
            maintenanceCharges: {
              amount: Number(form.price.maintenanceCharges.amount) || 0,
              frequency: form.price.maintenanceCharges.frequency,
            },
            lockInPeriod: Number(form.price.lockInPeriod) || 0,
            noticePeriod: Number(form.price.noticePeriod) || 0,
          },
        }),
      });
      const data = await res.json();
      if (data.success) { addToast("Basic details saved!"); setCurrentStep(2); }
      else throw new Error(data.message);
    } catch (e) {
      addToast(e.message || "Failed to save basic details", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveFeatures = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${propertyId}/features`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify({
          furnishing: form.furnishing,
          parking: form.parking,
          facing: form.facing,
          amenities: form.amenities,
          propertyFeatures: form.propertyFeatures,
        }),
      });
      const data = await res.json();
      if (data.success) { addToast("Features saved!"); setCurrentStep(3); }
      else throw new Error(data.message);
    } catch (e) {
      addToast(e.message || "Failed to save features", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveLocation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${propertyId}/location`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify({ location: form.location }),
      });
      const data = await res.json();
      if (data.success) { addToast("Location saved!"); setCurrentStep(4); }
      else throw new Error(data.message);
    } catch (e) {
      addToast(e.message || "Failed to save location", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveOwnership = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${propertyId}/ownership-details`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify({
          ownership: { ...form.ownership, propertyTaxPerYear: Number(form.ownership.propertyTaxPerYear) || 0 },
          builder: {
            ...form.builder,
            totalUnits: Number(form.builder.totalUnits) || 0,
            totalTowers: Number(form.builder.totalTowers) || 0,
            totalFloors: Number(form.builder.totalFloors) || 0,
            bookingProcess: {
              ...form.builder.bookingProcess,
              tokenAmount: Number(form.builder.bookingProcess.tokenAmount) || 0,
            },
          },
          transactionType: form.transactionType,
          inclusionsInPrice: form.inclusionsInPrice,
          additionalRooms: form.additionalRooms,
        }),
      });
      const data = await res.json();
      if (data.success) { addToast("Ownership details saved!"); setCurrentStep(5); }
      else throw new Error(data.message);
    } catch (e) {
      addToast(e.message || "Failed to save ownership", "error");
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotos = async () => {
    if (form.imageFiles.length === 0) { setCurrentStep(6); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      form.imageFiles.forEach((f) => fd.append("images", f));
      const res = await fetch(`${API_BASE}/${propertyId}/upload-photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) { addToast(`${data.data.uploadedCount} photo(s) uploaded!`); setCurrentStep(6); }
      else throw new Error(data.message);
    } catch (e) {
      addToast(e.message || "Failed to upload photos", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveContact = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${propertyId}/contact-info`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify({ contactInfo: form.contactInfo }),
      });
      const data = await res.json();
      if (data.success) { addToast("Contact info saved!"); setCurrentStep(7); }
      else throw new Error(data.message);
    } catch (e) {
      addToast(e.message || "Failed to save contact", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitProperty = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${propertyId}/submit`, {
        method: "POST",
        headers: apiHeaders,
      });
      const data = await res.json();
      if (data.success) { addToast("Property submitted for approval! 🎉"); setCurrentStep(8); }
      else throw new Error(data.message);
    } catch (e) {
      addToast(e.message || "Failed to submit property", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep()) { addToast("Please fix the errors before proceeding", "error"); return; }
    if (currentStep === 0 && !propertyId) { await createDraft(); return; }
    if (currentStep === 1) { await saveBasicDetails(); return; }
    if (currentStep === 2) { await saveFeatures(); return; }
    if (currentStep === 3) { await saveLocation(); return; }
    if (currentStep === 4) { await saveOwnership(); return; }
    if (currentStep === 5) { await uploadPhotos(); return; }
    if (currentStep === 6) { await saveContact(); return; }
    if (currentStep === 7) { await submitProperty(); return; }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const sidebarSteps = [
    { label: "Property Details", icon: FiHome, step: 0 },
    { label: "Address", icon: FiMapPin, step: 3, score: 15 },
    { label: "Photos", icon: FiCamera, step: 5, score: 15 },
    { label: "Verify", icon: FiShield, step: 4, score: 20 },
    { label: "Property Highlights", icon: FiStar, step: 2 },
    { label: "Review", icon: FiEye, step: 7 },
  ];

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const residentialTypes = [
    { label: "Room", icon: RiHotelBedLine },
    { label: "Flat", icon: PiBuildingApartment },
    { label: "Villa", icon: MdVilla },
    { label: "Plot", icon: BiArea },
    { label: "Studio", icon: FiGrid },
    { label: "Independent House", icon: PiHouseLine },
    { label: "Builder Floor", icon: LuBuilding2 },
    { label: "Other", icon: FiBriefcase },
  ];

  const commercialTypes = [
    { label: "Office", icon: HiOutlineOfficeBuilding },
    { label: "Shop", icon: MdStorefront },
    { label: "Showroom", icon: MdDoorSliding },
    { label: "Warehouse", icon: MdOutlineWarehouse },
    { label: "Other", icon: FiBriefcase },
  ];

  const propertyTypes = form.category === "Residential" ? residentialTypes : commercialTypes;

  const furnishingItems = [
    "Sofa", "Center Table", "Dining Table", "TV Unit", "Curtains", "Carpet",
    "Bed", "Wardrobe", "Mattress", "Side Table", "Dressing Table",
    "Modular Kitchen", "Chimney", "Stove", "Refrigerator", "Microwave",
    "Water Purifier", "Air Conditioner", "Geyser", "Washing Machine",
    "Fan", "Light Fittings", "Inverter",
  ];

  const societyAmenities = [
    "Swimming Pool", "Gym", "Club House", "Park", "Kids Play Area",
    "Community Hall", "Indoor Games Room", "Jogging Track", "Sports Court",
    "Meditation Area", "Amphitheatre", "Library", "Party Hall",
  ];

  const securityAmenities = [
    "CCTV", "24x7 Security", "Intercom", "Fire Alarm", "Fire Extinguisher",
    "Video Door Security", "Access Control", "Visitor Parking", "Security Cabin",
  ];

  const essentialAmenities = [
    "Lift", "Power Backup", "Piped Gas", "Water Storage", "Rainwater Harvesting",
    "Waste Disposal", "Sewage Treatment Plant", "DG Backup", "Solar Panels",
  ];

  const nearbyAmenities = [
    "School", "Hospital", "Market", "ATM", "Bank", "Metro Station",
    "Bus Stop", "Railway Station", "Mall", "Restaurant", "Pharmacy", "Park",
  ];

  const SidebarContent = () => (
    <>
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">G</span>
            </div>
            <span className="text-gray-800 font-bold text-sm tracking-wide">GHARZO <span className="text-orange-500 font-normal text-xs">REALTY™</span></span>
          </div>
          {/* Close button only on mobile */}
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={20} />
          </button>
        </div>
        <button className="text-xs text-gray-500 flex items-center gap-1 hover:text-violet-600 transition-colors">
          <FiChevronLeft size={14} /> Return to dashboard
        </button>
      </div>

      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-base leading-tight">Post your property</h2>
        <p className="text-xs text-gray-400 mt-0.5">Sell or rent your property</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-violet-500 to-violet-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((currentStep / 7) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">{Math.round((currentStep / 7) * 100)}%</span>
          <FiInfo size={14} className="text-gray-400" />
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
        {sidebarSteps.map(({ label, icon: Icon, step, score }) => {
          const isActive = currentStep === step || (step === 0 && currentStep <= 1) ||
            (step === 2 && currentStep === 2) || (step === 3 && currentStep === 3);
          const isDone = currentStep > step;
          return (
            <div key={label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
              ${isActive ? "bg-violet-50" : "hover:bg-gray-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${isDone ? "bg-emerald-100 text-emerald-600" : isActive ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                {isDone ? <FiCheck size={14} /> : <Icon size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${isActive ? "text-violet-700" : isDone ? "text-gray-700" : "text-gray-500"}`}>
                  {label}
                </p>
                {isActive && (
                  <p className="text-xs text-violet-500">In progress</p>
                )}
                {!isActive && !isDone && score && (
                  <p className="text-xs text-emerald-500">Score +{score}%</p>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Need Help? <span className="text-violet-600 cursor-pointer font-medium">📞 Call 08048811281</span></p>
      </div>
    </>
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50/30 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .heading { font-family: 'DM Serif Display', serif; }
        @keyframes slide-in { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.3s ease; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: transparent; } 
        ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 2px; }
        .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; inset: 0; background: #e5e7eb; border-radius: 24px; transition: 0.3s; }
        .slider:before { content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
        input:checked + .slider { background: #7c3aed; }
        input:checked + .slider:before { transform: translateX(20px); }
        
        /* Mobile sidebar overlay */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 40;
        }
        .sidebar-drawer {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: 280px;
          background: white;
          z-index: 50;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 24px rgba(0,0,0,0.1);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        .sidebar-drawer.open {
          transform: translateX(0);
        }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />

      {currentStep === 8 ? (
        <SuccessScreen />
      ) : (
        <div className="flex min-h-screen">

          {/* ===== DESKTOP SIDEBAR (lg+) ===== */}
          <div className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-shrink-0 flex-col shadow-sm">
            <SidebarContent />
          </div>

          {/* ===== MOBILE SIDEBAR DRAWER ===== */}
          {sidebarOpen && (
            <div className="lg:hidden">
              <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
              <div className={`sidebar-drawer open`}>
                <SidebarContent />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* ===== MOBILE TOP BAR ===== */}
            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                >
                  <FiMenu size={18} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">G</span>
                  </div>
                  <span className="text-gray-800 font-bold text-sm">GHARZO</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-violet-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((currentStep / 7) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{Math.round((currentStep / 7) * 100)}%</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">

                {/* Step 0: Property Type */}
                {currentStep === 0 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Add Property Details</h1>
                    <p className="text-gray-500 text-sm mb-6">Tell us about your property</p>

                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-6">
                      <InputField label="Property Type" required error={errors.category}>
                        <div className="flex gap-3 mt-1">
                          {["Residential", "Commercial"].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => { updateForm("category", cat); updateForm("propertyType", ""); if (cat === "Commercial" && form.listingType === "PG/Co-living") { updateForm("listingType", "Rent"); } }}
                              className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all
                                ${form.category === cat
                                  ? "border-violet-500 bg-violet-50 text-violet-700"
                                  : "border-gray-200 text-gray-600 hover:border-violet-300"}`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </InputField>

                      <InputField label="Looking to" required error={errors.listingType}>
                        <div className="flex gap-2 sm:gap-3 mt-1">
                          {["Rent", "Sale", ...(form.category === "Residential" ? ["PG/Co-living"] : [])].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => updateForm("listingType", t)}
                              className={`flex-1 py-2.5 px-2 sm:px-4 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all
                                ${form.listingType === t
                                  ? "border-violet-500 bg-violet-50 text-violet-700"
                                  : "border-gray-200 text-gray-600 hover:border-violet-300"}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </InputField>

                      <InputField label="Property Type" required error={errors.propertyType}>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-2.5 mt-1">
                          {propertyTypes.map(({ label, icon }) => (
                            <SelectCard
                              key={label}
                              label={label}
                              icon={icon}
                              selected={form.propertyType === label}
                              onClick={() => updateForm("propertyType", label)}
                            />
                          ))}
                        </div>
                      </InputField>
                    </div>
                  </div>
                )}

                {/* Step 1: Basic Details */}
                {currentStep === 1 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Basic Details</h1>
                    <p className="text-gray-500 text-sm mb-6">Share key details about your property</p>

                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                        <InputField label="Property Title" required error={errors.title}>
                          <TextInput
                            placeholder="e.g. Spacious 3BHK in Vijay Nagar"
                            value={form.title}
                            onChange={(e) => updateForm("title", e.target.value)}
                            maxLength={200}
                          />
                        </InputField>

                        <InputField label="Description" required error={errors.description}>
                          <textarea
                            placeholder="Describe your property..."
                            value={form.description}
                            onChange={(e) => updateForm("description", e.target.value)}
                            rows={3}
                            maxLength={5000}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all resize-none"
                          />
                        </InputField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputField label="Property Age" required error={errors.propertyAge}>
                            <SelectInput value={form.propertyAge} onChange={(e) => updateForm("propertyAge", e.target.value)}>
                              <option value="">Select age</option>
                              {["Under Construction", "0-1 year", "1-5 years", "5-10 years", "10+ years"].map((a) => (
                                <option key={a} value={a}>{a}</option>
                              ))}
                            </SelectInput>
                          </InputField>

                          <InputField label="Available From">
                            <TextInput
                              type="date"
                              value={form.availableFrom}
                              onChange={(e) => updateForm("availableFrom", e.target.value)}
                            />
                          </InputField>
                        </div>
                      </div>

                      {/* Configuration */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FiHome size={16} className="text-violet-500" /> Configuration
                        </h3>
                        <div className="flex flex-wrap gap-4 sm:gap-6">
                          <CounterBox label="BHK" value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                          <CounterBox label="Bathrooms" value={form.bathrooms} onChange={(v) => updateForm("bathrooms", v)} icon={LuBath} min={1} max={10} />
                          <CounterBox label="Balconies" value={form.balconies} onChange={(v) => updateForm("balconies", v)} icon={MdBalcony} min={0} max={10} />
                          <CounterBox label="Current Floor" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                          <CounterBox label="Total Floors" value={form.floor.total} onChange={(v) => updateForm("floor.total", v)} icon={LuBuilding2} min={1} max={100} />
                        </div>
                      </div>

                      {/* Area */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <BiArea size={16} className="text-violet-500" /> Area Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <InputField label="Carpet Area" required error={errors["area.carpet"]}>
                            <TextInput
                              type="number"
                              placeholder="e.g. 1200"
                              value={form.area.carpet}
                              onChange={(e) => updateForm("area.carpet", e.target.value)}
                            />
                          </InputField>
                          <InputField label="Built-up Area">
                            <TextInput
                              type="number"
                              placeholder="e.g. 1400"
                              value={form.area.builtUp}
                              onChange={(e) => updateForm("area.builtUp", e.target.value)}
                            />
                          </InputField>
                          <InputField label="Unit">
                            <SelectInput value={form.area.unit} onChange={(e) => updateForm("area.unit", e.target.value)}>
                              {["sqft", "sqm", "sqyd"].map((u) => <option key={u} value={u}>{u}</option>)}
                            </SelectInput>
                          </InputField>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FiDollarSign size={16} className="text-violet-500" /> Pricing
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InputField label={form.listingType === "Sale" ? "Sale Price (₹)" : "Monthly Rent (₹)"} required error={errors["price.amount"]}>
                            <TextInput
                              type="number"
                              placeholder="e.g. 25000"
                              value={form.price.amount}
                              onChange={(e) => updateForm("price.amount", e.target.value)}
                            />
                          </InputField>
                          <InputField label="Security Deposit (₹)">
                            <TextInput
                              type="number"
                              placeholder="e.g. 50000"
                              value={form.price.securityDeposit}
                              onChange={(e) => updateForm("price.securityDeposit", e.target.value)}
                            />
                          </InputField>
                          <InputField label="Maintenance (₹/month)">
                            <TextInput
                              type="number"
                              placeholder="e.g. 2500"
                              value={form.price.maintenanceCharges.amount}
                              onChange={(e) => updateForm("price.maintenanceCharges.amount", e.target.value)}
                            />
                          </InputField>
                          <InputField label="Maintenance Frequency">
                            <SelectInput
                              value={form.price.maintenanceCharges.frequency}
                              onChange={(e) => updateForm("price.maintenanceCharges.frequency", e.target.value)}
                            >
                              {["Monthly", "Quarterly", "Yearly"].map((f) => <option key={f} value={f}>{f}</option>)}
                            </SelectInput>
                          </InputField>
                          <InputField label="Lock-in Period (months)">
                            <TextInput
                              type="number"
                              placeholder="e.g. 11"
                              value={form.price.lockInPeriod}
                              onChange={(e) => updateForm("price.lockInPeriod", e.target.value)}
                            />
                          </InputField>
                          <InputField label="Notice Period (months)">
                            <TextInput
                              type="number"
                              placeholder="e.g. 2"
                              value={form.price.noticePeriod}
                              onChange={(e) => updateForm("price.noticePeriod", e.target.value)}
                            />
                          </InputField>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={form.price.negotiable}
                              onChange={(e) => updateForm("price.negotiable", e.target.checked)}
                            />
                            <span className="slider" />
                          </label>
                          <span className="text-sm text-gray-600">Price is negotiable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Property Features */}
                {currentStep === 2 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Property Highlights</h1>
                    <p className="text-gray-500 text-sm mb-6">Add features that make your property stand out</p>

                    <div className="space-y-4">
                      {/* Furnishing */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <MdChair size={16} className="text-violet-500" /> Furnishing
                        </h3>
                        <div className="flex gap-2 sm:gap-3 mb-4">
                          {["Unfurnished", "Semi-Furnished", "Fully-Furnished"].map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => updateForm("furnishing.type", f)}
                              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl border-2 text-xs font-semibold transition-all
                                ${form.furnishing.type === f ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600"}`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                        {form.furnishing.type !== "Unfurnished" && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2 font-medium">Select furnished items:</p>
                            <div className="flex flex-wrap gap-2">
                              {furnishingItems.map((item) => (
                                <Chip
                                  key={item}
                                  label={item}
                                  selected={form.furnishing.items.includes(item)}
                                  onClick={() => toggleArray("furnishing.items", item)}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Parking & Facing */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <MdLocalParking size={16} className="text-violet-500" /> Parking & Facing
                        </h3>
                        <div className="flex flex-wrap gap-4 sm:gap-6">
                          <CounterBox label="Covered Parking" value={form.parking.covered} onChange={(v) => updateForm("parking.covered", v)} icon={RiParkingBoxLine} min={0} max={10} />
                          <CounterBox label="Open Parking" value={form.parking.open} onChange={(v) => updateForm("parking.open", v)} icon={TbParking} min={0} max={10} />
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Facing Direction</p>
                          <div className="grid grid-cols-4 gap-2">
                            {["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"].map((dir) => (
                              <button
                                key={dir}
                                type="button"
                                onClick={() => updateForm("facing", dir)}
                                className={`py-2 rounded-xl border-2 text-xs font-medium transition-all
                                  ${form.facing === dir ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-violet-300"}`}
                              >
                                {dir}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Society Amenities */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <TbBuildingCommunity size={16} className="text-violet-500" /> Society Amenities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {societyAmenities.map((a) => (
                            <Chip key={a} label={a} selected={form.amenities.society.includes(a)} onClick={() => toggleArray("amenities.society", a)} />
                          ))}
                        </div>
                      </div>

                      {/* Security */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <MdSecurity size={16} className="text-violet-500" /> Security Features
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {securityAmenities.map((a) => (
                            <Chip key={a} label={a} selected={form.amenities.security.includes(a)} onClick={() => toggleArray("amenities.security", a)} />
                          ))}
                        </div>
                      </div>

                      {/* Essential & Nearby - stacked on mobile, side-by-side on tablet+ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FiZap size={16} className="text-violet-500" /> Essential Services
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {essentialAmenities.map((a) => (
                              <Chip key={a} label={a} selected={form.amenities.essential.includes(a)} onClick={() => toggleArray("amenities.essential", a)} />
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FiMapPin size={16} className="text-violet-500" /> Nearby Places
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {nearbyAmenities.map((a) => (
                              <Chip key={a} label={a} selected={form.amenities.nearby.includes(a)} onClick={() => toggleArray("amenities.nearby", a)} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Property Features */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FiTool size={16} className="text-violet-500" /> Property Features
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputField label="Power Backup">
                            <SelectInput value={form.propertyFeatures.powerBackup} onChange={(e) => updateForm("propertyFeatures.powerBackup", e.target.value)}>
                              <option value="">Select</option>
                              {["None", "Partial", "Full"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </SelectInput>
                          </InputField>
                          <InputField label="Water Supply">
                            <SelectInput value={form.propertyFeatures.waterSupply} onChange={(e) => updateForm("propertyFeatures.waterSupply", e.target.value)}>
                              <option value="">Select</option>
                              {["Corporation", "Borewell", "Both"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </SelectInput>
                          </InputField>
                          <InputField label="Flooring">
                            <SelectInput value={form.propertyFeatures.flooring} onChange={(e) => updateForm("propertyFeatures.flooring", e.target.value)}>
                              <option value="">Select</option>
                              {["Marble", "Vitrified Tiles", "Wooden", "Granite", "Ceramic", "Cement", "Other"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </SelectInput>
                          </InputField>
                          <InputField label="Construction Quality">
                            <SelectInput value={form.propertyFeatures.constructionQuality} onChange={(e) => updateForm("propertyFeatures.constructionQuality", e.target.value)}>
                              <option value="">Select</option>
                              {["Standard", "Above Standard", "Premium", "Luxury"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </SelectInput>
                          </InputField>
                          <InputField label="Ceiling Height (ft)">
                            <TextInput
                              type="number"
                              placeholder="e.g. 10"
                              value={form.propertyFeatures.ceilingHeight}
                              onChange={(e) => updateForm("propertyFeatures.ceilingHeight", e.target.value)}
                            />
                          </InputField>
                          <InputField label="Road Width (ft)">
                            <TextInput
                              type="number"
                              placeholder="e.g. 40"
                              value={form.propertyFeatures.widthOfFacingRoad}
                              onChange={(e) => updateForm("propertyFeatures.widthOfFacingRoad", e.target.value)}
                            />
                          </InputField>
                          <InputField label="Waste Disposal">
                            <SelectInput value={form.propertyFeatures.wasteDisposal} onChange={(e) => updateForm("propertyFeatures.wasteDisposal", e.target.value)}>
                              <option value="">Select</option>
                              {["Municipal", "Private", "Biogas Plant", "None"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </SelectInput>
                          </InputField>
                        </div>

                        {/* Toggles */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            ["gatedSecurity", "Gated Security"],
                            ["liftAvailable", "Lift Available"],
                            ["petFriendly", "Pet Friendly"],
                            ["bachelorsAllowed", "Bachelors Allowed"],
                            ["nonVegAllowed", "Non-Veg Allowed"],
                            ["boundaryWall", "Boundary Wall"],
                            ["rainwaterHarvesting", "Rainwater Harvesting"],
                            ["servantsRoom", "Servants Room"],
                            ["studyRoom", "Study Room"],
                            ["poojaRoom", "Pooja Room"],
                            ["storeRoom", "Store Room"],
                          ].map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                              <span className="text-sm text-gray-700">{label}</span>
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={form.propertyFeatures[key]}
                                  onChange={(e) => updateForm(`propertyFeatures.${key}`, e.target.checked)}
                                />
                                <span className="slider" />
                              </label>
                            </div>
                          ))}
                        </div>

                        {/* Fire Safety */}
                        <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                          <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                            <MdFireExtinguisher size={14} /> Fire Safety
                          </p>
                          <div className="flex flex-wrap gap-4">
                            {[["fireExtinguisher", "Fire Extinguisher"], ["fireSensor", "Fire Sensor"], ["sprinklers", "Sprinklers"]].map(([k, l]) => (
                              <label key={k} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={form.propertyFeatures.fireSafety[k]}
                                  onChange={(e) => updateForm(`propertyFeatures.fireSafety.${k}`, e.target.checked)}
                                  className="accent-red-500"
                                />
                                <span className="text-xs text-gray-700">{l}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Overlooking */}
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Overlooking</p>
                          <div className="flex flex-wrap gap-2">
                            {["Park/Garden", "Pool", "Main Road", "Club", "Not Overlooking"].map((v) => (
                              <Chip key={v} label={v} selected={form.propertyFeatures.overlooking.includes(v)} onClick={() => toggleArray("propertyFeatures.overlooking", v)} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Location */}
                {currentStep === 3 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Address Details</h1>
                    <p className="text-gray-500 text-sm mb-6">Where is your property located?</p>

                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                        {/* City Search */}
                        <InputField label="City" required error={errors["location.city"]}>
                          <div className="relative">
                            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search city..."
                              value={citySearch || form.location.city}
                              onChange={(e) => {
                                setCitySearch(e.target.value);
                                updateForm("location.city", e.target.value);
                                setShowCityDropdown(true);
                              }}
                              onFocus={() => setShowCityDropdown(true)}
                              onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                            {showCityDropdown && filteredCities.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                                {filteredCities.slice(0, 20).map((city) => (
                                  <button
                                    key={city._id}
                                    type="button"
                                    onMouseDown={() => {
                                      updateForm("location.city", city.name);
                                      updateForm("location.state", city.state);
                                      setCitySearch(city.name);
                                      setShowCityDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-violet-50 text-gray-700 flex items-center justify-between"
                                  >
                                    <span>{city.name}</span>
                                    <span className="text-xs text-gray-400">{city.state}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </InputField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputField label="Locality" required error={errors["location.locality"]}>
                            <TextInput
                              placeholder="e.g. Vijay Nagar"
                              value={form.location.locality}
                              onChange={(e) => updateForm("location.locality", e.target.value)}
                            />
                          </InputField>
                          <InputField label="Sub Locality">
                            <TextInput
                              placeholder="e.g. Scheme 54"
                              value={form.location.subLocality}
                              onChange={(e) => updateForm("location.subLocality", e.target.value)}
                            />
                          </InputField>
                        </div>

                        <InputField label="Full Address" required error={errors["location.address"]}>
                          <div className="relative">
                            <TextInput
                              placeholder="Search or type your address..."
                              value={form.location.address}
                              onChange={(e) => {
                                updateForm("location.address", e.target.value);
                                searchAddress(e.target.value);
                              }}
                            />
                            {locationSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                                {locationSuggestions.map((feat) => (
                                  <button
                                    key={feat.id}
                                    type="button"
                                    onClick={() => selectSuggestion(feat)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-violet-50 text-gray-700"
                                  >
                                    {feat.place_name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </InputField>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <InputField label="Landmark">
                            <TextInput
                              placeholder="Near C21 Mall"
                              value={form.location.landmark}
                              onChange={(e) => updateForm("location.landmark", e.target.value)}
                            />
                          </InputField>
                          <InputField label="Pincode" required error={errors["location.pincode"]}>
                            <TextInput
                              placeholder="452010"
                              value={form.location.pincode}
                              onChange={(e) => updateForm("location.pincode", e.target.value)}
                              maxLength={6}
                            />
                          </InputField>
                          <InputField label="State">
                            <TextInput
                              placeholder="Madhya Pradesh"
                              value={form.location.state}
                              onChange={(e) => updateForm("location.state", e.target.value)}
                            />
                          </InputField>
                        </div>
                      </div>

                      {/* Map */}
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FiMapPin size={16} className="text-violet-500" /> Pin Location on Map
                          </h3>
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="flex items-center gap-2 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors self-start sm:self-auto"
                          >
                            <FiMapPin size={12} /> Use Current Location
                          </button>
                        </div>
                        <div ref={mapRef} className="w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                          {!mapLoaded && (
                            <div className="text-gray-400 text-sm flex items-center gap-2">
                              <FiLoader size={16} className="animate-spin" /> Loading map...
                            </div>
                          )}
                        </div>
                        {form.location.coordinates.latitude && (
                          <p className="text-xs text-gray-400 mt-2 text-center">
                            📍 {form.location.coordinates.latitude.toFixed(4)}, {form.location.coordinates.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Ownership */}
                {currentStep === 4 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Ownership & Legal</h1>
                    <p className="text-gray-500 text-sm mb-6">Verify your ownership details</p>

                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputField label="Ownership Type">
                            <SelectInput value={form.ownership.type} onChange={(e) => updateForm("ownership.type", e.target.value)}>
                              <option value="">Select</option>
                              {["Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </SelectInput>
                          </InputField>
                          <InputField label="Transaction Type">
                            <SelectInput value={form.transactionType} onChange={(e) => updateForm("transactionType", e.target.value)}>
                              {["Resale", "New Booking"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </SelectInput>
                          </InputField>
                          <InputField label="Stamp Duty">
                            <SelectInput value={form.ownership.stampDutyCharges} onChange={(e) => updateForm("ownership.stampDutyCharges", e.target.value)}>
                              {["Included in Price", "Excluded - Paid by Buyer", "To be Decided"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </SelectInput>
                          </InputField>
                          <InputField label="Registration Charges">
                            <SelectInput value={form.ownership.registrationCharges} onChange={(e) => updateForm("ownership.registrationCharges", e.target.value)}>
                              {["Included in Price", "Excluded - Paid by Buyer", "To be Decided"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </SelectInput>
                          </InputField>
                          <InputField label="Property Tax/Year (₹)">
                            <TextInput
                              type="number"
                              placeholder="e.g. 12000"
                              value={form.ownership.propertyTaxPerYear}
                              onChange={(e) => updateForm("ownership.propertyTaxPerYear", e.target.value)}
                            />
                          </InputField>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          {[["verified", "Ownership Verified"], ["occupancyCertificate", "Occupancy Certificate"], ["legalDocumentsAvailable", "Legal Documents Available"]].map(([k, l]) => (
                            <label key={k} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={form.ownership[k]}
                                onChange={(e) => updateForm(`ownership.${k}`, e.target.checked)}
                                className="accent-violet-600 w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">{l}</span>
                            </label>
                          ))}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Approved By</p>
                          <div className="flex flex-wrap gap-3">
                            {["Municipality", "Development Authority", "Panchayat", "Other"].map((v) => (
                              <Chip key={v} label={v} selected={form.ownership.approvedBy.includes(v)} onClick={() => toggleArray("ownership.approvedBy", v)} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Builder Details */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <BiBuildingHouse size={16} className="text-violet-500" /> Builder / Project Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InputField label="Builder Name">
                            <TextInput value={form.builder.name} onChange={(e) => updateForm("builder.name", e.target.value)} placeholder="ABC Builders" />
                          </InputField>
                          <InputField label="RERA ID">
                            <TextInput value={form.builder.reraId} onChange={(e) => updateForm("builder.reraId", e.target.value)} placeholder="RERA/MP/2023/XXXXX" />
                          </InputField>
                          <InputField label="Project Name">
                            <TextInput value={form.builder.projectName} onChange={(e) => updateForm("builder.projectName", e.target.value)} placeholder="Green Valley Residency" />
                          </InputField>
                          <InputField label="Possession Date">
                            <TextInput type="date" value={form.builder.possessionDate} onChange={(e) => updateForm("builder.possessionDate", e.target.value)} />
                          </InputField>
                          <InputField label="Total Units">
                            <TextInput type="number" value={form.builder.totalUnits} onChange={(e) => updateForm("builder.totalUnits", e.target.value)} placeholder="150" />
                          </InputField>
                          <InputField label="Total Towers">
                            <TextInput type="number" value={form.builder.totalTowers} onChange={(e) => updateForm("builder.totalTowers", e.target.value)} placeholder="3" />
                          </InputField>
                          <InputField label="Total Floors">
                            <TextInput type="number" value={form.builder.totalFloors} onChange={(e) => updateForm("builder.totalFloors", e.target.value)} placeholder="15" />
                          </InputField>
                          <InputField label="Launch Date">
                            <TextInput type="date" value={form.builder.launchDate} onChange={(e) => updateForm("builder.launchDate", e.target.value)} />
                          </InputField>
                          <InputField label="Token Amount (₹)">
                            <TextInput type="number" value={form.builder.bookingProcess.tokenAmount} onChange={(e) => updateForm("builder.bookingProcess.tokenAmount", e.target.value)} placeholder="100000" />
                          </InputField>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={form.builder.loanFacility.available}
                              onChange={(e) => updateForm("builder.loanFacility.available", e.target.checked)}
                            />
                            <span className="slider" />
                          </label>
                          <span className="text-sm text-gray-600">Loan Facility Available</span>
                        </div>

                        {form.builder.loanFacility.available && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Approved Banks</p>
                            <div className="flex flex-wrap gap-2">
                              {["HDFC", "SBI", "ICICI", "Axis", "Kotak", "PNB", "BOB"].map((b) => (
                                <Chip key={b} label={b} selected={form.builder.loanFacility.approvedBanks.includes(b)} onClick={() => toggleArray("builder.loanFacility.approvedBanks", b)} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Inclusions & Additional Rooms - stacked on mobile */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Inclusions in Price</h3>
                          <div className="flex flex-wrap gap-2">
                            {["Car Parking", "Club Membership", "Covered Parking", "Electricity & Water Connection", "Piped Gas Connection", "Registration Charges"].map((v) => (
                              <Chip key={v} label={v} selected={form.inclusionsInPrice.includes(v)} onClick={() => toggleArray("inclusionsInPrice", v)} />
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Additional Rooms</h3>
                          <div className="flex flex-wrap gap-2">
                            {["Servant Room", "Study Room", "Pooja Room", "Store Room", "Utility Room"].map((v) => (
                              <Chip key={v} label={v} selected={form.additionalRooms.includes(v)} onClick={() => toggleArray("additionalRooms", v)} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Photos */}
                {currentStep === 5 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Upload Photos</h1>
                    <p className="text-gray-500 text-sm mb-6">Good photos attract 5x more inquiries</p>

                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                      <label className="flex flex-col items-center justify-center w-full h-36 sm:h-40 border-2 border-dashed border-violet-300 rounded-2xl cursor-pointer hover:bg-violet-50 transition-colors">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                            <FiUpload size={20} className="text-violet-600" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">Click to upload photos</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 10MB each</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            const previews = files.map((f) => URL.createObjectURL(f));
                            updateForm("imageFiles", [...form.imageFiles, ...files]);
                            updateForm("images", [...form.images, ...previews]);
                          }}
                        />
                      </label>

                      {form.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                          {form.images.map((url, i) => (
                            <div key={i} className="relative group aspect-square">
                              <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                              {i === 0 && (
                                <div className="absolute top-1 left-1 bg-violet-600 text-white text-xs px-1.5 py-0.5 rounded-lg">Primary</div>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  updateForm("images", form.images.filter((_, j) => j !== i));
                                  updateForm("imageFiles", form.imageFiles.filter((_, j) => j !== i));
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <FiX size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-700 flex items-center gap-1.5">
                          <FiInfo size={12} /> First image will be set as the primary photo. Add at least 3-5 photos for best results.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Contact */}
                {currentStep === 6 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Contact Information</h1>
                    <p className="text-gray-500 text-sm mb-6">How should interested buyers reach you?</p>

                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                      <InputField label="Full Name" required error={errors["contactInfo.name"]}>
                        <div className="relative">
                          <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <TextInput
                            className="pl-9"
                            placeholder="Your full name"
                            value={form.contactInfo.name}
                            onChange={(e) => updateForm("contactInfo.name", e.target.value)}
                          />
                        </div>
                      </InputField>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Phone Number" required error={errors["contactInfo.phone"]}>
                          <div className="relative">
                            <FiPhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <TextInput
                              className="pl-9"
                              placeholder="10-digit mobile number"
                              value={form.contactInfo.phone}
                              onChange={(e) => updateForm("contactInfo.phone", e.target.value)}
                              maxLength={10}
                            />
                          </div>
                        </InputField>

                        <InputField label="Alternate Phone">
                          <div className="relative">
                            <FiPhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <TextInput
                              className="pl-9"
                              placeholder="Alternate number"
                              value={form.contactInfo.alternatePhone}
                              onChange={(e) => updateForm("contactInfo.alternatePhone", e.target.value)}
                              maxLength={10}
                            />
                          </div>
                        </InputField>
                      </div>

                      <InputField label="Email Address" error={errors["contactInfo.email"]}>
                        <div className="relative">
                          <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <TextInput
                            className="pl-9"
                            placeholder="your@email.com"
                            type="email"
                            value={form.contactInfo.email}
                            onChange={(e) => updateForm("contactInfo.email", e.target.value)}
                          />
                        </div>
                      </InputField>

                      <InputField label="Preferred Call Time">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {["Anytime", "Morning (9AM-12PM)", "Afternoon (12PM-5PM)", "Evening (5PM-9PM)"].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => updateForm("contactInfo.preferredCallTime", t)}
                              className={`py-2 px-3 rounded-xl border-2 text-xs font-medium transition-all
                                ${form.contactInfo.preferredCallTime === t
                                  ? "border-violet-500 bg-violet-50 text-violet-700"
                                  : "border-gray-200 text-gray-600 hover:border-violet-300"}`}
                            >
                              <FiClock size={12} className="inline mr-1" />{t}
                            </button>
                          ))}
                        </div>
                      </InputField>
                    </div>
                  </div>
                )}

                {/* Step 7: Preview */}
                {currentStep === 7 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Review & Submit</h1>
                    <p className="text-gray-500 text-sm mb-6">Review your property details before submitting</p>

                    <div className="space-y-4">
                      <PreviewSection title="Property Type" icon={FiHome}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <InfoItem label="Category" value={form.category} />
                          <InfoItem label="Property Type" value={form.propertyType} />
                          <InfoItem label="Listing Type" value={form.listingType} />
                        </div>
                      </PreviewSection>

                      <PreviewSection title="Basic Details" icon={FiInfo}>
                        <div className="grid grid-cols-2 gap-3">
                          <InfoItem label="Title" value={form.title} />
                          <InfoItem label="BHK" value={`${form.bhk} BHK`} />
                          <InfoItem label="Bathrooms" value={form.bathrooms} />
                          <InfoItem label="Carpet Area" value={`${form.area.carpet} ${form.area.unit}`} />
                          <InfoItem label="Price" value={`₹${Number(form.price.amount || 0).toLocaleString("en-IN")}`} />
                          <InfoItem label="Property Age" value={form.propertyAge} />
                        </div>
                      </PreviewSection>

                      <PreviewSection title="Location" icon={FiMapPin}>
                        <InfoItem label="Address" value={form.location.address} />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                          <InfoItem label="City" value={form.location.city} />
                          <InfoItem label="Locality" value={form.location.locality} />
                          <InfoItem label="Pincode" value={form.location.pincode} />
                        </div>
                      </PreviewSection>

                      <PreviewSection title="Contact" icon={FiPhone}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InfoItem label="Name" value={form.contactInfo.name} />
                          <InfoItem label="Phone" value={form.contactInfo.phone} />
                          <InfoItem label="Email" value={form.contactInfo.email} />
                          <InfoItem label="Best Time" value={form.contactInfo.preferredCallTime} />
                        </div>
                      </PreviewSection>

                      {form.images.length > 0 && (
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FiCamera size={16} className="text-violet-500" /> Photos ({form.images.length})
                          </h3>
                          <div className="flex gap-2 overflow-x-auto">
                            {form.images.slice(0, 5).map((img, i) => (
                              <img key={i} src={img} alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl flex-shrink-0" />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl p-4 sm:p-5 border border-violet-100">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FiCheckCircle size={18} className="text-violet-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Ready to submit!</p>
                            <p className="text-sm text-gray-500 mt-0.5">Your property will be reviewed within 24-48 hours after submission.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer Navigation */}
            <div className="border-t border-gray-100 bg-white px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between sticky bottom-0 z-20">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft size={18} /> <span className="hidden sm:inline">Back</span>
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all ${i === currentStep ? "w-5 sm:w-6 h-2 bg-violet-600" : i < currentStep ? "w-2 h-2 bg-violet-400" : "w-2 h-2 bg-gray-200"}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-xs sm:text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-violet-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-violet-200"
              >
                {loading ? (
                  <><FiLoader size={14} className="animate-spin" /> <span className="hidden sm:inline">Processing...</span></>
                ) : currentStep === 7 ? (
                  <><FiCheckCircle size={14} /> <span>Submit</span></>
                ) : (
                  <><span className="hidden sm:inline">Save & </span>Continue <FiChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 pb-3 border-b border-gray-100">
        <Icon size={16} className="text-violet-500" /> {title}
      </h3>
      {children}
    </div>
  );
}

function InfoItem({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md w-full px-6">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
          <FiCheckCircle size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Submitted!</h1>
        <p className="text-gray-500 text-sm">Your property has been submitted for approval. It will be reviewed within 24-48 hours.</p>
        <div className="mt-6 p-4 bg-violet-50 rounded-2xl border border-violet-100">
          <p className="text-sm text-violet-700 font-medium">🎉 Congratulations! Your listing is now under review.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-8 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
        >
          Post Another Property
        </button>
      </div>
    </div>
  );
}
