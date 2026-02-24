import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  FileText,
  Home,
  Hash,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";

const Payment = () => {
  const { tenantId } = useParams();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    partial: 0,
    paid: 0,
    overdue: 0,
    totalPending: 0
  });
  const [error, setError] = useState(null);
  const [expandedPayment, setExpandedPayment] = useState(null);

  const token = localStorage.getItem("usertoken");

  const fetchPayments = async () => {
    if (!token) {
      setError("Authentication token not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("https://api.gharzoreality.com/api/rent-payments/tenant/my-payments", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await res.json();

      if (data.success) {
        setPayments(data.data || []);
        setStats(data.stats || {
          total: 0,
          pending: 0,
          partial: 0,
          paid: 0,
          overdue: 0,
          totalPending: 0
        });
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "Partial":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Overdue":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg">
                  <CreditCard size={28} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Payment</h1>
                  <p className="text-gray-500 text-sm mt-1">View and manage your rent payments</p>
                </div>
              </div>
              <button
                onClick={fetchPayments}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Payment Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Total Bills</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-blue-100">
                <FileText className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-amber-100">
                <Clock className="text-amber-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Partial</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.partial}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-yellow-100">
                <DollarSign className="text-yellow-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Paid</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-green-100">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Amount Due</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(stats.totalPending)}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-red-100">
                <AlertCircle className="text-red-600" size={20} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Payment History</h2>
              <span className="text-sm text-gray-500">{payments.length} bills</span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment, index) => {
                  const isExpanded = expandedPayment === payment._id;
                  const monthNames = ["January", "February", "March", "April", "May", "June", 
                                    "July", "August", "September", "October", "November", "December"];
                  const monthName = payment.billingPeriod?.month 
                    ? monthNames[payment.billingPeriod.month - 1] 
                    : "";

                  return (
                    <motion.div
                      key={payment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div 
                        className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => setExpandedPayment(isExpanded ? null : payment._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              payment.status === "Paid" ? "bg-green-100" :
                              payment.status === "Partial" ? "bg-yellow-100" :
                              "bg-amber-100"
                            }`}>
                              {payment.status === "Paid" ? (
                                <CheckCircle className="text-green-600" size={20} />
                              ) : payment.status === "Partial" ? (
                                <DollarSign className="text-yellow-600" size={20} />
                              ) : (
                                <Clock className="text-amber-600" size={20} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800">
                                  {monthName} {payment.billingPeriod?.year}
                                </h3>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                                  {payment.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Hash size={12} />
                                {payment.paymentNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-800">{formatCurrency(payment.amounts?.totalAmount)}</p>
                              <p className="text-xs text-gray-500">Due: {formatDate(payment.dates?.dueDate)}</p>
                            </div>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="border-t border-gray-200 p-4 bg-white"
                        >
                          {/* Property Info */}
                          <div className="mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-start gap-2 mb-2">
                              <Home size={16} className="text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {payment.propertyId?.title || "Property"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {payment.propertyId?.location?.address}, {payment.propertyId?.location?.city}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Room: {payment.roomId?.roomNumber || "-"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Bill Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Rent Details</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Monthly Rent</span>
                                  <span className="font-medium">{formatCurrency(payment.amounts?.monthlyRent)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Maintenance</span>
                                  <span className="font-medium">{formatCurrency(payment.amounts?.maintenanceCharges)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Water Charges</span>
                                  <span className="font-medium">{formatCurrency(payment.amounts?.waterCharges)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Electricity</span>
                                  <span className="font-medium">{formatCurrency(payment.amounts?.electricityCharges)}</span>
                                </div>
                                {payment.amounts?.otherCharges > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Other ({payment.amounts?.otherChargesDescription})</span>
                                    <span className="font-medium">{formatCurrency(payment.amounts?.otherCharges)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Summary</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subtotal</span>
                                  <span className="font-medium">{formatCurrency(payment.amounts?.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Discount</span>
                                  <span className="font-medium text-green-600">-{formatCurrency(payment.amounts?.discount)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Previous Balance</span>
                                  <span className="font-medium">{formatCurrency(payment.amounts?.previousBalance)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Late Fee</span>
                                  <span className="font-medium">{formatCurrency(payment.amounts?.lateFee)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                                  <span>Total</span>
                                  <span className="text-gray-800">{formatCurrency(payment.amounts?.finalAmount)}</span>
                                </div>
                                {payment.payment?.amountPaid > 0 && (
                                  <>
                                    <div className="flex justify-between text-green-600">
                                      <span>Amount Paid</span>
                                      <span>-{formatCurrency(payment.payment?.amountPaid)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-red-600">
                                      <span>Balance</span>
                                      <span>{formatCurrency((payment.amounts?.finalAmount || 0) - (payment.payment?.amountPaid || 0))}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Due Date Info */}
                          <div className="bg-amber-50 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-amber-600" />
                              <span className="text-sm text-amber-700">Due Date: {formatDate(payment.dates?.dueDate)}</span>
                            </div>
                            {payment.dates?.gracePeriodEndDate && (
                              <span className="text-xs text-amber-600">
                                Grace Period: {formatDate(payment.dates?.gracePeriodEndDate)}
                              </span>
                            )}
                          </div>

                          {/* Pay Button */}
                          {payment.status !== "Paid" && (
                            <button className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg">
                              Pay Now {formatCurrency((payment.amounts?.finalAmount || 0) - (payment.payment?.amountPaid || 0))}
                            </button>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No payment history available yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;
