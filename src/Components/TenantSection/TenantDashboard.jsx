import React, { useState, useEffect } from 'react';
import { 
  Home, MapPin, DollarSign, Calendar, AlertCircle, User, Phone, 
  Building2, CheckCircle, Clock, FileText, Star, LogOut, Menu, X,
  Badge, Briefcase, Shield, Zap, Droplet, Hammer, Camera, ChevronRight,
  TrendingUp, AlertTriangle, Download
} from 'lucide-react';

const TenancyDashboard = () => {
  const [tenancyData, setTenancyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.token || localStorage.usertoken || sessionStorage.token;
        
        if (!token) {
          setError('Authentication required. Please login first.');
          setLoading(false);
          return;
        }
        
        // Fetch tenancy data from single API with authentication
        const response = await fetch('https://api.gharzoreality.com/api/tenancies/tenant/my-tenancies', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          setTenancyData(data.data[0]);
          setError(null);
        } else {
          setError('No tenancy data found');
        }
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your tenancy details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/30 border border-white/50 rounded-3xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const property = tenancyData?.propertyId;
  const financials = tenancyData?.financials;
  const agreement = tenancyData?.agreement;
  const tenantInfo = tenancyData?.tenantInfo;
  const occupancy = tenancyData?.occupancy;
  const landlord = tenancyData?.landlordId;
  const notice = tenancyData?.notice;
  const ratings = tenancyData?.ratings;
  const roomId = tenancyData?.roomId;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    const end = new Date(agreement?.endDate);
    const now = new Date();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getTotalMonthlyOutgoing = () => {
    return (financials?.monthlyRent || 0) + (financials?.maintenanceCharges || 0);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'from-emerald-400 to-green-500';
      case 'terminated': return 'from-red-400 to-pink-500';
      default: return 'from-blue-400 to-purple-500';
    }
  };

  const getConditionColor = (condition) => {
    switch(condition?.toLowerCase()) {
      case 'good': return 'bg-green-200 text-green-800';
      case 'fair': return 'bg-yellow-200 text-yellow-800';
      case 'poor': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/30 border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  GharZo
                </h1>
                <p className="text-xs text-gray-600">Tenant Portal</p>
              </div>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/50 rounded-lg transition"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status and Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Status Badge */}
          <div className={`backdrop-blur-md bg-gradient-to-r ${getStatusColor(tenancyData?.status)} p-0.5 rounded-2xl`}>
            <div className="bg-white rounded-2xl px-6 py-4 flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getStatusColor(tenancyData?.status)}`}></div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Status</p>
                <p className="font-bold text-gray-800">{tenancyData?.status || 'Active'}</p>
              </div>
            </div>
          </div>

          {/* Rent Card */}
          <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-2xl p-4 hover:shadow-lg transition">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-green-600">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-gray-600 font-semibold">Monthly Rent</p>
            </div>
            <p className="text-2xl font-bold text-green-600">₹{financials?.monthlyRent?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-600 mt-1">Due on {financials?.rentDueDay}th</p>
          </div>

          {/* Remaining Days */}
          <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-2xl p-4 hover:shadow-lg transition">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-gray-600 font-semibold">Days Left</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{getDaysRemaining()}</p>
            <p className="text-xs text-gray-600 mt-1">Till {formatDate(agreement?.endDate)}</p>
          </div>

          {/* Total Outgoing */}
          <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-2xl p-4 hover:shadow-lg transition">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-gray-600 font-semibold">Monthly Cost</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">₹{getTotalMonthlyOutgoing().toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-600 mt-1">Rent + Maintenance</p>
          </div>
        </div>

        {/* Notice Alert */}
        {notice?.isUnderNotice && (
          <div className="mb-8 backdrop-blur-md bg-yellow-50/50 border-2 border-yellow-300 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-800 mb-2">⚠️ Notice Given</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-yellow-700 font-semibold">Given By</p>
                    <p className="text-sm text-yellow-800">{notice?.noticeGivenBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-yellow-700 font-semibold">Notice Date</p>
                    <p className="text-sm text-yellow-800">{formatDate(notice?.noticeDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-yellow-700 font-semibold">Vacate By</p>
                    <p className="text-sm font-bold text-red-700">{formatDate(notice?.vacateByDate)}</p>
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-3">Reason: {notice?.reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Card with Image Carousel */}
            <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl overflow-hidden hover:shadow-2xl transition">
              {property?.images?.[0]?.url && (
                <div className="relative">
                  <img 
                    src={property.images[0].url} 
                    alt={property?.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {property?.images?.map((img, idx) => (
                      <button
                        key={idx}
                        className={`w-2 h-2 rounded-full transition ${idx === 0 ? 'bg-white' : 'bg-white/50'}`}
                        onClick={() => setSelectedImage(idx)}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{property?.title}</h2>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">{property?.location?.address}</p>
                        <p className="text-xs text-gray-500">
                          {property?.location?.locality}, {property?.location?.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Room</p>
                      <p className="text-3xl font-bold text-purple-600">#{roomId?.roomNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/50">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Type</p>
                    <p className="font-bold text-gray-800 flex items-center justify-center space-x-1">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span>{roomId?.roomType}</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Bed</p>
                    <p className="font-bold text-gray-800">{tenancyData?.bedNumber}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">State</p>
                    <p className="font-bold text-gray-800 text-sm">{property?.location?.state}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <DollarSign className="w-6 h-6 text-green-500" />
                <span>Financial Summary</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/40 rounded-xl border border-white/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Rent</p>
                      <p className="font-bold text-gray-800">Due on {financials?.rentDueDay}th</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{financials?.monthlyRent?.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/40 rounded-xl border border-white/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Hammer className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Maintenance Charge</p>
                      <p className="font-bold text-gray-800">Monthly</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">₹{financials?.maintenanceCharges?.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/40 rounded-xl border border-white/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Security Deposit</p>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <p className="font-bold text-gray-800 text-sm">Paid</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">₹{financials?.securityDeposit?.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/40 rounded-xl border border-white/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-red-100">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Late Fee</p>
                      <p className="font-bold text-gray-800 text-sm">Grace: {financials?.gracePeriodDays} days</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-red-600">₹{financials?.lateFeePerDay}/day</p>
                </div>
              </div>

              {/* Total Summary */}
              <div className="mt-6 pt-6 border-t border-white/50">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-800">Total Monthly Outgoing</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ₹{getTotalMonthlyOutgoing().toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Agreement & Dates */}
            <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <FileText className="w-6 h-6 text-orange-500" />
                <span>Agreement Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-blue-100/50 rounded-xl p-6 border border-blue-200/50">
                  <p className="text-sm text-gray-600 mb-2">Duration</p>
                  <p className="text-3xl font-bold text-blue-600 mb-3">{agreement?.durationMonths} months</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <p className="text-sm text-gray-700">From: {formatDate(agreement?.startDate)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <p className="text-sm text-gray-700">Till: {formatDate(agreement?.endDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-sm bg-gradient-to-br from-purple-50/50 to-purple-100/50 rounded-xl p-6 border border-purple-200/50">
                  <p className="text-sm text-gray-600 mb-2">Renewal</p>
                  <p className="text-3xl font-bold text-purple-600 mb-3">{agreement?.renewalOption ? '✓ Yes' : '✗ No'}</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <p className="text-sm text-gray-700">Auto Renew: {agreement?.autoRenew ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <p className="text-sm text-gray-700">Status: {agreement?.signedByLandlord && agreement?.signedByTenant ? 'Signed' : 'Pending'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Move In/Out Checklist */}
            <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Camera className="w-6 h-6 text-indigo-500" />
                <span>Property Condition Report</span>
              </h3>

              <div className="space-y-8">
                {/* Move In */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/50">
                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Move-In ({formatDate(occupancy?.moveInDate)})</h4>
                    <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full font-semibold">Good Condition</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {occupancy?.moveInChecklist?.map((item, idx) => (
                      <div key={idx} className="backdrop-blur-sm bg-white/40 rounded-xl p-4 border border-white/60">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-800">{item.item}</p>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${getConditionColor(item.condition)}`}>
                            {item.condition}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 italic">"{item.notes}"</p>
                        {item.photo && (
                          <button className="text-xs text-blue-600 mt-2 hover:underline flex items-center space-x-1">
                            <Camera className="w-3 h-3" />
                            <span>View Photo</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Move Out */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/50">
                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Move-Out ({formatDate(occupancy?.moveOutDate)})</h4>
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-semibold">Minor Issue</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {occupancy?.moveOutChecklist?.map((item, idx) => (
                      <div key={idx} className={`backdrop-blur-sm rounded-xl p-4 border ${
                        item.condition === 'Poor' 
                          ? 'bg-red-50/40 border-red-200/50' 
                          : 'bg-white/40 border-white/60'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-800">{item.item}</p>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${getConditionColor(item.condition)}`}>
                            {item.condition}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 italic">"{item.notes}"</p>
                        {item.condition === 'Poor' && (
                          <div className="mt-2 p-2 bg-red-100 rounded-lg flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700 font-semibold">Requires attention before vacating</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Landlord Card */}
            <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <User className="w-5 h-5 text-orange-500" />
                <span>Landlord</span>
              </h3>
              
              <div className="space-y-3">
                <div className="backdrop-blur-sm bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-xl p-4 border border-orange-200/50">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Name</p>
                  <p className="font-bold text-gray-800">{landlord?.name}</p>
                </div>

                <div className="backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-xl p-4 border border-blue-200/50">
                  <div className="flex items-center space-x-2 mb-1">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <p className="text-xs text-gray-600 font-semibold">Contact</p>
                  </div>
                  <a href={`tel:${landlord?.phone}`} className="font-bold text-blue-600 hover:text-blue-700">
                    {landlord?.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Tenant Information */}
            <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Badge className="w-5 h-5 text-purple-500" />
                <span>Tenant Info</span>
              </h3>
              
              <div className="space-y-3">
                <div className="backdrop-blur-sm bg-gradient-to-br from-pink-50/50 to-rose-50/50 rounded-xl p-4 border border-pink-200/50">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Emergency Contact</p>
                  <p className="font-bold text-gray-800">{tenantInfo?.emergencyContact?.name}</p>
                  <p className="text-xs text-gray-600 mt-1">({tenantInfo?.emergencyContact?.relation})</p>
                  <a href={`tel:${tenantInfo?.emergencyContact?.phone}`} className="text-xs text-blue-600 hover:underline mt-1 block">
                    📞 {tenantInfo?.emergencyContact?.phone}
                  </a>
                </div>

                <div className="backdrop-blur-sm bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4 border border-green-200/50">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">ID Proof</p>
                  <p className="font-bold text-gray-800">{tenantInfo?.idProof?.type}</p>
                  <p className="text-xs text-gray-600 mt-1">●●●●●●●890</p>
                </div>

                <div className="backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-4 border border-blue-200/50">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Employment</p>
                  <p className="font-bold text-gray-800">{tenantInfo?.employmentDetails?.designation}</p>
                  <p className="text-xs text-gray-600 mt-1">{tenantInfo?.employmentDetails?.companyName}</p>
                </div>

                <div className="backdrop-blur-sm bg-gradient-to-br from-green-50/50 to-teal-50/50 rounded-xl p-4 border border-green-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-semibold">Police Verification</p>
                      <p className="font-bold text-green-700">✓ Verified</p>
                    </div>
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{formatDate(tenantInfo?.policeVerification?.verifiedOn)}</p>
                </div>
              </div>
            </div>

            {/* Ratings */}
            {ratings?.byTenant?.rating && (
              <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span>Your Rating</span>
                </h3>
                
                <div className="backdrop-blur-sm bg-gradient-to-br from-yellow-50/50 to-orange-50/50 rounded-xl p-6 border border-yellow-200/50">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < ratings.byTenant.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 italic">"{ratings.byTenant.review}"</p>
                  <p className="text-xs text-gray-600 mt-3">Rated on {formatDate(ratings.byTenant.givenAt)}</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Agreement</span>
                </button>
                <button className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-800 font-semibold hover:bg-white/50 transition">
                  Contact Landlord
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Questions about your tenancy? Reach out to your landlord or GharZo support.
          </p>
          <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition">
            Contact Support
          </button>
        </div>
      </main>
    </div>
  );
};

export default TenancyDashboard;