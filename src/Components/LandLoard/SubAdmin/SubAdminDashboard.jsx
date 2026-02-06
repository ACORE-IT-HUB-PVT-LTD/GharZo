import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Key,
  Power,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Building2,
  Shield,
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

const API_BASE_URL = 'https://api.gharzoreality.com/api';

// Axios instance with auth token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('usertoken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // clear auth and redirect to login
      localStorage.removeItem('usertoken');
      localStorage.removeItem('token');
      window.location.href = '/landlord_login';
    }
    return Promise.reject(err);
  }
);

const SubOwnerManagement = () => {
  // State Management
  const [subOwners, setSubOwners] = useState([]);
  const [properties, setProperties] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'permissions'
  const [selectedSubOwner, setSelectedSubOwner] = useState(null);
  const [editingSubOwner, setEditingSubOwner] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    notes: '',
    hasFullPropertyAccess: false,
    assignedProperties: [],
    permissions: [],
  });

  // Permission Modal State
  const [permissionModalData, setPermissionModalData] = useState({
    selectedPermissions: [],
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchSubOwners();
    fetchProperties();
    fetchPermissions();
  }, [currentPage, statusFilter]);

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // API Calls
  const fetchSubOwners = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/subowners/my-subowners?status=${statusFilter}&page=${currentPage}&limit=10`
      );
      // Support different response shapes
      const resData = response.data?.data || response.data?.subOwners || [];
      setSubOwners(resData);
      setTotalPages(response.data?.pages || response.data?.totalPages || 1);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch sub-owners');
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await api.get('/v2/properties/my-properties');
      setProperties(response.data.data);
    } catch (err) {
      console.error('Failed to fetch properties', err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data.data);
    } catch (err) {
      console.error('Failed to fetch permissions', err);
    }
  };

  const createSubOwner = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/subowners/create', formData);
      setSuccess('Sub-owner created successfully!');
      setShowModal(false);
      resetForm();
      fetchSubOwners();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sub-owner');
      setLoading(false);
    }
  };

  const updateSubOwner = async (id) => {
    try {
      setLoading(true);
      await api.put(`/subowners/${id}`, formData);
      setSuccess('Sub-owner updated successfully!');
      setShowModal(false);
      resetForm();
      fetchSubOwners();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update sub-owner');
      setLoading(false);
    }
  };

  const deleteSubOwner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sub-owner?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/subowners/${id}`);
      setSuccess('Sub-owner deleted successfully!');
      fetchSubOwners();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete sub-owner');
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      setLoading(true);
      await api.patch(`/subowners/${id}/toggle-status`);
      setSuccess('Status updated successfully!');
      fetchSubOwners();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status');
      setLoading(false);
    }
  };

  const updatePermissions = async (id, permissionIds) => {
    try {
      setLoading(true);
      await api.put(`/subowners/${id}/permissions`, {
        permissions: permissionIds,
      });
      setSuccess('Permissions updated successfully!');
      setShowModal(false);
      fetchSubOwners();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update permissions');
      setLoading(false);
    }
  };

  // Helper Functions
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      notes: '',
      hasFullPropertyAccess: false,
      assignedProperties: [],
      permissions: [],
    });
    setEditingSubOwner(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const openEditModal = (subOwner) => {
    setEditingSubOwner(subOwner);
    setFormData({
      name: subOwner.name,
      email: subOwner.email,
      phone: subOwner.phone,
      password: '',
      notes: subOwner.notes || '',
      hasFullPropertyAccess: subOwner.hasFullPropertyAccess,
      assignedProperties: subOwner.assignedProperties.map((p) => p._id),
      permissions: subOwner.permissions.map((p) => p._id),
    });
    setModalType('edit');
    setShowModal(true);
  };

  const openPermissionsModal = (subOwner) => {
    setSelectedSubOwner(subOwner);
    setPermissionModalData({
      selectedPermissions: subOwner.permissions.map((p) => p._id),
    });
    setModalType('permissions');
    setShowModal(true);
  };

  const handlePermissionToggle = (permissionId) => {
    setPermissionModalData((prev) => {
      const isSelected = prev.selectedPermissions.includes(permissionId);
      return {
        selectedPermissions: isSelected
          ? prev.selectedPermissions.filter((id) => id !== permissionId)
          : [...prev.selectedPermissions, permissionId],
      };
    });
  };

  const handlePropertyToggle = (propertyId) => {
    setFormData((prev) => {
      const isSelected = prev.assignedProperties.includes(propertyId);
      return {
        ...prev,
        assignedProperties: isSelected
          ? prev.assignedProperties.filter((id) => id !== propertyId)
          : [...prev.assignedProperties, propertyId],
      };
    });
  };

  const handleFormPermissionToggle = (permissionId) => {
    setFormData((prev) => {
      const isSelected = prev.permissions.includes(permissionId);
      return {
        ...prev,
        permissions: isSelected
          ? prev.permissions.filter((id) => id !== permissionId)
          : [...prev.permissions, permissionId],
      };
    });
  };

  const groupPermissionsByCategory = () => {
    const grouped = {};
    permissions.forEach((perm) => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    });
    return grouped;
  };

  const filteredSubOwners = subOwners.filter(subOwner =>
    subOwner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subOwner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subOwner.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 lg:ml-10">
      {/* Alerts */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Sub-Owner Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your property sub-owners and their permissions
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Sub-Owner
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sub-Owners</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{subOwners.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {subOwners.filter((s) => s.status === 'Active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Full Access</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {subOwners.filter((s) => s.hasFullPropertyAccess).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sub-Owners Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading sub-owners...</p>
          </div>
        ) : filteredSubOwners.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
            <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sub-Owners Found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first sub-owner</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Sub-Owner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {filteredSubOwners.map((subOwner) => (
              <div
                key={subOwner._id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-orange-50 via-blue-50 to-purple-50 p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {subOwner.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{subOwner.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-600">{subOwner.email}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-600">{subOwner.phone}</p>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        subOwner.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : subOwner.status === 'Inactive'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {subOwner.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Access Level */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Access Level</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          subOwner.hasFullPropertyAccess
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {subOwner.hasFullPropertyAccess ? 'Full Access' : 'Limited Access'}
                      </span>
                    </div>

                    {/* Properties */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Properties</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {subOwner.hasFullPropertyAccess
                          ? 'All Properties'
                          : `${subOwner.assignedProperties.length} Properties`}
                      </span>
                    </div>

                    {/* Permissions */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Permissions</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {subOwner.permissions.length} permissions
                      </span>
                    </div>

                    {/* Notes */}
                    {subOwner.notes && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Notes:</p>
                        <p className="text-sm text-gray-700">{subOwner.notes}</p>
                      </div>
                    )}

                    {/* Permission Preview */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {subOwner.permissions.slice(0, 3).map((perm) => (
                          <span
                            key={perm._id}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg"
                          >
                            {perm.name}
                          </span>
                        ))}
                        {subOwner.permissions.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                            +{subOwner.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Assigned Properties Preview */}
                    {!subOwner.hasFullPropertyAccess && subOwner.assignedProperties.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">Assigned Properties:</p>
                        <div className="space-y-2">
                          {subOwner.assignedProperties.slice(0, 2).map((property) => (
                            <div
                              key={property._id}
                              className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl"
                            >
                              {property.images && property.images.length > 0 && (
                                <img
                                  src={property.images[0].url}
                                  alt={property.title}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {property.title}
                                </p>
                                {property.location && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {property.location.city}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                          {subOwner.assignedProperties.length > 2 && (
                            <p className="text-xs text-blue-600 font-medium">
                              +{subOwner.assignedProperties.length - 2} more properties
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-wrap gap-2">
                  <button
                    onClick={() => openPermissionsModal(subOwner)}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    <Key className="w-4 h-4" />
                    Permissions
                  </button>
                  <button
                    onClick={() => openEditModal(subOwner)}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(subOwner._id)}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 text-white font-medium rounded-xl hover:bg-yellow-600 transition-colors shadow-sm"
                  >
                    <Power className="w-4 h-4" />
                    Toggle
                  </button>
                  <button
                    onClick={() => deleteSubOwner(subOwner._id)}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <span className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 shadow-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowModal(false)}
            />
            
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-orange-600 to-blue-500 text-white px-6 py-5 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold">
                  {modalType === 'create'
                    ? 'Create New Sub-Owner'
                    : modalType === 'edit'
                    ? 'Edit Sub-Owner'
                    : `Manage Permissions - ${selectedSubOwner?.name}`}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                {modalType === 'permissions' ? (
                  <PermissionsModal
                    permissions={permissions}
                    selectedPermissions={permissionModalData.selectedPermissions}
                    onToggle={handlePermissionToggle}
                    groupPermissionsByCategory={groupPermissionsByCategory}
                  />
                ) : (
                  <SubOwnerForm
                    formData={formData}
                    setFormData={setFormData}
                    properties={properties}
                    permissions={permissions}
                    modalType={modalType}
                    handlePropertyToggle={handlePropertyToggle}
                    handleFormPermissionToggle={handleFormPermissionToggle}
                    groupPermissionsByCategory={groupPermissionsByCategory}
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    modalType === 'permissions'
                      ? () => updatePermissions(selectedSubOwner._id, permissionModalData.selectedPermissions)
                      : modalType === 'create'
                      ? createSubOwner
                      : (e) => {
                          e.preventDefault();
                          updateSubOwner(editingSubOwner._id);
                        }
                  }
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all inline-flex items-center gap-2 shadow-lg"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modalType === 'permissions'
                    ? 'Update Permissions'
                    : modalType === 'create'
                    ? 'Create Sub-Owner'
                    : 'Update Sub-Owner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Permissions Modal Component
const PermissionsModal = ({ permissions, selectedPermissions, onToggle, groupPermissionsByCategory }) => {
  const groupedPermissions = groupPermissionsByCategory();

  return (
    <div className="p-6 space-y-6">
      {Object.entries(groupedPermissions).map(([category, perms]) => (
        <div key={category} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-5 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {perms.map((perm) => (
              <label
                key={perm._id}
                className="flex items-start gap-3 p-4 bg-white border-2 rounded-xl cursor-pointer hover:border-orange-400 transition-all hover:shadow-md"
                style={{
                  borderColor: selectedPermissions.includes(perm._id) ? '#f97316' : '#e5e7eb',
                  backgroundColor: selectedPermissions.includes(perm._id) ? '#fff7ed' : '#ffffff',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(perm._id)}
                  onChange={() => onToggle(perm._id)}
                  className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{perm.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{perm.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Sub-Owner Form Component
const SubOwnerForm = ({
  formData,
  setFormData,
  properties,
  permissions,
  modalType,
  handlePropertyToggle,
  handleFormPermissionToggle,
  groupPermissionsByCategory,
}) => {
  const groupedPermissions = groupPermissionsByCategory();

  return (
    <div className="p-6 space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-600" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="10-digit phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Property Access */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-orange-600" />
          Property Access
        </h3>
        <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-blue-50 border-2 border-orange-300 rounded-xl cursor-pointer hover:border-orange-500 transition-all">
          <input
            type="checkbox"
            checked={formData.hasFullPropertyAccess}
            onChange={(e) =>
              setFormData({ ...formData, hasFullPropertyAccess: e.target.checked })
            }
            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <div>
            <p className="font-semibold text-gray-900">Grant Full Property Access</p>
            <p className="text-sm text-gray-600">This sub-owner can access all properties</p>
          </div>
        </label>

        {!formData.hasFullPropertyAccess && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Select Properties:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {properties.map((property) => (
                <label
                  key={property._id}
                  className="flex items-center gap-3 p-3 bg-white border-2 rounded-xl cursor-pointer hover:border-orange-400 transition-all hover:shadow-md"
                  style={{
                    borderColor: formData.assignedProperties.includes(property._id)
                      ? '#f97316'
                      : '#e5e7eb',
                    backgroundColor: formData.assignedProperties.includes(property._id)
                      ? '#fff7ed'
                      : '#ffffff',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.assignedProperties.includes(property._id)}
                    onChange={() => handlePropertyToggle(property._id)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  {property.images && property.images.length > 0 && (
                    <img
                      src={property.images[0].url}
                      alt={property.title}
                      className="w-12 h-12 object-cover rounded-xl"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {property.title || 'Untitled Property'}
                    </p>
                    <p className="text-xs text-gray-600">{property.location?.city || 'N/A'}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Permissions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-orange-600" />
          Permissions
        </h3>
        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <div key={category} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-5 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                {category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {perms.map((perm) => (
                  <label
                    key={perm._id}
                    className="flex items-start gap-3 p-4 bg-white border-2 rounded-xl cursor-pointer hover:border-orange-400 transition-all hover:shadow-md"
                    style={{
                      borderColor: formData.permissions.includes(perm._id) ? '#f97316' : '#e5e7eb',
                      backgroundColor: formData.permissions.includes(perm._id)
                        ? '#fff7ed'
                        : '#ffffff',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm._id)}
                      onChange={() => handleFormPermissionToggle(perm._id)}
                      className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{perm.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{perm.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubOwnerManagement;