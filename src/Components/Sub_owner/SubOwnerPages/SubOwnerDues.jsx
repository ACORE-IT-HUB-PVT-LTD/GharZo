import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl";

// Function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const DuePackages = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDuesSidebarOpen, setIsDuesSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryType, setCategoryType] = useState("variable");
  const [fixedAmount, setFixedAmount] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [dueAmount, setDueAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingSubOwnerId, setLoadingSubOwnerId] = useState(true);
  const [error, setError] = useState(null);
  const [dues, setDues] = useState([]);
  const [subOwnerId, setSubOwnerId] = useState(null);
  const [propertyId, setPropertyId] = useState(null);

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please log in.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return null;
    }
    return token;
  };

  const fetchSubOwnerId = async () => {
    setLoadingSubOwnerId(true);
    const token = getToken();
    if (!token) {
      setError("No token found. Please log in.");
      setLoadingSubOwnerId(false);
      return;
    }

    try {
      const response = await axios.get(
        `${baseurl}api/sub-owner/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const fetchedSubOwnerId = response.data.subOwner.id;
      const fetchedPropertyId = response.data.subOwner.assignedProperties?.[0]?.property.id;

      if (!fetchedSubOwnerId) {
        throw new Error("Sub-owner ID not found in profile.");
      }

      setSubOwnerId(fetchedSubOwnerId);
      localStorage.setItem("subOwnerId", fetchedSubOwnerId);

      if (fetchedPropertyId) {
        setPropertyId(fetchedPropertyId);
        localStorage.setItem("propertyId", fetchedPropertyId);
      }

      await fetchCategories(fetchedSubOwnerId);
      await fetchAllTenantsFromAllProperties();
    } catch (error) {
      const decoded = decodeToken(token);
      if (decoded && decoded.id) {
        setSubOwnerId(decoded.id);
        localStorage.setItem("subOwnerId", decoded.id);
        const storedPropertyId = localStorage.getItem("propertyId");
        if (storedPropertyId) {
          setPropertyId(storedPropertyId);
        }
        await fetchCategories(decoded.id);
        await fetchAllTenantsFromAllProperties();
        toast.warn("Failed to fetch profile, using token for sub-owner ID.");
      } else {
        setError("Failed to fetch sub-owner profile. Please log in.");
        toast.error(
          error.response?.data?.message || "Failed to fetch sub-owner profile."
        );
      }
    } finally {
      setLoadingSubOwnerId(false);
    }
  };

  const fetchCategories = async (subOwnerId) => {
    const token = getToken();
    if (!token || !subOwnerId) return;

    try {
      const response = await axios.get(`${baseurl}api/subowner/dues`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const categoryData = Array.isArray(response.data) ? response.data : [];
      const formattedCategories = categoryData.map((category) => ({
        _id: category._id,
        name: category.name,
        type: category.type,
        amount: category.type === "fixed" ? category.amount : "Variable Amount",
        status: category.status,
      }));
      setCategories(formattedCategories);
      if (categoryData.length === 0) {
        toast.info("No categories found.");
      }
    } catch (error) {
      setError("Failed to load categories.");
      toast.error(error.response?.data?.message || "Failed to fetch categories.");
    }
  };

  const fetchAllTenantsFromAllProperties = async () => {
    setLoadingTenants(true);
    const token = getToken();
    if (!token) {
      setLoadingTenants(false);
      return;
    }

    try {
      const propertiesResponse = await axios.get(
        `${baseurl}api/sub-owner/properties`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const properties = propertiesResponse.data.properties || [];
      if (properties.length === 0) {
        toast.warn("No properties assigned to this sub-owner.");
        setTenants([]);
        setLoadingTenants(false);
        return;
      }

      const propertyIds = properties.map((prop) => prop.id);

      const tenantPromises = propertyIds.map((propId) =>
        axios.get(
          `${baseurl}api/sub-owner/properties/${propId}/tenants`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
      );

      const tenantResponses = await Promise.all(tenantPromises);

      let allTenants = [];
      tenantResponses.forEach((res) => {
        const data = res.data.tenants || res.data.data || res.data || [];
        if (Array.isArray(data)) {
          allTenants = [...allTenants, ...data];
        }
      });

      const uniqueTenants = Array.from(
        new Map(
          allTenants.map((t) => [
            t.tenantId || t.id,
            { ...t, id: t.tenantId || t.id },
          ])
        ).values()
      );

      setTenants(uniqueTenants);

      if (uniqueTenants.length === 0) {
        toast.warn("No tenants found in any property.");
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast.error("Failed to load tenants from properties.");
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName) {
      toast.error("Please enter a due type name.");
      return;
    }
    if (categoryType === "fixed" && (!fixedAmount || fixedAmount <= 0)) {
      toast.error("Please enter a valid fixed amount.");
      return;
    }
    if (!subOwnerId) {
      toast.error("Sub-owner ID is missing. Please log in.");
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      if (selectedCategory) {
        await axios.put(
          `${baseurl}api/subowner/dues/${selectedCategory._id}`,
          {
            name: categoryName,
            type: categoryType,
            ...(categoryType === "fixed" && { amount: parseFloat(fixedAmount) }),
            subOwnerId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Category updated successfully!");
      } else {
        await axios.post(
          `${baseurl}api/subowner/dues/create`,
          {
            subOwnerId,
            name: categoryName,
            type: categoryType,
            ...(categoryType === "fixed" && { amount: parseFloat(fixedAmount) }),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Category created successfully!");
      }
      await fetchCategories(subOwnerId);
      setIsSidebarOpen(false);
      setCategoryName("");
      setCategoryType("variable");
      setFixedAmount("");
      setSelectedCategory(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${selectedCategory ? "update" : "create"} category.`
      );
    }
  };

  const handleToggle = async (categoryId) => {
    const token = getToken();
    if (!token) return;

    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return;

    const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await axios.put(
        `${baseurl}api/subowner/dues/${categoryId}`,
        { status: newStatus, subOwnerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Category status updated!");
      await fetchCategories(subOwnerId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDelete = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return;
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    const token = getToken();
    if (!token) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      await axios.delete(
        `${baseurl}api/subowner/dues/${categoryToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { subOwnerId },
        }
      );
      toast.success("Category deleted successfully!");
      await fetchCategories(subOwnerId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category.");
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleDuesSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTenant) {
      toast.error("Please select a tenant.");
      return;
    }
    if (!selectedCategory) {
      toast.error("No category selected.");
      return;
    }
    if (!subOwnerId) {
      toast.error("Sub-owner ID is missing. Please log in.");
      return;
    }

    const token = getToken();
    if (!token) return;

    const amount = parseFloat(dueAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }
    if (!dueDate) {
      toast.error("Please select a valid due date.");
      return;
    }

    try {
      const response = await axios.post(
        `${baseurl}api/subowner/dues/assign`,
        {
          tenantId: selectedTenant,
          dueId: selectedCategory._id,
          amount,
          dueDate,
          subOwnerId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const tenant = tenants.find((t) => (t.tenantId || t.id) === selectedTenant);

      const newDue = {
        _id: response.data._id,
        category: selectedCategory.name,
        tenantId: selectedTenant,
        tenantName: tenant?.name || selectedTenant,
        amount,
        dueDate,
        status: response.data.status || "PENDING",
      };

      const updatedDues = [...dues, newDue];
      setDues(updatedDues);
      localStorage.setItem("addedDues", JSON.stringify(updatedDues));
      toast.success("Dues assigned successfully!");
      setIsDuesSidebarOpen(false);
      setSelectedTenant("");
      setDueAmount("");
      setDueDate("");
    } catch (error) {
      console.error("Error assigning dues:", error.response || error);
      toast.error(error.response?.data?.message || "Failed to assign dues.");
    }
  };

  useEffect(() => {
    const savedDues = localStorage.getItem("addedDues");
    if (savedDues) {
      setDues(JSON.parse(savedDues));
    }
    fetchSubOwnerId();
  }, []);

  const handleAddCategoryClick = () => {
    setIsSidebarOpen(true);
    setCategoryName("");
    setCategoryType("variable");
    setFixedAmount("");
    setSelectedCategory(null);
  };

  const handleEdit = (category) => {
    setIsSidebarOpen(true);
    setCategoryName(category.name);
    setCategoryType(category.type);
    setFixedAmount(category.type === "fixed" ? category.amount : "");
    setSelectedCategory(category);
  };

  const handleTypeChange = (type) => {
    setCategoryType(type);
    if (type === "variable") setFixedAmount("");
  };

  const handleAddDues = (category) => {
    setSelectedCategory(category);
    setDueAmount(category.type === "fixed" ? category.amount : "");
    setDueDate(new Date().toISOString().split("T")[0]);

    if (tenants.length > 0) {
      const firstTenantId = tenants[0].tenantId || tenants[0].id;
      setSelectedTenant(firstTenantId);
    } else {
      setSelectedTenant("");
    }

    setIsDuesSidebarOpen(true);
  };

  const handleCloseDuesSidebar = () => {
    setIsDuesSidebarOpen(false);
    setSelectedTenant("");
    setDueAmount("");
    setDueDate("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#002856] mb-4">
            Dues Management
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Manage and assign recurring dues for your tenants efficiently
          </p>
        </div>

        {/* Stats + Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
        <div className="bg-gradient-to-r from-[#002856] to-[#003366] text-white 
     px-3 py-2 rounded-xl shadow-md text-base sm:text-lg font-semibold text-center">
  Active Categories: {categories.length}
</div>

          <button
            onClick={handleAddCategoryClick}
            disabled={loadingSubOwnerId}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Add New Category
          </button>
        </div>

        {/* Loading */}
        {loadingSubOwnerId && (
          <div className="flex flex-col items-center py-20">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-xl text-[#002856] font-medium">Loading dues dashboard...</p>
          </div>
        )}

        {/* Error */}
        {error && !loadingSubOwnerId && (
          <div className="text-center py-16 text-2xl font-semibold text-red-600 bg-red-50 rounded-3xl p-8 shadow-lg">
            {error}
          </div>
        )}

        {/* Categories Grid - Fully Responsive */}
        {!loadingSubOwnerId && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {categories.map((category) => (
              <div
                key={category._id}
                className="w-full max-w-sm mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#002856] to-orange-500"></div>
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#002856] to-[#003b73] rounded-2xl flex items-center justify-center shadow-xl">
                      <svg className="w-8 h-8 sm:w-9 sm:h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                      category.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {category.status}
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-[#002856] mb-3">{category.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 capitalize">{category.type} Billing</p>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-5 mb-6 shadow-inner">
                    <p className="text-sm font-semibold text-gray-700">Amount</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                      {category.type === "fixed" ? `₹${category.amount}` : "Variable"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <span className="text-base sm:text-lg font-semibold text-[#002856]">Active Status</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={category.status === "ACTIVE"}
                        onChange={() => handleToggle(category._id)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 sm:w-16 sm:h-9 bg-gray-300 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-6 sm:peer-checked:after:translate-x-7"></div>
                    </label>
                  </div>

                  <button
                    onClick={() => handleAddDues(category)}
                    disabled={tenants.length === 0}
                    className="w-full mb-4 py-4 bg-gradient-to-r from-[#002856] to-[#003b73] text-white font-bold rounded-2xl shadow-xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-60 text-base"
                  >
                    Assign to Tenant
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleEdit(category)}
                      className="py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-[#002856] font-bold rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md text-base"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="py-3 bg-gradient-to-r from-red-100 to-red-200 text-red-700 font-bold rounded-xl hover:from-red-200 hover:to-red-300 transition-all shadow-md text-base"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Dues Table - Responsive */}
        {dues.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-[#002856] to-orange-600 px-6 sm:px-10 py-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Recently Assigned Dues
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-orange-50">
                  <tr>
                    {["S.No.", "Category", "Tenant", "Amount", "Due Date", "Status"].map((header) => (
                      <th key={header} className="px-4 sm:px-10 py-5 text-left text-base sm:text-lg font-bold text-[#002856] uppercase tracking-wide">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dues.map((due, index) => (
                    <tr key={due._id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-4 sm:px-10 py-6 text-gray-600 font-medium">{index + 1}</td>
                      <td className="px-4 sm:px-10 py-6 font-bold text-[#002856]">{due.category}</td>
                      <td className="px-4 sm:px-10 py-6 text-gray-700">{due.tenantName}</td>
                      <td className="px-4 sm:px-10 py-6 text-2xl sm:text-3xl font-extrabold text-orange-600">₹{due.amount}</td>
                      <td className="px-4 sm:px-10 py-6 text-gray-700">
                        {new Date(due.dueDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 sm:px-10 py-6">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                          due.status === "PENDING"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {due.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Category Modal - Responsive */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div
              className="w-full max-w-2xl bg-white rounded-3xl shadow-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#002856] to-orange-600 p-6 text-white">
                <h2 className="text-2xl sm:text-3xl font-extrabold">
                  {selectedCategory ? "Edit Category" : "Create New Category"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                <div>
                  <label className="text-lg font-bold text-[#002856]">Category Name *</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="mt-3 w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all text-base"
                    placeholder="e.g. Maintenance Charge"
                  />
                </div>

                <div>
                  <label className="text-lg font-bold text-[#002856]">Billing Type *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    {["variable", "fixed"].map((type) => (
                      <label
                        key={type}
                        className={`p-6 rounded-2xl border-4 cursor-pointer transition-all shadow-md ${
                          categoryType === type
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-300 bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={categoryType === type}
                          onChange={() => handleTypeChange(type)}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <p className="text-2xl font-extrabold text-[#002856] capitalize">{type}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            {type === "fixed"
                              ? "Same fixed amount for all tenants"
                              : "Custom amount per tenant"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {categoryType === "fixed" && (
                  <div>
                    <label className="text-lg font-bold text-[#002856]">Fixed Amount (₹) *</label>
                    <input
                      type="number"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(e.target.value)}
                      className="mt-3 w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#002856] focus:ring-4 focus:ring-blue-200 transition-all text-base"
                      placeholder="Enter fixed amount"
                      min="1"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex-1 py-4 bg-gray-200 text-[#002856] rounded-xl font-bold text-lg hover:bg-gray-300 transition-all shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-500/50 transition-all"
                  >
                    {selectedCategory ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Dues Modal - Responsive */}
        {isDuesSidebarOpen && selectedCategory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={handleCloseDuesSidebar}>
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#002856] to-orange-600 p-8 text-white">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-center">Assign: {selectedCategory.name}</h2>
              </div>
              <form onSubmit={handleDuesSubmit} className="p-6 sm:p-10 space-y-8">
                <div>
                  <label className="text-lg sm:text-xl font-bold text-[#002856]">Select Tenant *</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    disabled={loadingTenants || tenants.length === 0}
                    className="mt-4 w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all text-base"
                  >
                    <option value="">-- Select Tenant --</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.tenantId || tenant.id} value={tenant.tenantId || tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-lg sm:text-xl font-bold text-[#002856]">Amount (₹) *</label>
                  <input
                    type="number"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    disabled={selectedCategory.type === "fixed"}
                    className="mt-4 w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#002856] focus:ring-4 focus:ring-blue-200 transition-all text-base"
                    placeholder={selectedCategory.type === "fixed" ? `Fixed: ₹${selectedCategory.amount}` : "Enter custom amount"}
                  />
                </div>

                <div>
                  <label className="text-lg sm:text-xl font-bold text-[#002856]">Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-4 w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button type="button" onClick={handleCloseDuesSidebar} className="flex-1 py-4 bg-gray-200 text-[#002856] rounded-2xl font-bold text-lg hover:bg-gray-300 transition-all shadow-md">
                    Cancel
                  </button>
                  <button type="submit" disabled={!selectedTenant} className="flex-1 py-4 bg-gradient-to-r from-[#002856] to-orange-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-orange-500/50 transition-all disabled:opacity-60">
                    Assign Due
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal - Responsive */}
        {isDeleteModalOpen && categoryToDelete && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setIsDeleteModalOpen(false)}>
            <div className="bg-white rounded-3xl shadow-3xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center shadow-xl">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" />
                  </svg>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#002856] mt-6">Confirm Delete</h3>
                <p className="text-base sm:text-lg text-gray-600 mt-4">
                  Permanently delete <span className="font-bold text-red-600">"{categoryToDelete.name}"</span>?
                  This cannot be undone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-gray-200 text-[#002856] rounded-2xl font-bold text-lg hover:bg-gray-300 shadow-md">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-red-500/50">
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuePackages;