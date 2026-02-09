import React, { useState, useEffect } from 'react';
import { ChevronDown, Send, Trash2, Edit3, Pin, PinOff, Eye, FileText, Upload, X, Check, AlertCircle, Calendar, Users, Settings, Home } from 'lucide-react';

const AnnouncementManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [properties, setProperties] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'All Tenants',
    type: 'General',
    priority: 'Medium',
    isPinned: false,
    expiresAt: '',
    scheduledFor: '',
    visibleToLandlord: true
  });

  // Get token from localStorage
  const getToken = () => localStorage.getItem('usertoken') || '';

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Fetch Properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.gharzoreality.com/api/v2/properties/my-properties', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data.data || []);
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.gharzoreality.com/api/announcements/my-announcements', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      setAnnouncements(data.data || []);
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create/Update Announcement
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      showMessage('Title and message are required', 'error');
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('message', formData.message);
    formDataObj.append('targetAudience', formData.targetAudience);
    formDataObj.append('type', formData.type);
    formDataObj.append('priority', formData.priority);
    formDataObj.append('isPinned', formData.isPinned);
    formDataObj.append('visibleToLandlord', formData.visibleToLandlord);

    if (formData.targetAudience === 'Specific Properties' && selectedProperties.length > 0) {
      formDataObj.append('targetProperties', JSON.stringify(selectedProperties));
    }
    if (formData.targetAudience === 'Specific Tenants' && selectedTenants.length > 0) {
      formDataObj.append('targetTenants', JSON.stringify(selectedTenants));
    }
    if (formData.expiresAt) {
      formDataObj.append('expiresAt', new Date(formData.expiresAt).toISOString());
    }
    if (formData.scheduledFor) {
      formDataObj.append('scheduledFor', new Date(formData.scheduledFor).toISOString());
    }

    uploadedFiles.forEach((file) => {
      formDataObj.append('attachments', file);
    });

    try {
      setLoading(true);
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `https://api.gharzoreality.com/api/announcements/${editingId}`
        : 'https://api.gharzoreality.com/api/announcements/create';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formDataObj
      });

      if (!response.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} announcement`);

      showMessage(`Announcement ${editingId ? 'updated' : 'created'} successfully!`);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Announcement
  const handleDelete = async (announcementId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.gharzoreality.com/api/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete announcement');
      
      showMessage('Announcement deleted successfully!');
      setShowDeleteConfirm(null);
      fetchAnnouncements();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (announcementId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.gharzoreality.com/api/announcements/${announcementId}/toggle-pin`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to toggle pin');
      
      showMessage('Pin status updated!');
      fetchAnnouncements();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Edit Announcement
  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      targetAudience: announcement.targetAudience,
      type: announcement.type,
      priority: announcement.priority,
      isPinned: announcement.isPinned,
      expiresAt: announcement.expiresAt ? announcement.expiresAt.split('T')[0] : '',
      scheduledFor: announcement.scheduledFor ? announcement.scheduledFor.split('T')[0] : '',
      visibleToLandlord: announcement.visibleToLandlord
    });
    setEditingId(announcement._id);
    setActiveTab('create');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      targetAudience: 'All Tenants',
      type: 'General',
      priority: 'Medium',
      isPinned: false,
      expiresAt: '',
      scheduledFor: '',
      visibleToLandlord: true
    });
    setSelectedProperties([]);
    setSelectedTenants([]);
    setUploadedFiles([]);
    setEditingId(null);
  };

  // File Handling
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedFiles.length + files.length > 5) {
      showMessage('Maximum 5 files allowed', 'error');
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        showMessage(`File ${file.name} exceeds 10MB limit`, 'error');
        return;
      }
      setUploadedFiles(prev => [...prev, file]);
    });
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Type and Priority Options
  const typeOptions = ['General', 'Urgent', 'Maintenance', 'Payment Reminder', 'Event', 'Rule Change', 'Other'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const audienceOptions = ['All Tenants', 'Specific Properties', 'Specific Rooms', 'Specific Tenants'];

  useEffect(() => {
    fetchProperties();
    fetchAnnouncements();
  }, []);

  // Get Priority Color
  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-blue-100 text-blue-800 border-blue-300',
      'Medium': 'bg-amber-100 text-amber-800 border-amber-300',
      'High': 'bg-orange-100 text-orange-800 border-orange-300',
      'Critical': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[priority] || colors['Medium'];
  };

  // Get Type Color
  const getTypeColor = (type) => {
    const colors = {
      'General': 'bg-slate-100 text-slate-800',
      'Urgent': 'bg-red-100 text-red-800',
      'Maintenance': 'bg-indigo-100 text-indigo-800',
      'Payment Reminder': 'bg-green-100 text-green-800',
      'Event': 'bg-purple-100 text-purple-800',
      'Rule Change': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['General'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg border-b border-orange-500/20 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Announcements Hub
                </h1>
                <p className="text-xs text-slate-400">Landlord Management System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      {successMessage && (
        <div className="fixed top-24 right-4 z-50 flex items-center gap-3 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-3 backdrop-blur-lg animate-pulse">
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium text-green-300">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-24 right-4 z-50 flex items-center gap-3 bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 backdrop-blur-lg animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm font-medium text-red-300">{errorMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 backdrop-blur-sm w-fit">
          {[
            { id: 'create', label: 'Create Announcement', icon: Send },
            { id: 'view', label: 'View All', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'view') resetForm();
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Title <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Monthly Maintenance Notice"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white placeholder-slate-500 transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Message <span className="text-orange-400">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your announcement message here..."
                  rows="5"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white placeholder-slate-500 resize-none transition-all"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Target Audience <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => {
                      setFormData({ ...formData, targetAudience: e.target.value });
                      setSelectedProperties([]);
                      setSelectedTenants([]);
                    }}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white appearance-none cursor-pointer transition-all"
                  >
                    {audienceOptions.map((option) => (
                      <option key={option} value={option} className="bg-slate-900">
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Properties Selection */}
              {formData.targetAudience === 'Specific Properties' && (
                <div className="bg-slate-700/30 border border-orange-500/20 rounded-lg p-5">
                  <label className="block text-sm font-semibold text-slate-200 mb-3">
                    Select Properties
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {properties.map((property) => (
                      <label key={property._id} className="flex items-center gap-3 p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={selectedProperties.includes(property._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProperties([...selectedProperties, property._id]);
                            } else {
                              setSelectedProperties(selectedProperties.filter(id => id !== property._id));
                            }
                          }}
                          className="w-4 h-4 cursor-pointer accent-orange-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{property.title}</p>
                          <p className="text-xs text-slate-400 truncate">{property.location?.address}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Type and Priority - Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3">
                    Type <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white appearance-none cursor-pointer transition-all"
                    >
                      {typeOptions.map((option) => (
                        <option key={option} value={option} className="bg-slate-900">
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3">
                    Priority <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white appearance-none cursor-pointer transition-all"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option} value={option} className="bg-slate-900">
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Dates - Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Expires At
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule For
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white transition-all"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-10 h-6 transition-colors ${formData.isPinned ? 'bg-orange-500' : 'bg-slate-600'} rounded-full`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPinned ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-300">Pin this announcement</span>
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-10 h-6 transition-colors ${formData.visibleToLandlord ? 'bg-orange-500' : 'bg-slate-600'} rounded-full`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.visibleToLandlord ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-300">Visible to landlord</span>
                  <input
                    type="checkbox"
                    checked={formData.visibleToLandlord}
                    onChange={(e) => setFormData({ ...formData, visibleToLandlord: e.target.checked })}
                    className="hidden"
                  />
                </label>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Attachments (Max 5 files, 10MB each)
                </label>
                <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-6 text-center hover:border-orange-500/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-sm text-slate-300">Click to upload files</span>
                    </div>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg border border-orange-500/20">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Processing...' : editingId ? 'Update Announcement' : 'Publish Announcement'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setEditingId(null);
                    }}
                    className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-all border border-slate-600/50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* View Tab */}
        {activeTab === 'view' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
              All Announcements ({announcements.length})
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-orange-500 animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-300">Loading announcements...</p>
                </div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                <p className="text-slate-300 text-lg">No announcements yet</p>
                <p className="text-slate-400 text-sm">Create your first announcement to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white truncate">{announcement.title}</h3>
                          {announcement.isPinned && (
                            <Pin className="w-5 h-5 text-orange-400 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{announcement.message}</p>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${getTypeColor(announcement.type)}`}>
                            {announcement.type}
                          </span>
                          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority}
                          </span>
                          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                            announcement.status === 'Published' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            announcement.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          }`}>
                            {announcement.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-orange-400" />
                            {announcement.stats.totalRecipients} recipients
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-orange-400" />
                            {announcement.stats.totalReads} reads
                          </div>
                          {announcement.targetAudience !== 'All Tenants' && (
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4 text-orange-400" />
                              {announcement.targetAudience}
                            </div>
                          )}
                          <div className="text-slate-500">
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleTogglePin(announcement._id)}
                          className="p-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-orange-400 rounded-lg transition-all"
                          title={announcement.isPinned ? 'Unpin' : 'Pin'}
                        >
                          {announcement.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleEdit(announcement)}
                          className="p-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-blue-400 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setShowDeleteConfirm(announcement._id)}
                          className="p-3 bg-slate-700/50 hover:bg-red-600/20 text-slate-300 hover:text-red-400 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm === announcement._id && (
                      <div className="mt-4 pt-4 border-t border-slate-600/50 bg-red-500/10 rounded-lg p-4 flex items-center justify-between gap-4">
                        <p className="text-sm text-red-300">Are you sure? This action cannot be undone.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(announcement._id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnnouncementManagementSystem;