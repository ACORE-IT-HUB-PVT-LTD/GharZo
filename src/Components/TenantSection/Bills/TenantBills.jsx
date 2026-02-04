// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { FaRupeeSign } from "react-icons/fa";
// import axios from "axios";

// export default function TenantDues() {
//   const [dues, setDues] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch token dynamically from localStorage
//   const token = localStorage.getItem("tenantToken"); // adjust key as per your app

//   useEffect(() => {
//     const fetchDues = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(
//           "https://api.gharzoreality.com/api/tenant/${id}dues",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         // Map unpaidBills from API response
//         if (response.data.success && response.data.unpaidBills) {
//           setDues(
//             response.data.unpaidBills.map((bill, index) => ({
//               id: index + 1,
//               title: bill.title || "Bill",
//               amount: bill.amount || 0,
//               dueDate: bill.dueDate || "N/A",
//               status: bill.status || "Pending",
//             }))
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching dues:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDues();
//   }, [token]);

//   const handlePayNow = (id) => {
//     setDues((prev) =>
//       prev.map((d) => (d.id === id ? { ...d, status: "Paid" } : d))
//     );
//     alert("Payment Successful for Due ID: " + id);
//   };

//   if (loading) {
//     return <div className="text-center mt-10">Loading dues...</div>;
//   }

//   if (dues.length === 0) {
//     return <div className="text-center mt-10">No pending dues!</div>;
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       <h2 className="text-2xl font-bold text-gray-800">Your Pending Dues</h2>
//       <div className="space-y-4">
//         {dues.map((due) => (
//           <motion.div
//             key={due.id}
//             className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex justify-between items-center"
//             whileHover={{ scale: 1.02 }}
//           >
//             <div className="space-y-1">
//               <h3 className="text-lg font-semibold text-gray-900">{due.title}</h3>
//               <p className="text-sm text-gray-500">Due Date: {due.dueDate}</p>
//               <p className="flex items-center text-gray-700 font-medium">
//                 <FaRupeeSign className="mr-1 text-gray-500" /> {due.amount}
//               </p>
//               <span
//                 className={`inline-block px-2 py-1 mt-1 text-xs font-medium rounded-full ${
//                   due.status === "Pending"
//                     ? "bg-red-100 text-red-700"
//                     : "bg-green-100 text-green-700"
//                 }`}
//               >
//                 {due.status}
//               </span>
//             </div>

//             {due.status === "Pending" && (
//               <button
//                 onClick={() => handlePayNow(due.id)}
//                 className="px-4 py-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white rounded-xl shadow hover:opacity-90"
//               >
//                 Pay Now
//               </button>
//             )}
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }













import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaRupeeSign } from "react-icons/fa";
// import axios from "axios"; // ✅ Commented out

export default function TenantDues() {
  // ✅ Dummy data initialized directly
  const [dues, setDues] = useState([
    {
      id: 1,
      title: "October Rent",
      amount: 15000,
      dueDate: "2024-10-05",
      status: "Pending",
    },
    {
      id: 2,
      title: "Electricity Bill",
      amount: 2500,
      dueDate: "2024-10-10",
      status: "Pending",
    },
    {
      id: 3,
      title: "Water Bill",
      amount: 800,
      dueDate: "2024-10-12",
      status: "Pending",
    },
    {
      id: 4,
      title: "Maintenance Charges",
      amount: 1200,
      dueDate: "2024-10-08",
      status: "Pending",
    },
    {
      id: 5,
      title: "September Rent",
      amount: 15000,
      dueDate: "2024-09-05",
      status: "Paid",
    },
  ]);
  const [loading, setLoading] = useState(false); // ✅ Set to false to skip loading

  // Fetch token dynamically from localStorage
  // const token = localStorage.getItem("tenantToken"); // ✅ Commented out - not needed for dummy data

  useEffect(() => {
    // ✅ All API calls commented out
    /*
    const fetchDues = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://api.gharzoreality.com/api/tenant/${id}dues",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Map unpaidBills from API response
        if (response.data.success && response.data.unpaidBills) {
          setDues(
            response.data.unpaidBills.map((bill, index) => ({
              id: index + 1,
              title: bill.title || "Bill",
              amount: bill.amount || 0,
              dueDate: bill.dueDate || "N/A",
              status: bill.status || "Pending",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching dues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDues();
    */

    // ✅ Dummy data is already set in useState, so no need to fetch
    setLoading(false);
  }, []); // ✅ Removed token dependency

  const handlePayNow = (id) => {
    setDues((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Paid" } : d))
    );
    alert("Payment Successful for Due ID: " + id);
  };

  if (loading) {
    return <div className="text-center mt-10">Loading dues...</div>;
  }

  if (dues.length === 0) {
    return <div className="text-center mt-10">No pending dues!</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Your Pending Dues</h2>
      <div className="space-y-4">
        {dues.map((due) => (
          <motion.div
            key={due.id}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex justify-between items-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">{due.title}</h3>
              <p className="text-sm text-gray-500">Due Date: {due.dueDate}</p>
              <p className="flex items-center text-gray-700 font-medium">
                <FaRupeeSign className="mr-1 text-gray-500" /> {due.amount}
              </p>
              <span
                className={`inline-block px-2 py-1 mt-1 text-xs font-medium rounded-full ${
                  due.status === "Pending"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {due.status}
              </span>
            </div>

            {due.status === "Pending" && (
              <button
                onClick={() => handlePayNow(due.id)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white rounded-xl shadow hover:opacity-90"
              >
                Pay Now
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}