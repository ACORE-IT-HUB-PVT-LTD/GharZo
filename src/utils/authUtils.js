/**
 * Utility functions for role-based auth verification
 */

const API_BASE = "https://api.gharzoreality.com";

/**
 * Verify user role from API profile
 * @param {string} token - Authorization token
 * @returns {Promise<{role: string, success: boolean}>} - User role or null
 */
export const verifyUserRoleFromAPI = async (token) => {
  if (!token) {
    return { role: null, success: false };
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch user profile:", response.status);
      return { role: null, success: false };
    }

    const data = await response.json();

    if (data.success && data.data?.user?.role) {
      return { role: data.data.user.role, success: true };
    }

    return { role: null, success: false };
  } catch (error) {
    console.error("Error verifying user role:", error);
    return { role: null, success: false };
  }
};

/**
 * Check if user is a tenant
 * @param {string} token - Authorization token
 * @returns {Promise<boolean>}
 */
export const isTenant = async (token) => {
  const { role } = await verifyUserRoleFromAPI(token);
  return role === "tenant";
};

/**
 * Check if user is a landlord
 * @param {string} token - Authorization token
 * @returns {Promise<boolean>}
 */
export const isLandlord = async (token) => {
  const { role } = await verifyUserRoleFromAPI(token);
  return role === "landlord";
};

/**
 * Check if user is a sub_owner
 * @param {string} token - Authorization token
 * @returns {Promise<boolean>}
 */
export const isSubOwner = async (token) => {
  const { role } = await verifyUserRoleFromAPI(token);
  return role === "sub_owner";
};
