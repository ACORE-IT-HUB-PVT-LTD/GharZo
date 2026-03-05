import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

import {
  FiHome, FiMapPin, FiCamera, FiCheckCircle, FiEye, FiChevronRight,
  FiChevronLeft, FiPlus, FiMinus, FiX, FiUpload, FiPhone, FiMail,
  FiUser, FiDollarSign, FiLayers, FiShield, FiZap, FiDroplet,
  FiWifi, FiTruck, FiStar, FiInfo, FiAlertCircle, FiCheck,
  FiSearch, FiLoader, FiGrid, FiBriefcase, FiKey, FiClock, FiUsers,
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
const getAuthToken = () =>
  localStorage.getItem("usertoken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("landlordtoken") ||
  sessionStorage.getItem("token") ||
  "";

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const mergeDeep = (target, source) => {
  if (!isObject(target) || !isObject(source)) return source ?? target;
  const out = { ...target };
  Object.keys(source).forEach((key) => {
    if (Array.isArray(source[key])) {
      out[key] = [...source[key]];
    } else if (isObject(source[key])) {
      out[key] = mergeDeep(isObject(target[key]) ? target[key] : {}, source[key]);
    } else if (source[key] !== undefined) {
      out[key] = source[key];
    }
  });
  return out;
};

const mapApiPropertyToForm = (property = {}) => {
  const geoCoords = property.geoLocation?.coordinates || [];
  const imageUrls = Array.isArray(property.images)
    ? property.images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean)
    : [];

  return {
    ...property,
    images: imageUrls,
    imageFiles: [],
    location: {
      ...(property.location || {}),
      coordinates: {
        latitude:
          property.location?.coordinates?.latitude ??
          property.location?.coordinates?.lat ??
          geoCoords[1] ??
          null,
        longitude:
          property.location?.coordinates?.longitude ??
          property.location?.coordinates?.lng ??
          geoCoords[0] ??
          null,
      },
    },
  };
};

// ─── Toast Component ───────────────────────────────────────────────────────────
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

// ─── Counter Box ───────────────────────────────────────────────────────────────
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

// ─── Select Card ───────────────────────────────────────────────────────────────
function SelectCard({ label, icon: Icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer text-center
        ${selected
          ? "border-violet-500 bg-violet-50 text-violet-700"
          : "border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:bg-violet-50/50"
        }`}
    >
      {Icon && <Icon size={22} />}
      <span className="text-xs font-medium leading-tight">{label}</span>
    </button>
  );
}

// ─── Chip Toggle ───────────────────────────────────────────────────────────────
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

// ─── Toggle Yes/No ─────────────────────────────────────────────────────────────
function YesNoToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
      <span className="text-sm text-gray-700">{label}</span>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider" />
      </label>
    </div>
  );
}

// ─── Input Field Wrapper ───────────────────────────────────────────────────────
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
  const handleKeyDown = (e) => {
    if (props.type === "number" && e.key === "-") {
      e.preventDefault();
    }
    if (props.onKeyDown) props.onKeyDown(e);
  };
  const handleWheel = (e) => {
    if (props.type === "number") e.target.blur();
  };
  return (
    <input
      {...props}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      min={props.type === "number" ? (props.min !== undefined ? props.min : 0) : undefined}
      className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all bg-white
        ${props.disabled ? "bg-gray-50 opacity-60" : ""}
        ${className ? className : "border-gray-200"}`}
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

function TextInputWithError({ error, ...props }) {
  return (
    <TextInput
      {...props}
      className={`border ${error ? "border-red-400 focus:ring-red-400" : "border-gray-200"} ${props.className || ""}`}
    />
  );
}

// ─── Preview Helpers ───────────────────────────────────────────────────────────
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

// ─── Success Screen ────────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md w-full px-6">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
          <FiCheckCircle size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Submitted!</h1>
        <p className="text-gray-500 text-sm">
          Your property has been submitted for approval. It will be reviewed within 24-48 hours.
        </p>
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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PropertyListingForm() {
  const { id } = useParams();
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
  const isCreatingDraft = useRef(false); // Track draft creation to prevent duplicates

  const [form, setForm] = useState({
    // Step 0
    category: "Residential",
    propertyType: "",
    listingType: "Rent",
    // Step 1
    title: "",
    description: "",
    bhk: 2,
    isRK: false,
    bathrooms: 1,
    balconies: 1,
    propertyAge: "",
    availableFrom: "",
    floor: { current: 0, total: 0 },
    area: { carpet: "", builtUp: "", superBuiltUp: "", plotArea: "", unit: "sqft" },
    price: {
      amount: "",
      negotiable: true,
      securityDeposit: "",
      maintenanceCharges: { amount: "", frequency: "Monthly" },
      lockInPeriod: "",
      noticePeriod: "",
      per: "Property",
      expectedRental: "",
      currentlyLeasedOut: false,
      leaseExpiryDate: "",
      annualDuesPayable: "",
    },
    // Step 2
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
      fireSafety: { fireExtinguisher: false, fireSensor: false, sprinklers: false, fireHoseReel: false },
      constructionQuality: "",
      rainwaterHarvesting: false,
      wasteDisposal: "",
      servantsRoom: false,
      studyRoom: false,
      poojaRoom: false,
      storeRoom: false,
    },
    // Step 3
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
    // Step 4
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
    // PG Details
    pgDetails: {
      roomType: "",
      foodIncluded: false,
      foodType: "",
      foodTimings: { breakfast: "", lunch: "", dinner: "" },
      genderPreference: "Any",
      totalBeds: 1,
      availableBeds: 1,
      commonWashroom: false,
      attachedWashroom: false,
      rules: [],
      commonAreas: [],
      facilities: { laundry: false, wifi: false, tv: false, refrigerator: false, ro: false, geyser: false },
      securityFeatures: { cctv: false, biometric: false, securityGuard: false, fireExtinguisher: false },
    },
    roomStats: { totalRooms: 0, occupiedRooms: 0, availableRooms: 0 },
    landlordDetails: {
      preferredPaymentMethod: "UPI",
      gstNumber: "",
      panNumber: "",
      bankAccount: { accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "", branchName: "" },
      upiDetails: { upiId: "", qrCodeUrl: "" },
    },
    // Step 5
    images: [],
    imageFiles: [],
    // Step 6
    contactInfo: {
      name: "",
      phone: "",
      alternatePhone: "",
      email: "",
      preferredCallTime: "Anytime",
    },
    postedBy: "owner",
    brokerage: {
      chargeType: "None",
      customValue: "",
    },
    // Commercial specific
    commercialCabins: 0,
    commercialWorkstations: 0,
    commercialWashrooms: 0,
    commercialMeetingRooms: 0,
    commercialPantry: false,
    commercialFrontagWidth: "",
    commercialEntranceHeight: "",
    commercialLoadingDocks: 0,
    commercialFireSafety: false,
    villaFloors: 1,
    duplexFloors: 1,
    duplexInternalStairs: false,
    penthouseTerraceArea: "",
    penthousePrivatePool: false,
    farmHouseGardenSize: "",
    farmHouseOpenSides: 0,
    villaPrivateGarden: false,
    villaTerraceArea: "",
    villaCarParking: 0,
    villaServantsRoom: false,
    independentHouseLift: false,
    plotBoundaryWall: false,
    plotOpenSides: 0,
    plotRoadWidth: "",
  });

  // ─── Toast Helpers ─────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (!id) return;

    const loadPropertyForEdit = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required");

        let rawProperty = null;
        try {
          const detailRes = await fetch(`${API_BASE}/${id}/details`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const detailData = await detailRes.json();
          if (detailRes.ok && detailData?.success && detailData?.data) {
            rawProperty = detailData.data;
          }
        } catch (_) {
          // fallback below
        }

        if (!rawProperty) {
          const res = await fetch(`${API_BASE}/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          if (!res.ok || !data?.success) {
            throw new Error(data?.message || "Failed to load property for edit");
          }
          rawProperty = data?.data || data?.property || null;
        }

        if (!rawProperty) {
          throw new Error("Property data not found");
        }

        const mappedData = mapApiPropertyToForm(rawProperty);
        setPropertyId(id);
        setForm((prev) => mergeDeep(prev, mappedData));
        setCurrentStep(1);
      } catch (err) {
        addToast(err.message || "Failed to prefill property data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadPropertyForEdit();
  }, [id, addToast]);

  // ─── Conditional Flags ─────────────────────────────────────────────────────
  const isPG = form.listingType === "PG/Co-living" || form.propertyType === "PG/Co-living";
  const isRent = form.listingType === "Rent";
  const isSale = form.listingType === "Sale";
  const isResidential = form.category === "Residential";
  const isCommercial = form.category === "Commercial";

  // ─── Property Types based on Category and Listing Type ─────────────────────────
  const residentialRentTypes = [
    { label: "Room", icon: RiHotelBedLine },
    { label: "Independent House", icon: PiHouseLine },
    { label: "Duplex", icon: BiBuildings },
    { label: "Villa", icon: MdVilla },
    { label: "Penthouse", icon: MdVilla },
    { label: "Studio", icon: FiGrid },
    { label: "Farm House", icon: MdVilla },
    { label: "Flat/Apartment", icon: PiBuildingApartment },
    { label: "Plot", icon: BiArea },
    { label: "Independent Floor", icon: LuBuilding2 },
  ];

  const residentialSaleTypes = [
    { label: "Flat/Apartment", icon: PiBuildingApartment },
    { label: "Independent House", icon: PiHouseLine },
    { label: "Duplex", icon: BiBuildings },
    { label: "Independent Floor", icon: LuBuilding2 },
    { label: "Villa", icon: MdVilla },
    { label: "Penthouse", icon: MdVilla },
    { label: "Studio", icon: FiGrid },
    { label: "Plot", icon: BiArea },
    { label: "Farm House", icon: MdVilla },
    { label: "Agricultural Land", icon: BiArea },
  ];

  const commercialRentTypes = [
    { label: "Office", icon: HiOutlineOfficeBuilding },
    { label: "Retail Shop", icon: MdStorefront },
    { label: "Showroom", icon: MdDoorSliding },
    { label: "Warehouse", icon: MdOutlineWarehouse },
    { label: "Plot", icon: BiArea },
    { label: "Studio", icon: FiGrid },
    { label: "Other", icon: FiBriefcase },
  ];

  const commercialSaleTypes = [
    { label: "Office", icon: HiOutlineOfficeBuilding },
    { label: "Retail Shop", icon: MdStorefront },
    { label: "Showroom", icon: MdDoorSliding },
    { label: "Warehouse", icon: MdOutlineWarehouse },
    { label: "Plot", icon: BiArea },
    { label: "Studio", icon: FiGrid },
    { label: "Other", icon: FiBriefcase },
  ];

  // Get property types based on category and listing type
  const getPropertyTypes = () => {
    if (isResidential && isRent) return residentialRentTypes;
    if (isResidential && isSale) return residentialSaleTypes;
    if (isCommercial && isRent) return commercialRentTypes;
    if (isCommercial && isSale) return commercialSaleTypes;
    return residentialRentTypes;
  };

  const propertyTypes = getPropertyTypes();
  const isPlot = form.propertyType === "Plot" || form.propertyType === "Agricultural Land";
  const isVilla = form.propertyType === "Villa" || form.propertyType === "Penthouse" || form.propertyType === "Farm House" || form.propertyType === "Duplex";
  const isOffice = form.propertyType === "Office";
  const isWarehouse = form.propertyType === "Warehouse";
  const isShop = form.propertyType === "Shop" || form.propertyType === "Showroom";
  const isUnderConstruction = form.propertyAge === "Under Construction";
  const isStudio = form.propertyType === "Studio";
  const isRoom = form.propertyType === "Room";
  const isFlat = form.propertyType === "Flat/Apartment";
  const isIndependentHouse = form.propertyType === "Independent House";
  const isIndependentFloor = form.propertyType === "Independent Floor";
  const isBuilderFloor = form.propertyType === "Builder Floor";
  const isDuplex = form.propertyType === "Duplex";
  const isPenthouse = form.propertyType === "Penthouse";
  const isFarmHouse = form.propertyType === "Farm House";
  const isVillaOnly = form.propertyType === "Villa";

  // ─── Property-Type Specific Configuration Flags ────────────────────────────
  const showBHK = !isPG && !isPlot && !isRoom && !isOffice && !isWarehouse && !isShop && isResidential &&
    (isFlat || isVilla || isStudio || isIndependentHouse || isIndependentFloor || isBuilderFloor ||
      form.propertyType === "Penthouse" || form.propertyType === "Duplex" || form.propertyType === "Farm House");

  const showRK = !isPG && !isPlot && !isOffice && !isWarehouse && !isShop && isResidential &&
    (isFlat || isStudio || isIndependentHouse || isIndependentFloor || isBuilderFloor ||
      form.propertyType === "Penthouse" || form.propertyType === "Duplex" || form.propertyType === "Farm House");

  const showBathrooms = !isPG && !isPlot && !isWarehouse && isResidential &&
    (isFlat || isVilla || isStudio || isRoom || isIndependentHouse || isIndependentFloor || isBuilderFloor ||
      form.propertyType === "Penthouse" || form.propertyType === "Duplex" || form.propertyType === "Farm House" || isShop || isOffice);

  const showCommercialWashrooms = isCommercial && (isOffice || isShop || isWarehouse);

  const showBalconies = !isPG && !isPlot && !isRoom && !isOffice && !isWarehouse && !isShop && isResidential &&
    (isFlat || isVilla || isStudio || isIndependentHouse || isIndependentFloor || isBuilderFloor ||
      form.propertyType === "Penthouse" || form.propertyType === "Duplex" || form.propertyType === "Farm House");

  const showFloor = !isPlot && !isPG;
  const showVillaFloors = isVilla;
  const showOfficeCabinsWorkstations = isOffice;
  const showFurnishing = !isPlot && !isPG && (isResidential || isOffice || isShop);
  const showFacing = !isPG;
  const showFloorDetails = !isPlot && !isPG;

  const showAdditionalRooms = !isPG && !isPlot && isResidential &&
    (isFlat || isVilla || isIndependentHouse || isIndependentFloor || isBuilderFloor ||
      form.propertyType === "Penthouse" || form.propertyType === "Duplex" || form.propertyType === "Farm House");

  const showOwnership = isSale;
  const showBuilder = isUnderConstruction && isSale;
  const showInvestment = isSale && isResidential;
  const showPropertyFeatures = !isPlot && !isPG && isResidential;
  const showPGSection = isPG;
  const showRoomStats = form.listingType === "PG/Co-living";
  const showBrokerage = isRent && form.postedBy === "agent";
  const showCommercialDetails = isCommercial && !isPlot;
  const isPGSale = form.listingType === "Sale" && form.propertyType === "PG/Co-living";

  const pricePerSqft =
    form.price.amount && form.area.carpet
      ? Math.round(Number(form.price.amount) / Number(form.area.carpet))
      : 0;

  const filteredNearbyAmenities = isCommercial
    ? ["School", "Hospital", "Market", "ATM", "Bank", "Metro Station", "Bus Stop", "Railway Station", "Airport", "Mall", "Restaurant", "Pharmacy", "Park"]
    : ["School", "Hospital", "Market", "ATM", "Bank", "Metro Station", "Bus Stop", "Railway Station", "Airport", "Mall", "Restaurant", "Pharmacy", "Park", "Temple", "Mosque", "Church", "Gurudwara"];

  // ─── Load Cities ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("https://api.gharzoreality.com/api/master-data/v2/cities")
      .then((r) => r.json())
      .then((d) => setCities(d.data || []))
      .catch(() => {});
  }, []);

  // ─── Load Mapbox (only when on step 3) ────────────────────────────────────
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
  }, [currentStep, mapLoaded]);

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
          location: { ...prev.location, coordinates: { latitude: lngLat.lat, longitude: lngLat.lng } },
        }));
      });

      map.on("click", (e) => {
        marker.setLngLat(e.lngLat);
        setForm((prev) => ({
          ...prev,
          location: { ...prev.location, coordinates: { latitude: e.lngLat.lat, longitude: e.lngLat.lng } },
        }));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }
  }, [mapLoaded, currentStep]);

  // ─── Form Helpers ──────────────────────────────────────────────────────────
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

  // ─── Geolocation ──────────────────────────────────────────────────────────
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
        if (MAPBOX_TOKEN) {
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.features?.[0]) {
                setForm((prev) => ({
                  ...prev,
                  location: { ...prev.location, address: d.features[0].place_name },
                }));
              }
            });
        }
      },
      () => addToast("Could not get location", "error")
    );
  };

  const searchAddress = async (query) => {
    if (!query || query.length < 3 || !MAPBOX_TOKEN) return;
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
      location: { ...prev.location, address: feat.place_name, coordinates: { latitude: lat, longitude: lng } },
    }));
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 15 });
      markerRef.current.setLngLat([lng, lat]);
    }
    setLocationSuggestions([]);
  };

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateStep = () => {
    const errs = {};
    try {
      if (currentStep === 0) {
        if (!form.category) errs.category = "Category is required";
        if (!form.listingType) errs.listingType = "Listing type is required";
        if (!isPG && !form.propertyType) errs.propertyType = "Property type is required";
      } else if (currentStep === 1) {
        if (!form.title?.trim()) errs.title = "Title is required";
        if (!form.price?.amount) errs["price.amount"] = "Price is required";
        if (Number(form.price?.amount) < 0) errs["price.amount"] = "Price cannot be negative";
        if (isPlot) {
          if (!form.area?.plotArea) errs["area.plotArea"] = "Plot area is required";
        } else if (!isPG) {
          if (!form.area?.carpet) errs["area.carpet"] = "Carpet area is required";
        }
        if (isPG) {
          if (!form.pgDetails?.roomType || !["Single", "Double Sharing", "Triple Sharing", "Dormitory"].includes(form.pgDetails.roomType.trim())) {
            errs["pgDetails.roomType"] = "Room type is required";
          }
          if (!form.pgDetails?.totalBeds || form.pgDetails.totalBeds < 1) {
            errs["pgDetails.totalBeds"] = "Total beds is required";
          }
        }
      } else if (currentStep === 3) {
        if (!form.location?.address?.trim()) errs["location.address"] = "Address is required";
        if (!form.location?.city?.trim()) errs["location.city"] = "City is required";
        if (!form.location?.locality?.trim()) errs["location.locality"] = "Locality is required";
        if (!form.location?.pincode || !/^[0-9]{6}$/.test(form.location.pincode))
          errs["location.pincode"] = "Valid 6-digit pincode required";
      } else if (currentStep === 6) {
        if (!form.contactInfo?.name?.trim()) errs["contactInfo.name"] = "Name is required";
        if (!form.contactInfo?.phone || !/^[0-9]{10}$/.test(form.contactInfo.phone))
          errs["contactInfo.phone"] = "Valid 10-digit phone required";
        if (form.contactInfo?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactInfo.email))
          errs["contactInfo.email"] = "Invalid email format";
      }
    } catch (e) {
      console.error("Validation error:", e);
    }
    setErrors(errs);
    return { isValid: Object.keys(errs).length === 0, errors: errs };
  };

  // ─── API Calls ─────────────────────────────────────────────────────────────
  const createDraft = async () => {
    // Prevent multiple draft creation calls using ref
    if (isCreatingDraft.current) return;
    isCreatingDraft.current = true;
    
    setLoading(true);
    try {
      const draftData = {
        category: form.category,
        listingType: form.listingType,
      };
      if (form.listingType !== "PG/Co-living" && form.propertyType) {
        draftData.propertyType = form.propertyType;
      }
      const res = await fetch(`${API_BASE}/create-draft`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify(draftData),
      });
      const data = await res.json();
      if (data.success) {
        setPropertyId(data.data.propertyId);
        addToast("Property draft created!");
        setCurrentStep(1);
      } else {
        throw new Error(data.error || data.message || "Operation failed");
      }
    } catch (e) {
      addToast(e.message || "Failed to create draft", "error");
    } finally {
      setLoading(false);
      isCreatingDraft.current = false;
    }
  };

  const VALID_ROOM_TYPES = ["Single", "Double Sharing", "Triple Sharing", "Dormitory"];

  const saveBasicDetails = async () => {
    setLoading(true);

    if (isPG) {
      if (!form.pgDetails.roomType || !VALID_ROOM_TYPES.includes(form.pgDetails.roomType.trim())) {
        addToast("Please select a valid room type (Single / Double Sharing / Triple Sharing / Dormitory)", "error");
        setLoading(false);
        return;
      }
      if (!form.pgDetails.totalBeds || form.pgDetails.totalBeds < 1) {
        addToast("Please specify total beds for PG/Co-living property", "error");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        listingType: form.listingType,
        category: form.category,
        title: form.title,
        description: form.description,
        availableFrom: form.availableFrom,
        availabilityStatus: "Available",
        price: {
          amount: Number(form.price.amount),
          negotiable: form.price.negotiable,
          per: isPG ? form.price.per : "Property",
          securityDeposit: Number(form.price.securityDeposit) || 0,
          maintenanceCharges: {
            amount: Number(form.price.maintenanceCharges.amount) || 0,
            frequency: form.price.maintenanceCharges.frequency,
          },
          lockInPeriod: Number(form.price.lockInPeriod) || 0,
          noticePeriod: Number(form.price.noticePeriod) || 0,
          expectedRental: Number(form.price.expectedRental) || 0,
          currentlyLeasedOut: form.price.currentlyLeasedOut,
          leaseExpiryDate: form.price.leaseExpiryDate || null,
          annualDuesPayable: Number(form.price.annualDuesPayable) || 0,
        },
        area: (() => {
          const areaObj = { unit: form.area.unit };
          if (isPlot) {
            const plotArea = Number(form.area.plotArea);
            if (plotArea > 0) areaObj.plotArea = plotArea;
          } else {
            const carpet = Number(form.area.carpet);
            if (carpet > 0) areaObj.carpet = carpet;
            const builtUp = Number(form.area.builtUp);
            if (builtUp > 0) areaObj.builtUp = builtUp;
            const superBuiltUp = Number(form.area.superBuiltUp);
            if (superBuiltUp > 0) areaObj.superBuiltUp = superBuiltUp;
          }
          return areaObj;
        })(),
      };

      if (!isPlot) {
        if (showBHK) {
          payload.bhk = form.bhk;
          payload.isRK = form.isRK;
        }
        if (showBathrooms) payload.bathrooms = form.bathrooms;
        if (showBalconies) payload.balconies = form.balconies;
        payload.floor = {
          current: form.floor.current,
          total: form.floor.total < 1 ? 1 : form.floor.total
        };
      }

      if (!isPG && !isPlot) {
        payload.propertyAge = form.propertyAge;
      }

      if (isPG) {
        const cleanedPgDetails = {};

        // Only include roomType if it's a valid enum value
        if (form.pgDetails.roomType && VALID_ROOM_TYPES.includes(form.pgDetails.roomType.trim())) {
          cleanedPgDetails.roomType = form.pgDetails.roomType.trim();
        }

        // Only include foodType if it's a valid enum value
        if (form.pgDetails.foodType && ["Veg", "Non-Veg", "Both"].includes(form.pgDetails.foodType.trim())) {
          cleanedPgDetails.foodType = form.pgDetails.foodType.trim();
        }

        payload.pgDetails = {
          ...form.pgDetails,
          ...cleanedPgDetails,
          totalBeds: Number(form.pgDetails.totalBeds),
          availableBeds: Number(form.pgDetails.availableBeds),
        };

        // Remove foodType from payload if not valid (spread above may have set it)
        if (!cleanedPgDetails.foodType) delete payload.pgDetails.foodType;
        // Remove roomType from payload if not valid
        if (!cleanedPgDetails.roomType) delete payload.pgDetails.roomType;
      }

      if (showRoomStats) {
        payload.roomStats = form.roomStats;
      }

      const res = await fetch(`${API_BASE}/${propertyId}/basic-details`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { addToast("Basic details saved!"); setCurrentStep(2); }
      else throw new Error(data.error || data.message || "Failed to save basic details");
    } catch (e) {
      addToast(e.message || "Failed to save basic details", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveFeatures = async () => {
    setLoading(true);
    try {
      const featuresData = {
        amenities: form.amenities,
      };
      if (!isPlot) {
        if (showFurnishing) featuresData.furnishing = form.furnishing;
        featuresData.parking = form.parking;

        const cleanedPropertyFeatures = {};
        Object.keys(form.propertyFeatures).forEach(key => {
          const value = form.propertyFeatures[key];
          if (value !== "" && value !== null && value !== undefined) {
            cleanedPropertyFeatures[key] = value;
          }
        });
        if (Object.keys(cleanedPropertyFeatures).length > 0) {
          featuresData.propertyFeatures = cleanedPropertyFeatures;
        }
      }
      if (form.facing) featuresData.facing = form.facing;

      const res = await fetch(`${API_BASE}/${propertyId}/features`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify(featuresData),
      });
      const data = await res.json();
      if (data.success) { addToast("Features saved!"); setCurrentStep(3); }
      else throw new Error(data.error || data.message || "Operation failed");
    } catch (e) {
      addToast(e.message || "Failed to save features", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveLocation = async () => {
    setLoading(true);
    try {
      const locationData = {
        ...form.location,
        ...(form.location.coordinates.latitude && form.location.coordinates.longitude ? {
          geoLocation: {
            type: "Point",
            coordinates: [form.location.coordinates.longitude, form.location.coordinates.latitude]
          }
        } : {})
      };
      const res = await fetch(`${API_BASE}/${propertyId}/location`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify({ location: locationData }),
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
        body: JSON.stringify({
          contactInfo: form.contactInfo,
          postedBy: form.postedBy,
          brokerage: form.brokerage,
        }),
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
    if (isPG) {
      if (!form.pgDetails?.roomType || !["Single", "Double Sharing", "Triple Sharing", "Dormitory"].includes(form.pgDetails.roomType.trim())) {
        addToast("Please select a valid room type before submitting", "error");
        setLoading(false);
        return;
      }
      if (!form.pgDetails?.totalBeds || form.pgDetails.totalBeds < 1) {
        addToast("Please specify total beds before submitting", "error");
        setLoading(false);
        return;
      }
    }
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

  // ─── Navigation ────────────────────────────────────────────────────────────
  const handleNext = async () => {
    // Prevent multiple clicks during loading or draft creation
    if (loading || isCreatingDraft.current) return;
    
    const validationResult = validateStep();
    const isValid = validationResult.isValid;
    const validationErrors = validationResult.errors || {};

    if (!isValid) {
      const errorMessages = Object.values(validationErrors);
      if (errorMessages.length > 0) {
        const errorText = errorMessages.slice(0, 5).join(", ");
        const moreText = errorMessages.length > 5 ? ` and ${errorMessages.length - 5} more` : "";
        addToast(`Missing: ${errorText}${moreText}`, "error");
      } else {
        addToast("Please fill all required fields", "error");
      }
      return;
    }
    if (currentStep === 0) {
      if (!propertyId) {
        await createDraft();
      } else {
        setCurrentStep(1);
      }
      return;
    }
    if (currentStep === 1) { await saveBasicDetails(); return; }
    if (currentStep === 2) { await saveFeatures(); return; }
    if (currentStep === 3) { await saveLocation(); return; }
    if (currentStep === 4) {
      if (!isSale) {
        setCurrentStep(5);
        return;
      }
      await saveOwnership();
      return;
    }
    if (currentStep === 5) { await uploadPhotos(); return; }
    if (currentStep === 6) { await saveContact(); return; }
    if (currentStep === 7) { await submitProperty(); return; }
  };

  const navigate = useNavigate();

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((p) => p - 1);
    } else {
      navigate("/landlord");
    }
  };

  // ─── Sidebar Steps ──────────────────────────────────────────────────────────
  const sidebarSteps = [
    { label: "Property Details", icon: FiHome, step: 0 },
    { label: "Basic Details", icon: FiInfo, step: 1 },
    { label: "Property Highlights", icon: FiStar, step: 2 },
    { label: "Address", icon: FiMapPin, step: 3, score: 15 },
    { label: "Verify", icon: FiShield, step: 4, score: 20 },
    { label: "Photos", icon: FiCamera, step: 5, score: 15 },
    { label: "Contact", icon: FiPhone, step: 6 },
    { label: "Review", icon: FiEye, step: 7 },
  ];

  const filteredCities = cities.filter((c) =>
    c.name?.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Keep legacy arrays for backward compatibility but they're not used anymore
  const residentialTypes = [];
  const commercialTypes = [];

  const pgPricingOptions = ["Bed", "Room"];

  const furnishingItems = [
    "Sofa", "Center Table", "Dining Table", "TV Unit", "Curtains", "Carpet",
    "Bed", "Wardrobe", "Mattress", "Side Table", "Dressing Table",
    "Modular Kitchen", "Kitchen Cabinets", "Chimney", "Stove", "Refrigerator", "Microwave",
    "Water Purifier", "Exhaust Fan",
    "Air Conditioner", "Geyser", "Washing Machine", "Dishwasher",
    "Fan", "Light Fittings", "Lights", "Inverter",
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

  // ─── WhatsApp redirect ─────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    const phoneNumber = "9755271778";
    const imageUrl = "https://gharzoreality.com/assets/stigar.png";
    const message = `Hi! I'm interested to list my property on Gharzo Realty website.\n\nPlease find the attached reference: ${imageUrl}\n\nLooking forward to listing my property with Gharzo Realty™`;
    const msg = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, "_blank");
  };

  // ─── Configuration Section Helper ─────────────────────────────────────────
  const getConfigurationTitle = () => {
    if (isPG) return "PG / Co-living Configuration";
    if (isPlot) return "Plot Details";
    if (isOffice) return "Office Configuration";
    if (isWarehouse) return "Warehouse Configuration";
    if (isShop) return "Shop / Showroom Configuration";
    if (isDuplex) return "Duplex Configuration";
    if (isPenthouse) return "Penthouse Configuration";
    if (isFarmHouse) return "Farm House Configuration";
    if (isVillaOnly) return "Villa Configuration";
    if (isStudio) return "Studio Configuration";
    if (isRoom) return "Room Configuration";
    if (isIndependentHouse) return "Independent House Configuration";
    if (isIndependentFloor || isBuilderFloor) return "Floor Configuration";
    if (isFlat) return "Flat / Apartment Configuration";
    return "Configuration";
  };

  // ─── Sidebar Content ───────────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      <div className="px-2 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl transition-all font-semibold text-xs shadow-md hover:shadow-lg transform hover:scale-105 w-full justify-center"
          >
            <FaWhatsapp size={18} className="text-white" />
            Post Property via
          </button>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={20} />
          </button>
        </div>
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
          const isActive = currentStep === step;
          const isDone = currentStep > step;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (isDone || isActive) {
                  setCurrentStep(step);
                  setSidebarOpen(false);
                }
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-left
                ${isActive ? "bg-violet-50" : isDone ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}
              `}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${isDone ? "bg-emerald-100 text-emerald-600" : isActive ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                {isDone ? <FiCheck size={14} /> : <Icon size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${isActive ? "text-violet-700" : isDone ? "text-gray-700" : "text-gray-500"}`}>
                  {label}
                </p>
                {isActive && <p className="text-xs text-violet-500">In progress</p>}
                {!isActive && !isDone && score && (
                  <p className="text-xs text-emerald-500">Score +{score}%</p>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Need Help?{" "}
          <span className="text-violet-600 cursor-pointer font-medium">📞 Call 08048811281</span>
        </p>
      </div>
    </>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
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
        .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        .sidebar-drawer { position: fixed; top: 0; left: 0; height: 100%; width: 280px; background: white; z-index: 50; display: flex; flex-direction: column; box-shadow: 4px 0 24px rgba(0,0,0,0.1); transform: translateX(-100%); transition: transform 0.3s ease; }
        .sidebar-drawer.open { transform: translateX(0); }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .field-error { border-color: #f87171 !important; }
        .field-error:focus { --tw-ring-color: #f87171 !important; }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />

      {currentStep === 8 ? (
        <SuccessScreen />
      ) : (
        <div className="flex min-h-screen">

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-shrink-0 flex-col shadow-sm">
            <SidebarContent />
          </div>

          {/* Mobile Sidebar Drawer */}
          {sidebarOpen && (
            <div className="lg:hidden">
              <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
              <div className="sidebar-drawer open">
                <SidebarContent />
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-violet-50 hover:text-violet-600 transition-colors" onClick={() => setSidebarOpen(true)}>
                  <FiMenu size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-violet-700 transition-colors rounded-xl hover:bg-violet-50"
                >
                  <FiChevronLeft size={16} /> Back
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all ${i === currentStep ? "w-5 h-2 bg-violet-600" : i < currentStep ? "w-2 h-2 bg-violet-400" : "w-2 h-2 bg-gray-200"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium hidden sm:block">{Math.round((currentStep / 7) * 100)}%</span>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-xs sm:text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-violet-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-violet-200"
              >
                {loading ? (
                  <><FiLoader size={14} className="animate-spin" /> Processing...</>
                ) : currentStep === 7 ? (
                  <><FiCheckCircle size={14} /> Submit</>
                ) : (
                  <>Save & Continue <FiChevronRight size={14} /></>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">

                {/* ── STEP 0: Property Type ────────────────────────────────── */}
                {currentStep === 0 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Add Property Details</h1>
                    <p className="text-gray-500 text-sm mb-6">Tell us about your property</p>

                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-6">
                      <InputField label="Category" required error={errors.category}>
                        <div className="flex gap-3 mt-1">
                          {["Residential", "Commercial"].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                updateForm("category", cat);
                                updateForm("propertyType", "");
                                if (cat === "Commercial" && form.listingType === "PG/Co-living") {
                                  updateForm("listingType", "Rent");
                                }
                              }}
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

                      <InputField label="Looking to" error={errors.listingType}>
                        <div className="flex gap-2 sm:gap-3 mt-1">
                          {["Rent", "Sale", "PG/Co-living"].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                updateForm("listingType", t);
                                if (t === "PG/Co-living") {
                                  updateForm("propertyType", "PG/Co-living");
                                  updateForm("price.per", "Bed");
                                } else {
                                  updateForm("propertyType", "");
                                  updateForm("price.per", "Property");
                                }
                              }}
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

                      {isPG ? (
                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-violet-700">
                            <RiHotelBedLine size={20} />
                            <span className="font-semibold">PG/Co-living Selected</span>
                          </div>
                          <p className="text-sm text-violet-600 mt-1">Property type is automatically set to PG/Co-living</p>
                        </div>
                      ) : (
                        <InputField label="Property Type" error={errors.propertyType}>
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
                      )}

                      {loading && (
                        <div className="flex items-center gap-2 text-violet-600 text-sm">
                          <FiLoader size={16} className="animate-spin" /> Creating your listing...
                        </div>
                      )}

                      {/* Save & Continue Button for Step 0 */}
                      <div className="flex justify-center mt-6">
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={loading || !form.category || !form.listingType || (!isPG && !form.propertyType)}
                          className="px-8 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <FiLoader size={18} className="animate-spin" /> Saving...
                            </>
                          ) : (
                            <>
                              Save & Continue <FiChevronRight size={18} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 1: Basic Details ────────────────────────────────── */}
                {currentStep === 1 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Basic Details</h1>
                    <p className="text-gray-500 text-sm mb-6">Share key details about your property</p>

                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                        <InputField label="Property Title" required error={errors.title}>
                          <input
                            placeholder="e.g. Spacious 3BHK in Vijay Nagar"
                            value={form.title}
                            onChange={(e) => updateForm("title", e.target.value)}
                            maxLength={200}
                            className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors.title ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
                          />
                        </InputField>

                        <InputField label="Description">
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
                          {!isPlot && !isPG && (
                            <InputField label="Property Age">
                              <SelectInput value={form.propertyAge} onChange={(e) => updateForm("propertyAge", e.target.value)}>
                                <option value="">Select age</option>
                                {["Under Construction", "0-1 year", "1-5 years", "5-10 years", "10+ years"].map((a) => (
                                  <option key={a} value={a}>{a}</option>
                                ))}
                              </SelectInput>
                            </InputField>
                          )}

                          {!isUnderConstruction && !isPG && (
                            <InputField label="Available From">
                              <TextInput
                                type="date"
                                value={form.availableFrom}
                                onChange={(e) => updateForm("availableFrom", e.target.value)}
                              />
                            </InputField>
                          )}

                          {isUnderConstruction && !isPG && (
                            <InputField label="Possession Date">
                              <TextInput
                                type="date"
                                value={form.builder.possessionDate}
                                onChange={(e) => updateForm("builder.possessionDate", e.target.value)}
                              />
                            </InputField>
                          )}
                        </div>
                      </div>

                      {/* ── Configuration Section ── */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FiHome size={16} className="text-violet-500" /> {getConfigurationTitle()}
                        </h3>

                        {/* ── Plot / Agricultural Land ── */}
                        {isPlot && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                              <BiArea size={20} className="text-amber-600 flex-shrink-0" />
                              <p className="text-sm text-amber-700">Plot area details are captured in the Area section below.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                              <InputField label="Road Width (ft)">
                                <TextInput
                                  type="number"
                                  placeholder="e.g. 30"
                                  value={form.plotRoadWidth}
                                  onChange={(e) => updateForm("plotRoadWidth", e.target.value)}
                                />
                              </InputField>
                              <InputField label="Open Sides">
                                <SelectInput value={form.plotOpenSides} onChange={(e) => updateForm("plotOpenSides", Number(e.target.value))}>
                                  {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                                </SelectInput>
                              </InputField>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Boundary Wall" value={form.plotBoundaryWall} onChange={(v) => updateForm("plotBoundaryWall", v)} />
                            </div>
                          </div>
                        )}

                        {/* ── PG / Co-living ── */}
                        {isPG && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="Total Beds" value={form.pgDetails.totalBeds} onChange={(v) => updateForm("pgDetails.totalBeds", v)} icon={MdBed} min={1} max={100} />
                              {errors["pgDetails.totalBeds"] && (
                                <p className="text-xs text-red-500 w-full mt-1">{errors["pgDetails.totalBeds"]}</p>
                              )}
                              <CounterBox label="Available Beds" value={form.pgDetails.availableBeds} onChange={(v) => updateForm("pgDetails.availableBeds", v)} icon={FiUser} min={0} max={100} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <InputField label="Sharing Type" error={errors["pgDetails.roomType"]}>
                                <select
                                  value={form.pgDetails.roomType}
                                  onChange={(e) => updateForm("pgDetails.roomType", e.target.value)}
                                  className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white appearance-none ${errors["pgDetails.roomType"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
                                >
                                  <option value="">Select sharing type</option>
                                  {["Single", "Double Sharing", "Triple Sharing", "Dormitory"].map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </InputField>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Attached Washroom" value={form.pgDetails.attachedWashroom} onChange={(v) => updateForm("pgDetails.attachedWashroom", v)} />
                              <YesNoToggle label="Food Included" value={form.pgDetails.foodIncluded} onChange={(v) => updateForm("pgDetails.foodIncluded", v)} />
                            </div>
                          </div>
                        )}

                        {/* ── Room ── */}
                        {isRoom && !isPG && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="Bathrooms" value={form.bathrooms} onChange={(v) => updateForm("bathrooms", v)} icon={LuBath} min={1} max={10} />
                              <CounterBox label="Current Floor" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                              <CounterBox label="Total Floors" value={form.floor.total} onChange={(v) => updateForm("floor.total", v)} icon={LuBuilding2} min={0} max={100} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Attached Washroom" value={form.pgDetails.attachedWashroom} onChange={(v) => updateForm("pgDetails.attachedWashroom", v)} />
                              <YesNoToggle label="Food Included" value={form.pgDetails.foodIncluded} onChange={(v) => updateForm("pgDetails.foodIncluded", v)} />
                            </div>
                          </div>
                        )}

                        {/* ── Studio ── */}
                        {isStudio && !isPG && (
                          <div className="space-y-4">
                            {/* BHK with RK Toggle */}
                            {showBHK && (
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-wrap gap-4 sm:gap-6">
                                  <CounterBox label={form.isRK ? "RK" : "BHK"} value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                                </div>
                                {showRK && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", false);
                                        if (form.bhk < 1) updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        !form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      BHK
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", true);
                                        updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      1 RK
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="Bathrooms" value={form.bathrooms} onChange={(v) => updateForm("bathrooms", v)} icon={LuBath} min={1} max={10} />
                              <CounterBox label="Balconies" value={form.balconies} onChange={(v) => updateForm("balconies", v)} icon={MdBalcony} min={0} max={10} />
                              <CounterBox label="Current Floor" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                              <CounterBox label="Total Floors" value={form.floor.total} onChange={(v) => updateForm("floor.total", v)} icon={LuBuilding2} min={0} max={100} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <InputField label="Kitchenette Type">
                                <SelectInput value={form.propertyFeatures.flooring} onChange={(e) => updateForm("studioKitchenType", e.target.value)}>
                                  <option value="">Select type</option>
                                  {["Open", "Closed", "None"].map((v) => <option key={v} value={v}>{v}</option>)}
                                </SelectInput>
                              </InputField>
                            </div>
                          </div>
                        )}

                        {/* ── Flat / Apartment ── */}
                        {isFlat && !isPG && (
                          <div className="space-y-4">
                            {/* BHK with RK Toggle */}
                            {showBHK && (
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-wrap gap-4 sm:gap-6">
                                  <CounterBox label={form.isRK ? "RK" : "BHK"} value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                                </div>
                                {showRK && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", false);
                                        if (form.bhk < 1) updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        !form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      BHK
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", true);
                                        updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      1 RK
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="BHK" value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                              <CounterBox label="Bathrooms" value={form.bathrooms} onChange={(v) => updateForm("bathrooms", v)} icon={LuBath} min={1} max={10} />
                              <CounterBox label="Balconies" value={form.balconies} onChange={(v) => updateForm("balconies", v)} icon={MdBalcony} min={0} max={10} />
                              <CounterBox label="Current Floor" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                              <CounterBox label="Total Floors" value={form.floor.total} onChange={(v) => updateForm("floor.total", v)} icon={LuBuilding2} min={0} max={100} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Reserved Parking" value={form.parking.covered > 0} onChange={(v) => updateForm("parking.covered", v ? 1 : 0)} />
                              <YesNoToggle label="Servant Room" value={form.propertyFeatures.servantsRoom} onChange={(v) => updateForm("propertyFeatures.servantsRoom", v)} />
                            </div>
                          </div>
                        )}

                        {/* ── Villa (only) ── */}
                        {isVillaOnly && !isPG && (
                          <div className="space-y-4">
                            {/* BHK with RK Toggle */}
                            {showBHK && (
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-wrap gap-4 sm:gap-6">
                                  <CounterBox label={form.isRK ? "RK" : "BHK"} value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                                </div>
                                {showRK && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", false);
                                        if (form.bhk < 1) updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        !form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      BHK
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", true);
                                        updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      1 RK
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="BHK" value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                              <CounterBox label="Bathrooms" value={form.bathrooms} onChange={(v) => updateForm("bathrooms", v)} icon={LuBath} min={1} max={10} />
                              <CounterBox label="Balconies" value={form.balconies} onChange={(v) => updateForm("balconies", v)} icon={MdBalcony} min={0} max={10} />
                              <CounterBox label="Total Floors" value={form.villaFloors} onChange={(v) => updateForm("villaFloors", v)} icon={LuBuilding2} min={1} max={5} />
                              <CounterBox label="Car Parking" value={form.villaCarParking} onChange={(v) => updateForm("villaCarParking", v)} icon={RiParkingBoxLine} min={0} max={10} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Private Garden" value={form.villaPrivateGarden} onChange={(v) => updateForm("villaPrivateGarden", v)} />
                              <YesNoToggle label="Servant Room" value={form.propertyFeatures.servantsRoom} onChange={(v) => updateForm("propertyFeatures.servantsRoom", v)} />
                            </div>
                            <InputField label="Terrace Area (sqft)">
                              <TextInput type="number" placeholder="e.g. 400" value={form.villaTerraceArea} onChange={(e) => updateForm("villaTerraceArea", e.target.value)} />
                            </InputField>
                          </div>
                        )}

                        {/* ── Duplex ── */}
                        {isDuplex && !isPG && (
                          <div className="space-y-4">
                            {/* BHK with RK Toggle */}
                            {showBHK && (
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-wrap gap-4 sm:gap-6">
                                  <CounterBox label={form.isRK ? "RK" : "BHK"} value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                                </div>
                                {showRK && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", false);
                                        if (form.bhk < 1) updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        !form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      BHK
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", true);
                                        updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      1 RK
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="BHK" value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                              <CounterBox label="Bathrooms" value={form.bathrooms} onChange={(v) => updateForm("bathrooms", v)} icon={LuBath} min={1} max={10} />
                              <CounterBox label="Balconies" value={form.balconies} onChange={(v) => updateForm("balconies", v)} icon={MdBalcony} min={0} max={10} />
                              <CounterBox label="Floors in Duplex" value={form.duplexFloors} onChange={(v) => updateForm("duplexFloors", v)} icon={LuBuilding2} min={1} max={3} />
                              <CounterBox label="Current Floor" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Internal Stairs" value={form.duplexInternalStairs} onChange={(v) => updateForm("duplexInternalStairs", v)} />
                            </div>
                          </div>
                        )}

                        {/* ── Penthouse ── */}
                        {isPenthouse && !isPG && (
                          <div className="space-y-4">
                            {/* BHK with RK Toggle */}
                            {showBHK && (
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-wrap gap-4 sm:gap-6">
                                  <CounterBox label={form.isRK ? "RK" : "BHK"} value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                                </div>
                                {showRK && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", false);
                                        if (form.bhk < 1) updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        !form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      BHK
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", true);
                                        updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      1 RK
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="BHK" value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                              <CounterBox label="Bathrooms" value={form.bathrooms} onChange={(v) => updateForm("bathrooms", v)} icon={LuBath} min={1} max={10} />
                              <CounterBox label="Balconies" value={form.balconies} onChange={(v) => updateForm("balconies", v)} icon={MdBalcony} min={0} max={10} />
                              <CounterBox label="Floor Number" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                            </div>
                            <InputField label="Terrace Area (sqft)">
                              <TextInput type="number" placeholder="e.g. 600" value={form.penthouseTerraceArea} onChange={(e) => updateForm("penthouseTerraceArea", e.target.value)} />
                            </InputField>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Private Pool" value={form.penthousePrivatePool} onChange={(v) => updateForm("penthousePrivatePool", v)} />
                            </div>
                          </div>
                        )}

                        {/* ── Farm House ── */}
                        {isFarmHouse && !isPG && (
                          <div className="space-y-4">
                            {/* BHK with RK Toggle */}
                            {showBHK && (
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-wrap gap-4 sm:gap-6">
                                  <CounterBox label={form.isRK ? "RK" : "BHK"} value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                                </div>
                                {showRK && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", false);
                                        if (form.bhk < 1) updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        !form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      BHK
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", true);
                                        updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      1 RK
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="BHK" value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                              <CounterBox label="Bathrooms" value={form.bathrooms} onChange={(v) => updateForm("bathrooms", v)} icon={LuBath} min={1} max={10} />
                              <CounterBox label="Balconies" value={form.balconies} onChange={(v) => updateForm("balconies", v)} icon={MdBalcony} min={0} max={10} />
                              <CounterBox label="Open Sides" value={form.farmHouseOpenSides} onChange={(v) => updateForm("farmHouseOpenSides", v)} icon={FiSun} min={0} max={4} />
                            </div>
                            <InputField label="Garden Size (sqft)">
                              <TextInput type="number" placeholder="e.g. 2000" value={form.farmHouseGardenSize} onChange={(e) => updateForm("farmHouseGardenSize", e.target.value)} />
                            </InputField>
                          </div>
                        )}

                        {/* ── Independent House ── */}
                        {isIndependentHouse && !isPG && (
                          <div className="space-y-4">
                            {/* BHK with RK Toggle */}
                            {showBHK && (
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-wrap gap-4 sm:gap-6">
                                  <CounterBox label={form.isRK ? "RK" : "BHK"} value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                                </div>
                                {showRK && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", false);
                                        if (form.bhk < 1) updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        !form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      BHK
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", true);
                                        updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      1 RK
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="BHK" value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                              <CounterBox label="Bathrooms" value={form.bathrooms} onChange={(v) => updateForm("bathrooms", v)} icon={LuBath} min={1} max={10} />
                              <CounterBox label="Balconies" value={form.balconies} onChange={(v) => updateForm("balconies", v)} icon={MdBalcony} min={0} max={10} />
                              <CounterBox label="Total Floors" value={form.floor.total} onChange={(v) => updateForm("floor.total", v)} icon={LuBuilding2} min={0} max={20} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Lift Available" value={form.independentHouseLift} onChange={(v) => updateForm("independentHouseLift", v)} />
                              <YesNoToggle label="Servant Room" value={form.propertyFeatures.servantsRoom} onChange={(v) => updateForm("propertyFeatures.servantsRoom", v)} />
                            </div>
                          </div>
                        )}

                        {/* ── Independent Floor / Builder Floor ── */}
                        {(isIndependentFloor || isBuilderFloor) && !isPG && (
                          <div className="space-y-4">
                            {/* BHK with RK Toggle */}
                            {showBHK && (
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-wrap gap-4 sm:gap-6">
                                  <CounterBox label={form.isRK ? "RK" : "BHK"} value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                                </div>
                                {showRK && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", false);
                                        if (form.bhk < 1) updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        !form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      BHK
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateForm("isRK", true);
                                        updateForm("bhk", 1);
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        form.isRK
                                          ? "bg-violet-600 border-violet-600 text-white"
                                          : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
                                      }`}
                                    >
                                      1 RK
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="BHK" value={form.bhk} onChange={(v) => updateForm("bhk", v)} icon={RiHotelBedLine} min={1} max={10} />
                              <CounterBox label="Bathrooms" value={form.bathrooms} onChange={(v) => updateForm("bathrooms", v)} icon={LuBath} min={1} max={10} />
                              <CounterBox label="Balconies" value={form.balconies} onChange={(v) => updateForm("balconies", v)} icon={MdBalcony} min={0} max={10} />
                              <CounterBox label="Current Floor" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                              <CounterBox label="Total Floors" value={form.floor.total} onChange={(v) => updateForm("floor.total", v)} icon={LuBuilding2} min={0} max={100} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Lift Available" value={form.independentHouseLift} onChange={(v) => updateForm("independentHouseLift", v)} />
                            </div>
                          </div>
                        )}

                        {/* ── Office ── */}
                        {isOffice && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="Current Floor" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                              <CounterBox label="Total Floors" value={form.floor.total} onChange={(v) => updateForm("floor.total", v)} icon={LuBuilding2} min={0} max={100} />
                              <CounterBox label="Cabins" value={form.commercialCabins} onChange={(v) => updateForm("commercialCabins", v)} icon={FiBriefcase} min={0} max={50} />
                              <CounterBox label="Workstations" value={form.commercialWorkstations} onChange={(v) => updateForm("commercialWorkstations", v)} icon={FiGrid} min={0} max={200} />
                              <CounterBox label="Meeting Rooms" value={form.commercialMeetingRooms} onChange={(v) => updateForm("commercialMeetingRooms", v)} icon={FiUsers} min={0} max={20} />
                              <CounterBox label="Washrooms" value={form.commercialWashrooms} onChange={(v) => updateForm("commercialWashrooms", v)} icon={LuBath} min={0} max={20} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Pantry" value={form.commercialPantry} onChange={(v) => updateForm("commercialPantry", v)} />
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                              <p className="text-xs text-blue-700 flex items-center gap-1.5">
                                <FiInfo size={12} /> Cabins = Enclosed private rooms. Workstations = Open seating area.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ── Shop / Showroom ── */}
                        {isShop && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="Current Floor" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                              <CounterBox label="Total Floors" value={form.floor.total} onChange={(v) => updateForm("floor.total", v)} icon={LuBuilding2} min={0} max={100} />
                              <CounterBox label="Washrooms" value={form.commercialWashrooms} onChange={(v) => updateForm("commercialWashrooms", v)} icon={LuBath} min={0} max={10} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <InputField label="Frontage Width (ft)">
                                <TextInput type="number" placeholder="e.g. 20" value={form.commercialFrontagWidth} onChange={(e) => updateForm("commercialFrontagWidth", e.target.value)} />
                              </InputField>
                              <InputField label="Entrance Height (ft)">
                                <TextInput type="number" placeholder="e.g. 12" value={form.commercialEntranceHeight} onChange={(e) => updateForm("commercialEntranceHeight", e.target.value)} />
                              </InputField>
                            </div>
                          </div>
                        )}

                        {/* ── Warehouse ── */}
                        {isWarehouse && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-4 sm:gap-6">
                              <CounterBox label="Current Floor" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                              <CounterBox label="Total Floors" value={form.floor.total} onChange={(v) => updateForm("floor.total", v)} icon={LuBuilding2} min={0} max={100} />
                              <CounterBox label="Loading Docks" value={form.commercialLoadingDocks} onChange={(v) => updateForm("commercialLoadingDocks", v)} icon={FiTruck} min={0} max={20} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <InputField label="Ceiling Height (ft)">
                                <TextInput type="number" placeholder="e.g. 20" value={form.propertyFeatures.ceilingHeight} onChange={(e) => updateForm("propertyFeatures.ceilingHeight", e.target.value)} />
                              </InputField>
                              <InputField label="Road Width (ft)">
                                <TextInput type="number" placeholder="e.g. 40" value={form.propertyFeatures.widthOfFacingRoad} onChange={(e) => updateForm("propertyFeatures.widthOfFacingRoad", e.target.value)} />
                              </InputField>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <YesNoToggle label="Fire Safety" value={form.commercialFireSafety} onChange={(v) => updateForm("commercialFireSafety", v)} />
                            </div>
                          </div>
                        )}

                        {/* ── Other ── */}
                        {form.propertyType === "Other" && !isPG && (
                          <div className="flex flex-wrap gap-4 sm:gap-6">
                            <CounterBox label="Current Floor" value={form.floor.current} onChange={(v) => updateForm("floor.current", v)} icon={FiLayers} min={0} max={100} />
                            <CounterBox label="Total Floors" value={form.floor.total} onChange={(v) => updateForm("floor.total", v)} icon={LuBuilding2} min={0} max={100} />
                          </div>
                        )}
                      </div>

                      {/* Area Section */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <BiArea size={16} className="text-violet-500" /> Area Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {isPlot ? (
                            <InputField label="Plot Area" required error={errors["area.plotArea"]}>
                              <input
                                type="number"
                                placeholder="e.g. 2400"
                                value={form.area.plotArea}
                                onChange={(e) => updateForm("area.plotArea", e.target.value)}
                                min={0}
                                onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                                onWheel={(e) => e.target.blur()}
                                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors["area.plotArea"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
                              />
                            </InputField>
                          ) : (
                            <InputField
                              label={isWarehouse ? "Warehouse Area" : isOffice ? "Office Area" : isShop ? "Shop Area" : "Carpet Area"}
                              required
                              error={errors["area.carpet"]}
                            >
                              <input
                                type="number"
                                placeholder={isWarehouse ? "e.g. 5000" : isOffice ? "e.g. 1500" : "e.g. 1200"}
                                value={form.area.carpet}
                                onChange={(e) => updateForm("area.carpet", e.target.value)}
                                min={0}
                                onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                                onWheel={(e) => e.target.blur()}
                                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors["area.carpet"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
                              />
                            </InputField>
                          )}
                          {!isPlot && (
                            <InputField label="Built-up Area">
                              <TextInput
                                type="number"
                                placeholder="e.g. 1400"
                                value={form.area.builtUp}
                                onChange={(e) => updateForm("area.builtUp", e.target.value)}
                              />
                            </InputField>
                          )}
                          <InputField label="Unit">
                            <SelectInput value={form.area.unit} onChange={(e) => updateForm("area.unit", e.target.value)}>
                              {["sqft", "sqm", "sqyd", ...(isPlot ? ["acre", "hectare"] : [])].map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </SelectInput>
                          </InputField>
                        </div>
                      </div>

                      {/* Pricing Section */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FiDollarSign size={16} className="text-violet-500" /> Pricing
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InputField
                            label={isPG ? "Price (₹)" : isSale ? "Sale Price (₹)" : "Monthly Rent (₹)"}
                            required
                            error={errors["price.amount"]}
                          >
                            <input
                              type="number"
                              placeholder={isPG ? "e.g. 8000" : isSale ? "e.g. 5000000" : "e.g. 25000"}
                              value={form.price.amount}
                              onChange={(e) => updateForm("price.amount", e.target.value)}
                              min={0}
                              onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                              onWheel={(e) => e.target.blur()}
                              className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors["price.amount"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
                            />
                          </InputField>

                          {isPG && !isPGSale && (
                            <InputField label="Price Per">
                              <SelectInput value={form.price.per} onChange={(e) => updateForm("price.per", e.target.value)}>
                                {pgPricingOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                              </SelectInput>
                            </InputField>
                          )}

                          {!isPG && (
                            <InputField label="Security Deposit (₹)">
                              <TextInput
                                type="number"
                                placeholder="e.g. 50000"
                                value={form.price.securityDeposit}
                                onChange={(e) => updateForm("price.securityDeposit", e.target.value)}
                              />
                            </InputField>
                          )}

                          {!isPG && (
                            <>
                              <InputField label="Maintenance (₹)">
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
                                  {["Monthly", "Quarterly", "Yearly", "One-time"].map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                  ))}
                                </SelectInput>
                              </InputField>
                            </>
                          )}

                          {isRent && !isPG && (
                            <>
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
                            </>
                          )}

                          {showInvestment && !isPGSale && (
                            <>
                              <InputField label="Expected Rental (₹/month)">
                                <TextInput
                                  type="number"
                                  placeholder="e.g. 25000"
                                  value={form.price.expectedRental}
                                  onChange={(e) => updateForm("price.expectedRental", e.target.value)}
                                />
                              </InputField>
                              <InputField label="Annual Dues (₹)">
                                <TextInput
                                  type="number"
                                  placeholder="e.g. 50000"
                                  value={form.price.annualDuesPayable}
                                  onChange={(e) => updateForm("price.annualDuesPayable", e.target.value)}
                                />
                              </InputField>
                            </>
                          )}
                        </div>

                        {isSale && !isPGSale && (
                          <div className="mt-3 flex items-center gap-3">
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={form.price.currentlyLeasedOut}
                                onChange={(e) => updateForm("price.currentlyLeasedOut", e.target.checked)}
                              />
                              <span className="slider" />
                            </label>
                            <span className="text-sm text-gray-600">Currently Leased Out</span>
                          </div>
                        )}

                        {isSale && form.price.currentlyLeasedOut && (
                          <div className="mt-3">
                            <InputField label="Lease Expiry Date">
                              <TextInput
                                type="date"
                                value={form.price.leaseExpiryDate}
                                onChange={(e) => updateForm("price.leaseExpiryDate", e.target.value)}
                              />
                            </InputField>
                          </div>
                        )}

                        {!isPG && (
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
                        )}
                      </div>

                      {/* PG Details Section */}
                      {showPGSection && (
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FiHome size={16} className="text-violet-500" /> PG/Co-living Details
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InputField label="Room Type" error={errors["pgDetails.roomType"]}>
                              <select
                                value={form.pgDetails.roomType}
                                onChange={(e) => updateForm("pgDetails.roomType", e.target.value)}
                                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white appearance-none ${errors["pgDetails.roomType"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
                              >
                                <option value="">Select room type</option>
                                {["Single", "Double Sharing", "Triple Sharing", "Dormitory"].map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </InputField>
                            <InputField label="Gender Preference">
                              <SelectInput value={form.pgDetails.genderPreference} onChange={(e) => updateForm("pgDetails.genderPreference", e.target.value)}>
                                {["Male", "Female", "Any"].map((g) => <option key={g} value={g}>{g}</option>)}
                              </SelectInput>
                            </InputField>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="toggle-switch">
                              <input type="checkbox" checked={form.pgDetails.foodIncluded} onChange={(e) => updateForm("pgDetails.foodIncluded", e.target.checked)} />
                              <span className="slider" />
                            </label>
                            <span className="text-sm text-gray-600">Food Included</span>
                          </div>

                          {form.pgDetails.foodIncluded && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <InputField label="Food Type">
                                <SelectInput value={form.pgDetails.foodType} onChange={(e) => updateForm("pgDetails.foodType", e.target.value)}>
                                  <option value="">Select</option>
                                  {["Veg", "Non-Veg", "Both"].map((f) => <option key={f} value={f}>{f}</option>)}
                                </SelectInput>
                              </InputField>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4">
                            {[["attachedWashroom", "Attached Washroom"], ["commonWashroom", "Common Washroom"]].map(([key, label]) => (
                              <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={form.pgDetails[key]}
                                  onChange={(e) => updateForm(`pgDetails.${key}`, e.target.checked)}
                                  className="accent-violet-600 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{label}</span>
                              </label>
                            ))}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Facilities</p>
                            <div className="flex flex-wrap gap-2">
                              {[["laundry", "Laundry"], ["wifi", "WiFi"], ["tv", "TV"], ["refrigerator", "Refrigerator"], ["ro", "RO Water"], ["geyser", "Geyser"]].map(([key, label]) => (
                                <Chip key={key} label={label} selected={form.pgDetails.facilities[key]} onClick={() => updateForm(`pgDetails.facilities.${key}`, !form.pgDetails.facilities[key])} />
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Security Features</p>
                            <div className="flex flex-wrap gap-2">
                              {[["cctv", "CCTV"], ["biometric", "Biometric"], ["securityGuard", "Security Guard"], ["fireExtinguisher", "Fire Extinguisher"]].map(([key, label]) => (
                                <Chip key={key} label={label} selected={form.pgDetails.securityFeatures[key]} onClick={() => updateForm(`pgDetails.securityFeatures.${key}`, !form.pgDetails.securityFeatures[key])} />
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Common Areas</p>
                            <div className="flex flex-wrap gap-2">
                              {["Living Room", "Kitchen", "Terrace", "Gym", "Study Room", "Parking"].map((area) => (
                                <Chip key={area} label={area} selected={form.pgDetails.commonAreas.includes(area)} onClick={() => toggleArray("pgDetails.commonAreas", area)} />
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">PG Rules</p>
                            <div className="flex flex-wrap gap-2">
                              {["No Smoking", "No Alcohol", "No Pets", "No Non-Veg", "Guests Allowed", "Late Night Entry"].map((rule) => (
                                <Chip key={rule} label={rule} selected={form.pgDetails.rules.includes(rule)} onClick={() => toggleArray("pgDetails.rules", rule)} />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Room Stats for PG */}
                      {showRoomStats && (
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FiGrid size={16} className="text-violet-500" /> Room Statistics
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            <CounterBox label="Total Rooms" value={form.roomStats.totalRooms} onChange={(v) => updateForm("roomStats.totalRooms", v)} icon={FiGrid} min={0} max={50} />
                            <CounterBox label="Occupied" value={form.roomStats.occupiedRooms} onChange={(v) => updateForm("roomStats.occupiedRooms", v)} icon={FiUser} min={0} max={50} />
                            <CounterBox label="Available" value={form.roomStats.availableRooms} onChange={(v) => updateForm("roomStats.availableRooms", v)} icon={FiCheck} min={0} max={50} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Property Highlights ──────────────────────────── */}
                {currentStep === 2 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Property Highlights</h1>
                    <p className="text-gray-500 text-sm mb-6">Add features that make your property stand out</p>

                    <div className="space-y-4">
                      {showFurnishing && (
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
                                  <Chip key={item} label={item} selected={form.furnishing.items.includes(item)} onClick={() => toggleArray("furnishing.items", item)} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <MdLocalParking size={16} className="text-violet-500" /> Parking & Facing
                        </h3>
                        {!isPlot && (
                          <div className="flex flex-wrap gap-4 sm:gap-6 mb-4">
                            <CounterBox label="Covered Parking" value={form.parking.covered} onChange={(v) => updateForm("parking.covered", v)} icon={RiParkingBoxLine} min={0} max={10} />
                            <CounterBox label="Open Parking" value={form.parking.open} onChange={(v) => updateForm("parking.open", v)} icon={TbParking} min={0} max={10} />
                          </div>
                        )}
                        {showFacing && (
                          <div>
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
                        )}
                      </div>

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
                            {filteredNearbyAmenities.map((a) => (
                              <Chip key={a} label={a} selected={form.amenities.nearby.includes(a)} onClick={() => toggleArray("amenities.nearby", a)} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {showPropertyFeatures && (
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
                                <option value="">Select (Optional)</option>
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
                              <TextInput type="number" placeholder="e.g. 10" value={form.propertyFeatures.ceilingHeight} onChange={(e) => updateForm("propertyFeatures.ceilingHeight", e.target.value)} />
                            </InputField>
                            <InputField label="Road Width (ft)">
                              <TextInput type="number" placeholder="e.g. 40" value={form.propertyFeatures.widthOfFacingRoad} onChange={(e) => updateForm("propertyFeatures.widthOfFacingRoad", e.target.value)} />
                            </InputField>
                            <InputField label="Waste Disposal">
                              <SelectInput value={form.propertyFeatures.wasteDisposal} onChange={(e) => updateForm("propertyFeatures.wasteDisposal", e.target.value)}>
                                <option value="">Select</option>
                                {["Municipal", "Private", "Biogas Plant", "None"].map((v) => <option key={v} value={v}>{v}</option>)}
                              </SelectInput>
                            </InputField>
                          </div>

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

                          <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Overlooking</p>
                            <div className="flex flex-wrap gap-2">
                              {["Park/Garden", "Pool", "Main Road", "Club", "Not Overlooking"].map((v) => (
                                <Chip key={v} label={v} selected={form.propertyFeatures.overlooking.includes(v)} onClick={() => toggleArray("propertyFeatures.overlooking", v)} />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Location ─────────────────────────────────────── */}
                {currentStep === 3 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Address Details</h1>
                    <p className="text-gray-500 text-sm mb-6">Where is your property located?</p>

                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
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
                              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent ${errors["location.city"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
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
                            <input
                              placeholder="e.g. Vijay Nagar"
                              value={form.location.locality}
                              onChange={(e) => updateForm("location.locality", e.target.value)}
                              className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors["location.locality"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
                            />
                          </InputField>
                          <InputField label="Sub Locality">
                            <TextInput placeholder="e.g. Scheme 54" value={form.location.subLocality} onChange={(e) => updateForm("location.subLocality", e.target.value)} />
                          </InputField>
                        </div>

                        <InputField label="Full Address" required error={errors["location.address"]}>
                          <div className="relative">
                            <input
                              placeholder="Search or type your address..."
                              value={form.location.address}
                              onChange={(e) => {
                                updateForm("location.address", e.target.value);
                                searchAddress(e.target.value);
                              }}
                              className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors["location.address"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
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
                            <TextInput placeholder="Near C21 Mall" value={form.location.landmark} onChange={(e) => updateForm("location.landmark", e.target.value)} />
                          </InputField>
                          <InputField label="Pincode" required error={errors["location.pincode"]}>
                            <input
                              placeholder="452010"
                              value={form.location.pincode}
                              onChange={(e) => updateForm("location.pincode", e.target.value)}
                              maxLength={6}
                              className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors["location.pincode"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
                            />
                          </InputField>
                          <InputField label="State">
                            <TextInput placeholder="Madhya Pradesh" value={form.location.state} onChange={(e) => updateForm("location.state", e.target.value)} />
                          </InputField>
                        </div>
                      </div>

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

                {/* ── STEP 4: Ownership ────────────────────────────────────── */}
                {currentStep === 4 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Ownership & Legal</h1>
                    <p className="text-gray-500 text-sm mb-6">Verify your ownership details</p>

                    <div className="space-y-4">
                      {showOwnership ? (
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
                              <TextInput type="number" placeholder="e.g. 12000" value={form.ownership.propertyTaxPerYear} onChange={(e) => updateForm("ownership.propertyTaxPerYear", e.target.value)} />
                            </InputField>
                          </div>

                          <div className="flex flex-wrap gap-4">
                            {[["verified", "Ownership Verified"], ["occupancyCertificate", "Occupancy Certificate"], ["legalDocumentsAvailable", "Legal Documents Available"]].map(([k, l]) => (
                              <label key={k} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.ownership[k]} onChange={(e) => updateForm(`ownership.${k}`, e.target.checked)} className="accent-violet-600 w-4 h-4" />
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
                      ) : (
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FiShield size={18} className="text-violet-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Ownership Details</p>
                              <p className="text-sm text-gray-500 mt-1">Ownership verification is required for Sale properties. For Rent/PG, this step is optional.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {showBuilder && (
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <BiBuildingHouse size={16} className="text-violet-500" /> Builder / Project Details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InputField label="Builder Name"><TextInput value={form.builder.name} onChange={(e) => updateForm("builder.name", e.target.value)} placeholder="ABC Builders" /></InputField>
                            <InputField label="RERA ID"><TextInput value={form.builder.reraId} onChange={(e) => updateForm("builder.reraId", e.target.value)} placeholder="RERA/MP/2023/XXXXX" /></InputField>
                            <InputField label="Project Name"><TextInput value={form.builder.projectName} onChange={(e) => updateForm("builder.projectName", e.target.value)} placeholder="Green Valley Residency" /></InputField>
                            <InputField label="Possession Date"><TextInput type="date" value={form.builder.possessionDate} onChange={(e) => updateForm("builder.possessionDate", e.target.value)} /></InputField>
                            <InputField label="Total Units"><TextInput type="number" value={form.builder.totalUnits} onChange={(e) => updateForm("builder.totalUnits", e.target.value)} placeholder="150" /></InputField>
                            <InputField label="Total Towers"><TextInput type="number" value={form.builder.totalTowers} onChange={(e) => updateForm("builder.totalTowers", e.target.value)} placeholder="3" /></InputField>
                            <InputField label="Total Floors"><TextInput type="number" value={form.builder.totalFloors} onChange={(e) => updateForm("builder.totalFloors", e.target.value)} placeholder="15" /></InputField>
                            <InputField label="Launch Date"><TextInput type="date" value={form.builder.launchDate} onChange={(e) => updateForm("builder.launchDate", e.target.value)} /></InputField>
                            <InputField label="Token Amount (₹)"><TextInput type="number" value={form.builder.bookingProcess.tokenAmount} onChange={(e) => updateForm("builder.bookingProcess.tokenAmount", e.target.value)} placeholder="100000" /></InputField>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <label className="toggle-switch">
                              <input type="checkbox" checked={form.builder.loanFacility.available} onChange={(e) => updateForm("builder.loanFacility.available", e.target.checked)} />
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
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Inclusions in Price</h3>
                          <div className="flex flex-wrap gap-2">
                            {["Car Parking", "Club Membership", "Covered Parking", "Electricity & Water Connection", "Piped Gas Connection", "Registration Charges"].map((v) => (
                              <Chip key={v} label={v} selected={form.inclusionsInPrice.includes(v)} onClick={() => toggleArray("inclusionsInPrice", v)} />
                            ))}
                          </div>
                        </div>
                        {showAdditionalRooms && (
                          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Additional Rooms</h3>
                            <div className="flex flex-wrap gap-2">
                              {["Servant Room", "Study Room", "Pooja Room", "Store Room", "Utility Room"].map((v) => (
                                <Chip key={v} label={v} selected={form.additionalRooms.includes(v)} onClick={() => toggleArray("additionalRooms", v)} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 5: Photos ───────────────────────────────────────── */}
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

                {/* ── STEP 6: Contact ──────────────────────────────────────── */}
                {currentStep === 6 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Contact Information</h1>
                    <p className="text-gray-500 text-sm mb-6">How should interested buyers reach you?</p>

                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                      <InputField label="Full Name" required error={errors["contactInfo.name"]}>
                        <div className="relative">
                          <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors["contactInfo.name"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
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
                            <input
                              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors["contactInfo.phone"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
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
                            <TextInput className="pl-9" placeholder="Alternate number" value={form.contactInfo.alternatePhone} onChange={(e) => updateForm("contactInfo.alternatePhone", e.target.value)} maxLength={10} />
                          </div>
                        </InputField>
                      </div>

                      <InputField label="Email Address" error={errors["contactInfo.email"]}>
                        <div className="relative">
                          <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors["contactInfo.email"] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-violet-400"}`}
                            placeholder="your@email.com (Optional)"
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

                      {isRent && (
                        <>
                          <InputField label="Posted By">
                            <div className="grid grid-cols-2 gap-2">
                              {["owner", "agent"].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => updateForm("postedBy", type)}
                                  className={`py-2 px-3 rounded-xl border-2 text-xs font-medium transition-all capitalize
                                    ${form.postedBy === type
                                      ? "border-violet-500 bg-violet-50 text-violet-700"
                                      : "border-gray-200 text-gray-600 hover:border-violet-300"}`}
                                >
                                  {type === "owner" ? "Owner" : "Agent / Broker"}
                                </button>
                              ))}
                            </div>
                          </InputField>

                          {showBrokerage && (
                            <>
                              <InputField label="Brokerage Charge">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {["None", "15 Days", "30 Days", "Custom"].map((type) => (
                                    <button
                                      key={type}
                                      type="button"
                                      onClick={() => {
                                        updateForm("brokerage.chargeType", type);
                                        if (type === "None") updateForm("brokerage.customValue", "");
                                      }}
                                      className={`py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all
                                        ${form.brokerage.chargeType === type
                                          ? "border-violet-500 bg-violet-50 text-violet-700"
                                          : "border-gray-200 text-gray-600 hover:border-violet-300"}`}
                                    >
                                      {type}
                                    </button>
                                  ))}
                                </div>
                              </InputField>

                              {form.brokerage.chargeType === "Custom" && (
                                <InputField label="Custom Brokerage Value" hint="e.g., 1 Month Rent or ₹25,000">
                                  <TextInput
                                    placeholder="e.g., 1 Month Rent or ₹25,000"
                                    value={form.brokerage.customValue}
                                    onChange={(e) => updateForm("brokerage.customValue", e.target.value)}
                                  />
                                </InputField>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 7: Preview & Submit ─────────────────────────────── */}
                {currentStep === 7 && (
                  <div>
                    <h1 className="heading text-xl sm:text-2xl text-gray-900 mb-1">Review & Submit</h1>
                    <p className="text-gray-500 text-sm mb-6">Review your property details before submitting</p>

                    <div className="space-y-4">
                      <PreviewSection title="Property Type" icon={FiHome}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <InfoItem label="Category" value={form.category} />
                          <InfoItem label="Property Type" value={form.propertyType || "PG/Co-living"} />
                          <InfoItem label="Listing Type" value={form.listingType} />
                        </div>
                      </PreviewSection>

                      <PreviewSection title="Basic Details" icon={FiInfo}>
                        <div className="grid grid-cols-2 gap-3">
                          <InfoItem label="Title" value={form.title} />
                          {showBHK && <InfoItem label="BHK" value={form.isRK ? `1 RK` : `${form.bhk} BHK`} />}
                          {showBathrooms && !isPlot && <InfoItem label="Bathrooms" value={form.bathrooms} />}
                          {isOffice && form.commercialCabins > 0 && <InfoItem label="Cabins" value={form.commercialCabins} />}
                          {isOffice && form.commercialWorkstations > 0 && <InfoItem label="Workstations" value={form.commercialWorkstations} />}
                          {(isOffice || isShop || isWarehouse) && form.commercialWashrooms > 0 && <InfoItem label="Washrooms" value={form.commercialWashrooms} />}
                          {isVillaOnly && <InfoItem label="Floors in Villa" value={form.villaFloors} />}
                          {isDuplex && <InfoItem label="Floors in Duplex" value={form.duplexFloors} />}
                          <InfoItem label={isPlot ? "Plot Area" : "Carpet Area"} value={`${isPlot ? form.area.plotArea : form.area.carpet} ${form.area.unit}`} />
                          <InfoItem label="Price" value={`₹${Number(form.price.amount || 0).toLocaleString("en-IN")}${isPG ? ` per ${form.price.per}` : ""}`} />
                          {form.propertyAge && <InfoItem label="Property Age" value={form.propertyAge} />}
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
                          {isRent && (
                            <>
                              <InfoItem label="Posted By" value={form.postedBy === "owner" ? "Owner" : "Agent / Broker"} />
                              {showBrokerage && (
                                <InfoItem
                                  label="Brokerage"
                                  value={form.brokerage.chargeType === "Custom" ? form.brokerage.customValue : form.brokerage.chargeType}
                                />
                              )}
                            </>
                          )}
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
                            <p className="text-sm text-gray-500 mt-0.5">
                              Your property will be reviewed within 24-48 hours after submission.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom progress dots for mobile */}
            <div className="lg:hidden flex justify-center gap-1.5 py-2 bg-white border-t border-gray-100">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all ${i === currentStep ? "w-5 h-2 bg-violet-600" : i < currentStep ? "w-2 h-2 bg-violet-400" : "w-2 h-2 bg-gray-200"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
