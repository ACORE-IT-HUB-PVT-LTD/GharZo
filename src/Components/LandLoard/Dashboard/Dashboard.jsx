import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaRupeeSign,
  FaPlusCircle,
  FaBell,
  FaChartBar,
  FaWrench,
  FaVideo,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaTag,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [allComplaints, setAllComplaints] = useState(0);
  const [occupancy, setOccupancy] = useState({ totalRooms: 0, occupied: 0 });
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalSubAdmins, setTotalSubAdmins] = useState(0);
  const [totalPlans, setTotalPlans] = useState(0);
  const [totalDues, setTotalDues] = useState(0);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [properties, setProperties] = useState([]);
  const [plans, setPlans] = useState([]);
  const [landlordId, setLandlordId] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [propertyMixData, setPropertyMixData] = useState([
    { name: "PG", value: 14 },
    { name: "Flats", value: 9 },
    { name: "Hostel", value: 20 },
  ]);
  const [occupancyTrendData, setOccupancyTrendData] = useState([
    { month: "Feb", occupied: 62 },
    { month: "Mar", occupied: 65 },
    { month: "Apr", occupied: 69 },
    { month: "May", occupied: 72 },
    { month: "Jun", occupied: 76 },
    { month: "Jul", occupied: 74 },
  ]);

  // Redirect if no token
  if (!token) {
    return <Navigate to="/landlord_login" />;
  }

  // Sidebar hover effect
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);

      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  // Load fallback data
  const loadFallbackData = useCallback(() => {
    const storedProperties = JSON.parse(localStorage.getItem("properties")) || [];
    const storedTenants = JSON.parse(localStorage.getItem("tenants")) || [];
    setTotalProperties(storedProperties.length);
    setTotalTenants(storedTenants.length);
    setProperties(storedProperties);
    setOccupancy({ totalRooms: 50, occupied: 38 });
    setTotalVisits(0);
    setAllComplaints(0);
    setTotalCollected(0);
    setTotalSubAdmins(0);
    setTotalPlans(0);
    setTotalDues(0);
    setPlans([]);
    setLoading(false);
  }, []);

  // Fetch or refresh token
  const fetchToken = useCallback(async () => {
    try {
      const response = await axios.post(`${baseurl}api/auth/login`, {
        username: "your-username",
        password: "your-password",
      });
      const newToken = response.data.token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      return newToken;
    } catch (err) {
      setError("Failed to authenticate. Please log in again.");
      return null;
    }
  }, []);

  // Axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          const newToken = await fetchToken();
          if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axios(error.config);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, fetchToken]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch profile for landlordId if needed
      let currentLandlordId = landlordId;
      if (!currentLandlordId) {
        const profileRes = await axios.get(`${baseurl}api/landlord/profile`).catch(() => ({ data: { landlord: { _id: null } } }));
        currentLandlordId = profileRes.data.landlord?._id;
        setLandlordId(currentLandlordId);
      }

      let duesTotal = 0;
      if (currentLandlordId) {
        const duesRes = await axios.get(`${baseurl}api/dues/getdue/${currentLandlordId}`).catch(() => ({ data: { tenants: [] } }));
        duesTotal = duesRes.data.tenants.reduce((sum, tenant) => sum + (tenant.totalAmount || 0), 0);
      }
      setTotalDues(duesTotal);

      // Fetch all other data concurrently
      const [
        propertiesRes,
        tenantsRes,
        visitsRes,
        complaintsRes,
        collectionsRes,
        subAdminsRes,
        bedsPlansRes,
        reelsPlansRes,
      ] = await Promise.all([
        axios.get(`${baseurl}api/landlord/properties`).catch(() => ({ data: { properties: [], count: 0 } })),
        axios.get(`${baseurl}api/landlord/tenant/count`).catch(() => ({ data: { count: 0 } })),
        axios.get(`${baseurl}api/visits/landlord`).catch(() => ({ data: { totalVisits: 0 } })),
        axios.get(`${baseurl}api/landlord/analytics/complaints`).catch(() => ({ data: { totalComplaints: 0 } })),
        axios.get(`${baseurl}api/landlord/analytics/collections`).catch(() => ({ data: { totalCollected: 0 } })),
        axios.get(`${baseurl}api/sub-owner/auth/sub-owners`).catch(() => ({ data: { subOwners: [] } })),
        axios.get(`${baseurl}api/landlord/subscriptions/plans`).catch(() => ({ data: { data: [] } })),
        axios.get(`${baseurl}api/reel/reel-subscription-plans/active`).catch(() => ({ data: { data: [] } })),
      ]);

      // Process properties
      const fetchedProperties = propertiesRes.data?.properties || propertiesRes.data || [];
      setProperties(fetchedProperties);
      setTotalProperties(propertiesRes.data?.count || fetchedProperties.length);

      // Process tenants
      setTotalTenants(tenantsRes.data?.count || 0);

      // Process visits
      setTotalVisits(visitsRes.data?.totalVisits || 0);

      // Process complaints
      setAllComplaints(complaintsRes.data?.totalComplaints || 0);

      // Process collections
      setTotalCollected(collectionsRes.data?.totalCollected || 0);

      // Process sub-admins
      const subOwners = subAdminsRes.data?.subOwners || [];
      setTotalSubAdmins(Array.isArray(subOwners) ? subOwners.length : 0);

      // Process plans (beds + reels)
      const bedsPlans = bedsPlansRes.data?.data || [];
      const reelsPlans = reelsPlansRes.data?.data || [];
      const combinedPlans = [...bedsPlans, ...reelsPlans];
      setPlans(combinedPlans);
      setTotalPlans(bedsPlans.length + reelsPlans.length);

      // Calculate occupancy
      const totalRooms = fetchedProperties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);
      const occupied = tenantsRes.data?.count || 0;
      setOccupancy({ totalRooms, occupied });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data. Using fallback data.");
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  }, [landlordId, loadFallbackData]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      fetchToken().then((newToken) => {
        if (newToken) fetchDashboardData();
        else loadFallbackData();
      });
    }
  }, [token, fetchToken, fetchDashboardData, loadFallbackData]);

  // Update graph data
  useEffect(() => {
    const totalRooms = properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);
    const occupied = totalTenants;
    const occupancyRate = totalRooms > 0 ? ((occupied / totalRooms) * 100).toFixed(1) : 0;

    // Update occupancy trend
    const updatedOccupancyTrend = occupancyTrendData.map((data) => ({
      ...data,
      occupied: parseFloat(occupancyRate),
    }));
    setOccupancyTrendData(updatedOccupancyTrend);

    // Update property mix
    const typeCounts = properties.reduce((acc, p) => {
      const type = p.type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const updatedPropertyMix = Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
    }));
    setPropertyMixData(
      updatedPropertyMix.length > 0
        ? updatedPropertyMix
        : [
            { name: "PG", value: 14 },
            { name: "Flats", value: 9 },
            { name: "Hostel", value: 20 },
          ]
    );
  }, [properties, totalTenants]);

  const recentActivities = [
    "Added PG in Noida",
    "Received ₹8,000 from Ramesh",
    "Tenant Aman vacated property in Pune",
  ];
  const upcomingRent = [
    { name: "Ramesh Kumar", property: "PG in Noida", due: "28 Jul", amount: 8000 },
    { name: "Sita Devi", property: "Flat in Delhi", due: "01 Aug", amount: 12000 },
  ];
  const notifications = [
    "Tenant Amit’s rent is overdue",
    "2 properties have lease expiry this week",
    "Missing KYC for 3 tenants",
  ];
  const maintenanceRequests = [
    { tenant: "Vivek", issue: "Fan not working", room: "202", status: "Pending" },
    { tenant: "Pooja", issue: "Leaking Tap", room: "105", status: "In Progress" },
  ];
  const leaseExpiries = [
    { tenant: "Aman", property: "Flat-102", daysLeft: 12 },
    { tenant: "Sneha", property: "PG-Room 7", daysLeft: 25 },
  ];

  const occupancyRate = occupancy.totalRooms
    ? ((occupancy.occupied / occupancy.totalRooms) * 100).toFixed(1)
    : 0;

  const icon3DStyle = "drop-shadow-lg transform scale-110 hover:scale-125 transition-transform duration-300";
  const monthlyRentData = [
    { month: "Feb", collected: 52000, pending: 8000 },
    { month: "Mar", collected: 61000, pending: 6000 },
    { month: "Apr", collected: 58000, pending: 9000 },
    { month: "May", collected: 64000, pending: 5000 },
    { month: "Jun", collected: 70000, pending: 4000 },
    { month: "Jul", collected: 68000, pending: 7000 },
  ];
  const PIE_COLORS = ["#60A5FA", "#34D399", "#F59E0B"];

  return (
    <div
      className={`px-10 lg:px-20 py-2 mx-auto w-full min-h-screen text-black transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-6 text-center">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-center text-gray-500">Loading dashboard data...</div>
      )}
      <motion.h2
        className="text-3xl font-extrabold text-center mb-10 "
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Landlord Dashboard
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10 min-w-fit">
        {[
          {
            icon: FaCalendarCheck,
            title: "Total Visits",
            value: totalVisits,
            link: "/landlord/visit-requests",
            bg: "bg-gradient-to-r from-purple-500 to-indigo-400",
          },
          {
            icon: FaBuilding,
            title: "Total Properties",
            value: totalProperties,
            link: "/landlord/property",
            bg: "bg-gradient-to-r from-blue-500 to-cyan-400",
          },
          {
            icon: FaUsers,
            title: "Total Tenants",
            value: totalTenants,
            link: "/landlord/tenant-list",
            bg: "bg-gradient-to-r from-green-400 to-emerald-500",
          },
          {
            icon: FaRupeeSign,
            title: "Collections",
            value: totalCollected,
            link: "/landlord/collections",
            bg: "bg-gradient-to-r from-cyan-400 to-green-500",
          },
          {
            icon: FaUsers,
            title: "Total SubAdmins",
            value: totalSubAdmins,
            link: "/landlord/landlord_subadmin",
            bg: "bg-gradient-to-r from-cyan-400 to-green-500",
          },
          {
            icon: FaCalendarCheck,
            title: "Total Complaints",
            value: allComplaints,
            link: "/landlord/allComplaints",
            bg: "bg-gradient-to-r from-purple-500 to-indigo-400",
          },
          {
            icon: FaTag,
            title: "Subscription Plans",
            value: totalPlans,
            link: "/landlord/subscription-plans",
            bg: "bg-gradient-to-r from-pink-500 to-rose-500",
          },
          {
            icon: FaRupeeSign,
            title: "Total Dues",
            value: totalDues,
            link: "/landlord/dues",
            bg: "bg-gradient-to-r from-orange-500 to-red-500",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          const card = (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`${stat.bg} rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-all text-white flex-shrink-0 flex-grow-0`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`text-4xl ${icon3DStyle}`} />
                <h5 className="text-lg font-semibold">{stat.title}</h5>
              </div>
              <h3 className="text-3xl font-bold text-center">{stat.value}</h3>
            </motion.div>
          );
          return stat.link ? (
            <Link key={i} to={stat.link}>
              {card}
            </Link>
          ) : (
            <div key={i}>{card}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        <motion.div
          className="bg-darkblue-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h5 className="font-semibold mb-4 flex items-center gap-2">
            <FaChartBar className={icon3DStyle} /> Occupancy Trend (Last 6 Months)
          </h5>
          <div className="w-full" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyTrendData} margin={{ right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="occupied"
                  stroke="#60A5FA"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Occupied %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="bg-darkblue-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h5 className="font-semibold mb-4 flex items-center gap-2">
            <FaChartBar className={icon3DStyle} /> Monthly Rent (Collected vs Pending)
          </h5>
          <div className="w-full" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRentData} margin={{ right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                <Legend />
                <Bar dataKey="collected" name="Collected" fill="#34D399" />
                <Bar dataKey="pending" name="Pending" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="bg-darkblue-800 rounded-xl shadow-lg p-6 mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h5 className="font-semibold mb-4 flex items-center gap-2">
          <FaChartBar className={icon3DStyle} /> Property Mix
        </h5>
        <div className="w-full" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={propertyMixData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                label
              >
                {propertyMixData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* <Link
          to="/landlord/add-property"
          className="flex items-center justify-center gap-2 border border-blue-500 text-green-500 font-medium py-3 rounded text-sm transition-all hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-green-400 hover:text-white"
        >
          <FaPlusCircle className={icon3DStyle} /> Add New Property
        </Link> */}
      </div>
    </div>
  );
};

export default Dashboard;