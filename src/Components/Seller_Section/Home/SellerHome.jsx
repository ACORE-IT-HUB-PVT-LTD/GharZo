import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaHome,
  FaList,
  FaUserTie,
  FaLightbulb,
  FaPlayCircle,
  FaBuilding,
  FaUsers,
  FaCalendarCheck,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaEdit,
  FaExclamationTriangle,
  FaCreditCard,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const SellerHome = () => {
  const navigate = useNavigate();
  const [seller, setSeller] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalEnquiries: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("sellertoken");
      if (!token) {
        toast.error("Please log in to view dashboard.");
        navigate("/seller_login");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch profile
        const profileRes = await axios.get(`${baseurl}api/seller/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.data.success) {
          const { seller: profile } = profileRes.data;
          setSeller({
            name: profile.name || "N/A",
            email: profile.email || "N/A",
            phone: profile.mobile || "N/A",
          });
        }

        // Fetch properties using the same API as SellerProperty
        const propertiesRes = await axios.get(`${baseurl}api/seller/getproperties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const totalProperties = propertiesRes.data?.properties?.length || 0;

        // Fetch enquiries (visits)
        const enquiriesRes = await axios.get(`${baseurl}api/seller/getallvisits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const totalEnquiries = enquiriesRes.data?.visits?.length || 0;

        setStats({
          totalProperties,
          totalEnquiries,
        });

        // Generate recent activities based on fetched data
        setRecentActivities([
          { id: 1, text: `Listed ${totalProperties > 0 ? `${totalProperties} property${totalProperties !== 1 ? 'ies' : ''}` : 'no properties'}`, date: new Date().toLocaleDateString() },
          { id: 2, text: `Received ${totalEnquiries} enquiry${totalEnquiries !== 1 ? 's' : ''}`, date: new Date().toLocaleDateString() },
        ]);

      } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("sellertoken");
          localStorage.removeItem("role");
          navigate("/seller_login");
        } else {
          setError(error.response?.data?.message || "Error loading dashboard data.");
          toast.error("Failed to load dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2FF] mb-4"></div>
          <p className="text-[#00C2FF] text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <FaExclamationTriangle className="mx-auto text-6xl text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-white px-8 py-3 rounded-lg hover:from-[#00AEEA] hover:to-[#00E099] transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-10 lg:px-16 bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
      {/* Header */}
      <header className="flex flex-col items-center justify-center mb-8 gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] rounded-xl">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <div className="text-center">
  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#00C2FF] via-[#00FFAA] to-[#00E099] bg-clip-text text-transparent">
    Seller Dashboard
  </h1>
  <p className="text-sm font-bold text-[#00C2FF]">Welcome back, {seller.name.split(' ')[0]}!</p>
</div>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <FaList className="text-[#00C2FF]" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            
            {
              title: "Reels",
              desc: "Create short videos",
              icon: FaPlayCircle,
              color: "from-[#00FFAA] to-[#00E099]",
              link: "/seller/reels",
            },
            {
              title: "Manage Enquiries",
              desc: "View and respond to visits",
              icon: FaCalendarCheck,
              color: "from-[#00E099] to-[#00C2FF]",
              link: "/seller/enquiries",
            },
            {
              title: "All Properties",
              desc: "View your listings",
              icon: FaHome,
                color: "from-[#00E099] to-[#00C2FF]",
              link: "/seller/property",
            },
            {
              title: "Subscription Plans",
              desc: "View and manage your plans",
              icon: FaCreditCard,
              color: "from-[#00E099] to-[#00FFAA]",
              link: "/seller/subscription",
            },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#00C2FF] text-center hover:bg-gradient-to-br hover:from-gray-50"
              >
                <div className={`p-4 rounded-lg bg-gradient-to-r ${action.color} mx-auto mb-4 w-fit group-hover:scale-110 transition-all duration-300`}>
                  <Icon className="text-2xl text-white" />
                </div>
                <h4 className="text-base font-semibold text-gray-800 mb-2 group-hover:text-[#00C2FF] transition-colors">{action.title}</h4>
                <p className="text-sm text-gray-500">{action.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Activity & Profile Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaUsers className="text-[#00C2FF]" />
            Recent Status
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-cyan-50 rounded-xl border-l-4 border-[#00C2FF]">
                  <div className="p-2 bg-[#00C2FF] rounded-full">
                    <FaCheckCircle className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500">No recent activity to show.</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaUserTie className="text-[#00FFAA]" />
            Profile Summary
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-xl border border-[#00C2FF]">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-[#00C2FF] rounded-full"></span>
                <strong className="text-gray-700">Name</strong>
              </div>
              <span className="text-gray-600 font-medium">{seller.name}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#00C2FF]50 to-[#00FFAA]50 rounded-xl border border-[#00C2FF]">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-[#00C2FF]" />
                <strong className="text-gray-700">Email</strong>
              </div>
              <span className="text-gray-600 font-medium">{seller.email}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <FaPhone className="text-[#00FFAA]" />
                <strong className="text-gray-700">Phone</strong>
              </div>
              <span className="text-gray-600 font-medium">{seller.phone}</span>
            </div>
          </div>
        
        </div>
      </section>

      {/* Quick Tips */}
      <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FaLightbulb className="text-[#00C2FF]" />
          Quick Tips for Better Listings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ul className="space-y-4">
            <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <FaCheckCircle className="text-[#00C2FF] mt-1 flex-shrink-0 text-xl" />
              <div>
                <p className="font-medium text-gray-700">Use High-Quality Images</p>
                <p className="text-sm text-gray-600">Capture clear photos from multiple angles to attract more tenants.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#00C2FF]50 to-[#00FFAA]50 rounded-xl border border-[#00C2FF]">
              <FaCheckCircle className="text-[#00C2FF] mt-1 flex-shrink-0 text-xl" />
              <div>
                <p className="font-medium text-gray-700">Add Clear Rental Terms</p>
                <p className="text-sm text-gray-600">Specify rent, deposit, and notice period to avoid confusion.</p>
              </div>
            </li>
          </ul>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <FaCheckCircle className="text-[#00C2FF] mt-1 flex-shrink-0 text-xl" />
              <div>
                <p className="font-medium text-gray-700">Highlight Unique Features</p>
                <p className="text-sm text-gray-600">Mention nearby landmarks and special amenities.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#00FFAA]50 to-[#00E099]50 rounded-xl border border-[#00FFAA]">
              <FaCheckCircle className="text-[#00C2FF] mt-1 flex-shrink-0 text-xl" />
              <div>
                <p className="font-medium text-gray-700">Update Details Regularly</p>
                <p className="text-sm text-gray-600">Keep your listings fresh to stay competitive.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default SellerHome;