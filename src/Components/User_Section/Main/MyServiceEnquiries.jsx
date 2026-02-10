import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Check, X, Phone, MessageCircle, Calendar, MapPin } from 'lucide-react';

const ENQUIRY_API_URL = 'https://api.gharzoreality.com/api/service-enquiries';

const StatusBadge = ({ status }) => {
  const statusColors = {
    'New': 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    'Contacted': 'bg-purple-100 text-purple-700',
    'Completed': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Closed': 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status || 'New'}
    </span>
  );
};

const EnquiryCard = ({ enquiry }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/service/${enquiry.serviceId?._id}`)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">
            {enquiry.serviceId?.serviceName || 'Service'}
          </h3>
          <p className="text-sm text-gray-500">
            {enquiry.serviceId?.category}
          </p>
        </div>
        <div className="text-right">
          <StatusBadge status={enquiry.status} />
          {enquiry.enquiryNumber && (
            <p className="text-xs text-gray-500 mt-1">{enquiry.enquiryNumber}</p>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {enquiry.message}
      </p>

      {/* Provider Info */}
      {enquiry.serviceId?.provider && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="font-medium text-gray-800 text-sm">
            {enquiry.serviceId.provider.companyName}
          </p>
          <p className="text-xs text-gray-500">
            {enquiry.serviceId.provider.contactPerson}
          </p>
          {enquiry.serviceProvider?.phone && (
            <a href={`tel:${enquiry.serviceProvider.phone}`} className="text-blue-600 text-xs flex items-center gap-1 mt-1">
              <Phone size={12} /> {enquiry.serviceProvider.phone}
            </a>
          )}
        </div>
      )}

      {/* Location */}
      {enquiry.location && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin size={14} />
          <span>
            {[enquiry.location.locality, enquiry.location.city].filter(Boolean).join(', ')}
          </span>
        </div>
      )}

      {/* Contact Preference */}
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-gray-500">
          Preferred: <span className="font-medium text-gray-700">{enquiry.preferredContactMethod}</span>
        </span>
        <span className="text-gray-500">
          Time: <span className="font-medium text-gray-700">{enquiry.preferredTimeSlot}</span>
        </span>
      </div>

      {/* Timeline */}
      {enquiry.timeline && enquiry.timeline.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(enquiry.updatedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

const MyServiceEnquiries = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ENQUIRY_API_URL}/my-enquiries`);
      const data = await response.json();
      
      if (data.success) {
        setEnquiries(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch enquiries');
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = enquiries.length;
    const newCount = enquiries.filter(e => e.status === 'New').length;
    const inProgress = enquiries.filter(e => e.status === 'In Progress').length;
    const completed = enquiries.filter(e => e.status === 'Completed' || e.status === 'Closed').length;
    
    return { total, newCount, inProgress, completed };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">My Service Enquiries</h1>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Enquiries</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm p-4">
            <p className="text-sm text-blue-600">New</p>
            <p className="text-2xl font-bold text-blue-600">{stats.newCount}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm p-4">
            <p className="text-sm text-yellow-600">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-4">
            <p className="text-sm text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-red-600 font-bold text-lg mb-2">Error Loading Enquiries</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchEnquiries}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && enquiries.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-gray-600 font-bold text-lg mb-2">No Enquiries Yet</h3>
              <p className="text-gray-500 mb-4">You haven't submitted any service enquiries yet.</p>
              <button
                onClick={() => navigate('/services')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Services
              </button>
            </div>
          </div>
        )}

        {/* Enquiries List */}
        {!loading && !error && enquiries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enquiries.map((enquiry) => (
              <EnquiryCard key={enquiry._id} enquiry={enquiry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServiceEnquiries;
