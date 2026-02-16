import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  MapPin, 
  IndianRupee, 
  Upload, 
  X,
  BedDouble,
  Bath,
  Square,
  Users,
  Wifi,
  Car,
  ArrowLeft,
  CheckCircle,
  Loader,
  Phone,
  Mail,
  User,
  Building,
  Store
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://api.gharzoreality.com/api/v2';
const MASTER_DATA_API = 'https://api.gharzoreality.com/api/master-data/v2';

const AddListingForm = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyId, setPropertyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Master data states
  const [cities, setCities] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [amenitiesData, setAmenitiesData] = useState({
    basic: [],
    nearby: [],
    society: []
  });
  const [loadingMasterData, setLoadingMasterData] = useState({
    cities: false,
    localities: false,
    amenities: false
  });

  const [formData, setFormData] = useState({
    // Step 1: Property Type
    category: '',
    propertyType: '',
    listingType: '',
    
    // Step 2: Basic Details
    title: '',
    description: '',
    bhk: '1',
    bathrooms: '1',
    balconies: '0',
    price: '',
    negotiable: true,
    securityDeposit: '',
    carpetArea: '',
    builtUpArea: '',
    areaUnit: 'sqft',
    currentFloor: '0',
    totalFloors: '1',
    propertyAge: '',
    postedBy: 'Owner',
    availableFrom: '',
    
    // Step 3: Features (PG specific)
    furnishingType: 'Unfurnished',
    amenitiesList: [],
    furnishingItems: [],
    
    // PG Details
    roomType: '',
    foodIncluded: false,
    foodType: '',
    genderPreference: 'Any',
    totalBeds: '',
    availableBeds: '',
    commonWashroom: false,
    attachedWashroom: false,
    commonAreas: [],
    foodTimings: {},
    facilities: {},
    securityFeatures: {},
    
    // Property Features
    powerBackup: '',
    waterSupply: '',
    gatedSecurity: false,
    liftAvailable: false,
    
    // Step 4: Location
    address: '',
    city: '',
    locality: '',
    subLocality: '',
    landmark: '',
    pincode: '',
    state: '',
    latitude: '',
    longitude: '',
    
    // Step 5: Images
    images: [],
    
    // Step 6: Contact Info
    contactName: '',
    contactPhone: '',
    alternatePhone: '',
    contactEmail: '',
    preferredCallTime: 'Evening (5PM-9PM)'
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const steps = [
    { number: 1, title: 'Property Type' },
    { number: 2, title: 'Basic Details' },
    { number: 3, title: 'Features' },
    { number: 4, title: 'Location' },
    { number: 5, title: 'Photos' },
    { number: 6, title: 'Contact Info' }
  ];

  // Backend Schema Enums
  const categoryOptions = ['Residential', 'Commercial'];
  
  const propertyTypeOptions = {
    Residential: ['Flat', 'Villa', 'Independent House', 'Builder Floor', 'Studio', 'Plot'],
    Commercial: ['Shop', 'Office', 'Warehouse']
  };

  const listingTypeOptions = ['Rent', 'Sale', 'PG'];

  const areaUnitOptions = ['sqft', 'sqm', 'sqyd', 'acre', 'hectare'];
  const roomTypeOptions = ['Single', 'Double Sharing', 'Triple Sharing', 'Dormitory'];
  const foodTypeOptions = ['Veg', 'Non-Veg', 'Both'];
  const genderPreferenceOptions = ['Male', 'Female', 'Any'];
  const powerBackupOptions = ['None', 'Partial', 'Full'];
  const waterSupplyOptions = ['Corporation', 'Borewell', 'Both'];

  const commonAreasOptions = [
    'Living Room', 'Kitchen', 'Terrace', 'Gym', 'Study Room', 'Parking'
  ];

  const furnishingItemsOptions = [
    'Bed', 'Mattress', 'Pillow', 'Blanket', 'Fan', 'Light', 
    'Charging Point', 'Wardrobe', 'Study Desk', 'Chair'
  ];

  const postedByOptions = ['Owner', 'Agent', 'Builder', 'Admin', 'Landlord', 'Worker', 'Tenant', 'Sub Owner'];

  const propertyAgeOptions = [
    'Under Construction',
    '0-1 year',
    '1-5 years',
    '5-10 years',
    '10+ years'
  ];

  const preferredCallTimeOptions = [
    'Anytime',
    'Morning (9AM-12PM)',
    'Afternoon (12PM-5PM)',
    'Evening (5PM-9PM)'
  ];

  // Fetch user profile and set postedBy automatically
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch master data
  useEffect(() => {
    fetchCities();
    fetchAmenities();
  }, []);

  // Fetch localities when city changes
  useEffect(() => {
    if (formData.city) {
      fetchLocalities(formData.city);
    }
  }, [formData.city]);

  const fetchCities = async () => {
    try {
      setLoadingMasterData(prev => ({ ...prev, cities: true }));
      const response = await axios.get(`${MASTER_DATA_API}/cities`);
      if (response.data.success) {
        setCities(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setLoadingMasterData(prev => ({ ...prev, cities: false }));
    }
  };

  const fetchLocalities = async (cityName) => {
    try {
      setLoadingMasterData(prev => ({ ...prev, localities: true }));
      const response = await axios.get(`${MASTER_DATA_API}/localities/${cityName}`);
      if (response.data.success) {
        setLocalities(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching localities:', err);
      setLocalities([]);
    } finally {
      setLoadingMasterData(prev => ({ ...prev, localities: false }));
    }
  };

  const fetchAmenities = async () => {
    try {
      setLoadingMasterData(prev => ({ ...prev, amenities: true }));
      const response = await axios.get(`${MASTER_DATA_API}/amenities`);
      if (response.data.success) {
        setAmenitiesData(response.data.data || {
          basic: [],
          nearby: [],
          society: []
        });
      }
    } catch (err) {
      console.error('Error fetching amenities:', err);
    } finally {
      setLoadingMasterData(prev => ({ ...prev, amenities: false }));
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('usertoken') || localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        'https://api.gharzoreality.com/api/auth/me',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.data?.user) {
        const user = response.data.data.user;
        setUserProfile(user);
        
        // Format the role for postedBy field - map API roles to dropdown options
        const roleMapping = {
          'landlord': 'Landlord',
          'Landlord': 'Landlord',
          'worker': 'Worker',
          'Worker': 'Worker',
          'tenant': 'Tenant',
          'Tenant': 'Tenant',
          'subowner': 'Sub Owner',
          'sub_owner': 'Sub Owner',
          'SubOwner': 'Sub Owner',
          'sub_owner': 'Sub Owner',
          'admin': 'Admin',
          'Admin': 'Admin',
          'agent': 'Agent',
          'Agent': 'Agent',
          'builder': 'Builder',
          'Builder': 'Builder'
        };
        
        const roleFormatted = roleMapping[user.role] || 'Owner';
        setFormData(prev => ({
          ...prev,
          postedBy: roleFormatted
        }));
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Fallback: keep default value
    }
  };

  // Helper functions for conditional rendering
  const isPGProperty = () => {
    return formData.listingType === 'PG';
  };

  const needsResidentialFields = () => {
    const residentialTypes = ['Flat', 'Villa', 'Independent House', 'Builder Floor', 'Studio'];
    return residentialTypes.includes(formData.propertyType);
  };

  const isCommercialProperty = () => {
    return formData.category === 'Commercial';
  };

  const isPlotProperty = () => {
    return formData.propertyType === 'Plot';
  };

  const needsFloorDetails = () => {
    const typesWithFloors = ['Flat', 'Builder Floor', 'Shop', 'Office'];
    return typesWithFloors.includes(formData.propertyType);
  };

  const needsBHKDetails = () => {
    const typesWithBHK = ['Flat', 'Villa', 'Independent House', 'Builder Floor', 'Studio'];
    return typesWithBHK.includes(formData.propertyType) && !isPGProperty();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        propertyType: '',
        listingType: ''
      }));
      return;
    }

    if (name === 'propertyType') {
      setFormData(prev => ({
        ...prev,
        propertyType: value
      }));
      return;
    }

    if (name === 'city') {
      setFormData(prev => ({
        ...prev,
        city: value,
        locality: '',
        subLocality: ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCommonAreaToggle = (area) => {
    setFormData(prev => ({
      ...prev,
      commonAreas: prev.commonAreas.includes(area)
        ? prev.commonAreas.filter(a => a !== area)
        : [...prev.commonAreas, area]
    }));
  };

  const handleFurnishingItemToggle = (item) => {
    setFormData(prev => ({
      ...prev,
      furnishingItems: prev.furnishingItems.includes(item)
        ? prev.furnishingItems.filter(i => i !== item)
        : [...prev.furnishingItems, item]
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenitiesList: prev.amenitiesList.includes(amenity)
        ? prev.amenitiesList.filter(a => a !== amenity)
        : [...prev.amenitiesList, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    setImagePreviews(prev => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getAuthToken = () => {
    return localStorage.getItem('usertoken') || localStorage.getItem('token');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // API Calls
  const createDraft = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        setError('Please login to continue');
        return false;
      }

      const response = await axios.post(
        `${API_BASE_URL}/properties/create-draft`, 
        {
          category: formData.category,
          propertyType: formData.propertyType,
          listingType: formData.listingType
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setPropertyId(response.data.data.propertyId);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create draft');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateBasicDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const areaPayload = {
        carpet: parseFloat(formData.carpetArea) || 0,
        unit: formData.areaUnit
      };

      if (!isPlotProperty()) {
        areaPayload.builtUp = parseFloat(formData.builtUpArea) || 0;
      }

      if (isPlotProperty()) {
        areaPayload.plotArea = parseFloat(formData.carpetArea) || 0;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        bhk: parseInt(formData.bhk) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        balconies: parseInt(formData.balconies) || 0,
        price: {
          amount: parseFloat(formData.price),
          negotiable: formData.negotiable,
          securityDeposit: parseFloat(formData.securityDeposit) || 0
        },
        area: areaPayload,
        floor: {
          current: parseInt(formData.currentFloor) || 0,
          total: parseInt(formData.totalFloors) || 1
        },
        propertyAge: formData.propertyAge,
        postedBy: formData.postedBy,
        availableFrom: formData.availableFrom
      };

      const response = await axios.put(
        `${API_BASE_URL}/properties/${propertyId}/basic-details`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data.success;
    } catch (err) {
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update basic details');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFeatures = async () => {
    try {
      setLoading(true);
      setError('');
      
      const safeParseInt = (v) => {
        const n = parseInt(v);
        return isNaN(n) ? undefined : n;
      };
      const safeParseFloat = (v) => {
        const n = parseFloat(v);
        return isNaN(n) ? undefined : n;
      };

      const bhk = safeParseInt(formData.bhk);
      const bathrooms = safeParseInt(formData.bathrooms);
      const balconies = safeParseInt(formData.balconies);

      const priceAmount = safeParseFloat(formData.price);
      const maintenanceAmount = safeParseFloat(formData.maintenanceCharges) || 0;
      const securityDeposit = safeParseFloat(formData.securityDeposit) || 0;

      const carpetArea = safeParseFloat(formData.carpetArea);
      const builtUpArea = safeParseFloat(formData.builtUpArea);

      const floorCurrent = safeParseInt(formData.currentFloor);
      const floorTotal = safeParseInt(formData.totalFloors);

      const areaPayload = { unit: formData.areaUnit };
      if (carpetArea !== undefined && carpetArea > 0) areaPayload.carpet = carpetArea;

      if ((formData.propertyType || '').toLowerCase() === 'plot') {
        if (carpetArea !== undefined && carpetArea > 0) {
          areaPayload.plotArea = carpetArea;
        }
      } else {
        if (builtUpArea !== undefined && builtUpArea > 0) areaPayload.builtUp = builtUpArea;
      }

      // Build amenities array from the amenitiesData
      const selectedAmenities = formData.amenitiesList.map(amenityName => {
        const amenity = allAmenitiesFlat.find(a => a.name === amenityName);
        return {
          name: amenityName,
          icon: amenity?.icon || ''
        };
      });

      const payload = {
        title: formData.title,
        description: formData.description,
        ...(bhk !== undefined && { bhk }),
        ...(bathrooms !== undefined && { bathrooms }),
        ...(balconies !== undefined && { balconies }),
        price: {
          ...(priceAmount !== undefined && { amount: priceAmount }),
          negotiable: formData.negotiable,
          maintenanceCharges: {
            amount: maintenanceAmount,
            frequency: formData.maintenanceFrequency
          },
          securityDeposit: securityDeposit
        },
        area: areaPayload,
        floor: {
          ...(floorCurrent !== undefined && { current: floorCurrent }),
          ...(floorTotal !== undefined && { total: floorTotal })
        },
        propertyAge: formData.propertyAge,
        availableFrom: formData.availableFrom,
        amenities: selectedAmenities,
        furnishingType: formData.furnishingType,
        furnishingItems: formData.furnishingItems,
        powerBackup: formData.powerBackup,
        waterSupply: formData.waterSupply,
        gatedSecurity: formData.gatedSecurity,
        liftAvailable: formData.liftAvailable
      };

      // PG specific fields
      if (isPGProperty()) {
        payload.pgDetails = {
          roomType: formData.roomType,
          foodIncluded: formData.foodIncluded,
          foodType: formData.foodType,
          foodTimings: formData.foodTimings || {},
          genderPreference: formData.genderPreference,
          totalBeds: parseInt(formData.totalBeds) || 0,
          availableBeds: parseInt(formData.availableBeds) || 0,
          commonWashroom: formData.commonWashroom,
          attachedWashroom: formData.attachedWashroom,
          commonAreas: formData.commonAreas,
          facilities: formData.facilities || {},
          securityFeatures: formData.securityFeatures || {}
        };
      }

      const response = await axios.put(
        `${API_BASE_URL}/properties/${propertyId}/features`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data.success;
    } catch (err) {
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update features');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        location: {
          address: formData.address,
          city: formData.city,
          locality: formData.locality,
          subLocality: formData.subLocality,
          landmark: formData.landmark,
          pincode: formData.pincode,
          state: formData.state,
          coordinates: {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude)
          }
        }
      };

      const response = await axios.put(
        `${API_BASE_URL}/properties/${propertyId}/location`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data.success;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update location');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const formDataToSend = new FormData();
      
      formData.images.forEach(image => {
        formDataToSend.append('images', image);
      });

      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/properties/${propertyId}/upload-photos`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload Progress: ${percentCompleted}%`);
          }
        }
      );

      return response.data.success;
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to upload photos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateContactInfo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        contactInfo: {
          name: formData.contactName,
          phone: formData.contactPhone,
          alternatePhone: formData.alternatePhone,
          email: formData.contactEmail,
          preferredCallTime: formData.preferredCallTime
        }
      };

      const response = await axios.put(
        `${API_BASE_URL}/properties/${propertyId}/contact-info`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data.success;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update contact info');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitProperty = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${API_BASE_URL}/properties/${propertyId}/submit`,
        {},
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        alert('Property submitted successfully! It will be reviewed within 24-48 hours.');
        navigate('/properties');
      }
      return response.data.success;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit property');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    let success = true;

    switch(currentStep) {
      case 1:
        success = await createDraft();
        break;
      case 2:
        success = await updateBasicDetails();
        break;
      case 3:
        success = await updateFeatures();
        break;
      case 4:
        success = await updateLocation();
        break;
      case 5:
        if (formData.images.length > 0) {
          success = await uploadPhotos();
        } else {
          success = true;
        }
        break;
      case 6:
        success = await updateContactInfo();
        if (success) {
          await submitProperty();
          return;
        }
        break;
      default:
        break;
    }

    if (success && currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Flatten amenities for easier lookup
  const allAmenitiesFlat = [
    ...amenitiesData.basic,
    ...amenitiesData.nearby,
    ...amenitiesData.society
  ];

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl shadow-lg">
                <Home className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Select Property Type</h2>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
              >
                <option value="">Select Category</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {formData.category && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
                >
                  <option value="">Select Type</option>
                  {propertyTypeOptions[formData.category]?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {formData.propertyType && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Listing Type *
                </label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
                >
                  <option value="">Select Listing Type</option>
                  {listingTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {formData.category && formData.propertyType && formData.listingType && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-blue-200 rounded-xl"
              >
                <p className="text-sm font-medium text-gray-800">
                  <span className="font-bold">Selected:</span> {formData.propertyType} • {formData.category} • {formData.listingType}
                </p>
              </motion.div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl shadow-lg">
                <Building className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Basic Details</h2>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder={
                  isPlotProperty() ? "e.g., Prime Residential Plot in Vijay Nagar" :
                  isCommercialProperty() ? "e.g., Commercial Space in Prime Location" :
                  isPGProperty() ? "e.g., Comfortable PG for Students & Working Professionals" :
                  "e.g., Spacious 2BHK Flat in Vijay Nagar"
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe your property, its features, nearby facilities..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none resize-none transition-colors"
              ></textarea>
            </div>

            {needsBHKDetails() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <BedDouble className="inline mr-1" size={16} />
                    BHK *
                  </label>
                  <input
                    type="number"
                    name="bhk"
                    value={formData.bhk}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="e.g., 2"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Bath className="inline mr-1" size={16} />
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="e.g., 2"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Balconies *
                  </label>
                  <input
                    type="number"
                    name="balconies"
                    value={formData.balconies}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="e.g., 1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <IndianRupee className="inline mr-1" size={16} />
                  {isPGProperty() ? 'Monthly Rent (₹) *' : 'Price (₹) *'}
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder={isPGProperty() ? "Monthly rent amount" : "Enter price"}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  placeholder="Enter security deposit"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            {!isPGProperty() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Square className="inline mr-1" size={16} />
                      {isPlotProperty() ? 'Plot Area *' : 'Carpet Area *'}
                    </label>
                    <input
                      type="number"
                      name="carpetArea"
                      value={formData.carpetArea}
                      onChange={handleChange}
                      required
                      placeholder="Enter area"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>

                  {!isPlotProperty() && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Built-up Area *
                      </label>
                      <input
                        type="number"
                        name="builtUpArea"
                        value={formData.builtUpArea}
                        onChange={handleChange}
                        required
                        placeholder="Enter area"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Area Unit *</label>
                  <select
                    name="areaUnit"
                    value={formData.areaUnit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                  >
                    {areaUnitOptions.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {needsFloorDetails() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Floor *
                  </label>
                  <input
                    type="number"
                    name="currentFloor"
                    value={formData.currentFloor}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="e.g., 2"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Floors *
                  </label>
                  <input
                    type="number"
                    name="totalFloors"
                    value={formData.totalFloors}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="e.g., 5"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Age *
                </label>
                <select
                  name="propertyAge"
                  value={formData.propertyAge}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                >
                  <option value="">Select Age</option>
                  {propertyAgeOptions.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Available From *
                </label>
                <input
                  type="date"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Posted By *
              </label>
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center">
                <span className="text-gray-700 font-medium">
                  {formData.postedBy || 'Loading...'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on your account type</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="negotiable"
                checked={formData.negotiable}
                onChange={handleChange}
                className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
              />
              <label className="text-sm font-medium text-gray-700">Price Negotiable</label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl shadow-lg">
                <Wifi className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Property Features</h2>
            </div>

            {isPGProperty() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl"
              >
                <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                  <Users size={24} />
                  PG/Hostel Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type *</label>
                    <select 
                      name="roomType" 
                      value={formData.roomType} 
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    >
                      <option value="">Select Room Type</option>
                      {roomTypeOptions.map(r => (<option key={r} value={r}>{r}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender Preference *</label>
                    <select 
                      name="genderPreference" 
                      value={formData.genderPreference} 
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    >
                      {genderPreferenceOptions.map(g => (<option key={g} value={g}>{g}</option>))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Beds *</label>
                    <input
                      type="number"
                      name="totalBeds"
                      value={formData.totalBeds}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="e.g., 10"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Available Beds *</label>
                    <input
                      type="number"
                      name="availableBeds"
                      value={formData.availableBeds}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="e.g., 3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors bg-white">
                    <input
                      type="checkbox"
                      name="foodIncluded"
                      checked={formData.foodIncluded}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                    />
                    <span className="text-sm font-medium text-gray-700">Food Included</span>
                  </label>

                  {formData.foodIncluded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Food Type *</label>
                      <select 
                        name="foodType" 
                        value={formData.foodType} 
                        onChange={handleChange}
                        required={formData.foodIncluded}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                      >
                        <option value="">Select Food Type</option>
                        {foodTypeOptions.map(f => (<option key={f} value={f}>{f}</option>))}
                      </select>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors bg-white">
                    <input
                      type="checkbox"
                      name="commonWashroom"
                      checked={formData.commonWashroom}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                    />
                    <span className="text-sm font-medium text-gray-700">Common Washroom</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors bg-white">
                    <input
                      type="checkbox"
                      name="attachedWashroom"
                      checked={formData.attachedWashroom}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                    />
                    <span className="text-sm font-medium text-gray-700">Attached Washroom</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Common Areas</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {commonAreasOptions.map(area => (
                      <label key={area} className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors bg-white">
                        <input
                          type="checkbox"
                          checked={formData.commonAreas.includes(area)}
                          onChange={() => handleCommonAreaToggle(area)}
                          className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                        />
                        <span className="text-sm font-medium text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {!isPlotProperty() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Furnishing Type *
                  </label>
                  <select
                    name="furnishingType"
                    value={formData.furnishingType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                  >
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully-Furnished">Fully-Furnished</option>
                  </select>
                </div>

                {(formData.furnishingType === 'Semi-Furnished' || formData.furnishingType === 'Fully-Furnished') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Furnishing Items</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {furnishingItemsOptions.map(item => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.furnishingItems.includes(item)}
                            onChange={() => handleFurnishingItemToggle(item)}
                            className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                          />
                          <span className="text-sm font-medium text-gray-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Amenities
              </label>
              {loadingMasterData.amenities ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader className="animate-spin" size={20} />
                  Loading amenities...
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allAmenitiesFlat.length > 0 ? (
                    allAmenitiesFlat.map(amenity => (
                      <label key={amenity.name} className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.amenitiesList.includes(amenity.name)}
                          onChange={() => handleAmenityToggle(amenity.name)}
                          className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                        />
                        <span className="text-lg">{amenity.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500">No amenities available</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Power Backup
                </label>
                <select
                  name="powerBackup"
                  value={formData.powerBackup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                >
                  <option value="">Select</option>
                  {powerBackupOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Water Supply
                </label>
                <select
                  name="waterSupply"
                  value={formData.waterSupply}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                >
                  <option value="">Select</option>
                  {waterSupplyOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors">
                <input
                  type="checkbox"
                  name="gatedSecurity"
                  checked={formData.gatedSecurity}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                />
                <span className="text-sm font-medium text-gray-700">Gated Security</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors">
                <input
                  type="checkbox"
                  name="liftAvailable"
                  checked={formData.liftAvailable}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                />
                <span className="text-sm font-medium text-gray-700">Lift Available</span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl shadow-lg">
                <MapPin className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Plot No, Street, Area"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                {loadingMasterData.cities ? (
                  <div className="flex items-center gap-2 text-gray-500 py-3">
                    <Loader className="animate-spin" size={20} />
                    Loading cities...
                  </div>
                ) : (
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city._id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Madhya Pradesh"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Locality *
                </label>
                {loadingMasterData.localities ? (
                  <div className="flex items-center gap-2 text-gray-500 py-3">
                    <Loader className="animate-spin" size={20} />
                    Loading localities...
                  </div>
                ) : (
                  <select
                    name="locality"
                    value={formData.locality}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                  >
                    <option value="">Select Locality</option>
                    {localities.map(loc => (
                      <option key={loc._id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub Locality
                </label>
                <input
                  type="text"
                  name="subLocality"
                  value={formData.subLocality}
                  onChange={handleChange}
                  placeholder="e.g., Scheme 54"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g., Near C21 Mall"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  placeholder="6-digit pincode"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 22.7532"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 75.8937"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl shadow-lg">
                <Upload className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Upload Photos</h2>
            </div>
            
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#FF6B00] transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-lg text-gray-600 font-semibold">Click to upload images</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB each</p>
                  <p className="text-xs text-gray-400 mt-1">Upload multiple high-quality images</p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Uploaded Images ({imagePreviews.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl shadow-lg">
                <Phone className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline mr-2" size={18} />
                Full Name *
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="inline mr-2" size={18} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline mr-2" size={18} />
                Email Address *
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Call Time
              </label>
              <select
                name="preferredCallTime"
                value={formData.preferredCallTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
              >
                {preferredCallTimeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-[#0b4f91] to-[#FF6B00] bg-clip-text text-transparent">
                Add Your Property
              </span>
            </h1>
            <p className="text-gray-600 mt-1">Complete all steps to list your property</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${currentStep > step.number ? 'bg-green-500 text-white' : 
                      currentStep === step.number ? 'bg-[#FF6B00] text-white' : 
                      'bg-gray-200 text-gray-500'}
                    transition-all duration-300
                  `}>
                    {currentStep > step.number ? <CheckCircle size={20} /> : step.number}
                  </div>
                  <span className="text-xs font-medium text-gray-600 mt-2 hidden md:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-2
                    ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}
                    transition-all duration-300
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Mobile step title */}
          <div className="md:hidden text-center mt-4">
            <p className="text-sm font-semibold text-gray-700">
              Step {currentStep}: {steps[currentStep - 1].title}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                disabled={loading}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                Back
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-[#0b4f91] to-[#FF6B00] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing...
                </>
              ) : currentStep === 6 ? (
                'Submit Property'
              ) : (
                'Next'
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListingForm;