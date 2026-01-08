import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";

const AssignedTenantsOnly = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAssignedTenants = async () => {
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/tenant/assigned-tenants",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTenants(response.data?.tenants || []);
      } catch (error) {
        console.error("Error fetching assigned tenants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTenants();
  }, [token]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Assigned Tenants</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-gray-600" size={32} />
        </div>
      ) : tenants.length === 0 ? (
        <p className="text-gray-600 text-center">No assigned tenants found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
              <tr>
                <th className="px-4 py-3 border">Name</th>
                <th className="px-4 py-3 border">Email</th>
                <th className="px-4 py-3 border">Phone</th>
                <th className="px-4 py-3 border">Property</th>
                <th className="px-4 py-3 border">Room</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 text-gray-800 text-sm"
                >
                  <td className="px-4 py-3 border text-center">{tenant.name}</td>
                  <td className="px-4 py-3 border text-center">{tenant.email}</td>
                  <td className="px-4 py-3 border text-center">{tenant.phone}</td>
                  <td className="px-4 py-3 border text-center">
                    {tenant.propertyName || "—"}
                  </td>
                  <td className="px-4 py-3 border text-center">
                    {tenant.roomNumber || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignedTenantsOnly;
